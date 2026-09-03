const fs = require('fs');
const file = 'app/admin/students/[studentId]/page.tsx';
let text = fs.readFileSync(file, 'utf8');

const idCss = String.raw`
*{box-sizing:border-box}html,body{margin:0;padding:0;background:#f3f5f4;color:#14231a;font-family:Arial,Helvetica,sans-serif}
.id-page{width:210mm;height:297mm;margin:0 auto;padding:12mm 0;display:flex;align-items:flex-start;justify-content:center;background:#fff}
.idcard{width:4in;height:2.5in;margin:0;overflow:hidden;isolation:isolate;border:1px solid #b8d9c4;border-radius:.16in;background:#fff;box-shadow:0 4px 14px rgba(0,0,0,.10)}
.idtop{height:.72in;background:linear-gradient(135deg,#043b20,#0b9147);color:#fff;padding:.08in .14in;display:flex;align-items:center;gap:.10in}
.idtop img{width:.48in;height:.48in;object-fit:contain;background:#fff;border-radius:50%;padding:2px}
.idtop h1{margin:0;font-size:9px;line-height:1.12;font-weight:900;letter-spacing:.01em}.idtop .urdu{font-size:18px;font-weight:900;line-height:1.05;margin:0 0 2px}
.idbody{height:1.40in;padding:.10in .14in;display:grid;grid-template-columns:.78in minmax(0,1fr);gap:.14in}
.photo{width:.72in;height:.90in;object-fit:cover;border:2px solid #d8f0e0;border-radius:7px}.ph{width:.72in;height:.90in;background:#eaf7ee;color:#08783b;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;border-radius:7px}
.idname{font-size:15px;font-weight:900;line-height:1.05}.idline{display:grid;grid-template-columns:1fr 1fr;gap:3px 8px;margin-top:4px}.idline div{min-width:0;border-bottom:1px solid #dce8e0;padding-bottom:2px;line-height:1.05}.idline small{font-size:6px;color:#64756b}.idline strong{font-size:7px;display:block;white-space:normal;overflow-wrap:anywhere}.idline .address{grid-column:1/-1}
.idfoot{height:.38in;background:#eef8f2;padding:.07in .14in;display:flex;justify-content:space-between;gap:8px;font-size:6px;color:#52665b;border-radius:0 0 .14in .14in}
@page{size:A4 portrait;margin:0}@media print{html,body{width:210mm;height:297mm;background:#fff}.id-page{width:210mm;height:297mm;padding:12mm 0}.idcard{box-shadow:none!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
`;

