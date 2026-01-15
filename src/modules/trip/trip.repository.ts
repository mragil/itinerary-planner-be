import { Injectable, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { NewTrip, Trip } from './trip.schema';
import { DatabaseModule, type Database } from '../../database.module';

@Injectable()
export class TripRepository {
  constructor(
    @Inject(DatabaseModule.DB_TOKEN)
    private readonly db: Database,
  ) {}

  async getAll(userId: number) {
    const result = await this.db.execute<Trip>(
      sql`SELECT * FROM trips WHERE user_id = ${userId}`,
    );
    return result.rows;
  }

  async getById(id: number, userId: number) {
    const result = await this.db.execute<Trip>(
      sql`SELECT * FROM trips WHERE id = ${id} AND user_id = ${userId} LIMIT 1`,
    );
    return result.rows[0] ?? null;
  }

  async create(trip: NewTrip) {
    const result = await this.db.execute<Trip>(
      sql`
        INSERT INTO trips (
          name, 
          destination, 
          start_date, 
          end_date, 
          is_completed,
          user_id
        )
        VALUES (
          ${trip.name},
          ${trip.destination},
          ${trip.startDate},
          ${trip.endDate},
          ${trip.isCompleted ?? false},
          ${trip.userId}
        )
        RETURNING
          id,
          name, 
          destination, 
          start_date, 
          end_date, 
          is_completed,
          user_id
      `,
    );
    return result.rows;
  }

  async update(id: number, trip: Partial<Trip>, userId: number) {
    const setClauses: ReturnType<typeof sql>[] = [];

    if (trip.name !== undefined) {
      setClauses.push(sql`name = ${trip.name}`);
    }
    if (trip.destination !== undefined) {
      setClauses.push(sql`destination = ${trip.destination}`);
    }
    if (trip.startDate !== undefined) {
      setClauses.push(sql`start_date = ${trip.startDate}`);
    }
    if (trip.endDate !== undefined) {
      setClauses.push(sql`end_date = ${trip.endDate}`);
    }
    if (trip.isCompleted !== undefined) {
      setClauses.push(sql`is_completed = ${trip.isCompleted}`);
    }

    // Always update updatedAt
    setClauses.push(sql`updated_at = NOW()`);

    if (setClauses.length === 1) {
      // Only updatedAt
      return null;
    }

    const result = await this.db.execute<Trip>(
      sql`
      UPDATE trips
      SET ${sql.join(setClauses, sql`, `)}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING
          id,
          name, 
          destination, 
          start_date, 
          end_date, 
          is_completed,
          user_id
    `,
    );

    if (result.rowCount === 0) {
      return null;
    }

    return result.rows;
  }

  async remove(id: number, userId: number) {
    const result = await this.db.execute<Trip>(
      sql`
        DELETE FROM trips
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING
          id,
          name, 
          destination, 
          start_date, 
          end_date, 
          is_completed,
          user_id
      `,
    );
    if (result.rowCount === 0) {
      return null;
    }
    return result.rows;
  }
}
