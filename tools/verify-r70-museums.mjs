/** Mathverse R7.0: source-based geometry and room integrity checks, offline. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {getRoomsForGrade,getModesForRoom,MODE_BY_ID,ROOM_BY_ID} from '../src/museum/r6-room-layout.js';
import {getUnifiedLabByModeId,GRADE6_FAMILY_LABS} from '../src/museum/r68-unified-labs.mjs';
import {createModeExhibit} from '../src/museum/r67-mode-exhibits.mjs';
import {planModePedestals} from '../src/museum/r70-pedestal-layout.mjs';
import {ALL_MATH6_LABS} from '../src/math6-lab/catalog.js';
import {makeGrade6DragSpec} from '../src/curriculum/grade6-direct-manipulation.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const counts={};let previewMeshes=0,rooms=0,modes=0;const lines=[['Lop','Ma_phong','Ten_phong','Ma_lab_nhom','Ten_lab_nhom','Ma_mo_hinh','Ten_mo_hinh','Kieu_trung_bay','Mesh_3D','Toa_do_X','Toa_do_Z']];
for(let grade=6;grade<=12;grade++)for(const room of getRoomsForGrade(grade)){
  rooms++;
  const mm=getModesForRoom(room.roomId);
  const positioned=planModePedestals(mm,{x:0,zSide:grade%2?-1:1});
  assert.equal(positioned.length,mm.length);
  for(const {mode,x,z} of positioned){
    modes++;
    assert(MODE_BY_ID.has(mode.id),`Mất ${mode.id}`);
    const lab=getUnifiedLabByModeId(mode.id);
    assert(lab && lab.roomId===room.roomId,`Sai Lab ${mode.id}`);
    const exhibit=createModeExhibit(grade,mode);
    assert(exhibit,`Chưa có vật thể ${mode.id}`);
    let meshes=0;exhibit.traverse(obj=>{if(obj.isMesh&&obj.geometry)meshes++});
    assert(meshes>0,`Bục trống: ${mode.id}`);
    assert.equal(exhibit.userData.modeId,mode.id);
    previewMeshes+=meshes;
    const kind=exhibit.userData.exhibitKind||'unknown';counts[kind]=(counts[kind]||0)+1;
    lines.push([grade,room.roomId,room.name,lab.labId,lab.name,mode.id,mode.name,kind,meshes,x,z]);
  }
}
assert.equal(rooms,34);assert.equal(modes,310);assert.equal(ROOM_BY_ID.size,34);
assert.equal(GRADE6_FAMILY_LABS.length,9);
assert.equal(ALL_MATH6_LABS.length,63);
for(const model of ALL_MATH6_LABS)assert(makeGrade6DragSpec(model).length>0,`Thiếu điều khiển: ${model.id}`);
assert(lines.length===311);
const q=v=>'"'+String(v??'').replaceAll('"','""')+'"';
const csv='\uFEFF'+lines.map(row=>row.map(q).join(',')).join('\r\n')+'\r\n';
if(process.argv.includes('--export'))fs.writeFileSync(path.join(root,'R70_DANH_MUC_310_BUC_TRUNG_BAY.csv'),csv);
console.log('R7.0 QA THÀNH CÔNG',JSON.stringify({thematicRooms:rooms,modePedestals:modes,geometryMeshes:previewMeshes,grade6FamilyLabs:GRADE6_FAMILY_LABS.length,grade6Models:ALL_MATH6_LABS.length,exhibitKinds:counts},null,2));
