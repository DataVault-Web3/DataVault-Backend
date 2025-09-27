export class PaymentResponseDto {
  paymentUrl: string;
  transactionHash: string;
  amount: string;
  currency: string;
  expiresAt: Date;
}
