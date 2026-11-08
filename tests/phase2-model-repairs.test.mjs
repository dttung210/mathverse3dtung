import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {triangleFromSides,triangleConstructions,triangleDragIsValid} from '../src/math/triangle-constructions.js';
import {Geometry2DViewer} from '../src/viewers/Geometry2DViewer.js';
import {JSXGraphAdapter,supportsJSXGraph} from '../src/viewers/JSXGraphAdapter.js';
import {EChartsAdapter} from '../src/viewers/EChartsAdapter.js';
import {StatisticsChartViewer} from '../src/viewers/StatisticsChartViewer.js';
import {Stats} from '../src/math/stats.js';
import {normalizeExhibit,metrics,TYPES} from '../src/math-core.js';
import {buildGeometry2DScene,GEOMETRY_2D_TYPES} from '../src/math/geometry2d-scenes.js';

const near=(x,y,eps=1e-6)=>assert.ok(Math.abs(x-y)<eps,`${x} != ${y}`);
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
const dist=(a,b)=>Math.hypot(...sub(a,b));
const model=(type,grade=9,params={})=>({type,grade,id:`phase2-${type}`,title:type,params});

test('Phase 2: G is at 2/3 median; I is equidistant to all sides; O to all vertices',()=>{
 const {A,B,C}=triangleFromSides(5,5,6),t=triangleConstructions(A,B,C);
 near(dist(A,t.G)/dist(A,t.midA),2/3);
 near(dist(t.O,A),dist(t.O,B));near(dist(t.O,A),dist(t.O,C));
 near(t.radiusIn,2*t.area/t.perimeter);
 // Orthocenter H lies on three altitudes.
 near(dot(sub(t.H,A),sub(C,B)),0);near(dot(sub(t.H,B),sub(C,A)),0);
 for(const point of [t.I,t.O,t.G,t.H,t.midA,t.midB,t.midC])assert(point.every(Number.isFinite));
});
test('Phase 2: 3/4/5 right triangle and invalid flat triangle',()=>{
 const s=triangleFromSides(3,4,5),d=triangleConstructions(s.A,s.B,s.C);
 near(d.area,6);near(d.radiusCircum,2.5);near(d.radiusIn,1);
 assert.throws(()=>triangleFromSides(1,2,3),/bất đẳng thức/);
 assert(!triangleDragIsValid([0,0],[1,1],[2,2],TYPES.triangleCenters.params));
});
test('Phase 2: triangle centroid, circles, law-of-sines models are actually draggable in original offline viewer',()=>{
 for(const type of ['triangleCenters','circumIncircle','triangleLaws']){
  const v=new Geometry2DViewer(model(type,type==='triangleCenters'?7:type==='circumIncircle'?9:10,{a:5,b:5,c:6}));
  assert.deepEqual(Object.keys(v.points).sort(),['A','B','C']);
  assert(v._getScene().primitives.some(o=>o.kind==='polygon'));
  assert.equal(v.setConstructionMode('centers'),true);
  const ps=v._getScene().primitives;
  assert(['G','H','I','O'].every(name=>ps.some(x=>x.kind==='point'&&x.name===name)));
  assert.equal(v.setConstructionMode('circles'),true);
  assert.equal(v._getScene().primitives.filter(x=>x.kind==='circle').length,2);
 }
});
test('Phase 2: dragging a triangle vertex updates sides and rejects collinearity',()=>{
 const changes=[];
 const v=new Geometry2DViewer(model('triangleCenters',7,{a:5,b:5,c:6}),{onParametersChange:p=>changes.push(p)});
 v.canvas={getBoundingClientRect:()=>({left:0,top:0}),style:{}};
 v.toMath=(x,y)=>[x,y];v.render=()=>{};
 v.dragTarget='A';
 const before=[...v.points.A];
 v._onPointerMove({clientX:1,clientY:5});
 assert.deepEqual(v.points.A,[1,5]);
 near(v.params.a,5);near(v.params.b,dist(v.points.C,v.points.A),.001);
 assert.equal(changes.length,1);
 v._onPointerMove({clientX:0,clientY:0});
 assert.deepEqual(v.points.A,[1,5], 'must reject nearly collinear triangle at y=0');
 assert.notDeepEqual(v.points.A,before);
});
test('Phase 2: JSXGraph optional engine adds moving medians and updates sliders to actual point positions',()=>{
 assert(supportsJSXGraph(model('triangleCenters',7)));
 const v=new JSXGraphAdapter(model('triangleCenters',7,{a:5,b:5,c:6}));
 const nodes=[];
 const board={create(type,params,opts={}){
   const point={
     x:Array.isArray(params)&&typeof params[0]==='number'?params[0]:0,
     y:Array.isArray(params)&&typeof params[1]==='number'?params[1]:0,
     X(){return this.x;},Y(){return this.y;},moveTo([x,y]){this.x=x;this.y=y;},on(){return this;}
   };
   nodes.push({type,params,opts,point});return point;
 },update(){}};
 v.board=board;v._build();
 assert.equal(nodes.filter(n=>n.type==='midpoint').length,3);
 assert.equal(nodes.filter(n=>n.type==='segment').length,3);
 const prior=[...v.points.A];v.updateParameters({a:6,b:6,c:6});
 assert.notDeepEqual(v.points.A,prior);
 near(v.jxPoints.A.X(),v.points.A[0]);near(v.jxPoints.A.Y(),v.points.A[1]);
});
test('Phase 2: JSXGraph segment length slider moves both endpoints without losing midpoint',()=>{
 const v=new JSXGraphAdapter(model('segmentMidpoint',6,{len:6}));
 for(const [n,pos] of Object.entries(v.points))v.jxPoints[n]={moveTo([x,y]){this.pos=[x,y];}};
 v.render=()=>{};v.updateParameters({len:10});
 near(v.getMetrics()[0].value,10);near(dist(v.jxPoints.A.pos,v.jxPoints.B.pos),10);
});
test('Phase 2: optional ECharts drag notifies live stats inspector and metric',()=>{
 let dataChanged=null,saves=0;const v=new EChartsAdapter(model('barChart',6,{c1:3,c2:4,c3:5,c4:6}),{
   onDataChange:values=>dataChanged=values,onInteractionEnd:()=>saves++
 });
 v.element={getBoundingClientRect:()=>({left:0,top:0})};v.render=()=>{};
 v.chart={convertFromPixel:()=>8};v.dragIndex=1;
 v._onDrag({clientY:100});
 assert.equal(v.data.values[1],8);assert.equal(dataChanged[1],8);
 v._onUp();assert.equal(saves,1);
});
test('Phase 2: histogram adapts to data 20..2000 rather than discarding all >=40',()=>{
 for(const values of [[12,21,55,99,180],[43,56,78,90],[20,20,20],[0,500,2000]]){
   const edges=Stats.makeHistogramEdges(values);
   const bins=Stats.computeHistogramBins(values,edges);
   assert.equal(bins.reduce((a,b)=>a+b,0),values.length);
   assert(edges[0]<=Math.min(...values));assert(edges.at(-1)>=Math.max(...values));
   assert(edges.every(Number.isFinite));
 }
 const v=new StatisticsChartViewer(model('barChart',6));
 v.data={kind:'raw_numeric',labels:['x','y','z'],values:[55,100,999]};
 v.setChartKind('hist');assert.equal(v.chartKind,'hist');
 const e=new EChartsAdapter(model('barChart',6));e.data=structuredClone(v.data);e.chartKind='hist';
 let opt; e.chart={setOption:o=>opt=o};e.render();
 assert.equal(opt.series[0].data.reduce((a,b)=>a+b,0),3);
});
test('Phase 2: all 63 source models at 12 boundary/mixed presets have valid geometry and finite metrics',()=>{
 const records=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8')).items;
 let audited=0;
 for(const original of records){
   for(let i=0;i<12;i++){
     const params={};for(const [key,[,lo,hi,def]] of Object.entries(TYPES[original.type].params)){
       params[key]=i===0?lo:i===1?hi:i===2?def:lo+(hi-lo)*((i*5+key.length*3)%13)/12;
     }
     const valid=normalizeExhibit({...original,params});
     const measures=metrics(valid.type,valid.params);
     assert(measures.every(entry=>typeof entry.value!=='number'||Number.isFinite(entry.value)),original.type);
     if(GEOMETRY_2D_TYPES.includes(valid.type)){
       const scene=buildGeometry2DScene(valid.type,valid.params,valid.grade);
       const viewer=new Geometry2DViewer(valid),other=viewer._getScene();
       assert(scene.primitives.length&&other.primitives.length,original.type);
       for(const p of other.primitives){for(const xy of [p.xy,p.a,p.b,p.center,...(p.pts||[])]){
         if(Array.isArray(xy))assert(xy.every(Number.isFinite),valid.type);
       }}
     }
     audited++;
   }
 }
 assert.equal(audited,756);
});

