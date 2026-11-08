import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {NATURE_WONDERS,TERRAIN_WONDERS,PENDING_WONDERS,NATURE_BY_ID} from '../dual/discovery-r99/nature-data.mjs';
import {decodeTerrarium,lonLatTile,tilePlan,tileCoords,metresPerPixel} from '../dual/discovery-r99/tile-geo.mjs';
import {getTerrainTile} from '../server/discovery-r99-nature.mjs';
import {exportNatureGLB} from '../dual/discovery-r99/export-glb.mjs';
const root=path.resolve(import.meta.dirname,'..');
test('Two different natural wonder organizations, 7 + 7, no fake UNESCO label',()=>{
 assert.equal(NATURE_WONDERS.length,14);assert.equal(new Set(NATURE_WONDERS.map(w=>w.id)).size,14);
 assert.equal(NATURE_WONDERS.filter(x=>x.list.includes('Truyền thống')).length,7);
 assert.equal(NATURE_WONDERS.filter(x=>x.list.includes('(2011)')).length,7);
 assert.equal(TERRAIN_WONDERS.length,10);assert.equal(PENDING_WONDERS.length,4);
 assert.equal(NATURE_BY_ID.get('nature_halong').country,'Việt Nam');
 for(const n of NATURE_WONDERS){assert.ok(Number.isFinite(n.lat)&&Number.isFinite(n.lng));assert.ok(n.history.length>30);}
 for(const n of PENDING_WONDERS){assert.ok(n.reason.length>40);assert.equal(n.model,'pending');}
});
test('Measured Terrarium heights are decoded in meters',()=>{
 assert.equal(decodeTerrarium(128,0,0),0);
 assert.equal(decodeTerrarium(128,10,0),10);
 assert.equal(decodeTerrarium(0,0,0),-32768);
 assert.ok(Math.abs(decodeTerrarium(128,0,128)-.5)<.01);
});
test('Mercator tiles and local ground scaling are geographical',()=>{
 assert.deepEqual(lonLatTile(0,0,1),{x:1,y:1,zoom:1});
 assert.ok(Math.abs(metresPerPixel(0,0)-156543.033928)<.001);
 const plan=tilePlan(107.18,20.9,12,3);assert.equal(tileCoords(plan).length,9);
 assert.ok(plan.pixelMetres>25&&plan.pixelMetres<50);
 for(const t of tileCoords(plan))assert.ok(t.x>=0&&t.y>=0&&t.x<4096&&t.y<4096);
});
test('Server tile proxy rejects invalid coordinates before network',async()=>{
 await assert.rejects(()=>getTerrainTile('terrain',25,0,0),/không hợp lệ/);
 await assert.rejects(()=>getTerrainTile('arbitrary',1,0,0),/không hợp lệ/);
 await assert.rejects(()=>getTerrainTile('satellite',3,9,0),/không hợp lệ/);
});
test('3D-first assets and integration wiring exist',()=>{
 for(const p of ['dual/discovery-r99/terrain3d.mjs','dual/discovery-r99/nature-ui.mjs','dual/discovery-r99/nature-room.mjs','dual/discovery-r99/export-glb.mjs','dual/discovery-r99/nature.css'])assert.ok(fs.statSync(path.join(root,p)).size>1000,p);
 const app=fs.readFileSync(path.join(root,'dual/app.mjs'),'utf8');
 assert.match(app,/upgradeDiscoveryNatureR99/);assert.match(app,/createNatureDiscoveryUI/);assert.match(app,/nature-wonder/);
 const host=fs.readFileSync(path.join(root,'server/host.mjs'),'utf8');assert.match(host,/handleR99Nature/);
 const html=fs.readFileSync(path.join(root,'dual/index.html'),'utf8');assert.match(html,/discovery-btn-nature/);
});
test('Exported GLB is glTF 2.0, real triangles, with DEM provenance',async()=>{
 const attr=(arr,n)=>({array:arr,count:arr.length/n,itemSize:n});
 const attrs={position:attr(new Float32Array([0,0,0,1,0,0,0,1,1]),3),normal:attr(new Float32Array([0,1,0,0,1,0,0,1,0]),3),uv:attr(new Float32Array([0,0,1,0,0,1]),2),color:attr(new Float32Array([1,0,0,0,1,0,0,0,1]),3)};
 const geometry={getAttribute:(name)=>attrs[name],index:{array:new Uint16Array([0,2,1])}};
 const bundle={site:TERRAIN_WONDERS[0],geometry,texture:null,stats:{spanMeters:1000,verticalExaggeration:1,resolutionMetres:30,minElevationMeters:100,maxElevationMeters:200},plan:{zoom:12}};
 const blob=exportNatureGLB(bundle),data=new DataView(await blob.arrayBuffer());
 assert.equal(data.getUint32(0,true),0x46546c67);assert.equal(data.getUint32(4,true),2);assert.equal(data.getUint32(8,true),blob.size);
 assert.equal(data.getUint32(16,true),0x4e4f534a);
 const j=new Uint8Array(await blob.arrayBuffer(),20,data.getUint32(12,true));const obj=JSON.parse(new TextDecoder().decode(j).trim());
 assert.equal(obj.asset.version,'2.0');assert.equal(obj.meshes[0].primitives[0].indices,4);
 assert.equal(obj.extras.kind,'terrain_dem_not_photogrammetry');
});
test('R99 verified Wikimedia Commons photos (14/14) and pre-built DEM+Sentinel-2 GLB models (5 priority wonders)',()=>{
 const metaPath=path.join(root,'dual/discovery-r99/photos/photos-meta.json');
 assert.ok(fs.existsSync(metaPath),'photos-meta.json must exist');
 const meta=JSON.parse(fs.readFileSync(metaPath,'utf8'));
 for(const w of NATURE_WONDERS){
  assert.equal(typeof w.dem_ready,'boolean',`${w.id} dem_ready`);
  assert.equal(w.photo_verified,true,`${w.id} photo_verified`);
  assert.equal(typeof w.reviewed_3d,'boolean',`${w.id} reviewed_3d`);
  assert.equal(w.needs_survey,w.model==='pending',`${w.id} needs_survey`);
  const m=Array.isArray(meta)?meta.find(x=>x.id===w.id):meta[w.id];
  assert.ok(m,`${w.id} in photos-meta.json`);
  assert.ok(m.author&&m.license&&m.source,`${w.id} photo provenance`);
  const jpgPath=path.join(root,'dual/discovery-r99/photos',`${w.id}.jpg`);
  assert.ok(fs.existsSync(jpgPath)&&fs.statSync(jpgPath).size>50000,`${w.id}.jpg exists and >50KB`);
 }
 const priorityIds=['nature_halong','nature_grand_canyon','nature_everest','nature_paricutin','nature_table'];
 for(const id of priorityIds){
  const w=NATURE_BY_ID.get(id);
  assert.equal(w.reviewed_3d,true,`${id} reviewed_3d`);
  assert.ok(w.cachedGlbUrl,`${id} cachedGlbUrl`);
  const glbPath=path.join(root,'dual/discovery-r99/models',`${id}_dem_s2.glb`);
  assert.ok(fs.existsSync(glbPath)&&fs.statSync(glbPath).size>500000,`${id}_dem_s2.glb exists and >500KB`);
  const buf=fs.readFileSync(glbPath);
  assert.equal(buf.readUInt32LE(0),0x46546c67,`${id} GLB magic`);
  assert.equal(buf.readUInt32LE(4),2,`${id} glTF 2.0`);
  const jsonLen=buf.readUInt32LE(12);
  const gltf=JSON.parse(buf.subarray(20,20+jsonLen).toString('utf8').trim());
  assert.equal(gltf.extras.kind,'terrain_dem_not_photogrammetry');
  assert.equal(gltf.extras.id,id);
  assert.ok(Array.isArray(gltf.textures)&&gltf.textures.length===1,`${id} has embedded Sentinel-2 texture`);
 }
});
