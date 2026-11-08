import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {planRooms,gradeForPosition,roomWorld,restrictPosition,nearestPortal,entranceVisibilityAtSpawn,ENTRANCE_Z,HUB_RADIUS} from '../dual/layout-plan.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../museum-data/catalog.json',import.meta.url),'utf8'));
const plan=planRooms(data.items);
test('Seven simultaneous exhibition entrances exist around one central rotunda, not a corridor',()=>{
  assert.deepEqual(plan.map(p=>p.grade),[6,7,8,9,10,11,12]);
  assert.equal(plan.length,7);
  assert.equal(new Set(plan.map(p=>p.angleDeg)).size,7);
  assert.ok(plan.every(p=>p.start===HUB_RADIUS));
  assert.deepEqual(plan.map(p=>p.lessons.length),[43,37,39,32,27,33,19]);
  assert.equal(plan.reduce((n,p)=>n+p.lessons.length,0),230);
});
test('V7 seven direct portals fill the circular atrium, and the 7-class map supplies fast access',()=>{
  const visible=entranceVisibilityAtSpawn();
  assert.equal(visible.length,7);
  assert.ok(Math.max(...visible.map(v=>v.bearingDegrees))-Math.min(...visible.map(v=>v.bearingDegrees))>235,'seven portals must face the full circumference');
  for(let i=1;i<visible.length;i++){
    const a=visible[i-1],b=visible[i];
    assert.ok(Math.hypot(a.x-b.x,a.z-b.z)>9.5,'entrance arches overlap');
  }
});
test('All seven halls entered directly from the same central hall',()=>{
  const foyer={x:0,z:ENTRANCE_Z};
  assert.equal(gradeForPosition(plan,foyer),null);
  for(const room of plan){
    const gate=roomWorld(room.theta,HUB_RADIUS-1.2);
    const inside=roomWorld(room.theta,HUB_RADIUS+.8);
    assert.equal(gradeForPosition(plan,inside),room.grade);
    assert.ok(Math.hypot(...Object.values(restrictPosition(plan,gate,inside)).map((v,i)=>v-[inside.x,inside.z][i]))<.001);
    const returnPos=restrictPosition(plan,inside,gate);
    assert.ok(Math.hypot(returnPos.x-gate.x,returnPos.z-gate.z)<.001);
    assert.equal(nearestPortal(plan,gate,3)?.grade,room.grade);
  }
});
test('Walls block sideways passage into adjacent rooms: no linear hallway',()=>{
  const g9=plan.find(r=>r.grade===9);
  const prev=roomWorld(g9.theta,43);
  const sidestep=roomWorld(g9.theta+.30,43);
  const clamped=restrictPosition(plan,prev,sidestep);
  const angle=Math.atan2(clamped.x,-clamped.z);
  assert.ok(Math.abs(angle-g9.theta)<g9.halfAngle);
});
test('All assets have exact source image aspect ratios for no-stretch presentation',()=>{
  assert.ok(data.items.every(it=>it.width>50&&it.height>50));
  assert.ok(data.items.every(it=>Math.abs(it.width/it.height-it.aspect)<.00001));
});
