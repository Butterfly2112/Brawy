import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw new HttpException(
        err?.message ?? info?.message ?? 'Invalid refresh token',
        HttpStatus.FORBIDDEN,
      );
    }
    return user;
  }
}
