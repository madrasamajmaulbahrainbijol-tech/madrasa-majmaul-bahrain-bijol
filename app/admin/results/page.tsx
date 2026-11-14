"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCheck, FiChevronDown, FiDownload, FiPrinter, FiPlus, FiSave, FiSearch, FiToggleLeft, FiToggleRight, FiTrash2, FiX } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { downloadMarksheetPdf, marksheetPrintHtml, openMarksheetPrint } from "@/lib/marksheet-print";

type Student = {
  id: string; student_name: string; student_id: string | null; course: string | null;
  father_name?: string | null; guardian_name?: string | null; date_of_birth?: string | null; student_photo_url?: string | null; photoUrl?: string;
  application_number?: string | null; message?: string | null;
};
type Subject = { id: string; subject: string; full_marks: number; passing_marks: number; sort_order: number };
type Exam = { id: string; exam_name: string; exam_date: string | null; session: string | null; active: boolean; exam_subjects: Subject[] };
type Mark = { id: string; subject: string; max_marks: number; obtained_marks: number; grade: string | null; result_status: "Pass" | "Fail"; remarks: string | null };
type SavedResult = { id: string; admission_id: string; remarks: string | null; student_exam_marks: Mark[] };
type SubjectDraft = { subject: string; full_marks: string; passing_marks: string };

