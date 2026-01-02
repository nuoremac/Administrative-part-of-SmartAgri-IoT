
"use client";

import { useEffect, useMemo, useState } from "react";
import SoilMoistureLineChart from "@/components/charts/SoilMoistureLineChart";

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
  /* ----- Search (from AdminShell) ----- */
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = (e: Event) => {
      const q = (e as CustomEvent<string>).detail || "";
      setSearch(q.toLowerCase());
    };

    window.addEventListener("admin:search", handler as EventListener);
    return () =>
      window.removeEventListener("admin:search", handler as EventListener);
  }, []);

  /* ----- KPI data ----- */
  const kpis = [
    { value: 30, label: "Agriculteurs", valueClass: "text-red-600", meta: "+2 / semaine" },
    { value: 70, label: "Terrains", valueClass: "text-orange-500", sub: "1000 m²", meta: "+5 / mois" },
    { value: 500, label: "Parcelles", valueClass: "text-fuchsia-600", meta: "12 actives" },
    { value: 20, label: "Capteurs", valueClass: "text-cyan-500", meta: "3 hors ligne" },
  ];

  /* ----- Weather ----- */
  const weather = {
    location: "Darmstadt",
    now: "18°C",
    condition: "Partly cloudy",
    wind: "9 km/h",
    humidity: "62%",
    forecast: [
      { day: "Today", min: "14°", max: "19°" },
      { day: "Tomorrow", min: "13°", max: "18°" },
      { day: "Thu", min: "12°", max: "17°" },
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
    { id: "a1", level: "critical", title: "Capteur #23 hors ligne", subtitle: "Parcelle B – Terrain Nord" },
    { id: "a2", level: "warning", title: "Humidité basse", subtitle: "Parcelle A – irrigation recommandée" },
    { id: "a3", level: "info", title: "Nouvelle trame reçue", subtitle: "Capteur #12 – il y a 3 min" },
    { id: "a4", level: "warning", title: "Batterie faible", subtitle: "Capteur #08 – Parcelle D" },
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
    { id: "r1", text: "Capteur #12: données reçues (temp/humidité)", time: "10:42" },
    { id: "r2", text: "Parcelle C: surface mise à jour", time: "09:10" },
    { id: "r3", text: "Utilisateur ajouté: agriculteur_07", time: "hier" },
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
        <Card title="Météo">
          <p className="text-xs font-semibold">{weather.location}</p>
          <p className="mt-2 text-3xl font-extrabold">{weather.now}</p>
          <p className="text-xs text-gray-600">{weather.condition}</p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <MiniStat label="Vent" value={weather.wind} />
            <MiniStat label="Humidité" value={weather.humidity} />
          </div>
        </Card>

        {/* Sensors + chart */}
        <Card
          title="Santé capteurs"
          right={<TrendSelector range={range} setRange={setRange} />}
        >
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="En ligne" value={`${sensorHealth.online}`} />
            <MiniStat label="Hors ligne" value={`${sensorHealth.offline}`} />
            <MiniStat label="Dernière sync" value={sensorHealth.lastIngest} />
            <MiniStat label="Batterie faible" value={`${sensorHealth.lowBattery}`} />
          </div>

          <div className="mt-3">
            <SoilMoistureLineChart data={moistureData} />
            <p className="mt-1 text-[11px] text-gray-500">
              Humidité du sol (%) — {range}
            </p>
          </div>
        </Card>

        {/* Alerts */}
        <Card
          title="Alertes système"
          right={<AlertFilters filter={alertFilter} setFilter={setAlertFilter} />}
        >
          {filteredAlerts.length === 0 ? (
            <div className="rounded-sm border border-dashed p-3 text-xs text-gray-500">
              Aucune alerte trouvée.
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
        <Card title="Dernières activités">
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
}: {
  filter: "all" | AlertLevel;
  setFilter: (v: "all" | AlertLevel) => void;
}) {
  return (
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value as "all" | AlertLevel)}
      className="rounded-sm border px-2 py-1 text-[11px]"
    >
      <option value="all">All</option>
      <option value="critical">Critical</option>
      <option value="warning">Warning</option>
      <option value="info">Info</option>
    </select>
  );
}

function TrendSelector({
  range,
  setRange,
}: {
  range: RangeKey;
  setRange: (r: RangeKey) => void;
}) {
  return (
    <select
      value={range}
      onChange={(e) => setRange(e.target.value as RangeKey)}
      className="rounded-sm border px-2 py-1 text-[11px]"
    >
      <option value="24h">24h</option>
      <option value="7d">7d</option>
      <option value="30d">30d</option>
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

