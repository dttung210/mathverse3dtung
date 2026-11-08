import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {readFileSync} from 'node:fs';
import {createMathModel,disposeObject} from '../src/geometry.js';
import {grade8Defaults,pyramid8} from '../src/curriculum/grade8-engine.mjs';
import {spatialMotionFrame,applySpatialMotion,NET_UNFOLD_MODE_IDS} from '../src/curriculum/spatial-educational-motion.mjs';
import {Solid3DViewer} from '../src/viewers/Solid3DViewer.js';

const close=(a,b,tol=1e-3)=>assert.ok(Math.abs(a-b)<=tol,`${a} != ${b}`);
const getFaces=group=>{const out=[];group.traverse(o=>{if(o.isMesh&&o.geometry?.attributes?.position)out.push(o);});return out;};
const geometryWorldSample=group=>{group.updateMatrixWorld(true);const vals=[];
 for(const mesh of getFaces(group)){
  const attr=mesh.geometry.attributes.position;
  for(let i=0;i<attr.count;i++){
   const v=new THREE.Vector3().fromBufferAttribute(attr,i).applyMatrix4(mesh.matrixWorld);
   vals.push([v.x,v.y,v.z]);
  }
 }
 return vals;
};
const yExtent=pts=>Math.max(...pts.map(p=>p[1]))-Math.min(...pts.map(p=>p[1]));
const meshSignature=pts=>pts.slice(0,90).reduce((a,p,i)=>a+[...p].reduce((x,n,j)=>x+(i+1)*(j+2)*n,0),0);

test('R91 ONLY net-unfolding lessons fold in 3D; non-net pyramid 8-09-C01 stays intact and sweeps cross-section',()=>{
 const p=grade8Defaults('8-09-C01'),type=pyramid8('8-09-C01',p).type;
 assert.equal(type,'trianglePyramid');
 assert.equal(NET_UNFOLD_MODE_IDS.has('8-09-C01'),false);
 assert.equal(NET_UNFOLD_MODE_IDS.has('8-09-C03'),true);
 const h=createMathModel({type,params:{a:p.a,h:p.h}});
 assert.equal(h.supportsUnfold,true);
 assert.equal(h.supportsCrossSection,true);
 const frames=[0,1.5,3,4.5,6].map(t=>spatialMotionFrame({
  id:'8-09-C01',type,seconds:t,supportsUnfold:true,supportsCrossSection:true,netLesson:false
 }));
 assert.ok(frames.every(f=>f.kind==='section'),'8-09-C01 must use cross-section motion, NOT fold into a flat net');
 assert.equal(frames[0].section,false);
 assert.equal(frames[2].section,true);
 assert.ok(frames[4].sectionPct>frames[1].sectionPct);
 disposeObject(h);
});

test('R91 8-09-C03 (Khai triển hình chóp đều) two-way folding returns to original flat net and hides floating 3D labels when unfolded',()=>{
 const types=['trianglePyramid','squarePyramid'];
 for(const type of types){
  const f=[0,2.1,6].map(t=>spatialMotionFrame({id:'8-09-C03',type,seconds:t,supportsUnfold:true,netLesson:true}));
  close(f[0].unfold,1);assert.ok(f[1].unfold<.1);close(f[2].unfold,1);
  const model=createMathModel({type,params:{a:4,h:4.8}});
  const nets=[];
  for(const x of f){
   model.setUnfoldProgress(x.unfold);
   if(x.unfold>0.02){
    assert.equal(model.userData.labelsGroup.visible,false,'3D vertex labels must be hidden when unfolded so they do not float in mid-air');
   }else{
    assert.equal(model.userData.labelsGroup.visible,true,'3D vertex labels must be visible when solid is closed');
   }
   nets.push(geometryWorldSample(model.userData.unfoldGroup));
  }
  close(yExtent(nets[0]),0);assert.ok(yExtent(nets[1])>1);close(yExtent(nets[2]),0);
  disposeObject(model);
 }
});

