import { applyListParams, readFromStorage, writeToStorage, type ListParams, type ListResult } from "./mockStore";

export type UserStatus = "active" | "pending" | "blocked";
export type UserRole = "FARMER" | "ADMIN";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  tel: string;
  parcels: number;
  role: UserRole;
  status: UserStatus;
  lastActivity: string; // ISO string
};

const LS_KEY = "smartagro_users_v1";

function seed(): UserRow[] {
  // 30 users so pagination makes sense
  const baseNames = [
    "Abena","Koffi","Nadia","Jean","Amina","Pierre","Sonia","Yann","Kevin","Laura",
    "Moussa","Ibrahim","Chantal","Brice","Mireille","Samuel","Ruth","Noah","Esther","Daniel",
    "Paul","Sarah","David","Joyce","Eric","Marie","Claude","Fabrice","Lina","Grace",
  ];

  const now = Date.now();
  return baseNames.map((name, i) => {
    const id = `u${i + 1}`;
    const email = `${name.toLowerCase()}@smartagro.com`;
    const tel = `6${50 + (i % 5)} ${(10 + i) % 100} ${(20 + i * 2) % 100} ${(30 + i * 3) % 100}`.replace(
      /(\d)(\d{2}) (\d{2}) (\d{2})/g,
      "$1$2 $3 $4"
    );
    const parcels = (i % 10) + 1;

    const status: UserStatus = i % 11 === 0 ? "blocked" : i % 7 === 0 ? "pending" : "active";
    const role: UserRole = "FARMER";

    // last activity spread over last 14 days
    const lastActivity = new Date(now - (i % 14) * 24 * 60 * 60 * 1000 - (i % 8) * 60 * 60 * 1000).toISOString();

    return { id, name, email, tel, parcels, role, status, lastActivity };
  });
}

function readAll(): UserRow[] {
  return readFromStorage<UserRow>(LS_KEY, seed);
}

function writeAll(users: UserRow[]) {
  writeToStorage<UserRow>(LS_KEY, users);
}

export function listUsers(params: ListParams = {}): ListResult<UserRow> {
  const rows = readAll();
  return applyListParams(rows, params, ["name", "email", "tel", "status", "role"]);
}

export function getUser(id: string): UserRow | undefined {
  return readAll().find((u) => u.id === id);
}

export function createUser(input: Omit<UserRow, "id">): UserRow {
  const users = readAll();
  const id = `u${Math.max(0, ...users.map((u) => Number(u.id.replace("u", "")) || 0)) + 1}`;
  const user: UserRow = { ...input, id };
  users.unshift(user);
  writeAll(users);
  return user;
}

export function updateUser(id: string, patch: Partial<Omit<UserRow, "id">>): UserRow | null {
  const users = readAll();
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  const updated = { ...users[idx], ...patch };
  users[idx] = updated;
  writeAll(users);
  return updated;
}

export function deleteUser(id: string): UserRow | null {
  const users = readAll();
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  const [removed] = users.splice(idx, 1);
  writeAll(users);
  return removed;
}

export function restoreUser(user: UserRow) {
  const users = readAll();
  // avoid duplicates
  if (users.some((u) => u.id === user.id)) return;
  users.unshift(user);
  writeAll(users);
}
