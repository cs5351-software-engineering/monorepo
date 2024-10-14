import { Module } from '@nestjs/common';
import { AuthorizedProjectService } from './authorized-project.service';
import { AuthorizedProjectController } from './authorized-project.controller';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizedProject } from './authorized-project.entity';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([AuthorizedProject])],
  providers: [AuthorizedProjectService, UserService],
  controllers: [AuthorizedProjectController],
  exports: [TypeOrmModule],
})
export class AuthorizedProjectModule {}
