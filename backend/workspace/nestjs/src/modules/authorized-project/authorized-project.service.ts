import { Injectable } from '@nestjs/common';
import { AuthorizedProject } from './authorized-project.entity';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../project/project.entity';

@Injectable()
export class AuthorizedProjectService {
  constructor(
    @InjectRepository(AuthorizedProject)
    private readonly authorizedProjectRepository: Repository<AuthorizedProject>,
  ) {}

  // Get all authorized projects
  async getAllAuthorizedProjects(): Promise<AuthorizedProject[]> {
    return await this.authorizedProjectRepository.find();
  }

  // Create authorized project
  async createAuthorizedProject(
    user: User,
    project: Project,
  ): Promise<AuthorizedProject> {
    const authorizedProject = this.authorizedProjectRepository.create({
      user: user,
      project: project,
      createdDatetime: new Date(),
      updatedDatetime: new Date(),
      deletedDatetime: null,
      version: 1,
    });
    return await this.authorizedProjectRepository.save(authorizedProject);
  }

  // Get authorized projects by user
  async getAuthorizedProjectsByUser(user: User): Promise<AuthorizedProject[]> {
    return this.authorizedProjectRepository.find({
      where: { user: { id: user.id } },
      relations: ['user', 'project'],
    });
  }

  // Get authorized projects by user and project
  async getAuthorizedProjectsByUserAndProject(
    user: User,
    project: Project,
  ): Promise<AuthorizedProject> {
    return this.authorizedProjectRepository.findOne({
      where: {
        user: { id: user.id },
        project: { id: project.id },
      },
      relations: ['user', 'project'],
    });
  }

  // Delete authorized project
  async deleteAuthorizedProject(
    authorizedProject: AuthorizedProject,
  ): Promise<void> {
    await this.authorizedProjectRepository.delete(authorizedProject);
  }

  async deleteAllAuthorizedProjectsForProject(project: Project): Promise<void> {
    await this.authorizedProjectRepository.delete({ project: project });
  }
}
