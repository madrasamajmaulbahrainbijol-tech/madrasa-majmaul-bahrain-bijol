"use client";

import { useState } from "react";
import { FiClock, FiTrash2, FiX } from "react-icons/fi";

type Props={
 show:boolean;
 history:any[];
 isSuperAdmin:boolean;
 onDelete:(ledgerId:string)=>void;
 date:(value:string|null|undefined)=>string;
 month:(value:string)=>string;
 money:(value:number)=>string;
};

export default function FeePaymentHistory({show,history,isSuperAdmin,onDelete,date,month,money}:Props){
 const [open,setOpen]=useState(false);
 if(!show)return null;
 return <>
  <button type="button" onClick={()=>setOpen(true)} className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-2xl bg-emerald-900 px-5 py-3 text-sm font-black text-white shadow-2xl ring-4 ring-white hover:bg-emerald-800">
   <FiClock className="text-lg"/> Payment History {history.length>0&&<span className="rounded-full bg-white/20 px-2 py-0.5">{history.length}</span>}
  </button>
  {open&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
   <section className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-emerald-950 px-5 py-4 text-white">
     <div><p className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">Audit Trail</p><h3 className="mt-1 text-xl font-black">Payment History</h3><p className="mt-1 text-sm text-emerald-100">Har fee payment ka record aur kis admin ne payment receive/enter kiya.</p></div>
     <div className="flex items-center gap-2">{isSuperAdmin&&<span className="rounded-full bg-red-500/20 px-3 py-1.5 text-xs font-black text-red-100">Super Admin: Delete Enabled</span>}<button type="button" onClick={()=>setOpen(false)} className="rounded-xl bg-white/10 p-2 hover:bg-white/20" aria-label="Close"><FiX className="text-xl"/></button></div>
    </div>
    <div className="max-h-[72vh] overflow-auto p-5">
     {history.length?<div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full min-w-[980px] text-sm">
       <thead className="sticky top-0 bg-emerald-900 text-white"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Fee Month</th><th className="p-3 text-right">Amount</th><th className="p-3 text-left">Method</th><th className="p-3 text-left">Receipt</th><th className="p-3 text-left">Payment Received By</th><th className="p-3 text-left">Status</th>{isSuperAdmin&&<th className="p-3 text-right">Action</th>}</tr></thead>
       <tbody>{history.map(h=><tr key={h.id} className="border-t border-slate-100 hover:bg-slate-50"><td className="p-3">{date(h.payment_date||h.created_at)}</td><td className="p-3 font-bold">{h.payment_date?month(String(h.payment_date).slice(0,7)+"-01"):"—"}</td><td className="p-3 text-right font-black text-emerald-700">{money(Number(h.amount||0))}</td><td className="p-3">{h.payment_method||"—"}</td><td className="p-3">{h.receipt_number||"—"}</td><td className="p-3"><div className="font-black">{h.entered_by_admin_name||h.entered_by_admin_email||"Legacy / Unknown"}</div>{h.entered_by_admin_email&&<div className="text-xs text-slate-400">{h.entered_by_admin_email}</div>}</td><td className="p-3">{h.deleted_at?<span className="font-black text-red-600">Deleted{h.deleted_by_admin_name?(" by "+h.deleted_by_admin_name):""}</span>:<span className="font-black text-emerald-700">Active</span>}</td>{isSuperAdmin&&<td className="p-3 text-right">{h.deleted_at?<span className="text-xs font-bold text-slate-400">Already deleted</span>:<button type="button" onClick={()=>onDelete(h.ledger_id)} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 font-black text-white hover:bg-red-700"><FiTrash2/> Delete</button>}</td>}</tr>)}</tbody>
      </table>
     </div>:<div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center"><FiClock className="mx-auto text-3xl text-slate-300"/><p className="mt-3 font-black text-slate-600">No payment history available.</p></div>}
    </div>
   </section>
  </div>}
 </>;
}
