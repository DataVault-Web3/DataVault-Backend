import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Dataset, DatasetSchema } from '../datasets/schemas/dataset.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Dataset.name, schema: DatasetSchema }])],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
