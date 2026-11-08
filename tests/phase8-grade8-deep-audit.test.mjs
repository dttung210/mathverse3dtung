import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from '../vendor/three.module.js';
import {createMathModel,disposeObject} from '../src/geometry.js';
import {GRADE8_IDS,isGrade8Mode,grade8Defaults,grade8Schema,grade8Metrics,grade8Solid,grade8Valid,quad8Properties,quad8,thales8,bisector8,pythag8,pyramid8,areaPoly,homothety8,grade8Probability,GRADE8_FORMULAS} from '../src/curriculum/grade8-engine.mjs';
import {grade8SVGScene,grade8NetSVG,grade8QuadProjection} from '../src/curriculum/grade8-svg.mjs';
import {caseRuntimeStatus} from '../src/curriculum/CurriculumExplorer.js';
import {TRIANGLE_CASES,makeTrianglePair} from '../src/curriculum/triangle-engine.mjs';
import {EXPLORATION_MODELS} from '../src/portal-labs/exploration-collection.js';
import {portalExhibits,zonesForGrade} from '../src/portal-labs/portal-registry.js';
const data=JSON.parse(fs.readFileSync(new URL('../data/mathverse-7-12-curated.json',import.meta.url),'utf8'));
const catalog=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8')).items;
const near=(a,b,tol=1e-7)=>Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b));
const len=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
if(!globalThis.document)globalThis.document={createElement:()=>({width:1000,height:1000,getContext:()=>new Proxy({measureText:x=>({width:String(x).length*9})},{get:(o,k)=>k in o?o[k]:()=>{}})})};
test('grade8 source registry: 9 families and 37 running cases (6 similarity, 3 graphs, 28 experiments)',()=>{
 const groups=data.source_registry.filter(x=>x.grade===8),modes=groups.flatMap(x=>x.modes);assert.equal(groups.length,9);assert.equal(modes.length,37);
 assert.equal(GRADE8_IDS.length,28);assert.equal(GRADE8_IDS.filter(x=>grade8Solid(x)).length,4);
 for(const m of modes){assert.equal(caseRuntimeStatus(m.id),'interactive');assert.equal(m.implementation_status,'VERIFIED_INTERACTIVE_R5');}
 assert.equal(modes.filter(x=>x.id.startsWith('8-06-C0')&&Number(x.id.slice(-2))<=6).length,6);
 assert.equal(modes.filter(x=>x.id.startsWith('8-07-')).length,3);
});
test('Grade 8: all 24 SVG labs draw finite diagrams and have visible motion',()=>{
 let n=0;for(const id of GRADE8_IDS){if(grade8Solid(id))continue;n++;const p=grade8Defaults(id);const shots=[0,2.8,4.9].map(t=>grade8SVGScene(id,p,t));
  assert.notEqual(shots[0],shots[1],id+' fails to move');for(const x of shots){assert.match(x,/^<svg/);assert.match(x,/<\/svg>$/);assert.ok(!/NaN|undefined|Infinity/.test(x),id);assert.ok(x.includes('stroke'),id);}
  assert.ok(grade8Metrics(id,p).length>0,id);
 }assert.equal(n,24);
});
test('Grade 8: 24 SVG experiments remain finite at 20 valid slider settings x 3 time steps',()=>{
 let count=0;for(const id of GRADE8_IDS){if(grade8Solid(id))continue;for(let j=0;j<20;j++){
  const p=grade8Defaults(id);for(const s of grade8Schema(id)){p[s.key]=Number((s.min+(s.max-s.min)*((j*7+s.key.length*3)%19)/18).toFixed(6));}
  if(id==='8-01-C02')p.b=Math.min(p.b,Math.max(.5,p.a-.1));
  if(id==='8-05-C02')p.c=Math.min(p.c,p.a+p.b-.05);
  assert.ok(grade8Valid(id,p),id+' schema');for(const t of [0,2.7,5.6]){
   const x=grade8SVGScene(id,p,t);assert.ok(!/NaN|undefined|Infinity/.test(x),`${id},${j}`);count++;
  }
 }}assert.equal(count,24*20*3);
});
test('Grade 8: five quadrilateral types always preserve their structural properties',()=>{
 for(let i=0;i<100;i++)for(const id of ['8-02-C01','8-02-C02','8-02-C03','8-02-C04','8-02-C05']){
  const p=grade8Defaults(id);for(const v of grade8Schema(id))p[v.key]=v.min+(v.max-v.min)*(i/100);
  const x=quad8Properties(id,p);assert.ok(x.valid&&x.area>0,id);
  if(id==='8-02-C01'){assert.ok(x.legsEqual&&near(x.diags[0],x.diags[1]),id);}
  if(id!=='8-02-C01')assert.ok(x.diagonalsBisect,id);
  if(id==='8-02-C03'||id==='8-02-C05')assert.ok(x.right,id);
  if(id==='8-02-C04'||id==='8-02-C05')assert.ok(x.allSidesEqual,id);
  const map=grade8QuadProjection(id,p);assert.ok(map.scale>0&&map.offset.every(Number.isFinite));
 }
});
test('Grade 8: Thales direct/inverse, midpoint and parallel similarity obey ratios',()=>{
 for(let i=1;i<101;i++){
  const p={a:4+(i%40)/10,h:3+i*.02,u:.2+(i%60)/100,v:.68};
  const d=thales8(p);assert.ok(d.parallel);assert.ok(d.ratios.every(x=>near(x,p.u)));
  const mid=thales8(p,{midline:true});assert.ok(mid.parallel);assert.ok(mid.ratios.every(x=>near(x,.5)));
  const inv=thales8({...p,v:p.u},{reverse:true});assert.ok(inv.parallel);assert.ok(near(inv.ratios[0],inv.ratios[1]));
  const wrong=thales8({...p,v:Math.min(.85,p.u+.15)},{reverse:true});assert.ok(!wrong.parallel);
 }
});
test('Grade 8: internal bisector theorem always true, including varying unsymmetric triangles',()=>{
 for(let i=0;i<170;i++){
  const p={a:2+i*.016,b:3+(i*5%50)*.04,h:2+i*.02};const x=bisector8(p);
  assert.ok(x.ok&&near(x.BD/x.DC,x.AB/x.AC));
 }
});
test('Grade 8: Pythagoras theorem and inverse must detect false/degenerate configurations',()=>{
 for(let a=2;a<=6;a+=.4)for(let b=2;b<=6;b+=.4){const p={a,b,c:Math.hypot(a,b)};const v=pythag8(p);
  assert.ok(v.valid&&v.right&&near(v.c*v.c,a*a+b*b));assert.ok(pythag8(p,true).right);
  assert.ok(!pythag8({...p,c:p.c*.95},true).right);
 }assert.equal(pythag8({a:2,b:3,c:9},true).valid,false);
});
test('Grade 8: perspective similarity has exact O,P,Pprime collinearity and area ratio',()=>{
 for(let i=0;i<150;i++){
  const O=[(i%10)-5,i/50],P=[i*.02,5-i*.03],k=.45+i/100,Q=homothety8(O,P,k);
  assert.ok(near(len(O,Q),k*len(O,P)));
  assert.ok(near((Q[0]-O[0])*(P[1]-O[1])-(Q[1]-O[1])*(P[0]-O[0]),0));
  assert.ok(near(areaPoly([[0,0],[3*k,0],[3*k,4*k],[0,4*k]]),12*k*k));
 }
 for(const id of Object.keys(TRIANGLE_CASES).filter(x=>x.startsWith('8-')))assert.ok(makeTrianglePair(id).check.passes,id);
});
test('Grade 8: two regular pyramids have correct faces/edges/vertices, volume, lateral area',()=>{
 for(let i=0;i<75;i++)for(const id of ['8-09-C01','8-09-C02','8-09-C03','8-09-C04']){
  const p={a:2+i*.065,h:1.5+i*.07};const m=pyramid8(id,p);const tri=id==='8-09-C01';
  assert.equal(m.faces,tri?4:5);assert.equal(m.edges,tri?6:8);assert.equal(m.vertices,tri?4:5);
  assert.ok(near(m.volume,m.baseArea*p.h/3));assert.ok(near(m.lateralArea,(tri?3:4)*p.a*m.slantHeight/2));
  const net=grade8NetSVG(id,p,.7);assert.match(net,/^<svg/);assert.ok(!/NaN|undefined|Infinity/.test(net));
 }
});
test('Grade8: 4/4 solids have real non-coplanar Three.js geometry; 9 original exhibits stay preserved',()=>{
 let n=0;for(const id of GRADE8_IDS.filter(grade8Solid)){
  const p=grade8Defaults(id),model={id:'grade8_'+id,grade:8,type:pyramid8(id,p).type,params:{a:p.a,h:p.h}};
  const group=createMathModel(model,{faces:true,edges:true,labels:false});let faces=0;const verts=[];
  group.traverse(o=>{if(o.isMesh){faces++;if(o.geometry?.attributes?.position){const v=o.geometry.attributes.position;const take=Math.min(100,v.count);for(let i=0;i<take;i++)verts.push(new THREE.Vector3().fromBufferAttribute(v,i).applyMatrix4(o.matrixWorld));}}});
  assert.ok(faces>=1,id);const span=new THREE.Box3().setFromObject(group).getSize(new THREE.Vector3());assert.ok(span.x>0.01&&span.y>0.01&&span.z>0.01,id);n++;disposeObject(group);
 }assert.equal(n,4);assert.equal(catalog.filter(x=>x.grade===8).length,9);
});
test('Grade8: archive all five irrelevant R4 examples without deleting them or overwriting original datasets',()=>{
 assert.equal(EXPLORATION_MODELS.filter(x=>x.grade===8).length,5);
 for(const zone of zonesForGrade(8))assert.equal(portalExhibits(catalog,8,zone.id).filter(x=>x.id.startsWith('mv_r4_')).length,0);
 assert.equal(catalog.length,63);
 for(const [file,hash] of Object.entries({'data/catalog.json':'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15','data/models.toan6.json':'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9'})){
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('../'+file,import.meta.url))).digest('hex'),hash);
 }
});
test('Grade8: interface is registered, formulas are compatible with Word LaTeX and intended grade8 source',()=>{
 const p=fs.readFileSync(new URL('../src/curriculum/CurriculumExplorer.js',import.meta.url),'utf8');assert.match(p,/new Grade8Lab\(\)/);assert.match(p,/isGrade8Mode\(mode\.id\)/);
 for(const id of GRADE8_IDS)assert.ok(GRADE8_FORMULAS[id]||GRADE8_FORMULAS[id.slice(0,4)],id);
 assert.match(GRADE8_FORMULAS['8-03'],/\\frac/);assert.match(GRADE8_FORMULAS['8-02-C01'],/\\frac/);
});

