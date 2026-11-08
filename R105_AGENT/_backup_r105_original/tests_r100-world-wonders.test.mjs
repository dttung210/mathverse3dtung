import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,createReadStream} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {WORLD_WONDERS_14,WORLD_WONDERS_BY_ID} from '../dual/discovery-r100/wonders-data.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const txt=p=>readFileSync(join(root,p),'utf8');
test('R100 exactly 14 architectural wonders, 7 ancient and 7 new in 2007',()=>{
 assert.equal(WORLD_WONDERS_14.length,14);
 assert.equal(WORLD_WONDERS_14.filter(a=>a.group==='ancient').length,7);
 assert.equal(WORLD_WONDERS_14.filter(a=>a.group==='new2007').length,7);
 assert.equal(WORLD_WONDERS_BY_ID.size,14);
 for(const w of WORLD_WONDERS_14){
  assert.match(w.uid,/^[a-f0-9]{32}$/);assert.match(w.sketchfabUrl,/^https:\/\/sketchfab.com\/models\/[a-f0-9]{32}$/);
  assert.ok(w.name&&w.country&&w.location&&w.history&&w.math&&w.kind&&w.author);
  assert.ok(w.lat>=-90&&w.lat<=90&&w.lng>=-180&&w.lng<=180);
 }
 assert.ok(WORLD_WONDERS_14.some(w=>w.id==='wonder_babylon'&&w.isReconstruction));
 assert.ok(WORLD_WONDERS_14.some(w=>w.id==='wonder_colossus'&&w.locationNote.includes('tranh luận')));
});
test('14 stands, a clickable Sketchfab booth each, matching globe and map pins',()=>{
 const world=txt('dual/discovery-r100/wonders-world.mjs');
 assert.match(world,/for\(const item of WORLD_WONDERS_14\)/);
 assert.match(world,/R100_WONDER_PEDESTAL_/);assert.match(world,/R100_WONDER_GLOBE_/);assert.match(world,/R100_WONDER_MAP_/);
 assert.match(world,/type:'world-wonder'/);assert.match(world,/world\.r100Pedestals=stands/);
 assert.match(world,/R98_APPROVED_ARCHITECTURE_ONLY/);
 assert.match(world,/centerScan\(\)/);
});
test('R100 in-app Sketchfab viewer, real photo source and historical caveat',()=>{
 const source=txt('dual/discovery-r100/wonders-ui.mjs');
 assert.match(source,/sketchfab.com\/models\/\$\{w\.uid\}\/embed/);
 assert.match(source,/frame\.removeAttribute\('src'\)/);
 assert.match(source,/pageimages/);assert.match(source,/Wikimedia Commons/);
 assert.match(source,/w\.isReconstruction/);
 assert.match(source,/New7Wonders \(2007\) là cuộc bình chọn độc lập/);
});
test('R100 is mounted without running the former natural-wonders wing',()=>{
 const app=txt('dual/app.mjs'),html=txt('dual/index.html'),map=txt('dual/discovery-r97/world-map-ui.mjs');
 assert.match(app,/upgradeDiscoveryWondersR100\(upgradeDiscoveryToFidelityR98/);
 assert.doesNotMatch(app,/upgradeDiscoveryNatureR99\(/);
 assert.match(app,/createWorldWondersR100UI/);
 assert.match(app,/onOpen:\(id\)=>id\.startsWith\('wonder_'\)/);
 assert.match(html,/id="discovery-wonders-list"/);
 assert.doesNotMatch(html,/id="discovery-btn-nature"/);
 assert.match(map,/WORLD_WONDERS_14/);
 assert.doesNotMatch(map,/TERRAIN_WONDERS/);
});
test('R98 Parthenon scan and curation file are retained',async()=>{
 const catalog=JSON.parse(txt('dual/discovery-r98/curation.json'));
 const x=catalog.assets.find(a=>a.id==='unesco_parthenon');assert.ok(x);
 const glb=join(root,'dual/discovery-r98/assets/unesco_parthenon_glb.glb');assert.ok(existsSync(glb));
 const hash=createHash('sha256');for await(const block of createReadStream(glb))hash.update(block);
 assert.equal(hash.digest('hex'),x.glb.hash);
});
test('R100 easy-start BATs and teacher-agent update prompt exist',()=>{
 for(const p of ['00_CHAY_MATHVERSE_R100.bat','00_XEM_TRUOC_SAU_R100.bat','00_COP_PROMPT_ANTIGRAVITY_R100.bat','PROMPT_ANTIGRAVITY_UPDATE_R100.md','R100_XEM_TRUOC_SAU.html'])assert.ok(existsSync(join(root,p)),p);
});
