import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import * as THREE from '../vendor/three.module.js';
import {PEOPLE} from '../src/exhibition/people.mjs';
import {PROFILES} from '../src/exhibition/profiles.mjs';
import {WALL_MODELS,drawPanel} from '../src/exhibition/wall2d.mjs';
import {mountMathematicianFrames} from '../src/exhibition/frames3d.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const originalDoc=await fs.readFile(path.join(root,'src/museum.js'),'utf8');
const entry=await fs.readFile(path.join(root,'src/main.js'),'utf8');
const server=await fs.readFile(path.join(root,'server/server.mjs'),'utf8');
const canvasCalls=[];
const ctx=new Proxy({}, {
  get(_obj,key){
    if(key==='createLinearGradient'||key==='createRadialGradient')return ()=>({addColorStop(){}});
    if(key==='measureText')return t=>({width:String(t).length*9});
    if(key==='canvas')return null;
    return (...args)=>{canvasCalls.push([key,args.length]);};
  },
  set(){return true;}
});
const makeCanvas=()=>({width:720,height:370,getContext:()=>ctx});
globalThis.document={createElement(tag){if(tag==='canvas')return makeCanvas();throw Error('Canvas only, got '+tag);}};
const listeners=new Set();
globalThis.window={addEventListener(key){listeners.add(key)},removeEventListener(key){listeners.delete(key)},dispatchEvent(){}};
globalThis.fetch=async()=>({ok:false});

test('MATHVERSE R74 imports exhibition as part of its native source, no independent addon install',()=>{
  assert.match(entry,/import '\.\/exhibition\/boot\.mjs';/);
  assert.match(originalDoc,/import \{mountMathematicianFrames\} from '\.\/exhibition\/frames3d\.mjs'/);
  assert.match(originalDoc,/mathHistoryGallery=mountMathematicianFrames\(THREE,libRoom/);
  assert.match(originalDoc,/mathHistoryTargets=mathHistoryGallery.targets/);
  assert.match(originalDoc,/function handleExhibitionHit\(object\)/);
  assert.equal((originalDoc.match(/if\(handleExhibitionHit\(cur\)\)return;/g)||[]).length,2,'supports mouse and pointer-locked camera');
  assert.match(originalDoc,/mathHistoryGallery\?\.syncProximity/);
  assert.match(originalDoc,/mathHistoryGallery\?\.destroy/);
  assert.match(server,/https:\/\/www.geogebra.org/);
  assert.match(server,/https:\/\/upload.wikimedia.org/);
  assert.doesNotMatch(entry,/addons\/mv-history-gallery/);
  assert.doesNotMatch(originalDoc,/addons\/mv-history-gallery/);
});

test('18 mathematicians (11 original + 2 Vietnamese + 5 new) have portraits, biographies and 2 works',()=>{
  assert.equal(PEOPLE.length,18);assert.equal(Object.keys(PROFILES).length,18);
  assert.equal(new Set(PEOPLE.map(p=>p.id)).size,18);
  for(const p of PEOPLE){
    assert.ok(PROFILES[p.id].bio.length>80,p.id);
    assert.equal(PROFILES[p.id].works.length,2,p.id);
    assert.ok(p.modeId&&p.formula&&p.commons,p.id);
  }
});

test('7 grade walls contain exactly 14 individual 2D illustrations with correct modeId',()=>{
  assert.equal(WALL_MODELS.length,14);
  assert.equal(new Set(WALL_MODELS.map(m=>m.id)).size,14);
  for(let g=6;g<=12;g++)assert.equal(WALL_MODELS.filter(x=>x.grade===g).length,2);
  for(const m of WALL_MODELS){
    assert.ok(m.modeId.length>4&&m.formula.length>0);
    drawPanel(makeCanvas(),m,1.25);
  }
  assert.ok(canvasCalls.length>400);
});

test('32 independent exhibition links all point to real 310 model IDs',async()=>{
  const {CURRICULUM_CHAPTERS_MANIFEST}=await import('../src/curriculum/curriculum-manifest.mjs');
  const all=new Set(CURRICULUM_CHAPTERS_MANIFEST.grades.flatMap(g=>g.chapters.flatMap(ch=>ch.lessons.flatMap(l=>l.models.map(m=>m.id)))));
  assert.equal(all.size,310);
  for(const p of PEOPLE)assert.ok(all.has(p.modeId),p.id+': '+p.modeId);
  for(const m of WALL_MODELS)assert.ok(all.has(m.modeId),m.id+': '+m.modeId);
});

test('3D exhibit room mounts 18 frames, 14 hallway boards and 2 GeoGebra pedestals',()=>{
  const building=new THREE.Group(),exRoom=new THREE.Group();
  const rooms=Object.fromEntries([6,7,8,9,10,11,12].map((g,i)=>[g,{x:[-54,-54,-18,-18,18,18,54][i],zSide:g%2===0?1:-1}]));
  const exhibition=mountMathematicianFrames(THREE,exRoom,{centerX:54,backZ:-48,width:34,depth:40,building,rooms});
  assert.equal(exhibition.targets.length,34);
  assert.equal(exhibition.wallCount,14);
  assert.equal(exhibition.pedestalCount,2);
  assert.equal(exhibition.targets.filter(o=>o.userData?.mathHistoryId).length,18);
  assert.equal(exhibition.targets.filter(o=>o.userData?.mathExhibitionAction?.type==='wall').length,14);
  assert.deepEqual(exhibition.targets.filter(o=>o.userData?.mathExhibitionAction?.type?.startsWith('ggb-')).map(o=>o.userData.mathExhibitionAction.type),['ggb-2d','ggb-3d']);
  exhibition.syncProximity(54,-22);
  exhibition.destroy();
  assert.equal(listeners.size,0);
});
