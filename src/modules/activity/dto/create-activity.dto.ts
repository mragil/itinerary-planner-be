import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class CreateActivityDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  tripId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startTime: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  endTime: Date;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  cost?: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}
