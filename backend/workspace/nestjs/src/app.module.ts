import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { HealthModule } from './modules/health/health.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoreModule } from './core/core.module';
import { TokenModule } from './modules/token/token.module';
import { OauthAccountInfoModule } from './modules/oauth-account-info/oauth-account-info.module';
import { AuthorizedProjectModule } from './modules/authorized-project/authorized-project.module';
import { ProjectModule } from './modules/project/project.module';
import { ProjectVersionModule } from './modules/project-version/project-version.module';
import { ScanModule } from './modules/scan/scan.module';
import { ScanSuggestionModule } from './modules/scan-suggestion/scan-suggestion.module';
import { MigrationModule } from './modules/migration/migration.module';
import { LibrarySuggestionModule } from './modules/library-suggestion/library-suggestion.module';
import databaseConfig from './config/database.config';
import { OllamaModule } from './modules/ollama/ollama.module';
import { FileModule } from './modules/file/file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
      inject: [ConfigService],
    }),
    // TypeOrmModule.forRoot({
    //   ...databaseConfig,
    //   entities: [User, Token, OauthAccountInfoModule],
    // }),
    UserModule,
    AuthModule,
    HealthModule,
    CoreModule,
    TokenModule,
    OauthAccountInfoModule,
    AuthorizedProjectModule,
    ProjectModule,
    ProjectVersionModule,
    ScanModule,
    ScanSuggestionModule,
    MigrationModule,
    LibrarySuggestionModule,
    OllamaModule,
    FileModule,
  ],
})
export class AppModule {}
