import React, { useMemo, useState } from 'react';

interface Props {
  onSubmit: (temperature: number) => Promise<void>;
  loading?: boolean;
}

export const SensorInputPanel: React.FC<Props> = ({ onSubmit, loading = false }) => {
  const [value, setValue] = useState('');

  const isSubmitDisabled = useMemo(() => {
    const num = Number(value);
    return loading || Number.isNaN(num) || value.trim().length === 0;
  }, [value, loading]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    await onSubmit(parsed);
    setValue('');
  };

  const handleRandom = () => {
    const random = Math.round((60 + Math.random() * 60) * 10) / 10;
    setValue(random.toString());
  };

  return (
    <form className="sensor-form" onSubmit={handleSubmit}>
      <label className="sensor-form__label" htmlFor="temperature">
        Temperature (°C)
      </label>
      <input
        id="temperature"
        type="number"
        step="0.1"
        value={value}
        onChange={event => setValue(event.target.value)}
        placeholder="เช่น 76.5"
      />
      <div className="sensor-form__actions">
        <button type="button" className="ghost" onClick={handleRandom}>
          Random
        </button>
        <button type="submit" disabled={isSubmitDisabled}>
          {loading ? 'กำลังบันทึก...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

