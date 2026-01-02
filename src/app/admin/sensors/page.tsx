"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAdminSearch } from "@/components/admin/AdminSearchProvider";
import { useToast } from "@/components/ui/ToastProvider";
import {
  deleteSensor,
  restoreSensor,
  type SensorRow,
  subscribeSensors,
  getSensorsSnapshot,
  getSensorsServerSnapshot,
  type SensorStatus,
} from "@/lib/mockSensors";

type SortKey = "id" | "name" | "status" | "lastMeasure" | "parcels";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 10;

function statusLabel(s: SensorStatus) {
  if (s === "ok") return "OK";
  if (s === "warning") return "Attention";
  return "Hors ligne";
}

function StatusBadge({ status }: { status: SensorStatus }) {
  const cls =
    status === "ok"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
      : status === "warning"
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";

  return <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${cls}`}>{statusLabel(status)}</span>;
}

export default function SensorsPage() {
  const router = useRouter();
  const { query, setQuery } = useAdminSearch();
  const { push } = useToast();

  // ✅ SSR-safe live store
  const rows = useSyncExternalStore(subscribeSensors, getSensorsSnapshot, getSensorsServerSnapshot);

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
      : rows.filter((x) =>
          [x.id, x.name, x.status, x.lastMeasure, x.parcels.join(",")]
            .join(" ")
            .toLowerCase()
            .includes(s)
        );

    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === "id") return a.id.localeCompare(b.id) * dir;
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "status") return a.status.localeCompare(b.status) * dir;
      if (sortKey === "lastMeasure") return a.lastMeasure.localeCompare(b.lastMeasure) * dir;
      return (a.parcels.length - b.parcels.length) * dir;
    });
  }, [rows, query, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredSorted.slice(start, start + PAGE_SIZE);
  }, [filteredSorted, safePage]);

  const onConsultParcels = (sensorId: string) => {
    router.push(`/admin/sensors/${sensorId}`);
  };

  const onDelete = (s: SensorRow) => {
    const removed = deleteSensor(s.id);
    if (!removed) return;

    push({
      title: "Capteur supprimé",
      message: `${removed.id} supprimé.`,
      actionLabel: "Annuler",
      onAction: () => {
        restoreSensor(removed);
        push({ title: "Suppression annulée", message: `${removed.id} restauré.`, kind: "success" });
      },
    });
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
      {/* header row */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Capteurs{" "}
            <span className="text-gray-600 dark:text-gray-400" suppressHydrationWarning>
              ({rows.length})
            </span>
          </h1>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Cliquez sur “Consulter” pour voir les parcelles associées au capteur.
          </p>
        </div>

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
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="bg-white dark:bg-[#0d1117]">
              <tr className="border-b border-gray-400 dark:border-gray-800">
                <ThSortable label="IdCapteur" active={sortKey === "id"} dir={sortDir} onClick={() => toggleSort("id")} />
                <ThSortable label="Nom capteur" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
                <ThSortable label="Statut" active={sortKey === "status"} dir={sortDir} onClick={() => toggleSort("status")} />
                <ThSortable label="Dernière mesure" active={sortKey === "lastMeasure"} dir={sortDir} onClick={() => toggleSort("lastMeasure")} />
                <ThSortable label="Parcelles associées" active={sortKey === "parcels"} dir={sortDir} onClick={() => toggleSort("parcels")} />
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">Action</th>
              </tr>
            </thead>

            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400">
                    Aucun capteur trouvé.
                  </td>
                </tr>
              ) : (
                paged.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-[#0b1220]"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">{s.id}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{s.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      {s.lastMeasure}{" "}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        • {formatLastUpdate(s.lastMeasureAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold">{s.parcels.length}</span>
                        <button
                          type="button"
                          onClick={() => onConsultParcels(s.id)}
                          className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          Consulter
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onDelete(s)}
                        className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Supprimer
                      </button>
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

function formatLastUpdate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}
