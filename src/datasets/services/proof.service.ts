import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Proof, ProofDocument } from '../schemas/proof.schema';
import { Order, OrderDocument } from '../schemas/order.schema';
import { ProofDataDto } from '../dto/proof-data.dto';
import { WalrusService } from './walrus.service';

@Injectable()
export class ProofService {
  private readonly logger = new Logger(ProofService.name);

  constructor(
    @InjectModel(Proof.name) private proofModel: Model<ProofDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private walrusService: WalrusService,
  ) {}

  /**
   * Store proof data and orders in MongoDB and Walrus
   */
  async storeProofData(proofDataDto: ProofDataDto): Promise<{ 
    proofId: string; 
    quiltId: string; 
    message: string 
  }> {
    try {
      this.logger.log('Storing proof data and orders...');

      // Store proof in MongoDB
      const proof = new this.proofModel({
        userIdSeed: proofDataDto.userIdSeed,
        commitment: proofDataDto.commitment,
        objectHash: proofDataDto.objectHash,
        merkleRoot: proofDataDto.merkleRoot,
        nullifierHash: proofDataDto.nullifierHash,
        solidityProof: proofDataDto.solidityProof,
        groupId: proofDataDto.groupId,
        groupSize: proofDataDto.groupSize,
        groupDepth: proofDataDto.groupDepth,
        signal: proofDataDto.objectHash, // Using objectHash as signal
        externalNullifier: proofDataDto.objectHash, // Using objectHash as external nullifier
        orders: proofDataDto.orders,
        isProcessed: false,
        metadata: {
          timestamp: proofDataDto.timestamp,
          proofGeneratedAt: proofDataDto.proofGeneratedAt,
          ...proofDataDto.metadata
        }
      });

      const savedProof = await proof.save();
      this.logger.log(`Proof stored with ID: ${savedProof._id}`);

      // Store orders in MongoDB
      const orderPromises = proofDataDto.orders.map(orderData => {
        const order = new this.orderModel({
          itemName: orderData.itemName,
          amazonLink: orderData.amazonLink,
          dateOrdered: orderData.dateOrdered,
          returnStatus: orderData.returnStatus,
          price: orderData.price,
          id: orderData.id,
          extractedAt: orderData.extractedAt,
          shared: orderData.shared || false,
          metadata: {
            proofId: savedProof._id.toString(),
            userIdSeed: proofDataDto.userIdSeed
          }
        });
        return order.save();
      });

      const savedOrders = await Promise.all(orderPromises);
      this.logger.log(`Stored ${savedOrders.length} orders`);

      // Store combined data in Walrus quilt (with mock for testing)
      const combinedData = {
        proof: {
          id: savedProof._id.toString(),
          userIdSeed: proofDataDto.userIdSeed,
          commitment: proofDataDto.commitment,
          objectHash: proofDataDto.objectHash,
          merkleRoot: proofDataDto.merkleRoot,
          nullifierHash: proofDataDto.nullifierHash,
          solidityProof: proofDataDto.solidityProof,
          groupId: proofDataDto.groupId,
          groupSize: proofDataDto.groupSize,
          groupDepth: proofDataDto.groupDepth,
          timestamp: proofDataDto.timestamp,
          proofGeneratedAt: proofDataDto.proofGeneratedAt
        },
        orders: proofDataDto.orders,
        metadata: {
          totalOrders: proofDataDto.orders.length,
          storedAt: new Date().toISOString(),
          proofId: savedProof._id.toString()
        }
      };
      
      const quiltId = await this.walrusService.storeUserData(
        JSON.stringify(combinedData, null, 2),
        `proof_orders_${savedProof._id}_${Date.now()}`
      );

      this.logger.log(`Data stored in Walrus with quilt ID: ${quiltId}`);

      return {
        proofId: savedProof._id.toString(),
        quiltId,
        message: 'Proof data and orders stored successfully in MongoDB and Walrus'
      };

    } catch (error) {
      this.logger.error('Error storing proof data:', error);
      throw error;
    }
  }

  /**
   * Retrieve proof data by ID
   */
  async getProofById(proofId: string): Promise<Proof> {
    const proof = await this.proofModel.findById(proofId).exec();
    if (!proof) {
      throw new Error(`Proof with ID ${proofId} not found`);
    }
    return proof;
  }

  /**
   * Retrieve orders by proof ID
   */
  async getOrdersByProofId(proofId: string): Promise<Order[]> {
    return this.orderModel.find({ 'metadata.proofId': proofId }).exec();
  }

  /**
   * Retrieve combined data from Walrus using quilt ID
   */
  async getCombinedData(quiltId: string): Promise<any> {
    // Mock implementation for testing
    if (quiltId.startsWith('mock_quilt_')) {
      return {
        mock: true,
        quiltId,
        message: 'This is mock data for testing. In production, data would be retrieved from Walrus.',
        timestamp: new Date().toISOString()
      };
    }
    
    // In production, use real Walrus:
    // return this.walrusService.retrieveUserData(quiltId);
    return this.walrusService.retrieveUserData(quiltId);
  }

  /**
   * Get all proofs for a user
   */
  async getProofsByUser(userIdSeed: string): Promise<Proof[]> {
    return this.proofModel.find({ userIdSeed }).exec();
  }

  /**
   * Get all orders for a user
   */
  async getOrdersByUser(userIdSeed: string): Promise<Order[]> {
    return this.orderModel.find({ 'metadata.userIdSeed': userIdSeed }).exec();
  }

  /**
   * Mark proof as processed
   */
  async markProofAsProcessed(proofId: string): Promise<void> {
    await this.proofModel.findByIdAndUpdate(proofId, { isProcessed: true }).exec();
  }

  /**
   * Get proof statistics
   */
  async getProofStats(): Promise<{
    totalProofs: number;
    totalOrders: number;
    processedProofs: number;
    unprocessedProofs: number;
  }> {
    const [totalProofs, totalOrders, processedProofs] = await Promise.all([
      this.proofModel.countDocuments().exec(),
      this.orderModel.countDocuments().exec(),
      this.proofModel.countDocuments({ isProcessed: true }).exec()
    ]);

    return {
      totalProofs,
      totalOrders,
      processedProofs,
      unprocessedProofs: totalProofs - processedProofs
    };
  }
}
