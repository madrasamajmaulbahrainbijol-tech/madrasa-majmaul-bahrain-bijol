"use client";

import { FiClock, FiTrash2 } from "react-icons/fi";

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
 if(!show)return null;
 return <section className="mx-auto mt-6 max-w-6xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
  <div className="flex flex-wrap items-center justify-between gap-3">
   <div>
    <p className="text-xs font-black uppercase tracking-[.2em] text-emerald-700">Audit Trail</p>
    <div className="mt-1 flex items-center gap-2"><FiClock className="text-emerald-700"/><h3 className="text-xl font-black">Payment History</h3>{history.length>0&&<span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-800">{history.length}</span>}</div>
    <p className="mt-1 text-sm text-slate-500">Har fee payment ka complete record aur kis admin ne payment receive/enter kiya, yahan rahega.</p>
   </div>
   {isSuperAdmin&&<span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-700">Super Admin: Delete Enabled</span>}
  </div>
  {history.length?<div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
   <table className="w-full min-w-[980px] text-sm">
    <thead className="sticky top-0 bg-emerald-900 text-white"><tr>
     <th className="p-3 text-left">Date</th><th className="p-3 text-left">Fee Month</th><th className="p-3 text-right">Amount</th><th className="p-3 text-left">Method</th><th className="p-3 text-left">Receipt</th><th className="p-3 text-left">Payment Received By</th><th className="p-3 text-left">Status</th>{isSuperAdmin&&<th className="p-3 text-right">Action</th>}
    </tr></thead>
    <tbody>{history.map(h=><tr key={h.id} className="border-t border-slate-100 hover:bg-slate-50">
     <td className="p-3">{date(h.payment_date||h.created_at)}</td>
     <td className="p-3 font-bold">{h.payment_date?month(String(h.payment_date).slice(0,7)+"-01"):"—"}</td>
     <td className="p-3 text-right font-black text-emerald-700">{money(Number(h.amount||0))}</td>
     <td className="p-3">{h.payment_method||"—"}</td>
     <td className="p-3">{h.receipt_number||"—"}</td>
     <td className="p-3"><div className="font-black">{h.entered_by_admin_name||h.entered_by_admin_email||"Legacy / Unknown"}</div>{h.entered_by_admin_email&&<div className="text-xs text-slate-400">{h.entered_by_admin_email}</div>}</td>
     <td className="p-3">{h.deleted_at?<span className="font-black text-red-600">Deleted{h.deleted_by_admin_name?(" by "+h.deleted_by_admin_name):""}</span>:<span className="font-black text-emerald-700">Active</span>}</td>
     {isSuperAdmin&&<td className="p-3 text-right">{h.deleted_at?<span className="text-xs font-bold text-slate-400">Already deleted</span>:<button type="button" onClick={()=>onDelete(h.ledger_id)} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 font-black text-white hover:bg-red-700"><FiTrash2/> Delete</button>}</td>}
    </tr>)}</tbody>
   </table>
  </div>:<div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-10 text-center"><FiClock className="mx-auto text-3xl text-slate-300"/><p className="mt-3 font-black text-slate-600">No payment history available.</p></div>}
 </section>;
}
