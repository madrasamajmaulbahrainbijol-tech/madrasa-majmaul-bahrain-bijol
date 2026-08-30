const fs = require('fs');

const file = 'app/student/dashboard/page.tsx';
let text = fs.readFileSync(file, 'utf8');

// Idempotent production patch for the student portal.
if (text.includes('STUDENT_PORTAL_COMPLETE_V2')) process.exit(0);

text = text.replace('const LOGO = "/logo.png";', 'const LOGO = "/madrasa-logo.jpg";\nconst STUDENT_PORTAL_COMPLETE_V2 = true;');

if (!text.includes('function parseMessage(')) {
  text = text.replace(
    'function grade(p: number) { if (p >= 90) return "A+"; if (p >= 80) return "A"; if (p >= 70) return "B+"; if (p >= 60) return "B"; if (p >= 50) return "C"; if (p >= 40) return "D"; return "F"; }',
    'function grade(p: number) { if (p >= 90) return "A+"; if (p >= 80) return "A"; if (p >= 70) return "B+"; if (p >= 60) return "B"; if (p >= 50) return "C"; if (p >= 40) return "D"; return "F"; }\nfunction parseMessage(v: string | null | undefined) { const out: Record<string,string> = {}; for (const line of String(v || "").split("\\n")) { const i = line.indexOf(":"); if (i > 0) out[line.slice(0,i).trim()] = line.slice(i+1).trim(); } return out; }'
  );
}

text = text.replace(
  '[fees,setFees]=useState<any[]>([]),[busy,setBusy]=useState("");',
  '[fees,setFees]=useState<any[]>([]),[busy,setBusy]=useState(""),[photoUrl,setPhotoUrl]=useState(""),[documentUrl,setDocumentUrl]=useState(""),[certificateUrl,setCertificateUrl]=useState("");'
);

text = text.replace(
  'student_photo_url,student_document_type,student_document_url,certificate_type,certificate_url,student_id,status,approved_at,created_at',
  'student_photo_url,student_document_type,student_document_url,certificate_type,certificate_url,student_id,status,approved_at,created_at,message'
);

text = text.replace(
  'if(fe.error)throw fe.error;setAdmission(a.data);setAttendance(at.data||[]);setExams(ex.data||[]);setFees(fe.data||[]);',
  'if(fe.error)throw fe.error;setAdmission(a.data);setAttendance(at.data||[]);setExams(ex.data||[]);setFees(fe.data||[]);const parsed=parseMessage(a.data?.message);const signed=async(path:string|null|undefined)=>{if(!path)return"";if(/^https?:\\/\\//i.test(path))return path;const {data}=await supabase.storage.from("admission-documents").createSignedUrl(path,3600);return data?.signedUrl||""};setPhotoUrl(await signed(a.data?.student_photo_url||parsed["Student Photo"]));setDocumentUrl(await signed(a.data?.student_document_url||parsed["Identity Proof"]));setCertificateUrl(await signed(a.data?.certificate_url||parsed["Certificate"]));'
);

text = text.replace(
  'const feeSummary=useMemo(()=>{const due=fees.reduce((s,x)=>s+Number(x.amount_due||0),0),paid=fees.reduce((s,x)=>s+Number(x.amount_paid||0),0);return{due,paid,balance:Math.max(0,due-paid)};},[fees]);',
  'const feeSummary=useMemo(()=>{const due=fees.reduce((s,x)=>s+Number(x.amount_due||0),0),paid=fees.reduce((s,x)=>s+Number(x.amount_paid||0),0);return{due,paid,balance:Math.max(0,due-paid)};},[fees]);\n  const msg=useMemo(()=>parseMessage(admission?.message),[admission?.message]);\n  const detail=(primary:unknown,...keys:string[])=>primary||keys.map(k=>msg[k]).find(Boolean)||"—";'
);

text = text.replaceAll('admission.student_photo_url', 'photoUrl');
text = text.replaceAll('admission.student_document_url || admission.certificate_url', 'documentUrl || certificateUrl');
text = text.replaceAll('admission.student_document_url||admission.certificate_url', 'documentUrl||certificateUrl');

