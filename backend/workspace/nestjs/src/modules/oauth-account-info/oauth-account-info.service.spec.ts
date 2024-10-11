import { Test, TestingModule } from '@nestjs/testing';
import { OauthAccountInfoService } from './oauth-account-info.service';

describe('OauthAccountInfoService', () => {
  let service: OauthAccountInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OauthAccountInfoService],
    }).compile();

    service = module.get<OauthAccountInfoService>(OauthAccountInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
