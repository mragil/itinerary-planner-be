import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { CurrentUser } from '../../decorators/current-user.decorators';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('trip')
@ApiBearerAuth()
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  create(
    @Body() createTripDto: CreateTripDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.tripService.create(createTripDto, userId);
  }

  @Get()
  findAll(@CurrentUser('sub') userId: number) {
    return this.tripService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('sub') userId: number) {
    return this.tripService.findOne(+id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTripDto: UpdateTripDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.tripService.update(+id, updateTripDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('sub') userId: number) {
    return this.tripService.remove(+id, userId);
  }
}
