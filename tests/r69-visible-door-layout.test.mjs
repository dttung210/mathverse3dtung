import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import * as THREE from '../vendor/three.module.js';
import {ROOM_BY_ID,MODE_BY_ID} from '../src/museum/r6-room-layout.js';
import {getLabDoorsForRoom,getUnifiedLabByModeId} from '../src/museum/r68-unified-labs.mjs';
import {planR71ExpandedRoom,r71Contains,r71Clamp,R71_ROOM_WIDTH,R71_ROOM_DEPTH} from '../src/museum/r71-expanded-room-plan.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const pathUrl=file=>pathToFileURL(path.join(root,file)).href;
const MOCK_ROOMS=Object.fromEntries([6,7,8,9,10,11,12].map((g,i)=>
 [g,{x:(Math.floor(i/2)-2)*36,zSide:g%2?-1:1,accentHex:'#53d3c5'}]));
async function create3DManager(){
 let js=read('src/museum/r6-spatial-manager.js')
 .replace("import * as THREE from '/vendor/three.module.js';",`import * as THREE from '${pathUrl('vendor/three.module.js')}';`)
 .replace("import {disposeObject} from '../geometry.js';",`const disposeObject=o=>o?.traverse?.(x=>{x.geometry?.dispose?.();const m=x.material;if(Array.isArray(m))m.forEach(k=>k.dispose?.());else m?.dispose?.();});`)
 .replace("import {getRoomsForGrade,getRoomById} from './r6-room-layout.js';",`import {getRoomsForGrade,getRoomById} from '${pathUrl('src/museum/r6-room-layout.js')}';`)
 .replace("import {getLabDoorsForRoom} from './r68-unified-labs.mjs';",`import {getLabDoorsForRoom} from '${pathUrl('src/museum/r68-unified-labs.mjs')}';`)
 .replace("import {planR71ExpandedRoom,r71Contains,r71Clamp} from './r71-expanded-room-plan.mjs';",`import {planR71ExpandedRoom,r71Contains,r71Clamp} from '${pathUrl('src/museum/r71-expanded-room-plan.mjs')}';`)
 .replace("import {ROOMS} from '../museum.js';",`const ROOMS=${JSON.stringify(MOCK_ROOMS)};`)
 .replace("import {getUnifiedLabById} from './r68-unified-labs.mjs';",`import {getUnifiedLabById} from '${pathUrl('src/museum/r68-unified-labs.mjs')}';`)
 .replace("import {createModeExhibit} from './r67-mode-exhibits.mjs';",`import {createModeExhibit} from '${pathUrl('src/museum/r67-mode-exhibits.mjs')}';`)
 .replace("import {planR73RoomGallery} from './r73-room-gallery-plan.mjs';",`import {planR73RoomGallery} from '${pathUrl('src/museum/r73-room-gallery-plan.mjs')}';`);
 return (await import('data:text/javascript,'+encodeURIComponent(js))).R6SpatialManager;
}

test('R7.1 expanded room plans are safe, spaced and retain unique Lab ownership',()=>{
 let doors=0,modes=0;
 for(const room of ROOM_BY_ID.values()){
  const labs=getLabDoorsForRoom(room.roomId),plan=planR71ExpandedRoom(room,MOCK_ROOMS[room.grade],labs);
  assert.equal(plan.width,48);assert.equal(plan.depth,56);
  assert(plan.doors.every(d=>r71Contains(plan,d.x,d.z)),room.roomId);
  assert(r71Contains(plan,plan.spawn.x,plan.spawn.z));
  assert(r71Contains(plan,plan.returnGate.x,plan.returnGate.z));
  assert.equal(r71Clamp(plan,1e6,1e6).x,plan.bounds.maxX);
  for(let i=0;i<plan.doors.length;i++)for(let j=i+1;j<plan.doors.length;j++)
    assert(Math.hypot(plan.doors[i].x-plan.doors[j].x,plan.doors[i].z-plan.doors[j].z)>8);
  for(const lab of labs){assert.equal(lab.roomId,room.roomId);for(const m of lab.modes){
   assert.equal(getUnifiedLabByModeId(m.id).labId,lab.labId);
  }}
  doors+=labs.length;modes+=labs.reduce((n,l)=>n+l.modes.length,0);
 }
 assert.equal(doors,76);assert.equal(modes,310);assert.equal(MODE_BY_ID.size,310);
});

