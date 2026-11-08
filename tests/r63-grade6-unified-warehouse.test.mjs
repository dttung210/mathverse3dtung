import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {grade6WarehouseFamilies,grade6WarehouseModeById,GRADE6_WAREHOUSE_COUNT} from '../src/curriculum/grade6-warehouse.mjs';
import {LAB_TO_EXHIBIT,ALL_MATH6_LABS} from '../src/math6-lab/catalog.js';
import {isGrade6ActiveLab} from '../src/portal-labs/grade6-curation-v15-1.js';
import {getRoomsForGrade,getLabById,getModeById} from '../src/museum/r6-room-layout.js';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source=rel=>fs.readFileSync(path.join(root,rel),'utf8');

test('R6.3 Kho Toán 6 has four actual rooms and 63 correctly owned Lab records',()=>{
 const families=grade6WarehouseFamilies();
 assert.equal(families.length,9);
 assert.deepEqual(new Set(families.map(x=>x.roomId)),new Set(getRoomsForGrade(6).map(x=>x.roomId)));
 assert.equal(new Set(families.map(x=>x.id)).size,9);
 assert.equal(families.flatMap(x=>x.modes).length,63);
 assert.equal(new Set(families.flatMap(x=>x.modes.map(m=>m.id))).size,63);
 for(const room of families)for(const mode of room.modes){
  assert.equal(mode.roomId,room.roomId);
  assert.equal(getModeById(mode.id)?.roomId,room.roomId);
  assert.equal(getLabById(mode.sourceLabId)?.roomId,room.roomId);
  assert.equal(grade6WarehouseModeById(mode.id)?.roomName,getRoomsForGrade(6).find(x=>x.roomId===room.roomId).name);
  assert.equal(grade6WarehouseModeById(mode.id)?.labName,room.name);
 }
});

test('R6.3 Grade-6 warehouse preserves 35 featured and 28 archived; all have original anchor',()=>{
 const modes=grade6WarehouseFamilies().flatMap(x=>x.modes);
 assert.deepEqual(GRADE6_WAREHOUSE_COUNT,{rooms:4,familyLabs:9,sourceLabUnits:63,featured:35,archived:28});
 assert.equal(modes.filter(m=>m.status==='featured').length,35);
 assert.equal(modes.filter(m=>m.status==='archived').length,28);
 assert.equal(ALL_MATH6_LABS.length,63);
 const catalog=JSON.parse(source('data/catalog.json'));
 const anchors=new Set(catalog.items.filter(m=>Number(m.grade)===6).map(m=>m.id));
 for(const mode of modes){
  assert.equal(mode.realModel,true);
  assert.equal(mode.status==='featured',isGrade6ActiveLab(mode.id));
  assert.equal(mode.anchorId,LAB_TO_EXHIBIT[mode.id]);
  assert.ok(anchors.has(mode.anchorId),`missing anchor for ${mode.id}`);
 }
});

test('R6.5 unified warehouse mounts the specialist Grade6Lab, not legacy Math6 UI',()=>{
 const sourceExplorer=source('src/curriculum/CurriculumExplorer.js');
 assert.match(sourceExplorer,/for\(let g=6;g<=12;g\+\+\)/);
 assert.match(sourceExplorer,/this\.grade=\[6,7,8,9,10,11,12\]\.includes\(grade\)/);
 assert.match(sourceExplorer,/grade6WarehouseFamilies\(\)/);
 assert.match(sourceExplorer,/new Grade6Lab\(\{anchor,initialLabId:mode\.id,includeArchived:true/);
 assert.match(sourceExplorer,/this\.grade6Lab\.mount\(host\)/);
 assert.match(sourceExplorer,/this\.grade6Lab\.dispose\(\)/);
 assert.doesNotMatch(sourceExplorer,/Math6ExhibitLab/);
 assert.match(sourceExplorer,/MATHVERSE · KHO SGK TOÁN 6–12/);
 const html=source('index.html');
 assert.match(html,/Kho SGK 6–12/);
 assert.match(html,/r63-kho-ui\.css/);
 const main=source('src/main.js');
 assert.match(main,/new CurriculumExplorer\(\{getLibraryItems:/);
 assert.match(main,/curriculumExplorer\.open\(activeGrade\|\|6\)/);
});

test('R6.3 archive is selectable in warehouse, yet the legacy stage keeps its curated-only default',()=>{
 const math6=source('src/math6-lab/Math6ExhibitLab.js');
 assert.match(math6,/includeArchived=false,allowedLabIds=null/);
 assert.match(math6,/this\.includeArchived\|\|isGrade6ActiveLab/);
 assert.match(math6,/this\.allowedLabIds\.has\(id\)/);
 assert.match(math6,/LAB_TO_EXHIBIT\[model\.id\]!==this\.anchor\.id/);
});

test('R6.3 wide teaching space keeps the five-column resizable LabShell model intact',()=>{
 const old=source('src/r6-lab-layout.css'),style=source('src/r63-kho-ui.css');
 assert.doesNotMatch(old,/grid-template-columns:\s*280px\s+1fr\s+340px\s*!important/);
 assert.match(old,/--v10-left:220px; --v10-right:260px/);
 assert.match(source('src/studio/v10-layout.css'),/grid-template-columns:var\(--v10-left\) 7px minmax\(0,1fr\) 7px var\(--v10-right\)/);
 assert.match(style,/mv-r63-math6-view/);
 assert.match(style,/mv-r5-backdrop\.mv-r63-focus/);
 assert.match(style,/mv-r5-body\{grid-template-columns:210px 226px minmax\(0,1fr\)!important\}/);
});

test('R7.3 physical rooms are at least 48 by 56 with dedicated collision bounds',async()=>{
 const sourcePlan=await import('../src/museum/r71-expanded-room-plan.mjs');
 const spatial=source('src/museum/r6-spatial-manager.js'),museum=source('src/museum.js');
 assert.equal(sourcePlan.R71_ROOM_WIDTH,48);
 assert.equal(sourcePlan.R71_ROOM_DEPTH,56);
 assert.match(spatial,/planR73RoomGallery\(room,cfg,labs\)/);
 assert.match(source('src/museum/r73-room-gallery-plan.mjs'),/R73_MIN_WIDTH = 48/);
 assert.match(museum,/r6SpatialManager\.constrainToRoom\(toX,toZ\)/);
 assert.match(museum,/isWithinActiveChamber\(x,z\)/);
 assert(sourcePlan.R71_ROOM_WIDTH*sourcePlan.R71_ROOM_DEPTH>32*34*2);
});

test('R6.3 package keeps 7–12 curricula unchanged (67 Lab families / 247 modes)',()=>{
 const j=JSON.parse(source('data/mathverse-7-12-curated.json'));
 assert.equal(j.families,67);
 assert.equal(j.modes_total,247);
 for(const g of [7,8,9,10,11,12])assert.equal(j.source_registry.filter(f=>f.grade===g).length,getRoomsForGrade(g).reduce((n,x)=>n+x.labs.length,0));
});
