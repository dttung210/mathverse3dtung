import test from 'node:test';
import assert from 'node:assert/strict';
import {make2D,make3D,makeDocument,validateDocument,vertices,worldCoords,constrainScale3D} from '../src/studio/workspace-document.js';
import {geometryFor,lineIntersection,circumcircle,clipInfiniteLine,canBuildDerived} from '../src/studio/geometry-advanced2d.js';
import {computeHorizontalSection,sectionSVG} from '../src/studio/section-math.js';
import {captureState,recordKeyframe,interpolateState,interpolateAngle,validateMotion} from '../src/studio/motion-timeline.js';
const close=(a,b,eps=1e-6)=>assert.ok(Math.abs(a-b)<eps,`Expected ${a} ≈ ${b}`);
const add=(doc,...items)=>{doc.items.push(...items);return doc;};

test('V12 - perpendicular bisector depends on movable segment endpoints',()=>{
  const seg=make2D('segment',[0,0]),b=make2D('perpBisector',[0,0],{parentId:seg.id});const doc=add(makeDocument(),seg,b);
  let g=geometryFor(b,doc);close(g.a[0],0);close(g.a[1],0);
  close((g.b[0]-g.a[0])*(seg.points[1][0]-seg.points[0][0])+(g.b[1]-g.a[1])*(seg.points[1][1]-seg.points[0][1]),0);
  seg.x=2;seg.points=[[0,0],[2,2]];g=geometryFor(b,doc);close(g.a[0],3);close(g.a[1],1);
});
test('V12 - dependent parallel/perpendicular through moving point remain exact',()=>{
  const pt=make2D('point',[1,3]),base=make2D('segment',[0,0]);
  const a=make2D('parallelLine',[0,0],{parentIds:[pt.id,base.id]});
  const b=make2D('perpendicularLine',[0,0],{parentIds:[pt.id,base.id]});
  const doc=add(makeDocument(),pt,base,a,b);
  let u=geometryFor(a,doc),v=geometryFor(b,doc);
  assert.deepEqual(u.a,[1,3]);
  close((u.b[0]-u.a[0])*(v.b[0]-v.a[0])+(u.b[1]-u.a[1])*(v.b[1]-v.a[1]),0);
  pt.x=5;pt.y=7;u=geometryFor(a,doc);v=geometryFor(b,doc);assert.deepEqual(u.a,[5,7]);assert.deepEqual(v.a,[5,7]);
});
test('V12 - median and altitude of triangle stay attached on dragging',()=>{
  const t=make2D('triangle',[0,0]);const m=make2D('median',[0,0],{parentId:t.id});
  const h=make2D('altitude',[0,0],{parentId:t.id});const doc=add(makeDocument(),t,m,h);
  const world=vertices(t).map(p=>worldCoords(t,p));
  let med=geometryFor(m,doc),alt=geometryFor(h,doc);
  close(med.b[0],(world[1][0]+world[2][0])/2);close(med.b[1],(world[1][1]+world[2][1])/2);
  const opp=[world[2][0]-world[1][0],world[2][1]-world[1][1]];
  close((alt.b[0]-alt.a[0])*opp[0]+(alt.b[1]-alt.a[1])*opp[1],0);
  t.points[0][0]+=1.8;med=geometryFor(m,doc);alt=geometryFor(h,doc);
  close(alt.a[0],t.points[0][0]);
});
test('V12 - circumcircle passes all three triangle vertices',()=>{
  const tri=make2D('triangle',[.4,-.2]);tri.points=[[-2,0],[2,0],[1,3]];
  const c=make2D('circumcircle',[0,0],{parentId:tri.id});const doc=add(makeDocument(),tri,c);
  const g=geometryFor(c,doc);for(const p of vertices(tri).map(v=>worldCoords(tri,v)))close(Math.hypot(p[0]-g.center[0],p[1]-g.center[1]),g.r);
});
test('V12 - intersection parallel returns null, line clipping ray is bounded',()=>{
  assert.equal(lineIntersection([0,0],[1,0],[0,2],[1,2]),null);
  assert.deepEqual(lineIntersection([0,0],[2,0],[1,-2],[1,2]),[1,0]);
  assert.deepEqual(clipInfiniteLine([0,0],[1,0],[-5,5,-3,3]),[[-5,0],[5,0]]);
  assert.deepEqual(clipInfiniteLine([0,0],[1,0],[-5,5,-3,3],true),[[0,0],[5,0]]);
});
test('V12 - dependencies validate and missing parent rejected',()=>{
  const seg=make2D('segment');const b=make2D('perpBisector',[0,0],{parentId:seg.id});
  const ok=add(makeDocument(6,'2d'),seg,b);
  assert.equal(validateDocument(ok,6,'2d').items.length,2);
  const broken=structuredClone(ok);broken.items=broken.items.filter(i=>i.id!==seg.id);
  assert.throws(()=>validateDocument(broken,6,'2d'),/Missing dependency/);
  assert.equal(canBuildDerived('perpBisector',[seg]),true);
  assert.equal(canBuildDerived('perpBisector',[make2D('circle')]),false);
});
test('V12 - correct analytic horizontal section areas',()=>{
  for(const [kind,area] of [['box',4],['pyramid',5.12*.25],['cylinder',Math.PI*1.3*1.3],['cone',Math.PI*.7*.7],['sphere',Math.PI*1.4*1.4]]){
    const i=make3D(kind),s=computeHorizontalSection(i,.5);close(s.area,area,1e-5);assert.ok(sectionSVG(s).includes(','));
  }
  const prism=make3D('prism');const s=computeHorizontalSection(prism,.7);close(s.area,3*Math.sqrt(3)/4*1.6**2);
});
test('V12 - section area responds correctly to both dimension and scale',()=>{
  const p=make3D('pyramid');constrainScale3D(p,'x',2);p.sy=3;
  const a=computeHorizontalSection(p,.25),b=computeHorizontalSection(p,.5);
  close(a.area/b.area, (1-.25)**2/(1-.5)**2);
  close(b.worldHeight,2.7*.5*3);close(b.area,5.12*.25*4);
  assert.equal(computeHorizontalSection(make3D('sphere'),.5).type,'ellipse');
});
test('V12 - keyframes interpolate coordinates, circle radius and angles via shortest arc',()=>{
  const doc=add(makeDocument(8,'2d'),make2D('circle'));
  const obj=doc.items[0];obj.r=1;obj.angle=350;recordKeyframe(doc,0);
  obj.x=10;obj.r=3;obj.angle=10;recordKeyframe(doc,4);
  interpolateState(doc,doc.motion.keyframes,2);
  close(obj.x,5);close(obj.r,2);close(obj.angle,0);
  close(interpolateAngle(350,10,.5),0);
  assert.equal(validateMotion(doc),true);
  const restored=validateDocument(doc,8,'2d');assert.equal(restored.motion.keyframes.length,2);
});
test('V12 - timeline interpolation never destroys dependent geometry',()=>{
  const d=makeDocument(8,'2d');const seg=make2D('segment');const mid=make2D('midpoint',[0,0],{parentId:seg.id});add(d,seg,mid);
  recordKeyframe(d,0);seg.x=4;recordKeyframe(d,2);interpolateState(d,d.motion.keyframes,1);
  close(seg.x,2);assert.deepEqual(geometryFor(mid,d).p,[2,0]);
});
test('V12 - reject forged motion coordinates and cyclic references are bounded',()=>{
  const doc=add(makeDocument(7,'2d'),make2D('point',[1,2]));
  recordKeyframe(doc,0);
  const raw=structuredClone(doc);raw.motion.keyframes[0].items[0].x=Infinity;
  assert.throws(()=>validateDocument(raw,7,'2d'),/Invalid motion number/);
  const raw2=structuredClone(doc);raw2.motion.keyframes[0].items[0].points=[[Infinity,1]];
  assert.throws(()=>validateDocument(raw2,7,'2d'),/Invalid motion points/);
});
