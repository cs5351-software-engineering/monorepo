import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Project } from '../project/project.entity';
import { AuthorizedProject } from '../authorized-project/authorized-project.entity';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [TypeOrmModule.forFeature([User, Project, AuthorizedProject])],
  exports: [TypeOrmModule],
})
export class UserModule {}
