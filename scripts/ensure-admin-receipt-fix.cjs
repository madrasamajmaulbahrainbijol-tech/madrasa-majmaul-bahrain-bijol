const fs=require('fs');
const p='package.json';
const j=JSON.parse(fs.readFileSync(p,'utf8'));
const cmd='node scripts/fix-admin-receipt-blank-v2.cjs';
if(!String(j.scripts?.prebuild||'').includes(cmd)) j.scripts.prebuild=(j.scripts?.prebuild?j.scripts.prebuild+' && ':'')+cmd;
fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');
