import { Test, TestingModule } from '@nestjs/testing';
import { ScanSuggestionController } from './scan-suggestion.controller';

describe('ScanSuggestionController', () => {
  let controller: ScanSuggestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScanSuggestionController],
    }).compile();

    controller = module.get<ScanSuggestionController>(ScanSuggestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
