import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {readFileSync} from 'node:fs';
import {createMathModel,disposeObject} from '../src/geometry.js';
import {getAllCurriculumModels} from '../src/curriculum/curriculum-manifest.mjs';
import {grade8Defaults,pyramid8} from '../src/curriculum/grade8-engine.mjs';
import {grade8SVGScene} from '../src/curriculum/grade8-svg.mjs';
import {SPATIAL_STORYBOARDS,spatialMotionFrame,spatialSceneDescription} from '../src/curriculum/spatial-educational-motion.mjs';

const source=rel=>readFileSync(new URL(`../${rel}`,import.meta.url),'utf8');
const meshVertices=group=>{
 group.updateMatrixWorld(true);const out=[];
 group.traverse(obj=>{
  if(!obj.isMesh||!obj.visible||!obj.geometry?.attributes?.position)return;
  const a=obj.geometry.attributes.position;
  for(let i=0;i<a.count;i++){
   const p=new THREE.Vector3().fromBufferAttribute(a,i).applyMatrix4(obj.matrixWorld);
   out.push([p.x,p.y,p.z]);
  }
 });
 return out;
};
const yRange=pts=>Math.max(...pts.map(x=>x[1]))-Math.min(...pts.map(x=>x[1]));
const geometryOnly=s=>s.replace(/<text\b[^>]*>[\s\S]*?<\/text>/g,'').replace(/<title\b[^>]*>[\s\S]*?<\/title>/g,'');

const examples={
 '7-08-C01':['cuboid',{a:4,b:3,h:5}],
 '7-08-C02':['cube',{a:3}],
 '7-09-C01':['triPrism',{a:4,h:5}],
 '7-09-C02':['prismQuad',{a:4,b:2.5,h_base:2.5,h:5}],
 '8-09-C01':['trianglePyramid',{a:4,h:4.8}],
 '8-09-C02':['squarePyramid',{a:4,h:4.8}],
 '9-09-C01':['cylinder',{r:2,h:4}],
 '9-10-C01':['cone',{r:2,h:4}]
};

test('R92 310 SGK IDs are unmodified and remain unique',()=>{
 const list=getAllCurriculumModels();
 assert.equal(list.length,310);
 assert.equal(new Set(list.map(m=>m.id)).size,310);
 for(const grade of [6,7,8,9,10,11,12])assert.ok(list.some(m=>m.targetGrade===grade));
});

test('R92 25 distinct subject-specific pedagogical goals, four informative steps each',()=>{
 const keys=Object.keys(SPATIAL_STORYBOARDS);
 assert.equal(keys.length,25);
 assert.equal(new Set(keys).size,keys.length);
 assert.equal(new Set(keys.map(k=>SPATIAL_STORYBOARDS[k].goal)).size,keys.length);
 for(const id of keys){
  const x=SPATIAL_STORYBOARDS[id];assert.equal(x.steps.length,4,id);
  assert.ok(x.goal.length>35,id);assert.ok(x.steps.every(s=>s.length>10),id);
  assert.equal(spatialSceneDescription(id,'',6).step,3);
 }
});

test('R92 different models choose different real geometric operations rather than identical section sweep',()=>{
 const kind=(id,type='triPrism')=>spatialMotionFrame({id,type,seconds:2.5,supportsUnfold:true,supportsCrossSection:true,deep:true}).kind;
 assert.equal(kind('7-09-C01'),'assemble');
 assert.equal(kind('7-09-C03'),'fold');
 assert.equal(kind('7-09-C04'),'section');
 assert.equal(kind('8-09-C01','trianglePyramid'),'assemble');
 assert.equal(kind('8-09-C02','squarePyramid'),'altitude');
 assert.equal(kind('8-09-C03','squarePyramid'),'fold');
 assert.equal(kind('8-09-C04','squarePyramid'),'section');
 assert.equal(kind('9-11-C02','sphere'),'sphere');
});

test('R92 3D recognition/construction lessons keep intact solid (unfold=0) and construct height/scale while true fold capability remains available',()=>{
 for(const [id,[type,params]] of Object.entries(examples)){
  const m=createMathModel({type,params});
  assert.ok(m.supportsUnfold,`${id} ${type} must support true fold when user switches to fold mode`);
  const first=spatialMotionFrame({id,type,seconds:0,deep:true,supportsUnfold:true,supportsCrossSection:true});
  assert.ok(['assemble','altitude'].includes(first.kind),id);
  assert.equal(first.unfold,0,`${id} recognition lesson must not duplicate net-folding lesson`);
  assert.ok(first.constructScale<0.5,`${id} starts constructing from <50% scale`);
  const last=spatialMotionFrame({id,type,seconds:6,deep:true,supportsUnfold:true,supportsCrossSection:true});
  assert.equal(last.unfold,0,id);
  assert.ok(last.constructScale>.999,id);
  m.setUnfoldProgress(1);const flat=meshVertices(m.userData.unfoldGroup);
  m.setUnfoldProgress(0);const closed=meshVertices(m.userData.unfoldGroup);
  assert.ok(flat.length>0&&closed.length>0,id);
  if(!['cylinder','cone'].includes(type)){
   assert.ok(yRange(flat)<1e-5,`flat developed ${id} must be planar`);
   assert.ok(yRange(closed)>.5,`closed ${id} must be 3D`);
  }else{
   assert.notDeepEqual(flat.slice(0,8),closed.slice(0,8),`curved development ${id} must change geometry`);
  }
  disposeObject(m);
 }
});

