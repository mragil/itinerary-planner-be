import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { TripModule } from '../trip/trip.module';
import { ActivityRepository } from './activity.repository';
import { DatabaseModule } from '../../database.module';

@Module({
  imports: [TripModule, DatabaseModule],
  controllers: [ActivityController],
  providers: [ActivityService, ActivityRepository],
})
export class ActivityModule {}
