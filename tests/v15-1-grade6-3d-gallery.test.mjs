import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../vendor/three.module.js';
import {GRADE6_ACTIVE_IDS,GRADE6_CURATED_TOTAL,auditGrade6Selection} from '../src/portal-labs/grade6-curation-v15-1.js';
import {grade6Labs,grade6ArchivedLabs,grade6Featured} from '../src/portal-labs/grade6-v15.js';
import {ALL_MATH6_LABS,TOAN6_LAB_MODELS} from '../src/math6-lab/catalog.js';
import {makeMath6GalleryPreview,hasReal3DGalleryModel} from '../src/museum/math6-preview-v15.js';
import {mathStats} from '../src/math6-lab/math.mjs';
import {renderModel} from '../src/math6-lab/canvas.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8')).items;
const makeMock=()=>new Proxy({}, {get(_target,key){
  if(key==='canvas')return {width:920,height:560};
  if(key==='measureText')return text=>({width:String(text).length*13});
  return ()=>{};
}});
test('V15.1 preserves all 60 original experiments and 3 supplemental files while curating 35',()=>{
  const audit=auditGrade6Selection(ALL_MATH6_LABS);
  assert.equal(TOAN6_LAB_MODELS.length,60);
  assert.equal(ALL_MATH6_LABS.length,63);
  assert.equal(GRADE6_CURATED_TOTAL,35);
  assert.equal(GRADE6_ACTIVE_IDS.length,35);
  assert.equal(audit.active.length,35);
  assert.equal(audit.archived.length,28);
  assert.equal(grade6ArchivedLabs().length,28);
  const ids=new Set([...audit.active,...audit.archived].map(m=>m.id));assert.equal(ids.size,63);
});
test('V15.1 each of four portals holds at most 9 curated models and no duplicate',()=>{
  const seen=new Set();
  for(const [zone,n] of [['plane',9],['symmetry',9],['number',9],['data',8]]){
    const labs=grade6Labs(zone),exhibits=grade6Featured(data,zone);
    assert.equal(labs.length,n);assert.equal(exhibits.length,n);
    for(const item of exhibits){assert(!seen.has(item.labId));seen.add(item.labId);assert.equal(item.portalZone,zone);
      assert.equal(item.labSource?.book, 'T1'===item.labSource?.book?'T1':item.labSource?.book);}
  }
  assert.equal(seen.size,35);
});
test('V15.1 real 3D builds for ALL 35 curated gallery displays, never an image plane',()=>{
  const models=[...['plane','symmetry','number','data'].flatMap(grade6Labs)];
  for(const lab of models){
    const item={title:lab.title,labId:lab.id,labEngine:lab.engine,labVariant:lab.variant,labDefaults:lab.defaults};
    assert(hasReal3DGalleryModel(item),lab.id);
    const group=makeMath6GalleryPreview(THREE,item);
    assert(group.userData.gallery3D,lab.id);
    const meshes=[];group.traverse(object=>{if(object.isMesh||object.isInstancedMesh)meshes.push(object);
      assert.notEqual(object.geometry?.type,'PlaneGeometry',`flat billboard ${lab.id}`);
    });
    assert(meshes.length>=1,`no 3D meshes ${lab.id}`);
    assert(meshes.some(m=>m.geometry?.type!=='PlaneGeometry'),`no 3D volume ${lab.id}`);
    const bbox=new THREE.Box3().setFromObject(group);const size=bbox.getSize(new THREE.Vector3());
    assert(!bbox.isEmpty()&&size.x>.3&&size.z>.035,`invisible or edge-on 3D artifact: ${lab.id}`);
    assert(size.x<3.1&&size.y<2.8&&size.z<2.7,`oversized on plinth ${lab.id}: ${size.toArray()}`);
    assert(bbox.min.y>-.1,`below pedestal: ${lab.id}`);
    group.traverse(o=>{o.geometry?.dispose?.();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose?.());}});
  }
});
test('V15.1 cut and geometric features match required shape properties',()=>{
  const source=fs.readFileSync(new URL('../src/museum/math6-preview-v15.js',import.meta.url),'utf8');
  assert.match(source,/new THREE.ExtrudeGeometry/);
  assert.match(source,/new THREE.InstancedMesh/);
  assert.match(source,/Math\.PI\s*\/\s*2/);
  assert.match(source,/\[-x,-y\]/, 'central symmetry must be a 180-degree rotation');
  assert(!source.includes('new THREE.PlaneGeometry('),'no billboard allowed');
});
test('V15.1 all 35 retained Math 6 Lab engines render their mathematical content and stats',()=>{
 const mock=makeMock();
 for(const lab of ['plane','symmetry','number','data'].flatMap(grade6Labs)){
   const state={params:structuredClone(lab.defaults),counts:[],tileFlips:new Set(),time:0};
   assert.doesNotThrow(()=>renderModel(mock,lab,state),lab.id);
   assert.doesNotThrow(()=>mathStats(lab,state),lab.id);
 }
});
test('V15.1 grade six no longer creates hover giant billboards and panels are not the exhibits',()=>{
 const source=fs.readFileSync(new URL('../src/museum.js',import.meta.url),'utf8');
 assert.match(source,/hologram=isGrade6Artifact\?null/);
 assert.match(source,/makeMath6GalleryPreview\(THREE,item\)/);
 assert.match(source,/m\.model\.userData\.gallery3D/);
 assert.match(source,/activeNearExhibit=m\.item/);
 const css=fs.readFileSync(new URL('../src/portal-labs/v15-grade6.css',import.meta.url),'utf8');
 assert.match(css,/body\.mv15-grade6-lab #sidebar\{display:none!important/);
});
test('V15.1 pictogram shows as many 3D symbols as the default tally, not columns',()=>{
 const lab=ALL_MATH6_LABS.find(l=>l.id==='toan6-bieu-do-tranh');
 const root=makeMath6GalleryPreview(THREE,{title:lab.title,labId:lab.id,labEngine:lab.engine,labVariant:lab.variant,labDefaults:lab.defaults});
 let count=0;root.traverse(o=>{if(o.geometry?.type==='IcosahedronGeometry')count++;});
 assert.equal(count,lab.defaults.values.reduce((a,b)=>a+b,0));
});
test('V15.1 bar chart showcases preserve exact relative default data heights',()=>{
 for(const [name,variant] of [['toan6-cot-don','bar'],['toan6-cot-kep','double']]){
  const lab=ALL_MATH6_LABS.find(l=>l.id===name);
  const root=makeMath6GalleryPreview(THREE,{title:lab.title,labId:lab.id,labEngine:lab.engine,labVariant:lab.variant,labDefaults:lab.defaults});
  const height=[];root.traverse(o=>{if(o.geometry?.type==='BoxGeometry'&&o.geometry.parameters.depth===.32)height.push(o.geometry.parameters.height);});
  const source=lab.defaults.values;
  assert.equal(height.length,variant==='double'?8:4);
  const actual=variant==='double'?height.filter((_,i)=>i%2===0):height;
  const ratios=actual.map(v=>v/actual[0]),expected=source.map(v=>v/source[0]);
  ratios.forEach((v,i)=>assert(Math.abs(v-expected[i])<1e-8,`${name} bar index ${i}: ${v} vs ${expected[i]}`));
 }
});
test('V15.1 ferris wheel cabin stays vertical while moving wheel',()=>{
 const lab=ALL_MATH6_LABS.find(l=>l.id==='toan6-vong-quay-choi');
 const root=makeMath6GalleryPreview(THREE,{title:lab.title,labId:lab.id,labEngine:lab.engine,labVariant:lab.variant,labDefaults:lab.defaults});
 let rotor=null, cabins=[];
 root.traverse(o=>{if(o.name==='ferris-rotor')rotor=o;if(o.name==='ferris-cabin')cabins.push(o);});
 assert(rotor);assert.equal(cabins.length,8);
 root.userData.animate(5);assert(Math.abs(rotor.rotation.z)>.2);
 for(const cabin of cabins)assert(Math.abs(cabin.rotation.z+rotor.rotation.z)<1e-8);
});
