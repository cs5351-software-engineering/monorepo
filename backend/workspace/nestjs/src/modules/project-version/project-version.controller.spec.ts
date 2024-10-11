import { Test, TestingModule } from '@nestjs/testing';
import { ProjectVersionController } from './project-version.controller';

describe('ProjectVersionController', () => {
  let controller: ProjectVersionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectVersionController],
    }).compile();

    controller = module.get<ProjectVersionController>(ProjectVersionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
