import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NewTrip, Trip, trips } from './trip.schema';
import { DatabaseModule, type Database } from '../../database.module';

@Injectable()
export class TripRepository {
  constructor(
    @Inject(DatabaseModule.DB_TOKEN)
    private readonly db: Database,
  ) {}

  async getAll(userId: number) {
    return this.db.query.trips.findMany({
      where: eq(trips.userId, userId),
    });
  }

  async getById(id: number, userId: number) {
    return this.db.query.trips.findFirst({
      where: (trip, { and }) => and(eq(trip.id, id), eq(trip.userId, userId)),
    });
  }

  async create(trip: NewTrip) {
    return this.db.insert(trips).values(trip).returning();
  }

  async update(id: number, trip: Partial<Trip>, userId: number) {}

  async remove(id: number, userId: number) {}
}
