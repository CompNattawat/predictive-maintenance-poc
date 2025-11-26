import React from 'react';
import { PredictionStatus } from '../../types/prediction';
import type { PredictionResponse } from '../../types/prediction';

const STATUS_COLORS: Record<PredictionStatus, string> = {
  [PredictionStatus.NOT_ENOUGH_DATA]: '#fff3cd',
  [PredictionStatus.NO_OVERHEAT_TREND]: '#d1e7dd',
  [PredictionStatus.WILL_OVERHEAT]: '#fff4e5',
  [PredictionStatus.OVERHEATED]: '#f8d7da',
};

interface Props {
  prediction: PredictionResponse | null;
  loading: boolean;
}

export const STATUS_LABELS: Record<PredictionStatus, string> = {
  [PredictionStatus.NOT_ENOUGH_DATA]: 'จำนวนข้อมูลยังไม่เพียงพอสำหรับประมวลผล',
  [PredictionStatus.NO_OVERHEAT_TREND]: 'ไม่พบแนวโน้มความเสี่ยง Overheat',
  [PredictionStatus.WILL_OVERHEAT]: 'มีแนวโน้มจะเกิด Overheat',
  [PredictionStatus.OVERHEATED]: 'อุณหภูมิเกินค่าปลอดภัยแล้ว (Overheated)',
};

export const formatRemainingHours = (hours: number) => {
  if (!Number.isFinite(hours)) return '-';
  const isNegative = hours < 0;
  const absolute = Math.abs(hours);
  const wholeHours = Math.floor(absolute);
  const minutes = Math.round((absolute - wholeHours) * 60);

  const parts = [];
  if (wholeHours > 0) parts.push(`${wholeHours} ชม.`);
  if (minutes > 0) parts.push(`${minutes} นาที`);
  const formatted = parts.length > 0 ? parts.join(' ') : '0 นาที';
  return isNegative ? `-${formatted}` : formatted;
};

const formatDatetime = (value: string) => {
  try {
    return new Date(value).toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return value;
  }
};

export const StatusPanel: React.FC<Props> = ({ prediction, loading }) => {
  if (loading && !prediction) {
    return <p className="empty-state">Loading prediction...</p>;
  }

  if (!prediction) {
    return <p className="empty-state">ยังไม่มีข้อมูลการทำนาย</p>;
  }

  if (!prediction.success) {
    return (
      <div className="status-panel__content status-panel__content--error">
        <strong>Error:</strong> {prediction.message || prediction.errorCode}
      </div>
    );
  }

  const details = prediction.data?.prediction;
  if (!details) {
    return <p className="empty-state">ไม่มีข้อมูล prediction</p>;
  }

  const accentColor = STATUS_COLORS[details.status] ?? '#d1e7dd';

  return (
    <div className="status-panel__content" style={{ background: accentColor }}>
      <h2>สถานะการทำนาย</h2>
      <p>
        <strong>สถานะ:</strong> {STATUS_LABELS[details.status]}
      </p>
      {typeof details.remainingHours === 'number' && (
        <p>
          <strong>เวลาเหลือ:</strong> {formatRemainingHours(details.remainingHours)}
        </p>
      )}
      {details.predictedDateTime && (
        <p>
          <strong>เวลาที่คาดว่าจะถึง:</strong> {formatDatetime(details.predictedDateTime)}
        </p>
      )}
      {details.message && <p className="status-panel__message">{details.message}</p>}
    </div>
  );
};

