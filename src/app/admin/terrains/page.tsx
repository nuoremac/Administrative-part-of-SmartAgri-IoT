"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAdminSearch } from "@/components/admin/AdminSearchProvider";
import { useToast } from "@/components/ui/ToastProvider";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import TerrainModal from "@/components/admin/terrains/TerrainModal";
import LocaliteModal from "@/components/admin/terrains/LocaliteModal";
import { useT } from "@/components/i18n/useT";
import {
  createTerrain,
  deleteTerrain,
  listTerrains,
  restoreTerrain,
  updateTerrain,
  type TerrainRow,
} from "@/lib/mockTerrains";
import { createLocalite, listLocalites, type Localite } from "@/lib/mockLocalites";

type SortKey = "id" | "name" | "owner" | "area" | "localiteId";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 10;

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function TerrainsPage() {
  const router = useRouter();
  const { query } = useAdminSearch();
  const { push } = useToast();
  const { t } = useT();
  const isClient = useIsClient();

  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [confirmTerrain, setConfirmTerrain] = useState<TerrainRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<TerrainRow | null>(null);
  const [localiteOpen, setLocaliteOpen] = useState(false);

  const localitesResult = useMemo(() => listLocalites(), [refreshKey]);
  const localites = localitesResult.items;
  const localiteMap = useMemo(
    () => new Map(localites.map((l) => [l.id, `${l.name} — ${l.city}, ${l.country}`])),
    [localites]
  );

  const listResult = useMemo(() => {
    return listTerrains({
      search: query,
      sortKey,
      sortDir,
      skip: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    });
  }, [query, sortKey, sortDir, page, refreshKey]);

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

  const openEdit = (row: TerrainRow) => {
    setModalMode("edit");
    setEditing(row);
    setModalOpen(true);
  };

  const handleSubmit = (data: { name: string; owner: string; area: number; localiteId: string }) => {
    if (!data.name || !data.owner || !data.localiteId) {
      push({ title: t("invalidCredentials"), message: t("terrain_name"), kind: "error" });
      return;
    }

    if (modalMode === "create") {
      const created = createTerrain(data);
      setRefreshKey((k) => k + 1);
      setModalOpen(false);
      setPage(1);
      push({ title: t("add_terrain"), message: created.name, kind: "success" });
      return;
    }

    if (editing) {
      const updated = updateTerrain(editing.id, data);
      setRefreshKey((k) => k + 1);
      setModalOpen(false);
      push({ title: t("edit_terrain"), message: updated?.name ?? t("save"), kind: "success" });
    }
  };

  const confirmDelete = () => {
    if (!confirmTerrain) return;
    const removed = deleteTerrain(confirmTerrain.id);
    setConfirmTerrain(null);
    if (!removed) return;

    setRefreshKey((k) => k + 1);

    push({
      title: t("delete_toast_title"),
      message: removed.name,
      actionLabel: t("undo"),
      onAction: () => {
        restoreTerrain(removed);
        setRefreshKey((k) => k + 1);
        push({ title: t("delete_toast_undo"), message: removed.name, kind: "success" });
      },
    });
  };

  const handleAddLocalite = (data: { name: string; city: string; country: string }) => {
    if (!data.name || !data.city || !data.country) return;
    createLocalite(data);
    setRefreshKey((k) => k + 1);
    setLocaliteOpen(false);
  };

  return isClient ? (
    <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t("nav_terrains")} <span className="text-gray-600 dark:text-gray-400">({listResult.total})</span>
          </h1>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("terrains_subtitle")}</p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="h-9 rounded-sm bg-green-600 px-3 text-xs font-semibold text-white hover:bg-green-700"
        >
          + {t("add_terrain")}
        </button>
      </div>

      <div className="overflow-hidden rounded-sm border border-gray-300 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0d1117]">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="sticky top-0 bg-gray-50 dark:bg-[#161b22]">
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <ThSortable label={t("table_id")} active={sortKey === "id"} dir={sortDir} onClick={() => toggleSort("id")} />
                <ThSortable label={t("table_name")} active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
                <ThSortable label={t("table_owner")} active={sortKey === "owner"} dir={sortDir} onClick={() => toggleSort("owner")} />
                <ThSortable label={t("table_area")} active={sortKey === "area"} dir={sortDir} onClick={() => toggleSort("area")} />
                <ThSortable label={t("table_locality")} active={sortKey === "localiteId"} dir={sortDir} onClick={() => toggleSort("localiteId")} />
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_actions")}</th>
              </tr>
            </thead>

            <tbody>
              {listResult.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400">
                    {t("empty_terrains")}
                  </td>
                </tr>
              ) : (
                listResult.items.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-[#0b1220]"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">{row.id}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{row.name}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{row.owner}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{row.area.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      {localiteMap.get(row.localiteId) ?? row.localiteId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/terrains/${row.id}`)}
                          className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          {t("consult")}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600"
                        >
                          {t("edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmTerrain(row)}
                          className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          {t("delete")}
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
  ) : (
    <TerrainsSkeleton />
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
