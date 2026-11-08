/**
 * MATHVERSE R7.1 – independent, expanded 3D thematic rooms.
 * One accessible 3D doorway per CURRICULUM Lab (not per mathematical mode).
 * The rooms occupy a separate stage outside the compact 7-classroom building;
 * only the active room is constructed. This avoids overlapping grade classrooms.
 */
export const R71_ROOM_WIDTH = 48;
export const R71_ROOM_DEPTH = 56;
export const R71_ROOM_HEIGHT = 9.2;
export const R71_STAGE_Z = 190;
export const R71_MAX_LABS_PER_ROOM = 4;

export function r71DoorOffsets(n) {
  if (!Number.isInteger(n) || n < 1 || n > R71_MAX_LABS_PER_ROOM) {
    throw new RangeError(`Expected 1–4 Labs in a thematic room, got ${n}`);
  }
  return [null, [0], [-8.1, 8.1], [-13.5, 0, 13.5], [-17.25, -5.75, 5.75, 17.25]][n].slice();
}

export function planR71ExpandedRoom(room, cfg, labs) {
  if (!room || !cfg || !Array.isArray(labs) || !Number.isFinite(cfg.x) || ![-1, 1].includes(cfg.zSide)) {
    throw new TypeError('Invalid R7.1 room coordinates or Lab manifest');
  }
  const offsets = r71DoorOffsets(labs.length);
  if (labs.some(l => l.roomId !== room.roomId || l.grade !== room.grade)) {
    throw new Error(`Cross-room Lab mapping detected in ${room.roomId}`);
  }
  const {x, zSide} = cfg;
  const z = zSide * R71_STAGE_Z;
  const doorZ = z + zSide * 13.4;
  const returnZ = z - zSide * 25.5;
  const spawnZ = z - zSide * 17.5;
  const bounds = {minX:x - R71_ROOM_WIDTH/2 + 1.15, maxX:x + R71_ROOM_WIDTH/2 - 1.15,
    minZ:Math.min(z - R71_ROOM_DEPTH/2 + 1.15,z + R71_ROOM_DEPTH/2 - 1.15),
    maxZ:Math.max(z - R71_ROOM_DEPTH/2 + 1.15,z + R71_ROOM_DEPTH/2 - 1.15)};
  return {
    roomId:room.roomId, grade:room.grade, x,z,zSide,
    width:R71_ROOM_WIDTH, depth:R71_ROOM_DEPTH,height:R71_ROOM_HEIGHT,
    spawn:{x,z:spawnZ},returnGate:{x,z:returnZ},bounds,
    doors:labs.map((lab,i)=>({lab, x:x+offsets[i], z:doorZ, rotation:zSide===1?Math.PI:0, index:i}))
  };
}

export function r71Contains(plan,px,pz){
  return !!plan && Number.isFinite(px) && Number.isFinite(pz) &&
    px>=plan.bounds.minX&&px<=plan.bounds.maxX&&pz>=plan.bounds.minZ&&pz<=plan.bounds.maxZ;
}
export function r71Clamp(plan,px,pz) {
  if (!plan) throw new TypeError('Missing active room');
  return {x:Math.max(plan.bounds.minX,Math.min(plan.bounds.maxX,px)),
    z:Math.max(plan.bounds.minZ,Math.min(plan.bounds.maxZ,pz))};
}
