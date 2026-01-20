import type { TokenResponse } from "./models/TokenResponse";
import type { UserResponse } from "./models/UserResponse";

const ACCESS_KEY = "smartagro:access_token";
const REFRESH_KEY = "smartagro:refresh_token";
const USER_KEY = "smartagro:user";

const hasWindow = () => typeof window !== "undefined";
const isBadTokenValue = (value: string | null | undefined) =>
  value === null || value === undefined || value === "" || value === "undefined" || value === "null";

export function saveAuthSession(tokens: TokenResponse) {
  // Persist tokens + user so the session survives refresh.
  if (!hasWindow()) return;
  if (!isBadTokenValue(tokens.access_token)) {
    localStorage.setItem(ACCESS_KEY, tokens.access_token);
  } else {
    localStorage.removeItem(ACCESS_KEY);
  }
  if (!isBadTokenValue(tokens.refresh_token)) {
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
  } else {
    localStorage.removeItem(REFRESH_KEY);
  }
  if (tokens.user) {
    saveCurrentUser(tokens.user);
  }
}

export function getAccessToken(): string | null {
  if (!hasWindow()) return null;
  const token = localStorage.getItem(ACCESS_KEY);
  return isBadTokenValue(token) ? null : token;
}

export function getRefreshToken(): string | null {
  if (!hasWindow()) return null;
  const token = localStorage.getItem(REFRESH_KEY);
  return isBadTokenValue(token) ? null : token;
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

export function saveCurrentUser(user: UserResponse) {
  if (!hasWindow()) return;
  const normalizedUser =
    user && typeof user.role === "string"
      ? { ...user, role: user.role.toLowerCase() as typeof user.role }
      : user;
  localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
}

export function clearAuthSession() {
  // Clear all auth data on logout.
  if (!hasWindow()) return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}
