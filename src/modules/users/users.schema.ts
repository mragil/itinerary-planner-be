import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { getTableColumns } from 'drizzle-orm/utils';
import { trips } from '../trip/trip.schema';
import { relations } from 'drizzle-orm/relations';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // bcrypt hash
  name: text('name').notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  roles: text('roles').array().default(['user']).notNull(),
  createdAt: timestamp('created_at', { precision: 3, mode: 'date' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { precision: 3, mode: 'date' })
    .defaultNow()
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  trips: many(trips),
}));

const { password, ...usersWithoutPassword } = getTableColumns(users);

export { usersWithoutPassword };
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
