import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MinioService } from './minio/minio.service';
import * as archiver from 'archiver';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { Response } from 'express';
import {
  GetFilePath,
  UpdateFilePath,
} from '../../common/functions/files-utils';
import { writeFileSync } from 'fs';
import * as AdmZip from 'adm-zip';
import { FileDtoSingle, FileDtoMultiple } from '../../common/dto/files.dto';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { AuthorizedProject } from '../authorized-project/authorized-project.entity';
import { ProjectService } from '../project/project.service';
import { AuthorizedProjectService } from '../authorized-project/authorized-project.service';

//swagger: add to "file" tag
@ApiTags('file')
@Controller('file')
export class FileController {
  constructor(
    private readonly minioService: MinioService,
    private readonly userService: UserService,
    private readonly projectService: ProjectService,
    private readonly authorizedProjectService: AuthorizedProjectService,
  ) {}

  @Post('upload/project')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProject(
    @UploadedFile() file: Express.MulterFile,
    @Body('email') email: string,
    @Body('project_name') projectName: string,
    @Body('description') description: string,
    @Body('language') language: string,
  ) {
    if (!projectName || !description || !language || !email) {
      throw new BadRequestException('All fields are required');
    }
    console.log('uploadProject', projectName, description, language, email);

    // Find user by email
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Upload the file to MinIO
    const path = `${projectName}/0`;
    const bucketName = `user-${user.id.toString()}`;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const minioResult = await this.minioService.uploadFile(
      bucketName,
      path,
      file,
    );
    // console.log('Minio result:', minioResult);

    // Create project
    const repositoryURL = '';
    const project = await this.projectService.createProject(
      projectName,
      description,
      language,
      repositoryURL,
    );
    // console.log(project);

    // Create authorized project
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const authorizedProject =
      await this.authorizedProjectService.createAuthorizedProject(
        user,
        project,
      );
    console.log(authorizedProject);

    return { message: 'Project uploaded successfully!' };
  }

