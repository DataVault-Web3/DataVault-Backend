import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dataset, DatasetDocument } from './schemas/dataset.schema';
import { TempAccess, TempAccessDocument } from './schemas/temp-access.schema';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { UpdateDatasetDto } from './dto/update-dataset.dto';
import * as crypto from 'crypto';

@Injectable()
export class DatasetsService {
  constructor(
    @InjectModel(Dataset.name) private datasetModel: Model<DatasetDocument>,
    @InjectModel(TempAccess.name) private tempAccessModel: Model<TempAccessDocument>,
  ) {}

  async create(createDatasetDto: CreateDatasetDto): Promise<Dataset> {
    const createdDataset = new this.datasetModel(createDatasetDto);
    return createdDataset.save();
  }

  async findAll(): Promise<Dataset[]> {
    return this.datasetModel.find().exec();
  }

  async findPublic(): Promise<Dataset[]> {
    return this.datasetModel.find({ isPublic: true }).exec();
  }

  async findOne(id: string): Promise<Dataset> {
    const dataset = await this.datasetModel.findById(id).exec();
    if (!dataset) {
      throw new NotFoundException(`Dataset with ID ${id} not found`);
    }
    return dataset;
  }

  async findByCategory(category: string): Promise<Dataset[]> {
    return this.datasetModel.find({ category }).exec();
  }

  async search(query: string): Promise<Dataset[]> {
    return this.datasetModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
    }).exec();
  }

  async update(id: string, updateDatasetDto: UpdateDatasetDto): Promise<Dataset> {
    const updatedDataset = await this.datasetModel
      .findByIdAndUpdate(id, updateDatasetDto, { new: true })
      .exec();
    if (!updatedDataset) {
      throw new NotFoundException(`Dataset with ID ${id} not found`);
    }
    return updatedDataset;
  }

  async remove(id: string): Promise<void> {
    const result = await this.datasetModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Dataset with ID ${id} not found`);
    }
  }

  async getStats(): Promise<any> {
    const total = await this.datasetModel.countDocuments();
    const publicCount = await this.datasetModel.countDocuments({ isPublic: true });
    const privateCount = total - publicCount;
    
    const categories = await this.datasetModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return {
      total,
      public: publicCount,
      private: privateCount,
      categories,
    };
  }

  async downloadDataset(id: string): Promise<any> {
    //sleep for 10 second
    const dataset = await this.findOne(id);
    
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiry to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Create temporary access record
    const tempAccess = new this.tempAccessModel({
      token,
      datasetId: id,
      expiresAt,
    });
    
    await tempAccess.save();
    
    // Return the temporary URL
    return {
      name: dataset.name,
      description: dataset.description,
      downloadUrl: `/datasets/${id}/access/${token}`,
      expiresAt: expiresAt.toISOString(),
      fileSize: dataset.size || 'Unknown',
      format: dataset.dataFormat || 'Unknown',
      downloadInstructions: 'This URL expires in 24 hours and can only be used once',
    };
  }

  async getDatasetByToken(datasetId: string, token: string): Promise<Dataset> {
    const tempAccess = await this.tempAccessModel.findOne({
      token,
      datasetId,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).exec();

    if (!tempAccess) {
      throw new BadRequestException('Invalid or expired access token');
    }

    tempAccess.usedAt = new Date();
    await tempAccess.save();

    // Return the dataset
    return this.findOne(datasetId);
  }
}
