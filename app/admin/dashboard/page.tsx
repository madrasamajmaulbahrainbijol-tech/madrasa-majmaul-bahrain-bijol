"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Notice = { id: string; title: string; notice_date: string | null; important: boolean };
type Stats = {
  email: string; students: number; pendingAdmissions: number; reviewedAdmissions: number;
  enquiries: number; teachers: number; staff: number; courses: number; toppers: number;
  notices: Notice[]; due: number; paid: number; monthCollection: number; studentsWithDue: number;
  present: number; absent: number; other: number; attendanceMarked: number;
};

const initial: Stats = {
  email: "", students: 0, pendingAdmissions: 0, reviewedAdmissions: 0, enquiries: 0,
  teachers: 0, staff: 0, courses: 0, toppers: 0, notices: [], due: 0, paid: 0, monthCollection: 0,
  studentsWithDue: 0, present: 0, absent: 0, other: 0, attendanceMarked: 0,
};

const money = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const localDate = () => {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
};

function Donut({ title, subtitle, segments, center, footer }: {
  title: string; subtitle: string; segments: { label: string; value: number; color: string }[];
  center: string; footer?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  let cursor = 0;
  const stops = segments.map((s) => {
    const start = total ? cursor / total * 100 : 0;
    cursor += s.value;
    const end = total ? cursor / total * 100 : 0;
    return s.color + " " + start + "% " + end + "%";
  });
  const gradient = total ? "conic-gradient(" + stops.join(",") + ")" : "conic-gradient(#e2e8f0 0% 100%)";
  return (
    <section className="admin-glass rounded-3xl p-5 sm:p-6">
      <div><h3 className="text-base font-extrabold text-slate-900">{title}</h3><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div>
      <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:justify-around">
        <div className="relative h-40 w-40 shrink-0 rounded-full" style={{ background: gradient }}>
          <div className="absolute inset-[17px] flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
            <span className="text-3xl font-black tracking-tight text-slate-900">{center}</span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{footer || "TOTAL"}</span>
          </div>
        </div>
        <div className="w-full space-y-3">
          {segments.map((s) => <div key={s.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-slate-600"><i className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />{s.label}</span>
            <b className="font-extrabold text-slate-900">{s.value.toLocaleString("en-IN")}</b>
          </div>)}
          {!total && <p className="text-xs text-slate-400">No records available yet.</p>}
        </div>
      </div>
    </section>
  );
}

function Metric({ icon, label, value, hint, color, onClick }: {
  icon: string; label: string; value: string; hint: string; color: string; onClick: () => void;
}) {
  return <button onClick={onClick} className="admin-glass group rounded-2xl p-4 text-left transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <span className={"flex h-11 w-11 items-center justify-center rounded-2xl text-xl " + color}>{icon}</span>
      <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-700">↗</span>
    </div>
    <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
    <p className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{value}</p>
    <p className="mt-1 text-[11px] font-medium text-slate-400">{hint}</p>
  </button>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>(initial);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/admin"); return; }
      const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
      if (adminError || isAdmin !== true) { await supabase.auth.signOut(); router.replace("/admin"); return; }

      const today = localDate();
      const monthStart = today.slice(0, 7) + "-01";
      const [
        pendingQ, reviewedQ, studentsQ, enquiriesQ, teachersQ, staffQ, coursesQ, toppersQ,
        feeQ, attendanceQ, noticesQ,
      ] = await Promise.all([
        supabase.from("admissions").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("admissions").select("id", { count: "exact", head: true }).in("status", ["under_review", "rejected"]),
        supabase.from("admissions").select("id", { count: "exact", head: true }).eq("status", "approved").eq("account_status", "approved"),
        supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("teachers").select("id", { count: "exact", head: true }).eq("active", true),
        supabase.from("staff_profiles").select("id", { count: "exact", head: true }).eq("active", true),
        supabase.from("courses").select("id", { count: "exact", head: true }).eq("active", true),
        supabase.from("toppers").select("id", { count: "exact", head: true }).eq("active", true),
        supabase.from("student_fee_ledger").select("admission_id,amount_due,amount_paid,fee_status,payment_date"),
        supabase.from("student_attendance").select("status").eq("attendance_date", today),
        supabase.from("notices").select("id,title,notice_date,important").eq("published", true).order("notice_date", { ascending: false }).limit(4),
      ]);

      if (cancelled) return;
      const feeRows = feeQ.data || [];
      let due = 0, paid = 0, monthCollection = 0;
      const dueStudents = new Set<string>();
      for (const row of feeRows) {
        if (row.fee_status === "holiday") continue;
        const rowDue = Math.max(0, Number(row.amount_due || 0) - Number(row.amount_paid || 0));
        due += rowDue;
        paid += Number(row.amount_paid || 0);
        if (rowDue > 0 && row.admission_id) dueStudents.add(row.admission_id);
        if (row.payment_date && String(row.payment_date).slice(0, 7) === today.slice(0, 7)) monthCollection += Number(row.amount_paid || 0);
      }
      const statuses = (attendanceQ.data || []).map((x) => String(x.status || "").toLowerCase());
      const present = statuses.filter((x) => ["present", "p", "late"].includes(x)).length;
      const absent = statuses.filter((x) => ["absent", "a"].includes(x)).length;
      const other = Math.max(0, statuses.length - present - absent);

      setStats({
        email: user.email || "", students: studentsQ.count || 0, pendingAdmissions: pendingQ.count || 0,
        reviewedAdmissions: reviewedQ.count || 0, enquiries: enquiriesQ.count || 0,
        teachers: teachersQ.count || 0, staff: staffQ.count || 0, courses: coursesQ.count || 0,
        toppers: toppersQ.count || 0, notices: noticesQ.data || [], due, paid,
        studentsWithDue: dueStudents.size, present, absent, other, attendanceMarked: statuses.length,
      });
      if (feeQ.error || attendanceQ.error) setLoadError("Kuch financial ya attendance records abhi load nahi ho sake. Baaki dashboard data available hai.");
      setLoading(false);
    }
    load().catch(() => { if (!cancelled) { setLoadError("Dashboard data load karne mein dikkat aayi. Page refresh karke dobara try karein."); setLoading(false); } });
    return () => { cancelled = true; };
  }, [router]);

  const attendanceTotal = stats.present + stats.absent + stats.other;
  const attendanceRate = attendanceTotal ? Math.round(stats.present / attendanceTotal * 100) : 0;
  const feeTotal = stats.paid + stats.due;
  const paidPercent = feeTotal ? Math.round(stats.paid / feeTotal * 100) : 0;
  const dateLabel = useMemo(() => new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date()), []);

  if (loading) return <div className="flex min-h-[70vh] items-center justify-center"><div className="text-center"><div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700"/><p className="mt-4 text-sm font-bold text-slate-500">Preparing madrasa overview…</p></div></div>;

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#06452f] via-[#08734a] to-[#159568] p-6 text-white shadow-xl shadow-emerald-950/10 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full border-[34px] border-white/10"/>
        <div className="pointer-events-none absolute -bottom-28 right-1/3 h-64 w-64 rounded-full bg-emerald-300/10 blur-2xl"/>
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-100">Madrasa Majmaul Bahrain Bijol</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Madrasa Overview</h1>
            <p className="mt-2 max-w-2xl text-sm text-emerald-50/85">Assalamu Alaikum. Yahan se madrasa ke students, fees, staff aur daily activities ka overall haal dekhein.</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">Today</p>
            <p className="mt-1 text-sm font-extrabold">{dateLabel}</p>
            <p className="mt-1 truncate text-xs text-emerald-100">{stats.email}</p>
          </div>
        </div>
      </div>

      {loadError && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">{loadError}</div>}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon="♙" label="Active Students" value={stats.students.toLocaleString("en-IN")} hint="Approved student accounts" color="bg-violet-100 text-violet-700" onClick={() => router.push("/admin/students")} />
        <Metric icon="₹" label="Outstanding Fees" value={money(stats.due)} hint={stats.studentsWithDue + " students with pending balance"} color="bg-amber-100 text-amber-700" onClick={() => router.push("/admin/fee-account")} />
        <Metric icon="♧" label="Active Staff" value={stats.staff.toLocaleString("en-IN")} hint={stats.teachers + " active teacher profiles"} color="bg-sky-100 text-sky-700" onClick={() => router.push("/admin/teachers")} />
        <Metric icon="◷" label="Today's Attendance" value={stats.attendanceMarked.toLocaleString("en-IN")} hint={attendanceRate + "% present among marked records"} color="bg-emerald-100 text-emerald-700" onClick={() => router.push("/admin/students")} />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-2">
        <Donut title="Today's Attendance" subtitle="Live count from today's attendance entries" center={attendanceRate + "%"} footer="PRESENT" segments={[
          { label: "Present / Late", value: stats.present, color: "#0f9f6e" },
          { label: "Absent", value: stats.absent, color: "#ef6464" },
          { label: "Other / Leave", value: stats.other, color: "#e8b85d" },
        ]} />
        <Donut title="Fee Collection Overview" subtitle="All non-holiday fee ledger entries · paid versus remaining" center={paidPercent + "%"} footer="COLLECTED" segments={[
          { label: "Paid amount", value: Math.round(stats.paid), color: "#0f9f6e" },
          { label: "Outstanding", value: Math.round(stats.due), color: "#e8b85d" },
        ]} />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_.85fr]">
        <div className="admin-glass rounded-3xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-emerald-700">Daily operations</p><h2 className="mt-1 text-lg font-extrabold text-slate-900">Today at a glance</h2></div>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-800">Quick overview</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              {label:"New admissions",value:stats.pendingAdmissions,icon:"🎓",href:"/admin/admissions",note:"Awaiting review"},
              {label:"Reviewed / rejected",value:stats.reviewedAdmissions,icon:"🗂️",href:"/admin/students",note:"Application records"},
              {label:"New enquiries",value:stats.enquiries,icon:"✉️",href:"/admin/enquiries",note:"Need follow-up"},
              {label:"This month's fee collection",value:money(stats.monthCollection),icon:"💳",href:"/admin/fee-account",note:"Recorded payments"},
            ].map((x)=><button key={x.label} onClick={()=>router.push(x.href)} className="flex items-center gap-3 rounded-2xl border border-white bg-white/70 p-4 text-left transition hover:border-emerald-200 hover:bg-white hover:shadow-lg"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">{x.icon}</span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-slate-500">{x.label}</span><span className="mt-1 block text-xl font-black text-slate-900">{x.value}</span><span className="mt-0.5 block text-[10px] text-slate-400">{x.note}</span></span><span className="text-slate-300">↗</span></button>)}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[{label:"Active courses",value:stats.courses,href:"/admin/courses"},{label:"Toppers",value:stats.toppers,href:"/admin/toppers"},{label:"Recent notices",value:stats.notices.length,href:"/admin/notices"}].map(x=><button key={x.label} onClick={()=>router.push(x.href)} className="rounded-xl border border-emerald-100/80 bg-emerald-50/60 p-3 text-left hover:bg-emerald-50"><span className="block text-xs font-semibold text-emerald-800">{x.label}</span><span className="mt-1 block text-2xl font-black text-emerald-950">{x.value}</span></button>)}
          </div>
        </div>

        <div className="admin-glass rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-emerald-700">Updates</p><h2 className="mt-1 text-lg font-extrabold text-slate-900">Recent Notices</h2></div><button onClick={()=>router.push("/admin/notices")} className="text-xs font-extrabold text-emerald-700 hover:text-emerald-900">View all ↗</button></div>
          <div className="mt-4 space-y-3">
            {stats.notices.length ? stats.notices.map((n)=><button key={n.id} onClick={()=>router.push("/admin/notices")} className="flex w-full items-start gap-3 rounded-2xl border border-white bg-white/70 p-3 text-left hover:bg-white"><span className="mt-0.5 rounded-xl bg-amber-50 p-2 text-lg">📢</span><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-slate-800">{n.title}</span><span className="mt-1 block text-[11px] text-slate-400">{n.notice_date || "Date not set"}</span></span>{n.important && <span className="rounded-full bg-rose-50 px-2 py-1 text-[9px] font-black text-rose-600">IMPORTANT</span>}</button>) : <div className="rounded-2xl border border-dashed border-emerald-200 bg-white/50 p-6 text-center"><p className="text-2xl">📭</p><p className="mt-2 text-sm font-bold text-slate-600">No published notices</p><p className="mt-1 text-xs text-slate-400">New announcements will appear here.</p></div>}
          </div>
          <button onClick={()=>router.push("/admin/whatsapp")} className="mt-5 flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-600 px-4 py-3 text-left text-white shadow-lg shadow-emerald-900/10"><span><span className="block text-xs font-black">Guardian Communication</span><span className="mt-0.5 block text-[10px] text-emerald-100">Open WhatsApp messaging centre</span></span><span className="text-lg">→</span></button>
        </div>
      </section>
      <p className="mt-7 pb-3 text-center text-[10px] font-semibold tracking-wide text-slate-400">MMBB ADMINISTRATION · DATA SHOWN FROM LIVE MADRASA RECORDS</p>
    </main>
  );
}
