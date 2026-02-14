"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { useT } from "@/components/i18n/useT";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import TerrainModal from "@/components/admin/terrains/TerrainModal";
import LocaliteModal from "@/components/admin/terrains/LocaliteModal";
import type { LocaliteResponse } from "@/lib/models/LocaliteResponse";
import type { ParcelleResponse } from "@/lib/models/ParcelleResponse";
import type { TerrainResponse } from "@/lib/models/TerrainResponse";
import { fetchLocalites, fetchParcelsByTerrain, fetchTerrains, fetchUsers } from "@/lib/apiData";
import { LocalitSService } from "@/lib/services/LocalitSService";
import { TerrainsService } from "@/lib/services/TerrainsService";
import { Continent } from "@/lib/models/Continent";
import { ClimateZone } from "@/lib/models/ClimateZone";
import { DonnEsDeCapteursService } from "@/lib/services/DonnEsDeCapteursService";
import type { SensorMeasurementsResponse } from "@/lib/models/SensorMeasurementsResponse";
import type { UserResponse } from "@/lib/models/UserResponse";
import { unwrapList } from "@/lib/apiHelpers";

export default function TerrainDetailsPage() {
  const router = useRouter();
  const { t } = useT();
  const { push } = useToast();
  const pushRef = useRef(push);
  const tRef = useRef(t);
  const params = useParams();
  const raw = params?.id;
  const id = Array.isArray(raw) ? raw[0] : (raw ?? "");

  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [localiteOpen, setLocaliteOpen] = useState(false);
  const [terrain, setTerrain] = useState<TerrainResponse | null>(null);
  const [localites, setLocalites] = useState<LocaliteResponse[]>([]);
  const [parcels, setParcels] = useState<ParcelleResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [latestMeasurement, setLatestMeasurement] = useState<string | null>(null);
  const [latestByParcel, setLatestByParcel] = useState<Record<string, SensorMeasurementsResponse | null>>({});
  const [loading, setLoading] = useState(false);

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
        let terrainData: TerrainResponse | null = null;
        try {
          const list = await fetchTerrains();
          terrainData = list.find((t) => t.id === id) ?? null;
        } catch {
          terrainData = null;
        }

        if (canceled) return;
        setTerrain(terrainData ?? null);

        const [localitesResult, usersResult, parcelsResult] = await Promise.allSettled([
          fetchLocalites(),
          fetchUsers(),
          terrainData?.id ? fetchParcelsByTerrain(terrainData.id) : Promise.resolve([] as ParcelleResponse[]),
        ]);

        if (canceled) return;
        if (localitesResult.status === "fulfilled") setLocalites(localitesResult.value);
        else setLocalites([]);
        if (usersResult.status === "fulfilled") setUsers(usersResult.value);
        else setUsers([]);
        if (parcelsResult.status === "fulfilled") setParcels(parcelsResult.value);
        else setParcels([]);

        if (
          localitesResult.status === "rejected" ||
          usersResult.status === "rejected" ||
          parcelsResult.status === "rejected"
        ) {
          pushRef.current({ title: tRef.current("load_failed"), kind: "error" });
        }
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
  }, [id, refreshKey]);

  const localite = useMemo(() => {
    if (!terrain) return undefined;
    return localites.find((item) => item.id === terrain.localite_id);
  }, [localites, terrain]);

  const parcelsResult = useMemo(() => {
    return { items: parcels, total: parcels.length };
  }, [parcels]);

  const totalAreaLabel = useMemo(() => {
    if (!parcels.length) return "0 m²";
    const total = parcels.reduce((sum, parcel) => sum + (parcel.superficie ?? 0), 0);
    return `${total.toLocaleString()} m²`;
  }, [parcels]);

  const ownerLabel = useMemo(() => {
    if (!terrain) return "—";
    const owner = users.find((u) => u.id === terrain.user_id);
    return owner ? `${owner.prenom} ${owner.nom}` : terrain.user_id;
  }, [terrain, users]);

  const owner = useMemo(() => {
    if (!terrain) return undefined;
    return users.find((u) => u.id === terrain.user_id);
  }, [terrain, users]);

  const sensorsLinked = useMemo(() => {
    return parcels.reduce((sum, parcel) => sum + (parcel.nombre_capteurs ?? 0), 0);
  }, [parcels]);

  const parcelStats = useMemo(() => {
    const totalArea = parcels.reduce((sum, parcel) => sum + (parcel.superficie ?? 0), 0);
    const avgArea = parcels.length ? totalArea / parcels.length : 0;
    return { totalArea, avgArea };
  }, [parcels]);

  const activityItems = useMemo(() => {
    const items = parcels
      .map((parcel) => {
        const updated = parcel.updated_at ?? parcel.created_at;
        return {
          id: parcel.id,
          name: parcel.nom,
          timestamp: updated,
          action: parcel.updated_at && parcel.updated_at !== parcel.created_at ? "updated" : "created",
        };
      })
      .filter((item) => item.timestamp)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
    return items;
  }, [parcels]);

  useEffect(() => {
    let canceled = false;
    const loadLatest = async () => {
      if (!parcels.length) {
        setLatestMeasurement(null);
        setLatestByParcel({});
        return;
      }
      try {
        const responses = await Promise.all(
          parcels.map((parcel) =>
            DonnEsDeCapteursService.getMeasurementsByParcelleApiV1SensorDataSensorDataParcelleParcelleIdGet(
              parcel.id,
              undefined,
              1
            ).catch(() => [])
          )
        );
        if (canceled) return;
        const perParcel: Record<string, SensorMeasurementsResponse | null> = {};
        responses.forEach((payload, index) => {
          const items = unwrapList<SensorMeasurementsResponse>(payload);
          const latest = items
            .slice()
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
          const parcelId = parcels[index]?.id;
          if (parcelId) perParcel[parcelId] = latest ?? null;
        });
        const all = Object.values(perParcel).filter(Boolean) as SensorMeasurementsResponse[];
        const latest = all
          .slice()
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        setLatestByParcel(perParcel);
        setLatestMeasurement(latest?.timestamp ?? null);
      } catch {
        if (!canceled) {
          setLatestMeasurement(null);
          setLatestByParcel({});
        }
      }
    };
    void loadLatest();
    return () => {
      canceled = true;
    };
  }, [parcels]);

  const handleUpdate = async (data: { nom: string; localite_id: string }) => {
    if (!terrain) return;
      try {
        const updated = await TerrainsService.updateTerrainApiV1TerrainsTerrainsTerrainIdPut(terrain.id, {
          nom: data.nom,
        });
      setRefreshKey((k) => k + 1);
      setModalOpen(false);
      push({ title: t("edit_terrain"), message: updated?.nom ?? t("save"), kind: "success" });
    } catch {
      push({ title: t("load_failed"), kind: "error" });
    }
  };

  const handleDelete = async () => {
    if (!terrain) return;
    setConfirmOpen(false);
    try {
      await TerrainsService.deleteTerrainApiV1TerrainsTerrainsTerrainIdDelete(terrain.id);
      push({
        title: t("delete_toast_title"),
        message: terrain.nom,
      });
      router.push("/admin/terrains");
    } catch {
      push({ title: t("load_failed"), kind: "error" });
    }
  };

  const handleAddLocalite = async (data: { nom: string; ville: string; pays: string }) => {
    if (!data.nom || !data.ville || !data.pays) return;
    try {
      await LocalitSService.createLocaliteApiV1LocalitesLocalitesPost({
        nom: data.nom,
        ville: data.ville,
        pays: data.pays,
        continent: Continent.AFRIQUE,
        climate_zone: ClimateZone.TROPICAL,
      });
      setRefreshKey((k) => k + 1);
      setLocaliteOpen(false);
    } catch {
      push({ title: t("load_failed"), kind: "error" });
    }
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

  if (!terrain && loading) {
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
            {t("terrain_details_title")}
          </h1>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {terrain.nom} • {totalAreaLabel}
          </p>
        </div>

      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title={t("terrain_kpi_parcels")}
          value={`${parcelsResult.total}`}
          meta={t("table_parcels")}
        />
        <KpiCard
          title={t("terrain_kpi_area")}
          value={totalAreaLabel}
          meta={t("terrain_area")}
        />
        <KpiCard
          title={t("terrain_kpi_sensors")}
          value={`${sensorsLinked}`}
          meta={t("dashboard_kpi_sensors")}
        />
        <KpiCard
          title={t("terrain_kpi_last_measure")}
          value={latestMeasurement ? formatLastUpdate(latestMeasurement) : "—"}
          meta={t("dashboard_last_update")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117]">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("terrain_details_title")}</p>
            <div className="mt-3 space-y-2 text-xs text-gray-700 dark:text-gray-300">
              <Row label={t("terrain_name")} value={terrain.nom} />
              <Row label={t("terrain_owner")} value={ownerLabel} />
              <Row label={t("terrain_area")} value={totalAreaLabel} />
              <Row label={t("terrain_localite")} value={localite ? `${localite.nom} — ${localite.ville}, ${localite.pays}` : terrain.localite_id} />
              <Row label={t("table_climate_zone")} value={localite?.climate_zone ?? "—"} />
              <Row label={t("table_parcels")} value={`${parcelsResult.total}`} />
              <Row label={t("dashboard_last_update")} value={latestMeasurement ? formatLastUpdate(latestMeasurement) : "—"} />
            </div>
          </div>

          <div className="rounded-sm border border-gray-300 bg-white p-4 text-xs text-gray-700 dark:border-gray-800 dark:bg-[#0d1117] dark:text-gray-300">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("terrain_location_title")}</p>
            <p className="mt-2 font-semibold text-gray-900 dark:text-gray-100">
              {localite ? `${localite.nom} — ${localite.ville}, ${localite.pays}` : terrain.localite_id}
            </p>
            <p className="mt-1 text-gray-600 dark:text-gray-400">{localite?.climate_zone ?? "—"}</p>
            <a
              className="mt-3 inline-flex items-center gap-1 font-semibold text-green-700 hover:underline dark:text-green-400"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                localite ? `${localite.nom} ${localite.ville} ${localite.pays}` : terrain.nom
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              {t("terrain_map_link")}
            </a>
          </div>

          <div className="rounded-sm border border-gray-300 bg-white p-4 text-xs text-gray-700 dark:border-gray-800 dark:bg-[#0d1117] dark:text-gray-300">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("terrain_owner_title")}</p>
            <div className="mt-3 space-y-2">
              <Row label={t("table_owner")} value={owner ? `${owner.prenom} ${owner.nom}` : "—"} />
              <Row label={t("terrain_owner_email")} value={owner?.email ?? "—"} />
              <Row label={t("terrain_owner_phone")} value={owner?.telephone ?? "—"} />
              <Row label={t("terrain_owner_role")} value={owner?.role ?? "—"} />
            </div>
          </div>

          <div className="rounded-sm border border-gray-300 bg-white p-4 text-xs text-gray-700 dark:border-gray-800 dark:bg-[#0d1117] dark:text-gray-300">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("terrain_parcel_stats_title")}</p>
            <div className="mt-3 space-y-2">
              <Row label={t("table_parcels")} value={`${parcelsResult.total}`} />
              <Row label={t("terrain_parcel_total_area")} value={`${parcelStats.totalArea.toLocaleString()} m²`} />
              <Row label={t("terrain_parcel_avg_area")} value={`${parcelStats.avgArea.toLocaleString()} m²`} />
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117] lg:col-span-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("terrain_parcels_title")}</p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("terrain_parcels_hint")}</p>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-[#161b22]">
                <tr className="border-b border-gray-200 dark:border-gray-800">
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
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-gray-600 dark:text-gray-400">
                      {t("empty_parcels")}
                    </td>
                  </tr>
                ) : (
                  parcelsResult.items.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-[#0b1220]"
                    >
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.nom}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{p.code ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">—</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">—</td>
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

        <div className="rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117] lg:col-span-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("terrain_latest_by_parcel_title")}</p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("terrain_latest_by_parcel_hint")}</p>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="sticky top-0 bg-gray-50 dark:bg-[#161b22]">
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_name")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("table_code")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("dashboard_last_update")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("dashboard_humidity")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("dashboard_temperature")}</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("metric_ph")}</th>
                </tr>
              </thead>
              <tbody>
                {parcelsResult.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-gray-600 dark:text-gray-400">
                      {t("empty_parcels")}
                    </td>
                  </tr>
                ) : (
                  parcelsResult.items.map((parcel) => {
                    const latest = latestByParcel[parcel.id];
                    return (
                      <tr
                        key={`latest-${parcel.id}`}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-[#0b1220]"
                      >
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{parcel.nom}</td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{parcel.code ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                          {latest?.timestamp ? formatLastUpdate(latest.timestamp) : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{latest?.humidity ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{latest?.temperature ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{latest?.ph ?? "—"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117]">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("terrain_activity_title")}</p>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("terrain_activity_hint")}</p>
        <div className="mt-3 space-y-2 text-xs text-gray-700 dark:text-gray-300">
          {activityItems.length === 0 ? (
            <p className="text-xs text-gray-600 dark:text-gray-400">{t("terrain_activity_empty")}</p>
          ) : (
            activityItems.map((item) => (
              <div
                key={`activity-${item.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-gray-100 px-3 py-2 dark:border-gray-800"
              >
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {item.name}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {item.action === "updated" ? t("terrain_activity_updated") : t("terrain_activity_created")}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {item.timestamp ? formatLastUpdate(item.timestamp) : "—"}
                </span>
              </div>
            ))
          )}
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

function KpiCard({ title, value, meta }: { title: string; value: string; meta: string }) {
  return (
    <div className="rounded-sm border border-gray-300 bg-white p-4 dark:border-gray-800 dark:bg-[#0d1117]">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{meta}</p>
    </div>
  );
}

function formatLastUpdate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}
