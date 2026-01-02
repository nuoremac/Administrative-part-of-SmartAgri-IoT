// src/lib/mockSensors.ts
export type SensorStatus = "ok" | "warning" | "offline";

export type SensorRow = {
  id: string;               // idCapteur
  name: string;             // nom capteur
  status: SensorStatus;     // statut
  lastMeasure: string;      // dernière mesure (text for now)
  lastMeasureAt: string;    // ISO date
  parcels: string[];        // parcelles associées (IDs)
};

const LS_KEY = "smartagro:sensors";
const EVT = "smartagro:sensors:changed";

const EMPTY_SENSORS: SensorRow[] = []; // ✅ stable reference for server snapshot

let cache: SensorRow[] | null = null;  // ✅ in-memory cache (stable snapshot)
let didInit = false;                   // ✅ avoid seeding during getSnapshot loop


function hasWindow() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function seed(): SensorRow[] {
  // 30 mock sensors with parcel links
  const now = Date.parse("2026-01-02T12:00:00.000Z");
  const parcelsPool = ["P001", "P002", "P003", "P004", "P005", "P006", "P007", "P008", "P009", "P010"];

  return Array.from({ length: 30 }, (_, i) => {
    const id = `S-${String(i + 1).padStart(3, "0")}`;
    const status: SensorStatus = i % 7 === 0 ? "offline" : i % 5 === 0 ? "warning" : "ok";
    const lastMeasure = i % 2 === 0 ? `${38 + (i % 18)}%` : `${19 + (i % 8)}°C`;

    const lastMeasureAt = new Date(now - (i % 12) * 60 * 60 * 1000).toISOString();

    const linked = [
      parcelsPool[i % parcelsPool.length],
      parcelsPool[(i + 3) % parcelsPool.length],
    ];

    return {
      id,
      name: `Capteur ${i + 1}`,
      status,
      lastMeasure,
      lastMeasureAt,
      parcels: Array.from(new Set(linked)),
    };
  });
}

function readAll(): SensorRow[] {
  if (!hasWindow()) return EMPTY_SENSORS;

  const raw = localStorage.getItem(LS_KEY);

  // ✅ Seed only once, without dispatching an event
  if (!raw) {
    const initial = seed();
    localStorage.setItem(LS_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as SensorRow[];
    return Array.isArray(parsed) ? parsed : EMPTY_SENSORS;
  } catch {
    return EMPTY_SENSORS;
  }
}


function writeAll(rows: SensorRow[]) {
  if (!hasWindow()) return;
  localStorage.setItem(LS_KEY, JSON.stringify(rows));
  cache = rows; // ✅ keep cache in sync
  window.dispatchEvent(new Event(EVT));
}




// ---- Public API ----

export function listSensors(): SensorRow[] {
  return getSensorsSnapshot();
}


export function getSensor(id: string): SensorRow | undefined {
  return getSensorsSnapshot().find((s) => s.id === id);
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

