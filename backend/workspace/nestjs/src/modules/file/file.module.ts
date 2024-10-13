import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { MinioService } from './minio/minio.service';

@Module({
  providers: [MinioService],
  controllers: [FileController],
})
export class FileModule {}
