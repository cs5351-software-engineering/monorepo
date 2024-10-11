import { ApiProperty } from '@nestjs/swagger';

export class TokenExchangeDto {
  @ApiProperty({ description: 'The new access token' })
  clientId: string;

  @ApiProperty({ description: 'The new refresh token' })
  credential: string;
}
