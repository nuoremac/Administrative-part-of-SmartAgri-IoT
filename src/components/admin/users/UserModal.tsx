"use client";

import { useMemo, useState } from "react";
import type { UserRow, UserRole, UserStatus } from "@/lib/mockUsers";

type Mode = "create" | "edit";

type UserDraft = Omit<UserRow, "id">;

function toDraft(initial: UserRow | null | undefined, mode: Mode): UserDraft {
  const nowIso = new Date().toISOString();

  if (mode === "create" && !initial) {
    return {
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      role: "user",
      preferences: {
        langue: "fr",
        theme: "light",
        notifications: { email: true, push: true, sms: false },
        unites: { temperature: "celsius", surface: "hectare", precipitation: "mm" },
      },
      status: "active",
      avatar: "",
      date_inscription: nowIso,
      dernier_acces: nowIso,
      created_at: nowIso,
      updated_at: nowIso,
    };
  }

  return {
    nom: initial?.nom ?? "",
    prenom: initial?.prenom ?? "",
    email: initial?.email ?? "",
    telephone: initial?.telephone ?? "",
    role: (initial?.role ?? "user") as UserRole,
    preferences: initial?.preferences ?? {
      langue: "fr",
      theme: "light",
      notifications: { email: true, push: true, sms: false },
      unites: { temperature: "celsius", surface: "hectare", precipitation: "mm" },
    },
    status: (initial?.status ?? "active") as UserStatus,
    avatar: initial?.avatar ?? "",
    date_inscription: initial?.date_inscription ?? nowIso,
    dernier_acces: initial?.dernier_acces ?? nowIso,
    created_at: initial?.created_at ?? nowIso,
    updated_at: initial?.updated_at ?? nowIso,
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
              value={form.nom}
              onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
              className={inputCls}
            />
          </Field>

          <Field label="Prénom">
            <input
              value={form.prenom}
              onChange={(e) => setForm((p) => ({ ...p, prenom: e.target.value }))}
              className={inputCls}
            />
          </Field>

          <Field label="Téléphone">
            <input
              value={form.telephone}
              onChange={(e) => setForm((p) => ({ ...p, telephone: e.target.value }))}
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
              <option value="suspended">Suspendu</option>
            </select>
          </Field>

          <Field label="Rôle">
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as UserRole }))}
              className={inputCls}
            >
              <option value="user">Utilisateur</option>
              <option value="admin">Admin</option>
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
                nom: form.nom.trim(),
                prenom: form.prenom.trim(),
                email: form.email.trim(),
                telephone: form.telephone.trim(),
                updated_at: new Date().toISOString(),
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
