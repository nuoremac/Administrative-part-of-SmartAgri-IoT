"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace("/login");
    }, 2400); // ~6.4s splash

    return () => clearTimeout(t);
  }, [router]);

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
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900/25 via-transparent to-black/30" />
      </div>

      {/* Center logo + name (simple smooth animation) */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="relative mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full bg-white shadow-lg animate-[pop_700ms_ease-out]">
                <Image
                    src="/images/Agri-IOT(1).png"
                    alt="Smart Agro logo"
                    fill
                    priority
                    className="object-cover"
                />
          </div>

          <h1 className="text-2xl font-semibold tracking-wide text-green-400 animate-[fadeUp_800ms_ease-out]">
            Smart Agro
          </h1>

          <p className="mt-2 text-xl text-white/90 animate-[fadeUp_900ms_ease-out]">
            The soil speaks , We listen .
          </p>

          <div className="mx-auto mt-6 h-1 w-32 overflow-hidden rounded-full bg-white/25">
            <div className="h-full w-full bg-white/70 animate-[load_1400ms_linear]" />
          </div>
        </div>
      </div>

      {/* Tailwind keyframes via arbitrary animations */}
      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes load {
          from { transform: translateX(-100%); }
          to { transform: translateX(0%); }
        }
      `}</style>
    </main>
  );
}
