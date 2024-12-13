import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { IsEmptyTokenExceotion } from 'src/exception/custom/is-empty-token.exception';
import { IsNotBearerTokenException } from 'src/exception/custom/is-not-bearer-token.exception';
import { TokenInterface } from '../interface/token.interface';
import { TokenExpiredException } from 'src/exception/custom/token-expired.exception';
import { IsNotAccessTokenException } from 'src/exception/custom/is-not-access-token.exception';
import { Reflector } from '@nestjs/core';
import { Public } from '../decorator/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const isPublic = this.reflector.get(Public, context.getHandler());
    if (isPublic) {
      return true;
    }

    try {
      const rawToken = req.headers.authorization;
      if (!rawToken) {
        throw new IsEmptyTokenExceotion();
      }

      const [bearer, token] = rawToken.split(' ');

      if (bearer !== 'Bearer') {
        throw new IsNotBearerTokenException();
      }

      const accessToken = await this.jwtService.decode<TokenInterface>(token);
      if (accessToken.isRefreshToken) {
        throw new IsNotAccessTokenException();
      }

      const passedToken = await this.jwtService.verifyAsync<TokenInterface>(
        token,
        {
          secret: process.env.JWT_SECRET,
        },
      );

      req.user = passedToken.email;
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new TokenExpiredException();
      }

      throw err;
    }

    return true;
  }
}
