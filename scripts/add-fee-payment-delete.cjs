const fs = require('fs');
const path = require('path');
const root = process.cwd();
const profilePath = path.join(root, 'app/admin/students/[studentId]/page.tsx');
function patchProfile() {
  if (!fs.existsSync(profilePath)) return;
  let s = fs.readFileSync(profilePath, 'utf8');
  if (s.includes('FeePaymentHistory')) return;
  const importMarker = 'import { supabase } from "../../../lib/supabase/client";';
  if (!s.includes(importMarker)) throw new Error('[fee-history] supabase import marker not found');
  s = s.replace(importMarker, importMarker + '\nimport FeePaymentHistory from "../../../../components/admin/FeePaymentHistory";');
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
  const feeSelectAudit = 'select("id,fee_month,amount_due,amount_paid,payment_date,payment_method,receipt_number,remarks,paid_by_admin_id,paid_by_admin_name,paid_by_admin_email")';
  s = s.replaceAll(feeSelect, feeSelectAudit);
  const setFeesMarker = 'setFees((ff.data||[]) as FeeLedger[]);';
  if (!s.includes(setFeesMarker)) throw new Error('[fee-history] setFees marker not found');
  const historyLoad = 'const {data:ph,error:phe}=await supabase.from("student_fee_payment_history").select("id,ledger_id,amount,payment_date,payment_method,receipt_number,remarks,entered_by_admin_id,entered_by_admin_name,entered_by_admin_email,created_at,deleted_at,deleted_by_admin_name,delete_reason").eq("admission_id",a.id).order("created_at",{ascending:false});if(!phe)setPaymentHistory(ph||[]);';
  if (!s.includes('from("student_fee_payment_history")')) s = s.replace(setFeesMarker, setFeesMarker + historyLoad);
  const handlerMarker = ' const currentFee=';
  const handlerIndex = s.indexOf(handlerMarker);
  if (handlerIndex < 0) throw new Error('[fee-history] currentFee marker not found');
  const handler = ' const deleteFeePayment=async(ledgerId:string)=>{if(!isSuperAdmin)return;if(!window.confirm("Delete this payment history record?"))return;setNotice("");setError("");const {error:e}=await supabase.rpc("delete_student_fee_payment",{p_ledger_id:ledgerId});if(e){setError(e.message||"Unable to delete fee payment record.");return}setNotice("Fee payment history deleted by Super Admin.");await load()};\n';
  if (!s.includes('const deleteFeePayment=')) s = s.slice(0, handlerIndex) + handler + s.slice(handlerIndex);
  const close = s.lastIndexOf('</main>');
  if (close < 0) throw new Error('[fee-history] profile main closing tag not found');
  const panel = '\n <FeePaymentHistory show={true} history={paymentHistory} isSuperAdmin={isSuperAdmin} onDelete={deleteFeePayment} date={date} month={month} money={money} />\n';
  s = s.slice(0, close) + panel + s.slice(close);
  fs.writeFileSync(profilePath, s, 'utf8');
  console.log('[fee-history] payment history restored and made visible');
}
patchProfile();
