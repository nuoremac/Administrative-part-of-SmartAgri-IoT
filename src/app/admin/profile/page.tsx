"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import type { UserResponse } from "@/lib/models/UserResponse";
import type { UserUpdate } from "@/lib/models/UserUpdate";
import { ApiError } from "@/lib/core/ApiError";
import { AuthenticationService } from "@/lib/services/AuthenticationService";
import { UsersService } from "@/lib/services/UsersService";
import { getCurrentUser, saveCurrentUser } from "@/lib/authSession";
import { useToast } from "@/components/ui/ToastProvider";
import { useT } from "@/components/i18n/useT";

export default function AdminProfilePage() {
  const { t } = useT();
  const { push } = useToast();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ prenom: "", nom: "", telephone: "", avatar: "" });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreviewFailed, setAvatarPreviewFailed] = useState(false);

  const isDataImageAvatar = (value: string) => value.startsWith("data:image/");

  const persistUser = (nextUser: UserResponse) => {
    setUser(nextUser);
    try {
      saveCurrentUser(nextUser);
    } catch {}
  };

  const resolveUser = (payload: unknown): UserResponse | null => {
    if (!payload || typeof payload !== "object") return null;
    if ("data" in payload) {
      return (payload as { data: UserResponse }).data;
    }
    return payload as UserResponse;
  };

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
    const local = getCurrentUser();
    if (local) setUser(local);

    const load = async () => {
      try {
        const fetched = await AuthenticationService.getCurrentUserInfoApiV1AuthMeGet();
        if (canceled) return;
        const resolved = resolveUser(fetched);
        if (!resolved) return;
        const localAvatar = local?.avatar?.trim() ?? "";
        const fetchedAvatar = resolved.avatar?.trim() ?? "";
        const merged =
          isDataImageAvatar(localAvatar) && !isDataImageAvatar(fetchedAvatar)
            ? { ...resolved, avatar: localAvatar }
            : resolved;
        persistUser(merged);
      } catch {
        // Ignore: admin shell already handles auth redirects.
      }
    };

    void load();
    return () => {
      canceled = true;
    };
  }, []);

  const roleLabel = useMemo(() => {
    const role = typeof user?.role === "string" ? user.role.toLowerCase() : "";
    if (role === "admin") return t("role_admin");
    if (role === "user") return t("role_user");
    return role || "-";
  }, [t, user?.role]);

  const avatarPreviewUrl = useMemo(() => {
    const raw = (editing ? form.avatar : user?.avatar)?.trim() ?? "";
    if (!raw) return null;
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/") || raw.startsWith("data:image/")) {
      return raw;
    }
    return null;
  }, [editing, form.avatar, user?.avatar]);

  const avatarInitials = useMemo(() => {
    const first = (editing ? form.prenom : user?.prenom)?.trim() || "";
    const last = (editing ? form.nom : user?.nom)?.trim() || "";
    const letters = `${first} ${last}`.trim();
    if (!letters) return "A";
    return letters
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() || "")
      .slice(0, 2)
      .join("");
  }, [editing, form.nom, form.prenom, user?.nom, user?.prenom]);

  useEffect(() => {
    setAvatarPreviewFailed(false);
  }, [avatarPreviewUrl]);


  const startEdit = () => {
    setForm({
      prenom: user?.prenom || "",
      nom: user?.nom || "",
      telephone: user?.telephone || "",
      avatar: user?.avatar || "",
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const handleAvatarFilePick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      push({ title: t("invalidCredentials"), message: t("profile_avatar_invalid_file"), kind: "error" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      push({ title: t("invalidCredentials"), message: t("profile_avatar_too_large"), kind: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        push({ title: t("profile_update_failed"), message: t("profile_avatar_read_failed"), kind: "error" });
        return;
      }
      setForm((prev) => ({ ...prev, avatar: result }));
    };
    reader.onerror = () => {
      push({ title: t("profile_update_failed"), message: t("profile_avatar_read_failed"), kind: "error" });
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const trimmedAvatar = form.avatar.trim();
      const requestBody: UserUpdate = {
        prenom: form.prenom.trim() || null,
        nom: form.nom.trim() || null,
        telephone: form.telephone.trim() || null,
      };
      if (!isDataImageAvatar(trimmedAvatar)) {
        requestBody.avatar = trimmedAvatar || null;
      }

      const updated = await UsersService.updateMyProfileApiV1UsersMePut(requestBody);
      const resolved = resolveUser(updated);
      if (resolved) {
        const merged = isDataImageAvatar(trimmedAvatar) ? { ...resolved, avatar: trimmedAvatar } : resolved;
        persistUser(merged);
      }
      setEditing(false);
      push({ title: t("profile_update_success"), kind: "success" });
    } catch (error) {
      push({ title: t("profile_update_failed"), message: resolveApiErrorMessage(error), kind: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      push({ title: t("profile_password_required"), kind: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      push({ title: t("profile_password_mismatch"), kind: "error" });
      return;
    }

    setSaving(true);
    try {
      await AuthenticationService.changePasswordApiV1AuthChangePasswordPost({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      push({ title: t("profile_password_updated"), kind: "success" });
    } catch {
      push({ title: t("profile_password_failed"), kind: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
      <div className="mb-4">
        <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t("profile_title")}</h1>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("profile_subtitle")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-sm border border-gray-300 bg-white p-4 text-xs text-gray-700 dark:border-gray-800 dark:bg-[#0d1117] dark:text-gray-300">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-semibold text-gray-900 dark:text-gray-100">{t("profile_info_title")}</h2>
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <button
                    type="button"
                    onClick={handleUpdateProfile}
                    disabled={saving}
                    className="rounded-sm bg-green-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saving ? t("loading") : t("save")}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-sm border border-gray-300 px-3 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50
                               dark:border-gray-700 dark:text-gray-200 dark:hover:bg-[#161b22]"
                  >
                    {t("cancel")}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={startEdit}
                  className="rounded-sm border border-gray-300 px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50
                             dark:border-gray-700 dark:text-gray-200 dark:hover:bg-[#161b22]"
                  aria-label={t("edit")}
                >
                  ✏️ {t("edit")}
                </button>
              )}
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{t("field_first_name")}</p>
              {editing ? (
                <input
                  value={form.prenom}
                  onChange={(e) => setForm((prev) => ({ ...prev, prenom: e.target.value }))}
                  className="mt-1 h-9 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                             dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
                />
              ) : (
                <p className="mt-1 rounded-sm border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 dark:border-gray-800 dark:bg-[#161b22] dark:text-gray-100">
                  {user?.prenom || "-"}
                </p>
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{t("field_last_name")}</p>
              {editing ? (
                <input
                  value={form.nom}
                  onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))}
                  className="mt-1 h-9 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                             dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
                />
              ) : (
                <p className="mt-1 rounded-sm border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 dark:border-gray-800 dark:bg-[#161b22] dark:text-gray-100">
                  {user?.nom || "-"}
                </p>
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{t("email")}</p>
              <p className="mt-1 rounded-sm border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 dark:border-gray-800 dark:bg-[#161b22] dark:text-gray-100">
                {user?.email || "-"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{t("field_phone")}</p>
              {editing ? (
                <input
                  value={form.telephone}
                  onChange={(e) => setForm((prev) => ({ ...prev, telephone: e.target.value }))}
                  className="mt-1 h-9 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                             dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
                />
              ) : (
                <p className="mt-1 rounded-sm border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 dark:border-gray-800 dark:bg-[#161b22] dark:text-gray-100">
                  {user?.telephone || "-"}
                </p>
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{t("field_role")}</p>
              <p className="mt-1 rounded-sm border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 dark:border-gray-800 dark:bg-[#161b22] dark:text-gray-100">
                {roleLabel}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">{t("profile_avatar")}</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-green-600 text-sm font-bold text-white">
                  {avatarPreviewUrl && !avatarPreviewFailed ? (
                    <Image
                      src={avatarPreviewUrl}
                      alt={t("profile_avatar")}
                      fill
                      sizes="48px"
                      unoptimized
                      className="object-cover"
                      onError={() => setAvatarPreviewFailed(true)}
                    />
                  ) : (
                    avatarInitials
                  )}
                </div>
                {editing ? (
                  <label className="inline-flex cursor-pointer rounded-sm border border-gray-300 px-3 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-[#161b22]">
                    {t("profile_avatar_pick_file")}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarFilePick}
                    />
                  </label>
                ) : null}
              </div>
              {!avatarPreviewUrl ? (
                <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{t("profile_avatar_not_set")}</p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-sm border border-gray-300 bg-white p-4 text-xs text-gray-700 dark:border-gray-800 dark:bg-[#0d1117] dark:text-gray-300">
          <h2 className="text-xs font-semibold text-gray-900 dark:text-gray-100">{t("profile_security_title")}</h2>
          <form onSubmit={handleChangePassword} className="mt-3 space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                {t("profile_current_password")}
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="mt-1 h-9 w-full rounded-sm border border-gray-300 bg-white px-3 pr-9 text-sm outline-none
                             dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 dark:text-gray-300"
                  aria-label="Toggle password visibility"
                >
                  {showOldPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                      <path d="M4 4l16 16" />
                      <path d="M10.5 10.5a3 3 0 0 0 4 4" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                {t("profile_new_password")}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 h-9 w-full rounded-sm border border-gray-300 bg-white px-3 pr-9 text-sm outline-none
                             dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 dark:text-gray-300"
                  aria-label="Toggle password visibility"
                >
                  {showNewPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                      <path d="M4 4l16 16" />
                      <path d="M10.5 10.5a3 3 0 0 0 4 4" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                {t("profile_confirm_password")}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 h-9 w-full rounded-sm border border-gray-300 bg-white px-3 pr-9 text-sm outline-none
                             dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 dark:text-gray-300"
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                      <path d="M4 4l16 16" />
                      <path d="M10.5 10.5a3 3 0 0 0 4 4" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-sm bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? t("loading") : t("profile_update_password")}
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}
