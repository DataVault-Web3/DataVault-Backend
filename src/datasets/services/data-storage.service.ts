import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserData, UserDataDocument } from '../schemas/user-data.schema';
import { Dataset, DatasetDocument } from '../schemas/dataset.schema';
import { WalrusService } from './walrus.service';
import { StoreDataDto } from '../dto/store-data.dto';

@Injectable()
export class DataStorageService {
  private readonly logger = new Logger(DataStorageService.name);

  constructor(
    @InjectModel(UserData.name) private userDataModel: Model<UserDataDocument>,
    @InjectModel(Dataset.name) private datasetModel: Model<DatasetDocument>,
    private walrusService: WalrusService,
  ) {}

  /**
   * Store user data in Walrus and save quilt ID temporarily
   */
  async storeUserData(storeDataDto: StoreDataDto): Promise<{ quiltId: string; message: string }> {
    const { datasetId, data, dataSize, dataFormat, metadata } = storeDataDto;

    // Verify dataset exists
    const dataset = await this.datasetModel.findById(datasetId).exec();
    if (!dataset) {
      throw new NotFoundException(`Dataset with ID ${datasetId} not found`);
    }

    // Store data in Walrus as quilt
    const quiltId = await this.walrusService.storeUserData(data, `user_data_${Date.now()}`);

    // Save quilt ID temporarily in database
    const userData = new this.userDataModel({
      datasetId,
      blobId: quiltId, // Using blobId field to store quiltId for compatibility
      dataSize,
      dataFormat,
      metadata,
      isProcessed: false,
    });

    await userData.save();

    this.logger.log(`Stored user data for dataset ${datasetId}, quilt ID: ${quiltId}`);

    return {
      quiltId,
      message: 'Data stored successfully in Walrus quilt. Will be consolidated in the next weekly batch.',
    };
  }

  /**
   * Retrieve user data using quilt ID
   */
  async retrieveUserData(quiltId: string): Promise<any> {
    const userData = await this.userDataModel.findOne({ blobId: quiltId }).exec();
    if (!userData) {
      throw new NotFoundException(`Data with quilt ID ${quiltId} not found`);
    }

    // Retrieve data from Walrus quilt
    const data = await this.walrusService.retrieveUserData(quiltId);

    return {
      ...data,
      datasetId: userData.datasetId,
      dataFormat: userData.dataFormat,
      metadata: userData.metadata,
    };
  }

  /**
   * Get all unprocessed user data for a dataset
   */
  async getUnprocessedUserData(datasetId: string): Promise<UserData[]> {
    return this.userDataModel.find({ datasetId, isProcessed: false }).exec();
  }

  /**
   * Mark user data as processed
   */
  async markAsProcessed(blobIds: string[]): Promise<void> {
    await this.userDataModel.updateMany(
      { blobId: { $in: blobIds } },
      { isProcessed: true }
    ).exec();
  }

  /**
   * Delete processed user data
   */
  async deleteProcessedUserData(blobIds: string[]): Promise<void> {
    await this.userDataModel.deleteMany({ blobId: { $in: blobIds } }).exec();
  }

  /**
   * Get all datasets that have unprocessed user data
   */
  async getDatasetsWithUnprocessedData(): Promise<string[]> {
    const result = await this.userDataModel.distinct('datasetId', { isProcessed: false }).exec();
    return result;
  }

  /**
   * Retrieve consolidated dataset data
   */
  async retrieveConsolidatedDataset(datasetId: string): Promise<any> {
    const dataset = await this.datasetModel.findById(datasetId).exec();
    if (!dataset) {
      throw new NotFoundException(`Dataset with ID ${datasetId} not found`);
    }

    if (!dataset.datasetBlobId) {
      throw new NotFoundException(`No consolidated data found for dataset ${datasetId}`);
    }

    // Retrieve consolidated data from Walrus blob
    const consolidatedData = await this.walrusService.retrieveConsolidatedData(dataset.datasetBlobId);

    return {
      datasetId,
      datasetName: dataset.name,
      consolidatedBlobId: dataset.datasetBlobId,
      ...consolidatedData,
    };
  }
}
