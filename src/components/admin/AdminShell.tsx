"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { clearUser, getUser } from "@/lib/mockSession";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAdminSearch } from "@/components/admin/AdminSearchProvider";



type NavItem = { href: string; label: string };

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { query, setQuery, clear } = useAdminSearch();
  const { theme, toggleTheme } = useTheme();

  

  // protect admin area
  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== "ADMIN") router.replace("/login");
  }, [router]);

  const nav: NavItem[] = useMemo(
    () => [
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/users", label: "Utilisateurs" },
      { href: "/admin/parcels", label: "Parcelles" },
      { href: "/admin/sensors", label: "Capteurs" },
    ],
    []
  );

  const logout = () => {
    clearUser();
    router.push("/login");
  };

  const Sidebar = (
    <aside className="h-full w-[220px] bg-green-200">
      {/* brand */}
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="relative h-6 w-6 overflow-hidden rounded-full bg-white">
          <Image src="/images/logo.png" alt="logo" fill className="object-cover" />
        </div>
        <span className="text-sm font-semibold text-green-900">Smart Agro</span>
      </div>

      {/* admin card */}
      <div className="px-3 pt-2">
        <div className="rounded-md bg-green-100 px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
              A
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-green-950">
                Admin principale
              </p>
              <p className="truncate text-[11px] text-green-900/70">admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* nav */}
      <nav className="px-3 py-3">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "block w-full rounded-md px-3 py-2 text-left text-xs font-semibold",
                active
                  ? "bg-white text-green-900"
                  : "text-green-950/80 hover:bg-white/70",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}

        <div className="mt-4">
          <button
            onClick={logout}
            className="w-full rounded-md bg-white/70 px-3 py-2 text-left text-xs font-semibold text-green-900 hover:bg-white"
          >
            Déconnexion
          </button>
        </div>
      </nav>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#dff7df] dark:bg-red-600">
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
                <form
                  className="ml-auto flex w-full max-w-[520px] items-center gap-2"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full min-w-0 rounded-sm border border-gray-200 bg-white px-2 py-1 text-sm outline-none focus:border-green-500
                              dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
                  />

                  {query ? (
                    <button
                      type="button"
                      onClick={clear}
                      className="shrink-0 rounded-sm border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50
                                dark:border-gray-700 dark:text-gray-200 dark:hover:bg-[#161b22]"
                    >
                      Clear
                    </button>
                  ) : null}

                  <button
                    type="button"
                    className="shrink-0 rounded-sm bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                    onClick={() => {
                      // optional: keep it for UX (“search button”), but search is live anyway
                    }}
                  >
                    Search
                  </button>
                </form>


              </div>
            </header>

            {/* Page content */}
            {/* <main className="px-3 py-3 sm:px-4">{children}</main> */}
            <main className="px-3 py-3 sm:px-4 text-gray-900 dark:text-gray-100">
              {children}
            </main>

          </div>
        </div>
    </div>
  );
}
