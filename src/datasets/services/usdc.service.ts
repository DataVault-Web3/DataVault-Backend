import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';

// ERC20 ABI for USDC token transfers
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
];

// USDC contract address on Polygon Amoy testnet
const USDC_CONTRACT_ADDRESS = '0x41E94Eb019C0762f9BfF6882f959d4F5fC90A545';

// Polygon Amoy testnet RPC URL
const POLYGON_AMOY_RPC_URL = process.env.POLYGON_RPC

@Injectable()
export class UsdcService {
  private readonly logger = new Logger(UsdcService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private usdcContract: ethers.Contract;

  constructor() {
    // Initialize provider and wallet
    this.provider = new ethers.JsonRpcProvider(POLYGON_AMOY_RPC_URL);

    // Get private key from environment variable
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable is required for USDC transfers');
    }

    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, ERC20_ABI, this.wallet);

    this.logger.log('USDC Service initialized for Polygon Amoy testnet');
  }

  /**
   * Generate a random Ethereum address
   */
  private generateRandomAddress(): string {
    const randomWallet = ethers.Wallet.createRandom();
    return randomWallet.address;
  }

  /**
   * Convert USDC amount to wei (USDC has 6 decimals)
   */
  private parseUsdcAmount(amount: number): bigint {
    // USDC has 6 decimals, so multiply by 10^6
    return ethers.parseUnits(amount.toString(), 6);
  }

  /**
   * Format USDC amount from wei to readable format
   */
  private formatUsdcAmount(amount: bigint): string {
    return ethers.formatUnits(amount, 6);
  }

  /**
   * Get USDC balance of the wallet
   */
  async getUsdcBalance(): Promise<string> {
    try {
      const balance = await this.usdcContract.balanceOf(this.wallet.address);
      return this.formatUsdcAmount(balance);
    } catch (error) {
      this.logger.error('Error getting USDC balance:', error);
      throw error;
    }
  }

  /**
   * Send USDC to a random address
   * @param amount - Amount in USDC (e.g., 0.1)
   * @returns Transaction hash and recipient address
   */
  async sendUsdcToAddress(amount: number, recipientAddress: string): Promise<{
    transactionHash: string;
    amount: string;
  }> {
    try {
      this.logger.log(`Sending ${amount} USDC to random address...`);

      // Generate random recipient address
      this.logger.log(`Recipient address: ${recipientAddress}`);

      // Convert amount to wei
      const amountInWei = this.parseUsdcAmount(amount);
      this.logger.log(`Amount in wei: ${amountInWei.toString()}`);

      // Check wallet balance before transfer
      const balance = await this.getUsdcBalance();
      this.logger.log(`Current USDC balance: ${balance}`);

      // Perform the transfer
      const tx = await this.usdcContract.transfer(recipientAddress, amountInWei);
      this.logger.log(`Transaction submitted: ${tx.hash}`);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      this.logger.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      return {
        transactionHash: tx.hash,
        amount: amount.toString()
      };

    } catch (error) {
      this.logger.error('Error sending USDC:', error);
      throw error;
    }
  }

  /**
   * Send USDC based on number of orders (0.1 USDC per order)
   * @param orderCount - Number of orders
   * @returns Transaction details
   */
  async sendUsdcForOrders(orderCount: number): Promise<{
    transactionHash: string;
    recipientAddress: string;
    amount: string;
    orderCount: number;
  }> {
    const amount = orderCount * 0.1;
    this.logger.log(`Sending USDC for ${orderCount} orders (${amount} USDC total)`);

    const result = await this.sendUsdcToAddress(amount, '0x3B694d634981Ace4B64a27c48bffe19f1447779B');

    return {
      ...result,
      recipientAddress: '0x3B694d634981Ace4B64a27c48bffe19f1447779B',
      orderCount
    };
  }

  /**
   * Get USDC contract information
   */
  async getContractInfo(): Promise<{
    address: string;
    name: string;
    symbol: string;
    decimals: number;
  }> {
    try {
      const [name, symbol, decimals] = await Promise.all([
        this.usdcContract.name(),
        this.usdcContract.symbol(),
        this.usdcContract.decimals()
      ]);

      return {
        address: USDC_CONTRACT_ADDRESS,
        name,
        symbol,
        decimals: Number(decimals)
      };
    } catch (error) {
      this.logger.error('Error getting contract info:', error);
      throw error;
    }
  }
}
