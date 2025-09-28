import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
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

  @Get(':id/access/:token')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment')
  async getDatasetByToken(
    @Param('id') id: string, 
    @Param('token') token: string,
    @Res() res: Response
  ) {
    const data = await this.datasetsService.getDatasetByToken(id, token);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `dataset-${id}-${timestamp}.json`;
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    
    // Send the JSON data as a downloadable file
    res.json(data);
  }
}
