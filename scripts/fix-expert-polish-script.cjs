const fs = require('fs');
const path = 'scripts/expert-student-polish.cjs';
let text = fs.readFileSync(path, 'utf8');
text = text.replace('throw new Error(\\`${r.subject}: obtained marks cannot exceed maximum marks.\\`);', "throw new Error(r.subject + ': obtained marks cannot exceed maximum marks.');");
text = text.replace('catch(e){setError', 'catch(e:any){setError');
text = text.replace('const editExam=(exam)=>', 'const editExam=(exam:Exam)=>');
text = text.replace('exam.student_exam_marks.map(m=>', 'exam.student_exam_marks.map((m:ExamMark)=>');
text = text.replace('const deleteExam=async(id)=>', 'const deleteExam=async(id:string)=>');
fs.writeFileSync(path, text, 'utf8');
