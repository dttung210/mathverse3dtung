import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildPresets } from '../src/studio/presets.js';
import { migrateItemToV5 } from '../src/data/migrate-v2-v4-v5.js';
import { makeDocument,make2D,make3D,vertices,worldCoords,derived2DPosition,set2DHandle,fromCatalog,metrics2D,validateDocument,constrainScale3D,MAX_OBJECTS } from '../src/studio/workspace-document.js';
import { Workspace2DEditor } from '../src/studio/Workspace2DEditor.js';
import { Workspace3DEditor } from '../src/studio/Workspace3DEditor.js';
import { WorkspaceComposer } from '../src/studio/WorkspaceComposer.js';

const raw=JSON.parse(readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8'));
const catalog=raw.items.map(migrateItemToV5);
const presets=buildPresets(catalog);
const near=(a,b)=>Math.abs(a-b)<1e-6;

test('V11 preserves 63 original exhibits and 42 curated templates',()=>{
  assert.equal(catalog.length,63);assert.equal(presets.length,42);
  const originalIds=new Set(catalog.map(x=>x.id));
  assert.equal(originalIds.size,63);
});
test('Each grade has separate 2D and 3D scene namespaces',()=>{
  const a=makeDocument(6,'2d'),b=makeDocument(6,'3d'),c=makeDocument(8,'2d');
  assert.deepEqual(a.items,[]);assert.notEqual(a.dimension,b.dimension);assert.notEqual(a.grade,c.grade);
  assert.throws(()=>validateDocument(a,8,'2d'),/mismatch/);
  assert.throws(()=>validateDocument(b,6,'2d'),/mismatch/);
});
test('Adding objects never rewrites original catalog',()=>{
  const baseline=JSON.stringify(catalog[0]);const doc=makeDocument(8,'2d');
  doc.items.push(make2D('circle',[1,2]));doc.items.push(make2D('triangle',[-3,0]));
  assert.equal(doc.items.length,2);assert.equal(JSON.stringify(catalog[0]),baseline);
  assert.equal(validateDocument(doc,8,'2d').items.length,2);
});
test('Rectangle direct handles preserve right angles and correct area',()=>{
  const o=make2D('rectangle',[3,0],{w:5,h:3});
  assert.equal(metrics2D(o).area,15);
  assert.equal(set2DHandle(o,2,[7,4]),true);
  const q=vertices(o);
  assert(near(q[0][1],q[1][1]));assert(near(q[1][0],q[2][0]));
  assert(near(q[2][1],q[3][1]));assert(metrics2D(o).area>0);
});
test('Rhombus dragging preserves orthogonal, bisecting diagonals',()=>{
  const o=make2D('rhombus',[0,0],{d1:6,d2:4});
  assert.equal(metrics2D(o).area,12);
  set2DHandle(o,0,[0,4]);set2DHandle(o,1,[4,0]);
  const q=vertices(o);assert(near(q[0][0],q[2][0]));assert(near(q[1][1],q[3][1]));
  assert(near((q[0][1]+q[2][1])/2,0));assert.equal(metrics2D(o).area,32);
});
test('Triangle cannot collapse to a line during direct dragging',()=>{
  const o=make2D('triangle');
  assert.equal(set2DHandle(o,2,[0,2]),true);
  const q=vertices(o),middle=[(q[0][0]+q[1][0])/2,(q[0][1]+q[1][1])/2];
  assert.equal(set2DHandle(o,2,worldCoords(o,middle)),false);
});
test('Circle dependent point tracks radius and center changes',()=>{
  const doc=makeDocument(6,'2d'),circle=make2D('circle',[2,3],{r:2});
  const point=make2D('circlePoint',[4,3],{parentId:circle.id,theta:0});
  doc.items.push(circle,point);
  assert.deepEqual(derived2DPosition(point,doc),[4,3]);
  circle.r=3;circle.x=4;assert.deepEqual(derived2DPosition(point,doc),[7,3]);
});
test('Midpoint stays attached to segment after moving endpoints',()=>{
  const doc=makeDocument(7,'2d'),segment=make2D('segment',[1,2]);
  const mid=make2D('midpoint',[1,2],{parentId:segment.id});doc.items.push(segment,mid);
  assert.deepEqual(derived2DPosition(mid,doc),[1,2]);
  set2DHandle(segment,1,[6,2]);assert.deepEqual(derived2DPosition(mid,doc),[2.5,2]);
});
test('Dragging catalog math constructions retains real primitives, not triangle fallback',()=>{
  const types=['thales','circleInscribed','circleTangent','parallelLines','triangleCenters','pythagoras','ellipse','hyperbola'];
  for(const t of types){const item=catalog.find(m=>m.type===t);
    assert(item,`missing ${t}`);const obj=fromCatalog(item,'2d',[1,2]);
    assert(obj.primitives?.length>=3,`missing construction for ${t}`);
    assert.equal(obj.sourceId,item.id);assert.equal(obj.kind,'construction2d');
  }
});
test('Catalog import respects strict 2D and 3D separation',()=>{
  const item2=catalog.find(m=>m.type==='rhombus'),item3=catalog.find(m=>m.type==='squarePyramid');
  assert.equal(fromCatalog(item3,'2d',[0,0]),null);
  assert.equal(fromCatalog(item2,'3d',[0,0,0]),null);
  assert.equal(fromCatalog(item2,'2d',[0,0]).kind,'rhombus');
  assert.equal(fromCatalog(item3,'3d',[0,0,0]).kind,'catalog3d');
});
test('Sphere 3D scale is uniform, pyramid keeps its square base',()=>{
  const sphere=make3D('sphere');assert(constrainScale3D(sphere,'x',2.5));
  assert.equal(sphere.sx,2.5);assert.equal(sphere.sy,2.5);assert.equal(sphere.sz,2.5);
  const pyramid=make3D('pyramid');constrainScale3D(pyramid,'x',3.2);
  assert.equal(pyramid.sx,pyramid.sz);constrainScale3D(pyramid,'y',2.1);
  assert.notEqual(pyramid.sy,pyramid.sx);
});
test('Invalid scene records are rejected instead of crashing the renderer',()=>{
  const doc=makeDocument(9,'2d'),item=make2D('circle');doc.items.push(item);
  assert.throws(()=>validateDocument({...doc,items:[item,item]},9,'2d'),/Duplicate/);
  assert.throws(()=>validateDocument({...doc,items:[{...item,r:Infinity}]},9,'2d'),/Non-finite/);
  assert.throws(()=>validateDocument({...doc,items:Array(MAX_OBJECTS+1).fill(item)},9,'2d'),/Too many/);
  assert.throws(()=>validateDocument({...doc,items:[{...item,kind:'sphere'}]},9,'2d'),/Wrong shape/);
});
test('Composer and native 2D/3D editors expose working editing and serialization entrypoints',()=>{
  for(const C of [WorkspaceComposer,Workspace2DEditor,Workspace3DEditor])assert.equal(typeof C,'function');
  for(const name of ['addFromCatalog','commit','undo','redo','duplicate','remove','exportJSON','dispose'])assert.equal(typeof WorkspaceComposer.prototype[name],'function');
});
test('All complex 2D catalog constructions render in the multi-object editor',()=>{
  const canvasCalls=[];const noop=()=>{};
  const ctx=new Proxy({}, {get(_target,key){if(key in _target)return _target[key];return noop;},set(target,key,val){target[key]=val;return true;}});
  const editor=Object.create(Workspace2DEditor.prototype);
  editor.ctx=ctx;editor.width=850;editor.height=600;editor.zoom=43;editor.pan={x:0,y:0};editor.selection=[];
  editor.doc=makeDocument(8,'2d');
  for(const model of catalog.filter(m=>m.modality==='geometry2d')){
    const shape=fromCatalog(model,'2d',[0,0]);
    editor.doc.items=[shape];
    assert.doesNotThrow(()=>editor._drawItem(shape),`${model.type}: ${model.title}`);
  }
});

test('V11 primitive solid bases rest on the 3D workspace ground',()=>{
  const editor=Object.create(Workspace3DEditor.prototype);
  for(const kind of ['box','pyramid','prism','cylinder','cone','sphere']){
    const solid=editor._makeModel(make3D(kind));
    const mesh=solid.children.find(child=>child.isMesh);
    assert(mesh,kind);mesh.geometry.computeBoundingBox();
    assert(Math.abs(mesh.geometry.boundingBox.min.y+mesh.position.y)<1e-8,kind);
  }
});
