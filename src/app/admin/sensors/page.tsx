"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminSearch } from "@/components/admin/AdminSearchProvider";
import { useToast } from "@/components/ui/ToastProvider";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useT } from "@/components/i18n/useT";
import {
  deleteSensor,
  listSensors,
  restoreSensor,
  type SensorRow,
  type SensorStatus,
} from "@/lib/mockSensors";

type SortKey = "id" | "name" | "status" | "lastMeasure" | "parcels";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 10;

function statusLabel(status: SensorStatus, t: (k: string) => string) {
  if (status === "ok") return t("status_ok");
  if (status === "warning") return t("status_warning");
  return t("status_offline");
}

function StatusBadge({ status, t }: { status: SensorStatus; t: (k: string) => string }) {
  const cls =
    status === "ok"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
      : status === "warning"
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";

  return <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${cls}`}>{statusLabel(status, t)}</span>;
}

export default function SensorsPage() {
  const router = useRouter();
  const { query, setQuery } = useAdminSearch();
  const { push } = useToast();
  const { t } = useT();

  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [confirmSensor, setConfirmSensor] = useState<SensorRow | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const listResult = useMemo(() => {
    return listSensors({
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

  const confirmDelete = () => {
    if (!confirmSensor) return;
    const removed = deleteSensor(confirmSensor.id);
    setConfirmSensor(null);
    if (!removed) return;

    setRefreshKey((k) => k + 1);

    push({
      title: t("delete_toast_title"),
      message: `${removed.id}`,
      actionLabel: t("undo"),
      onAction: () => {
        restoreSensor(removed);
        setRefreshKey((k) => k + 1);
        push({ title: t("delete_toast_undo"), message: `${removed.id}`, kind: "success" });
      },
    });
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t("nav_sensors")}{" "}
            <span className="text-gray-600 dark:text-gray-400">({listResult.total})</span>
          </h1>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("sensors_subtitle")}</p>
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
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="sticky top-0 bg-white dark:bg-[#0d1117]">
              <tr className="border-b border-gray-400 dark:border-gray-800">
                <ThSortable label={t("table_id")} active={sortKey === "id"} dir={sortDir} onClick={() => toggleSort("id")} />
                <ThSortable label={t("table_name")} active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
                <ThSortable label={t("table_status")} active={sortKey === "status"} dir={sortDir} onClick={() => toggleSort("status")} />
                <ThSortable label={t("table_last_measure")} active={sortKey === "lastMeasure"} dir={sortDir} onClick={() => toggleSort("lastMeasure")} />
                <ThSortable label={t("table_parcels")} active={sortKey === "parcels"} dir={sortDir} onClick={() => toggleSort("parcels")} />
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_actions")}</th>
              </tr>
            </thead>

            <tbody>
              {listResult.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400">
                    {t("empty_sensors")}
                  </td>
                </tr>
              ) : (
                listResult.items.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-[#0b1220]"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">{s.id}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{s.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} t={t} />
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{s.lastMeasure}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{s.parcels.length}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/sensors/${s.id}`)}
                          className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          {t("consult")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmSensor(s)}
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

      <ConfirmDialog
        open={!!confirmSensor}
        title={t("delete_confirm_title")}
        message={t("delete_confirm_body")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmSensor(null)}
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
