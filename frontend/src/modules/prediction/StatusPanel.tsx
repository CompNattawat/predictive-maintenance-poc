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
      <h2>Prediction Status</h2>
      <p>
        <strong>Status:</strong> {details.status}
      </p>
      {typeof details.remainingHours === 'number' && (
        <p>
          <strong>Remaining Hours:</strong> {details.remainingHours.toFixed(2)} ชม.
        </p>
      )}
      {details.predictedDateTime && (
        <p>
          <strong>Predicted Datetime:</strong>{' '}
          {new Date(details.predictedDateTime).toLocaleString()}
        </p>
      )}
      {details.message && <p className="status-panel__message">{details.message}</p>}
    </div>
  );
};

