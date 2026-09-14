"use client";

import { FormEvent, useState } from "react";

type LockState = { is_active: boolean; resume_until: string | null };

export default function SystemControlPage() {
  const [code, setCode] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [state, setState] = useState<LockState | null>(null);
  const [resumeUntil, setResumeUntil] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadState(secret = code) {
    const res = await fetch("/api/system-control", { headers: { "x-system-code": secret }, cache: "no-store" });
    if (!res.ok) throw new Error("Unauthorized");
    const data = await res.json();
    setState(data);
    setResumeUntil(data.resume_until || "");
    setAuthorized(true);
  }

  async function unlock(e: FormEvent) {
    e.preventDefault(); setMessage(""); setLoading(true);
    try { await loadState(code); } catch { setMessage("Invalid control code."); } finally { setLoading(false); }
  }

  async function update(action: "pause" | "resume", until: string | null) {
    setLoading(true); setMessage("");
    try {
      const res = await fetch("/api/system-control", { method: "POST", headers: { "Content-Type": "application/json", "x-system-code": code }, body: JSON.stringify({ action, resume_until: until }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to update system status");
      setState(data); setResumeUntil(data.resume_until || "");
      setMessage(action === "resume" ? "Website and Admin Panel resumed successfully." : "Website and Admin Panel paused successfully.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update status."); } finally { setLoading(false); }
  }

  const effectiveActive = Boolean(state?.is_active) && (!state?.resume_until || new Date(`${state.resume_until}T23:59:59`) >= new Date());

  if (!authorized) return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <form onSubmit={unlock} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-2xl">🔐</div><h1 className="text-2xl font-bold text-slate-900">System Control</h1><p className="mt-2 text-sm text-slate-500">Private control panel</p></div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Control Code</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} type="password" autoFocus className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900" placeholder="Enter control code" />
        {message && <p className="mt-3 text-sm font-medium text-red-600">{message}</p>}
        <button disabled={loading || !code} className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-50">{loading ? "Checking..." : "Open Control Panel"}</button>
      </form>
    </main>
  );

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-900"><div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-2xl sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Madrasa Majmaul Bahrain Bijol</p><h1 className="mt-1 text-3xl font-black">System Lock Control</h1><p className="mt-1 text-sm text-slate-500">Controls the public website and admin panel together.</p></div><div className={`rounded-full px-4 py-2 text-sm font-bold ${effectiveActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{effectiveActive ? "● ACTIVE" : "● PAUSED"}</div></div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-3xl bg-white p-6 shadow-2xl"><h2 className="text-xl font-bold">Resume Until</h2><p className="mt-2 text-sm leading-6 text-slate-500">Choose the last date on which the website should remain active. After this date passes, the system automatically behaves as paused. No data is deleted.</p><input type="date" value={resumeUntil} onChange={(e) => setResumeUntil(e.target.value)} className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-900" /><button onClick={() => update("resume", resumeUntil || null)} disabled={loading || !resumeUntil} className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white disabled:opacity-50">▶ Resume Until Selected Date</button><button onClick={() => update("resume", null)} disabled={loading} className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-800 disabled:opacity-50">Resume Without Expiry</button></section>
        <section className="rounded-3xl bg-white p-6 shadow-2xl"><h2 className="text-xl font-bold">Emergency Control</h2><p className="mt-2 text-sm leading-6 text-slate-500">Pause both the website and admin panel immediately. Existing data remains completely safe.</p><button onClick={() => update("pause", null)} disabled={loading} className="mt-6 w-full rounded-xl bg-red-600 px-4 py-3 font-bold text-white disabled:opacity-50">⏸ Pause Everything</button><div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600"><div className="flex justify-between gap-4"><span>Website</span><b>{effectiveActive ? "Active" : "Paused"}</b></div><div className="mt-2 flex justify-between gap-4"><span>Admin Panel</span><b>{effectiveActive ? "Active" : "Paused"}</b></div><div className="mt-2 flex justify-between gap-4"><span>Data</span><b>Safe</b></div></div></section>
      </div>
      {state?.resume_until && <div className="mt-6 rounded-3xl bg-white p-5 text-center shadow-2xl"><span className="text-sm text-slate-500">Automatic pause date</span><div className="mt-1 text-2xl font-black">{state.resume_until}</div></div>}
      {message && <div className="mt-6 rounded-2xl bg-white p-4 text-center font-semibold shadow-xl">{message}</div>}
    </div></main>
  );
}
