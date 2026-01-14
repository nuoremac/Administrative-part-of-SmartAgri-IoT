import { applyListParams, readFromStorage, writeToStorage, type ListParams, type ListResult } from "./mockStore";

export type ParcelRow = {
  id: string;
  nom: string;
  code: string;
  description: string;
  terrain_id: string;
  superficie: number;
  type_sol: string;
  statut: string;
  culture_actuelle: string;
  date_plantation: string;
  date_recolte_estimee: string;
  systeme_irrigation: string;
  nombre_capteurs: number;
  created_at: string;
  updated_at: string;
};

const LS_KEY = "smartagro_parcels_v2";

function seed(): ParcelRow[] {
  const terrains = ["T001", "T002", "T003", "T004", "T005", "T006"];
  const now = Date.now();

  const rows: ParcelRow[] = [];
  for (let i = 1; i <= 30; i++) {
    const id = `P${String(i).padStart(3, "0")}`;
    const created_at = new Date(now - (i % 10) * 86400000).toISOString();
    rows.push({
      id,
      nom: `Parcelle ${i}`,
      code: `PC-${String(i).padStart(3, "0")}`,
      description: "Parcelle agricole",
      terrain_id: terrains[i % terrains.length],
      superficie: 9000,
      type_sol: i % 2 === 0 ? "argileux" : "limoneux",
      statut: i % 9 === 0 ? "inactive" : "active",
      culture_actuelle: i % 2 === 0 ? "Maïs" : "Cacao",
      date_plantation: created_at,
      date_recolte_estimee: new Date(now + (i % 6) * 86400000).toISOString(),
      systeme_irrigation: "goutte_à_goutte",
      nombre_capteurs: (i % 7) + 1,
      created_at,
      updated_at: created_at,
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
  return applyListParams(readAll(), params, ["id", "nom", "code", "terrain_id", "statut", "type_sol"]);
}

export function createParcel(input: Omit<ParcelRow, "id" | "created_at" | "updated_at">): ParcelRow {
  const rows = readAll();
  const maxNum = Math.max(
    0,
    ...rows.map((p) => Number(p.id.replace("P", "")) || 0)
  );
  const id = `P${String(maxNum + 1).padStart(3, "0")}`;
  const now = new Date().toISOString();
  const parcel: ParcelRow = { ...input, id, created_at: now, updated_at: now };
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
  patch: Partial<Omit<ParcelRow, "id" | "created_at">>
): ParcelRow | null {
  const all = readAll();
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) return null;

  const updated: ParcelRow = {
    ...all[idx],
    ...patch,
    updated_at: new Date().toISOString(),
  };

  all[idx] = updated;
  writeAll(all);
  return updated;
}
