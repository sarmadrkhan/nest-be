import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const jwtSecret = config.get('JWT_ACCESS_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_ACCESS_SECRET is not defined in the .env file');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { sub: string; email: string, jti: string }) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: payload.sub },
    });

    const { hash, ...safeUser } = user;
    return {...safeUser, sub: payload.sub, email: payload.email, jti: payload.jti   };
  }
}
