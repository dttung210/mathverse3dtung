import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ALL_MATH6_LABS} from '../src/math6-lab/catalog.js';
import {makeGrade6DragSpec,applyGrade6Drag} from '../src/curriculum/grade6-direct-manipulation.mjs';
import {renderModel} from '../src/math6-lab/canvas.mjs';
import {getRoomsForGrade,getModesForRoom,MODE_BY_ID} from '../src/museum/r6-room-layout.js';
import {getLabDoorsForRoom} from '../src/museum/r68-unified-labs.mjs';
import {getUnifiedLabByModeId} from '../src/museum/r68-unified-labs.mjs';
const mock=()=>new Proxy({}, {get(target,key){
 if(key==='canvas')return {width:920,height:560};
 if(key==='measureText')return text=>({width:String(text).length*11});
 return (key in target)?target[key]:(()=>{});
},set(target,key,value){target[key]=value;return true;}});
const source=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');

test('R7.0: all 63 Grade-6 labs expose direct-manipulation parameter(s)',()=>{
 assert.equal(ALL_MATH6_LABS.length,63);
 for(const model of ALL_MATH6_LABS){
  const handles=makeGrade6DragSpec(model);
  assert(handles.length>=1,`No interactive handle: ${model.id}`);
  for(const h of handles)assert(typeof h.key==='string'&&h.label.length>0);
 }
});

test('R7.0: every Grade-6 math mode remains renderable after user drags its parameter on a light stage',()=>{
 const canvas=mock(),ids=new Set();
 for(const model of ALL_MATH6_LABS){
  ids.add(model.id);
  const p=structuredClone(model.defaults),handles=makeGrade6DragSpec(model);
  // Use the first numeric handle (bars use arrays). Avoid fictitious transforms.
  assert.equal(applyGrade6Drag(model,p,handles[0].key,.62,.51),true,model.id);
  const state={params:p,time:1800,counts:[],tileFlips:new Set(),selectedDesk:0};
  assert.doesNotThrow(()=>renderModel(canvas,model,state,{theme:'light'}),model.id);
  assert(detectFinite(p),model.id+' params became non-finite');
 }
 assert.equal(ids.size,63);
});
function detectFinite(o){return Object.values(o).every(v=>Array.isArray(v)?v.every(Number.isFinite):typeof v!=='number'||Number.isFinite(v));}

test('R7.0: Grade-6 light theme resets safely before a dark legacy draw',()=>{
 const ctx=mock(),model=ALL_MATH6_LABS[0];
 assert.doesNotThrow(()=>renderModel(ctx,model,{params:structuredClone(model.defaults),time:0,counts:[]},{theme:'light'}));
 assert.doesNotThrow(()=>renderModel(ctx,model,{params:structuredClone(model.defaults),time:0,counts:[]}));
 assert.match(source('src/math6-lab/canvas.mjs'),/currentCanvasTheme=themeBefore/);
 assert.match(source('src/curriculum/Grade6Lab.js'),/syncParamControls\(\)/);
});

test('R7.1: 310 modes remain searchable within 76 grouped Lab door entries',()=>{
 let modes=0,doors=0;
 for(let grade=6;grade<=12;grade++)for(const room of getRoomsForGrade(grade)){
  const list=getModesForRoom(room.roomId),labs=getLabDoorsForRoom(room.roomId);
  assert.equal(new Set(labs.flatMap(l=>l.modes.map(m=>m.id))).size,list.length);
  for(const mode of list){assert(MODE_BY_ID.has(mode.id));assert.equal(getUnifiedLabByModeId(mode.id)?.roomId,room.roomId);}
  modes+=list.length;doors+=labs.length;
 }
 assert.equal(modes,310);assert.equal(doors,76);
});

test('R7.3: 3D click and E near a pedestal open the exact mode, not a fabricated model preview',()=>{
 const spatial=source('src/museum/r6-spatial-manager.js'),museum=source('src/museum.js'),main=source('src/main.js');
 assert.match(spatial,/stand\.userData\.thematicLabId=lab\.labId/);
 assert.match(spatial,/return \{action:'nearMode',modeId:closest\.mode\.id,labId:closest\.labId/);
 assert.match(museum,/activeNearThematicMode=r6Ev\?\.action==='nearMode'/);
 assert.match(museum,/if\(activeNearThematicMode\?\.modeId\)/);
 assert.match(main,/curriculumExplorer\.open\(mode\.grade,activeLabId,mode\.id\)/);
 assert.match(spatial,/createModeExhibit\(/); // 3D previews stand directly in the room behind each gate.
});
