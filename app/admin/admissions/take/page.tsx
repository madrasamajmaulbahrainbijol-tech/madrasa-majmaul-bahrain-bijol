"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const input = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-green-600 focus:ring-2 focus:ring-green-100";

type FormState = { full_name:string; date_of_birth:string; previous_education:string; father_name:string; mother_name:string; guardian_name:string; guardian_relation:string; phone:string; alternate_phone:string; occupation:string; address:string; village:string; post_office:string; district:string; state:string; pincode:string; country:string; course:string };
const initial:FormState={full_name:"",date_of_birth:"",previous_education:"",father_name:"",mother_name:"",guardian_name:"",guardian_relation:"",phone:"",alternate_phone:"",occupation:"",address:"",village:"",post_office:"",district:"",state:"",pincode:"",country:"India",course:""};

function makeApplicationNumber(){return `MMBB-${new Date().getFullYear()}-${Math.floor(100000+Math.random()*900000)}`}
function validateFile(file:File|null, photo=false){
 if(!file) throw new Error(photo?"Student photo is required.":"Identity proof is required.");
 const allowed=photo?["image/jpeg","image/png","image/webp"]:["image/jpeg","image/png","image/webp","application/pdf"];
 if(!allowed.includes(file.type)) throw new Error(photo?"Student photo must be JPG, PNG or WEBP.":"Identity proof must be JPG, PNG, WEBP or PDF.");
 if(file.size>5*1024*1024) throw new Error(`"${file.name}" is larger than 5 MB.`);
}

