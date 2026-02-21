"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminSearch } from "@/components/admin/AdminSearchProvider";
import { useToast } from "@/components/ui/ToastProvider";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useT } from "@/components/i18n/useT";
import { ApiError } from "@/lib/core/ApiError";
import type { LocaliteResponse } from "@/lib/models/LocaliteResponse";
import { ClimateZone } from "@/lib/models/ClimateZone";
import { Continent } from "@/lib/models/Continent";
import { fetchLocalites, fetchTerrains } from "@/lib/apiData";
import { LocalitSService } from "@/lib/services/LocalitSService";
import { unwrapData } from "@/lib/apiHelpers";
import {
  CAMEROON_CLIMATE_ZONES,
  CAMEROON_CITIES_SUGGESTIONS,
  CAMEROON_COUNTRY,
  filterCameroonLocalities,
  getCameroonClimateZoneLabelKey,
  isCameroonClimateZone,
} from "@/lib/cameroonLocalities";

type SortKey = "nom" | "ville" | "pays" | "continent" | "climate_zone";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 10;

type LocalityDraft = {
  nom: string;
  ville: string;
  region: string;
  climate_zone: ClimateZone;
};

type LocalityEditDraft = {
  nom: string;
  climate_zone: ClimateZone | null;
};

const DEFAULT_DRAFT: LocalityDraft = {
  nom: "",
  ville: "",
  region: "",
  climate_zone: CAMEROON_CLIMATE_ZONES[0].value,
};

