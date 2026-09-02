"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AdminUser={
  id:string; user_id:string; name:string|null; email:string|null;
  role:"super_admin"|"admin"; active:boolean; created_at:string;
};

export default function AdminUsersPage(){
  const router=useRouter();
  const [admins,setAdmins]=useState<AdminUser[]>([]);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  const [currentUserId,setCurrentUserId]=useState("");
  const [form,setForm]=useState({name:"",email:"",password:"",role:"admin"});

  async function invoke(action:string,payload:Record<string,unknown>={}){
    const {data,error}=await supabase.functions.invoke("admin-user-management",{body:{action,...payload}});
    if(error||data?.error) throw new Error(data?.error||error?.message||"Request failed.");
    return data;
  }

  async function load(){
    setLoading(true);setError("");
    try{
      const data=await invoke("list");
      setAdmins(data.admins||[]);
      setCurrentUserId(data.currentUserId||"");
    }catch(e){
      setError(e instanceof Error?e.message:"Unable to load admin accounts.");
    }finally{setLoading(false);}
  }

  useEffect(()=>{void load();},[]);

  async function createAdmin(e:FormEvent){
    e.preventDefault();setBusy(true);setError("");setSuccess("");
    try{
      await invoke("create",form);
      setForm({name:"",email:"",password:"",role:"admin"});
      setSuccess("New admin account created successfully. The new admin can now log in.");
      await load();
    }catch(e){setError(e instanceof Error?e.message:"Admin account could not be created.");}
    finally{setBusy(false);}
  }

  async function resetPassword(admin:AdminUser){
    const password=window.prompt("Enter a new password for "+(admin.name||admin.email)+" (minimum 8 characters):");
    if(!password)return;
    setBusy(true);setError("");setSuccess("");
    try{
      const data=await invoke("reset_password",{adminId:admin.id,password});
      setSuccess(data.message||"Password updated.");
    }catch(e){setError(e instanceof Error?e.message:"Password update failed.");}
    finally{setBusy(false);}
  }

  async function toggleAdmin(admin:AdminUser){
    const next=!admin.active;
    if(!window.confirm((next?"Enable":"Disable")+" admin access for "+(admin.name||admin.email)+"?"))return;
    setBusy(true);setError("");setSuccess("");
    try{
      const data=await invoke("set_active",{adminId:admin.id,active:next});
      setSuccess(data.message||"Admin account updated.");
      await load();
    }catch(e){setError(e instanceof Error?e.message:"Admin account update failed.");}
    finally{setBusy(false);}
  }

  async function deleteAdmin(admin:AdminUser){
    if(!window.confirm("Permanently delete "+(admin.name||admin.email)+"? This cannot be undone."))return;
    setBusy(true);setError("");setSuccess("");
    try{
      const data=await invoke("delete",{adminId:admin.id});
      setSuccess(data.message||"Admin account deleted.");
      await load();
    }catch(e){setError(e instanceof Error?e.message:"Admin account deletion failed.");}
    finally{setBusy(false);}
  }

  async function logout(){
    await supabase.auth.signOut();
    router.replace("/admin");
  }

  return <main className="min-h-screen bg-[#f5f7f6] text-slate-900">
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img src="/mmbb-logo.svg" alt="Madrasa logo" className="h-14 w-14 rounded-full bg-white object-contain ring-1 ring-green-100"/>
          <div><p className="text-sm font-bold text-green-700">Madrasa Majmaul Bahrain Bijol</p><h1 className="text-2xl font-black">Admin Management</h1></div>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>router.push("/admin/dashboard")} className="rounded-xl border border-slate-300 px-4 py-2.5 font-bold hover:bg-slate-50">Dashboard</button>
          <button onClick={logout} className="rounded-xl bg-red-600 px-4 py-2.5 font-bold text-white hover:bg-red-700">Logout</button>
        </div>
      </div>
    </header>

    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-gradient-to-r from-green-900 to-emerald-700 p-6 text-white shadow-lg">
        <p className="text-sm text-green-100">Super Admin Control</p>
        <h2 className="mt-1 text-2xl font-black">Create and manage multiple admin accounts</h2>
        <p className="mt-2 text-sm text-green-100">Each person gets their own email and password. Never share one admin password with multiple people.</p>
      </div>

      {error&&<div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">{error}</div>}
      {success&&<div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 font-semibold text-green-800">{success}</div>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[.9fr_1.4fr]">
        <form onSubmit={createAdmin} className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wider text-green-700">New Admin</p>
          <h3 className="mt-1 text-2xl font-black">Create Admin Account</h3>
          <div className="mt-6 space-y-4">
            <div><label className="mb-1 block text-sm font-bold">Full Name</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600" placeholder="Admin name"/></div>
            <div><label className="mb-1 block text-sm font-bold">Login Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600" placeholder="admin@example.com"/></div>
            <div><label className="mb-1 block text-sm font-bold">Password</label><input type="password" minLength={8} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required className="w-full rounded-xl border px-4 py-3 outline-none focus:border-green-600" placeholder="Minimum 8 characters"/></div>
            <div><label className="mb-1 block text-sm font-bold">Access Role</label>
              <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="w-full rounded-xl border px-4 py-3 font-semibold">
                <option value="admin">Admin — full admin panel access</option>
                <option value="super_admin">Super Admin — can also manage admin accounts</option>
              </select>
            </div>
            <button disabled={busy} className="w-full rounded-xl bg-green-700 px-5 py-3.5 font-black text-white hover:bg-green-800 disabled:opacity-60">{busy?"Please wait...":"Create Admin Account"}</button>
          </div>
        </form>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-black uppercase tracking-wider text-green-700">Access List</p><h3 className="mt-1 text-2xl font-black">Admin Accounts ({admins.length})</h3></div><button onClick={()=>void load()} className="rounded-xl border px-4 py-2 font-bold hover:bg-slate-50">Refresh</button></div>
          {loading?<div className="py-16 text-center font-semibold text-slate-500">Loading admin accounts...</div>:
          <div className="mt-6 space-y-3">{admins.map(admin=>{
            const self=admin.user_id===currentUserId;
            return <div key={admin.id} className={"rounded-2xl border p-4 "+(admin.active?"border-slate-200":"border-red-200 bg-red-50/40")}>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h4 className="font-black text-lg">{admin.name||"Unnamed Admin"} {self&&<span className="text-xs text-green-700">(You)</span>}</h4><span className={"rounded-full px-2.5 py-1 text-xs font-black "+(admin.role==="super_admin"?"bg-amber-100 text-amber-800":"bg-green-100 text-green-800")}>{admin.role==="super_admin"?"SUPER ADMIN":"ADMIN"}</span><span className={"rounded-full px-2.5 py-1 text-xs font-black "+(admin.active?"bg-emerald-100 text-emerald-800":"bg-red-100 text-red-700")}>{admin.active?"ACTIVE":"DISABLED"}</span></div><p className="mt-1 break-all text-sm text-slate-600">{admin.email||"No email stored"}</p></div>
                <div className="flex flex-wrap gap-2">
                  <button disabled={busy} onClick={()=>void resetPassword(admin)} className="rounded-lg border px-3 py-2 text-sm font-bold hover:bg-slate-50">Reset Password</button>
                  {!self&&<button disabled={busy} onClick={()=>void toggleAdmin(admin)} className="rounded-lg border px-3 py-2 text-sm font-bold hover:bg-slate-50">{admin.active?"Disable":"Enable"}</button>}
                  {!self&&<button disabled={busy} onClick={()=>void deleteAdmin(admin)} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700">Delete</button>}
                </div>
              </div>
            </div>;
          })}</div>}
        </div>
      </div>
    </section>
  </main>;
}