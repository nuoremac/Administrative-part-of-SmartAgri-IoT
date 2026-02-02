"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminSearch } from "@/components/admin/AdminSearchProvider";
import { useToast } from "@/components/ui/ToastProvider";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import TerrainModal from "@/components/admin/terrains/TerrainModal";
import LocaliteModal from "@/components/admin/terrains/LocaliteModal";
import { useT } from "@/components/i18n/useT";
import type { LocaliteResponse } from "@/lib/models/LocaliteResponse";
import type { TerrainResponse } from "@/lib/models/TerrainResponse";
import type { UserResponse } from "@/lib/models/UserResponse";
import { fetchLocalites, fetchTerrains, fetchUsers } from "@/lib/apiData";
import { LocalitSService } from "@/lib/services/LocalitSService";
import { TerrainsService } from "@/lib/services/TerrainsService";
import { Continent } from "@/lib/models/Continent";
import { ClimateZone } from "@/lib/models/ClimateZone";

type SortKey = "id" | "nom" | "user_id" | "superficie_totale" | "localite_id";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 10;

export default function TerrainsPage() {
  const router = useRouter();
  const { query, setQuery } = useAdminSearch();
  const { push } = useToast();
  const { t } = useT();

  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [confirmTerrain, setConfirmTerrain] = useState<TerrainResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<TerrainResponse | null>(null);
  const [localiteOpen, setLocaliteOpen] = useState(false);
  const [terrains, setTerrains] = useState<TerrainResponse[]>([]);
  const [localites, setLocalites] = useState<LocaliteResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let canceled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [terrainList, localiteList, userList] = await Promise.all([
          fetchTerrains(),
          fetchLocalites(),
          fetchUsers(),
        ]);
        if (canceled) return;
        setTerrains(terrainList);
        setLocalites(localiteList);
        setUsers(userList);
      } catch {
        if (!canceled) push({ title: t("load_failed"), kind: "error" });
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    void load();
    return () => {
      canceled = true;
    };
  }, [refreshKey, push, t]);

  const localiteMap = useMemo(
    () => new Map(localites.map((l) => [l.id, `${l.nom} — ${l.ville}, ${l.pays}`])),
    [localites]
  );
  const localiteById = useMemo(
    () => new Map(localites.map((l) => [l.id, l])),
    [localites]
  );

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const listResult = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = terrains.filter((row) => {
      if (!search) return true;
      return (
        row.id.toLowerCase().includes(search) ||
        row.nom.toLowerCase().includes(search) ||
        row.user_id.toLowerCase().includes(search) ||
        row.localite_id.toLowerCase().includes(search)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const getValue = (row: TerrainResponse) => {
        if (sortKey === "superficie_totale") return 0;
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
  }, [query, sortKey, sortDir, page, terrains]);

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

  const openCreate = () => {
    setModalMode("create");
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: TerrainResponse) => {
    setModalMode("edit");
    setEditing(row);
    setModalOpen(true);
  };

  const handleSubmit = async (data: { nom: string; localite_id: string }) => {
    if (!data.nom || !data.localite_id) {
      push({ title: t("invalidCredentials"), message: t("terrain_name"), kind: "error" });
      return;
    }

    if (modalMode === "create") {
      try {
        const created = await TerrainsService.createTerrainApiV1TerrainsTerrainsPost({
          nom: data.nom,
          localite_id: data.localite_id,
        });
        setRefreshKey((k) => k + 1);
        setModalOpen(false);
        setPage(1);
        push({ title: t("add_terrain"), message: created.nom, kind: "success" });
        return;
      } catch {
        push({ title: t("load_failed"), kind: "error" });
      }
    }

    if (editing) {
      try {
        const updated = await TerrainsService.updateTerrainApiV1TerrainsTerrainsTerrainIdPut(editing.id, {
          nom: data.nom,
        });
        setRefreshKey((k) => k + 1);
        setModalOpen(false);
        push({ title: t("edit_terrain"), message: updated?.nom ?? t("save"), kind: "success" });
      } catch {
        push({ title: t("load_failed"), kind: "error" });
      }
    }
  };

  const confirmDelete = async () => {
    if (!confirmTerrain) return;
    const removed = confirmTerrain;
    setConfirmTerrain(null);
    if (!removed) return;

    try {
      await TerrainsService.deleteTerrainApiV1TerrainsTerrainsTerrainIdDelete(removed.id);
      setRefreshKey((k) => k + 1);
      push({
        title: t("delete_toast_title"),
        message: removed.nom,
      });
    } catch {
      push({ title: t("load_failed"), kind: "error" });
    }
  };

  const handleAddLocalite = async (data: { nom: string; ville: string; pays: string }) => {
    if (!data.nom || !data.ville || !data.pays) return;
    try {
      await LocalitSService.createLocaliteApiV1LocalitesLocalitesPost({
        nom: data.nom,
        ville: data.ville,
        pays: data.pays,
        continent: Continent.AFRIQUE,
        climate_zone: ClimateZone.TROPICAL,
      });
      setRefreshKey((k) => k + 1);
      setLocaliteOpen(false);
    } catch {
      push({ title: t("load_failed"), kind: "error" });
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t("nav_terrains")} <span className="text-gray-600 dark:text-gray-400">({listResult.total})</span>
          </h1>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("terrains_subtitle")}</p>
        </div>

        <div className="h-9" />
      </div>

      <div className="overflow-hidden rounded-sm border border-gray-300 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0d1117]">
        <div className="overflow-x-auto">
          <table className="min-w-full md:min-w-[980px] w-full text-left text-sm">
            <thead className="sticky top-0 bg-gray-50 dark:bg-[#161b22]">
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <ThSortable label={t("table_id")} active={sortKey === "id"} dir={sortDir} onClick={() => toggleSort("id")} />
                <ThSortable label={t("table_name")} active={sortKey === "nom"} dir={sortDir} onClick={() => toggleSort("nom")} />
                <ThSortable label={t("table_owner")} active={sortKey === "user_id"} dir={sortDir} onClick={() => toggleSort("user_id")} />
                <ThSortable label={t("table_area")} active={sortKey === "superficie_totale"} dir={sortDir} onClick={() => toggleSort("superficie_totale")} />
                <ThSortable label={t("table_locality")} active={sortKey === "localite_id"} dir={sortDir} onClick={() => toggleSort("localite_id")} />
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_climate_zone")}</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_view")}</th>
              </tr>
            </thead>

            <tbody>
              {listResult.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400">
                    {t("empty_terrains")}
                  </td>
                </tr>
              ) : (
                listResult.items.map((row) => {
                  const owner = userMap.get(row.user_id);
                  const ownerLabel = owner ? `${owner.prenom} ${owner.nom}` : row.user_id;
                  const ownerQuery = owner?.email || owner?.prenom || owner?.nom || "";
                  return (
                  <tr
                    key={row.id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-[#0b1220]"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">{row.id}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{row.nom}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      {owner ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (ownerQuery) setQuery(ownerQuery);
                            router.push("/admin/users");
                          }}
                          className="font-semibold text-green-700 hover:underline dark:text-green-400"
                        >
                          {ownerLabel}
                        </button>
                      ) : (
                        row.user_id
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">—</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      {localiteMap.get(row.localite_id) ?? row.localite_id}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      {localiteById.get(row.localite_id)?.climate_zone ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/terrains/${row.id}`)}
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
                  );
                })
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

      <TerrainModal
        key={`${modalMode}_${editing?.id ?? "new"}_${modalOpen ? "open" : "closed"}`}
        open={modalOpen}
        mode={modalMode}
        initial={editing}
        localites={localites}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        onAddLocalite={() => setLocaliteOpen(true)}
      />

      <LocaliteModal
        key={`${localiteOpen ? "open" : "closed"}_${refreshKey}`}
        open={localiteOpen}
        onClose={() => setLocaliteOpen(false)}
        onSubmit={handleAddLocalite}
      />

      <ConfirmDialog
        open={!!confirmTerrain}
        title={t("delete_confirm_title")}
        message={t("delete_confirm_body")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmTerrain(null)}
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

function TerrainsSkeleton() {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mt-2 h-3 w-56 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-sm bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="overflow-hidden rounded-sm border border-gray-300 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0d1117]">
        <div className="h-[360px] w-full animate-pulse bg-gray-100 dark:bg-[#161b22]" />
      </div>
    </div>
  );
}
