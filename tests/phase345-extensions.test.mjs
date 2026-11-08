import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../vendor/three.module.js';
import {obliqueSection,polyhedronEdges} from '../src/math/oblique-sections.js';
import {normalizeExhibit,metrics} from '../src/math-core.js';
import {GEOMETRY_2D_TYPES,buildGeometry2DScene} from '../src/math/geometry2d-scenes.js';
import {Stats} from '../src/math/stats.js';
import {createMathModel,disposeObject} from '../src/geometry.js';
import {EXPLORATION_MODELS,explorationsForGrade} from '../src/portal-labs/exploration-collection.js';
import {portalExhibits,zonesForGrade} from '../src/portal-labs/portal-registry.js';
import {SpecialtyLab} from '../src/portal-labs/SpecialtyLab.js';
import {Solid3DViewer} from '../src/viewers/Solid3DViewer.js';
import {FunctionGraphViewer} from '../src/viewers/FunctionGraphViewer.js';
import {StatisticsChartViewer} from '../src/viewers/StatisticsChartViewer.js';
import {ViewerRegistry} from '../src/viewers/ViewerRegistry.js';
import {supportsECharts} from '../src/viewers/EChartsAdapter.js';

const close=(actual,expected,tolerance=1e-7)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} != ${expected}`);
const raw=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8'));
const catalog=Array.isArray(raw)?raw:raw.items;

if(!globalThis.document){
 globalThis.document={createElement(){return {width:900,height:500,getContext(){return new Proxy({measureText:t=>({width:String(t).length*9})},{get:(obj,k)=>k in obj?obj[k]:()=>{}});}};}};
}

// Stage 3: actual plane/solid intersections, not a decorative moving square.
test('cube: horizontal center has exactly the true square area and perimeter',()=>{
 const s=obliqueSection('cube',{a:4},50,0);
 assert.equal(s.vertices.length,4);close(s.area,16);close(s.perimeter,16);
 s.vertices.forEach(v=>close(v[1],0));
});
test('cuboid: horizontal rectangle uses width, depth, not height',()=>{
 const s=obliqueSection('cuboid',{a:5,b:3,h:4},50,0);
 close(s.area,15);close(s.perimeter,16);
});
test('square pyramid: halfway cut has 1/4 base area',()=>{
 const s=obliqueSection('squarePyramid',{a:4,h:6},50,0);
 assert.equal(s.vertices.length,4);close(s.area,4);close(s.perimeter,8);
});
test('tilted cube section changes correctly with its plane inclination',()=>{
 const s=obliqueSection('cube',{a:4},50,30);
 close(s.area,16/Math.cos(Math.PI/6));close(s.perimeter,8+8/Math.cos(Math.PI/6));
 assert.ok(s.vertices.some(v=>Math.abs(v[1])>.1));
});
test('all section vertices satisfy plane equation and remain within body bounds',()=>{
 const examples=[['cube',{a:5}],['cuboid',{a:5,b:3,h:4}],['squarePyramid',{a:5,h:6}]];
 for(const [type,params] of examples)for(const pct of [1,7,25,50,75,93,99])for(const deg of [-65,-40,-10,0,10,40,65]){
   const s=obliqueSection(type,params,pct,deg),shape=polyhedronEdges(type,params);
   assert.ok(s&&shape&&Number.isFinite(s.area)&&Number.isFinite(s.perimeter));
   assert.ok(s.area>=0&&s.perimeter>=0);
   for(const vertex of s.vertices){
     close(vertex.reduce((acc,v,i)=>acc+v*s.normal[i],0),s.offset,2e-6);
     for(let i=0;i<3;i++){
       const low=Math.min(...shape.vertices.map(v=>v[i])),high=Math.max(...shape.vertices.map(v=>v[i]));
       assert.ok(vertex[i]>=low-1e-6&&vertex[i]<=high+1e-6);
     }
   }
 }
});
test('section rejects unsupported or invalid solids',()=>{
 assert.equal(obliqueSection('sphere',{r:2},50,10),null);
 assert.equal(polyhedronEdges('cube',{a:-3}),null);
 assert.equal(polyhedronEdges('cuboid',{a:3,b:0,h:4}),null);
});
test('Three.js holders expose correctly updated slanted polygon without replacing body',()=>{
 for(const [type,params] of [['cube',{a:4}],['cuboid',{a:5,b:3,h:4}],['squarePyramid',{a:4,h:6}]]){
   const body=createMathModel(normalizeExhibit({id:`t_${type}`,grade:11,title:'Kiểm thử',type,params}),{labels:false,faces:true,edges:true});
   try{
     assert.equal(body.supportsObliqueSection,true);
     const s=body.setObliqueSection(true,50,25);
     assert.ok(s.vertices.length>=3&&s.area>0);
     assert.equal(body.userData.obliqueSectionGroup.visible,true);
     close(body.userData.obliqueSectionGroup.userData.section.area,s.area);
     body.setObliqueSection(false,50,25);
     assert.equal(body.userData.obliqueSectionGroup.visible,false);
   }finally{disposeObject(body);}
 }
});
test('solid viewer provides section metrics in mathematical units',()=>{
 const v=new Solid3DViewer({id:'s',grade:11,type:'cube',params:{a:4}});
 v.meshGroup={supportsObliqueSection:true,setObliqueSection:(on,pct,deg)=>on?obliqueSection('cube',{a:4},pct,deg):null,setCrossSection:()=>null};
 v.setObliqueSection(true,50,0);
 const table=v.getMetrics();close(Number(table.find(x=>x.name==='Diện tích thiết diện').value),16);
 close(Number(table.find(x=>x.name==='Chu vi thiết diện').value),16);
 assert.equal(v.getState().obliqueEnabled,true);
});

// Stage 4: new non-destructive experiments and correct mathematical engines.
test('four supplemental types map to their appropriate native viewers',()=>{
 const lookup={polygonTiling:'geometry2d',transform2d:'geometry2d',unitCircleMotion:'geometry2d',boxPlot:'statisticschart'};
 for(const [type,modality] of Object.entries(lookup)){
   const m=normalizeExhibit({grade:10,type,params:{}});
   assert.equal(ViewerRegistry.getViewerClass(m).name,modality==='geometry2d'?'Geometry2DViewer':'StatisticsChartViewer');
 }
});
test('only regular triangle, square and hexagon are accepted as tilings',()=>{
 for(const n of [3,4,6])assert.equal(normalizeExhibit({grade:7,type:'polygonTiling',params:{n}}).params.n,n);
 for(const n of [3.5,4.5,5.5])assert.ok([3,4,6].includes(normalizeExhibit({grade:7,type:'polygonTiling',params:{n}}).params.n));
 const s=buildGeometry2DScene('polygonTiling',{n:3,side:1.1,rows:3});
 assert.equal(s.primitives.filter(p=>p.kind==='polygon').length,18);
 const angles=metrics('polygonTiling',{n:3}).find(x=>x.name==='Số góc tại một đỉnh');
 close(Number(angles.value),6);
});
test('2D transform preserves area ratio k² and edge-length ratio k',()=>{
 const p={deg:67,k:1.6,dx:2,dy:-1};
 const shapes=buildGeometry2DScene('transform2d',p).primitives.filter(p=>p.kind==='polygon');
 assert.equal(shapes.length,2);
 const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 close(distance(...shapes[1].pts.slice(0,2))/distance(...shapes[0].pts.slice(0,2)),1.6);
 close(metrics('transform2d',p).find(m=>m.name==='Tỉ số diện tích').value,2.56);
});
test('unit circle synchronized point matches sine curve at 90 and 270 degrees',()=>{
 for(const [deg,expected] of [[90,2],[270,-2]]){
   const p={deg,amp:2},scene=buildGeometry2DScene('unitCircleMotion',p);
   assert.ok(scene.primitives.find(x=>x.kind==='curve'));
   const P=scene.primitives.find(x=>x.kind==='point'&&x.name==='P');
   close(P.xy[1],expected);
   close(metrics('unitCircleMotion',p).find(m=>m.name==='Tung độ điểm trên đồ thị').value,expected);
 }
});
test('sine, exponential, derivative plots evaluate actual function formulas',()=>{
 const sin=new FunctionGraphViewer({type:'sine',params:{amp:2,freq:1}});
 close(sin.evaluate(Math.PI/2),2);
 assert.equal(sin.getMetrics().find(x=>x.name==='Biên độ').value,'2');
 const exp=new FunctionGraphViewer({type:'exponential',params:{a:2}});
 close(exp.evaluate(3),8);
 assert.equal(exp.getMetrics().find(x=>x.name==='Giá trị tại 0').value,'1');
 const der=new FunctionGraphViewer({type:'derivative',params:{a:1,b:3}});
 close(der.evaluate(2),2);
 assert.equal(der.getMetrics().find(x=>x.name==='Đạo hàm (đường cam)').value,'f′(x)=3x²−3');
});
test('function graph parameter updates remain normalized and change the real curve',()=>{
 const fn=new FunctionGraphViewer({id:'fn',grade:11,type:'sine',params:{amp:1,freq:1}});
 fn.updateParameters({amp:3,freq:2});
 close(fn.evaluate(Math.PI/4),3);
 const exp=new FunctionGraphViewer({id:'ex',grade:11,type:'exponential',params:{a:2}});
 exp.updateParameters({a:3});close(exp.evaluate(2),9);
});
test('quartiles: odd/even samples use the documented half-median convention',()=>{
 assert.deepEqual(Stats.fiveNumberSummary([5,4,3,2,1]),{min:1,q1:1.5,median:3,q3:4.5,max:5});
 assert.deepEqual(Stats.fiveNumberSummary([4,1,2,3]),{min:1,q1:1.5,median:2.5,q3:3.5,max:4});
 assert.equal(Stats.fiveNumberSummary([]),null);
});
test('box plots keep negative numeric observations and report correct IQR',()=>{
 const data={kind:'raw_numeric',values:[-5,-3,-2,0,1,3,7],labels:[]};
 const model=normalizeExhibit({id:'bx',grade:10,type:'boxPlot',data});
 assert.equal(model.data.values[0],-5);
 const viewer=new StatisticsChartViewer(model);
 assert.equal(viewer.chartKind,'box');
 assert.equal(viewer.getMetrics().find(x=>x.name==='IQR').value,'6');
 viewer.setDataValues([-4,-3,-1,0,4]);
 assert.equal(viewer.data.values[0],-4);
 assert.equal(supportsECharts(model),false);
});
test('categorical frequencies never become negative',()=>{
 const v=new StatisticsChartViewer({id:'bar',grade:7,type:'barChart'});
 v.setDataValues([-5,2,3,4]);assert.equal(v.data.values[0],0);
});
test('Grade7-12 duplicate supplementary exhibits archived, no false textbook exhibits in main gallery',()=>{
 assert.equal(EXPLORATION_MODELS.length,31);
 const ids=new Set(),types=[];
 for(let grade=7;grade<=12;grade++)for(const zone of zonesForGrade(grade)){
   const list=portalExhibits(catalog,grade,zone.id);
   assert.ok(list.length<=9);
   for(const entry of list.filter(x=>x.id.startsWith('mv_r4_'))){
     assert.equal(entry.grade,grade);assert.equal(entry.portalZone,zone.id);
     assert.ok(!ids.has(entry.id));ids.add(entry.id);types.push(entry.type);
   }
 }
 assert.equal(ids.size,0);
 assert.equal(EXPLORATION_MODELS.filter(x=>x.grade===7).length,4);
 for(const grade of [7,8,9,10,11,12])for(const zone of zonesForGrade(grade))assert.equal(portalExhibits(catalog,grade,zone.id).filter(x=>x.id.startsWith('mv_r4_')).length,0);
 assert.equal(EXPLORATION_MODELS.filter(x=>x.grade===12).length,6); // remains in source for recovery and optional studio mode
});
test('Math6 original 4 portals and 35 exhibits are not altered',()=>{
 const original=zonesForGrade(6);
 assert.equal(original.length,4);
 const byZone=original.map(z=>portalExhibits(catalog,6,z.id));
 assert.equal(byZone.flat().length,35);
 assert.ok(byZone.flat().every(x=>!String(x.id).startsWith('mv_r4_')));
 assert.equal(catalog.length,63);
});
test('supplemental lab saved state never collides with original source exhibit',()=>{
 const src='g10_01';
 const supp=new SpecialtyLab({model:{id:'mv_r4_10_graph_3',type:'sine',grade:10,supplemental:true,sourceExhibitId:src},zone:'graph'});
 const main=new SpecialtyLab({model:{id:src,type:'lineGraph',grade:10,sourceExhibitId:src},zone:'graph'});
 assert.notEqual(supp._storageKey(),main._storageKey());
});
test('all 31 gallery examples have mathematically defined dimensions, metrics and preview meshes',()=>{
 for(const sample of EXPLORATION_MODELS){
   const model=normalizeExhibit({id:'t',grade:sample.grade,type:sample.type,params:sample.params,data:sample.data});
   for(const result of metrics(model.type,model.params))if(typeof result.value==='number')assert.ok(Number.isFinite(result.value));
   if(GEOMETRY_2D_TYPES.includes(model.type)){
     const shapes=buildGeometry2DScene(model.type,model.params,model.grade);
     assert.ok(shapes.primitives.length>0,model.title);
   }
   const body=createMathModel(model,{faces:true,edges:true,labels:false});
   try{
     const bounds=new THREE.Box3().setFromObject(body);
     assert.ok(!bounds.isEmpty(),model.title);
     assert.ok(bounds.getSize(new THREE.Vector3()).toArray().every(Number.isFinite));
   }finally{disposeObject(body);}
 }
});

// Stage 5: budget frames under idle load and background tabs.
test('3D viewer throttles idle rendering but keeps responsive active rendering',()=>{
 const saved=globalThis.requestAnimationFrame;
 let requests=0,draws=0;
 globalThis.requestAnimationFrame=()=>++requests;
 const viewer=new Solid3DViewer({id:'render',grade:10,type:'cube',params:{a:3}});
 viewer.renderer={render:()=>draws++};viewer.scene={};viewer.camera={};
 const hadHidden=Object.prototype.hasOwnProperty.call(globalThis.document,'hidden');
 const savedHidden=globalThis.document.hidden;
 try{
   globalThis.document.hidden=false;
   viewer._animate(1);viewer._animate(10);viewer._animate(20);viewer._animate(36);
   assert.equal(draws,2);
   viewer.isDragging=true;
   viewer._animate(52);viewer._animate(56);viewer._animate(70);
   assert.equal(draws,3);
   globalThis.document.hidden=true;viewer._animate(150);
   assert.equal(draws,3);
 }finally{
   if(hadHidden)globalThis.document.hidden=savedHidden;else delete globalThis.document.hidden;
   if(saved===undefined)delete globalThis.requestAnimationFrame;else globalThis.requestAnimationFrame=saved;
 }
 assert.equal(requests,8);
});
