const fs = require('fs');
const path = require('path');

const root = process.cwd();
const profilePath = path.join(root, 'app/admin/students/[studentId]/page.tsx');
const accountPath = path.join(root, 'app/admin/fee-account/page.tsx');

function patchProfile() {
  if (!fs.existsSync(profilePath)) return false;
  let s = fs.readFileSync(profilePath, 'utf8');
  if (s.includes('isSuperAdminFee')) return false;

  const handlerMarker = ' const currentFee=';
  const handler = `\n const [isSuperAdminFee,setIsSuperAdminFee]=useState(false);\n const checkSuperAdminFee=async()=>{const {data}=await supabase.from("admin_users").select("role,active").eq("user_id",(await supabase.auth.getUser()).data.user?.id||"").maybeSingle();setIsSuperAdminFee(data?.active===true&&data?.role==="super_admin")};\n const deleteFeePayment=async(feeId:string)=>{if(!isSuperAdminFee){setError("Only Super Admin can delete fee payment history.");return}if(!window.confirm("Delete this payment history? The monthly fee/due record will remain safe. This action is for Super Admin only."))return;setNotice("");setError("");const {error:e}=await supabase.rpc("delete_student_fee_payment",{p_ledger_id:feeId});if(e){setError(e.message||"Unable to delete fee payment record.");return}setNotice("Fee payment history deleted successfully.");await load()};\n`;
  if (!s.includes(handlerMarker)) throw new Error('[fee-delete] profile handler marker not found');
  s = s.replace(handlerMarker, handler + handlerMarker);
  s = s.replace(' useEffect(()=>{load()},[routeId]);', ' useEffect(()=>{load();checkSuperAdminFee()},[routeId]);');

  const feeSectionMarker = ' <section id="fees"';
  if (!s.includes(feeSectionMarker)) throw new Error('[fee-delete] profile fee section marker not found');
  const panel = ` <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.2em] text-amber-700">Payment History</p><h2 className="text-xl font-black text-slate-900">Fee Payment Records</h2><p className="mt-1 text-sm text-slate-600">Every recorded payment is preserved with the admin who entered it. Deletion is restricted to Super Admin.</p></div><span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-800">{isSuperAdminFee?'Super Admin: Delete enabled':'Admin: View only'}</span></div>{fees.filter(f=>Number(f.amount_paid||0)>0).length?<div className="mt-5 overflow-x-auto rounded-2xl border border-amber-200 bg-white"><table className="w-full min-w-[900px] text-sm"><thead className="bg-amber-100 text-slate-800"><tr><th className="p-3 text-left">Fee Month</th><th className="p-3 text-right">Paid</th><th className="p-3 text-left">Payment Date</th><th className="p-3 text-left">Method</th><th className="p-3 text-left">Receipt</th><th className="p-3 text-left">Entered By</th><th className="p-3 text-right">Action</th></tr></thead><tbody>{fees.filter(f=>Number(f.amount_paid||0)>0).map(f=><tr key={f.id} className="border-t"><td className="p-3 font-bold">{month(f.fee_month)}</td><td className="p-3 text-right font-black text-green-700">{money(Number(f.amount_paid||0))}</td><td className="p-3">{date(f.payment_date)}</td><td className="p-3">{f.payment_method||"—"}</td><td className="p-3">{f.receipt_number||"—"}</td><td className="p-3"><div className="font-black">{(f as any).paid_by_admin_name||(f as any).paid_by_admin_email||"Legacy record"}</div><div className="text-xs text-slate-400">Admin who entered latest payment</div></td><td className="p-3 text-right">{isSuperAdminFee?<button type="button" onClick={()=>deleteFeePayment(f.id)} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 font-black text-white hover:bg-red-700"><FiTrash2/> Delete</button>:<span className="text-xs font-bold text-slate-400">Super Admin only</span>}</td></tr>)}</tbody></table></div>:<div className="mt-5 rounded-2xl border border-dashed border-amber-300 bg-white p-6 text-center text-sm font-bold text-slate-500">No paid payment records are available.</div>}</section>\n`;
  s = s.replace(feeSectionMarker, panel + feeSectionMarker);
  fs.writeFileSync(profilePath, s);
  console.log('[fee-delete] student profile: patched');
  return true;
}

function patchAccount() {
  if (!fs.existsSync(accountPath)) return false;
  let s = fs.readFileSync(accountPath, 'utf8');
  if (s.includes('isSuperAdminFeeAccount')) return false;

  const handlerMarker = ' const collectionTotal=';
  const handler = ` const [isSuperAdminFeeAccount,setIsSuperAdminFeeAccount]=useState(false);\n const checkSuperAdminFeeAccount=async()=>{const {data:userData}=await supabase.auth.getUser();const {data}=await supabase.from("admin_users").select("role,active").eq("user_id",userData.user?.id||"").maybeSingle();setIsSuperAdminFeeAccount(data?.active===true&&data?.role==="super_admin")};\n const deletePayment=async(ledgerId:string)=>{if(!isSuperAdminFeeAccount){setError("Only Super Admin can delete fee payment history.");return}if(!window.confirm("Delete this payment history? The monthly fee/due record will remain safe."))return;setError("");const {error:e}=await supabase.rpc("delete_student_fee_payment",{p_ledger_id:ledgerId});if(e){setError(e.message||"Unable to delete payment record.");return}await load()};\n`;
  if (!s.includes(handlerMarker)) throw new Error('[fee-delete] fee account handler marker not found');
  s = s.replace(handlerMarker, handler + handlerMarker);
  s = s.replace(' useEffect(()=>{load()},[]);', ' useEffect(()=>{load();checkSuperAdminFeeAccount()},[]);');

  if (!s.includes('ledgerId:l.id')) {
    const collectionPush = 'out.push({student:s,amount:Number(l.amount_paid||0),payment_date:l.payment_date,method:l.payment_method||"—",receipt:l.receipt_number||"—",month:l.fee_month,remarks:l.remarks||""})';
    if (!s.includes(collectionPush)) throw new Error('[fee-delete] fee account collection push marker not found');
    s = s.replace(collectionPush, 'out.push({student:s,ledgerId:l.id,amount:Number(l.amount_paid||0),payment_date:l.payment_date,method:l.payment_method||"—",receipt:l.receipt_number||"—",month:l.fee_month,remarks:l.remarks||"",paidBy:(l as any).paid_by_admin_name||(l as any).paid_by_admin_email||"Legacy record"})');
    s = s.replace('type Collection={student:Student;amount:number;', 'type Collection={student:Student;ledgerId:string;amount:number;paidBy?:string;');
  }

  const actionCell = '<td className="p-4 text-right font-black text-green-700">{money(x.amount)}</td></tr>';
  if (!s.includes(actionCell)) throw new Error('[fee-delete] fee account collection row marker not found');
  s = s.replace(actionCell, '<td className="p-4 text-right font-black text-green-700">{money(x.amount)}</td><td className="p-4 text-right">{isSuperAdminFeeAccount?<button type="button" onClick={()=>deletePayment(x.ledgerId)} className="rounded-lg bg-red-600 px-3 py-2 font-black text-white hover:bg-red-700">Delete</button>:<span className="text-xs font-bold text-slate-400">Super Admin only</span>}</td></tr>');
  s = s.replace('<th className="p-3 text-right">Amount</th></tr>', '<th className="p-3 text-right">Amount</th><th className="p-3 text-right">Action</th></tr>');
  fs.writeFileSync(accountPath, s);
  console.log('[fee-delete] fee account: patched');
  return true;
}

patchProfile();
patchAccount();
