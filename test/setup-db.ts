import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from '../src/db-schema';
import { Database } from '../src/database.module';

export const insertUser = async (
  db: Database,
  email: string,
  password: string,
  name: string,
) => {
  const [user] = await db
    .insert(schema.users)
    .values({
      email,
      password,
      name,
    })
    .returning();
  return user;
};

export const setupDatabase = async () => {
  const postgresContainer = await new PostgreSqlContainer(
    'postgres:15',
  ).start();
  const pool = new Pool({
    connectionString: postgresContainer.getConnectionUri(),
  });
  const testDb = drizzle(pool, { schema });
  await migrate(testDb, { migrationsFolder: './migrations' });

  const tearDownDb = async () => {
    await pool.end();
    await postgresContainer.stop();
  };

  return { testDb, pool, tearDownDb };
};
