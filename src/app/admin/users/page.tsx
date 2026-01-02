"use client";

import { useMemo, useState } from "react";
import UserModal from "@/components/admin/users/UserModal";
import { useToast } from "@/components/ui/ToastProvider";
import { useAdminSearch } from "@/components/admin/AdminSearchProvider";
import {
  createUser,
  deleteUser,
  listUsers,
  restoreUser,
  updateUser,
  type UserRow,
} from "@/lib/mockUsers";

type SortKey = "name" | "parcels";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const { push } = useToast();

  // ✅ Load once without useEffect (no setState in effect)
  const [users, setUsers] = useState<UserRow[]>(() => listUsers());

  // ✅ Global search query (will be set from a window event, but we can avoid effect by using onSearch handler registration in AdminShell later)
  // For now: keep a local query state that can be set by a small helper function.
    const { query: q  } = useAdminSearch();

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  };

  // Pagination
  const [page, setPage] = useState(1);

  // Filter + sort
  const filteredSorted = useMemo(() => {
    const s = q.trim().toLowerCase();
    const filtered = !s
      ? users
      : users.filter((u) =>
          [u.name, u.email, u.tel, u.status, u.role].some((x) =>
            String(x).toLowerCase().includes(s)
          )
        );

    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      return (a.parcels - b.parcels) * dir;
    });
  }, [users, q, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));

  // ✅ No effect: just clamp the page at render-time
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredSorted.slice(start, start + PAGE_SIZE);
  }, [filteredSorted, safePage]);

  // Modal (Add/Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<UserRow | null>(null);

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
    // simple validation
    if (!data.name?.trim() || !data.email?.trim()) {
      push({
        title: "Champs invalides",
        message: "Nom et Email sont obligatoires.",
        kind: "error",
      });
      return;
    }

    if (modalMode === "create") {
      const created = createUser(data);
      setUsers(listUsers());
      setModalOpen(false);
      setPage(1); // show new user at top
      push({
        title: "Utilisateur ajouté",
        message: `${created.name} a été créé.`,
        kind: "success",
      });
      return;
    }

    if (editing) {
      const updated = updateUser(editing.id, data);
      setUsers(listUsers());
      setModalOpen(false);
      push({
        title: "Utilisateur modifié",
        message: updated ? `${updated.name} mis à jour.` : "Mise à jour effectuée.",
        kind: "success",
      });
    }
  };

  const onDelete = (u: UserRow) => {
    const removed = deleteUser(u.id);
    if (!removed) return;

    setUsers(listUsers());

    push({
      title: "Utilisateur supprimé",
      message: `${removed.name} supprimé.`,
      actionLabel: "Annuler",
      onAction: () => {
        restoreUser(removed);
        setUsers(listUsers());
        push({
          title: "Suppression annulée",
          message: `${removed.name} restauré.`,
          kind: "success",
        });
      },
    });
  };

  // ✅ Since you want ONLY one search bar (global), we show a small hint instead of local search.
  // To connect global search WITHOUT effects, we’ll slightly modify AdminShell after this.
  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
      <div className="mb-3 flex items-end justify-between gap-2">
        <div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Utilisateurs{" "}
            <span className="text-gray-600 dark:text-gray-400">({users.length})</span>
          </h1>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Utilisez la recherche globale en haut pour filtrer cette page.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="h-9 rounded-sm bg-green-600 px-3 text-xs font-semibold text-white hover:bg-green-700"
        >
          + Ajouter
        </button>
      </div>

      {/* Optional: show current filter query */}
      {q ? (
        <div className="mb-3 rounded-sm border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700
                        dark:border-gray-800 dark:bg-[#161b22] dark:text-gray-200">
          Filtre actif: <span className="font-semibold">{q}</span>{" "}
          <button
            type="button"
            onClick={()=> { /* Ideally, we would clear the global search query here */ }}
            className="ml-2 rounded-sm border border-gray-300 px-2 py-0.5 text-[11px] font-semibold hover:bg-gray-50
                       dark:border-gray-700 dark:hover:bg-[#0d1117]"
          >
            Effacer
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-sm border border-gray-300 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0d1117]">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-[#161b22]">
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <ThSortable label="Noms" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">Email</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">Tel</th>
                <ThSortable label="Parcelles" active={sortKey === "parcels"} dir={sortDir} onClick={() => toggleSort("parcels")} />
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">Statut</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">Dernière activité</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">Action</th>
              </tr>
            </thead>

            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                paged.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-[#0b1220]"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                      {u.name}
                      <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                        {u.role === "ADMIN" ? "Admin" : "Agriculteur"}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{u.email}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{u.tel}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{u.parcels}</td>

                    <td className="px-4 py-3">
                      <StatusBadge status={u.status} />
                    </td>

                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      {formatLastActivity(u.lastActivity)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          Modifier
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(u)}
                          className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          Supprimer
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
            Page <span className="font-semibold">{safePage}</span> / {totalPages} • Affichage{" "}
            <span className="font-semibold">{paged.length}</span> sur{" "}
            <span className="font-semibold">{filteredSorted.length}</span>
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

function StatusBadge({ status }: { status: UserRow["status"] }) {
  const cls =
    status === "active"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
      : status === "pending"
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";

  const label = status === "active" ? "Actif" : status === "pending" ? "En attente" : "Bloqué";
  return <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${cls}`}>{label}</span>;
}

function formatLastActivity(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}
