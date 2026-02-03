"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EditParcelModal from "@/components/admin/parcels/EditParcelModal";
import { useToast } from "@/components/ui/ToastProvider";
import { useT } from "@/components/i18n/useT";
import { useLang } from "@/components/i18n/LangProvider";
import type { Capteur } from "@/lib/models/Capteur";
import type { ParcelleResponse } from "@/lib/models/ParcelleResponse";
import type { SensorMeasurementsResponse } from "@/lib/models/SensorMeasurementsResponse";
import type { TerrainResponse } from "@/lib/models/TerrainResponse";
import { fetchAllParcels, fetchSensors, fetchTerrains } from "@/lib/apiData";
import { CapteursService } from "@/lib/services/CapteursService";
import { DonnEsDeCapteursService } from "@/lib/services/DonnEsDeCapteursService";
import { ParcellesService } from "@/lib/services/ParcellesService";
import { TerrainsService } from "@/lib/services/TerrainsService";
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

type Sensor = {
  id: string;
  code: string;
  devEui: string;
  name: string;
  type: "Soil Moisture" | "Temperature" | "pH";
  lastSeen: string; // ISO
  status: "ok" | "warning" | "offline";
};


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
  const pushRef = useRef(push);
  const tRef = useRef(t);

  const [editOpen, setEditOpen] = useState(false);
  const [parcel, setParcel] = useState<ParcelleResponse | null>(null);
  const [terrain, setTerrain] = useState<TerrainResponse | null>(null);
  const [measurements, setMeasurements] = useState<SensorMeasurementsResponse[]>([]);
  const [sensors, setSensors] = useState<Capteur[]>([]);
  const [assignedSensors, setAssignedSensors] = useState<Capteur[]>([]);
  const [allSensors, setAllSensors] = useState<Capteur[]>([]);
  const [assignSensorCode, setAssignSensorCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<"24h" | "7d">("24h");
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    pushRef.current = push;
  }, [push]);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  useEffect(() => {
    let canceled = false;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        let parcelData: ParcelleResponse | null = null;
        try {
          const parcelPayload = await ParcellesService.getParcelleApiV1ParcellesParcellesParcelleIdGet(id);
          parcelData = unwrapData<ParcelleResponse>(parcelPayload);
        } catch {
          const token = localStorage.getItem("smartagro:access_token");
          const res = await fetch(`https://iot-soil-backend.onrender.com/api/v1/parcelles/parcelles/${id}`, {
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (res.ok) {
            const json = await res.json();
            parcelData = unwrapData<ParcelleResponse>(json);
          }
        }
        if (!parcelData) {
          // Fallback: try global parcel list (some backends don't expose detail by ID).
          try {
            const list = await fetchAllParcels();
            parcelData = list.find((p) => p.id === id) ?? null;
          } catch {
            parcelData = null;
          }
        }
        if (!parcelData) {
          if (!canceled) setParcel(null);
          return;
        }
        let terrainData: TerrainResponse | null = null;
        try {
          const terrainPayload = await TerrainsService.getTerrainApiV1TerrainsTerrainsTerrainIdGet(parcelData.terrain_id);
          terrainData = unwrapData<TerrainResponse>(terrainPayload);
        } catch {
          try {
            const list = await fetchTerrains();
            terrainData = list.find((t) => t.id === parcelData?.terrain_id) ?? null;
          } catch {
            terrainData = null;
          }
        }
        if (canceled) return;
        setParcel(parcelData);
        setTerrain(terrainData ?? null);
      } catch {
        if (!canceled) pushRef.current({ title: tRef.current("load_failed"), kind: "error" });
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    void load();
    return () => {
      canceled = true;
    };
  }, [id]);

  useEffect(() => {
    let canceled = false;
    const loadMeasurements = async () => {
      if (!parcel) return;
      try {
        const now = new Date();
        const endDate = now.toISOString();
        const startDate = new Date(now.getTime() - (range === "24h" ? 24 : 7 * 24) * 60 * 60 * 1000).toISOString();
        const payload = await DonnEsDeCapteursService.getMeasurementsByParcelleApiV1SensorDataSensorDataParcelleParcelleIdGet(
          parcel.id,
          undefined,
          200,
          startDate,
          endDate
        );
        const list = unwrapList<SensorMeasurementsResponse>(payload).filter(
          (item) => item.parcelle_id === parcel.id
        );
        if (canceled) return;
        setMeasurements(list);
        const uniqueCapteurs = Array.from(new Set(list.map((m) => m.capteur_id).filter(Boolean)));
        const capteurList = await Promise.all(
          uniqueCapteurs.map((capteurId) =>
            CapteursService.readCapteurApiV1CapteursCapteurIdGet(capteurId).catch(() => null)
          )
        );
        if (canceled) return;
        setSensors(
          capteurList
            .map((item) => (item ? unwrapData<Capteur>(item) : null))
            .filter((item): item is Capteur => !!item)
        );
      } catch {
        if (!canceled) setMeasurements([]);
      }
    };
    void loadMeasurements();
    return () => {
      canceled = true;
    };
  }, [parcel, range]);

  const loadAssignedSensors = async () => {
    if (!parcel?.code) {
      setAssignedSensors([]);
      return;
    }
    try {
      const map = getSensorParcelMap();
      const allSensors = await fetchSensors();
      setAllSensors(allSensors);
      const linked = allSensors.filter((sensor) => map[sensor.code] === parcel.code);
      setAssignedSensors(linked);
    } catch {
      setAssignedSensors([]);
      setAllSensors([]);
    }
  };

  useEffect(() => {
    let canceled = false;
    void loadAssignedSensors().catch(() => {
      if (!canceled) setAssignedSensors([]);
    });
    return () => {
      canceled = true;
    };
  }, [parcel?.code]);

  const availableSensors = useMemo(() => {
    if (!allSensors.length) return [];
    const assignedCodes = new Set(assignedSensors.map((sensor) => sensor.code));
    return allSensors.filter((sensor) => !assignedCodes.has(sensor.code));
  }, [allSensors, assignedSensors]);

  useEffect(() => {
    const id = setTimeout(() => setShowCharts(true), 0);
    return () => clearTimeout(id);
  }, []);

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

  const sensorsList: Sensor[] = useMemo(() => {
    const source = assignedSensors.length ? assignedSensors : sensors;
    if (!source.length) return [];
    return source.map((sensor) => {
      const last = measurements
        .filter((m) => m.capteur_id === sensor.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      const lastSeen = last?.timestamp ?? new Date(0).toISOString();
      const diffMs = Date.now() - new Date(lastSeen).getTime();
      const status: Sensor["status"] =
        !last ? "offline" : diffMs < 24 * 60 * 60 * 1000 ? "ok" : diffMs < 7 * 24 * 60 * 60 * 1000 ? "warning" : "offline";
      return {
        id: sensor.id,
        code: sensor.code ?? "",
        devEui: sensor.dev_eui ?? "",
        name: sensor.nom,
        type: "Soil Moisture",
        lastSeen,
        status,
      };
    });
  }, [assignedSensors, measurements, sensors]);

  const canDeassign = assignedSensors.length > 0;

  const latest = useMemo(() => {
    if (!measurements.length) return null;
    return measurements
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }, [measurements]);

  const level: "ok" | "warning" | "offline" =
    !latest ? "offline" : latest.humidity != null && latest.humidity < 35 ? "warning" : "ok";
  const lastMeasure = latest?.humidity != null ? `${latest.humidity}%` : "—";

  if (!id) {
    return <ParcelDetailsSkeleton />;
  }

  if (!parcel && !loading) {
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

  if (!parcel) {
    return <ParcelDetailsSkeleton />;
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

          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t("parcel_details_title")}</h1>

          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{parcel.nom}</span> {" "}
            <span className="text-gray-500 dark:text-gray-400">
              ({latest ? formatLastUpdate(latest.timestamp) : "—"})
            </span>
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
          <button
            type="button"
            onClick={() => setEditOpen(true)}
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
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117]">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("parcel_information")}</p>
          <div className="mt-3 space-y-2 text-xs text-gray-700 dark:text-gray-300">
            <Row label={t("table_name")} value={parcel.nom} />
            <Row label={t("table_code")} value={parcel.code ?? "—"} />
            <Row label={t("table_status")} value={statusLabel(level, t)} />
            <Row label={t("parcel_area_label")} value={`${parcel.superficie.toLocaleString()} m²`} />
            <Row label={t("parcel_sensors_label")} value={`${assignedSensors.length || sensors.length || 0}`} />
            {terrain ? (
              <Row label={t("table_terrain")} value={terrain.nom} />
            ) : (
              <Row label={t("table_terrain")} value={parcel.terrain_id} />
            )}
          </div>
        </div>

        <div className="rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117] lg:col-span-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("moisture_history")}</p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("parcel_chart_subtitle")}</p>

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
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("attached_sensors")}</p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("parcel_sensors_subtitle")}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select
                value={assignSensorCode}
                onChange={(e) => setAssignSensorCode(e.target.value)}
                className="h-9 min-w-[220px] rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                           dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
              >
                <option value="">{t("assign_sensor_select")}</option>
                {availableSensors.map((sensor) => (
                  <option key={sensor.id} value={sensor.code}>
                    {(sensor.code || sensor.dev_eui) ? `${sensor.code || sensor.dev_eui} — ${sensor.nom}` : sensor.nom}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (!parcel?.code || !assignSensorCode) return;
                  const parcelCode = parcel.code;
                  void CapteursService.assignCapteurApiV1CapteursAssignPost(parcelCode, assignSensorCode)
                    .then(() => {
                      setSensorParcelLink(assignSensorCode, parcelCode);
                      setAssignSensorCode("");
                      void loadAssignedSensors();
                    })
                    .catch(() => {
                      pushRef.current({ title: tRef.current("load_failed"), kind: "error" });
                    });
                }}
                className={`rounded-sm px-3 py-2 text-xs font-semibold text-white ${
                  assignSensorCode ? "bg-green-600 hover:bg-green-700" : "cursor-not-allowed bg-gray-300"
                }`}
                disabled={!assignSensorCode}
              >
                {t("assign_sensor")}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[780px] w-full text-left text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-[#161b22]">
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_name")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_code")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_last_activity")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_status")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("deassign")}</th>
                </tr>
              </thead>
              <tbody>
                {sensorsList.map((s, idx) => (
                  <tr
                    key={s.id ?? s.code ?? `sensor-${idx}`}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-[#0b1220]"
                  >
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{s.name}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{s.code || s.devEui || "—"}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{formatAgo(s.lastSeen, lang)}</td>
                    <td className="px-4 py-3">
                      <SensorBadge status={s.status} t={t} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (!parcel?.code || !s.code) return;
                          void CapteursService.desassignCapteurApiV1CapteursDesassignPost(parcel.code, s.code)
                            .then(() => {
                              clearSensorParcelLink(s.code);
                              void loadAssignedSensors();
                            })
                            .catch(() => {
                              pushRef.current({ title: tRef.current("load_failed"), kind: "error" });
                            });
                        }}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-sm ${
                          canDeassign
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                        }`}
                        disabled={!canDeassign}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <EditParcelModal
        key={parcel.id}
        open={editOpen}
        parcel={parcel}
        onClose={() => setEditOpen(false)}
        onSave={async (patch) => {
          try {
            const updated = await ParcellesService.updateParcelleApiV1ParcellesParcellesParcelleIdPut(parcel.id, {
              nom: patch.nom,
              superficie: patch.superficie,
            });
            setParcel(unwrapData<ParcelleResponse>(updated));
            setEditOpen(false);
            push({
              title: t("edit_parcel"),
              message: `${parcel.id}`,
              kind: "success",
            });
          } catch {
            push({
              title: t("invalidCredentials"),
              message: t("edit_parcel"),
              kind: "error",
            });
          }
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

function statusLabel(level: "ok" | "warning" | "offline", t: (k: string) => string) {
  if (level === "ok") return t("status_ok");
  if (level === "warning") return t("status_warning");
  return t("status_offline");
}

function formatLastUpdate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function formatAgo(iso: string, lang: string) {
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
