import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { DatasetsService } from './datasets.service';
import { DatasetsController } from './datasets.controller';
import { DataStorageController } from './controllers/data-storage.controller';
import { CronJobController } from './controllers/cron-job.controller';
import { ProofController } from './controllers/proof.controller';
import { DataStorageService } from './services/data-storage.service';
import { WalrusService } from './services/walrus.service';
import { CronJobService } from './services/cron-job.service';
import { ProofService } from './services/proof.service';
import { Dataset, DatasetSchema } from './schemas/dataset.schema';
import { UserData, UserDataSchema } from './schemas/user-data.schema';
import { TempAccess, TempAccessSchema } from './schemas/temp-access.schema';
import { Proof, ProofSchema } from './schemas/proof.schema';
import { Order, OrderSchema } from './schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Dataset.name, schema: DatasetSchema },
      { name: UserData.name, schema: UserDataSchema },
      { name: TempAccess.name, schema: TempAccessSchema },
      { name: Proof.name, schema: ProofSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [DatasetsController, DataStorageController, CronJobController, ProofController],
  providers: [DatasetsService, DataStorageService, WalrusService, CronJobService, ProofService],
  exports: [DatasetsService, DataStorageService, WalrusService, ProofService],
})
export class DatasetsModule {}
