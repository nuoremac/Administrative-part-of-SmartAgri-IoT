"use client";

import { useEffect } from "react";
import { initOpenApi } from "@/lib/openApiClient";

export default function OpenApiProvider({ children }: { children: React.ReactNode }) {
  initOpenApi();
  useEffect(() => {
    initOpenApi();
  }, []);

  return children;
}
