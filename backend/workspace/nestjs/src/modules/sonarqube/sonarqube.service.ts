import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Project } from '../project/project.entity';
import { SonarQubeAnalysisResult } from './sonarqube-analysis-result.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { exec } from 'child_process';

@Injectable()
export class SonarqubeService {
  sonarqubeUrl: string;
  sonarqubeToken: string;
  sonarScannerPath: string;
  client: AxiosInstance;
  private readonly logger = new Logger(SonarqubeService.name);

  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(SonarQubeAnalysisResult)
    private sonarQubeAnalysisResultRepository: Repository<SonarQubeAnalysisResult>,
  ) {
    this.sonarqubeUrl = process.env.SONARQUBE_URL;
    this.sonarqubeToken = process.env.SONARQUBE_TOKEN;
    this.sonarScannerPath = process.env.SONAR_SCANNER_PATH;

    // If any undefined environment variable, throw error
    if (!this.sonarqubeUrl) {
      throw new Error('SONARQUBE_URL must be defined');
    }
    if (!this.sonarqubeToken) {
      throw new Error('SONARQUBE_TOKEN must be defined');
    }
    if (!this.sonarScannerPath) {
      throw new Error('SONAR_SCANNER_PATH must be defined');
    }

    this.logger.debug(
      `Init, url: ${this.sonarqubeUrl}, token: ${this.sonarqubeToken}`,
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
    try {
      const response = await this.client.get(
        `/api/projects/search?projects=${projectKey}`,
      );
      return response.data.components.length > 0;
    } catch (error) {
      this.logger.error(
        `Error checking project ${projectKey}: ${error.message}`,
      );
      throw new Error('Failed to check project existence.');
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

    // Unescape string
    const unescapedProjectName = projectName.replace(/"/g, '\\"');

    // For bug from sonar.host.url: https://community.sonarsource.com/t/error-during-sonarscanner-cli-execution-ruby-on-rails/119010
    const command = `sonar-scanner \
    -Dsonar.projectKey=${projectKey} \
    -Dsonar.projectName="${unescapedProjectName}" \
    -Dsonar.projectVersion=${version} \
    -Dsonar.sources=${path} \
    -Dsonar.projectBaseDir=${path} \
    -Dsonar.host.url=${this.sonarqubeUrl} \
    -Dsonar.token=${this.sonarqubeToken}`;
    // console.log(command);

    // Call sonarqube scanner cli command
    try {
      exec(
        command,
        {
          cwd: this.sonarScannerPath,
        },
        async (error, stdout, stderr) => {
          if (error) {
            console.error(`Error message: ${error.message}`);
            console.log('stderr:', stderr);
            return;
          }

          // Update analysis result to database
          const scannerDoneResult = new SonarQubeAnalysisResult();
          scannerDoneResult.status = 'Scanner Done';
          scannerDoneResult.stdout = stdout;
          await this.sonarQubeAnalysisResultRepository.save(scannerDoneResult);
          await this.projectRepository.update(projectId, {
            sonarQubeAnalysisResult: scannerDoneResult,
          });

          // Request analysis result from sonarqube
          const sonarQubeResponse = await this.requestAnalysisResult(projectId);
          // console.log('Sonarqube response:', sonarqubeResponse);

          // Update analysis result to database
          const completedResult = new SonarQubeAnalysisResult();
          completedResult.status = 'Completed';
          completedResult.stdout = stdout;
          completedResult.issueListJsonString =
            sonarQubeResponse.issueListJsonString;
          completedResult.filteredIssueListJsonString =
            sonarQubeResponse.filteredIssueListJsonString;
          await this.sonarQubeAnalysisResultRepository.save(completedResult);
          await this.projectRepository.update(projectId, {
            sonarQubeAnalysisResult: completedResult,
          });
        },
      );
    } catch (error) {
      this.logger.error(`Error starting scanner: ${error.message}`);
      throw error;
    }

    // Save analysis result to project
    const runningResult = new SonarQubeAnalysisResult();
    runningResult.status = 'Running';
    await this.sonarQubeAnalysisResultRepository.save(runningResult);
    await this.projectRepository.update(projectId, {
      sonarQubeAnalysisResult: runningResult,
    });

    return 'Analysis started';
  }

  // Get analysis result
  async getAnalysisResult(projectId: number) {
    // Get project by id
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    const analysisResult = project.sonarQubeAnalysisResult;
    if (!analysisResult) {
      throw new Error('Analysis result not found');
    }

    return analysisResult;
  }

  // Request analysis result from sonarqube
  async requestAnalysisResult(projectId: number) {
    const projectKey = `project-${projectId}`;

    // Request issue list
    const issueListResponse = await this.client.get(
      `/api/issues/list?project=${projectKey}`,
    );
    const issueListJson = issueListResponse.data;

    const issueList = issueListJson.issues;
    console.log('Analysis result:', issueList[0]);
    console.log('keys:', Object.keys(issueList[0]));

    const filteredIssueList = issueList.map(
      ({ key, rule, component, message, severity, type, line, textRange }) => {
        return {
          key,
          rule,
          component,
          message,
          severity,
          type,
          line,
          textRange,
        };
      },
    );
    console.log('Filtered issue list:', filteredIssueList);

    const issueListJsonString = JSON.stringify(issueListJson);
    const filteredIssueListJsonString = JSON.stringify(filteredIssueList);

    return { issueListJsonString, filteredIssueListJsonString };
  }
}
