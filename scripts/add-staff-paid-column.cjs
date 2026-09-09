const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "app/admin/staff-account/page.tsx");
if (!fs.existsSync(file)) process.exit(0);
let s = fs.readFileSync(file, "utf8");

const anchor = '  function staffLedger(staffId: string) {\n    return ledger.filter(x => x.staff_id === staffId).sort((a, b) => b.salary_month.localeCompare(a.salary_month));\n  }';
if (!s.includes("function totalPaidForStaff") && s.includes(anchor)) {
  s = s.replace(anchor, anchor + '\n\n  function totalPaidForStaff(staffId: string) {\n    return staffLedger(staffId).reduce((sum, row) => sum + Number(row.amount_paid || 0), 0);\n  }');
}

const payableHeader = '<th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-700">Total Payable</th>';
const paidHeader = '<th className="px-5 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-700">Total Paid</th>';
if (!s.includes('>Total Paid</th>') && s.includes(payableHeader)) {
  s = s.replace(payableHeader, paidHeader + payableHeader);
}

const payableCell = '<td className="px-5 py-4 text-sm font-black text-red-700">{s ? money(due) : "—"}</td>';
const paidCell = '<td className="px-5 py-4 text-sm font-black text-green-700">{s ? money(totalPaidForStaff(s.id)) : "—"}</td>';
if (!s.includes('totalPaidForStaff(s.id)') && s.includes(payableCell)) {
  s = s.replace(payableCell, paidCell + payableCell);
}

// Keep the empty-state colspan aligned with the added column.
s = s.replace('<td colSpan={6} className="px-5 py-12 text-center font-semibold text-slate-500">No staff found.</td>', '<td colSpan={7} className="px-5 py-12 text-center font-semibold text-slate-500">No staff found.</td>');

fs.writeFileSync(file, s);
console.log("[staff-paid-column] per-staff Total Paid column patch applied");
