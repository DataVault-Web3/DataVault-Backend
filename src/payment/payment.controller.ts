import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentRequestDto } from './dto/payment-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  createPayment(@Body() paymentRequestDto: PaymentRequestDto) {
    return this.paymentService.createPayment(paymentRequestDto);
  }

  @Post('verify/:transactionHash')
  verifyPayment(@Param('transactionHash') transactionHash: string) {
    return this.paymentService.verifyPayment(transactionHash);
  }

  @Get('status/:transactionHash')
  getPaymentStatus(@Param('transactionHash') transactionHash: string) {
    return this.paymentService.getPaymentStatus(transactionHash);
  }

  @Get('user/:userAddress')
  @UseGuards(JwtAuthGuard)
  getUserPayments(@Param('userAddress') userAddress: string) {
    return this.paymentService.getUserPayments(userAddress);
  }

  @Get('validate')
  validateAccess(
    @Query('userAddress') userAddress: string,
    @Query('accessToken') accessToken: string,
  ) {
    return this.paymentService.validateAccess(userAddress, accessToken);
  }
}
