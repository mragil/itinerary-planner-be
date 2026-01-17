import { HttpException, Injectable } from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityRepository } from './activity.repository';
import { TripService } from '../trip/trip.service';

@Injectable()
export class ActivityService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly tripService: TripService,
  ) {}

  private async validateTripOwnership(userId: number, tripId: number) {
    const trip = await this.tripService.findOne(tripId, userId);

    if (!trip) {
      throw new HttpException('Access Denied', 403);
    }
  }

  async create(createActivityDto: CreateActivityDto, userId: number) {
    await this.validateTripOwnership(userId, createActivityDto.tripId);

    return this.activityRepository.create({
      ...createActivityDto,
      startTime: new Date(createActivityDto.startTime),
      endTime: new Date(createActivityDto.endTime),
    });
  }

  async findAll(tripId: number, userId: number) {
    await this.validateTripOwnership(userId, tripId);
    const activities = await this.activityRepository.getAll(tripId);

    return { activities };
  }

  async update(
    id: number,
    updateActivityDto: UpdateActivityDto,
    userId: number,
    tripId: number,
  ) {
    await this.validateTripOwnership(userId, tripId);

    const result = await this.activityRepository.update(
      id,
      updateActivityDto,
      tripId,
    );
    if (!result) {
      throw new HttpException('Activity not found', 404);
    }
    return result;
  }

  async remove(id: number, tripId: number, userId: number) {
    await this.validateTripOwnership(userId, tripId);
    const result = await this.activityRepository.remove(id, tripId);
    if (!result) {
      throw new HttpException('Activity not found', 404);
    }
    return result;
  }
}
