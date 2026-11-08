import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {getGeometry2DHandles,patchFrom2DHandle} from '../src/studio/geometry2d-handles.js';
import {getSolidHandles,clampHandleValue} from '../src/studio/solid-handles.js';
import {Geometry2DViewer} from '../src/viewers/Geometry2DViewer.js';
import {Solid3DViewer} from '../src/viewers/Solid3DViewer.js';
import {buildGeometry2DScene} from '../src/math/geometry2d-scenes.js';
import {TYPES} from '../src/math-core.js';
import {detectModality} from '../src/data/migrate-v2-v4-v5.js';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const defaults=t=>Object.fromEntries(Object.entries(TYPES[t]?.params||{}).map(([k,a])=>[k,a[3]]));
const types2d=['polygon','circle','trapezoid','symmetryAxis','midSegment','triangle','pythagoras','parallelLines','similarTriangles','congruentTriangles','ellipse','hyperbola','circleInscribed','cyclicQuad','vectorDot','trigTriangle','lineOxy'];
const types3d=['squarePyramid','trianglePyramid','triPrism','tetrahedron','cube','cuboid','cylinder','cone','sphere','prismQuad','revolvedSolid','oxyzAxes','oxyzVector','crossSection','sphereSection','oxyzSphere','frustumPyramid'];
test('V10 does not load external drawing studio or optional web iframe',()=>{
 const src=read('src/main.js')+read('src/ui/LabShell.js')+read('server/server.mjs')+read('index.html');
 assert.doesNotMatch(src,/geogebra|deployggb|\.ggb|GGBApplet/i);
 assert.equal(fs.existsSync(new URL('../src/integrations/geogebra',import.meta.url)),false);
 assert.match(read('server/server.mjs'),/default-src 'self'/);
 assert.match(read('package.json'),/"version": "(?:10|11|12|13|14|15)\.(?:0|1)\.0"/);
});
test('V10 has separate mouse-resizable model library, viewport and inspector',()=>{
 const lab=read('src/ui/LabShell.js'),css=read('src/studio/v10-layout.css');
 for(const marker of ['lab-resize-left','lab-resize-right','lab-btn-frame','_setupPanelResize','lab-btn-tool-edit','lab-btn-tool-orbit','v10-show-3d-handles','v10-show-2d-handles'])assert.ok(lab.includes(marker),marker);
 assert.match(css,/grid-template-columns:var\(--v10-left\).*var\(--v10-right\)/);
});
test('16+ types expose parameter drag handles inside the 2D drawing stage',()=>{
 for(const type of types2d){
  const p=defaults(type),h=getGeometry2DHandles(type,p);
  assert.ok(h.length>0,type);
  for(const item of h){
   assert.ok(item.pos.every(Number.isFinite),type+item.key);
   const changed=patchFrom2DHandle(type,p,item,item.pos[0]+.28,item.pos[1]+.43);
   assert.ok(changed&&Number.isFinite(changed[item.key]),type+item.key);
   const range=TYPES[type].params[item.key];
   assert.ok(changed[item.key]>=range[1]&&changed[item.key]<=range[2],type+item.key);
  }
 }
});
test('trapezoid drag respects greater base and smaller base relationship',()=>{
 const p={a:7,b:4,h:3};
 const a=getGeometry2DHandles('trapezoid',p).find(x=>x.key==='a');
 const b=getGeometry2DHandles('trapezoid',p).find(x=>x.key==='b');
 assert.ok(patchFrom2DHandle('trapezoid',p,a,1,0).a>p.b);
 assert.ok(patchFrom2DHandle('trapezoid',p,b,30,0).b<p.a);
});
test('2D circle direct pointer drag updates its radius and emits a state change',()=>{
 let events=0;const viewer=new Geometry2DViewer({id:'test-circle',grade:6,type:'circle',title:'C',params:{r:2}}, {onParametersChange:()=>events++});
 viewer.canvas={getBoundingClientRect:()=>({left:0,top:0}),style:{}};
 viewer.render=()=>{};
 viewer.toMath=()=>[4,0];
 viewer.dragParameter=getGeometry2DHandles('circle',viewer.params)[0];
 viewer._onPointerMove({clientX:12,clientY:10});
 assert.equal(viewer.params.r,4);
 assert.ok(events>0);
 viewer._onPointerUp();
 assert.equal(viewer.dragParameter,null);
});
test('constrained live scenes never collapse after valid editable dimensions change',()=>{
 const inputs=[['circle',{r:3}],['trapezoid',{a:6,b:3,h:4}],['triangle',{a:3,b:5}],['ellipse',{a:4,b:2}],['similarTriangles',{a:5,k:.5}]];
 for(const [type,p] of inputs){
  const defs=getGeometry2DHandles(type,p);
  const patch=patchFrom2DHandle(type,p,defs[0],...defs[0].pos);
  const scene=buildGeometry2DScene(type,{...p,...patch},8);
  assert.ok(scene.primitives.length,type);
 }
});
test('17 3D geometry families expose draggable dimension or coordinate handles',()=>{
 for(const type of types3d){
  const p=defaults(type);const grips=getSolidHandles(type,p);
  assert.ok(grips.length,type);
  for(const grip of grips){
    assert.ok(grip.pos.every(Number.isFinite),type+grip.key);
    assert.ok(grip.axis.every(Number.isFinite),type+grip.key);
    assert.ok(Number.isFinite(p[grip.key]),type+grip.key);
    assert.ok(Number.isFinite(clampHandleValue(type,grip.key,p[grip.key])),type+grip.key);
  }
 }
});
test('3D direct manipulation retains projection and model parameter state',()=>{
 const p={a:4,h:3};
 const v=new Solid3DViewer({id:'t',grade:8,title:'P',type:'squarePyramid',params:p});
 assert.equal(v.getEditableHandleCount(),2);
 v._rebuildShape=()=>{}; // No DOM canvas is needed for the pure parameter test.
 v.updateParameters({h:4.5});
 assert.equal(v.params.h,4.5);
 v.setToolMode('orbit');assert.equal(v.toolMode,'orbit');
 v.setToolMode('edit');assert.equal(v.toolMode,'edit');
});
test('V10 retains base collection of 63 models while preserving four viewers',()=>{
 const c=JSON.parse(read('data/catalog.json'));
 assert.equal(c.items.length,63);
 const grades=[...new Set(c.items.map(x=>x.grade))].sort((a,b)=>a-b);
 assert.deepEqual(grades,[6,7,8,9,10,11,12]);
 for(const f of ['Solid3DViewer','Geometry2DViewer','FunctionGraphViewer','StatisticsChartViewer'])assert.ok(fs.existsSync(new URL('../src/viewers/'+f+'.js',import.meta.url)),f);
});

