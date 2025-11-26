import { Module } from '@nestjs/common';
import { SensorModule } from './sensor/sensor.module';
import { PredictionModule } from './prediction/prediction.module';
import { JsonStorageService } from './common/file-storage/json-storage.service';

@Module({
  imports: [SensorModule, PredictionModule],
  providers: [JsonStorageService],
  exports: [JsonStorageService],
})
export class AppModule {}
