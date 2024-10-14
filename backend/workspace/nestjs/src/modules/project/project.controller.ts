import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { BadRequestException } from '@nestjs/common';
import { AuthorizedProjectService } from '../authorized-project/authorized-project.service';
import { Project } from './project.entity';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
  constructor(
    private readonly userService: UserService,
    private readonly authorizedProjectService: AuthorizedProjectService,
    private readonly projectService: ProjectService,
  ) {}

  // Get projects by user email
  @Get('list')
  async getProjects(@Query('email') email: string): Promise<Project[]> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    // Get user by email
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    // console.log('user', user);

    // Get authorized projects by user
    const authorizedProjects =
      await this.authorizedProjectService.getAuthorizedProjectsByUser(user);
    console.log(authorizedProjects);
    authorizedProjects.map((ele) => console.log(ele.user, ele.project));

    const projects = await Promise.all(
      authorizedProjects.map(
        async (ele) => await this.projectService.getProjectById(ele.project.id),
      ),
    );
    console.log(projects);
    return projects;
  }
}
