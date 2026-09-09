const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "app/admin/staff-account/page.tsx");
if (!fs.existsSync(file)) process.exit(0);
let s = fs.readFileSync(file, "utf8");

if (!s.includes("const totalPaidForStaff =")) {
  const anchor = '  function staffLedger(staffId: string) {\n    return ledger.filter(x => x.staff_id === staffId).sort((a, b) => b.salary_month.localeCompare(a.salary_month));\n  }';
  const helper = anchor + '\n\n  function totalPaidForStaff(staffId: string) {\n    return staffLedger(staffId).reduce((sum, row) => sum + Number(row.amount_paid || 0), 0);\n  }';
  if (s.includes(anchor)) s = s.replace(anchor, helper);
}

// Add a dedicated Total Paid column next to Total Payable.
if (!s.includes('data-staff-paid-column="header"')) {
  const headerPatterns = [
    /(<th[^>]*>\s*Total Payable\s*<\/th>)/,
    /(<div[^>]*>\s*Total Payable\s*<\/div>)/,
    /(<span[^>]*>\s*Total Payable\s*<\/span>)/,
  ];
  for (const re of headerPatterns) {
    if (re.test(s)) {
      s = s.replace(re, '<th data-staff-paid-column="header" className="whitespace-nowrap">Total Paid</th>$1');
      break;
    }
  }
}

// Add the per-staff paid amount immediately before the existing payable amount cell.
if (!s.includes('data-staff-paid-cell')) {
  const cellPatterns = [
    /(<td[^>]*>[\s\S]{0,120}\{money\([^\n]{0,180}amount_due[^\n]{0,180}\)[\s\S]{0,120}<\/td>)/,
    /(<td[^>]*>[\s\S]{0,120}\{money\([^\n]{0,180}Math\.max\([^\n]{0,220}amount_due[^\n]{0,220}\)[\s\S]{0,120}<\/td>)/,
  ];
  for (const re of cellPatterns) {
    if (re.test(s)) {
      s = s.replace(re, '<td data-staff-paid-cell className="whitespace-nowrap font-extrabold text-green-700">{money(totalPaidForStaff(s.id))}</td>$1');
      break;
    }
  }
}

// Fallback for compact JSX tables where the payable cell is an expression without a td body match.
if (!s.includes('data-staff-paid-cell')) {
  const fallback = /(\{money\(staffLedger\(s\.id\)\.reduce\([\s\S]{0,500}?\)\)\})/;
  if (fallback.test(s)) {
    s = s.replace(fallback, '{money(totalPaidForStaff(s.id))}</td><td data-staff-paid-cell className="whitespace-nowrap font-extrabold text-green-700">$1');
  }
}

fs.writeFileSync(file, s);
console.log("[staff-paid-column] per-staff Total Paid column patch applied");
