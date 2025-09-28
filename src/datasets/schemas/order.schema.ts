import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  itemName: string;

  @Prop({ required: true })
  amazonLink: string;

  @Prop({ required: true })
  dateOrdered: string;

  @Prop({ required: true })
  returnStatus: string;

  @Prop()
  price?: string;

  @Prop()
  id?: string;

  @Prop()
  extractedAt?: string;

  @Prop({ default: false })
  shared: boolean;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
