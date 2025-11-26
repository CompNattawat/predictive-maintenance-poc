import { Test, TestingModule } from '@nestjs/testing';
import { PredictionService } from './prediction.service';
import { JsonStorageService } from '../common/file-storage/json-storage.service';

describe('PredictionService', () => {
  let service: PredictionService;
  let storage: JsonStorageService;

  const mockStorage = {
    readAll: jest.fn(),
    writeAll: jest.fn(),
  } as unknown as JsonStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PredictionService,
        {
          provide: JsonStorageService,
          useValue: mockStorage,
        },
      ],
    }).compile();

    service = module.get<PredictionService>(PredictionService);
    storage = module.get<JsonStorageService>(JsonStorageService);
    jest.clearAllMocks();
  });

  it('ควรคืน NOT_ENOUGH_DATA ถ้าข้อมูลน้อยกว่า 2 จุด', async () => {
    (storage.readAll as any).mockResolvedValue({
      records: [
        { temperature: 80, timestamp: new Date().toISOString() },
      ],
    });

    const result = await service.getPrediction();

    expect(result.success).toBe(false);
    if ('errorCode' in result) {
      expect(result.errorCode).toBe('NOT_ENOUGH_DATA');
    }
  });

  it('ควรคืน NO_OVERHEAT_TREND ถ้า slope ≤ 0 (อุณหภูมิลดลง)', async () => {
    const now = new Date();
    (storage.readAll as any).mockResolvedValue({
      records: [
        { temperature: 100, timestamp: new Date(now.getTime() - 3 * 3600_000).toISOString() },
        { temperature: 90, timestamp: new Date(now.getTime() - 2 * 3600_000).toISOString() },
        { temperature: 85, timestamp: new Date(now.getTime() - 1 * 3600_000).toISOString() },
      ],
    });

    const result = await service.getPrediction();

    expect(result.success).toBe(true);
    if ('data' in result) {
      expect(result.data.prediction.status).toBe('NO_OVERHEAT_TREND');
    }
  });

  it('ควรคืน WILL_OVERHEAT ถ้าแนวโน้มอุณหภูมิสูงขึ้น (slope > 0)', async () => {
    const now = new Date();
    (storage.readAll as any).mockResolvedValue({
      records: [
        { temperature: 70, timestamp: new Date(now.getTime() - 4 * 3600_000).toISOString() },
        { temperature: 80, timestamp: new Date(now.getTime() - 3 * 3600_000).toISOString() },
        { temperature: 90, timestamp: new Date(now.getTime() - 2 * 3600_000).toISOString() },
        { temperature: 95, timestamp: new Date(now.getTime() - 1 * 3600_000).toISOString() },
      ],
    });

    const result = await service.getPrediction();

    expect(result.success).toBe(true);
    if ('data' in result) {
      expect(result.data.regression.slope).toBeGreaterThan(0);
      expect(result.data.prediction.status).toBe('WILL_OVERHEAT');
      expect(result.data.prediction.remainingHours).not.toBeNull();
    }
  });

  it('ควรคืน OVERHEATED ถ้า remainingHours ≤ 0', async () => {
    const now = new Date();
    // ข้อมูลที่สูงมากอยู่แล้ว เพื่อให้ model ประเมินว่าเกิน 100C ไปแล้ว
    (storage.readAll as any).mockResolvedValue({
      records: [
        { temperature: 110, timestamp: new Date(now.getTime() - 2 * 3600_000).toISOString() },
        { temperature: 120, timestamp: new Date(now.getTime() - 1 * 3600_000).toISOString() },
      ],
    });

    const result = await service.getPrediction();

    expect(result.success).toBe(true);
    if ('data' in result) {
      expect(result.data.prediction.status).toBe('OVERHEATED');
    }
  });
});