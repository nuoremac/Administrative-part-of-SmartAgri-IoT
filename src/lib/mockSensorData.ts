export type SensorMeasure = {
  at: string;
  moisture: number;
  temperature: number;
  battery: number;
};

type RangeKey = "24h" | "7d" | "30d";

function seedFromId(id: string) {
  return id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function makeSeries(seed: number, range: RangeKey): SensorMeasure[] {
  const points = range === "24h" ? 24 : range === "7d" ? 7 : 10;
  const stepMs = range === "24h" ? 60 * 60 * 1000 : range === "7d" ? 24 * 60 * 60 * 1000 : 3 * 24 * 60 * 60 * 1000;
  const base = Date.parse("2026-01-02T12:00:00.000Z");

  return Array.from({ length: points }, (_, i) => {
    const at = new Date(base - (points - 1 - i) * stepMs).toISOString();
    const phase = (seed + i) % 12;
    const moisture = Math.round(40 + 15 * Math.sin(phase / 3) + (i % 3) * 2);
    const temperature = Math.round(18 + 6 * Math.cos(phase / 4) + (i % 4));
    const battery = Math.max(15, 100 - i * 2 - (seed % 7));
    return { at, moisture, temperature, battery };
  });
}

export function listSensorData(params: { sensorId: string; range?: RangeKey }): SensorMeasure[] {
  const range = params.range ?? "24h";
  return makeSeries(seedFromId(params.sensorId), range);
}

export function listParcelMoistureData(params: { parcelId: string; range?: RangeKey }) {
  const range = params.range ?? "24h";
  return makeSeries(seedFromId(params.parcelId), range).map((m) => ({
    at: m.at,
    value: m.moisture,
  }));
}
