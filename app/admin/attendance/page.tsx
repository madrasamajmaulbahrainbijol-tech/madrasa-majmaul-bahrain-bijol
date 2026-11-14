"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Student = { id: string; student_name: string; student_id: string | null; course: string | null };
type Attendance = { admission_id: string; status: "present" | "absent" | "leave"; remarks: string | null };

function localDate() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
}
function minHistoryDate() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
}

export default function AttendancePage() {
  const [date, setDate] = useState(localDate);
  const [minDate] = useState(minHistoryDate);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, Attendance>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError(""); setNotice("");
    const [studentResult, attendanceResult] = await Promise.all([
      supabase.from("admissions")
        .select("id,student_name,student_id,course")
        .eq("status", "approved")
        .eq("account_status", "approved")
        .order("student_name"),
      supabase.from("student_attendance")
        .select("admission_id,status,remarks")
        .eq("attendance_date", date),
    ]);
    if (studentResult.error) { setError(studentResult.error.message); setStudents([]); setAttendance({}); setLoading(false); return; }
    if (attendanceResult.error) { setError(attendanceResult.error.message); setStudents((studentResult.data || []) as Student[]); setAttendance({}); setLoading(false); return; }
    const map: Record<string, Attendance> = {};
    for (const row of (attendanceResult.data || []) as Attendance[]) map[row.admission_id] = row;
    setStudents((studentResult.data || []) as Student[]);
    setAttendance(map);
    setLoading(false);
  }, [date]);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => students.filter(s =>
    (s.student_name + " " + (s.student_id || "") + " " + (s.course || "")).toLowerCase().includes(search.toLowerCase())
  ), [students, search]);

  const summary = useMemo(() => {
    const values = students.map(s => attendance[s.id]?.status);
    const present = values.filter(v => v === "present").length;
    const absent = values.filter(v => v === "absent").length;
    const leave = values.filter(v => v === "leave").length;
    return { present, absent, leave, pending: values.filter(v => !v).length, total: students.length };
  }, [students, attendance]);

  async function saveStatus(student: Student, status: "present" | "absent" | "leave") {
    setSavingId(student.id); setError(""); setNotice("");
    const remarks = status === "absent" ? "Marked absent by admin" : "Attendance updated by admin";
    const { error: saveError } = await supabase.from("student_attendance").upsert({
      admission_id: student.id,
      attendance_date: date,
      status,
      remarks,
    }, { onConflict: "admission_id,attendance_date" });
    if (saveError) setError(student.student_name + ": " + saveError.message);
    else {
      setAttendance(prev => ({ ...prev, [student.id]: { admission_id: student.id, status, remarks } }));
      setNotice("Attendance saved for " + student.student_name + ".");
    }
    setSavingId("");
  }

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-600 p-6 text-white shadow-xl sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[.2em] text-emerald-200">Academic management</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div><h1 className="text-3xl font-black">Student Attendance</h1><p className="mt-2 max-w-2xl text-sm text-emerald-50">Roz subah 10:00 baje tak attendance mark karein. 10 baje ke baad jin students ki entry nahi hogi, woh automatically Absent save honge.</p></div>
          <label className="text-xs font-bold text-emerald-50">Select date<input type="date" min={minDate} max={localDate()} value={date} onChange={e => setDate(e.target.value)} className="mt-1 block rounded-xl border border-white/30 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-emerald-300"/></label>
        </div>
        <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white"><span className="h-2 w-2 rounded-full bg-lime-300"/> Automatic absent: 10:00 AM IST <span className="mx-1 text-emerald-200">•</span> Attendance history retention: 30 days</div>
      </div>

      {notice && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{notice}</p>}
      {error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total Students", value: summary.total, color: "text-slate-900", bg: "from-white to-slate-50" },
          { label: "Present", value: summary.present, color: "text-emerald-700", bg: "from-emerald-50 to-white" },
          { label: "Absent", value: summary.absent, color: "text-rose-700", bg: "from-rose-50 to-white" },
          { label: "Leave", value: summary.leave, color: "text-amber-700", bg: "from-amber-50 to-white" },
          { label: "Not Marked", value: summary.pending, color: "text-indigo-700", bg: "from-indigo-50 to-white" },
        ].map(x => <div key={x.label} className={"admin-glass rounded-2xl bg-gradient-to-br p-4 " + x.bg}><p className="text-xs font-bold text-slate-500">{x.label}</p><p className={"mt-2 text-3xl font-black " + x.color}>{x.value}</p></div>)}
      </div>

      <section className="admin-glass mt-5 overflow-hidden rounded-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100/70 px-5 py-4">
          <div><h2 className="font-extrabold text-slate-900">Daily Attendance Register</h2><p className="mt-1 text-xs text-slate-500">{students.length} approved students • {date}</p></div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..." className="min-w-0 flex-1 rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm sm:w-56"/>
            <button onClick={() => void load()} className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-900">Refresh</button>
          </div>
        </div>
        {loading ? <div className="p-10 text-center text-sm font-semibold text-slate-500">Loading attendance…</div> : filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-emerald-950 text-[10px] font-black uppercase tracking-wider text-white"><tr><th className="px-5 py-3">Student</th><th className="px-5 py-3">Student ID</th><th className="px-5 py-3">Course</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Record</th></tr></thead><tbody className="divide-y divide-emerald-50">{filtered.map(student => {
          const record = attendance[student.id];
          const busy = savingId === student.id;
          const statusClass = record?.status === "present" ? "bg-emerald-100 text-emerald-800" : record?.status === "absent" ? "bg-rose-100 text-rose-800" : record?.status === "leave" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500";
          return <tr key={student.id} className="hover:bg-white/80">
            <td className="px-5 py-4 font-bold text-slate-800">{student.student_name}</td>
            <td className="px-5 py-4 font-semibold text-emerald-800">{student.student_id || "—"}</td>
            <td className="px-5 py-4 text-slate-600">{student.course || "—"}</td>
            <td className="px-5 py-4"><select disabled={busy} value={record?.status || ""} onChange={e => { if (e.target.value) void saveStatus(student, e.target.value as "present" | "absent" | "leave"); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 disabled:opacity-50"><option value="">Not marked</option><option value="present">Present</option><option value="absent">Absent</option><option value="leave">Leave</option></select></td>
            <td className="px-5 py-4"><span className={"rounded-full px-3 py-1 text-[10px] font-black uppercase " + statusClass}>{busy ? "Saving..." : record ? (record.remarks?.includes("Automatically") ? "Auto saved" : "Saved") : "Pending"}</span></td>
          </tr>;
        })}</tbody></table></div> : <div className="p-12 text-center"><div className="text-3xl">📋</div><p className="mt-3 font-bold text-slate-700">No approved students found</p></div>}
      </section>
    </main>
  );
}
