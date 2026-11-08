import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DISCOVERY_LANDMARKS,DISCOVERY_ARTWORKS} from '../dual/discovery-data.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

test('Discovery globe is below the raised ceiling (regression R93)',()=>{
 const s=read('dual/discovery-world.mjs');
 assert.match(s,/function roomBase\(group,cx,cz,w,d,hue,height=10\.8\)/);
 assert.match(s,/roomBase\(globeRoom,-34,-13,44,44,0xb2d9dc,18\.5\)/);
 assert.match(s,/box\(group,w,\.45,d,m\.dark,cx,height-\.2,cz,'DISCOVERY_ROOM_CEILING'\)/);
 const roofBottom=18.5-.2-.45/2;
 const globeTop=9+7.0; // glowing globe halo, including its sphere (r=6.65)
 assert.ok(roofBottom-globeTop>1,`Globe overlaps the roof: clearance ${roofBottom-globeTop}`);
});
test('Existing foyer and gallery heights are not changed',()=>{
 const s=read('dual/discovery-world.mjs');
 assert.match(s,/roomBase\(foyer,0,19,24,27,0xc3d3d6\)/);
 assert.match(s,/roomBase\(galleryRoom,34,-13,44,44,0xebd7c1\)/);
});
test('3D geography, photo-gallery assets and fallbacks remain linked',()=>{
 const s=read('dual/discovery-world.mjs'),ui=read('dual/discovery-ui.mjs');
 assert.equal(DISCOVERY_LANDMARKS.length,4);assert.equal(DISCOVERY_ARTWORKS.length,4);
 assert.match(s,/DISCOVERY_GLOBE_MARKER_/);assert.match(s,/DISCOVERY_REAL_WORLD_ARTWORK_/);
 assert.match(s,/frameFallback\(item.name,icons\[i\]\)/);
 assert.match(ui,/function showView\(which\)/);
 assert.ok(fs.statSync(path.join(root,'dual/discovery-assets/earth-fallback.png')).size>100000);
});
test('Old Campus link remains additive; Museum / Lab / Park routes still exist',()=>{
 const s=read('dual/app.mjs');
 for(const k of ['enterR75','enterMuseum','enterGamePark','enterDiscovery','moveToLobby','getDiscovery'])assert.ok(s.includes(k),k);
});
