import type { TokenResponse } from "./models/TokenResponse";
import type { UserResponse } from "./models/UserResponse";

const ACCESS_KEY = "smartagro:access_token";
const REFRESH_KEY = "smartagro:refresh_token";
const USER_KEY = "smartagro:user";

const hasWindow = () => typeof window !== "undefined";

export function saveAuthSession(tokens: TokenResponse) {
  // Persist tokens + user so the session survives refresh.
  if (!hasWindow()) return;
  localStorage.setItem(ACCESS_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
  localStorage.setItem(USER_KEY, JSON.stringify(tokens.user));
}

export function getAccessToken(): string | null {
  if (!hasWindow()) return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (!hasWindow()) return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getCurrentUser(): UserResponse | null {
  if (!hasWindow()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserResponse;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  // Clear all auth data on logout.
  if (!hasWindow()) return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}
