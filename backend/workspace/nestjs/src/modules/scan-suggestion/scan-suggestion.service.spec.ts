import { Test, TestingModule } from '@nestjs/testing';
import { ScanSuggestionService } from './scan-suggestion.service';

describe('ScanSuggestionService', () => {
  let service: ScanSuggestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScanSuggestionService],
    }).compile();

    service = module.get<ScanSuggestionService>(ScanSuggestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
