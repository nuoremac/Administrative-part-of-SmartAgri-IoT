"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clearUser, getUser } from "@/lib/mockSession";
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

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { query, setQuery, clear } = useAdminSearch();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useLang();
  const { t } = useT();

  

  // protect admin area
  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "ADMIN") router.replace("/login");
  }, [router]);


  const nav: NavItem[] = useMemo(
    () => [
      { href: "/admin/dashboard", label: t("nav_dashboard"), icon: <IconDashboard /> },
      { href: "/admin/users", label: t("nav_users"), icon: <IconUsers /> },
      { href: "/admin/terrains", label: t("nav_terrains"), icon: <IconTerrains /> },
      { href: "/admin/parcels", label: t("nav_parcels"), icon: <IconParcels /> },
      { href: "/admin/sensors", label: t("nav_sensors"), icon: <IconSensors /> },
    ],
    [t]
  );

  const logout = () => {
    clearUser();
    router.push("/login");
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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
              A
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-green-950 dark:text-gray-100">
                {t("admin_primary")}
              </p>
              <p className="truncate text-[11px] text-green-900/70 dark:text-gray-400">admin</p>
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
    <div className="min-h-screen bg-[#dff7df] dark:bg-[#0d1117] dark:text-gray-100">
        {/* <div className="flex min-h-screen"> */}
        <div className="flex min-h-screen w-full">
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
                {/* <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full min-w-0 rounded-sm border border-gray-200 px-2 py-1 text-sm outline-none focus:border-green-500"
                />
                <button className="shrink-0 rounded-sm bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700">
                  Search
                </button> */}
                {/* <form
                  className="ml-auto flex w-full max-w-[520px] items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent("admin:search", { detail: query }));
                  }}
                >
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                    // className="w-full min-w-0 rounded-sm border border-gray-200 px-2 py-1 text-sm outline-none focus:border-green-500"
                  className="w-full min-w-0 rounded-sm border border-gray-200 bg-white px-2 py-1 text-sm text-gray-900 outline-none
                 placeholder:text-gray-400 focus:border-green-500
                 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"

                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-sm bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                  >
                    Search
                  </button>
                </form> */}
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
                                dark:border-gray-700 dark:text-gray-900 dark:hover:bg-[#161b22]"
                    >
                      {t("clear")}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    className="shrink-0 rounded-sm bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                    onClick={() => {
                      // optional: keep it for UX (“search button”), but search is live anyway
                    }}
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
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="rounded-sm border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50
                            dark:border-gray-700 dark:text-gray-100 dark:hover:bg-[#161b22]"
                  suppressHydrationWarning
                >
                  {theme === "dark" ? t("theme_light") : t("theme_dark")}
                </button>
              </div>
            </header>

            {/* Page content */}
            {/* <main className="px-3 py-3 sm:px-4">{children}</main> */}
            <main className="min-h-[calc(100vh-72px)] bg-[#eef8ee] px-3 py-3 text-gray-900 dark:bg-[#0d1117] dark:text-gray-100 sm:px-4">
              {children}
            </main>

          </div>
        </div>
    </div>
  );
}
