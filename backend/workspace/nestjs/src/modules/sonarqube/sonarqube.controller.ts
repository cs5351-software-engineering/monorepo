import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { SonarqubeService } from './sonarqube.service';
import { UserService } from '../user/user.service';

@Controller('sonarqube')
export class SonarqubeController {
  constructor(
    private readonly userService: UserService,
    private readonly sonarqubeService: SonarqubeService,
  ) {}

  @Post('createProject')
  async createProject(
    @Body('projectKey') projectKey: string,
    @Body('projectName') projectName: string,
  ) {
    console.log(projectKey, projectName);
    if (!projectKey || !projectName) {
      throw new BadRequestException('Project key and name are required');
    }
    return this.sonarqubeService.createProject(projectKey, projectName);
  }
}
