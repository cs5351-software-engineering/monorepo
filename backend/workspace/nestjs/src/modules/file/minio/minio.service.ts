import { tmpdir } from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import * as Minio from 'minio';
import { UpdateFilePath } from '../../../common/functions/files-utils';
import { Project } from 'src/modules/project/project.entity';
import * as AdmZip from 'adm-zip';

@Injectable()
export class MinioService {
  private readonly minioClient: Minio.Client;
  private readonly logger = new Logger(MinioService.name);

  // Init Minio client
  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: parseInt(process.env.MINIO_PORT),
      accessKey: process.env.MINIO_ACCESSKEY,
      secretKey: process.env.MINIO_SECRETKEY,
      useSSL: false,
    });
  }

  // Create bucket if not exists
  async createBucketIfNotExists(bucketName: string) {
    if (!(await this.checkBucketExist(bucketName))) {
      await this.minioClient.makeBucket(bucketName);
      console.log(`Bucket ${bucketName} created successfully.`);
    } else {
      console.log(`Bucket ${bucketName} already exists.`);
    }
  }

  // Save the file to MinIO
  async uploadFile(
    bucketName: string,
    location: string,
    file: Express.MulterFile,
    newfilename?: string,
  ) {
    // filename
    let filename = '';
    if (newfilename == undefined || newfilename.trim() == '') {
      filename = path.join(location, file.originalname);
    } else {
      filename = path.join(location, newfilename);
    }
    filename = UpdateFilePath(filename);

    // Check and create bucket
    await this.createBucketIfNotExists(bucketName);

    console.log(`Uploading file: ${filename} to bucket: ${bucketName}`);
    return await this.minioClient.putObject(bucketName, filename, file.buffer);
  }

  async uploadProject(project: Project, file: Express.MulterFile) {
    const bucketName = `project-${project.id}`;
    const path = `source_code.zip`;

    // Check bucket if not exists
    const isBucketExists = await this.minioClient.bucketExists(bucketName);
    if (!isBucketExists) {
      this.minioClient.makeBucket(bucketName);
    }

    // Upload file to bucket
    const uploadedObjectInfo = await this.minioClient.putObject(
      bucketName,
      path,
      file.buffer,
    );
    // console.log(uploadedObjectInfo);

    return uploadedObjectInfo;
  }

  // Get file from MinIO
  async downloadFile(bucket: string, location: string, filename: string) {
    const filefullpath = UpdateFilePath(path.join(location, filename));
    console.log(`Downloading file: ${filefullpath} from bucket: ${bucket}`);
    return await this.getObject(bucket, filefullpath);
  }

  // Get object from Bucket
  async getObject(bucket, filefullpath) {
    return await this.minioClient.getObject(bucket, filefullpath);
  }

  // Check bucket exists or not, create if bucket does not exists
  async checkAndCreateBucket(bucketName: string): Promise<void> {
    if (!this.checkBucketExist(bucketName)) {
      await this.minioClient.makeBucket(bucketName); // add your region if nessary ['us-east-1']
      console.log(`Bucket ${bucketName} created successfully.`);
    } else {
      // console.log(`Bucket ${bucketName} already exists.`);
    }
  }

  // Check bucket exists
  async checkBucketExist(bucketName: string): Promise<boolean> {
    const bucketExists = await this.minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      return false;
    } else {
      return true;
    }
  }

  // List all object under specific directory
  async listObjects(
    bucketName: string,
    prefix: string,
  ): Promise<Minio.BucketItem[]> {
    const objects: Minio.BucketItem[] = [];
    const stream = this.minioClient.listObjectsV2(bucketName, prefix, true);
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => objects.push(obj));
      stream.on('end', () => resolve(objects));
      stream.on('error', (err) => reject(err));
    });
  }

  // Download codebase to temp folder
  async downloadCodebaseToTemp(project: Project) {
    // console.log('Download codebase to temp');

    const projectId = project.id;
    const bucketName = `project-${projectId}`;
    const fileName = `source_code.zip`;

    // Create temp folder
    const randomString = Math.random().toString(36).substring(2, 15);
    const tempFolder = `${tmpdir()}/${randomString}/project-${projectId}`;
    if (!fs.existsSync(tempFolder)) {
      fs.mkdirSync(tempFolder, { recursive: true });
    }
    // console.log('tempFolder:', tempFolder);

    // Download file from MinIO
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const file = await this.minioClient.fGetObject(
      bucketName,
      fileName,
      `${tempFolder}/${fileName}`,
    );
    // console.log(file);

    // Unzip the file by adm-zip
    // I try decompress, but it's not work
    // https://blog.logrocket.com/best-methods-unzipping-files-node-js/
    const unzipFolder = `${tempFolder}/source_code`;
    if (!fs.existsSync(unzipFolder)) {
      fs.mkdirSync(unzipFolder, { recursive: true });
    }
    const zip = new AdmZip(`${tempFolder}/${fileName}`);
    zip.extractAllTo(unzipFolder, true);

    return unzipFolder;
  }
}
