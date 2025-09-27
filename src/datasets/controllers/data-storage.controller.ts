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

  @Get('retrieve/:blobId')
  async retrieveData(@Param('blobId') blobId: string) {
    return this.dataStorageService.retrieveUserData(blobId);
  }

  @Get('unprocessed/:datasetId')
  async getUnprocessedData(@Param('datasetId') datasetId: string) {
    return this.dataStorageService.getUnprocessedUserData(datasetId);
  }
}
