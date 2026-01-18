import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { trips, Trip, DetailTrip } from './trips.schema';
import { DatabaseModule, type Database } from '../../database.module';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripsRepository {
  constructor(
    @Inject(DatabaseModule.DB_TOKEN)
    private readonly db: Database,
  ) {}

  async create(createTripDto: CreateTripDto, userId: number): Promise<Trip> {
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

  async findById(id: number, userId: number): Promise<DetailTrip | null> {
    const result = await this.db.query.trips.findFirst({
      where: and(eq(trips.id, id), eq(trips.userId, userId)),
      with: {
        activities: true,
      },
    });

    return result ?? null;
  }

  async update(
    id: number,
    updateTripDto: UpdateTripDto,
    userId: number,
  ): Promise<Trip | null> {
    const [result] = await this.db
      .update(trips)
      .set(updateTripDto)
      .where(and(eq(trips.id, id), eq(trips.userId, userId)))
      .returning();

    return result ?? null;
  }

  async delete(id: number, userId: number): Promise<Trip | null> {
    const [result] = await this.db
      .delete(trips)
      .where(and(eq(trips.id, id), eq(trips.userId, userId)))
      .returning();

    return result ?? null;
  }
}
