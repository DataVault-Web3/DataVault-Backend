import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TempAccessDocument = TempAccess & Document;

@Schema({ timestamps: true })
export class TempAccess {
  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  datasetId: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop()
  usedAt?: Date;
}

export const TempAccessSchema = SchemaFactory.createForClass(TempAccess);

// Add TTL index for automatic cleanup
TempAccessSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
