
// "use client";

// import React, { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
// import {
//   applyThemeToHtml,
//   getThemeServerSnapshot,
//   getThemeSnapshot,
//   setThemeStore,
//   subscribeTheme,
//   toggleThemeStore,
//   type Theme,
// } from "./themeStore";

// type ThemeCtx = {
//   theme: Theme;
//   setTheme: (t: Theme) => void;
//   toggleTheme: () => void;
//   mounted: boolean;
// };

// const Ctx = createContext<ThemeCtx | null>(null);

// export default function ThemeProvider({ children }: { children: React.ReactNode }) {
//   const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

//   // ✅ Side effect is OK (no setState here). Applies class to <html>.
//   useEffect(() => {
//   document.documentElement.classList.toggle("dark", theme === "dark");  }, [theme]);

//   const value = useMemo<ThemeCtx>(
//     () => ({
//       theme,
//       setTheme: (t) => setThemeStore(t),
//       toggleTheme: () => toggleThemeStore(),
//       mounted: true,
//     }),
//     [theme]
//   );

//   return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
// }

// export function useTheme() {
//   const v = useContext(Ctx);
//   if (!v) throw new Error("useTheme must be used inside <ThemeProvider />");
//   return v;
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
};

const Ctx = createContext<ThemeCtx | null>(null);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  // ✅ Allowed: effect touches DOM only (no setState)
  useEffect(() => {
    applyThemeToHtml(theme);
  }, [theme]);

  const value = useMemo<ThemeCtx>(
    () => ({
      theme,
      setTheme: (t) => setThemeStore(t),
      toggleTheme: () => toggleThemeStore(),
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
