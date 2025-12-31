"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type Lang = "en" | "fr";

type LanguageCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
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

  const urlLang = normalizeLang(sp.get("lang"));

  const [lang, setLangState] = useState<Lang>(() => {
    if (urlLang) return urlLang;
    if (typeof window !== "undefined") {
      const stored = normalizeLang(localStorage.getItem("lang"));
      if (stored) return stored;
    }
    return "en";
  });

  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      if (typeof window !== "undefined") localStorage.setItem("lang", l);

      const params = new URLSearchParams(sp.toString());
      params.set("lang", l);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, sp]
  );

  // no useMemo needed
  const value: LanguageCtx = { lang, setLang };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
