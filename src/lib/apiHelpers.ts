export function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

  if (!payload || typeof payload !== "object") return [];

  const extractFromObject = (source: unknown): T[] | null => {
    if (!source || typeof source !== "object") return null;
    const candidates = [
      (source as { items?: unknown }).items,
      (source as { results?: unknown }).results,
      (source as { users?: unknown }).users,
      (source as { terrains?: unknown }).terrains,
      (source as { parcelles?: unknown }).parcelles,
      (source as { localites?: unknown }).localites,
      (source as { capteurs?: unknown }).capteurs,
      (source as { sensors?: unknown }).sensors,
      (source as { measurements?: unknown }).measurements,
      (source as { modes?: unknown }).modes,
      (source as { notifications?: unknown }).notifications,
      (source as { channels?: unknown }).channels,
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate as T[];
    }
    return null;
  };

  const direct = extractFromObject(payload);
  if (direct) return direct;

  if ("data" in payload) {
    const data = (payload as { data: unknown }).data;
    if (Array.isArray(data)) return data as T[];

    const nested = extractFromObject(data);
    if (nested) return nested;
  }

  return [];
}
