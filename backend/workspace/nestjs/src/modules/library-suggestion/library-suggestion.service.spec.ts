import { Test, TestingModule } from '@nestjs/testing';
import { LibrarySuggestionService } from './library-suggestion.service';

describe('LibrarySuggestionService', () => {
  let service: LibrarySuggestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LibrarySuggestionService],
    }).compile();

    service = module.get<LibrarySuggestionService>(LibrarySuggestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
