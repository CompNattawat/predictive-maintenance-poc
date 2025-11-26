const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || `Request failed: ${res.status}`);
  }
  return json;
}

export function createSensorData(temperature: number) {
  return request('/sensor-data', {
    method: 'POST',
    body: JSON.stringify({ temperature }),
  });
}

export function getPrediction() {
  return request('/prediction');
}
