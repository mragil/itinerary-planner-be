import { Injectable } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripsRepository } from './trips.repository';

@Injectable()
export class TripsService {
  constructor(private readonly tripsRepository: TripsRepository) {}

  create(createTripDto: CreateTripDto, userId: number) {
    return this.tripsRepository.create(createTripDto, userId);
  }

  findAll(userId: number) {
    return this.tripsRepository.findAll(userId);
  }

  findOne(id: number, userId: number) {
    return this.tripsRepository.findById(id, userId);
  }

  update(id: number, updateTripDto: UpdateTripDto, userId: number) {
    return this.tripsRepository.update(id, updateTripDto, userId);
  }

  remove(id: number, userId: number) {
    return this.tripsRepository.delete(id, userId);
  }
}
