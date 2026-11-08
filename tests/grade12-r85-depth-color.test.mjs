import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from '../vendor/three.module.js';
import {createMathModel,disposeObject} from '../src/geometry.js';
import {
 GRADE12_CUSTOM_IDS,
 R85_PALETTE,
 monotoneProgress,
 stageIndexFromProgress,
 formatCanonicalLine,
 grade12Defaults,
 grade12Valid,
 grade12Math,
 grade12Is3D,
 grade12SolidModel,
 grade12AnimatedParams,
 grade12Optimization,
 grade12Grouped,
 grade12Volume,
 grade12Bayes
} from '../src/curriculum/grade12-engine.mjs';
import {grade12SceneSVG,grade12SpatialSVG} from '../src/curriculum/grade12-svg.mjs';
import {isGraphCase,graphDefaults,graphExperiment} from '../src/curriculum/graph-models.mjs';
import {createModeExhibit} from '../src/museum/r67-mode-exhibits.mjs';

if(!globalThis.document){
 globalThis.document={createElement:()=>({width:128,height:128,getContext:()=>new Proxy({measureText:s=>({width:String(s).length*8})},{get:(o,k)=>k in o?o[k]:()=>{}})})};
}

const root=new URL('../',import.meta.url);
const raw=p=>fs.readFileSync(new URL(p,root));
const catalog=JSON.parse(raw('data/catalog.json')).items;
const curriculum=JSON.parse(raw('data/mathverse-7-12-curated.json'));
const families12=curriculum.source_registry.filter(f=>f.grade===12);
const modes12=families12.flatMap(f=>f.modes);
const exhibits12=catalog.filter(x=>Number(x.grade)===12);
const svgIds=modes12.map(x=>x.id).filter(id=>GRADE12_CUSTOM_IDS.includes(id)&&!grade12Is3D(id));
const solidIds=modes12.map(x=>x.id).filter(grade12Is3D);
const graphIds=modes12.map(x=>x.id).filter(isGraphCase);

test('R85 Gate 1: Danh mục 48 mục Toán 12 (39 Lab + 9 Hiện vật) và bất biến SHA-256 dữ liệu gốc',()=>{
 assert.equal(families12.length,11);
 assert.equal(modes12.length,39);
 assert.equal(svgIds.length,10);
 assert.equal(graphIds.length,10);
 assert.equal(solidIds.length,19);
 assert.equal(exhibits12.length,9);
 assert.equal(exhibits12.filter(x=>['revolvedSolid','oxyzSphere'].includes(x.type)).length,2);
 const shaCatalog=crypto.createHash('sha256').update(raw('data/catalog.json')).digest('hex');
 const shaToan6=crypto.createHash('sha256').update(raw('data/models.toan6.json')).digest('hex');
 assert.equal(shaCatalog,'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15');
 assert.equal(shaToan6,'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9');
 for(const id of ['12-07-C02','12-10-C03']){
  const m=modes12.find(x=>x.id===id);
  assert.equal(m?.display_status,'EXTENSION',`${id} must remain EXTENSION`);
 }
});

test('R85 Gate 2: Bảng màu ngữ nghĩa R85 và hàm tiến trình đơn điệu 4 cảnh (giữ trạng thái ở 100%)',()=>{
 assert.equal(R85_PALETTE.origin,'#1D4ED8');
 assert.equal(R85_PALETTE.compare,'#15803D');
 assert.equal(R85_PALETTE.active,'#C2410C');
 assert.equal(R85_PALETTE.result,'#7C3AED');
 assert.equal(R85_PALETTE.aux,'#64748B');
 assert.equal(R85_PALETTE.invalid,'#B91C1C');
 assert.equal(R85_PALETTE.axes.Ox,'#9A3412');
 assert.equal(R85_PALETTE.axes.Oy,'#15803D');
 assert.equal(R85_PALETTE.axes.Oz,'#1D4ED8');
 assert.equal(monotoneProgress(0,6),0);
 assert.equal(monotoneProgress(3,6),0.5);
 assert.equal(monotoneProgress(6,6),1);
 assert.equal(monotoneProgress(9,6),1,'Must hold steady at 100% when t > duration');
 assert.equal(stageIndexFromProgress(0),1);
 assert.equal(stageIndexFromProgress(0.35),2);
 assert.equal(stageIndexFromProgress(0.65),3);
 assert.equal(stageIndexFromProgress(1),4);
});

