const fs = require('fs');

function replaceBetween(file, startNeedle, endNeedle, replacement) {
  let src = fs.readFileSync(file, 'utf8');
  const start = src.indexOf(startNeedle);
  const end = src.indexOf(endNeedle, start + startNeedle.length);
  if (start < 0 || end < 0) {
    console.log(`[id-card-size] skipped ${file}: anchors not found`);
    return;
  }
  src = src.slice(0, start) + replacement + src.slice(end);
  fs.writeFileSync(file, src);
  console.log(`[id-card-size] patched ${file}`);
}

const adminPrint = String.raw`function printWindow(title:string,body:string){
  const w=window.open("","_blank","width=1100,height=900");if(!w)return;
  const isId=title.toLowerCase().includes("id card");
  const common='*{box-sizing:border-box}html,body{margin:0;padding:0;color:#14231a;font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}';
  const idCss=common+'body{background:#fff;padding:0}.idcard{width:4in!important;height:2.5in!important;max-width:none!important;margin:0!important;border:1px solid #b8d9c4;overflow:hidden;background:#fff}.idtop{height:.70in;background:linear-gradient(135deg,#043b20,#0b9147);color:#fff;padding:.10in .14in;display:flex;align-items:center;gap:.10in}.idtop img{width:.48in;height:.48in;object-fit:contain;background:#fff;border-radius:50%;padding:2px}.idtop h1{margin:0;font-size:14px;line-height:1.1}.idtop .urdu{font-size:12px;font-weight:800;margin-top:2px}.idbody{height:1.43in;padding:.12in .14in;display:grid;grid-template-columns:.78in 1fr;gap:.14in}.photo,.ph{width:.72in;height:.90in;object-fit:cover;border:2px solid #d8f0e0;border-radius:7px}.ph{background:#eaf7ee;color:#08783b;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900}.idname{font-size:15px;font-weight:900;line-height:1.1}.idline{display:grid;grid-template-columns:1fr 1fr;gap:3px 8px;margin-top:5px}.idline div{border-bottom:1px solid #dce8e0;padding-bottom:2px;line-height:1.05}.idline small{font-size:6px;color:#64756b}.idline strong{font-size:7px}.idfoot{height:.37in;background:#eef8f2;padding:.07in .14in;display:flex;justify-content:space-between;font-size:6px;color:#52665b}@page{size:A4 portrait;margin:10mm}@media print{html,body{width:auto;height:auto}.idcard{width:4in!important;height:2.5in!important;break-inside:avoid;page-break-inside:avoid;transform:none!important;zoom:1!important}}';
  const normalCss=common+'body{background:#edf3ef;padding:24px}.sheet{max-width:1000px;margin:auto;background:#fff;border:1px solid #cbdad0;box-shadow:0 18px 50px rgba(0,0,0,.12);padding:34px}.brand{display:flex;align-items:center;gap:18px;border-bottom:4px double #0a7139;padding-bottom:16px}.brand img{width:86px;height:86px;object-fit:contain}.brand h1{margin:0;color:#075c2d;font-size:28px}.brand .urdu{font-size:23px;font-weight:800;color:#075c2d;margin-top:3px}.brand p{margin:4px 0;color:#607166}.meta{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid #cfdad3;margin-top:18px}.meta div{padding:10px 12px;border-right:1px solid #cfdad3}.meta div:last-child{border-right:0}.label{font-size:9px;text-transform:uppercase;letter-spacing:.12em;color:#64756b;font-weight:800}.value{font-size:13px;font-weight:800;margin-top:4px}.studentbox{margin-top:16px;padding:14px;background:#f4f8f5;border:1px solid #d6e4da}.table{width:100%;border-collapse:collapse;margin-top:18px}.table th,.table td{border:1px solid #c9d6ce;padding:9px 10px;font-size:12px}.table th{background:#075c2d;color:#fff;text-align:center}.table td:not(:first-child){text-align:center}.table tr:nth-child(even) td{background:#f8fbf9}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px}.summary .box{border:1px solid #cfdad3;padding:12px;text-align:center}.result-banner{margin-top:16px;border:2px solid #075c2d;padding:12px;text-align:center;font-size:18px;font-weight:900;color:#075c2d}.remarks{margin-top:16px;border:1px solid #d6e1da;padding:12px;min-height:55px}.sign{display:grid;grid-template-columns:1fr 1fr;gap:120px;margin-top:75px}.sign div{border-top:1px solid #5d6b63;text-align:center;padding-top:7px;font-size:11px}@media print{@page{size:A4 portrait;margin:8mm}body{padding:0;background:#fff}.sheet{border:0;box-shadow:none;max-width:none;padding:0}.brand img{width:70px;height:70px}.table th,.table td{font-size:10px;padding:7px}.result-banner{break-inside:avoid}}';
  w.document.write('<!doctype html><html><head><title>'+safe(title)+'</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+(isId?idCss:normalCss)+'</style></head><body>'+(isId?body:'<div class="sheet">'+body+'</div>')+'<script>window.onload=function(){setTimeout(function(){window.print()},350)};<\\/script></body></html>');
  w.document.close();
}

`;

