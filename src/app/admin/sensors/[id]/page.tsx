"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { getParcel } from "@/lib/mockParcels";
import {
  getSensor,
  subscribeSensors,
  getSensorsSnapshot,
  getSensorsServerSnapshot,
  type SensorStatus,
} from "@/lib/mockSensors";

function StatusBadge({ status }: { status: SensorStatus }) {
  const cls =
    status === "ok"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
      : status === "warning"
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";

  const label = status === "ok" ? "OK" : status === "warning" ? "Attention" : "Hors ligne";
  return <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${cls}`}>{label}</span>;
}

export default function SensorDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const raw = (params )?.id;
  const id: string = Array.isArray(raw) ? raw[0] : (raw ?? "");

  // keep store "alive" so details refresh if you restore/delete elsewhere
  useSyncExternalStore(subscribeSensors, getSensorsSnapshot, getSensorsServerSnapshot);

  const sensor = id ? getSensor(id) : undefined;

  function isDefined<T>(v: T | undefined | null): v is T {
  return v !== undefined && v !== null;
}

const parcels = useMemo(() => {
  if (!sensor) return [];
  return sensor.parcels
    .map((pid) => getParcel(pid))
    .filter(isDefined);
}, [sensor]);


  if (!id) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
        <div className="rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117]">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Chargement…</p>
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
          ← Capteurs
        </button>

        <div className="mt-4 rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117]">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Capteur introuvable</p>
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
            onClick={() => router.push("/admin/sensors")}
            className="mb-2 inline-flex rounded-sm border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50
                       dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-200"
          >
            ← Capteurs
          </button>

          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Détail capteur{" "}
            <span className="text-gray-600 dark:text-gray-400">{sensor.id}</span>
          </h1>

          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{sensor.name}</span> • <StatusBadge status={sensor.status} /> •{" "}
            <span className="font-semibold">{sensor.lastMeasure}</span>{" "}
            <span className="text-gray-500 dark:text-gray-400">({formatLastUpdate(sensor.lastMeasureAt)})</span>
          </p>
        </div>
      </div>

      {/* Parcels associated */}
      <div className="rounded-sm border border-gray-300 bg-white dark:border-gray-800 dark:bg-[#0d1117]">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Parcelles associées <span className="text-gray-600 dark:text-gray-400">({sensor.parcels.length})</span>
          </p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Cliquez sur “Consulter” pour ouvrir la parcelle.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-[#161b22]">
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">Nom</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">Propriétaire</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">Superficie (m²)</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">Action</th>
              </tr>
            </thead>

            <tbody>
              {parcels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400">
                    Aucune parcelle liée (mock).
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
                        Consulter
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
  );
}

function formatLastUpdate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}
