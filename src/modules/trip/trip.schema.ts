import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';
import { users } from '../users/users.schema';
import { relations } from 'drizzle-orm/relations';

export const trips = pgTable('trips', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  destination: text('destination').notNull(),
  startDate: timestamp('start_date', { precision: 3, mode: 'date' }).notNull(),
  endDate: timestamp('end_date', { precision: 3, mode: 'date' }).notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { precision: 3, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { precision: 3, mode: 'date' })
    .defaultNow()
    .notNull(),
});

export const tripsRelations = relations(trips, ({ one }) => ({
  user: one(users, {
    fields: [trips.userId],
    references: [users.id],
  }),
}));

export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
