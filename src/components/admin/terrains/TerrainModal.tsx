"use client";

import { useMemo, useState } from "react";
import { useT } from "@/components/i18n/useT";
import { formatLocalite, type Localite } from "@/lib/mockLocalites";
import type { TerrainRow } from "@/lib/mockTerrains";

type FormState = {
  name: string;
  owner: string;
  area: string;
  localiteId: string;
};

export default function TerrainModal({
  open,
  mode,
  initial,
  localites,
  onClose,
  onSubmit,
  onAddLocalite,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial: TerrainRow | null;
  localites: Localite[];
  onClose: () => void;
  onSubmit: (data: { name: string; owner: string; area: number; localiteId: string }) => void;
  onAddLocalite: () => void;
}) {
  const { t } = useT();
  const initialForm = useMemo(
    () => ({
      name: initial?.name ?? "",
      owner: initial?.owner ?? "",
      area: initial?.area ? String(initial.area) : "",
      localiteId: initial?.localiteId ?? (localites[0]?.id ?? ""),
    }),
    [initial, localites]
  );
  const [form, setForm] = useState<FormState>(initialForm);

  const localiteOptions = useMemo(() => {
    return localites.map((l) => ({ id: l.id, label: formatLocalite(l) }));
  }, [localites]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-sm border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-[#0d1117]">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {mode === "create" ? t("add_terrain") : t("edit_terrain")}
        </p>

        <div className="mt-3 grid grid-cols-1 gap-3 text-xs text-gray-700 dark:text-gray-300">
          <label className="block">
            <span className="mb-1 block font-semibold">{t("terrain_name")}</span>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="h-9 w-full rounded-sm border border-gray-300 px-2 outline-none focus:border-green-600
                         dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-semibold">{t("terrain_owner")}</span>
            <input
              value={form.owner}
              onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
              className="h-9 w-full rounded-sm border border-gray-300 px-2 outline-none focus:border-green-600
                         dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-semibold">{t("terrain_area")}</span>
            <input
              value={form.area}
              onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
              className="h-9 w-full rounded-sm border border-gray-300 px-2 outline-none focus:border-green-600
                         dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
            />
          </label>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="font-semibold">{t("terrain_localite")}</span>
              <button
                type="button"
                onClick={onAddLocalite}
                className="rounded-sm border border-gray-300 px-2 py-0.5 text-[11px] font-semibold text-gray-700 hover:bg-gray-50
                           dark:border-gray-700 dark:text-gray-200 dark:hover:bg-[#161b22]"
              >
                + {t("add_localite")}
              </button>
            </div>
            <select
              value={form.localiteId}
              onChange={(e) => setForm((f) => ({ ...f, localiteId: e.target.value }))}
              className="h-9 w-full rounded-sm border border-gray-300 bg-white px-2 text-xs outline-none focus:border-green-600
                         dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
            >
              {localiteOptions.length === 0 ? (
                <option value="">{t("add_localite")}</option>
              ) : (
                localiteOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))
              )}
            </select>
          </div>
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
            onClick={() =>
              onSubmit({
                name: form.name.trim(),
                owner: form.owner.trim(),
                area: Number(form.area) || 0,
                localiteId: form.localiteId,
              })
            }
            className="rounded-sm bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
