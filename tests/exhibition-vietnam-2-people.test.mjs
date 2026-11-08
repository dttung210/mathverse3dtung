import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as THREE from '../vendor/three.module.js';
import {PEOPLE} from '../src/exhibition/people.mjs';
import {PROFILES} from '../src/exhibition/profiles.mjs';
import {diagramFor} from '../src/exhibition/diagrams.mjs';
import {mountMathematicianFrames} from '../src/exhibition/frames3d.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const byId=new Map(PEOPLE.map(p=>[p.id,p]));
const ids=['luong-the-vinh','ngo-bao-chau'];

test('preserves Vietnamese profiles and guarantees their presence in 18-person collection',()=>{
  assert.equal(PEOPLE.length,18);
  for(const id of ids){
    assert.ok(PEOPLE.some(p=>p.id===id),`Profile ${id} phải tồn tại`);
    assert.ok(PROFILES[id]?.bio?.length>130);
    assert.equal(PROFILES[id].works.length,2);
  }
  assert.equal(new Set(PEOPLE.map(p=>p.id)).size,18);
});

test('real offline portrait assets are valid JPEG, available and explicitly tagged as AI illustrations',()=>{
  const available=JSON.parse(fs.readFileSync(path.join(root,'src/exhibition/assets/available.json'),'utf8'));
  for(const id of ids){
    const p=byId.get(id);
    assert.ok(p.imageIsGenerated);assert.ok(p.portraitNote.toLowerCase().includes('ai'));
    assert.ok(available[id]);
    const b=fs.readFileSync(path.join(root,'src/exhibition/assets',p.asset));
    assert.ok(b.length>50000,p.asset);
    assert.equal(b[0],0xff);assert.equal(b[1],0xd8);
  }
});

test('verified curriculum modes and informative, non-misleading math diagrams',()=>{
  assert.equal(byId.get('luong-the-vinh').modeId,'8-06-C03');
  assert.equal(byId.get('ngo-bao-chau').modeId,'10-05-C01');
  for(const id of ids){assert.ok(byId.get(id).formula);assert.match(diagramFor(byId.get(id)),/<svg/);}
  assert.match(byId.get('ngo-bao-chau').demo,/KHÔNG/);
});

test('3D slots contain 18 frames including both Vietnamese mathematicians without overlap',()=>{
  const calls=[];const ctx=new Proxy({}, {get(_obj,key){
    if(key==='createLinearGradient')return()=>({addColorStop(){}});
    if(key==='measureText')return t=>({width:String(t).length*8});
    return()=>{calls.push(key);};
  }});
  globalThis.document={createElement(tag){assert.equal(tag,'canvas');return {width:600,height:500,getContext:()=>ctx};}};
  globalThis.window={addEventListener(){},removeEventListener(){},dispatchEvent(){}};
  globalThis.fetch=async()=>({ok:false});
  const ex=new THREE.Group();const view=mountMathematicianFrames(THREE,ex,{centerX:54,backZ:-48,width:34,depth:40});
  const frames=view.targets.filter(o=>o.userData.mathHistoryId);
  assert.equal(frames.length,18);
  assert.equal(view.pedestalCount,2);
  const ltvFrame=frames.find(f=>f.userData.mathHistoryId==='luong-the-vinh');
  const nbcFrame=frames.find(f=>f.userData.mathHistoryId==='ngo-bao-chau');
  assert.ok(ltvFrame,'Lương Thế Vinh frame phải tồn tại');
  assert.ok(nbcFrame,'Ngô Bảo Châu frame phải tồn tại');
  assert.notEqual(ltvFrame.position.x,nbcFrame.position.x);
  view.destroy();
});
