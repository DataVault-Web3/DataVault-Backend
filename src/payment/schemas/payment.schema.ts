import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  userAddress: string;

  @Prop({ required: true })
  amount: string;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  status: 'pending' | 'completed' | 'failed';

  @Prop({ required: true })
  transactionHash: string;

  @Prop()
  facilitatorUrl: string;

  @Prop()
  accessToken: string;

  @Prop()
  expiresAt: Date;

  @Prop()
  metadata?: Record<string, any>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
