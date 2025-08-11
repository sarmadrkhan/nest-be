import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup(body: AuthDto) {
    const hash = await argon.hash(body.password);
    const user = await this.prisma.user.create({
      data: {
        email: body.email,
        hash,
      },
    });
    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, email };
    
    const secret = this.config.get('JWT_SECRET');
    const refreshSecret = this.config.get('JWT_REFRESH_SECRET');

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret,
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: refreshSecret,
    });

    return { accessToken, refreshToken };
  }

  async signin(body: AuthDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { email: body.email },
    });

    const passwordMatches = await argon.verify(user.hash, body.password);
    
    if (!passwordMatches) {
      throw new ForbiddenException('Invalid credentials');
    }

    return this.signToken(user.id, user.email);
  }
}

