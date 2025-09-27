import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DatasetDocument = Dataset & Document;

@Schema({ timestamps: true })
export class Dataset {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  numberOfUsers: number;

  @Prop({ required: true })
  dataSize: number;

  @Prop({ required: true })
  datasetBlobId: string;

  @Prop({ type: [String], default: [] })
  consolidatedBlobIds: string[];

  @Prop({ required: true })
  dataFormat: string;

  @Prop({ required: true })
  numberOfDownloads: number;

  @Prop({ required: true })
  lastUpdated: Date;

  @Prop({ required: true })
  tags: string[];

  @Prop({ required: true })
  isPublic: boolean;

  @Prop({ required: true })
  price: number; // in wei

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const DatasetSchema = SchemaFactory.createForClass(Dataset);
