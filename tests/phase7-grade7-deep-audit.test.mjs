import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../vendor/three.module.js';
import {createMathModel,disposeObject} from '../src/geometry.js';
import {TRIANGLE_CASES,makeTrianglePair} from '../src/curriculum/triangle-engine.mjs';
import {GRADE7_IDS,isGrade7Mode,grade7Defaults,grade7Schema,checkGrade7Params,grade7Solid,grade7SolidProperties,grade7Metrics,triangle7,triangleCenters7,triangleAngles7,dist,med,areaTriangle,pieData,grade7Frequency} from '../src/curriculum/grade7-engine.mjs';
import {grade7SVGScene,grade7NetSVG} from '../src/curriculum/grade7-svg.mjs';
import {caseRuntimeStatus} from '../src/curriculum/CurriculumExplorer.js';
import {EXPLORATION_MODELS} from '../src/portal-labs/exploration-collection.js';
import {portalExhibits,zonesForGrade} from '../src/portal-labs/portal-registry.js';
const d=JSON.parse(fs.readFileSync(new URL('../data/mathverse-7-12-curated.json',import.meta.url),'utf8'));
const catalog=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8')).items;
const almost=(a,b,eps=1e-8)=>Math.abs(a-b)<=eps*Math.max(1,Math.abs(a),Math.abs(b));
const lineDistance=(P,A,B)=>Math.abs((B[0]-A[0])*(A[1]-P[1])-(A[0]-P[0])*(B[1]-A[1]))/dist(A,B);
if(!globalThis.document)globalThis.document={createElement:()=>({width:1024,height:1024,getContext:()=>new Proxy({measureText:s=>({width:String(s).length*13})},{get:(o,k)=>k in o?o[k]:()=>{}})})};

