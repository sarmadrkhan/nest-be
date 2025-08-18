import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CleanupService {
  constructor(private prisma: PrismaService) {}

  @Cron('0 * * * * ') // Runs every hour
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
