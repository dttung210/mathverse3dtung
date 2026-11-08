import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import {R106_HERITAGE} from '../dual/discovery-r106/heritage-additions.mjs';
import {R106_REAL_PHOTOS} from '../dual/discovery-r106/gallery-real-photos.mjs';
import {roomBMathSVG} from '../dual/discovery-r106/gallery-svg.mjs';
import {GALLERY_ITEMS,GALLERY_COUNTS,GLOBE_MAP_ITEMS} from '../dual/discovery-r102/catalog.mjs';
import {DISCOVERY_ALL_ARTWORKS,DISCOVERY_COLLECTIONS,groupGalleryByCollection} from '../dual/discovery-data.mjs';
import {isReadyToShowPhotograph,MAX_GALLERY_PHYSICAL_FRAMES} from '../dual/discovery-r95/ui/catalog-merge-r95.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(f)=>fs.readFileSync(path.join(root,f),'utf8');

test('Six new architecture records have unique IDs, valid geographic coordinates and Sketchfab UIDs',()=>{
 assert.equal(R106_HERITAGE.length,6);
 assert.equal(new Set(R106_HERITAGE.map(x=>x.id)).size,6);
 for(const item of R106_HERITAGE){
  assert.match(item.uid,/^[0-9a-f]{32}$/i);
  assert.match(item.source,/^https:\/\/sketchfab\.com\//);
  assert.match(item.photoSource,/^https:\/\/commons\.wikimedia\.org\//);
  assert.ok(item.author&&item.photoAuthor&&item.photoLicense&&item.history&&item.math&&item.formula);
  assert.ok(Number.isFinite(item.lat)&&Number.isFinite(item.lng));
  assert.equal(item.glbStatus,'sketchfab_embed_not_local_glb');
 }
});
test('UNESCO site classification does not conflate UNESCO with New7Wonders voting',()=>{
 assert.equal(R106_HERITAGE.filter(x=>x.zone==='unesco').length,3);
 assert.equal(R106_HERITAGE.filter(x=>x.zone==='other').length,3);
 assert.ok(R106_HERITAGE.find(x=>x.id==='r106_hagia').history.includes('không phải một hồ sơ UNESCO độc lập'));
 assert.ok(R106_HERITAGE.find(x=>x.id==='r106_pantheon').history.includes('không phải hồ sơ UNESCO riêng biệt'));
});
test('Preserve fourteen world wonders + four old structures + six new = 24 on map/globe',()=>{
 assert.equal(GLOBE_MAP_ITEMS.length,34);
 assert.equal(GALLERY_ITEMS.length,25);
 assert.deepEqual(GALLERY_COUNTS,{unesco:11,new7:3,other:11});
 assert.equal(new Set(GLOBE_MAP_ITEMS.map(x=>x.id)).size,34);
 assert.equal(GLOBE_MAP_ITEMS.filter(x=>x.group==='ancient').length,7);
 assert.equal(GLOBE_MAP_ITEMS.filter(x=>x.group==='new2007').length,7);
});
test('Room B retains previous collection and adds exactly 11 real-image items with attribution',()=>{
 assert.equal(R106_REAL_PHOTOS.length,11);
 assert.equal(new Set(R106_REAL_PHOTOS.map(x=>x.id)).size,11);
 assert.ok(DISCOVERY_ALL_ARTWORKS.length>=51);
 assert.ok(DISCOVERY_COLLECTIONS.includes('Ảnh thật và hình học R106'));
 const group=groupGalleryByCollection(DISCOVERY_ALL_ARTWORKS).get('Ảnh thật và hình học R106');
 assert.equal(group.length,11);
 for(const item of group){
  assert.ok(isReadyToShowPhotograph(item));
  assert.equal(item.geometry2DApproved,true);
  assert.equal(item.geometry3DApproved,false);
  assert.match(item.photo.commonsPage,/commons\.wikimedia\.org/);
  assert.match(item.media.photo,/Special:FilePath/);
  assert.match(item.latex,/\S/);
  assert.match(roomBMathSVG(item),/<svg[\s\S]*<\/svg>/);
 }
});
test('Room B shows 8 existing frames only and has a pager to display remaining 3 photos',()=>{
 assert.equal(MAX_GALLERY_PHYSICAL_FRAMES,8);
 const ui=read('dual/discovery-ui.mjs');
 assert.match(ui,/r106-room-b-pager/);
 assert.match(ui,/colItems\.slice\(galleryPage\*MAX_GALLERY_PHYSICAL_FRAMES,/);
 assert.match(ui,/setGalleryCollectionItems\?\.\(frameSlice\)/);
 assert.match(ui,/roomBMathSVG\(item\)/);
 assert.match(ui,/galleryPage=0/);
});
test('Six native THREE teaching geometry abstractions are actual 3D objects; not claimed as GLB scans',async()=>{
 const vendor=pathToFileURL(path.join(root,'vendor/three.module.js')).href;
 const src=read('dual/discovery-r102/geometry-models.mjs')
  .replace("import * as THREE from '/vendor/three.module.js';",`import * as THREE from '${vendor}';`);
 const {createTeachingModel,disposeTeachingModel}=await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(src));
 const THREE=await import(vendor);
 for(const record of R106_HERITAGE){
  const g=createTeachingModel(record.shape);const box=new THREE.Box3().setFromObject(g);
  const dims=box.getSize(new THREE.Vector3());let meshes=0;
  g.traverse(node=>{if(node.isMesh)meshes++;});
  assert.ok(meshes>=3,record.id+': '+meshes+' meshes');
  assert.ok(dims.x>0&&dims.y>0&&dims.z>0,record.id+': bad 3D bounds');
  assert.match(g.userData.modelSource,/educational geometric abstraction/);
  disposeTeachingModel(g);
 }
});
test('All six new architecture entries have a corresponding SVG geometry type',()=>{
 const svgSource=read('dual/discovery-r102/geometry-2d.mjs');
 for(const item of R106_HERITAGE)assert.ok(svgSource.includes(`case '${item.shape}'`),item.shape);
});
test('UNESCO room has enlarged spatial layout and preserves approved R98 Parthenon scan',()=>{
 const room=read('dual/discovery-r102/exhibition-room.mjs');
 assert.match(room,/R98_APPROVED_ARCHITECTURE_ONLY/);
 assert.match(room,/oldWest\.forEach/);
 assert.match(room,/south\.forEach/);
 assert.match(room,/oldEast\.forEach/);
 assert.match(room,/createTeachingModel\(item\.shape\)/);
 assert.ok(fs.statSync(path.join(root,'dual/discovery-r98/assets/unesco_parthenon_glb.glb')).size>20_000_000);
});
test('No new proprietary Sketchfab model is presented as locally downloaded GLB',()=>{
 for(const item of R106_HERITAGE){assert.equal(item.modelType,'geometry_conceptual');assert.ok(item.source.startsWith('https://'));}
 const manifest=JSON.parse(read('dual/discovery-r103/assets/approved-local-models.json'));
 assert.ok(Array.isArray(manifest.models));
 for(const rec of manifest.models.filter(x=>x.id?.startsWith('r106_'))){
  assert.match(rec.license,/CC\s*BY/i);
  assert.doesNotMatch(rec.license,/NC|ND/i);
  assert.ok(rec.author&&rec.sha256&&rec.verifiedWebGL===true);
  assert.ok(fs.existsSync(path.join(root,'dual/discovery-r103/assets',rec.file)),rec.file);
 }
});