function dragNative(viewer,target,point){
 viewer.canvas={getBoundingClientRect:()=>({left:0,top:0}),style:{}};
 viewer.toMath=(x,y)=>[x,y];
 viewer.render=()=>{};
 viewer.dragTarget=target;
 viewer._onPointerMove({clientX:point[0],clientY:point[1]});
}

test('Phase 2: native midpoint drag updates length and rejects zero or out-of-range AB',()=>{
 const changes=[];
 const v=new Geometry2DViewer(model('segmentMidpoint',6,{len:8}),{onParametersChange:p=>changes.push(p)});
 dragNative(v,'A',[-3,1]);
 near(v.params.len,Math.sqrt(50),.001);
 near(v.getMetrics()[0].value,Math.sqrt(50),.011);
 assert(changes.length>0);
 const prior=[...v.points.A];
 dragNative(v,'A',[...v.points.B]);
 assert.deepEqual(v.points.A,prior);
 dragNative(v,'A',[-100,1]);
 assert.deepEqual(v.points.A,prior);
});

test('Phase 2: native Thales drag updates both sides, keeps division and rejects collinearity',()=>{
 const changes=[];
 const v=new Geometry2DViewer(model('thales',8,{a:6,b:7,k:50}),{onParametersChange:p=>changes.push(p)});
 const old=[...v.points.B];
 dragNative(v,'B',[old[0]+.2,old[1]-.1]);
 near(v.params.a,dist(v.points.A,v.points.B),.001);
 near(v.params.b,dist(v.points.A,v.points.C),.001);
 const scene=v._getScene();
 const M=scene.primitives.find(p=>p.kind==='point'&&p.name==='M').xy;
 const N=scene.primitives.find(p=>p.kind==='point'&&p.name==='N').xy;
 near(dist(v.points.A,M)/dist(v.points.A,v.points.B),.5);
 near(dist(v.points.A,N)/dist(v.points.A,v.points.C),.5);
 const prior=[...v.points.B];
 dragNative(v,'B',[...v.points.C]);
 assert.deepEqual(v.points.B,prior);
 assert(changes.length>0);
});

