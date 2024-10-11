import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { WHITELIST_ROUTES } from '../config/security.config'; // Import your whitelist

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true, // This allows us to pass the request to the validate method
    });
  }

  async validate(request: any, payload: any) {
    const isWhitelisted = WHITELIST_ROUTES.some((route) =>
      request.url.startsWith(route),
    );
    if (isWhitelisted) {
      return true;
    }

    return { userId: payload.sub, email: payload.email };
  }
}
