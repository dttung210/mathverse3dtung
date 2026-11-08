import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DISCOVERY_LANDMARKS,DISCOVERY_ARTWORKS,validateDiscoveryData,discoveryById} from '../dual/discovery-data.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('Discovery has exactly two separate student-room collections',()=>{
 assert.deepEqual(validateDiscoveryData(),{landmarks:4,artworks:4});
 assert.equal(DISCOVERY_LANDMARKS.length,4);
 assert.equal(DISCOVERY_ARTWORKS.length,4);
 assert.deepEqual(DISCOVERY_LANDMARKS.map(x=>x.id),['giza','sydney','eiffel','golden']);
 assert.deepEqual(DISCOVERY_ARTWORKS.map(x=>x.id),['traffic','fish','wheel','clock']);
 assert.equal(discoveryById('traffic').kind,'traffic');
 assert.equal(discoveryById('does-not-exist'),null);
});

test('Geographical data, credits, realistic-geometry disclaimers are valid',()=>{
 for (const item of [...DISCOVERY_LANDMARKS,...DISCOVERY_ARTWORKS]){
  assert.ok(item.media.source.startsWith('https://commons.wikimedia.org/wiki/File:'));
  assert.ok(item.media.photo.startsWith('https://commons.wikimedia.org/wiki/Special:FilePath/'));
  assert.ok(item.media.author && item.media.license && item.grade && item.shape || item.explanation);
 }
 for(const loc of DISCOVERY_LANDMARKS){
  assert.ok(Number.isFinite(loc.lat)&&Math.abs(loc.lat)<=90);
  assert.ok(Number.isFinite(loc.lng)&&Math.abs(loc.lng)<=180);
  assert.ok(loc.history && loc.math && loc.kind);
 }
 assert.match(discoveryById('giza').math,/lý tưởng hóa/);
 assert.match(discoveryById('fish').explanation,/KHÔNG phải/);
});

test('Separate new building and non-overlapping foyer, A and B meshes',()=>{
 const s=read('dual/discovery-world.mjs');
 for(const token of ['DISCOVERY_FOURTH_ARCHITECTURE_EXTERIOR','DISCOVERY_INDEPENDENT_INTERIOR','DISCOVERY_FOYER','DISCOVERY_GLOBE_ROOM','DISCOVERY_GALLERY_ROOM','DISCOVERY_EARTH_GLOBE','DISCOVERY_REAL_WORLD_ARTWORK_','DISCOVERY_EXTERIOR_DOOR'])assert.ok(s.includes(token),token);
 assert.match(s,/rooms=\{foyer,globe:globeRoom,gallery:galleryRoom\}/);
 assert.match(s,/interior\.visible=false/);
 assert.match(s,/return id==='foyer'\?/);
 assert.match(s,/lat=item\.lat\*Math\.PI\/180,lng=item\.lng\*Math\.PI\/180/);
 assert.match(s,/restrict\(prev,next\)/);
});

test('Grand Campus has additive Discovery integration with return actions',()=>{
 const s=read('dual/app.mjs');
 assert.match(s,/import \{createDiscoveryWorld,DISCOVERY_SITE\} from '\.\/discovery-world\.mjs'/);
 assert.match(s,/lobbyGroup\.add\(discovery\.exterior\);scene\.add\(discovery\.interior\)/);
 assert.match(s,/function enterDiscovery\(\)/);
 assert.match(s,/function handleDiscoveryAction\(action\)/);
 assert.match(s,/if\(mode==='discovery'\)discovery\.tick\(dt\)/);
 assert.match(s,/if\(mode==='discovery'\)\{discoveryUI\?\.hide\(\);discovery\.interior\.visible=false;lobbyGroup\.visible=true;\}/);
 assert.match(s,/\$\('enter-discovery'\)\.onclick=enterDiscovery/);
});

test('UI provides 2D SVG and interactive 3D models, proper resource disposal',()=>{
 const s=read('dual/discovery-ui.mjs'), sh=read('dual/discovery-shapes.mjs');
 assert.match(s,/function showView\(which\)/);
 assert.match(s,/function selectPhoto\(data\)/);
 assert.match(s,/photo\.onerror=/);
 assert.match(s,/discovery-fish-toggle/);
 for(const kind of ['pyramid','shells','truss','bridge','traffic','fish','wheel','clock'])assert.ok(sh.includes(`kind==='${kind}'`));
 for(const symbol of ['disposeDiscoveryModel','geometrySVG','\.dispose\(\)'])assert.match(sh,new RegExp(symbol));
});

test('Student controls and overview map include Discovery without removing old areas',()=>{
 const html=read('dual/index.html');
 for(const id of ['enter-discovery','discovery-quick-panel','discovery-detail','discovery-btn-globe','discovery-btn-gallery','discovery-preview','discovery-model-2d','discovery-model-3d','r75-frame','lab-quick-enter','park-quick-enter'])assert.ok(html.includes(`id="${id}"`),id);
 for(const label of ['LAB','BẢO TÀNG','CÔNG VIÊN','DISCOVERY'])assert.ok(read('dual/app.mjs').includes(label),label);
 assert.match(read('dual/campus-masterplan.mjs'),/discovery:Object\.freeze/);
 assert.match(read('dual/campus-map-ui-v3.mjs'),/data-destination':'discovery'/);
 assert.ok(fs.statSync(path.join(ROOT,'dual/discovery-assets/earth-fallback.png')).size>100000);
});

test('Original launchers are preserved, optional Discovery launcher starts the original server',()=>{
 const main=read('00_MO_DU_AN_MOI_NHAT.bat');
 const launcher=read('00_MO_DISCOVERY_KHONG_MAT_DU_LIEU.bat');
 assert.match(main,/00_CHAY_GRAND_CAMPUS_V11\.bat/);
 assert.match(launcher,/node --test tests\/r92-discovery-integration\.test\.mjs/);
 assert.match(launcher,/node server\/host\.mjs/);
});
