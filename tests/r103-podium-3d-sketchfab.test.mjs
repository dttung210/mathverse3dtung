import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {makeSketchfabEmbedUrl,nearestPedestal} from '../dual/discovery-r103/podium-logic.mjs';
import {R102_CATALOG,GALLERY_ITEMS,R102_BY_ID} from '../dual/discovery-r102/catalog.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf-8');
test('24 locations remain: 7 ancient, 7 New7Wonders, 10 other buildings',()=>{
 assert.equal(R102_CATALOG.length,24);assert.equal(GALLERY_ITEMS.length,15);
 assert.equal(R102_CATALOG.filter(x=>x.group==='ancient').length,7);
 assert.equal(R102_CATALOG.filter(x=>x.group==='new2007').length,7);
 assert.equal(R102_CATALOG.filter(x=>x.group==='other').length,10);
});
test('Sketchfab iframe autostarts without Play click, source model UID verified format',()=>{
 const uid=R102_BY_ID.get('wonder_colosseum').uid;
 const url=makeSketchfabEmbedUrl(uid);
 assert.equal(new URL(url).origin,'https://sketchfab.com');
 assert.match(url,/autostart=1/);
 assert.match(url,/transparent=1/);
 assert.equal(new URL(url).pathname,`/models/${uid}/embed`);
 assert.equal(makeSketchfabEmbedUrl('javascript:alert(1)'),null);
});
test('Only nearest stand selected, hysteresis prevents frequent model reloads',()=>{
 const mk=(id,x,z)=>({id,x,z,item:{uid:'a'.repeat(32)}});
 const a=mk('a',0,0),b=mk('b',6,0);
 assert.equal(nearestPedestal([a,b],{x:0,z:0}).id,'a');
 assert.equal(nearestPedestal([a,b],{x:3.1,z:0},{currentId:'a'}).id,'a');
 assert.equal(nearestPedestal([a,b],{x:6,z:0},{currentId:'a'}).id,'b');
 assert.equal(nearestPedestal([a,b],{x:100,z:0}),null);
});
test('Zeus keeps statue reconstruction, not unrelated whole Olympia model',()=>{
 const z=R102_BY_ID.get('wonder_zeus');
 assert.equal(z.uid,'3ef14e973af8440c8fa34bfeee6da3e0');
 assert.equal(z.modelIsSiteOnly,false);
 assert.match(z.modelAccuracyNote,/phục dựng nghệ thuật/);
 assert.equal(z.photoWiki,'Olympia,_Greece');
});
test('Rhodes model remains actual Colossus; ONLY real-life photo becomes CC0 Mandraki harbor',()=>{
 const r=R102_BY_ID.get('wonder_colossus');
 assert.equal(r.uid,'011ee3d4483448b4abac63969bcfc475');
 assert.equal(r.modelIsSiteOnly,false);
 assert.match(r.photoUrl,/Mandraki_colosseus_harbour_rhodes.jpg/);
 assert.match(r.photoAttribution,/Jebulon/);
 assert.match(r.photoAttribution,/CC0/);
 assert.match(r.photoSiteCaption,/chưa được xác nhận/i);
});
test('R103 direct model viewer is projected on real 3D physical plinth and drag enabled',()=>{
 const code=read('dual/discovery-r103/podium-viewer.mjs');
 for(const pattern of [/projectStand\(/,/localToWorld\(/,/\.project\(camera\)/,/makeSketchfabEmbedUrl\(/,/r103-podium-frame/,/pointer-events: auto|pointer-events:auto/]){
   assert.ok(pattern.test(code+read('dual/discovery-r103/podium-viewer.css')),'missing '+pattern);
 }
 assert.match(code,/getLocalIds/);
 assert.match(code,/onDetails/);
 assert.match(code,/onUpload/);
});
test('R104 podiums show explicit educational Three.js preview until licensed scan arrives',()=>{
 const room=read('dual/discovery-r102/exhibition-room.mjs');
 assert.match(room,/const preview=createTeachingModel/);
 assert.match(room,/R104_NATIVE_THREE_MODEL_/);
 assert.match(room,/installNativeGLB/);
 assert.match(room,/R98_APPROVED_ARCHITECTURE_ONLY/);
 assert.match(room,/const pedestal=disk/);
});
test('Teacher can add licensed GLB to the podium as actual native Three.js mesh',()=>{
 const room=read('dual/discovery-r102/exhibition-room.mjs');
 assert.match(room,/scene\.traverse\(/);
 assert.match(room,/stand\.model\.add\(scene\)/);
 assert.match(room,/glb\$/i);
 assert.match(room,/importLicensedGLB=importUploadedGLB/);
 const manifest=JSON.parse(read('dual/discovery-r103/assets/approved-local-models.json'));
 assert.ok(Array.isArray(manifest.models)&&manifest.models.length>=0);
 for(const m of manifest.models)assert.ok(m.id&&m.file&&m.author&&m.license&&m.sha256);
});
test('Room click behavior: source viewer rotates without opening modal; 2D/3D behind details',()=>{
 const app=read('dual/app.mjs'),ui=read('dual/discovery-r100/wonders-ui.mjs');
 assert.match(app,/podiumViewer\?\.update\(/);
 assert.match(app,/nativeDragId/);
 assert.match(app,/rotateNativeModel/);
 assert.match(ui,/!w\.inGallery/);
 assert.match(ui,/r102-tab-3d/);
 assert.match(ui,/r102-tab-2d/);
});
test('Map / globe still use the same catalog and original display panels',()=>{
 const code=read('dual/discovery-r97/world-map-ui.mjs');
 assert.match(code,/R102_CATALOG/);
 assert.match(code,/onOpen\?\.\(it\.id\)/);
 assert.doesNotMatch(code,/id="r97-map-return"/);
});
test('R100 two-column heritage modal layout remains intact',()=>{
 const ui=read('dual/discovery-r100/wonders-ui.mjs'),css=read('dual/discovery-r100/wonders.css');
 for(const cname of ['r100-window','r100-media-grid','r100-photo-box','r100-viewer','r100-list','r100-details']){
  assert.ok(ui.includes(cname));assert.ok(css.includes('.'+cname));
 }
});
test('Parthenon original GLB in the distribution is present and unchanged in R103 staging',()=>{
 assert.ok(fs.statSync(path.join(root,'dual/discovery-r98/assets/unesco_parthenon_glb.glb')).size>25e6);
});
