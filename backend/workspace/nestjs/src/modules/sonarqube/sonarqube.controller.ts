import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { SonarqubeService } from './sonarqube.service';
import { UserService } from 'src/modules/user/user.service';
import { ProjectService } from 'src/modules/project/project.service';
import { MinioService } from 'src/modules/file/minio/minio.service';

@Controller('sonarqube')
export class SonarqubeController {
  constructor(
    private readonly sonarqubeService: SonarqubeService,
    private readonly userService: UserService,
    private readonly projectService: ProjectService,
    private readonly minioService: MinioService,
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

  @Post('startScanner')
  async startScanner(@Body('projectId') projectId: number) {
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    // Get project by id
    const project = await this.projectService.getProjectById(projectId);
    // console.log(project);

    // Check SonarQube project exist and create if not
    const isSonarQubeProjectExist =
      await this.sonarqubeService.checkProjectExist(`project-${project.id}`);
    // console.log(isSonarQubeProjectExist);

    // Create project if not exist
    if (!isSonarQubeProjectExist) {
      console.log('Create SonarQube project');
      await this.sonarqubeService.createProject(
        `project-${project.id}`,
        project.projectName,
      );
    }

    // Download project codebase from minio
    const path = await this.minioService.downloadCodebaseToTemp(project);
    console.log(path);

    // Start analysis
    this.sonarqubeService.startScanner(project, path);

    return 'Analysis started';
  }
}
