import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RefreshTokenDto } from 'src/common/dto/refresh-token.dto';
import { TokenExchangeDto } from 'src/common/dto/token-exchange.dto';
import { AuthService } from './auth.service';

// swagger: add to "auth" tag
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange OAuth token for access token' })
  @ApiResponse({
    status: 200,
    description: 'Token exchanged successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: TokenExchangeDto })
  async exchangeToken(@Body() tokenRequest: TokenExchangeDto) {
    return this.authService.exchangeToken(tokenRequest);
  }

  @Post('refreshAccessToken')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'New access token generated successfully',
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    return this.authService.refreshToken(refreshToken);
  }
}
