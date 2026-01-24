import { Controller, Get, Inject } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { DatabaseModule } from '../../database.module';
import type { Database } from '../../database.module';
import { sql } from 'drizzle-orm';
import { Public } from '../../decorators/public.decorators';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private healthIndicator: HealthIndicatorService,
    @Inject(DatabaseModule.DB_TOKEN) private db: Database,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.isDbHealthy('database')]);
  }

  async isDbHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicator.check(key);
    try {
      await this.db.execute(sql`SELECT 1`);
      return indicator.up();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return indicator.down({ message });
    }
  }
}
