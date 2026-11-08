/** Run inside MATHVERSE root to verify all 20 R87 2D <-> 3D Fold-Net models & Museum integration. */
import assert from 'node:assert/strict';
import {
 FOLD_NET_CATALOG,
 R87_MUSEUM_PLACEMENT,
 EXTENDED_MUSEUM_MODE_TO_FOLD_NET,
 getFoldNetPlacement,
 computeFoldNetFormulas,
 createFoldNetExhibit
} from '../src/museum/fold-net/index.mjs';
import {polySurfaceArea,polySolidVolume} from '../src/museum/fold-net/geometry-models.mjs';

assert.equal(FOLD_NET_CATALOG.length,20);
assert.equal(Object.keys(R87_MUSEUM_PLACEMENT).length,20);
assert.equal(Object.keys(EXTENDED_MUSEUM_MODE_TO_FOLD_NET).length,10);

const reports=[];
for(const item of FOLD_NET_CATALOG){
 const place=getFoldNetPlacement(item.id);
 assert.ok(place,`Missing museum placement for ${item.id}`);
 assert.notEqual(place.primaryGrade,10,'Grade 10 must have 0 forced fold-net models');
 const e=createFoldNetExhibit(item.id);
 const a=e.getDiagnostic();
 for(const p of [0,0.25,0.5,0.75,1]){e.setProgress(p);}
 const b=e.getDiagnostic();
 const gap=item.shapeKind==='polyhedron'?b.maxSharedGap:b.maxSeamGap;
 assert.ok(gap<1e-6,`${item.id}: closing error ${gap}`);
 if(item.shapeKind==='polyhedron'){
  const p=e.body.geometry;
  assert.ok(a.flatDeviation<1e-6);
  assert.ok(Math.abs(polySolidVolume(p)-p.metrics.volume)<1e-6);
  assert.ok(Math.abs(polySurfaceArea(p)-p.metrics.totalArea)<1e-6);
 }else{assert.ok(a.flatMaxOutOfPlane<1e-6);}
 // Reverse unfold 100% -> 75% -> 50% -> 25% -> 0%
 for(const p of [1,0.75,0.5,0.25,0]){e.setProgress(p);}
 const rev=e.getDiagnostic();
 const revFlat=item.shapeKind==='polyhedron'?rev.flatDeviation:rev.flatMaxOutOfPlane;
 assert.ok(revFlat<1e-6,`${item.id}: reverse unfold flat error ${revFlat}`);
 const f=computeFoldNetFormulas(item.id,item.defaultParams,1);
 assert.ok(f.formulas.length>=4,`${item.id}: missing formulas`);
 reports.push({
  id:item.id,
  order:item.order,
  decision:place.decision,
  primaryGrade:place.primaryGrade,
  rooms:place.rooms,
  closingGap:gap,
  reverseFlatError:revFlat
 });
 e.dispose();
}
console.log(JSON.stringify({ok:true,count:reports.length,models:reports},null,2));
