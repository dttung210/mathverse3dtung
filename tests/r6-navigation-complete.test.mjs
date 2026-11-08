import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import * as THREE from '../vendor/three.module.js';
import {ROOM_BY_ID,LAB_BY_ID,MODE_BY_ID,getRoomsForGrade,getRoomById,getLabById,getModeById} from '../src/museum/r6-room-layout.js';
import {LAB_TO_EXHIBIT,ALL_MATH6_LABS} from '../src/math6-lab/catalog.js';
import {classifyPortal,resolveSelection} from '../src/museum/r6-navigation-core.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source=name=>fs.readFileSync(path.join(root,name),'utf8');

test('R6.2 seven grades: 34 thematic rooms, 130 real Lab IDs, 310 modes',()=>{
 assert.equal(ROOM_BY_ID.size,34);assert.equal(LAB_BY_ID.size,130);assert.equal(MODE_BY_ID.size,310);
 for(const [grade,rooms,labs,modes] of [[6,4,63,63],[7,5,10,41],[8,5,9,37],[9,5,13,46],[10,5,11,38],[11,5,13,46],[12,5,11,39]]){
  const list=getRoomsForGrade(grade);
  assert.equal(list.length,rooms,'grade '+grade+' rooms');
  assert.equal(list.reduce((n,x)=>n+x.labs.length,0),labs,'grade '+grade+' labs');
  assert.equal(list.reduce((n,x)=>n+x.labs.reduce((k,l)=>k+l.modes.length,0),0),modes,'grade '+grade+' modes');
 }
});

test('R6.2 every registered model has a unique owner Lab and room, no duplicate',()=>{
 let total=0;const ids=new Set();
 for(const room of ROOM_BY_ID.values())for(const lab of room.labs)for(const mode of lab.modes){
  assert.ok(!ids.has(mode.id));ids.add(mode.id);total++;
  assert.equal(getModeById(mode.id).labId,lab.labId);
  assert.equal(getModeById(mode.id).roomId,room.roomId);
  assert.equal(getLabById(lab.labId).roomId,room.roomId);
 }
 assert.equal(total,310);
});

test('R6.2 portal destinations are grade-restricted and any of 34 thematic rooms is reachable',()=>{
 for(const room of ROOM_BY_ID.values()){
  const resolved=classifyPortal(room.grade,room.roomId,getRoomById);
  assert.equal(resolved.roomId,room.roomId);
  assert.equal(classifyPortal(room.grade===6?7:6,room.roomId,getRoomById),null);
 }
 assert.equal(classifyPortal(6,'plane',getRoomById),null);
});

test('R6.2 scene click resolves a Lab, and each model to its own Lab mode',()=>{
 for(const lab of LAB_BY_ID.values()){
  const info=resolveSelection({kind:'r6-lab',labId:lab.labId},getLabById,getModeById);
  assert.deepEqual(info,{kind:'lab',id:lab.labId,grade:lab.grade,roomId:lab.roomId});
  for(const mode of lab.modes){
   const hit=resolveSelection(mode.id,getLabById,getModeById);
   assert.equal(hit?.kind,'mode');assert.equal(hit.labId,lab.labId);
  }
 }
 assert.equal(resolveSelection({id:'model_a',type:'cuboid'},getLabById,getModeById),null);
});

test('R6.2 63 Grade6 Lab IDs map to original source exhibits; 28 remain in archive',()=>{
 assert.equal(ALL_MATH6_LABS.length,63);
 const labs=ROOM_BY_ID.values().flatMap?.(x=>x.labs) ?? [...ROOM_BY_ID.values()].flatMap(x=>x.labs);
 const selected=[...ROOM_BY_ID.values()].filter(r=>r.grade===6).flatMap(r=>r.labs);
 assert.equal(selected.length,63);
 assert.equal(selected.filter(l=>l.status==='featured').length,35);
 assert.equal(selected.filter(l=>l.status==='archived').length,28);
 const src=JSON.parse(source('data/catalog.json'));
 const orig=new Set(src.items.map(x=>x.id));
 for(const l of selected){const anchor=LAB_TO_EXHIBIT[l.labId];assert.ok(anchor,`no anchor ${l.labId}`);assert.ok(orig.has(anchor),`missing exhibit ${anchor}`);}
});

test('R6.2 removes Grade6 giant portal panel and routes clicks into real renderer',()=>{
 const main=source('src/main.js'),museum=source('src/museum.js'),shell=source('src/ui/LabShell.js'),css=source('src/r6-lab-layout.css');
 assert.match(main,/navigateToLab\(lab\.labId\)/);assert.match(main,/if\(lab\.labId===activeLabId\)labCard\.append\(modeList\)/);
 assert.match(main,/const match=resolveSelection\(id,getLabById,getModeById\)/);
 assert.match(museum,/activeNearPortal\.thematicRoomId\|\|activeNearPortal\.zone/);
 assert.match(museum,/thematicLabId/);assert.match(museum,/kind:"r6-lab"/);
 assert.match(shell,/this\._enterMath6Lab\(labId\)/);assert.match(css,/bottom: auto !important/);
 assert.match(css,/max-height: min\(240px,30dvh\) !important/);
});

// R7.1 accepts one physical Lab door per learning family, no duplicate podiums.
import {getModesForRoom} from '../src/museum/r6-room-layout.js';
import {getLabDoorsForRoom} from '../src/museum/r68-unified-labs.mjs';
test('R7.3: 76 Lab zones inside the gates preserve all 310 original model IDs',()=>{
 const spatial=source('src/museum/r6-spatial-manager.js');
 assert.match(spatial,/getLabDoorsForRoom\(roomId\)/);
 assert.match(spatial,/planR73RoomGallery\(room,cfg,labs\)/);
 assert.match(spatial,/this\.buildLabZones\(P,/);
 assert.match(spatial,/this\.labZones\.push/);
 assert.match(spatial,/createModelPedestal\(/); // Pedestals are mounted as soon as the gate is entered.
 const all=[...ROOM_BY_ID.values()];
 assert.equal(all.reduce((n,r)=>n+getLabDoorsForRoom(r.roomId).length,0),76);
 assert.equal(all.reduce((n,r)=>n+getModesForRoom(r.roomId).length,0),310);
});

