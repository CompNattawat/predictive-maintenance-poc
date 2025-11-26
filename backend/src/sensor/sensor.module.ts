import { Module } from '@nestjs/common';
import { SensorController } from './sensor.controller';
import { SensorService } from './sensor.service';
import { JsonStorageService } from '../common/file-storage/json-storage.service';

@Module({
  controllers: [SensorController],
  providers: [SensorService, JsonStorageService],
})
export class SensorModule {}
