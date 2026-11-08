import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from '../vendor/three.module.js';
import {createMathModel,disposeObject} from '../src/geometry.js';
import {
 GRADE11_CUSTOM_IDS,isGrade11Mode,grade11Is3D,grade11Defaults,grade11Valid,grade11Schema,
 grade11Math,grade11SolidModel,grade11AnimatedParams,grade11TrigSolutions,
 grade11Grouped,grade11Sequence,grade11Prob,grade11Trials,
 planeFrom3Points,signedDistancePointPlane,footPointPlane,angleLinePlane,
 parallelProjection,planeIntersection,skewCommonPerpendicular,dihedralRayAngle,
 frustumVolume,pyramidVolume,prismVolume,groupedMean,groupedQuantile,
 probabilityUnion,pointOnCircle,reflectAcrossYeqX,secantSlope,monotoneProgress
} from '../src/curriculum/grade11-engine.mjs';
import {grade11SceneSVG,grade11SpatialSVG} from '../src/curriculum/grade11-svg.mjs';
import {isGraphCase,graphDefaults,graphExperiment} from '../src/curriculum/graph-models.mjs';
import {createModeExhibit} from '../src/museum/r67-mode-exhibits.mjs';

if(!globalThis.document){
 globalThis.document={createElement:()=>({width:128,height:128,getContext:()=>new Proxy({measureText:t=>({width:String(t).length*8})},{get:(o,k)=>k in o?o[k]:()=>{}})})};
}

const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root));
const near=(a,b,tol=1e-7)=>Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b));

const catalog=JSON.parse(read('data/catalog.json')).items;
const curriculum=JSON.parse(read('data/mathverse-7-12-curated.json'));
const g11Modes=curriculum.source_registry.filter(f=>f.grade===11).flatMap(f=>f.modes);
const g11Exhibits=catalog.filter(m=>m.grade===11);
const svgIds=GRADE11_CUSTOM_IDS.filter(id=>!grade11Is3D(id));
const solidIds=GRADE11_CUSTOM_IDS.filter(grade11Is3D);
const graphIds=g11Modes.map(m=>m.id).filter(isGraphCase);

test('R84 Scope & Immutability: 46 Labs + 9 Exhibits = 55 items; catalog.json & models.toan6.json untouched',()=>{
 assert.equal(g11Modes.length,46);
 assert.equal(svgIds.length,18);
 assert.equal(solidIds.length,17);
 assert.equal(graphIds.length,11);
 assert.equal(g11Exhibits.length,9);
 const hashes={
  'data/catalog.json':'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15',
  'data/models.toan6.json':'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9'
 };
 for(const [p,expected] of Object.entries(hashes)){
  const actual=crypto.createHash('sha256').update(read(p)).digest('hex');
  assert.equal(actual,expected,`Immutable file changed: ${p}`);
 }
});

