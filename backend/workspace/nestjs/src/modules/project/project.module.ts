import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { AuthorizedProjectService } from '../authorized-project/authorized-project.service';

@Module({
  imports: [UserModule],
  providers: [ProjectService, UserService, AuthorizedProjectService],
  controllers: [ProjectController],
})
export class ProjectModule {}
