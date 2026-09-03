const fs = require('fs');
const file = 'scripts/fix-marksheet-print-layout-v2.cjs';
let text = fs.readFileSync(file, 'utf8');
const oldLine = "const re = /function printWindow\\(title:string,body:string\\)\\{[\\s\\S]*?\\n\\}\\n\\nexport default/;";
const newLine = "const re = /function printWindow\\(title:string,body:string\\)\\{[\\s\\S]*?\\}\\s*export default/;";
if (!text.includes(oldLine)) throw new Error('Expected marksheet patch regex not found');
text = text.replace(oldLine, newLine);
fs.writeFileSync(file, text, 'utf8');
console.log('Prepared marksheet print patch for current build-transformed source.');