test('Grade8: experimental probability covers theoretical ratios, sampled trials, and optional chart choice',()=>{
 for(const [red,blue] of [[3,2],[1,1],[9,1]]){
  const v=grade8Probability('8-08-C04',{red,blue});assert.ok(near(v.theoretical,red/(red+blue)));
 }
 for(let k=1;k<=6;k++){
  const z=grade8Probability('8-08-C03',{k,trials:1000,seed:11},6);
  assert.equal(z.count,1000);assert.equal(z.outcomes.length,1000);
  assert.ok(near(z.theoretical,k/6));assert.ok(z.successes>=0&&z.successes<=z.count);
 }
 for(const trials of [10,100,1000]){
  const p={trials,seed:7};const a=grade8Probability('8-08-C05',p,6),b=grade8Probability('8-08-C05',p,6);
  assert.deepEqual(a,b);assert.equal(a.count,trials);assert.ok(a.relative>=0&&a.relative<=1);
  assert.ok(grade8Probability('8-08-C05',p,2).count<trials);
 }
 const p=grade8Defaults('8-08-C01');
 for(const chartKind of [0,1,2]){
  const x=grade8SVGScene('8-08-C01',{...p,chartKind},2.4);assert.match(x,/<svg/);assert.ok(!/NaN|undefined|Infinity/.test(x));
  if(chartKind===2)assert.ok(x.includes('quạt tròn')&&x.includes('%'));
 }
});

