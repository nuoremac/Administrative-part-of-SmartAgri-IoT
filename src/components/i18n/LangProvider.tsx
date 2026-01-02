"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type Lang = "en" | "fr";

type LanguageCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  ready: boolean; // tells you when localStorage has been checked
};

const Ctx = createContext<LanguageCtx | null>(null);

export function useLang() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLang must be used inside LanguageProvider");
  return v;
}

function normalizeLang(v: unknown): Lang | null {
  return v === "en" || v === "fr" ? v : null;
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // IMPORTANT: Start with a stable default so SSR and first client render match
  const [lang, setLangState] = useState<Lang>("en");
  const [ready, setReady] = useState(false);

  // After mount: read URL/localStorage safely (client only)
  useEffect(() => {
    const urlLang = normalizeLang(sp.get("lang"));
    const stored = normalizeLang(localStorage.getItem("lang"));

    const initial = urlLang ?? stored ?? "en";
    setLangState(initial);
    setReady(true);
  // run once on mount; sp is ok here in App Router, but keep deps empty to avoid loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      localStorage.setItem("lang", l);

      // keep URL in sync
      const params = new URLSearchParams(sp.toString());
      params.set("lang", l);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, sp]
  );

  return <Ctx.Provider value={{ lang, setLang, ready }}>{children}</Ctx.Provider>;
}
