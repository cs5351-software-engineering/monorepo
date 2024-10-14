import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { MinioService } from './minio/minio.service';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { ProjectService } from '../project/project.service';
import { AuthorizedProjectService } from '../authorized-project/authorized-project.service';
import { ProjectModule } from '../project/project.module';
import { AuthorizedProjectModule } from '../authorized-project/authorized-project.module';

@Module({
  imports: [UserModule, ProjectModule, AuthorizedProjectModule],
  providers: [
    MinioService,
    UserService,
    ProjectService,
    AuthorizedProjectService,
  ],
  controllers: [FileController],
})
export class FileModule {}
