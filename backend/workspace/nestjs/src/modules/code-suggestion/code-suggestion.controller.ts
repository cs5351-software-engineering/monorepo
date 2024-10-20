import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CodeSuggestionService } from './code-suggestion.service';



@ApiTags('code-suggestion')
@Controller('code-suggestion')
export class CodeSuggestionController {
    @HttpCode(HttpStatus.OK)
    @Post('infill/python')
    async infillPython(@Body('filePath') filePath: string) {
        CodeSuggestionService.prototype.getCodeSuggestion(filePath)
    }

    @HttpCode(HttpStatus.OK)
    @Post('getcodereview/python')
    async getCodeReviewPython(@Body('filePath') filePath: string) {
        CodeSuggestionService.prototype.getCodeReview(filePath)
    }

    @HttpCode(HttpStatus.OK)
    @Post('getunittest/python')
    async getUnitTestPython(@Body('filePath') filePath: string) {
        CodeSuggestionService.prototype.getCodeReview(filePath)
    }
}
