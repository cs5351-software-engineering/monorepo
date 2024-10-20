import { Module } from '@nestjs/common';
import { CodeSuggestionService } from './code-suggestion.service';
import { CodeSuggestionController } from './code-suggestion.controller';
import { OllamaService } from '../ollama/ollama.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [CodeSuggestionService, OllamaService],
  controllers: [CodeSuggestionController],
})
export class CodeSuggestionModule {}
