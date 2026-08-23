const fs=require('fs');
const path='app/admin/students/[studentId]/page.tsx';
let t=fs.readFileSync(path,'utf8');
t=t.replace('const logo="/madrasa-logo.jpg";','const logo="/mmbb-logo.svg";');
if(!t.includes('const downloadMarksheet=')){
  const marker='const printResult=';
  const fn='const downloadMarksheet=(exam:Exam)=>{if(!student)return;const safeName=student.student_name.trim().replace(/[^a-zA-Z0-9]+/g,"_").replace(/^_|_$/g,"")||"Student";const old=document.title;document.title=`${safeName}_Marksheet`;printResult(exam);setTimeout(()=>{document.title=old},1200)};\n';
  t=t.replace(marker,fn+marker);
}
t=t.replace('<FiPrinter/> Print Marksheet</button>','<FiPrinter/> Print Marksheet</button><button onClick={()=>downloadMarksheet(ex)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 font-black text-emerald-800"><FiDownload/> Download PDF</button>');
fs.writeFileSync(path,t,'utf8');
