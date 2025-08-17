import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('users')
export class UserController {
  
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch('update')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile() {
    return { message: 'Profile updated successfully' };
  }
}
