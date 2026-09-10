"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type FinancialYear = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  active: boolean;
};

const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function FinancialYearsPage() {
  const router = useRouter();
  const [years, setYears] = useState<FinancialYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("");
  const [stats, setStats] = useState<Record<string, { studentFees: number; salaryRows: number; feePaid: number; salaryPaid: number }>>({});

  async function load() {
    setLoading(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/admin"); return; }
    const { data: admin, error: adminError } = await supabase.from("admin_users").select("role").eq("user_id", user.id).maybeSingle();
    if (adminError || !admin) { router.replace("/admin/dashboard"); return; }
    setRole(admin.role || "admin");

    const [{ data: y, error: ye }, { data: fees, error: fe }, { data: salaries, error: se }] = await Promise.all([
      supabase.from("financial_years").select("id,name,start_date,end_date,is_current,active").order("start_date", { ascending: false }),
      supabase.from("student_fee_ledger").select("financial_year_id,amount_paid"),
      supabase.from("staff_salary_ledger").select("financial_year_id,amount_paid"),
    ]);
    if (ye || fe || se) { setError((ye || fe || se)?.message || "Financial data load failed."); setLoading(false); return; }

    const next: Record<string, { studentFees: number; salaryRows: number; feePaid: number; salaryPaid: number }> = {};
    (y || []).forEach((row: FinancialYear) => { next[row.id] = { studentFees: 0, salaryRows: 0, feePaid: 0, salaryPaid: 0 }; });
    (fees || []).forEach((row: any) => { if (!row.financial_year_id) return; next[row.financial_year_id] ||= { studentFees: 0, salaryRows: 0, feePaid: 0, salaryPaid: 0 }; next[row.financial_year_id].studentFees++; next[row.financial_year_id].feePaid += Number(row.amount_paid || 0); });
    (salaries || []).forEach((row: any) => { if (!row.financial_year_id) return; next[row.financial_year_id] ||= { studentFees: 0, salaryRows: 0, feePaid: 0, salaryPaid: 0 }; next[row.financial_year_id].salaryRows++; next[row.financial_year_id].salaryPaid += Number(row.amount_paid || 0); });
    setYears((y || []) as FinancialYear[]);
    setStats(next);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function makeCurrent(year: FinancialYear) {
    if (role !== "super_admin") { setError("Sirf Super Admin current financial year change kar sakta hai."); return; }
    if (!window.confirm(`${year.name} ko current financial year banana hai? Iske baad new fee/salary entries isi year ke hisaab se manage hongi.`)) return;
    setSaving(true); setError(""); setMessage("");
    const { error } = await supabase.rpc("set_current_financial_year", { p_year_id: year.id });
    setSaving(false);
    if (error) { setError(error.message); return; }
    setMessage(`${year.name} ab current financial year hai.`);
    await load();
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-slate-50"><div className="text-center"><div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-700" /><p className="mt-4 font-semibold text-slate-600">Loading financial years...</p></div></main>;

  const current = years.find(y => y.is_current);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-sm font-bold uppercase tracking-[3px] text-green-600">Finance Control</p><h1 className="mt-1 text-3xl font-extrabold text-slate-950">Financial Year Management</h1><p className="mt-1 max-w-3xl text-sm font-medium text-slate-600">Student fee aur staff salary ko year-wise alag rakha gaya hai. Purane saal ke records current year change karne par change nahi honge.</p></div>
          <button onClick={() => router.push("/admin/dashboard")} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-extrabold text-slate-800 shadow-sm hover:bg-slate-50">← Dashboard</button>
        </div>

        {message && <div className="mb-5 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">✓ {message}</div>}
        {error && <div className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">⚠ {error}</div>}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5"><p className="text-sm font-bold text-green-800">Current Year</p><p className="mt-2 text-3xl font-black text-green-700">{current?.name || "—"}</p><p className="mt-1 text-xs font-semibold text-green-700">New financial entries should belong here</p></div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5"><p className="text-sm font-bold text-blue-800">Student Fee History</p><p className="mt-2 text-3xl font-black text-blue-700">Year-wise</p><p className="mt-1 text-xs font-semibold text-blue-700">Old monthly fee amounts remain unchanged</p></div>
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5"><p className="text-sm font-bold text-indigo-800">Staff Salary History</p><p className="mt-2 text-3xl font-black text-indigo-700">Year-wise</p><p className="mt-1 text-xs font-semibold text-indigo-700">Salary changes preserve previous months</p></div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {years.map(year => {
            const s = stats[year.id] || { studentFees: 0, salaryRows: 0, feePaid: 0, salaryPaid: 0 };
            return <div key={year.id} className={`rounded-2xl border bg-white p-6 shadow-sm ${year.is_current ? "border-green-400 ring-2 ring-green-100" : "border-slate-200"}`}>
              <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h2 className="text-2xl font-black text-slate-950">{year.name}</h2>{year.is_current && <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">CURRENT</span>}</div><p className="mt-1 text-sm font-semibold text-slate-500">{year.start_date} → {year.end_date}</p></div>{!year.is_current && <button disabled={saving || role !== "super_admin"} onClick={() => makeCurrent(year)} className="rounded-xl bg-green-700 px-4 py-2 text-sm font-extrabold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-40">Make Current</button>}</div>
              <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">Student fee months</p><p className="mt-1 text-xl font-black text-slate-900">{s.studentFees}</p><p className="text-xs text-slate-400">Paid {money(s.feePaid)}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">Salary months</p><p className="mt-1 text-xl font-black text-slate-900">{s.salaryRows}</p><p className="text-xs text-slate-400">Paid {money(s.salaryPaid)}</p></div></div>
            </div>;
          })}
        </div>

        {role !== "super_admin" && <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">Current financial year change karna Super Admin ke control mein rakha gaya hai, taaki koi normal admin galti se poore system ka active year na badal de.</div>}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-black text-slate-900">How this works</h2><ul className="mt-3 space-y-2 text-sm font-medium text-slate-600"><li>• Student fee July 2025–March 2026 automatically 2025-26 mein rahegi.</li><li>• Student fee April 2026 onward automatically 2026-27 mein rahegi.</li><li>• Staff salary bhi salary month ke hisaab se financial year mein lock hoti hai.</li><li>• Salary/fee amount badalne par purane paid records overwrite nahi hote.</li><li>• Agle saal current year switch karne ke baad naye rates/entries naye year ke saath maintain kiye ja sakte hain.</li></ul></div>
      </div>
    </main>
  );
}
