import { IsString, IsArray, IsObject, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderDto {
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsString()
  @IsNotEmpty()
  amazonLink: string;

  @IsString()
  @IsNotEmpty()
  dateOrdered: string;

  @IsString()
  @IsNotEmpty()
  returnStatus: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  extractedAt?: string;

  @IsOptional()
  shared?: boolean;
}

export class ProofDataDto {
  // Proof components
  @IsArray()
  @IsString({ each: true })
  solidityProof: string[];

  @IsString()
  @IsNotEmpty()
  nullifierHash: string;

  @IsString()
  @IsNotEmpty()
  merkleRoot: string;

  // Group info
  @IsString()
  @IsNotEmpty()
  groupId: string;

  @IsString()
  @IsNotEmpty()
  groupSize: string;

  @IsString()
  @IsNotEmpty()
  groupDepth: string;

  // Object data
  @IsString()
  @IsNotEmpty()
  objectHash: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDto)
  orders: OrderDto[];

  // Identity info
  @IsString()
  @IsNotEmpty()
  commitment: string;

  @IsString()
  @IsNotEmpty()
  userIdSeed: string;

  // Metadata
  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @IsString()
  @IsNotEmpty()
  proofGeneratedAt: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
