import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ProofService } from '../services/proof.service';
import { ProofDataDto } from '../dto/proof-data.dto';

@Controller('api/proof')
export class ProofController {
  private readonly logger = new Logger(ProofController.name);

  constructor(private readonly proofService: ProofService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async storeProofData(@Body() proofDataDto: ProofDataDto) {
    this.logger.log('Received proof data from Chrome extension');
    
    try {
      const result = await this.proofService.storeProofData(proofDataDto);
      
      this.logger.log(`Proof stored successfully: ${result.proofId}`);
      this.logger.log(`Quilt ID: ${result.quiltId}`);
      
      return {
        success: true,
        proofId: result.proofId,
        quiltId: result.quiltId,
        message: result.message,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error storing proof data:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get(':proofId')
  async getProofById(@Param('proofId') proofId: string) {
    try {
      const proof = await this.proofService.getProofById(proofId);
      return {
        success: true,
        proof,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error retrieving proof ${proofId}:`, error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get(':proofId/orders')
  async getOrdersByProofId(@Param('proofId') proofId: string) {
    try {
      const orders = await this.proofService.getOrdersByProofId(proofId);
      return {
        success: true,
        orders,
        count: orders.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error retrieving orders for proof ${proofId}:`, error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('quilt/:quiltId')
  async getCombinedData(@Param('quiltId') quiltId: string) {
    try {
      const data = await this.proofService.getCombinedData(quiltId);
      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error retrieving combined data for quilt ${quiltId}:`, error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('user/:userIdSeed')
  async getProofsByUser(@Param('userIdSeed') userIdSeed: string) {
    try {
      const [proofs, orders] = await Promise.all([
        this.proofService.getProofsByUser(userIdSeed),
        this.proofService.getOrdersByUser(userIdSeed)
      ]);
      
      return {
        success: true,
        user: {
          userIdSeed,
          proofs,
          orders,
          proofCount: proofs.length,
          orderCount: orders.length
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error retrieving data for user ${userIdSeed}:`, error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('stats/overview')
  async getProofStats() {
    try {
      const stats = await this.proofService.getProofStats();
      return {
        success: true,
        stats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error retrieving proof stats:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Post(':proofId/process')
  @HttpCode(HttpStatus.OK)
  async markProofAsProcessed(@Param('proofId') proofId: string) {
    try {
      await this.proofService.markProofAsProcessed(proofId);
      return {
        success: true,
        message: `Proof ${proofId} marked as processed`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error marking proof ${proofId} as processed:`, error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
