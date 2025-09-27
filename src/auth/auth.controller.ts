import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto);
    return this.authService.login(user);
  }

  @Post('grant-access')
  @UseGuards(JwtAuthGuard)
  async grantPaidAccess(
    @Body('userAddress') userAddress: string,
    @Body('accessToken') accessToken: string,
  ) {
    await this.authService.grantPaidAccess(userAddress, accessToken);
    return { message: 'Paid access granted successfully' };
  }

  @Post('revoke-access')
  @UseGuards(JwtAuthGuard)
  async revokePaidAccess(@Body('userAddress') userAddress: string) {
    await this.authService.revokePaidAccess(userAddress);
    return { message: 'Paid access revoked successfully' };
  }

  @Get('check-access')
  @UseGuards(JwtAuthGuard)
  async checkPaidAccess(@Query('userAddress') userAddress: string) {
    const hasAccess = await this.authService.checkPaidAccess(userAddress);
    return { hasPaidAccess: hasAccess };
  }
}
