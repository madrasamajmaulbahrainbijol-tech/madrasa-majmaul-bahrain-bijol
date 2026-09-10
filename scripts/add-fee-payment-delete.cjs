const fs = require('fs');
const path = require('path');

const root = process.cwd();
const profilePath = path.join(root, 'app/admin/students/[studentId]/page.tsx');

function patchProfile() {
  if (!fs.existsSync(profilePath)) return;
  let s = fs.readFileSync(profilePath, 'utf8');
  if (s.includes('student_fee_payment_history')) {
    console.log('[fee-history] student profile already patched');
    return;
  }

  const typeMarker = 'type FeeLedger=';
  const typeEnd = s.indexOf('\n', s.indexOf(typeMarker));
  if (typeEnd < 0) throw new Error('[fee-history] FeeLedger type marker not found');
  const feeTypeLine = s.slice(s.indexOf(typeMarker), typeEnd);
  const newFeeType = feeTypeLine.replace(/};$/, ';paid_by_admin_id:string|null;paid_by_admin_name:string|null;paid_by_admin_email:string|null};');
  s = s.replace(feeTypeLine, newFeeType);

  const stateMarker = ' const [monthlyFee,setMonthlyFee]';
  const stateIndex = s.indexOf(stateMarker);
  if (stateIndex < 0) throw new Error('[fee-history] fee state marker not found');
  s = s.slice(0, stateIndex) + ' const [paymentHistory,setPaymentHistory]=useState<any[]>([]),[isSuperAdmin,setIsSuperAdmin]=useState(false);\n' + s.slice(stateIndex);

  const loadMarker = ' const load=async()=>{';
  const loadIndex = s.indexOf(loadMarker);
  if (loadIndex < 0) throw new Error('[fee-history] load marker not found');
  const adminCheck = 'const {data:{user:feeUser}}=await supabase.auth.getUser();if(feeUser){const {data:au}=await supabase.from("admin_users").select("role").eq("user_id",feeUser.id).eq("active",true).maybeSingle();setIsSuperAdmin(au?.role==="super_admin")}';
  s = s.slice(0, loadIndex + loadMarker.length) + adminCheck + s.slice(loadIndex + loadMarker.length);

  const feeSelect = 'select("id,fee_month,amount_due,amount_paid,payment_date,payment_method,receipt_number,remarks")';
  const feeSelectAudit = 'select("id,fee_month,amount_due,amount_paid,payment_date,payment_method,receipt_number,remarks,paid_by_admin_id,paid_by_admin_name,paid_by_admin_email")';
  s = s.replaceAll(feeSelect, feeSelectAudit);

  const setFeesMarker = 'setFees((ff.data||[]) as FeeLedger[]);';
  if (!s.includes(setFeesMarker)) throw new Error('[fee-history] setFees marker not found');
  const historyLoad = 'const {data:ph,error:phe}=await supabase.from("student_fee_payment_history").select("id,ledger_id,amount,payment_date,payment_method,receipt_number,remarks,entered_by_admin_id,entered_by_admin_name,entered_by_admin_email,created_at,deleted_at,deleted_by_admin_name,delete_reason").eq("admission_id",a.id).order("created_at",{ascending:false});if(!phe)setPaymentHistory(ph||[]);';
  s = s.replace(setFeesMarker, setFeesMarker + historyLoad);

  const handlerMarker = ' const currentFee=';
  const handlerIndex = s.indexOf(handlerMarker);
  if (handlerIndex < 0) throw new Error('[fee-history] currentFee marker not found');
  const handler = ' const deleteFeePayment=async(ledgerId:string)=>{if(!isSuperAdmin)return;if(!window.confirm("Delete this payment history record? The audit record will be kept and marked deleted."))return;setNotice("");setError("");const {error:e}=await supabase.rpc("delete_student_fee_payment",{p_ledger_id:ledgerId});if(e){setError(e.message||"Unable to delete fee payment record.");return}setNotice("Fee payment history deleted by Super Admin.");await load()};\n';
  s = s.slice(0, handlerIndex) + handler + s.slice(handlerIndex);

  const close = s.lastIndexOf('</main>');
  if (close < 0) throw new Error('[fee-history] profile main closing tag not found');
  const panel = `
 {showFee&&<section className="mx-auto mt-6 max-w-6xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.2em] text-green-700">Audit Trail</p><h3 className="mt-1 text-xl font-black">Payment History</h3><p className="mt-1 text-sm text-slate-500">Har fee payment ka record, kis admin ne receive/enter kiya, aur deletion audit yahan محفوظ rahega.</p></div>{isSuperAdmin&&<span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-black text-red-700">Super Admin: Delete Enabled</span>}</div>{paymentHistory.length?<div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200"><table className="w-full min-w-[980px] text-sm"><thead className="bg-emerald-900 text-white"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Fee Month</th><th className="p-3 text-right">Amount</th><th className="p-3 text-left">Method</th><th className="p-3 text-left">Receipt</th><th className="p-3 text-left">Payment Received By</th><th className="p-3 text-left">Status</th>{isSuperAdmin&&<th className="p-3 text-right">Action</th>}</tr></thead><tbody>{paymentHistory.map(h=><tr key={h.id} className="border-t"><td className="p-3">{date(h.payment_date||h.created_at)}</td><td className="p-3 font-bold">{h.ledger_id?month(String(h.payment_date||h.created_at).slice(0,7)+"-01"):"—"}</td><td className="p-3 text-right font-black text-green-700">{money(Number(h.amount||0))}</td><td className="p-3">{h.payment_method||"—"}</td><td className="p-3">{h.receipt_number||"—"}</td><td className="p-3"><div className="font-black">{h.entered_by_admin_name||h.entered_by_admin_email||"Legacy / Unknown"}</div>{h.entered_by_admin_email&&<div className="text-xs text-slate-400">{h.entered_by_admin_email}</div>}</td><td className="p-3">{h.deleted_at?<span className="font-black text-red-600">Deleted{h.deleted_by_admin_name?(' by '+h.deleted_by_admin_name):''}</span>:<span className="font-black text-emerald-700">Active</span>}</td>{isSuperAdmin&&<td className="p-3 text-right">{h.deleted_at?<span className="text-xs font-bold text-slate-400">Already deleted</span>:<button type="button" onClick={()=>deleteFeePayment(h.ledger_id)} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 font-black text-white hover:bg-red-700"><FiTrash2/> Delete</button>}</td>}</tr>)}</tbody></table></div>:<div className="mt-4 rounded-2xl border border-dashed p-8 text-center text-sm font-bold text-slate-500">No payment history available.</div>}</section>`;
  s = s.slice(0, close) + panel + s.slice(close);
  fs.writeFileSync(profilePath, s);
  console.log('[fee-history] student profile payment history restored');
}

patchProfile();
