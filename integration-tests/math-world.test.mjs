import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const vendor=pathToFileURL(path.join(root,'vendor/three.module.js')).href;
async function importClient(filename){
  const source=fs.readFileSync(path.join(root,filename),'utf8').replace("'/vendor/three.module.js'",JSON.stringify(vendor));
  return import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
}
const catalog=JSON.parse(fs.readFileSync(path.join(root,'museum-data/catalog.json'),'utf8'));
test('R75 original avatar factory actually constructs and animates all four character types',async()=>{
  const {createAvatar}=await importClient('dual/avatar-r75.mjs');
  const a=createAvatar('alex');
  assert.ok(a.root.isGroup);assert.equal(a.getAvatarType(),'alex');
  for(const type of ['triet','an','bot','alex']){
    a.setAvatarType(type);assert.equal(a.getAvatarType(),type);
    a.updateAnimation(.016,.7,Math.PI,0);
    assert.ok(a.root.children.length>=2);
  }
});
test('Museum has 7 independent radial halls directly reached from the atrium',async()=>{
  const {planRooms,gradeForPosition,restrictPosition,roomWorld,HUB_RADIUS,ENTRANCE_Z}=await import('../dual/layout-plan.mjs');
  const plan=planRooms(catalog.items);
  assert.equal(plan.length,7);
  assert.equal(plan.reduce((n,r)=>n+r.lessons.length,0),230);
  assert.ok(plan.every(r=>r.start===HUB_RADIUS));
  assert.equal(gradeForPosition(plan,{x:0,z:ENTRANCE_Z}),null);
  for(const room of plan){
    const center=roomWorld(room.theta,room.start+15);
    assert.equal(gradeForPosition(plan,center),room.grade);
    const front=roomWorld(room.theta,room.start-.6);
    const through=roomWorld(room.theta,room.start+.6);
    assert.ok(Math.hypot(...Object.values(restrictPosition(plan,front,through)).map((v,i)=>v-[through.x,through.z][i]))<.001);
  }
});
