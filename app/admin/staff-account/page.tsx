"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Teacher = {
  id: string;
  name: string;
  subject: string | null;
  image_url: string | null;
  active: boolean;
};

type Staff = {
  id: string;
  teacher_id: string | null;
  joining_date: string;
  active: boolean;
  last_working_date: string | null;
  notes: string | null;
  teacher?: Teacher | null;
};

type SalarySetting = {
  id: string;
  staff_id: string;
  monthly_salary: number;
  effective_from: string;
  active: boolean;
};

type SalaryLedger = {
  id: string;
  staff_id: string;
  salary_month: string;
  amount_due: number;
  amount_paid: number;
  payment_date: string | null;
  payment_method: string | null;
  receipt_number: string | null;
  remarks: string | null;
};

const today = () => new Date().toISOString().slice(0, 10);
const monthStart = (value: string) => value ? `${value.slice(0, 7)}-01` : "";
const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const dateIN = (value: string | null | undefined) => value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN") : "—";
const monthName = (value: string) => value ? new Date(`${value.slice(0, 7)}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—";

export default function StaffAccountPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [settings, setSettings] = useState<SalarySetting[]>([]);
  const [ledger, setLedger] = useState<SalaryLedger[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showPayment, setShowPayment] = useState<SalaryLedger | null>(null);
  const [collectionMonth, setCollectionMonth] = useState(today().slice(0, 7));
  const [showCollection, setShowCollection] = useState(false);
  const [setupTeacher, setSetupTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState({ joining_date: today(), salary: "", effective_from: today(), notes: "", active: true, last_working_date: "" });
  const [paymentForm, setPaymentForm] = useState({ amount: "", payment_date: today(), payment_method: "Cash", receipt_number: "", remarks: "" });

  async function loadAll() {
    setLoading(true);
    setError("");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { router.replace("/admin"); return; }
    const { data: admin, error: adminError } = await supabase.rpc("is_admin");
    if (adminError || admin !== true) { await supabase.auth.signOut(); router.replace("/admin"); return; }

    const [{ data: teacherRows, error: teacherError }, { data: staffRows, error: staffError }, { data: settingRows, error: settingError }, { data: ledgerRows, error: ledgerError }] = await Promise.all([
      supabase.from("teachers").select("id,name,subject,image_url,active").order("name"),
      supabase.from("staff_profiles").select("id,teacher_id,joining_date,active,last_working_date,notes"),
      supabase.from("staff_salary_settings").select("id,staff_id,monthly_salary,effective_from,active").order("effective_from", { ascending: false }),
      supabase.from("staff_salary_ledger").select("id,staff_id,salary_month,amount_due,amount_paid,payment_date,payment_method,receipt_number,remarks").order("salary_month", { ascending: false }),
    ]);
    const firstError = teacherError || staffError || settingError || ledgerError;
    if (firstError) { setError(firstError.message); setLoading(false); return; }

    setTeachers((teacherRows || []) as Teacher[]);
    setSettings((settingRows || []) as SalarySetting[]);
    setLedger((ledgerRows || []) as SalaryLedger[]);
    const teacherMap = new Map((teacherRows || []).map((t: Teacher) => [t.id, t]));
    setStaff(((staffRows || []) as Staff[]).map(s => ({ ...s, teacher: s.teacher_id ? teacherMap.get(s.teacher_id) || null : null })));
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  async function ensureLedger(staffId: string) {
    const { error } = await supabase.rpc("ensure_staff_salary_ledger", { p_staff_id: staffId });
    if (error) throw new Error(error.message);
  }

  function latestSalary(staffId: string, atMonth?: string) {
    const target = atMonth || today();
    const rows = settings.filter(s => s.staff_id === staffId && s.effective_from <= target).sort((a, b) => b.effective_from.localeCompare(a.effective_from));
    return rows[0]?.monthly_salary ?? 0;
  }

  function staffLedger(staffId: string) {
    return ledger.filter(x => x.staff_id === staffId).sort((a, b) => b.salary_month.localeCompare(a.salary_month));
  }

  async function openSetup(teacher: Teacher) {
    const existing = staff.find(s => s.teacher_id === teacher.id);
    setSetupTeacher(teacher);
    if (existing) {
      setForm({ joining_date: existing.joining_date, salary: String(latestSalary(existing.id)), effective_from: today(), notes: existing.notes || "", active: existing.active, last_working_date: existing.last_working_date || "" });
      setSelectedStaffId(existing.id);
    } else {
      setForm({ joining_date: today(), salary: "", effective_from: today(), notes: "", active: true, last_working_date: "" });
      setSelectedStaffId(null);
    }
    setShowSetup(true);
  }

  async function saveStaffSetup() {
    if (!setupTeacher) return;
    const salary = Number(form.salary);
    if (!form.joining_date) { setError("Date of joining is required."); return; }
    if (!Number.isFinite(salary) || salary < 0) { setError("Valid monthly salary enter karein."); return; }
    if (form.effective_from < form.joining_date) { setError("Salary effective date joining date se pehle nahi ho sakti."); return; }
    if (form.last_working_date && form.last_working_date < form.joining_date) { setError("Last working date joining date se pehle nahi ho sakti."); return; }

    setSaving(true); setError(""); setMessage("");
    try {
      let staffId = selectedStaffId;
      if (staffId) {
        const { error } = await supabase.from("staff_profiles").update({ joining_date: form.joining_date, active: form.active, last_working_date: form.last_working_date || null, notes: form.notes.trim() || null, updated_at: new Date().toISOString() }).eq("id", staffId);
        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await supabase.from("staff_profiles").insert({ teacher_id: setupTeacher.id, joining_date: form.joining_date, active: form.active, last_working_date: form.last_working_date || null, notes: form.notes.trim() || null }).select("id").single();
        if (error) throw new Error(error.message);
        staffId = data.id;
      }
      const { error: salaryError } = await supabase.from("staff_salary_settings").insert({ staff_id: staffId, monthly_salary: salary, effective_from: monthStart(form.effective_from), active: true });
      if (salaryError) throw new Error(salaryError.message);
      await ensureLedger(staffId!);
      setMessage(`${setupTeacher.name} ka staff account save ho gaya.`);
      setShowSetup(false);
      await loadAll();
    } catch (e: any) { setError(e?.message || "Something went wrong."); } finally { setSaving(false); }
  }

  async function openHistory(s: Staff) {
    setSelectedStaffId(s.id);
    setShowHistory(true);
    try { await ensureLedger(s.id); await loadAll(); } catch (e: any) { setError(e?.message || "Salary ledger load failed."); }
  }

  async function savePayment() {
    if (!showPayment) return;
    const amount = Number(paymentForm.amount);
    if (!Number.isFinite(amount) || amount < 0) { setError("Valid paid amount enter karein."); return; }
    if (amount > Number(showPayment.amount_due)) { setError("Paid amount due amount se zyada nahi ho sakta."); return; }
    setSaving(true); setError("");
    const { error } = await supabase.from("staff_salary_ledger").update({ amount_paid: amount, payment_date: amount > 0 ? paymentForm.payment_date : null, payment_method: amount > 0 ? paymentForm.payment_method : null, receipt_number: paymentForm.receipt_number.trim() || null, remarks: paymentForm.remarks.trim() || null, updated_at: new Date().toISOString() }).eq("id", showPayment.id);
    setSaving(false);
    if (error) { setError(error.message); return; }
    setMessage(`${monthName(showPayment.salary_month)} ki salary payment save ho gayi.`);
    setShowPayment(null); await loadAll();
  }

  async function clearPayment(row: SalaryLedger) {
    if (!window.confirm(`${monthName(row.salary_month)} ki payment clear karni hai? Monthly salary record rahega, sirf payment details clear hongi.`)) return;
    setSaving(true); setError("");
    const { error } = await supabase.from("staff_salary_ledger").update({ amount_paid: 0, payment_date: null, payment_method: null, receipt_number: null, remarks: null, updated_at: new Date().toISOString() }).eq("id", row.id);
    setSaving(false);
    if (error) { setError(error.message); return; }
    setMessage("Payment details clear ho gayi."); await loadAll();
  }

  const staffWithTeachers = useMemo(() => staff.filter(s => s.teacher), [staff]);
  const activeStaff = staffWithTeachers.filter(s => s.active);
  const totalDue = activeStaff.reduce((sum, s) => sum + staffLedger(s.id).reduce((x, r) => x + Math.max(0, Number(r.amount_due) - Number(r.amount_paid)), 0), 0);
  const totalPaidAll = staffWithTeachers.reduce((sum, s) => sum + staffLedger(s.id).reduce((x, r) => x + Number(r.amount_paid || 0), 0), 0);
  const monthRows = staffWithTeachers.flatMap(s => staffLedger(s.id).filter(r => r.salary_month.startsWith(collectionMonth)).map(r => ({ ...r, staff: s })));
  const monthPaid = monthRows.reduce((s, r) => s + Number(r.amount_paid || 0), 0);
  const monthDue = monthRows.reduce((s, r) => s + Math.max(0, Number(r.amount_due) - Number(r.amount_paid)), 0);
  const monthSalary = monthRows.reduce((s, r) => s + Number(r.amount_due || 0), 0);
  const selectedStaff = staff.find(s => s.id === selectedStaffId) || null;
  const selectedRows = selectedStaff ? staffLedger(selectedStaff.id) : [];
  const filteredTeachers = teachers.filter(t => { const q = search.toLowerCase().trim(); return !q || t.name.toLowerCase().includes(q) || (t.subject || "").toLowerCase().includes(q); });
  const setupExisting = setupTeacher ? staff.find(s => s.teacher_id === setupTeacher.id) : null;

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-slate-50"><div className="text-center"><div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-700" /><p className="mt-4 font-semibold text-slate-600">Loading staff accounts...</p></div></main>;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><p className="text-sm font-bold uppercase tracking-[3px] text-green-600">Payroll & Staff Accounts</p><h1 className="mt-1 text-3xl font-extrabold text-slate-950">Staff Account</h1><p className="mt-1 text-sm font-medium text-slate-600">Teachers list se staff accounts manage karein, joining date aur salary set karein aur monthly payment history maintain karein.</p></div>
          <button onClick={() => router.push("/admin/teachers")} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-extrabold text-slate-800 shadow-sm hover:bg-slate-50">← Teachers</button>
        </div>

        {message && <div className="mb-5 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">✓ {message}</div>}
        {error && <div className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">⚠ {error}</div>}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-500">Active Staff</p><p className="mt-2 text-3xl font-black text-slate-950">{activeStaff.length}</p><p className="mt-1 text-xs font-semibold text-slate-400">Configured payroll accounts</p></div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm"><p className="text-sm font-bold text-red-700">Total Salary Payable</p><p className="mt-2 text-3xl font-black text-red-700">{money(totalDue)}</p><p className="mt-1 text-xs font-semibold text-red-600">All unpaid/partial months</p></div>
          <button onClick={() => setShowCollection(true)} className="rounded-2xl border border-green-200 bg-green-50 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><p className="text-sm font-bold text-green-800">{monthName(collectionMonth)}</p><p className="mt-2 text-3xl font-black text-green-700">{money(monthPaid)}</p><p className="mt-1 text-xs font-semibold text-green-700">Paid this month · click for details</p></button>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm"><p className="text-sm font-bold text-blue-800">Total Paid</p><p className="mt-2 text-3xl font-black text-blue-700">{money(totalPaidAll)}</p><p className="mt-1 text-xs font-semibold text-blue-700">Recorded payroll payments</p></div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔎 Search staff by teacher name or subject..." className="w-full rounded-xl border-2 border-slate-300 px-4 py-3.5 text-base font-medium outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100" /></div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-[1050px] w-full"><thead className="bg-slate-100"><tr><th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-700">Staff</th><th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-700">Joining</th><th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-700">Current Salary</th><th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-700">Total Payable</th><th className="px-5 py-4 text-center text-xs font-extrabold uppercase tracking-wider text-slate-700">Status</th><th className="px-5 py-4 text-right text-xs font-extrabold uppercase tracking-wider text-slate-700">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">
          {filteredTeachers.map(t => { const s = staff.find(x => x.teacher_id === t.id); const rows = s ? staffLedger(s.id) : []; const due = rows.reduce((a, r) => a + Math.max(0, Number(r.amount_due) - Number(r.amount_paid)), 0); return <tr key={t.id} className="hover:bg-slate-50"><td className="px-5 py-4"><div className="font-extrabold text-slate-950">{t.name}</div><div className="text-sm font-medium text-slate-500">{t.subject || "Staff"}</div></td><td className="px-5 py-4 text-sm font-semibold text-slate-700">{s ? dateIN(s.joining_date) : "Not set"}</td><td className="px-5 py-4 text-sm font-extrabold text-slate-900">{s ? money(latestSalary(s.id)) : "—"}<div className="text-xs font-medium text-slate-400">per month</div></td><td className="px-5 py-4 text-sm font-black text-red-700">{s ? money(due) : "—"}</td><td className="px-5 py-4 text-center">{s ? <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${s.active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>{s.active ? "Active" : "Inactive"}</span> : <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800">Setup Needed</span>}</td><td className="px-5 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => openSetup(t)} className="rounded-lg bg-green-700 px-3 py-2 text-xs font-extrabold text-white hover:bg-green-800">{s ? "Edit Account" : "Set Account"}</button>{s && <button onClick={() => openHistory(s)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50">Salary History</button>}</div></td></tr>; })}
          {filteredTeachers.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center font-semibold text-slate-500">No staff found.</td></tr>}
        </tbody></table></div></div>

        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5"><h2 className="font-black text-green-900">How this payroll works</h2><div className="mt-3 grid gap-3 text-sm font-medium text-green-900 md:grid-cols-3"><div><b>1. Joining Date</b><br />Salary ledger joining wale month se automatically start hota hai.</div><div><b>2. Salary History</b><br />Salary badalne par new effective date ke saath naya salary rate save hota hai; purane months ka rate preserve rahta hai.</div><div><b>3. Monthly Payment</b><br />Har month due, paid aur remaining payable amount clearly record hota hai.</div></div></div>

        {showSetup && setupTeacher && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-green-600">Staff Payroll Setup</p><h2 className="mt-1 text-2xl font-black text-slate-950">{setupTeacher.name}</h2><p className="text-sm font-medium text-slate-500">{setupTeacher.subject || "Staff"}</p></div><button onClick={() => setShowSetup(false)} className="text-2xl font-bold text-slate-400">×</button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-slate-700">Date of Joining<input type="date" value={form.joining_date} onChange={e => setForm({ ...form, joining_date: e.target.value })} className="mt-2 w-full rounded-xl border-2 border-slate-300 px-3 py-3" /></label><label className="text-sm font-bold text-slate-700">Monthly Salary (₹)<input type="number" min="0" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="mt-2 w-full rounded-xl border-2 border-slate-300 px-3 py-3" placeholder="e.g. 12000" /></label><label className="text-sm font-bold text-slate-700">Salary Effective From<input type="date" value={form.effective_from} min={form.joining_date} onChange={e => setForm({ ...form, effective_from: e.target.value })} className="mt-2 w-full rounded-xl border-2 border-slate-300 px-3 py-3" /><span className="mt-1 block text-xs font-medium text-slate-500">Is date se monthly salary rate apply hoga.</span></label><label className="text-sm font-bold text-slate-700">Last Working Date (optional)<input type="date" value={form.last_working_date} min={form.joining_date} onChange={e => setForm({ ...form, last_working_date: e.target.value })} className="mt-2 w-full rounded-xl border-2 border-slate-300 px-3 py-3" /></label></div><label className="mt-4 flex items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="h-5 w-5" /> Active staff account</label><label className="mt-4 block text-sm font-bold text-slate-700">Notes<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="mt-2 w-full rounded-xl border-2 border-slate-300 px-3 py-3" placeholder="Optional payroll notes..." /></label>{setupExisting && <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm font-medium text-blue-900">Existing account: joining {dateIN(setupExisting.joining_date)} · current salary {money(latestSalary(setupExisting.id))}. Saving a new effective salary creates a new salary-history entry.</div>}<div className="mt-6 flex justify-end gap-3"><button onClick={() => setShowSetup(false)} className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700">Cancel</button><button disabled={saving} onClick={saveStaffSetup} className="rounded-xl bg-green-700 px-6 py-3 font-extrabold text-white disabled:opacity-50">{saving ? "Saving..." : "Save Staff Account"}</button></div></div></div>}

        {showHistory && selectedStaff && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"><div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="border-b border-slate-200 p-5"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-green-600">Monthly Salary Ledger</p><h2 className="text-2xl font-black text-slate-950">{selectedStaff.teacher?.name}</h2><p className="text-sm font-medium text-slate-500">Joining: {dateIN(selectedStaff.joining_date)} · Current salary: {money(latestSalary(selectedStaff.id))}</p></div><div className="flex gap-2"><button onClick={() => openSetup(selectedStaff.teacher!)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-extrabold">Edit Account</button><button onClick={() => setShowHistory(false)} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-extrabold text-white">Close</button></div></div></div><div className="max-h-[70vh] overflow-auto"><table className="min-w-[900px] w-full"><thead className="sticky top-0 bg-slate-100"><tr><th className="px-5 py-3 text-left text-xs font-extrabold">Month</th><th className="px-5 py-3 text-right text-xs font-extrabold">Salary Due</th><th className="px-5 py-3 text-right text-xs font-extrabold">Paid</th><th className="px-5 py-3 text-right text-xs font-extrabold">Remaining</th><th className="px-5 py-3 text-left text-xs font-extrabold">Payment</th><th className="px-5 py-3 text-right text-xs font-extrabold">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{selectedRows.map(r => { const rem = Math.max(0, Number(r.amount_due) - Number(r.amount_paid)); const status = Number(r.amount_paid) >= Number(r.amount_due) && Number(r.amount_due) > 0 ? "Paid" : Number(r.amount_paid) > 0 ? "Partial" : "Unpaid"; return <tr key={r.id}><td className="px-5 py-3 font-bold text-slate-900">{monthName(r.salary_month)}</td><td className="px-5 py-3 text-right font-bold">{money(Number(r.amount_due))}</td><td className="px-5 py-3 text-right font-bold text-green-700">{money(Number(r.amount_paid))}</td><td className="px-5 py-3 text-right font-black text-red-700">{money(rem)}</td><td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${status === "Paid" ? "bg-green-100 text-green-800" : status === "Partial" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>{status}</span>{r.payment_date && <div className="mt-1 text-xs font-medium text-slate-500">{dateIN(r.payment_date)} · {r.payment_method || "—"}</div>}</td><td className="px-5 py-3 text-right"><div className="flex justify-end gap-2">{rem > 0 || Number(r.amount_paid) > 0 ? <button onClick={() => { setShowPayment(r); setPaymentForm({ amount: String(r.amount_paid || 0), payment_date: r.payment_date || today(), payment_method: r.payment_method || "Cash", receipt_number: r.receipt_number || "", remarks: r.remarks || "" }); }} className="rounded-lg bg-green-700 px-3 py-2 text-xs font-extrabold text-white">{Number(r.amount_paid) > 0 ? "Edit Payment" : "Pay Salary"}</button> : null}{Number(r.amount_paid) > 0 && <button onClick={() => clearPayment(r)} className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700">Clear</button>}</div></td></tr>})}{selectedRows.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center font-semibold text-slate-500">No salary ledger generated yet.</td></tr>}</tbody></table></div></div></div>}

        {showPayment && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><p className="text-xs font-bold uppercase tracking-widest text-green-600">Salary Payment</p><h2 className="mt-1 text-2xl font-black text-slate-950">{monthName(showPayment.salary_month)}</h2><p className="mt-1 text-sm font-medium text-slate-500">Due: {money(Number(showPayment.amount_due))}</p><div className="mt-5 space-y-4"><label className="block text-sm font-bold text-slate-700">Amount Paid (₹)<input type="number" min="0" max={showPayment.amount_due} value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} className="mt-2 w-full rounded-xl border-2 border-slate-300 px-3 py-3" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-slate-700">Payment Date<input type="date" value={paymentForm.payment_date} onChange={e => setPaymentForm({ ...paymentForm, payment_date: e.target.value })} className="mt-2 w-full rounded-xl border-2 border-slate-300 px-3 py-3" /></label><label className="text-sm font-bold text-slate-700">Payment Method<select value={paymentForm.payment_method} onChange={e => setPaymentForm({ ...paymentForm, payment_method: e.target.value })} className="mt-2 w-full rounded-xl border-2 border-slate-300 px-3 py-3"><option>Cash</option><option>Bank Transfer</option><option>UPI</option><option>Cheque</option><option>Other</option></select></label></div><label className="block text-sm font-bold text-slate-700">Receipt Number (optional)<input value={paymentForm.receipt_number} onChange={e => setPaymentForm({ ...paymentForm, receipt_number: e.target.value })} className="mt-2 w-full rounded-xl border-2 border-slate-300 px-3 py-3" /></label><label className="block text-sm font-bold text-slate-700">Remarks<textarea value={paymentForm.remarks} onChange={e => setPaymentForm({ ...paymentForm, remarks: e.target.value })} rows={3} className="mt-2 w-full rounded-xl border-2 border-slate-300 px-3 py-3" /></label></div><div className="mt-6 flex justify-end gap-3"><button onClick={() => setShowPayment(null)} className="rounded-xl border border-slate-300 px-5 py-3 font-bold">Cancel</button><button disabled={saving} onClick={savePayment} className="rounded-xl bg-green-700 px-6 py-3 font-extrabold text-white">{saving ? "Saving..." : "Save Payment"}</button></div></div></div>}

        {showCollection && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"><div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="border-b border-slate-200 p-5"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-green-600">Monthly Payroll Summary</p><h2 className="text-2xl font-black text-slate-950">{monthName(collectionMonth)}</h2><p className="text-sm font-medium text-slate-500">Salary due {money(monthSalary)} · Paid {money(monthPaid)} · Remaining {money(monthDue)}</p></div><div className="flex items-center gap-2"><input type="month" value={collectionMonth} onChange={e => setCollectionMonth(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold" /><button onClick={() => setShowCollection(false)} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-extrabold text-white">Close</button></div></div></div><div className="max-h-[65vh] overflow-auto"><table className="min-w-[800px] w-full"><thead className="sticky top-0 bg-slate-100"><tr><th className="px-5 py-3 text-left text-xs font-extrabold">Staff</th><th className="px-5 py-3 text-right text-xs font-extrabold">Salary</th><th className="px-5 py-3 text-right text-xs font-extrabold">Paid</th><th className="px-5 py-3 text-right text-xs font-extrabold">Remaining</th><th className="px-5 py-3 text-left text-xs font-extrabold">Payment Date</th><th className="px-5 py-3 text-right text-xs font-extrabold">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{monthRows.map(r => { const rem = Math.max(0, Number(r.amount_due) - Number(r.amount_paid)); return <tr key={r.id}><td className="px-5 py-3 font-bold">{r.staff.teacher?.name}</td><td className="px-5 py-3 text-right font-bold">{money(Number(r.amount_due))}</td><td className="px-5 py-3 text-right font-bold text-green-700">{money(Number(r.amount_paid))}</td><td className="px-5 py-3 text-right font-black text-red-700">{money(rem)}</td><td className="px-5 py-3 text-sm font-medium">{dateIN(r.payment_date)}</td><td className="px-5 py-3 text-right">{Number(r.amount_paid) > 0 && <button onClick={() => clearPayment(r)} className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700">Clear Payment</button>}</td></tr>})}{monthRows.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center font-semibold text-slate-500">No salary records for this month.</td></tr>}</tbody></table></div></div></div>}
      </div>
    </main>
  );
}
