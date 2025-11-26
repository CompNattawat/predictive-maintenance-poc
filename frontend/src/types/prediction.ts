export enum PredictionStatus {
  NOT_ENOUGH_DATA = 'NOT_ENOUGH_DATA',
  NO_OVERHEAT_TREND = 'NO_OVERHEAT_TREND',
  WILL_OVERHEAT = 'WILL_OVERHEAT',
  OVERHEATED = 'OVERHEATED',
}

export interface RecordPoint {
  temperature: number;
  timestamp: string;
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  pointsUsed: number;
}

export interface PredictionDetails {
  status: PredictionStatus;
  remainingHours: number | null;
  predictedDateTime: string | null;
  message?: string;
}

export interface PredictionData {
  threshold: number;
  latestRecords: RecordPoint[];
  regression: RegressionResult;
  prediction: PredictionDetails;
}

export type PredictionResponse =
  | { success: true; data: PredictionData }
  | { success: false; errorCode?: string; message?: string };

