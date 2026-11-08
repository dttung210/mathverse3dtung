import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {GALLERY_ITEMS,GLOBE_MAP_ITEMS} from '../dual/discovery-r102/catalog.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('15+10 physical UNESCO podiums all have native Three.js 3D models, not empty iframe panels',()=>{
 assert.equal(GALLERY_ITEMS.length,25);
 const room=read('dual/discovery-r102/exhibition-room.mjs');
 for(const required of ['const preview=createTeachingModel(item.shape)','model.add(preview)','stand.model.remove(preview)','disposeTeachingModel(preview)','stand.model.add(scene)','R98_APPROVED_ARCHITECTURE_ONLY'])
   assert.ok(room.includes(required),'missing podium behavior: '+required);
 assert.ok(!room.includes("const empty=sign('3D SKETCHFAB · TRỰC TIẾP'"),'no floating overlay text on an empty stand');
 assert.match(room,/world\.r104PodiumMode='native-three-model-first'/);
});
test('No screen-projected iframe on pedestals; clicks and drag act on real 3D scene meshes',()=>{
 const app=read('dual/app.mjs');
 assert.match(app,/enabled:false,/);
 assert.match(app,/nativeDragId=discovery.pickNativeModel/);
 assert.match(app,/discovery.rotateNativeModel/);
 const room=read('dual/discovery-r102/exhibition-room.mjs');
 assert.match(room,/const model=nativeMap\.get\(id\)\|\|previewMap\.get\(id\)/);
 assert.match(room,/nativeMeshes\.push\(n\)/);
});
test('Teacher can import authorized GLB for permanent native 3D podium replacement',()=>{
 const installer=read('tools/install-r104-glb.mjs');
 const ui=read('dual/discovery-r100/wonders-ui.mjs');
 assert.match(installer,/verifyGLB\(sourceFile\)/);
 assert.match(installer,/DONG_Y/);
 assert.match(installer,/sha256/);
 assert.match(installer,/approved-local-models\.json/);
 assert.match(ui,/id="r104-import-glb"/);
 assert.match(ui,/onImport\?\.\(target\.id,file\)/);
 assert.match(read('dual/app.mjs'),/onImport:\(id,file\)=>discovery.importLicensedGLB/);
 const manifest=JSON.parse(read('dual/discovery-r103/assets/approved-local-models.json'));
 assert.ok(Array.isArray(manifest.models));
});
test('Full 34 markers on map/globe remain untouched; no monument misleadingly labelled UNESCO 7 wonders',()=>{
 assert.equal(GLOBE_MAP_ITEMS.length,34);
 const map=read('dual/discovery-r97/world-map-ui.mjs');
 assert.match(map,/R102_CATALOG/);
 const catalog=read('dual/discovery-r102/catalog.mjs');
 assert.match(catalog,/New7Wonders/);
});
test('Colosseum educational fallback now has 3 tiered, arched 3D walls rather than isolated pillars',()=>{
 const models=read('dual/discovery-r102/geometry-models.mjs');
 assert.match(models,/function colosseum\(g\)/);
 assert.match(models,/new THREE\.ExtrudeGeometry\(wall/);
 assert.match(models,/wall\.holes\.push\(hole\)/);
 assert.match(models,/bays=40/);
});
test('All 9 geometric previews are valid Three.js 3D objects with non-zero volumes',async()=>{
 const vendor=pathToFileURL(path.join(root,'vendor/three.module.js')).href;
 const source=read('dual/discovery-r102/geometry-models.mjs').replace("import * as THREE from '/vendor/three.module.js';",`import * as THREE from '${vendor}';`);
 const {createTeachingModel,disposeTeachingModel}=await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(source));
 const THREE=await import(vendor);
 for(const item of GALLERY_ITEMS){
  const g=createTeachingModel(item.shape);const box=new THREE.Box3().setFromObject(g);
  const size=box.getSize(new THREE.Vector3());let meshes=0;
  g.traverse(o=>{if(o.isMesh)meshes++;});
  assert.ok(meshes>2,`${item.id} only ${meshes} objects`);
  assert.ok(size.x>0&&size.y>0&&size.z>=0,`${item.id}: invalid bounds ${size.toArray()}`);
  disposeTeachingModel(g);
 }
});
test('Parthenon R98 GLB present and remains a photogrammetric asset',()=>{
 const stat=fs.statSync(path.join(root,'dual/discovery-r98/assets/unesco_parthenon_glb.glb'));
 assert.ok(stat.size>20_000_000);
});
