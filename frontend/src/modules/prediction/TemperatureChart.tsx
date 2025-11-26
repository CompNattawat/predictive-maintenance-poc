import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { RecordPoint } from '../../types/prediction';

interface Props {
  records: RecordPoint[];
}

export const TemperatureChart: React.FC<Props> = ({ records }) => {
  if (!records || records.length === 0) {
    return <p className="empty-state">ยังไม่มีข้อมูลสำหรับแสดงกราฟ</p>;
  }

  const data = records.map((record, index) => ({
    idx: index + 1,
    temperature: record.temperature,
  }));

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="idx"
            label={{ value: 'Point', position: 'insideBottomRight', offset: -5 }}
          />
          <YAxis label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(1)} °C`, 'Temperature']}
            labelFormatter={value => `Point ${value}`}
          />
          <Line type="monotone" dataKey="temperature" stroke="#1d4ed8" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

