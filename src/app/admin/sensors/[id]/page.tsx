"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useT } from "@/components/i18n/useT";
import { useToast } from "@/components/ui/ToastProvider";
import { useLang } from "@/components/i18n/LangProvider";
import type { Capteur } from "@/lib/models/Capteur";
import type { ParcelleResponse } from "@/lib/models/ParcelleResponse";
import type { SensorMeasurementsResponse } from "@/lib/models/SensorMeasurementsResponse";
import { fetchAllParcels } from "@/lib/apiData";
import { CapteursService } from "@/lib/services/CapteursService";
import { DonnEsDeCapteursService } from "@/lib/services/DonnEsDeCapteursService";
import { ParcellesService } from "@/lib/services/ParcellesService";
import { unwrapData, unwrapList } from "@/lib/apiHelpers";
import { clearSensorParcelLink, getSensorParcelMap, setSensorParcelLink } from "@/lib/sensorParcelStore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function SensorDetailsPage() {
  const router = useRouter();
  const { t } = useT();
  const { lang } = useLang();
  const { push } = useToast();
  const params = useParams();
  const raw = params?.id;
  const id: string = Array.isArray(raw) ? raw[0] : (raw ?? "");

  const [range, setRange] = useState<"24h" | "7d" | "30d">("24h");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({ nom: "", dev_eui: "", code: "" });
  const [sensor, setSensor] = useState<Capteur | null>(null);
  const [parcel, setParcel] = useState<ParcelleResponse | null>(null);
  const [measurements, setMeasurements] = useState<SensorMeasurementsResponse[]>([]);
  const [latest, setLatest] = useState<SensorMeasurementsResponse | null>(null);
  const [showCharts, setShowCharts] = useState(false);
  const [parcels, setParcels] = useState<ParcelleResponse[]>([]);
  const [assignedParcelCode, setAssignedParcelCode] = useState("");
  const canAssign = Boolean(sensor?.code && assignedParcelCode);

  const metricsData = useMemo(() => {
    if (!measurements.length) return [];
    return measurements
      .slice()
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((m) => ({
        t: range === "24h" ? new Date(m.timestamp).toLocaleTimeString() : new Date(m.timestamp).toLocaleDateString(),
        ph: m.ph ?? undefined,
        azote: m.azote ?? undefined,
        phosphore: m.phosphore ?? undefined,
        potassium: m.potassium ?? undefined,
        humidity: m.humidity ?? undefined,
        temperature: m.temperature ?? undefined,
      }));
  }, [measurements, range]);

  useEffect(() => {
    let canceled = false;
    const load = async () => {
      if (!id) return;
      try {
        const payload = await CapteursService.readCapteurApiV1CapteursCapteurIdGet(id);
        const data = unwrapData<Capteur>(payload);
        if (canceled) return;
        setSensor(data ?? null);
      } catch {
        if (!canceled) setSensor(null);
      }
    };
    void load();
    return () => {
      canceled = true;
    };
  }, [id, refreshKey]);

  useEffect(() => {
    let canceled = false;
    const loadParcels = async () => {
      try {
        const list = await fetchAllParcels();
        if (canceled) return;
        setParcels(list);
      } catch {
        if (!canceled) setParcels([]);
      }
    };
    void loadParcels();
    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    if (!sensor) return;
    setDraft({ nom: sensor.nom, dev_eui: sensor.dev_eui, code: sensor.code });
    const map = getSensorParcelMap();
    setAssignedParcelCode(map[sensor.code] ?? "");
  }, [sensor]);

  useEffect(() => {
    let canceled = false;
    const loadLatest = async () => {
      if (!sensor) return;
      try {
        const payload = await DonnEsDeCapteursService.getLatestMeasurementApiV1SensorDataSensorDataLatestCapteurCapteurIdGet(sensor.id);
        const data = unwrapData<SensorMeasurementsResponse>(payload);
        if (canceled) return;
        setLatest(data ?? null);
        if (data?.parcelle_id) {
          const parcelPayload = await ParcellesService.getParcelleApiV1ParcellesParcellesParcelleIdGet(data.parcelle_id);
          setParcel(unwrapData<ParcelleResponse>(parcelPayload));
        } else {
          setParcel(null);
        }
      } catch {
        if (!canceled) setLatest(null);
      }
    };
    void loadLatest();
    return () => {
      canceled = true;
    };
  }, [sensor]);

  useEffect(() => {
    let canceled = false;
    const loadMeasurements = async () => {
      if (!sensor) return;
      try {
        const now = new Date();
        const endDate = now.toISOString();
        const days = range === "24h" ? 1 : range === "7d" ? 7 : 30;
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
        const payload = await DonnEsDeCapteursService.getMeasurementsByCapteurApiV1SensorDataSensorDataCapteurCapteurIdGet(
          sensor.id,
          undefined,
          200,
          startDate,
          endDate
        );
        const list = unwrapList<SensorMeasurementsResponse>(payload);
        if (canceled) return;
        setMeasurements(list);
      } catch {
        if (!canceled) setMeasurements([]);
      }
    };
    void loadMeasurements();
    return () => {
      canceled = true;
    };
  }, [range, sensor]);

  useEffect(() => {
    const id = setTimeout(() => setShowCharts(true), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    let canceled = false;
    const hydrateParcelFromMeasurements = async () => {
      if (parcel || !measurements.length) return;
      const latestFromList = measurements
        .slice()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      if (!latestFromList?.parcelle_id) return;
      try {
        const payload = await ParcellesService.getParcelleApiV1ParcellesParcellesParcelleIdGet(latestFromList.parcelle_id);
        if (canceled) return;
        setParcel(unwrapData<ParcelleResponse>(payload));
      } catch {
        // ignore
      }
    };
    void hydrateParcelFromMeasurements();
    return () => {
      canceled = true;
    };
  }, [measurements, parcel]);

  useEffect(() => {
    if (!assignedParcelCode) return;
    const linked = parcels.find((p) => (p.code ?? "") === assignedParcelCode);
    if (linked) setParcel(linked);
  }, [assignedParcelCode, parcels]);

  const assignedParcel = useMemo(() => {
    if (!assignedParcelCode) return null;
    return parcels.find((p) => (p.code ?? "") === assignedParcelCode) ?? null;
  }, [assignedParcelCode, parcels]);

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

  const level: "ok" | "warning" | "offline" =
    !latest ? "offline" : latest.humidity != null && latest.humidity < 35 ? "warning" : "ok";
  const lastMeasure = latest?.humidity != null ? `${latest.humidity}%` : "—";

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
            {t("sensor_details_title")}
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
              void CapteursService.deleteCapteurApiV1CapteursCapteurIdDelete(sensor.id).then(() => {
                router.push("/admin/sensors");
              });
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
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("parcel_information")}</p>
          <div className="mt-3 space-y-2 text-xs text-gray-700 dark:text-gray-300">
            <Row label={t("table_name")} value={sensor.nom} />
            <Row label="DevEUI" value={sensor.dev_eui} />
            <Row label={t("sensor_status_label")} value={statusLabel(level, t)} />
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
                    void CapteursService.updateCapteurApiV1CapteursCapteurIdPut(sensor.id, {
                      nom: draft.nom.trim(),
                      dev_eui: draft.dev_eui.trim(),
                    }).then(() => {
                      setRefreshKey((prev) => prev + 1);
                      setIsEditing(false);
                    });
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

          {showCharts ? (
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <MetricChart title={t("metric_ph")} unit="" dataKey="ph" data={metricsData} yDomain={[0, 14]} yTicks={[0, 7, 14]} />
              <MetricChart title={t("metric_azote")} unit="mg/kg" dataKey="azote" data={metricsData} />
              <MetricChart title={t("metric_phosphore")} unit="mg/kg" dataKey="phosphore" data={metricsData} />
              <MetricChart title={t("metric_potassium")} unit="mg/kg" dataKey="potassium" data={metricsData} />
              <MetricChart title={t("dashboard_humidity")} unit="%" dataKey="humidity" data={metricsData} />
              <MetricChart title={t("dashboard_temperature")} unit="°C" dataKey="temperature" data={metricsData} />
            </div>
          ) : (
            <div className="mt-3 h-[220px] rounded-sm bg-gray-100 dark:bg-[#161b22]" />
          )}
        </div>

        <div className="rounded-sm border border-gray-300 bg-white dark:border-gray-800 dark:bg-[#0d1117] lg:col-span-3">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("linked_parcels")}</p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("sensor_parcels_subtitle")}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select
                value={assignedParcelCode}
                onChange={(e) => setAssignedParcelCode(e.target.value)}
                className="h-9 min-w-[220px] rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                           dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
              >
                <option value="">{t("table_parcels")}</option>
                {parcels.map((p) => (
                  <option key={p.id} value={p.code ?? ""} disabled={!p.code}>
                    {p.nom} {p.code ? `(${p.code})` : ""}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (!sensor?.code || !assignedParcelCode) {
                    push({ title: t("load_failed"), kind: "error" });
                    return;
                  }
                  void CapteursService.assignCapteurApiV1CapteursAssignPost(assignedParcelCode, sensor.code)
                    .then(() => {
                      setSensorParcelLink(sensor.code, assignedParcelCode);
                      setRefreshKey((prev) => prev + 1);
                    })
                    .catch(() => {
                      push({ title: t("load_failed"), kind: "error" });
                    });
                }}
                className={`rounded-sm px-3 py-2 text-xs font-semibold text-white ${
                  canAssign ? "bg-green-600 hover:bg-green-700" : "cursor-not-allowed bg-gray-300"
                }`}
                disabled={!canAssign}
              >
                {t("assign_sensor")}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-[#161b22]">
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_name")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_code")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_area")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("deassign")}</th>
                </tr>
              </thead>

              <tbody>
                {!assignedParcel ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400">
                      {t("empty_parcels")}
                    </td>
                  </tr>
                ) : (
                  [assignedParcel].map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-[#0b1220]"
                    >
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.nom}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.code ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.superficie.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (!sensor?.code || !p.code) {
                              push({ title: t("load_failed"), kind: "error" });
                              return;
                            }
                            void CapteursService.desassignCapteurApiV1CapteursDesassignPost(p.code, sensor.code)
                              .then(() => {
                                clearSensorParcelLink(sensor.code);
                                setAssignedParcelCode("");
                                setRefreshKey((prev) => prev + 1);
                              })
                              .catch(() => {
                                push({ title: t("load_failed"), kind: "error" });
                              });
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-red-600 text-white hover:bg-red-700"
                          aria-label={t("deassign")}
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
                            <path d="M17 7l-10 10" />
                            <path d="M7 7l10 10" />
                            <path d="M16 3h5v5" />
                            <path d="M8 21H3v-5" />
                          </svg>
                          <span className="sr-only">{t("deassign")}</span>
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
  yDomain,
  yTicks,
}: {
  title: string;
  data: Array<Record<string, string | number | undefined>>;
  dataKey: string;
  unit: string;
  yDomain?: [number, number];
  yTicks?: number[];
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
            <YAxis width={28} domain={yDomain} ticks={yTicks} />
            <Tooltip formatter={tooltipFormatter} />
            <Line type="monotone" dataKey={dataKey} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
