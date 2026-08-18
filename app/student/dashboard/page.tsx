"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

function Field({ label, value }: { label: string; value: unknown }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-[11px] font-black uppercase tracking-[1.5px] text-slate-500">{label}</p><p className="mt-1.5 break-words font-bold text-slate-900">{String(value || "—")}</p></div>;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [admission, setAdmission] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = "/login"; return; }

        const { data: acc, error: accError } = await supabase.from("student_accounts").select("id,admission_id,student_id,account_status,password_created,approved_at,last_login_at").eq("auth_user_id", user.id).maybeSingle();
        if (accError) throw accError;
        if (!acc || acc.account_status !== "approved") { await supabase.auth.signOut(); window.location.href = "/login"; return; }
        if (!acc.password_created || user.user_metadata?.must_change_password) { window.location.href = "/login"; return; }
        setAccount(acc);

        const [admissionResult, attendanceResult, examResult, feeResult] = await Promise.all([
          supabase.from("admissions").select("id,application_number,student_name,date_of_birth,gender,father_name,mother_name,guardian_name,guardian_relation,mobile,contact_number_2,alternate_mobile,email,course,previous_education,occupation,address,full_address,village_city,city,post_office,district,state,pin_code,country,student_photo_url,student_document_type,student_document_url,certificate_type,certificate_url,student_id,status,approved_at,created_at").eq("id", acc.admission_id).single(),
          supabase.from("student_attendance").select("attendance_date,status,remarks").eq("admission_id", acc.admission_id).order("attendance_date", { ascending: false }),
          supabase.from("student_exams").select("id,exam_type,exam_name,exam_date,session,remarks").eq("admission_id", acc.admission_id).order("exam_date", { ascending: false }),
          supabase.from("student_fee_ledger").select("fee_month,amount_due,amount_paid,payment_date,payment_method,receipt_number,remarks").eq("admission_id", acc.admission_id).order("fee_month", { ascending: false }),
        ]);
        if (admissionResult.error) throw admissionResult.error;
        if (attendanceResult.error) throw attendanceResult.error;
        if (examResult.error) throw examResult.error;
        if (feeResult.error) throw feeResult.error;
        setAdmission(admissionResult.data);
        setAttendance(attendanceResult.data || []);
        setExams(examResult.data || []);
        setFees(feeResult.data || []);

        if (examResult.data?.length) {
          const examIds = examResult.data.map((item: any) => item.id);
          const { data: markData, error: markError } = await supabase.from("student_exam_marks").select("exam_id,subject,max_marks,obtained_marks,grade,result_status,remarks").in("exam_id", examIds);
          if (markError) throw markError;
          setMarks(markData || []);
        }
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Student profile load nahi ho saka.");
      } finally { setLoading(false); }
    }
    load();
  }, []);

  const attendanceSummary = useMemo(() => {
    const present = attendance.filter((x) => x.status === "present").length;
    const absent = attendance.filter((x) => x.status === "absent").length;
    const leave = attendance.filter((x) => x.status === "leave").length;
    const total = attendance.length;
    return { present, absent, leave, total, percentage: total ? Math.round((present / total) * 100) : 0 };
  }, [attendance]);

  async function logout() { await supabase.auth.signOut(); window.location.href = "/login"; }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-slate-50"><div className="rounded-2xl bg-white px-8 py-6 text-center shadow-xl"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-800" /><p className="mt-4 font-bold text-slate-700">Loading your secure student portal...</p></div></main>;
  if (error || !admission || !account) return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><div className="max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl"><h1 className="text-2xl font-black text-slate-900">Student Portal</h1><p className="mt-3 text-red-600">{error || "Student record not found."}</p><Link href="/login" className="mt-6 inline-flex rounded-xl bg-green-800 px-6 py-3 font-black text-white">Back to Login</Link></div></main>;

  return (
    <main className="min-h-screen bg-[#f4f7f6] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div><p className="text-xs font-black uppercase tracking-[2px] text-green-700">Madrasa Majmaul Bahrain Bijol</p><h1 className="mt-1 text-lg font-black sm:text-xl">Student Portal</h1></div>
          <div className="flex items-center gap-2"><button onClick={() => window.print()} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black hover:bg-slate-50">Print / Save</button><button onClick={logout} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-slate-800">Logout</button></div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-green-950 via-green-800 to-green-600 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div><p className="text-sm font-bold uppercase tracking-[3px] text-green-200">Official Student Record</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Welcome, {admission.student_name}</h2><p className="mt-3 text-green-100">Your profile is read-only. For any correction, please contact the Madrasa office.</p></div>
            {admission.student_photo_url ? <img src={admission.student_photo_url} alt="Student" className="h-28 w-28 rounded-2xl border-4 border-white/30 object-cover shadow-lg" /> : null}
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-200">Student ID</p><p className="mt-1 text-lg font-black">{account.student_id}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-200">Application No.</p><p className="mt-1 text-lg font-black">{admission.application_number || "—"}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-200">Course</p><p className="mt-1 text-lg font-black">{admission.course || "—"}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-green-200">Admission Status</p><p className="mt-1 text-lg font-black">Active</p></div></div>
        </section>

        <section className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 print:hidden"><div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><p className="text-xs font-black uppercase tracking-[1.5px] text-slate-500">Attendance</p><p className="mt-2 text-3xl font-black text-green-800">{attendanceSummary.percentage}%</p><p className="mt-1 text-sm text-slate-500">{attendanceSummary.present} present / {attendanceSummary.total} total</p></div><div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><p className="text-xs font-black uppercase tracking-[1.5px] text-slate-500">Examinations</p><p className="mt-2 text-3xl font-black">{exams.length}</p><p className="mt-1 text-sm text-slate-500">Official exam records</p></div><div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><p className="text-xs font-black uppercase tracking-[1.5px] text-slate-500">Fee Records</p><p className="mt-2 text-3xl font-black">{fees.length}</p><p className="mt-1 text-sm text-slate-500">Ledger entries</p></div><div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><p className="text-xs font-black uppercase tracking-[1.5px] text-slate-500">Account</p><p className="mt-2 text-lg font-black text-green-800">Verified</p><p className="mt-1 text-sm text-slate-500">Read-only official profile</p></div></section>

        <section className="mt-7 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <div className="mb-6"><p className="text-xs font-black uppercase tracking-[2px] text-green-700">01</p><h2 className="mt-1 text-2xl font-black">Complete Student Profile</h2><p className="mt-1 text-sm text-slate-500">Information submitted and maintained by the Madrasa office.</p></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"><Field label="Student Name" value={admission.student_name} /><Field label="Student ID" value={account.student_id} /><Field label="Date of Birth" value={formatDate(admission.date_of_birth)} /><Field label="Gender" value={admission.gender} /><Field label="Father's Name" value={admission.father_name} /><Field label="Mother's Name" value={admission.mother_name} /><Field label="Guardian Name" value={admission.guardian_name} /><Field label="Guardian Relation" value={admission.guardian_relation} /><Field label="Primary Mobile" value={admission.mobile} /><Field label="Mobile Number 2" value={admission.contact_number_2 || admission.alternate_mobile} /><Field label="Email" value={admission.email} /><Field label="Previous Education" value={admission.previous_education} /><Field label="Course / Programme" value={admission.course} /><Field label="Parent Occupation" value={admission.occupation} /><Field label="Full Address" value={admission.full_address || admission.address} /><Field label="Village / Town" value={admission.village_city || admission.city} /><Field label="Post Office" value={admission.post_office} /><Field label="District" value={admission.district} /><Field label="State" value={admission.state} /><Field label="PIN Code" value={admission.pin_code} /><Field label="Country" value={admission.country} /><Field label="Admission Date" value={formatDate(admission.approved_at || admission.created_at)} /></div>
        </section>

        <section className="mt-7 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <div className="mb-6"><p className="text-xs font-black uppercase tracking-[2px] text-green-700">02</p><h2 className="mt-1 text-2xl font-black">Documents</h2></div>
          <div className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-slate-200 p-5"><p className="text-xs font-black uppercase tracking-[1.5px] text-slate-500">Student Photo</p>{admission.student_photo_url ? <img src={admission.student_photo_url} alt="Student" className="mt-4 h-64 w-full rounded-xl object-contain bg-slate-50" /> : <p className="mt-4 text-slate-500">No photo available.</p>}</div><div className="rounded-2xl border border-slate-200 p-5"><p className="text-xs font-black uppercase tracking-[1.5px] text-slate-500">Identity Document</p><p className="mt-2 font-black">{admission.student_document_type || admission.certificate_type || "Official document"}</p>{admission.student_document_url || admission.certificate_url ? <a href={admission.student_document_url || admission.certificate_url} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-xl bg-green-800 px-5 py-3 font-black text-white hover:bg-green-900">View / Download Document</a> : <p className="mt-4 text-slate-500">No document available.</p>}</div></div>
        </section>

        <section className="mt-7 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <div className="mb-6"><p className="text-xs font-black uppercase tracking-[2px] text-green-700">03</p><h2 className="mt-1 text-2xl font-black">Attendance</h2></div>
          {attendance.length ? <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead><tr className="border-b bg-slate-50"><th className="px-4 py-3 font-black">Date</th><th className="px-4 py-3 font-black">Status</th><th className="px-4 py-3 font-black">Remarks</th></tr></thead><tbody>{attendance.map((row, i) => <tr key={`${row.attendance_date}-${i}`} className="border-b"><td className="px-4 py-3 font-semibold">{formatDate(row.attendance_date)}</td><td className="px-4 py-3 font-black capitalize">{row.status}</td><td className="px-4 py-3 text-slate-600">{row.remarks || "—"}</td></tr>)}</tbody></table></div> : <p className="text-slate-500">No attendance records have been published yet.</p>}
        </section>

        <section className="mt-7 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <div className="mb-6"><p className="text-xs font-black uppercase tracking-[2px] text-green-700">04</p><h2 className="mt-1 text-2xl font-black">Examinations & Results</h2></div>
          {exams.length ? <div className="space-y-5">{exams.map((exam) => <div key={exam.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex flex-col justify-between gap-2 sm:flex-row"><div><h3 className="font-black text-slate-900">{exam.exam_name}</h3><p className="mt-1 text-sm text-slate-500">{exam.exam_type} • {formatDate(exam.exam_date)} {exam.session ? `• ${exam.session}` : ""}</p></div></div>{marks.filter((m) => m.exam_id === exam.id).length ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b bg-slate-50"><th className="px-3 py-2">Subject</th><th className="px-3 py-2">Max</th><th className="px-3 py-2">Obtained</th><th className="px-3 py-2">Grade</th><th className="px-3 py-2">Result</th></tr></thead><tbody>{marks.filter((m) => m.exam_id === exam.id).map((m, i) => <tr key={`${exam.id}-${i}`} className="border-b"><td className="px-3 py-2 font-bold">{m.subject}</td><td className="px-3 py-2">{m.max_marks}</td><td className="px-3 py-2 font-black">{m.obtained_marks}</td><td className="px-3 py-2">{m.grade || "—"}</td><td className="px-3 py-2 font-black">{m.result_status}</td></tr>)}</tbody></table></div> : <p className="mt-4 text-sm text-slate-500">Marks have not been published for this examination yet.</p>}</div>)}</div> : <p className="text-slate-500">No examination records have been published yet.</p>}
        </section>

        <section className="mt-7 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
          <div className="mb-6"><p className="text-xs font-black uppercase tracking-[2px] text-green-700">05</p><h2 className="mt-1 text-2xl font-black">Fee Record</h2></div>
          {fees.length ? <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead><tr className="border-b bg-slate-50"><th className="px-4 py-3">Month</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Paid</th><th className="px-4 py-3">Payment Date</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Receipt</th></tr></thead><tbody>{fees.map((row, i) => <tr key={`${row.fee_month}-${i}`} className="border-b"><td className="px-4 py-3 font-semibold">{formatDate(row.fee_month)}</td><td className="px-4 py-3">₹{row.amount_due ?? 0}</td><td className="px-4 py-3 font-black">₹{row.amount_paid ?? 0}</td><td className="px-4 py-3">{formatDate(row.payment_date)}</td><td className="px-4 py-3">{row.payment_method || "—"}</td><td className="px-4 py-3">{row.receipt_number || "—"}</td></tr>)}</tbody></table></div> : <p className="text-slate-500">No fee records have been published yet.</p>}
        </section>

        <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center"><p className="font-black text-amber-900">Read-only student portal</p><p className="mt-2 text-sm leading-6 text-amber-800">Students can view, download and print official information. Personal details cannot be edited online. For corrections or password assistance, please contact the Madrasa office.</p></div>
        <p className="mt-6 pb-8 text-center text-xs text-slate-500">Official Student Record • Madrasa Majmaul Bahrain Bijol</p>
      </div>
      <style jsx global>{`@media print { body { background:#fff !important; } @page { size:A4; margin:10mm; } .print\:hidden { display:none !important; } }`}</style>
    </main>
  );
}
