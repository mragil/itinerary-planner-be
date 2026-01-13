import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './db-schema';

export type Database = ReturnType<typeof drizzle<typeof schema>>;
const DB_TOKEN = 'database';

@Module({
  providers: [
    {
      provide: DB_TOKEN,
      useFactory: (config: ConfigService) => {
        return drizzle(
          new Pool({ connectionString: config.get<string>('DATABASE_URL') }),
          { schema },
        );
      },
      inject: [ConfigService],
    },
  ],
  exports: [DB_TOKEN],
})
export class DatabaseModule {
  static readonly DB_TOKEN = DB_TOKEN;
}
