import { Module } from '@nestjs/common';
import { SonarqubeService } from './sonarqube.service';
import { SonarqubeController } from './sonarqube.controller';
import { UserService } from 'src/modules/user/user.service';
import { UserModule } from 'src/modules/user/user.module';
import { ProjectModule } from 'src/modules/project/project.module';
import { ProjectService } from 'src/modules/project/project.service';
import { MinioService } from 'src/modules/file/minio/minio.service';

@Module({
  imports: [UserModule, ProjectModule],
  providers: [UserService, SonarqubeService, ProjectService, MinioService],
  controllers: [SonarqubeController],
})
export class SonarqubeModule {}
