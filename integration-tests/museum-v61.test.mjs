import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {validateMuseumCatalog} from '../dual/museum-inventory.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'museum-data/catalog.json'),'utf8'));
const app=fs.readFileSync(path.join(root,'dual/app.mjs'),'utf8');
const dome=fs.readFileSync(path.join(root,'dual/grand-dome.mjs'),'utf8');

test('V6.1 Museum inventory verifies 230 unique paintings in seven rooms',()=>{
 const info=validateMuseumCatalog(catalog);
 assert.equal(info.total,230);assert.equal(info.rooms,7);
 assert.deepEqual(info.gradeCounts,{'6':43,'7':37,'8':39,'9':32,'10':27,'11':33,'12':19});
 for(const item of catalog.items)assert.ok(fs.statSync(path.join(root,item.src.slice(1))).size>3000);
});
test('Museum validation blocks duplicate lesson numbers and malicious asset paths',()=>{
 const c=structuredClone(catalog);
 c.items[1].number=c.items[0].number;
 assert.throws(()=>validateMuseumCatalog(c),/duplicate lesson/);
 const d=structuredClone(catalog);
 d.items[0].src='/museum-assets/g6/../outside.webp';
 assert.throws(()=>validateMuseumCatalog(d),/image source/);
 const e=structuredClone(catalog);
 e.items[0].src='/museum-assets/g6/Bai_01Xwebp';
 assert.throws(()=>validateMuseumCatalog(e),/image source/);
});
test('Museum frontend declares render quality before accessing it and loads shared inventory',()=>{
 const at=app.indexOf('let mobileQuality=');
 const call=app.indexOf("setGraphics($('quality').value)");
 assert.ok(at>=0&&call>at);
 assert.match(app,/validateMuseumCatalog\(catalog\)/);
 assert.match(app,/createGrandDome\(\{createAvatar,catalogCounts:museumInventory.gradeCounts\}\)/);
});
test('Grand Dome building displays the live per-class Museum inventory and does not replace R75',async()=>{
 assert.match(dome,/catalogCounts\?\.\[grade\]/);
 const threeURI=pathToFileURL(path.join(root,'vendor/three.module.js')).href;
 const raw=dome.replaceAll("'/vendor/three.module.js'",JSON.stringify(threeURI));
 const mod=await import('data:text/javascript;base64,'+Buffer.from(raw).toString('base64'));
 const THREE=await import(threeURI);
 const prior=globalThis.document;
 globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},strokeRect(){},fillText(){},beginPath(){},moveTo(){},bezierCurveTo(){},lineTo(){},stroke(){}})})};
 try{
  const world=mod.createGrandDome({createAvatar:()=>({root:new THREE.Group(),updateAnimation(){}}),catalogCounts:validateMuseumCatalog(catalog).gradeCounts});
  assert.ok(world.group.getObjectByName('RIGHT_SIDE_CRYSTAL_MUSEUM_DOME'));
  assert.equal(world.getTarget(mod.GRAND_DOME_LAYOUT.museum),'gallery');
  assert.equal(world.getTarget(mod.GRAND_DOME_LAYOUT.lab),'r75');
 }finally{globalThis.document=prior;}
});
test('Versioned host exposes a read-only Museum endpoint separate from R75 original API',()=>{
 const host=fs.readFileSync(path.join(root,'server/host.mjs'),'utf8');
 assert.match(host,/granddome\/api\/museum/);
 assert.match(host,/version:'[78].0.0'/);
 assert.match(host,/proxy\(req,res,route\)/);
});
