/**
 * MATHVERSE R6.8 – one *family Lab* architecture for Grades 6–12.
 * The 63 original Grade-6 source Lab IDs remain immutable mathematical-mode IDs.
 * They are grouped under 9 curriculum Lab doors, exactly as Grade 8 groups
 * many mathematical cases under one Lab ID.
 *
 * Source inventory: 63 Grade-6 original modules + 67 family Labs = 130.
 * Teaching UI: 9 Grade-6 family Labs + 67 family Labs = 76 Lab doors.
 * No model/source ID is removed or duplicated.
 */
import {getRoomsForGrade,getModeById,getLabById,getRoomById} from './r6-room-layout.js?v=r107_v15';

const groupedByRoom=new Map();
const groupedById=new Map();
const grade6FamilyByMode=new Map();
for(const room of getRoomsForGrade(6)) {
  const families=[];
  for(let gi=0;gi<room.groupNames.length;gi++) {
    const groupName=room.groupNames[gi];
    const sources=room.labs.filter(l=>l.group===groupName);
    if(!sources.length)continue;
    const id=`${room.roomId}-L${String(gi+1).padStart(2,'0')}`;
    const modes=sources.flatMap(l=>l.modes.map(m=>{
      const source=getModeById(m.id);
      const model={...source,sourceLabId:l.labId,labId:id,labName:groupName,roomName:room.name};
      grade6FamilyByMode.set(m.id,id);
      return model;
    }));
    const family={labId:id,id,grade:6,roomId:room.roomId,roomName:room.name,
      name:groupName,family:'GRADE6',role:'family-lab',modality:'CURRICULUM',
      sourceLabIds:sources.map(l=>l.labId),modes};
    groupedById.set(id,family);families.push(family);
  }
  groupedByRoom.set(room.roomId,families);
}
export const GRADE6_FAMILY_LABS=Object.freeze([...groupedById.values()]);
export function getLabDoorsForRoom(roomId) {
  const room=getRoomById(roomId);
  if(!room)return [];
  if(room.isChapterRoom)return room.labs||[];
  return room.grade===6 ? (groupedByRoom.get(roomId)||[]) : room.labs.map(l=>getLabById(l.labId));
}
export function getUnifiedLabById(labId) {return groupedById.get(labId)||getLabById(labId);}
export function getUnifiedLabByModeId(modeId) {
  const mode=getModeById(modeId);
  if(!mode)return null;
  return getUnifiedLabById(grade6FamilyByMode.has(mode.id)?grade6FamilyByMode.get(mode.id):mode.labId);
}
export function getGrade6FamiliesForWarehouse(){
  return GRADE6_FAMILY_LABS.map(f=>({...f,
    summary:`${f.roomName} · ${f.modes.length} mô hình`,
    modes:f.modes.map(m=>({...m,sourceLabId:m.sourceLabId,anchorId:null,
      realModel:true}))}));
}
