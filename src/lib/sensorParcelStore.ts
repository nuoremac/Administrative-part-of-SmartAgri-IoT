const STORE_KEY = "smartagro:sensor_parcel_map";

type SensorParcelMap = Record<string, string>;

const hasWindow = () => typeof window !== "undefined" && typeof localStorage !== "undefined";

export function getSensorParcelMap(): SensorParcelMap {
  if (!hasWindow()) return {};
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as SensorParcelMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function setSensorParcelLink(sensorCode: string, parcelCode: string) {
  if (!hasWindow()) return;
  const current = getSensorParcelMap();
  current[sensorCode] = parcelCode;
  localStorage.setItem(STORE_KEY, JSON.stringify(current));
}

export function clearSensorParcelLink(sensorCode: string) {
  if (!hasWindow()) return;
  const current = getSensorParcelMap();
  if (!(sensorCode in current)) return;
  delete current[sensorCode];
  localStorage.setItem(STORE_KEY, JSON.stringify(current));
}
