const fs = require('fs');
const path = require('path');

const root = process.cwd();
const feePage = path.join(root, 'app/admin/fee-account/page.tsx');
const studentPage = path.join(root, 'app/admin/students/[studentId]/page.tsx');

function patch(file, changes, label) {
  if (!fs.existsSync(file)) return;
  let src = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [from, to] of changes) {
    if (src.includes(to)) continue;
    if (!src.includes(from)) continue;
    src = src.replace(from, to);
    changed = true;
  }
  if (changed) fs.writeFileSync(file, src);
  console.log(`[fee-audit] ${label}: ${changed ? 'patched' : 'already patched or marker unavailable'}`);
}

patch(feePage, [
  ['type Ledger={id:string;admission_id:string;fee_month:string;amount_due:number;amount_paid:number;payment_date:string|null;payment_method:string|null;receipt_number:string|null;remarks:string|null};','type Ledger={id:string;admission_id:string;fee_month:string;amount_due:number;amount_paid:number;payment_date:string|null;payment_method:string|null;receipt_number:string|null;remarks:string|null;paid_by_admin_id:string|null;paid_by_admin_name:string|null;paid_by_admin_email:string|null};'],
  ['select("id,admission_id,fee_month,amount_due,amount_paid,payment_date,payment_method,receipt_number,remarks")','select("id,admission_id,fee_month,amount_due,amount_paid,payment_date,payment_method,receipt_number,remarks,paid_by_admin_id,paid_by_admin_name,paid_by_admin_email")'],
  ['out.push({student:s,amount:Number(l.amount_paid||0),payment_date:l.payment_date,method:l.payment_method||"—",receipt:l.receipt_number||"—",month:l.fee_month,remarks:l.remarks||""})','out.push({student:s,amount:Number(l.amount_paid||0),payment_date:l.payment_date,method:l.payment_method||"—",receipt:l.receipt_number||"—",month:l.fee_month,remarks:l.remarks||"",paidBy:l.paid_by_admin_name||l.paid_by_admin_email||"—"})'],
  ['<th className="p-3 text-left">Receipt</th><th className="p-3 text-right">Amount</th>','<th className="p-3 text-left">Receipt</th><th className="p-3 text-left">Entered By</th><th className="p-3 text-right">Amount</th>'],
  ['<td className="p-4">{x.receipt}</td><td className="p-4 text-right font-black text-green-700">{money(x.amount)}</td>','<td className="p-4">{x.receipt}</td><td className="p-4"><div className="font-black text-slate-800">{x.paidBy||"—"}</div><div className="text-xs text-slate-400">Admin who entered this fee</div></td><td className="p-4 text-right font-black text-green-700">{money(x.amount)}</td>']
], 'Fee & Account audit UI');

if (fs.existsSync(feePage)) {
  let src = fs.readFileSync(feePage, 'utf8');
  const m = src.match(/type Collection=\{([^}]*)\};/);
  if (m && !m[1].includes('paidBy')) {
    src = src.replace(m[0], `type Collection={${m[1]};paidBy?:string};`);
    fs.writeFileSync(feePage, src);
    console.log('[fee-audit] Collection paidBy type: patched');
  }
}

patch(studentPage, [
  ['type FeeLedger={id:string;fee_month:string;amount_due:number;amount_paid:number;payment_date:string|null;payment_method:string|null;receipt_number:string|null;remarks:string|null};','type FeeLedger={id:string;fee_month:string;amount_due:number;amount_paid:number;payment_date:string|null;payment_method:string|null;receipt_number:string|null;remarks:string|null;paid_by_admin_id:string|null;paid_by_admin_name:string|null;paid_by_admin_email:string|null};'],
  ['select("id,fee_month,amount_due,amount_paid,payment_date,payment_method,receipt_number,remarks")','select("id,fee_month,amount_due,amount_paid,payment_date,payment_method,receipt_number,remarks,paid_by_admin_id,paid_by_admin_name,paid_by_admin_email")'],
  ['const currentFee=feeSettings.find(x=>x.active)?.monthly_fee||0;','const currentFee=feeSettings.find(x=>x.active)?.monthly_fee||0;const lastFeePayment=[...fees].find(x=>Number(x.amount_paid||0)>0);'],
], 'Student profile audit data');

if (fs.existsSync(studentPage)) {
  let src = fs.readFileSync(studentPage, 'utf8');
  if (!src.includes('data-audit="fee-admin"')) {
    const banner = `{lastFeePayment&&<div data-audit="fee-admin" className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm"><span className="font-black text-blue-900">Last fee entry:</span> <span className="font-bold text-blue-800">{lastFeePayment.paid_by_admin_name||lastFeePayment.paid_by_admin_email||"Admin"}</span>{lastFeePayment.payment_date&&<span className="text-blue-700"> • {date(lastFeePayment.payment_date)}</span>}<span className="ml-2 text-blue-600">(admin who entered the latest payment)</span></div>}`;
    const re = /return <main className="[^"]+">/;
    if (re.test(src)) {
      src = src.replace(re, m => `${m}${banner}`);
      fs.writeFileSync(studentPage, src);
      console.log('[fee-audit] Student profile latest admin banner: patched');
    } else console.log('[fee-audit] Student profile latest admin banner: marker unavailable');
  } else console.log('[fee-audit] Student profile latest admin banner: already patched');
}

console.log('[fee-audit] Yearly fee/salary model: effective-dated settings are preserved; new rates apply from their effective month while paid historical months remain unchanged.');