test('Grade 8: seven notable identities are selectable and mathematically correct',async()=>{
 const {grade8FormulaFor}=await import('../src/curriculum/grade8-engine.mjs');
 const cases=[['8-01-C01',0,'(a+b)^2'],['8-01-C01',1,'(a-b)^2'],['8-01-C02',0,'a^2-b^2'],
 ['8-01-C03',0,'(a+b)^3'],['8-01-C03',1,'(a-b)^3'],['8-01-C03',2,'a^3+b^3'],['8-01-C03',3,'a^3-b^3']];
 for(const [id,v,formula] of cases){
  const p={...grade8Defaults(id),identityVariant:v},latex=grade8FormulaFor(id,p),svg=grade8SVGScene(id,p,1.7),metrics=grade8Metrics(id,p);
  assert.ok(latex.includes(formula),id+' '+v);assert.ok(metrics.length>=2);
  assert.ok(svg.includes('<svg')&&!/NaN|undefined|Infinity/.test(svg),id+' '+v);
  const nums=metrics.map(x=>x.match(/=\s*([-\d.]+)\s*$/)?.[1]);
  if(nums.every(Boolean))assert.ok(near(Number(nums[0]),Number(nums[1]),.002),id+' '+v+' '+metrics.join('|'));
 }
});
test('Grade8: Thales midpoint has no phantom draggable midpoint and balls have honest varying colors',()=>{
 const mid=grade8SVGScene('8-03-C03',grade8Defaults('8-03-C03'),2.1);
 assert.ok(!mid.includes('data-pt="D"')&&!mid.includes('data-pt="E"'));
 const p={...grade8Defaults('8-08-C04'),red:3,blue:5};
 const samples=[];
 for(let t=.15;t<5.9;t+=.21){const svg=grade8SVGScene('8-08-C04',p,t);assert.ok(svg.includes('Minh họa rút bóng số'));samples.push(svg.includes(': đỏ</text>')?'đỏ':svg.includes(': xanh</text>')?'xanh':'missing');}
 assert.ok(samples.includes('đỏ')&&samples.includes('xanh'),samples.join(' '));
});

