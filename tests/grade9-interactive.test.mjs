import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {GRADE9_IDS,grade9Defaults,grade9Schema,grade9Valid,grade9Math,grade9Solid,grade9SolidModel,grade9Experiment,grade9TriangleCenters} from '../src/curriculum/grade9-engine.mjs';
import {grade9SceneSVG,grade9NetSVG} from '../src/curriculum/grade9-svg.mjs';
import {caseRuntimeStatus} from '../src/curriculum/CurriculumExplorer.js';
import {isGraphCase,graphDefaults,graphExperiment} from '../src/curriculum/graph-models.mjs';
import {CIRCLE_POSITION_IDS,lineCircleGeometry,twoCircleGeometry,circleDefaults} from '../src/curriculum/circle-positions.mjs';
import * as THREE from '../vendor/three.module.js';import {createMathModel,disposeObject} from '../src/geometry.js';
if(!globalThis.document)globalThis.document={createElement:()=>({width:128,height:128,getContext:()=>new Proxy({measureText:t=>({width:String(t).length*8})},{get:(o,k)=>k in o?o[k]:()=>{}})})};
const root=new URL('../',import.meta.url);const file=p=>fs.readFileSync(new URL(p,root));const near=(a,b)=>Math.abs(a-b)<1e-6*Math.max(1,Math.abs(a),Math.abs(b));
const database=JSON.parse(file('data/mathverse-7-12-curated.json'));const grade9=database.source_registry.filter(f=>f.grade===9).flatMap(f=>f.modes);
test('46 Grade9 cases; 13 rooms, 23 custom SVG, 9 real solid meshes, 8 graphs, 6 circle positions',()=>{
 assert.equal(grade9.length,46);assert.equal(new Set(grade9.map(m=>m.id)).size,46);assert.equal(GRADE9_IDS.length,32);assert.equal(GRADE9_IDS.filter(grade9Solid).length,9);
 assert.equal(grade9.filter(x=>isGraphCase(x.id)).length,8);assert.equal(CIRCLE_POSITION_IDS.length,6);
 for(const m of grade9)assert.equal(caseRuntimeStatus(m.id),'interactive',m.id);
 assert.equal(database.families,67);assert.equal(database.modes_total,247);assert.equal(database.by_grade['9'],46);
});
test('All 23 Grade9 two-dimensional cases draw distinct geometry at different times; no nonfinite coordinates',()=>{
 let checks=0;
 for(const id of GRADE9_IDS.filter(id=>!grade9Solid(id))){const p=grade9Defaults(id);assert.equal(grade9Valid(id,p),true,id);
  const s1=grade9SceneSVG(id,p,0,{tries:0}),s2=grade9SceneSVG(id,p,2.7,{tries:0});
  assert.ok(s1.startsWith('<svg')&&s1.endsWith('</svg>'),id);assert.notEqual(s1,s2,`${id}: no motion`);assert.doesNotMatch(s1+s2,/NaN|Infinity|undefined|<script/i,id);
  assert.match(s1,/(<polygon |<path |<circle |<rect |<line )/,id);assert.ok(grade9Math(id,p).values.length>=1);checks++;
 }assert.equal(checks,23);
});
test('Nine solids have independently valid 3D dimensions, nonempty THREE geometry, and genuine 2D nets',()=>{
 for(const id of GRADE9_IDS.filter(grade9Solid)){
  const p=grade9Defaults(id),model=grade9SolidModel(id,p),net=grade9NetSVG(id,p,2);
  assert.ok(['sphere','sphereSection','cylinder','cone'].includes(model.type));assert.match(net,/^<svg/);assert.ok(!/NaN|Infinity|undefined/.test(net));
  const mesh=createMathModel(model,{faces:true,edges:true,labels:false});try{let count=0;mesh.traverse(x=>{if(x.isMesh)count++});assert.ok(count>=1,id);const bbox=new THREE.Box3().setFromObject(mesh);assert.equal(bbox.isEmpty(),false,id);}finally{disposeObject(mesh);}
 }
});
test('All Grade9 cases withstand varied controls without silent NaN or broken SVG drawing',()=>{
 for(const id of GRADE9_IDS){const base=grade9Defaults(id),fields=grade9Schema(id);
  for(let i=0;i<35;i++){const p={...base};for(const s of fields){const step=Math.round((s.max-s.min)/s.step);p[s.key]=Math.min(s.max,Number((s.min+((i*7+s.key.length*11)%Math.max(1,step+1))*s.step).toFixed(6)));}
   if(id.startsWith('9-13'))p.wanted=Math.min(p.wanted,p.sides);
   if(id==='9-11-C03')p.d=Math.min(p.d,Math.max(0,p.r-.1));
   if(id.startsWith('9-12')&&p.n1+p.n2+p.n3+p.n4===0)p.n1=1;
   if(!grade9Valid(id,p))continue;
   const m=grade9Math(id,p);assert.ok(m.values.every(x=>!x.includes('NaN')&&!x.includes('Infinity')),id);
   const svg=grade9Solid(id)?grade9NetSVG(id,p,4):grade9SceneSVG(id,p,4,{tries:10});assert.doesNotMatch(svg,/NaN|Infinity|undefined/,id);
  }
 }
});
test('Right triangle ratios: 3-4-5, complementarity and nonzero legs',()=>{
 const m=grade9Math('9-03-C01',{a:4,b:3}).result;assert.ok(near(m.c,5));assert.ok(near(m.sin,.6));assert.ok(near(m.cos,.8));assert.ok(near(m.tan,.75));assert.ok(near(m.sin*m.sin+m.cos*m.cos,1));
});
test('Circle arc/chord/sector and cone net obey exact Euclidean formulas',()=>{
 const p={r:2,theta:180},m=grade9Math('9-05-C03',p).result;assert.ok(near(m.arc,2*Math.PI));assert.ok(near(m.sector,2*Math.PI));assert.ok(near(m.chord,4));
 const cone=grade9Math('9-10-C02',{r:3,h:4}).result;assert.ok(near(cone.l,5));assert.ok(near(cone.area,15*Math.PI));assert.ok(near(360*3/cone.l,216));
});
test('Giao hai bất phương trình không được tự đổi cận sai, đường kính là dây lớn nhất',()=>{
 const empty=grade9Math('9-02-C02',{a:4,b:1});assert.equal(empty.result.empty,true);assert.match(empty.latex,/varnothing/);
 assert.match(grade9SceneSVG('9-02-C02',{a:4,b:1},1),/tập nghiệm rỗng/);
 const full=grade9Math('9-02-C02',{a:1,b:4});assert.equal(full.result.empty,false);
 assert.ok(grade9Schema('9-05-C01').some(x=>x.key==='theta'&&x.max===180));
 assert.ok(near(grade9Math('9-05-C01',{r:2,theta:180}).result.chord,4));
});
test('Vành khuyên vẽ toàn bộ hình và diện tích đúng khi thay bán kính trong',()=>{
 const p={r:3,theta:120,inner:.55},res=grade9Math('9-05-C04',p);assert.ok(near(res.result.annulus,Math.PI*9*(1-.55*.55)));
 assert.match(grade9SceneSVG('9-05-C04',p,2),/S vành khuyên/);
 assert.match(grade9SceneSVG('9-05-C04',p,2),/S quạt/);
 assert.ok(near(res.result.sector,3*Math.PI));
 assert.ok(grade9Math('9-05-C04',{...p,theta:240}).result.sector>res.result.sector);
 assert.ok(grade9Math('9-05-C04',{r:3,theta:120,inner:.7}).result.annulus<res.result.annulus);
});
test('Cylinder, cone and sphere volumes follow exact formulas',()=>{
 assert.ok(near(grade9Math('9-09-C03',{r:2,h:3}).result.volume,12*Math.PI));
 assert.ok(near(grade9Math('9-10-C03',{r:2,h:3}).result.vol,4*Math.PI));
 assert.ok(near(grade9Math('9-11-C02',{r:3,d:1}).result.volume,36*Math.PI));
 assert.ok(near(grade9Math('9-11-C03',{r:5,d:3}).result.crossR,4));
});
test('Frequency sums = total, percentage sums = 100 and probabilities are normalized',()=>{
 const f=grade9Math('9-12-C02',{n1:4,n2:3,n3:1,n4:2}).result;assert.equal(f.total,10);assert.ok(near(f.proportions.reduce((a,b)=>a+b,0),1));
 const p={sides:6,wanted:2},stats=grade9Experiment('9-13-C01',p,1000,42);assert.equal(stats.tries,1000);assert.ok(0<=stats.relative&&stats.relative<=1);assert.ok(Math.abs(stats.relative-1/3)<.06);assert.deepEqual(stats,grade9Experiment('9-13-C01',p,1000,42));
});
test('Hai phép chọn độc lập có n² cặp; tần số theo phép thử và đồ thị hội tụ động',()=>{
 const p={sides:3,wanted:1},m=grade9Math('9-13-C02',p);assert.ok(near(m.result.probability,1/9));
 const x=grade9Experiment('9-13-C02',p,1000,4);assert.equal(x.tries,1000);assert.ok(Math.abs(x.relative-1/9)<.05);
 assert.match(grade9SceneSVG('9-13-C02',p,3,{tries:200}),/cặp thuận lợi/);
 assert.match(grade9SceneSVG('9-13-C03',p,3,{tries:200}),/Tần số tương đối thực nghiệm/);
});
test('Quadratic delta, double root, no root, Viete and valid LaTeX',()=>{
 for(const [p,n] of [[{a:1,b:-3,c:2},2],[{a:1,b:2,c:1},1],[{a:1,b:0,c:1},0]]){
  const m=graphExperiment('9-08-C04',p);assert.equal(m.markers.length,n);assert.ok(m.latex.includes('\\Delta'));
  if(n===2){const roots=m.markers.map(x=>x.x);assert.ok(near(roots[0]+roots[1],-p.b/p.a));assert.ok(near(roots[0]*roots[1],p.c/p.a));}
 }
 assert.match(graphExperiment('9-08-C05',graphDefaults('9-08-C05')).summary,/Viète/);
});
test('Curated grade9 source exhibits and earlier Math6 records were not mutated',()=>{
 const catalog=JSON.parse(file('data/catalog.json'));assert.equal(catalog.items.filter(x=>x.grade===9).length,9);assert.equal(catalog.items.length,63);
 const hashes={'data/catalog.json':'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15','data/models.toan6.json':'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9'};
 for(const [path,hash] of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(file(path)).digest('hex'),hash);
});

