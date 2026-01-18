import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { NewActivity, Activity, activities } from './activities.schema';
import { DatabaseModule, type Database } from '../../database.module';

@Injectable()
export class ActivitiesRepository {
  constructor(
    @Inject(DatabaseModule.DB_TOKEN)
    private readonly db: Database,
  ) {}

  async findAll(tripId: number): Promise<Activity[]> {
    return await this.db
      .select()
      .from(activities)
      .where(eq(activities.tripId, tripId));
  }

  async create(activity: NewActivity): Promise<Activity> {
    const result = await this.db
      .insert(activities)
      .values({
        name: activity.name,
        type: activity.type,
        notes: activity.notes ?? null,
        location: activity.location,
        startTime: activity.startTime,
        endTime: activity.endTime,
        cost: activity.cost ?? null,
        currency: activity.currency,
        isCompleted: activity.isCompleted,
        tripId: activity.tripId,
      })
      .returning();

    return result[0];
  }

  async update(
    id: number,
    activity: Partial<Activity>,
    tripId: number,
  ): Promise<Activity | null> {
    const result = await this.db
      .update(activities)
      .set(activity)
      .where(and(eq(activities.id, id), eq(activities.tripId, tripId)))
      .returning();

    return result[0] ?? null;
  }

  async delete(id: number, tripId: number): Promise<Activity | null> {
    const result = await this.db
      .delete(activities)
      .where(and(eq(activities.id, id), eq(activities.tripId, tripId)))
      .returning();

    return result[0] ?? null;
  }
}
