import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WHITELIST_ROUTES } from 'src/config/security.config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const isWhitelisted = WHITELIST_ROUTES.some((route) =>
      request.url.startsWith(route),
    );

    if (isWhitelisted) {
      return true; // Allow access to whitelisted routes without token
    }

    return super.canActivate(context); // Use the JWT strategy for other routes
  }
}
