import type { TokenResponse } from "@/lib/models/TokenResponse";
import type { UserResponse } from "@/lib/models/UserResponse";

const ACCESS_TOKEN_KEY = "smartagro:access_token";
const REFRESH_TOKEN_KEY = "smartagro:refresh_token";
export const CURRENT_USER_KEY = "smartagro:current_user";
export const CURRENT_USER_UPDATED_EVENT = "smartagro:current_user_updated";

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function normalizePayload(payload: unknown): unknown {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: unknown }).data;
  }
  return payload;
}

function notifyCurrentUserUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CURRENT_USER_UPDATED_EVENT));
}

export function saveAuthSession(payload: unknown) {
  if (!canUseStorage()) return;
  const resolved = normalizePayload(payload) as Partial<TokenResponse> | null;
  const accessToken = typeof resolved?.access_token === "string" ? resolved.access_token : "";
  const refreshToken = typeof resolved?.refresh_token === "string" ? resolved.refresh_token : "";

  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  if (resolved?.user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(resolved.user));
    notifyCurrentUserUpdated();
  }
}

export function getAccessToken(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveCurrentUser(user: UserResponse) {
  if (!canUseStorage()) return;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  notifyCurrentUserUpdated();
}

export function getCurrentUser(): UserResponse | null {
  if (!canUseStorage()) return null;
  return safeParseJson<UserResponse>(localStorage.getItem(CURRENT_USER_KEY));
}

export function clearAuthSession() {
  if (!canUseStorage()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  notifyCurrentUserUpdated();
}