export default function LocalitiesPage() {
  const { query, setQuery } = useAdminSearch();
  const { push } = useToast();
  const { t } = useT();

  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("nom");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<LocalityDraft>(DEFAULT_DRAFT);
  const [localities, setLocalities] = useState<LocaliteResponse[]>([]);
  const [localityUsageCount, setLocalityUsageCount] = useState<Record<string, number>>({});
  const [editingLocality, setEditingLocality] = useState<LocaliteResponse | null>(null);
  const [editDraft, setEditDraft] = useState<LocalityEditDraft>({ nom: "", climate_zone: null });
  const [confirmDelete, setConfirmDelete] = useState<LocaliteResponse | null>(null);

  const resolveApiErrorMessage = (error: unknown): string | undefined => {
    if (!(error instanceof ApiError)) return undefined;
    const body = error.body;
    if (typeof body === "string" && body.trim()) return body;
    if (!body || typeof body !== "object") return undefined;

    const message = (body as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;

    const detail = (body as { detail?: unknown }).detail;
    if (typeof detail === "string" && detail.trim()) return detail;
    if (Array.isArray(detail)) {
      const first = detail[0];
      if (first && typeof first === "object") {
        const msg = (first as { msg?: unknown }).msg;
        if (typeof msg === "string" && msg.trim()) return msg;
      }
    }
    return undefined;
  };

  useEffect(() => {
    let canceled = false;
    const load = async () => {
      try {
        const list = await fetchLocalites(500);
        if (!canceled) setLocalities(filterCameroonLocalities(list));
      } catch {
        if (!canceled) {
          setLocalities([]);
          setLocalityUsageCount({});
          push({ title: t("load_failed"), kind: "error" });
        }
        return;
      }

      try {
        const terrains = await fetchTerrains(1000);
        if (!canceled) {
          const usage = terrains.reduce<Record<string, number>>((acc, terrain) => {
            const localityId = terrain.localite_id;
            if (!localityId) return acc;
            acc[localityId] = (acc[localityId] ?? 0) + 1;
            return acc;
          }, {});
          setLocalityUsageCount(usage);
        }
      } catch {
        if (!canceled) setLocalityUsageCount({});
      }
    };
    void load();
    return () => {
      canceled = true;
    };
  }, [refreshKey, push, t]);

  const listResult = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = localities.filter((row) => {
      if (!search) return true;
      return (
        row.nom.toLowerCase().includes(search) ||
        row.ville.toLowerCase().includes(search) ||
        row.pays.toLowerCase().includes(search) ||
        (row.region ?? "").toLowerCase().includes(search) ||
        row.continent.toLowerCase().includes(search) ||
        (row.climate_zone ?? "").toLowerCase().includes(search) ||
        t(getCameroonClimateZoneLabelKey(row.climate_zone)).toLowerCase().includes(search)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const av =
        sortKey === "climate_zone"
          ? t(getCameroonClimateZoneLabelKey(a.climate_zone))
          : String((a as Record<string, unknown>)[sortKey] ?? "");
      const bv =
        sortKey === "climate_zone"
          ? t(getCameroonClimateZoneLabelKey(b.climate_zone))
          : String((b as Record<string, unknown>)[sortKey] ?? "");
      return av.localeCompare(bv) * dir;
    });

    const total = sorted.length;
    const start = (page - 1) * PAGE_SIZE;
    const items = sorted.slice(start, start + PAGE_SIZE);
    return { items, total };
  }, [localities, page, query, sortDir, sortKey, t]);

  const totalPages = Math.max(1, Math.ceil(listResult.total / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const toggleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    setSortDir((current) => (current === "asc" ? "desc" : "asc"));
  };

  const formatCountMessage = (key: string, count: number) =>
    t(key).replace("{count}", String(count));

  const formatClimateZone = (value: ClimateZone | null | undefined) => {
    if (!value) return "—";
    return t(getCameroonClimateZoneLabelKey(value));
  };

  const openDeleteConfirm = (locality: LocaliteResponse) => {
    const usageCount = localityUsageCount[locality.id] ?? 0;
    if (usageCount > 0) {
      push({
        title: t("delete_confirm_title"),
        message: formatCountMessage("locality_delete_blocked_in_use", usageCount),
        kind: "error",
      });
      return;
    }
    setConfirmDelete(locality);
  };

  const handleCreate = async () => {
    const nom = draft.nom.trim();
    const ville = draft.ville.trim();
    const pays = CAMEROON_COUNTRY;
    const region = draft.region.trim();
    if (!nom || !ville) {
      push({ title: t("invalidCredentials"), message: t("locality_label_format"), kind: "error" });
      return;
    }

    try {
      const createdPayload = await LocalitSService.createLocaliteApiV1LocalitesLocalitesPost({
        nom,
        ville,
        pays,
        region: region || null,
        continent: Continent.AFRIQUE,
        climate_zone: draft.climate_zone,
      });
      const created = unwrapData<LocaliteResponse>(createdPayload);
      setRefreshKey((k) => k + 1);
      setIsAdding(false);
      setDraft(DEFAULT_DRAFT);
      setPage(1);
      push({
        title: t("add_localite"),
        message: created?.nom ?? nom,
        kind: "success",
      });
    } catch {
      push({ title: t("load_failed"), kind: "error" });
    }
  };

  const openEdit = (locality: LocaliteResponse) => {
    setEditingLocality(locality);
    setEditDraft({
      nom: locality.nom,
      climate_zone: locality.climate_zone ?? null,
    });
  };

  const handleUpdate = async () => {
    if (!editingLocality) return;
    const nom = editDraft.nom.trim();
    if (!nom) {
      push({ title: t("invalidCredentials"), message: t("locality_error_name"), kind: "error" });
      return;
    }

    try {
      const updatedPayload = await LocalitSService.updateLocaliteApiV1LocalitesLocalitesLocaliteIdPut(
        editingLocality.id,
        {
          nom,
          climate_zone: editDraft.climate_zone,
        }
      );
      const updated = unwrapData<LocaliteResponse>(updatedPayload);
      setRefreshKey((k) => k + 1);
      setEditingLocality(null);
      push({
        title: t("edit_localite"),
        message: updated?.nom ?? nom,
        kind: "success",
      });
    } catch (error) {
      push({
        title: t("load_failed"),
        message: resolveApiErrorMessage(error),
        kind: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const localityToDelete = confirmDelete;
    setConfirmDelete(null);
    const usageCount = localityUsageCount[localityToDelete.id] ?? 0;
    if (usageCount > 0) {
      push({
        title: t("delete_confirm_title"),
        message: formatCountMessage("locality_delete_blocked_in_use", usageCount),
        kind: "error",
      });
      return;
    }
    try {
      await LocalitSService.deleteLocaliteApiV1LocalitesLocalitesLocaliteIdDelete(localityToDelete.id);
      setRefreshKey((k) => k + 1);
      push({
        title: t("delete_toast_title"),
        message: localityToDelete.nom,
        kind: "success",
      });
    } catch (error) {
      push({
        title: t("load_failed"),
        message: resolveApiErrorMessage(error),
        kind: "error",
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t("nav_localities")}{" "}
            <span className="text-gray-600 dark:text-gray-400">({listResult.total})</span>
          </h1>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("localities_subtitle")}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsAdding((current) => !current);
              if (!isAdding) setDraft(DEFAULT_DRAFT);
            }}
            className="rounded-sm bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
          >
            + {t("add_localite")}
          </button>
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-sm border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50
                         dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-200 dark:hover:bg-[#0d1117]"
            >
              {t("clear")}
            </button>
          ) : null}
        </div>
      </div>

      {isAdding ? (
        <div className="mb-4 rounded-sm border border-gray-300 bg-white p-4 text-xs text-gray-700 dark:border-gray-800 dark:bg-[#0d1117] dark:text-gray-300">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{t("locality_name")}</label>
              <input
                value={draft.nom}
                onChange={(e) => setDraft((prev) => ({ ...prev, nom: e.target.value }))}
                className="mt-1 h-9 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                           dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{t("locality_city")}</label>
              <input
                value={draft.ville}
                onChange={(e) => setDraft((prev) => ({ ...prev, ville: e.target.value }))}
                list="cameroon-cities-localities-page"
                className="mt-1 h-9 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                           dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
              />
              <datalist id="cameroon-cities-localities-page">
                {CAMEROON_CITIES_SUGGESTIONS.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{t("locality_country")}</label>
              <input
                value={CAMEROON_COUNTRY}
                readOnly
                className="mt-1 h-9 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                           dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
              />
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{t("locality_cameroon_only")}</p>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{t("locality_region")}</label>
              <input
                value={draft.region}
                onChange={(e) => setDraft((prev) => ({ ...prev, region: e.target.value }))}
                className="mt-1 h-9 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                           dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{t("locality_continent")}</label>
              <input
                value={Continent.AFRIQUE}
                readOnly
                className="mt-1 h-9 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                           dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{t("locality_climate_zone")}</label>
              <select
                value={draft.climate_zone}
                onChange={(e) => setDraft((prev) => ({ ...prev, climate_zone: e.target.value as ClimateZone }))}
                className="mt-1 h-9 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                           dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
              >
                {CAMEROON_CLIMATE_ZONES.map((zone) => (
                  <option key={zone.value} value={zone.value}>
                    {t(zone.labelKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleCreate()}
              className="rounded-sm bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
            >
              {t("save")}
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-sm border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50
                         dark:border-gray-700 dark:text-gray-200 dark:hover:bg-[#161b22]"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-sm border border-gray-400 bg-white dark:border-gray-800 dark:bg-[#0d1117]">
        <div className="overflow-x-auto">
          <table className="min-w-full md:min-w-[980px] w-full text-left text-sm">
            <thead className="sticky top-0 bg-white dark:bg-[#0d1117]">
              <tr className="border-b border-gray-400 dark:border-gray-800">
                <ThSortable label={t("locality_name")} active={sortKey === "nom"} dir={sortDir} onClick={() => toggleSort("nom")} />
                <ThSortable label={t("locality_city")} active={sortKey === "ville"} dir={sortDir} onClick={() => toggleSort("ville")} />
                <ThSortable label={t("locality_country")} active={sortKey === "pays"} dir={sortDir} onClick={() => toggleSort("pays")} />
                <ThSortable label={t("locality_continent")} active={sortKey === "continent"} dir={sortDir} onClick={() => toggleSort("continent")} />
                <ThSortable label={t("locality_climate_zone")} active={sortKey === "climate_zone"} dir={sortDir} onClick={() => toggleSort("climate_zone")} />
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("edit")}</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">{t("delete")}</th>
              </tr>
            </thead>

            <tbody>
              {listResult.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400">
                    {t("empty_localities")}
                  </td>
                </tr>
              ) : (
                listResult.items.map((row) => {
                  const usageCount = localityUsageCount[row.id] ?? 0;
                  const isDeleteDisabled = usageCount > 0;
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 dark:border-gray-900 dark:hover:bg-[#0b1220]"
                    >
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                        {row.nom}
                        {usageCount > 0 ? (
                          <p className="mt-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                            {formatCountMessage("locality_used_by_fields", usageCount)}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{row.ville}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{row.pays}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{row.continent}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{formatClimateZone(row.climate_zone)}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white hover:bg-amber-600"
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
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openDeleteConfirm(row)}
                          disabled={isDeleteDisabled}
                          title={
                            isDeleteDisabled
                              ? formatCountMessage("locality_delete_blocked_in_use", usageCount)
                              : t("delete")
                          }
                          className={[
                            "inline-flex h-8 w-8 items-center justify-center rounded-full text-white",
                            isDeleteDisabled
                              ? "cursor-not-allowed bg-red-400 opacity-60"
                              : "bg-red-600 hover:bg-red-700",
                          ].join(" ")}
                          aria-label={t("delete")}
                        >
                          {isDeleteDisabled ? (
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
                              <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          ) : (
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
                          )}
                          <span className="sr-only">{t("delete")}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-200 bg-white px-4 py-3 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between
                        dark:border-gray-800 dark:bg-[#0d1117] dark:text-gray-400">
          <span>
            {t("pagination_page")} <span className="font-semibold">{safePage}</span> / {totalPages} •{" "}
            <span className="font-semibold">{listResult.total}</span> {t("pagination_results")}
          </span>

          <Pagination page={safePage} totalPages={totalPages} onChange={(p) => setPage(p)} />
        </div>
      </div>

      <EditLocalityModal
        open={!!editingLocality}
        draft={editDraft}
        onDraftChange={setEditDraft}
        onClose={() => setEditingLocality(null)}
        onSave={handleUpdate}
        t={t}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title={t("delete_confirm_title")}
        message={t("delete_confirm_body")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function EditLocalityModal({
  open,
  draft,
  onDraftChange,
  onClose,
  onSave,
  t,
}: {
  open: boolean;
  draft: LocalityEditDraft;
  onDraftChange: (value: LocalityEditDraft) => void;
  onClose: () => void;
  onSave: () => void;
  t: (key: string) => string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-sm border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-[#0d1117]">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("edit_localite")}</p>
        <div className="mt-3 space-y-3 text-xs text-gray-700 dark:text-gray-300">
          <label className="block">
            <span className="mb-1 block font-semibold">{t("locality_name")}</span>
            <input
              value={draft.nom}
              onChange={(e) => onDraftChange({ ...draft, nom: e.target.value })}
              className="h-9 w-full rounded-sm border border-gray-300 px-2 outline-none focus:border-green-600
                         dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-semibold">{t("locality_climate_zone")}</span>
            <select
              value={draft.climate_zone ?? ""}
              onChange={(e) =>
                onDraftChange({
                  ...draft,
                  climate_zone: e.target.value ? (e.target.value as ClimateZone) : null,
                })
              }
              className="h-9 w-full rounded-sm border border-gray-300 px-2 outline-none focus:border-green-600
                         dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
            >
              <option value="">—</option>
              {CAMEROON_CLIMATE_ZONES.map((zone) => (
                <option key={zone.value} value={zone.value}>
                  {t(zone.labelKey)}
                </option>
              ))}
              {draft.climate_zone && !isCameroonClimateZone(draft.climate_zone) ? (
                <option value={draft.climate_zone}>{t(getCameroonClimateZoneLabelKey(draft.climate_zone))}</option>
              ) : null}
            </select>
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50
                       dark:border-gray-700 dark:text-gray-200 dark:hover:bg-[#161b22]"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-sm bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ThSortable({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-200">
      <button type="button" onClick={onClick} className="inline-flex items-center gap-1 hover:underline">
        {label}
        <span className="text-[10px] text-gray-500 dark:text-gray-400">
          {active ? (dir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const pages = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        className="rounded-sm border border-gray-300 px-2 py-1 text-xs font-semibold hover:bg-gray-50
                   dark:border-gray-700 dark:hover:bg-[#161b22]"
        disabled={page === 1}
      >
        Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={[
            "rounded-sm border px-2 py-1 text-xs font-semibold",
            p === page
              ? "border-green-600 bg-green-600 text-white"
              : "border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-[#161b22] dark:text-gray-200",
          ].join(" ")}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        className="rounded-sm border border-gray-300 px-2 py-1 text-xs font-semibold hover:bg-gray-50
                   dark:border-gray-700 dark:hover:bg-[#161b22]"
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
}
