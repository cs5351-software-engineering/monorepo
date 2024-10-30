import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OllamaService } from './ollama.service';

//swagger: add to "auth" tag
@ApiTags('ollama')
@Controller('ollama')
export class OllamaController {
  constructor(private readonly ollamaService: OllamaService) {}

  @HttpCode(HttpStatus.OK)
  @Post('call')
  async callLlama(@Body('prompt') prompt: string) {
    const result = await this.ollamaService.callLlama(prompt);
    const choices = result['choices'];
    console.log(choices[0]['text']);
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Post('callCodeQwen')
  async callForCodeQwen(@Body('prompt') prompt: string) {
    return this.ollamaService.callForCodeInfill(prompt, 'qwen');
  }

  @HttpCode(HttpStatus.OK)
  @Post('callForUnitTestOrCodeReview')
  async callForUnitTestOrCodeReview(@Body('prompt') prompt: string) {
    return this.ollamaService.callForUnitTestOrCodeReview(
      prompt,
      'code_review',
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('callCode7bcode')
  async callForCodeInfill(@Body('prompt') prompt: string) {
    return this.ollamaService.callForCodeInfill(prompt, 'codeLlama');
  }
}
