import { IsString, IsEmail } from 'class-validator';

export class LoginDto {
  @IsString()
  walletAddress: string;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  signature: string;
}
