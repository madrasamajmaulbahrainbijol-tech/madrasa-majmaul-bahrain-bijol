const fs = require('fs');
const path = 'scripts/expert-student-polish.cjs';
let text = fs.readFileSync(path, 'utf8');
text = text.replace('throw new Error(\\`${r.subject}: obtained marks cannot exceed maximum marks.\\`);', "throw new Error(r.subject + ': obtained marks cannot exceed maximum marks.');");
fs.writeFileSync(path, text, 'utf8');
