import { Controller, Get } from '@nestjs/common';

@Controller('project')
export class ProjectController {
  @Get()
  getHello(): string {
    return 'Hello from ProjectController!';
  }
}
