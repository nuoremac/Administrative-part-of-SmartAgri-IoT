"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useT } from "@/components/i18n/useT";
import { useAdminSearch } from "@/components/admin/AdminSearchProvider";

type AlertLevel = "critical" | "warning" | "info";

type Alert = {
  id: string;
  level: AlertLevel;
  title: string;
  subtitle: string;
  time: string;
};

type Recommendation = {
  id: string;
  title: string;
  parcel: string;
  time: string;
};

export default function AdminDashboardPage() {
  const { t } = useT();
  const { query } = useAdminSearch();
  const search = query.trim().toLowerCase();
  const [range, setRange] = useState<"24h" | "7d" | "30d">("24h");

  // API-driven widgets (mocked but shaped to backend)
  const kpis = [
    { label: t("dashboard_kpi_users"), value: 128, meta: t("dashboard_kpi_users_meta"), tone: "emerald" as const },
    { label: t("dashboard_kpi_terrains"), value: 42, meta: t("dashboard_kpi_terrains_meta"), tone: "teal" as const },
    { label: t("dashboard_kpi_parcels"), value: 186, meta: t("dashboard_kpi_parcels_meta"), tone: "amber" as const },
    { label: t("dashboard_kpi_sensors"), value: 214, meta: t("dashboard_kpi_sensors_meta"), tone: "blue" as const },
  ];

  const alerts: Alert[] = [
    { id: "a1", level: "critical", title: t("dashboard_alert_humidity_low"), subtitle: "Parcelle A • Terrain Nord", time: "5 min" },
    { id: "a2", level: "warning", title: t("dashboard_alert_ph_out"), subtitle: "Parcelle D • Terrain Ouest", time: "22 min" },
    { id: "a3", level: "info", title: t("dashboard_alert_temperature"), subtitle: "Parcelle C • Terrain Sud", time: "1 h" },
  ];

  const recommendations: Recommendation[] = [
    { id: "r1", title: t("dashboard_rec_irrigation"), parcel: "Parcelle A", time: "10 min" },
    { id: "r2", title: t("dashboard_rec_fertilizer"), parcel: "Parcelle C", time: "1 h" },
    { id: "r3", title: t("dashboard_rec_ph"), parcel: "Parcelle D", time: "2 h" },
  ];

  const latestMeasurements = [
    { id: "m1", devEui: "70B3D57ED005E321", parcel: "Parcelle A", humidity: "41%", temperature: "24°C", time: "3 min" },
    { id: "m2", devEui: "70B3D57ED005E322", parcel: "Parcelle B", humidity: "55%", temperature: "22°C", time: "9 min" },
    { id: "m3", devEui: "70B3D57ED005E323", parcel: "Parcelle C", humidity: "49%", temperature: "23°C", time: "18 min" },
  ];

  const localiteCoverage = [
    { id: "l1", name: "Douala", climate: "tropical", terrains: 14 },
    { id: "l2", name: "Yaounde", climate: "savane", terrains: 11 },
    { id: "l3", name: "Bafoussam", climate: "montagne", terrains: 8 },
  ];

  const filteredAlerts = useMemo(() => {
    if (!search) return alerts;
    return alerts.filter(
      (a) => a.title.toLowerCase().includes(search) || a.subtitle.toLowerCase().includes(search)
    );
  }, [alerts, search]);

  const filteredRecommendations = useMemo(() => {
    if (!search) return recommendations;
    return recommendations.filter(
      (r) => r.title.toLowerCase().includes(search) || r.parcel.toLowerCase().includes(search)
    );
  }, [recommendations, search]);

  const humidityTrendBase = [38, 40, 41, 39, 43, 45, 44, 46, 48, 47, 49, 51];
  const temperatureTrendBase = [22, 22.5, 23, 23.4, 23.1, 23.8, 24.1, 24.6, 24.2, 24.8, 25.1, 24.7];
  const phTrendBase = [6.2, 6.3, 6.25, 6.35, 6.4, 6.38, 6.45, 6.5, 6.55, 6.48, 6.6, 6.52];
  const trendSize = range === "24h" ? 6 : range === "7d" ? 9 : 12;
  const humidityTrend = humidityTrendBase.slice(-trendSize);
  const temperatureTrend = temperatureTrendBase.slice(-trendSize);
  const phTrend = phTrendBase.slice(-trendSize);

  const timeline = [
    { id: "t1", title: t("dashboard_timeline_sensor"), meta: "Sensor #12 • Parcelle C", time: "6 min" },
    { id: "t2", title: t("dashboard_timeline_parcel"), meta: "Parcelle A • 2.1 ha", time: "18 min" },
    { id: "t3", title: t("dashboard_timeline_user"), meta: "farmer_07 • role user", time: "45 min" },
    { id: "t4", title: t("dashboard_timeline_alert"), meta: "Humidity low • Parcelle D", time: "1 h" },
  ];

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
          <Card title={t("dashboard_trends")} right={<span className="text-[11px] text-gray-500 dark:text-gray-400">{range}</span>}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <TrendPanel title={t("dashboard_trend_humidity")} unit="%" data={humidityTrend} tone="emerald" />
              <TrendPanel title={t("dashboard_trend_temperature")} unit="°C" data={temperatureTrend} tone="blue" />
              <TrendPanel title={t("dashboard_trend_ph")} unit="" data={phTrend} tone="amber" />
            </div>
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

          <Card title={t("dashboard_system_status")}>
            <div className="grid grid-cols-2 gap-2">
              <MiniStat label={t("dashboard_gateways_online")} value="3/4" />
              <MiniStat label={t("dashboard_last_ingest")} value="2 min" />
              <MiniStat label={t("dashboard_low_battery")} value="2" />
              <MiniStat label={t("dashboard_offline")} value="3" />
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
