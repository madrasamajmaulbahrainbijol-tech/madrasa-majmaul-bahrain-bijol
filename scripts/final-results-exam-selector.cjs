const fs=require("fs");
const results="app/admin/results/page.tsx";
const shared="lib/marksheet-print.ts";

function replaceOnce(file,needle,replacement,label){let s=fs.readFileSync(file,"utf8");if(!s.includes(needle))throw new Error(`Patch target not found for ${label} in ${file}`);s=s.replace(needle,replacement);fs.writeFileSync(file,s)}
function replaceBetween(file,start,end,replacement,label){let s=fs.readFileSync(file,"utf8"),a=s.indexOf(start),b=s.indexOf(end,a);if(a<0||b<0)throw new Error(`Patch boundary not found for ${label} in ${file}`);s=s.slice(0,a)+replacement+s.slice(b);fs.writeFileSync(file,s)}

// Shared marksheet: keep the Academic Record area as the real PASS/FAIL result.
{
  let s=fs.readFileSync(shared,"utf8");
  const old='<div class="ms-badge">ACADEMIC<br>RECORD</div>';
  const next='<div class="ms-badge">${passed?"PASS":"FAIL"}</div>';
  if(s.includes(old)){s=s.replace(old,next);fs.writeFileSync(shared,s)}
}

let s=fs.readFileSync(results,"utf8");

// Admin Results needs DOB and the original admission message because the
// application number is stored in that message by the admission form.
const oldStudentType='type Student={id:string;student_name:string;student_id:string|null;course:string|null;father_name?:string|null;guardian_name?:string|null;student_photo_url?:string|null};';
const newStudentType='type Student={id:string;student_name:string;student_id:string|null;course:string|null;date_of_birth?:string|null;father_name?:string|null;guardian_name?:string|null;student_photo_url?:string|null;message?:string|null;photoUrl?:string|null};';
if(s.includes(oldStudentType)){
  s=s.replace(oldStudentType,newStudentType);
  fs.writeFileSync(results,s);
}

s=fs.readFileSync(results,"utf8");
const oldSelect='supabase.from("admissions").select("id,student_name,student_id,course,father_name,guardian_name,student_photo_url").eq("status","approved").eq("account_status","approved").order("student_name")';
const newSelect='supabase.from("admissions").select("id,student_name,student_id,course,date_of_birth,father_name,guardian_name,student_photo_url,message").eq("status","approved").eq("account_status","approved").order("student_name")';
if(s.includes(oldSelect)){
  s=s.replace(oldSelect,newSelect);
  fs.writeFileSync(results,s);
}

s=fs.readFileSync(results,"utf8");
const oldPrint='marksheetPrintHtml(student,{exam_name:exam.exam_name,exam_date:exam.exam_date,session:exam.session,remarks:exam.remarks,student_exam_marks:exam.student_exam_marks})';
const newPrint='marksheetPrintHtml(student,{exam_name:exam.exam_name,exam_date:exam.exam_date,session:exam.session,remarks:exam.remarks,student_exam_marks:exam.student_exam_marks},student.photoUrl||undefined)';
if(s.includes(oldPrint)){
  s=s.replace(oldPrint,newPrint);
  fs.writeFileSync(results,s);
}

s=fs.readFileSync(results,"utf8");
const oldLoad='setStudents((data||[]) as Student[]);const ids=(data||[]).map((s:any)=>s.id);';
const newLoad='const rawStudents=(data||[]) as Student[];const studentsWithPhotos=await Promise.all(rawStudents.map(async(s)=>{const value=String(s.student_photo_url||"");if(!value)return s;if(/^https?:\\/\\//i.test(value))return {...s,photoUrl:value};const {data:signed}=await supabase.storage.from("admission-documents").createSignedUrl(value,3600);return {...s,photoUrl:signed?.signedUrl||""};}));setStudents(studentsWithPhotos);const ids=rawStudents.map((s:any)=>s.id);';
if(s.includes(oldLoad)){
  s=s.replace(oldLoad,newLoad);
  fs.writeFileSync(results,s);
}