test('Tam giác nội/ngoại tiếp: O cách đều đỉnh; I cách đều cả ba cạnh khi thay tham số',()=>{
 for(const radius of [1,1.8,3,4.2,5]){const z=grade9TriangleCenters({r:radius}),[A,B,C]=[z.A,z.B,z.C];
  for(const P of [A,B,C])assert.ok(near(Math.hypot(P[0]-z.O[0],P[1]-z.O[1]),z.R));
  const lineDist=(P,Q,K)=>Math.abs((Q[0]-P[0])*(K[1]-P[1])-(Q[1]-P[1])*(K[0]-P[0]))/Math.hypot(Q[0]-P[0],Q[1]-P[1]);
  for(const [P,Q] of [[A,B],[B,C],[C,A]])assert.ok(near(lineDist(P,Q,z.I),z.r));
 }
});


test('Grade9 statistics column heights equal their printed counts even at t=0',()=>{
 const p={n1:6,n2:9,n3:5,n4:10};for(const t of [0,.2,2.7,5]){
  const svg=grade9SceneSVG('9-12-C01',p,t);const matches=[...svg.matchAll(/<rect data-bar="(\d)"[^>]*height="([\d.]+)"/g)];
  assert.equal(matches.length,4);for(const [_,index,height] of matches)assert.ok(near(Number(height),[6,9,5,10][Number(index)]*11.4));
 }
});
test('Probability wheel final pointer follows the sampled outcome; pair grid uses final ordered pair',()=>{
 const p={sides:6,wanted:2},trials=10,ex=grade9Experiment('9-13-C01',p,trials),last=Number(ex.outcomes.at(-1));
 const svg=grade9SceneSVG('9-13-C01',p,4,{tries:trials});
 const a=-Math.PI/2+2*Math.PI*(last-.5)/p.sides;
 assert.match(svg,new RegExp('x2="'+Number((455+155*Math.cos(a)).toFixed(2))+'"'));
 const q={sides:4,wanted:2},ex2=grade9Experiment('9-13-C02',q,trials),last2=ex2.outcomes.at(-1).split('-').map(Number);
 const s2=grade9SceneSVG('9-13-C02',q,2,{tries:trials}),sz=37,left=470-4*sz/2,top=175;
 assert.match(s2,new RegExp('cx="'+Number((left+(last2[0]-.5)*sz).toFixed(2))+'" cy="'+Number((top+(last2[1]-.5)*sz).toFixed(2))+'"'));
});


