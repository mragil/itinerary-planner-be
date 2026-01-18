import { HttpException, Injectable } from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivitiesRepository } from './activities.repository';
import { TripsService } from '../trips/trips.service';

@Injectable()
export class ActivitiesService {
  constructor(
    private readonly activitiesRepository: ActivitiesRepository,
    private readonly tripsService: TripsService,
  ) {}

  private async validateTripOwnership(userId: number, tripId: number) {
    const trip = await this.tripsService.findOne(tripId, userId);

    if (!trip) {
      throw new HttpException('Access Denied', 403);
    }
  }

  async create(createActivityDto: CreateActivityDto, userId: number) {
    await this.validateTripOwnership(userId, createActivityDto.tripId);

    return this.activitiesRepository.create({
      ...createActivityDto,
      startTime: new Date(createActivityDto.startTime),
      endTime: new Date(createActivityDto.endTime),
    });
  }

  async findAll(tripId: number, userId: number) {
    await this.validateTripOwnership(userId, tripId);
    const activities = await this.activitiesRepository.findAll(tripId);

    return { activities };
  }

  async update(
    id: number,
    updateActivityDto: UpdateActivityDto,
    userId: number,
    tripId: number,
  ) {
    await this.validateTripOwnership(userId, tripId);

    const result = await this.activitiesRepository.update(
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
    const result = await this.activitiesRepository.delete(id, tripId);
    if (!result) {
      throw new HttpException('Activity not found', 404);
    }
    return result;
  }
}
