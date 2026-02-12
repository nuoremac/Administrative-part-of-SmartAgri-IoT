export type UserRole = "admin" | "user";
export type UserStatus = "active" | "suspended";

export type UserPreferences = {
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
    precipitation: "mm" | "inch";
  };
};

export type UserRow = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: UserRole;
  preferences: UserPreferences;
  status: UserStatus;
  avatar: string;
  date_inscription: string;
  dernier_acces: string;
  created_at: string;
  updated_at: string;
};

