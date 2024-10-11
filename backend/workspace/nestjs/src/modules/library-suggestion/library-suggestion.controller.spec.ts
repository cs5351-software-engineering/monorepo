import { Test, TestingModule } from '@nestjs/testing';
import { LibrarySuggestionController } from './library-suggestion.controller';

describe('LibrarySuggestionController', () => {
  let controller: LibrarySuggestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LibrarySuggestionController],
    }).compile();

    controller = module.get<LibrarySuggestionController>(
      LibrarySuggestionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
