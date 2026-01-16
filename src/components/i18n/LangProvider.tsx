"use client";

import React, { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";

export type Lang = "en" | "fr";

type LanguageCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  ready: boolean;
};

const Ctx = createContext<LanguageCtx | null>(null);

export function useLang() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLang must be used inside LanguageProvider");
  return v;
}

const LS_KEY = "lang"; // keep your existing key
const EVT = "smartagro:lang:changed";
const SERVER_LANG: Lang = "en";
let cache: Lang = SERVER_LANG;

function hasWindow() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function normalizeLang(v: unknown): Lang | null {
  return v === "en" || v === "fr" ? v : null;
}

function readStoredLang(): Lang | null {
  if (!hasWindow()) return null;
  return normalizeLang(localStorage.getItem(LS_KEY));
}

function subscribe(cb: () => void) {
  if (!hasWindow()) return () => {};
  const handler = () => cb();
  window.addEventListener(EVT, handler);

  const onStorage = (e: StorageEvent) => {
    if (e.key === LS_KEY) {
      const stored = readStoredLang();
      if (stored) cache = stored;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Lang {
  return cache;
}

function getServerSnapshot(): Lang {
  return SERVER_LANG;
}

function setLangStore(next: Lang) {
  cache = next;
  if (!hasWindow()) return;
  localStorage.setItem(LS_KEY, next);
  window.dispatchEvent(new Event(EVT));
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const stored = readStoredLang();
    if (stored && stored !== cache) setLangStore(stored);
  }, []);

  const value = useMemo<LanguageCtx>(
    () => ({
      lang,
      setLang: (l: Lang) => setLangStore(l),
      ready: true,
    }),
    [lang]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
