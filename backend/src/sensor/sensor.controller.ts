import { Body, Controller, Post } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { CreateSensorDataDto } from './dto/create-sensor-data.dto';

@Controller('sensor-data')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  @Post()
  async create(@Body() body: CreateSensorDataDto) {
    const record = await this.sensorService.create(body);
    return { success: true, data: record };
  }
}
