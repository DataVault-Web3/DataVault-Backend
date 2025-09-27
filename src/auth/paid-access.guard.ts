import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class PaidAccessGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.walletAddress) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasPaidAccess = await this.authService.checkPaidAccess(user.walletAddress);
    
    if (!hasPaidAccess) {
      throw new ForbiddenException('Paid access required. Please complete payment to access this resource.');
    }

    return true;
  }
}
