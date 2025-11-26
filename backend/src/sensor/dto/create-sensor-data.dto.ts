import { Expose, Type } from 'class-transformer';
import { IsISO8601, IsNumber, IsOptional } from 'class-validator';

export class CreateSensorDataDto {
  @Expose()
  @Type(() => Number)
  @IsNumber()
  temperature: number;

  @Expose()
  @IsOptional()
  @IsISO8601()
  timestamp?: string;
}

