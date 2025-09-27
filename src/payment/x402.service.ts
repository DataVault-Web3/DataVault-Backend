import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import axios from 'axios';

@Injectable()
export class X402Service {
  private readonly logger = new Logger(X402Service.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor(private configService: ConfigService) {
    // Initialize provider and wallet
    const rpcUrl = this.configService.get('POLYGON_RPC_URL', 'https://rpc-amoy.polygon.technology');
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    const privateKey = this.configService.get('X402_PRIVATE_KEY');
    if (privateKey) {
      this.wallet = new ethers.Wallet(privateKey, this.provider);
    }
  }

  async createPaymentRequest(userAddress: string, amount?: string): Promise<any> {
    try {
      const defaultAmount = this.configService.get('X402_AMOUNT', '1000000000000000000'); // 1 MATIC in wei
      const paymentAmount = amount || defaultAmount;
      
      const facilitatorUrl = this.configService.get('X402_FACILITATOR_URL');
      
      if (!facilitatorUrl) {
        throw new Error('X402_FACILITATOR_URL not configured');
      }

      // Create payment request to facilitator
      const paymentRequest = {
        userAddress,
        amount: paymentAmount,
        currency: 'MATIC',
        facilitatorUrl,
        timestamp: Date.now(),
      };

      this.logger.log(`Creating payment request for ${userAddress}: ${paymentAmount} wei`);
      
      // In a real implementation, you would send this to the X402 facilitator
      // For now, we'll simulate the response
      const response = {
        paymentUrl: `${facilitatorUrl}/pay?address=${userAddress}&amount=${paymentAmount}`,
        transactionHash: this.generateMockTxHash(),
        amount: paymentAmount,
        currency: 'MATIC',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      };

      return response;
    } catch (error) {
      this.logger.error('Error creating payment request:', error);
      throw error;
    }
  }

  async verifyPayment(transactionHash: string): Promise<boolean> {
    try {
      // In a real implementation, you would verify the transaction on-chain
      // For now, we'll simulate verification
      const tx = await this.provider.getTransaction(transactionHash);
      
      if (!tx) {
        return false;
      }

      // Check if transaction is confirmed
      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      return receipt && receipt.status === 1;
    } catch (error) {
      this.logger.error('Error verifying payment:', error);
      return false;
    }
  }

  async getPaymentStatus(transactionHash: string): Promise<any> {
    try {
      const tx = await this.provider.getTransaction(transactionHash);
      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      
      return {
        hash: transactionHash,
        status: receipt ? (receipt.status === 1 ? 'confirmed' : 'failed') : 'pending',
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
        confirmations: receipt ? await receipt.confirmations() : 0,
      };
    } catch (error) {
      this.logger.error('Error getting payment status:', error);
      throw error;
    }
  }

  private generateMockTxHash(): string {
    return '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  async createAccessToken(userAddress: string, transactionHash: string): Promise<string> {
    // In a real implementation, you would create a JWT token or similar
    // For now, we'll create a simple access token
    const tokenData = {
      userAddress,
      transactionHash,
      issuedAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    };

    return Buffer.from(JSON.stringify(tokenData)).toString('base64');
  }

  async validateAccessToken(accessToken: string): Promise<any> {
    try {
      const tokenData = JSON.parse(Buffer.from(accessToken, 'base64').toString());
      
      if (tokenData.expiresAt < Date.now()) {
        throw new Error('Access token expired');
      }

      return tokenData;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }
}
