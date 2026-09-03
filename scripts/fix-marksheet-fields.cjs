const fs=require("fs");
const results="app/admin/results/page.tsx";
function patch(file,needle,replacement,label){let s=fs.readFileSync(file,"utf8");if(!s.includes(needle)){console.log(`[marksheet-fields] ${label}: already patched or not needed`);return}s=s.replace(needle,replacement);fs.writeFileSync(file,s);console.log(`[marksheet-fields] ${label}: patched`)}

let s=fs.readFileSync(results,"utf8");
patch(results,
  'type Student={id:string;student_name:string;student_id:string|null;course:string|null;father_name?:string|null;guardian_name?:string|null;student_photo_url?:string|null};',
  'type Student={id:string;student_name:string;student_id:string|null;course:string|null;date_of_birth?:string|null;father_name?:string|null;guardian_name?:string|null;student_photo_url?:string|null;message?:string|null;photoUrl?:string|null};',
  'student identity fields'
);
patch(results,
  'supabase.from("admissions").select("id,student_name,student_id,course,father_name,guardian_name,student_photo_url").eq("status","approved").eq("account_status","approved").order("student_name")',
  'supabase.from("admissions").select("id,student_name,student_id,course,date_of_birth,father_name,guardian_name,student_photo_url,message").eq("status","approved").eq("account_status","approved").order("student_name")',
  'DOB and application-number source'
);
console.log("Marksheets now receive Date of Birth and the admission application number source in Admin Results.");
