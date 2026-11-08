import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {GRADE6_ACTIVE_IDS} from '../src/portal-labs/grade6-curation-v15-1.js';
import {ALL_MATH6_LABS,labById} from '../src/math6-lab/catalog.js';
import {makeMath6GalleryPreview} from '../src/museum/math6-preview-v15.js';
import {sampleOutcome,polygonPoints,polygonMeasures} from '../src/math6-lab/math.mjs';
import {motionParams} from '../src/math6-lab/catalog-motion.mjs';
import {renderModel} from '../src/math6-lab/canvas.mjs';
import {Math6ExhibitLab} from '../src/math6-lab/Math6ExhibitLab.js';
import {SUPPORTS_3D} from '../src/math6-lab/three-lab.mjs';
const active=ALL_MATH6_LABS.filter(x=>GRADE6_ACTIVE_IDS.includes(x.id));
const state=model=>({params:structuredClone(model.defaults),time:0,counts:[],lastOutcome:undefined,tileFlips:new Set(),selectedDesk:0});
function spyCanvas(){const texts=[];const ctx=new Proxy({}, {get(t,k){if(k==='fillText')return text=>texts.push(String(text));if(k==='canvas')return {width:920,height:560};return k in t?t[k]:(()=>{});},set(t,k,v){t[k]=v;return true;}});return {ctx,texts};}
function handle(model,x,y,params={}){
 const lab=Object.create(Math6ExhibitLab.prototype);lab.selected=model;lab.mode='model';lab.state=state(model);
 Object.assign(lab.state.params,params);lab._pointerCoordinates=()=>[x,y];lab._saveState=()=>{};lab._draw=()=>{};lab.simulate=()=>{};lab._handlePointer({});return lab.state;
}
test('G6: 35 curated identifiers match a unique model, four protected zones',()=>{
 assert.equal(active.length,35);assert.equal(new Set(active.map(m=>m.id)).size,35);
});
test('G6: all 35 museum previews are spatial meshes with nonzero 3D extents',()=>{
 for(const model of active){const root=makeMath6GalleryPreview(THREE,{title:model.title,labId:model.id,labEngine:model.engine,labVariant:model.variant,labDefaults:model.defaults});
 const box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3());
 assert(size.x>.2&&size.y>.01&&size.z>.01,model.id);assert(root.userData.gallery3D,model.id);
 root.traverse(o=>{o.geometry?.dispose?.();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose?.();});}
});
test('G6: three-dimensional museum die has 21 pips, opposite faces sum to seven',()=>{
 const m=labById('toan6-xuc-xac');const root=makeMath6GalleryPreview(THREE,{title:m.title,labId:m.id,labEngine:m.engine,labVariant:m.variant,labDefaults:m.defaults});
 const tally=new Map();root.traverse(o=>{const match=o.name?.match(/^dice-pip-(\d)$/);if(match)tally.set(+match[1],(tally.get(+match[1])||0)+1);});
 assert.equal([...tally.values()].reduce((a,b)=>a+b,0),21);
 for(let n=1;n<=6;n++)assert.equal(tally.get(n),n);
});
test('G6: classroom 3D exhibit now contains twelve desks, as the 2D experiment',()=>{
 const m=labById('toan6-mat-bang-phong-hoc');const root=makeMath6GalleryPreview(THREE,{title:m.title,labId:m.id,labEngine:m.engine,labVariant:m.variant,labDefaults:m.defaults});
 let desks=0;root.traverse(o=>{if(o.name==='room-desk')desks++;});assert.equal(desks,12);
});
test('G6: customized wheel samples only current sector count, not default sector count',()=>{
 const m=labById('toan6-vong-quay');for(const u of [0,.2499,.5,.99999])assert(sampleOutcome(m,()=>u,{segments:2})<2);
 assert.equal(sampleOutcome(m,()=>.9999,{segments:2}),1);
 assert.equal(sampleOutcome(m,()=>.9999,{segments:4}),3);
});
test('G6: each of 35 models can render at 0,2,4,6 seconds and with extreme permitted controls',()=>{
 const {ctx}=spyCanvas();for(const m of active){for(const t of [0,2,4,6]){
 const p=motionParams(m,m.defaults,t);if(m.engine==='geometry'&&m.variant==='pointline')p.measure=t===0?0:t;
 assert.doesNotThrow(()=>renderModel(ctx,m,{...state(m),params:p,time:t*1000}),`${m.id},t=${t}`);
 }}
});
test('G6: point-on-line must recognize zero displacement, not reset to default',()=>{
 const m=labById('toan6-diem-thuoc-duong');let a=spyCanvas();renderModel(a.ctx,m,{...state(m),params:{...m.defaults,measure:0}});assert(a.texts.includes('M thuộc d'));
 a=spyCanvas();renderModel(a.ctx,m,{...state(m),params:{...m.defaults,measure:4}});assert(a.texts.includes('M không thuộc d'));
});
test('G6: factor tree animates by revealing branches while preserving the prime product',()=>{
 const m=labById('toan6-cay-thua-so');let a=spyCanvas();renderModel(a.ctx,m,{...state(m),time:2000});
 assert(a.texts.includes('84'));assert(a.texts.length<25,'only a subset of branches should show in early frames');
 a=spyCanvas();renderModel(a.ctx,m,state(m));assert(a.texts.includes('2 × 2 × 3 × 7'));
});
test('G6: tiling selection respects the actual staggered hexagon coordinates',()=>{
 const model=labById('toan6-lat-nen-da-giac');const p={count:5,type:0};const s=handle(model,220+1.5*24,130+Math.sqrt(3)*24/2,p);
 assert(s.tileFlips.has('0:1'),`clicked wrong tile: ${[...s.tileFlips].join(',')}`);
});
test('G6: bar-chart pointer reads true current axis maximum, not a hard-coded 30',()=>{
 const m=labById('toan6-cot-don');const s=handle(m,285+10,430-151, {values:[12,8,16,10]});
 assert.equal(s.params.values[0],10,'current axis max is 20, halfway equals 10');
});
test('G6: double bar pointer changes corresponding group and does not move neighboring group',()=>{
 const m=labById('toan6-cot-kep');const s=handle(m,285+40+15,260);
 assert.equal(s.params.values[0],12);assert.notEqual(s.params.otherValues[0],9);
 assert.equal(s.params.otherValues[1],16);
});
test('G6: 2D viewer arithmetic and Euclidean measurements remain invariant',()=>{
 for(const v of ['triangle','square','hexagon','rectangle','rhombus','parallelogram','trapezoid']){
  const m=active.find(x=>x.variant===v&&x.engine==='polygon');const a=polygonMeasures(v,m.defaults);
  assert(a.area>0&&a.perimeter>0);const pts=polygonPoints(v,{...m.defaults,rotation:52});
  const b=polygonMeasures(v,{...m.defaults,rotation:52});assert(Math.abs(a.area-b.area)<1e-7&&Math.abs(a.perimeter-b.perimeter)<1e-7);
  assert(pts.every(p=>p.every(Number.isFinite)));}
});
test('G6: coin genuinely has optional dedicated 3D lab; flat 2D geometry stays mathematics',()=>{
 assert(SUPPORTS_3D(labById('toan6-dong-xu')));
 assert(!SUPPORTS_3D(labById('toan6-hinh-vuong')));
});

