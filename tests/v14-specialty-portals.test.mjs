import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PORTAL_ZONES,zonesForGrade,PORTAL_LAYOUT,portalExhibits,zoneForModel,portalCounts,gradePortalLabs,labZoneForMath6} from '../src/portal-labs/portal-registry.js';
import {SymmetryMotionCanvas,symmetryFold,rotateAround,centralCoincidence} from '../src/portal-labs/symmetry-motion.js';
import {SpecialtyLab} from '../src/portal-labs/SpecialtyLab.js';
import {buildPresets} from '../src/studio/presets.js';
import {migrateItemToV5,detectModality} from '../src/data/migrate-v2-v4-v5.js';
import {TOAN6_LAB_MODELS,ALL_MATH6_LABS} from '../src/math6-lab/catalog.js';
import {grade6ArchivedLabs} from '../src/portal-labs/grade6-v15.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8')).items.map(migrateItemToV5);
const eps=1e-8;
const near=(a,b)=>assert.ok(Math.abs(a-b)<eps,`${a} not equal ${b}`);
const copy=a=>JSON.stringify(a);
test('V14 keeps all seven grades, original 63 models, 42 templates and 60 grade6 laboratory experiments',()=>{
  assert.equal(catalog.length,63);assert.deepEqual([...new Set(catalog.map(i=>i.grade))].sort((a,b)=>a-b),[6,7,8,9,10,11,12]);
  assert.equal(buildPresets(catalog).length,42);assert.equal(TOAN6_LAB_MODELS.length,60);
  assert.deepEqual(PORTAL_ZONES.map(z=>z.id),['plane','solid','graph','stats','real']);
});
test('Four subject-led grade6 portals, five preserved in every other grade',()=>{
  const signature=copy(catalog);
  for(let grade=6;grade<=12;grade++){
    const counts=portalCounts(catalog,grade);assert.equal(counts.length,grade===6?4:5);
    for(const zone of zonesForGrade(grade)){
      const items=portalExhibits(catalog,grade,zone.id);
      assert.ok(items.length>0||((grade===7&&zone.id==='graph')||([8,9].includes(grade)&&zone.id==='stats')||(grade===10&&['solid','stats'].includes(zone.id))||(grade===11&&['plane','graph','stats'].includes(zone.id))||(grade===12&&['plane','stats'].includes(zone.id))),grade+zone.id);
      assert.ok(items.length<=(grade===6?19:9),grade+zone.id);
      assert.equal(new Set(items.map(i=>i.id)).size,items.length);
      for(const item of items){
        assert.equal(item.grade,grade);assert.equal(zoneForModel(item),zone.id);
        if(item.supplemental)assert.ok(item.sourceExhibitId,`missing supplemental source ${grade}/${zone.id}`);
      }
    }
  }
  assert.equal(copy(catalog),signature,'Portal views must not mutate core exhibit catalog');
});
test('Missing grade-specific graphs or charts display marked demonstration instead of false SGK claim',()=>{
  const chart=portalExhibits(catalog,9,'stats');
  const g9Original=catalog.filter(m=>m.grade===9&&detectModality(m.type)==='statisticschart');
  if(!g9Original.length){assert.equal(chart.length,0,'Không tạo hình biểu đồ giả chỉ để lấp cổng; Lab thống kê Toán 9 ở kho chuyên đề');}
});
test('Curated 35 Math6 gallery labs occupy one portal each, and the 63 originals remain archived',()=>{
  const ids=new Set();
  for(const zone of zonesForGrade(6)){
    for(const lab of gradePortalLabs(6,zone.id)){
      assert.equal(labZoneForMath6(lab),zone.id);assert.ok(!ids.has(lab.id),lab.id);ids.add(lab.id);
    }
  }
  assert.equal(ids.size,35); // 35 high-value 3D galleries, 28 retained in archive.
  assert.equal(grade6ArchivedLabs().length,28);
  assert.equal(ALL_MATH6_LABS.length,63);
  assert.ok(TOAN6_LAB_MODELS.every(lab=>ALL_MATH6_LABS.includes(lab)));
});
test('Plinth layouts are valid, non-overlapping, and aligned with the 9 physical showcases',()=>{
  for(let n=1;n<=9;n++){
    const layout=PORTAL_LAYOUT[n];assert.equal(layout.length,n);assert.ok(layout.every(i=>Number.isInteger(i)&&i>=0&&i<=8));
    assert.equal(new Set(layout).size,n);
  }
});
test('Axial symmetry fold lands precisely on the stationary half',()=>{
  const stationary=[[-2,-1],[-1,2],[0,0]];
  const reflected=stationary.map(([x,y])=>[-x,y]);
  const endpoint=symmetryFold(reflected,1);
  for(let i=0;i<stationary.length;i++)endpoint[i].forEach((v,j)=>near(v,stationary[i][j]));
  const initial=symmetryFold(reflected,0);initial.forEach((p,i)=>near(p[0],reflected[i][0]));
});
test('Central symmetry is a genuine 180-degree rotation around a center',()=>{
  const shape=[[2,1],[1,3],[4,0]];
  const initial=centralCoincidence(shape,0),finish=centralCoincidence(shape,1);
  for(let i=0;i<shape.length;i++){
    near(initial[i][0],-shape[i][0]);near(initial[i][1],-shape[i][1]);
    near(finish[i][0],shape[i][0]);near(finish[i][1],shape[i][1]);
  }
  assert.deepEqual(rotateAround([[4,3]],Math.PI,[1,1]).map(p=>p.map(Math.round)),[[-2,-1]]);
});
test('Symmetry Canvas enables valid fold/half-turn modes per exhibit, without unavailable mode default',()=>{
  const mk=type=>new SymmetryMotionCanvas({type,params:{a:4,b:3,n:6}});
  assert.deepEqual(mk('parallelogram').motions,['center']);assert.equal(mk('parallelogram').axis,false);
  assert.deepEqual(mk('symmetryAxis').motions,['axis']);assert.equal(mk('symmetryAxis').axis,true);
  assert.deepEqual(mk('rhombus').motions,['axis','center']);
  const odd=new SymmetryMotionCanvas({type:'polygon',params:{n:5}});assert.deepEqual(odd.motions,['axis']);
});
test('Specialty graph coefficient adapter respects catalog y=ax+b and graphViewer internal coefficient keys',()=>{
  const lab=Object.create(SpecialtyLab.prototype);lab.model={type:'linearSlope'};
  assert.deepEqual(lab._nativeGraphPatch('a',2),{b:2});assert.deepEqual(lab._nativeGraphPatch('b',3),{c:3});
  lab.model={type:'parabola'};assert.deepEqual(lab._nativeGraphPatch('a',2),{a:2});
});
test('Specialist engines have distinct canvas and saved-state isolation per subject zone',()=>{
  const lab=Object.create(SpecialtyLab.prototype);lab.model={grade:8,id:'g8_01'};
  const keys=PORTAL_ZONES.map(z=>{lab.zone=z.id;return lab._storageKey();});
  assert.equal(new Set(keys).size,5);
  assert.ok(fs.existsSync(new URL('../src/portal-labs/portal-labs.css',import.meta.url)));
  const shell=fs.readFileSync(new URL('../src/ui/LabShell.js',import.meta.url),'utf8');
  assert.match(shell,/_enterSpecialtyLab\(/);assert.match(shell,/_renderSpecialtyList\(/);
});

test('Real-world 2.5D companion chooses meaningful applications and preserves 3D base engine',async()=>{
  const {RealWorldCompanion,realWorldCategory}=await import('../src/portal-labs/RealWorldCompanion.js');
  assert.equal(realWorldCategory({type:'cylinder',title:'Lọ nước'}),'can');
  assert.equal(realWorldCategory({type:'sphere',title:'Quả bóng'}),'ball');
  assert.equal(realWorldCategory({type:'squarePyramid',title:'Mái tháp'}),'roof');
  const obj=new RealWorldCompanion({type:'cylinder'});assert.equal(obj.category,'can');
  obj.setProgress(.7);assert.equal(obj.progress,.7);obj.setScale(5);assert.equal(obj.scale,1.7);
});
test('Linear graph restore updates internal slope and intercept, never overwrites math source',()=>{
  const patch=[];const lab=Object.create(SpecialtyLab.prototype);lab.model={type:'linearSlope'};
  lab.nativeParams={a:3,b:-2};lab.viewer={updateParameters:x=>patch.push(x)};
  lab._restoreNativeParams();assert.deepEqual(patch,[{b:3,c:-2}]);
});
test('Dragging a stats bar updates its own value and preserves others without runaway scaling',()=>{
  const listeners={};const canvas={addEventListener:(name,callback)=>listeners[name]=callback,removeEventListener:()=>{},getBoundingClientRect:()=>({left:0,top:0}),setPointerCapture:()=>{}};
  const lab=Object.create(SpecialtyLab.prototype);lab.playing=false;lab.pause=()=>{};lab.disposers=[];lab.chartOriginal=[10,20,30];lab._updateOutputs=()=>{};lab._save=()=>{};
  lab.viewer={canvas,chartKind:'bar',width:400,height:300,data:{values:[10,20,30]},setDataValues(values){this.data.values=values;}};
  lab._attachStatsDrag();assert.ok(listeners.pointerdown&&listeners.pointermove);
  listeners.pointerdown({clientX:120,clientY:168,pointerId:1});assert.equal(lab.viewer.data.values[0]>=0,true);
  listeners.pointermove({clientX:120,clientY:90,pointerId:1});assert.equal(lab.viewer.data.values[1],20);
  assert.equal(lab.viewer.data.values[2],30);listeners.pointerup({});
});
test('Portal HTML includes keyboard accessible five zone buttons and a Math6 drawer',()=>{
  const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
  for(const name of ['mv14-portal-hub','mv14-portal-state','mv14-portal-buttons','mv14-portal-back','mv14-math6-drawer','mv14-math6-browse'])assert.ok(html.includes(`id="${name}"`),name);
  const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');assert.match(main,/onPortalChange:showPortalHud/);
  const museum=fs.readFileSync(new URL('../src/museum.js',import.meta.url),'utf8');assert.match(museum,/function enterPortal\(zone\)/);
  assert.match(museum,/zonesForGrade/);
});
test('Editable symmetry dimensions and selected motion mode persist separately from original model data',()=>{
 const storage=new Map(),original=globalThis.localStorage;
 globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,v)=>storage.set(key,v)};
 try{
  const model=catalog.find(x=>x.type==='rhombus');assert.ok(model);
  const lab=new SpecialtyLab({model,zone:'plane'});lab.mode='model';
  lab.symmetry={progress:.65,axis:false,length:7.2,height:5.4};lab._save();
  const saved=JSON.parse(storage.get(lab._storageKey()));
  assert.deepEqual(saved.symmetryDimensions,{length:7.2,height:5.4});
  assert.equal(saved.motionMode,'center');assert.equal(saved.fold,.65);
  assert.equal(JSON.stringify(catalog.find(x=>x.id===model.id)),JSON.stringify(model));
 }finally{globalThis.localStorage=original;}
});
