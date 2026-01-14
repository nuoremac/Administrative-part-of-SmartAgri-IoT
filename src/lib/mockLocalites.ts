import { applyListParams, readFromStorage, writeToStorage, type ListParams, type ListResult } from "./mockStore";

export type Localite = {
  id: string;
  name: string;
  city: string;
  country: string;
};

const LS_KEY = "smartagro_localites_v1";

function seed(): Localite[] {
  return [
    { id: "L001", name: "Zone Nord", city: "Douala", country: "Cameroun" },
    { id: "L002", name: "Plateau Est", city: "Yaounde", country: "Cameroun" },
    { id: "L003", name: "Vallée Ouest", city: "Bafoussam", country: "Cameroun" },
    { id: "L004", name: "Terres Rouge", city: "Garoua", country: "Cameroun" },
    { id: "L005", name: "Plaine Verte", city: "Buea", country: "Cameroun" },
    { id: "L006", name: "Bassin Sud", city: "Kribi", country: "Cameroun" },
  ];
}

function readAll(): Localite[] {
  return readFromStorage<Localite>(LS_KEY, seed);
}

function writeAll(rows: Localite[]) {
  writeToStorage<Localite>(LS_KEY, rows);
}

export function formatLocalite(localite: Localite) {
  return `${localite.name} — ${localite.city}, ${localite.country}`;
}

export function listLocalites(params: ListParams = {}): ListResult<Localite> {
  return applyListParams(readAll(), params, ["id", "name", "city", "country"]);
}

export function getLocalite(id: string): Localite | undefined {
  return readAll().find((l) => l.id === id);
}

export function createLocalite(input: Omit<Localite, "id">): Localite {
  const rows = readAll();
  const maxNum = Math.max(0, ...rows.map((l) => Number(l.id.replace("L", "")) || 0));
  const id = `L${String(maxNum + 1).padStart(3, "0")}`;
  const localite: Localite = { ...input, id };
  rows.unshift(localite);
  writeAll(rows);
  return localite;
}

export function updateLocalite(id: string, patch: Partial<Omit<Localite, "id">>): Localite | null {
  const rows = readAll();
  const idx = rows.findIndex((l) => l.id === id);
  if (idx < 0) return null;
  const updated = { ...rows[idx], ...patch };
  rows[idx] = updated;
  writeAll(rows);
  return updated;
}

export function deleteLocalite(id: string): Localite | null {
  const rows = readAll();
  const idx = rows.findIndex((l) => l.id === id);
  if (idx < 0) return null;
  const [removed] = rows.splice(idx, 1);
  writeAll(rows);
  return removed;
}

export function restoreLocalite(localite: Localite) {
  const rows = readAll();
  if (rows.some((l) => l.id === localite.id)) return;
  writeAll([localite, ...rows]);
}
