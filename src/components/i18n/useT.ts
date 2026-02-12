"use client";

import { useCallback, useMemo } from "react";
import { useLang } from "./LangProvider";
import { translations } from "./translations";

/**
 * useT() → t("key")
 */
export function useT() {
  const { lang } = useLang();

  const t = useCallback((key: string): string => {
    const value = translations[lang]?.[key];

    // Fallback: show key if missing translation
    if (!value) {
      console.warn(`[i18n] Missing translation: "${key}" (${lang})`);
      return key;
    }

    return value;
  }, [lang]);

  return useMemo(() => ({ t, lang }), [t, lang]);
}
