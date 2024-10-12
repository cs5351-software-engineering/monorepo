import { Controller, Get } from '@nestjs/common';

@Controller('project')
export class ProjectController {
  @Get()
  getProjects(): { name: string }[] {
    // Sample data: list of projects
    return [
      { name: 'Web Application Redesign' },
      { name: 'Mobile App Development' },
      { name: 'Database Migration' },
      { name: 'API Integration' },
      { name: 'Cloud Infrastructure Setup' },
    ];
  }
}
