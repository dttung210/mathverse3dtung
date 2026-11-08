import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import crypto from 'node:crypto';
import * as THREE from '../vendor/three.module.js';
import {createMathModel,disposeObject} from '../src/geometry.js';
import {caseRuntimeStatus} from '../src/curriculum/CurriculumExplorer.js';
import {GRADE12_CUSTOM_IDS,grade12Schema,grade12Defaults,grade12Valid,grade12Math,grade12Is3D,grade12SolidModel,grade12AnimatedParams,grade12Volume,grade12Grouped,grade12Bayes,grade12Optimization} from '../src/curriculum/grade12-engine.mjs';
import {grade12SceneSVG} from '../src/curriculum/grade12-svg.mjs';
import {isGraphCase,graphDefaults,graphParamSchema,graphExperiment} from '../src/curriculum/graph-models.mjs';
import {portalExhibits,zonesForGrade} from '../src/portal-labs/portal-registry.js';
if(!globalThis.document)globalThis.document={createElement:()=>({width:128,height:128,getContext:()=>new Proxy({measureText:s=>({width:String(s).length*8})},{get:(o,k)=>k in o?o[k]:()=>{}})})};
const root=new URL('../',import.meta.url),raw=p=>fs.readFileSync(new URL(p,root)),catalog=JSON.parse(raw('data/catalog.json')).items,curriculum=JSON.parse(raw('data/mathverse-7-12-curated.json'));
const modes=curriculum.source_registry.filter(x=>x.grade===12).flatMap(x=>x.modes);
const solids=modes.map(x=>x.id).filter(grade12Is3D),graphs=modes.map(x=>x.id).filter(isGraphCase),svgs=modes.map(x=>x.id).filter(x=>GRADE12_CUSTOM_IDS.includes(x)&&!grade12Is3D(x));
const near=(x,y,tol=1e-7)=>assert.ok(Math.abs(x-y)<tol*Math.max(1,Math.abs(x),Math.abs(y)),`${x} != ${y}`);
test('SGK Toán12: 11 rooms, 39 distinct modes; added real angle, vector and total-probability cases',()=>{
 assert.equal(curriculum.families,67);assert.equal(curriculum.modes_total,247);assert.equal(curriculum.by_grade['12'],39);assert.equal(modes.length,39);assert.equal(new Set(modes.map(x=>x.id)).size,39);
 assert.equal(solids.length,19);assert.equal(svgs.length,10);assert.equal(graphs.length,10);
 for(const m of modes)assert.equal(caseRuntimeStatus(m.id),'interactive',m.id);
 for(const id of ['12-04-C04','12-08-C04','12-09-C04','12-11-C04'])assert.ok(modes.some(x=>x.id===id&&x.display_status==='CORE'));
 for(const id of ['12-07-C02','12-10-C03'])assert.equal(modes.find(x=>x.id===id).display_status,'EXTENSION');
});
test('All 10 SVG labs: visible geometry, correct formulas, genuine movement and no invalid numbers',()=>{
 for(const id of svgs){const p=grade12Defaults(id);assert.ok(grade12Valid(id,p),id);const a=grade12SceneSVG(id,p,0),b=grade12SceneSVG(id,p,2.1);assert.match(a,/^<svg/);assert.notEqual(a,b,id);assert.match(a,/<(?:rect|path|line|circle)/);assert.doesNotMatch(a+b,/NaN|Infinity|undefined|<script/i);assert.ok(grade12Math(id,p).values.length,id);}
});
test('All 19 world spatial labs have real Three.js meshes and moving geometric parameters',()=>{
 for(const id of solids){const p=grade12Defaults(id),a=grade12SolidModel(id,p);assert.ok(grade12Valid(id,p));const g=createMathModel(a,{labels:false,faces:true,edges:true});try{let meshes=0;g.traverse(x=>{if(x.isMesh)meshes++});assert.ok(meshes>=1,`${id} has no mesh`);const box=new THREE.Box3().setFromObject(g);assert.ok(!box.isEmpty(),`${id} empty bounding`);const sz=box.getSize(new THREE.Vector3());assert.ok(sz.length()>1,`${id} too small`);}finally{disposeObject(g)}
  const moved=grade12AnimatedParams(id,p,2.1);assert.ok(grade12Valid(id,moved),id+' valid animation');assert.notDeepEqual(grade12SolidModel(id,p,0).params,grade12SolidModel(id,p,2.1).params,id+' no 3D geometric motion');}
});
test('10 graph modes keep actual functions, markers or asymptotes',()=>{
 for(const id of graphs){const g=graphExperiment(id,graphDefaults(id));assert.ok(g.series.length,id);assert.ok(g.latex,id);assert.ok(g.summary,id);for(const s of g.series){const y=s.evaluate(id==='12-06-C03'?.5:1.5);assert.ok(Number.isFinite(y),id);}}
});
test('Closed mathematical optimization and real open-box construction',()=>{
 near(grade12Optimization('12-03-C01',{P:24,x:4}).value,32);
 near(grade12Optimization('12-03-C01',{P:24,x:4}).best,36);
 const box=grade12Optimization('12-03-C02',{L:12,x:2});near(box.value,128);near(box.optimum,2);near(box.best,128);
 const rev=grade12Optimization('12-03-C03',{demand:40,slope:2,price:10});near(rev.value,200);near(rev.optimum,10);
 assert.equal(grade12Valid('12-03-C02',{L:10,x:5}),false);
});
test('Weighted grouped statistics variance, quartiles, widths and normalizing frequency',()=>{
 const g=grade12Grouped({lo:0,w:10,n1:2,n2:6,n3:6,n4:2});assert.equal(g.N,16);near(g.mean,20);near(g.Q1,10+2/6*10);near(g.Me,20);near(g.Q3,20+4/6*10);near(g.variance,75);near(g.sd,Math.sqrt(75));near(g.iqr,40/3);near(g.range,40);
});
test('Conditional probabilities, multiplication rule, total probability and Bayes are normalized',()=>{
 const p={prior:.4,pa:.75,pb:.2},b=grade12Bayes(p);near(b.both,.3);near(b.pB,.42);near(b.posterior,5/7);near(b.sum,1);
 for(const id of ['12-11-C01','12-11-C02','12-11-C03','12-11-C04']){const v=grade12Math(id,p);assert.ok(v.latex&&v.result);}
});
test('Volume by true solid of revolution and washer: section and volume match mathematical integral',()=>{
 const p={r1:2,r2:2,h:3,slice:.5,hole:0},s=grade12Volume(p);near(s.outer,12*Math.PI);near(s.section,4*Math.PI);
 const h=grade12Volume({...p,hole:.5});near(h.volume,11.25*Math.PI);near(h.section,3.75*Math.PI);
 const z=grade12Volume({r1:1,r2:3,h:6,hole:0,slice:.75});near(z.volume,26*Math.PI);near(z.radius,2.5);
 assert.equal(grade12Valid('12-07-C02',{r1:1,r2:1,h:3,hole:1}),false);
});
test('Oxyz vectors, normals and distances obey dot product and orthogonal projection',()=>{
 const v=grade12Math('12-04-C04',{vx:1,vy:2,vz:3,ux:3,uy:-2,uz:0}).result;
 assert.deepEqual(v.sum,[4,0,3]);assert.equal(v.dot,-1);
 const q=grade12Math('12-08-C03',{A:0,B:0,C:1,D:-2,vx:2,vy:1,vz:4}).result;near(q.dist,2);assert.deepEqual(q.foot,[2,1,2]);
 for(const a of [0,30,55,80]){const x=grade12Math('12-09-C04',{deg:a});near(x.result.angle,a);}
});
test('Spatial line and sphere positions differentiate two, one, zero intersections and skew/parallel lines',()=>{
 const testSphere=(dist,expected)=>assert.equal(grade12Math('12-10-C03',{r:2,dist}).result.state,expected);
 testSphere(1,'cắt tại hai điểm');testSphere(2,'tiếp xúc');testSphere(3,'không giao');
 for(const [deg,dist,state] of [[0,0,'trùng nhau'],[0,2,'song song'],[60,0,'cắt nhau'],[60,2,'chéo nhau']]){
  assert.equal(grade12Math('12-09-C03',{deg,dist}).result.state,state);}
});
test('Preserves original 63 exhibit records, 35 Grade6 selected exhibits and 9 Grade12 exhibits',()=>{
 for(const [f,hash] of Object.entries({'data/catalog.json':'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15','data/models.toan6.json':'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9'}))assert.equal(crypto.createHash('sha256').update(raw(f)).digest('hex'),hash,f);
 assert.equal(catalog.length,63);const base12=catalog.filter(x=>x.grade===12);assert.equal(base12.length,9);assert.equal(base12.filter(x=>['revolvedSolid','oxyzSphere'].includes(x.type)).length,2);
 for(const zone of zonesForGrade(12))assert.equal(portalExhibits(catalog,12,zone.id).filter(x=>x.id.startsWith('mv_r4_')).length,0);
});