test('R92 Grade8 pyramid triangular-base recognition uses true triangle model and a unique altitude construction path',()=>{
 const id='8-09-C01',p=grade8Defaults(id),model=pyramid8(id,p);
 assert.equal(model.type,'trianglePyramid');
 const flags=[0,1.5,3,6].map(seconds=>spatialMotionFrame({id,type:model.type,seconds,deep:true,supportsUnfold:true,supportsCrossSection:true}));
 assert.deepEqual(flags.map(x=>x.kind),['assemble','assemble','assemble','assemble']);
 assert.ok(flags.every(x=>x.unfold===0),'8-09-C01 must stay intact 3D, not fold net');
 assert.ok(flags[0].constructScale<flags[1].constructScale&&flags[1].constructScale<flags[2].constructScale);
 assert.ok(flags[3].constructScale>.999);
});

test('R92 fold-only lessons return to correct flat net and stop instead of oscillating',()=>{
 for(const [id,type] of [['7-08-C03','cuboid'],['7-09-C03','triPrism'],['8-09-C03','trianglePyramid'],['9-10-C02','cone']]){
  const f=[0,2.1,6,7].map(seconds=>spatialMotionFrame({id,type,seconds,deep:true,supportsUnfold:true,supportsCrossSection:true}));
  assert.ok(f.every(x=>x.kind==='fold'));
  assert.ok(f[0].unfold>.99&&f[1].unfold<.01&&f[2].unfold>.99&&f[3].unfold>.99,id);
 }
});

test('R92 sphere does not expose flat development nor claim paper-fold animation',()=>{
 const m=createMathModel({type:'sphere',params:{r:3}});
 assert.equal(m.supportsUnfold,false);
 const z=spatialMotionFrame({id:'9-11-C02',type:'sphere',seconds:3,deep:true,supportsUnfold:false});
 assert.equal(z.kind,'sphere');
 assert.match(source('src/curriculum/Grade9Lab.js'),/if\(!id\.startsWith\('9-11'\)\)actions\.append/);
 disposeObject(m);
});

test('R92 model no longer has permanently visible orange triangular prism/pyramid midsection',()=>{
 const g=source('src/geometry.js');
 assert.ok(!g.includes('triangles(midPts,[[0,2,1]],0xb45309)'));
 assert.ok(!g.includes('triangles(sPts,[[0,3,2,1]],0xb45309)'));
 for(const [type,params] of [['triPrism',{a:4,h:5}],['squarePyramid',{a:4,h:5}],['trianglePyramid',{a:4,h:5}]]){
  const m=createMathModel({type,params});
  const colors=new Set();m.traverse(obj=>{if(obj.isMesh&&obj.material?.color)colors.add(obj.material.color.getHex());});
  assert.ok(colors.has(0x1d4ed8),type+' needs semantic blue base');
  if(type==='triPrism')assert.ok(colors.has(0x15803d),type+' needs green comparison base');
  disposeObject(m);
 }
});

test('R92 middle segment Grade8 now has visible construction differences between 0, 3 and 6 seconds',()=>{
 const p=grade8Defaults('8-03-C03');
 const frames=[0,3,6].map(t=>geometryOnly(grade8SVGScene('8-03-C03',p,t)));
 assert.equal(new Set(frames).size,3);
 assert.match(frames[0],/polygon/);
 assert.match(frames[2],/polygon/);
});

test('R92 preserves constant height during grade11 volume section and constant x during grade12 folding',()=>{
 const g11=source('src/curriculum/Grade11Lab.js'),g12=source('src/curriculum/Grade12Lab.js');
 assert.match(g11,/this\.id\.startsWith\('11-09'\)\?0:this\.t/);
 assert.match(g12,/this\.id==='12-03-C02'\?0:this\.t/);
});

test('R92 7-12 3D teaching guides appear outside stage and announce phase',()=>{
 const core=source('src/curriculum/spatial-educational-motion.mjs');
 assert.match(core,/guide\.state\.textContent/);
 for(const grade of [7,8,9,11,12]){
  const f=source(`src/curriculum/Grade${grade}Lab.js`);
  assert.match(f,/mountSpatialLessonGuide/);
  assert.match(f,/updateSpatialLessonGuide/);
  assert.match(f,/this\.spatialFrame\?\.phase/);
 }
});

test('R92 SGK museum linked cards open the teaching Lab rather than a static scene',()=>{
 const f=source('src/curriculum/CurriculumExplorer.js');
 assert.match(f,/this\.renderStage\(canonical,family\)/);
 assert.match(f,/if\(mode\.relatedExhibit\)/);
});