test('R7.3: entering each of the 34 gates immediately mounts all its Lab zones and pedestals',async()=>{
 const Manager=await create3DManager();
 const mgr=new Manager({building:new THREE.Group(),scene:new THREE.Scene(),camera:new THREE.PerspectiveCamera(),labelSpriteFn:()=>new THREE.Group()});
 let rooms=0,zones=0,models=0;const ids=new Set();
 for(const room of ROOM_BY_ID.values()){
  const player={x:0,z:0};assert.equal(mgr.enterThematicRoom(room.roomId,player),true);
  const labs=getLabDoorsForRoom(room.roomId),count=labs.reduce((n,l)=>n+l.modes.length,0);
  assert.equal(mgr.thematicDoors.length,0,'no intermediate Lab door');
  assert.equal(mgr.labZones.length,labs.length);
  assert.equal(mgr.thematicExhibits.length,count,room.roomId);
  assert.equal(mgr.getClickTargets().length,count+1);
  assert(mgr.isWithinActiveChamber(player.x,player.z));
  for(const ex of mgr.thematicExhibits){
   assert(!ids.has(ex.mode.id));ids.add(ex.mode.id);
   assert.equal(getUnifiedLabByModeId(ex.mode.id).labId,ex.labId);
   assert.equal(ex.plinth.userData.thematicLabId,ex.labId);
   assert(mgr.isWithinActiveChamber(ex.x,ex.z));
   const hit=mgr.update(.016,300,{x:ex.x,z:ex.z});
   assert.equal(hit?.action,'nearMode');assert.equal(hit?.modeId,ex.mode.id);
   models++;
  }
  for(let i=0;i<mgr.thematicExhibits.length;i++)for(let j=i+1;j<mgr.thematicExhibits.length;j++){
   const a=mgr.thematicExhibits[i],b=mgr.thematicExhibits[j];
   assert(Math.hypot(a.x-b.x,a.z-b.z)>8,`pedestals too close in ${room.roomId}`);
  }
  const next=mgr.constrainToRoom(1e8,-1e8);assert(mgr.isWithinActiveChamber(next.x,next.z));
  rooms++;zones+=labs.length;
 }
 assert.equal(rooms,34);assert.equal(zones,76);assert.equal(models,310);assert.equal(ids.size,310);
 mgr.clearChamber();assert.equal(mgr.getClickTargets().length,0);
});

test('R7.1: keyboard/click, local minimap and one compact UI directory use the same Lab IDs',()=>{
 const main=read('src/main.js'),museum=read('src/museum.js'),spatial=read('src/museum/r6-spatial-manager.js');
 assert.match(main,/const available=room\?getLabDoorsForRoom\(room\.roomId\):\[\]/);
 assert.match(main,/r71-lab-directory/);
 assert.match(main,/navigateToLab\(labId\)/);
 assert.match(museum,/activeNearThematicLab/);
 assert.match(spatial,/group\.userData\.thematicLabId=lab\.labId/);
 assert.match(read('src/minimap.js'),/onSelectLab\(t\.labId\)/);
 assert.match(read('index.html'),/r71-expanded-lab-doors\.css/);
 assert.match(spatial,/createModelPedestal\(/); // Pedestals are created only after entering the selected Lab.
});

test('R7.3: focusing each of the 76 Labs keeps the room built and moves to that Lab zone',async()=>{
  const Manager=await create3DManager();
  const mgr=new Manager({building:new THREE.Group(),scene:new THREE.Scene(),camera:new THREE.PerspectiveCamera(),labelSpriteFn:()=>new THREE.Group()});
  let labs=0,models=0;const ids=new Set();
  for(const room of ROOM_BY_ID.values()){
    const player={x:0,z:0};
    assert.equal(mgr.enterThematicRoom(room.roomId,player),true);
    const total=mgr.thematicExhibits.length;
    for(const lab of getLabDoorsForRoom(room.roomId)){
      assert.equal(mgr.enterLabGallery(lab.labId,player),true,lab.labId);
      assert.equal(mgr.activeLabId,lab.labId);
      assert.equal(mgr.thematicExhibits.length,total,'focusing must not rebuild/hide other Labs');
      assert(mgr.isWithinActiveChamber(player.x,player.z));
      const own=mgr.thematicExhibits.filter(ex=>ex.labId===lab.labId);
      assert.equal(own.length,lab.modes.length,lab.labId);
      const zone=mgr.labZones.find(z=>z.lab.labId===lab.labId).zone;
      assert(player.x>=zone.minX&&player.x<=zone.maxX,'player moved in front of the Lab zone');
      for(const ex of own){
        const id=ex.mode.id;
        assert(!ids.has(id),`Duplicated pedestal ${id}`);ids.add(id);
        assert.equal(ex.plinth.userData.thematicMode,id);
        const meshes=[];ex.plinth.traverse(obj=>{if(obj.isMesh)meshes.push(obj)});
        assert(meshes.length>=3,`No 3D object on pedestal ${id}`);
        assert(ex.x>=zone.minX&&ex.x<=zone.maxX,`${id} outside its Lab zone`);
        models++;
      }
      assert.equal(mgr.exitLabGallery(player),true);
      assert.equal(mgr.activeThematicRoomId,room.roomId);
      assert.equal(mgr.activeLabId,null);
      assert.equal(mgr.thematicExhibits.length,total);
      labs++;
    }
  }
  assert.equal(labs,76);assert.equal(models,310);assert.equal(ids.size,310);
  mgr.clearChamber();
});

test('R7.2: 2-stage navigation has separate Lab galleries and model-level return/minimap',()=>{
  const main=read('src/main.js'),museum=read('src/museum.js'),spatial=read('src/museum/r6-spatial-manager.js'),map=read('src/minimap.js');
  assert.match(main,/museum\?\.enterLabGallery\?\.\(lab\.labId\)/);
  assert.match(museum,/getActiveLabGallery:/);
  assert.match(spatial,/this\.thematicExhibits\.push\(\{plinth:stand,mode:item\.mode/);
  assert.match(spatial,/action:'nearMode'/);
  assert.match(museum,/if\(cur\.userData\.isLabReturn\)/);
  assert.match(map,/renderLabGalleryMap/);
  assert.match(map,/modePedestal/);
  assert.match(main,/curriculumExplorer\.open\(mode\.grade,activeLabId,mode\.id\)/);
});
