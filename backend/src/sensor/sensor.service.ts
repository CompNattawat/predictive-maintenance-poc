import { Injectable } from '@nestjs/common';
import { JsonStorageService } from '../common/file-storage/json-storage.service';
import { CreateSensorDataDto } from './dto/create-sensor-data.dto';

@Injectable()
export class SensorService {
  constructor(private readonly storage: JsonStorageService) {}

  async create(dto: CreateSensorDataDto) {
    const timestamp = dto.timestamp || new Date().toISOString();
    const record = { temperature: dto.temperature, timestamp };

    const data = await this.storage.readAll();
    data.records.push(record);
    await this.storage.writeAll(data);

    return record;
  }
}
