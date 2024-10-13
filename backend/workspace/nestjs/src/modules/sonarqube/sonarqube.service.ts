import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

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

  async helloWorld() {
    return 'Hello World';
  }

  async isHealth() {
    try {
      const response = await this.client.get('/api/system/health');
      console.log('response:', response);
      return response;
    } catch (error) {
      console.error('Error checking health:', error.message);
      throw error;
    }
  }

  async createProject(projectKey: string, projectName: string) {
    try {
      const url = `${this.sonarqubeUrl}/api/projects/create`;
      const response = await axios.post(
        url,
        {
          project: projectKey,
          name: projectName,
        },
        {
          headers: {
            Authorization: `Bearer ${this.sonarqubeToken}`,
          },
        },
      );
      // Consider logging only in development environment
      console.log('Project created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error.message);
      throw error; // Re-throw the error for the caller to handle
    }
  }
}
