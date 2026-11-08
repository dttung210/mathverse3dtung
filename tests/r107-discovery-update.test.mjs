import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {R107_HERITAGE} from '../dual/discovery-r107/heritage-additions.mjs';
import {R107_REAL_PHOTOS} from '../dual/discovery-r107/gallery-real-photos.mjs';
import {GALLERY_ITEMS,GALLERY_COUNTS,GLOBE_MAP_ITEMS,R102_BY_ID} from '../dual/discovery-r102/catalog.mjs';
import {DISCOVERY_ALL_ARTWORKS,DISCOVERY_COLLECTIONS,groupGalleryByCollection,MAX_GALLERY_PHYSICAL_FRAMES} from '../dual/discovery-data.mjs';
import {roomBMathSVG_R107} from '../dual/discovery-r107/gallery-svg.mjs';
import {resolveR107CommonsCategory} from '../dual/discovery-photo-r96.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

test('R107 contains 10 new non-duplicate architecture records with corrected UNESCO categories',()=>{
 assert.equal(R107_HERITAGE.length,10);
 assert.equal(new Set(R107_HERITAGE.map(x=>x.id)).size,10);
 assert.equal(R107_HERITAGE.filter(x=>x.zone==='unesco').length,6);
 assert.equal(R107_HERITAGE.filter(x=>x.zone==='other').length,4);
 for(const a of R107_HERITAGE){
  assert.match(a.uid,/^[0-9a-f]{32}$/i);
  assert.match(a.sketchfabUrl,/^https:\/\/sketchfab\.com/);
  assert.ok(a.history&&a.math&&a.caption&&a.formula&&a.photoWiki&&a.photoSource&&a.author);
  assert.ok(Number.isFinite(a.lat)&&Number.isFinite(a.lng));
  assert.equal(a.glbStatus,'sketchfab_embed_only_no_licensed_glb');
  assert.equal(a.modelType,'geometry_conceptual');
  assert.ok(R102_BY_ID.has(a.id));
 }
 assert.equal(R102_BY_ID.get('r107_lotus').whc,null);
 assert.equal(R102_BY_ID.get('r107_sagrada').whc,320);
 assert.match(R102_BY_ID.get('r107_sagrada').history,/chỉ ghi danh Mặt đứng Giáng Sinh/);
 assert.equal(R102_BY_ID.get('r107_himeji').sketchfabStatus,'candidate_needs_review');
});

test('All 34 geolocatable points retained; 25 galleries, 3 original New7Wonders in both pages',()=>{
 assert.equal(GLOBE_MAP_ITEMS.length,34);
 assert.equal(GALLERY_ITEMS.length,25);
 assert.deepEqual(GALLERY_COUNTS,{unesco:11,new7:3,other:11});
 assert.equal(GLOBE_MAP_ITEMS.filter(x=>x.group==='ancient').length,7);
 assert.equal(GLOBE_MAP_ITEMS.filter(x=>x.group==='new2007').length,7);
 assert.equal(new Set(GLOBE_MAP_ITEMS.map(x=>x.id)).size,34);
});

test('R107 uses second alternating physical exhibition, does not crowd 25 pedestals simultaneously',()=>{
 const world=read('dual/discovery-r102/exhibition-room.mjs');
 assert.match(world,/const old=GALLERY_ITEMS\.filter\(x=>!x\.id\.startsWith\('r107_'\)\)/);
 assert.match(world,/const newer=GALLERY_ITEMS\.filter\(x=>x\.id\.startsWith\('r107_'\)\)/);
 assert.match(world,/currentGalleryPage=0/);
 assert.match(world,/g\.visible=page==='shared'\|\|page===currentGalleryPage/);
 assert.match(world,/world\.r107SetGalleryPage=setGalleryPage/);
 assert.match(world,/hits\.filter\(visibleInHierarchy\)/);
 assert.match(world,/if\(!s\.group\.visible\)continue/);
 assert.match(world,/R98_APPROVED_ARCHITECTURE_ONLY/);
 assert.match(world,/ensurePhotosForPage/);
 assert.match(read('dual/index.html'),/r107\/gallery-pages\.css/);
});

