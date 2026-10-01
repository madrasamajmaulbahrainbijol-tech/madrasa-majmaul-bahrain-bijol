"use client";

import { useMemo, useState } from "react";
import { FiSend, FiXCircle } from "react-icons/fi";

type Student = {
  id: string;
  student_name: string | null;
  guardian_name: string | null;
  mobile: string | null;
};

type Props = {
  student: Student;
  due: number;
  onClose: () => void;
};

type MessageType = "fee" | "payment" | "holiday" | "exam" | "general";

export default function WhatsAppComposer({ student, due, onClose }: Props) {
  const [type, setType] = useState<MessageType>("fee");
  const [amount, setAmount] = useState("");
  const [feeMonth, setFeeMonth] = useState("");
  const [receipt, setReceipt] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [resumeDate, setResumeDate] = useState("");
  const [reason, setReason] = useState("");
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  const guardian = student.guardian_name || "Parent/Guardian";
  const studentName = student.student_name || "Student";

  const message = useMemo(() => {
    if (type === "fee") {
      return `*Assalamu Alaikum ${guardian},*

This is a polite fee reminder from *Madrasa Majmaul Bahrain Bijol* regarding *${studentName}*.

*Outstanding Fee Balance: ₹${due.toLocaleString("en-IN")}*

Barah-e-karam fee ki adaigi jald se jald kar dein. Agar fee already jama kar di gayi hai, to please is message ko ignore karein.

JazakAllahu Khairan for your cooperation and support.

*Regards,*
Madrasa Majmaul Bahrain Bijol`;
    }

    if (type === "payment") {
      return `*Assalamu Alaikum ${guardian},*

This is to confirm that the fee payment for *${studentName}* has been received successfully.

*Amount Paid: ₹${Number(amount || 0).toLocaleString("en-IN")}*
*Fee Month: ${feeMonth || "—"}*
*Receipt No.: ${receipt || "—"}*

JazakAllahu Khairan.

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
  }, [type, guardian, studentName, due, amount, feeMonth, receipt, startDate, endDate, resumeDate, reason, examName, examDate, examTime, customMessage]);

  const whatsappUrl = useMemo(() => {
    let digits = String(student.mobile || "").replace(/\D/g, "");
    if (!digits) return "";

    // Normalize common Indian formats safely:
    // 9876543210 -> 919876543210
    // 09876543210 -> 919876543210
    // 919876543210 / +91 9876543210 -> 919876543210
    if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    const phone = digits.length === 10
      ? "91" + digits
      : digits.length === 12 && digits.startsWith("91")
        ? digits
        : "";

    if (!phone) return "";
    return "https://api.whatsapp.com/send?phone=" + phone + "&text=" + encodeURIComponent(message);
  }, [student.mobile, message]);

  const types: Array<[MessageType, string]> = [
    ["fee", "Fee Due Reminder"],
    ["payment", "Payment Received"],
    ["holiday", "Holiday Notice"],
    ["exam", "Exam Notice"],
    ["general", "General Notice"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-green-700">WhatsApp Message</p>
            <h3 className="mt-1 text-xl font-black">{studentName}</h3>
            <p className="text-sm text-slate-500">{student.mobile || "No mobile number"}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500">
            <FiXCircle />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">Message Type</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {types.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={"rounded-xl border px-4 py-3 text-left text-sm font-black transition " + (type === value ? "border-green-600 bg-green-50 text-green-800 shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-green-300")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {type === "payment" && (
            <div className="grid gap-3 sm:grid-cols-3">
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount Paid" className="rounded-xl border border-slate-200 px-4 py-3" />
              <input value={feeMonth} onChange={(e) => setFeeMonth(e.target.value)} placeholder="Fee Month" className="rounded-xl border border-slate-200 px-4 py-3" />
              <input value={receipt} onChange={(e) => setReceipt(e.target.value)} placeholder="Receipt No." className="rounded-xl border border-slate-200 px-4 py-3" />
            </div>
          )}

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
            <textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} rows={5} placeholder="Write your notice here..." className="w-full rounded-xl border border-slate-200 px-4 py-3" />
          )}

          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">Message Preview</p>
            <div className="mt-2 whitespace-pre-wrap rounded-2xl border border-green-100 bg-green-50 p-5 text-sm leading-7 text-slate-700">{message}</div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black">Cancel</button>
            {whatsappUrl ? (
              <button
                type="button"
                onClick={() => {
                  window.location.assign(whatsappUrl);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-black text-white hover:bg-green-800"
              >
                <FiSend /> Open WhatsApp & Send
              </button>
            ) : (
              <button type="button" disabled className="inline-flex items-center gap-2 rounded-xl bg-slate-300 px-5 py-3 text-sm font-black text-white">
                <FiSend /> Invalid / Missing Number
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
