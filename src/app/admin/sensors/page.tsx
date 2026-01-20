"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminSearch } from "@/components/admin/AdminSearchProvider";
import { useT } from "@/components/i18n/useT";
import {
  createSensor,
  listSensors,
} from "@/lib/mockSensors";
import { getLatestMeasurement } from "@/lib/mockSensorData";
import { getParcel, listParcels } from "@/lib/mockParcels";

type SortKey = "id" | "nom" | "dev_eui" | "parcelle_id";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 10;

function statusLabel(level: "ok" | "warning" | "offline", t: (k: string) => string) {
  if (level === "ok") return t("status_ok");
  if (level === "warning") return t("status_warning");
  return t("status_offline");
}

function StatusBadge({ level, t }: { level: "ok" | "warning" | "offline"; t: (k: string) => string }) {
  const cls =
    level === "ok"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
      : level === "warning"
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";

  return <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${cls}`}>{statusLabel(level, t)}</span>;
}

export default function SensorsPage() {
  const router = useRouter();
  const { query, setQuery } = useAdminSearch();
  const { t } = useT();

  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const parcels = useMemo(() => listParcels({ limit: 200 }).items, []);
  const defaultParcelId = parcels[0]?.id || "";
  const [draft, setDraft] = useState({ nom: "", dev_eui: "", code: "", parcelle_id: defaultParcelId });

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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsAdding((prev) => !prev);
              if (!isAdding) {
                setDraft((prev) => ({
                  nom: "",
                  dev_eui: "",
                  code: "",
                  parcelle_id: prev.parcelle_id || defaultParcelId,
                }));
              }
            }}
            className="rounded-sm bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
          >
            + {t("add_sensor")}
          </button>
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
      </div>

      {isAdding ? (
        <div className="mb-4 rounded-sm border border-gray-300 bg-white p-4 text-xs text-gray-700 dark:border-gray-800 dark:bg-[#0d1117] dark:text-gray-300">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{t("table_name")}</label>
              <input
                value={draft.nom}
                onChange={(e) => setDraft((prev) => ({ ...prev, nom: e.target.value }))}
                className="mt-1 h-9 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                           dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">DevEUI</label>
              <input
                value={draft.dev_eui}
                onChange={(e) => setDraft((prev) => ({ ...prev, dev_eui: e.target.value }))}
                className="mt-1 h-9 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                           dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{t("table_code")}</label>
              <input
                value={draft.code}
                onChange={(e) => setDraft((prev) => ({ ...prev, code: e.target.value }))}
                className="mt-1 h-9 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                           dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{t("table_parcels")}</label>
              <select
                value={draft.parcelle_id}
                onChange={(e) => setDraft((prev) => ({ ...prev, parcelle_id: e.target.value }))}
                className="mt-1 h-9 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                           dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
              >
                {parcels.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom} ({p.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const now = new Date().toISOString();
                createSensor({
                  nom: draft.nom.trim() || "Capteur",
                  dev_eui: draft.dev_eui.trim() || `AUTO-${Date.now()}`,
                  code: draft.code.trim() || `CPT-${Date.now()}`,
                  parcelle_id: draft.parcelle_id || defaultParcelId,
                  date_installation: now,
                  date_activation: now,
                });
                setRefreshKey((k) => k + 1);
                setIsAdding(false);
              }}
              className="rounded-sm bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
            >
              {t("save")}
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-sm border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50
                         dark:border-gray-700 dark:text-gray-200 dark:hover:bg-[#161b22]"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-sm border border-gray-400 bg-white dark:border-gray-800 dark:bg-[#0d1117]">
        <div className="overflow-x-auto">
          <table className="min-w-full md:min-w-[980px] w-full text-left text-sm">
            <thead className="sticky top-0 bg-white dark:bg-[#0d1117]">
              <tr className="border-b border-gray-400 dark:border-gray-800">
                <ThSortable label={t("table_id")} active={sortKey === "id"} dir={sortDir} onClick={() => toggleSort("id")} />
                <ThSortable label={t("table_name")} active={sortKey === "nom"} dir={sortDir} onClick={() => toggleSort("nom")} />
                <ThSortable label="DevEUI" active={sortKey === "dev_eui"} dir={sortDir} onClick={() => toggleSort("dev_eui")} />
                <ThSortable label={t("table_parcels")} active={sortKey === "parcelle_id"} dir={sortDir} onClick={() => toggleSort("parcelle_id")} />
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_view")}</th>
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
                listResult.items.map((s) => {
                  const latest = getLatestMeasurement({ capteur_id: s.id, parcelle_id: s.parcelle_id });
                  const level: "ok" | "warning" | "offline" =
                    !latest ? "offline" : latest.humidity < 35 ? "warning" : "ok";
                  const parcel = getParcel(s.parcelle_id);
                  return (
                  <tr
                    key={s.id}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-[#0b1220]"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">{s.id}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{s.nom}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{s.dev_eui}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{parcel?.nom ?? s.parcelle_id}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/sensors/${s.id}`)}
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
