/**
 * R6.9: front-facing Lab gallery layout, independent of Three.js.
 * Prior R6.8 placed most doors on left/right walls, outside a student's
 * initial forward view. Every classroom contains at most four family Labs.
 * Place all doors in one visible row facing the entry, with safe aisle space.
 */
export const R69_MAX_DOORS = 4;
export function labDoorOffsets(count) {
  if (!Number.isInteger(count) || count < 0 || count > R69_MAX_DOORS) {
    throw new RangeError(`R6.9 only supports 0–${R69_MAX_DOORS} lab doors per thematic room; got ${count}`);
  }
  const layouts = [[], [0], [-4.8, 4.8], [-8.0, 0, 8.0], [-10.6, -3.55, 3.55, 10.6]];
  return layouts[count].slice();
}
export function placeVisibleLabDoors(labs, {x, zSide}) {
  if(!Array.isArray(labs) || !Number.isFinite(x) || ![-1,1].includes(zSide)) {
    throw new TypeError('Invalid classroom coordinates or Lab registry');
  }
  const offsets=labDoorOffsets(labs.length);
  const z=zSide*36.1; // in front of existing rear wall ±48; 21m from spawn
  const spawnZ=zSide*15.0;
  return labs.map((lab,i)=>{
    const px=x+offsets[i];
    const heading=Math.atan2(Math.abs(px-x), Math.abs(z-spawnZ));
    return {lab,x:px,z,angle:zSide===1?Math.PI:0,heading,offset:offsets[i],grade:lab.grade};
  });
}
