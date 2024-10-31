import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CodeSuggestionService } from './code-suggestion.service';

@ApiTags('code-suggestion')
@Controller('code-suggestion')
export class CodeSuggestionController {
  constructor(private readonly codeSuggestionService: CodeSuggestionService) {}

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
}
