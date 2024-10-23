import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CodeSuggestionService } from './code-suggestion.service';
import { OllamaService } from '../ollama/ollama.service';
import { CodeSuggestion } from './code-suggestion.service';


@ApiTags('code-suggestion')
@Controller('code-suggestion')
export class CodeSuggestionController {
    constructor(private readonly ollamaService: OllamaService) {}

    @HttpCode(HttpStatus.OK)
    @Post('infill')
    async infillPython(@Body('filePath') filePath: string) {
        var codeSuggestionList: CodeSuggestion[] = await CodeSuggestionService.prototype.getCodeSuggestion(this.ollamaService, filePath)
        var fileContent: string = CodeSuggestionService.prototype.getCodeSuggestionContent(codeSuggestionList)
        return fileContent
    }

    @HttpCode(HttpStatus.OK)
    @Post('getcodereview')
    async getCodeReviewPython(@Body('filePath') filePath: string) {
        var codeSuggestionList: CodeSuggestion[] = await CodeSuggestionService.prototype.getCodeReview(this.ollamaService, filePath)
        var fileContent: string = CodeSuggestionService.prototype.getCodeSuggestionContent(codeSuggestionList)
        return fileContent
    }

    @HttpCode(HttpStatus.OK)
    @Post('getunittest')
    async getUnitTestPython(@Body('filePath') filePath: string) {
        var codeSuggestionList: CodeSuggestion[] = await CodeSuggestionService.prototype.getTestCase(this.ollamaService, filePath)
        var fileContent: string = CodeSuggestionService.prototype.getCodeSuggestionContent(codeSuggestionList)
        return fileContent
    }
}
