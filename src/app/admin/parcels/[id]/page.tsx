"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { getParcel, updateParcel, type ParcelRow } from "@/lib/mockParcels";
import { getTerrain } from "@/lib/mockTerrains";
import EditParcelModal from "@/components/admin/parcels/EditParcelModal";
import { useToast } from "@/components/ui/ToastProvider";
import { useT } from "@/components/i18n/useT";
import { useLang } from "@/components/i18n/LangProvider";
import { listParcelMeasurements } from "@/lib/mockSensorData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Sensor = {
  id: string;
  name: string;
  type: "Soil Moisture" | "Temperature" | "pH";
  lastSeen: string; // ISO
  status: "ok" | "warning" | "offline";
};

const MOCK_NOW_MS = Date.parse("2026-01-02T12:00:00.000Z");

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function ParcelDetailsPage() {
  const params = useParams();
  const raw = params?.id;
  const id: string = Array.isArray(raw) ? raw[0] : (raw ?? "");
  return <ParcelDetailsInner key={id} id={id} />;
}

function ParcelDetailsInner({ id }: { id: string }) {
  const router = useRouter();
  const { push } = useToast();
  const { t } = useT();
  const { lang } = useLang();
  const isClient = useIsClient();

  const [editOpen, setEditOpen] = useState(false);
  const [parcelView, setParcelView] = useState<ParcelRow | null>(null);
  const [range, setRange] = useState<"24h" | "7d">("24h");

  const sensors: Sensor[] = useMemo(
    () => [
      {
        id: "S-101",
        name: "Capteur 1",
        type: "Soil Moisture",
        lastSeen: new Date(MOCK_NOW_MS - 12 * 60000).toISOString(),
        status: "ok",
      },
      {
        id: "S-102",
        name: "Capteur 2",
        type: "Temperature",
        lastSeen: new Date(MOCK_NOW_MS - 60 * 60000).toISOString(),
        status: "warning",
      },
      {
        id: "S-103",
        name: "Capteur 3",
        type: "pH",
        lastSeen: new Date(MOCK_NOW_MS - 9 * 3600000).toISOString(),
        status: "offline",
      },
    ],
    []
  );

  const parcelFromStore = isClient && id ? getParcel(id) : undefined;
  const displayed: ParcelRow | undefined = parcelView ?? parcelFromStore;
  const terrain = displayed?.terrain_id ? getTerrain(displayed.terrain_id) : undefined;

  const metricsData = useMemo(() => {
    if (!displayed) return [];
    const series = listParcelMeasurements({ parcelle_id: displayed.id, range });
    return series.map((m) => ({
      t: range === "24h" ? new Date(m.timestamp).toLocaleTimeString() : new Date(m.timestamp).toLocaleDateString(),
      ph: m.ph,
      azote: m.azote,
      phosphore: m.phosphore,
      potassium: m.potassium,
      humidity: m.humidity,
      temperature: m.temperature,
    }));
  }, [displayed, range]);

  if (!isClient || !id) {
    return <ParcelDetailsSkeleton />;
  }

  if (!displayed) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
        <button
          onClick={() => router.push("/admin/parcels")}
          className="rounded-sm border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50
                     dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-200"
        >
          ← {t("back_to_list")}
        </button>

        <div className="mt-4 rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117]">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("parcel_not_found")}</p>
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
            onClick={() => router.push("/admin/parcels")}
            className="mb-2 inline-flex rounded-sm border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50
                       dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-200"
          >
            ← {t("back_to_list")}
          </button>

          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t("parcel_details_title")} <span className="text-gray-600 dark:text-gray-400">{displayed.id}</span>
          </h1>

          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {t("parcel_area_label")} <span className="font-semibold">{displayed.superficie.toLocaleString()} m²</span> •{" "}
            {t("parcel_sensors_label")} <span className="font-semibold">{displayed.nombre_capteurs}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t("parcel_trend_label")}:</span>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as "24h" | "7d")}
            className="h-9 rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                       dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
          >
            <option value="24h">{t("dashboard_range_24h")}</option>
            <option value="7d">{t("dashboard_range_7d")}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        <div className="rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117] lg:col-span-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("moisture_history")}</p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("parcel_chart_subtitle")}</p>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <MetricChart title={t("metric_ph")} unit="" dataKey="ph" data={metricsData} />
            <MetricChart title={t("metric_azote")} unit="mg/kg" dataKey="azote" data={metricsData} />
            <MetricChart title={t("metric_phosphore")} unit="mg/kg" dataKey="phosphore" data={metricsData} />
            <MetricChart title={t("metric_potassium")} unit="mg/kg" dataKey="potassium" data={metricsData} />
            <MetricChart title={t("dashboard_humidity")} unit="%" dataKey="humidity" data={metricsData} />
            <MetricChart title={t("dashboard_temperature")} unit="°C" dataKey="temperature" data={metricsData} />
          </div>
        </div>

        <div className="rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117]">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("parcel_details_title")}</p>

          <div className="mt-3 space-y-2 text-xs text-gray-700 dark:text-gray-300">
            <Row label={t("table_id")} value={displayed.id} />
            <Row label={t("table_name")} value={displayed.nom} />
            <Row label={t("table_code")} value={displayed.code} />
            <Row label={t("table_soil_type")} value={displayed.type_sol} />
            <Row label={t("table_current_crop")} value={displayed.culture_actuelle} />
            <Row label={t("parcel_area_label")} value={`${displayed.superficie.toLocaleString()} m²`} />
            <Row label={t("parcel_sensors_label")} value={`${displayed.nombre_capteurs}`} />
            <Row label={t("parcel_last_update")} value={formatLastUpdate(displayed.updated_at)} />
            {terrain ? (
              <Row label={t("table_terrain")} value={terrain.nom} />
            ) : (
              <Row label={t("table_terrain")} value={displayed.terrain_id} />
            )}
          </div>

          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="mt-4 h-9 w-full rounded-sm bg-green-600 px-3 text-xs font-semibold text-white hover:bg-green-700"
          >
            {t("edit_parcel")}
          </button>
        </div>

        <div className="rounded-sm border border-gray-300 bg-white dark:border-gray-800 dark:bg-[#0d1117] lg:col-span-3">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("attached_sensors")}</p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("parcel_sensors_subtitle")}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[780px] w-full text-left text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-[#161b22]">
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_id")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_name")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_type")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_last_activity")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_status")}</th>
                </tr>
              </thead>
              <tbody>
                {sensors.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-[#0b1220]"
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">{s.id}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{s.name}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{s.type}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{formatAgo(s.lastSeen, lang)}</td>
                    <td className="px-4 py-3">
                      <SensorBadge status={s.status} t={t} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <EditParcelModal
        key={displayed.id}
        open={editOpen}
        parcel={displayed}
        onClose={() => setEditOpen(false)}
        onSave={(patch) => {
          const updated = updateParcel(displayed.id, patch);
          setEditOpen(false);

          if (!updated) {
            push({
              title: t("invalidCredentials"),
              message: t("edit_parcel"),
              kind: "error",
            });
            return;
          }

          setParcelView(updated);

          push({
            title: t("edit_parcel"),
            message: `${updated.id}`,
            kind: "success",
          });
        }}
      />
    </div>
  );
}

function ParcelDetailsSkeleton() {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
      <div className="rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117]">
        <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mt-3 h-3 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="mt-6 h-[260px] animate-pulse rounded bg-gray-100 dark:bg-[#161b22]" />
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

function formatLastUpdate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function formatAgo(iso: string, lang: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = MOCK_NOW_MS - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return lang === "fr" ? `il y a ${mins} min` : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return lang === "fr" ? `il y a ${hours} h` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return lang === "fr" ? `il y a ${days} j` : `${days}d ago`;
}

function SensorBadge({ status, t }: { status: "ok" | "warning" | "offline"; t: (k: string) => string }) {
  const cls =
    status === "ok"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
      : status === "warning"
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";

  const label = status === "ok" ? t("status_ok") : status === "warning" ? t("status_warning") : t("status_offline");
  return <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${cls}`}>{label}</span>;
}
