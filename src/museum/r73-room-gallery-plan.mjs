/**
 * MATHVERSE R7.3 – a thematic gate opens DIRECTLY onto its model gallery.
 * Every curriculum Lab of the room gets its own visible zone (columns of
 * labelled pedestals); no intermediate Lab door has to be clicked.
 * Only the active room is constructed (same stage as R7.1/R7.2).
 */
import {R71_ROOM_DEPTH,R71_ROOM_HEIGHT,R71_STAGE_Z,R71_MAX_LABS_PER_ROOM} from './r71-expanded-room-plan.mjs';

export const R73_SPACING_X = 8.8;
export const R73_SPACING_Z = 9.2;
export const R73_ZONE_GAP = 3.2;
export const R73_FIRST_ROW = -9;      // relative to room centre, along zSide
export const R73_MIN_WIDTH = 48;

export function r73ColumnsFor(count) {
  if (count <= 1) return 1;
  return count > 6 ? 3 : 2;
}

export function planR73RoomGallery(room, cfg, labs) {
  if (!room || !cfg || !Array.isArray(labs) || !Number.isFinite(cfg.x) || ![-1, 1].includes(cfg.zSide))
    throw new TypeError('Invalid R7.3 room coordinates or Lab manifest');
  const maxLabs = room.isChapterRoom ? 8 : R71_MAX_LABS_PER_ROOM;
  if (!labs.length || labs.length > maxLabs)
    throw new RangeError(`Expected 1–${maxLabs} Labs in ${room.roomId}, got ${labs.length}`);
  if (labs.some(l => l.roomId !== room.roomId || l.grade !== room.grade || !Array.isArray(l.modes) || !l.modes.length))
    throw new Error(`Cross-room or empty Lab mapping detected in ${room.roomId}`);
  const {x, zSide} = cfg;
  const z = zSide * R71_STAGE_Z;
  const depth = R71_ROOM_DEPTH, height = R71_ROOM_HEIGHT;
  const zones = labs.map(lab => {
    const columns = r73ColumnsFor(lab.modes.length);
    return {lab, columns, rows: Math.ceil(lab.modes.length / columns),
      width: columns * R73_SPACING_X + 2.2};
  });
  const totalW = zones.reduce((a, b) => a + b.width, 0) + R73_ZONE_GAP * (zones.length - 1);
  const width = Math.max(R73_MIN_WIDTH, Math.ceil(totalW + 7));
  let cursor = x - totalW / 2;
  const objects = [];
  zones.forEach((zone, zi) => {
    zone.index = zi;
    zone.minX = cursor; zone.maxX = cursor + zone.width; zone.x = cursor + zone.width / 2;
    cursor = zone.maxX + R73_ZONE_GAP;
    zone.entry = {x: zone.x, z: z + zSide * (R73_FIRST_ROW - 6.2)};
    zone.lab.modes.forEach((mode, i) => {
      const col = i % zone.columns, row = Math.floor(i / zone.columns);
      objects.push({mode, lab: zone.lab, labId: zone.lab.labId, roomId: room.roomId, zone: zi, index: i, row, col, zSide,
        x: zone.x + (col - (zone.columns - 1) / 2) * R73_SPACING_X,
        z: z + zSide * (R73_FIRST_ROW + row * R73_SPACING_Z)});
    });
  });
  const limitX = width / 2 - 3.2, limitZ = depth / 2 - 3.2;
  if (objects.some(o => Math.abs(o.x - x) > limitX || Math.abs(o.z - z) > limitZ))
    throw new RangeError(`Room gallery too crowded: ${room.roomId}`);
  const bounds = {minX: x - width / 2 + 1.15, maxX: x + width / 2 - 1.15,
    minZ: z - depth / 2 + 1.15, maxZ: z + depth / 2 - 1.15};
  return {
    roomId: room.roomId, grade: room.grade, x, z, zSide, width, depth, height,
    spawn: {x, z: z - zSide * 17.5}, returnGate: {x, z: z - zSide * 25.5}, bounds,
    zones, objects, doors: [], modeCount: objects.length
  };
}
