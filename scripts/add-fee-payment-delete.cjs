const fs = require('fs');
const path = require('path');

const root = process.cwd();
const profilePath = path.join(root, 'app/admin/students/[studentId]/page.tsx');
const accountPath = path.join(root, 'app/admin/fee-account/page.tsx');

function patchProfile() {
  if (!fs.existsSync(profilePath)) return false;
  let s = fs.readFileSync(profilePath, 'utf8');
  if (s.includes('delete_student_fee_payment')) return false;

  const handlerMarker = ' const currentFee=';
  const handler = `\n const deleteFeePayment=async(feeId:string)=>{if(!window.confirm("Delete this payment record? The monthly fee due will remain, but the paid amount, payment date, method, receipt and remarks will be cleared."))return;setNotice("");setError("");const {error:e}=await supabase.rpc("delete_student_fee_payment",{p_ledger_id:feeId});if(e){setError(e.message||"Unable to delete fee payment record.");return}setNotice("Fee payment record deleted successfully.");await load()};\n`;
  if (!s.includes(handlerMarker)) throw new Error('[fee-delete] profile handler marker not found');
  s = s.replace(handlerMarker, handler + handlerMarker);

  const close = s.lastIndexOf('</main>');
  if (close < 0) throw new Error('[fee-delete] profile main closing tag not found');
  const panel = `\n {showFee&&<section className="mx-auto mt-6 max-w-6xl rounded-3xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-black text-slate-900">Fee Payment Records</h3><p className="mt-1 text-sm text-slate-600">Testing ke dauran kisi paid payment record ko delete kar sakte hain. Monthly fee/due record safe rahega; sirf payment details clear hongi.</p></div><span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-800">Admin only</span></div>{fees.filter(f=>Number(f.amount_paid||0)>0).length?<div className="mt-4 overflow-x-auto rounded-2xl border border-amber-200 bg-white"><table className="w-full min-w-[760px] text-sm"><thead className="bg-amber-100 text-slate-800"><tr><th className="p-3 text-left">Fee Month</th><th className="p-3 text-right">Paid</th><th className="p-3 text-left">Payment Date</th><th className="p-3 text-left">Method</th><th className="p-3 text-left">Receipt</th><th className="p-3 text-right">Action</th></tr></thead><tbody>{fees.filter(f=>Number(f.amount_paid||0)>0).map(f=><tr key={f.id} className="border-t"><td className="p-3 font-bold">{month(f.fee_month)}</td><td className="p-3 text-right font-black text-green-700">{money(Number(f.amount_paid||0))}</td><td className="p-3">{date(f.payment_date)}</td><td className="p-3">{f.payment_method||"—"}</td><td className="p-3">{f.receipt_number||"—"}</td><td className="p-3 text-right"><button type="button" onClick={()=>deleteFeePayment(f.id)} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 font-black text-white hover:bg-red-700"><FiTrash2/> Delete Payment</button></td></tr>)}</tbody></table></div>:<div className="mt-4 rounded-2xl border border-dashed border-amber-300 bg-white p-6 text-center text-sm font-bold text-slate-500">No paid payment records are available to delete.</div>}</section>`;
  s = s.slice(0, close) + panel + s.slice(close);
  fs.writeFileSync(profilePath, s);
  console.log('[fee-delete] student profile: patched');
  return true;
}

function patchAccount() {
  if (!fs.existsSync(accountPath)) return false;
  let s = fs.readFileSync(accountPath, 'utf8');
  if (s.includes('delete_student_fee_payment')) return false;

  const handlerMarker = ' const collectionTotal=';
  const handler = ` const deletePayment=async(ledgerId:string)=>{if(!window.confirm("Delete this payment record? The monthly fee due will remain, but the payment details will be cleared."))return;setError("");const {error:e}=await supabase.rpc("delete_student_fee_payment",{p_ledger_id:ledgerId});if(e){setError(e.message||"Unable to delete payment record.");return}await load()};\n`;
  if (!s.includes(handlerMarker)) throw new Error('[fee-delete] fee account handler marker not found');
  s = s.replace(handlerMarker, handler + handlerMarker);

  if (!s.includes('ledgerId:l.id')) {
    const collectionPush = 'out.push({student:s,amount:Number(l.amount_paid||0),payment_date:l.payment_date,method:l.payment_method||"—",receipt:l.receipt_number||"—",month:l.fee_month,remarks:l.remarks||""})';
    if (!s.includes(collectionPush)) throw new Error('[fee-delete] fee account collection push marker not found');
    s = s.replace(collectionPush, 'out.push({student:s,ledgerId:l.id,amount:Number(l.amount_paid||0),payment_date:l.payment_date,method:l.payment_method||"—",receipt:l.receipt_number||"—",month:l.fee_month,remarks:l.remarks||""})');
    s = s.replace('type Collection={student:Student;amount:number;', 'type Collection={student:Student;ledgerId:string;amount:number;');
  }

  const actionCell = '<td className="p-4 text-right font-black text-green-700">{money(x.amount)}</td></tr>';
  if (!s.includes(actionCell)) throw new Error('[fee-delete] fee account collection row marker not found');
  s = s.replace(actionCell, '<td className="p-4 text-right font-black text-green-700">{money(x.amount)}</td><td className="p-4 text-right"><button type="button" onClick={()=>deletePayment(x.ledgerId)} className="rounded-lg bg-red-600 px-3 py-2 font-black text-white hover:bg-red-700">Delete</button></td></tr>');
  s = s.replace('<th className="p-3 text-right">Amount</th></tr>', '<th className="p-3 text-right">Amount</th><th className="p-3 text-right">Action</th></tr>');
  fs.writeFileSync(accountPath, s);
  console.log('[fee-delete] fee account: patched');
  return true;
}

patchProfile();
patchAccount();
