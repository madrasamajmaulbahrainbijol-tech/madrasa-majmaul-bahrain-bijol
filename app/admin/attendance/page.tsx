"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type AttendanceRow = {
  id: string;
  attendance_date: string;
  status: string;
  remarks: string | null;
  admissions: { student_name?: string; student_id?: string; course?: string } | null;
};

function todayLocal() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
}

export default function AttendancePage() {
  const [date, setDate] = useState(todayLocal);
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    const { data, error: queryError } = await supabase
      .from("student_attendance")
      .select("id,attendance_date,status,remarks,admissions(student_name,student_id,course)")
      .eq("attendance_date", date)
      .order("created_at", { ascending: false });
    if (queryError) { setError(queryError.message); setRows([]); }
    else setRows((data || []) as unknown as AttendanceRow[]);
    setLoading(false);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const summary = useMemo(() => {
    const norm = (s: string) => s.toLowerCase();
    const present = rows.filter(x => ["present", "p", "late"].includes(norm(x.status || ""))).length;
    const absent = rows.filter(x => ["absent", "a"].includes(norm(x.status || ""))).length;
    return { present, absent, other: rows.length - present - absent };
  }, [rows]);

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="admin-glass rounded-3xl p-6 sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[.2em] text-emerald-700">Academic management</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-3xl font-black text-slate-900">Student Attendance</h1><p className="mt-2 text-sm text-slate-500">Date-wise attendance register and daily summary.</p></div>
          <label className="text-xs font-bold text-slate-600">Select date<input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block rounded-xl border border-emerald-100 bg-white/90 px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500"/></label>
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {[{label:"Present / Late",value:summary.present,color:"text-emerald-700",bg:"bg-emerald-50"},{label:"Absent",value:summary.absent,color:"text-rose-700",bg:"bg-rose-50"},{label:"Other / Leave",value:summary.other,color:"text-amber-700",bg:"bg-amber-50"}].map(x=><div key={x.label} className="admin-glass rounded-2xl p-5"><p className="text-xs font-bold text-slate-500">{x.label}</p><p className={"mt-2 text-3xl font-black "+x.color}>{x.value}</p></div>)}
      </div>
      <section className="admin-glass mt-5 overflow-hidden rounded-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100/70 px-5 py-4"><div><h2 className="font-extrabold text-slate-900">Attendance register</h2><p className="mt-1 text-xs text-slate-500">{rows.length} marked record(s) for {date}</p></div><button onClick={load} className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-900">Refresh</button></div>
        {error && <p className="m-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
        {loading ? <div className="p-10 text-center text-sm font-semibold text-slate-500">Loading attendance…</div> : rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-emerald-50/80 text-[10px] font-black uppercase tracking-wider text-emerald-900"><tr><th className="px-5 py-3">Student</th><th className="px-5 py-3">Student ID</th><th className="px-5 py-3">Course</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Remarks</th></tr></thead><tbody className="divide-y divide-emerald-50">{rows.map(row=><tr key={row.id} className="hover:bg-white/70"><td className="px-5 py-4 font-bold text-slate-800">{row.admissions?.student_name || "Student record unavailable"}</td><td className="px-5 py-4 text-slate-600">{row.admissions?.student_id || "—"}</td><td className="px-5 py-4 text-slate-600">{row.admissions?.course || "—"}</td><td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-800">{row.status}</span></td><td className="px-5 py-4 text-slate-500">{row.remarks || "—"}</td></tr>)}</tbody></table></div> : <div className="p-12 text-center"><div className="text-3xl">📋</div><p className="mt-3 font-bold text-slate-700">No attendance records for this date</p><p className="mt-1 text-xs text-slate-400">Attendance entries will appear here once they are recorded.</p></div>}
      </section>
    </main>
  );
}