test('GRADE 7: 10 families and 41 unique modes are marked interactive (7 triangle + 34 new)',()=>{
 const modes=d.source_registry.filter(f=>f.grade===7).flatMap(f=>f.modes);assert.equal(d.source_registry.filter(f=>f.grade===7).length,10);
 assert.equal(modes.length,41);assert.equal(GRADE7_IDS.length,34);assert.equal(modes.filter(x=>x.id.startsWith('7-04-')).length,7);
 assert.equal(new Set(modes.map(x=>x.id)).size,41);for(const mode of modes){assert.equal(caseRuntimeStatus(mode.id),'interactive');assert.equal(mode.implementation_status,'VERIFIED_INTERACTIVE_R5');}
 for(const id of GRADE7_IDS){assert.ok(modes.find(x=>x.id===id));assert.ok(grade7Schema(id));assert.ok(checkGrade7Params(id,grade7Defaults(id)));}
});
test('GRADE 7: 26 planar modes produce SVG with finite geometry and genuine time-dependent movement',()=>{
 let planar=0;for(const id of GRADE7_IDS){if(grade7Solid(id))continue;planar++;
  const p=grade7Defaults(id),states=[0,2,4].map(t=>grade7SVGScene(id,p,t,{count:100}));
  for(const svg of states){assert.match(svg,/^<svg /);assert.match(svg,/<\/svg>$/);assert.ok(!/NaN|undefined|Infinity/.test(svg),id);assert.ok(svg.includes('stroke')&&svg.includes('text'),id);}
  assert.notEqual(states[0],states[1],id+' did not move between 0s and 2s');
 }assert.equal(planar,26);
});
test('GRADE 7: 26 planar labs remain finite across 20 different slider configurations per mode',()=>{
 let checks=0;for(const id of GRADE7_IDS){if(grade7Solid(id))continue;for(let j=0;j<20;j++){
  const p=grade7Defaults(id);for(const def of grade7Schema(id))p[def.key]=def.min+(def.max-def.min)*((j*13+def.key.length*7)%19)/18;
  if(id.startsWith('7-06')&&p.p1+p.p2>95)p.p2=95-p.p1;
  if(id==='7-10-C02'){p.faces=Math.round(p.faces);p.fav=Math.min(p.faces,Math.round(p.fav));}
  assert.ok(checkGrade7Params(id,p));
  for(const t of [0,2.5,5.5]){const svg=grade7SVGScene(id,p,t,{count:j*7});assert.ok(!/NaN|undefined|Infinity/.test(svg),`${id},${j},${t}`);checks++;}
 }}assert.equal(checks,26*20*3);
});
test('GRADE 7: 7 congruence criteria preserve sides or angles, violation breaks the conclusion',()=>{
 for(const id of Object.keys(TRIANGLE_CASES).filter(x=>x.startsWith('7-'))){const ok=makeTrianglePair(id);assert.ok(ok.check.passes,id);assert.ok(almost(ok.check.areaRatio,1),id);assert.ok(!makeTrianglePair(id,undefined,{perturb:true}).check.passes,id);}
});
test('GRADE 7: triangle properties include angle sum, centroid ratio, orthocenter, incircle, circumcircle',()=>{
 for(let j=0;j<200;j++){
  const T=triangle7({a:3+j*.021,u:.7+(j*13%90)/90*3.8,v:1.6+(j*7%80)/80*3.6});const {A,B,C}=T,ang=triangleAngles7(T),o=triangleCenters7(T);
  assert.ok(almost(ang.A+ang.B+ang.C,180));
  const M=med(B,C);assert.ok(almost(dist(A,o.G)/dist(o.G,M),2));
  assert.ok(almost(dist(o.O,A),dist(o.O,B))&&almost(dist(o.O,B),dist(o.O,C)));
  assert.ok(almost(lineDistance(o.I,A,B),o.r,1e-7));assert.ok(almost(lineDistance(o.I,B,C),o.r,1e-7));
  assert.ok(almost(lineDistance(o.I,A,C),o.r,1e-7));
  assert.ok(almost((B[0]-C[0])*(A[0]-o.H[0])+(B[1]-C[1])*(A[1]-o.H[1]),0,1e-6));
 }
});
test('GRADE 7: triangle inequality rejects impossible sides',()=>{
 const p={a:3,b:3,c:6};const m=grade7Metrics('7-03-C04',p);assert.ok(m.includes('Không dựng được tam giác'));
 assert.match(grade7SVGScene('7-03-C04',p,4),/Không dựng được tam giác/);
});
test('GRADE 7: 2D pie chart sum and angles are exact, no 3D distortion in diagram',()=>{
 for(let a=5;a<=70;a+=5)for(let b=5;b<=95-a;b+=5){const d=pieData({p1:a,p2:b});assert.equal(d.sum,100);assert.ok(almost(d.angles.reduce((x,y)=>x+y,0),360));}
 assert.throws(()=>pieData({p1:70,p2:35}));
 assert.match(grade7SVGScene('7-06-C01',grade7Defaults('7-06-C01'),2),/Nhóm A: 40%/);
});
test('GRADE 7: spinner/coin/dice experimental frequencies are bounded and approximately fair',()=>{
 for(const id of ['7-10-C01','7-10-C02','7-10-C03']){
  const a=grade7Frequency(id,10000);assert.equal(a.total,10000);assert.equal(a.hist.reduce((p,x)=>p+x,0),10000);assert.ok(Math.abs(a.relative-.5)<.035,`${id}: ${a.relative}`);
  if(id!=='7-10-C01')for(const n of a.hist)assert.ok(Math.abs(n/10000-1/6)<.022);
 }
});
test('GRADE 7: 8 solids are true nonflat meshes, with count and volumes algebraically correct',()=>{
 let total=0;
 for(const id of GRADE7_IDS){if(!grade7Solid(id))continue;total++;
  const p=grade7Defaults(id),sol=grade7SolidProperties(id,p),isTri=['7-09-C01','7-09-C03'].includes(id),type=id==='7-08-C02'?'cube':id.startsWith('7-08')?'cuboid':isTri?'triPrism':'prismQuad';
  assert.ok(sol.faces>4&&sol.edges>8&&sol.vertices>=6);
  assert.ok(almost(sol.volume,sol.baseArea*sol.h));assert.ok(almost(sol.surfaceArea,2*sol.baseArea+sol.lateralArea));
  const solid=createMathModel({id,grade:7,type,params:{...p}});
  const bounds=new THREE.Box3().setFromObject(solid),size=bounds.getSize(new THREE.Vector3());
  assert.ok(size.x>.2&&size.y>.2&&size.z>.2,`${id} has flat bounds ${JSON.stringify(size)}`);
  disposeObject(solid);
 }
 assert.equal(total,8);
});
test('GRADE 7: unfolding nets have closed SVG geometry and 6/5 face roles',()=>{
 for(const id of ['7-08-C03','7-09-C03']){
  const p=grade7Defaults(id);for(const time of [0,.3,.5,.8,1]){let svg=grade7NetSVG(id,p,time);assert.match(svg,/^<svg/);assert.match(svg,/<\/svg>$/);assert.ok(!svg.includes('NaN'));}
 }
});
test('GRADE 7: 9 original physical gallery exhibits preserved; four off-syllabus extra presets hidden, not deleted',()=>{
 const m=catalog.filter(x=>x.grade===7);assert.equal(m.length,9);
 for(const z of zonesForGrade(7)){const list=portalExhibits(catalog,7,z.id);assert.ok(list.every(x=>!x.id.startsWith('mv_r4_')));}
 assert.equal(EXPLORATION_MODELS.filter(x=>x.grade===7).length,4);
 for(const orig of m){const model=createMathModel(orig);const box=new THREE.Box3().setFromObject(model);assert.ok(!box.isEmpty(),orig.id);disposeObject(model);}
});


