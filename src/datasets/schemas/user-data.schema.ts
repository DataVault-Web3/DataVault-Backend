import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDataDocument = UserData & Document;

@Schema({ timestamps: true })
export class UserData {
  @Prop({ required: true })
  datasetId: string;

  @Prop({ required: true })
  blobId: string;

  @Prop({ required: true })
  dataSize: number;

  @Prop({ required: true })
  dataFormat: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: false })
  isProcessed: boolean;
}

export const UserDataSchema = SchemaFactory.createForClass(UserData);
