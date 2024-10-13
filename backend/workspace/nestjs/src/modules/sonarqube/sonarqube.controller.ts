import { Controller, Get } from '@nestjs/common';
import { SonarqubeService } from './sonarqube.service';
import { UserService } from '../user/user.service';

@Controller('sonarqube')
export class SonarqubeController {
  constructor(
    private readonly userService: UserService,
    private readonly sonarqubeService: SonarqubeService,
  ) {}

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get('helloWorld')
  async helloWorld() {
    return this.sonarqubeService.helloWorld();
  }
}
