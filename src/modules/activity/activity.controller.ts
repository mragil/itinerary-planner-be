import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { CurrentUser } from '../../decorators/current-user.decorators';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  create(
    @Body() createActivityDto: CreateActivityDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.activityService.create(createActivityDto, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Query('tripId') tripId: number,
    @Body() updateActivityDto: UpdateActivityDto,
    @CurrentUser('sub') userId: number,
  ) {
    return this.activityService.update(id, updateActivityDto, userId, tripId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: number,
    @Query('tripId') tripId: number,
    @CurrentUser('sub') userId: number,
  ) {
    return this.activityService.remove(id, tripId, userId);
  }
}
