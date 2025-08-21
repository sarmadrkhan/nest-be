import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { CRON_TIMERS } from '../constants';

@Injectable()
export class CleanupService {
  constructor(private prisma: PrismaService) {}

  @Cron(CRON_TIMERS.CLEANUP_TOKENS)
  async cleanupTokens() {
    await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { revokedAt: { not: null } },
          { expiresAt: { lt: new Date() } },
        ],
      },
    });
    console.log('Cleaned up old refresh tokens');
  }
}
