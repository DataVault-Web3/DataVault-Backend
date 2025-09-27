import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dataset, DatasetDocument } from '../schemas/dataset.schema';
import { UserData, UserDataDocument } from '../schemas/user-data.schema';
import { WalrusService } from './walrus.service';

@Injectable()
export class CronJobService {
  private readonly logger = new Logger(CronJobService.name);

  constructor(
    @InjectModel(Dataset.name) private datasetModel: Model<DatasetDocument>,
    @InjectModel(UserData.name) private userDataModel: Model<UserDataDocument>,
    private walrusService: WalrusService,
  ) {}

  /**
   * Weekly cron job to consolidate blob data
   * Runs every Sunday at 2:00 AM
   */
  @Cron(CronExpression.EVERY_WEEK)
  async consolidateBlobData() {
    this.logger.log('Starting weekly blob consolidation process...');

    try {
      // Get all datasets with unprocessed user data
      const datasetsWithUnprocessedData = await this.userDataModel
        .distinct('datasetId', { isProcessed: false })
        .exec();

      this.logger.log(`Found ${datasetsWithUnprocessedData.length} datasets with unprocessed data`);

      for (const datasetId of datasetsWithUnprocessedData) {
        await this.consolidateDatasetBlobs(datasetId);
      }

      this.logger.log('Weekly blob consolidation process completed successfully');
    } catch (error) {
      this.logger.error('Error during weekly blob consolidation:', error);
    }
  }

  /**
   * Consolidate blobs for a specific dataset
   */
  private async consolidateDatasetBlobs(datasetId: string): Promise<void> {
    this.logger.log(`Consolidating blobs for dataset: ${datasetId}`);

    try {
      // Get dataset info
      const dataset = await this.datasetModel.findById(datasetId).exec();
      if (!dataset) {
        this.logger.warn(`Dataset ${datasetId} not found, skipping consolidation`);
        return;
      }

      // Get all unprocessed user data for this dataset
      const unprocessedUserData = await this.userDataModel
        .find({ datasetId, isProcessed: false })
        .exec();

      if (unprocessedUserData.length === 0) {
        this.logger.log(`No unprocessed data for dataset ${datasetId}, skipping`);
        return;
      }

      this.logger.log(`Found ${unprocessedUserData.length} unprocessed blobs for dataset ${datasetId}`);

      // Get existing quilt IDs from current dataset blob
      let existingQuiltIds: string[] = [];
      if (dataset.datasetBlobId) {
        try {
          const existingData = await this.walrusService.retrieveConsolidatedData(dataset.datasetBlobId);
          existingQuiltIds = existingData.quiltIds || [];
        } catch (error) {
          this.logger.warn(`Could not retrieve existing consolidated data for dataset ${datasetId}:`, error.message);
        }
      }

      // Get new quilt IDs from unprocessed user data
      const newQuiltIds = unprocessedUserData.map(ud => ud.blobId);

      // Combine existing and new quilt IDs
      const allQuiltIds = [...existingQuiltIds, ...newQuiltIds];

      // Create consolidated blob
      const consolidatedBlobId = await this.walrusService.createConsolidatedBlob(allQuiltIds);

      // Calculate total data size
      let totalDataSize = 0;
      for (const userData of unprocessedUserData) {
        totalDataSize += userData.dataSize;
      }

      // Update dataset with new consolidated blob
      await this.datasetModel.findByIdAndUpdate(datasetId, {
        datasetBlobId: consolidatedBlobId,
        dataSize: dataset.dataSize + totalDataSize,
        numberOfUsers: dataset.numberOfUsers + unprocessedUserData.length,
        lastUpdated: new Date(),
      }).exec();

      // Mark user data as processed
      await this.userDataModel.updateMany(
        { _id: { $in: unprocessedUserData.map(ud => ud._id) } },
        { isProcessed: true }
      ).exec();

      // Delete processed user data from database
      await this.userDataModel.deleteMany(
        { _id: { $in: unprocessedUserData.map(ud => ud._id) } }
      ).exec();

      this.logger.log(`Successfully consolidated ${unprocessedUserData.length} quilts for dataset ${datasetId}. New consolidated blob ID: ${consolidatedBlobId}`);

    } catch (error) {
      this.logger.error(`Error consolidating blobs for dataset ${datasetId}:`, error);
    }
  }

  /**
   * Manual trigger for blob consolidation (for testing)
   */
  async triggerConsolidation(): Promise<{ message: string; processedDatasets: number }> {
    this.logger.log('Manual blob consolidation triggered');

    const datasetsWithUnprocessedData = await this.userDataModel
      .distinct('datasetId', { isProcessed: false })
      .exec();

    for (const datasetId of datasetsWithUnprocessedData) {
      await this.consolidateDatasetBlobs(datasetId);
    }

    return {
      message: 'Manual consolidation completed',
      processedDatasets: datasetsWithUnprocessedData.length,
    };
  }
}
