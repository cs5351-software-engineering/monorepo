import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizedProjectService } from './authorized-project.service';

describe('AuthorizedProjectService', () => {
  let service: AuthorizedProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorizedProjectService],
    }).compile();

    service = module.get<AuthorizedProjectService>(AuthorizedProjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
