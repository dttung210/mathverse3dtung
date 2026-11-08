import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from '../vendor/three.module.js';
import {createMathModel,disposeObject} from '../src/geometry.js';
import {caseRuntimeStatus} from '../src/curriculum/CurriculumExplorer.js';
import {isGraphCase,graphDefaults,graphExperiment} from '../src/curriculum/graph-models.mjs';
import {GRADE10_IDS,GRADE10_EXPLORE_DATA,grade10Family,grade10Defaults,grade10Schema,grade10Valid,grade10InvalidReason,grade10Math,grade10Triangle,grade10Line,grade10Circle,grade10Statistics,grade10Experiment,clipHalfplane,feasiblePolygon} from '../src/curriculum/grade10-engine.mjs';
import {grade10SceneSVG} from '../src/curriculum/grade10-svg.mjs';
import {GRADE11_CUSTOM_IDS,grade11Is3D,grade11Defaults,grade11SolidModel} from '../src/curriculum/grade11-engine.mjs';
import {grade11SpatialSVG} from '../src/curriculum/grade11-svg.mjs';
import {GRADE12_CUSTOM_IDS,grade12Is3D,grade12Defaults,grade12SolidModel} from '../src/curriculum/grade12-engine.mjs';
import {grade12SpatialSVG} from '../src/curriculum/grade12-svg.mjs';
import {getSolidHandles} from '../src/studio/solid-handles.js';
import {Grade7Lab} from '../src/curriculum/Grade7Lab.js';
import {Grade8Lab} from '../src/curriculum/Grade8Lab.js';
import {Grade9Lab} from '../src/curriculum/Grade9Lab.js';
import {Grade10Lab} from '../src/curriculum/Grade10Lab.js';
import {Grade11Lab} from '../src/curriculum/Grade11Lab.js';
import {Grade12Lab} from '../src/curriculum/Grade12Lab.js';
import {FunctionGraphLab} from '../src/curriculum/FunctionGraphLab.js';
import {CirclePositionLab} from '../src/curriculum/CirclePositionLab.js';
import {isCirclePosition} from '../src/curriculum/circle-positions.mjs';
import {isGrade7Mode} from '../src/curriculum/grade7-engine.mjs';
import {isGrade8Mode} from '../src/curriculum/grade8-engine.mjs';
import {isGrade9Mode} from '../src/curriculum/grade9-engine.mjs';
import {isGrade10Mode} from '../src/curriculum/grade10-engine.mjs';
import {isGrade11Mode} from '../src/curriculum/grade11-engine.mjs';
import {isGrade12Mode} from '../src/curriculum/grade12-engine.mjs';
import {EXPLORATION_MODELS} from '../src/portal-labs/exploration-collection.js';
import {zonesForGrade,portalExhibits} from '../src/portal-labs/portal-registry.js';
if(!globalThis.document)globalThis.document={createElement:()=>({width:128,height:128,getContext:()=>new Proxy({measureText:t=>({width:String(t).length*8})},{get:(o,k)=>k in o?o[k]:()=>{}})})};
const root=new URL('../',import.meta.url),read=s=>fs.readFileSync(new URL(s,root));const data=JSON.parse(read('data/mathverse-7-12-curated.json'));
const families=data.source_registry.filter(x=>x.grade===10),cases=families.flatMap(x=>x.modes),catalog=JSON.parse(read('data/catalog.json')).items;
const near=(a,b,tol=1e-7)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);
const finite=v=>Number.isFinite(v);
test('Grade10 precisely 11 families, 38 interactive modes, with three new SGK cases',()=>{
 assert.equal(families.length,11);assert.equal(cases.length,38);assert.equal(data.by_grade['10'],38);assert.equal(data.modes_total,247);assert.equal(new Set(cases.map(x=>x.id)).size,38);
 assert.equal(GRADE10_IDS.length,35);assert.equal(cases.filter(x=>isGraphCase(x.id)).length,3);
 for(const mode of cases)assert.equal(caseRuntimeStatus(mode.id),'interactive',mode.id);
 for(const id of ['10-01-C04','10-10-C04','10-11-C04'])assert.ok(cases.some(x=>x.id===id),id);
});
test('All 35 custom Grade10 cases render finite, changing SVG with meaningful math',()=>{
 for(const id of GRADE10_IDS){const p=grade10Defaults(id);assert.equal(grade10Valid(id,p),true,id);
  const math=grade10Math(id,p),svg0=grade10SceneSVG(id,p,0),svg1=grade10SceneSVG(id,p,2.4);
  assert.match(svg0,/^<svg /);assert.ok(svg0.endsWith('</svg>'));assert.notEqual(svg0,svg1,`${id}: no visual progression`);
  assert.doesNotMatch(svg0+svg1,/NaN|Infinity|undefined|<script/i,id);assert.ok(typeof math.latex==='string'&&math.latex.trim().length>3,id);
  assert.ok(math.values.length>=1,id);assert.equal(grade10Schema(id).length>=1,true,id);
 }
});
test('Randomized parameter settings never print NaN or broken SVG when mathematical domains are valid',()=>{
 let passed=0,invalid=0;for(const id of GRADE10_IDS){const schema=grade10Schema(id),base=grade10Defaults(id);
  for(let j=0;j<20;j++){const p={...base};for(const s of schema){const steps=Math.floor((s.max-s.min)/s.step);const seq=steps?((j*7+s.key.length*17)% (steps+1)):0;p[s.key]=Number((s.min+seq*s.step).toFixed(6));}
   if(grade10Family(id)==='10-11'){p.k=Math.min(p.k,p.n);p.wanted=Math.min(p.wanted,p.n);}
   if(!grade10Valid(id,p)){invalid++;continue;}
   const out=grade10Math(id,p),svg=grade10SceneSVG(id,p,2.5,{tries:20});assert.doesNotMatch(svg,/NaN|Infinity|undefined|<script/i,`${id}/${j}`);
   for(const row of out.values)assert.doesNotMatch(row,/NaN|Infinity|undefined/);passed++;
  }
 }assert.ok(passed>400,`Only ${passed} valid randomized cases`);assert.ok(invalid>=0);
});
test('Venn set operations and interval overlap return exact cardinalities/endpoints',()=>{
 const p=grade10Defaults('10-01-C01'),x=grade10Math('10-01-C01',p).result;assert.equal(x.intersection,3);assert.equal(x.union,12);assert.equal(x.total,14);assert.equal(x.complement,7);
 const inter=grade10Math('10-01-C04',{...p,l1:-3,r1:2,l2:-1,r2:4}).result;assert.deepEqual(inter.intersection,[-1,2]);assert.deepEqual(inter.union,[[-3,4]]);
 const disjoint=grade10Math('10-01-C04',{...p,l1:-4,r1:-2,l2:1,r2:4}).result;assert.equal(disjoint.intersection,null);assert.equal(disjoint.union.length,2);
 assert.equal(grade10Valid('10-01-C04',{...p,l1:4,r1:-2}),false);
});
test('Intersection of halfplanes does not reverse constraints and may be empty',()=>{
 const empty=grade10Math('10-02-C02',{...grade10Defaults('10-02-C02'),a:-1,b:0,c:-2,d:1,e:0,f:-2});assert.equal(empty.result.empty,true);
 const bounded=grade10Math('10-02-C03',{...grade10Defaults('10-02-C03'),a:1,b:0,c:1,d:0,e:1,f:2,u:1,v:1});assert.ok(bounded.result.vertices.length>=3);assert.ok(finite(bounded.result.objective.value));
 const square=[[-1,-1],[1,-1],[1,1],[-1,1]],clip=clipHalfplane(square,1,0,0);near(clip.reduce((s,P,i)=>s+P[0]*clip[(i+1)%clip.length][1]-P[1]*clip[(i+1)%clip.length][0],0)/2,2);
 assert.equal(grade10Valid('10-02-C01',{...grade10Defaults('10-02-C01'),a:0,b:0}),false);
});
test('Sine/cosine rules and area match a 3-4-5 triangle, A=60° (a=sqrt(13)), A=120° (a=sqrt(37)), and 6s timeline',()=>{
 const p={base:4,cx:0,cy:3},m=grade10Triangle(p);near(m.a,5);near(m.b,3);near(m.c,4);near(m.area,6);near(m.R,2.5);near(m.cosA,0);near(m.a2,25);
 near(m.a*m.a,m.b*m.b+m.c*m.c-2*m.b*m.c*m.cosA);near(m.a/Math.sin(m.angA),2*m.R);
 const p60={base:4,cx:1.5,cy:3*Math.sqrt(3)/2},m60=grade10Triangle(p60);near(m60.b,3);near(m60.c,4);near(m60.cosA,0.5);near(m60.a,Math.sqrt(13));near(m60.a2,13);
 const p120={base:4,cx:-1.5,cy:3*Math.sqrt(3)/2},m120=grade10Triangle(p120);near(m120.b,3);near(m120.c,4);near(m120.cosA,-0.5);near(m120.a,Math.sqrt(37));near(m120.a2,37);
 assert.equal(grade10Valid('10-03-C01',{base:4,cx:2,cy:0}),false);
 for(const t of [0,1.0,2.0,3.2,5.2]){
  const svg1=grade10SceneSVG('10-03-C01',p60,t,{showAux:true,lockSides:true});
  assert.ok(svg1.includes('data-handle="C"')&&svg1.includes('data-handle="B"')&&!svg1.includes('NaN'));
 }
 const svg=grade10SceneSVG('10-03-C02',{...grade10Defaults('10-03-C02'),...p},0);assert.ok(svg.includes('R'));
});
test('Vector sum, difference, scaling, dot product and zero-vector angle',()=>{
 const p={ux:3,uy:4,vx:-1,vy:2,k:-2};assert.deepEqual(grade10Math('10-04-C01',p).result.resultant,[2,6]);assert.deepEqual(grade10Math('10-04-C02',p).result.resultant,[4,2]);assert.deepEqual(grade10Math('10-04-C03',p).result.resultant,[-6,-8]);assert.equal(grade10Math('10-04-C04',p).result.dot,5);
 assert.equal(grade10Math('10-04-C04',{...p,ux:0,uy:0}).result.angle,null);
 const m=grade10Math('10-05-C03',{ax:-2,ay:1,bx:2,by:3,vx:1,vy:-2}).result;assert.deepEqual(m.u,[4,2]);assert.equal(m.dot,0);
});
test('Line intersection, coincident, parallel and perpendicular foot are exact',()=>{
 const p={a:1,b:0,c:-1,d:0,e:1,f:-2,px:3,py:4};const x=grade10Line(p);assert.deepEqual(x.intersection,[1,2]);near(x.distance,2);assert.deepEqual(x.foot,[1,4]);
 const q=grade10Line({...p,d:2,e:0,f:-2});assert.equal(q.coincident,true);const s=grade10Line({...p,d:2,e:0,f:-3});assert.equal(s.parallel,true);assert.equal(s.coincident,false);
 assert.equal(grade10Valid('10-07-C01',{...p,a:0,b:0}),false);
});
test('Circle intersections (2,1,0) and tangent point remain on the circle',()=>{
 const p={h:0,k:0,r:2,m:0,q:0,angle:30};assert.equal(grade10Circle(p).intersections.length,2);
 const tangent=grade10Circle({...p,q:2});assert.equal(tangent.intersections.length,1);near(tangent.distance,2);
 assert.equal(grade10Circle({...p,q:3}).intersections.length,0);
 const m=grade10Circle(p);near(Math.hypot(m.contact[0],m.contact[1]),p.r);
 near(m.tangent.a*m.contact[0]+m.tangent.b*m.contact[1],m.tangent.c);
});
test('Ellipse, hyperbola and parabolic focus loci obey equations (KNTT y^2=2px)',()=>{
 const p=grade10Defaults('10-09-C01'),ell=grade10Math('10-09-C01',p).result;near(ell.c*ell.c,Math.abs(p.a*p.a-p.b*p.b));near(ell.major,4);
 const hyp=grade10Math('10-09-C02',p).result;near(hyp.c,Math.sqrt(p.a*p.a+p.b*p.b));near(hyp.asymptote,p.b/p.a);
 for(const y of [-5,-3,0,2,5]){const x=y*y/(2*p.p),direct=x+p.p/2,focus=Math.hypot(x-p.p/2,y);near(direct,focus);}
});
test('Ungrouped statistics preserve median, quartiles, 1/n variance and outliers',()=>{
 const p=grade10Defaults('10-10-C01'),s=grade10Statistics(p);near(s.avg,6.8);near(s.median,5.5);near(s.q1,4);near(s.q3,9);near(s.variance,s.values.reduce((acc,x)=>acc+(x-6.8)**2,0)/s.n);
 const moved=grade10Statistics({...p,outlier:8});assert.ok(moved.avg>s.avg);assert.ok(moved.stddev>s.stddev);
 const approx=grade10Math('10-10-C04',{...p,exact:3.25,estimate:3.4,tolerance:.1}).result;assert.equal(approx.ok,false);near(approx.error,.15);
});
test('Probability frequency depends on seeded trials; Pascal coefficients sum to 2^n',()=>{
 const p={n:6,k:3,wanted:2};const q=grade10Experiment('10-11-C03',p,2000,137);assert.equal(q.tries,2000);assert.equal(q.outcomes.length,20);assert.ok(Math.abs(q.relative-1/3)<.06);assert.deepEqual(q,grade10Experiment('10-11-C03',p,2000,137));
 const count=grade10Math('10-11-C02',p).result;assert.equal(count.permutations,720);assert.equal(count.arrangements,120);assert.equal(count.combinations,20);
 for(let n=2;n<=9;n++){const coeff=grade10Math('10-11-C04',{...p,n,k:Math.min(n,p.k),wanted:Math.min(n,p.wanted)}).result.coefficients;assert.equal(coeff.reduce((a,b)=>a+b,0),2**n);assert.equal(coeff[0],1);assert.equal(coeff.at(-1),1);}
});
test('All 9 original Grade10 museum displays have nonempty Three meshes but are planar concepts',()=>{
 const original=catalog.filter(x=>x.grade===10);assert.equal(original.length,9);const planarTypes=['parabolaGeneral','inequalityRegion','triangleLaws','vectorParallelogram','vectorDot','lineOxy','circleOxy','ellipse','hyperbola'];
 for(const ex of original){assert.ok(planarTypes.includes(ex.type),ex.type);const root=createMathModel(ex,{faces:true,edges:true,labels:false});try{let meshes=0;root.traverse(o=>{if(o.isMesh)meshes++});assert.ok(meshes>0,ex.id);const box=new THREE.Box3().setFromObject(root);assert.equal(box.isEmpty(),false,ex.id);}finally{disposeObject(root);}}
});
test('All Grade10 off-grade R4 extras are archived but not deleted, while Grade6 source hashes remain unchanged',()=>{
 assert.equal(EXPLORATION_MODELS.filter(x=>x.grade===10).length,5);for(const z of zonesForGrade(10))assert.ok(!portalExhibits(catalog,10,z.id).some(x=>x.id.startsWith('mv_r4_')));
 for(const [file,sha] of Object.entries({'data/catalog.json':'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15','data/models.toan6.json':'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9'}))assert.equal(crypto.createHash('sha256').update(read(file)).digest('hex'),sha);
});
test('R7.4 Full 38 Grade10 Models Specification Audit: Explore questions, presets, 4-phase 6s timeline, and Section H textbook cases',()=>{
 assert.equal(Object.keys(GRADE10_EXPLORE_DATA).length,38);
 for(const mode of cases){
  const exp=GRADE10_EXPLORE_DATA[mode.id];
  assert.ok(exp,`Missing GRADE10_EXPLORE_DATA for ${mode.id}`);
  assert.ok(exp.question.length>15,mode.id);
  assert.ok(exp.explanation.length>30,mode.id);
  assert.ok(Array.isArray(exp.presets)&&exp.presets.length>=3,mode.id);
  if(isGraphCase(mode.id)){
   for(const pr of exp.presets){
    const gm=graphExperiment(mode.id,{...graphDefaults(mode.id),...pr.params});
    assert.equal(gm.check,true,`${mode.id}: ${pr.label}`);
    assert.ok(gm.series.length>=1&&gm.markers.length>=1,mode.id);
   }
  }else{
   for(const pr of exp.presets){
    const p={...grade10Defaults(mode.id),...pr.params};
    assert.equal(grade10Valid(mode.id,p),true,`${mode.id}: ${pr.label}`);
    for(const t of [0,0.6,1.8,3.6,5.2]){
     const svg=grade10SceneSVG(mode.id,p,t,pr.flags||{});
     assert.doesNotMatch(svg,/NaN|Infinity|undefined|<script/i,`${mode.id}@t=${t}`);
     if(t>0)assert.match(svg,/Pha [1-4]/,`${mode.id}@t=${t} missing phase badge`);
    }
   }
  }
 }
 // Mandatory Section H checks across families
 const touchClosed=grade10Math('10-01-C04',{...grade10Defaults('10-01-C04'),l1:-2,r1:2,l2:2,r2:4},{openBLeft:false}).result;
 assert.deepEqual(touchClosed.intersection,[2,2]);
 const touchOpen=grade10Math('10-01-C04',{...grade10Defaults('10-01-C04'),l1:-2,r1:2,l2:2,r2:4},{openBLeft:true}).result;
 assert.equal(touchOpen.intersection,null);
 const strictBorder=grade10Math('10-02-C01',{...grade10Defaults('10-02-C01'),a:1,b:1,c:2},{testM:[2,0],strictIneq:true}).result;
 assert.equal(strictBorder.inM,false);
 const q1=graphExperiment('10-06-C01',{a:1,b:-2,c:1});assert.equal(q1.check,true);assert.deepEqual([q1.markers[0].x,q1.markers[0].y],[1,0]);
 const q1Bad=graphExperiment('10-06-C01',{a:-1,b:-2,c:1});assert.equal(q1Bad.check,false);
 const q2=graphExperiment('10-06-C02',{a:-1,b:2,c:0});assert.equal(q2.check,true);assert.deepEqual([q2.markers[0].x,q2.markers[0].y],[1,1]);
 const q2Bad=graphExperiment('10-06-C02',{a:1,b:2,c:0});assert.equal(q2Bad.check,false);
 assert.ok(grade10InvalidReason('10-03-C01',{base:4,cx:2,cy:0}).includes('thẳng hàng'));
});
test('R7.4 Split Combinatorics/Counting Models (Add, Multiply, P, A, C) & Grade 11-12 3D Spatial Interactivity',()=>{
 for(const id of ['10-11-C01','10-11-C01-MUL','10-11-C02','10-11-C02-A','10-11-C02-C']){
  assert.equal(caseRuntimeStatus(id),'interactive',id);
 }
 const p1=grade10Defaults('10-11-C01');
 const svgAdd=grade10SceneSVG('10-11-C01',p1,1.2,{lockedSubMode:'add',ruleMode:'add'});
 const svgMul=grade10SceneSVG('10-11-C01',p1,1.2,{lockedSubMode:'multiply',ruleMode:'multiply'});
 assert.match(svgAdd,/MÔ HÌNH QUY TẮC CỘNG/);assert.doesNotMatch(svgAdd,/data-submodel="multiply"/);
 assert.match(svgMul,/MÔ HÌNH QUY TẮC NHÂN/);assert.doesNotMatch(svgMul,/data-submodel="add"/);
 const p2=grade10Defaults('10-11-C02');
 const svgP=grade10SceneSVG('10-11-C02',p2,1.2,{lockedSubMode:'P',combTab:'P',orderMode:'perm'});
 const svgA=grade10SceneSVG('10-11-C02',p2,1.2,{lockedSubMode:'A',combTab:'A',orderMode:'ordered'});
 const svgC=grade10SceneSVG('10-11-C02',p2,1.2,{lockedSubMode:'C',combTab:'C',orderMode:'unordered'});
 assert.match(svgP,/MÔ HÌNH HOÁN VỊ/);assert.doesNotMatch(svgP,/data-submodel="A"/);
 assert.match(svgA,/MÔ HÌNH CHỈNH HỢP/);assert.doesNotMatch(svgA,/data-submodel="C"/);
 assert.match(svgC,/MÔ HÌNH TỔ HỢP/);assert.doesNotMatch(svgC,/data-submodel="P"/);
 for(const id of GRADE11_CUSTOM_IDS.filter(grade11Is3D)){
  const p=grade11Defaults(id),ex=grade11SolidModel(id,p,1.5),handles=getSolidHandles(ex.type,ex.params),svg=grade11SpatialSVG(id,p,1.5);
  assert.ok(handles.length>=1,`Missing 3D handles for Grade 11 solid ${id} (${ex.type})`);
  assert.match(svg,/data-handle=/,`Missing 2D schematic handle for ${id}`);
  const root=createMathModel(ex,{faces:true,edges:true,labels:true});
  try{const box=new THREE.Box3().setFromObject(root);assert.equal(box.isEmpty(),false,id);}finally{disposeObject(root);}
 }
 for(const id of GRADE12_CUSTOM_IDS.filter(grade12Is3D)){
  const p=grade12Defaults(id),ex=grade12SolidModel(id,p,1.5),handles=getSolidHandles(ex.type,ex.params),svg=grade12SpatialSVG(id,p,1.5);
  assert.ok(handles.length>=1,`Missing 3D handles for Grade 12 solid ${id} (${ex.type})`);
  assert.match(svg,/data-handle=/,`Missing 2D schematic handle for ${id}`);
  const root=createMathModel(ex,{faces:true,edges:true,labels:true});
  try{const box=new THREE.Box3().setFromObject(root);assert.equal(box.isEmpty(),false,id);}finally{disposeObject(root);}
 }
});
test('R7.4 Full Lab DOM Mount Audit: All 247 Grade 7-12 modes mount and draw without any runtime exception',()=>{
 const makeEl=(tag='div')=>{
  const listeners=new Map();
  const el={
   tagName:String(tag).toUpperCase(),className:'',textContent:'',_innerHTML:'',style:{},dataset:{},children:[],attributes:{},
   get innerHTML(){return this._innerHTML;},
   set innerHTML(v){this._innerHTML=String(v||'');},
   classList:{add(){},remove(){},toggle(){},contains(){return false;}},
   append(...kids){for(const k of kids)if(k&&typeof k==='object'){k.parentElement=el;this.children.push(k);}},
   prepend(...kids){for(const k of kids)if(k&&typeof k==='object'){k.parentElement=el;this.children.unshift(k);}},
   replaceChildren(...kids){this.children=[];this.append(...kids);},
   setAttribute(k,v){this.attributes[k]=String(v);},
   getAttribute(k){return this.attributes[k]??null;},
   hasAttribute(k){return k in this.attributes;},
   addEventListener(ev,fn){if(!listeners.has(ev))listeners.set(ev,[]);listeners.get(ev).push(fn);},
   removeEventListener(){},
   setPointerCapture(){},
   closest(){return null;},
   querySelector(sel){if(sel==='svg')return makeEl('svg');return null;},
   querySelectorAll(){return [];},
   getBoundingClientRect(){return {left:0,top:0,width:800,height:450};},
   getContext(){return new Proxy({measureText:t=>({width:String(t).length*8})},{get:(o,k)=>k in o?o[k]:()=>{}});}
  };
  return el;
 };
 const prevCreate=globalThis.document.createElement;
 globalThis.document.createElement=t=>makeEl(t);
 globalThis.document.createElementNS=(ns,t)=>makeEl(t);
 globalThis.localStorage={getItem(){return null;},setItem(){}};
 if(!globalThis.requestAnimationFrame)globalThis.requestAnimationFrame=()=>1;
 if(!globalThis.cancelAnimationFrame)globalThis.cancelAnimationFrame=()=>{};
 try{
  let mounted=0;
  for(const fam of data.source_registry){
   for(const mode of fam.modes){
    const id=mode.id,host=makeEl('div');
    if(isGrade12Mode(id)){const l=new Grade12Lab();l.mount(host,id,mode);assert.equal(l.error,null,id);l.destroy();mounted++;}
    else if(isGrade11Mode(id)){const l=new Grade11Lab();l.mount(host,id,mode);assert.equal(l.error,null,id);l.destroy();mounted++;}
    else if(isGrade10Mode(id)){const l=new Grade10Lab();l.mount(host,id,mode);assert.equal(l.error,null,id);l.destroy();mounted++;}
    else if(isGrade9Mode(id)){const l=new Grade9Lab();l.mount(host,id,mode);l.destroy();mounted++;}
    else if(isGrade8Mode(id)){const l=new Grade8Lab();l.mount(host,id,mode);l.destroy();mounted++;}
    else if(isGrade7Mode(id)){const l=new Grade7Lab();l.mount(host,id,mode);l.destroy();mounted++;}
    else if(isCirclePosition(id)){const l=new CirclePositionLab();l.mount(host,id,mode);l.destroy();mounted++;}
    else if(isGraphCase(id)){const l=new FunctionGraphLab();l.mount(host,id,mode);mounted++;}
   }
  }
  assert.equal(mounted,234); // 247 - 13 triangle cases handled directly in CurriculumExplorer
  const splitModes=[
   {id:'10-11-C01',baseId:'10-11-C01',displayCode:'10-11-C01A',subMode:'add',name:'Quy tắc cộng (m + n)'},
   {id:'10-11-C01-MUL',baseId:'10-11-C01',displayCode:'10-11-C01B',subMode:'multiply',name:'Quy tắc nhân (m × n)'},
   {id:'10-11-C02',baseId:'10-11-C02',displayCode:'10-11-C02A',subMode:'P',name:'Hoán vị (Pₙ = n!)'},
   {id:'10-11-C02-A',baseId:'10-11-C02',displayCode:'10-11-C02B',subMode:'A',name:'Chỉnh hợp (Aₙᵏ)'},
   {id:'10-11-C02-C',baseId:'10-11-C02',displayCode:'10-11-C02C',subMode:'C',name:'Tổ hợp (Cₙᵏ)'}
  ];
  const svgs={};
  for(const sm of splitModes){
   const host=makeEl('div'),l=new Grade10Lab();
   l.mount(host,sm.baseId,sm);
   assert.equal(l.error,null,sm.displayCode);
   svgs[sm.displayCode]=l.lastValidSvg;
   l.destroy();
  }
  assert.ok(svgs['10-11-C02A'].includes('Bảng hoán vị sinh ra'),'10-11-C02A must show Permutation Table');
  assert.ok(!svgs['10-11-C02A'].includes('KHO LOẠI BỎ'),'10-11-C02A must not show Rejected Pool');
  assert.ok(svgs['10-11-C02B'].includes('KHO LOẠI BỎ'),'10-11-C02B must show Rejected Pool (n - k)');
  assert.ok(svgs['10-11-C02B'].includes('Hạng 1'),'10-11-C02B must show Ranked Podiums');
  assert.ok(svgs['10-11-C02C'].includes('GIỎ TẬP HỢP'),'10-11-C02C must show Circular Unordered Bag');
  assert.ok(svgs['10-11-C02C'].includes('Danh sách C'),'10-11-C02C must show Subset Grid');
 }finally{
  globalThis.document.createElement=prevCreate;
 }
});
