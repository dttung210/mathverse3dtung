/** MATHVERSE R6.2: stable classification of real room/lab/mode IDs. */
export function classifyPortal(grade, value, getRoomById) {
  const room = typeof value === 'string' ? getRoomById(value) : null;
  return room && Number(room.grade) === Number(grade) ? room : null;
}
export function resolveSelection(value, getLabById, getModeById) {
  if (value && typeof value === 'object' && value.kind === 'r6-lab') {
    const lab = getLabById(value.labId);
    return lab ? {kind:'lab', id:lab.labId, grade:lab.grade, roomId:lab.roomId} : null;
  }
  const id = typeof value === 'string' ? value : value?.id;
  if (!id || (typeof value === 'object' && value.type)) return null;
  const mode = getModeById(id);
  return mode ? {kind:'mode', id:mode.id, grade:mode.grade, roomId:mode.roomId,labId:mode.labId} : null;
}
