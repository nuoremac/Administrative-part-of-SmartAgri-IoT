
// "use client";

// import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

// type Theme = "light" | "dark";

// type ThemeCtx = {
//   theme: Theme;
//   toggleTheme: () => void;
//   setTheme: (t: Theme) => void;
// };

// const ThemeContext = createContext<ThemeCtx | null>(null);

// function applyThemeClass(theme: Theme) {
//   const root = document.documentElement;
//   if (theme === "dark") root.classList.add("dark");
//   else root.classList.remove("dark");
// }

// function getInitialTheme(): Theme {
//   if (typeof window === "undefined") return "light";
//   const stored = window.localStorage.getItem("theme");
//   if (stored === "light" || stored === "dark") return stored;
//   const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
//   return prefersDark ? "dark" : "light";
// }

// export default function ThemeProvider({ children }: { children: React.ReactNode }) {
//   const [theme, setThemeState] = useState<Theme>(getInitialTheme);

//   // sync <html class="dark"> + localStorage when theme changes
//   useEffect(() => {
//     if (typeof window === "undefined") return;
//     applyThemeClass(theme);
//     window.localStorage.setItem("theme", theme);
//   }, [theme]);

//   const setTheme = useCallback((t: Theme) => setThemeState(t), []);

//   const toggleTheme = useCallback(() => {
//     setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
//   }, []);

//   const value: ThemeCtx = { theme, setTheme, toggleTheme };

//   return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
// }

// export function useTheme() {
//   const ctx = useContext(ThemeContext);
//   if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
//   return ctx;
// }
"use client";

import React, { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  applyThemeToHtml,
  getThemeServerSnapshot,
  getThemeSnapshot,
  setThemeStore,
  subscribeTheme,
  toggleThemeStore,
  type Theme,
} from "./themeStore";

type ThemeCtx = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
};

const Ctx = createContext<ThemeCtx | null>(null);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  // ✅ Side effect is OK (no setState here). Applies class to <html>.
  useEffect(() => {
    applyThemeToHtml(theme);
  }, [theme]);

  const value = useMemo<ThemeCtx>(
    () => ({
      theme,
      setTheme: (t) => setThemeStore(t),
      toggleTheme: () => toggleThemeStore(),
      mounted: true,
    }),
    [theme]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be used inside <ThemeProvider />");
  return v;
}


