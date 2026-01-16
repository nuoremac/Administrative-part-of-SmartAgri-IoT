"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useT } from "@/components/i18n/useT";
import { useLang } from "@/components/i18n/LangProvider";
import { getLatestMeasurement, listSensorData } from "@/lib/mockSensorData";
import { getParcel, listParcels } from "@/lib/mockParcels";
import { deleteSensor, getSensor, updateSensor } from "@/lib/mockSensors";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function StatusBadge({ level, t }: { level: "ok" | "warning" | "offline"; t: (k: string) => string }) {
  const cls =
    level === "ok"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
      : level === "warning"
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";

  const label = level === "ok" ? t("status_ok") : level === "warning" ? t("status_warning") : t("status_offline");
  return <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${cls}`}>{label}</span>;
}

export default function SensorDetailsPage() {
  const router = useRouter();
  const { t } = useT();
  const { lang } = useLang();
  const params = useParams();
  const raw = params?.id;
  const id: string = Array.isArray(raw) ? raw[0] : (raw ?? "");

  const [range, setRange] = useState<"24h" | "7d" | "30d">("24h");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ nom: "", dev_eui: "", code: "" });
  const [assignedParcelId, setAssignedParcelId] = useState("");

  const sensor = useMemo(() => (id ? getSensor(id) : undefined), [id, refreshKey]);
  const parcels = useMemo(() => listParcels({ limit: 200 }).items, []);

  const parcel = useMemo(() => {
    if (!sensor) return null;
    return getParcel(sensor.parcelle_id);
  }, [sensor]);

  const metricsData = useMemo(() => {
    if (!sensor) return [];
    return listSensorData({ capteur_id: sensor.id, parcelle_id: sensor.parcelle_id, range }).map((m) => ({
      t: range === "24h" ? new Date(m.timestamp).toLocaleTimeString() : new Date(m.timestamp).toLocaleDateString(),
      ph: m.ph,
      azote: m.azote,
      phosphore: m.phosphore,
      potassium: m.potassium,
      humidity: m.humidity,
      temperature: m.temperature,
    }));
  }, [sensor, range]);

  useEffect(() => {
    if (!sensor) return;
    setDraft({ nom: sensor.nom, dev_eui: sensor.dev_eui, code: sensor.code });
    setAssignedParcelId(sensor.parcelle_id);
  }, [sensor]);

  if (!id) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
        <div className="rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117]">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!sensor) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
        <button
          onClick={() => router.push("/admin/sensors")}
          className="rounded-sm border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50
                     dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-200"
        >
          ← {t("back_to_list")}
        </button>

        <div className="mt-4 rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117]">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("sensor_not_found")}</p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{id}</p>
        </div>
      </div>
    );
  }

  const latest = getLatestMeasurement({ capteur_id: sensor.id, parcelle_id: sensor.parcelle_id });
  const level: "ok" | "warning" | "offline" =
    !latest ? "offline" : latest.humidity < 35 ? "warning" : "ok";
  const lastMeasure = latest ? `${latest.humidity}%` : "—";

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button
            onClick={() => router.push("/admin/sensors")}
            className="mb-2 inline-flex rounded-sm border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50
                       dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-200"
          >
            ← {t("back_to_list")}
          </button>

          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t("sensor_details_title")} <span className="text-gray-600 dark:text-gray-400">{sensor.id}</span>
          </h1>

          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{sensor.nom}</span> {" "}
            <span className="text-gray-500 dark:text-gray-400">
              ({latest ? formatLastUpdate(latest.timestamp, lang) : "—"})
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t("parcel_trend_label")}:</span>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as "24h" | "7d" | "30d")}
            className="h-9 rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                       dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
          >
            <option value="24h">{t("dashboard_range_24h")}</option>
            <option value="7d">{t("dashboard_range_7d")}</option>
            <option value="30d">{t("dashboard_range_30d")}</option>
          </select>
          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white hover:bg-amber-600"
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
            onClick={() => {
              if (!window.confirm(t("delete_confirm_body"))) return;
              deleteSensor(sensor.id);
              router.push("/admin/sensors");
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
            aria-label={t("delete")}
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
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117]">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("sensor_latest_measure")}</p>
          <div className="mt-3 space-y-2 text-xs text-gray-700 dark:text-gray-300">
            <Row label={t("table_id")} value={sensor.id} />
            <Row label={t("table_name")} value={sensor.nom} />
            <Row label="DevEUI" value={sensor.dev_eui} />
            <Row label={t("sensor_status_label")} value={statusLabel(level, t)} />
            <Row label={t("table_last_measure")} value={lastMeasure} />
          </div>
          {isEditing ? (
            <div className="mt-4 space-y-3 text-xs text-gray-700 dark:text-gray-300">
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                  {t("table_name")}
                </label>
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateSensor(sensor.id, {
                      nom: draft.nom.trim(),
                      dev_eui: draft.dev_eui.trim(),
                      code: draft.code.trim(),
                    });
                    setRefreshKey((prev) => prev + 1);
                    setIsEditing(false);
                  }}
                  className="rounded-sm bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                >
                  {t("save")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraft({ nom: sensor.nom, dev_eui: sensor.dev_eui, code: sensor.code });
                    setIsEditing(false);
                  }}
                  className="rounded-sm border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50
                             dark:border-gray-700 dark:text-gray-200 dark:hover:bg-[#161b22]"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117] lg:col-span-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("sensor_history")}</p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("dashboard_moisture_label")}</p>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <MetricChart title={t("metric_ph")} unit="" dataKey="ph" data={metricsData} />
            <MetricChart title={t("metric_azote")} unit="mg/kg" dataKey="azote" data={metricsData} />
            <MetricChart title={t("metric_phosphore")} unit="mg/kg" dataKey="phosphore" data={metricsData} />
            <MetricChart title={t("metric_potassium")} unit="mg/kg" dataKey="potassium" data={metricsData} />
            <MetricChart title={t("dashboard_humidity")} unit="%" dataKey="humidity" data={metricsData} />
            <MetricChart title={t("dashboard_temperature")} unit="°C" dataKey="temperature" data={metricsData} />
          </div>
        </div>

        <div className="rounded-sm border border-gray-300 bg-white dark:border-gray-800 dark:bg-[#0d1117] lg:col-span-3">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("linked_parcels")}</p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("sensor_parcels_subtitle")}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select
                value={assignedParcelId}
                onChange={(e) => setAssignedParcelId(e.target.value)}
                className="h-9 min-w-[220px] rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                           dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
              >
                {parcels.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom} ({p.id})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (!assignedParcelId) return;
                  updateSensor(sensor.id, { parcelle_id: assignedParcelId });
                  setRefreshKey((prev) => prev + 1);
                }}
                className="rounded-sm bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
              >
                {t("save")}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-[#161b22]">
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_id")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_name")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_code")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_area")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_actions")}</th>
                </tr>
              </thead>

              <tbody>
                {!parcel ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400">
                      {t("empty_parcels")}
                    </td>
                  </tr>
                ) : (
                  [parcel].map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-[#0b1220]"
                    >
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">{p.id}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.nom}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.code}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.superficie.toLocaleString()}</td>
                      <td className="px-4 py-3">
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );
}

function statusLabel(level: "ok" | "warning" | "offline", t: (k: string) => string) {
  if (level === "ok") return t("status_ok");
  if (level === "warning") return t("status_warning");
  return t("status_offline");
}

function formatLastUpdate(iso: string, lang: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(lang === "fr" ? "fr-FR" : "en-US");
}

function MetricChart({
  title,
  data,
  dataKey,
  unit,
}: {
  title: string;
  data: Array<Record<string, string | number>>;
  dataKey: string;
  unit: string;
}) {
  const tooltipFormatter = (value: number | string | undefined) =>
    `${value ?? "—"}${unit ? ` ${unit}` : ""}`;
  return (
    <div className="rounded-sm border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-[#0d1117]">
      <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">
        {title}
        {unit ? <span className="ml-1 text-[10px] text-gray-500 dark:text-gray-400">({unit})</span> : null}
      </p>
      <div className="mt-2 h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <YAxis width={28} />
            <Tooltip formatter={tooltipFormatter} />
            <Line type="monotone" dataKey={dataKey} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
