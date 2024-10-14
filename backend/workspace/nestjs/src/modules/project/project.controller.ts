import { Controller, Get, Body } from '@nestjs/common';
import { AuthorizedProject } from '../authorized-project/authorized-project.entity';
import { UserService } from '../user/user.service';
import { BadRequestException } from '@nestjs/common';

@Controller('project')
export class ProjectController {
  constructor(private readonly userService: UserService) {}

  @Get('list')
  async getProjects(
    @Body('email') email: string,
  ): Promise<AuthorizedProject[]> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const projects = await this.userService.listProjects(email);
    console.log(projects);
    return projects;
  }
}
