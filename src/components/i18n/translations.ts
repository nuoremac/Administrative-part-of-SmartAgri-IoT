import type { Lang } from "./LangProvider";

/**
 * Add ALL app texts here.
 * Keys are stable identifiers used across the app.
 */
export const translations: Record<Lang, Record<string, string>> = {
  en: {
    // ===== Global =====
    language: "Language",
    email: "Email",
    signIn: "Sign in",


    // ==== Administrator Login =====
    loginAdminTitle: "Admin login",
    adminCode: "Security code",  

    // ==== Administrator Forgot Password =====
    forgotCode: "Forgot code?",

    // === Administrator dashboard =====
    users: "Users",
    admin_dashboard_title: "Admin dashboard",
    admin_dashboard_subtitle: "System overview (mock data).",
    admin_kpi_farmers: "Farmers",
    admin_kpi_terrains: "Terrains",
    admin_kpi_parcelles: "Plots",
    admin_kpi_capteurs: "Sensors",
    admin_lorawan_title: "LoRaWAN network status",
    admin_lorawan_subtitle: "Gateway state and data freshness.",
    admin_gateways_online: "Gateways online",
    admin_last_update: "Last update",
    admin_alerts_title: "System alerts",
    admin_activity_title: "Recent activity",
    admin_view_all: "View all",
    trend_flat: "Stable",

    checking: "Checking...",
    invalidCredentials: "Invalid credentials.",

    forgotCodeMessage:
      "Contact support or the system administrator to reset your security code.",
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

    // ==== Administrator Login =====
    loginAdminTitle: "Connexion Admin",
    adminCode: "Code de sécurité",

    // ==== Administrator Forgot Password =====
    forgotCode: "Code oublié ?",

    // === Administrator dashboard =====
      users: "Utilisateurs",
      admin_dashboard_title: "Dashboard administrateur",
      admin_dashboard_subtitle: "Vue d’ensemble du système (mock data).",
      admin_kpi_farmers: "Agriculteurs",
      admin_kpi_terrains: "Terrains",
      admin_kpi_parcelles: "Parcelles",
      admin_kpi_capteurs: "Capteurs",
      admin_lorawan_title: "Statut du réseau LoRaWAN",
      admin_lorawan_subtitle: "État de la passerelle et fraîcheur des données.",
      admin_gateways_online: "Passerelles en ligne",
      admin_last_update: "Dernière mise à jour",
      admin_alerts_title: "Alertes système",
      admin_activity_title: "Activité récente",
      admin_view_all: "Voir tout",
      trend_flat: "Stable",

      checking: "Vérification...",
      invalidCredentials: "Identifiants invalides.",
      forgotCodeMessage:
      "Contactez le support ou l’administrateur système pour réinitialiser votre code.",
  },
};
