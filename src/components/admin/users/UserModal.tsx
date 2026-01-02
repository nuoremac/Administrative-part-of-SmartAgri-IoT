"use client";

import { useMemo, useState } from "react";
import type { UserRow, UserRole, UserStatus } from "@/lib/mockUsers";

type Mode = "create" | "edit";

type UserDraft = Omit<UserRow, "id">;

function toDraft(initial: UserRow | null | undefined, mode: Mode): UserDraft {
  const nowIso = new Date().toISOString();

  if (mode === "create" && !initial) {
    return {
      name: "",
      email: "",
      tel: "",
      parcels: 0,
      role: "FARMER",
      status: "active",
      lastActivity: nowIso,
    };
  }

  return {
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    tel: initial?.tel ?? "",
    parcels: initial?.parcels ?? 0,
    role: (initial?.role ?? "FARMER") as UserRole,
    status: (initial?.status ?? "active") as UserStatus,
    lastActivity: initial?.lastActivity ?? nowIso,
  };
}

export default function UserModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: Mode;
  initial?: UserRow | null;
  onClose: () => void;
  onSubmit: (data: UserDraft) => void;
}) {
  // ✅ No effects. We compute initial draft and create state once.
  const initialDraft = useMemo(() => toDraft(initial ?? null, mode), [initial, mode]);

  // Important: this state is created when component mounts.
  // We'll force remount from parent by passing a changing `key` to <UserModal />.
  const [form, setForm] = useState<UserDraft>(initialDraft);

  if (!open) return null;

  const title = mode === "create" ? "Ajouter un utilisateur" : "Modifier l’utilisateur";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-sm border border-gray-200 bg-white p-4 shadow
                      dark:border-gray-800 dark:bg-[#0d1117]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Renseignez les informations et validez.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50
                       dark:text-gray-300 dark:hover:bg-[#161b22]"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nom">
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className={inputCls}
            />
          </Field>

          <Field label="Téléphone">
            <input
              value={form.tel}
              onChange={(e) => setForm((p) => ({ ...p, tel: e.target.value }))}
              className={inputCls}
            />
          </Field>

          <Field label="Email" className="sm:col-span-2">
            <input
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className={inputCls}
            />
          </Field>

          <Field label="Parcelles">
            <input
              type="number"
              value={form.parcels}
              onChange={(e) =>
                setForm((p) => ({ ...p, parcels: Number(e.target.value || 0) }))
              }
              className={inputCls}
            />
          </Field>

          <Field label="Statut">
            <select
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({ ...p, status: e.target.value as UserStatus }))
              }
              className={inputCls}
            >
              <option value="active">Actif</option>
              <option value="pending">En attente</option>
              <option value="blocked">Bloqué</option>
            </select>
          </Field>

          <Field label="Rôle">
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserRole }))}
              className={inputCls}
            >
              <option value="FARMER">Agriculteur</option>
              <option value="ADMIN">Admin</option>
            </select>
          </Field>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-sm border border-gray-300 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50
                       dark:border-gray-700 dark:text-gray-200 dark:hover:bg-[#161b22]"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={() =>
              onSubmit({
                ...form,
                name: form.name.trim(),
                email: form.email.trim(),
                tel: form.tel.trim(),
                parcels: Number.isFinite(form.parcels) ? form.parcels : 0,
                lastActivity: new Date().toISOString(),
              })
            }
            className="h-9 rounded-sm bg-green-600 px-4 text-xs font-semibold text-white hover:bg-green-700"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className ?? ""}>
      <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "h-9 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none " +
  "focus:border-green-600 dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100";
