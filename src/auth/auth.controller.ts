import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtGuard, JwtRefreshGuard } from './guard';
import { GetUser } from './decorator';
import { RefreshPayload } from './type';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiBody({ type: AuthDto })
  async signup(@Body() body: AuthDto) {
    return this.authService.signup(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  @ApiBody({ type: AuthDto })
  async signin(@Body() body: AuthDto) {
    return this.authService.signin(body);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiBearerAuth()
  async refresh(@GetUser() payload: RefreshPayload) {
    return this.authService.refreshTokens(payload);

  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post('logout')
  async logout(@GetUser('sub') userId: string, @GetUser('jti') jti: string) {
    return this.authService.logoutCurrent(jti, userId);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post('logout-all')
  async logoutAll(@GetUser('sub') userId: string) {
    return this.authService.logoutAll(userId);
  }
}