test('Room B preserves earlier collections; adds exactly 17 tagged real-world photo topics',()=>{
 assert.equal(R107_REAL_PHOTOS.length,17);
 assert.equal(new Set(R107_REAL_PHOTOS.map(x=>x.id)).size,17);
 assert.equal(DISCOVERY_ALL_ARTWORKS.length,68);
 assert.ok(DISCOVERY_COLLECTIONS.includes('Ảnh R107 · Thiên nhiên'));
 assert.ok(DISCOVERY_COLLECTIONS.includes('Ảnh R107 · Kỹ thuật'));
 const grouped=groupGalleryByCollection(DISCOVERY_ALL_ARTWORKS);
 assert.equal(grouped.get('Ảnh R107 · Thiên nhiên').length,9);
 assert.equal(grouped.get('Ảnh R107 · Kỹ thuật').length,8);
 assert.equal(grouped.get('Ảnh thật và hình học R106').length,11);
 assert.equal(MAX_GALLERY_PHYSICAL_FRAMES,8);
 for(const a of R107_REAL_PHOTOS){
  assert.equal(a.photo.status,'pending');
  assert.equal(a.photoApproved,false);
  assert.ok(a.photo.commonsCategory.startsWith('Category:'));
  assert.ok(a.wikipediaTitle&&a.media.source&&a.latex);
  assert.match(roomBMathSVG_R107(a),/<svg[\s\S]*<\/svg>/);
 }
});

test('Room B loads actual category photo with per-file author and license, falls back to labelled diagram',()=>{
 const resolver=read('dual/discovery-photo-r96.mjs'),world=read('dual/discovery-world.mjs');
 assert.match(resolver,/resolveR107CommonsCategory/);
 assert.match(resolver,/meta\.LicenseShortName/);
 assert.match(resolver,/CC\\s\*BY/);
 assert.match(resolver,/gcmtitle:category/);
 assert.match(world,/resolveDiscoveryPhoto\(item\)\.then/);
 assert.match(world,/slot\.panel\.material\.map=texture/);
 assert.match(world,/slot\.photoRequestId!==requestId/);
 assert.match(world,/slot\.panel\.userData\.photoCredit/);
});

test('Mocked Wikimedia category selection accepts CC BY photo, rejects CC BY-NC item',async()=>{
 const orig=globalThis.fetch;
 const sample={id:'sample',photo:{commonsCategory:'Category:Sample_photos'}};
 const payload=license=>({query:{pages:{'12':{title:'File:Real photograph.jpg',imageinfo:[{mime:'image/jpeg',thumburl:'https://upload.wikimedia.org/abc.jpg',extmetadata:{LicenseShortName:{value:license},Artist:{value:'<b>Test photographer</b>'}}}]}}}});
 try{
  globalThis.fetch=async()=>({ok:true,json:async()=>payload('CC BY-SA 4.0')});
  const approved=await resolveR107CommonsCategory(sample);
  assert.equal(approved.verified,true);assert.equal(approved.author,'Test photographer');assert.match(approved.source,/File:Real_photograph.jpg/);
  globalThis.fetch=async()=>({ok:true,json:async()=>payload('CC BY-NC 4.0')});
  const rejected=await resolveR107CommonsCategory(sample);assert.equal(rejected,null);
 }finally{globalThis.fetch=orig;}
});

test('All 10 teaching previews are actual 3D meshes with valid finite bounds',async()=>{
 const vendor=pathToFileURL(path.join(root,'vendor/three.module.js')).href;
 const src=read('dual/discovery-r102/geometry-models.mjs').replace("import * as THREE from '/vendor/three.module.js';",`import * as THREE from '${vendor}';`);
 const {createTeachingModel,disposeTeachingModel}=await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(src));
 const THREE=await import(vendor);
 for(const rec of R107_HERITAGE){
  const m=createTeachingModel(rec.shape);let meshes=0;
  m.traverse(n=>{if(n.isMesh)meshes++;});
  const v=new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3());
  assert.ok(meshes>=3,`${rec.id}: only ${meshes} meshes`);
  assert.ok(v.x>0&&v.y>0&&v.z>0&&[v.x,v.y,v.z].every(Number.isFinite),rec.id);
  assert.match(m.userData.modelSource,/educational geometric abstraction/);
  disposeTeachingModel(m);
 }
});

test('All 10 R107 monuments have an explicit 2D geometry lesson',()=>{
 const svg=read('dual/discovery-r102/geometry-2d.mjs');
 for(const rec of R107_HERITAGE)assert.ok(svg.includes(`case '${rec.shape}'`),rec.shape);
});

test('World map recognizes R106 + R107 records as eligible photo and Sketchfab popups',()=>{
 const src=read('dual/discovery-r97/world-map-ui.mjs');
 assert.match(src,/R102_BY_ID\.has\(it\.id\)/);
 assert.match(src,/if\(wonder\)onOpen\?\.\(it\.id\)/);
 assert.match(src,/R102_CATALOG\.length/);
});