export default function TakeAdmissionPage(){
 const router=useRouter();
 const [form,setForm]=useState(initial);
 const [photo,setPhoto]=useState<File|null>(null);
 const [identityProof,setIdentityProof]=useState<File|null>(null);
 const [identityProofType,setIdentityProofType]=useState("");
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const change=(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement>)=>setForm(v=>({...v,[e.target.name]:e.target.value}));
 async function submit(e:FormEvent){e.preventDefault();setLoading(true);setError("");setSuccess("");
  try{
   const {data:{user}}=await supabase.auth.getUser(); if(!user) throw new Error("Admin session expired. Please login again.");
   const clean=Object.fromEntries(Object.entries(form).map(([k,v])=>[k,v.trim()])) as FormState;
   if(!clean.full_name||!clean.date_of_birth||!clean.father_name||!clean.guardian_name||!clean.guardian_relation||!clean.phone||!clean.address||!clean.village||!clean.district||!clean.state||!clean.pincode||!clean.course) throw new Error("Please fill all required fields.");
   if(!/^\d{10}$/.test(clean.phone)) throw new Error("Primary mobile must be exactly 10 digits.");
   if(clean.alternate_phone&&!/^\d{10}$/.test(clean.alternate_phone)) throw new Error("Alternate mobile must be exactly 10 digits.");
   if(!/^\d{6}$/.test(clean.pincode)) throw new Error("PIN code must be exactly 6 digits.");
   if(!identityProofType) throw new Error("Please select the identity proof type.");
   validateFile(photo,true); validateFile(identityProof,false);
   const id=crypto.randomUUID(); const applicationNumber=makeApplicationNumber();
   const photoFile=photo as File; const docFile=identityProof as File;
   const photoExt=photoFile.name.split(".").pop()?.toLowerCase()||"jpg";
   const docExt=docFile.name.split(".").pop()?.toLowerCase()||"file";
   const photoPath=`student-photos/${id}/admin-${Date.now()}.${photoExt}`;
   const documentPath=`id-documents/${id}/admin-${Date.now()}-${Math.random().toString(36).slice(2,8)}.${docExt}`;
   const {error:photoUpload}=await supabase.storage.from("admission-documents").upload(photoPath,photoFile,{upsert:false,contentType:photoFile.type,cacheControl:"3600"});
   if(photoUpload) throw new Error(`Photo upload failed: ${photoUpload.message}`);
   const {error:documentUpload}=await supabase.storage.from("admission-documents").upload(documentPath,docFile,{upsert:false,contentType:docFile.type,cacheControl:"3600"});
   if(documentUpload) throw new Error(`Identity document upload failed: ${documentUpload.message}`);
   const message=[`Application Number: ${applicationNumber}`,`Father's Name: ${clean.father_name}`,`Mother's Name: ${clean.mother_name||"Not provided"}`,`Guardian Name: ${clean.guardian_name}`,`Guardian Relationship: ${clean.guardian_relation}`,`Mobile Number 1: ${clean.phone}`,`Mobile Number 2: ${clean.alternate_phone||"Not provided"}`,`Parent Occupation: ${clean.occupation||"Not provided"}`,`Previous Education: ${clean.previous_education||"Not provided"}`,`Address: ${clean.address}`,`Village / Town: ${clean.village}`,`Post Office: ${clean.post_office||"Not provided"}`,`District: ${clean.district}`,`State: ${clean.state}`,`PIN Code: ${clean.pincode}`,`Country: ${clean.country||"India"}`,`Identity Proof Type: ${identityProofType}`,`Student Photo: ${photoPath}`,`Identity Proof: ${documentPath}`,`Added By Admin: ${user.email||user.id}`].join("\n");
   const {error:insertError}=await supabase.from("admissions").insert({id,student_id:null,student_name:clean.full_name,guardian_name:clean.guardian_name,mobile:clean.phone,email:null,course:clean.course,message,date_of_birth:clean.date_of_birth,status:"new",application_number:applicationNumber,student_photo_url:photoPath,student_document_type:identityProofType,student_document_url:documentPath});
   if(insertError) throw new Error(insertError.message);
   setSuccess(`Admission form created successfully. Application Number: ${applicationNumber}`); setForm(initial);setPhoto(null);setIdentityProof(null);setIdentityProofType(""); window.scrollTo({top:0,behavior:"smooth"});
  }catch(err){setError(err instanceof Error?err.message:"Unable to create admission.")}finally{setLoading(false)}
 }
 return <main className="min-h-screen bg-[#f5f7f6] text-slate-900"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6"><div className="flex items-center gap-3"><img src="/madrasa-logo.jpg" alt="Madrasa Majmaul Bahrain Bijol" className="official-madrasa-logo h-14 w-14 rounded-full border border-green-100 object-contain shadow-sm"/><div><p className="text-[10px] font-black uppercase tracking-[.22em] text-green-700">Madrasa Majmaul Bahrain Bijol</p><h1 className="text-xl font-black sm:text-2xl">Take Admission</h1></div></div><Link href="/admin/admissions" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white">Back to Admissions</Link></div></header>
 <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><div className="rounded-3xl bg-gradient-to-br from-green-950 via-green-800 to-green-600 p-7 text-white shadow-xl sm:p-9"><p className="text-xs font-black uppercase tracking-[.28em] text-green-200">Office Entry</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Take Admission on Behalf of Guardian</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-green-50">Use this form when a guardian cannot submit the online application themselves. The application will enter the normal admission workflow as a new application and must still be approved by the office.</p></div>
 {success&&<div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 font-bold text-emerald-800">✅ {success}<div className="mt-3 flex flex-wrap gap-2"><Link href="/admin/admissions" className="rounded-xl bg-green-800 px-4 py-2.5 text-sm font-black text-white">Open Admissions</Link><button onClick={()=>setSuccess("")} className="rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-black text-emerald-800">Add Another</button></div></div>}
 {error&&<div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5 font-bold text-red-700">❌ {error}</div>}
 <form onSubmit={submit} className="mt-6 space-y-6">
  <Section title="Student Information"><div className="grid gap-5 md:grid-cols-2"><Field label="Student Name *" name="full_name" value={form.full_name} onChange={change}/><Field label="Date of Birth *" name="date_of_birth" type="date" value={form.date_of_birth} onChange={change}/><Field label="Previous Education" name="previous_education" value={form.previous_education} onChange={change} placeholder="School / Madrasa / Class"/><div><label className="font-bold">Student Photo *</label><input type="file" accept="image/jpeg,image/png,image/webp" required onChange={e=>setPhoto(e.target.files?.[0]||null)} className={input}/><p className="mt-1 text-xs text-slate-500">Required, JPG/PNG/WEBP, max 5 MB.</p></div><div className="rounded-2xl border border-green-200 bg-green-50 p-4 md:col-span-2"><label className="font-bold text-slate-800">Identity Proof Type *</label><select value={identityProofType} onChange={e=>setIdentityProofType(e.target.value)} required className={input}><option value="">Select proof type</option><option value="Aadhaar Card">Aadhaar Card</option><option value="Birth Certificate">Birth Certificate</option><option value="Other Valid Identity Proof">Other Valid Identity Proof</option></select><label className="mt-4 block font-bold text-slate-800">Upload Identity Proof *</label><input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" required onChange={e=>setIdentityProof(e.target.files?.[0]||null)} className={input}/><p className="mt-1 text-xs text-slate-500">Required, JPG/PNG/WEBP/PDF, max 5 MB.</p></div></div></Section>
  <Section title="Parent / Guardian Information"><div className="grid gap-5 md:grid-cols-2"><Field label="Father's Name *" name="father_name" value={form.father_name} onChange={change}/><Field label="Mother's Name" name="mother_name" value={form.mother_name} onChange={change}/><Field label="Guardian Name *" name="guardian_name" value={form.guardian_name} onChange={change}/><div><label className="font-bold">Relationship *</label><select name="guardian_relation" value={form.guardian_relation} onChange={change} required className={input}><option value="">Select relationship</option><option>Father</option><option>Mother</option><option>Brother</option><option>Uncle</option><option>Other</option></select></div><Field label="Primary Mobile *" name="phone" value={form.phone} onChange={change} type="tel" placeholder="10-digit mobile"/><Field label="Alternate Mobile" name="alternate_phone" value={form.alternate_phone} onChange={change} type="tel" placeholder="Optional"/><Field label="Parent Occupation" name="occupation" value={form.occupation} onChange={change}/></div></Section>
  <Section title="Address Information"><div className="grid gap-5 md:grid-cols-2"><Field label="Full Address *" name="address" value={form.address} onChange={change} className="md:col-span-2"/><Field label="Village / Town *" name="village" value={form.village} onChange={change}/><Field label="Post Office" name="post_office" value={form.post_office} onChange={change}/><Field label="District *" name="district" value={form.district} onChange={change}/><Field label="State *" name="state" value={form.state} onChange={change}/><Field label="PIN Code *" name="pincode" value={form.pincode} onChange={change} inputMode="numeric"/><Field label="Country" name="country" value={form.country} onChange={change}/></div></Section>
  <Section title="Admission Details"><div><label className="font-bold">Course *</label><select name="course" value={form.course} onChange={change} required className={input}><option value="">Select course</option><option>Nazrah & Qirat</option><option>Hifz-ul-Quran</option><option>Darse Nizami</option><option>Basic Islamic Studies</option><option>English & Mathematics</option></select></div></Section>
  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900"><strong>Important:</strong> This creates a normal <strong>New</strong> application. It does not directly create a student login. The admin must approve it from Admissions, exactly like an online application.</div>
  <button disabled={loading} className="w-full rounded-2xl bg-green-800 px-6 py-4 text-base font-black text-white shadow-lg hover:bg-green-900 disabled:opacity-60">{loading?"Saving Admission...":"Save Admission Application"}</button>
 </form></section></main>
}
function Section({title,children}:{title:string;children:React.ReactNode}){return <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100"><div className="border-b border-slate-100 bg-green-50 px-6 py-5"><h3 className="text-xl font-black">{title}</h3></div><div className="p-6 sm:p-8">{children}</div></section>}
function Field({label,name,value,onChange,type="text",placeholder="",className="",inputMode}:{label:string;name:string;value:string;onChange:(e:React.ChangeEvent<HTMLInputElement>)=>void;type?:string;placeholder?:string;className?:string;inputMode?:"numeric"}){return <div className={className}><label className="font-bold text-slate-800">{label}</label><input name={name} type={type} value={value} onChange={onChange} required={label.includes("*")} placeholder={placeholder} inputMode={inputMode} className={input}/></div>}
