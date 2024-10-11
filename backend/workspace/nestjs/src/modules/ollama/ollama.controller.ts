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
    return this.ollamaService.callLlama(prompt);
  }
}
