import { OpenAPI } from "@/lib/core/OpenAPI";
import { getAccessToken } from "@/lib/authSession";

let configured = false;

export function initOpenApi() {
  if (configured) return;
  configured = true;
  OpenAPI.TOKEN = async () => getAccessToken() || "";
}

// Ensure token resolver is set as early as possible on the client.
if (typeof window !== "undefined") {
  initOpenApi();
}
