import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TRIANGLE_CASE_IDS,TRIANGLE_CASES,initialTriangleParams,triangleParamSchema,makeTriangle,makeTrianglePair,triangleMeasures,dragTrianglePoint,checkTrianglePair} from '../src/curriculum/triangle-engine.mjs';
import {CIRCLE_POSITION_IDS,circleDefaults,classifyLineCircle,classifyTwoCircles,lineCircleGeometry,twoCircleGeometry,circleExpected} from '../src/curriculum/circle-positions.mjs';
import {GRAPH_FAMILIES,isGraphCase,graphDefaults,graphParamSchema,graphExperiment} from '../src/curriculum/graph-models.mjs';
import {isGrade12Mode} from '../src/curriculum/grade12-engine.mjs';
import {caseRuntimeStatus,curatedFamilyTitle} from '../src/curriculum/CurriculumExplorer.js';
const data=JSON.parse(fs.readFileSync(new URL('../data/mathverse-7-12-curated.json',import.meta.url),'utf8'));
const modes=data.source_registry.flatMap(f=>f.modes);
const finite=(...values)=>values.every(Number.isFinite);
const approx=(a,b,tol=1e-7)=>Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b));

test('67 families, 247 distinct IDs, 6 grades, explicit runtime provenance',()=>{
 assert.equal(data.families,67);assert.equal(data.modes_total,247);assert.equal(data.source_registry.length,67);assert.equal(modes.length,247);
 assert.equal(new Set(modes.map(m=>m.id)).size,247);
 for(let g=7;g<=12;g++){const byGrade=data.source_registry.filter(f=>f.grade===g);assert.ok(byGrade.length>0);assert.equal(byGrade.flatMap(f=>f.modes).length,data.by_grade[g]);}
 for(const family of data.source_registry){assert.ok(curatedFamilyTitle(family));for(const m of family.modes){assert.equal(m.implementation_status,m.id.startsWith('11-')&&caseRuntimeStatus(m.id)==='interactive'&&(!isGraphCase(m.id)||m.id==='11-12-C04')?'VERIFIED_INTERACTIVE_GD6':isGrade12Mode(m.id)?'VERIFIED_INTERACTIVE_GD7':m.id.startsWith('10-')&&!m.id.startsWith('10-06-')?'INTERACTIVE_GD5':caseRuntimeStatus(m.id)==='interactive'?(m.id.startsWith('9-')&&!m.id.startsWith('9-01-')&&!m.id.startsWith('9-06-')&&!(m.id.startsWith('9-08-')&&Number(m.id.slice(-2))<=3)?'VERIFIED_INTERACTIVE_GD4':'VERIFIED_INTERACTIVE_R5'):'SPEC_ONLY_PENDING');}}
});

test('13 triangle criteria: correct invariants and incorrect perturbation detected',()=>{
 assert.equal(TRIANGLE_CASE_IDS.length,13);
 for(const id of TRIANGLE_CASE_IDS){
  const params=initialTriangleParams(id),pair=makeTrianglePair(id,params);assert.ok(pair.check.passes,id);
  const x=triangleMeasures(pair.first),y=triangleMeasures(pair.second);
  assert.ok(finite(...Object.values(x),...Object.values(y)));assert.ok(approx(x.A+x.B+x.C,180));
  if(TRIANGLE_CASES[id].similar){assert.ok(approx(pair.check.areaRatio,params.k*params.k),id);assert.ok(pair.check.sideRatios.every(x=>approx(x,params.k)),id);}else{assert.ok(approx(pair.check.areaRatio,1));assert.ok(pair.check.sideRatios.every(x=>approx(x,1)));}
  const disturbed=makeTrianglePair(id,params,{perturb:true});assert.ok(!disturbed.check.passes,`${id}: should reject broken constraint`);
 }
});

test('Triangle invalid configurations rejected; no silently degenerate drawings',()=>{
 assert.throws(()=>makeTriangle('7-04-C01',{p:2,q:2,r:4.5}),/bất đẳng thức/);
 assert.throws(()=>makeTriangle('7-04-C03',{p:5,alpha:90,beta:100}),/tổng/);
 assert.throws(()=>makeTriangle('7-04-C07',{h:5,p:5}),/nhỏ hơn/);
 assert.throws(()=>makeTriangle('8-06-C06',{h:6,p:6}),/nhỏ hơn/);
 assert.throws(()=>makeTrianglePair('8-06-C01',{...initialTriangleParams('8-06-C01'),k:0}),/dương/);
 const e=initialTriangleParams('7-04-C01'),tri=makeTriangle('7-04-C01',e);
 assert.equal(checkTrianglePair('7-04-C01',tri,{A:tri.A,B:tri.B,C:[10,0]}).passes,false);
});

