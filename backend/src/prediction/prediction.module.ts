import { Module } from '@nestjs/common';
import { PredictionController } from './prediction.controller';
import { PredictionService } from './prediction.service';
import { JsonStorageService } from '../common/file-storage/json-storage.service';

@Module({
  controllers: [PredictionController],
  providers: [PredictionService, JsonStorageService],
})
export class PredictionModule {}
