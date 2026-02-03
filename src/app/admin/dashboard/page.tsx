"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useT } from "@/components/i18n/useT";
import { useAdminSearch } from "@/components/admin/AdminSearchProvider";
import type { Capteur } from "@/lib/models/Capteur";
import type { LocaliteResponse } from "@/lib/models/LocaliteResponse";
import type { ParcelleResponse } from "@/lib/models/ParcelleResponse";
import type { RecommendationResponse } from "@/lib/models/RecommendationResponse";
import type { SensorMeasurementsResponse } from "@/lib/models/SensorMeasurementsResponse";
import type { TerrainResponse } from "@/lib/models/TerrainResponse";
import type { UserResponse } from "@/lib/models/UserResponse";
import { fetchAllMeasurements, fetchAllParcels, fetchLocalites, fetchSensors, fetchTerrains, fetchUsers } from "@/lib/apiData";
import { AdministrationService } from "@/lib/services/AdministrationService";
import { DonnEsDeCapteursService } from "@/lib/services/DonnEsDeCapteursService";
import { RecommandationsService } from "@/lib/services/RecommandationsService";
import { unwrapList } from "@/lib/apiHelpers";

type AlertLevel = "critical" | "warning" | "info";

type Alert = {
  id: string;
  level: AlertLevel;
  title: string;
  subtitle: string;
  time: string;
  parcelCode?: string;
};

type Recommendation = {
  id: string;
  title: string;
  parcel: string;
  time: string;
  parcelCode?: string;
};