test('all parametric 2D tools construct their own intended scenes, not a fallback parallelogram',()=>{
 for(const type of types2d){
   const p=defaults(type);
   const viewer=new Geometry2DViewer({id:'view-'+type,grade:8,type,title:type,params:p});
   const scene=viewer._getScene();
   assert.equal(scene.type,type,'wrong drawable geometry '+type);
   assert.ok(Array.isArray(scene.primitives)&&scene.primitives.length>0,type);
   const h=getGeometry2DHandles(type,viewer.params)[0];
   const patch=patchFrom2DHandle(type,viewer.params,h,h.pos[0]+.37,h.pos[1]+.51);
   const updated=new Geometry2DViewer({id:'view-2-'+type,grade:8,type,title:type,params:{...p,...patch}});
   assert.equal(updated._getScene().type,type,'after drag '+type);
 }
});

test('every catalog 2D exhibit instantiates and creates a valid native geometry scene',()=>{
 const items=JSON.parse(read('data/catalog.json')).items;
 const group=items.filter(m=>detectModality(m.type)==='geometry2d');
 assert.ok(group.length>=15);
 for(const m of group){
   const view=new Geometry2DViewer(m);
   const scene=view._getScene();
   assert.ok(scene && Array.isArray(scene.primitives) && scene.primitives.length>0,m.id);
   for(const primitive of scene.primitives){
     if(primitive.kind==='point')assert.ok(primitive.xy?.every(Number.isFinite),m.id);
   }
 }
});
