import { Test, TestingModule } from '@nestjs/testing';
import { ProjectVersionService } from './project-version.service';

describe('ProjectVersionService', () => {
  let service: ProjectVersionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectVersionService],
    }).compile();

    service = module.get<ProjectVersionService>(ProjectVersionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
