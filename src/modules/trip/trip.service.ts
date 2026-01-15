import { HttpException, Injectable } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripRepository } from './trip.repository';

@Injectable()
export class TripService {
  constructor(private readonly tripRepository: TripRepository) {}
  create(createTripDto: CreateTripDto, userId: number) {
    return this.tripRepository.create({
      ...createTripDto,
      startDate: new Date(createTripDto.startDate),
      endDate: new Date(createTripDto.endDate),
      userId,
    });
  }

  async findAll(userId: number) {
    const trips = await this.tripRepository.getAll(userId);

    return { trips };
  }

  async findOne(id: number, userId: number) {
    const trip = await this.tripRepository.getById(id, userId);

    if (!trip) {
      throw new HttpException('Trip not found', 404);
    }

    return trip;
  }

  async update(id: number, updateTripDto: UpdateTripDto, userId: number) {
    const result = await this.tripRepository.update(id, updateTripDto, userId);
    if (!result) {
      throw new HttpException('Trip not found', 404);
    }
    return result;
  }

  async remove(id: number, userId: number) {
    const result = await this.tripRepository.remove(id, userId);
    if (!result) {
      throw new HttpException('Trip not found', 404);
    }
    return result;
  }
}
