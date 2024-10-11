import { Module } from '@nestjs/common';
import { LibrarySuggestionController } from './library-suggestion.controller';
import { LibrarySuggestionService } from './library-suggestion.service';

@Module({
  controllers: [LibrarySuggestionController],
  providers: [LibrarySuggestionService],
})
export class LibrarySuggestionModule {}