test('R91 8-09-C02/C04 non-net pyramid lessons keep 3D solid intact and sweep horizontal cross-section',()=>{
 for(const id of ['8-09-C02','8-09-C04']){
  const frames=[0,1.5,3,4.5,6].map(t=>spatialMotionFrame({id,type:'squarePyramid',seconds:t,supportsUnfold:true,supportsCrossSection:true}));
  assert.ok(frames.every(f=>f.kind==='section'));
  assert.equal(frames[0].section,false);
  assert.equal(frames[2].section,true);
  assert.ok(frames[4].sectionPct>frames[1].sectionPct);
 }
});

test('R91 Grade 7: 7-08-C03 and 7-09-C03 fold/unfold in 3D, while 7-08-C01/C02/C04 and 7-09-C01/C02/C04 stay intact and sweep cross-section',()=>{
 for(const [id,type] of [['7-08-C03','cuboid'],['7-09-C03','triPrism']]){
  const frames=[0,2.1,6].map(t=>spatialMotionFrame({id,type,seconds:t,supportsUnfold:true,supportsCrossSection:true}));
  assert.ok(frames.every(f=>f.kind==='fold'),`${id} must fold/unfold in 3D`);
  close(frames[0].unfold,1);
  close(frames[1].unfold,0);
  close(frames[2].unfold,1);
 }
 for(const [id,type] of [['7-08-C01','cuboid'],['7-08-C02','cube'],['7-09-C01','triPrism'],['7-09-C02','prismQuad']]){
  const frames=[0,3,6].map(t=>spatialMotionFrame({id,type,seconds:t,supportsUnfold:true,supportsCrossSection:true}));
  assert.ok(frames.every(f=>f.kind==='section'),`${id} must keep 3D solid intact and sweep cross-section`);
 }
});

test('R91 cone surface is truly folded in 3D and flattens into an exact sector when unfolded',()=>{
 const model=createMathModel({type:'cone',params:{r:2,h:4}});
 const group=model.userData.unfoldGroup;
 const surf=getFaces(group).find(m=>m.geometry.type==='RingGeometry');assert.ok(surf);
 model.setUnfoldProgress(0.001);let p0=geometryWorldSample(surf);
 model.setUnfoldProgress(1);let p1=geometryWorldSample(surf);
 assert.ok(yExtent(p0)>1.0);
 close(yExtent(p1),0,1e-5);
 assert.notEqual(meshSignature(p0),meshSignature(p1));
 const l=Math.hypot(2,4),arcAngle=2*Math.PI*2/l;
 assert.ok(arcAngle<2*Math.PI&&arcAngle>0);
 disposeObject(model);
});

test('R91 cylinder net keeps actual mantle seam length 2πr and two separate disks',()=>{
 const model=createMathModel({type:'cylinder',params:{r:2,h:4}});
 const group=model.userData.unfoldGroup;
 model.setUnfoldProgress(0.001);const p0=geometryWorldSample(group);
 model.setUnfoldProgress(1);const p1=geometryWorldSample(group);
 assert.notEqual(meshSignature(p0),meshSignature(p1));
 const face=getFaces(group).find(x=>x.geometry.type==='PlaneGeometry');assert.ok(face);
 const localX=face.geometry.attributes.position;
 const width=()=>{
  let minX=Infinity,maxX=-Infinity;
  for(let i=0;i<localX.count;i++){minX=Math.min(minX,localX.getX(i));maxX=Math.max(maxX,localX.getX(i));}
  return maxX-minX;
 };
 close(width(),2*Math.PI*2,.01);
 model.setUnfoldProgress(0);
 model.setUnfoldProgress(1); // independent of previous frame, no cumulative shrink
 close(width(),2*Math.PI*2,.01);
 disposeObject(model);
});

test('R91 frustum net is an annular sector, not a static rotated sheet',()=>{
 const model=createMathModel({type:'conicalFrustum',params:{R:3,r:1.5,h:4}});
 const group=model.userData.unfoldGroup;
 const s=getFaces(group).find(x=>x.geometry.type==='RingGeometry');assert.ok(s);
 model.setUnfoldProgress(0.001);const p0=geometryWorldSample(s);
 model.setUnfoldProgress(1);const p1=geometryWorldSample(s);
 assert.ok(yExtent(p0)>1.0);close(yExtent(p1),0,1e-5);
 disposeObject(model);
});

