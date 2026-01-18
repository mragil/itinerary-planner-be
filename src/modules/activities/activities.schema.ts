import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';
import { trips } from '../trips/trips.schema';

export const activities = pgTable('activities', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  notes: text('notes'),
  location: text('location').notNull(),
  startTime: timestamp('start_time', { precision: 3, mode: 'date' }).notNull(),
  endTime: timestamp('end_time', { precision: 3, mode: 'date' }).notNull(),
  cost: integer('cost'),
  currency: varchar('currency', { length: 3 }).default('IDR'),
  isCompleted: boolean('is_completed').default(false).notNull(),
  tripId: integer('trip_id')
    .notNull()
    .references(() => trips.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { precision: 3, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { precision: 3, mode: 'date' })
    .defaultNow()
    .notNull(),
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  trip: one(trips, {
    fields: [activities.tripId],
    references: [trips.id],
  }),
}));

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
