import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizeTeacherBank,filterQuestionPool,pickQuestionsForGame,checkQuestionReadiness,isApprovedQuestion,getAvailableChapters} from '../dual/wonder-park-v8-bank.mjs';
import {parseLatex} from '../dual/wonder-park-ui.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFileSync(join(root,path),'utf8');
const bank=JSON.parse(read('game-park/assets/teacher-bank-6-12-63-chapters.json'));
const chapters=normalizeTeacherBank(bank);
const count=chapters.reduce((a,c)=>a+c.total,0);
const eligible=chapters.reduce((a,c)=>a+c.questions.length,0);
const quarantined=bank.chapters.flatMap(c=>c.questions).filter(q=>q.issues?.length);

test('V9 imports all 7 grades, 63 chapters and 3150 original questions with source labels',()=>{
 assert.equal(chapters.length,63);assert.equal(count,3150);assert.equal(eligible,3087);
 const totals=Object.fromEntries(Array.from({length:7},(_,i)=>[6+i,chapters.filter(c=>c.grade===6+i).reduce((n,c)=>n+c.total,0)]));
 assert.deepEqual(totals,{6:450,7:500,8:500,9:500,10:450,11:450,12:300});
 assert.equal(new Set(bank.chapters.flatMap(c=>c.questions.map(q=>q.id))).size,3150);
 assert.ok(bank.chapters.every(c=>c.questions.length===50));
 assert.ok(bank.chapters.every(c=>c.questions.every(q=>q.provenance?.format==='LaTeX'&&q.sourceTex?.question&&q.answer)));
});

test('Quarantined questions stay visible for teacher QA but are never playable',()=>{
 assert.equal(quarantined.length,63);
 assert.ok(quarantined.every(q=>!isApprovedQuestion(q)));
 assert.ok(chapters.every(c=>c.questions.every(q=>!q.issues.length)));
 const report=JSON.parse(read('game-park/quality-reports/QA_TONG_HOP_KHO_TOAN_6_12.json'));
 assert.equal(report.issueCount,63);
 assert.equal(report.chapters.length,63);
});

test('63 chapter selections and seven whole grades are available and never mix grades/chapters',()=>{
 const gradeCount={6:9,7:10,8:10,9:10,10:9,11:9,12:6};
 for(let grade=6;grade<=12;grade++){
  assert.equal(getAvailableChapters(chapters,grade).length,gradeCount[grade]);
  const whole=filterQuestionPool(chapters,{grade,scope:'grade',chapter:1});
  assert.ok(whole.length>=250);
  assert.ok(whole.every(q=>q.grade===grade));
  for(const chapter of getAvailableChapters(chapters,grade)){
   const select={grade,scope:'chapter',chapter:chapter.chapter};
   const pool=filterQuestionPool(chapters,select);
   assert.ok(pool.length>=40,`Grade ${grade} chapter ${chapter.chapter}`);
   assert.ok(pool.every(q=>q.grade===grade&&q.chapter===chapter.chapter));
   assert.equal(checkQuestionReadiness(chapters,select,0).ready,true);
   assert.equal(checkQuestionReadiness(chapters,select,10).ready,true);
   const deck=pickQuestionsForGame(chapters,select,0);
   assert.equal(deck.length,10);
   assert.ok(deck.every(q=>q.grade===grade&&q.chapter===chapter.chapter));
   const show=pickQuestionsForGame(chapters,select,10);
   assert.equal(show.length,15);
   assert.deepEqual(show.slice(0,5).map(q=>q.difficulty),Array(5).fill('Dễ'));
   assert.deepEqual(show.slice(5,10).map(q=>q.difficulty),Array(5).fill('Trung bình'));
   assert.deepEqual(show.slice(10).map(q=>q.difficulty),Array(5).fill('Khó'));
  }
 }
});

test('TeX powers, subscripts, roots, fractions, symbols are correctly segmented; no raw TeX control chars in plain text',()=>{
 let math=0;
 for(const q of chapters.flatMap(c=>c.questions))for(const arr of [q.prompt_segments,...Object.values(q.choice_segments)])for(const segment of arr){
  assert.ok(['txt','math'].includes(segment.t),q.id);
  assert.equal(typeof segment.v,'string',q.id);
  assert.ok(!/^\s*[\^_]/.test(segment.v),`Unexpected isolated script in ${q.id}`);
  if(segment.t==='txt')assert.ok(!/\\[A-Za-z]+|\$/.test(segment.v),`Unparsed TeX in ${q.id}: ${segment.v}`);
  else{math++;assert.ok(segment.v.trim()&&segment.v.split('{').length===segment.v.split('}').length,q.id);}
 }
 assert.ok(math>1500,`Only ${math} mathematical fragments`);
 const x=bank.chapters[0].questions.find(q=>q.id==='6-01-03');
 assert.ok(x.prompt_segments.some(s=>s.t==='math'&&s.v.includes('^{4}')));
 const w=bank.chapters.find(c=>c.grade===7&&c.chapter===2).questions.find(q=>q.id==='7-02-03');
 assert.ok(w.choice_segments.A.concat(w.choice_segments.B,w.choice_segments.C,w.choice_segments.D,w.prompt_segments).some(s=>s.t==='math'&&s.v.includes('\\sqrt')));
});

test('MathML interpreter accepts every playable source math fragment without unknown-command fallback',()=>{
 class MiniNode {
  constructor(tag){this.tag=tag;this.children=[];this._text='';}
  appendChild(n){this.children.push(n);return n;}
  set textContent(v){this._text=String(v);this.children=[];}
  get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
 }
 globalThis.document={createElementNS(_uri,tag){return new MiniNode(tag)}};
 let count=0;let fallback=[];
 function visit(node,id){if(node.tag==='mtext'&&node.textContent.startsWith('\\'))fallback.push(`${id}: ${node.textContent}`);for(const child of node.children)visit(child,id);}
 try{
 for(const q of chapters.flatMap(c=>c.questions))for(const arr of [q.prompt_segments,...Object.values(q.choice_segments)])for(const segment of arr){
  if(segment.t!=='math')continue;
  const node=parseLatex(segment.v);assert.equal(node.tag,'math');visit(node,q.id);count++;
 }
 }finally{delete globalThis.document;}
 assert.ok(count>1500);assert.deepEqual(fallback.slice(0,10),[],`Unrecognized math macros: ${fallback.slice(0,10).join(', ')}`);
});

test('Grand Campus V9 UI loads 63-chapter bank and offers nonprogrammer-friendly preview',()=>{
 const ui=read('dual/wonder-park-ui.mjs'),html=read('dual/index.html'),viewer=read('game-park/kho-cau-hoi.html');
 assert.ok(ui.includes("fetch('/game-park/assets/teacher-bank-6-12-63-chapters.json')"));
 assert.ok(html.includes('Kho Toán 6–12 đã cài sẵn'));
 assert.ok(html.includes('kho-cau-hoi.html'));
 assert.ok(viewer.includes("import {addSegments}"));
 assert.ok(read('dual/style.css').includes('readable offline mathematical typesetting'));
 assert.ok(read('game-park/quality-reports/QA_CAU_CAN_RA_SOAT.csv').length>300);
});
