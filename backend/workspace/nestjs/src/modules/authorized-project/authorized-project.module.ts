import { Module } from '@nestjs/common';
import { AuthorizedProjectService } from './authorized-project.service';
import { AuthorizedProjectController } from './authorized-project.controller';

@Module({
  providers: [AuthorizedProjectService],
  controllers: [AuthorizedProjectController],
})
export class AuthorizedProjectModule {}
