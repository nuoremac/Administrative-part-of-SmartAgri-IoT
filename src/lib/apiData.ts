import type { Capteur } from "@/lib/models/Capteur";
import type { LocaliteResponse } from "@/lib/models/LocaliteResponse";
import type { ParcelleResponse } from "@/lib/models/ParcelleResponse";
import type { SensorMeasurementsResponse } from "@/lib/models/SensorMeasurementsResponse";
import type { TerrainResponse } from "@/lib/models/TerrainResponse";
import type { UserResponse } from "@/lib/models/UserResponse";
import { CapteursService } from "@/lib/services/CapteursService";
import { DonnEsDeCapteursService } from "@/lib/services/DonnEsDeCapteursService";
import { LocalitSService } from "@/lib/services/LocalitSService";
import { ParcellesService } from "@/lib/services/ParcellesService";
import { TerrainsService } from "@/lib/services/TerrainsService";
import { UsersService } from "@/lib/services/UsersService";
import { unwrapList } from "@/lib/apiHelpers";
import { OpenAPI } from "@/lib/core/OpenAPI";
import { getAccessToken } from "@/lib/authSession";

const DEFAULT_LIMIT = 100;
const DEFAULT_TTL_MS = 60_000;

type CacheEntry<T> = { value: T; expiresAt: number };
const cache = new Map<string, CacheEntry<unknown>>();

function readCache<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function writeCache<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export async function fetchTerrains(limit = DEFAULT_LIMIT): Promise<TerrainResponse[]> {
  const cacheKey = `terrains:${limit}`;
  const cached = readCache<TerrainResponse[]>(cacheKey);
  if (cached) return cached;
  const payload = await TerrainsService.getAllTerrainsApiV1TerrainsTerrainsGet(undefined, limit);
  const list = unwrapList<TerrainResponse>(payload);
  writeCache(cacheKey, list);
  return list;
}

export async function fetchLocalites(limit = DEFAULT_LIMIT): Promise<LocaliteResponse[]> {
  const cacheKey = `localites:${limit}`;
  const cached = readCache<LocaliteResponse[]>(cacheKey);
  if (cached) return cached;
  const payload = await LocalitSService.getAllLocalitesApiV1LocalitesLocalitesGet(undefined, limit);
  const list = unwrapList<LocaliteResponse>(payload);
  writeCache(cacheKey, list);
  return list;
}

export async function fetchUsers(limit = DEFAULT_LIMIT): Promise<UserResponse[]> {
  const cacheKey = `users:${limit}`;
  const cached = readCache<UserResponse[]>(cacheKey);
  if (cached) return cached;
  try {
    const payload = await UsersService.getAllUsersApiV1UsersGet(undefined, limit);
    const list = unwrapList<UserResponse>(payload);
    if (list.length) {
      writeCache(cacheKey, list);
      return list;
    }
  } catch {
    // fall through to direct fetch
  }

  const token = getAccessToken();
  const res = await fetch(`${OpenAPI.BASE}/api/v1/users?limit=${limit}`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) return [];
  const json = await res.json();
  const list = unwrapList<UserResponse>(json);
  writeCache(cacheKey, list);
  return list;
}

export async function fetchSensors(limit = DEFAULT_LIMIT): Promise<Capteur[]> {
  const cacheKey = `sensors:${limit}`;
  const cached = readCache<Capteur[]>(cacheKey);
  if (cached) return cached;
  const payload = await CapteursService.readCapteursApiV1CapteursGet(undefined, limit);
  const list = unwrapList<Capteur>(payload);
  writeCache(cacheKey, list);
  return list;
}

export async function fetchParcelsByTerrain(terrainId: string, limit = DEFAULT_LIMIT): Promise<ParcelleResponse[]> {
  const cacheKey = `parcels:terrain:${terrainId}:${limit}`;
  const cached = readCache<ParcelleResponse[]>(cacheKey);
  if (cached) return cached;
  const payload = await ParcellesService.getParcellesByTerrainApiV1ParcellesParcellesTerrainTerrainIdGet(
    terrainId,
    undefined,
    limit
  );
  const list = unwrapList<ParcelleResponse>(payload);
  writeCache(cacheKey, list);
  return list;
}

export async function fetchAllParcels(terrains?: TerrainResponse[]): Promise<ParcelleResponse[]> {
  const cacheKey = `parcels:all:${DEFAULT_LIMIT}`;
  const cached = readCache<ParcelleResponse[]>(cacheKey);
  if (cached) return cached;
  const token = getAccessToken();
  try {
    const res = await fetch(`${OpenAPI.BASE}/api/v1/parcelles/parcelles?limit=${DEFAULT_LIMIT}`, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      const json = await res.json();
      const list = unwrapList<ParcelleResponse>(json);
      if (list.length) {
        writeCache(cacheKey, list);
        return list;
      }
    }
  } catch {
    // fall through to per-terrain fetch
  }

  const terrainList = terrains ?? (await fetchTerrains());
  if (!terrainList.length) return [];
  const results = await Promise.all(
    terrainList.map((terrain) => fetchParcelsByTerrain(terrain.id))
  );
  const list = results.flat();
  writeCache(cacheKey, list);
  return list;
}

export async function fetchAllMeasurements(limit = DEFAULT_LIMIT): Promise<SensorMeasurementsResponse[]> {
  const cacheKey = `measurements:${limit}`;
  const cached = readCache<SensorMeasurementsResponse[]>(cacheKey);
  if (cached) return cached;
  const payload = await DonnEsDeCapteursService.getAllMeasurementsApiV1SensorDataSensorDataGet(
    undefined,
    limit
  );
  const list = unwrapList<SensorMeasurementsResponse>(payload);
  writeCache(cacheKey, list);
  return list;
}
