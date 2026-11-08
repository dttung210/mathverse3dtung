import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,join} from 'node:path';
import {normalizeTeacherBank,mergeTeacherChapters,getAvailableChapters,filterQuestionPool,checkQuestionReadiness,pickQuestionsForGame,GRADES} from '../dual/wonder-park-v8-bank.mjs';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const teacher=JSON.parse(readFileSync(join(ROOT,'game-park/assets/teacher-bank-9-chapters.json'),'utf8'));
const chapters=normalizeTeacherBank(teacher);
const select=(grade,scope,chapter=1)=>({grade,scope,chapter});
const read=(name)=>readFileSync(join(ROOT,name),'utf8');

test('V8 uses 360 original teacher-extracted items in nine grade-6 chapters; flags nine, never invents questions',()=>{
  assert.deepEqual(GRADES,[6,7,8,9,10,11,12]);
  assert.equal(chapters.length,9);
  assert.equal(chapters.reduce((n,ch)=>n+ch.total,0),360);
  assert.equal(chapters.reduce((n,ch)=>n+ch.questions.length,0),351);
  assert.equal(chapters.reduce((n,ch)=>n+ch.ignored,0),9);
  assert.ok(chapters.every(ch=>ch.grade===6&&ch.questions.every(q=>q.grade===6&&q.chapter===ch.chapter)));
  assert.equal(chapters[0].questions.length,40);
});
test('Teacher-controlled chapter selection respects exact grade and chapter',()=>{
  for(let chapter=1;chapter<=9;chapter++){
    const pool=filterQuestionPool(chapters,select(6,'chapter',chapter));
    assert.ok(pool.length>=30);
    assert.ok(pool.every(q=>q.grade===6&&q.chapter===chapter));
  }
  assert.equal(filterQuestionPool(chapters,select(6,'chapter',10)).length,0);
  for(const grade of [7,8,9,10,11,12]){
    assert.equal(getAvailableChapters(chapters,grade).length,0);
    assert.equal(checkQuestionReadiness(chapters,select(grade,'grade'),0).ready,false);
  }
});
test('Whole-grade mode combines only chapter pool for that grade, never another grade',()=>{
  const pool=filterQuestionPool(chapters,select(6,'grade'));
  assert.equal(pool.length,351);
  assert.ok(pool.every(q=>q.grade===6&&q.chapter>=1&&q.chapter<=9));
  const ids=new Set(pool.map(q=>`${q.grade}-${q.chapter}-${q.id}`));
  assert.equal(ids.size,351);
});
test('Ten questions mix correct grade/chapter, and millionaire needs five each difficulty',()=>{
  for(const scope of ['chapter','grade']){
    const selected=select(6,scope,1);
    for(const mode of [0,1,2,3,4,5,6,8,9]){
      const pool=pickQuestionsForGame(chapters,selected,mode);
      assert.equal(pool.length,10);
      assert.equal(new Set(pool.map(q=>q.id)).size,10);
      assert.ok(pool.every(q=>q.grade===6&&(scope==='grade'||q.chapter===1)));
    }
    const millionaire=pickQuestionsForGame(chapters,selected,10);
    assert.equal(millionaire.length,15);
    assert.ok(millionaire.slice(0,5).every(q=>q.difficulty==='Dễ'));
    assert.ok(millionaire.slice(5,10).every(q=>q.difficulty==='Trung bình'));
    assert.ok(millionaire.slice(10,15).every(q=>q.difficulty==='Khó'));
  }
});
test('No questions are generated for empty grade, and maze does not require a bank',()=>{
  assert.equal(checkQuestionReadiness(chapters,select(12,'grade'),10).ready,false);
  assert.throws(()=>pickQuestionsForGame(chapters,select(12,'grade'),0),/Chưa có kho/);
  assert.deepEqual(pickQuestionsForGame(chapters,select(12,'grade'),7),[]);
});
test('Millionaire cannot start with insufficient medium/hard questions',()=>{
  const q=chapters[0].questions;
  const easyOnly={grade:6,chapter:1,title:'Thử nhập',questions:q.filter(x=>x.difficulty==='Dễ')};
  const catalog=normalizeTeacherBank({chapters:[easyOnly]});
  assert.equal(checkQuestionReadiness(catalog,select(6,'chapter',1),10).ready,false);
  assert.match(checkQuestionReadiness(catalog,select(6,'chapter',1),10).reason,/5 câu Dễ/);
  assert.equal(checkQuestionReadiness(catalog,select(6,'chapter',1),0).ready,true);
});
test('Teacher JSON import replaces a chapter within the same grade, without modifying other chapters',()=>{
  const q=chapters[0].questions.slice(0,2).map(item=>({...item,grade:7,chapter:2}));
  const parsed=normalizeTeacherBank({chapters:[{grade:7,chapter:2,title:'Số hữu tỉ',questions:q}]});
  const merged=mergeTeacherChapters(chapters,parsed);
  assert.equal(getAvailableChapters(merged,7).length,1);
  assert.equal(filterQuestionPool(merged,select(7,'chapter',2)).length,2);
  assert.equal(filterQuestionPool(merged,select(6,'grade')).length,351);
  const newSame=normalizeTeacherBank({chapters:[{grade:7,chapter:2,title:'Số hữu tỉ',questions:[q[0]]}]});
  assert.equal(filterQuestionPool(mergeTeacherChapters(merged,newSame),select(7,'chapter',2)).length,1);
});
test('Reject bogus teacher bank, duplicate ids, and bad answer keys',()=>{
  assert.throws(()=>normalizeTeacherBank({chapters:[{grade:15,chapter:1,questions:[]}]}),/lớp 6/);
  assert.throws(()=>normalizeTeacherBank({metadata:'missing'}),/chapters/);
  const q=chapters[0].questions[0];
  const parsed=normalizeTeacherBank({chapters:[{grade:8,chapter:1,title:'Đại số',questions:[q,q,{...q,id:'wrong',answer:'Q'}]}]});
  assert.equal(parsed[0].total,3);
  assert.equal(parsed[0].questions.length,1);
  assert.equal(parsed[0].ignored,2);
  const duplicateChoice={...q,id:'duplicate-choice',choices:{...q.choices,B:q.choices.A}};
  const duplicateBank=normalizeTeacherBank({chapters:[{grade:8,chapter:2,questions:[duplicateChoice]}]});
  assert.equal(duplicateBank[0].ignored,1);
});
test('UI offers all grades, chapter or all-grade selection, rules per game and a ready gate',()=>{
  const page=read('dual/index.html'),logic=read('dual/wonder-park-ui.mjs'),styles=read('dual/style.css');
  for(const id of ['mvpark-learning-setup','mvpark-grade','mvpark-scope','mvpark-chapter','mvpark-bank-status','mvpark-rules-card','mvpark-rule-list','mvpark-bank-file','mvpark-quiz-scope'])assert.match(page,new RegExp(`id="${id}"`));
  for(const grade of GRADES)assert.match(page,new RegExp(`<option value="${grade}">Toán ${grade}</option>`));
  assert.match(page,/value="grade">Toàn bộ kiến thức lớp/);
  assert.match(logic,/checkQuestionReadiness\(b\.chapters,picked,zone\)/);
  assert.match(logic,/pickQuestionsForGame\(b\.chapters,picked,zone\)/);
  assert.match(logic,/startButton\.disabled=!status\.ready/);
  for(let index=0;index<=10;index++)assert.ok(logic.includes(`${index}:[`),`missing rules ${index}`);
  assert.match(styles,/\.mvpark-learning-setup/);
  assert.ok(!page.includes('id="game-park-frame"'));
});
