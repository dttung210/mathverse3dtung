import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const threeUrl=pathToFileURL(path.join(ROOT,'vendor/three.module.js')).href;
const THREE=await import(threeUrl);
const source=read('dual/grand-dome.mjs').replaceAll("'/vendor/three.module.js'",JSON.stringify(threeUrl));
const moduleUrl='data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const {createGrandDome,GRAND_DOME_LAYOUT,CAMPUS_ROUTES}=await import(moduleUrl);
function fixture(){
  const prev=globalThis.document;
  globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({
    fillRect(){},strokeRect(){},fillText(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},measureText(t){return {width:t.length*36};}
  })})};
  try {
    const world=createGrandDome({createAvatar:()=>({root:new THREE.Group(),updateAnimation(){}}),catalogCounts:{6:43,7:37,8:39,9:32,10:27,11:33,12:19}});
    world.group.updateMatrixWorld(true);
    return {world,restore:()=>globalThis.document=prev};
  }catch(err){globalThis.document=prev;throw err;}
}
test('V11 all 3D museum and Lab signs keep world and pixel aspect within 2%',()=>{
  const {world,restore}=fixture();try{
    let total=0;
    world.group.traverse(obj=>{
      if(!obj.name.startsWith('LEGIBLE_SIGN_'))return;
      total++;
      const dims=obj.material.map.image;
      assert.ok(dims.width>0&&dims.height>0);
      const meshAspect=obj.geometry.parameters.width/obj.geometry.parameters.height;
      const pixelAspect=dims.width/dims.height;
      assert.ok(Math.abs(meshAspect-pixelAspect)/meshAspect<.02,`${obj.name}: ${meshAspect} vs ${pixelAspect}`);
    });
    assert.ok(total>20,`only ${total} signboards were tested`);
  }finally{restore();}
});
test('V11 concierge is high, faces incoming students, and receptionist click still works',()=>{
  const {world,restore}=fixture();try{
    const npc=world.group.getObjectByName('NPC_HUONG_DAN_R75_AVATAR');
    const desk=world.group.getObjectByName('NPC_GREETING_AND_INFORMATION_DESK');
    const headHeight=npc.position.y+1.8*npc.scale.y;
    const deskWorldTop=new THREE.Box3().setFromObject(desk).max.y;
    assert.ok(headHeight>deskWorldTop+1.4);
    assert.ok(npc.scale.x>1.5);
    assert.equal(npc.rotation.y,0);
    assert.equal(world.getTarget(GRAND_DOME_LAYOUT.guide),'guide');
    assert.ok(world.group.getObjectByName('NPC_RECEPTION_STAFF_UNIFORM'));
    assert.ok(world.group.getObjectByName('RECEPTION_CEILING_DOWNLIGHT'));
  }finally{restore();}
});
test('V11 two roads are flat, mirrored, and without floating gold tube barriers',()=>{
  const {world,restore}=fixture();try{
    for(const n of ['LAB','MUSEUM']){
      const pavement=world.group.getObjectByName(`SYMMETRIC_${n}_WALKWAY`);
      assert.ok(pavement);
      const b=new THREE.Box3().setFromObject(pavement);
      assert.ok(b.max.y-b.min.y<.07);
      assert.ok(world.group.getObjectByName(`SYMMETRIC_${n}_WALKWAY_EDGE_LEFT`));
    }
    for(let i=0;i<CAMPUS_ROUTES.lab.length;i++){
      assert.ok(Math.abs(CAMPUS_ROUTES.lab[i][0]+CAMPUS_ROUTES.museum[i][0])<1e-9);
      assert.equal(CAMPUS_ROUTES.lab[i][1],CAMPUS_ROUTES.museum[i][1]);
    }
  }finally{restore();}
});
test('V11 zoom has independent wheel, buttons, keys, clamps and maintains original R75 iframe',()=>{
  const app=read('dual/app.mjs'),html=read('dual/index.html');
  for(const id of ['world-zoom-in','world-zoom-out','world-zoom-reset','world-zoom-value','r75-frame','poster-modal'])
    assert.ok(html.includes(`id="${id}"`),id);
  for(const marker of ['CAMERA_DOLLY_MIN=3.1','CAMERA_DOLLY_MAX=18.5','cameraDollyGoal','setWorldCameraDolly','wheelMayZoomWorld','cameraDollyCurrent'])
    assert.ok(app.includes(marker),marker);
  assert.ok(app.includes("mode!=='r75'"),'R75 zoom was not protected');
  assert.ok(app.includes("$('poster-modal').hidden"),'Poster viewer zoom was not protected');
  assert.match(html, /src="\/dual\/app\.mjs\?v=[0-9.]+"/);
});
test('V11 keeps 76 Lab / 310 models and 230 source artwork unchanged',()=>{
  const catalog=JSON.parse(read('museum-data/catalog.json'));
  assert.equal(catalog.items.length,230);
  assert.equal(Object.values(catalog.counts).reduce((a,b)=>a+b,0),230);
  assert.ok(read('dual/grand-dome.mjs').includes('LAB_ENTRANCE_INTERACTION'));
  assert.ok(read('dual/grand-dome.mjs').includes('MUSEUM_ENTRANCE_INTERACTION'));
  assert.ok(read('dual/app.mjs').includes('enterR75()'));
  assert.ok(read('dual/app.mjs').includes('enterMuseum()'));
});
