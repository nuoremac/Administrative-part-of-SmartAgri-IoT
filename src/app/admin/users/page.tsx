"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import UserModal from "@/components/admin/users/UserModal";
import { useToast } from "@/components/ui/ToastProvider";
import { useAdminSearch } from "@/components/admin/AdminSearchProvider";
import { useT } from "@/components/i18n/useT";
import { useLang } from "@/components/i18n/LangProvider";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { UserRow } from "@/lib/mockUsers";
import type { UserResponse } from "@/lib/models/UserResponse";
import { OpenAPI } from "@/lib/core/OpenAPI";
import { getAccessToken, getCurrentUser } from "@/lib/authSession";
import { AuthenticationService } from "@/lib/services/AuthenticationService";
import { UsersService } from "@/lib/services/UsersService";
import { fetchAllParcels, fetchTerrains } from "@/lib/apiData";

type SortKey = "nom";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const { push } = useToast();
  const { t } = useT();
  const { lang } = useLang();
  const { query: q } = useAdminSearch();

  const [refreshKey, setRefreshKey] = useState(0);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [parcelsByUser, setParcelsByUser] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("nom");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);
  const currentUser = getCurrentUser();
  const pushRef = useRef(push);
  const tRef = useRef(t);

  useEffect(() => {
    pushRef.current = push;
  }, [push]);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const resolveUser = (payload: unknown): UserResponse | null => {
    if (!payload || typeof payload !== "object") return null;
    if ("data" in payload) {
      return (payload as { data: UserResponse }).data;
    }
    return payload as UserResponse;
  };

  const resolveUserList = (payload: unknown): UserResponse[] => {
    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === "object" && "data" in payload) {
      const data = (payload as { data: unknown }).data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === "object") {
        const candidates = [
          (data as { items?: unknown }).items,
          (data as { users?: unknown }).users,
          (data as { results?: unknown }).results,
        ];
        for (const value of candidates) {
          if (Array.isArray(value)) return value as UserResponse[];
        }
      }
      return [];
    }
    return [];
  };

  const toUserRow = (u: UserResponse): UserRow => ({
    id: u.id,
    nom: u.nom ?? "",
    prenom: u.prenom ?? "",
    email: u.email ?? "",
    telephone: u.telephone ?? "",
    role: (u.role as UserRow["role"]) ?? "user",
    preferences: {
      langue: "fr",
      theme: "light",
      notifications: { email: true, push: true, sms: false },
      unites: { temperature: "celsius", surface: "hectare", precipitation: "mm" },
    },
    status: "active",
    avatar: u.avatar ?? "",
    date_inscription: u.date_inscription ?? "",
    dernier_acces: u.dernier_acces ?? "",
    created_at: u.created_at ?? "",
    updated_at: u.updated_at ?? "",
  });

  useEffect(() => {
    let canceled = false;

    const load = async () => {
      setLoading(true);
      try {
        let list = resolveUserList(await UsersService.getAllUsersApiV1UsersGet(undefined, 100));
        if (!list.length) {
          const token = getAccessToken();
          const fallbackUrl = `${OpenAPI.BASE}/api/v1/users?limit=100`;
          const res = await fetch(fallbackUrl, {
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (res.ok) {
            const json = await res.json();
            list = resolveUserList(json);
          }
        }
        if (canceled) return;
        setUsers(list.map((u) => toUserRow(resolveUser(u) ?? (u as UserResponse))));
        const terrains = await fetchTerrains();
        const parcels = await fetchAllParcels(terrains);
        if (canceled) return;
        const terrainOwner = new Map(terrains.map((t) => [t.id, t.user_id]));
        const counts = new Map<string, number>();
        parcels.forEach((parcel) => {
          const ownerId = terrainOwner.get(parcel.terrain_id);
          if (!ownerId) return;
          counts.set(ownerId, (counts.get(ownerId) ?? 0) + 1);
        });
        setParcelsByUser(counts);
      } catch {
        if (canceled) return;
        try {
          const token = getAccessToken();
          const fallbackUrl = `${OpenAPI.BASE}/api/v1/users?limit=100`;
          const res = await fetch(fallbackUrl, {
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (res.ok) {
            const json = await res.json();
            const list = resolveUserList(json);
            setUsers(list.map((u) => toUserRow(resolveUser(u) ?? (u as UserResponse))));
            const terrains = await fetchTerrains();
            const parcels = await fetchAllParcels(terrains);
            if (canceled) return;
            const terrainOwner = new Map(terrains.map((t) => [t.id, t.user_id]));
            const counts = new Map<string, number>();
            parcels.forEach((parcel) => {
              const ownerId = terrainOwner.get(parcel.terrain_id);
              if (!ownerId) return;
              counts.set(ownerId, (counts.get(ownerId) ?? 0) + 1);
            });
            setParcelsByUser(counts);
            return;
          }
        } catch {
          // ignore fallback errors
        }
        pushRef.current({ title: tRef.current("load_failed"), kind: "error" });
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    void load();
    return () => {
      canceled = true;
    };
  }, [refreshKey, lang]);

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  };

  const listResult = useMemo(() => {
    const search = q.trim().toLowerCase();
    const filtered = users.filter((u) => {
      if (!search) return true;
      return (
        u.nom.toLowerCase().includes(search) ||
        u.prenom.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.telephone.toLowerCase().includes(search)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      const left = a[sortKey].toLowerCase();
      const right = b[sortKey].toLowerCase();
      if (left === right) return 0;
      const dir = sortDir === "asc" ? 1 : -1;
      return left > right ? dir : -dir;
    });

    const total = sorted.length;
    const start = (page - 1) * PAGE_SIZE;
    const items = sorted.slice(start, start + PAGE_SIZE);
    return { total, items };
  }, [q, page, sortDir, sortKey, users]);


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

  const onSubmitModal = async (data: Omit<UserRow, "id"> & { password?: string }) => {
    if (!data.nom?.trim() || !data.prenom?.trim() || !data.email?.trim()) {
      push({
        title: t("invalidCredentials"),
        message: t("email"),
        kind: "error",
      });
      return;
    }

    if (modalMode === "create") {
      try {
        if (!data.password?.trim()) {
          push({ title: t("invalidCredentials"), message: t("password"), kind: "error" });
          return;
        }
        const created = await AuthenticationService.registerUserApiV1AuthRegisterUserPost({
          nom: data.nom.trim(),
          prenom: data.prenom.trim(),
          email: data.email.trim(),
          telephone: data.telephone?.trim() || null,
          password: data.password.trim(),
        });
        const resolved = resolveUser(created) ?? (created as UserResponse);
        setUsers((prev) => [toUserRow(resolved), ...prev]);
        setModalOpen(false);
        push({
          title: t("add_user"),
          message: `${data.prenom} ${data.nom}`,
          kind: "success",
        });
      } catch {
        push({ title: t("profile_update_failed"), kind: "error" });
      }
      return;
    }

    if (editing) {
      try {
        const updated = await UsersService.updateUserApiV1UsersUserIdPut(editing.id, {
          nom: data.nom.trim(),
          prenom: data.prenom.trim(),
          telephone: data.telephone.trim() || null,
          avatar: data.avatar.trim() || null,
        });
        const resolved = resolveUser(updated) ?? (updated as UserResponse);
        setUsers((prev) => prev.map((u) => (u.id === editing.id ? toUserRow(resolved) : u)));
        setModalOpen(false);
        push({
          title: t("edit_user"),
          message: `${data.prenom} ${data.nom}`,
          kind: "success",
        });
      } catch {
        push({ title: t("profile_update_failed"), kind: "error" });
      }
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setConfirmDelete(null);
    try {
      await UsersService.deleteUserApiV1UsersUserIdDelete(target.id);
      setUsers((prev) => prev.filter((user) => user.id !== target.id));
      push({ title: t("delete_toast_title"), message: `${target.prenom} ${target.nom}`, kind: "success" });
    } catch {
      push({ title: t("profile_update_failed"), kind: "error" });
    }
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
          className="h-9 rounded-sm bg-green-600 px-3 text-xs font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
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
          <table className="min-w-full md:min-w-[980px] w-full text-left text-sm">
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400">
                    {t("loading")}
                  </td>
                </tr>
              ) : listResult.items.length === 0 ? (
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
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700"
                          aria-label={t("edit")}
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
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                          <span className="sr-only">{t("edit")}</span>
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            setConfirmDelete(u);
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
                          aria-label={t("delete")}
                          disabled={currentUser?.id === u.id}
                          title={currentUser?.id === u.id ? t("delete_self_disabled") : t("delete")}
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
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                          <span className="sr-only">{t("delete")}</span>
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
        open={!!confirmDelete}
        title={t("delete_confirm_title")}
        message={t("delete_confirm_body")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
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
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";

  const label = status === "active" ? t("status_active") : t("status_suspended");
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
