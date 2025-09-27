import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dataset, DatasetDocument } from '../datasets/schemas/dataset.schema';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Dataset.name) private datasetModel: Model<DatasetDocument>,
  ) {}

  async seedDatasets() {
    const sampleDatasets = [
      {
        name: 'Amazon Orders',
        description: 'Amazon Orders dataset',
        size: 2500000000, // 2.5GB
        numberOfUsers: 1250,
        dataSize: 2500000000, // 2.5GB
        dataFormat: 'JSON',
        numberOfDownloads: 450,
        lastUpdated: new Date('2023-12-01'),
        tags: ['amazon', 'orders', 'ecommerce', 'transactions'],
        isPublic: true,
        price: 10000000,
        datasetBlobId: '1234567890',
        metadata: {
          blockRange: '10000000-18000000',
          transactionCount: 50000000,
          averageGasPrice: '20 gwei'
        }
      },
      {
        name: 'Flipkart Orders',
        description: 'Flipkart Orders dataset',
        size: 2500000000, // 2.5GB
        numberOfUsers: 1250,
        dataSize: 2500000000, // 2.5GB
        dataFormat: 'JSON',
        numberOfDownloads: 450,
        lastUpdated: new Date('2023-12-01'),
        tags: ['flipkart', 'orders', 'ecommerce', 'transactions'],
        isPublic: true,
        price: 10000000,
        datasetBlobId: '1234567890',
        metadata: {
          blockRange: '10000000-18000000',
          transactionCount: 50000000,
          averageGasPrice: '20 gwei'
        }
      }
    ];

    // Clear existing datasets
    await this.datasetModel.deleteMany({});
    
    // Insert sample datasets
    const createdDatasets = await this.datasetModel.insertMany(sampleDatasets);
    
    console.log(`✅ Seeded ${createdDatasets.length} datasets`);
    return createdDatasets;
  }
}