export default function AdminDashboardPage() {
  const { t } = useT();
  const { query } = useAdminSearch();
  const search = query.trim().toLowerCase();
  const [range, setRange] = useState<"24h" | "7d" | "30d">("24h");
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [terrains, setTerrains] = useState<TerrainResponse[]>([]);
  const [parcels, setParcels] = useState<ParcelleResponse[]>([]);
  const [sensors, setSensors] = useState<Capteur[]>([]);
  const [localites, setLocalites] = useState<LocaliteResponse[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [measurements, setMeasurements] = useState<SensorMeasurementsResponse[]>([]);
  const [selectedParcelId, setSelectedParcelId] = useState<string>("");
  const [parcelMeasurements, setParcelMeasurements] = useState<SensorMeasurementsResponse[]>([]);
  const [showCharts, setShowCharts] = useState(false);
  const [adminStats, setAdminStats] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    let canceled = false;
    const load = async () => {
      try {
        let dashboardStats: Record<string, unknown> | null = null;
        try {
          const payload = await AdministrationService.getAdminDashboardApiV1AdminDashboardGet();
          if (payload && typeof payload === "object") {
            if ("data" in payload) {
              dashboardStats = (payload as { data: Record<string, unknown> }).data ?? null;
            } else {
              dashboardStats = payload as Record<string, unknown>;
            }
          }
        } catch {
          dashboardStats = null;
        }
        const [userList, terrainList, sensorList, localiteList] = await Promise.all([
          fetchUsers(),
          fetchTerrains(),
          fetchSensors(),
          fetchLocalites(),
        ]);
        const parcelList = await fetchAllParcels(terrainList);
        const measurementList = await fetchAllMeasurements(200);
        const recommendationPayload = await RecommandationsService.getAllRecommendationsApiV1RecommendationsGet(undefined, 50);
        if (canceled) return;
        setUsers(userList);
        setTerrains(terrainList);
        setSensors(sensorList);
        setLocalites(localiteList);
        setParcels(parcelList);
        setMeasurements(measurementList);
        setRecommendations(unwrapList<RecommendationResponse>(recommendationPayload));
        setAdminStats(dashboardStats);
      } catch {
        if (!canceled) {
          setUsers([]);
          setTerrains([]);
          setSensors([]);
          setLocalites([]);
          setParcels([]);
          setMeasurements([]);
          setRecommendations([]);
          setAdminStats(null);
        }
      } finally {
      }
    };
    void load();
    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setShowCharts(true), 0);
    return () => clearTimeout(id);
  }, []);

  const getAdminCount = (keys: string[]) => {
    if (!adminStats) return null;
    for (const key of keys) {
      const value = adminStats[key];
      if (typeof value === "number") return value;
    }
    return null;
  };

  const kpis = [
    {
      label: t("dashboard_kpi_users"),
      value: getAdminCount(["users", "utilisateurs", "total_users"]) ?? users.length,
      meta: t("dashboard_kpi_users_meta"),
      tone: "emerald" as const,
    },
    {
      label: t("dashboard_kpi_terrains"),
      value: getAdminCount(["terrains", "fields", "total_terrains"]) ?? terrains.length,
      meta: t("dashboard_kpi_terrains_meta"),
      tone: "teal" as const,
    },
    {
      label: t("dashboard_kpi_parcels"),
      value: getAdminCount(["parcelles", "parcels", "total_parcelles"]) ?? parcels.length,
      meta: t("dashboard_kpi_parcels_meta"),
      tone: "amber" as const,
    },
    {
      label: t("dashboard_kpi_sensors"),
      value: getAdminCount(["capteurs", "sensors", "total_capteurs"]) ?? sensors.length,
      meta: t("dashboard_kpi_sensors_meta"),
      tone: "blue" as const,
    },
  ];

  const parcelMap = useMemo(() => new Map(parcels.map((p) => [p.id, p])), [parcels]);
  const sensorMap = useMemo(() => new Map(sensors.map((s) => [s.id, s])), [sensors]);

  useEffect(() => {
    if (!parcels.length) return;
    if (selectedParcelId) return;
    setSelectedParcelId(parcels[0].id);
  }, [parcels, selectedParcelId]);

  useEffect(() => {
    let canceled = false;
    const loadParcelMeasurements = async () => {
      if (!selectedParcelId) return;
      try {
        const now = new Date();
        const endDate = now.toISOString();
        const days = range === "24h" ? 1 : range === "7d" ? 7 : 30;
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
        const payload = await DonnEsDeCapteursService.getMeasurementsByParcelleApiV1SensorDataSensorDataParcelleParcelleIdGet(
          selectedParcelId,
          undefined,
          200,
          startDate,
          endDate
        );
        const list = unwrapList<SensorMeasurementsResponse>(payload);
        if (canceled) return;
        setParcelMeasurements(list);
      } catch {
        if (!canceled) setParcelMeasurements([]);
      }
    };
    void loadParcelMeasurements();
    return () => {
      canceled = true;
    };
  }, [range, selectedParcelId]);

  const latestMeasurements = useMemo(() => {
    const sorted = measurements
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return sorted.slice(0, 3).map((m) => {
      const sensor = sensorMap.get(m.capteur_id);
      const parcel = parcelMap.get(m.parcelle_id);
      const parcelLabel = parcel ? `${parcel.code ?? "—"} — ${parcel.nom}` : m.parcelle_id;
      return {
        id: m.id,
        devEui: sensor?.dev_eui ?? "—",
        parcel: parcelLabel,
        humidity: m.humidity != null ? `${m.humidity}%` : "—",
        temperature: m.temperature != null ? `${m.temperature}°C` : "—",
        time: formatAgo(m.timestamp),
      };
    });
  }, [measurements, parcelMap, sensorMap]);

  const localiteCoverage = useMemo(() => {
    const countByLocalite = terrains.reduce((acc, terrain) => {
      acc.set(terrain.localite_id, (acc.get(terrain.localite_id) ?? 0) + 1);
      return acc;
    }, new Map<string, number>());
    return localites
      .map((localite) => ({
        id: localite.id,
        name: localite.ville || localite.nom,
        climate: localite.climate_zone ?? "—",
        terrains: countByLocalite.get(localite.id) ?? 0,
      }))
      .sort((a, b) => b.terrains - a.terrains)
      .slice(0, 3);
  }, [localites, terrains]);

  const alerts: Alert[] = useMemo(() => {
    const sorted = measurements
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const alertsList: Alert[] = [];
    for (const m of sorted) {
      if (alertsList.length >= 3) break;
      const parcel = parcelMap.get(m.parcelle_id);
      const parcelLabel = parcel ? `${parcel.code ?? "—"} — ${parcel.nom}` : m.parcelle_id;
      const title =
        m.humidity != null && m.humidity < 35
          ? t("dashboard_alert_humidity_low")
          : m.ph != null && (m.ph < 5.5 || m.ph > 7.5)
          ? t("dashboard_alert_ph_out")
          : m.temperature != null && m.temperature > 32
          ? t("dashboard_alert_temperature")
          : null;
      if (!title) continue;
      alertsList.push({
        id: m.id,
        level: m.humidity != null && m.humidity < 35 ? "warning" : "info",
        title,
        subtitle: parcelLabel,
        time: formatAgo(m.timestamp),
        parcelCode: parcel?.code ?? undefined,
      });
    }
    return alertsList;
  }, [measurements, parcelMap, t]);

  const sensorStatus = useMemo(() => {
    const latestBySensor = new Map<string, SensorMeasurementsResponse>();
    for (const m of measurements) {
      const prev = latestBySensor.get(m.capteur_id);
      if (!prev || new Date(m.timestamp).getTime() > new Date(prev.timestamp).getTime()) {
        latestBySensor.set(m.capteur_id, m);
      }
    }

    const now = Date.now();
    let online = 0;
    let offline = 0;
    latestBySensor.forEach((m) => {
      const ageMs = now - new Date(m.timestamp).getTime();
      if (ageMs <= 24 * 60 * 60 * 1000) {
        online += 1;
      } else {
        offline += 1;
      }
    });

    const lastIngest = measurements.length
      ? measurements.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].timestamp
      : null;

    return {
      online,
      offline,
      total: sensors.length,
      lastIngest,
    };
  }, [measurements, sensors.length]);

  const recs: Recommendation[] = useMemo(() => {
    return recommendations.slice(0, 4).map((r) => {
      const parcel = parcelMap.get(String(r.parcelle_id));
      const parcelLabel = parcel ? `${parcel.code ?? "—"} — ${parcel.nom}` : String(r.parcelle_id);
      return {
        id: String(r.id),
        title: r.titre,
        parcel: parcelLabel,
        time: formatAgo(r.date_creation),
        parcelCode: parcel?.code ?? undefined,
      };
    });
  }, [recommendations, parcelMap]);

  const filteredAlerts = useMemo(() => {
    if (!search) return alerts;
    return alerts.filter(
      (a) => a.title.toLowerCase().includes(search) || (a.parcelCode ?? "").toLowerCase().includes(search)
    );
  }, [alerts, search]);

  const filteredRecommendations = useMemo(() => {
    if (!search) return recs;
    return recs.filter(
      (r) => r.title.toLowerCase().includes(search) || (r.parcelCode ?? "").toLowerCase().includes(search)
    );
  }, [recs, search]);

  const trendSize = range === "24h" ? 6 : range === "7d" ? 9 : 12;
  const trendBase = parcelMeasurements
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-trendSize);
  const humidityTrend = trendBase.map((m) => m.humidity ?? 0);
  const temperatureTrend = trendBase.map((m) => m.temperature ?? 0);
  const phTrend = trendBase.map((m) => m.ph ?? 0);

  const timeline = useMemo(() => {
    const measurementEvents = measurements
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3)
      .map((m) => ({
        id: `m-${m.id}`,
        title: t("dashboard_timeline_sensor"),
        meta: parcelMap.get(m.parcelle_id)
          ? `${parcelMap.get(m.parcelle_id)?.code ?? "—"} — ${parcelMap.get(m.parcelle_id)?.nom}`
          : m.parcelle_id,
        time: formatAgo(m.timestamp),
        ts: new Date(m.timestamp).getTime(),
      }));

    const recommendationEvents = recommendations
      .slice()
      .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime())
      .slice(0, 2)
      .map((r) => ({
        id: `r-${r.id}`,
        title: t("dashboard_timeline_alert"),
        meta: r.titre,
        time: formatAgo(r.date_creation),
        ts: new Date(r.date_creation).getTime(),
      }));

    return [...measurementEvents, ...recommendationEvents]
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 4);
  }, [measurements, recommendations, parcelMap, t]);

  return (
    <div className="space-y-4">
      <section className="rounded-sm border border-green-200 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.25),_rgba(255,255,255,0.4))] p-4 dark:border-gray-800 dark:bg-[radial-gradient(circle_at_top,_rgba(22,163,74,0.25),_rgba(13,17,23,0.7))]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-green-700 dark:text-green-300">
              {t("dashboard_overview")}
            </p>
            <h1 className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">{t("dashboard_title")}</h1>
            <p className="mt-1 max-w-2xl text-xs text-gray-600 dark:text-gray-400">
              {t("dashboard_subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-green-200 bg-white/70 px-3 py-1 text-[11px] font-semibold text-green-700 dark:border-green-900 dark:bg-[#0d1117] dark:text-green-200">
              {t("dashboard_live")}
            </span>
            <div className="flex overflow-hidden rounded-sm border border-gray-200 bg-white/80 text-[11px] font-semibold dark:border-gray-700 dark:bg-[#0d1117]">
              {(["24h", "7d", "30d"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRange(value)}
                  className={[
                    "px-3 py-1",
                    range === value
                      ? "bg-green-600 text-white"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-[#161b22]",
                  ].join(" ")}
                >
                  {value === "24h" ? t("dashboard_range_24h") : value === "7d" ? t("dashboard_range_7d") : t("dashboard_range_30d")}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">{t("dashboard_quick_actions")}:</span>
          <Link
            href="/admin/users"
            className="rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-[11px] font-semibold text-gray-700 hover:bg-white dark:border-gray-700 dark:bg-[#0d1117] dark:text-gray-200"
          >
            {t("nav_users")}
          </Link>
          <Link
            href="/admin/terrains"
            className="rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-[11px] font-semibold text-gray-700 hover:bg-white dark:border-gray-700 dark:bg-[#0d1117] dark:text-gray-200"
          >
            {t("nav_terrains")}
          </Link>
          <Link
            href="/admin/parcels"
            className="rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-[11px] font-semibold text-gray-700 hover:bg-white dark:border-gray-700 dark:bg-[#0d1117] dark:text-gray-200"
          >
            {t("nav_parcels")}
          </Link>
          <Link
            href="/admin/sensors"
            className="rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-[11px] font-semibold text-gray-700 hover:bg-white dark:border-gray-700 dark:bg-[#0d1117] dark:text-gray-200"
          >
            {t("nav_sensors")}
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Kpi key={k.label} label={k.label} value={k.value} meta={k.meta} tone={k.tone} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-8">
          <Card
            title={t("dashboard_trends")}
            right={
              <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                <select
                  value={selectedParcelId}
                  onChange={(e) => setSelectedParcelId(e.target.value)}
                  className="h-7 rounded-sm border border-gray-200 bg-white px-2 text-[11px] text-gray-700 outline-none
                             dark:border-gray-700 dark:bg-[#0d1117] dark:text-gray-200"
                >
                  {parcels.length === 0 ? (
                    <option value="">{t("empty_parcels")}</option>
                  ) : (
                    parcels.map((p) => (
                      <option key={p.id} value={p.id}>
                        {`${p.code ?? "—"} — ${p.nom}`}
                      </option>
                    ))
                  )}
                </select>
                <span>{range}</span>
              </div>
            }
          >
            {showCharts ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <TrendPanel title={t("dashboard_trend_humidity")} unit="%" data={humidityTrend} tone="emerald" />
                <TrendPanel title={t("dashboard_trend_temperature")} unit="°C" data={temperatureTrend} tone="blue" />
                <TrendPanel title={t("dashboard_trend_ph")} unit="" data={phTrend} tone="amber" />
              </div>
            ) : (
              <div className="h-24 rounded-sm bg-gray-100 dark:bg-[#161b22]" />
            )}
          </Card>

          <Card title={t("dashboard_alerts")} right={<span className="text-[11px] text-gray-500 dark:text-gray-400">{filteredAlerts.length}</span>}>
            <div className="space-y-2">
              {filteredAlerts.length === 0 ? (
                <EmptyState text={t("dashboard_no_alerts")} />
              ) : (
                filteredAlerts.map((a) => <AlertRow key={a.id} alert={a} t={t} />)
              )}
            </div>
          </Card>

          <Card title={t("dashboard_activity_timeline")}>
            <div className="space-y-3">
              {timeline.map((item, index) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-2 w-2 rounded-full bg-green-600" />
                    {index < timeline.length - 1 ? (
                      <span className="h-8 w-px bg-green-200 dark:bg-green-900" />
                    ) : null}
                  </div>
                  <div className="flex-1 rounded-sm border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-[#0d1117]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{item.title}</p>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{item.time}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{item.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-3 lg:col-span-4">
          <Card title={t("dashboard_latest_measurements")}>
            <div className="overflow-x-auto">
              <table className="min-w-[360px] w-full text-left text-sm">
                <thead className="sticky top-0 bg-gray-50 dark:bg-[#161b22]">
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-3 py-2 text-[11px] font-semibold text-gray-700 dark:text-gray-200">DevEUI</th>
                    <th className="px-3 py-2 text-[11px] font-semibold text-gray-700 dark:text-gray-200">{t("table_parcels")}</th>
                    <th className="px-3 py-2 text-[11px] font-semibold text-gray-700 dark:text-gray-200">{t("dashboard_humidity")}</th>
                    <th className="px-3 py-2 text-[11px] font-semibold text-gray-700 dark:text-gray-200">{t("dashboard_last_update")}</th>
                  </tr>
                </thead>
                <tbody>
                  {latestMeasurements.map((m) => (
                    <tr key={m.id} className="border-b border-gray-100 last:border-b-0 dark:border-gray-900">
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{m.devEui}</td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{m.parcel}</td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{m.humidity}</td>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{m.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title={t("dashboard_recommendations")}>
            <div className="space-y-2">
              {filteredRecommendations.length === 0 ? (
                <EmptyState text={t("dashboard_no_recommendations")} />
              ) : (
                filteredRecommendations.map((r) => (
                  <div key={r.id} className="rounded-sm border border-gray-200 p-2 dark:border-gray-800 dark:bg-[#0d1117]">
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{r.title}</p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                      <span>{r.parcel}</span>
                      <span>{r.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          
        </div>
      </section>
    </div>
  );
}

function Card({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border border-gray-200 bg-white/90 p-3 shadow-sm dark:border-gray-800 dark:bg-[#0d1117]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{title}</p>
        {right}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Kpi({
  label,
  value,
  meta,
  tone,
}: {
  label: string;
  value: number;
  meta: string;
  tone: "emerald" | "teal" | "amber" | "blue";
}) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-500 text-emerald-600 dark:text-emerald-300"
      : tone === "teal"
      ? "border-teal-500 text-teal-600 dark:text-teal-300"
      : tone === "amber"
      ? "border-amber-500 text-amber-600 dark:text-amber-300"
      : "border-blue-500 text-blue-600 dark:text-blue-300";

  return (
    <div className="rounded-sm border border-gray-200 bg-white/90 p-3 shadow-sm dark:border-gray-800 dark:bg-[#0d1117]">
      <div className={`border-l-4 pl-3 ${toneClass}`}>
        <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{value}</p>
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">{meta}</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-gray-200 bg-gray-50 px-2 py-2 dark:border-gray-800 dark:bg-[#161b22]">
      <p className="text-[11px] text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-sm border border-dashed p-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
      {text}
    </div>
  );
}

function AlertRow({ alert, t }: { alert: Alert; t: (key: string) => string }) {
  const tone =
    alert.level === "critical"
      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
      : alert.level === "warning"
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200";

  const label =
    alert.level === "critical"
      ? t("dashboard_alert_critical")
      : alert.level === "warning"
      ? t("dashboard_alert_warning")
      : t("dashboard_alert_info");

  return (
    <div className="rounded-sm border border-gray-200 p-2 dark:border-gray-800 dark:bg-[#0d1117]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{alert.title}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{alert.subtitle}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone}`}>
            {label}
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">{alert.time}</span>
        </div>
      </div>
    </div>
  );
}

function TrendPanel({
  title,
  unit,
  data,
  tone,
}: {
  title: string;
  unit: string;
  data: number[];
  tone: "emerald" | "amber" | "blue";
}) {
  const last = data[data.length - 1] ?? 0;
  const first = data[0] ?? 0;
  const delta = last - first;
  const deltaLabel = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}${unit ? ` ${unit}` : ""}`;
  const toneClass =
    tone === "emerald"
      ? "text-emerald-600 dark:text-emerald-300"
      : tone === "amber"
      ? "text-amber-600 dark:text-amber-300"
      : "text-blue-600 dark:text-blue-300";

  return (
    <div className="rounded-sm border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-[#0d1117]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{title}</p>
        <span className={`text-[11px] font-semibold ${toneClass}`}>{deltaLabel}</span>
      </div>
      <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
        {last.toFixed(1)}
        {unit ? <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">{unit}</span> : null}
      </p>
      <div className="mt-2 h-16">
        <Sparkline data={data} tone={tone} />
      </div>
    </div>
  );
}

function Sparkline({ data, tone }: { data: number[]; tone: "emerald" | "amber" | "blue" }) {
  const safeData = data.length < 2 ? [0, 0] : data;
  const min = Math.min(...safeData);
  const max = Math.max(...safeData);
  const range = max - min || 1;
  const points = safeData
    .map((v, i) => {
      const x = (i / (safeData.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const stroke =
    tone === "emerald" ? "#10b981" : tone === "amber" ? "#f59e0b" : "#3b82f6";
  const fill =
    tone === "emerald"
      ? "rgba(16,185,129,0.2)"
      : tone === "amber"
      ? "rgba(245,158,11,0.2)"
      : "rgba(59,130,246,0.2)";

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
      <polyline points={`0,100 ${points} 100,100`} fill={fill} stroke="none" />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

function formatAgo(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  return `${days} d`;
}
