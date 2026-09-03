const fs=require("fs");
const p="scripts/final-admin-marksheet-fix.cjs";
let s=fs.readFileSync(p,"utf8");
function convert(name){
 const a=s.indexOf(`const ${name}="`);
 const b=s.indexOf(`";\n`,a);
 if(a<0||b<0)throw new Error(`${name} string not found`);
 let v=s.slice(a+(`const ${name}="`).length,b);
 v=v.replace(/'/g,"\\'");
 s=s.slice(0,a)+`const ${name}='`+v+`'`+s.slice(b+2);
}
convert("fn");
convert("resultFn");
fs.writeFileSync(p,s);
console.log("Normalized final marksheet patch script");
