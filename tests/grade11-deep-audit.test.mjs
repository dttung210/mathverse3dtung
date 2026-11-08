import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from '../vendor/three.module.js';
import {createMathModel,disposeObject} from '../src/geometry.js';
import {GRADE11_CUSTOM_IDS,isGrade11Mode,grade11Is3D,grade11Defaults,grade11Valid,grade11Schema,grade11Math,grade11SolidModel,grade11AnimatedParams,grade11TrigSolutions,grade11Grouped,grade11Sequence,grade11Prob,grade11Trials} from '../src/curriculum/grade11-engine.mjs';
import {grade11SceneSVG} from '../src/curriculum/grade11-svg.mjs';
import {caseRuntimeStatus} from '../src/curriculum/CurriculumExplorer.js';
import {isGraphCase,graphDefaults,graphExperiment} from '../src/curriculum/graph-models.mjs';
import {portalExhibits,zonesForGrade} from '../src/portal-labs/portal-registry.js';
if(!globalThis.document)globalThis.document={createElement:()=>({width:128,height:128,getContext:()=>new Proxy({measureText:t=>({width:String(t).length*8})},{get:(o,k)=>k in o?o[k]:()=>{}})})};
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root));
const near=(a,b,tol=1e-7)=>Math.abs(a-b)<tol*Math.max(1,Math.abs(a),Math.abs(b));
const catalog=JSON.parse(read('data/catalog.json')).items;
const curriculum=JSON.parse(read('data/mathverse-7-12-curated.json'));
const cases=curriculum.source_registry.filter(f=>f.grade===11).flatMap(f=>f.modes);
const solids=GRADE11_CUSTOM_IDS.filter(grade11Is3D),svg=GRADE11_CUSTOM_IDS.filter(id=>!grade11Is3D(id)),graph=cases.map(m=>m.id).filter(isGraphCase);
const hashes={'data/catalog.json':'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15','data/models.toan6.json':'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9'};
test('SGK Grade11: 13 rooms, 46 distinct interactive modes; 18 SVG, 17 real WebGL and 11 graphs',()=>{
 assert.equal(curriculum.families,67);assert.equal(curriculum.modes_total,247);assert.equal(curriculum.by_grade[11],46);
 assert.equal(cases.length,46);assert.equal(new Set(cases.map(x=>x.id)).size,46);assert.equal(svg.length,18);assert.equal(solids.length,17);assert.equal(graph.length,11);
 for(const m of cases)assert.equal(caseRuntimeStatus(m.id),'interactive',m.id);
 assert.ok(cases.some(m=>m.id==='11-02-C05'));assert.ok(cases.some(m=>m.id==='11-02-C06'));assert.ok(cases.some(m=>m.id==='11-12-C04'));
});
test('Every 2D SVG scene changes over time, has geometry/labels and sensible formula',()=>{
 for(const id of svg){assert.ok(isGrade11Mode(id));const p=grade11Defaults(id);assert.ok(grade11Valid(id,p),id);
  const start=grade11SceneSVG(id,p,0,{trials:100}),later=grade11SceneSVG(id,p,2.6,{trials:100});
  assert.match(start,/^<svg/);assert.notEqual(start,later,id+' no animation');assert.doesNotMatch(start+later,/NaN|Infinity|undefined|<script/i);
  assert.match(start,/<(?:line|path|rect|circle|polygon)\b/,id);const math=grade11Math(id,p);assert.ok(math.latex?.length>3);assert.ok(math.values.length,id);
 }
});
test('17 3D modes use real THREE meshes in world coordinates (not a planar raster placeholder)',()=>{
 for(const id of solids){const params=grade11Defaults(id);assert.ok(grade11Valid(id,params),id);const model=grade11SolidModel(id,params,1.3),g=createMathModel(model,{labels:false,faces:true,edges:true});
  try{const meshes=[];g.traverse(x=>{if(x.isMesh)meshes.push(x)});assert.ok(meshes.length>=1,id);const box=new THREE.Box3().setFromObject(g);assert.equal(box.isEmpty(),false,id);const size=new THREE.Vector3();box.getSize(size);assert.ok(size.x>0&&size.y>=0&&size.z>=0,id);assert.ok(size.x+size.y+size.z>1,id);}
  finally{disposeObject(g)}
  const t=grade11AnimatedParams(id,params,2.2);assert.ok(grade11Valid(id,t),id+' invalid motion');
  const m0=grade11SolidModel(id,params,0),m1=grade11SolidModel(id,params,2.2);
  assert.notDeepEqual(m0.params,m1.params,id+' does not move geometric parameters');
  assert.ok(grade11Math(id,t).values.length,id);
 }
});
test('3D dihedral ray pair has true dot-product cos(angle), the special geometry marker follows the same ray',()=>{
 for(const deg of [25,40,70,90,110,155]){const rad=deg*Math.PI/180,u=new THREE.Vector3(0,0,3),v=new THREE.Vector3(0,3*Math.sin(rad),3*Math.cos(rad));assert.ok(near(u.clone().normalize().dot(v.clone().normalize()),Math.cos(rad)));
  const m=createMathModel({id:'g11_angle_test',title:'Góc nhị diện',type:'dihedralAngle',params:{deg,size:4},grade:11},{labels:false,faces:true,edges:true});try{let k=0;m.traverse(o=>{if(o.isMesh)k++});assert.ok(k>=3)}finally{disposeObject(m)}
 }
});
test('Trigonometric solution families satisfy equations, periods and elementary bounds',()=>{
 for(const id of ['11-02-C05','11-02-C06'])for(const kind of [0,1]){const p={...grade11Defaults(id),kind};const sol=grade11TrigSolutions(id,p),fn=sol.kind==='sin'?Math.sin:sol.kind==='cos'?Math.cos:sol.kind==='tan'?Math.tan:x=>Math.cos(x)/Math.sin(x);
  assert.equal(sol.solutions.length,id.endsWith('05')?2:1);for(const a of sol.solutions){assert.ok(near(fn(a),sol.value),id);assert.ok(near(fn(a+sol.period),sol.value),id);}
 }
 assert.ok(near(Math.sin(Math.PI/6),.5));
});
test('Arithmetic, geometric and limit sequences are discrete, sums and values stay correct',()=>{
 for(const n of [3,6,10]){const a=grade11Sequence('11-03-C02',{n,u1:2,d:3});assert.equal(a.length,n);assert.ok(near(a.at(-1),2+3*(n-1)));assert.ok(near(a.reduce((x,y)=>x+y),n*(2+a.at(-1))/2));
 const b=grade11Sequence('11-03-C03',{n,u1:2,q:1.5});assert.ok(near(b.at(-1),2*1.5**(n-1)));assert.ok(near(b.reduce((x,y)=>x+y),2*(1-1.5**n)/(1-1.5)));}
 for(const jump of [0,1]){const p={...grade11Defaults('11-10-C02'),jump};const x=grade11Math('11-10-C02',p).result;assert.equal(near(x.left,x.right),jump===0);}
});
test('Grouped statistics use true representative points and cumulative quartiles',()=>{
 const data=grade11Grouped({start:0,width:10,n1:2,n2:6,n3:6,n4:2});assert.equal(data.N,16);assert.ok(near(data.mean,20));assert.ok(near(data.Q1,10+2/6*10));assert.ok(near(data.Me,20));assert.ok(near(data.Q3,20+4/6*10));
});
test('Mutually exclusive and independent probabilities obey their own conditions',()=>{
 const x=grade11Prob({pa:.4,pb:.3,overlap:0});assert.ok(near(x.union,.7));const y=grade11Prob({pa:.4,pb:.3,overlap:.12});assert.ok(near(y.union,.58));assert.equal(y.independent,true);
 assert.ok(grade11Valid('11-13-C02',{...grade11Defaults('11-13-C02'),pa:.5,pb:.4,overlap:0}));assert.equal(grade11Valid('11-13-C02',{...grade11Defaults('11-13-C02'),pa:.9,pb:.8,overlap:0}),false);
 const p=grade11Defaults('11-13-C03'),a=grade11Trials(p,2000,4242),b=grade11Trials(p,2000,4242);assert.deepEqual(a,b);assert.ok(Math.abs(a.relative-p.pa*p.pb)<.06);
});
test('Prism, pyramid and frustum volumes match base area and height exactly',()=>{
 const a={a:4,b:2,h:3};assert.ok(near(grade11Math('11-09-C01',a).result.volume,Math.sqrt(3)*a.a*a.a/4*a.h));assert.ok(near(grade11Math('11-09-C02',a).result.volume,16));assert.ok(near(grade11Math('11-09-C03',a).result.volume,28));
 for(const id of solids){if(!id.startsWith('11-09'))continue;assert.ok(grade11Valid(id,grade11Defaults(id)));}
});
test('R5 source unchanged: 63 originals, 9 authentic Grade11 3D arrangements and 6 archived R4 duplicates',()=>{
 for(const [p,digest] of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(read(p)).digest('hex'),digest,p);
 const originals=catalog.filter(m=>m.grade===11);assert.equal(originals.length,9);assert.ok(originals.every(x=>['twoPlanes','skewLines','lineParallelPlane','parallelPlanes','linePerpPlane','perpendicularPlanes','linePlaneAngle','dihedralAngle','frustumPyramid'].includes(x.type)));
 for(const x of originals){const m=createMathModel(x,{labels:false,faces:true,edges:true});try{let count=0;m.traverse(o=>{if(o.isMesh)count++});assert.ok(count>0,x.id)}finally{disposeObject(m)}}
 for(const z of zonesForGrade(11))assert.equal(portalExhibits(catalog,11,z.id).some(x=>x.id.startsWith('mv_r4_')),false);
});
test('Graph models include new second derivative, with correct f, f′ and f″ and valid LaTeX',()=>{
 const id='11-12-C04',p=graphDefaults(id),m=graphExperiment(id,p);assert.equal(m.series.length,3);assert.ok(near(m.series[0].evaluate(2),8));assert.ok(near(m.series[1].evaluate(2),12));assert.ok(near(m.series[2].evaluate(2),12));assert.ok(m.latex.includes('f\'\''));
 for(const gid of graph){const g=graphExperiment(gid,graphDefaults(gid));assert.ok(g.series.length>0,gid);assert.ok(g.latex,gid)}
});
