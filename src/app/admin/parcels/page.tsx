"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useAdminSearch } from "@/components/admin/AdminSearchProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { useRouter } from "next/navigation";
import {
  deleteParcel,
  listParcels,
  restoreParcel,
  type ParcelRow,
} from "@/lib/mockParcels";

type SortKey = "id" | "owner" | "area" | "sensors";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 10;

function useIsClient() {
  return useSyncExternalStore(
    () => () => {}, // no-op subscribe
    () => true,     // client snapshot
    () => false     // server snapshot
  );
}


export default function ParcelsPage() {
  const isClient = useIsClient();


  const { query, setQuery } = useAdminSearch(); // global search
  const { push } = useToast();

  const [rows, setRows] = useState<ParcelRow[]>(() => listParcels());
  const [page, setPage] = useState(1);

  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  };

  const filteredSorted = useMemo(() => {
    const s = query.trim().toLowerCase();
    const filtered = !s
      ? rows
      : rows.filter((p) =>
          [p.id, p.name, p.owner, String(p.area), String(p.sensors)]
            .join(" ")
            .toLowerCase()
            .includes(s)
        );

    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "id") return a.id.localeCompare(b.id) * dir;
      if (sortKey === "owner") return a.owner.localeCompare(b.owner) * dir;
      if (sortKey === "area") return (a.area - b.area) * dir;
      return (a.sensors - b.sensors) * dir;
    });
  }, [rows, query, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredSorted.slice(start, start + PAGE_SIZE);
  }, [filteredSorted, safePage]);


  const router = useRouter();
  const onConsult = (id: string) => {
  console.log("Navigate to parcel:", id);
  router.push(`/admin/parcels/${id}`);
  };


  const onDelete = (p: ParcelRow) => {
    const removed = deleteParcel(p.id);
    if (!removed) return;

    setRows(listParcels());

    push({
      title: "Parcelle supprimée",
      message: `${removed.id} supprimée.`,
      actionLabel: "Annuler",
      onAction: () => {
        restoreParcel(removed);
        setRows(listParcels());
        push({ title: "Suppression annulée", message: `${removed.id} restaurée.`, kind: "success" });
      },
    });
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
      {/* header row matching screenshot */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
            <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {/* Parcelles <span className="text-gray-600 dark:text-gray-400">({rows.length})</span> */}
            Parcelles{" "}
              <span className="text-gray-600 dark:text-gray-400" suppressHydrationWarning>
                ({isClient ? rows.length : 0})
              </span>
            </h1>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Superficie en m² • Cliquez sur “Consulter” pour le détail
            </p>
        </div>

        {/* optional helper: clear global search */}
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="rounded-sm border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50
                       dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-200 dark:hover:bg-[#0d1117]"
          >
            Effacer recherche
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-sm border border-gray-400 bg-white dark:border-gray-800 dark:bg-[#0d1117]">
        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full text-left text-sm">
            <thead className="bg-white dark:bg-[#0d1117]">
              <tr className="border-b border-gray-400 dark:border-gray-800">
                <ThSortable label="Id Parcelle" active={sortKey === "id"} dir={sortDir} onClick={() => toggleSort("id")} />
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">Nom</th>
                <ThSortable label="Propriétaire" active={sortKey === "owner"} dir={sortDir} onClick={() => toggleSort("owner")} />
                <ThSortable label="Superficie" active={sortKey === "area"} dir={sortDir} onClick={() => toggleSort("area")} />
                <ThSortable label="Nombre capteurs" active={sortKey === "sensors"} dir={sortDir} onClick={() => toggleSort("sensors")} />
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">Action</th>
              </tr>
            </thead>

            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400">
                    Aucune parcelle trouvée.
                  </td>
                </tr>
              ) : (
                paged.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-[#0b1220]"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">{p.id}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.name}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.owner}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.area} m²</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.sensors}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onConsult(p.id)}
                          className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          Consulter
                        </button>

                        {/* optional delete (not in screenshot but admin needs it) */}
                        <button
                          type="button"
                          onClick={() => onDelete(p)}
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

        {/* pagination footer */}
        <div className="flex flex-col gap-2 border-t border-gray-200 bg-white px-4 py-3 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between
                        dark:border-gray-800 dark:bg-[#0d1117] dark:text-gray-400">
          <span>
            Page <span className="font-semibold">{safePage}</span> / {totalPages} •{" "}
            <span className="font-semibold">{filteredSorted.length}</span> résultats
          </span>

          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
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
