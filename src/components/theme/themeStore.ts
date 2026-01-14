export type Theme = "light" | "dark";

const LS_KEY = "smartagro:theme";
const EVT = "smartagro:theme:changed";

const SERVER_THEME: Theme = "light"; // stable SSR
let cache: Theme = SERVER_THEME;

function hasWindow() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function normalizeTheme(v: unknown): Theme | null {
  return v === "light" || v === "dark" ? v : null;
}

export function subscribeTheme(cb: () => void) {
  if (!hasWindow()) return () => {};

  const handler = () => cb();
  window.addEventListener(EVT, handler);

  const onStorage = (e: StorageEvent) => {
    if (e.key === LS_KEY) cb();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(EVT, handler);
    window.removeEventListener("storage", onStorage);
  };
}

// ✅ PURE snapshot (no writes, no dispatch, no setState)
export function getThemeSnapshot(): Theme {
  if (!hasWindow()) return SERVER_THEME;
  const stored = normalizeTheme(localStorage.getItem(LS_KEY));
  if (stored) cache = stored;
  return cache;
}

export function getThemeServerSnapshot(): Theme {
  return SERVER_THEME;
}

export function setThemeStore(next: Theme) {
  cache = next;
  if (!hasWindow()) return;
  localStorage.setItem(LS_KEY, next);
  applyThemeToHtml(next);
  window.dispatchEvent(new Event(EVT));
}

export function toggleThemeStore() {
  setThemeStore(cache === "dark" ? "light" : "dark");
}

export function applyThemeToHtml(theme: Theme) {
  if (!hasWindow()) return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}
