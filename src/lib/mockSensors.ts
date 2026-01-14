import { applyListParams, readFromStorage, writeToStorage, type ListParams, type ListResult } from "./mockStore";

export type SensorRow = {
  nom: string;
  dev_eui: string;
  parcelle_id: string;
  code: string;
  date_installation: string;
  date_activation: string;
  id: string;
  created_at: string;
  updated_at: string;
};

const LS_KEY = "smartagro:sensors:v2";
const EVT = "smartagro:sensors:changed";

const EMPTY_SENSORS: SensorRow[] = [];

let cache: SensorRow[] | null = null;
let didInit = false;

function hasWindow() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function seed(): SensorRow[] {
  const now = Date.parse("2026-01-02T12:00:00.000Z");
  const parcelsPool = ["P001", "P002", "P003", "P004", "P005", "P006", "P007", "P008", "P009", "P010"];

  return Array.from({ length: 30 }, (_, i) => {
    const id = `S-${String(i + 1).padStart(3, "0")}`;
    const ts = new Date(now - (i % 12) * 60 * 60 * 1000).toISOString();
    return {
      id,
      nom: `Capteur ${i + 1}`,
      dev_eui: `70B3D57ED005E${String(100 + i).padStart(3, "0")}`,
      parcelle_id: parcelsPool[i % parcelsPool.length],
      code: `CPT-${String(i + 1).padStart(3, "0")}`,
      date_installation: ts,
      date_activation: ts,
      created_at: ts,
      updated_at: ts,
    };
  });
}

function readAll(): SensorRow[] {
  if (!hasWindow()) return EMPTY_SENSORS;
  return readFromStorage<SensorRow>(LS_KEY, seed);
}

function writeAll(rows: SensorRow[]) {
  if (!hasWindow()) return;
  writeToStorage<SensorRow>(LS_KEY, rows);
  cache = rows;
  window.dispatchEvent(new Event(EVT));
}




// ---- Public API ----

export function listSensors(params: ListParams = {}): ListResult<SensorRow> {
  return applyListParams(getSensorsSnapshot(), params, ["id", "nom", "dev_eui", "parcelle_id", "code"]);
}


export function getSensor(id: string): SensorRow | undefined {
  return getSensorsSnapshot().find((s) => s.id === id);
}

export function createSensor(input: Omit<SensorRow, "id" | "created_at" | "updated_at">): SensorRow {
  const all = readAll();
  const maxNum = Math.max(0, ...all.map((s) => Number(s.id.replace("S-", "")) || 0));
  const id = `S-${String(maxNum + 1).padStart(3, "0")}`;
  const now = new Date().toISOString();
  const sensor: SensorRow = { ...input, id, created_at: now, updated_at: now };
  writeAll([sensor, ...all]);
  return sensor;
}

export function updateSensor(id: string, patch: Partial<Omit<SensorRow, "id" | "created_at">>): SensorRow | null {
  const all = readAll();
  const idx = all.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  const updated = { ...all[idx], ...patch, updated_at: new Date().toISOString() };
  all[idx] = updated;
  writeAll(all);
  return updated;
}


export function deleteSensor(id: string): SensorRow | null {
  const all = readAll();
  const idx = all.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  const removed = all[idx];
  all.splice(idx, 1);
  writeAll(all);
  return removed;
}

export function restoreSensor(sensor: SensorRow) {
  const all = readAll();
  if (all.some((s) => s.id === sensor.id)) return;
  writeAll([sensor, ...all]);
}

// ---- useSyncExternalStore support ----
export function subscribeSensors(onStoreChange: () => void) {
  if (!hasWindow()) return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(EVT, handler);
  return () => window.removeEventListener(EVT, handler);
}

export function getSensorsSnapshot(): SensorRow[] {
  // ✅ init cache once (no dispatch here)
  if (!hasWindow()) return EMPTY_SENSORS;

  if (!didInit) {
    didInit = true;
    cache = readAll();
    return cache ?? EMPTY_SENSORS;
  }

  // ✅ after init: always return cache (stable)
  if (cache) return cache;

  // fallback
  cache = readAll();
  return cache ?? EMPTY_SENSORS;
}

export function getSensorsServerSnapshot(): SensorRow[] {
  return EMPTY_SENSORS; // ✅ stable cached array
}