test('Grade 8 R81 V2: all 30 SVG + similarity labs and 4 pyramid nets hold steady at 100% and apply V2 purposeful colors',()=>{
 const simIds=['8-06-C01','8-06-C02','8-06-C03','8-06-C04','8-06-C05','8-06-C06'];
 const allSvgIds=[...GRADE8_IDS.filter(id=>!grade8Solid(id)),...simIds];
 assert.equal(allSvgIds.length,30);
 for(const id of allSvgIds){
  const p=simIds.includes(id)?{}:grade8Defaults(id);
  const maxT=(id==='8-08-C01'||id==='8-08-C02')?8:6;
  const s0=grade8SVGScene(id,p,0);
  const sMid=grade8SVGScene(id,p,maxT*0.5);
  const sEnd=grade8SVGScene(id,p,maxT);
  const sAfter=grade8SVGScene(id,p,maxT*2);
  assert.notEqual(s0,sEnd,`${id} should progress from 0% to 100%`);
  assert.equal(sEnd,sAfter,`${id} must hold steady at 100%`);
  assert.ok(!/NaN|undefined|Infinity/.test(s0+sMid+sEnd),`${id} must not produce NaN`);
 }
 for(const id of GRADE8_IDS.filter(grade8Solid)){
  const p=grade8Defaults(id);
  const n0=grade8NetSVG(id,p,0),n1=grade8NetSVG(id,p,1),n2=grade8NetSVG(id,p,2);
  assert.notEqual(n0,n1);assert.equal(n1,n2);
 }
 // V2 purposeful color checks
 const s801=grade8SVGScene('8-01-C01',grade8Defaults('8-01-C01'),6);
 assert.ok(s801.includes('#1D4ED8')&&s801.includes('#B45309')&&s801.includes('#6D28D9'));
 const s802c01=grade8SVGScene('8-02-C01',grade8Defaults('8-02-C01'),6);
 assert.ok(s802c01.includes('#1D4ED8')&&s802c01.includes('#B45309')&&s802c01.includes('#6D28D9')&&s802c01.includes('#475569'));
 const s805c01=grade8SVGScene('8-05-C01',grade8Defaults('8-05-C01'),6);
 assert.ok(s805c01.includes('#1D4ED8')&&s805c01.includes('#B45309')&&s805c01.includes('#6D28D9'));
 const s806c01=grade8SVGScene('8-06-C01',{},6);
 assert.ok(s806c01.includes('#1D4ED8')&&s806c01.includes('#B45309')&&s806c01.includes('#15803D')&&s806c01.includes('#6D28D9'));
 const s808c03=grade8SVGScene('8-08-C03',grade8Defaults('8-08-C03'),6);
 assert.ok(s808c03.includes('#DBEAFE')&&s808c03.includes('#F1F5F9')&&s808c03.includes('#FEF3C7'));
 const s808c05=grade8SVGScene('8-08-C05',grade8Defaults('8-08-C05'),6);
 assert.ok(s808c05.includes('#1D4ED8')&&s808c05.includes('#B45309'));
 const n809c02=grade8NetSVG('8-09-C02',grade8Defaults('8-09-C02'),1);
 assert.ok(n809c02.includes('#B45309')&&n809c02.includes('#6D28D9')&&n809c02.includes('#475569'));
});