  // Upload single file
  @Post('upload/single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleFile(
    @UploadedFile() file: Express.MulterFile,
    @Body(new ValidationPipe()) body: FileDtoSingle,
  ) {
    try {
      const { user_name, result_type, project_id, version, fileName } = body;

      await this.minioService.checkAndCreateBucket(user_name);

      //construct folder structure
      const location = GetFilePath(result_type, project_id, version);

      //user_name as bucket
      await this.minioService.uploadFile(user_name, location, file, fileName);
    } catch (error) {
      console.error('Error during file upload:', error.message);
      throw new HttpException(
        'File upload failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { message: 'File uploaded successfully!' };
  }

  //downalod single file
  @Get('download/single')
  async downloadSingleFile(
    @Body(new ValidationPipe()) body: FileDtoSingle,
    @Res() res: any,
  ) {
    //await this.minioService.downloadFile(bucket, key);
    try {
      const { user_name, result_type, project_id, version, fileName } = body;
      const location = GetFilePath(result_type, project_id, version);

      const stream = await this.minioService.downloadFile(
        user_name,
        location,
        fileName,
      );
      //(filePath);

      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${location}"`,
      });
      stream.pipe(res);
    } catch (error) {
      console.error('Error during file download:', error.message);
      throw new HttpException(
        'File download failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //upload multiple file
  @Post('upload/multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultipleFile(
    @UploadedFiles() files: Array<Express.MulterFile>,
    @Body(new ValidationPipe()) body: FileDtoMultiple,
  ) {
    try {
      const { user_name, result_type, project_id, version, zip } = body;
      let { zippedFileName } = body;

      await this.minioService.checkAndCreateBucket(user_name);
      const location = GetFilePath(result_type, project_id, version);

      if (zip == undefined || zip != '1') {
        for (const file of files) {
          await this.minioService.uploadFile(user_name, location, file);
        }
      } else {
        if (zippedFileName == undefined || zippedFileName == '') {
          zippedFileName = user_name + '.zip';
        }

        const zipFileBuffer = await this.zipFiles(files); //, `${Date.now()}-files.zip`);
        const zipFile = {
          fieldname: 'file',
          originalname: 'files.zip',
          encoding: '7bit',
          mimetype: 'application/zip',
          buffer: zipFileBuffer,
          size: zipFileBuffer.length,
        } as Express.MulterFile;

        await this.minioService.uploadFile(
          user_name,
          location,
          zipFile,
          zippedFileName,
        );

        // Test unzipping locally
        /*try {
          await this.testUnzip(zipFileBuffer, zippedFileName);
        } catch (error) {
          console.error('Unzipping failed:', error);
        }*/
      }
    } catch (error) {
      console.error('Error during file upload:', error.message);
      throw new HttpException(
        'File upload failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { message: 'File uploaded successfully!' };
  }

  //zip file, and return buffer
  async zipFiles(files: Array<Express.MulterFile>): Promise<Buffer> {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      // Listen for 'data' event to collect chunks
      archive.on('data', (chunk) => chunks.push(chunk));

      // Handle any errors during the archiving process
      archive.on('error', (err) => {
        console.error('Error during archiving:', err);
        reject(err);
      });

      // Handle when the archiving is finished
      archive.on('end', () => {
        const totalZippedSize = Buffer.concat(chunks).length;
        //console.log('Archiving finalized, total bytes:', totalZippedSize);
        resolve(Buffer.concat(chunks));
      });

      // Append each file to the archive
      for (const file of files) {
        //console.log(`Appending file: ${file.originalname}, size: ${file.buffer.length}`);
        archive.append(file.buffer, { name: file.originalname });
      }

      // Finalize the archive (this will trigger the 'end' event when done)
      archive.finalize();
    });
  }
  //a test function to ensure the zip buffer can be unzip correctly
  async testUnzip(zipBuffer: Buffer, zippedFileName: string) {
    // Create a temporary file path
    const tempZipPath = join(tmpdir(), zippedFileName);

    // Write the zip buffer to a file
    writeFileSync(tempZipPath, zipBuffer);
    try {
      // Attempt to unzip the file
      const zip = new AdmZip(tempZipPath);
      const zipEntries = zip.getEntries(); // Get an array of ZipEntry objects
      console.log('Unzipped contents:');
      zipEntries.forEach((entry) => {
        console.log(` - ${entry.entryName}`);
      });
      // Optionally, extract to a specific directory (uncomment if needed)
      // const outputDir = join(tmpdir(), 'unzipped');
      // zip.extractAllTo(outputDir, true);

      return zipEntries;
    } catch (error) {
      console.error('Error unzipping file:', error);
      throw error; // Rethrow the error if needed
    }
  }

  //downalod multiple file, return a zipped file to caller
  @Get('download/multiple')
  async downloadMinioDirectory(
    @Body(new ValidationPipe()) body: FileDtoMultiple,
    @Res() res: Response,
  ) {
    try {
      const {
        user_name,
        result_type,
        project_id,
        version,
        zip,
        zippedFileName,
      } = body;
      const zipFilePath = join(tmpdir(), `${Date.now()}-files.zip`);
      //get MinIO file location
      const location = UpdateFilePath(
        GetFilePath(result_type, project_id, version),
      );
      await this.zipMinioDirectory(user_name, location, zipFilePath);
      console.log('download path:', zipFilePath);
      res.download(zipFilePath, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
      });
    } catch (error) {
      console.error('Error during file downloadload:', error.message);
      throw new HttpException(
        'File download failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //get object from Mino, zip it, and save to outPath
  async zipMinioDirectory(
    bucketName: string,
    prefix: string,
    outPath: string,
  ): Promise<void> {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = createWriteStream(outPath);
    const objects = await this.minioService.listObjects(bucketName, prefix);
    if (objects.length > 0) {
      return new Promise((resolve, reject) => {
        archive.on('error', (err) => reject(err));
        archive.pipe(stream);

        let filesAppended = 0;

        objects.forEach((obj, index) => {
          this.minioService
            .getObject(bucketName, obj.name)
            .then((objectStream) => {
              const obj_name = obj.name.replace(prefix, ''); //remove folder structure that used under MinIO
              archive.append(objectStream, { name: obj_name });
              //archive.append(objectStream, { name: obj.name });
              filesAppended += 1;
              // Finalize the archive when all files are appended
              if (filesAppended === objects.length) {
                archive.finalize();
              }
            })
            .catch((err) => reject(err));
        });
        stream.on('close', () => resolve());
      });
    } else {
      throw new HttpException(
        'Under {' + bucketName + '}, Path {' + prefix + "} doesn't exist!",
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //download file to server side: maybe for scan / upgrade purpose
  @Get('download/server')
  async downloadToServer(@Body(new ValidationPipe()) body: FileDtoMultiple) {
    try {
      const {
        user_name,
        result_type,
        project_id,
        version,
        zip,
        zippedFileName,
      } = body;
      const filePath = join(tmpdir(), `${Date.now()}`);
      //get MinIO file location
      const location = UpdateFilePath(
        GetFilePath(result_type, project_id, version),
      );
      await this.downloadFileToLocal(user_name, location, filePath);
      console.log('download path:', filePath);
      return filePath;
    } catch (error) {
      console.error('Error during file download locally:', error.message);
      throw new HttpException(
        'File download failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //download file to localFilePath
  async downloadFileToLocal(
    bucketName: string,
    prefix: string,
    localFilePath: string,
  ): Promise<void> {
    const objects = await this.minioService.listObjects(bucketName, prefix);
    let pending = objects.length;
    return new Promise((resolve, reject) => {
      objects.forEach((obj, index) => {
        const filePath = join(localFilePath, obj.name.replace(prefix, '')); //remove folder structure that used under MinIO
        const dir = dirname(filePath);

        // Ensure the directory exists
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }

        const fileStream = createWriteStream(filePath);
        this.minioService
          .getObject(bucketName, obj.name)
          .then((objectStream) => {
            objectStream.pipe(fileStream);
            objectStream.on('end', () => {
              pending -= 1;
              if (pending === 0) {
                resolve();
              }
            });
            objectStream.on('error', (error) => reject(error));
          })
          .catch((err) => reject(err));
        fileStream.on('close', () => resolve());
      });
    });
  }
}