test('R85 Gate 3: 10 Lab SVG 2D biến đổi đơn điệu 0% → 50% → 100%, giữ kết quả tại 100% và áp dụng màu R85',()=>{
 for(const id of svgIds){
  const p=grade12Defaults(id);
  const s0=grade12SceneSVG(id,p,0);
  const s50=grade12SceneSVG(id,p,3);
  const s100=grade12SceneSVG(id,p,6);
  const sHold=grade12SceneSVG(id,p,9);
  assert.notEqual(s0,s50,`${id}: 0% and 50% must differ`);
  assert.notEqual(s50,s100,`${id}: 50% and 100% must differ`);
  assert.equal(s100,sHold,`${id}: 100% must hold steady without wrapping back to 0%`);
  assert.match(s0,/Cảnh 1\/4/);
  assert.match(s100,/Cảnh 4\/4/);
  assert.match(s100,/#1D4ED8/i,`${id} missing origin color #1D4ED8`);
  assert.match(s100,/#7C3AED/i,`${id} missing result color #7C3AED`);
  assert.doesNotMatch(s0+s50+s100,/NaN|Infinity|undefined|<script/i);
 }
 // 12-11-C01..C04 must have distinct mode-specific visual strips
 const pBayes=grade12Defaults('12-11-C01');
 const b1=grade12SceneSVG('12-11-C01',pBayes,6);
 const b2=grade12SceneSVG('12-11-C02',pBayes,6);
 const b3=grade12SceneSVG('12-11-C03',pBayes,6);
 const b4=grade12SceneSVG('12-11-C04',pBayes,6);
 assert.equal(new Set([b1,b2,b3,b4]).size,4,'12-11-C01..C04 must be visually distinct');
});

test('R85 Gate 4: 19 Lab WebGL 3D + Sơ đồ 2D đồng bộ biến đổi 0% → 50% → 100% và giữ tại 100%',()=>{
 for(const id of solidIds){
  const p=grade12Defaults(id);
  const m0=grade12SolidModel(id,p,0);
  const m50=grade12SolidModel(id,p,3);
  const m100=grade12SolidModel(id,p,6);
  const mHold=grade12SolidModel(id,p,9);
  assert.notDeepEqual(m0.params,m50.params,`${id}: 3D params 0% vs 50% must differ`);
  assert.notDeepEqual(m50.params,m100.params,`${id}: 3D params 50% vs 100% must differ`);
  assert.deepEqual(m100.params,mHold.params,`${id}: 3D params at 100% must hold steady`);

  const sv0=grade12SpatialSVG(id,grade12AnimatedParams(id,p,0),0);
  const sv50=grade12SpatialSVG(id,grade12AnimatedParams(id,p,3),3);
  const sv100=grade12SpatialSVG(id,grade12AnimatedParams(id,p,6),6);
  const svHold=grade12SpatialSVG(id,grade12AnimatedParams(id,p,9),9);
  assert.notEqual(sv0,sv50,`${id}: spatial SVG 0% vs 50% must differ`);
  assert.notEqual(sv50,sv100,`${id}: spatial SVG 50% vs 100% must differ`);
  assert.equal(sv100,svHold,`${id}: spatial SVG must hold steady at 100%`);
  assert.match(sv100,/Cảnh 4\/4/);
 }
 assert.match(grade12SpatialSVG('12-07-C02',grade12Defaults('12-07-C02'),6),/\[MỞ RỘNG\]/);
 assert.match(grade12SpatialSVG('12-10-C03',grade12Defaults('12-10-C03'),6),/\[MỞ RỘNG\]/);
});

test('R85 Gate 5: 10 Lab Đồ thị hàm số 2D áp dụng bảng màu R85 và xử lý đúng điểm uốn, cực trị, điểm khuyết, tích phân',()=>{
 for(const id of graphIds){
  const g=graphExperiment(id,graphDefaults(id));
  assert.equal(g.series[0].color,'#1D4ED8',`${id} primary curve must use #1D4ED8`);
 }
 // 12-02-C01: Cubic inflection point U(-b/3a, f(U))
 const gCubic=graphExperiment('12-02-C01',{a:1,b:-3,c:0,d:2});
 assert.ok(gCubic.markers.some(m=>m.name.includes('U')&&Math.abs(m.x-1)<1e-6&&Math.abs(m.y-0)<1e-6&&m.color==='#7C3AED'));
 // 12-02-C02: Removable discontinuity when ad - bc = 0 vs vertical asymptote when ad - bc != 0
 const gRem=graphExperiment('12-02-C02',{a:2,b:4,c:1,d:2});
 assert.equal(gRem.asymptotes.length,1);
 assert.equal(gRem.asymptotes[0].type,'horizontal');
 assert.ok(gRem.markers.some(m=>m.name.includes('Điểm khuyết')&&m.color==='#B91C1C'));
 const gHyp=graphExperiment('12-02-C02',{a:2,b:1,c:1,d:-1});
 assert.equal(gHyp.asymptotes.length,2);
 assert.ok(gHyp.markers.some(m=>m.name.includes('Tâm I')&&m.color==='#7C3AED'));
 // 12-06-C03: Area between curves y=x and y=x^2
 const gArea=graphExperiment('12-06-C03',{n:12});
 assert.match(gArea.latex,/\\int_0\^1 \|x-x\^2\|/);
 assert.equal(gArea.markers.filter(m=>m.color==='#7C3AED').length,2);
});

test('R85 Gate 6: Phương trình chính tắc đường thẳng Oxyz xử lý u_i = 0 không chia cho 0',()=>{
 assert.equal(formatCanonicalLine([1,2,3],[2,0,-1]),'(x - 1)/2 = (z - 3)/-1 ; y = 2');
 assert.equal(formatCanonicalLine([0,-2,1],[0,3,0]),'(y + 2)/3 ; x = 0, z = 1');
 const m=grade12Math('12-09-C01',{vx:1,vy:2,vz:3,ux:0,uy:2,uz:-1});
 assert.ok(!m.result.canonical.includes('/0'),'Canonical form must never divide by 0');
 assert.ok(m.result.canonical.includes('x = 1'));
});

test('R85 Gate 7: 9 Hiện vật Toán 12 và pedestal 3D tạo mesh thật với bảng màu R85',()=>{
 for(const ex of exhibits12){
  const group=createMathModel(ex,{faces:true,edges:true,labels:true});
  try{
   let meshes=0;
   group.traverse(o=>{if(o.isMesh)meshes++;});
   assert.ok(meshes>=1,`${ex.id} must have real Three.js meshes`);
   const box=new THREE.Box3().setFromObject(group);
   assert.ok(!box.isEmpty(),`${ex.id} bounding box must not be empty`);
  }finally{
   disposeObject(group);
  }
 }
 for(const mode of modes12){
  const ped=createModeExhibit(12,mode);
  let meshes=0;
  ped.traverse(o=>{if(o.isMesh)meshes++;});
  assert.ok(meshes>=1,`Pedestal exhibit for ${mode.id} must have meshes`);
 }
});

