"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminSearch } from "@/components/admin/AdminSearchProvider";
import { useToast } from "@/components/ui/ToastProvider";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useT } from "@/components/i18n/useT";
import type { ParcelleResponse } from "@/lib/models/ParcelleResponse";
import type { TerrainResponse } from "@/lib/models/TerrainResponse";
import { fetchAllParcels, fetchTerrains } from "@/lib/apiData";
import { ParcellesService } from "@/lib/services/ParcellesService";
import { TerrainsService } from "@/lib/services/TerrainsService";
import { unwrapData } from "@/lib/apiHelpers";

type SortKey = "id" | "nom" | "code" | "type_sol" | "culture_actuelle" | "superficie" | "terrain_id";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 10;

export default function ParcelsPage() {
  const router = useRouter();
  const { query, setQuery } = useAdminSearch();
  const { push } = useToast();
  const { t } = useT();

  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [confirmParcel, setConfirmParcel] = useState<ParcelleResponse | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [parcels, setParcels] = useState<ParcelleResponse[]>([]);
  const [terrains, setTerrains] = useState<TerrainResponse[]>([]);
  const [terrainNames, setTerrainNames] = useState<Map<string, string>>(new Map());
  useEffect(() => {
    let canceled = false;
    const load = async () => {
      try {
        const terrainList = await fetchTerrains();
        const parcelList = await fetchAllParcels(terrainList);
        if (canceled) return;
        setTerrains(terrainList);
        setParcels(parcelList);
      } catch {
        if (!canceled) push({ title: t("load_failed"), kind: "error" });
      }
    };
    void load();
    return () => {
      canceled = true;
    };
  }, [refreshKey, push, t]);


  const terrainMap = useMemo(() => new Map(terrains.map((tRow) => [tRow.id, tRow.nom])), [terrains]);

  useEffect(() => {
    let canceled = false;
    const loadMissingTerrains = async () => {
      const known = new Map(terrainMap);
      const missingIds = Array.from(new Set(parcels.map((p) => p.terrain_id))).filter((id) => !known.has(id));
      if (!missingIds.length) {
        setTerrainNames(known);
        return;
      }

      try {
        const fetched = await Promise.all(
          missingIds.map((id) =>
            TerrainsService.getTerrainApiV1TerrainsTerrainsTerrainIdGet(id)
              .then((payload) => unwrapData<TerrainResponse>(payload))
              .catch(() => null)
          )
        );
        if (canceled) return;
        fetched.forEach((terrain) => {
          if (terrain) known.set(terrain.id, terrain.nom);
        });
        setTerrainNames(known);
      } catch {
        if (!canceled) setTerrainNames(known);
      }
    };
    void loadMissingTerrains();
    return () => {
      canceled = true;
    };
  }, [parcels, terrainMap]);

  const listResult = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = parcels.filter((row) => {
      if (!search) return true;
      return (
        row.id.toLowerCase().includes(search) ||
        row.nom.toLowerCase().includes(search) ||
        (row.code ?? "").toLowerCase().includes(search) ||
        row.terrain_id.toLowerCase().includes(search)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const getValue = (row: ParcelleResponse) => {
        if (sortKey === "type_sol") return "";
        if (sortKey === "culture_actuelle") return "";
        return (row as Record<string, unknown>)[sortKey] ?? "";
      };
      const av = getValue(a);
      const bv = getValue(b);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });

    const total = sorted.length;
    const start = (page - 1) * PAGE_SIZE;
    const items = sorted.slice(start, start + PAGE_SIZE);
    return { items, total };
  }, [query, sortKey, sortDir, page, parcels]);

  const totalPages = Math.max(1, Math.ceil(listResult.total / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  };

  const confirmDelete = async () => {
    if (!confirmParcel) return;
    const removed = confirmParcel;
    setConfirmParcel(null);
    if (!removed) return;

    try {
      await ParcellesService.deleteParcelleApiV1ParcellesParcellesParcelleIdDelete(removed.id);
      setRefreshKey((k) => k + 1);
      push({
        title: t("delete_toast_title"),
        message: `${removed.id}`,
      });
    } catch {
      push({ title: t("load_failed"), kind: "error" });
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t("nav_parcels")}{" "}
            <span className="text-gray-600 dark:text-gray-400">({listResult.total})</span>
          </h1>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("parcels_subtitle")}</p>
        </div>

        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="rounded-sm border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50
                       dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-200 dark:hover:bg-[#0d1117]"
          >
            {t("clear")}
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-sm border border-gray-400 bg-white dark:border-gray-800 dark:bg-[#0d1117]">
        <div className="overflow-x-auto">
          <table className="min-w-full md:min-w-[980px] w-full text-left text-sm">
            <thead className="sticky top-0 bg-white dark:bg-[#0d1117]">
              <tr className="border-b border-gray-400 dark:border-gray-800">
                <ThSortable label={t("table_name")} active={sortKey === "nom"} dir={sortDir} onClick={() => toggleSort("nom")} />
                <ThSortable label={t("table_code")} active={sortKey === "code"} dir={sortDir} onClick={() => toggleSort("code")} />
                <ThSortable label={t("table_soil_type")} active={sortKey === "type_sol"} dir={sortDir} onClick={() => toggleSort("type_sol")} />
                <ThSortable label={t("table_current_crop")} active={sortKey === "culture_actuelle"} dir={sortDir} onClick={() => toggleSort("culture_actuelle")} />
                <ThSortable label={t("table_area")} active={sortKey === "superficie"} dir={sortDir} onClick={() => toggleSort("superficie")} />
                <ThSortable label={t("table_terrain")} active={sortKey === "terrain_id"} dir={sortDir} onClick={() => toggleSort("terrain_id")} />
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_view")}</th>
              </tr>
            </thead>

            <tbody>
              {listResult.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400">
                    {t("empty_parcels")}
                  </td>
                </tr>
              ) : (
                listResult.items.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-[#0b1220]"
                  >
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.nom}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.code ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">—</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">—</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.superficie} m²</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      {terrainNames.get(p.terrain_id) ?? p.terrain_id}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/parcels/${p.id}`)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700"
                          aria-label={t("consult")}
                        >
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          <span className="sr-only">{t("consult")}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-200 bg-white px-4 py-3 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between
                        dark:border-gray-800 dark:bg-[#0d1117] dark:text-gray-400">
          <span>
            {t("pagination_page")} <span className="font-semibold">{safePage}</span> / {totalPages} •{" "}
            <span className="font-semibold">{listResult.total}</span> {t("pagination_results")}
          </span>

          <Pagination page={safePage} totalPages={totalPages} onChange={(p) => setPage(p)} />
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmParcel}
        title={t("delete_confirm_title")}
        message={t("delete_confirm_body")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmParcel(null)}
      />
    </div>
  );
}

function ThSortable({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">
      <button type="button" onClick={onClick} className="inline-flex items-center gap-1 hover:underline">
        {label}
        <span className="text-[10px] text-gray-500 dark:text-gray-400">
          {active ? (dir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const pages = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        className="rounded-sm border border-gray-300 px-2 py-1 text-xs font-semibold hover:bg-gray-50
                   dark:border-gray-700 dark:hover:bg-[#161b22]"
        disabled={page === 1}
      >
        Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={[
            "rounded-sm border px-2 py-1 text-xs font-semibold",
            p === page
              ? "border-green-600 bg-green-600 text-white"
              : "border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-[#161b22] dark:text-gray-200",
          ].join(" ")}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        className="rounded-sm border border-gray-300 px-2 py-1 text-xs font-semibold hover:bg-gray-50
                   dark:border-gray-700 dark:hover:bg-[#161b22]"
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
}

function ParcelsSkeleton() {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mt-2 h-3 w-56 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="h-7 w-20 animate-pulse rounded-sm bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="overflow-hidden rounded-sm border border-gray-300 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0d1117]">
        <div className="h-[360px] w-full animate-pulse bg-gray-100 dark:bg-[#161b22]" />
      </div>
    </div>
  );
}
