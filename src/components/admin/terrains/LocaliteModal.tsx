"use client";

import { useState } from "react";
import { useT } from "@/components/i18n/useT";

type FormState = {
  name: string;
  city: string;
  country: string;
};

export default function LocaliteModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormState) => void;
}) {
  const { t } = useT();
  const [form, setForm] = useState<FormState>({ name: "", city: "", country: "" });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-sm border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-[#0d1117]">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("add_localite_title")}</p>
        <div className="mt-3 space-y-3 text-xs text-gray-700 dark:text-gray-300">
          <label className="block">
            <span className="mb-1 block font-semibold">{t("locality_name")}</span>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="h-9 w-full rounded-sm border border-gray-300 px-2 outline-none focus:border-green-600
                         dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-semibold">{t("locality_city")}</span>
            <input
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="h-9 w-full rounded-sm border border-gray-300 px-2 outline-none focus:border-green-600
                         dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-semibold">{t("locality_country")}</span>
            <input
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              className="h-9 w-full rounded-sm border border-gray-300 px-2 outline-none focus:border-green-600
                         dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
            />
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
            onClick={() => onSubmit(form)}
            className="rounded-sm bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
