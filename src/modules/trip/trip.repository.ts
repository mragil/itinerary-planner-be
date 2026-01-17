import { Injectable, Inject } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { DetailTrip, NewTrip, Trip, trips } from './trip.schema';
import { DatabaseModule, type Database } from '../../database.module';

@Injectable()
export class TripRepository {
  constructor(
    @Inject(DatabaseModule.DB_TOKEN)
    private readonly db: Database,
  ) {}

  async getAll(userId: number) {
    return await this.db.select().from(trips).where(eq(trips.userId, userId));
  }

  async getById(id: number, userId: number): Promise<DetailTrip | null> {
    const result = await this.db.execute<DetailTrip>(
      sql`
        SELECT 
          t.*,
          json_agg(
            json_build_object(
              'id', a.id,
              'tripId', a.trip_id,
              'name', a.name,
              'type', a.type,
              'notes', a.notes,
              'location', a.location,
              'startTime', a.start_time,
              'endTime', a.end_time,
              'cost', a.cost,
              'currency', a.currency,
              'isCompleted', a.is_completed,
              'createdAt', a.created_at,
              'updatedAt', a.updated_at
            ) ORDER BY a.created_at ASC
          ) FILTER (WHERE a.id IS NOT NULL) as activities
        FROM trips t
        LEFT JOIN activities a ON a.trip_id = t.id
        WHERE t.id = ${id} AND t.user_id = ${userId}
        GROUP BY t.id
        LIMIT 1
      `,
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      ...row,
      activities: row.activities ?? [],
    };
  }

  async create(trip: NewTrip) {
    const result = await this.db
      .insert(trips)
      .values({
        name: trip.name,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        isCompleted: trip.isCompleted ?? false,
        userId: trip.userId,
      })
      .returning();

    return result[0];
  }

  async update(id: number, trip: Partial<Trip>, userId: number) {
    if (Object.keys(trip).length === 0) {
      return null;
    }

    const result = await this.db
      .update(trips)
      .set(trip)
      .where(and(eq(trips.id, id), eq(trips.userId, userId)))
      .returning();

    return result[0] ?? null;
  }

  async remove(id: number, userId: number) {
    const result = await this.db
      .delete(trips)
      .where(and(eq(trips.id, id), eq(trips.userId, userId)))
      .returning();

    return result[0] ?? null;
  }
}
