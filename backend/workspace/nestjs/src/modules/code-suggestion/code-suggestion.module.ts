import { Module } from '@nestjs/common';
import { CodeSuggestionService } from './code-suggestion.service';
import { CodeSuggestionController } from './code-suggestion.controller';
import { OllamaService } from '../ollama/ollama.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MinioService } from 'src/modules/file/minio/minio.service';
import { ProjectModule } from '../project/project.module';
import { OllamaModule } from '../ollama/ollama.module';

@Module({
  imports: [ConfigModule, HttpModule, OllamaModule, ProjectModule],
  providers: [OllamaService, MinioService, CodeSuggestionService],
  controllers: [CodeSuggestionController],
})
export class CodeSuggestionModule {}
