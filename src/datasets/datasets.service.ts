import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dataset, DatasetDocument } from './schemas/dataset.schema';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { UpdateDatasetDto } from './dto/update-dataset.dto';

@Injectable()
export class DatasetsService {
  constructor(
    @InjectModel(Dataset.name) private datasetModel: Model<DatasetDocument>,
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
    const dataset = await this.findOne(id);
    
    return true
    // Return dataset download information
    // return {
    //   id: dataset._id,
    //   name: dataset.name,
    //   description: dataset.description,
    //   downloadUrl: dataset.downloadUrl || `https://your-storage.com/datasets/${id}`,
    //   fileSize: dataset.fileSize || 'Unknown',
    //   format: dataset.format || 'Unknown',
    //   downloadInstructions: 'Dataset access granted after payment verification',
    // };
  }
}
