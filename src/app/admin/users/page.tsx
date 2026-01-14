"use client";

import { useMemo, useState } from "react";
import UserModal from "@/components/admin/users/UserModal";
import { useToast } from "@/components/ui/ToastProvider";
import { useAdminSearch } from "@/components/admin/AdminSearchProvider";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useT } from "@/components/i18n/useT";
import { useLang } from "@/components/i18n/LangProvider";
import {
  createUser,
  deleteUser,
  listUsers,
  restoreUser,
  updateUser,
  type UserRow,
} from "@/lib/mockUsers";
import { listTerrains } from "@/lib/mockTerrains";
import { listParcels } from "@/lib/mockParcels";

type SortKey = "nom";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const { push } = useToast();
  const { t } = useT();
  const { lang } = useLang();
  const { query: q } = useAdminSearch();

  const [refreshKey, setRefreshKey] = useState(0);

  const [sortKey, setSortKey] = useState<SortKey>("nom");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [confirmUser, setConfirmUser] = useState<UserRow | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  };

  const listResult = useMemo(() => {
    return listUsers({
      search: q,
      sortKey,
      sortDir,
      skip: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    });
  }, [q, sortKey, sortDir, page, refreshKey]);

  const parcelsByUser = useMemo(() => {
    const terrains = listTerrains().items;
    const parcels = listParcels().items;
    const terrainOwner = new Map(terrains.map((t) => [t.id, t.user_id]));
    const counts = new Map<string, number>();
    parcels.forEach((p) => {
      const ownerId = terrainOwner.get(p.terrain_id);
      if (!ownerId) return;
      counts.set(ownerId, (counts.get(ownerId) ?? 0) + 1);
    });
    return counts;
  }, [refreshKey]);

  const totalPages = Math.max(1, Math.ceil(listResult.total / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const openCreate = () => {
    setModalMode("create");
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (u: UserRow) => {
    setModalMode("edit");
    setEditing(u);
    setModalOpen(true);
  };

  const onSubmitModal = (data: Omit<UserRow, "id">) => {
    if (!data.nom?.trim() || !data.prenom?.trim() || !data.email?.trim()) {
      push({
        title: t("invalidCredentials"),
        message: t("email"),
        kind: "error",
      });
      return;
    }

    if (modalMode === "create") {
      const created = createUser(data);
      setRefreshKey((k) => k + 1);
      setModalOpen(false);
      setPage(1);
      push({
        title: t("add_user"),
        message: `${created.prenom} ${created.nom}`,
        kind: "success",
      });
      return;
    }

    if (editing) {
      const updated = updateUser(editing.id, data);
      setRefreshKey((k) => k + 1);
      setModalOpen(false);
      push({
        title: t("edit_user"),
        message: updated ? `${updated.prenom} ${updated.nom}` : t("save"),
        kind: "success",
      });
    }
  };

  const confirmDelete = () => {
    if (!confirmUser) return;
    const removed = deleteUser(confirmUser.id);
    setConfirmUser(null);
    if (!removed) return;

    setRefreshKey((k) => k + 1);

    push({
      title: t("delete_toast_title"),
      message: `${removed.prenom} ${removed.nom}`,
      actionLabel: t("undo"),
      onAction: () => {
        restoreUser(removed);
        setRefreshKey((k) => k + 1);
        push({
          title: t("delete_toast_undo"),
          message: `${removed.prenom} ${removed.nom}`,
          kind: "success",
        });
      },
    });
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t("nav_users")} <span className="text-gray-600 dark:text-gray-400">({listResult.total})</span>
          </h1>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("global_search_placeholder")}</p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="h-9 rounded-sm bg-green-600 px-3 text-xs font-semibold text-white hover:bg-green-700"
        >
          + {t("add_user")}
        </button>
      </div>

      {q ? (
        <div className="mb-3 rounded-sm border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700
                        dark:border-gray-800 dark:bg-[#161b22] dark:text-gray-200">
          {t("search")}: <span className="font-semibold">{q}</span>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-sm border border-gray-300 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0d1117]">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="sticky top-0 bg-gray-50 dark:bg-[#161b22]">
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <ThSortable label={t("table_name")} active={sortKey === "nom"} dir={sortDir} onClick={() => toggleSort("nom")} />
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("email")}</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">Tel</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_parcels")}</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_status")}</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_last_activity")}</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_actions")}</th>
              </tr>
            </thead>

            <tbody>
              {listResult.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400">
                    {t("empty_users")}
                  </td>
                </tr>
              ) : (
                listResult.items.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-[#0b1220]"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                      {u.prenom} {u.nom}
                      <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                        {u.role === "admin" ? "Admin" : t("admin_kpi_farmers")}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{u.email}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{u.telephone}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{parcelsByUser.get(u.id) ?? 0}</td>

                    <td className="px-4 py-3">
                      <StatusBadge status={u.status} t={t} />
                    </td>

                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      {formatLastActivity(u.dernier_acces, lang)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          {t("edit")}
                        </button>

                        <button
                          type="button"
                          onClick={() => setConfirmUser(u)}
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

      <UserModal
        key={`${modalMode}_${editing?.id ?? "new"}_${modalOpen ? "open" : "closed"}`}
        open={modalOpen}
        mode={modalMode}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={onSubmitModal}
      />

      <ConfirmDialog
        open={!!confirmUser}
        title={t("delete_confirm_title")}
        message={t("delete_confirm_body")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmUser(null)}
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

function StatusBadge({ status, t }: { status: UserRow["status"]; t: (k: string) => string }) {
  const cls =
    status === "active"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
      : status === "pending"
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";

  const label =
    status === "active"
      ? t("status_active")
      : status === "pending"
      ? t("status_pending")
      : t("status_suspended");
  return <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${cls}`}>{label}</span>;
}

function formatLastActivity(iso: string, lang: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return lang === "fr" ? `il y a ${mins} min` : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return lang === "fr" ? `il y a ${hours} h` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return lang === "fr" ? `il y a ${days} j` : `${days}d ago`;
}