test('R84 18 SVG 2D Labs: distinct states at 0%, 50%, 100%, holds at end, R84 semantic colors & handles intact',()=>{
 for(const id of svgIds){
  const p=grade11Defaults(id);
  const dur=id.startsWith('11-13')?8:6;
  const s0=grade11SceneSVG(id,p,0,{trials:100});
  const s50=grade11SceneSVG(id,p,dur*0.5,{trials:100});
  const s100=grade11SceneSVG(id,p,dur,{trials:100});
  const sHold=grade11SceneSVG(id,p,dur+2,{trials:100});
  assert.notEqual(s0,s50,`${id}: 0% and 50% SVG should differ`);
  assert.notEqual(s50,s100,`${id}: 50% and 100% SVG should differ`);
  assert.notEqual(s0,s100,`${id}: 0% and 100% SVG should differ`);
  assert.equal(s100,sHold,`${id}: 100% should hold steady at end`);
  assert.match(s50,/#1D4ED8/i,`${id}: missing R84 base blue #1D4ED8`);
  assert.match(s50,/#6D28D9/i,`${id}: missing R84 result purple #6D28D9`);
  assert.match(s50,/Cảnh [1-4]\/4/,`${id}: missing R84 4-stage storyboard indicator`);
  assert.match(s50,/data-handle=/,`${id}: missing interactive data-handle`);
 }
});

test('R84 17 Spatial 3D Labs + 2D Schematics: distinct 0%, 50%, 100%, special skewLines cases (parallel & perp) & R84 palette',()=>{
 for(const id of solidIds){
  const p=grade11Defaults(id);
  const m0=grade11SolidModel(id,p,0);
  const m50=grade11SolidModel(id,p,1.5);
  const m100=grade11SolidModel(id,p,2.3);
  assert.notDeepEqual(m0.params,m50.params,`${id}: 3D params should change from 0 to 1.5s`);
  const g=createMathModel(m50,{labels:false,faces:true,edges:true});
  try{
   const colors=new Set();
   g.traverse(o=>{
    if(o.isMesh&&o.material?.color)colors.add(o.material.color.getHex());
   });
   assert.ok(colors.has(0x1d4ed8)||colors.has(0x6d28d9),`${id}: 3D model should use R84 semantic colors`);
  }finally{
   disposeObject(g);
  }
  const sch0=grade11SpatialSVG(id,p,0);
  const sch50=grade11SpatialSVG(id,p,3);
  const sch100=grade11SpatialSVG(id,p,6);
  assert.notEqual(sch0,sch50,`${id}: spatial schematic 0% vs 50%`);
  assert.notEqual(sch50,sch100,`${id}: spatial schematic 50% vs 100%`);
  assert.match(sch50,/data-handle=/,`${id}: spatial schematic missing data-handle`);
 }
});

test('R84 11 Graph Labs: R84 semantic colors, asymptotes & anchor markers',()=>{
 for(const id of graphIds){
  const p=graphDefaults(id);
  const exp=graphExperiment(id,p);
  assert.ok(exp.series.length>=1,id);
  assert.ok(['#1D4ED8','#047857'].includes(exp.series[0].color),`${id}: primary series must be R84 #1D4ED8 or #047857`);
  if(id==='11-02-C03'||id==='11-02-C04'||id==='11-11-C02'){
   assert.ok(exp.asymptotes.some(a=>a.type==='vertical'),`${id}: must have vertical asymptote`);
  }
  if(id==='11-11-C03'){
   assert.equal(exp.series.length,3,'11-11-C03 must have y=a^x, y=log_a(x), and y=x');
   assert.equal(exp.series[1].color,'#047857');
   assert.equal(exp.series[2].color,'#64748B');
  }
  if(id==='11-12-C04'){
   assert.equal(exp.series[0].color,'#1D4ED8');
   assert.equal(exp.series[1].color,'#047857');
   assert.equal(exp.series[2].color,'#6D28D9');
  }
 }
});

test('R84 9 Grade 11 Exhibits & Museum Pedestals: valid meshes and R84 semantic colors',()=>{
 for(const ex of g11Exhibits){
  const m=createMathModel(ex,{labels:false,faces:true,edges:true});
  try{
   let meshCount=0;
   const colors=new Set();
   m.traverse(o=>{if(o.isMesh){meshCount++;if(o.material?.color)colors.add(o.material.color.getHex());}});
   assert.ok(meshCount>=3,`${ex.id}: must have at least 3 meshes`);
   assert.ok(colors.has(0x1d4ed8)&&colors.has(0x6d28d9),`${ex.id}: must use R84 #1D4ED8 and #6D28D9`);
  }finally{
   disposeObject(m);
  }
 }
 for(const mode of g11Modes){
  const ped=createModeExhibit(11,mode);
  let meshCount=0;
  ped.traverse(o=>{if(o.isMesh)meshCount++;});
  assert.ok(meshCount>=1,`Pedestal exhibit ${mode.id} must have meshes`);
 }
});

test('R84 Exact 3D Vector & Analytic Geometry Reference Suite (from 03_TOAN_HOC)',()=>{
 const pl=planeFrom3Points([0,0,0],[2,0,0],[0,3,0]);
 assert.ok(near(Math.abs(pl.normal[2]),1));
 assert.ok(near(Math.abs(signedDistancePointPlane([1,2,5],pl)),5));
 const H=footPointPlane([1,2,5],pl);
 assert.ok(near(H[0],1)&&near(H[1],2)&&near(H[2],0));
 assert.ok(near(angleLinePlane([1,0,1],[0,0,1]),Math.PI/4));
 const proj=parallelProjection([0,0,2],pl,[1,0,-1]);
 assert.equal(proj.length,3);
 const inter=planeIntersection({point:[0,0,0],normal:[0,0,1]},{point:[0,0,0],normal:[0,1,-1]});
 assert.equal(inter.status,'intersect');
 assert.equal(inter.direction.length,3);
 const sk=skewCommonPerpendicular([0,-1,0],[1,0,0],[0,1,0],[0,0,1]);
 assert.ok(near(sk.distance,2));
 assert.ok(near(dihedralRayAngle([0,1,0],[0,1,1]),Math.PI/4));
 assert.ok(near(frustumVolume(4,2,3),28));
 assert.ok(near(pyramidVolume(16,3),16));
 assert.ok(near(prismVolume(4*Math.sqrt(3),3),12*Math.sqrt(3)));
 assert.ok(near(groupedMean([2,6],[5,15]),12.5));
 assert.ok(near(groupedQuantile([2,6,6,2],[0,10,20,30,40],0.5),20));
 assert.ok(near(probabilityUnion(0.4,0.3,0.12),0.58));
 const pt=pointOnCircle(Math.PI/3);
 assert.ok(near(pt[0],0.5)&&near(pt[1],Math.sqrt(3)/2));
 const ref=reflectAcrossYeqX([2,8]);
 assert.equal(ref[0],8);assert.equal(ref[1],2);
 assert.ok(near(secantSlope(x=>x*x,1,0.5),2.5));
 assert.equal(monotoneProgress(8,6),1);
});
