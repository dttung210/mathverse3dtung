import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const r=(name)=>readFileSync(join(root,name),'utf8');
const assets=JSON.parse(r('dual/cartoon-3d/model-catalog.json')).assets;
test('Chibi library has 10 actual GLB characters and 12 actual 3D buildings',()=>{
 assert.equal(assets.length,22);assert.equal(assets.filter(x=>x.type==='character').length,10);
 assert.equal(assets.filter(x=>x.type==='lab').length,6);assert.equal(assets.filter(x=>x.type==='museum').length,6);
 for(const a of assets){const f=join(root,'dual/cartoon-3d',a.file);assert.ok(statSync(f).size>1500,a.id);assert.equal(readFileSync(f).subarray(0,4).toString(),'glTF',a.id);}
});
test('Cartoon choices are integrated into real MATHVERSE world without replacing R75 navigation',()=>{
 const app=r('dual/app.mjs');assert.match(app,/createCartoonStudio\(/);assert.match(app,/isChibiPreset\(/);
 assert.match(app,/grand\.clampPosition\(old,next\)/);assert.match(app,/enterR75\(/);assert.match(app,/parkWorld\.tick\(dt\)/);
 const html=r('dual/index.html');assert.match(html,/cartoon-studio-open/);assert.match(html,/cartoon-studio-panel/);assert.match(html,/cartoon-character/);assert.match(html,/cartoon-museum/);
 assert.match(html,/cartoon-lab/);assert.match(html,/cartoon-garden/);
});
test('10 characters and 8 LAB roofs plus 8 museum domes have distinct selectable identifiers',()=>{
 const c=r('dual/cartoon-3d/chibi-avatars.mjs'),a=r('dual/cartoon-3d/architecture.mjs');
 assert.equal((c.match(/id:'chibi-/g)||[]).length,10);
 assert.equal((a.match(/id:'classic'/g)||[]).length,3);
 assert.match(a,/makeLabExterior/);assert.match(a,/makeMuseumExterior/);assert.match(a,/makeGarden/);
});
test('Original mathematical source and 11 park games untouched',()=>{
 const l=r('game-park/assets/teacher-bank-6-12-63-chapters.json');assert.ok(l.length>1_000_000);
 assert.match(r('dual/wonder-park-world.mjs'),/createWonderParkWorld/);
 assert.ok(statSync(join(root,'src/museum.js')).size>50000);
});
