
"use client";

import { useMemo, useState } from "react";
import SoilMoistureLineChart from "@/components/charts/SoilMoistureLineChart";
import { useT } from "@/components/i18n/useT";
import { useAdminSearch } from "@/components/admin/AdminSearchProvider";

/* ---------- Types ---------- */

type AlertLevel = "critical" | "warning" | "info";
type Alert = {
  id: string;
  level: AlertLevel;
  title: string;
  subtitle: string;
};

type RangeKey = "24h" | "7d" | "30d";

/* ---------- Page ---------- */

export default function AdminDashboardPage() {
  const { t } = useT();
  const { query } = useAdminSearch();
  const search = query.trim().toLowerCase();

  /* ----- KPI data ----- */
  const kpis = [
    { value: 30, label: t("admin_kpi_farmers"), valueClass: "text-red-600", meta: t("dashboard_kpi_farmers_meta") },
    { value: 70, label: t("admin_kpi_terrains"), valueClass: "text-orange-500", sub: "1000 m²", meta: t("dashboard_kpi_terrains_meta") },
    { value: 500, label: t("admin_kpi_parcelles"), valueClass: "text-fuchsia-600", meta: t("dashboard_kpi_parcels_meta") },
    { value: 20, label: t("admin_kpi_capteurs"), valueClass: "text-cyan-500", meta: t("dashboard_kpi_sensors_meta") },
  ];

  /* ----- Weather ----- */
  const weather = {
    location: "Darmstadt",
    now: "18°C",
    condition: t("dashboard_weather_condition"),
    wind: "9 km/h",
    humidity: "62%",
    forecast: [
      { day: t("dashboard_weather_today"), min: "14°", max: "19°" },
      { day: t("dashboard_weather_tomorrow"), min: "13°", max: "18°" },
      { day: t("dashboard_weather_thu"), min: "12°", max: "17°" },
    ],
  };

  /* ----- Sensor health ----- */
  const sensorHealth = {
    online: 17,
    offline: 3,
    lastIngest: "2 min",
    lowBattery: 2,
  };

  /* ----- Trend selector ----- */
  const [range, setRange] = useState<RangeKey>("24h");

  const moistureData = useMemo(() => {
    if (range === "24h") {
      return [
        { time: "08:00", moisture: 62 },
        { time: "09:00", moisture: 60 },
        { time: "10:00", moisture: 58 },
        { time: "11:00", moisture: 55 },
        { time: "12:00", moisture: 53 },
        { time: "13:00", moisture: 54 },
        { time: "14:00", moisture: 52 },
      ];
    }
    if (range === "7d") {
      return [
        { time: "Mon", moisture: 61 },
        { time: "Tue", moisture: 58 },
        { time: "Wed", moisture: 56 },
        { time: "Thu", moisture: 54 },
        { time: "Fri", moisture: 57 },
        { time: "Sat", moisture: 55 },
        { time: "Sun", moisture: 53 },
      ];
    }
    return [
      { time: "W1", moisture: 60 },
      { time: "W2", moisture: 57 },
      { time: "W3", moisture: 55 },
      { time: "W4", moisture: 52 },
    ];
  }, [range]);

  /* ----- Alerts ----- */
  const alerts: Alert[] = [
    { id: "a1", level: "critical", title: t("dashboard_alert_1_title"), subtitle: t("dashboard_alert_1_subtitle") },
    { id: "a2", level: "warning", title: t("dashboard_alert_2_title"), subtitle: t("dashboard_alert_2_subtitle") },
    { id: "a3", level: "info", title: t("dashboard_alert_3_title"), subtitle: t("dashboard_alert_3_subtitle") },
    { id: "a4", level: "warning", title: t("dashboard_alert_4_title"), subtitle: t("dashboard_alert_4_subtitle") },
  ];

  const [alertFilter, setAlertFilter] = useState<"all" | AlertLevel>("all");

  const filteredAlerts = useMemo(() => {
    const base =
      alertFilter === "all"
        ? alerts
        : alerts.filter((a) => a.level === alertFilter);

    if (!search) return base;

    return base.filter(
      (a) =>
        a.title.toLowerCase().includes(search) ||
        a.subtitle.toLowerCase().includes(search)
    );
  }, [alerts, alertFilter, search]);

  /* ----- Activity ----- */
  const recent = [
    { id: "r1", text: t("dashboard_recent_1"), time: "10:42" },
    { id: "r2", text: t("dashboard_recent_2"), time: "09:10" },
    { id: "r3", text: t("dashboard_recent_3"), time: t("dashboard_recent_yesterday") },
  ];

  const filteredRecent = useMemo(() => {
    if (!search) return recent;
    return recent.filter((r) =>
      r.text.toLowerCase().includes(search)
    );
  }, [recent, search]);

  /* ---------- Render ---------- */

  return (
    <div className="space-y-3">
      {/* KPIs */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {kpis.map((k) => (
          <Kpi key={k.label} {...k} />
        ))}
      </section>

      {/* Widgets */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Weather */}
        <Card title={t("dashboard_weather")}>
          <p className="text-xs font-semibold">{weather.location}</p>
          <p className="mt-2 text-3xl font-extrabold">{weather.now}</p>
          <p className="text-xs text-gray-600">{weather.condition}</p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <MiniStat label={t("dashboard_wind")} value={weather.wind} />
            <MiniStat label={t("dashboard_humidity")} value={weather.humidity} />
          </div>
        </Card>

        {/* Sensors + chart */}
        <Card
          title={t("dashboard_sensors_health")}
          right={<TrendSelector range={range} setRange={setRange} t={t} />}
        >
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label={t("dashboard_online")} value={`${sensorHealth.online}`} />
            <MiniStat label={t("dashboard_offline")} value={`${sensorHealth.offline}`} />
            <MiniStat label={t("dashboard_last_sync")} value={sensorHealth.lastIngest} />
            <MiniStat label={t("dashboard_low_battery")} value={`${sensorHealth.lowBattery}`} />
          </div>

          <div className="mt-3">
            <SoilMoistureLineChart data={moistureData} />
            <p className="mt-1 text-[11px] text-gray-500">
              {t("dashboard_moisture_label")} — {range}
            </p>
          </div>
        </Card>

        {/* Alerts */}
        <Card
          title={t("dashboard_alerts")}
          right={<AlertFilters filter={alertFilter} setFilter={setAlertFilter} t={t} />}
        >
          {filteredAlerts.length === 0 ? (
            <div className="rounded-sm border border-dashed p-3 text-xs text-gray-500">
              {t("dashboard_no_alerts")}
            </div>
          ) : (
            filteredAlerts.map((a) => (
              <AlertRow key={a.id} {...a} />
            ))
          )}
        </Card>
      </section>

      {/* Activity */}
      <section>
        <Card title={t("dashboard_activity")}>
          <div className="space-y-2">
            {filteredRecent.map((r) => (
              <div key={r.id} className="rounded-sm bg-gray-50 p-2">
                <p className="text-xs font-semibold ">{r.text}</p>
                <p className="text-[11px] text-gray-500">{r.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

/* ---------- Components ---------- */

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
    <div className="rounded-sm border bg-white p-3 dark:border-gray-800 dark:bg-[#0d1117]">
      <div className="flex justify-between">
        <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{title}</p>
        {right}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Kpi({
  value,
  label,
  valueClass,
  sub,
  meta,
}: {
  value: number;
  label: string;
  valueClass: string;
  sub?: string;
  meta?: string;
}) {
  return (
    <div className="rounded-sm border bg-white p-3">
      <div className="flex justify-between">
        <div>
          <p className={`text-2xl font-extrabold ${valueClass}`}>{value}</p>
          <p className="text-xs font-semibold">{label}</p>
          {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
        </div>
        {meta && (
          <span className="rounded-sm bg-gray-50 px-2 py-1 text-[11px]">
            {meta}
          </span>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-gray-50 px-2 py-2 dark:bg-[#161b22]">
      <p className="text-[11px] text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-xs font-semibold dark:text-gray-100">{value}</p>
    </div>
  );
}

function AlertFilters({
  filter,
  setFilter,
  t,
}: {
  filter: "all" | AlertLevel;
  setFilter: (v: "all" | AlertLevel) => void;
  t: (k: string) => string;
}) {
  return (
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value as "all" | AlertLevel)}
      className="rounded-sm border px-2 py-1 text-[11px]"
    >
      <option value="all">{t("dashboard_alert_all")}</option>
      <option value="critical">{t("dashboard_alert_critical")}</option>
      <option value="warning">{t("dashboard_alert_warning")}</option>
      <option value="info">{t("dashboard_alert_info")}</option>
    </select>
  );
}

function TrendSelector({
  range,
  setRange,
  t,
}: {
  range: RangeKey;
  setRange: (r: RangeKey) => void;
  t: (k: string) => string;
}) {
  return (
    <select
      value={range}
      onChange={(e) => setRange(e.target.value as RangeKey)}
      className="rounded-sm border px-2 py-1 text-[11px]"
    >
      <option value="24h">{t("dashboard_range_24h")}</option>
      <option value="7d">{t("dashboard_range_7d")}</option>
      <option value="30d">{t("dashboard_range_30d")}</option>
    </select>
  );
}

function AlertRow({
  level,
  title,
  subtitle,
}: {
  level: AlertLevel;
  title: string;
  subtitle: string;
}) {
  const dot =
    level === "critical"
      ? "bg-red-600"
      : level === "warning"
      ? "bg-yellow-500"
      : "bg-blue-600";

  return (
    <div className="rounded-sm border p-2">
      <div className="flex gap-2">
        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${dot}`} />
        <div>
          <p className="text-xs font-semibold">{title}</p>
          <p className="text-[11px] text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