test('Every original Grade9 exhibit creates nonempty Three.js geometry, with honest solid versus planar labels',()=>{
 const originals=JSON.parse(file('data/catalog.json')).items.filter(x=>x.grade===9);
 assert.equal(originals.length,9);for(const obj of originals){
  const mesh=createMathModel(obj,{faces:true,edges:true,labels:false});
  try{let count=0;mesh.traverse(o=>{if(o.isMesh)count++});assert.ok(count>0,obj.id);assert.equal(new THREE.Box3().setFromObject(mesh).isEmpty(),false,obj.id);}finally{disposeObject(mesh);}
 }
});

test('Grade 9 R82: all 23 SVG labs, 9 3D nets, 8 graphs, and 6 circle positions support 0%/50%/100% progression, hold at 100%, and apply semantic palette',()=>{
 for(const id of GRADE9_IDS.filter(id=>!grade9Solid(id))){
  const p=grade9Defaults(id);
  const s0=grade9SceneSVG(id,p,0,{tries:10}),s50=grade9SceneSVG(id,p,3,{tries:10}),s100=grade9SceneSVG(id,p,6,{tries:10}),sAfter=grade9SceneSVG(id,p,6.8,{tries:10});
  assert.doesNotMatch(s0+s50+s100,/NaN|Infinity|undefined/);
  assert.match(s100,/#1D4ED8|#B45309|#6D28D9|#15803D|#475569/,id);
  if(!id.startsWith('9-13'))assert.equal(s100,sAfter,`${id}: must hold steady at 100%`);
 }
 for(const id of GRADE9_IDS.filter(grade9Solid)){
  const p=grade9Defaults(id);
  const n50=grade9NetSVG(id,p,0.5),n100=grade9NetSVG(id,p,1.0),nAfter=grade9NetSVG(id,p,1.2);
  assert.doesNotMatch(n50+n100,/NaN|Infinity|undefined/);
  assert.equal(n100,nAfter,`${id}: net must hold steady at 100%`);
  assert.match(n100,/#1D4ED8|#B45309|#6D28D9|#15803D/,id);
 }
 // 9-11-C03 boundary states: d < R (secant), d = R (tangent), d > R (disjoint)
 assert.equal(grade9Valid('9-11-C03',{r:3,d:3}),true);
 assert.equal(grade9Valid('9-11-C03',{r:3,d:4}),true);
 assert.equal(grade9Math('9-11-C03',{r:3,d:3}).result.cutState,'tangent');
 assert.equal(grade9Math('9-11-C03',{r:3,d:4}).result.cutState,'disjoint');
 assert.match(grade9NetSVG('9-11-C03',{r:3,d:3},1),/Tiếp điểm/);
 assert.match(grade9NetSVG('9-11-C03',{r:3,d:4},1),/Không giao/);
});
