"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useT } from "@/components/i18n/useT";
import { useLang } from "@/components/i18n/LangProvider";
import { listSensorData } from "@/lib/mockSensorData";
import { getParcel } from "@/lib/mockParcels";
import { getSensor, type SensorStatus } from "@/lib/mockSensors";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function StatusBadge({ status, t }: { status: SensorStatus; t: (k: string) => string }) {
  const cls =
    status === "ok"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
      : status === "warning"
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";

  const label = status === "ok" ? t("status_ok") : status === "warning" ? t("status_warning") : t("status_offline");
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

  const sensor = id ? getSensor(id) : undefined;

  const parcels = useMemo(() => {
    if (!sensor) return [];
    return sensor.parcels.map((pid) => getParcel(pid)).filter(isDefined);
  }, [sensor]);

  const measures = useMemo(() => {
    if (!sensor) return [];
    return listSensorData({ sensorId: sensor.id, range }).map((m) => ({
      t: range === "24h" ? new Date(m.at).toLocaleTimeString() : new Date(m.at).toLocaleDateString(),
      value: m.moisture,
    }));
  }, [sensor, range]);

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
            <span className="font-semibold">{sensor.name}</span> • <StatusBadge status={sensor.status} t={t} /> •{" "}
            <span className="font-semibold">{sensor.lastMeasure}</span>{" "}
            <span className="text-gray-500 dark:text-gray-400">({formatLastUpdate(sensor.lastMeasureAt, lang)})</span>
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
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117]">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("sensor_latest_measure")}</p>
          <div className="mt-3 space-y-2 text-xs text-gray-700 dark:text-gray-300">
            <Row label={t("table_id")} value={sensor.id} />
            <Row label={t("table_name")} value={sensor.name} />
            <Row label={t("sensor_status_label")} value={statusLabel(sensor.status, t)} />
            <Row label={t("table_last_measure")} value={sensor.lastMeasure} />
          </div>
        </div>

        <div className="rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117] lg:col-span-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("sensor_history")}</p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("dashboard_moisture_label")}</p>

          <div className="mt-3 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={measures} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="t" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="value" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-sm border border-gray-300 bg-white dark:border-gray-800 dark:bg-[#0d1117] lg:col-span-3">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t("linked_parcels")} <span className="text-gray-600 dark:text-gray-400">({sensor.parcels.length})</span>
            </p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("sensor_parcels_subtitle")}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-[#161b22]">
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_id")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_name")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_owner")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_area")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_actions")}</th>
                </tr>
              </thead>

              <tbody>
                {parcels.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400">
                      {t("empty_parcels")}
                    </td>
                  </tr>
                ) : (
                  parcels.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-[#0b1220]"
                    >
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">{p.id}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.name}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.owner}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.area.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/parcels/${p.id}`)}
                          className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          {t("consult")}
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

function statusLabel(status: SensorStatus, t: (k: string) => string) {
  if (status === "ok") return t("status_ok");
  if (status === "warning") return t("status_warning");
  return t("status_offline");
}

function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

function formatLastUpdate(iso: string, lang: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(lang === "fr" ? "fr-FR" : "en-US");
}
