import { Module } from '@nestjs/common';
import { SonarqubeService } from './sonarqube.service';
import { SonarqubeController } from './sonarqube.controller';
import { UserService } from 'src/modules/user/user.service';
import { UserModule } from 'src/modules/user/user.module';
import { ProjectModule } from 'src/modules/project/project.module';
import { ProjectService } from 'src/modules/project/project.service';
import { MinioService } from 'src/modules/file/minio/minio.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SonarQubeAnalysisResult } from './sonarqube-analysis-result.entity';
import { Project } from 'src/modules/project/project.entity';
import { OllamaService } from '../ollama/ollama.service';
import { OllamaModule } from '../ollama/ollama.module';
import { HttpModule } from '@nestjs/axios';
import { CodeSuggestionModule } from '../code-suggestion/code-suggestion.module';
import { CodeSuggestionService } from '../code-suggestion/code-suggestion.service';

@Module({
  imports: [
    UserModule,
    ProjectModule,
    OllamaModule,
    HttpModule,
    TypeOrmModule.forFeature([SonarQubeAnalysisResult, Project]),
    CodeSuggestionModule,
  ],
  providers: [
    UserService,
    SonarqubeService,
    ProjectService,
    MinioService,
    OllamaService,
    CodeSuggestionService,
  ],
  controllers: [SonarqubeController],
})
export class SonarqubeModule {}
