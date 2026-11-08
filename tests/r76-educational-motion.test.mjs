import test from 'node:test';
import assert from 'node:assert/strict';
import {EXHIBIT_CYCLE_SECONDS,educationalFrame,modelMotionPlan,createEducationalMotion} from '../src/museum/learning-motion.mjs';
import {lessonMotionProgress} from '../src/curriculum/educational-motion.mjs';
import {createModeExhibit} from '../src/museum/r67-mode-exhibits.mjs';
import {MODE_BY_ID} from '../src/museum/r6-room-layout.js';
import {grade11AnimatedParams,grade11Defaults,grade11Is3D,grade11Valid,GRADE11_CUSTOM_IDS} from '../src/curriculum/grade11-engine.mjs';
import {grade12AnimatedParams,grade12Defaults,grade12Is3D,grade12Valid,GRADE12_CUSTOM_IDS} from '../src/curriculum/grade12-engine.mjs';
import {createMathModel,disposeObject} from '../src/geometry.js';
import * as THREE from '../vendor/three.module.js';

// Structural tests do not replace visual acceptance on a graphics-capable browser.
test('R76: Teaching stages progress in one direction then hold, not a sine oscillation',()=>{
 const sample=[0,.5,1,2,3,4,5,6,7,8,9,EXHIBIT_CYCLE_SECONDS].map(t=>educationalFrame(t));
 for(let i=1;i<sample.length;i++)assert.ok(sample[i].progress>=sample[i-1].progress-1e-10);
 assert.equal(sample.at(-1).stage,2);
 assert.equal(sample.at(-1).progress,1);
 assert.equal(educationalFrame(0).stage,0);
 assert.equal(educationalFrame(6.5).stage,2);
 assert.equal(modelMotionPlan({sourceLabId:'12-07'}).kind,'solid');
 const progress=[0,.3,1,2,3,4,5,6].map(t=>lessonMotionProgress(t));
 for(let i=1;i<progress.length;i++)assert.ok(progress[i]>=progress[i-1]);
 assert.equal(progress.at(-1),1);
});

test('R76: 310 catalogue IDs are unchanged and motion descriptions are present',()=>{
 assert.equal(MODE_BY_ID.size,310);
 for(const [id,mode] of MODE_BY_ID){
   const plan=modelMotionPlan({...mode,id});
   assert.equal(plan.steps.length,3,id);
   assert.ok(plan.steps.every(x=>x.length>5),id);
 }
});

test('R76: Pedestal motion constructs a coherent figure instead of rocking carrier',()=>{
 const root=new THREE.Group();
 for(let i=0;i<10;i++)root.add(new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.3),new THREE.MeshBasicMaterial()));
 const d=createEducationalMotion(root,{id:'11-09-C01',sourceLabId:'11-09'});
 d.apply(0);
 const first=root.children.filter(x=>x.visible).length;
 d.apply(3.5);
 const middle=root.children.filter(x=>x.visible).length;
 d.apply(8.5);
 const last=root.children.filter(x=>x.visible).length;
 assert.ok(first<middle&&middle<last,`${first}/${middle}/${last}`);
 assert.equal(root.rotation.y,0);
 assert.equal(d.apply(8.5).description,d.plan.steps[2]);
 disposeObject(root);
});

test('R76: Representative Grade 6 through Grade 12 pedestal figures survive animation',()=>{
 const picked=new Set();
 for(const [id,mode] of MODE_BY_ID){
  const grade=Number(mode.grade);if(picked.has(grade))continue;
  picked.add(grade);
  const preview=createModeExhibit(grade,mode);
  assert.ok(preview?.isGroup,id);
  preview.userData.animate?.(0);
  preview.userData.animate?.(3.5);
  preview.userData.animate?.(8.6);
  const meshCount=(()=>{let count=0;preview.traverse(o=>{if(o.isMesh)count++;});return count;})();
  assert.ok(meshCount>0,id);
  disposeObject(preview);
 }
 assert.equal(picked.size,7);
});

test('R76: Grade 11 and 12 all 3D cases remain valid and do not rock back and forth',()=>{
 for(const id of GRADE11_CUSTOM_IDS.filter(grade11Is3D)){
   const p=grade11Defaults(id);
   const sample=[0,1.2,2.2,3.5,5.4,6].map(t=>grade11AnimatedParams(id,p,t));
   for(const obj of sample)assert.ok(grade11Valid(id,obj),id);
   assert.deepEqual(sample[0],p);
   // For every numeric parameter, motion is one-way or held.
   for(const key of Object.keys(p)){
     const seq=sample.map(x=>x[key]);
     const dir=Math.sign(seq.at(-1)-seq[0]);
     if(!dir)continue;
     for(let i=1;i<seq.length;i++)assert.ok(dir*(seq[i]-seq[i-1])>=-1e-7,id+':'+key);
   }
 }
 for(const id of GRADE12_CUSTOM_IDS.filter(grade12Is3D)){
   const p=grade12Defaults(id);
   const sample=[0,1.2,2.2,3.5,5.4,6].map(t=>grade12AnimatedParams(id,p,t));
   for(const obj of sample)assert.ok(grade12Valid(id,obj),id);
   assert.deepEqual(sample[0],p);
   for(const key of Object.keys(p)){
     const seq=sample.map(x=>x[key]);const dir=Math.sign(seq.at(-1)-seq[0]);
     if(!dir)continue;
     for(let i=1;i<seq.length;i++)assert.ok(dir*(seq[i]-seq[i-1])>=-1e-7,id+':'+key);
   }
 }
});

test('R76: The Ox rotation surface sweeps genuine LatheGeometry indices 0-360 degrees',()=>{
 const holder=createMathModel({type:'profileRevolve',grade:12,title:'Rotation sweep',params:{r1:1.8,r2:1.2,h:4,hole:0,slice:.5}},{labels:false});
 assert.equal(holder.supportsRevolution,true);
 const outer=holder.children[0].userData.revolutionOuter;
 const full=outer.geometry.index.count;
 assert.ok(full>1000);
 assert.ok(holder.setRevolutionProgress(0));assert.equal(outer.geometry.drawRange.count,0);
 holder.setRevolutionProgress(.5);assert.ok(outer.geometry.drawRange.count>0&&outer.geometry.drawRange.count<full);
 holder.setRevolutionProgress(1);assert.equal(outer.geometry.drawRange.count,full);
 disposeObject(holder);
});
