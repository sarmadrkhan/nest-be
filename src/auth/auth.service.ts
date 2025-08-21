import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPair, RefreshPayload } from './type';
import { ERROR_MESSAGES, SEVEN_DAYS } from 'src/common/constants';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async issueTokens(
    userId: string,
    email: string,
  ): Promise<JwtPair> {    
    const accessSecret = this.config.get('JWT_ACCESS_SECRET');
    const refreshSecret = this.config.get('JWT_REFRESH_SECRET');
    const accessTtl = this.config.get('JWT_ACCESS_TTL');
    const refreshTtl = this.config.get('JWT_REFRESH_TTL');

    if (!accessSecret || !refreshSecret) {
      throw new Error(ERROR_MESSAGES.JWT.MISSING_SECRET);
    }
     if (!accessTtl || !refreshTtl) {
      throw new Error(ERROR_MESSAGES.JWT.MISSING_TTL);
    }

    const expiresAt = new Date(Date.now() + SEVEN_DAYS);
    const refreshRow = await this.prisma.refreshToken.create({
      data: {
        userId,
        expiresAt,
        tokenHash: 'placeholder'
      },
    });

    const payload = {sub: userId, email, jti: refreshRow.id};
    const accessToken = await this.jwt.signAsync(payload, {
      secret: accessSecret,
      expiresIn: accessTtl,
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshTtl,
    });

    const tokenHash = await argon.hash(refreshToken);
    await this.prisma.refreshToken.update({
      where: { id: refreshRow.id },
      data: { tokenHash },
    });
    
    return { accessToken, refreshToken };
  }


  async signup(body: AuthDto): Promise<JwtPair> {
    const hash = await argon.hash(body.password);
    const user = await this.prisma.user.create({
      data: {
        email: body.email,
        hash,
      },
    });
    return this.issueTokens(user.id, user.email);
  }

  async signin(body: AuthDto): Promise<JwtPair> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { email: body.email },
    });

    const passwordMatches = await argon.verify(user.hash, body.password);
    
    if (!passwordMatches) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    return this.issueTokens(user.id, user.email);
  }

  async refreshTokens(payload: RefreshPayload): Promise<JwtPair> {
    
    if (!payload.refreshToken) throw new UnauthorizedException(ERROR_MESSAGES.REFRESH_TOKEN.MISSING);

    const dbRow = await this.prisma.refreshToken.findUniqueOrThrow({
      where: { id: payload.jti }
    });
    
    if (!dbRow || dbRow.userId !== payload.sub) throw new UnauthorizedException(ERROR_MESSAGES.REFRESH_TOKEN.INVALID);
    if (dbRow.revokedAt) throw new UnauthorizedException(ERROR_MESSAGES.REFRESH_TOKEN.REVOKED);
    if (dbRow.expiresAt < new Date()) throw new UnauthorizedException(ERROR_MESSAGES.REFRESH_TOKEN.EXPIRED);

    const matches = await argon.verify(dbRow.tokenHash, payload.refreshToken);
    if (!matches) throw new UnauthorizedException(ERROR_MESSAGES.REFRESH_TOKEN.MISMATCH);

    // Rotate: Revoke old token and issue new ones
    const newJwtPair = await this.issueTokens(payload.sub, payload.email);
    
    // Mark old token as revoked and store new JWT ID
    const newJwt = await this.jwt.decode(newJwtPair.refreshToken) as {jti?: string} | null; // decoded token will be an object that may have a jti property
    const newJti = newJwt?.jti as string | undefined;

    await this.prisma.refreshToken.update({
      where: { id: dbRow.id },
      data: { revokedAt: new Date(), replacedByTokenId: newJti },
    });

    return newJwtPair;
  }

  async logoutCurrent(jti: string, userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { id: jti, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }
}

