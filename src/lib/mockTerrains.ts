import { applyListParams, readFromStorage, writeToStorage, type ListParams, type ListResult } from "./mockStore";

export type TerrainRow = {
  id: string;
  name: string;
  owner: string;
  area: number;
  localiteId: string;
  createdAt: string;
  updatedAt: string;
};

const LS_KEY = "smartagro_terrains_v1";

function seed(): TerrainRow[] {
  const localites = ["L001", "L002", "L003", "L004", "L005", "L006"];
  const owners = ["Nadia", "Jean", "Amina", "Koffi", "Samuel", "Grace"];
  const now = Date.now();

  return Array.from({ length: 12 }, (_, i) => {
    const id = `T${String(i + 1).padStart(3, "0")}`;
    const createdAt = new Date(now - (i + 2) * 86400000).toISOString();
    return {
      id,
      name: `Terrain ${i + 1}`,
      owner: owners[i % owners.length],
      area: 12000 + (i % 5) * 1500,
      localiteId: localites[i % localites.length],
      createdAt,
      updatedAt: createdAt,
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
  return applyListParams(readAll(), params, ["id", "name", "owner", "localiteId"]);
}

export function getTerrain(id: string): TerrainRow | undefined {
  return readAll().find((t) => t.id === id);
}

export function createTerrain(input: Omit<TerrainRow, "id" | "createdAt" | "updatedAt">): TerrainRow {
  const rows = readAll();
  const maxNum = Math.max(0, ...rows.map((t) => Number(t.id.replace("T", "")) || 0));
  const id = `T${String(maxNum + 1).padStart(3, "0")}`;
  const now = new Date().toISOString();
  const terrain: TerrainRow = { ...input, id, createdAt: now, updatedAt: now };
  rows.unshift(terrain);
  writeAll(rows);
  return terrain;
}

export function updateTerrain(
  id: string,
  patch: Partial<Omit<TerrainRow, "id" | "createdAt">>
): TerrainRow | null {
  const rows = readAll();
  const idx = rows.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  const updated: TerrainRow = {
    ...rows[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
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
