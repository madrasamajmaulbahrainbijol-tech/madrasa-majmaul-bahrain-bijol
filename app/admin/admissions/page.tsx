"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Admission = {
  id: string;
  student_name: string;
  guardian_name: string;
  mobile: string;
  email: string | null;
  course: string | null;
  message: string | null;
  date_of_birth: string | null;
  status: "new" | "under_review" | "approved" | "rejected";
  created_at: string;
  application_number: string | null;
  student_id: string | null;
  auth_user_id: string | null;
  account_status: string | null;
  father_name: string | null;
  mother_name: string | null;
  guardian_relation: string | null;
  contact_number_2: string | null;
  alternate_mobile: string | null;
  address: string | null;
  full_address: string | null;
  village_city: string | null;
  post_office: string | null;
  district: string | null;
  state: string | null;
  pin_code: string | null;
  country: string | null;
  previous_education: string | null;
  occupation: string | null;
  gender: string | null;
  student_photo_url: string | null;
  student_document_type: string | null;
  student_document_url: string | null;
};

const statusLabel: Record<string, string> = { new: "New", under_review: "Under Review", approved: "Approved", rejected: "Rejected" };
const statusClass: Record<string, string> = { new: "bg-blue-50 text-blue-700", under_review: "bg-amber-50 text-amber-700", approved: "bg-emerald-50 text-emerald-700", rejected: "bg-red-50 text-red-700" };

