import { Module } from '@nestjs/common';
import { OauthAccountInfoService } from './oauth-account-info.service';

@Module({
  providers: [OauthAccountInfoService],
})
export class OauthAccountInfoModule {}
