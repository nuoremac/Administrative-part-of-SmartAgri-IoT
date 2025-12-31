"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLang, type Lang } from "@/components/i18n/LangProvider";
import { useT } from "@/components/i18n/useT";


type Role = "admin" | "farmer";


export default function RoleSelection() {
  const router = useRouter();
  const { lang, setLang } = useLang();

  const { t } = useT();

  const goLogin = (role: Role) => {
    // Keep role in URL; lang is already managed by provider (URL + localStorage)
    router.push(`/login?role=${role}&lang=${lang}`);
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/landing-bg.jpeg"
          alt="Farm background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900/30 via-transparent to-black/35" />
      </div>

      {/* ✅ TOP-RIGHT LANGUAGE DROPDOWN */}
      <div className="absolute right-6 top-5 z-50 pointer-events-auto">
        <div className="flex items-center gap-2 rounded-md bg-white/15 px-3 py-2 text-white shadow backdrop-blur-sm">
          {/* <label className="text-sm font-medium">{t("languageLabel")}</label> */}

          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="rounded bg-white/20 px-2 py-1 text-sm outline-none"
            aria-label="Select language"
          >
            <option value="en">🇬🇧 English</option>
            <option value="fr">🇫🇷 Français</option>
          </select>
        </div>
      </div>

      {/* Center content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-xl text-center text-white">
          {/* Logo */}
          <div className="relative mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow overflow-hidden">
            <Image
              src="/images/Agri-IOT(1).png"   // ⬅️ your logo path
              alt="Smart Agro logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h1 className="mb-20 text-2xl font-semibold tracking-wide text-green-400">
            {t("Smart Agro")}
          </h1>

          {/* Buttons */}
          <div className="mx-auto flex max-w-md flex-col gap-8">
            <button
              onClick={() => goLogin("admin")}
              className="rounded-md bg-green-600/90 px-6 py-5 text-base font-semibold shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              {t("admin")}
            </button>

            <button
              onClick={() => goLogin("farmer")}
              className="rounded-md bg-green-600/90 px-6 py-5 text-base font-semibold shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              {t("farmer")}
            </button>
          </div>

          <p className="mt-40 text-xl font-semibold text-white/90">
            {t("tagline")}
          </p>
        </div>
      </div>
    </main>
  );
}