function parseMessage(message: string | null) {
  const result: Record<string, string> = {};
  (message || "").split("\n").forEach((line) => {
    const index = line.indexOf(":");
    if (index > 0) result[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  });
  return result;
}

function Field({ label, value }: { label: string; value: unknown }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-[1.3px] text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-900">{String(value || "—")}</p></div>;
}

export default function AdminAdmissionsPage() {
  const [rows, setRows] = useState<Admission[]>([]);
  const [selected, setSelected] = useState<Admission | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [credentials, setCredentials] = useState<{ studentId: string; password: string } | null>(null);

  async function load() {
    setLoading(true); setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/admin"; return; }
      const { data, error: queryError } = await supabase.from("admissions").select("id,student_name,guardian_name,mobile,email,course,message,date_of_birth,status,created_at,application_number,student_id,auth_user_id,account_status,father_name,mother_name,guardian_relation,contact_number_2,alternate_mobile,address,full_address,village_city,post_office,district,state,pin_code,country,previous_education,occupation,gender,student_photo_url,student_document_type,student_document_url").order("created_at", { ascending: false });
      if (queryError) throw queryError;
      setRows((data || []) as Admission[]);
    } catch (e) { setError(e instanceof Error ? e.message : "Admissions load nahi ho pa rahi hain."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const text = [row.application_number, row.student_name, row.guardian_name, row.mobile, row.course].filter(Boolean).join(" ").toLowerCase();
      return (!q || text.includes(q)) && (status === "all" || row.status === status);
    });
  }, [rows, search, status]);

  async function setStatusForAdmission(admission: Admission, nextStatus: "new" | "under_review" | "rejected") {
    setBusy(true); setError(""); setSuccess(""); setCredentials(null);
    try {
      const { error: updateError } = await supabase.from("admissions").update({ status: nextStatus }).eq("id", admission.id);
      if (updateError) throw updateError;
      setRows((current) => current.map((row) => row.id === admission.id ? { ...row, status: nextStatus } : row));
      setSelected((current) => current?.id === admission.id ? { ...current, status: nextStatus } : current);
      setSuccess(`Application marked as ${statusLabel[nextStatus]}.`);
    } catch (e) { setError(e instanceof Error ? e.message : "Status update failed."); }
    finally { setBusy(false); }
  }

  async function approve(admission: Admission) {
    if (!window.confirm(`Approve admission for ${admission.student_name}? This will create the student's login account.`)) return;
    setBusy(true); setError(""); setSuccess(""); setCredentials(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("student-account-admin", { body: { action: "approve", admissionId: admission.id } });
      if (fnError || data?.error) throw new Error(data?.error || fnError?.message || "Account creation failed.");
      const updated = { ...admission, status: "approved" as const, student_id: data.studentId, auth_user_id: "created", account_status: "approved" };
      setRows((current) => current.map((row) => row.id === admission.id ? updated : row));
      setSelected(updated);
      setCredentials({ studentId: data.studentId, password: data.temporaryPassword });
      setSuccess("Admission approved and student account created successfully.");
    } catch (e) { setError(e instanceof Error ? e.message : "Student account creation failed."); }
    finally { setBusy(false); }
  }

  async function resetPassword(admission: Admission) {
    if (!window.confirm(`Issue a new temporary DOB password for ${admission.student_name}?`)) return;
    setBusy(true); setError(""); setSuccess(""); setCredentials(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("student-account-admin", { body: { action: "reset_password", admissionId: admission.id } });
      if (fnError || data?.error) throw new Error(data?.error || fnError?.message || "Password reset failed.");
      setCredentials({ studentId: data.studentId, password: data.temporaryPassword });
      setSuccess("Temporary password reset successfully. Give this password to the verified student/guardian.");
    } catch (e) { setError(e instanceof Error ? e.message : "Password reset failed."); }
    finally { setBusy(false); }
  }

  function printSelected() { window.print(); }

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-slate-900">
      <style jsx global>{`@media print { .admin-print-hidden{display:none!important} body{background:#fff!important} @page{size:A4;margin:10mm} }`}</style>
      <div className="admin-print-hidden mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="text-xs font-bold text-slate-500"><Link href="/admin/dashboard" className="hover:text-green-800">Dashboard</Link> / Admissions</div><h1 className="mt-2 text-3xl font-black">Admission Applications</h1><p className="mt-1 text-slate-500">Review applications and create secure student accounts after approval.</p></div><Link href="/admin/dashboard" className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white">Back to Dashboard</Link></div>
        {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">{error}</div>}
        {success && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-bold text-emerald-800">{success}</div>}
        {credentials && <div className="mt-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5"><p className="text-xs font-black uppercase tracking-[2px] text-emerald-700">Student Login Credentials</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-white p-4"><p className="text-xs font-bold text-slate-500">Student ID</p><p className="mt-1 text-xl font-black">{credentials.studentId}</p></div><div className="rounded-xl bg-white p-4"><p className="text-xs font-bold text-slate-500">Temporary Password (DOB)</p><p className="mt-1 text-xl font-black">{credentials.password}</p></div></div><p className="mt-3 text-sm text-emerald-900">Show or print these credentials for the verified student/guardian. The temporary password is not stored in the database.</p></div>}

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_220px]"><input value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-green-600" placeholder="Search application number, student, guardian or mobile..." /><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-green-600"><option value="all">All Status</option><option value="new">New</option><option value="under_review">Under Review</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[420px_1fr]">
          <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100"><div className="mb-3 flex items-center justify-between"><h2 className="font-black">Applications</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black">{filtered.length}</span></div>{loading ? <p className="p-6 text-center text-slate-500">Loading...</p> : filtered.length ? <div className="space-y-2">{filtered.map((row) => <button key={row.id} onClick={() => { setSelected(row); setCredentials(null); setError(""); }} className={`w-full rounded-2xl border p-4 text-left transition hover:border-green-400 ${selected?.id === row.id ? "border-green-600 bg-green-50" : "border-slate-200 bg-white"}`}><div className="flex items-start justify-between gap-3"><div><p className="font-black">{row.student_name}</p><p className="mt-1 text-xs text-slate-500">{row.application_number || "No application number"}</p><p className="mt-1 text-xs text-slate-500">{row.mobile}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${statusClass[row.status]}`}>{statusLabel[row.status]}</span></div></button>)}</div> : <p className="p-6 text-center text-slate-500">No applications found.</p>}</section>

          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-7">
            {selected ? <>
              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row"><div><p className="text-xs font-black uppercase tracking-[2px] text-green-700">Application Details</p><h2 className="mt-1 text-2xl font-black">{selected.student_name}</h2><p className="mt-1 text-sm text-slate-500">{selected.application_number || "—"}</p></div><div className="flex flex-wrap gap-2"><button onClick={printSelected} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-black">Print</button>{selected.status !== "approved" && <button disabled={busy} onClick={() => approve(selected)} className="rounded-xl bg-green-800 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">Approve & Create Login</button>}{selected.status !== "approved" && <button disabled={busy} onClick={() => setStatusForAdmission(selected, "under_review")} className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">Under Review</button>}{selected.status !== "rejected" && selected.status !== "approved" && <button disabled={busy} onClick={() => setStatusForAdmission(selected, "rejected")} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">Reject</button>}{selected.status === "approved" && <button disabled={busy} onClick={() => resetPassword(selected)} className="rounded-xl border border-green-700 px-4 py-2.5 text-sm font-black text-green-800 disabled:opacity-50">Reset Temporary Password</button>}</div></div>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3"><Field label="Application Number" value={selected.application_number} /><Field label="Student ID" value={selected.student_id} /><Field label="Date of Birth" value={selected.date_of_birth} /><Field label="Gender" value={selected.gender} /><Field label="Course" value={selected.course} /><Field label="Previous Education" value={selected.previous_education} /><Field label="Father's Name" value={selected.father_name || parseMessage(selected.message)["Father's Name"]} /><Field label="Mother's Name" value={selected.mother_name || parseMessage(selected.message)["Mother's Name"]} /><Field label="Guardian" value={selected.guardian_name} /><Field label="Relationship" value={selected.guardian_relation || parseMessage(selected.message)["Guardian Relationship"]} /><Field label="Primary Mobile" value={selected.mobile} /><Field label="Mobile 2" value={selected.contact_number_2 || selected.alternate_mobile} /><Field label="Occupation" value={selected.occupation} /><Field label="Address" value={selected.full_address || selected.address} /><Field label="Village / Town" value={selected.village_city} /><Field label="Post Office" value={selected.post_office} /><Field label="District" value={selected.district} /><Field label="State" value={selected.state} /><Field label="PIN" value={selected.pin_code} /><Field label="Country" value={selected.country} /></div>
              {selected.student_photo_url && <div className="mt-5 rounded-2xl border border-slate-200 p-4"><p className="text-xs font-black uppercase tracking-[1.5px] text-slate-500">Student Photo</p><img src={selected.student_photo_url} alt="Student" className="mt-3 h-52 w-40 rounded-xl object-cover" /></div>}
              {selected.student_document_url && <div className="mt-4"><a href={selected.student_document_url} target="_blank" rel="noreferrer" className="inline-flex rounded-xl border border-green-700 px-4 py-3 font-black text-green-800">View Identity Document</a></div>}
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Account rule:</strong> approval creates the Student ID and temporary DOB password automatically. The student must set a permanent password on first login. Permanent passwords are never displayed to administrators.</div>
            </> : <div className="flex min-h-[500px] items-center justify-center text-center text-slate-500"><div><p className="text-xl font-black text-slate-800">Select an application</p><p className="mt-2">Choose an application from the list to review its complete details.</p></div></div>}
          </section>
        </div>
      </div>
    </main>
  );
}
