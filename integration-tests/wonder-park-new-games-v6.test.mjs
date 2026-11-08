import {loadParkModule} from './_v7-three-test-loader.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {initializeParkUI} from '../dual/wonder-park-ui.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const bank=JSON.parse(read('game-park/assets/questions.json'));
const threeUrl=pathToFileURL(path.join(ROOT,'vendor/three.module.js')).href;
const THREE=await import(threeUrl);
const world=await loadParkModule(ROOT);
function worldFixture(){
 const old=globalThis.document;
 globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){},strokeRect(){},fillText(){},measureText:t=>({width:t.length*20})})})};
 try{return{park:world.createWonderParkWorld(),restore(){globalThis.document=old;}};}
 catch(e){globalThis.document=old;throw e;}
}
test('V6: close ring spectator camera and a champion visibly larger than all 10 rivals',()=>{
 const {park,restore}=worldFixture();try{
  const ch=park.group.getObjectByName('WONDER_PARK_ZONE_1');
  assert.ok(ch);
  const chickenGroups=[];
  ch.traverse(obj=>{if(obj.isGroup && (Math.abs(obj.scale.x-1.36)<.01 || Math.abs(obj.scale.x-.73)<.01))chickenGroups.push(obj);});
  assert.equal(chickenGroups.filter(c=>Math.abs(c.scale.x-1.36)<.01).length,1,'one large champion');
  assert.equal(chickenGroups.filter(c=>Math.abs(c.scale.x-.73)<.01).length,10,'ten smaller rivals');
  const p=park.getChickenCameraPose(true),wide=park.getChickenCameraPose(false);
  assert.ok(p&&wide&&p.fov<wide.fov);
  assert.ok(typeof park.resetChicken==='function');
  park.resetChicken();park.openGate();park.tick(2);
  park.kickEnemy();
  assert.ok(chickenGroups.some(c=>Math.abs(c.scale.x-.73)<.01 && c.visible),'rivals remain in arena after first kick');
 }finally{restore();}
});
test('V6: all three new ride models and 10-module architect house are real 3D meshes',()=>{
 const {park,restore}=worldFixture();try{
  park.group.updateMatrixWorld(true);
  assert.ok(park.group.getObjectByName('WONDER_GLASS_BRIDGE_10_STEPS'));
  assert.ok(park.group.getObjectByName('WONDER_ARCHITECT_TEN_MODULES'));
  assert.ok(park.group.getObjectByName('WONDER_COMPLEX_COASTER_WITH_FORK'));
  assert.ok(park.group.getObjectByName('WONDER_SIGHTSEEING_BALLOON'));
  const house=park.group.getObjectByName('WONDER_ARCHITECT_TEN_MODULES');
  assert.equal(house.children.filter(c=>c.name.startsWith('HOUSE_MODULE_')).length,10);
  const bridge=park.group.getObjectByName('WONDER_GLASS_BRIDGE_10_STEPS');
  let transparent=0;bridge.traverse(x=>{if(x.isMesh&&x.material?.transparent&&x.material.opacity<.7)transparent++;});
  assert.ok(transparent>=10,'glass bridge has ten transparent panels');
  const crew=park.group.getObjectByName('ROCKET_V5_PLAYER');
  let passengerCount=0;crew.traverse(n=>{if(n.userData?.seatedNpcCount)passengerCount+=n.userData.seatedNpcCount+n.userData.seatedPlayerCount;});
  assert.equal(passengerCount,2);
 }finally{restore();}
});
test('V6: all rides respond to correct and wrong with distinct animations',()=>{
 const {park,restore}=worldFixture();try{
  park.openGate();park.tick(2);
  for(const name of ['Bridge','Architect','Coaster','Balloon']){
   park['reset'+name]();
   assert.ok(park['get'+name+'CameraPose']());
   park['correct'+name]();
   park.tick(.25);
   park['fail'+name]();
   park.tick(.3);
   park['reset'+name]();
  }
  for(let i=0;i<10;i++)park.correctArchitect();
  park.tick(2);
  const house=park.group.getObjectByName('WONDER_ARCHITECT_TEN_MODULES');
  assert.equal(house.children.filter(c=>c.name.startsWith('HOUSE_MODULE_')).length,10);
  park.resetBalloon();for(let i=0;i<10;i++)park.correctBalloon();park.winBalloon();park.tick(2.5);
  assert.ok(park.getBalloonCameraPose());
  park.focusGame(9);
  assert.equal(park.group.getObjectByName('WONDER_PARK_ZONE_1').visible,true,'sightseeing retains whole park');
  park.clearGameFocus();
 }finally{restore();}
});
test('V6: global Space jump and mobile jump are connected to original character movement',()=>{
 const app=read('dual/app.mjs'),html=read('dual/index.html');
 assert.match(app,/e\.code==='Space'/);
 assert.match(app,/jumpVelocity=JUMP_IMPULSE/);
 assert.match(app,/avatar\.root\.position\.set\(player\.x,jumpHeight,player\.z\)/);
 assert.match(html,/id="touch-jump"/);
 assert.ok(html.includes('Space Nhảy'));
 assert.ok(!html.includes('id="game-park-frame"'));
});
class FakeElement{
 constructor(){this.children=[];this.hidden=false;this.disabled=false;this.dataset={};this.listeners={};this.style={};this.textContent='';this.className='';this.classList={add(){},remove(){},contains(){return false;}};}
 addEventListener(n,f){(this.listeners[n]??=[]).push(f);}
 append(...v){this.children.push(...v);}appendChild(v){this.children.push(v);return v;}
 replaceChildren(...v){this.children=[...v];}
 async click(){for(const f of this.listeners.click||[])await f({target:this});}
}
function uiFixture(){
 const old={document:globalThis.document,window:globalThis.window,fetch:globalThis.fetch,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout};
 const els=new Map(),get=id=>{if(!els.has(id))els.set(id,new FakeElement());return els.get(id);};
 globalThis.document={getElementById:get,createElement:()=>new FakeElement(),createElementNS:()=>new FakeElement(),createTextNode:text=>({textContent:text})};
 globalThis.window={};globalThis.fetch=async()=>({ok:true,json:async()=>bank});
 globalThis.setTimeout=fn=>{queueMicrotask(fn);return 1;};globalThis.clearTimeout=()=>{};
 const calls=[];
 const park={zones:Array.from({length:10},(_,i)=>({name:'Khu '+i,short:'Khu '+i,staff:'NPC',emoji:'🎮',guide:'Hướng dẫn'})),gateOpen:true,sanctuaryActive:false,openGate(){return true;},focusGame(){},drawFortuneLot(){},
  ...Object.fromEntries(['resetChicken','kickEnemy','kickPlayer','resetRocket','correctRocket','failRocket','winRocket','resetBridge','correctBridge','failBridge','resetArchitect','correctArchitect','failArchitect','resetCoaster','correctCoaster','failCoaster','winCoaster','resetBalloon','correctBalloon','failBalloon','winBalloon'].map(k=>[k,()=>{calls.push(k)}]))};
 const ui=initializeParkUI({park,notice:()=>{},visitZone:()=>{},focusZone:()=>{},focusPark:()=>{},travelToGate:()=>{},closeFocus:()=>{},enterGameMode:()=>{},leaveGameMode:()=>{},enterRoom:()=>{},exitRoom:()=>{},toSanctuaryDoor:()=>{}});
 return {ui,calls,get,async flush(){await Promise.resolve();await new Promise(setImmediate);},cleanup(){Object.assign(globalThis,old)}};
}
for(const [zone,tag] of [[3,'Bridge'],[6,'Architect'],[8,'Coaster'],[9,'Balloon']]){
 test(`V6 game ${zone+1}: ${tag} correct progresses, wrong fails, 10/10 awards correct name`,async()=>{
  const x=uiFixture();try{
   await x.get('mvpark-zone-list').children[zone].click();await x.get('mvpark-start').click();await x.flush();
   assert.equal(x.ui.quiz.mode,zone);
   const q=x.ui.quiz.round[0];
   const correct=[...x.get('mvpark-answers').children].find(b=>b.dataset.original===q.answer);
   await correct.click();await x.flush();
   assert.equal(x.calls.filter(c=>c==='correct'+tag).length,1);
   const q2=x.ui.quiz.round[1],wrong=[...x.get('mvpark-answers').children].find(b=>b.dataset.original!==q2.answer);
   await wrong.click();await x.flush();
   assert.equal(x.calls.filter(c=>c==='fail'+tag).length,1);
   assert.equal(x.get('mvpark-result').hidden,false);
   await x.get('mvpark-retry').click();await x.flush();
   assert.equal(x.ui.quiz.index,0);
   for(let i=0;i<10;i++){
    const q3=x.ui.quiz.round[i],right=[...x.get('mvpark-answers').children].find(b=>b.dataset.original===q3.answer);
    assert.ok(right,`question ${i+1}`);await right.click();await x.flush();
   }
   assert.match(x.get('mvpark-result-heading').textContent,/HỌC BÁ/);
   assert.equal(x.calls.filter(c=>c==='correct'+tag).length,11);
  }finally{x.cleanup();}
 });
}
