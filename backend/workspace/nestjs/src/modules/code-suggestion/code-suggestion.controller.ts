import { Body, Controller, HttpCode, HttpStatus, Post, BadRequestException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CodeSuggestionService } from './code-suggestion.service';
import { OllamaService } from '../ollama/ollama.service';

//import { ProjectService } from 'src/modules/project/project.service';
import { MinioService } from 'src/modules/file/minio/minio.service';

@ApiTags('code-suggestion')
@Controller('code-suggestion')
export class CodeSuggestionController {
    constructor(
        private readonly ollamaService: OllamaService,
        //private readonly projectService: ProjectService,
        private readonly minioService: MinioService,
        private readonly codeSuggestionService: CodeSuggestionService
      ) {}

    @HttpCode(HttpStatus.OK)
    @Post('infill')
    async infillPython(@Body('filePath') filePath: string) {
        const fileContent = await this.codeSuggestionService.startCodeInfill(this.ollamaService, filePath);
        return fileContent
    }

    @HttpCode(HttpStatus.OK)
    @Post('getcodereview')
    async getCodeReview(@Body('filePath') filePath: string) {
        const fileContent = await this.codeSuggestionService.startCodeReview(this.ollamaService, filePath);
        return fileContent
    }

    @HttpCode(HttpStatus.OK)
    @Post('getunittest')
    async getUnitTest(@Body('filePath') filePath: string) {
        const fileContent = await this.codeSuggestionService.startGetTestCase(this.ollamaService, filePath);
        return fileContent
    }
}