test('R91 open-top box 12-03-C02 has real hinged walls and folds from flat sheet into 3D box',()=>{
 const model=createMathModel({type:'openTopBox',params:{L:5,cut:1}});
 assert.equal(model.supportsUnfold,true);
 const group=model.userData.unfoldGroup;
 for(const t of [0,.5,1]){
  model.setUnfoldProgress(t);const v=geometryWorldSample(group);
  assert.ok(v.length>0);
  if(t===1)close(yExtent(v),0,1e-5);
 }
 const f0=spatialMotionFrame({id:'12-03-C02',type:'openTopBox',seconds:0,supportsUnfold:true});
 const f6=spatialMotionFrame({id:'12-03-C02',type:'openTopBox',seconds:6,supportsUnfold:true});
 assert.equal(f0.kind,'fold');
 close(f0.unfold,1);
 close(f6.unfold,0);
 disposeObject(model);
});

test('R91 sphere has no false isometric flat net, uses non-looping latitude sweep',()=>{
 const model=createMathModel({type:'sphere',params:{r:3}});
 assert.equal(model.supportsUnfold,false);
 const f=[0,3,6].map(t=>spatialMotionFrame({id:'9-11-C01',type:'sphere',seconds:t,supportsUnfold:false}));
 assert.deepEqual(f.map(x=>x.kind),['sphere','sphere','sphere']);
 close(f[0].sweep,0);close(f[1].sweep,.5);close(f[2].sweep,1);
 disposeObject(model);
});

test('R91 applySpatialMotion folds net lessons (8-09-C03) and cross-sections non-net lessons (8-09-C01)',()=>{
 const calls=[];
 const fake={meshGroup:{supportsUnfold:true,supportsCrossSection:true},
  setUnfold:(...x)=>calls.push(['unfold',...x]),setCrossSection:(...x)=>calls.push(['section',...x]),
  setSphereSweepProgress:(p)=>calls.push(['sphere',p])};
 const frameNet=applySpatialMotion(fake,{id:'8-09-C03',type:'trianglePyramid',seconds:0,netLesson:true});
 assert.equal(frameNet.kind,'fold');
 assert.equal(frameNet.unfold,1);
 assert.ok(calls.find(c=>c[0]==='unfold'&&c[1]===true&&c[2]===1));

 calls.length=0;
 const frameSolid=applySpatialMotion(fake,{id:'8-09-C01',type:'trianglePyramid',seconds:3,netLesson:false});
 assert.equal(frameSolid.kind,'section');
 assert.ok(calls.find(c=>c[0]==='unfold'&&c[1]===false&&c[2]===0));
 assert.ok(calls.find(c=>c[0]==='section'&&c[1]===true));
});

test('R91 referenced SGK Lab and existing 54 linked museum cards do not mount static Viewer',()=>{
 const file=readFileSync(new URL('../src/curriculum/CurriculumExplorer.js',import.meta.url),'utf8');
 assert.match(file,/this\.renderStage\(canonical,family\)/);
 assert.match(file,/mode\.relatedExhibit/);
 assert.match(file,/this\.mode=selectedAlias/);
});

test('R91 C03 changes real 3D type from triangle to square when user selects base shape',()=>{
 const code=readFileSync(new URL('../src/curriculum/Grade8Lab.js',import.meta.url),'utf8');
 assert.match(code,/this\.solid\.model\.type=x\.type/);
 assert.match(code,/applySpatialMotion\(this\.solid/);
});

test('R91 sphere sweep changes true SphereGeometry triangle draw range, holds full end',()=>{
 const viewer=new Solid3DViewer({id:'r91-sphere',grade:9,type:'sphere',params:{r:2.5}});
 viewer.meshGroup=createMathModel({type:'sphere',params:{r:2.5}});
 const meshes=getFaces(viewer.meshGroup).filter(m=>m.geometry.type==='SphereGeometry');
 assert.ok(meshes.length>0);
 const total=meshes[0].geometry.index.count;
 assert.ok(total>0);
 for(const [p,predicate] of [[0,n=>n===0],[.5,n=>n>0&&n<total],[1,n=>n===total]]){
  assert.ok(viewer.setSphereSweepProgress(p)>0);
  assert.ok(predicate(meshes[0].geometry.drawRange.count),`${p}: ${meshes[0].geometry.drawRange.count}`);
 }
 disposeObject(viewer.meshGroup);
});