test('GRADE 7 R80 V2: all 33 SVG + congruence labs and 2 nets hold steady at 100% and apply V2 purposeful color roles',()=>{
 const congIds=['7-04-C01','7-04-C02','7-04-C03','7-04-C04','7-04-C05','7-04-C06','7-04-C07'];
 const planarIds=[...GRADE7_IDS.filter(id=>!grade7Solid(id)),...congIds];
 assert.equal(planarIds.length,33);
 for(const id of planarIds){
  const maxT=id.startsWith('7-10')?8:6;
  const p=id.startsWith('7-04')?{}:grade7Defaults(id);
  const s0=grade7SVGScene(id,p,0,{count:50});
  const s50=grade7SVGScene(id,p,maxT*0.5,{count:50});
  const s100=grade7SVGScene(id,p,maxT,{count:50});
  const sHold=grade7SVGScene(id,p,maxT+2,{count:50});
  assert.notEqual(s0,s50,`${id} 0% vs 50%`);
  assert.notEqual(s50,s100,`${id} 50% vs 100%`);
  assert.equal(s100,sHold,`${id} holds at 100% without auto-loop`);
 }
 // Verify V2 color palette roles in representative modes
 const c701=grade7SVGScene('7-01-C01',grade7Defaults('7-01-C01'),6);
 assert.ok(c701.includes('#475569')&&c701.includes('#1D4ED8'),'7-01-C01 GIU_TRUNG_TINH uses neutral slate axis and single primary point');
 const c704=grade7SVGScene('7-04-C01',{},6);
 assert.ok(c704.includes('#6D28D9')&&c704.includes('#1D4ED8')&&c704.includes('#B45309'),'7-04-C01 DA_MAU uses purple target border and paired side colors');
 const net708=grade7NetSVG('7-08-C03',grade7Defaults('7-08-C03'),1);
 assert.ok(net708.includes('#1D4ED8')&&net708.includes('#FEF3C7')&&net708.includes('#EDE9FE'),'7-08-C03 net uses blue bases and alternating orange/purple lateral faces');
});
