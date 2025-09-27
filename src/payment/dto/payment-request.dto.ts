import { IsString, IsNumber, IsOptional } from 'class-validator';

export class PaymentRequestDto {
  @IsString()
  userAddress: string;

  @IsString()
  @IsOptional()
  amount?: string;

  @IsString()
  @IsOptional()
  currency?: string;
}
