"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { UserResponse } from "@/lib/models/UserResponse";
import { AuthenticationService } from "@/lib/services/AuthenticationService";
import {
  CURRENT_USER_KEY,
  CURRENT_USER_UPDATED_EVENT,
  clearAuthSession,
  getAccessToken,
  getCurrentUser,
  saveCurrentUser,
} from "@/lib/authSession";
import { UserRole_Output } from "@/lib/models/UserRole_Output";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAdminSearch } from "@/components/admin/AdminSearchProvider";
import { useLang, type Lang } from "@/components/i18n/LangProvider";
import { useT } from "@/components/i18n/useT";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const iconClass = "h-4 w-4";

function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c0-3 3-5 5.5-5s5.5 2 5.5 5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M14.5 19c.2-2.1 2-3.6 4-3.6 1.2 0 2.4.4 3.1 1.1" />
    </svg>
  );
}

function IconTerrains() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 18l6-6 4 4 6-6" />
      <path d="M4 6h16v12H4z" />
    </svg>
  );
}

function IconParcels() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="14" height="14" rx="1" />
      <path d="M7 4v14M3 9h14" />
      <rect x="9" y="9" width="12" height="12" rx="1" />
    </svg>
  );
}

function IconSensors() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 7V5a2 2 0 0 1 2-2h6v18h-6a2 2 0 0 1-2-2v-2" />
      <path d="M4 12h10" />
      <path d="M8 8l-4 4 4 4" />
    </svg>
  );
}

function IconProfile() {
  return <span className="text-sm">👤</span>;
}

