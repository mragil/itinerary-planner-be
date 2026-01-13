import { Injectable } from '@nestjs/common';
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

  findAll(userId: number) {
    return this.tripRepository.getAll(userId);
  }

  findOne(id: number, userId: number) {
    return this.tripRepository.getById(id, userId);
  }

  update(id: number, updateTripDto: UpdateTripDto, userId: number) {
    return this.tripRepository.update(id, updateTripDto, userId);
  }

  remove(id: number, userId: number) {
    return this.tripRepository.remove(id, userId);
  }
}
