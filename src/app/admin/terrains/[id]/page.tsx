"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { useT } from "@/components/i18n/useT";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import TerrainModal from "@/components/admin/terrains/TerrainModal";
import LocaliteModal from "@/components/admin/terrains/LocaliteModal";
import { formatLocalite, getLocalite, listLocalites } from "@/lib/mockLocalites";
import {
  deleteTerrain,
  getTerrain,
  restoreTerrain,
  updateTerrain,
  type TerrainRow,
} from "@/lib/mockTerrains";
import { createLocalite } from "@/lib/mockLocalites";
import { listParcels } from "@/lib/mockParcels";

export default function TerrainDetailsPage() {
  const router = useRouter();
  const { t } = useT();
  const { push } = useToast();
  const params = useParams();
  const raw = params?.id;
  const id = Array.isArray(raw) ? raw[0] : (raw ?? "");

  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [localiteOpen, setLocaliteOpen] = useState(false);

  const terrain = id ? getTerrain(id) : undefined;
  const localites = listLocalites().items;
  const localite = terrain?.localite_id ? getLocalite(terrain.localite_id) : undefined;

  const parcelsResult = useMemo(() => {
    return terrain
      ? listParcels({ filters: { terrain_id: terrain.id }, sortKey: "id", sortDir: "asc" })
      : { items: [], total: 0 };
  }, [terrain, refreshKey]);

  const handleUpdate = (data: { nom: string; user_id: string; superficie_totale: number; localite_id: string }) => {
    if (!terrain) return;
    const updated = updateTerrain(terrain.id, data);
    setRefreshKey((k) => k + 1);
    setModalOpen(false);
    push({ title: t("edit_terrain"), message: updated?.nom ?? t("save"), kind: "success" });
  };

  const handleDelete = () => {
    if (!terrain) return;
    const removed = deleteTerrain(terrain.id);
    setConfirmOpen(false);
    if (!removed) return;
    push({
      title: t("delete_toast_title"),
      message: removed.nom,
      actionLabel: t("undo"),
      onAction: () => {
        restoreTerrain(removed);
        push({ title: t("delete_toast_undo"), message: removed.nom, kind: "success" });
      },
    });
    router.push("/admin/terrains");
  };

  const handleAddLocalite = (data: { nom: string; ville: string; pays: string }) => {
    if (!data.nom || !data.ville || !data.pays) return;
    createLocalite({
      nom: data.nom,
      ville: data.ville,
      pays: data.pays,
      latitude: 0,
      longitude: 0,
      altitude: 0,
      quartier: "",
      region: "",
      code_postal: "",
      continent: "Afrique",
      timezone: "Africa/Douala",
      superficie: 0,
      population: 0,
      climate_zone: "tropical",
    });
    setRefreshKey((k) => k + 1);
    setLocaliteOpen(false);
  };

  if (!id) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
        <div className="rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117]">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!terrain) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
        <button
          onClick={() => router.push("/admin/terrains")}
          className="rounded-sm border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50
                     dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-200"
        >
          ← {t("back_to_list")}
        </button>

        <div className="mt-4 rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117]">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("terrain_not_found")}</p>
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
            onClick={() => router.push("/admin/terrains")}
            className="mb-2 inline-flex rounded-sm border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50
                       dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-200"
          >
            ← {t("back_to_list")}
          </button>

          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t("terrain_details_title")} <span className="text-gray-600 dark:text-gray-400">{terrain.id}</span>
          </h1>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {terrain.nom} • {terrain.superficie_totale.toLocaleString()} m²
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
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
            onClick={() => setConfirmOpen(true)}
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
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("terrain_details_title")}</p>
          <div className="mt-3 space-y-2 text-xs text-gray-700 dark:text-gray-300">
            <Row label={t("table_id")} value={terrain.id} />
            <Row label={t("terrain_name")} value={terrain.nom} />
            <Row label={t("terrain_owner")} value={terrain.user_id} />
            <Row label={t("terrain_area")} value={`${terrain.superficie_totale.toLocaleString()} m²`} />
            <Row label={t("terrain_localite")} value={localite ? formatLocalite(localite) : terrain.localite_id} />
            <Row label={t("table_climate_zone")} value={localite?.climate_zone ?? "—"} />
          </div>
        </div>

        <div className="rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117] lg:col-span-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("terrain_parcels_title")}</p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("terrain_parcels_hint")}</p>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-[#161b22]">
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_id")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_name")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_code")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_soil_type")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_current_crop")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_area")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_view")}</th>
                </tr>
              </thead>
              <tbody>
                {parcelsResult.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-xs text-gray-600 dark:text-gray-400">
                      {t("empty_parcels")}
                    </td>
                  </tr>
                ) : (
                  parcelsResult.items.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-[#0b1220]"
                    >
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">{p.id}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.nom}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.code}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.type_sol}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.culture_actuelle}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.superficie.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/parcels/${p.id}`)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700"
                          aria-label={t("consult")}
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
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          <span className="sr-only">{t("consult")}</span>
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

      <TerrainModal
        key={`${terrain.id}_${modalOpen ? "open" : "closed"}`}
        open={modalOpen}
        mode="edit"
        initial={terrain}
        localites={localites}
        onClose={() => setModalOpen(false)}
        onSubmit={handleUpdate}
        onAddLocalite={() => setLocaliteOpen(true)}
      />

      <LocaliteModal
        key={`${localiteOpen ? "open" : "closed"}_${refreshKey}`}
        open={localiteOpen}
        onClose={() => setLocaliteOpen(false)}
        onSubmit={handleAddLocalite}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={t("delete_confirm_title")}
        message={t("delete_confirm_body")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
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