const studentPrint = String.raw`  function openPrint(title:string,html:string){
    const w=window.open("","_blank","width=1100,height=900");if(!w)return;
    const isId=title.toLowerCase().includes("id card");
    const common='*{box-sizing:border-box}html,body{margin:0;padding:0;color:#17231c;font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}';
    const idCss=common+'body{background:#fff;padding:0}.idcard{width:4in!important;height:2.5in!important;max-width:none!important;margin:0!important;overflow:hidden;border:1px solid #b8d9c4;background:#fff}.idtop{height:.70in;background:linear-gradient(135deg,#043b20,#0b9147);color:#fff;padding:.10in .14in;display:flex;align-items:center;gap:.10in}.idtop img{width:.48in;height:.48in;object-fit:contain;background:#fff;border-radius:50%;padding:2px}.idtop h1{margin:0;font-size:14px;line-height:1.1}.idtop .urdu{font-size:12px;font-weight:800;margin-top:2px}.idbody{height:1.43in;padding:.12in .14in;display:grid;grid-template-columns:.78in 1fr;gap:.14in}.photo,.ph{width:.72in;height:.90in;object-fit:cover;border:2px solid #d8f0e0;border-radius:7px}.ph{background:#eaf7ee;color:#08783b;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900}.idname{font-size:15px;font-weight:900;line-height:1.1}.idline{display:grid;grid-template-columns:1fr 1fr;gap:3px 8px;margin-top:5px}.idline div{border-bottom:1px solid #dce8e0;padding-bottom:2px;line-height:1.05}.idline small{font-size:6px;color:#64756b}.idline strong{font-size:7px}.idfoot{height:.37in;background:#eef8f2;padding:.07in .14in;display:flex;justify-content:space-between;font-size:6px;color:#52665b}@page{size:A4 portrait;margin:10mm}@media print{html,body{width:auto;height:auto}.idcard{width:4in!important;height:2.5in!important;break-inside:avoid;page-break-inside:avoid;transform:none!important;zoom:1!important}}';
    const normalCss=common+'body{background:#eef3f0}.sheet{width:190mm;min-height:267mm;margin:8mm auto;background:#fff;border:1px solid #aabbb0;padding:9mm;position:relative}@page{size:A4 portrait;margin:8mm}@media print{body{background:#fff}.sheet{width:auto;min-height:auto;margin:0;border:0;padding:4mm}}';
    w.document.write('<!doctype html><html><head><title>'+esc(title)+'</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+(isId?idCss:normalCss)+'</style></head><body>'+(isId?html:'<div class="sheet">'+html+'</div>')+'<script>window.onload=function(){setTimeout(function(){window.print()},250)};<\\/script></body></html>');
    w.document.close();
  }
`;

replaceBetween('app/admin/students/[studentId]/page.tsx', 'function printWindow(title:string,body:string){', '\n\nexport default function StudentProfilePage()', adminPrint);
replaceBetween('app/student/dashboard/page.tsx', '  function openPrint(title:string,html:string){', '  async function downloadPdf(', studentPrint);
