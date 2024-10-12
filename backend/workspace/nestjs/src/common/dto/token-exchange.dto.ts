import { ApiProperty } from '@nestjs/swagger';

export class TokenExchangeDto {
  @ApiProperty({ description: 'Code' })
  code: string;

  @ApiProperty({ description: 'Code Verifier' })
  code_verifier: string;

  @ApiProperty({ description: 'Redirect URL' })
  redirect_uri: string;
}
