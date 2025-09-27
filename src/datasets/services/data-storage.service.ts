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
   * Store user data in Walrus and save blob ID temporarily
   */
  async storeUserData(storeDataDto: StoreDataDto): Promise<{ blobId: string; message: string }> {
    const { datasetId, data, dataSize, dataFormat, metadata } = storeDataDto;

    // Verify dataset exists
    const dataset = await this.datasetModel.findById(datasetId).exec();
    if (!dataset) {
      throw new NotFoundException(`Dataset with ID ${datasetId} not found`);
    }

    // Store data in Walrus
    const blobId = await this.walrusService.storeData(data);

    // Save blob ID temporarily in database
    const userData = new this.userDataModel({
      datasetId,
      blobId,
      dataSize,
      dataFormat,
      metadata,
      isProcessed: false,
    });

    await userData.save();

    this.logger.log(`Stored user data for dataset ${datasetId}, blob ID: ${blobId}`);

    return {
      blobId,
      message: 'Data stored successfully. Will be consolidated in the next weekly batch.',
    };
  }

  /**
   * Retrieve user data using blob ID
   */
  async retrieveUserData(blobId: string): Promise<any> {
    const userData = await this.userDataModel.findOne({ blobId }).exec();
    if (!userData) {
      throw new NotFoundException(`Data with blob ID ${blobId} not found`);
    }

    // Retrieve data from Walrus
    const data = await this.walrusService.retrieveData(blobId);

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
}
