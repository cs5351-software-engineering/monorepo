import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizedProjectController } from './authorized-project.controller';

describe('AuthorizedProjectController', () => {
  let controller: AuthorizedProjectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorizedProjectController],
    }).compile();

    controller = module.get<AuthorizedProjectController>(
      AuthorizedProjectController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
