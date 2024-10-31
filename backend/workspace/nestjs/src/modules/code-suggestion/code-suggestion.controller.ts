import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CodeSuggestionService } from './code-suggestion.service';
import { ProjectService } from '../project/project.service';

@ApiTags('code-suggestion')
@Controller('code-suggestion')
export class CodeSuggestionController {
  constructor(
    private readonly codeSuggestionService: CodeSuggestionService,
    private readonly projectService: ProjectService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('infill')
  async infillPython(@Body('filePath') filePath: string) {
    const fileContent =
      await this.codeSuggestionService.startCodeInfill(filePath);
    return fileContent;
  }

  @HttpCode(HttpStatus.OK)
  @Post('getcodereview')
  async getCodeReview(@Body('filePath') filePath: string) {
    const fileContent =
      await this.codeSuggestionService.startCodeReview(filePath);
    return fileContent;
  }

  @HttpCode(HttpStatus.OK)
  @Post('getunittest')
  async getUnitTest(@Body('filePath') filePath: string) {
    const fileContent =
      await this.codeSuggestionService.startGetTestCase(filePath);
    return fileContent;
  }

  @Get('analyzeCodebase/:projectId')
  async analyzeCodebase(@Param('projectId') projectId: number) {
    // Get project by id
    const project = await this.projectService.getProjectById(projectId);
    if (!project) {
      throw new BadRequestException('Project not found');
    }

    // Analyze codebase
    const result = await this.codeSuggestionService.analyzeCodebase(project);
    return result;
  }
}
