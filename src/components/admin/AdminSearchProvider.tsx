"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type AdminSearchCtx = {
  query: string;
  setQuery: (q: string) => void;
  clear: () => void;
};

const Ctx = createContext<AdminSearchCtx | null>(null);

export function AdminSearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQueryState] = useState("");

  const setQuery = (q: string) => setQueryState(q);
  const clear = () => setQueryState("");

  const value = useMemo(() => ({ query, setQuery, clear }), [query]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminSearch() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminSearch must be used within AdminSearchProvider");
  return ctx;
}
