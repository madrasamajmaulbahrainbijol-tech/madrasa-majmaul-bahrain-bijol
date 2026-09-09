const fs=require('fs');
const path=require('path');
const file=path.join(process.cwd(),'app/admin/dashboard/page.tsx');
if(!fs.existsSync(file)) process.exit(0);
let s=fs.readFileSync(file,'utf8');
const marker='<Card icon="💰" title="Fee & Account"';
if(s.includes(marker)){console.log('[fee-account] card already present');process.exit(0);}
const target='<Card icon="📩" title="Enquiries" text="New website enquiries waiting for attention." count={enquiryCount} label="New" color="bg-blue-100" href="/admin/enquiries" />';
if(!s.includes(target)){console.log('[fee-account] dashboard insertion point not found');process.exit(0);}
s=s.replace(target,`${marker} text="See every student's outstanding fee, total madrasa dues and month-wise fee collection." count={0} label="Financial Overview" color="bg-amber-100" href="/admin/fee-account" />\n          ${target}`);
fs.writeFileSync(file,s);
console.log('[fee-account] dashboard card added');
