"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { NotificationMode } from "@/lib/models/NotificationMode";
import type { NotificationResponse } from "@/lib/models/NotificationResponse";
import { NotificationsService } from "@/lib/services/NotificationsService";
import { unwrapList } from "@/lib/apiHelpers";
import { useToast } from "@/components/ui/ToastProvider";
import { useT } from "@/components/i18n/useT";

export default function AdminNotificationsPage() {
  const { t } = useT();
  const { push } = useToast();
  const [supportedModes, setSupportedModes] = useState<NotificationMode[]>([]);
  const [testMode, setTestMode] = useState<NotificationMode | "">("");
  const [testTarget, setTestTarget] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [testTargetError, setTestTargetError] = useState<string | null>(null);
  const [loadingModes, setLoadingModes] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<{
    success: boolean;
    mode: NotificationMode;
    target: string;
    message: string;
    at: string;
  } | null>(null);

  const isNotificationMode = (value: string): value is NotificationMode => {
    return value === "email" || value === "whatsapp" || value === "sms" || value === "telegram";
  };

  const resolveNotification = (payload: unknown): NotificationResponse | null => {
    if (!payload || typeof payload !== "object") return null;
    if ("data" in payload) {
      return (payload as { data: NotificationResponse }).data;
    }
    return payload as NotificationResponse;
  };

  const loadModes = useCallback(async () => {
    setLoadingModes(true);
    try {
      const payload = await NotificationsService.getSupportedModesApiV1NotificationsModesGet();
      const values = unwrapList<string>(payload);
      const modes = values.filter((value): value is NotificationMode => isNotificationMode(value));
      setSupportedModes(modes);
    } catch {
      push({ title: t("load_failed"), kind: "error" });
    } finally {
      setLoadingModes(false);
    }
  }, [push, t]);

  useEffect(() => {
    void loadModes();
  }, [loadModes]);

  useEffect(() => {
    if (!supportedModes.length) {
      setTestMode("");
      return;
    }
    setTestMode((prev) => {
      if (prev && supportedModes.includes(prev as NotificationMode)) return prev;
      return supportedModes[0];
    });
  }, [supportedModes]);

  const modeLabel = (mode: NotificationMode) => {
    if (mode === "email") return t("notification_mode_email");
    if (mode === "sms") return t("notification_mode_sms");
    if (mode === "whatsapp") return t("notification_mode_whatsapp");
    if (mode === "telegram") return t("notification_mode_telegram");
    return mode;
  };

  const testTargetPlaceholder = useMemo(() => {
    if (testMode === "email") return t("notification_test_target_placeholder_email");
    if (testMode === "sms" || testMode === "whatsapp") return t("notification_test_target_placeholder_phone");
    if (testMode === "telegram") return t("notification_test_target_placeholder_chat_id");
    return t("notification_test_target_placeholder");
  }, [t, testMode]);

  const targetHint = useMemo(() => {
    if (testMode === "email") return t("notification_test_target_hint_email");
    if (testMode === "sms" || testMode === "whatsapp") return t("notification_test_target_hint_phone");
    if (testMode === "telegram") return t("notification_test_target_hint_chat_id");
    return t("notification_test_target_hint_optional");
  }, [t, testMode]);

  const validateTestTarget = (mode: NotificationMode, rawTarget: string): string | null => {
    if (!rawTarget) return null;
    if (mode === "email") {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawTarget) ? null : t("notification_test_target_invalid_email");
    }
    if (mode === "sms" || mode === "whatsapp") {
      return /^\+?[1-9]\d{7,14}$/.test(rawTarget) ? null : t("notification_test_target_invalid_phone");
    }
    if (mode === "telegram") {
      return /^-?\d{5,20}$/.test(rawTarget) ? null : t("notification_test_target_invalid_chat_id");
    }
    return null;
  };

  useEffect(() => {
    setTestTargetError(null);
  }, [testMode, testTarget]);

  const handleSendTestNotification = async () => {
    if (!testMode) {
      push({ title: t("invalidCredentials"), message: t("notification_test_mode_required"), kind: "error" });
      return;
    }
    const rawTarget = testTarget.trim();
    const targetValidationError = validateTestTarget(testMode, rawTarget);
    if (targetValidationError) {
      setTestTargetError(targetValidationError);
      push({ title: t("notification_test_failed"), message: targetValidationError, kind: "error" });
      return;
    }
    setTestTargetError(null);

    setTestingNotification(true);
    try {
      const payload = await NotificationsService.testNotificationApiV1NotificationsTestPost({
        mode: testMode,
        target: rawTarget || null,
        message: testMessage.trim() || undefined,
      });
      const result = resolveNotification(payload);
      const responseMessage = result?.message || "";
      setLastTestResult({
        success: Boolean(result?.success),
        mode: testMode,
        target: rawTarget || t("notification_test_target_me"),
        message: responseMessage,
        at: new Date().toISOString(),
      });
      if (result?.success) {
        push({
          title: t("notification_test_success"),
          message: responseMessage || undefined,
          kind: "success",
        });
      } else {
        push({
          title: t("notification_test_failed"),
          message: responseMessage || undefined,
          kind: "error",
        });
      }
    } catch {
      setLastTestResult({
        success: false,
        mode: testMode,
        target: rawTarget || t("notification_test_target_me"),
        message: t("notification_test_failed"),
        at: new Date().toISOString(),
      });
      push({ title: t("notification_test_failed"), kind: "error" });
    } finally {
      setTestingNotification(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#dff7df] p-4 dark:bg-[#0d1117]">
      <div className="mb-4">
        <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t("notifications_page_title")}</h1>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{t("notifications_page_subtitle")}</p>
      </div>

      <section className="rounded-sm border border-gray-300 bg-white p-4 text-xs text-gray-700 dark:border-gray-800 dark:bg-[#0d1117] dark:text-gray-300">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xs font-semibold text-gray-900 dark:text-gray-100">{t("notifications_available_channels")}</h2>
          <button
            type="button"
            onClick={() => void loadModes()}
            disabled={loadingModes}
            className="rounded-sm border border-gray-300 px-3 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-[#161b22]"
          >
            {loadingModes ? t("loading") : t("notifications_refresh_modes")}
          </button>
        </div>

        {loadingModes ? (
          <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">{t("loading")}</p>
        ) : supportedModes.length === 0 ? (
          <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">{t("notification_no_modes")}</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {supportedModes.map((mode) => (
              <span
                key={mode}
                className="rounded-full bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-200"
              >
                {modeLabel(mode)}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-800">
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                {t("notification_test_mode")}
              </label>
              <select
                value={testMode}
                onChange={(e) => setTestMode(e.target.value as NotificationMode | "")}
                className="mt-1 h-9 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                           dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
                disabled={!supportedModes.length}
              >
                <option value="">{t("notification_filter_all")}</option>
                {supportedModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {modeLabel(mode)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                {t("notification_test_target")}
              </label>
              <input
                value={testTarget}
                onChange={(e) => setTestTarget(e.target.value)}
                placeholder={testTargetPlaceholder}
                className="mt-1 h-9 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm outline-none
                           dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
              />
              <p
                className={`mt-1 text-[11px] ${
                  testTargetError ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {testTargetError ?? targetHint}
              </p>
            </div>
            <div className="sm:col-span-3">
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                {t("notification_test_message")}
              </label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder={t("notification_test_message_placeholder")}
                rows={3}
                className="mt-1 w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm outline-none
                           dark:border-gray-700 dark:bg-[#161b22] dark:text-gray-100"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleSendTestNotification}
              disabled={testingNotification || !supportedModes.length}
              className="rounded-sm bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {testingNotification ? t("loading") : t("notification_test_send")}
            </button>
          </div>
          {lastTestResult ? (
            <div
              className={`mt-3 rounded-sm border px-3 py-2 text-xs ${
                lastTestResult.success
                  ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800/60 dark:bg-green-900/20 dark:text-green-200"
                  : "border-red-200 bg-red-50 text-red-800 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-200"
              }`}
            >
              <p className="font-semibold">{t("notification_test_last_result")}</p>
              <p className="mt-1">
                {modeLabel(lastTestResult.mode)} • {lastTestResult.target}
              </p>
              <p className="mt-1">{new Date(lastTestResult.at).toLocaleString()}</p>
              {lastTestResult.message ? <p className="mt-1">{lastTestResult.message}</p> : null}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
