import { applyListParams, readFromStorage, writeToStorage, type ListParams, type ListResult } from "./mockStore";

export type ParcelRow = {
  id: string; // e.g. P001
  name: string;
  owner: string;
  area: number; // m²
  sensors: number;
  terrainId: string;
  lastUpdate: string; // ISO
};

const LS_KEY = "smartagro_parcels_v1";

function seed(): ParcelRow[] {
  const owners = ["Raoul", "Traousse", "Yann", "Yanndr", "Itihh", "Firrriv", "Amina", "Koffi", "Nadia", "Jean"];
  const terrains = ["T001", "T002", "T003", "T004", "T005", "T006"];
  const now = Date.now();

  const rows: ParcelRow[] = [];
  for (let i = 1; i <= 30; i++) {
    const id = `P${String(i).padStart(3, "0")}`;
    const owner = owners[(i - 1) % owners.length];
    rows.push({
      id,
      name: `Parcelle ${i}`,
      owner,
      area: 9000, // match screenshot
      sensors: (i % 7) + 3,
      terrainId: terrains[i % terrains.length],
      lastUpdate: new Date(now - (i % 10) * 86400000).toISOString(),
    });
  }
  return rows;
}

function readAll(): ParcelRow[] {
  return readFromStorage<ParcelRow>(LS_KEY, seed);
}

function writeAll(rows: ParcelRow[]) {
  writeToStorage<ParcelRow>(LS_KEY, rows);
}

export function listParcels(params: ListParams = {}): ListResult<ParcelRow> {
  return applyListParams(readAll(), params, ["id", "name", "owner", "terrainId"]);
}

export function createParcel(input: Omit<ParcelRow, "id" | "lastUpdate">): ParcelRow {
  const rows = readAll();
  const maxNum = Math.max(
    0,
    ...rows.map((p) => Number(p.id.replace("P", "")) || 0)
  );
  const id = `P${String(maxNum + 1).padStart(3, "0")}`;
  const parcel: ParcelRow = { ...input, id, lastUpdate: new Date().toISOString() };
  rows.unshift(parcel);
  writeAll(rows);
  return parcel;
}

// export function updateParcel(id: string, patch: Partial<Omit<ParcelRow, "id">>): ParcelRow | null {
//   const rows = readAll();
//   const idx = rows.findIndex((p) => p.id === id);
//   if (idx < 0) return null;
//   const updated = { ...rows[idx], ...patch };
//   rows[idx] = updated;
//   writeAll(rows);
//   return updated;
// }

export function deleteParcel(id: string): ParcelRow | null {
  const rows = readAll();
  const idx = rows.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  const [removed] = rows.splice(idx, 1);
  writeAll(rows);
  return removed;
}

export function restoreParcel(parcel: ParcelRow) {
  const rows = readAll();
  if (rows.some((p) => p.id === parcel.id)) return;
  rows.unshift(parcel);
  writeAll(rows);
}

export function getParcel(id: string): ParcelRow | undefined {
  return readAll().find((p) => p.id === id);
}

export function updateParcel(
  id: string,
  patch: Partial<Pick<ParcelRow, "name" | "owner" | "area" | "sensors" | "terrainId" | "lastUpdate">>
): ParcelRow | null {
  const all = readAll();
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) return null;

  const updated: ParcelRow = {
    ...all[idx],
    ...patch,
    lastUpdate: patch.lastUpdate ?? new Date().toISOString(),
  };

  all[idx] = updated;
  writeAll(all);
  return updated;
}
