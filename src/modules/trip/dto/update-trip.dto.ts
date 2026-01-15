import { PickType, PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTripDto } from './create-trip.dto';

export class UpdateTripDto extends PartialType(
  PickType(CreateTripDto, [
    'name',
    'destination',
    'startDate',
    'endDate',
  ] as const),
) {}
