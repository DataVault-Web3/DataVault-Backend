import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DataStorageService } from '../services/data-storage.service';
import { StoreDataDto } from '../dto/store-data.dto';

@Controller('data-storage')
export class DataStorageController {
  constructor(private readonly dataStorageService: DataStorageService) {}

  @Post('store')
  @HttpCode(HttpStatus.CREATED)
  async storeData(@Body() storeDataDto: StoreDataDto) {
    return this.dataStorageService.storeUserData(storeDataDto);
  }

  @Get('retrieve/:quiltId')
  async retrieveData(@Param('quiltId') quiltId: string) {
    return this.dataStorageService.retrieveUserData(quiltId);
  }

  @Get('unprocessed/:datasetId')
  async getUnprocessedData(@Param('datasetId') datasetId: string) {
    return this.dataStorageService.getUnprocessedUserData(datasetId);
  }

  @Get('consolidated/:datasetId')
  async getConsolidatedData(@Param('datasetId') datasetId: string) {
    return this.dataStorageService.retrieveConsolidatedDataset(datasetId);
  }
}
