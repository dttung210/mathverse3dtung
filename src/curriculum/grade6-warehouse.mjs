/** R6.8: true Lab-family structure for Grade 6, same as Grades 7–12.
 * 9 families, 63 source modes; original 4 thematic room IDs are preserved. */
import {GRADE6_FAMILY_LABS,getUnifiedLabByModeId} from '../museum/r68-unified-labs.mjs?v=r107_v15';
import {LAB_TO_EXHIBIT} from '../math6-lab/catalog.js?v=r107_v15';
import {labById} from '../math6-lab/catalog.js?v=r107_v15';
import {isGrade6ActiveLab} from '../portal-labs/grade6-curation-v15-1.js?v=r107_v15';
export const GRADE6_WAREHOUSE_COUNT={rooms:4,familyLabs:9,sourceLabUnits:63,featured:35,archived:28};
export function grade6WarehouseFamilies(){
 return GRADE6_FAMILY_LABS.map(l=>({
  id:l.labId,grade:6,name:l.name,summary:`${l.roomName} · ${l.modes.length} mô hình`,
  family:'GRADE6',roomId:l.roomId,
  modes:l.modes.map(m=>({id:m.id,name:m.name,sourceLabId:m.sourceLabId,
   roomId:l.roomId,status:isGrade6ActiveLab(m.id)?'featured':'archived',
   anchorId:LAB_TO_EXHIBIT[m.id]||null,engine:labById(m.id)?.engine||'model',realModel:Boolean(labById(m.id))}))
 }));
}
export function grade6WarehouseModeById(modeId){
 const family=getUnifiedLabByModeId(modeId);if(!family||family.grade!==6)return null;
 const mode=grade6WarehouseFamilies().find(f=>f.id===family.labId)?.modes.find(m=>m.id===modeId);
 return mode?{...mode,roomName:family.roomName,labName:family.name,labId:family.labId}:null;
}
