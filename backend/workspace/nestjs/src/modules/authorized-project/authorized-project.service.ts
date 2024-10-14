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
  getAllAuthorizedProjects(): Promise<AuthorizedProject[]> {
    return this.authorizedProjectRepository.find();
  }

  // Create authorized project
  createAuthorizedProject(user: User, project: Project) {
    const authorizedProject = this.authorizedProjectRepository.create({
      user: user,
      project: project,
    });
    return this.authorizedProjectRepository.save(authorizedProject);
  }

  // Get authorized projects by user
  async getAuthorizedProjectsByUser(user: User): Promise<AuthorizedProject[]> {
    const authorizedProjects = await this.authorizedProjectRepository.find({
      where: { user: { id: user.id } },
    });
    // console.log(authorizedProjects);
    return authorizedProjects;
  }
}
