import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RefreshPayload } from '../type';
import { ERROR_MESSAGES } from 'src/common/constants';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    const refreshSecret = config.get('JWT_REFRESH_SECRET');

    if (!refreshSecret) {
      throw new Error(ERROR_MESSAGES.JWT.MISSING_SECRET);
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: refreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: RefreshPayload) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) throw new Error(ERROR_MESSAGES.REFRESH_TOKEN.MISSING);

    return {...payload, refreshToken: token};
  }
}