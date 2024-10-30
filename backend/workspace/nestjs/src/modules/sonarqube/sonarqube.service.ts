import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Project } from '../project/project.entity';
import { SonarQubeAnalysisResult } from './sonarqube-analysis-result.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { exec } from 'child_process';
import * as fs from 'fs';
import { OllamaService } from '../ollama/ollama.service';

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
    private ollamaService: OllamaService,
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
          await this.sonarQubeAnalysisResultRepository.save(scannerDoneResult);
          await this.projectRepository.update(projectId, {
            sonarQubeAnalysisResult: scannerDoneResult,
          });

          // Just wait for 2 seconds, it is shit
          // Normally should use some way to confirm sonarqube project analysis is done after scanner cli is done
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Request analysis result from sonarqube
          const sonarQubeResponse = await this.requestAnalysisResult(projectId);
          // console.log('Sonarqube response:', sonarqubeResponse);

          // Process issue object
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          //  {
          //   [filePath: string]: {
          //     key: string,
          //     rule: string,
          //     severity: string,
          //     message: string,
          //     codeBlock: string[],
          //     textRange: { startLine: number; endLine: number },
          //   }[]
          // }
          const processedIssueObject = await this.processIssueList(
            sonarQubeResponse.filteredIssueListJsonString,
            path,
          );
          console.log('Processed issue object:', processedIssueObject);
          const processedIssueObjectJsonString =
            JSON.stringify(processedIssueObject);
          console.log(
            'Processed issue object json string:',
            processedIssueObjectJsonString,
          );

          // Analyze by Ollama
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          // const analyzedIssueList =
          //   await this.analyzeByOllama(processedIssueObject);

          // Update analysis result to database
          const completedResult = new SonarQubeAnalysisResult();
          completedResult.status = 'Completed';
          completedResult.stdout = stdout;
          completedResult.issueListJsonString =
            sonarQubeResponse.issueListJsonString;
          completedResult.filteredIssueListJsonString =
            sonarQubeResponse.filteredIssueListJsonString;
          completedResult.processedIssueObjectJsonString =
            processedIssueObjectJsonString;
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
    console.log('Issue list json:', issueListJson);

    const issueList = issueListJson.issues;
    console.log('Analysis result:', issueList[0]);
    console.log('keys:', Object.keys(issueList[0]));

    // Filter issue list
    // Don't need line, because textRange has startLine and endLine
    const filteredIssueList = issueList.map(
      ({ key, rule, component, message, severity, type, textRange }) => {
        return {
          key,
          rule,
          component,
          message,
          severity,
          type,
          textRange,
        };
      },
    );
    console.log('Filtered issue list:', filteredIssueList);

    const issueListJsonString = JSON.stringify(issueListJson);
    const filteredIssueListJsonString = JSON.stringify(filteredIssueList);

    return { issueListJsonString, filteredIssueListJsonString };
  }

  // Process issue list
  async processIssueList(issueListJsonString: string, basePath: string) {
    const issueList: {
      component: string;
      textRange: { startLine: number; endLine: number };
    }[] = JSON.parse(issueListJsonString);
    if (issueList.length === 0) {
      return [];
    }
    console.log('Processed issue list:', issueList[0], 'basePath:', basePath);

    // Add filePath to issue list
    const addFilePathList = issueList.map((issue) => {
      return {
        ...issue,
        filePath: issue.component.split(':')[1],
      };
    });
    console.log('Add filePath list:', addFilePathList);

    // Group by filePath
    // Object.groupBy is not supported
    const groupedList = addFilePathList.reduce((acc, issue) => {
      acc[issue.filePath] = acc[issue.filePath] || [];
      acc[issue.filePath].push(issue);
      return acc;
    }, {});
    console.log('Grouped list:', groupedList);

    // Get code context
    // { filePath: [line1, line2, ...] }
    const codeContexts = {};
    Object.keys(groupedList).forEach((filePath) => {
      const fileContent = fs.readFileSync(`${basePath}/${filePath}`, 'utf8');
      const lines = fileContent.split('\n');
      codeContexts[filePath] = lines;
    });
    console.log('Code contexts:', codeContexts);

    // Get code block (startLine - 5, endLine + 5) of each issue
    // and add to groupedList
    Object.keys(groupedList).forEach((filePath) => {
      const lines = codeContexts[filePath];
      groupedList[filePath].forEach((issue) => {
        let { startLine, endLine } = issue.textRange;
        startLine = startLine - 5 < 0 ? 0 : startLine - 5;
        endLine = endLine + 5 > lines.length ? lines.length : endLine + 5;
        let codeBlock = lines.slice(startLine, endLine);
        codeBlock = codeBlock.map((line, index) => {
          return { lineNumber: startLine + index + 1, line: line };
        });
        issue.codeBlock = codeBlock;
      });
    });
    console.log('Add code blocks on groupedList:', groupedList);

    return groupedList;
  }

  // Analyze by Ollama
  async analyzeByOllama(issueDict: object) {
    // TODO: Analyze by Ollama
    return [];
  }
}
