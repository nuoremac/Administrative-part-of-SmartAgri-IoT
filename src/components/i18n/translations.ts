import type { Lang } from "./LangProvider";

/**
 * Add ALL app texts here.
 * Keys are stable identifiers used across the app.
 */
export const translations: Record<Lang, Record<string, string>> = {
  en: {
    // ===== Global =====
    language: "Language",
    logout: "Logout",
    search: "Search",

    // ===== Landing / Role Selection =====
    appName: "Smart Agro",
    admin: "Administrator",
    farmer: "Farmer",
    tagline: "The soil speaks , We listen.",

    // ===== Login =====
    loginTitle: "Login",
    email: "Email",
    password: "Password",
    signIn: "Sign in",

    // ===== Navbar (Farmer) =====
    dashboard: "Dashboard",
    terrains: "Terrains",
    parcelles: "Parcelles",
    capteurs: "Sensors",
    profile: "Profile",
    about: "About us",
  },

  fr: {
    // ===== Global =====
    language: "Langue",
    logout: "Déconnexion",
    search: "Rechercher",

    // ===== Landing / Role Selection =====
    appName: "Smart Agro",
    admin: "Administrateur",
    farmer: "Agriculteur",
    tagline: "La terre parle ,  Nous écoutons.",

    // ===== Login =====
    loginTitle: "Connexion",
    email: "Email",
    password: "Mot de passe",
    signIn: "Se connecter",

    // ===== Navbar (Farmer) =====
    dashboard: "Tableau de bord",
    terrains: "Terrains",
    parcelles: "Parcelles",
    capteurs: "Capteurs",
    profile: "Profil",
    about: "À propos",
  },
};
