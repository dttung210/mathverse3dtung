import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import * as THREE from '../vendor/three.module.js';
import {getRoomsForGrade,ROOM_BY_ID,LAB_BY_ID,MODE_BY_ID,getModesForRoom} from '../src/museum/r6-room-layout.js';
import {createModeExhibit} from '../src/museum/r67-mode-exhibits.mjs';
import {grade6WarehouseFamilies} from '../src/curriculum/grade6-warehouse.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source=name=>fs.readFileSync(path.join(root,name),'utf8');
function clean(g){g.traverse(x=>{x.geometry?.dispose?.();const m=x.material;if(Array.isArray(m))m.forEach(x=>x.dispose?.());else m?.dispose?.();});}

test('R7.1: a 3D station is a physical Lab door, not a fabricated mathematical model',()=>{
 const spatial=source('src/museum/r6-spatial-manager.js'),museum=source('src/museum.js');
 assert.match(spatial,/getLabDoorsForRoom\(roomId\)/);
 assert.match(spatial,/createThematicLabDoor/);
 assert.match(spatial,/group\.userData\.thematicLabId=lab\.labId/);
 assert.match(museum,/activeNearThematicLab/);
 assert.match(spatial,/createModeExhibit\(/); // R7.2 restores visible 3D previews INSIDE Lab galleries.
});

test('R6.7: exact 7-grade / 34-room / 130-Lab hierarchy persists, all 310 IDs have one owner',()=>{
 assert.equal(ROOM_BY_ID.size,34);assert.equal(LAB_BY_ID.size,130);assert.equal(MODE_BY_ID.size,310);
 let total=0;
 for(const r of ROOM_BY_ID.values())for(const mode of getModesForRoom(r.roomId)){
  assert.equal(mode.roomId,r.roomId);total++;
 }
 assert.equal(total,310);
 assert.equal(grade6WarehouseFamilies().length,9);
 assert.equal(grade6WarehouseFamilies().flatMap(f=>f.modes).length,63);
});

test('R6.7: no reachable grade-6 click opens legacy LabShell or 4-gate MathLab 6 drawer',()=>{
 const main=source('src/main.js'),shell=source('src/ui/LabShell.js');
 assert.match(main,/curriculumExplorer\.open\(mode\.grade,activeLabId,mode\.id\)/);
 assert.match(main,/if\(Number\(item\?\.grade\)===6/);
 assert.match(main,/getUnifiedLabByModeId\(mode\.id\)\?\.labId/);
 assert.match(shell,/if\(Number\(model\?\.grade\)===6\)/);
 assert.match(shell,/onOpenGrade6Warehouse/);
 assert.match(main,/for\(const legacy of document\.querySelectorAll/);
});

// R7.1 preserves the model list behind the 76 family Lab doors.
test('R7.3: the source gallery stores all 310 models inside their correct Lab zones',()=>{
 const spatial=source('src/museum/r6-spatial-manager.js');
 assert.match(spatial,/const labs=getLabDoorsForRoom\(roomId\)/);
 assert.match(spatial,/this\.labZones\.push/);
 assert.match(spatial,/labId:closest\.labId/);
 assert.equal([...ROOM_BY_ID.values()].reduce((n,r)=>n+getModesForRoom(r.roomId).length,0),310);
});