// Nouvelles icônes pour le thème
function IconSun() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4" fill="#FCD34D" stroke="currentColor" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" fill="none" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} stroke="currentColor" strokeWidth="1.8">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#9CA3AF" />
    </svg>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { query, setQuery, clear } = useAdminSearch();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLang();
  const { t } = useT();
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const resolveUser = (payload: unknown): UserResponse | null => {
    if (!payload || typeof payload !== "object") return null;
    if ("data" in payload) {
      return (payload as { data: UserResponse }).data;
    }
    return payload as UserResponse;
  };

  // protect admin area
  useEffect(() => {
    let canceled = false;

    const ensureAdmin = async () => {
      const token = getAccessToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      let u = getCurrentUser();
      if (!u) {
        try {
          const fetched = await AuthenticationService.getCurrentUserInfoApiV1AuthMeGet();
          if (canceled) return;
          const resolved = resolveUser(fetched);
          if (resolved) {
            saveCurrentUser(resolved);
            u = resolved;
          }
        } catch {
          if (canceled) return;
          router.replace("/login");
          return;
        }
      }

      const role = typeof u?.role === "string" ? u.role.toLowerCase() : "";
      if (role !== UserRole_Output.ADMIN) {
        router.replace("/login");
        return;
      }
      if (!canceled) setCurrentUser(u || null);
    };

    void ensureAdmin();
    return () => {
      canceled = true;
    };
  }, [router]);

  const initials = useMemo(() => {
    const first = currentUser?.prenom?.trim() || "";
    const last = currentUser?.nom?.trim() || "";
    const letters = `${first} ${last}`.trim();
    if (!letters) return "A";
    return letters
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() || "")
      .slice(0, 2)
      .join("");
  }, [currentUser?.prenom, currentUser?.nom]);

  const displayName = useMemo(() => {
    const first = currentUser?.prenom?.trim() || "";
    const last = currentUser?.nom?.trim() || "";
    const name = `${first} ${last}`.trim();
    return name || "Admin";
  }, [currentUser?.prenom, currentUser?.nom]);

  const displayRole = useMemo(() => {
    const role = typeof currentUser?.role === "string" ? currentUser.role.toLowerCase() : "";
    if (role === "admin") return t("role_admin");
    if (role === "user") return t("role_user");
    return role || "Admin";
  }, [currentUser?.role, t]);

  const avatarUrl = useMemo(() => {
    const raw = currentUser?.avatar?.trim() ?? "";
    if (!raw) return null;
    if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/") || raw.startsWith("data:image/")) return raw;
    return null;
  }, [currentUser?.avatar]);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncCurrentUser = () => {
      setCurrentUser(getCurrentUser());
    };

    const handleCurrentUserUpdated = () => {
      syncCurrentUser();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === CURRENT_USER_KEY) {
        syncCurrentUser();
      }
    };

    window.addEventListener(CURRENT_USER_UPDATED_EVENT, handleCurrentUserUpdated);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(CURRENT_USER_UPDATED_EVENT, handleCurrentUserUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const nav: NavItem[] = useMemo(
    () => [
      { href: "/admin/dashboard", label: t("nav_dashboard"), icon: <IconDashboard /> },
      { href: "/admin/users", label: t("nav_users"), icon: <IconUsers /> },
      { href: "/admin/terrains", label: t("nav_terrains"), icon: <IconTerrains /> },
      { href: "/admin/parcels", label: t("nav_parcels"), icon: <IconParcels /> },
      { href: "/admin/sensors", label: t("nav_sensors"), icon: <IconSensors /> },
      { href: "/admin/profile", label: t("nav_profile"), icon: <IconProfile /> },
    ],
    [t]
  );

  const logout = async () => {
    try {
      await AuthenticationService.logoutApiV1AuthLogoutPost();
    } catch {
      // best-effort server logout
    } finally {
      clearAuthSession();
      router.push("/login");
    }
  };

  const Sidebar = (
    <aside className="flex h-full w-[220px] flex-col bg-green-200 dark:bg-[#0b1220]">
      {/* brand */}
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="relative h-6 w-6 overflow-hidden rounded-full bg-white">
          <Image src="/images/logo.png" alt="logo" fill className="object-cover" />
        </div>
        <span className="text-sm font-semibold text-green-900 dark:text-gray-100">Smart Agro</span>
      </div>

      {/* admin card */}
      <div className="px-3 pt-2">
        <div className="rounded-md bg-green-100 px-3 py-3 dark:bg-[#0d1117]">
          <div className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-green-600 text-sm font-bold text-white">
            {avatarUrl && !avatarLoadFailed ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                fill
                sizes="32px"
                unoptimized
                className="object-cover"
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-green-950 dark:text-gray-100">
              {displayName}
            </p>
            <p className="truncate text-[11px] text-green-900/70 dark:text-gray-400">{displayRole}</p>
          </div>
          </div>
        </div>
      </div>

      {/* nav */}
      <nav className="flex-1 px-3 py-3">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-semibold",
                active
                  ? "bg-white text-green-900 dark:bg-[#0d1117] dark:text-gray-100"
                  : "text-green-950/80 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-[#0f172a]",
              ].join(" ")}
            >
              <span className="text-green-900/80 dark:text-gray-200">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-15">
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-md bg-white/70 px-3 py-2 text-left text-xs font-semibold text-green-900 hover:bg-white
                     dark:bg-[#0d1117] dark:text-gray-100 dark:hover:bg-[#0f172a]"
        >
          <span className="text-green-900/80 dark:text-gray-200">
            <IconLogout />
          </span>
          <span>{t("logout")}</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-[#dff7df] dark:bg-[#0d1117] dark:text-gray-100">
      <div className="flex min-h-[100dvh] w-full">
        {/* Desktop sidebar */}
        <div className="hidden md:block">{Sidebar}</div>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            />
            <div className="relative h-full w-[260px] shadow-xl">
              <div className="flex items-center justify-end bg-green-200 px-2 py-2">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded bg-white/70 px-2 py-1 text-xs font-semibold text-green-900"
                >
                  ✕
                </button>
              </div>
              {Sidebar}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Topbar */}
          <header className="sticky top-0 z-10 flex items-center gap-2 border-b bg-white px-3 py-2
                 dark:border-gray-800 dark:bg-[#0d1117]">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white"
            >
              ☰
            </button>

            <div className="ml-auto flex w-full max-w-[520px] items-center gap-2">
              <form className="ml-auto flex w-full max-w-[520px] items-center gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("global_search_placeholder")}
                  className="w-full min-w-0 rounded-sm border border-gray-200 bg-white px-2 py-1 text-sm text-gray-900 outline-none
                            placeholder:text-gray-400 focus:border-green-500
                            dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
                />

                {query ? (
                  <button
                    type="button"
                    onClick={clear}
                    className="shrink-0 rounded-sm border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50
                              dark:border-gray-700 dark:text-gray-100 dark:hover:bg-[#161b22]"
                  >
                    {t("clear")}
                  </button>
                ) : null}

                <button
                  type="button"
                  className="shrink-0 rounded-sm bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                  onClick={() => {}}
                >
                  {t("search")}
                </button>
              </form>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                className="rounded-sm border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700
                          dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                aria-label={t("language")}
              >
                <option value="en">🇬🇧 EN</option>
                <option value="fr">🇫🇷 FR</option>
              </select>
              
              {/* Bouton thème avec icônes */}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1.5 rounded-sm border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50
                          dark:border-gray-700 dark:text-gray-100 dark:hover:bg-[#161b22]"
                suppressHydrationWarning
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <IconSun /> : <IconMoon />}
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="min-h-[calc(100dvh-72px)] bg-[#eef8ee] px-3 py-3 text-gray-900 dark:bg-[#0d1117] dark:text-gray-100 sm:px-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