s=fs.readFileSync(results,"utf8");
const stateNeedle='[selected,setSelected]=useState<string[]>([]),[active,setActive]=useState<Student|null>(null)';
const stateReplacement='[selected,setSelected]=useState<string[]>([]),[selectedExam,setSelectedExam]=useState(""),[active,setActive]=useState<Student|null>(null)';
if(s.includes(stateNeedle)){
  s=s.replace(stateNeedle,stateReplacement);
  fs.writeFileSync(results,s);
}

s=fs.readFileSync(results,"utf8");
const latestNeedle='const latest=useMemo(()=>{const m=new Map<string,Exam>();for(const e of exams)if(!m.has(e.admission_id))m.set(e.admission_id,e);return m},[exams]);';
const latestReplacement='const latest=useMemo(()=>{const m=new Map<string,Exam>();for(const e of exams)if(!m.has(e.admission_id))m.set(e.admission_id,e);return m},[exams]);\n const examOptions=useMemo(()=>{const m=new Map<string,{key:string;name:string;date:string|null;session:string|null}>();for(const e of exams){const key=`${e.exam_name}::${e.exam_date||""}`;if(!m.has(key))m.set(key,{key,name:e.exam_name,date:e.exam_date,session:e.session})}return [...m.values()].sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))||b.name.localeCompare(a.name))},[exams]);\n useEffect(()=>{if(!examOptions.length){setSelectedExam("");return}if(!examOptions.some(x=>x.key===selectedExam))setSelectedExam(examOptions[0].key)},[examOptions,selectedExam]);';
if(s.includes(latestNeedle)){
  s=s.replace(latestNeedle,latestReplacement);
  fs.writeFileSync(results,s);
}

s=fs.readFileSync(results,"utf8");
const pairsNeedle='const selectedPairs=selected.map(id=>{const s=students.find(x=>x.id===id);const e=latest.get(id);return s&&e?{student:s,exam:e}:null}).filter(Boolean) as {student:Student;exam:Exam}[];';
const pairsReplacement='const selectedPairs=selected.map(id=>{const s=students.find(x=>x.id===id);const e=exams.find(x=>x.admission_id===id&&`${x.exam_name}::${x.exam_date||""}`===selectedExam);return s&&e?{student:s,exam:e}:null}).filter(Boolean) as {student:Student;exam:Exam}[];';
if(s.includes(pairsNeedle)){
  s=s.replace(pairsNeedle,pairsReplacement);
  fs.writeFileSync(results,s);
}

s=fs.readFileSync(results,"utf8");
const controlStart='<div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4 shadow-sm">';
const controlEnd='{loading?';
const controlReplacement='<div className="mt-6 rounded-2xl border bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><label className="block w-full lg:max-w-xl"><span className="mb-2 block text-xs font-black uppercase tracking-[.16em] text-emerald-700">Select Examination (Name + Date)</span><select value={selectedExam} onChange={e=>{setSelectedExam(e.target.value);setSelected([])}} className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-black text-slate-900 outline-none focus:ring-2 focus:ring-emerald-400"><option value="">Select examination</option>{examOptions.map(x=><option key={x.key} value={x.key}>{x.name} — {niceDate(x.date)}{x.session?` — ${x.session}`:""}</option>)}</select></label><p className="text-sm font-bold text-slate-500">Only the selected examination will be printed or downloaded. Students without this exam are excluded.</p></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4"><label className="flex cursor-pointer items-center gap-3 font-black text-slate-800"><input type="checkbox" checked={allVisible} onChange={toggleAll} className="h-5 w-5 accent-emerald-700"/> Select all visible</label><div className="flex flex-wrap gap-2"><span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600">{selectedPairs.length} selected for this exam</span><button disabled={!selectedExam||!selectedPairs.length} onClick={()=>printResults(selectedPairs)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 font-black text-white disabled:cursor-not-allowed disabled:opacity-40"><FiPrinter/> Print Selected Results</button><button disabled={!selectedExam||!selectedPairs.length} onClick={()=>printResults(selectedPairs,true)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 font-black text-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"><FiDownload/> Download Selected PDF</button></div></div></div>';
if(s.includes(controlStart)){
  replaceBetween(results,controlStart,controlEnd,controlReplacement,"exam selector controls");
}

console.log("Final results marksheet identity fields and exam selector patch applied.");
