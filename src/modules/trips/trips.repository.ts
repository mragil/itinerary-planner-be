import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { trips } from './trips.schema';
import { DatabaseModule, type Database } from '../../database.module';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripsRepository {
  constructor(
    @Inject(DatabaseModule.DB_TOKEN)
    private readonly db: Database,
  ) {}

  async create(createTripDto: CreateTripDto, userId: number) {
    const [result] = await this.db
      .insert(trips)
      .values({ ...createTripDto, userId })
      .returning();

    return result;
  }

  async findAll(userId: number) {
    const results = await this.db.query.trips.findMany({
      where: eq(trips.userId, userId),
    });

    return {
      trips: results,
    };
  }

  async findById(id: number, userId: number) {
    const result = await this.db.query.trips.findFirst({
      where: and(eq(trips.id, id), eq(trips.userId, userId)),
      with: {
        activities: true,
      },
    });

    if (!result) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return result;
  }

  async update(id: number, updateTripDto: UpdateTripDto, userId: number) {
    const [result] = await this.db
      .update(trips)
      .set(updateTripDto)
      .where(and(eq(trips.id, id), eq(trips.userId, userId)))
      .returning();

    if (!result) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return result;
  }

  async delete(id: number, userId: number) {
    const [result] = await this.db
      .delete(trips)
      .where(and(eq(trips.id, id), eq(trips.userId, userId)))
      .returning();

    if (!result) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return result;
  }
}
