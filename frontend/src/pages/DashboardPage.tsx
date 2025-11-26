import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SensorInputPanel } from '../modules/sensor/SensorInputPanel';
import { StatusPanel } from '../modules/prediction/StatusPanel';
import { TemperatureChart } from '../modules/prediction/TemperatureChart';
import { createSensorData, getPrediction } from '../services/api';
import type { PredictionResponse, RecordPoint } from '../types/prediction';

export const DashboardPage: React.FC = () => {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refreshPrediction = useCallback(async () => {
    setLoading(true);
    try {
      const latest = await getPrediction();
      setPrediction(latest);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPrediction();
  }, [refreshPrediction]);

  const handleSubmitTemperature = useCallback(
    async (temperature: number) => {
      setSubmitting(true);
      try {
        await createSensorData(temperature);
        await refreshPrediction();
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    },
    [refreshPrediction],
  );

  const latestRecords: RecordPoint[] = useMemo(() => {
    if (!prediction?.success || !prediction.data?.latestRecords) return [];
    return prediction.data.latestRecords;
  }, [prediction]);

  const summary = useMemo(() => {
    if (!prediction?.success || !prediction.data) return null;
    const { regression, prediction: details } = prediction.data;
    return {
      slope: regression.slope.toFixed(2),
      intercept: regression.intercept.toFixed(2),
      points: regression.pointsUsed,
      status: details.status,
      remainingHours: details.remainingHours,
    };
  }, [prediction]);

  return (
    <div className="page-shell">
      <header className="hero">
        <p className="eyebrow">Predictive Maintenance POC</p>
        <h1>Linear Regression จาก 10 จุดล่าสุด เพื่อทำนายเวลาแตะ 100°C</h1>
        <p className="subtitle">
          เก็บข้อมูลอุณหภูมิจากเซนเซอร์ แล้วทำ regression เพื่อคาดการณ์ระยะเวลาที่เครื่องจักรจะ overheat
        </p>
      </header>

      <section className="panel-grid">
        <div className="card sensor-card space">
          <SensorInputPanel onSubmit={handleSubmitTemperature} loading={submitting} />
        </div>
        <div className="card summary-card">
          <p className="eyebrow">Prediction Snapshot</p>
          {summary ? (
            <div className="summary-body">
              <div>
                <p className="label">Status</p>
                <strong className="value">{summary.status}</strong>
              </div>
              <div>
                <p className="label">Slope / Intercept</p>
                <span className="value">
                  {summary.slope} / {summary.intercept}
                </span>
              </div>
              <div>
                <p className="label">Points used</p>
                <span className="value">{summary.points}</span>
              </div>
              {typeof summary.remainingHours === 'number' && (
                <div>
                  <p className="label">Remaining hours</p>
                  <span className="value">{summary.remainingHours.toFixed(2)} ชม.</span>
                </div>
              )}
            </div>
          ) : (
            <p className="empty-state">รอข้อมูล prediction ล่าสุด</p>
          )}
        </div>
      </section>

      <section className="panel temperature-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Temperature Trend</p>
            <h2>ข้อมูลล่าสุดไม่เกิน 10 จุด</h2>
          </div>
          <span className="hint">แสดงค่าจาก JSON storage</span>
        </div>
        <TemperatureChart records={latestRecords} />
      </section>

      <section className="panel status-panel">
        <StatusPanel prediction={prediction} loading={loading} />
      </section>
    </div>
  );
};

