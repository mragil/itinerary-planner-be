import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { TripsModule } from '../trips/trips.module';
import { ActivitiesRepository } from './activities.repository';
import { DatabaseModule } from '../../database.module';

@Module({
  imports: [TripsModule, DatabaseModule],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, ActivitiesRepository],
})
export class ActivitiesModule {}
