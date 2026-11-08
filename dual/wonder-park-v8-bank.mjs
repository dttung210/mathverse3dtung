/**
 * MATHVERSE V8: curriculum-specific question bank engine.
 * No AI generation, web lookup, or automatic mixing between grades.
 * The only accepted questions are teacher-provided records with a keyed answer.
 */
import {pickMillionaireQuestions} from './wonder-park-v7-millionaire.mjs';
export const GRADES=Object.freeze([6,7,8,9,10,11,12]);
export const ABCD=Object.freeze(['A','B','C','D']);
const MAX_QUESTION_COUNT=40000;
const clean=(value)=>String(value??'').trim();
const normalizeChapter=(value)=>Number(value);
export function isApprovedQuestion(question){
  return Boolean(question&&ABCD.includes(question.answer)&&question.choices&&
    ABCD.every(key=>typeof question.choices[key]==='string'&&question.choices[key].trim())&&
    new Set(ABCD.map(key=>question.choices[key].trim().normalize('NFC').toLocaleLowerCase('vi-VN'))).size===4&&
    (typeof question.prompt==='string'||Array.isArray(question.prompt_segments))&&
    !question.issues?.length);
}
/** Accept multiple teacher source files in a documented portable format. */
export function normalizeTeacherBank(source,{sourceLabel='Tệp giáo viên'}={}){
  if(!source||typeof source!=='object'||Array.isArray(source))throw new Error('Kho JSON cần là một đối tượng.');
  const chapters=Array.isArray(source.chapters)?source.chapters:
    (source.meta&&Array.isArray(source.questions)?[{...source.meta,questions:source.questions}]:null);
  if(!chapters)throw new Error('Dữ liệu phải có chapters[] hoặc meta + questions[].');
  if(chapters.length>250)throw new Error('Một kho không được quá 250 chương.');
  const output=[];
  let total=0;
  for(const chapter of chapters){
    const grade=Number(chapter.grade),number=normalizeChapter(chapter.chapter);
    if(!GRADES.includes(grade)||!Number.isInteger(number)||number<1||number>30)
      throw new Error('Mỗi chương cần thuộc lớp 6–12 và có chapter từ 1 đến 30.');
    if(!Array.isArray(chapter.questions))throw new Error(`Chương ${number} lớp ${grade} chưa có questions[].`);
    total+=chapter.questions.length;
    if(total>MAX_QUESTION_COUNT)throw new Error('Một kho không được quá 40.000 câu.');
    const title=clean(chapter.title)||`Chương ${number}`;
    const key=`${grade}-${number}`;
    const valid=[];
    let ignored=0;
    const seen=new Set();
    for(let i=0;i<chapter.questions.length;i++){
      const q=chapter.questions[i];
      if(!isApprovedQuestion(q)){ignored++;continue;}
      const id=clean(q.id)||`${key}-source-${i+1}`;
      if(seen.has(id)){ignored++;continue;}
      seen.add(id);
      // Additional provenance from the teacher file, not from any outside source.
      valid.push({...q,id,grade,chapter:number,chapterTitle:title});
    }
    output.push({grade,chapter:number,title,source:clean(source.sourceFile||source.meta?.source||sourceLabel),
      total:chapter.questions.length,ignored,questions:valid});
  }
  return output;
}
export function mergeTeacherChapters(previous=[],incoming=[]){
  const combined=new Map(previous.map(item=>[`${item.grade}-${item.chapter}`,item]));
  // Import replaces one chapter atomically, rather than silently mixing two incompatible answer keys.
  for(const item of incoming)combined.set(`${item.grade}-${item.chapter}`,item);
  return [...combined.values()].sort((a,b)=>a.grade-b.grade||a.chapter-b.chapter);
}
export function getAvailableChapters(all,grade){
  return all.filter(c=>c.grade===Number(grade)).sort((a,b)=>a.chapter-b.chapter);
}
export function filterQuestionPool(all,{grade,scope='chapter',chapter}){
  const selected=getAvailableChapters(all,grade).filter(c=>scope==='grade'||c.chapter===Number(chapter));
  const unique=new Map();
  for(const section of selected)for(const q of section.questions){
    if(!isApprovedQuestion(q))continue;
    // ID unique per grade/chapter, never cross-grade.
    const composite=`${section.grade}/${section.chapter}/${q.id}`;
    if(!unique.has(composite))unique.set(composite,q);
  }
  return [...unique.values()];
}
export function checkQuestionReadiness(all,{grade,scope='chapter',chapter},mode){
  if(Number(mode)===7)return {ready:true,count:0,required:0,reason:'Mê cung không dùng ngân hàng trắc nghiệm.',byDifficulty:{}};
  const sections=getAvailableChapters(all,grade);
  if(sections.length===0)return {ready:false,count:0,required:Number(mode)===10?15:10,
    reason:`Chưa có kho câu hỏi Toán ${grade}. Giáo viên cần nạp đề đúng lớp.`,byDifficulty:{}};
  if(scope!=='grade'&&!sections.some(c=>c.chapter===Number(chapter)))
    return {ready:false,count:0,required:Number(mode)===10?15:10,
      reason:`Chưa có Chương ${chapter} của Toán ${grade}.`,byDifficulty:{}};
  const pool=filterQuestionPool(all,{grade,scope,chapter});
  const counts={Dễ:0,'Trung bình':0,Khó:0};
  for(const q of pool)if(Object.hasOwn(counts,q.difficulty))counts[q.difficulty]++;
  const required=Number(mode)===10?15:10;
  if(pool.length<required)return {ready:false,count:pool.length,required,byDifficulty:counts,
    reason:`Kho chỉ có ${pool.length}/${required} câu hợp lệ. Hãy nạp thêm câu cùng phạm vi.`};
  if(Number(mode)===10){
    const missing=Object.entries(counts).filter(([,size])=>size<5);
    if(missing.length)return {ready:false,count:pool.length,required,byDifficulty:counts,
      reason:'Ai là triệu phú cần ít nhất 5 câu Dễ, 5 Trung bình, 5 Khó. Thiếu: '+missing.map(([name,size])=>`${name} (${size}/5)`).join(', ')};
  }
  return {ready:true,count:pool.length,required,byDifficulty:counts,reason:`Sẵn sàng: ${pool.length} câu hợp lệ theo lựa chọn của em.`};
}
export const DIFFICULTY_ORDER = Object.freeze({
  'Dễ': 1, 'Nhận biết': 1,
  'Trung bình': 2, 'Thông hiểu': 2,
  'Khó': 3, 'Vận dụng': 3,
  'Vận dụng cao': 4, 'Rất khó': 4
});
export const getDifficultyRank = (q) => (q && q.difficulty && DIFFICULTY_ORDER[q.difficulty]) || 2;