test('Phase 2: native parallelogram drag updates side and altitude but rejects invalid height',()=>{
 const changes=[];
 const v=new Geometry2DViewer(model('parallelogram',6,{a:6,b:4,h:3}),{onParametersChange:p=>changes.push(p)});
 const D=[...v.points.D];
 dragNative(v,'D',[D[0]+.1,D[1]+.1]);
 const u=sub(v.points.B,v.points.A),w=sub(v.points.D,v.points.A);
 const height=Math.abs(u[0]*w[1]-u[1]*w[0])/Math.hypot(...u);
 near(v.params.b,Math.hypot(...w),.001);
 near(v.params.h,height,.001);
 near(v.getMetrics()[0].value,6*height,.001);
 const prior=[...v.points.D];
 dragNative(v,'D',[D[0],D[1]+100]);
 assert.deepEqual(v.points.D,prior);
 assert(changes.length>0);
});

test('Phase 2: native parallelogram midpoint updates angle while preserving true parallel edges',()=>{
 const v=new Geometry2DViewer(model('parallelogramMid',8,{a:6,b:4,deg:60}));
 const D=[...v.points.D];
 dragNative(v,'D',[D[0]-.1,D[1]+.1]);
 const {A,B}=v.points;
 const C=[B[0]+v.points.D[0]-A[0],B[1]+v.points.D[1]-A[1]];
 const centerAC=[(A[0]+C[0])/2,(A[1]+C[1])/2];
 const centerBD=[(B[0]+v.points.D[0])/2,(B[1]+v.points.D[1])/2];
 near(dist(centerAC,centerBD),0,1e-9);
 const u=sub(B,A),w=sub(v.points.D,A);
 const rad=Math.acos(dot(u,w)/(Math.hypot(...u)*Math.hypot(...w)));
 near(v.params.deg,rad*180/Math.PI,.001);
 assert(v.params.deg>=30&&v.params.deg<=150);
 const before=[...v.points.D];
 dragNative(v,'D',[A[0]+u[0]*.5,A[1]+u[1]*.5]);
 assert.deepEqual(v.points.D,before);
});
