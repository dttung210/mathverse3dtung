import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {MODE_BY_ID} from '../src/museum/r6-room-layout.js';
import {createModeExhibit} from '../src/museum/r67-mode-exhibits.mjs';
import {educationalFrame,createEducationalMotion,SEVEN_GRADE_PHASES} from '../src/museum/learning-motion.mjs';
import {lessonMotionProgress} from '../src/curriculum/educational-motion.mjs';
import {disposeObject} from '../src/geometry.js';

const close=(a,b,tol=1e-4)=>assert.ok(Math.abs(a-b)<=tol,`${a} ≠ ${b}`);
const get=id=>{const mode=MODE_BY_ID.get(id);assert.ok(mode,'Missing '+id);return createModeExhibit(Number(mode.grade),{...mode,sourceLabId:mode.sourceLabId||mode.labId});};
const carrier=ex=>ex.children.find(o=>o.isGroup);
const animate=(ex,s)=>ex.userData.animate(s);

test('R77 stage 1: seven grade groups, non-looping 0% to 100%, no sine regression',()=>{
 assert.deepEqual(SEVEN_GRADE_PHASES.map(z=>z.grade),[6,7,8,9,10,11,12]);
 for(const t of [0,3,7,10,20,1000]){
  const frame=educationalFrame(t);assert.ok(frame.progress>=0&&frame.progress<=1);
 }
 close(educationalFrame(10).progress,1);
 close(educationalFrame(25).progress,1); // holds finished result
 close(lessonMotionProgress(100),1); // does not wrap
});

test('R77 stage 2: grade 6 3D physical construction is not decorative carrier rotation',()=>{
 const ids=[...MODE_BY_ID.keys()].filter(x=>x.startsWith('toan6-'));
 assert.ok(ids.length>40);
 const id=ids.find(x=>x.includes('xuc-xac'))||ids[0];
 const ex=get(id);
 animate(ex,0);close(ex.rotation.y,0);
 animate(ex,10);close(ex.rotation.y,0);
 assert.ok(ex.userData.motionMeaning,'explanation');
 disposeObject(ex);
});

test('R77 stage 3: grade 7 congruent triangles overlap by rigid translation, not separate rocking',()=>{
 const ex=get('7-04-C01'),c=carrier(ex);
 assert.match(c.userData.motionMeaning,/tịnh tiến/);
 const [L,R]=c.children;
 animate(ex,0);close(R.position.x,0);
 const before=new THREE.Box3().setFromObject(R).getCenter(new THREE.Vector3());
 animate(ex,10);close(R.position.x,-1.12);
 const after=new THREE.Box3().setFromObject(R).getCenter(new THREE.Vector3());
 const left=new THREE.Box3().setFromObject(L).getCenter(new THREE.Vector3());
 close(after.x,left.x,1e-3);close(before.x-after.x,1.12,1e-3);
 disposeObject(ex);
});

test('R77 stage 4: grade 8 similar triangles grow by homothety at fixed vertex',()=>{
 const ex=get('8-06-C02'),c=carrier(ex);
 assert.match(c.userData.motionMeaning,/vị tự/);
 const right=c.children.find(o=>o.isGroup);
 assert.ok(right);
 animate(ex,0);close(right.scale.x,.48);
 animate(ex,10);close(right.scale.x,1);
 close(right.position.x,.02);close(right.position.y,-.52);
 disposeObject(ex);
});

test('R77 stage 5: grade 9 sphere-plane section has exact moving radius sqrt(R^2-d^2)',()=>{
 const ex=get('9-11-C03'),c=carrier(ex);
 assert.match(c.userData.motionMeaning,/giao tuyến/);
 const section=c.children.find(o=>o.geometry?.type==='TorusGeometry'&&o.geometry.parameters.radius===1);
 assert.ok(section);
 animate(ex,0);assert.equal(section.visible,false);
 animate(ex,10);close(section.position.y,.34);
 close(section.scale.x,Math.sqrt(.72**2-.34**2));
 disposeObject(ex);
});

test('R77 stage 5: grade 9 circle-line intersection moves to correct secant positions',()=>{
 const ex=get('9-06-C01'),c=carrier(ex);
 const hits=c.children.filter(o=>o.userData?.mathPoint&&o.position.z>.039&&o.position.z<.041);
 animate(ex,0);assert.ok(hits.every(p=>!p.visible));
 animate(ex,10);
 const intersections=hits.filter(p=>p.visible);
 assert.equal(intersections.length,2);
 intersections.sort((a,b)=>a.position.x-b.position.x);
 close(intersections[0].position.x,-Math.sqrt(.62*.62-.28*.28));
 close(intersections[1].position.x, Math.sqrt(.62*.62-.28*.28));
 disposeObject(ex);
});

test('R77 stage 6: grade 10 vector translated by u, resultant stays geometrically valid',()=>{
 const ex=get('10-04-C01'),c=carrier(ex);
 assert.match(c.userData.motionMeaning,/vectơ/);
 const moved=c.children.find(o=>o.isGroup&&o.children[0]?.userData?.mathLine&&o.children[0].material?.color.getHex()===0x8b5cf6);
 assert.ok(moved);
 animate(ex,0);close(moved.position.x,0);
 animate(ex,10);close(moved.position.x,.90);
 disposeObject(ex);
});

test('R77 stage 7a: grade 11 unit circle angle sweeps and preserves radius',()=>{
 const ex=get('11-01-C01'),c=carrier(ex);
 assert.match(c.userData.motionMeaning,/lượng giác/);
 const torus=c.children.find(o=>o.geometry?.type==='TorusGeometry'&&o.geometry.parameters.radius===.68);
 const mark=c.children[c.children.indexOf(torus)+2];
 animate(ex,0);close(Math.hypot(mark.position.x,mark.position.y),.68);
 animate(ex,10);close(Math.hypot(mark.position.x,mark.position.y),.68);
 close(mark.position.y,.68*Math.sin(.78));
 disposeObject(ex);
});

test('R77 stage 7b: grade 12 surface really sweeps 0–360 degrees and freezes',()=>{
 const ex=get('12-07-C01'),c=carrier(ex);
 const lathe=c.children.find(o=>o.geometry?.type==='LatheGeometry');assert.ok(lathe);
 const full=lathe.geometry.index.count;
 animate(ex,0);assert.equal(lathe.geometry.drawRange.count,0);
 animate(ex,4.5);assert.ok(lathe.geometry.drawRange.count>0&&lathe.geometry.drawRange.count<full);
 animate(ex,10);assert.equal(lathe.geometry.drawRange.count,full);close(c.userData.sweepDegrees,360);
 animate(ex,20);assert.equal(lathe.geometry.drawRange.count,full);
 disposeObject(ex);
});

test('R77 310 catalogue instances remain finite and independent after scrub 0/50/100%',()=>{
 assert.equal(MODE_BY_ID.size,310);
 let count=0;
 for(const [id,mode] of MODE_BY_ID){
  const ex=createModeExhibit(Number(mode.grade),{...mode,sourceLabId:mode.sourceLabId||mode.labId});
  assert.ok(ex?.isGroup,id);
  for(const t of [0,4.4,10]){
   animate(ex,t);
   ex.traverse(o=>{
    if(o.isMesh){assert.ok(o.position.toArray().every(Number.isFinite),`${id} position ${t}`);
      assert.ok(o.scale.toArray().every(Number.isFinite),`${id} scale ${t}`);}
   });
  }
  count++;disposeObject(ex);
 }
 assert.equal(count,310);
});
