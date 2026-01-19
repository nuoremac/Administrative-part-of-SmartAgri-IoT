
"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockAdminLogin } from "@/lib/mockAuth";
import { saveUser } from "@/lib/mockSession";
import { useLang, type Lang } from "@/components/i18n/LangProvider";
import { useT } from "@/components/i18n/useT";

export default function LoginPage() {
  const router = useRouter();
  const { lang, setLang } = useLang();
  const { t } = useT();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ error + loading + info state
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const user = mockAdminLogin(email.trim(), password.trim());
      if (!user) {
        setError(t("invalidCredentials"));
        return;
      }
      saveUser(user);
      router.push("/admin/dashboard");
    } catch {
      setError(t("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotCode = () => {
    setError(null);
    setInfo(t("forgotCodeMessage"));
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/landing-bg.jpeg"
          alt="bg"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900/20 via-transparent to-black/30" />
      </div>

      {/* Language dropdown (top-right) */}
      <div className="absolute right-6 top-5 z-50 pointer-events-auto">
        <div className="flex items-center gap-2 rounded-md bg-white/20 px-3 py-2 text-white shadow backdrop-blur-sm">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="rounded bg-white px-2 py-1 text-sm text-black outline-none"
            aria-label="Select language"
          >
            <option value="en">🇬🇧 English</option>
            <option value="fr">🇫🇷 Français</option>
          </select>
        </div>
      </div>

      {/* Center card */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-lg bg-white/95 p-8 shadow-xl">
          {/* Logo */}
          <div className="mb-3 flex justify-center">
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
              <Image
                src="/images/logo.png"
                alt="Smart Agro logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-center text-xl font-semibold text-gray-900">
            {t("loginAdminTitle")}
          </h1>

          {/* ✅ Inline feedback messages */}
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
              {info}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                  setInfo(null);
                }}
                placeholder={t("emailPlaceholder")}
                className="w-full rounded-md border border-gray-600 px-3 py-2 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                required
              />
            </div>

            {/* Code sécurité + eye toggle */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t("password")}
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                    setInfo(null);
                  }}
                  placeholder={t("adminCodePlaceholder")}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 pr-10 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    // Eye OFF (slashed)
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                      <path d="M4 4l16 16" />
                      <path d="M10.5 10.5a3 3 0 0 0 4 4" />
                    </svg>
                  ) : (
                    // Eye ON
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Forgot code */}
              <button
                type="button"
                onClick={handleForgotCode}
                className="mt-2 text-xs font-semibold text-green-700 hover:underline"
              >
                {t("forgotCode")}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-md bg-green-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? t("signInLoading") : t("signIn")}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

