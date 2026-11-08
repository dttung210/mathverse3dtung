import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

test('Công viên 3D hiển thị trên scene Grand Campus, không dùng iframe',()=>{
 const ui=read('dual/index.html'),app=read('dual/app.mjs'),host=read('server/host.mjs');
 for(const id of ['enter-mathverse','enter-gallery','enter-gamepark','park-aerial','campus-park-aerial','mvpark-panel','mvpark-quiz'])assert.ok(ui.includes(`id="${id}"`),id);
 assert.ok(ui.includes('id="dual-canvas"'));
 assert.ok(!ui.includes('id="game-park-frame"'),'No independent park iframe should be mounted');
 assert.match(app,/lobbyGroup\.add\(parkWorld\.group\)/);
 assert.ok(app.includes('parkWorld.tick(dt)'));
 assert.ok(app.includes('enterR75') && app.includes('enterMuseum'));
 // A historical standalone demo route may still be kept as an archive, but not referenced by app.
 assert.ok(host.includes("route.startsWith('/game-park/')"));
 assert.ok(!app.includes("$('game-park-frame').src"));
});

test('Công viên có cổng vật lý, 10 khu, hoạt cảnh gà và NPC cùng cảnh',async()=>{
 const threeUrl=pathToFileURL(path.join(ROOT,'vendor/three.module.js')).href;
 const sceneCode=read('dual/wonder-park-v6-scenes.mjs').replaceAll("'/vendor/three.module.js'",JSON.stringify(threeUrl));
 const sceneURL='data:text/javascript;base64,'+Buffer.from(sceneCode).toString('base64');
 const code=read('dual/wonder-park-world.mjs').replaceAll("'/vendor/three.module.js'",JSON.stringify(threeUrl)).replaceAll("'./wonder-park-v6-scenes.mjs'",JSON.stringify(sceneURL));
 const {createWonderParkWorld,WONDER_PARK_LOCATION}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const previous=globalThis.document;
 globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){},strokeRect(){},fillText(){},measureText(t){return {width:t.length*20}}})})};
 try{
  const park=createWonderParkWorld();park.group.updateMatrixWorld(true);
  assert.equal(park.zones.length,10);
  assert.ok(park.group.getObjectByName('ACTUAL_PARK_ENTRANCE_IN_SAME_SCENE'));
  assert.ok(park.group.getObjectByName('WONDER_PARK_ZONE_1'));
  assert.ok(park.group.getObjectByName('WONDER_PARK_ZONE_10'));
  assert.equal(park.group.position.z,WONDER_PARK_LOCATION.originZ);
  assert.ok(park.clickable.length>20);
  assert.equal(park.getNear({x:WONDER_PARK_LOCATION.startX,z:WONDER_PARK_LOCATION.startZ}).type,'gate');
  assert.equal(park.openGate(),true);park.tick(1.6);
  assert.equal(park.gateOpen,true);
  park.kickEnemy();park.kickPlayer();park.resetChicken();
 }finally{globalThis.document=previous;}
});

test('Công thức Toán dùng MathML offline; kho dữ liệu độc quyền của giáo viên',()=>{
 const ui=read('dual/wonder-park-ui.mjs');
 assert.ok(ui.includes("http://www.w3.org/1998/Math/MathML"));
 assert.ok(ui.includes('function parseLatex'));
 assert.ok(ui.includes('function addSegments'));
 assert.ok(!ui.includes('MathJax') && !ui.includes('https://'));
 assert.ok(ui.includes("fetch('/game-park/assets/questions.json')"));
 assert.ok(ui.includes('park.kickEnemy()') && ui.includes('park.kickPlayer()'));
});

test('Câu hỏi chỉ đến từ kho giáo viên: 40 câu Toán 6 Chương I; có 4 phương án và đáp án',()=>{
 const bankFile=JSON.parse(read('game-park/assets/questions.json'));
 const bank=bankFile.questions;
 assert.equal(bankFile.meta.grade,6);assert.equal(bankFile.meta.chapter,1);assert.equal(bankFile.meta.teacherReviewRequired,true);
 assert.ok(Array.isArray(bank));assert.equal(bank.length,40);
 assert.equal(new Set(bank.map(q=>q.id)).size,40);
 for(const q of bank){
  assert.ok(q.id.startsWith('6-01-'),q.id);
  assert.deepEqual(Object.keys(q.choices).sort(),['A','B','C','D']);
  assert.ok(['A','B','C','D'].includes(q.answer));
  assert.ok(q.prompt_segments && q.choice_segments,'missing math source segments');
 }
 const html=read('game-park/index.html');
 const match=html.match(/<script id="BANK" type="application\/json">([\s\S]*?)<\/script>/);
 assert.ok(match,'missing embedded teacher-supplied bank');
 const embedded=JSON.parse(match[1]);assert.deepEqual(embedded,bank);
});

test('Toàn bộ file nguồn gốc ngoài 4 tệp kết nối vẫn nguyên SHA256',()=>{
 const manifest=JSON.parse(read('integration-tests/park-original-hashes.json'));
 let unchanged=0;
 for(const [rel,expected] of Object.entries(manifest.sha256)){
  const current=crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,rel))).digest('hex');
  assert.equal(current,expected,'Source changed: '+rel);
  unchanged++;
 }
 assert.equal(unchanged,manifest.untouched_count);
 assert.ok(unchanged>1000,'expected full preserved project');
});
