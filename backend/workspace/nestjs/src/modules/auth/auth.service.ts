import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenExchangeDto } from 'src/common/dto/token-exchange.dto';
import { Repository } from 'typeorm';
import { OAuthAccountInfo } from '../oauth-account-info/oauth-account-info.entity';
import { Token } from '../token/token.entity';
import { User } from '../user/user.entity';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    @InjectRepository(OAuthAccountInfo)
    private oauthAccountInfoRepository: Repository<OAuthAccountInfo>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async findOrCreateUser(profile: any, provider: string): Promise<User> {
    // Attempt to retrieve user and their OAuth info simultaneously
    let user = await this.userRepository.findOne({
      where: { email: profile.email },
      relations: ['oauthAccountInfo'], // Assuming 'oauthAccountInfo' is the correct relation name
    });

    if (!user) {
      // Create user and OAuthAccountInfo if not found
      user = await this.createUser(profile, provider);
    } else {
      // If user exists, update user and check/create OAuth info
      user = await this.updateUser(user, profile, provider);

      let oauthAccountInfo = await this.oauthAccountInfoRepository.findOne({
        where: { oauthProvider: provider, memberId: profile.name },
      });

      if (!oauthAccountInfo) {
        oauthAccountInfo = new OAuthAccountInfo();
        oauthAccountInfo.oauthProvider = provider;
        oauthAccountInfo.memberId = profile.name;
        oauthAccountInfo.user = user;
        await this.oauthAccountInfoRepository.save(oauthAccountInfo);
      }
    }

    return user;
  }

  private async createUser(profile: any, provider: string): Promise<User> {
    const user = new User(); // Set user properties based on profile
    user.email = profile.email;
    user.userDisplayName = profile.name;

    const savedUser = await this.userRepository.save(user);

    const oauthAccountInfo = new OAuthAccountInfo();
    oauthAccountInfo.oauthProvider = provider;
    oauthAccountInfo.memberId = profile.name;
    oauthAccountInfo.user = savedUser;

    await this.oauthAccountInfoRepository.save(oauthAccountInfo);

    return savedUser;
  }

  private async updateUser(
    user: User,
    profile: any,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    provider: string,
  ): Promise<User> {
    // Update user properties
    user.email = profile.email; // Example property update
    user.userDisplayName = profile.name;

    return await this.userRepository.save(user);
  }

  async createToken(user: User): Promise<Token> {
    let token = await this.tokenRepository.findOne({ where: { user: user } });

    if (!token) {
      token = new Token();
      token.user = user;
    }

    token.accessToken = this.generateAccessToken(user);
    token.refreshToken = this.generateRefreshToken(user);

    return this.tokenRepository.save(token);
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    console.log('AuthService: Attempting to refresh token');
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      console.log('AuthService: Refresh token payload:', payload);

      const token = await this.tokenRepository.findOne({
        where: { refreshToken: refreshToken },
        relations: ['user'],
      });
      console.log('AuthService: Found token in database:', token);

      if (!token) {
        console.log('AuthService: Token not found in database');
        throw new UnauthorizedException('Invalid refresh token');
      }

      const now = new Date();
      const expirationDate = new Date(payload.exp * 1000); // Convert exp to milliseconds
      console.log('AuthService: Current time:', now);
      console.log('AuthService: Token expire time:', expirationDate);

      if (expirationDate < now) {
        console.log('AuthService: Token has expired');
        throw new UnauthorizedException('Refresh token has expired');
      }

      const user = token.user;
      console.log('AuthService: User associated with token:', user);

      const newAccessToken = this.generateAccessToken(user);

      token.accessToken = newAccessToken;
      await this.tokenRepository.save(token);
      console.log('AuthService: New tokens generated and saved');

      return {
        access_token: newAccessToken,
      };
    } catch (error) {
      console.error('AuthService: Refresh token error:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateAccessToken(user: User): string {
    const payload = { sub: user.id, email: user.email, type: 'access' };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION'),
    });
  }

  private generateRefreshToken(user: User): string {
    const payload = { sub: user.id, type: 'refresh' };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
    });
  }

  async exchangeToken(tokenRequest: TokenExchangeDto) {
    // Verify the code and code verifier
    const tokenResponse = await this.verifyGoogleToken(tokenRequest);

    // Create or update user based on the OAuth provider's response
    const user = await this.findOrCreateUser(tokenResponse, 'google');

    // Generate JWT tokens
    const token = await this.createToken(user);

    return {
      access_token: token.accessToken,
      refreshToken: token.refreshToken,
    };
  }

  private async verifyGoogleToken(tokenRequest: TokenExchangeDto) {
    const client = new OAuth2Client(tokenRequest.clientId);

    try {
      const ticket = await client.verifyIdToken({
        idToken: tokenRequest.credential,
        audience: tokenRequest.clientId,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new HttpException(
          'Invalid token payload',
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log(payload);

      return payload;
    } catch (error) {
      console.error('Google token verification error:', error);
      throw new HttpException(
        'Failed to verify Google token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
