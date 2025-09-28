#!/usr/bin/env ts-node

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient, WalrusFile } from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import * as crypto from 'crypto';

/**
 * Script to store random data into Walrus following the same pattern as API calls:
 * 1. Store user data in quilts
 * 2. Create consolidated blob containing quilt IDs
 * 3. Print the final blob CID
 */

class RandomDataStorageScript {
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
    const privateKey = process.env.WALRUS_PVT_KEY;
    if (!privateKey) {
      throw new Error('WALRUS_PVT_KEY environment variable is required');
    }
    this.keypair = Ed25519Keypair.fromSecretKey(privateKey);
    
    console.log('✅ WalrusService initialized with testnet configuration');
  }

  /**
   * Generate random user data similar to what would be stored via API
   */
  private generateRandomUserData(count: number = 5): any[] {
    const userDataArray = [];
    
    for (let i = 0; i < count; i++) {
      const userData = {
        userId: `user_${crypto.randomBytes(8).toString('hex')}`,
        timestamp: new Date().toISOString(),
        data: {
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          age: Math.floor(Math.random() * 50) + 18,
          location: {
            city: ['New York', 'London', 'Tokyo', 'Paris', 'Sydney'][Math.floor(Math.random() * 5)],
            country: ['USA', 'UK', 'Japan', 'France', 'Australia'][Math.floor(Math.random() * 5)]
          },
          preferences: {
            theme: ['light', 'dark'][Math.floor(Math.random() * 2)],
            language: ['en', 'es', 'fr', 'de', 'ja'][Math.floor(Math.random() * 5)]
          },
          activity: {
            lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            totalSessions: Math.floor(Math.random() * 100) + 1,
            score: Math.floor(Math.random() * 1000)
          }
        },
        metadata: {
          source: 'random_data_script',
          version: '1.0.0',
          dataType: 'user_profile'
        }
      };
      
      userDataArray.push(userData);
    }
    
    return userDataArray;
  }

  /**
   * Store user data in Walrus using quilts and return quilt ID
   */
  private async storeUserData(data: any, identifier?: string): Promise<string> {
    try {
      console.log(`📦 Storing user data in Walrus quilt: ${identifier}`);
      
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
      console.log(`✅ User data stored successfully, quilt ID: ${quiltId}`);
      
      return quiltId;
    } catch (error) {
      console.error('❌ Error storing user data in Walrus:', error);
      throw new Error(`Failed to store user data: ${error.message}`);
    }
  }

  /**
   * Create a consolidated blob containing multiple quilt IDs
   */
  private async createConsolidatedBlob(quiltIds: string[]): Promise<string> {
    try {
      console.log(`🔗 Creating consolidated blob with ${quiltIds.length} quilt IDs`);
      
      // Create a consolidated data structure
      const consolidatedData = {
        type: 'consolidated_dataset',
        quiltIds,
        consolidatedAt: new Date().toISOString(),
        count: quiltIds.length,
        metadata: {
          source: 'random_data_script',
          version: '1.0.0',
          description: 'Consolidated dataset containing random user data'
        }
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

      console.log(`✅ Consolidated blob created successfully: ${blobId}`);
      
      return blobId;
    } catch (error) {
      console.error('❌ Error creating consolidated blob:', error);
      throw new Error(`Failed to create consolidated blob: ${error.message}`);
    }
  }

  /**
   * Main function to execute the data storage process
   */
  async execute(): Promise<void> {
    try {
      console.log('🚀 Starting random data storage process...\n');

      // Step 1: Generate random user data
      console.log('📊 Step 1: Generating random user data...');
      const userDataArray = this.generateRandomUserData(1);
      console.log(userDataArray);
      console.log(`✅ Generated ${userDataArray.length} random user records\n`);

      // Step 2: Store each user data in individual quilts
      console.log('📦 Step 2: Storing user data in Walrus quilts...');
      const quiltIds: string[] = [];
      
      for (let i = 0; i < userDataArray.length; i++) {
        const userData = userDataArray[i];
        const identifier = `random_user_${i + 1}_${Date.now()}`;
        const quiltId = await this.storeUserData(userData, identifier);
        quiltIds.push(quiltId);
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`✅ Successfully stored ${quiltIds.length} user data records in quilts\n`);

      // Step 3: Create consolidated blob containing all quilt IDs
      console.log('🔗 Step 3: Creating consolidated blob...');
      const consolidatedBlobId = await this.createConsolidatedBlob(quiltIds);
      
      console.log('\n🎉 Data storage process completed successfully!');
      console.log('=' .repeat(60));
      console.log('📋 SUMMARY:');
      console.log(`   • User data records stored: ${userDataArray.length}`);
      console.log(`   • Quilt IDs: ${quiltIds.join(', ')}`);
      console.log(`   • Consolidated Blob ID (CID): ${consolidatedBlobId}`);
      console.log('=' .repeat(60));
      
      // Step 4: Verify the consolidated blob
      console.log('\n🔍 Step 4: Verifying consolidated blob...');
      const blobBytes = await this.walrusClient.readBlob({ blobId: consolidatedBlobId });
      const content = new TextDecoder().decode(blobBytes);
      const parsedData = JSON.parse(content);
      
      console.log('✅ Blob verification successful!');
      console.log(`   • Blob size: ${blobBytes.length} bytes`);
      console.log(`   • Contains ${parsedData.count} quilt IDs`);
      console.log(`   • Type: ${parsedData.type}`);
      console.log(`   • Consolidated at: ${parsedData.consolidatedAt}`);

    } catch (error) {
      console.error('❌ Script execution failed:', error);
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  // Check for required environment variable
  if (!process.env.WALRUS_PVT_KEY) {
    console.error('❌ Error: WALRUS_PVT_KEY environment variable is required');
    console.log('Please set your Walrus private key:');
    console.log('export WALRUS_PVT_KEY="your_private_key_here"');
    process.exit(1);
  }

  const script = new RandomDataStorageScript();
  await script.execute();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { RandomDataStorageScript };
