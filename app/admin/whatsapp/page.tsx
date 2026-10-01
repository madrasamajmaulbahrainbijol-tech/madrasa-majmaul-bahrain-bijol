"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { FiCheckCircle, FiMessageCircle, FiRefreshCw, FiSend, FiSettings, FiUsers, FiXCircle } from "react-icons/fi";
import { supabase } from "@/lib/supabase";

type Student = { id:string; student_id:string|null; student_name:string|null; guardian_name:string|null; mobile:string|null; course:string|null; whatsapp_opt_in:boolean };
type Ledger = { admission_id:string; amount_due:number|string|null; amount_paid:number|string|null; fee_status:string|null };

export default function WhatsAppPage(){
 const [students,setStudents]=useState<Student[]>([]),[ledgers,setLedgers]=useState<Ledger[]>([]),[loading,setLoading]=useState(true),[refreshing,setRefreshing]=useState(false),[error,setError]=useState(""),[busy,setBusy]=useState(""),[tab,setTab]=useState<"due"|"all">("due");
 async function load(){setError("");try{const [{data:s,error:se},{data:l,error:le}]=await Promise.all([supabase.from("admissions").select("id,student_id,student_name,guardian_name,mobile,course,whatsapp_opt_in").eq("status","approved").eq("account_status","approved").order("student_name"),supabase.from("student_fee_ledger").select("admission_id,amount_due,amount_paid,fee_status")]);if(se)throw se;if(le)throw le;setStudents((s||[]) as Student[]);setLedgers((l||[]) as Ledger[])}catch(e:any){setError(e?.message||"Unable to load WhatsApp data.")}finally{setLoading(false);setRefreshing(false)}}
 useEffect(()=>{load()},[]);
 const [composerOpen,setComposerOpen]=useState(false),[composerStudent,setComposerStudent]=useState<Student|null>(null);
 const [messageType,setMessageType]=useState<"fee"|"payment"|"holiday"|"exam"|"general">("fee"),[customMessage,setCustomMessage]=useState("");
 const [amount,setAmount]=useState(""),[feeMonth,setFeeMonth]=useState(""),[receipt,setReceipt]=useState("");
 const [noticeDate,setNoticeDate]=useState(""),[noticeEndDate,setNoticeEndDate]=useState(""),[resumeDate,setResumeDate]=useState(""),[noticeReason,setNoticeReason]=useState("");
 const [examName,setExamName]=useState(""),[examDate,setExamDate]=useState(""),[examTime,setExamTime]=useState("");
 const dueMap=useMemo(()=>{const m=new Map<string,number>();for(const r of ledgers){if(r.fee_status==="holiday")continue;const d=Math.max(0,Number(r.amount_due||0)-Number(r.amount_paid||0));m.set(r.admission_id,(m.get(r.admission_id)||0)+d)}return m},[ledgers]);
 const dueStudents=useMemo(()=>students.filter(s=>(dueMap.get(s.id)||0)>0),[students,dueMap]);
 const visible=tab==="due"?dueStudents:students;
 const optedIn=students.filter(s=>s.whatsapp_opt_in).length,numbers=students.filter(s=>!!s.mobile).length,dueOptedIn=dueStudents.filter(s=>s.whatsapp_opt_in&&!!s.mobile).length;
 async function toggleOptIn(s:Student){setBusy(s.id);try{const next=!s.whatsapp_opt_in;const {error:e}=await supabase.from("admissions").update({whatsapp_opt_in:next,whatsapp_opt_in_at:next?new Date().toISOString():null,whatsapp_opted_out_at:next?null:new Date().toISOString()}).eq("id",s.id);if(e)throw e;setStudents(c=>c.map(x=>x.id===s.id?{...x,whatsapp_opt_in:next}:x))}catch(e:any){setError(e?.message||"Could not update consent.")}finally{setBusy("")}}
 function manual(s:Student){setComposerStudent(s);setMessageType("fee");setComposerOpen(true);setCustomMessage("");setAmount(String(Math.round(dueMap.get(s.id)||0)));setFeeMonth("");setReceipt("");setNoticeDate("");setNoticeEndDate("");setResumeDate("");setNoticeReason("");setExamName("");setExamDate("");setExamTime("");}
 function buildWhatsAppMessage(s:Student){
  const guardian=s.guardian_name||"Parent/Guardian",student=s.student_name||"Student",due=Math.round(dueMap.get(s.id)||0);
  if(messageType==="fee")return `*Assalamu Alaikum ${guardian},*

This is a polite fee reminder from *Madrasa Majmaul Bahrain Bijol* regarding *${student}*.

*Outstanding Fee Balance: ₹${due.toLocaleString("en-IN")}*

Barah-e-karam fee ki adaigi jald se jald kar dein. Agar fee already jama kar di gayi hai, to please is message ko ignore karein.

JazakAllahu Khairan for your cooperation and support.

*Regards,*
Madrasa Majmaul Bahrain Bijol`;
  if(messageType==="payment")return `*Assalamu Alaikum ${guardian},*

This is to confirm that the fee payment for *${student}* has been received successfully.

*Amount Paid: ₹${Number(amount||0).toLocaleString("en-IN")}*
*Fee Month: ${feeMonth||"—"}*
*Receipt No.: ${receipt||"—"}*

JazakAllahu Khairan.

*Regards,*
Madrasa Majmaul Bahrain Bijol`;
  if(messageType==="holiday")return `*Assalamu Alaikum ${guardian},*

This is to inform you that *Madrasa Majmaul Bahrain Bijol* will remain closed from *${noticeDate||"—"}* to *${noticeEndDate||"—"}* due to *${noticeReason||"madrasa holiday"}*.

Classes will resume on *${resumeDate||"—"}*, InshaAllah.

JazakAllahu Khairan.

*Regards,*
Madrasa Majmaul Bahrain Bijol`;
  if(messageType==="exam")return `*Assalamu Alaikum ${guardian},*

This is to inform you that *${examName||"the examination"}* for *${student}* will be held on *${examDate||"—"}* at *${examTime||"—"}*.

Please ensure that the student arrives on time and is properly prepared.

JazakAllahu Khairan.

*Regards,*
Madrasa Majmaul Bahrain Bijol`;
  return `*Assalamu Alaikum ${guardian},*

*Important Notice from Madrasa Majmaul Bahrain Bijol*

${customMessage||"Please check the latest madrasa notice."}

JazakAllahu Khairan for your cooperation and support.

*Regards,*
Madrasa Majmaul Bahrain Bijol`;
 }
 function normalizeWhatsAppNumber(value:string){
  const digits=String(value||"").replace(/\D/g,"");
  if(!digits)return "";
  if(digits.startsWith("91")&&digits.length===12)return digits;
  if(digits.length===11&&digits.startsWith("0"))return "91"+digits.slice(1);
  if(digits.length===10)return "91"+digits;
  return digits;
 }
 function sendComposedWhatsApp(){
  if(!composerStudent)return;
  const phone=normalizeWhatsAppNumber(composerStudent.mobile||"");
  if(!phone){setError("This guardian does not have a valid WhatsApp mobile number.");return;}
  const message=buildWhatsAppMessage(composerStudent).trim();
  if(!message){setError("Please enter a message before sending.");return;}
  const url="https://wa.me/"+phone+"?text="+encodeURIComponent(message).replace(/%0A/g,"%0A");
  const popup=window.open(url,"_blank","noopener,noreferrer");
  if(!popup) window.location.href=url;
  setComposerOpen(false);
 }
 return <main className="min-h-screen bg-[#f4f7f5] text-slate-900"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"><div className="flex items-center gap-3"><img src="/mmbb-logo.svg" alt="MMBB" className="h-12 w-12 rounded-full"/><div><p className="text-[10px] font-black uppercase tracking-[0.28em] text-green-700">Madrasa Majmaul Bahrain Bijol</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">WhatsApp Messaging</h1></div></div><div className="flex gap-2"><button onClick={()=>{setRefreshing(true);load()}} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold disabled:opacity-60"><FiRefreshCw className={refreshing?"animate-spin":""}/><span className="hidden sm:inline">Refresh</span></button><Link href="/admin/dashboard" className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-black text-white">Dashboard</Link></div></div></header>
 <section className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8"><div className="overflow-hidden rounded-[30px] bg-gradient-to-br from-[#063b20] via-[#08743a] to-[#0ba24e] p-7 text-white shadow-xl sm:p-9"><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.3em] text-green-100">Official WhatsApp Integration</p><h2 className="mt-3 text-4xl font-black sm:text-5xl">Guardian Messaging</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-green-50 sm:text-base">Manage WhatsApp consent, identify students with outstanding fees and prepare messages. Automatic sending will be enabled after Meta WhatsApp Business is connected.</p></div><div className="rounded-2xl border border-white/15 bg-white/10 p-4 lg:min-w-[300px]"><p className="text-xs font-black uppercase tracking-wider text-green-100">Connection</p><p className="mt-2 flex items-center gap-2 text-lg font-black"><FiXCircle/> Not connected yet</p><p className="mt-1 text-xs text-green-100">Meta Business credentials are required.</p></div></div></div>
 <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat icon={<FiUsers/>} label="Active Guardians" value={students.length}/><Stat icon={<FiMessageCircle/>} label="WhatsApp Numbers" value={numbers}/><Stat icon={<FiCheckCircle/>} label="Consent Given" value={optedIn}/><Stat icon={<FiSend/>} label="Due + Consent" value={dueOptedIn}/></div>
 <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_340px]"><section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5"><div><h3 className="text-xl font-black">Recipients</h3><p className="mt-1 text-sm text-slate-500">{tab==="due"?"Students with outstanding fee balance.":"All active students."}</p></div><div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1"><button onClick={()=>setTab("due")} className={"rounded-lg px-3 py-2 text-sm font-black "+(tab==="due"?"bg-white text-green-700 shadow-sm":"text-slate-600")}>Due ({dueStudents.length})</button><button onClick={()=>setTab("all")} className={"rounded-lg px-3 py-2 text-sm font-black "+(tab==="all"?"bg-white text-green-700 shadow-sm":"text-slate-600")}>All ({students.length})</button></div></div>{error&&<div className="m-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}{loading?<div className="p-12 text-center font-bold text-slate-500">Loading WhatsApp recipients...</div>:visible.length===0?<div className="p-12 text-center text-slate-500">No matching students.</div>:<div className="divide-y divide-slate-100">{visible.map(s=>{const due=Math.round(dueMap.get(s.id)||0);return <div key={s.id} className="p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h4 className="truncate text-base font-black">{s.student_name||"Student"}</h4>{s.whatsapp_opt_in?<span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-black uppercase text-green-700">Opted in</span>:<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase text-slate-500">No consent</span>}</div><p className="mt-1 text-sm text-slate-500">Guardian: <b className="text-slate-700">{s.guardian_name||"—"}</b> · {s.mobile||"No mobile"} · {s.course||"—"}</p>{due>0&&<p className="mt-2 text-sm font-black text-red-700">Outstanding: ₹{due.toLocaleString("en-IN")}</p>}</div><div className="flex flex-wrap gap-2"><button disabled={busy===s.id} onClick={()=>toggleOptIn(s)} className={"rounded-xl border px-3 py-2 text-xs font-black "+(s.whatsapp_opt_in?"border-red-200 bg-red-50 text-red-700":"border-green-200 bg-green-50 text-green-700")}>{s.whatsapp_opt_in?"Opt out":"Mark consent"}</button><button disabled={!s.mobile} onClick={()=>manual(s)} className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-3 py-2 text-xs font-black text-white disabled:opacity-40"><FiMessageCircle/> Send WhatsApp</button></div></div></div>})}</div>}</section>
 <aside className="space-y-5"><div className="rounded-3xl border border-amber-200 bg-amber-50 p-6"><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Next step</p><h3 className="mt-2 text-xl font-black text-amber-950">Connect Meta WhatsApp</h3><p className="mt-2 text-sm leading-6 text-amber-900">The official Cloud API requires a Meta Business Portfolio, WhatsApp Business Account and business phone number. Business-initiated messages use approved templates.</p><div className="mt-4 rounded-2xl bg-white/70 p-4 text-sm text-amber-950"><p className="font-black">Templates</p><ul className="mt-2 space-y-1"><li>• Fee due reminder</li><li>• Payment received</li><li>• Holiday notice</li><li>• Exam notice</li><li>• General madrasa notice</li></ul></div></div><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-2 text-slate-700"><FiSettings/><h3 className="font-black">Messaging rules</h3></div><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600"><li>• Only opted-in guardians receive automated messages.</li><li>• Due reminders use the live fee ledger.</li><li>• Every API attempt will be logged.</li><li>• Credentials stay server-side.</li></ul></div></aside></div></section>
 {composerOpen&&composerStudent&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
 <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5"><div><p className="text-xs font-black uppercase tracking-widest text-green-700">WhatsApp Message</p><h3 className="mt-1 text-xl font-black">{composerStudent.student_name||"Student"}</h3><p className="text-sm text-slate-500">{composerStudent.mobile}</p></div><button onClick={()=>setComposerOpen(false)} className="rounded-xl border border-slate-200 p-2 text-slate-500"><FiXCircle/></button></div>
 <div className="space-y-5 p-5"><div><label className="text-xs font-black uppercase tracking-wider text-slate-500">Message Type</label><select value={messageType} onChange={e=>setMessageType(e.target.value as typeof messageType)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold"><option value="fee">Fee Due Reminder</option><option value="payment">Payment Received</option><option value="holiday">Holiday Notice</option><option value="exam">Exam Notice</option><option value="general">General Notice</option></select></div>
 {messageType==="payment"&&<div className="grid gap-3 sm:grid-cols-3"><input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount Paid" className="rounded-xl border border-slate-200 px-4 py-3"/><input value={feeMonth} onChange={e=>setFeeMonth(e.target.value)} placeholder="Fee Month" className="rounded-xl border border-slate-200 px-4 py-3"/><input value={receipt} onChange={e=>setReceipt(e.target.value)} placeholder="Receipt No." className="rounded-xl border border-slate-200 px-4 py-3"/></div>}
 {messageType==="holiday"&&<div className="grid gap-3 sm:grid-cols-2"><input value={noticeDate} onChange={e=>setNoticeDate(e.target.value)} placeholder="Start Date" className="rounded-xl border border-slate-200 px-4 py-3"/><input value={noticeEndDate} onChange={e=>setNoticeEndDate(e.target.value)} placeholder="End Date" className="rounded-xl border border-slate-200 px-4 py-3"/><input value={resumeDate} onChange={e=>setResumeDate(e.target.value)} placeholder="Resume Date" className="rounded-xl border border-slate-200 px-4 py-3"/><input value={noticeReason} onChange={e=>setNoticeReason(e.target.value)} placeholder="Reason" className="rounded-xl border border-slate-200 px-4 py-3"/></div>}
 {messageType==="exam"&&<div className="grid gap-3 sm:grid-cols-3"><input value={examName} onChange={e=>setExamName(e.target.value)} placeholder="Exam Name" className="rounded-xl border border-slate-200 px-4 py-3"/><input value={examDate} onChange={e=>setExamDate(e.target.value)} placeholder="Exam Date" className="rounded-xl border border-slate-200 px-4 py-3"/><input value={examTime} onChange={e=>setExamTime(e.target.value)} placeholder="Time" className="rounded-xl border border-slate-200 px-4 py-3"/></div>}
 {messageType==="general"&&<textarea value={customMessage} onChange={e=>setCustomMessage(e.target.value)} rows={5} placeholder="Write your notice here..." className="w-full rounded-xl border border-slate-200 px-4 py-3"/>}
 <div><p className="text-xs font-black uppercase tracking-wider text-slate-500">Message Preview</p><div className="mt-2 whitespace-pre-wrap rounded-2xl border border-green-100 bg-green-50 p-5 text-sm leading-7 text-slate-700">{buildWhatsAppMessage(composerStudent)}</div></div>
 <div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button onClick={()=>setComposerOpen(false)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black">Cancel</button><button onClick={sendComposedWhatsApp} className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-black text-white"><FiSend/> Open WhatsApp</button></div></div></div>}
 </section></main>
}
function Stat({icon,label,value}:{icon:ReactNode;label:string;value:number}){return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-slate-400">{icon}<span className="text-[10px] font-black uppercase tracking-wider">{label}</span></div><p className="mt-2 text-3xl font-black text-slate-900">{value}</p></div>}