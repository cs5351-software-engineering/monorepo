import { Test, TestingModule } from '@nestjs/testing';
import { CodeSuggestionController } from './code-suggestion.controller';

describe('CodeSuggestionController', () => {
  let controller: CodeSuggestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CodeSuggestionController],
    }).compile();

    controller = module.get<CodeSuggestionController>(CodeSuggestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
