import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,join} from 'node:path';
import {initializeParkUI} from '../dual/wonder-park-ui.mjs';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(readFileSync(join(ROOT,'game-park/assets/teacher-bank-9-chapters.json'),'utf8'));
class E{
 constructor(){this.children=[];this.hidden=false;this.disabled=false;this.dataset={};this.listeners={};this.style={};this.textContent='';this.className='';this.value='';this.title='';this.files=[];this.classList={add(){},remove(){},toggle(){},contains(){return false;}};}
 addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}
 appendChild(item){this.children.push(item);return item;}
 append(...items){this.children.push(...items);}
 replaceChildren(...items){this.children=[...items];}
 async fire(type){if(type==='click'&&this.disabled)return;for(const fn of this.listeners[type]||[])await fn({target:this});}
 async click(){await this.fire('click');}
}
function setup(){
 const saved={document:globalThis.document,window:globalThis.window,fetch:globalThis.fetch,
   setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout};
 const store=new Map(),nodes=new Map();
 const get=id=>{if(!nodes.has(id))nodes.set(id,new E());return nodes.get(id);};
 globalThis.document={getElementById:get,createElement:()=>new E(),createElementNS:()=>new E(),createTextNode:t=>({textContent:t})};
 globalThis.window={localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>{store.set(k,v)},removeItem:k=>{store.delete(k)}}};
 globalThis.fetch=async url=>({ok:true,json:async()=> url.includes('teacher-bank-9-chapters')?data:{meta:{grade:6,chapter:1},questions:[]}});
 globalThis.setTimeout=fn=>{queueMicrotask(fn);return 1};globalThis.clearTimeout=()=>{};
 const park={zones:Array.from({length:11},(_,i)=>({name:`Game ${i}`,short:`Game ${i}`,guide:'Hướng dẫn',staff:'NPC',emoji:'🎮'})),gateOpen:true,sanctuaryActive:false,
   openGate(){return true;},focusGame(){},drawFortuneLot(){},resetChicken(){},resetRocket(){},
   resetMillionaire(){},resetTug(){},resetSoccer(){},resetBridge(){},resetArchitect(){},resetCoaster(){},resetBalloon(){}};
 const messages=[];
 const ui=initializeParkUI({park,notice:t=>messages.push(t),visitZone(){},travelToGate(){},focusPark(){},focusZone(){},closeFocus(){},enterGameMode(){},leaveGameMode(){},enterRoom(){},exitRoom(){},toSanctuaryDoor(){}});
 return {get,ui,messages,store,async flush(){await Promise.resolve();await Promise.resolve();await new Promise(setImmediate)},cleanup(){Object.assign(globalThis,saved)}};
}
test('NPC asks grade/chapter, loads 9 chapters and starts chapter-6 game only',async()=>{
 const x=setup();try{
  await x.get('mvpark-zone-list').children[0].click();await x.flush();
  assert.equal(x.get('mvpark-learning-setup').hidden,false);
  assert.equal(x.get('mvpark-rule-list').children.length,4);
  assert.equal(x.get('mvpark-chapter').children.length,9);
  assert.equal(x.get('mvpark-start').disabled,false);
  x.get('mvpark-chapter').value='6';await x.get('mvpark-chapter').fire('change');
  assert.match(x.get('mvpark-bank-status').textContent,/Sẵn sàng/);
  await x.get('mvpark-start').click();await x.flush();
  assert.equal(x.ui.quiz.mode,0);
  assert.equal(x.ui.quiz.selection.chapter,6);
  assert.ok(x.ui.quiz.round.every(q=>q.grade===6&&q.chapter===6));
  assert.match(x.get('mvpark-quiz-scope').textContent,/Chương 6/);
 }finally{x.cleanup()}
});
test('Grade without teacher data disables start, without pulling Grade 6 questions',async()=>{
 const x=setup();try{
  await x.get('mvpark-zone-list').children[0].click();await x.flush();
  x.get('mvpark-grade').value='9';await x.get('mvpark-grade').fire('change');
  assert.equal(x.get('mvpark-start').disabled,true);
  assert.match(x.get('mvpark-bank-status').textContent,/Chưa có kho câu hỏi Toán 9/);
  await x.get('mvpark-start').click();await x.flush();
  assert.equal(x.ui.quiz,null);
 }finally{x.cleanup()}
});
test('Whole-grade choice persists while switching games and makes 15-question millionaire quiz',async()=>{
 const x=setup();try{
  await x.get('mvpark-zone-list').children[0].click();await x.flush();
  x.get('mvpark-scope').value='grade';await x.get('mvpark-scope').fire('change');
  assert.equal(x.get('mvpark-chapter-wrap').hidden,true);
  assert.match(x.get('mvpark-bank-status').textContent,/351 câu/);
  await x.get('mvpark-zone-list').children[10].click();await x.flush();
  assert.equal(x.get('mvpark-start').disabled,false);
  assert.equal(x.get('mvpark-rule-list').children.length,4);
  await x.get('mvpark-start').click();await x.flush();
  assert.equal(x.ui.quiz.mode,10);assert.equal(x.ui.quiz.round.length,15);
  assert.equal(x.ui.quiz.selection.scope,'grade');
  assert.match(x.get('mvpark-quiz-scope').textContent,/Toàn bộ kiến thức lớp 6/);
 }finally{x.cleanup()}
});
test('Maze rules are visible, while grade selection stays hidden',async()=>{
 const x=setup();try{
  await x.get('mvpark-zone-list').children[7].click();await x.flush();
  assert.equal(x.get('mvpark-learning-setup').hidden,true);
  assert.equal(x.get('mvpark-rules-card').hidden,false);
  assert.equal(x.get('mvpark-rule-list').children.length,4);
  assert.equal(x.get('mvpark-start').disabled,false);
 }finally{x.cleanup()}
});
test('Teacher can upload their own JSON for Grade 7; local chapter becomes available without replacing Grade 6',async()=>{
 const x=setup();try{
  await x.get('mvpark-zone-list').children[0].click();await x.flush();
  x.get('mvpark-grade').value='7';await x.get('mvpark-grade').fire('change');
  assert.equal(x.get('mvpark-start').disabled,true);
  const teacherCopy={chapters:[{grade:7,chapter:1,title:'Chương tự cung cấp',questions:data.chapters[0].questions.slice(0,15)}]};
  const raw=JSON.stringify(teacherCopy);
  x.get('mvpark-bank-file').files=[{name:'kho-lop-7.json',size:raw.length,text:async()=>raw}];
  await x.get('mvpark-bank-import').click();await x.flush();
  assert.match(x.get('mvpark-import-feedback').textContent,/Đã nạp 15 câu/);
  assert.ok(x.store.has('mathverse_park_uploaded_teacher_bank_v8'));
  assert.equal(x.get('mvpark-start').disabled,false);
  await x.get('mvpark-start').click();await x.flush();
  assert.equal(x.ui.quiz.selection.grade,7);
  assert.ok(x.ui.quiz.round.every(q=>q.grade===7&&q.chapter===1));
 }finally{x.cleanup()}
});
