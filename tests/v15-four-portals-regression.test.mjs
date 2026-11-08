import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../vendor/three.module.js';
import {GRADE6_PORTALS,grade6Counts,grade6Featured,grade6Labs,grade6ArchivedLabs,grade6ZoneForLab} from '../src/portal-labs/grade6-v15.js';
import {zonesForGrade,portalCounts,portalExhibits,portalIsAvailable} from '../src/portal-labs/portal-registry.js';
import {gatePosition,createGrade6Gate,createReturnGate} from '../src/museum/grade6-gates-v15.js';
import {ALL_MATH6_LABS,TOAN6_LAB_MODELS,LAB_TO_EXHIBIT,labById} from '../src/math6-lab/catalog.js';
import {V15_EXTRA_LABS} from '../src/math6-lab/supplemental-v15.js';
import {Math6ExhibitLab} from '../src/math6-lab/Math6ExhibitLab.js';
import {mathStats} from '../src/math6-lab/math.mjs';
import {renderModel} from '../src/math6-lab/canvas.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8')).items;
const source=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
const counts={plane:9,symmetry:9,number:9,data:8};
test('V15: grade6 has four unique real rooms, each has exact SGK subcatalog; grades7-12 still have five',()=>{
  assert.deepEqual(zonesForGrade(6).map(z=>z.id),['plane','symmetry','number','data']);
  assert.deepEqual(grade6Counts(),counts);
  assert.equal(zonesForGrade(6).length,4);
  for(let grade=7;grade<=12;grade++)assert.equal(zonesForGrade(grade).length,5);
  assert.equal(portalIsAvailable(6,'solid'),false);
  assert.equal(portalIsAvailable(6,'stats'),false);
  assert.equal(portalIsAvailable(6,'data'),true);
  assert.equal(portalCounts(catalog,6).length,4);
  for(const zone of GRADE6_PORTALS){
    const actual=portalExhibits(catalog,6,zone.id);
    assert.equal(actual.length,counts[zone.id]);
    assert.equal(new Set(actual.map(x=>x.id)).size,actual.length);
    assert(actual.every(x=>x.virtualLab&&x.labId&&x.sourceExhibitId&&x.portalZone===zone.id));
  }
});
test('V15: immutable 60 originals + 3 marked supplemental, each mapped to exactly one correct portal',()=>{
  assert.equal(TOAN6_LAB_MODELS.length,60);
  assert.equal(ALL_MATH6_LABS.length,63);
  assert.equal(V15_EXTRA_LABS.length,3);
  assert(V15_EXTRA_LABS.every(l=>l.supplemental&&!l.source.printed_page));
  assert.equal(new Set(ALL_MATH6_LABS.map(l=>l.id)).size,63);
  const seen=new Set();
  for(const zone of GRADE6_PORTALS)for(const lab of grade6Labs(zone.id)){
    assert.equal(grade6ZoneForLab(lab),zone.id);
    assert(!seen.has(lab.id),lab.id);seen.add(lab.id);
    assert(catalog.some(x=>x.id===LAB_TO_EXHIBIT[lab.id]&&x.grade===6));
    assert.equal(labById(lab.id),lab);
  }
  assert.equal(seen.size,35);assert.equal(grade6ArchivedLabs().length,28);
  assert.equal(new Set([...seen,...grade6ArchivedLabs().map(l=>l.id)]).size,63);
});
test('V15: physical 3D gates have stable coordinates, proper shader portal and return gate',()=>{
  const room={x:0,zSide:1};const label=()=>new THREE.Group();
  const world=[];
  for(let i=0;i<4;i++){
    const p=gatePosition(i,room.x,room.zSide);world.push(p.x);
    const gate=createGrade6Gate(THREE,GRADE6_PORTALS[i],i,room,label);
    assert.equal(gate.group.userData.portalGrade,6);
    assert.equal(gate.group.userData.portalKey,GRADE6_PORTALS[i].id);
    assert(gate.inner.material.isShaderMaterial);
    assert(gate.inner.material.uniforms.uTime);
    assert.equal(gate.z,p.z);
    assert(gate.group.children.some(c=>c.isMesh));
    gate.group.traverse(x=>{x.geometry?.dispose?.();x.material?.dispose?.();});
  }
  assert.equal(new Set(world).size,4);
  assert.deepEqual(world,[-10.7,-3.56,3.56,10.7]);
  assert.throws(()=>gatePosition(4,0,1),/Invalid grade6 gate/);
  const ret=createReturnGate(THREE,label,room);
  assert.equal(ret.group.userData.portalReturn,true);
});
test('V15: foyer renders NO original displays; transitions include walk-through, mouse, keyboard and way back',()=>{
 const script=source('src/museum.js');
 assert.match(script,/targetGrade===6&&!activePortal\?\[\]/);
 assert.match(script,/modelLayers\[6\]\.visible=false/);
 assert.match(script,/gate\.group\.visible=foyer/);
 assert.match(script,/createReturnGate/);
 assert.match(script,/portalReturn/);
 assert.match(script,/enterPortal\(activeNearPortal\.thematicRoomId\|\|activeNearPortal\.zone\)/);
 assert.match(script,/function enterPortal\(zone\)/);
 assert.match(script,/portalTargets\(\)/);
 const main=source('src/main.js');
 assert.match(main,/mv15-grade6-foyer/);
 assert.match(main,/initialMath6LabId/);
 assert.match(source('src/ui/LabShell.js'),/this\.launchMath6\(initialMath6LabId\)/);
 assert.match(source('src/portal-labs/v15-grade6.css'),/mv15-grade6-foyer/);
});
test('V15: added missing number theories have correct data, math formulas and Canvas drawing',()=>{
 const cases=[
  ['mv15-uoc-boi-bang100',{value:6},/16 bội/],
  ['mv15-nguyen-to-bang100',{value:30},/10/],
  ['mv15-cong-phan-so-cung-mau',{numerator:2,other:3,denominator:8},/2\/8 \+ 3\/8 = 5\/8/]
 ];
 const numbers=[];
 const mock=new Proxy({}, {get:(_t,k)=>{
    if(k==='fillText')return v=>numbers.push(String(v));
    if(k==='measureText')return v=>({width:String(v).length*12});
    if(k==='canvas')return {width:920,height:560};
    return ()=>{};
 }});
 for(const [id,params,re] of cases){
  const model=labById(id),state={params:{...model.defaults,...params},counts:[],tileFlips:new Set(),time:0};
  const stat=mathStats(model,state);assert.match(stat,re);
  numbers.length=0;renderModel(mock,model,state);
  assert(numbers.length>=6,`model did not draw ${id}`);
  assert(numbers.some(t=>t.includes(model.title)),`title not rendered for ${id}`);
 }
});
test('V15: supplemental slider/pointer genuinely changes construction parameters',()=>{
 const lab=Object.create(Math6ExhibitLab.prototype);
 lab._saveState=()=>{};lab._draw=()=>{};
 lab.selected=labById('mv15-uoc-boi-bang100');lab.mode='model';lab.state={params:{value:6}};
 lab._pointerCoordinates=()=>[185+9*54+10,115+0*33+14];
 lab._handlePointer({});assert.equal(lab.state.params.value,10);
 lab.selected=labById('mv15-cong-phan-so-cung-mau');lab.state={params:{numerator:2,other:3,denominator:8}};
 lab._pointerCoordinates=()=>[228+460*.75,243];lab._handlePointer({});assert.equal(lab.state.params.other,6);
 lab._pointerCoordinates=()=>[228+460*.5,166];lab._handlePointer({});assert.equal(lab.state.params.numerator,4);
 assert.equal(mathStats(lab.selected,lab.state),'4/8 + 6/8 = 10/8');
});
