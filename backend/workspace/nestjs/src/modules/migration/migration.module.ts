import { Module } from '@nestjs/common';
import { MigrationService } from './migration.service';
import { MigrationController } from './migration.controller';

@Module({
  providers: [MigrationService],
  controllers: [MigrationController],
})
export class MigrationModule {}