const fieldReplacements = [
  ['value={admission.father_name}', 'value={detail(admission.father_name,"Father\\\'s Name")}'],
  ['value={admission.mother_name}', 'value={detail(admission.mother_name,"Mother\\\'s Name")}'],
  ['value={admission.guardian_name}', 'value={detail(admission.guardian_name,"Guardian Name")}'],
  ['value={admission.guardian_relation}', 'value={detail(admission.guardian_relation,"Guardian Relationship","Guardian Relation")}'],
  ['value={admission.mobile}', 'value={detail(admission.mobile,"Mobile Number 1","Mobile")}'],
  ['value={admission.contact_number_2 || admission.alternate_mobile}', 'value={detail(admission.contact_number_2||admission.alternate_mobile,"Mobile Number 2")}'],
  ['value={admission.previous_education}', 'value={detail(admission.previous_education,"Previous Education")}'],
  ['value={admission.occupation}', 'value={detail(admission.occupation,"Parent Occupation","Occupation")}'],
  ['value={admission.full_address || admission.address}', 'value={detail(admission.full_address||admission.address,"Address","Full Address")}'],
  ['value={admission.village_city || admission.city}', 'value={detail(admission.village_city||admission.city,"Village / Town","Village / City")}'],
  ['value={admission.post_office}', 'value={detail(admission.post_office,"Post Office")}'],
  ['value={admission.district}', 'value={detail(admission.district,"District")}'],
  ['value={admission.state}', 'value={detail(admission.state,"State")}'],
  ['value={admission.pin_code}', 'value={detail(admission.pin_code,"PIN Code","Pincode")}'],
  ['value={admission.country}', 'value={detail(admission.country,"Country")}']
];
for (const [from,to] of fieldReplacements) text = text.replace(from,to);

text = text.replace(
  '<div><p className="text-xs font-black uppercase tracking-[2px] text-green-700">Madrasa Majmaul Bahrain Bijol</p><h1 className="mt-1 text-lg font-black sm:text-xl">Student Portal</h1></div>',
  '<div className="flex items-center gap-3"><img src={LOGO} alt="Madrasa Logo" className="h-12 w-12 rounded-xl bg-white object-contain p-1 ring-1 ring-slate-200"/><div><p className="text-xs font-black uppercase tracking-[2px] text-green-700">Madrasa Majmaul Bahrain Bijol</p><h1 className="mt-1 text-lg font-black sm:text-xl">Student Portal</h1></div></div>'
);

const printCss = `*{box-sizing:border-box}body{margin:0;background:#e9eeeb;color:#17231c;font-family:Arial,Helvetica,sans-serif;padding:22px}.sheet{position:relative;max-width:1040px;margin:auto;background:#fff;border:1px solid #aebdb4;box-shadow:0 20px 60px rgba(0,0,0,.14);padding:30px;overflow:hidden}.official{position:relative;border:2px solid #075c2d;padding:7px;text-align:center;font-size:9px;font-weight:900;letter-spacing:.2em;color:#075c2d;text-transform:uppercase}.brand{position:relative;display:flex;align-items:center;justify-content:center;gap:18px;border-bottom:4px double #075c2d;padding:15px 8px 17px}.brand img{width:88px;height:88px;object-fit:contain}.brand h1{margin:0;color:#075c2d;font-size:30px;line-height:1.15}.brand .urdu{font-size:25px;font-weight:900;color:#075c2d;margin-top:5px}.brand p{margin:5px 0 0;color:#607166;font-size:11px;font-weight:700;letter-spacing:.06em}.title{position:relative;margin:17px auto 12px;width:max-content;max-width:100%;border:2px solid #075c2d;border-radius:4px;padding:8px 28px;color:#075c2d;font-size:20px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.meta{position:relative;display:grid;grid-template-columns:repeat(4,1fr);border:1px solid #b9c9c0;margin-top:12px}.meta div{padding:10px 12px;border-right:1px solid #c9d5ce}.meta div:last-child{border-right:0}.label{font-size:8px;text-transform:uppercase;letter-spacing:.12em;color:#66766d;font-weight:900}.value{font-size:13px;font-weight:900;margin-top:4px}.studentbox{position:relative;margin-top:14px;border:1px solid #b9c9c0;background:#f5f8f6;padding:13px}.studentgrid{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid #c5d1ca}.studentgrid div{padding:9px 11px;border-right:1px solid #c5d1ca;border-bottom:1px solid #c5d1ca}.studentgrid div:nth-child(even){border-right:0}.photo{float:right;width:76px;height:92px;object-fit:cover;border:2px solid #075c2d;margin:0 0 7px 10px}.table{position:relative;width:100%;border-collapse:collapse;margin-top:16px}.table th,.table td{border:1px solid #aebdb4;padding:9px 8px;font-size:11px}.table th{background:#075c2d;color:#fff;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:.04em}.table td:not(:nth-child(2)){text-align:center}.table tr:nth-child(even) td{background:#f7faf8}.summary{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px}.summary .box,.box{border:1px solid #b9c9c0;padding:10px;text-align:center;background:#fbfcfb}.result-banner,.result{position:relative;margin-top:14px;border:2px solid #075c2d;background:#eef7f1;padding:12px;text-align:center;font-size:18px;font-weight:900;color:#075c2d;letter-spacing:.08em}.grading{position:relative;margin-top:14px;border:1px solid #c5d1ca;padding:10px}.grading strong{color:#075c2d}.remarks{position:relative;margin-top:12px;border:1px solid #c5d1ca;padding:11px;min-height:50px}.sign{position:relative;display:grid;grid-template-columns:1fr 1fr 1fr;gap:45px;margin-top:62px}.sign div{border-top:1px solid #56645c;text-align:center;padding-top:7px;font-size:10px;font-weight:700}.footer,.footerline{position:relative;margin-top:18px;border-top:2px solid #075c2d;padding-top:7px;display:flex;justify-content:space-between;font-size:8px;color:#637168}@media(max-width:700px){body{padding:8px}.sheet{padding:16px}.meta,.summary{grid-template-columns:1fr 1fr}.sign{grid-template-columns:1fr}.brand h1{font-size:22px}.brand .urdu{font-size:21px}}@media print{body{padding:0;background:#fff}.sheet{border:0;box-shadow:none;max-width:none;padding:18px}.brand img{width:76px;height:76px}.table th,.table td{font-size:9px;padding:7px}.result-banner,.grading,.sign{break-inside:avoid}}@page{size:A4 portrait;margin:12mm}`;

