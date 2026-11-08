import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {glbStats,photoExt,FULL_LICENSE} from '../server/discovery-r98-curation.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const src=name=>fs.readFileSync(path.join(root,name),'utf8');
test('R98 starts with ZERO approved scans and respects source-first policy',()=>{
 const d=JSON.parse(src('dual/discovery-r98/curation.json'));
 assert.ok(Array.isArray(d.assets));
 for(const a of d.assets){
   assert.equal(a.status,'approved');
   assert.ok(a.glb?.triangles>=10000,'Approved GLB must have >=10,000 triangles');
   assert.ok(a.glb?.images>=1,'Approved GLB must have embedded texture');
   assert.ok(a.review?.checks?.compareIdentity && a.review?.checks?.comparePhoto && a.review?.checks?.compareDimensions && a.review?.checks?.compareLicense);
 }
 assert.match(src('dual/discovery-r98/catalog.mjs'),/status==='approved'/);
 assert.match(src('dual/discovery-r98/fidelity-world.mjs'),/R98_APPROVED_ARCHITECTURE_ONLY/);
 assert.doesNotMatch(src('dual/discovery-r98/scan-loader.mjs'),/cdn\.jsdelivr\.net/);
 assert.ok(fs.existsSync(path.join(root,'dual/discovery-r98/vendor/GLTFLoader.mjs')));
});
test('R98 does not show schematic 3D UNESCO on pedestals or globe/map pins',()=>{
 const world=src('dual/discovery-r98/fidelity-world.mjs');
 assert.match(world,/startsWith\('R97_UNESCO_'\)/);assert.match(world,/getR98Approved/);assert.match(world,/setWorldHeritageDots=\(\)=>/);
 const map=src('dual/discovery-r97/world-map-ui.mjs');assert.match(map,/curated=UNESCO_HERITAGE\.filter\(a=>approved\.has\(a.id\)\)/);assert.match(map,/currentSites=\[\.\.\.curated\]/);
});
test('Photo format validated using bytes, not filename',()=>{
 assert.equal(photoExt(Buffer.from([255,216,255,12,0,0,0])),'jpg');
 assert.equal(photoExt(Buffer.from([137,80,78,71,13,10,26,10,0,0])),'png');
 assert.throws(()=>photoExt(Buffer.from('this is svg')),/JPEG|PNG|WebP/);
});
test('Idealized R97 Giza and R95 column GLB are rejected as high-fidelity scan',()=>{
 for(const f of ['dual/discovery-r97/models/giza_khufu_original_ratio_geometry_not_scan.glb','dual/discovery-r95/models/parthenon_columns_8x17.glb']){
   assert.throws(()=>glbStats(fs.readFileSync(path.join(root,f))),/tam giác|texture|materials/);
 }
});
test('Only license-safe review path, explicit sources and four human checks',()=>{
 assert.ok(FULL_LICENSE.has('CC BY 4.0'));assert.ok(!FULL_LICENSE.has('CC BY-NC 4.0'));
 const backend=src('server/discovery-r98-curation.mjs');
 for(const s of ['comparePhoto','compareDimensions','compareLicense','compareIdentity','modelMethod','modelSource','photoSource','comparisonSource','manual'])assert.match(backend,new RegExp(s));
});
test('Antigravity bundle and admin, MapLibre/globe.gl references, R97 legacy preserved',()=>{
 for(const f of ['R98_AGENT/PROMPT_ANTIGRAVITY_MATHVERSE_R98.txt','dual/discovery-r98/quan-ly.html','dual/discovery-r98/quan-ly.mjs','dual/discovery-r97/countries-110m-offline.geojson','dual/discovery-r95/r95-catalog-data.mjs'])assert.ok(fs.existsSync(path.join(root,f)),f);
 const prompt=src('R98_AGENT/PROMPT_ANTIGRAVITY_MATHVERSE_R98.txt');assert.match(prompt,/MapLibre/);assert.match(prompt,/globe\.gl/);assert.match(prompt,/GLB/);
});
