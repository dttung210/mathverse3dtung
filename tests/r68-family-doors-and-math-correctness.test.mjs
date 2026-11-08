import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GRADE6_FAMILY_LABS,getUnifiedLabById,getUnifiedLabByModeId,getLabDoorsForRoom} from '../src/museum/r68-unified-labs.mjs';
import {ROOM_BY_ID,LAB_BY_ID,MODE_BY_ID,getRoomsForGrade} from '../src/museum/r6-room-layout.js';
import {grade6WarehouseFamilies,grade6WarehouseModeById} from '../src/curriculum/grade6-warehouse.mjs';
import {isGrade6ActiveLab} from '../src/portal-labs/grade6-curation-v15-1.js';
import {grade7Defaults} from '../src/curriculum/grade7-engine.mjs';
import {grade7SVGScene} from '../src/curriculum/grade7-svg.mjs';

const source=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
test('R6.8 unified learning Lab hierarchy: 9 G6 + 67 G7–12 doors, exactly 310 unique source modes',()=>{
 assert.equal(getRoomsForGrade(6).length,4);
 assert.equal(GRADE6_FAMILY_LABS.length,9);
 assert.equal(new Set(GRADE6_FAMILY_LABS.map(x=>x.labId)).size,9);
 const doors=[...ROOM_BY_ID.values()].flatMap(r=>getLabDoorsForRoom(r.roomId));
 assert.equal(doors.length,76);
 assert.equal(doors.filter(f=>f.grade===6).length,9);
 assert.equal(doors.reduce((n,f)=>n+f.modes.length,0),310);
 assert.equal(new Set(doors.flatMap(f=>f.modes.map(m=>m.id))).size,310);
 assert.equal(LAB_BY_ID.size,130,'old 130 source Lab IDs preserved as data');
 assert.equal(MODE_BY_ID.size,310);
 for(const room of ROOM_BY_ID.values())for(const lab of getLabDoorsForRoom(room.roomId)){
   assert.equal(lab.roomId,room.roomId);
   assert.equal(getUnifiedLabById(lab.labId),lab);
   for(const mode of lab.modes){assert.equal(getUnifiedLabByModeId(mode.id).labId,lab.labId);}
 }
});
test('R6.8 grade-6 grouped families do not mix original source modes, archives, rooms or IDs',()=>{
 const families=grade6WarehouseFamilies();const list=families.flatMap(f=>f.modes);
 assert.equal(families.length,9);assert.equal(list.length,63);
 assert.equal(list.filter(m=>m.status==='featured').length,35);
 assert.equal(list.filter(m=>m.status==='archived').length,28);
 assert.equal(new Set(list.map(x=>x.id)).size,63);
 for(const mode of list){
   const actual=getUnifiedLabByModeId(mode.id);
   assert(actual?.modes.some(m=>m.id===mode.id));
   assert.equal(actual.roomId,mode.roomId);
   assert.equal(grade6WarehouseModeById(mode.id).labId,actual.labId);
   assert.equal(mode.status==='featured',isGrade6ActiveLab(mode.id));
 }
});
test('R6.8: grade-6 and grade-8 use the same 3-column Lab architecture with exact mathematical engines',()=>{
 const explorer=source('src/curriculum/CurriculumExplorer.js');
 const grade6=source('src/curriculum/Grade6Lab.js');
 const grade8=source('src/curriculum/Grade8Lab.js');
 const frontend=source('src/main.js');
 assert.match(explorer,/new Grade6Lab\(/);
 assert.match(explorer,/new Grade8Lab\(/);
 assert.match(grade6,/mv-g7-host mv-g8-host mv-g6-unified/);
 assert.match(grade8,/mv-g7-host/);
 assert.match(grade6,/renderModel\(this\.bookCtx,this\.selected,this\.state,\{theme:'light'\}\)/);
 assert.match(frontend,/curriculumExplorer\.open\(mode\.grade,activeLabId,mode\.id\)/);
 assert.match(frontend,/id\.kind==='r6-lab' && getUnifiedLabById\(id\.labId\)/);
 assert.match(grade6,/isTrue3DCapable\(this\.selected\?\.id\)/);
 assert.match(explorer,/for\(let g=6;g<=12;g\+\+\)/);
});
test('R6.8: number-line point for 1.5 is drawn at x=548, not at 0 — fixes screenshot mismatch',()=>{
 const params=grade7Defaults('7-01-C01');params.x=1.5;
 const svg=grade7SVGScene('7-01-C01',params,0);
 assert.match(svg,/<circle cx="548" cy="195" r="7"/);
 assert.match(svg,/M \(1\.5\)/);
 assert.match(svg,/x1="548" y1="225" x2="548"/);
});
test('R7.0: Grade-6 canvas is not warped, uses the same light teaching palette as Grade-8',()=>{
 const css=source('src/curriculum/grade6-unified.css');
 const stage=source('src/curriculum/Grade6Lab.js');
 const spatial=source('src/museum/r6-spatial-manager.js');
 assert.match(css,/aspect-ratio:23\/14/);
 assert.match(css,/mv-g6-viewport\{background:#f1f8fb!important/);
 assert.match(stage,/makeGrade6DragSpec\(model\)/);
 assert.match(stage,/applyGrade6Drag\(this\.selected,p,this\.activeDragKey/);
 assert.match(spatial,/this\.thematicExhibits/);
 assert.match(spatial,/createThematicLabDoor\(/);
});
