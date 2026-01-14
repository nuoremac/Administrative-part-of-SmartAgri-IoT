import { applyListParams, readFromStorage, writeToStorage, type ListParams, type ListResult } from "./mockStore";

export type UserStatus = "active" | "pending" | "suspended";
export type UserRole = "user" | "admin";

export type UserRow = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: UserRole;
  preferences: {
    langue: "fr" | "en";
    theme: "light" | "dark";
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    unites: {
      temperature: "celsius" | "fahrenheit";
      surface: "hectare" | "m2";
      precipitation: "mm" | "in";
    };
  };
  status: UserStatus;
  avatar: string;
  date_inscription: string;
  dernier_acces: string;
  created_at: string;
  updated_at: string;
};

const LS_KEY = "smartagro_users_v2";

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
    const prenom = name;
    const nom = i % 3 === 0 ? "Ngassa" : i % 3 === 1 ? "Kouam" : "Manga";
    const email = `${prenom.toLowerCase()}@smartagro.com`;
    const telephone = `6${50 + (i % 5)} ${(10 + i) % 100} ${(20 + i * 2) % 100} ${(30 + i * 3) % 100}`.replace(
      /(\d)(\d{2}) (\d{2}) (\d{2})/g,
      "$1$2 $3 $4"
    );
    const status: UserStatus = i % 11 === 0 ? "suspended" : i % 7 === 0 ? "pending" : "active";
    const role: UserRole = i % 12 === 0 ? "admin" : "user";

    const created_at = new Date(now - (i % 14) * 24 * 60 * 60 * 1000).toISOString();
    const updated_at = new Date(now - (i % 6) * 60 * 60 * 1000).toISOString();
    const dernier_acces = new Date(now - (i % 8) * 60 * 60 * 1000).toISOString();

    return {
      id,
      nom,
      prenom,
      email,
      telephone,
      role,
      preferences: {
        langue: i % 2 === 0 ? "fr" : "en",
        theme: i % 3 === 0 ? "dark" : "light",
        notifications: { email: true, push: true, sms: false },
        unites: { temperature: "celsius", surface: "hectare", precipitation: "mm" },
      },
      status,
      avatar: "",
      date_inscription: created_at,
      dernier_acces,
      created_at,
      updated_at,
    };
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
  return applyListParams(rows, params, ["nom", "prenom", "email", "telephone", "status", "role"]);
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
