import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { CurrentUser } from '../../decorators/current-user.decorators';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  create(
    @Body() createActivityDto: CreateActivityDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.activitiesService.create(createActivityDto, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Query('tripId') tripId: number,
    @Body() updateActivityDto: UpdateActivityDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.activitiesService.update(id, updateActivityDto, userId, tripId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: number,
    @Query('tripId') tripId: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.activitiesService.remove(id, tripId, userId);
  }
}
