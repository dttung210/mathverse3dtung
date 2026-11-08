import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {R102_CATALOG,GALLERY_ITEMS,GALLERY_COUNTS,GROUP_COLORS,R102_BY_ID} from '../dual/discovery-r102/catalog.mjs';
const root=path.dirname(fileURLToPath(new URL('../package.json',import.meta.url)));
const read=p=>readFileSync(path.join(root,p),'utf8');
test('14 original architectural wonders and ten geometrical structures (R106), not R99 natural wonders',()=>{
 assert.equal(R102_CATALOG.length,24);
 assert.equal(R102_CATALOG.filter(x=>x.group==='ancient').length,7);
 assert.equal(R102_CATALOG.filter(x=>x.group==='new2007').length,7);
 assert.equal(R102_CATALOG.filter(x=>x.group==='other').length,10);
 assert.equal(new Set(R102_CATALOG.map(x=>x.id)).size,24);
 for(const item of R102_CATALOG){assert.ok(Number.isFinite(item.lat)&&Number.isFinite(item.lng));assert.ok(item.history&&item.country&&item.name);}
});
test('three UNESCO room zones, 5 UNESCO + verified R98 Parthenon, three New7Wonders, seven others',()=>{
 assert.deepEqual(GALLERY_COUNTS,{unesco:5,new7:3,other:7});
 assert.equal(GALLERY_ITEMS.length,15);
 assert.ok(GALLERY_ITEMS.every(x=>x.shape&&x.inGallery));
 assert.equal(GROUP_COLORS.ancient!==GROUP_COLORS.new2007,true);
 assert.equal(GROUP_COLORS.other!==GROUP_COLORS.ancient,true);
 assert.equal(R102_BY_ID.get('wonder_greatwall').inGallery,false);
 assert.equal(R102_BY_ID.get('wonder_petra').inGallery,false);
});
test('R103 physical podiums use licensed GLB or proximity Sketchfab, and original vetted GLB remains',()=>{
 const text=read('dual/discovery-r102/exhibition-room.mjs');
 assert.match(text,/createTeachingModel\(item.shape\)/);
 assert.match(text,/R104_NATIVE_THREE_MODEL_/);
 assert.match(text,/R98_APPROVED_ARCHITECTURE_ONLY/);
 assert.match(text,/const pedestal=disk\(g,/);
 assert.match(text,/installNativeGLB/);
 assert.match(text,/THREE.Group\(\)/);
 assert.match(text,/west\.forEach/);assert.match(text,/south\.forEach/);assert.match(text,/east\.forEach/);
 assert.match(text,/world\.restrict=/);
 const glb=path.join(root,'dual/discovery-r98/assets/unesco_parthenon_glb.glb');assert.ok(existsSync(glb));
});
test('scientifically correct mathematics: Golden Gate approximate parabola vs Gateway Arch catenary',()=>{
 assert.equal(R102_BY_ID.get('other_golden_gate').shape,'bridge');
 assert.match(R102_BY_ID.get('other_golden_gate').formula,/x\^2/);
 assert.match(R102_BY_ID.get('other_gateway').formula,/cosh/);
 const code=read('dual/discovery-r102/geometry-models.mjs');
 assert.match(code,/Math\.cosh/);
 assert.match(code,/function bridge/);
});
test('R103 corrects over-filtering: restore original Zeus/Colossus model, Rhodes real harbor photo',()=>{
 const z=R102_BY_ID.get('wonder_zeus'),r=R102_BY_ID.get('wonder_colossus');
 assert.equal(z.modelIsSiteOnly,false);assert.equal(r.modelIsSiteOnly,false);
 assert.ok(z.uid.startsWith('3ef14e'));assert.ok(r.uid.startsWith('011ee3'));
 assert.equal(z.photoWiki,'Olympia,_Greece');assert.equal(r.photoWiki,'Rhodes_(city)');
 assert.match(r.photoUrl,/upload.wikimedia.org/);
 assert.match(r.photoSource,/Mandraki_colosseus_harbour_rhodes.jpg/);
});
test('R100 original modal styles preserved, extra math 3D/2D tabs for gallery items',()=>{
 const ui=read('dual/discovery-r100/wonders-ui.mjs'),css=read('dual/discovery-r100/wonders.css');
 for(const classname of ['r100-window','r100-top','r100-tools','r100-list','r100-details','r100-media-grid','r100-viewer']){
  assert.ok(ui.includes(classname));assert.ok(css.includes('.'+classname));
 }
 assert.match(ui,/!w\.inGallery/);
 assert.match(ui,/r102-tab-3d/);assert.match(ui,/r102-tab-2d/);
 assert.match(ui,/r100-back-room/);
 assert.match(ui,/makeGeometryInspector/);
});
test('world map has 24 pins and opens photo + biography + Sketchfab, no UNESCO room link',()=>{
 const map=read('dual/discovery-r97/world-map-ui.mjs');
 assert.match(map,/R102_CATALOG/);
 assert.match(map,/curated\.push\(\.\.\.R102_CATALOG\)/);
 assert.match(map,/if\(wonder\)onOpen\?\.\(it\.id\)/);
 assert.doesNotMatch(map,/id="r97-map-return"/);
 const app=read('dual/app.mjs');
 assert.match(app,/upgradeDiscoveryWondersR102/);
 assert.match(app,/wondersUI\.open\(id,'map'\)/);
});

test('fifteen selected structure classes have independent 2D SVG projections with math labels',async()=>{
 const {geometricSVG}=await import('../dual/discovery-r102/geometry-2d.mjs');
 const shapes=new Set(GALLERY_ITEMS.map(x=>x.shape));
 assert.equal(shapes.size,15);
 for(const item of GALLERY_ITEMS){const svg=geometricSVG(item);
  assert.match(svg,/<svg/);assert.match(svg,/<\/svg>/);assert.match(svg,/viewBox="0 0 700 520"/);
  assert.ok(svg.includes(item.caption),'missing math caption for '+item.name);
 }
 assert.match(geometricSVG(R102_BY_ID.get('other_gateway')),/dây xích ngược/);
 assert.match(geometricSVG(R102_BY_ID.get('other_golden_gate')),/parabol/);
});

test('geometry inspector has real 3D Three renderer, orthographic option and cleanup',()=>{
 const source=read('dual/discovery-r102/geometry-viewer.mjs');
 assert.match(source,/THREE.WebGLRenderer/);
 assert.match(source,/THREE.OrthographicCamera/);
 assert.match(source,/THREE.PerspectiveCamera/);
 assert.match(source,/disposeTeachingModel/);
 assert.match(source,/forceContextLoss/);
});

test('R102 viewer renders SVG in 2D tab, Three canvas in 3D tab',()=>{
 const ui=read('dual/discovery-r100/wonders-ui.mjs');
 assert.match(ui,/geometricSVG\(item\)/);
 assert.match(ui,/tab==='2d'/);
 assert.match(ui,/tab==='3d'/);
 assert.match(ui,/!w\.inGallery/);
 assert.match(ui,/r102-copy-latex/);
});

test('The room extension hides only original shell and leaves R98 approved scan mounted',()=>{
 const world=read('dual/discovery-r102/exhibition-room.mjs');
 assert.match(world,/w=104,d=92/);
 assert.match(world,/DISCOVERY_ROOM_FLOOR/);
 assert.match(world,/room\.getObjectByName\('R98_APPROVED_ARCHITECTURE_ONLY'\)/);
 assert.match(world,/R102_LARGE_GALLERY_SHELL/);
 assert.match(world,/return null; \/\/ Do not trigger obsolete/);
});
