import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  FOLD_NET_CATALOG,
  R87_MUSEUM_PLACEMENT,
  EXTENDED_MUSEUM_MODE_TO_FOLD_NET,
  getFoldNetPlacement,
  getFoldNetForModeId,
  getNewFoldNetExhibitsForRoom,
  getFoldNetParamSchema,
  computeFoldNetFormulas,
  createFoldNetExhibit
} from '../src/museum/fold-net/index.mjs';
import {createMuseumFoldGroup} from '../src/museum/fold-net/museum-bridge.mjs';
import {polySurfaceArea,polySolidVolume} from '../src/museum/fold-net/geometry-models.mjs';
import {createModeExhibit} from '../src/museum/r67-mode-exhibits.mjs';

const almost=(a,b,eps=1e-7)=>Math.abs(a-b)<=eps*Math.max(1,Math.abs(a),Math.abs(b));
function area(poly){let s=0;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];s+=a[0]*b[1]-a[1]*b[0];}return s/2;}
function intersectPolygon(subject, clip){
 let points=[...subject];const sign=area(clip)>=0?1:-1;
 const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
 for(let i=0;i<clip.length;i++){
  const A=clip[i],B=clip[(i+1)%clip.length], input=points;points=[];
  if(!input.length)break;
  for(let j=0;j<input.length;j++){
   const P=input[j],Q=input[(j+1)%input.length],f=sign*cross(A,B,P),g=sign*cross(A,B,Q);
   const pin=f>=-1e-10,qin=g>=-1e-10;
   if(pin&&qin)points.push(Q);
   else if(pin&&!qin){const t=f/(f-g);points.push([P[0]+t*(Q[0]-P[0]),P[1]+t*(Q[1]-P[1])]);}
   else if(!pin&&qin){const t=f/(f-g);points.push([P[0]+t*(Q[0]-P[0]),P[1]+t*(Q[1]-P[1])],Q);}
  }
 }
 return points.length>=3?Math.abs(area(points)):0;
}

test('R87 catalog: exactly 20 source cases, stable distinct IDs, 17 polyhedra + 3 curved surfaces',()=>{
 assert.equal(FOLD_NET_CATALOG.length,20);
 assert.equal(new Set(FOLD_NET_CATALOG.map(x=>x.id)).size,20);
 assert.deepEqual(FOLD_NET_CATALOG.map(x=>x.notebookIndex),Array.from({length:20},(_,i)=>i+1));
 assert.equal(FOLD_NET_CATALOG.filter(x=>x.shapeKind==='polyhedron').length,17);
 assert.equal(FOLD_NET_CATALOG.filter(x=>x.shapeKind==='curved').length,3);
 for(const d of FOLD_NET_CATALOG){assert.equal(d.storyboard.length,4);assert.ok(d.grades.every(n=>n>=6&&n<=12));}
});

for(const d of FOLD_NET_CATALOG){
 test(`R87 ${d.notebookIndex}: ${d.id} (fold/unfold geometry, colors, timeline)`,()=>{
  const x=createFoldNetExhibit(d.id);
  assert.equal(x.id,d.id);
  assert.equal(x.timeline.progress,0,'must not appear fully folded on creation');
  const flat=x.getDiagnostic();
  if(d.shapeKind==='polyhedron'){
   assert.ok(flat.flatDeviation<2e-6,`flat net not coplanar ${flat.flatDeviation}`);
   const faces=x.body.getWorldFaces().map(face=>face.map(v=>[v[0],v[1]]));
   for(let i=0;i<faces.length;i++)for(let j=i+1;j<faces.length;j++){
    const overlap=intersectPolygon(faces[i],faces[j]);
    assert.ok(overlap<1e-7,`folded net overlaps faces ${i} and ${j} by ${overlap}`);
   }
   const p=x.body.geometry;
   assert.ok(almost(polySurfaceArea(p),p.metrics.totalArea),`surface area mismatch`);
   assert.ok(almost(polySolidVolume(p),p.metrics.volume),`solid volume mismatch`);
  }else{
   assert.ok(flat.flatMaxOutOfPlane<2e-6);
   assert.ok(flat.maxSeamGap>0.1,'flat curved net must be open');
  }
  x.setProgress(0.25);
  assert.equal(x.timeline.progress,0.25);
  x.setProgress(0.5);
  assert.equal(x.timeline.progress,0.5);
  x.setProgress(0.75);
  assert.equal(x.timeline.progress,0.75);
  x.foldInstant();
  const folded=x.getDiagnostic();
  if(d.shapeKind==='polyhedron')assert.ok(folded.maxSharedGap<2e-6,`closed edge gap ${folded.maxSharedGap}`);
  else assert.ok(folded.maxSeamGap<2e-6,`curved seam gap ${folded.maxSeamGap}`);
  // Reverse unfolding 100% -> 75% -> 50% -> 25% -> 0%
  for(const rev of [0.75,0.5,0.25,0]){
   x.setProgress(rev);
   assert.equal(x.timeline.progress,rev);
  }
  const flatAgain=x.getDiagnostic();
  if(d.shapeKind==='polyhedron')assert.ok(flatAgain.flatDeviation<2e-6);
  else assert.ok(flatAgain.flatMaxOutOfPlane<2e-6);
  x.setWireframe(true);x.setFacesVisible(true);x.setEdgesVisible(true);x.setHingesVisible(true);x.setXRayMode(false);
  x.reset();
  assert.equal(x.timeline.progress,0);
  x.onEnter();
  for(let i=0;i<300;i++)x.update(0.04);
  assert.equal(x.timeline.progress,1,'must reach final 100%');
  assert.equal(x.timeline.playing,false,'must hold final scene without pointless looping');
  x.onLeave();x.dispose();
 });
}

