//To store the logged-in user in localStorage (mock session)
import type { MockUser } from "./mockAuth";

const KEY = "smartagro_user";

export function saveUser(user: MockUser) {
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function getUser(): MockUser | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearUser() {
  localStorage.removeItem(KEY);
}
