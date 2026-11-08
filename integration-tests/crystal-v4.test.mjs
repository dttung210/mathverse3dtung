import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {posterDisplaySize,planRooms,entranceVisibilityAtSpawn} from '../dual/layout-plan.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(fs.readFileSync(path.join(ROOT,'museum-data/catalog.json'),'utf8'));
const toData=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const threeUrl=pathToFileURL(path.join(ROOT,'vendor/three.module.js')).href;
function patched(file){return fs.readFileSync(path.join(ROOT,file),'utf8').replaceAll("'/vendor/three.module.js'",JSON.stringify(threeUrl));}
function mockCanvas(){
  return {width:1024,height:128,getContext(){return {fillRect(){},strokeRect(){},fillText(){},measureText(){return {width:100}}};}};
}
async function createGalleryScene(){
  const three=await import(threeUrl);
  const layoutUrl=pathToFileURL(path.join(ROOT,'dual/layout-plan.mjs')).href;
  const archUrl=toData(patched('dual/crystal-architecture.mjs').replace("'./layout-plan.mjs'",JSON.stringify(layoutUrl)));
  const source=patched('dual/gallery.mjs')
    .replace("'./crystal-architecture.mjs'",JSON.stringify(archUrl))
    .replace("'./layout-plan.mjs'",JSON.stringify(layoutUrl));
  const {InfographicGallery}=await import(toData(source));
  globalThis.document={createElement:()=>mockCanvas()};
  const old=three.TextureLoader.prototype.load;
  three.TextureLoader.prototype.load=function(_url,onLoad){const tex=new three.Texture();if(onLoad)queueMicrotask(()=>onLoad(tex));return tex;};
  try{
    const scene=new three.Scene();
    const gallery=new InfographicGallery({scene,items:data.items,onSelect(){}});
    return {gallery,three,scene,restore:()=>{three.TextureLoader.prototype.load=old;delete globalThis.document;}};
  }catch(e){three.TextureLoader.prototype.load=old;delete globalThis.document;throw e;}
}
test('V7 all seven doors are accessible directly from ONE circular hub',()=>{
  const rooms=planRooms(data.items);
  assert.deepEqual(rooms.map(x=>x.grade),[6,7,8,9,10,11,12]);
  assert.ok(Math.max(...rooms.map(x=>x.angleDeg))-Math.min(...rooms.map(x=>x.angleDeg))>290);
  assert.deepEqual(rooms.map(x=>x.lessons.length),[43,37,39,32,27,33,19]);
});
test('V4 230 image planes are large and keep exactly their PNG/PDF metadata aspect',()=>{
  for(const entry of data.items){
    const display=posterDisplaySize(entry.aspect);
    assert.ok(display.w<=4.75+1e-5&&display.h<=5.65+1e-5,entry.title);
    assert.ok(display.h>=4.95||display.w>=4.15,entry.title);
    assert.ok(Math.abs(display.w/display.h-entry.aspect)<2e-5,entry.title);
  }
});
test('Crystal architectural module, seven-room map and NO upload/download are present',()=>{
  const gallery=patched('dual/gallery.mjs');const arch=patched('dual/crystal-architecture.mjs');
  const html=fs.readFileSync(path.join(ROOT,'dual/index.html'),'utf8');
  const app=patched('dual/app.mjs');
  assert.match(gallery,/CRYSTAL_GOLD_FRAMES_INSTANCED/);
  assert.match(arch,/function crystalDome/);
  assert.match(arch,/LỚP \$\{p.grade\}/);
  assert.match(html,/id="room-map-grid"/);
  assert.match(html,/id="open-room-map"/);
  assert.match(app,/targetFov/);
  assert.doesNotMatch(html,/<input\s+[^>]*type="file"/i);
  assert.doesNotMatch(html,/\sdownload(?:\s|=|>)/i);
});
test('V4 Three.js really constructs 7 halls, 230 posters, 2 instanced frame draws and crystalline dome',async()=>{
  const {gallery,scene,restore}=await createGalleryScene();
  try{
    assert.equal(gallery.getPlan().length,7);
    assert.equal(gallery.rooms.size,7);
    assert.equal(gallery.posters.length,230);
    assert.equal(gallery.frameMeshes.length,2);
    assert.ok(gallery.frameMeshes.every(m=>m.count===230));
    assert.ok(gallery.group.getObjectByName('MAIN_CRYSTAL_ROTUNDA_FLOOR'));
    assert.ok(gallery.group.getObjectByName('CRYSTAL_INFINITY_SCULPTURE'));
    for(let grade=6;grade<=12;grade++){
      assert.ok(gallery.group.getObjectByName(`CRYSTAL_PORTAL_GRADE_${grade}`),`missing portal ${grade}`);
      assert.ok(gallery.group.getObjectByName(`GRAND_FAN_HALL_TOAN_${grade}`));
    }
    assert.equal(gallery.picked.length,230);
    assert.equal(gallery.doorTargets.length,14);
    assert.ok(gallery.crystalLights.length>=8);
    for(const p of gallery.posters)assert.ok(Math.abs(p.w/p.h-p.item.aspect)<2e-5);
    gallery.setQuality('eco');gallery.tick({x:0,z:15});
    gallery.dispose();
    assert.equal(gallery.posters.length,0);
  }finally{restore();}
});
