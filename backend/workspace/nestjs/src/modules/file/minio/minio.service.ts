import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import * as Minio from 'minio';
import * as path from 'path';
import { UpdateFilePath } from '../../../common/functions/files-utils';

@Injectable()
export class MinioService {
  private readonly minioClient: Minio.Client;
  private readonly logger = new Logger(MinioService.name);

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: parseInt(process.env.MINIO_PORT),
      accessKey: process.env.MINIO_ACCESSKEY,
      secretKey: process.env.MINIO_SECRETKEY,
      useSSL: false,
    });
  }

  //save the file to MinIO
  async uploadFile(
    bucket: string,
    location: string,
    file: Express.MulterFile,
    newfilename?: string,
  ) {
    let filename = '';
    if (newfilename == undefined || newfilename.trim() == '') {
      filename = path.join(location, file.originalname);
    } else {
      filename = path.join(location, newfilename);
    }
    filename = UpdateFilePath(filename);

    console.log(`Uploading file: ${filename} to bucket: ${bucket}`);

    return await this.minioClient.putObject(bucket, filename, file.buffer);
  }

  //get file from MinIO
  async downloadFile(bucket: string, location: string, filename: string) {
    const filefullpath = UpdateFilePath(path.join(location, filename));
    console.log(`Downloading file: ${filefullpath} from bucket: ${bucket}`);
    return await this.getObject(bucket, filefullpath);
  }

  //get object from Bucket
  async getObject(bucket, filefullpath) {
    return await this.minioClient.getObject(bucket, filefullpath);
  }
  //check bucket exists or not, create if bucket does not exists
  async checkAndCreateBucket(bucketName: string): Promise<void> {
    if (!this.checkBucketExist(bucketName)) {
      await this.minioClient.makeBucket(bucketName); // add your region if nessary ['us-east-1']
      console.log(`Bucket ${bucketName} created successfully.`);
    } else {
      //console.log(`Bucket ${bucketName} already exists.`);
    }
  }

  //check bucket exists
  async checkBucketExist(bucketName: string): Promise<boolean> {
    const bucketExists = await this.minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      return false;
    } else {
      return true;
    }
  }

  //list all object under specific directory
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
}
