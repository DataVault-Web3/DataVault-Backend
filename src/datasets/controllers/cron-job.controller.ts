import { Controller, Post } from '@nestjs/common';
import { CronJobService } from '../services/cron-job.service';

@Controller('cron-jobs')
export class CronJobController {
  constructor(private readonly cronJobService: CronJobService) {}

  @Post('trigger-consolidation')
  async triggerConsolidation() {
    return this.cronJobService.triggerConsolidation();
  }
}
