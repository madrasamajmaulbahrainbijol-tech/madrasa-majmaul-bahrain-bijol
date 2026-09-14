const fs = require('fs');
const path = require('path');
const root = process.cwd();
const profilePath = path.join(root, 'app/admin/students/[studentId]/page.tsx');
function patchProfile() {
  if (!fs.existsSync(profilePath)) return;
  let s = fs.readFileSync(profilePath, 'utf8');
  const importMarker = 'import { supabase } from "../../../lib/supabase/client";';
  if (!s.includes(importMarker)) throw new Error('[fee-history] supabase import marker not found');

  if (!s.includes('import FeePaymentHistory from "../../../../components/admin/FeePaymentHistory";')) {
    s = s.replace(importMarker, importMarker + '\nimport FeePaymentHistory from "../../../../components/admin/FeePaymentHistory";');
  }

  const typeMarker = 'type FeeLedger=';
  const typeStart = s.indexOf(typeMarker);
  const typeEnd = s.indexOf('\n', typeStart);
  if (typeStart < 0 || typeEnd < 0) throw new Error('[fee-history] FeeLedger type marker not found');
  const feeTypeLine = s.slice(typeStart, typeEnd);
  if (!feeTypeLine.includes('paid_by_admin_id')) {
    const newFeeType = feeTypeLine.replace(/};$/, ';paid_by_admin_id:string|null;paid_by_admin_name:string|null;paid_by_admin_email:string|null};');
    if (newFeeType === feeTypeLine) throw new Error('[fee-history] FeeLedger type format not recognized');
    s = s.replace(feeTypeLine, newFeeType);
  }
  const refreshedFeeType = s.slice(s.indexOf(typeMarker), s.indexOf('\n', s.indexOf(typeMarker)));
  if (!refreshedFeeType.includes('fee_status')) {
    const newFeeType = refreshedFeeType.replace(/};$/, ';fee_status:"due"|"paid"|"holiday";');
    s = s.replace(refreshedFeeType, newFeeType);
  }

  const stateMarker = ' const [monthlyFee,setMonthlyFee]';
  const stateIndex = s.indexOf(stateMarker);
  if (stateIndex < 0) throw new Error('[fee-history] fee state marker not found');
  if (!s.includes('const [paymentHistory,setPaymentHistory]')) {
    s = s.slice(0, stateIndex) + ' const [paymentHistory,setPaymentHistory]=useState<any[]>([]),[isSuperAdmin,setIsSuperAdmin]=useState(false);\n' + s.slice(stateIndex);
  }

  const loadMarker = ' const load=async()=>{';
  const loadIndex = s.indexOf(loadMarker);
  if (loadIndex < 0) throw new Error('[fee-history] load marker not found');
  const adminCheck = 'const {data:{user:feeUser}}=await supabase.auth.getUser();if(feeUser){const {data:au}=await supabase.from("admin_users").select("role").eq("user_id",feeUser.id).eq("active",true).maybeSingle();setIsSuperAdmin(au?.role==="super_admin")}';
  if (!s.includes('setIsSuperAdmin(au?.role==="super_admin")')) s = s.slice(0, loadIndex + loadMarker.length) + adminCheck + s.slice(loadIndex + loadMarker.length);

  const feeSelect = 'select("id,fee_month,amount_due,amount_paid,payment_date,payment_method,receipt_number,remarks")';
  const feeSelectAudit = 'select("id,fee_month,amount_due,amount_paid,payment_date,payment_method,receipt_number,remarks,fee_status,paid_by_admin_id,paid_by_admin_name,paid_by_admin_email")';
  s = s.replaceAll(feeSelect, feeSelectAudit);

  const setFeesMarker = 'setFees((ff.data||[]) as FeeLedger[]);';
  if (!s.includes(setFeesMarker)) throw new Error('[fee-history] setFees marker not found');
  const historyLoad = 'const {data:ph,error:phe}=await supabase.from("student_fee_payment_history").select("id,ledger_id,amount,payment_date,payment_method,receipt_number,remarks,entered_by_admin_id,entered_by_admin_name,entered_by_admin_email,created_at,deleted_at,deleted_by_admin_name,delete_reason").eq("admission_id",a.id).order("created_at",{ascending:false});if(!phe)setPaymentHistory(ph||[]);';
  if (!s.includes('from("student_fee_payment_history")')) s = s.replace(setFeesMarker, setFeesMarker + historyLoad);

  const handlerMarker = ' const currentFee=';
  const handlerIndex = s.indexOf(handlerMarker);
  if (handlerIndex < 0) throw new Error('[fee-history] currentFee marker not found');
  const handler = ' const deleteFeePayment=async(ledgerId:string)=>{if(!isSuperAdmin)return;if(!window.confirm("Delete this payment history record?"))return;setNotice("");setError("");const {error:e}=await supabase.rpc("delete_student_fee_payment",{p_ledger_id:ledgerId});if(e){setError(e.message||"Unable to delete fee payment record.");return}setNotice("Fee payment history deleted by Super Admin.");await load};\n';
  if (!s.includes('const deleteFeePayment=')) s = s.slice(0, handlerIndex) + handler + s.slice(handlerIndex);

  const holidayHandler = ' const markFeeHoliday=async(f:FeeLedger)=>{if(!student)return;if(f.fee_status==="holiday")return;if(Number(f.amount_paid)>0){setError("A paid fee cannot be marked as holiday. Correct/delete the payment first.");return}if(!window.confirm(`Mark ${month(f.fee_month)} as madrasa holiday? The fee for this month will become ₹0.`))return;setSaving(true);setError("");try{const {error:e}=await supabase.from("student_fee_ledger").update({amount_due:0,amount_paid:0,payment_date:null,payment_method:null,receipt_number:null,remarks:"Fee waived due to madrasa holiday.",fee_status:"holiday"}).eq("id",f.id);if(e)throw e;setNotice(`${month(f.fee_month)} marked as holiday. Monthly fee is now ₹0.`);await load()}catch(e:any){setError(e?.message||"Unable to mark holiday.")}finally{setSaving(false)}};\n const restoreFeeAfterHoliday=async(f:FeeLedger)=>{if(!student||f.fee_status!=="holiday")return;if(!window.confirm(`Restore the regular fee for ${month(f.fee_month)}?`))return;setSaving(true);setError("");try{const {data:setting,error:e}=await supabase.from("student_fee_settings").select("monthly_fee").eq("admission_id",student.id).lte("effective_from",f.fee_month).order("effective_from",{ascending:false}).order("created_at",{ascending:false}).limit(1).maybeSingle();if(e)throw e;if(!setting)throw new Error("No monthly fee setting found for this month.");const {error:u}=await supabase.from("student_fee_ledger").update({amount_due:Number(setting.monthly_fee),amount_paid:0,payment_date:null,payment_method:null,receipt_number:null,remarks:null,fee_status:"due"}).eq("id",f.id);if(u)throw u;setNotice(`${month(f.fee_month)} restored to ${money(Number(setting.monthly_fee))}.`);await load()}catch(e:any){setError(e?.message||"Unable to restore monthly fee.")}finally{setSaving(false)}};\n';
  if (!s.includes('const markFeeHoliday=')) s = s.slice(0, handlerIndex) + holidayHandler + s.slice(handlerIndex);

  const feesMarker = '<section id="fees"';
  const feesIndex = s.indexOf(feesMarker);
  if (feesIndex < 0) throw new Error('[fee-history] fees section marker not found');
  const panel = '<FeePaymentHistory show={true} history={paymentHistory} isSuperAdmin={isSuperAdmin} onDelete={deleteFeePayment} date={date} month={month} money={money} />\n ';
  if (!s.includes('<FeePaymentHistory show={true}')) s = s.slice(0, feesIndex) + panel + s.slice(feesIndex);

  const oldAction = '{out>0&&<button onClick={()=>setPayment(x=>({...x,feeId:f.id,amount:""}))} className="rounded-lg bg-green-700 px-3 py-2 text-xs font-black text-white">Pay</button>}';
  const newAction = '{f.fee_status==="holiday"?<button onClick={()=>restoreFeeAfterHoliday(f)} disabled={saving} className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-black text-amber-800">Restore Fee</button>:<><button onClick={()=>markFeeHoliday(f)} disabled={saving||Number(f.amount_paid)>0} className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-black text-amber-800">Holiday</button>{out>0&&<button onClick={()=>setPayment(x=>({...x,feeId:f.id,amount:""}))} className="rounded-lg bg-green-700 px-3 py-2 text-xs font-black text-white">Pay</button>}</>}';
  if (s.includes(oldAction)) s = s.replace(oldAction, newAction);

  const statusCellMarker = '<th className="p-3">Overdue</th>';
  if (s.includes(statusCellMarker) && !s.includes('<th className="p-3">Status</th>')) s = s.replace(statusCellMarker, statusCellMarker + '<th className="p-3">Status</th>');
  const overdueCell = '<td className={`p-3 font-black ${out?\'text-red-700\':\'text-green-700\'}`}>{money(out)}</td>';
  if (s.includes(overdueCell) && !s.includes('{f.fee_status==="holiday"?<td className="p-3">')) s = s.replace(overdueCell, overdueCell + '{f.fee_status==="holiday"?<td className="p-3"><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800">Holiday</span></td>:<td className="p-3"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${out?\'bg-red-100 text-red-700\':\'bg-green-100 text-green-700\'}`}>{out?"Due":"Paid"}</span></td>}');

  fs.writeFileSync(profilePath, s, 'utf8');
  console.log('[fee-history] payment history and monthly fee holiday option patched');
}
patchProfile();
