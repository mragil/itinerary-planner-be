import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(id: number, userId: number) {
    const trip = await this.tripsRepository.findById(id, userId);

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return trip;
  }

  async update(id: number, updateTripDto: UpdateTripDto, userId: number) {
    const updatedTrip = await this.tripsRepository.update(
      id,
      updateTripDto,
      userId,
    );

    if (!updatedTrip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return updatedTrip;
  }

  async remove(id: number, userId: number) {
    const deletedTrip = await this.tripsRepository.delete(id, userId);

    if (!deletedTrip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return deletedTrip;
  }
}
