import { Module } from '@nestjs/common';
import { SonarqubeService } from './sonarqube.service';
import { SonarqubeController } from './sonarqube.controller';
import { UserService } from 'src/modules/user/user.service';
import { UserModule } from 'src/modules/user/user.module';

@Module({
  imports: [UserModule],
  providers: [UserService, SonarqubeService],
  controllers: [SonarqubeController],
})
export class SonarqubeModule {}
