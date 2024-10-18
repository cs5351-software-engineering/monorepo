import { Injectable } from '@nestjs/common';
import { Project } from './project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  // Get project by id
  async getProjectById(id: number): Promise<Project> {
    return this.projectRepository.findOne({ where: { id } });
  }

  // Create project
  async createProject(
    projectName: string,
    description: string,
    language: string,
    repositoryURL: string,
  ) {
    const newProject = this.projectRepository.create({
      projectName: projectName,
      description: description,
      language: language,
      repositoryURL: repositoryURL,
      currentVersion: '0',
      targetVersion: '',
      lastScanDatetime: null,
      lastMigrationDatetime: null,
      createdDatetime: new Date(),
      updatedDatetime: new Date(),
      deletedDatetime: null,
    });
    return this.projectRepository.save(newProject);
  }

  // Delete project
  async deleteProject(id: number) {
    return await this.projectRepository.delete({ id });
  }
}
