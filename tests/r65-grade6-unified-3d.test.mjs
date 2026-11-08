import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../vendor/three.module.js';
import {ALL_MATH6_LABS,LAB_TO_EXHIBIT} from '../src/math6-lab/catalog.js';
import {GRADE6_3D_CAPABLE_IDS,isTrue3DCapable} from '../src/math6-lab/math6-taxonomy.mjs';
import {createGrade6Preview} from '../src/museum/r65-grade6-display.mjs';
import {hasReal3DGalleryModel} from '../src/museum/math6-preview-v15.js';
import {Grade6Lab} from '../src/curriculum/Grade6Lab.js';
import {Math6ThreeLab} from '../src/math6-lab/three-lab.mjs';
import {renderModel} from '../src/math6-lab/canvas.mjs';

const context=new Proxy({}, {get(o,k){
 if(k==='createLinearGradient'||k==='createRadialGradient')return ()=>({addColorStop(){}});
 if(k==='measureText')return t=>({width:String(t).length*11});
 if(k==='getImageData')return ()=>({data:new Uint8ClampedArray(4),width:1,height:1});
 return k in o?o[k]:(()=>{});
},set(o,k,v){o[k]=v;return true}});
const realDocument=globalThis.document;
function docMock(){globalThis.document={createElement(tag){
 if(tag!=='canvas')throw Error('Unexpected element '+tag);
 return {width:512,height:312,getContext:()=>context};
}};}

// This validates construction, not actual GPU output. A WebGL acceptance test on
// Windows still must render the scene in the target browser.
test('R6.5: all 63 Grade-6 gallery stations have real 3D scene objects and an appropriate representation',()=>{
 docMock();try{
  assert.equal(ALL_MATH6_LABS.length,63);
  const modes=new Set();let solid=0,relief=0,board=0;
  for(const model of ALL_MATH6_LABS){
   assert(!modes.has(model.id));modes.add(model.id);
   const g=createGrade6Preview(model.id);
   assert(g instanceof THREE.Group,model.id);
   let meshCount=0;g.traverse(o=>{if(o.isMesh)meshCount++});
   assert(meshCount>=1,`No visible geometry for ${model.id}`);
   const box=new THREE.Box3().setFromObject(g);
   assert(!box.isEmpty(),`Empty bounding box ${model.id}`);
   if(isTrue3DCapable(model.id)){
    assert.equal(g.userData.mathNature,'TRUE_3D');solid++;
   }else if(hasReal3DGalleryModel({labEngine:model.engine,labVariant:model.variant})){
    assert.equal(g.userData.mathNature,'SGK_2D_MATH_IN_3D_RELIEF');
    assert(g.getObjectByName('actual-3D-math-artifact'),`Missing 3D raised mathematical manipulative: ${model.id}`);
    relief++;
   }else{
    assert.equal(g.userData.mathNature,'2D_SGK_EXHIBITION_BOARD');
    assert(g.getObjectByName('AUTHENTIC_2D_SGK_ON_3D_PANEL'),`Missing actual diagram texture ${model.id}`);
    board++;
   }
  }
  assert.equal(solid,GRADE6_3D_CAPABLE_IDS.length);
  assert.equal(relief,30);
  assert.equal(board,25);
  assert.equal(solid+relief+board,63);
 }finally{globalThis.document=realDocument;}
});

test('R6.5: Grade6Lab uses same specialist shell as Grade7-12, legacy Math6 UI is not imported',()=>{
 for(const file of ['src/curriculum/CurriculumExplorer.js','src/ui/LabShell.js','src/portal-labs/SpecialtyLab.js']){
  const src=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
  assert.match(src,/Grade6Lab/);assert.doesNotMatch(src,/Math6ExhibitLab/,file);
 }
 const cls=fs.readFileSync(new URL('../src/curriculum/Grade6Lab.js',import.meta.url),'utf8');
 assert.match(cls,/mv-g7-host mv-g8-host mv-g6-unified/);
 assert.match(cls,/isTrue3DCapable\(id\)/);
 assert.match(cls,/this\.three\.enter\(this\.selected,this\.state,\{allowBoard:true\}\)/);
 assert.equal(new Grade6Lab({anchor:{grade:6,id:LAB_TO_EXHIBIT[ALL_MATH6_LABS[0].id]}}).anchor.grade,6);
 assert.throws(()=>new Grade6Lab({anchor:{grade:7,id:'g7_01'}}),/grade 6/);
});

test('R6.5: all 63 original Canvas mathematical engines can render their initial state without errors',()=>{
 for(const model of ALL_MATH6_LABS){
  assert.doesNotThrow(()=>renderModel(context,model,{params:structuredClone(model.defaults),time:0,counts:[],tileFlips:new Set(),selectedDesk:0}),model.id);
 }
});

test('R6.5: the specialist 3D renderer draws physical solids and supports SGK board mode',()=>{
 docMock();try{
  const lab=Object.create(Math6ThreeLab.prototype);
  lab.ready=true;lab.root=new THREE.Group();lab.scene=new THREE.Scene();lab._dispose=()=>{};
  const state=m=>({params:structuredClone(m.defaults),time:0,counts:[],tileFlips:new Set()});
  for(const m of ALL_MATH6_LABS.filter(m=>isTrue3DCapable(m.id))){
   lab.allowBoard=false;
   assert.doesNotThrow(()=>lab.setModel(m,state(m)),m.id);
   assert(lab.root.children.some(o=>o.isMesh||o.children.some(c=>c.isMesh)),m.id);
  }
  const flat=ALL_MATH6_LABS.find(m=>!isTrue3DCapable(m.id));
  lab.allowBoard=true;lab.setModel(flat,state(flat));
  assert(lab.root.getObjectByName?lab.boardFrame?.isMesh:lab.boardFrame,'board mesh is visible');
  assert(lab.boardTexture instanceof THREE.CanvasTexture);
 }finally{globalThis.document=realDocument;}
});
