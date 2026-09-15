const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "app", "admin", "bulk-print", "page.tsx");
const source = fs.readFileSync(file, "utf8");

const oldCss = ".sheet{width:210mm;min-height:297mm;margin:0 auto;padding:10mm 3.4mm;background:#fff;display:grid;grid-template-columns:repeat(2,4in);grid-auto-rows:2.5in;align-content:start}";
const newCss = ".sheet{width:210mm;min-height:297mm;margin:0 auto;padding:5.5mm 2.4mm;background:#fff;display:grid;grid-template-columns:repeat(2,4in);grid-auto-rows:2.5in;row-gap:3mm;column-gap:2mm;align-content:start}";

if (source.includes(newCss)) {
  console.log("Bulk ID-card spacing is already applied.");
  process.exit(0);
}

if (!source.includes(oldCss)) {
  throw new Error("Safety check failed: expected Bulk ID-card CSS was not found. No changes made.");
}

const updated = source.replace(oldCss, newCss);
if (updated === source) {
  throw new Error("Safety check failed: source was not changed.");
}

fs.writeFileSync(file, updated, "utf8");
console.log("Applied safe Bulk ID-card print spacing adjustment.");