test('Mặt phẳng qua điểm, trường hợp trùng và giao tuyến mặt phẳng–mặt cầu đúng bản chất',()=>{
 const p=grade12Defaults('12-08-C01'),n=[p.A,p.B,p.C],m=[p.vx,p.vy,p.vz],model=grade12SolidModel('12-08-C01',p);near(n.reduce((a,x,i)=>a+x*m[i],model.params.D),0);near(grade12Math('12-08-C01',p).result.dist,0);
 const id='12-08-C02';assert.equal(grade12SolidModel(id,{deg:0,dist:0}).type,'oxyzPlane');assert.equal(grade12SolidModel(id,{deg:0,dist:1}).type,'parallelPlanes');assert.equal(grade12SolidModel(id,{deg:50,dist:0}).type,'twoPlanes');
 assert.equal(grade12Math('12-10-C02',{r:2,dist:1}).result.state,'đường tròn');assert.equal(grade12Math('12-10-C02',{r:2,dist:2}).result.state,'tiếp điểm');assert.equal(grade12Math('12-10-C02',{r:2,dist:3}).result.state,'không giao');
});
test('Không có thanh hệ số đồ thị Toán12 vô tác dụng',()=>{
 for(const id of graphs){const p=graphDefaults(id),g=graphExperiment(id,p);for(const field of graphParamSchema(id)){const q={...p,[field.key]:p[field.key]+field.step},alt=graphExperiment(id,q);const data=JSON.stringify({...g,series:[]})!==JSON.stringify({...alt,series:[]});const visual=[-.5,.5,1.27].some(x=>g.series.some((f,i)=>f.evaluate(x)!==alt.series[i]?.evaluate(x)));assert.ok(data||visual,`${id}:${field.key} không ảnh hưởng đồ thị`);}}
});
test('Trang QA Toán12 đúng lớp và số trường hợp, không lọc nhầm Toán11',()=>{
 const a=raw('src/qa/toan12-audit.js').toString(),b=raw('src/qa/toan12-hienvat.js').toString();assert.match(a,/f\.grade===12/);assert.match(a,/items\.length!==39/);assert.match(b,/Number\(x\.grade\)===12/);assert.doesNotMatch(a+b,/TOAN11\.csv/);
});
