import { Controller, Get, BadRequestException, Query } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AuthorizedProject } from './authorized-project.entity';
import { AuthorizedProjectService } from './authorized-project.service';

@Controller('authorized-project')
export class AuthorizedProjectController {
  constructor(
    private readonly authorizedProjectService: AuthorizedProjectService,
    private readonly userService: UserService,
  ) {}

  // Get authorized projects by user email
  @Get('list')
  async getAuthorizedProjects(
    @Query('email') email: string,
  ): Promise<AuthorizedProject[]> {
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
    // console.log('getAuthorizedProjects', authorizedProjects);
    return authorizedProjects;
  }

  // Get all authorized projects
  @Get('listall')
  async getAllAuthorizedProjects(): Promise<AuthorizedProject[]> {
    return this.authorizedProjectService.getAllAuthorizedProjects();
  }
}
