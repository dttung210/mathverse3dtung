import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join,dirname} from 'node:path';
import {initializeParkUI} from '../dual/wonder-park-ui.mjs';
const ROOT=join(dirname(fileURLToPath(import.meta.url)),'..');
const BANK=JSON.parse(readFileSync(join(ROOT,'game-park/assets/questions.json'),'utf8'));
class FakeElement{
 constructor(){this.children=[];this.hidden=false;this.disabled=false;this.dataset={};this.listeners={};this.style={};this.textContent='';this.className='';this.classList={add:()=>{},remove:()=>{},contains:()=>false};}
 addEventListener(name,fn){(this.listeners[name]??=[]).push(fn);}
 append(...nodes){this.children.push(...nodes);}
 appendChild(node){this.children.push(node);return node;}
 replaceChildren(...nodes){this.children=[...nodes];}
 async click(){const list=this.listeners.click||[];for(const fn of list)await fn({target:this});}
}
function prepare(){
 const native={document:globalThis.document,window:globalThis.window,fetch:globalThis.fetch,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout};
 const elements=new Map();const get=id=>{if(!elements.has(id))elements.set(id,new FakeElement());return elements.get(id);};
 globalThis.document={getElementById:get,createElement:()=>new FakeElement(),createElementNS:()=>new FakeElement(),createTextNode:str=>({textContent:str})};
 globalThis.window={};globalThis.fetch=async()=>({ok:true,json:async()=>BANK});
 globalThis.setTimeout=fn=>{queueMicrotask(fn);return 1;};globalThis.clearTimeout=()=>{};
 const calls={chickenKick:0,playerKick:0,rocketFail:0,rocketWin:0,rocketCorrect:0,lot:0,door:0};
 const zones=Array.from({length:10},(_,i)=>({name:'Zone '+i,short:'Zone '+i,emoji:'🎮',staff:'NPC',guide:'Guide '+i}));
 const park={zones,gateOpen:true,sanctuaryActive:false,
  resetChicken(){},focusGame(){},resetRocket(){},correctRocket(){calls.rocketCorrect++;},failRocket(){calls.rocketFail++;},winRocket(){calls.rocketWin++;},
  kickEnemy(){calls.chickenKick++;},kickPlayer(){calls.playerKick++;},drawFortuneLot(){calls.lot++;},openGate(){return true;}
 };
 const ui=initializeParkUI({park,notice:()=>{},travelToGate:()=>{},visitZone:()=>{},focusPark:()=>{},focusZone:()=>{},closeFocus:()=>{},
  enterGameMode:()=>{},leaveGameMode:()=>{},enterRoom:()=>{park.sanctuaryActive=true;},exitRoom:()=>{park.sanctuaryActive=false;},toSanctuaryDoor:()=>{calls.door++;}});
 return {ui,park,calls,get,async flush(){await Promise.resolve();await new Promise(setImmediate);},cleanup(){Object.assign(globalThis,native);}};
}
test('Game 1 focuses champion chicken; wrong answer ejects champion and ends the round',async()=>{
 const x=prepare();try{
  await x.get('mvpark-zone-list').children[0].click();await x.get('mvpark-start').click();await x.flush();
  assert.equal(x.ui.quiz.mode,0);assert.equal(x.ui.quiz.eye,false);
  const q=x.ui.quiz.round[0],wrong=[...x.get('mvpark-answers').children].find(b=>b.dataset.original!==q.answer);
  await wrong.click();await x.flush();
  assert.equal(x.calls.playerKick,1);assert.equal(x.calls.chickenKick,0);
  assert.match(x.get('mvpark-result-heading').textContent,/BỊ LOẠI/);
  assert.equal(x.get('mvpark-result').hidden,false);
 }finally{x.cleanup();}
});
test('Game 2 wrong answer launches rocket into disappearance and restarts from zero; 10/10 wins',async()=>{
 const x=prepare();try{
  await x.get('mvpark-zone-list').children[1].click();await x.get('mvpark-start').click();await x.flush();
  let q=x.ui.quiz.round[0];
  await [...x.get('mvpark-answers').children].find(b=>b.dataset.original!==q.answer).click();await x.flush();
  assert.equal(x.calls.rocketFail,1);assert.match(x.get('mvpark-result-heading').textContent,/TÊN LỬA ĐÃ BIẾN MẤT/);
  await x.get('mvpark-retry').click();await x.flush();
  assert.equal(x.ui.quiz.index,0);assert.equal(x.ui.quiz.correct,0);
  for(let k=0;k<10;k++){
   q=x.ui.quiz.round[k];
   const right=[...x.get('mvpark-answers').children].find(b=>b.dataset.original===q.answer);
   assert.ok(right,`correct answer for question ${k+1}`);await right.click();await x.flush();
  }
  assert.equal(x.calls.rocketCorrect,10);assert.equal(x.calls.rocketWin,1);
  assert.match(x.get('mvpark-result-heading').textContent,/HỌC BÁ TÊN LỬA/);
 }finally{x.cleanup();}
});
test('Game 3 requires entering room, meeting NPC, drawing each lot, then error returns to door',async()=>{
 const x=prepare();try{
  await x.get('mvpark-zone-list').children[2].click();
  assert.equal(x.get('mvpark-start').hidden,true);
  await x.get('mvpark-enter-room').click();
  assert.equal(x.park.sanctuaryActive,true);
  assert.equal(x.get('mvpark-start').hidden,true,'must first meet NPC');
  x.ui.showSanctuaryNpc();assert.equal(x.get('mvpark-start').hidden,false);
  await x.get('mvpark-start').click();await x.flush();
  assert.equal(x.ui.quiz.mode,2);
  assert.equal(x.get('mvpark-draw-lot').hidden,false);
  assert.equal(x.get('mvpark-answers').children.length,0);
  await x.get('mvpark-draw-lot').click();assert.equal(x.calls.lot,1);
  const wrong=[...x.get('mvpark-answers').children].find(b=>b.dataset.original!==x.ui.quiz.round[0].answer);
  await wrong.click();await x.flush();
  assert.equal(x.calls.door,1);
  assert.match(x.get('mvpark-result-heading').textContent,/MỜI THÍ CHỦ VỀ TU LUYỆN/);
 }finally{x.cleanup();}
});
