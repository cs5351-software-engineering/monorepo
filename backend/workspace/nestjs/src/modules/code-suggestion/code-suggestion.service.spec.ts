import { Test, TestingModule } from '@nestjs/testing';
import { CodeSuggestionService } from './code-suggestion.service';

describe('CodeSuggestionService', () => {
  let service: CodeSuggestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CodeSuggestionService],
    }).compile();

    service = module.get<CodeSuggestionService>(CodeSuggestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
