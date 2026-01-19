import { OpenAPI } from "@/lib/core/OpenAPI";
import { getAccessToken } from "@/lib/authSession";

let configured = false;

export function initOpenApi() {
  if (configured) return;
  configured = true;
  OpenAPI.TOKEN = async () => getAccessToken() || "";
}