const shuffle=(values,rng=Math.random)=>{const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export function pickQuestionsForGame(all,selection,mode,{rng=Math.random}={}){
  const ready=checkQuestionReadiness(all,selection,mode);
  if(!ready.ready)throw new Error(ready.reason);
  if(Number(mode)===7)return [];
  const pool=filterQuestionPool(all,selection);
  if(Number(mode)===10)return pickMillionaireQuestions(pool,rng);
  // Keep 4 easy, 4 medium, 2 hard when possible, fill remaining from the same selection.
  const chosen=[];
  for(const [name,limit] of [['Dễ',4],['Trung bình',4],['Khó',2]])chosen.push(...shuffle(pool.filter(q=>q.difficulty===name),rng).slice(0,limit));
  const keys=new Set(chosen.map(q=>`${q.grade}-${q.chapter}-${q.id}`));
  for(const q of shuffle(pool,rng)){
    const id=`${q.grade}-${q.chapter}-${q.id}`;
    if(chosen.length<10&&!keys.has(id)){chosen.push(q);keys.add(id);}
  }
  // Order questions pedagogically from Easy to Hard (GDPT 2018: Dễ -> Trung bình -> Khó)
  return chosen.slice(0,10).sort((a,b)=>getDifficultyRank(a)-getDifficultyRank(b));
}
