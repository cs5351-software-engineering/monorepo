import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { exec } from 'child_process';
import { Project } from '../project/project.entity';

@Injectable()
export class SonarqubeService {
  sonarqubeUrl: string;
  sonarqubeToken: string;
  client: AxiosInstance;

  constructor() {
    this.sonarqubeUrl = process.env.SONARQUBE_URL;
    this.sonarqubeToken = process.env.SONARQUBE_TOKEN;
    console.log(
      'Init SonarqubeService',
      this.sonarqubeUrl,
      this.sonarqubeToken,
    );
    this.client = axios.create({
      baseURL: this.sonarqubeUrl,
      headers: {
        Authorization: `Bearer ${this.sonarqubeToken}`,
      },
    });
  }

  // Check project exist in sonarqube
  async checkProjectExist(projectKey: string) {
    console.log('Check project exist:', projectKey);
    try {
      const response = await this.client.get(
        `/api/projects/search?projects=${projectKey}`,
      );
      console.log(response.data);
      return response.data.components.length > 0;
    } catch (error) {
      console.error('Error checking project:', error.message);
      throw error;
    }
  }

  // Create project in sonarqube
  async createProject(projectKey: string, projectName: string) {
    console.log('Create project in sonarqube:', projectKey, projectName);
    try {
      const response = await this.client.post(
        '/api/projects/create',
        {
          project: projectKey,
          name: projectName,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      console.log('Project created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error.message);
      throw error;
    }
  }

  // Start Sonarqube scanner cli
  async startScanner(project: Project, path: string) {
    console.log('Start SonarQube scanner, project:', project.id, 'path:', path);
    const projectId = project.id;
    const projectKey = `project-${projectId}`;
    const projectName = project.projectName;
    const version = project.version;

    try {
      // Call sonarqube scanner cli command
      // for bug from sonar.host.url: https://community.sonarsource.com/t/error-during-sonarscanner-cli-execution-ruby-on-rails/119010
      const command = `sonar-scanner \
        -Dsonar.projectKey=${projectKey} \
        -Dsonar.projectName=${projectName} \
        -Dsonar.projectVersion=${version} \
        -Dsonar.sources=${path} \
        -Dsonar.host.url=${this.sonarqubeUrl} \
        -Dsonar.login=${this.sonarqubeToken}`;
      // console.log(command);

      exec(
        command,
        { cwd: `${process.env.SONAR_SCANNER_PATH}` },
        (error, stdout, stderr) => {
          console.log('stdout:', stdout);
          if (error) {
            console.error(`Error message: ${error.message}`);
            console.log('stderr:', stderr);
            return;
          }
        },
      );

      return 'Analysis started';
    } catch (error) {
      console.error('Error starting analysis:', error.message);
      throw error;
    }
  }
}
