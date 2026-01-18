import { PickType, PartialType } from '@nestjs/mapped-types';
import { CreateTripDto } from './create-trip.dto';

export class UpdateTripDto extends PartialType(
  PickType(CreateTripDto, [
    'name',
    'destination',
    'startDate',
    'endDate',
  ] as const),
) {}
