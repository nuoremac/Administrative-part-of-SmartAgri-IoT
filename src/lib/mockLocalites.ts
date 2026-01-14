import { applyListParams, readFromStorage, writeToStorage, type ListParams, type ListResult } from "./mockStore";

export type Localite = {
  id: string;
  nom: string;
  latitude: number;
  longitude: number;
  altitude: number;
  quartier: string;
  ville: string;
  region: string;
  pays: string;
  code_postal: string;
  continent: string;
  timezone: string;
  superficie: number;
  population: number;
  climate_zone: string;
  created_at: string;
  updated_at: string;
};

const LS_KEY = "smartagro_localites_v2";

function seed(): Localite[] {
  const now = new Date().toISOString();
  return [
    {
      id: "L001",
      nom: "Zone Nord",
      latitude: 4.05,
      longitude: 9.7,
      altitude: 18,
      quartier: "Akwa",
      ville: "Douala",
      region: "Littoral",
      pays: "Cameroun",
      code_postal: "00000",
      continent: "Afrique",
      timezone: "Africa/Douala",
      superficie: 120,
      population: 2000000,
      climate_zone: "tropical",
      created_at: now,
      updated_at: now,
    },
    {
      id: "L002",
      nom: "Plateau Est",
      latitude: 3.85,
      longitude: 11.5,
      altitude: 720,
      quartier: "Bastos",
      ville: "Yaounde",
      region: "Centre",
      pays: "Cameroun",
      code_postal: "00000",
      continent: "Afrique",
      timezone: "Africa/Douala",
      superficie: 140,
      population: 1800000,
      climate_zone: "savane",
      created_at: now,
      updated_at: now,
    },
    {
      id: "L003",
      nom: "Vallée Ouest",
      latitude: 5.48,
      longitude: 10.4,
      altitude: 1450,
      quartier: "Marché",
      ville: "Bafoussam",
      region: "Ouest",
      pays: "Cameroun",
      code_postal: "00000",
      continent: "Afrique",
      timezone: "Africa/Douala",
      superficie: 90,
      population: 500000,
      climate_zone: "montagne",
      created_at: now,
      updated_at: now,
    },
    {
      id: "L004",
      nom: "Terres Rouge",
      latitude: 9.3,
      longitude: 13.4,
      altitude: 240,
      quartier: "Centre",
      ville: "Garoua",
      region: "Nord",
      pays: "Cameroun",
      code_postal: "00000",
      continent: "Afrique",
      timezone: "Africa/Douala",
      superficie: 160,
      population: 350000,
      climate_zone: "sahélien",
      created_at: now,
      updated_at: now,
    },
    {
      id: "L005",
      nom: "Plaine Verte",
      latitude: 4.15,
      longitude: 9.28,
      altitude: 70,
      quartier: "Molyko",
      ville: "Buea",
      region: "Sud-Ouest",
      pays: "Cameroun",
      code_postal: "00000",
      continent: "Afrique",
      timezone: "Africa/Douala",
      superficie: 110,
      population: 120000,
      climate_zone: "tropical",
      created_at: now,
      updated_at: now,
    },
    {
      id: "L006",
      nom: "Bassin Sud",
      latitude: 2.95,
      longitude: 9.91,
      altitude: 12,
      quartier: "Centre",
      ville: "Kribi",
      region: "Sud",
      pays: "Cameroun",
      code_postal: "00000",
      continent: "Afrique",
      timezone: "Africa/Douala",
      superficie: 130,
      population: 80000,
      climate_zone: "tropical",
      created_at: now,
      updated_at: now,
    },
  ];
}

function readAll(): Localite[] {
  return readFromStorage<Localite>(LS_KEY, seed);
}

function writeAll(rows: Localite[]) {
  writeToStorage<Localite>(LS_KEY, rows);
}

export function formatLocalite(localite: Localite) {
  return `${localite.nom} — ${localite.ville}, ${localite.pays}`;
}

export function listLocalites(params: ListParams = {}): ListResult<Localite> {
  return applyListParams(readAll(), params, ["id", "nom", "ville", "pays", "region", "climate_zone"]);
}

export function getLocalite(id: string): Localite | undefined {
  return readAll().find((l) => l.id === id);
}

export function createLocalite(input: Omit<Localite, "id" | "created_at" | "updated_at">): Localite {
  const rows = readAll();
  const maxNum = Math.max(0, ...rows.map((l) => Number(l.id.replace("L", "")) || 0));
  const id = `L${String(maxNum + 1).padStart(3, "0")}`;
  const now = new Date().toISOString();
  const localite: Localite = { ...input, id, created_at: now, updated_at: now };
  rows.unshift(localite);
  writeAll(rows);
  return localite;
}

export function updateLocalite(id: string, patch: Partial<Omit<Localite, "id" | "created_at">>): Localite | null {
  const rows = readAll();
  const idx = rows.findIndex((l) => l.id === id);
  if (idx < 0) return null;
  const updated = { ...rows[idx], ...patch, updated_at: new Date().toISOString() };
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
