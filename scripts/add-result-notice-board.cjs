const fs=require('fs');
const path='app/admin/dashboard/page.tsx';
let s=fs.readFileSync(path,'utf8');
if(!s.includes('title=\"Result Notice Board\"')){
 const needle='<Card icon=\"📊\" title=\"Results\"';
 const i=s.indexOf(needle);
 if(i>=0){
  const end=s.indexOf('/>',i);
  if(end>=0){
   const card=s.slice(i,end+2);
   s=s.slice(0,end+2)+`<Card icon=\"📋\" title=\"Result Notice Board\" text=\"Select any saved examination and create an A4 notice-board result with marks, percentage and subject-wise Pass/Fail.\" count={0} label=\"Print / Download\" color=\"bg-emerald-100\" href=\"/admin/results/notice-board\" />`+s.slice(end+2);
  }
 }
}
fs.writeFileSync(path,s,'utf8');
