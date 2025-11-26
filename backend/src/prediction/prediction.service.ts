import { Injectable } from '@nestjs/common';
import { JsonStorageService } from '../common/file-storage/json-storage.service';
import {
  PREDICTION_THRESHOLD,
  PredictionData,
  PredictionDetails,
  PredictionResponse,
  PredictionStatus,
  RecordPoint,
  RegressionResult,
} from './prediction.types';

@Injectable()
export class PredictionService {
  constructor(private readonly storage: JsonStorageService) {}

  async getPrediction(): Promise<PredictionResponse> {
    const data = await this.storage.readAll();
    const records = this.normalizeRecords(data.records || []);

    if (records.length < 2) {
      return {
        success: false,
        errorCode: PredictionStatus.NOT_ENOUGH_DATA,
        message: 'ต้องมีข้อมูลอย่างน้อย 2 จุดเพื่อประเมินเทรนด์',
      };
    }

    const regression = this.calculateRegression(records);
    const latestRecord = records[records.length - 1];
    const hasOverheatPoint = latestRecord && latestRecord.temperature >= PREDICTION_THRESHOLD;
    const prediction = this.calculatePrediction(regression, records, hasOverheatPoint);

    const payload: PredictionData = {
      threshold: PREDICTION_THRESHOLD,
      latestRecords: records,
      regression,
      prediction,
    };

    return { success: true, data: payload };
  }

  private normalizeRecords(records: any[]): RecordPoint[] {
    return records
      .map(record => ({
        temperature: Number(record.temperature),
        timestamp: record.timestamp || new Date().toISOString(),
      }))
      .filter(
        (entry): entry is RecordPoint =>
          !Number.isNaN(entry.temperature) && typeof entry.timestamp === 'string',
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-10);
  }

  private calculateRegression(records: RecordPoint[]): RegressionResult {
    const n = records.length;
    const xs = records.map((_, index) => index + 1);
    const ys = records.map(record => record.temperature);
    const xMean = xs.reduce((sum, x) => sum + x, 0) / n;
    const yMean = ys.reduce((sum, y) => sum + y, 0) / n;

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      const dx = xs[i] - xMean;
      const dy = ys[i] - yMean;
      numerator += dx * dy;
      denominator += dx * dx;
    }

    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = yMean - slope * xMean;

    return { slope, intercept, pointsUsed: n };
  }

  private calculatePrediction(
    regression: RegressionResult,
    records: RecordPoint[],
    hasOverheatPoint: boolean,
  ): PredictionDetails {
    const lastTimestamp = records.length
      ? new Date(records[records.length - 1].timestamp)
      : new Date();

    if (hasOverheatPoint) {
      return {
        status: PredictionStatus.OVERHEATED,
        remainingHours: 0,
        predictedDateTime: lastTimestamp.toISOString(),
        message: 'มีค่าอุณหภูมิสูงกว่า 100°C ในข้อมูลล่าสุด',
      };
    }

    if (regression.slope <= 0) {
      return {
        status: PredictionStatus.NO_OVERHEAT_TREND,
        remainingHours: null,
        predictedDateTime: null,
        message: 'เทรนด์อุณหภูมิไม่สูงขึ้น พิจารณาว่ายังไม่ต้องเร่งซ่อม',
      };
    }

    const xTarget = (PREDICTION_THRESHOLD - regression.intercept) / regression.slope;
    const remainingHours = xTarget - regression.pointsUsed;

    if (!Number.isFinite(remainingHours)) {
      return {
        status: PredictionStatus.NO_OVERHEAT_TREND,
        remainingHours: null,
        predictedDateTime: null,
        message: 'ไม่สามารถประเมินเวลาที่จะถึง 100°C ได้ แต่อุณหภูมิยังมีแนวโน้มไม่ชัดเจน',
      };
    }

    if (remainingHours <= 0) {
      return {
        status: PredictionStatus.OVERHEATED,
        remainingHours,
        predictedDateTime: lastTimestamp.toISOString(),
        message: 'มีแนวโน้มว่าเครื่องอาจจะถึงหรือล้ำ Threshold 100°C แล้ว',
      };
    }

    const projected = new Date(lastTimestamp.getTime() + remainingHours * 60 * 60 * 1000);
    return {
      status: PredictionStatus.WILL_OVERHEAT,
      remainingHours,
      predictedDateTime: projected.toISOString(),
      message: 'อุณหภูมิกำลังเพิ่มขึ้น คาดว่าจะถึง 100°C ในอนาคตอันใกล้',
    };
  }
}
