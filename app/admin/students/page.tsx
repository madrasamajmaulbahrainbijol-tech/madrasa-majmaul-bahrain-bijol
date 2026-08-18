"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiArrowRight, FiBookOpen, FiPhone, FiRefreshCw, FiSearch, FiUser } from "react-icons/fi";
import { supabase } from "../../lib/supabase/client";

type Student = {
  id: string;
  student_id: string | null;
  student_name: string | null;
  guardian_name: string | null;
  mobile: string | null;
  course: string | null;
  status: string | null;
  date_of_birth: string | null;
  created_at: string | null;
  approved_at?: string | null;
};

const formatDate = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const initials = (name: string | null) => {
  if (!name) return "ST";
  const words = name.trim().split(/\s+/);
  return words.length === 1 ? words[0].slice(0, 2).toUpperCase() : `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const loadStudents = async () => {
    setError("");
    try {
      const { data, error: loadError } = await supabase
        .from("admissions")
        .select("id,student_id,student_name,guardian_name,mobile,course,status,date_of_birth,created_at,approved_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (loadError) throw loadError;
      setStudents((data || []) as Student[]);
    } catch (err: any) {
      setError(err?.message || "Unable to load students.");
      setStudents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadStudents(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((student) => [student.student_id, student.student_name, student.guardian_name, student.mobile, student.course].some((value) => String(value || "").toLowerCase().includes(q)));
  }, [students, search]);

  return (
    <main className="min-h-screen bg-[#f4f7f5] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div><p className="text-[10px] font-black uppercase tracking-[0.28em] text-green-700">Madrasa Majmaul Bahrain Bijol</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">Students</h1><p className="mt-1 hidden text-sm text-slate-500 sm:block">Approved student records and complete profiles.</p></div>
          <div className="flex items-center gap-2"><button onClick={() => { setRefreshing(true); loadStudents(); }} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><FiRefreshCw className={refreshing ? "animate-spin" : ""} /><span className="hidden sm:inline">Refresh</span></button><Link href="/admin/dashboard" className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-black text-white hover:bg-green-800">Dashboard</Link></div>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="overflow-hidden rounded-[30px] bg-gradient-to-br from-[#063b20] via-[#08743a] to-[#0ba24e] p-7 text-white shadow-[0_25px_70px_-30px_rgba(0,80,40,.55)] sm:p-9">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><p className="text-xs font-black uppercase tracking-[0.3em] text-green-100">Student Management</p><h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Approved Students</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-green-50 sm:text-base">Student ID par click karke complete professional profile, attendance, results, fees, documents aur ID card manage karein.</p></div><div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4"><p className="text-xs font-bold text-green-100">TOTAL STUDENTS</p><p className="mt-1 text-3xl font-black">{loading ? "…" : students.length}</p></div></div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="relative"><FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search by Student ID, name, guardian, mobile or course..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100"/></div></div>

        {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700"><p className="font-black">Unable to load students</p><p className="mt-1 text-sm">{error}</p></div>}
        {loading && <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-14 text-center shadow-sm"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-green-700"/><p className="mt-4 font-bold text-slate-600">Loading approved students...</p></div>}

        {!loading && filtered.length === 0 && !error && <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center"><FiUser className="mx-auto text-5xl text-slate-300"/><h3 className="mt-4 text-xl font-black">{search ? "No student found" : "No approved students yet"}</h3><p className="mt-2 text-sm text-slate-500">{search ? "Try another search." : "Approved admissions will appear here automatically."}</p></div>}

        {!loading && filtered.length > 0 && <div className="mt-5 grid gap-4 xl:grid-cols-2">{filtered.map((student, index) => <article key={student.id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"><div className="p-5 sm:p-6"><div className="flex gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-xl font-black text-green-700">{initials(student.student_name)}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-green-700">#{index + 1}</span><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">Approved</span></div><h3 className="mt-2 break-words text-xl font-black">{student.student_name || "Student"}</h3><p className="mt-1 font-mono text-xs font-bold text-green-700">{student.student_id || "Student ID pending"}</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><Info icon={<FiBookOpen/>} label="Course" value={student.course || "—"}/><Info icon={<FiUser/>} label="Guardian" value={student.guardian_name || "—"}/><Info icon={<FiPhone/>} label="Mobile" value={student.mobile || "—"}/></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><p className="text-xs text-slate-500">Approved: <span className="font-bold text-slate-700">{formatDate(student.approved_at || student.created_at)}</span></p><Link href={`/admin/students/${encodeURIComponent(student.student_id || student.id)}`} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white transition group-hover:bg-green-700">Open Full Profile <FiArrowRight/></Link></div></div></article>)}</div>}
      </section>
    </main>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-2xl bg-slate-50 p-3"><div className="flex items-center gap-2 text-slate-400">{icon}<span className="text-[10px] font-black uppercase tracking-wider">{label}</span></div><p className="mt-1 truncate text-sm font-bold text-slate-800">{value}</p></div>; }
