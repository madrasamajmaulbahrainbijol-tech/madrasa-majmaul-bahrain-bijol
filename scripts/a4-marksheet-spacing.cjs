const fs = require('fs');
const file = 'app/admin/students/[studentId]/page.tsx';
let text = fs.readFileSync(file, 'utf8');

// Correct the only hard-coded location currently used by the marksheet generator.
text = text.replace(/BIJOL, AURANGABAD, BIHAR/g, 'BIJOL KATIHAR BIHAR');
text = text.replace(/BIJOL,\s*AURANGABAD,\s*BIHAR/gi, 'BIJOL KATIHAR BIHAR');
text = text.replace(/PATNA,\s*BIHAR/gi, 'BIJOL KATIHAR BIHAR');

// The marksheet is generated inside printWindow(). Keep the A4 page, but use the
// lower area for the actual academic document instead of a large empty footer.
const replacements = [
  ['.marksheet{position:relative;width:210mm;height:297mm;overflow:hidden;background:#fff;margin:0 auto;padding:7mm;', '.marksheet{position:relative;width:210mm;height:297mm;overflow:hidden;background:#fff;margin:0 auto;padding:6mm;'],
  ['.ms-head{display:grid;grid-template-columns:25mm 1fr 30mm;align-items:center;gap:4mm;padding:3mm 2mm 2mm;', '.ms-head{display:grid;grid-template-columns:24mm 1fr 28mm;align-items:center;gap:3mm;padding:2.5mm 2mm 1.5mm;'],
  ['.seal img{width:23mm;height:23mm;', '.seal img{width:21mm;height:21mm;'],
  ['.urdu-title{font-size:17px;', '.urdu-title{font-size:16px;'],
  ['.head-center h1{font-family:Georgia,serif;font-size:20px;', '.head-center h1{font-family:Georgia,serif;font-size:19px;'],
  ['.student-info{position:relative;border:1px solid #8aa697;min-height:39mm;', '.student-info{position:relative;border:1px solid #8aa697;min-height:38mm;'],
  ['.info-grid>div{display:grid;grid-template-columns:29mm 1fr;gap:2mm;min-height:7mm;padding:1.4mm 2mm;', '.info-grid>div{display:grid;grid-template-columns:29mm 1fr;gap:2mm;min-height:7.5mm;padding:1.6mm 2mm;'],
  ['.marks{width:100%;border-collapse:collapse;margin-top:2mm;font-size:7.4px}', '.marks{width:100%;border-collapse:collapse;margin-top:2mm;font-size:7.5px;table-layout:fixed}'],
  ['.marks th,.marks td{border:1px solid #81998c;padding:1.35mm 1mm;', '.marks th,.marks td{border:1px solid #81998c;padding:1.8mm 1.1mm;'],
  ['.marks td.sub{text-align:left;font-weight:800;padding-left:2mm}', '.marks td.sub{text-align:left;font-weight:800;padding-left:2mm}.marks tbody tr{height:16mm}'],
  ['.aggregate{display:grid;grid-template-columns:1.25fr 1fr 1fr 1fr;margin-top:2mm;', '.aggregate{display:grid;grid-template-columns:1.25fr 1fr 1fr 1fr;margin-top:2.5mm;'],
  ['.aggregate>div{padding:2mm 1.5mm;', '.aggregate>div{padding:2.4mm 1.5mm;'],
  ['.grade-note{margin-top:1.8mm;', '.grade-note{margin-top:2.2mm;'],
  ['.remarks{margin-top:1.8mm;border:1px solid #b8c8bf;min-height:9mm;', '.remarks{margin-top:2.2mm;border:1px solid #b8c8bf;min-height:11mm;'],
  ['.authority{display:grid;grid-template-columns:1.15fr 1fr 1fr 1fr;gap:4mm;align-items:end;margin-top:13mm;min-height:20mm}', '.authority{display:grid;grid-template-columns:1.15fr 1fr 1fr 1fr;gap:4mm;align-items:end;margin-top:8mm;min-height:18mm}'],
  ['.stamp{height:17mm;', '.stamp{height:15mm;'],
  ['.sign{height:13mm;', '.sign{height:12mm;'],
  ['.ms-footer{display:flex;justify-content:space-between;gap:8mm;margin-top:5mm;', '.ms-footer{display:flex;justify-content:space-between;gap:8mm;margin-top:3mm;'],
  ['.ms-head{display:grid;grid-template-columns:25mm 1fr 30mm;', '.ms-head{display:grid;grid-template-columns:24mm 1fr 28mm;'],
];

for (const [from, to] of replacements) text = text.replace(from, to);

// Keep browser print output exactly one A4 page.
text = text.replace('@page{size:A4 portrait;margin:0}', '@page{size:A4 portrait;margin:0}');

fs.writeFileSync(file, text, 'utf8');
console.log('A4 marksheet spacing/location patch applied');
