export type SensorMeasure = {
  id: string;
  ph: number;
  azote: number;
  phosphore: number;
  potassium: number;
  humidity: number;
  temperature: number;
  capteur_id: string;
  timestamp: string;
  measurements: Record<string, unknown>;
  parcelle_id: string;
  created_at: string;
  updated_at: string;
};

type RangeKey = "24h" | "7d" | "30d";

function seedFromId(id: string) {
  return id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function makeSeries(capteurId: string, parcelleId: string, seed: number, range: RangeKey): SensorMeasure[] {
  const points = range === "24h" ? 24 : range === "7d" ? 7 : 10;
  const stepMs = range === "24h" ? 60 * 60 * 1000 : range === "7d" ? 24 * 60 * 60 * 1000 : 3 * 24 * 60 * 60 * 1000;
  const base = Date.parse("2026-01-02T12:00:00.000Z");

  return Array.from({ length: points }, (_, i) => {
    const timestamp = new Date(base - (points - 1 - i) * stepMs).toISOString();
    const phase = (seed + i) % 12;
    const humidity = Math.round(40 + 15 * Math.sin(phase / 3) + (i % 3) * 2);
    const temperature = Math.round(18 + 6 * Math.cos(phase / 4) + (i % 4));
    const ph = Number((6 + (i % 3) * 0.3).toFixed(1));
    return {
      id: `m-${capteurId}-${i}`,
      ph,
      azote: 20 + (i % 6) * 3,
      phosphore: 15 + (i % 5) * 2,
      potassium: 18 + (i % 4) * 2,
      humidity,
      temperature,
      capteur_id: capteurId,
      timestamp,
      measurements: {},
      parcelle_id: parcelleId,
      created_at: timestamp,
      updated_at: timestamp,
    };
  });
}

export function listSensorData(params: { capteur_id: string; parcelle_id: string; range?: RangeKey }): SensorMeasure[] {
  const range = params.range ?? "24h";
  return makeSeries(params.capteur_id, params.parcelle_id, seedFromId(params.capteur_id), range);
}

export function listParcelMoistureData(params: { parcelle_id: string; range?: RangeKey }) {
  const range = params.range ?? "24h";
  return makeSeries(`S-${params.parcelle_id}`, params.parcelle_id, seedFromId(params.parcelle_id), range).map((m) => ({
    timestamp: m.timestamp,
    humidity: m.humidity,
  }));
}

export function listParcelMeasurements(params: { parcelle_id: string; range?: RangeKey }) {
  const range = params.range ?? "24h";
  return makeSeries(`S-${params.parcelle_id}`, params.parcelle_id, seedFromId(params.parcelle_id), range);
}

export function getLatestMeasurement(params: { capteur_id: string; parcelle_id: string }) {
  const [latest] = listSensorData({ capteur_id: params.capteur_id, parcelle_id: params.parcelle_id, range: "24h" }).slice(-1);
  return latest ?? null;
}
