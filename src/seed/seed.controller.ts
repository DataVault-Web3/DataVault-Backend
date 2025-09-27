import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('datasets')
  async seedDatasets() {
    return this.seedService.seedDatasets();
  }
}