const resultCss = String.raw`
*{box-sizing:border-box}html,body{margin:0;padding:0;background:#fff;color:#16231b;font-family:Arial,Helvetica,sans-serif}
@page{size:A4 portrait;margin:0}
body{width:210mm;min-height:297mm}
.marksheet-page{width:210mm;height:297mm;padding:9mm 11mm;overflow:hidden;background:#fff}
.result-document{width:188mm;height:279mm;overflow:hidden;border:1.1px solid #0a7139;background:#fff;position:relative;padding:0 5mm 4mm}
.official{height:7mm;margin:0 -5mm;padding:1.8mm 5mm;background:#075c2d;color:#fff;text-align:center;font-size:7.2px;font-weight:900;letter-spacing:.12em;white-space:nowrap}
.brand{height:25mm;display:flex;align-items:center;gap:5mm;border-bottom:1.2px solid #b28a2e;padding:3mm 0 2.5mm}
.brand img{width:20mm;height:20mm;object-fit:contain;flex:0 0 auto}
.brand h1{margin:0;color:#075c2d;font-size:18px;font-weight:900;line-height:1.05}.brand .urdu{margin-top:1mm;color:#075c2d;font-size:15px;font-weight:900;line-height:1.05}.brand p{margin:1mm 0 0;color:#52665b;font-size:8px;font-weight:700}
.title{margin:2.5mm 0 2mm;text-align:center;color:#075c2d;font-size:13px;font-weight:900;letter-spacing:.08em;border-bottom:1px solid #d7c38b;padding-bottom:1.5mm}
.meta{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid #c9d6ce;height:15mm}.meta>div{padding:2mm 2.2mm;border-right:1px solid #c9d6ce;min-width:0}.meta>div:last-child{border-right:0}.label{font-size:6.2px;text-transform:uppercase;letter-spacing:.08em;color:#64756b;font-weight:900}.value{font-size:9px;font-weight:900;margin-top:.8mm;line-height:1.05;overflow-wrap:anywhere}
.studentbox{height:30mm;margin-top:2.5mm;padding:2.5mm;border:1px solid #c9d6ce;background:#f7faf8;display:grid;grid-template-columns:27mm 1fr;gap:3mm;align-items:center;overflow:hidden}
.student-photo{width:25mm;height:25mm;object-fit:cover;border:1px solid #b28a2e;border-radius:2mm;background:#fff}
.studentgrid{display:grid;grid-template-columns:1fr 1fr;gap:2.5mm 6mm;min-width:0}.studentgrid>div{min-width:0}
.table{width:100%;border-collapse:collapse;margin-top:2.5mm;table-layout:fixed}.table th,.table td{border:1px solid #bfcfc4;padding:1.65mm 1.2mm;font-size:7.5px;line-height:1.05;text-align:center;overflow:hidden;overflow-wrap:anywhere}.table th{background:#075c2d;color:#fff;font-size:7px;font-weight:900}.table th:nth-child(1){width:7%}.table th:nth-child(2){width:25%;text-align:left}.table th:nth-child(3){width:11%}.table th:nth-child(4){width:11%}.table th:nth-child(5){width:10%}.table th:nth-child(6){width:10%}.table th:nth-child(7){width:11%}.table th:nth-child(8){width:15%}.table td:nth-child(2){text-align:left;font-weight:700}.table tr:nth-child(even) td{background:#f8fbf9}
.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:2mm;margin-top:2.5mm;height:15mm}.summary .box{border:1px solid #c9d6ce;padding:2mm;text-align:center;min-width:0}.summary .value{font-size:10px}
.result-banner{height:10mm;margin-top:2.5mm;border:1.2px solid #075c2d;display:flex;align-items:center;justify-content:center;color:#075c2d;font-size:12px;font-weight:900;letter-spacing:.08em}
.remarks{height:13mm;margin-top:2.5mm;border:1px solid #d0ddd5;padding:2mm 2.5mm;font-size:7.5px;overflow:hidden}.remarks strong{font-size:7.5px}
.sign{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10mm;margin-top:10mm;height:10mm}.sign div{border-top:1px solid #53655a;text-align:center;padding-top:1.5mm;font-size:7px;font-weight:700}
.stamp-space{height:14mm;width:38mm;margin:0 auto;border:1px dashed #aab8af;text-align:center;position:relative}.stamp-space:after{content:'OFFICIAL STAMP';position:absolute;left:0;right:0;top:5mm;font-size:6px;color:#849188;font-weight:800;letter-spacing:.08em}
.footerline{position:absolute;left:5mm;right:5mm;bottom:2mm;border-top:1px solid #d8e2dc;padding-top:1.5mm;display:flex;justify-content:space-between;font-size:6px;color:#68786f;font-weight:700}
@media print{html,body{width:210mm;height:297mm;background:#fff}.marksheet-page{width:210mm;height:297mm;padding:9mm 11mm;overflow:hidden}.result-document{height:279mm;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact}.table,.studentbox,.summary,.result-banner,.remarks,.sign,.stamp-space{break-inside:avoid;page-break-inside:avoid}}
`;

const replacement =
  'function printWindow(title:string,body:string){\n' +
  ' const w=window.open("","_blank","width=1100,height=900");if(!w)return;\n' +
  ' const isId=title.toLowerCase().includes("id card");\n' +
  ' const css=isId?' + JSON.stringify(idCss) + ':' + JSON.stringify(resultCss) + ';\n' +
  ' w.document.write(`<!doctype html><html><head><title>${safe(title)}</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body>${isId?`<div class="id-page">${body}</div>`:`<div class="marksheet-page">${body}</div>`}<script>window.onload=function(){setTimeout(function(){window.print()},350)};<\\/script></body></html>`);w.document.close()\n' +
  '}';

const re = /function printWindow\(title:string,body:string\)\{[\s\S]*?\n\}\n\nexport default/;
if (!re.test(text)) throw new Error('printWindow function not found');
text = text.replace(re, replacement + '\n\nexport default');
fs.writeFileSync(file, text, 'utf8');
console.log('Admin marksheet print fixed: A4 one page, student photo, madrasa logo, signatures and stamp space.');
