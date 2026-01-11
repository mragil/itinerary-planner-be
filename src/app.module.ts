import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ItineraryModule } from './modules/itinerary/itinerary.module';
import { TripModule } from './modules/trip/trip.module';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './database.module';
import { UsersController } from './modules/users/users.controller';
import configuration from './config/configuration';
import { ConfigModule } from '@nestjs/config';

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
  controllers: [UsersController],
})
export class AppModule {}
