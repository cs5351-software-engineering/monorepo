import { Module } from '@nestjs/common';
import { ScanSuggestionController } from './scan-suggestion.controller';
import { ScanSuggestionService } from './scan-suggestion.service';

@Module({
  controllers: [ScanSuggestionController],
  providers: [ScanSuggestionService],
})
export class ScanSuggestionModule {}
