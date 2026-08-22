const fs = require('fs');
const file = 'app/admin/students/[studentId]/page.tsx';
let text = fs.readFileSync(file, 'utf8');

// Keep the A4 result dense and readable: use the lower page area for marks/details,
// leaving only a compact signature/stamp area at the bottom.
const replacements = [
  ['.sheet{position:relative;max-width:1040px;margin:auto;background:#fff;border:1px solid #aebdb4;box-shadow:0 20px 60px rgba(0,0,0,.14);padding:30px;', '.sheet{position:relative;max-width:1040px;margin:auto;background:#fff;border:1px solid #aebdb4;box-shadow:0 20px 60px rgba(0,0,0,.14);padding:18px;'],
  ['.brand{position:relative;display:flex;align-items:center;justify-content:center;gap:18px;border-bottom:4px double #075c2d;padding:15px 8px 17px}', '.brand{position:relative;display:flex;align-items:center;justify-content:center;gap:18px;border-bottom:4px double #075c2d;padding:10px 8px 12px}'],
  ['.title{position:relative;margin:17px auto 12px;', '.title{position:relative;margin:10px auto 9px;'],
  ['.meta div{padding:10px 12px;', '.meta div{padding:8px 10px;'],
  ['.studentbox{position:relative;margin-top:14px;', '.studentbox{position:relative;margin-top:9px;'],
  ['.studentgrid div{padding:9px 11px;', '.studentgrid div{padding:7px 9px;'],
  ['.table th,.table td{border:1px solid #aebdb4;padding:9px 8px;font-size:11px}', '.table th,.table td{border:1px solid #aebdb4;padding:8px 7px;font-size:12px}'],
  ['.summary{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px}', '.summary{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:9px}'],
  ['.summary .box{border:1px solid #b9c9c0;padding:10px;', '.summary .box{border:1px solid #b9c9c0;padding:8px;'],
  ['.result-banner{position:relative;margin-top:14px;', '.result-banner{position:relative;margin-top:9px;'],
  ['.grading{position:relative;margin-top:14px;', '.grading{position:relative;margin-top:8px;'],
  ['.remarks{position:relative;margin-top:12px;', '.remarks{position:relative;margin-top:8px;'],
  ['.sign{position:relative;display:grid;grid-template-columns:1fr 1fr 1fr;gap:45px;margin-top:72px}', '.sign{position:relative;display:grid;grid-template-columns:1fr 1fr 1fr;gap:32px;margin-top:34px}'],
  ['.footerline{position:relative;margin-top:20px;', '.footerline{position:relative;margin-top:10px;'],
  ['@page{size:A4 portrait;margin:12mm}', '@page{size:A4 portrait;margin:7mm}'],
  ['.brand img{width:76px;height:76px}.table th,.table td{font-size:9px;padding:7px}', '.brand img{width:72px;height:72px}.table th,.table td{font-size:10px;padding:6px}'],
];
for (const [from, to] of replacements) text = text.replace(from, to);

// Add the student's actual photo to the printed identity block, like a formal board marksheet.
const oldStudentBox = '<div class="studentbox"><div class="studentgrid">';
const newStudentBox = '<div class="studentbox"><div style="display:grid;grid-template-columns:1fr 92px;gap:12px;align-items:stretch"><div class="studentgrid">';
text = text.replace(oldStudentBox, newStudentBox);
const oldStudentGridEnd = '</div></div><table class="table"><thead><tr><th>S.No.</th>';
const newStudentGridEnd = '</div><div style="border:1px solid #b9c9c0;background:#fff;display:flex;align-items:center;justify-content:center;padding:5px"><img src="${studentPhoto||logo}" alt="Student Photo" style="width:80px;height:96px;object-fit:cover;border-radius:2px"></div></div></div><table class="table"><thead><tr><th>S.No.</th>';
text = text.replace(oldStudentGridEnd, newStudentGridEnd);

fs.writeFileSync(file, text, 'utf8');
console.log('Final A4 marksheet compact polish applied.');