const openPrintBlock = `  function openPrint(title:string,html:string){const w=window.open("","_blank","width=1200,height=950");if(!w)return;w.document.write(\`<!doctype html><html><head><title>\${esc(title)}</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>${printCss}</style></head><body><div class="sheet">\${html}</div><script>window.onload=function(){setTimeout(function(){window.print()},350)};<\\/script></body></html>\`);w.document.close();}`;
text = text.replace(/  function openPrint\(title:string,html:string\)\{[\s\S]*?\n  async function downloadPdf/, openPrintBlock + '\n  async function downloadPdf');

const downloadBlock = `  async function downloadPdf(html:string,fileName:string){setBusy(fileName);let holder:HTMLDivElement|null=null;try{const mod:any=await import("jspdf"),cm:any=await import("html2canvas");holder=document.createElement("div");holder.style.position="fixed";holder.style.left="-12000px";holder.style.top="0";holder.style.width="1040px";holder.style.background="#fff";holder.innerHTML=\`<style>${printCss}</style><div class="sheet" style="box-shadow:none;margin:0;width:1040px;max-width:1040px">\${html}</div>\`;document.body.appendChild(holder);await Promise.all(Array.from(holder.querySelectorAll("img")).map((img:any)=>img.complete?Promise.resolve():new Promise<void>(r=>{img.onload=()=>r();img.onerror=()=>r()})));const canvas=await cm.default(holder.querySelector(".sheet"),{scale:2,useCORS:true,allowTaint:true,backgroundColor:"#fff",logging:false});const pdf=new mod.jsPDF({orientation:"portrait",unit:"mm",format:"a4"});const margin=7,w=210-margin*2,h=canvas.height*w/canvas.width;pdf.addImage(canvas.toDataURL("image/jpeg",.96),"JPEG",margin,margin,w,Math.min(h,283));pdf.save(fileName);}catch(e){console.error(e);alert("PDF download failed. Please use Print Marksheet and Save as PDF.");}finally{if(holder?.parentNode)holder.parentNode.removeChild(holder);setBusy("");}}`;
text = text.replace(/  async function downloadPdf\(html:string,fileName:string\)\{[\s\S]*?\n  function resultHtml/, downloadBlock + '\n  function resultHtml');

const resultBlock = `  function resultHtml(exam:any){const rows=marks.filter(m=>m.exam_id===exam.id),max=rows.reduce((s,m)=>s+Number(m.max_marks||0),0),got=rows.reduce((s,m)=>s+Number(m.obtained_marks||0),0),pct=max?got/max*100:0,passed=rows.length>0&&rows.every(m=>Number(m.max_marks)>0&&(Number(m.obtained_marks)/Number(m.max_marks)*100)>=40);const tr=rows.map((m,i)=>{const p=Number(m.max_marks)?Number(m.obtained_marks)/Number(m.max_marks)*100:0;return \`<tr><td>\${i+1}</td><td style="text-align:left;font-weight:700">\${esc(m.subject)}</td><td>\${m.max_marks}</td><td>\${m.obtained_marks}</td><td>\${p.toFixed(1)}%</td><td>\${esc(m.grade||grade(p))}</td><td>\${p>=40?"Pass":"Fail"}</td><td>\${esc(m.remarks||"—")}</td></tr>\`}).join("");return \`<div class="official">MADRASA MAJMAUL BAHRAIN BIJOL • OFFICIAL ACADEMIC DOCUMENT</div><div class="brand"><img src="\${LOGO}" alt="Madrasa Logo"><div><h1>Madrasa Majmaul Bahrain Bijol</h1><div class="urdu">مدرسہ مجمع البحرین بیجول</div><p>Official Academic Record • Student Examination Marksheet</p></div></div><div class="title">\${esc(exam.exam_name||"Examination")} — MARKSHEET</div><div class="meta"><div><div class="label">Examination</div><div class="value">\${esc(exam.exam_name)}</div></div><div><div class="label">Academic Session</div><div class="value">\${esc(exam.session||"—")}</div></div><div><div class="label">Examination Date</div><div class="value">\${formatDate(exam.exam_date)}</div></div><div><div class="label">Final Status</div><div class="value">\${passed?"PASS":"FAIL"}</div></div></div><div class="studentbox">\${photoUrl?\`<img class="photo" src="\${esc(photoUrl)}" alt="Student Photo">\`:""}<div class="studentgrid"><div><div class="label">Student Name</div><div class="value">\${esc(admission.student_name)}</div></div><div><div class="label">Student ID</div><div class="value">\${esc(account?.student_id||admission.student_id||"—")}</div></div><div><div class="label">Father / Guardian</div><div class="value">\${esc(detail(admission.father_name||admission.guardian_name,"Father's Name","Guardian Name"))}</div></div><div><div class="label">Course</div><div class="value">\${esc(admission.course||"—")}</div></div></div><div style="clear:both"></div></div><table class="table"><thead><tr><th>S.No.</th><th>Subject</th><th>Full Marks</th><th>Marks Obtained</th><th>Percentage</th><th>Grade</th><th>Result</th><th>Remarks</th></tr></thead><tbody>\${tr}</tbody></table><div class="summary"><div class="box"><div class="label">Total Full Marks</div><div class="value">\${max}</div></div><div class="box"><div class="label">Total Marks Obtained</div><div class="value">\${got}</div></div><div class="box"><div class="label">Overall Percentage</div><div class="value">\${pct.toFixed(2)}%</div></div><div class="box"><div class="label">Overall Grade</div><div class="value">\${grade(pct)}</div></div></div><div class="result-banner">FINAL RESULT : \${passed?"PASS":"FAIL"}</div><div class="grading"><strong>Grading Scale:</strong> A+ (90–100) &nbsp; A (80–89) &nbsp; B+ (70–79) &nbsp; B (60–69) &nbsp; C (50–59) &nbsp; D (40–49) &nbsp; F (Below 40)</div><div class="remarks"><strong>Remarks:</strong> \${esc(exam.remarks||"No remarks")}</div><div class="sign"><div>Class / Subject Teacher</div><div>Examination In-charge</div><div>Principal / Authorized Signatory</div></div><div class="footerline"><span>Issued by Madrasa Majmaul Bahrain Bijol</span><span>BIJOL KATIHAR BIHAR</span></div>\`;}`;
text = text.replace(/  function resultHtml\(exam:any\)\{[\s\S]*?\n  function receiptHtml/, resultBlock + '\n  function receiptHtml');

fs.writeFileSync(file, text);
console.log('Student portal complete patch applied.');
