import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateDatasetDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  size: number;

  @IsString()
  format: string;

  @IsString()
  source: string;

  @IsDateString()
  lastUpdated: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsBoolean()
  isPublic: boolean;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  metadata?: Record<string, any>;
}
