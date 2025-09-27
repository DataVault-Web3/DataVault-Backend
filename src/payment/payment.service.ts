import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { X402Service } from './x402.service';
import { PaymentRequestDto } from './dto/payment-request.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private x402Service: X402Service,
  ) {}

  async createPayment(paymentRequestDto: PaymentRequestDto): Promise<PaymentResponseDto> {
    const { userAddress, amount, currency } = paymentRequestDto;
    
    // Create payment request using X402 service
    const paymentResponse = await this.x402Service.createPaymentRequest(
      userAddress,
      amount,
    );

    // Save payment record to database
    const payment = new this.paymentModel({
      userAddress,
      amount: paymentResponse.amount,
      currency: paymentResponse.currency || 'MATIC',
      status: 'pending',
      transactionHash: paymentResponse.transactionHash,
      facilitatorUrl: paymentResponse.paymentUrl,
      expiresAt: paymentResponse.expiresAt,
    });

    await payment.save();

    return {
      paymentUrl: paymentResponse.paymentUrl,
      transactionHash: paymentResponse.transactionHash,
      amount: paymentResponse.amount,
      currency: paymentResponse.currency || 'MATIC',
      expiresAt: paymentResponse.expiresAt,
    };
  }

  async verifyPayment(transactionHash: string): Promise<Payment> {
    const payment = await this.paymentModel.findOne({ transactionHash }).exec();
    
    if (!payment) {
      throw new NotFoundException(`Payment with transaction hash ${transactionHash} not found`);
    }

    // Verify payment using X402 service
    const isVerified = await this.x402Service.verifyPayment(transactionHash);
    
    if (isVerified) {
      // Generate access token
      const accessToken = await this.x402Service.createAccessToken(
        payment.userAddress,
        transactionHash,
      );

      // Update payment status
      payment.status = 'completed';
      payment.accessToken = accessToken;
      payment.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      await payment.save();
    } else {
      payment.status = 'failed';
      await payment.save();
    }

    return payment;
  }

  async getPaymentStatus(transactionHash: string): Promise<any> {
    const payment = await this.paymentModel.findOne({ transactionHash }).exec();
    
    if (!payment) {
      throw new NotFoundException(`Payment with transaction hash ${transactionHash} not found`);
    }

    // Get on-chain status
    const onChainStatus = await this.x402Service.getPaymentStatus(transactionHash);
    
    return {
      ...payment.toObject(),
      onChainStatus,
    };
  }

  async validateAccess(userAddress: string, accessToken: string): Promise<boolean> {
    try {
      // Validate access token
      const tokenData = await this.x402Service.validateAccessToken(accessToken);
      
      if (tokenData.userAddress !== userAddress) {
        return false;
      }

      // Check if payment exists and is completed
      const payment = await this.paymentModel.findOne({
        userAddress,
        transactionHash: tokenData.transactionHash,
        status: 'completed',
      }).exec();

      return !!payment;
    } catch (error) {
      return false;
    }
  }

  async getUserPayments(userAddress: string): Promise<Payment[]> {
    return this.paymentModel.find({ userAddress }).sort({ createdAt: -1 }).exec();
  }
}
