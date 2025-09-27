import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DatasetsService } from './datasets.service';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { UpdateDatasetDto } from './dto/update-dataset.dto';

@Controller('datasets')
export class DatasetsController {
  constructor(private readonly datasetsService: DatasetsService) {}

  @Get()
  findAll() {
    return this.datasetsService.findPublic();
  }

  @Get('all')
  findAllPrivate() {
    return this.datasetsService.findAll();
  }

  @Get('stats')
  getStats() {
    return this.datasetsService.getStats();
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.datasetsService.search(query);
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.datasetsService.findByCategory(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.datasetsService.findOne(id);
  }

  @Get(':id/download')
  downloadDataset(@Param('id') id: string) {
    return this.datasetsService.downloadDataset(id);
  }
}
