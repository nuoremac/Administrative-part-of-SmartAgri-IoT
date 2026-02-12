import { OpenAPI } from "@/lib/core/OpenAPI";
import { getAccessToken } from "@/lib/authSession";

let configured = false;

export function initOpenApi() {
  if (configured) return;
  configured = true;

  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (envBase) {
    OpenAPI.BASE = envBase.replace(/\/+$/, "");
  }

  OpenAPI.TOKEN = async () => getAccessToken() || "";
}

if (typeof window !== "undefined") {
  initOpenApi();
}

