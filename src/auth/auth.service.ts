import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { User, UserDocument } from './schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private paymentService: PaymentService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<User> {
    const { walletAddress, username, email, signature } = loginDto;

    // Verify signature (simplified - in production, use proper message verification)
    const isValidSignature = await this.verifySignature(walletAddress, signature);
    
    if (!isValidSignature) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Find or create user
    let user = await this.userModel.findOne({ walletAddress }).exec();
    
    if (!user) {
      user = new this.userModel({
        walletAddress,
        username,
        email,
        hasPaidAccess: false,
        lastLoginAt: new Date(),
      });
      await user.save();
    } else {
      user.lastLoginAt = new Date();
      await user.save();
    }

    return user;
  }

  async login(user: User) {
    const payload = { 
      sub: (user as any)._id, 
      walletAddress: user.walletAddress,
      hasPaidAccess: user.hasPaidAccess,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: (user as any)._id,
        walletAddress: user.walletAddress,
        username: user.username,
        email: user.email,
        hasPaidAccess: user.hasPaidAccess,
      },
    };
  }

  async grantPaidAccess(userAddress: string, accessToken: string): Promise<void> {
    const user = await this.userModel.findOne({ walletAddress: userAddress }).exec();
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Validate access token with payment service
    const isValidAccess = await this.paymentService.validateAccess(userAddress, accessToken);
    
    if (isValidAccess) {
      user.hasPaidAccess = true;
      user.accessToken = accessToken;
      user.accessExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await user.save();
    } else {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  async revokePaidAccess(userAddress: string): Promise<void> {
    const user = await this.userModel.findOne({ walletAddress: userAddress }).exec();
    
    if (user) {
      user.hasPaidAccess = false;
      user.accessToken = undefined;
      user.accessExpiresAt = undefined;
      await user.save();
    }
  }

  async checkPaidAccess(userAddress: string): Promise<boolean> {
    const user = await this.userModel.findOne({ walletAddress: userAddress }).exec();
    
    if (!user || !user.hasPaidAccess) {
      return false;
    }

    // Check if access has expired
    if (user.accessExpiresAt && user.accessExpiresAt < new Date()) {
      await this.revokePaidAccess(userAddress);
      return false;
    }

    return true;
  }

  private async verifySignature(walletAddress: string, signature: string): Promise<boolean> {
    try {
      // In a real implementation, you would verify the signature against a message
      // For now, we'll do a basic validation
      const recoveredAddress = ethers.verifyMessage('Login to Datasets API', signature);
      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      return false;
    }
  }
}