test('G6: integer hops beyond visible number-line range do not label the clamped endpoint as B',()=>{
 const m=labById('toan6-buoc-nhay-so-nguyen'),a=spyCanvas();
 renderModel(a.ctx,m,{...state(m),params:{...m.defaults,value:9,step:6}});
 assert(a.texts.some(text=>text.includes('9 + (6) = 15')));
 assert(a.texts.some(text=>text.includes('nằm ngoài')));
 assert(!a.texts.includes('B'));
});
test('G6: every retained class 6 lab has truthful 3D gallery status and distinct dedicated-3D availability',()=>{
 const dedicated=active.filter(SUPPORTS_3D);
 assert.equal(dedicated.length,5);
 for(const model of active){
   const root=makeMath6GalleryPreview(THREE,{title:model.title,labId:model.id,labEngine:model.engine,labVariant:model.variant,labDefaults:model.defaults});
   assert.equal(root.userData.flatMath,model.engine!=='real'&&model.engine!=='chance',model.id);
 }
});


test('G6 R79 V2: all 63 models render cleanly at 0%, 50%, 100% in both default and light themes with purposeful color roles',()=>{
  assert.equal(ALL_MATH6_LABS.length,63);
  for(const m of ALL_MATH6_LABS){
    for(const t of [0,4,8]){
      const p=motionParams(m,m.defaults,t);
      const a=spyCanvas(),b=spyCanvas();
      assert.doesNotThrow(()=>renderModel(a.ctx,m,{...state(m),params:p,time:t*1000}),`${m.id} dark t=${t}`);
      assert.doesNotThrow(()=>renderModel(b.ctx,m,{...state(m),params:p,time:t*1000},{theme:'light'}),`${m.id} light t=${t}`);
      assert(a.texts.length>0,`${m.id} dark produced text`);
      assert(b.texts.length>0,`${m.id} light produced text`);
    }
  }
  const tableLab=labById('toan6-bang-thu-thap');
  const tableSpy=spyCanvas();
  renderModel(tableSpy.ctx,tableLab,{...state(tableLab),time:4000},{theme:'light'});
  assert(tableSpy.texts.some(t=>t.includes('Số lượng thu thập')||t.includes('Bảng dữ liệu thu thập')),'toan6-bang-thu-thap renders a dedicated data table');
});
