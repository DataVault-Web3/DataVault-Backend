import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProofDocument = Proof & Document;

@Schema({ timestamps: true })
export class Proof {
  @Prop({ required: true })
  userIdSeed: string;

  @Prop({ required: true })
  commitment: string;

  @Prop({ required: true })
  objectHash: string;

  @Prop({ required: true })
  merkleRoot: string;

  @Prop({ required: true })
  nullifierHash: string;

  @Prop({ type: [String], required: true })
  solidityProof: string[];

  @Prop({ required: true })
  groupId: string;

  @Prop({ required: true })
  groupSize: string;

  @Prop({ required: true })
  groupDepth: string;

  @Prop({ required: true })
  signal: string;

  @Prop({ required: true })
  externalNullifier: string;

  @Prop({ type: Object, required: true })
  orders: any[];

  @Prop({ default: false })
  isProcessed: boolean;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const ProofSchema = SchemaFactory.createForClass(Proof);
