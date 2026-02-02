"use client";

import { useMemo, useState } from "react";
import type { ParcelleResponse } from "@/lib/models/ParcelleResponse";
import { useT } from "@/components/i18n/useT";

export default function EditParcelModal({
  open,
  parcel,
  onClose,
  onSave,
}: {
  open: boolean;
  parcel: ParcelleResponse;
  onClose: () => void;
  onSave: (patch: { nom: string; superficie: number }) => void;
}) {
  const { t } = useT();
  // ✅ hooks always run; modal returns null after hooks
  const defaults = useMemo(
    () => ({
      nom: parcel.nom ?? "",
      superficie: parcel.superficie ?? 0,
    }),
    [parcel]
  );

  const [nom, setNom] = useState(defaults.nom);
  const [superficie, setSuperficie] = useState(String(defaults.superficie));
  const [error, setError] = useState<string | null>(null);

  // reset when parcel changes (key-based remount used by parent)
  // so no useEffect needed

  const submit = () => {
    setError(null);

    const a = Number(superficie);
    if (!nom.trim()) return setError(t("parcel_error_name"));
    if (!Number.isFinite(a) || a <= 0) return setError(t("parcel_error_area"));

    onSave({ nom: nom.trim(), superficie: Math.round(a) });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* overlay */}
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close"
        type="button"
      />

      {/* modal */}
      <div className="relative w-full max-w-lg rounded-sm border border-gray-300 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-[#0d1117]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t("edit_parcel_title")}
            </p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              ID: <span className="font-semibold">{parcel.id}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50
                       dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t("table_name")}>
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="h-9 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                         focus:border-green-600 dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
            />
          </Field>

          <Field label={t("terrain_area")}>
            <input
              value={superficie}
              onChange={(e) => setSuperficie(e.target.value)}
              inputMode="numeric"
              className="h-9 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                         focus:border-green-600 dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
            />
          </Field>

        </div>

        {error ? (
          <div className="mt-3 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-sm border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50
                       dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-200"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={submit}
            className="h-9 rounded-sm bg-green-600 px-3 text-xs font-semibold text-white hover:bg-green-700"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </span>
      {children}
    </label>
  );
}
