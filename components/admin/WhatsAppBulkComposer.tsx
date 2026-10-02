"use client";

import { useMemo, useState } from "react";
import { FiCheckCircle, FiChevronRight, FiMessageCircle, FiXCircle } from "react-icons/fi";

type Student = {
  id: string;
  student_name: string | null;
  guardian_name: string | null;
  mobile: string | null;
  course: string | null;
  whatsapp_opt_in: boolean;
};

type Props = {
  students: Student[];
  dueMap: Map<string, number>;
  onClose: () => void;
};

type MessageType = "fee" | "holiday" | "exam" | "general";

export default function WhatsAppBulkComposer({ students, dueMap, onClose }: Props) {
  const [audience, setAudience] = useState<"all" | "due" | "course" | "selected">("all");
  const [course, setCourse] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [type, setType] = useState<MessageType>("fee");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [resumeDate, setResumeDate] = useState("");
  const [reason, setReason] = useState("");
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);

  const courses = useMemo(
    () => Array.from(new Set(students.map((s) => s.course).filter(Boolean))).sort() as string[],
    [students]
  );

  const eligible = useMemo(
    () => students.filter((s) => !!s.mobile && s.whatsapp_opt_in),
    [students]
  );

  const recipients = useMemo(() => {
    const base =
      audience === "due"
        ? eligible.filter((s) => (dueMap.get(s.id) || 0) > 0)
        : audience === "course"
          ? eligible.filter((s) => !course || s.course === course)
          : audience === "selected"
            ? eligible.filter((s) => selected.has(s.id))
            : eligible;

    return base;
  }, [audience, eligible, course, selected, dueMap]);

  const current = recipients[index] || null;

  const messageFor = (student: Student) => {
    const guardian = student.guardian_name || "Parent/Guardian";
    const studentName = student.student_name || "Student";
    const due = Math.round(dueMap.get(student.id) || 0);

    if (type === "fee") {
      return `*Assalamu Alaikum ${guardian},*

This is a polite fee reminder from *Madrasa Majmaul Bahrain Bijol* regarding *${studentName}*.

*Outstanding Fee Balance: ₹${due.toLocaleString("en-IN")}*

Barah-e-karam fee ki adaigi jald se jald kar dein. Agar fee already jama kar di gayi hai, to please is message ko ignore karein.

JazakAllahu Khairan for your cooperation and support.

*Regards,*
Madrasa Majmaul Bahrain Bijol`;
    }

    if (type === "holiday") {
      return `*Assalamu Alaikum ${guardian},*

This is to inform you that *Madrasa Majmaul Bahrain Bijol* will remain closed from *${startDate || "—"}* to *${endDate || "—"}* due to *${reason || "madrasa holiday"}*.

Classes will resume on *${resumeDate || "—"}*, InshaAllah.

JazakAllahu Khairan.

*Regards,*
Madrasa Majmaul Bahrain Bijol`;
    }

    if (type === "exam") {
      return `*Assalamu Alaikum ${guardian},*

This is to inform you that *${examName || "the examination"}* for *${studentName}* will be held on *${examDate || "—"}* at *${examTime || "—"}*.

Please ensure that the student arrives on time and is properly prepared.

JazakAllahu Khairan.

*Regards,*
Madrasa Majmaul Bahrain Bijol`;
    }

    return `*Assalamu Alaikum ${guardian},*

*Important Notice from Madrasa Majmaul Bahrain Bijol*

${customMessage || "Please check the latest madrasa notice."}

JazakAllahu Khairan for your cooperation and support.

*Regards,*
Madrasa Majmaul Bahrain Bijol`;
  };

  const currentMessage = current ? messageFor(current) : "";

  const whatsappUrl = (student: Student) => {
    let digits = String(student.mobile || "").replace(/\\D/g, "");
    if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    const phone =
      digits.length === 10
        ? "91" + digits
        : digits.length === 12 && digits.startsWith("91")
          ? digits
          : "";
    return phone
      ? "https://api.whatsapp.com/send?phone=" + phone + "&text=" + encodeURIComponent(messageFor(student))
      : "";
  };

  function toggle(id: string) {
    setSelected((old) => {
      const next = new Set(old);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllEligible() {
    setSelected(new Set(eligible.map((s) => s.id)));
  }

  function start() {
    if (!recipients.length) return;
    setIndex(0);
    setStarted(true);
  }

  function openCurrent() {
    if (!current) return;
    const url = whatsappUrl(current);
    if (!url) return;
    window.location.assign(url);
  }

  function nextRecipient() {
    if (index >= recipients.length - 1) {
      setStarted(false);
      return;
    }
    setIndex((v) => v + 1);
  }

  if (started) {
    const done = index;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4">
        <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-green-700">Bulk WhatsApp</p>
              <h3 className="mt-1 text-xl font-black">Guardian {index + 1} of {recipients.length}</h3>
            </div>
            <button type="button" onClick={() => setStarted(false)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-black text-red-700 hover:bg-red-100">
              <FiXCircle /> Stop Sending
            </button>
          </div>
          <div className="space-y-5 p-5">
            <div className="rounded-2xl bg-green-50 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-green-700">Current Recipient</p>
              <p className="mt-1 text-xl font-black text-slate-900">{current?.student_name || "Student"}</p>
              <p className="text-sm text-slate-600">Guardian: {current?.guardian_name || "—"} · {current?.mobile || "—"}</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <FiCheckCircle className="text-green-600" /> {done} already opened
            </div>
            <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {currentMessage}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <button type="button" onClick={openCurrent} className="rounded-xl bg-green-700 px-5 py-3 text-sm font-black text-white hover:bg-green-800">
                Open WhatsApp
              </button>
              <button type="button" onClick={() => setStarted(false)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-700 hover:bg-red-100">
                <FiXCircle /> Stop
              </button>
              <button type="button" onClick={nextRecipient} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-black">
                {index >= recipients.length - 1 ? "Finish" : "Next Guardian"} <FiChevronRight />
              </button>
            </div>
            <p className="text-center text-xs leading-5 text-slate-500">
              WhatsApp will open with the message already filled. Press Send in WhatsApp, return here, then continue with Next Guardian.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-green-700">Manual Bulk WhatsApp</p>
            <h3 className="mt-1 text-2xl font-black">Send One Message to Many Guardians</h3>
            <p className="mt-1 text-sm text-slate-500">WhatsApp remains manual, but the recipient and message are prepared automatically.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500"><FiXCircle /></button>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-5">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">Recipients</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  ["all", "All opted-in"],
                  ["due", "Fee due"],
                  ["course", "Course-wise"],
                  ["selected", "Selected"],
                ].map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setAudience(value as typeof audience)} className={"rounded-xl border px-3 py-3 text-sm font-black " + (audience === value ? "border-green-600 bg-green-50 text-green-800" : "border-slate-200")}>{label}</button>
                ))}
              </div>
            </div>

            {audience === "course" && (
              <select value={course} onChange={(e) => setCourse(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold">
                <option value="">All courses</option>
                {courses.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}

            {audience === "selected" && (
              <div className="rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 p-3">
                  <p className="text-sm font-black">{selected.size} selected</p>
                  <button type="button" onClick={selectAllEligible} className="text-xs font-black text-green-700">Select all</button>
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
                  {eligible.map((s) => (
                    <label key={s.id} className="flex cursor-pointer items-center gap-3 p-3 text-sm">
                      <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} className="h-4 w-4 accent-green-700" />
                      <span><b>{s.student_name || "Student"}</b><span className="block text-xs text-slate-500">{s.guardian_name || "Guardian"} · {s.mobile}</span></span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">Ready Recipients</p>
              <p className="mt-1 text-3xl font-black text-slate-900">{recipients.length}</p>
              <p className="text-xs text-slate-500">Only guardians with a WhatsApp number and consent are included.</p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">Message Type</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  ["fee", "Fee Reminder"],
                  ["holiday", "Holiday Notice"],
                  ["exam", "Exam Notice"],
                  ["general", "General Notice"],
                ].map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setType(value as MessageType)} className={"rounded-xl border px-3 py-3 text-sm font-black " + (type === value ? "border-green-600 bg-green-50 text-green-800" : "border-slate-200")}>{label}</button>
                ))}
              </div>
            </div>

            {type === "holiday" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Start Date" className="rounded-xl border border-slate-200 px-4 py-3" />
                <input value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End Date" className="rounded-xl border border-slate-200 px-4 py-3" />
                <input value={resumeDate} onChange={(e) => setResumeDate(e.target.value)} placeholder="Resume Date" className="rounded-xl border border-slate-200 px-4 py-3" />
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="rounded-xl border border-slate-200 px-4 py-3" />
              </div>
            )}

            {type === "exam" && (
              <div className="grid gap-3 sm:grid-cols-3">
                <input value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="Exam Name" className="rounded-xl border border-slate-200 px-4 py-3" />
                <input value={examDate} onChange={(e) => setExamDate(e.target.value)} placeholder="Exam Date" className="rounded-xl border border-slate-200 px-4 py-3" />
                <input value={examTime} onChange={(e) => setExamTime(e.target.value)} placeholder="Time" className="rounded-xl border border-slate-200 px-4 py-3" />
              </div>
            )}

            {type === "general" && (
              <textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} rows={6} placeholder="Write your notice here..." className="w-full rounded-xl border border-slate-200 px-4 py-3" />
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-green-100 bg-green-50 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-green-700">Message Preview</p>
              <div className="mt-3 max-h-[430px] overflow-y-auto whitespace-pre-wrap rounded-2xl bg-white p-5 text-sm leading-7 text-slate-700 shadow-sm">
                {current ? currentMessage : "Select recipients to preview the personalized message."}
              </div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
              <b>Manual mode:</b> each guardian still requires pressing Send in WhatsApp. This is intentional until the official WhatsApp API is connected.
            </div>
            <button type="button" disabled={!recipients.length} onClick={start} className="w-full rounded-xl bg-green-700 px-5 py-3.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300">
              <FiMessageCircle className="mr-2 inline" /> Start Bulk Sending ({recipients.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
