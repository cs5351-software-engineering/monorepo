import { Controller, Delete, Get, Query, Param } from '@nestjs/common';
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

  @Get('id/:projectId')
  async getProjectById(
    @Param('projectId') projectId: number,
  ): Promise<Project> {
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }
    const project = await this.projectService.getProjectById(projectId);
    if (!project) {
      throw new BadRequestException('Project not found');
    }
    return project;
  }

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
    // console.log(authorizedProjects);
    authorizedProjects.map((ele) => console.log(ele.user, ele.project));

    const projects = await Promise.all(
      authorizedProjects.map(
        async (ele) => await this.projectService.getProjectById(ele.project.id),
      ),
    );
    // console.log(projects);

    return projects;
  }

  // Delete project by project id and user id
  @Delete('delete')
  async deleteProject(
    @Query('userId') userId: number,
    @Query('projectId') projectId: number,
  ): Promise<{ message: string }> {
    // Check if projectId and userId are provided
    if (!projectId || !userId) {
      throw new BadRequestException('Project ID and user ID are required');
    }

    // Get user by id
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    // console.log(user);

    // Get project by id
    const project = await this.projectService.getProjectById(projectId);
    if (!project) {
      throw new BadRequestException('Project not found');
    }
    // console.log(project);

    // Get authorized projects by user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const authorizedProject =
      await this.authorizedProjectService.getAuthorizedProjectsByUserAndProject(
        user,
        project,
      );
    // console.log(authorizedProject);

    // Delete all authorized projects related to this project
    await this.authorizedProjectService.deleteAllAuthorizedProjectsForProject(
      project,
    );

    // Delete project
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const projectDeleteResult =
      await this.projectService.deleteProject(projectId);
    // console.log(projectDeleteResult);

    return { message: 'Project deleted successfully' };
  }
}
