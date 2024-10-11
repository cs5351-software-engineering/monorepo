import { Module } from '@nestjs/common';
import { ProjectVersionController } from './project-version.controller';
import { ProjectVersionService } from './project-version.service';

@Module({
  controllers: [ProjectVersionController],
  providers: [ProjectVersionService],
})
export class ProjectVersionModule {}
