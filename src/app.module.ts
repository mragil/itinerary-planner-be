import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { ItineraryModule } from './modules/itinerary/itinerary.module';
import { TripModule } from './modules/trip/trip.module';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './database.module';
import configuration from './config/configuration';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    AuthModule,
    ItineraryModule,
    TripModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(require('./middlewares/logger.middleware').LoggerMiddleware)
      .forRoutes('*');
  }
}