test('R87 MATHVERSE museum bridge supports rebase on viewer enter, dynamic params, and no Lab auto registration',()=>{
 const g=createMuseumFoldGroup('mv-fold-cube');
 assert.ok(g.isGroup);
 assert.equal(g.userData.mathNature,'TRUE_3D');
 g.userData.onViewEnter();
 g.userData.animate(5000);
 assert.equal(g.userData.motionStage.progress,0);
 g.userData.animate(5004);
 assert.ok(g.userData.motionStage.progress>0.5);
 g.userData.animate(5020);
 assert.equal(g.userData.motionStage.progress,1);
 g.userData.playAgain();
 g.userData.animate(6000);
 assert.equal(g.userData.motionStage.progress,0);
 g.userData.openFlat();
 assert.equal(g.userData.foldNetExhibit.timeline.progress,0);
 g.userData.closeSolid();
 assert.equal(g.userData.foldNetExhibit.timeline.progress,1);
 const updated=g.userData.setParams({a:3.0});
 assert.ok(updated.formulas.some(f=>f.value==='54.00'),'Cube S_tp for a=3 must be 54.00');
 assert.equal(g.userData.foldNetExhibit.timeline.progress,1,'setParams preserves fold progress');
 g.userData.disposeFoldNet();
});

test('R87 Mathematical Corrections & Museum Placement Integration (r67-mode-exhibits, r6-spatial-manager, r11-holo-stage)',()=>{
 // 1. All 20 models have museum placement & formulas; Grade 10 has 0 forced models
 assert.equal(Object.keys(R87_MUSEUM_PLACEMENT).length,20);
 for(const item of FOLD_NET_CATALOG){
  const place=getFoldNetPlacement(item.id);
  assert.ok(place,`Missing placement for ${item.id}`);
  assert.notEqual(place.primaryGrade,10,'Grade 10 must not have forced 3D net models');
  const schema=getFoldNetParamSchema(item.id);
  assert.ok(schema.length>=1,`Missing param schema for ${item.id}`);
  const f0=computeFoldNetFormulas(item.id,item.defaultParams,0);
  const f100=computeFoldNetFormulas(item.id,item.defaultParams,1);
  assert.equal(f0.stageIndex,1);
  assert.equal(f100.stageIndex,4);
  assert.ok(f100.formulas.length>=4,`Missing formulas for ${item.id}`);
 }
 // 2. Mandatory mathematical corrections check
 const f13=computeFoldNetFormulas('mv-fold-tri-rectangular-tetrahedron',{a:2,b:2,c:2},1);
 assert.ok(f13.formulas.some(f=>f.expr==='S_ABC² = S_OAB² + S_OBC² + S_OCA²'),'Tri-rectangular tetrahedron must use De Gua sum of squares');
 const f12=computeFoldNetFormulas('mv-fold-regular-tetrahedron',{a:2},1);
 assert.ok(f12.formulas.some(f=>f.value==='70.53°')&&f12.formulas.some(f=>f.value==='109.47°'),'Regular tetrahedron must distinguish 70.53° internal vs 109.47° external fold angle');
 const f6=computeFoldNetFormulas('mv-fold-regular-triangular-pyramid',{a:2.4,h:2.3},1);
 assert.ok(f6.formulas.some(f=>f.expr==='tan θ = 2√3·h / a'));

 // 3. All 10 EXTEND_EXISTING_MUSEUM pedestals in r67-mode-exhibits build real R87 fold-net exhibits
 assert.equal(Object.keys(EXTENDED_MUSEUM_MODE_TO_FOLD_NET).length,10);
 for(const [modeId,foldId] of Object.entries(EXTENDED_MUSEUM_MODE_TO_FOLD_NET)){
  const place=getFoldNetPlacement(foldId);
  const ped=createModeExhibit(place.primaryGrade,{id:modeId,name:modeId,labId:modeId.slice(0,4)});
  assert.equal(ped.userData.foldNetModelId,foldId);
  ped.userData.animate(0);
  assert.equal(ped.userData.motionStage.progress,0);
  ped.userData.animate(5);
  assert.ok(Math.abs(ped.userData.motionStage.progress-0.5)<1e-6);
  ped.userData.animate(10);
  assert.equal(ped.userData.motionStage.progress,1);
  ped.userData.disposeFoldNet();
 }

 // 4. Room-level NEW_MUSEUM_EXHIBIT pedestals & HoloStageInspector wiring
 assert.equal(getNewFoldNetExhibitsForRoom('G11-R04').length,8);
 assert.equal(getNewFoldNetExhibitsForRoom('G11-R03').length,3);
 assert.equal(getNewFoldNetExhibitsForRoom('G9-R04').length,1);
 assert.equal(getNewFoldNetExhibitsForRoom('G10-R01').length,0);

 const holoSrc=fs.readFileSync(new URL('../src/museum/r11-holo-stage.js',import.meta.url),'utf8');
 const spatialSrc=fs.readFileSync(new URL('../src/museum/r6-spatial-manager.js',import.meta.url),'utf8');
 assert.match(holoSrc,/r87-holo-fold-panel/);
 assert.match(holoSrc,/r87-holo-model-select/);
 assert.match(spatialSrc,/getNewFoldNetExhibitsForRoom/);
});
