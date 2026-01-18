import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { CurrentUser } from '../../decorators/current-user.decorators';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('trips')
@ApiBearerAuth()
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  create(
    @Body() createTripDto: CreateTripDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.tripsService.create(createTripDto, userId);
  }

  @Get()
  findAll(@CurrentUser('sub') userId: number) {
    return this.tripsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('sub') userId: number) {
    return this.tripsService.findOne(+id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTripDto: UpdateTripDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.tripsService.update(+id, updateTripDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('sub') userId: number) {
    return this.tripsService.remove(+id, userId);
  }
}
