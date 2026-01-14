export type SortDir = "asc" | "desc";

export type ListParams<Filters extends Record<string, unknown> = Record<string, unknown>> = {
  search?: string;
  filters?: Filters;
  skip?: number;
  limit?: number;
  sortKey?: string;
  sortDir?: SortDir;
};

export type ListResult<T> = {
  items: T[];
  total: number;
};

type FilterValue = string | number | boolean | string[] | number[] | null | undefined;

function hasWindow() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function readFromStorage<T>(key: string, seed: () => T[]): T[] {
  if (!hasWindow()) return [];
  const raw = localStorage.getItem(key);
  if (!raw) {
    const initial = seed();
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeToStorage<T>(key: string, rows: T[]) {
  if (!hasWindow()) return;
  localStorage.setItem(key, JSON.stringify(rows));
}

export function applyListParams<T extends Record<string, unknown>>(
  rows: T[],
  params: ListParams,
  searchKeys: (keyof T)[]
): ListResult<T> {
  const search = params.search?.trim().toLowerCase() ?? "";
  let filtered = rows;

  if (search) {
    filtered = filtered.filter((row) =>
      searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(search))
    );
  }

  const filters = params.filters ?? {};
  filtered = filtered.filter((row) => {
    return Object.entries(filters).every(([key, raw]) => {
      const value = raw as FilterValue;
      if (value === null || value === undefined) return true;
      const rowValue = row[key];
      if (Array.isArray(value)) return value.includes(rowValue as never);
      return rowValue === value;
    });
  });

  if (params.sortKey) {
    const dir = params.sortDir === "desc" ? -1 : 1;
    const key = params.sortKey;
    filtered = [...filtered].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av ?? "").localeCompare(String(bv ?? "")) * dir;
    });
  }

  const total = filtered.length;
  const skip = Math.max(0, params.skip ?? 0);
  const limit = Math.max(1, params.limit ?? (total || 1));
  const items = filtered.slice(skip, skip + limit);
  return { items, total };
}
