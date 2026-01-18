import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { TripsModule } from '../trips/trips.module';
import { ActivityRepository } from './activity.repository';
import { DatabaseModule } from '../../database.module';

@Module({
  imports: [TripsModule, DatabaseModule],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityRepository],
})
export class ActivityModule {}
