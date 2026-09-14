"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const CONTROL_PATH = "/system-control";
const FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/system-control`;

export default function SystemLockGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (pathname === CONTROL_PATH || pathname.startsWith(`${CONTROL_PATH}/`)) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    const check = async () => {
      try {
        const response = await fetch(FUNCTION_URL, { cache: "no-store" });
        const data = await response.json();
        if (!cancelled) setActive(data.active !== false);
      } catch {
        if (!cancelled) setActive(true);
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    check();
    const timer = window.setInterval(check, 30000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [pathname]);

  if (pathname === CONTROL_PATH || pathname.startsWith(`${CONTROL_PATH}/`)) return <>{children}</>;
  if (checking) return <>{children}</>;
  if (active) return <>{children}</>;

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/15 text-4xl">🔒</div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">Madrasa Majmaul Bahrain Bijol</p>
        <h1 className="text-3xl font-bold sm:text-4xl">Website Temporarily Paused</h1>
        <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-slate-300">The website and admin panel are temporarily unavailable. Please check again later.</p>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-400">Service is paused by the system administrator.</div>
      </div>
    </main>
  );
}
