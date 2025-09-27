import { IsString, IsNumber, IsOptional, IsObject, IsNotEmpty } from 'class-validator';

export class StoreDataDto {
  @IsString()
  @IsNotEmpty()
  datasetId: string;

  @IsString()
  @IsNotEmpty()
  data: string;

  @IsNumber()
  dataSize: number;

  @IsString()
  @IsNotEmpty()
  dataFormat: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
