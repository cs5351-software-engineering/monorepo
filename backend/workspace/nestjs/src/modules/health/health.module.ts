import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TerminusModule, AuthModule],
  controllers: [HealthController],
})
export class HealthModule {}
