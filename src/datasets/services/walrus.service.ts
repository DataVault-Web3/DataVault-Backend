import { Injectable, Logger } from '@nestjs/common';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient, WalrusFile } from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromB64 } from '@mysten/sui/utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WalrusService {
  private readonly logger = new Logger(WalrusService.name);
  private walrusClient: WalrusClient;
  private suiClient: SuiClient;
  private keypair: Ed25519Keypair;

  constructor() {
    // Initialize Sui client for testnet
    this.suiClient = new SuiClient({
      url: getFullnodeUrl('testnet'),
    });

    // Initialize Walrus client for testnet
    this.walrusClient = new WalrusClient({
      network: 'testnet',
      suiClient: this.suiClient,
    });

    // Generate a keypair for signing transactions
    // In production, this should be loaded from secure storage
    const privateKey = process.env.WALRUS_PVT_KEY;
    if (!privateKey) {
      throw new Error('WALRUS_PVT_KEY environment variable is required');
    }
    this.keypair = Ed25519Keypair.fromSecretKey(privateKey);
    
    this.logger.log('WalrusService initialized with testnet configuration');
  }

  /**
   * Store user data in Walrus using quilts and return quilt ID
   * @param data - The user data to store
   * @param identifier - Optional identifier for the file
   * @returns Promise<string> - The quilt ID
   */
  async storeUserData(data: any, identifier?: string): Promise<string> {
    try {
      this.logger.log(`Storing user data in Walrus quilt`);
      
      // Convert data to WalrusFile
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const file = WalrusFile.from({
        contents: new TextEncoder().encode(dataString),
        identifier: identifier || `user_data_${Date.now()}`,
        tags: {
          'content-type': 'application/json',
          'created-at': new Date().toISOString(),
        },
      });

      // Write file to Walrus (creates a quilt)
      const results = await this.walrusClient.writeFiles({
        files: [file],
        epochs: 3, // Store for 3 epochs
        deletable: true,
        signer: this.keypair,
      });

      const quiltId = results[0].id;
      this.logger.log(`User data stored successfully, quilt ID: ${quiltId}`);
      
      return quiltId;
    } catch (error) {
      this.logger.error('Error storing user data in Walrus:', error);
      throw new Error(`Failed to store user data: ${error.message}`);
    }
  }

  /**
   * Retrieve user data from Walrus using quilt ID
   * @param quiltId - The quilt ID to retrieve
   * @returns Promise<any> - The stored data
   */
  async retrieveUserData(quiltId: string): Promise<any> {
    try {
      this.logger.log(`Retrieving user data from Walrus quilt: ${quiltId}`);
      
      // Get files from quilt
      const [file] = await this.walrusClient.getFiles({ ids: [quiltId] });
      
      if (!file) {
        throw new Error(`No file found for quilt ID: ${quiltId}`);
      }

      // Get file content as text
      const content = await file.text();
      
      // Try to parse as JSON, fallback to string
      let data;
      try {
        data = JSON.parse(content);
      } catch {
        data = content;
      }

      this.logger.log(`User data retrieved successfully from quilt: ${quiltId}`);
      
      return {
        quiltId,
        data,
        identifier: await file.getIdentifier(),
        tags: await file.getTags(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error retrieving user data from Walrus:', error);
      throw new Error(`Failed to retrieve user data: ${error.message}`);
    }
  }

  /**
   * Create a consolidated blob containing multiple quilt IDs
   * @param quiltIds - Array of quilt IDs to consolidate
   * @returns Promise<string> - The new consolidated blob ID
   */
  async createConsolidatedBlob(quiltIds: string[]): Promise<string> {
    try {
      this.logger.log(`Creating consolidated blob with ${quiltIds.length} quilt IDs`);
      
      // Create a consolidated data structure
      const consolidatedData = {
        type: 'consolidated_dataset',
        quiltIds,
        consolidatedAt: new Date().toISOString(),
        count: quiltIds.length,
      };

      // Convert to Uint8Array for blob storage
      const dataBytes = new TextEncoder().encode(JSON.stringify(consolidatedData));

      // Write as a blob (not quilt) for consolidated data
      const { blobId } = await this.walrusClient.writeBlob({
        blob: dataBytes,
        deletable: false, // Consolidated blobs should not be deletable
        epochs: 5, // Store for 5 epochs (longer than individual data)
        signer: this.keypair,
      });

      this.logger.log(`Consolidated blob created successfully: ${blobId}`);
      
      return blobId;
    } catch (error) {
      this.logger.error('Error creating consolidated blob:', error);
      throw new Error(`Failed to create consolidated blob: ${error.message}`);
    }
  }

  /**
   * Retrieve consolidated data from blob
   * @param blobId - The blob ID to retrieve
   * @returns Promise<any> - The consolidated data
   */
  async retrieveConsolidatedData(blobId: string): Promise<any> {
    try {
      this.logger.log(`Retrieving consolidated data from blob: ${blobId}`);
      
      // Read blob content
      const blobBytes = await this.walrusClient.readBlob({ blobId });
      
      // Convert to string and parse JSON
      const content = new TextDecoder().decode(blobBytes);
      const data = JSON.parse(content);

      this.logger.log(`Consolidated data retrieved successfully from blob: ${blobId}`);
      
      return {
        blobId,
        ...data,
        retrievedAt: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error retrieving consolidated data:', error);
      throw new Error(`Failed to retrieve consolidated data: ${error.message}`);
    }
  }

  /**
   * Get the size of data stored in a blob
   * @param blobId - The blob ID
   * @returns Promise<number> - The size in bytes
   */
  async getBlobSize(blobId: string): Promise<number> {
    try {
      this.logger.log(`Getting size for blob: ${blobId}`);
      
      const blobBytes = await this.walrusClient.readBlob({ blobId });
      const size = blobBytes.length;
      
      this.logger.log(`Blob size: ${size} bytes`);
      
      return size;
    } catch (error) {
      this.logger.error('Error getting blob size:', error);
      throw new Error(`Failed to get blob size: ${error.message}`);
    }
  }

  /**
   * Get the size of data stored in a quilt
   * @param quiltId - The quilt ID
   * @returns Promise<number> - The size in bytes
   */
  async getQuiltSize(quiltId: string): Promise<number> {
    try {
      this.logger.log(`Getting size for quilt: ${quiltId}`);
      
      const [file] = await this.walrusClient.getFiles({ ids: [quiltId] });
      if (!file) {
        throw new Error(`Quilt not found: ${quiltId}`);
      }

      const bytes = await file.bytes();
      const size = bytes.length;
      
      this.logger.log(`Quilt size: ${size} bytes`);
      
      return size;
    } catch (error) {
      this.logger.error('Error getting quilt size:', error);
      throw new Error(`Failed to get quilt size: ${error.message}`);
    }
  }
}
