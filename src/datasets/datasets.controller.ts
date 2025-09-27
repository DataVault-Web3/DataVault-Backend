import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DatasetsService } from './datasets.service';
import { CreateDatasetDto } from './dto/create-dataset.dto';
import { UpdateDatasetDto } from './dto/update-dataset.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaidAccessGuard } from '../auth/paid-access.guard';

@Controller('datasets')
export class DatasetsController {
  constructor(private readonly datasetsService: DatasetsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createDatasetDto: CreateDatasetDto) {
    return this.datasetsService.create(createDatasetDto);
  }

  @Get()
  findAll() {
    return this.datasetsService.findPublic();
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, PaidAccessGuard)
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateDatasetDto: UpdateDatasetDto) {
    return this.datasetsService.update(id, updateDatasetDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.datasetsService.remove(id);
  }
}