test('Triangle mouse dragging and sliders preserve Euclidean constraints across random valid samples',()=>{
 let count=0;
 for(const id of TRIANGLE_CASE_IDS){
  let success=0;
  for(let j=0;j<140;j++){
   const base=initialTriangleParams(id),params={...base};
   for(const field of triangleParamSchema(id))params[field.key]=field.min+(field.max-field.min)*((j*11+field.key.length*13+id.length)%101)/100;
   for(const mode of ['B','C']){
    try{const pair=makeTrianglePair(id,params),p=pair.first[mode];assert.ok(pair.check.passes);
     const dragged=dragTrianglePoint(id,params,mode,[p[0]+.24,p[1]+.13]);const next=makeTrianglePair(id,dragged);assert.ok(next.check.passes);success++;}
    catch(e){if(!/bất đẳng thức|nhỏ hơn|góc|suy biến/.test(e.message))throw e;}
    count++;
   }
  }
  assert.ok(success>100,`${id} had too few valid configurations`);
 }
 assert.ok(count>3000);
});

test('6 circle criteria: exact boundary/intersection math, both internal/external tangencies',()=>{
 assert.equal(CIRCLE_POSITION_IDS.length,6);
 for(const id of CIRCLE_POSITION_IDS){const p=circleDefaults(id);let scene=id<='9-06-C03'?lineCircleGeometry(p.r,p.d):twoCircleGeometry(p.R,p.r,p.d);assert.ok(circleExpected(id,scene.state),id);}
 assert.equal(classifyLineCircle(3,2.9),'secant');assert.equal(classifyLineCircle(3,3),'tangent');assert.equal(classifyLineCircle(3,3.1),'disjoint');
 assert.equal(classifyTwoCircles(3,2,3),'intersect');assert.equal(classifyTwoCircles(3,2,5),'externally_tangent');assert.equal(classifyTwoCircles(3,2,1),'internally_tangent');
 assert.equal(classifyTwoCircles(3,2,6),'separate');assert.equal(classifyTwoCircles(3,1,1),'contained');assert.equal(classifyTwoCircles(3,3,0),'coincident');
 const g=twoCircleGeometry(3,2,3);assert.equal(g.intersections.length,2);
 for(const [x,y] of g.intersections){assert.ok(approx(x*x+y*y,9));assert.ok(approx((x-3)*(x-3)+y*y,4));}
 for(let i=0;i<100;i++){const R=1+i*.03,r=.7+i*.012,d=Math.abs(R-r)+(R+r-Math.abs(R-r))*.5;const points=twoCircleGeometry(R,r,d);assert.equal(points.state,'intersect');assert.equal(points.intersections.length,2);}
});

test('Graph modules cover 35 modes and evaluate every curve safely, including special asymptotes',()=>{
 const ids=modes.filter(m=>isGraphCase(m.id)).map(x=>x.id);assert.equal(ids.length,35);
 for(const id of ids){const model=graphExperiment(id,graphDefaults(id));assert.ok(Array.isArray(model.series));assert.ok(model.series.length>0,id);
  assert.ok(graphParamSchema(id).length>0,id);assert.ok(model.latex,id);
  for(const s of model.series){for(let i=0;i<250;i++){
   const x=model.domain[0]+(model.domain[1]-model.domain[0])*i/249,y=s.evaluate(x);
   assert.equal(typeof y,'number',id);assert.ok(!Number.isFinite(y)||Math.abs(y)<1e18,id);
  }}
 }
 assert.equal(graphExperiment('9-01-C01',graphDefaults('9-01-C01')).check,true);
 assert.equal(graphExperiment('9-01-C02',graphDefaults('9-01-C02')).check,true);
 assert.equal(graphExperiment('9-01-C03',graphDefaults('9-01-C03')).check,true);
 const m=graphExperiment('10-06-C01',{a:1,b:-2,c:0});assert.ok(m.markers.some(p=>approx(p.x,1)&&approx(p.y,-1)));
 assert.equal(graphExperiment('12-02-C02',{a:2,b:1,c:1,d:-1}).asymptotes.length,2);
 assert.equal(graphExperiment('12-02-C02',{a:2,b:-2,c:1,d:-1}).asymptotes.length,1); // removable point, not vertical asymptote
 assert.equal(graphExperiment('11-11-C01',{base:1}).check,false);
 assert.match(graphExperiment('12-06-C02',graphDefaults('12-06-C02')).latex,/frac\{1\}\{3\}/);
});
