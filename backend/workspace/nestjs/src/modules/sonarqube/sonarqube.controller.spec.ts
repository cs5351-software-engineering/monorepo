import { Test, TestingModule } from '@nestjs/testing';
import { SonarqubeController } from './sonarqube.controller';
import { UserService } from '../user/user.service';
import { SonarqubeService } from './sonarqube.service';
import { UserModule } from '../user/user.module';

describe('SonarqubeController', () => {
  let controller: SonarqubeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
      controllers: [SonarqubeController],
      providers: [UserService, SonarqubeService],
    }).compile();

    controller = module.get<SonarqubeController>(SonarqubeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
