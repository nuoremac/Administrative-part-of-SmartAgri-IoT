"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { getParcel, updateParcel, type ParcelRow } from "@/lib/mockParcels";
import EditParcelModal from "@/components/admin/parcels/EditParcelModal";
import { useToast } from "@/components/ui/ToastProvider";
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

// deterministic mock time (no Date.now() during render)
const MOCK_NOW_MS = Date.parse("2026-01-02T12:00:00.000Z");

// hydration-safe "am I on client?"
function useIsClient() {
  return useSyncExternalStore(
    () => () => {}, // no-op subscribe
    () => true, // client snapshot
    () => false // server snapshot
  );
}

export default function ParcelDetailsPage() {
  const params = useParams();
  const raw = (params)?.id;
  const id: string = Array.isArray(raw) ? raw[0] : (raw ?? "");

  // key remount ensures clean state when switching parcels
  return <ParcelDetailsInner key={id} id={id} />;
}

function ParcelDetailsInner({ id }: { id: string }) {
  const router = useRouter();
  const { push } = useToast();
  const isClient = useIsClient();

  // ---- Hooks must always run (no early returns above) ----

  const [editOpen, setEditOpen] = useState(false);
  const [parcelView, setParcelView] = useState<ParcelRow | null>(null);

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

  const [range, setRange] = useState<"24h" | "7d">("24h");

  const moistureData = useMemo(() => {
    const points = range === "24h" ? 24 : 7;
    const stepMs = range === "24h" ? 3600000 : 86400000;
    const now = MOCK_NOW_MS;

    return Array.from({ length: points }, (_, i) => {
      const t = new Date(now - (points - 1 - i) * stepMs);
      const label =
        range === "24h"
          ? `${t.getHours().toString().padStart(2, "0")}:00`
          : t.toLocaleDateString();

      const value = Math.round(35 + 15 * Math.sin(i / 2) + (i % 3) * 2);
      return { t: label, value };
    });
  }, [range]);

  // localStorage read only on client snapshot
  const parcelFromStore = isClient && id ? getParcel(id) : undefined;
  const displayed: ParcelRow | undefined = parcelView ?? parcelFromStore;

  // ---- Render decisions AFTER hooks (safe) ----

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
          ← Retour
        </button>

        <div className="mt-4 rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117]">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Parcelle introuvable
          </p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            L’identifiant “{id}” n’existe pas dans les données mock.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button
            onClick={() => router.push("/admin/parcels")}
            className="mb-2 inline-flex rounded-sm border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50
                       dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-200"
          >
            ← Parcelles
          </button>

          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Détail parcelle{" "}
            <span className="text-gray-600 dark:text-gray-400">{displayed.id}</span>
          </h1>

          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Propriétaire: <span className="font-semibold">{displayed.owner}</span> • Superficie:{" "}
            <span className="font-semibold">{displayed.area.toLocaleString()} m²</span> • Capteurs:{" "}
            <span className="font-semibold">{displayed.sensors}</span>
          </p>
        </div>

        {/* Range selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Tendance:
          </span>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as "24h" | "7d")}
            className="h-9 rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                       dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
          >
            <option value="24h">24h</option>
            <option value="7d">7 jours</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Chart */}
        <div className="rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117] lg:col-span-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Humidité du sol (%)
          </p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Exemple de courbe (mock) — plus tard: données réelles capteurs.
          </p>

          <div className="mt-3 h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moistureData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="t" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="value" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Parcel info card */}
        <div className="rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117]">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Informations</p>

          <div className="mt-3 space-y-2 text-xs text-gray-700 dark:text-gray-300">
            <Row label="ID" value={displayed.id} />
            <Row label="Nom" value={displayed.name} />
            <Row label="Propriétaire" value={displayed.owner} />
            <Row label="Superficie" value={`${displayed.area.toLocaleString()} m²`} />
            <Row label="Nb capteurs" value={`${displayed.sensors}`} />
            {displayed.lastUpdate ? (
              <Row label="Dernière MAJ" value={formatLastUpdate(displayed.lastUpdate)} />
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="mt-4 h-9 w-full rounded-sm bg-green-600 px-3 text-xs font-semibold text-white hover:bg-green-700"
          >
            Modifier la parcelle
          </button>
        </div>

        {/* Sensors table */}
        <div className="rounded-sm border border-gray-300 bg-white dark:border-gray-800 dark:bg-[#0d1117] lg:col-span-3">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Capteurs</p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Liste des capteurs associés à cette parcelle.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[780px] w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-[#161b22]">
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">Nom</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">Type</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">Dernière activité</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">Statut</th>
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
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{formatAgo(s.lastSeen)}</td>
                    <td className="px-4 py-3">
                      <SensorBadge status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Modal lives here (inside the return, before closing div) */}
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
              title: "Erreur",
              message: "Impossible de modifier cette parcelle.",
              kind: "error",
            });
            return;
          }

          setParcelView(updated);

          push({
            title: "Parcelle mise à jour",
            message: `${updated.id} modifiée avec succès.`,
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

function SensorBadge({ status }: { status: "ok" | "warning" | "offline" }) {
  const cls =
    status === "ok"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
      : status === "warning"
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";

  const label = status === "ok" ? "OK" : status === "warning" ? "Attention" : "Hors ligne";
  return <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${cls}`}>{label}</span>;
}

function formatLastUpdate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function formatAgo(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = MOCK_NOW_MS - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}
