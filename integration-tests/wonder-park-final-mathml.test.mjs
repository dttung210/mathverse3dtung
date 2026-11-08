import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseLatex} from '../dual/wonder-park-ui.mjs';
import {checkQuestionReadiness,normalizeTeacherBank,pickQuestionsForGame} from '../dual/wonder-park-v8-bank.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const full=JSON.parse(readFileSync(join(root,'game-park/assets/teacher-bank-6-12-63-chapters.json'),'utf8'));
const raw=full.chapters.flatMap(c=>c.questions);
const approved=raw.filter(q=>!q.issues?.length);
const qa=JSON.parse(readFileSync(join(root,'game-park/quality-reports/QA_TONG_HOP_KHO_TOAN_6_12.json'),'utf8'));
class MiniNode{
  constructor(name){this.name=name;this.children=[];this.text='';}
  appendChild(v){this.children.push(v);return v;}
  set textContent(v){this.text=String(v);this.children=[];}
  get textContent(){return this.text+this.children.map(c=>c.textContent).join('');}
}
const inspect=(n,tag,out=[])=>{
  if(n.name===tag)out.push(n);
  for(const c of n.children)inspect(c,tag,out);
  return out;
};
function withMath(fn){
  const saved=globalThis.document;globalThis.document={createElementNS:(ns,tag)=>{assert.equal(ns,'http://www.w3.org/1998/Math/MathML');return new MiniNode(tag)}};
  try{return fn()}finally{globalThis.document=saved;}
}
test('FINAL includes seven grades and 63 chapters with original 3150 questions, 3087 structurally playable',()=>{
  assert.equal(full.chapters.length,63);
  assert.equal(raw.length,3150);
  assert.equal(approved.length,3087);
  assert.equal(raw.length-approved.length,63);
  assert.equal(qa.issueCount,63);
  assert.equal(qa.readyCount,3087);
  assert.equal(new Set(raw.map(q=>q.id)).size,3150);
  assert.ok(statSync(join(root,'game-park/teacher-source/Bo_Phieu_Hoc_Tap_Toan_6_12_Word_LaTeX_PDF.zip')).size>3000000);
});
test('FINAL MathML combines limits/subscripts, keeps bracket powers, draws fractions and radicals',()=>withMath(()=>{
  const integral=parseLatex(String.raw`\int_{0}^{2} x^{2}`);
  const subSup=inspect(integral,'msubsup');
  assert.equal(subSup.length,1);
  assert.equal(subSup[0].children[0].textContent,'∫');
  assert.equal(subSup[0].children[1].textContent,'0');
  assert.equal(subSup[0].children[2].textContent,'2');
  assert.equal(inspect(integral,'msup').length,1);
  const power=parseLatex(String.raw`[f(x)]^{2}`);
  assert.ok(inspect(power,'msup').length===1);
  const fraction=parseLatex(String.raw`\frac{3}{\sqrt{9}}`);
  assert.equal(inspect(fraction,'mfrac').length,1);
  assert.equal(inspect(fraction,'msqrt').length,1);
  assert.equal(inspect(parseLatex(String.raw`\sqrt[3]{8}`),'mroot').length,1);
  assert.equal(inspect(parseLatex(String.raw`\vec{AB}`),'mover').length,1);
  assert.equal(parseLatex(String.raw`\mathbb{R}`).textContent,'ℝ');
}));
test('FINAL renders all author-supplied TeX snippets without unknown symbols or orphan scripts',()=>withMath(()=>{
  let snippets=0,unsupported=[];
  for(const q of approved)for(const segments of [q.prompt_segments,...Object.values(q.choice_segments)])for(const piece of segments){
    if(piece.t!=='math')continue;
    snippets++;
    const tree=parseLatex(piece.v);
    for(const n of inspect(tree,'mtext'))if(n.textContent.startsWith('\\'))unsupported.push([q.id,n.textContent]);
    for(const kind of ['msup','msub','msubsup'])for(const n of inspect(tree,kind))
      assert.ok(n.children[0]?.textContent?.trim(),`Orphan script: ${q.id} / ${piece.v}`);
  }
  assert.ok(snippets>1500);
  assert.deepEqual(unsupported,[]);
}));
test('FINAL preserves every original answer and source LaTeX, including one display-only repair',()=>{
  const repaired=raw.find(q=>q.id==='12-04-03');
  assert.equal(repaired.answer,'A'); // Answer key in NEW teacher-supplied source, never the older V9 source.
  assert.equal(repaired.issues.length,0);
  assert.equal(repaired.sourceTex.choices.C,String.raw`S = $\int_{a}^{b}$ [f(x)]$^2$ dx`);
  assert.ok(repaired.choice_segments.C.some(s=>s.t==='math'&&s.v==='[f(x)]^{2}'));
  assert.ok(repaired.formattingFixes.length>0);
  assert.ok(raw.filter(q=>q.issues.length).every(q=>!!q.sourceTex?.question));
});
test('FINAL only selects author-provided questions within selected grade/chapter across all quiz games',()=>{
  const chapters=normalizeTeacherBank(full);
  for(let grade=6;grade<=12;grade++){
    const sections=chapters.filter(c=>c.grade===grade);
    for(const c of sections){
      const selection={grade,scope:'chapter',chapter:c.chapter};
      for(const mode of [0,1,2,3,4,5,6,8,9,10]){
        assert.equal(checkQuestionReadiness(chapters,selection,mode).ready,true);
        const chosen=pickQuestionsForGame(chapters,selection,mode);
        assert.equal(chosen.length,mode===10?15:10);
        assert.ok(chosen.every(q=>q.grade===grade&&q.chapter===c.chapter&&!q.issues?.length));
      }
    }
  }
});
