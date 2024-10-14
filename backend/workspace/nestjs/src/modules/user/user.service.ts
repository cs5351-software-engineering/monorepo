import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthorizedProject } from '../authorized-project/authorized-project.entity';
import { Project } from '../project/project.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AuthorizedProject)
    private authorizedProjectRepository: Repository<AuthorizedProject>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async getAllUsers() {
    return this.userRepository.find();
  }

  async getUserById(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  async getProjectNumber(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    return user.authorizedProjects;
  }

  async createProject(
    email: string,
    projectName: string,
    description: string,
    language: string,
  ) {
    const user = await this.userRepository.findOneBy({ email });
    const project = this.projectRepository.create({
      projectName: projectName,
      description: description,
      repositoryURL: '',
      language: language,
      currentVersion: '0',
      targetVersion: '',
      lastScanDatetime: null,
      lastMigrationDatetime: null,
      createdDatetime: new Date(),
      updatedDatetime: new Date(),
      deletedDatetime: null,
    });
    await this.projectRepository.save(project);

    const authorizedProject = this.authorizedProjectRepository.create({
      createdDatetime: new Date(),
      updatedDatetime: new Date(),
      deletedDatetime: null,
      version: 1,
      project: project,
      user: user,
    });
    await this.authorizedProjectRepository.save(authorizedProject);

    if (!user.authorizedProjects) {
      user.authorizedProjects = [];
    }
    user.authorizedProjects.push(authorizedProject);

    return this.userRepository.save(user);
  }

  async listProjects(email: string): Promise<AuthorizedProject[]> {
    const user = await this.userRepository.findOneBy({ email });
    console.log(user);
    return user.authorizedProjects;
  }

  async create(user: User) {
    return this.userRepository.save(user);
  }

  async update(user: User) {
    return this.userRepository.save(user);
  }

  async delete(id: number) {
    return this.userRepository.delete(id);
  }
}
