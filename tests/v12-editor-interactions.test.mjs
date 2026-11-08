import test from 'node:test';
import assert from 'node:assert/strict';
import {Workspace2DEditor} from '../src/studio/Workspace2DEditor.js';
import {make2D,makeDocument} from '../src/studio/workspace-document.js';
import {geometryFor} from '../src/studio/geometry-advanced2d.js';
function create(doc){
  const controller=new Workspace2DEditor(doc,{change:()=>{},select:()=>{},notify:()=>{}});
  controller.width=800;controller.height=600;controller.zoom=40;controller.canvas={getBoundingClientRect:()=>({left:0,top:0,width:800,height:600}),setPointerCapture(){}};
  return controller;
}
function pointer(controller,x,y){const [clientX,clientY]=controller.screen([x,y]);return {clientX,clientY,button:0,shiftKey:false,preventDefault(){},pointerId:1};}
test('V12 - basic line and ray tools create after two clicks',()=>{
  const doc=makeDocument(),c=create(doc);
  c.setTool('line');c._down(pointer(c,-2,0));assert.equal(doc.items.length,0);c._down(pointer(c,2,0));
  assert.equal(doc.items.length,1);assert.equal(doc.items[0].kind,'line');
  c.setTool('ray');c._down(pointer(c,0,0));c._down(pointer(c,0,2));
  assert.equal(doc.items[1].kind,'ray');assert.equal(c.tool,'select');
});
test('V12 - perpendicular bisector tool targets segment and updates from source',()=>{
  const doc=makeDocument(),seg=make2D('segment',[0,0]);doc.items.push(seg);
  const c=create(doc);c.setTool('perpBisector');c._down(pointer(c,1,0));
  assert.equal(doc.items.length,2);assert.equal(doc.items[1].parentId,seg.id);
  seg.y=2;const g=geometryFor(doc.items[1],doc);assert.equal(g.a[1],2);
});
test('V12 - circlePoint is draggable along circumference',()=>{
  const doc=makeDocument(),circle=make2D('circle',[0,0],{r:2}),point=make2D('circlePoint',[2,0],{parentId:circle.id,theta:0});doc.items.push(circle,point);
  const c=create(doc);c.setTool('select');c._down(pointer(c,2,0));
  assert.equal(c.drag.kind,'circlePoint');c._move(pointer(c,0,2));c._up();
  assert.ok(Math.abs(point.theta-Math.PI/2)<1e-6);
});
test('V12 - clicking point then segment creates parallel dynamic line',()=>{
  const doc=makeDocument(),pt=make2D('point',[0,2]),seg=make2D('segment',[0,0]);
  doc.items.push(seg,pt);const c=create(doc);c.setTool('parallelLine');
  c._down(pointer(c,0,2));c._down(pointer(c,1,0));
  assert.equal(doc.items.length,3);const line=doc.items[2];assert.equal(line.kind,'parallelLine');
  assert.equal(geometryFor(line,doc).a[1],2);pt.y=5;assert.equal(geometryFor(line,doc).a[1],5);
});
test('V12 - click two crossing segments to construct linked intersection',()=>{
  const doc=makeDocument(),a=make2D('segment',[0,0]),b=make2D('segment',[0,0]);
  a.points=[[-2,-1],[2,1]];b.points=[[-2,1],[2,-1]];doc.items.push(a,b);
  const c=create(doc);c.setTool('intersectionPoint');
  c._down(pointer(c,1,.5));c._down(pointer(c,1,-.5));
  assert.equal(doc.items.length,3);assert.equal(doc.items[2].kind,'intersectionPoint');
  assert.deepEqual(geometryFor(doc.items[2],doc).p,[0,0]);
});
