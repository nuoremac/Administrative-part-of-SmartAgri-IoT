"use client";

import { useLang } from "./LangProvider";
import { translations } from "./translations";

/**
 * useT() → t("key")
 */
export function useT() {
  const { lang } = useLang();

  function t(key: string): string {
    const value = translations[lang]?.[key];

    // Fallback: show key if missing translation
    if (!value) {
      console.warn(`[i18n] Missing translation: "${key}" (${lang})`);
      return key;
    }

    return value;
  }

  return { t, lang };
}
