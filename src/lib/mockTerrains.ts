import { applyListParams, readFromStorage, writeToStorage, type ListParams, type ListResult } from "./mockStore";

export type TerrainRow = {
  nom: string;
  description: string;
  type_terrain: string;
  localite_id: string;
  latitude: number;
  longitude: number;
  superficie_totale: number;
  perimetre: number;
  pente: number;
  date_acquisition: string;
  id: string;
  statut: string;
  user_id: string;
  nombre_parcelles: number;
  created_at: string;
  updated_at: string;
};

const LS_KEY = "smartagro_terrains_v2";

function seed(): TerrainRow[] {
  const localites = ["L001", "L002", "L003", "L004", "L005", "L006"];
  const now = Date.now();

  return Array.from({ length: 12 }, (_, i) => {
    const id = `T${String(i + 1).padStart(3, "0")}`;
    const created_at = new Date(now - (i + 2) * 86400000).toISOString();
    return {
      id,
      nom: `Terrain ${i + 1}`,
      description: "Terrain agricole",
      type_terrain: "agricole",
      localite_id: localites[i % localites.length],
      latitude: 3.8 + (i % 3) * 0.2,
      longitude: 11.5 + (i % 3) * 0.3,
      superficie_totale: 12000 + (i % 5) * 1500,
      perimetre: 400 + (i % 5) * 20,
      pente: 5 + (i % 6),
      date_acquisition: created_at,
      statut: i % 5 === 0 ? "inactif" : "actif",
      user_id: `u${(i % 10) + 1}`,
      nombre_parcelles: (i % 6) + 1,
      created_at,
      updated_at: created_at,
    };
  });
}

function readAll(): TerrainRow[] {
  return readFromStorage<TerrainRow>(LS_KEY, seed);
}

function writeAll(rows: TerrainRow[]) {
  writeToStorage<TerrainRow>(LS_KEY, rows);
}

export function listTerrains(params: ListParams = {}): ListResult<TerrainRow> {
  return applyListParams(readAll(), params, ["id", "nom", "description", "type_terrain", "localite_id", "statut"]);
}

export function getTerrain(id: string): TerrainRow | undefined {
  return readAll().find((t) => t.id === id);
}

export function createTerrain(
  input: Omit<TerrainRow, "id" | "created_at" | "updated_at">
): TerrainRow {
  const rows = readAll();
  const maxNum = Math.max(0, ...rows.map((t) => Number(t.id.replace("T", "")) || 0));
  const id = `T${String(maxNum + 1).padStart(3, "0")}`;
  const now = new Date().toISOString();
  const terrain: TerrainRow = { ...input, id, created_at: now, updated_at: now };
  rows.unshift(terrain);
  writeAll(rows);
  return terrain;
}

export function updateTerrain(
  id: string,
  patch: Partial<Omit<TerrainRow, "id" | "created_at">>
): TerrainRow | null {
  const rows = readAll();
  const idx = rows.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  const updated: TerrainRow = {
    ...rows[idx],
    ...patch,
    updated_at: new Date().toISOString(),
  };
  rows[idx] = updated;
  writeAll(rows);
  return updated;
}

export function deleteTerrain(id: string): TerrainRow | null {
  const rows = readAll();
  const idx = rows.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  const [removed] = rows.splice(idx, 1);
  writeAll(rows);
  return removed;
}

export function restoreTerrain(terrain: TerrainRow) {
  const rows = readAll();
  if (rows.some((t) => t.id === terrain.id)) return;
  writeAll([terrain, ...rows]);
}