const blankSubject = (): SubjectDraft => ({ subject: "", full_marks: "100", passing_marks: "40" });
const fmtDate = (value: string | null) => value ? new Date(value + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function AdminResultsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"setup" | "marks">("setup");
  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [saved, setSaved] = useState<Record<string, SavedResult>>({});
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [examForm, setExamForm] = useState({ exam_name: "", exam_date: new Date().toISOString().slice(0, 10), session: String(new Date().getFullYear()) });
  const [subjects, setSubjects] = useState<SubjectDraft[]>([blankSubject(), blankSubject()]);

  const loadBase = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: studentRows, error: studentError } = await supabase
      .from("admissions")
      .select("id,student_name,student_id,course,father_name,guardian_name,date_of_birth,student_photo_url,application_number,message")
      .eq("status", "approved")
      .eq("account_status", "approved")
      .order("student_name");
    if (studentError) { setError(studentError.message); setLoading(false); return; }
    const { data: examRows, error: examError } = await supabase
      .from("exams")
      .select("id,exam_name,exam_date,session,active,exam_subjects(id,subject,full_marks,passing_marks,sort_order)")
      .order("created_at", { ascending: false });
    if (examError) { setError(examError.message); setLoading(false); return; }
    const rawStudents = (studentRows || []) as Student[];
    const studentsWithPhotos = await Promise.all(rawStudents.map(async (student) => {
      const photo = student.student_photo_url;
      if (!photo) return student;
      if (/^https?:\/\//i.test(photo)) return { ...student, photoUrl: photo };
      const { data: signed } = await supabase.storage.from("admission-documents").createSignedUrl(photo, 3600);
      return { ...student, photoUrl: signed?.signedUrl || "" };
    }));
    setStudents(studentsWithPhotos);
    const normalized = (examRows || []).map((e: any) => ({
      ...e,
      exam_subjects: [...(e.exam_subjects || [])].sort((a: Subject, b: Subject) => a.sort_order - b.sort_order),
    })) as Exam[];
    setExams(normalized);
    if (!selectedExamId && normalized.length) setSelectedExamId(normalized.find(e => e.active)?.id || normalized[0].id);
    setLoading(false);
  }, [selectedExamId]);

  useEffect(() => { void loadBase(); }, [loadBase]);

  const selectedExam = useMemo(() => exams.find(e => e.id === selectedExamId) || null, [exams, selectedExamId]);
  const filteredStudents = useMemo(() => students.filter(s =>
    (s.student_name + " " + (s.student_id || "") + " " + (s.course || "")).toLowerCase().includes(search.toLowerCase())
  ), [students, search]);

  const loadExamResults = useCallback(async (examId: string, exam: Exam, studentRows: Student[]) => {
    const { data, error: queryError } = await supabase
      .from("student_exams")
      .select("id,admission_id,remarks,student_exam_marks(id,subject,max_marks,obtained_marks,grade,result_status,remarks)")
      .eq("master_exam_id", examId);
    if (queryError) { setError(queryError.message); return; }
    const resultMap: Record<string, SavedResult> = {};
    const valueMap: Record<string, Record<string, string>> = {};
    for (const row of (data || []) as unknown as SavedResult[]) {
      resultMap[row.admission_id] = row;
      const bySubject: Record<string, string> = {};
      for (const subject of exam.exam_subjects) {
        const existing = row.student_exam_marks.find(m => m.subject.trim().toLowerCase() === subject.subject.trim().toLowerCase());
        if (existing) bySubject[subject.id] = String(existing.obtained_marks);
      }
      valueMap[row.admission_id] = bySubject;
    }
    for (const student of studentRows) if (!valueMap[student.id]) valueMap[student.id] = {};
    setSaved(resultMap);
    setValues(valueMap);
  }, []);

  useEffect(() => {
    if (!selectedExamId || !selectedExam || !students.length) return;
    let cancelled = false;
    (async () => {
      setError("");
      await loadExamResults(selectedExamId, selectedExam, students);
      if (cancelled) return;
      setSelectedStudents([]);
    })();
    return () => { cancelled = true; };
  }, [selectedExamId, selectedExam, students, loadExamResults]);

  const updateMark = (admissionId: string, subjectId: string, value: string) => {
    setValues(prev => ({ ...prev, [admissionId]: { ...(prev[admissionId] || {}), [subjectId]: value } }));
  };

  const createExam = async () => {
    setCreating(true); setError(""); setNotice("");
    try {
      const clean = subjects.map(s => ({
        subject: s.subject.trim(),
        full_marks: Number(s.full_marks),
        passing_marks: Number(s.passing_marks),
      }));
      if (!examForm.exam_name.trim()) throw new Error("Exam name is required.");
      if (!clean.length || clean.some(s => !s.subject)) throw new Error("Please enter every subject name.");
      if (clean.some(s => !Number.isFinite(s.full_marks) || s.full_marks <= 0 || !Number.isFinite(s.passing_marks) || s.passing_marks < 0 || s.passing_marks > s.full_marks)) throw new Error("Check full marks and passing marks for every subject.");
      if (new Set(clean.map(s => s.subject.toLowerCase())).size !== clean.length) throw new Error("Duplicate subject names are not allowed.");
      const { data, error: rpcError } = await supabase.rpc("create_exam_setup", {
        p_exam_name: examForm.exam_name.trim(),
        p_exam_date: examForm.exam_date || null,
        p_session: examForm.session.trim() || null,
        p_subjects: clean,
      });
      if (rpcError) throw rpcError;
      setNotice("Exam setup saved. Ab is exam ke liye sabhi students ke obtained marks enter kar sakte hain.");
      await loadBase();
      setSelectedExamId(String(data));
      setTab("marks");
      setSearch("");
      setExamForm({ exam_name: "", exam_date: new Date().toISOString().slice(0, 10), session: String(new Date().getFullYear()) });
      setSubjects([blankSubject(), blankSubject()]);
    } catch (e: any) {
      setError(e?.message || "Exam setup save nahi ho saka.");
    } finally { setCreating(false); }
  };

  const saveResults = async () => {
    if (!selectedExam) return;
    setSaving(true); setError(""); setNotice("");
    try {
      if (!students.length) throw new Error("No approved students found.");
      if (!selectedExam.exam_subjects.length) throw new Error("Selected exam has no subjects.");
      const results = students.map(student => ({
        admission_id: student.id,
        marks: selectedExam.exam_subjects.map(subject => {
          const raw = values[student.id]?.[subject.id] ?? "";
          if (raw.trim() === "") throw new Error("Obtained marks missing: " + student.student_name + " — " + subject.subject);
          const obtained = Number(raw);
          if (!Number.isFinite(obtained) || obtained < 0 || obtained > Number(subject.full_marks)) throw new Error(student.student_name + " — " + subject.subject + ": marks 0 se " + subject.full_marks + " ke beech hone chahiye.");
          return { subject_id: subject.id, obtained_marks: obtained };
        }),
      }));
      const { data, error: rpcError } = await supabase.rpc("save_exam_results", {
        p_master_exam_id: selectedExam.id,
        p_results: results,
      });
      if (rpcError) throw rpcError;
      await loadExamResults(selectedExam.id, selectedExam, students);
      setNotice("Result successfully saved for " + Number(data || students.length) + " students.");
    } catch (e: any) {
      setError(e?.message || "Results save nahi ho sake.");
    } finally { setSaving(false); }
  };

  const selectedResultPairs = selectedStudents.map(id => {
    const student = students.find(s => s.id === id);
    const result = saved[id];
    if (!student || !result || !selectedExam) return null;
    return { student, result };
  }).filter(Boolean) as { student: Student; result: SavedResult }[];

  const printSelected = async (download = false) => {
    if (!selectedExam || !selectedResultPairs.length) return;
    const html = selectedResultPairs.map(({ student, result }) => marksheetPrintHtml(
      student,
      { exam_name: selectedExam.exam_name, exam_date: selectedExam.exam_date, session: selectedExam.session, student_exam_marks: result.student_exam_marks },
      student.photoUrl || undefined,
    )).join("");
    const name = (selectedExam.exam_name.replace(/[^a-z0-9]+/gi, "_") || "Exam") + "_Marksheets";
    if (download) {
      try { await downloadMarksheetPdf(html, name + ".pdf"); }
      catch (e: any) { setError(e?.message || "PDF download failed."); }
    } else openMarksheetPrint(html, name);
  };

  const allFilteredSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudents.includes(s.id));
  const toggleAllFiltered = () => setSelectedStudents(allFilteredSelected
    ? selectedStudents.filter(id => !filteredStudents.some(s => s.id === id))
    : [...new Set([...selectedStudents, ...filteredStudents.map(s => s.id)])]);
  const enteredCount = selectedExam ? students.reduce((total, student) =>
    total + selectedExam.exam_subjects.filter(subject => (values[student.id]?.[subject.id] ?? "").trim() !== "").length, 0
  ) : 0;
  const totalInputs = students.length * (selectedExam?.exam_subjects.length || 0);

  const toggleExamActive = async (exam: Exam) => {
    const { error: updateError } = await supabase.from("exams").update({ active: !exam.active, updated_at: new Date().toISOString() }).eq("id", exam.id);
    if (updateError) setError(updateError.message);
    else { setExams(prev => prev.map(e => e.id === exam.id ? { ...e, active: !exam.active } : e)); setNotice(exam.active ? "Exam archived. Saved results remain safe." : "Exam activated."); }
  };

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#052f22] via-[#087345] to-[#14a66a] p-6 text-white shadow-2xl sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-[10px] font-black uppercase tracking-[.22em] text-emerald-200">Academic Management</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Exams & Results</h1><p className="mt-2 max-w-2xl text-sm text-emerald-50">Pehle exam aur subjects set karein. Phir exam select karke sabhi students ke obtained marks ek hi jagah enter karein.</p></div>
          <button onClick={() => router.push("/admin/dashboard")} className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-black text-white hover:bg-white/20"><FiArrowLeft/> Dashboard</button>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => setTab("setup")} className={"rounded-xl px-5 py-3 text-sm font-black transition " + (tab === "setup" ? "bg-white text-emerald-900 shadow-lg" : "bg-white/10 text-white hover:bg-white/20")}>01 • Exam Setup</button>
          <button onClick={() => setTab("marks")} className={"rounded-xl px-5 py-3 text-sm font-black transition " + (tab === "marks" ? "bg-white text-emerald-900 shadow-lg" : "bg-white/10 text-white hover:bg-white/20")}>02 • Enter Results</button>
        </div>
      </section>

      {notice && <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800"><FiCheck className="mt-0.5 shrink-0"/>{notice}</div>}
      {error && <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700"><FiX className="mt-0.5 shrink-0"/>{error}</div>}

      {tab === "setup" && <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <section className="admin-glass rounded-3xl p-5 sm:p-7">
          <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-emerald-700">Step 1</p><h2 className="mt-1 text-2xl font-black text-slate-900">Create New Examination</h2><p className="mt-1 text-sm text-slate-500">Exam name, date, subjects, full marks aur passing marks ek baar yahan set honge.</p></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-black text-slate-700">Exam Name *</span><input value={examForm.exam_name} onChange={e => setExamForm({ ...examForm, exam_name: e.target.value })} placeholder="e.g. Half Yearly Examination 2026" className="w-full rounded-xl border border-emerald-100 bg-white/90 px-4 py-3 font-semibold outline-none focus:border-emerald-500"/></label>
            <label><span className="mb-1.5 block text-xs font-black text-slate-700">Exam Date</span><input type="date" value={examForm.exam_date} onChange={e => setExamForm({ ...examForm, exam_date: e.target.value })} className="w-full rounded-xl border border-emerald-100 bg-white/90 px-4 py-3 font-semibold outline-none"/></label>
            <label><span className="mb-1.5 block text-xs font-black text-slate-700">Academic Session</span><input value={examForm.session} onChange={e => setExamForm({ ...examForm, session: e.target.value })} className="w-full rounded-xl border border-emerald-100 bg-white/90 px-4 py-3 font-semibold outline-none"/></label>
          </div>
          <div className="mt-7 flex items-center justify-between gap-3"><div><h3 className="font-black text-slate-900">Subjects & Marks Criteria</h3><p className="text-xs text-slate-500">Passing marks har subject ke liye separately save honge.</p></div><button onClick={() => setSubjects(prev => [...prev, blankSubject()])} className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800"><FiPlus/> Add Subject</button></div>
          <div className="mt-3 space-y-3">{subjects.map((subject, index) => <div key={index} className="grid gap-2 rounded-2xl border border-emerald-100 bg-white/75 p-3 sm:grid-cols-[1fr_125px_125px_38px] sm:items-end">
            <label><span className="mb-1 block text-[10px] font-black uppercase text-slate-500">Subject {index + 1}</span><input value={subject.subject} onChange={e => setSubjects(prev => prev.map((x, i) => i === index ? { ...x, subject: e.target.value } : x))} placeholder="Subject name" className="w-full rounded-lg border px-3 py-2.5 text-sm font-semibold outline-none focus:border-emerald-500"/></label>
            <label><span className="mb-1 block text-[10px] font-black uppercase text-slate-500">Full Marks</span><input type="number" min="1" value={subject.full_marks} onChange={e => setSubjects(prev => prev.map((x, i) => i === index ? { ...x, full_marks: e.target.value } : x))} className="w-full rounded-lg border px-3 py-2.5 text-sm font-semibold"/></label>
            <label><span className="mb-1 block text-[10px] font-black uppercase text-slate-500">Passing Marks</span><input type="number" min="0" value={subject.passing_marks} onChange={e => setSubjects(prev => prev.map((x, i) => i === index ? { ...x, passing_marks: e.target.value } : x))} className="w-full rounded-lg border px-3 py-2.5 text-sm font-semibold"/></label>
            <button disabled={subjects.length === 1} onClick={() => setSubjects(prev => prev.filter((_, i) => i !== index))} className="flex h-10 w-10 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-30" aria-label="Remove subject"><FiTrash2/></button>
          </div>)}</div>
          <button onClick={createExam} disabled={creating} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-600 px-5 py-3.5 font-black text-white shadow-lg disabled:opacity-50"><FiSave/>{creating ? "Creating Exam..." : "Create Examination"}</button>
        </section>
        <section className="admin-glass rounded-3xl p-5 sm:p-7">
          <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-emerald-700">Saved Exams</p><h2 className="mt-1 text-2xl font-black text-slate-900">Examination List</h2><p className="mt-1 text-sm text-slate-500">Archived exams and their saved results remain preserved.</p></div>
          {loading ? <p className="py-10 text-center text-sm font-bold text-slate-500">Loading exams...</p> : exams.length ? <div className="mt-5 space-y-3">{exams.map(exam => <div key={exam.id} className="rounded-2xl border border-emerald-100 bg-white/80 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-black text-slate-900">{exam.exam_name}</h3><p className="mt-1 text-xs text-slate-500">{fmtDate(exam.exam_date)} • {exam.session || "No session"} • {exam.exam_subjects.length} subjects</p><p className="mt-2 text-xs text-slate-600">{exam.exam_subjects.map(s => s.subject).join(" • ")}</p></div><span className={"rounded-full px-3 py-1 text-[10px] font-black " + (exam.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500")}>{exam.active ? "ACTIVE" : "ARCHIVED"}</span></div>
            <div className="mt-3 flex flex-wrap gap-2"><button onClick={() => { setSelectedExamId(exam.id); setTab("marks"); setSearch(""); }} disabled={!exam.active} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-black text-white disabled:opacity-40">Enter / Edit Results</button><button onClick={() => toggleExamActive(exam)} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black text-slate-700">{exam.active ? <FiToggleRight className="text-emerald-700"/> : <FiToggleLeft/>}{exam.active ? "Archive" : "Activate"}</button></div>
          </div>)}</div> : <div className="mt-5 rounded-2xl bg-white/70 p-8 text-center"><p className="text-3xl">📝</p><p className="mt-2 font-black text-slate-800">No exam created yet</p><p className="mt-1 text-xs text-slate-500">Create your first examination using the form.</p></div>}
        </section>
      </div>}

      {tab === "marks" && <section className="mt-6 space-y-5">
        <div className="admin-glass rounded-3xl p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-emerald-700">Step 2</p><h2 className="mt-1 text-2xl font-black text-slate-900">Enter Obtained Marks</h2><p className="mt-1 text-sm text-slate-500">Passing marks are applied automatically; yahan sirf obtained marks bharne hain.</p></div>
            <label className="w-full sm:w-[420px]"><span className="mb-1.5 block text-xs font-black text-slate-700">Select Examination *</span><div className="relative"><select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className="w-full appearance-none rounded-xl border border-emerald-100 bg-white px-4 py-3 pr-10 font-bold text-slate-900 outline-none focus:border-emerald-500"><option value="">Choose exam...</option>{exams.filter(e => e.active).map(e => <option key={e.id} value={e.id}>{e.exam_name} • {fmtDate(e.exam_date)} • {e.session || ""}</option>)}</select><FiChevronDown className="pointer-events-none absolute right-4 top-4 text-slate-500"/></div></label>
          </div>
          {selectedExam && <div className="mt-5 flex flex-wrap items-center gap-2">{selectedExam.exam_subjects.map(s => <span key={s.id} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900">{s.subject} <span className="text-emerald-700/70">(out of {s.full_marks})</span></span>)}</div>}
        </div>
        {selectedExam && <>
          <div className="grid gap-4 sm:grid-cols-3"><div className="admin-glass rounded-2xl p-4"><p className="text-xs font-bold text-slate-500">Students</p><p className="mt-1 text-2xl font-black text-slate-900">{students.length}</p></div><div className="admin-glass rounded-2xl p-4"><p className="text-xs font-bold text-slate-500">Marks Entered</p><p className="mt-1 text-2xl font-black text-emerald-700">{enteredCount} / {totalInputs}</p></div><div className="admin-glass rounded-2xl p-4"><p className="text-xs font-bold text-slate-500">Results Already Saved</p><p className="mt-1 text-2xl font-black text-indigo-700">{Object.keys(saved).length}</p></div></div>
          <div className="admin-glass overflow-hidden rounded-3xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100/70 p-4 sm:p-5"><div><h3 className="font-black text-slate-900">All Approved Students</h3><p className="mt-1 text-xs text-slate-500">Har student ke saamne har subject ka obtained marks enter karein. Existing saved marks edit ho sakte hain.</p></div><div className="flex w-full flex-wrap gap-2 sm:w-auto"><div className="relative min-w-0 flex-1 sm:w-64"><FiSearch className="absolute left-3 top-3 text-slate-400"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..." className="w-full rounded-xl border bg-white py-2.5 pl-9 pr-3 text-sm"/></div><button onClick={toggleAllFiltered} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800">{allFilteredSelected ? "Unselect Visible" : "Select Visible"}</button></div></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[1050px] border-collapse text-sm"><thead className="bg-emerald-950 text-white"><tr><th className="sticky left-0 bg-emerald-950 p-3 text-left">Select</th><th className="p-3 text-left">Student</th><th className="p-3 text-left">Student ID</th>{selectedExam.exam_subjects.map(s => <th key={s.id} className="min-w-[145px] p-3 text-center">{s.subject}<br/><span className="text-[10px] font-normal text-emerald-200">Full: {s.full_marks}</span></th>)}<th className="p-3">Status</th></tr></thead><tbody>{filteredStudents.map((student, index) => {const marks = values[student.id] || {};const complete = selectedExam.exam_subjects.every(s => (marks[s.id] ?? "").trim() !== "");return <tr key={student.id} className="border-t border-emerald-100/70 odd:bg-white/60 even:bg-emerald-50/50"><td className="sticky left-0 bg-inherit p-3"><input type="checkbox" checked={selectedStudents.includes(student.id)} onChange={() => setSelectedStudents(prev => prev.includes(student.id) ? prev.filter(id => id !== student.id) : [...prev, student.id])} className="h-4 w-4 accent-emerald-700"/></td><td className="p-3"><p className="font-black text-slate-900">{student.student_name}</p><p className="mt-0.5 text-[10px] text-slate-500">{student.course || "Course not specified"}</p></td><td className="p-3 font-bold text-emerald-800">{student.student_id || "—"}</td>{selectedExam.exam_subjects.map(subject => <td key={subject.id} className="p-2"><input type="number" min="0" max={subject.full_marks} step="0.01" inputMode="decimal" value={marks[subject.id] ?? ""} onChange={e => updateMark(student.id, subject.id, e.target.value)} placeholder="Obtained" className="w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-center font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"/></td>)}<td className="p-3 text-center"><span className={"rounded-full px-2.5 py-1 text-[10px] font-black " + (complete ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800")}>{complete ? (saved[student.id] ? "SAVED / READY" : "READY") : "PENDING"}</span></td></tr>})}</tbody></table></div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-100/70 bg-white/70 p-4 sm:p-5"><p className="text-xs font-semibold text-slate-500">All students and all subjects are required before saving. If absent from an exam, enter 0.</p><button onClick={saveResults} disabled={saving || !students.length || enteredCount !== totalInputs} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-600 px-6 py-3 font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-40"><FiSave/>{saving ? "Saving Results..." : "Save All Students' Results"}</button></div>
          </div>
          <div className="admin-glass flex flex-wrap items-center justify-between gap-3 rounded-3xl p-5"><div><h3 className="font-black text-slate-900">Generate Marksheets</h3><p className="mt-1 text-xs text-slate-500">Select students whose marksheets should be printed or downloaded.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => setSelectedStudents(selectedStudents.length === students.length ? [] : students.map(s => s.id))} className="rounded-xl border bg-white px-3 py-2 text-xs font-black">{selectedStudents.length === students.length ? "Unselect All" : "Select All"}</button><button disabled={!selectedResultPairs.length} onClick={() => void printSelected(false)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-black text-white disabled:opacity-40"><FiPrinter/> Print Marksheets</button><button disabled={!selectedResultPairs.length} onClick={() => void printSelected(true)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white disabled:opacity-40"><FiDownload/> Download PDF</button><button disabled={!saved || Object.keys(saved).length === 0} onClick={() => router.push("/admin/results/notice-board")} className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-black text-emerald-800 disabled:opacity-40">Result Notice Board</button></div></div>
          <div className="admin-glass rounded-2xl p-4 text-xs text-slate-600"><b>Note:</b> Passing marks are not shown in the marks-entry table. System applies each subject's pre-set passing marks automatically and calculates Pass/Fail, grade and percentage for the marksheet.</div>
        </>}
        {!selectedExam && <div className="admin-glass rounded-3xl p-12 text-center"><p className="text-4xl">📝</p><h3 className="mt-3 text-xl font-black text-slate-900">Select an examination</h3><p className="mt-2 text-sm text-slate-500">Exam Setup tab mein exam create karein, phir yahan select karke obtained marks enter karein.</p><button onClick={() => setTab("setup")} className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 font-black text-white">Go to Exam Setup</button></div>}
      </section>}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500"><span>Existing old marksheets and saved results are preserved.</span><button onClick={() => void loadBase()} className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-4 py-2 font-bold text-emerald-800">Refresh Exams & Students</button></div>
    </main>
  );
}
