/** R7.0: 310 individual teaching-mode stations in 34 actual classrooms.
 * This is a pure, testable floor-plan; all positions stay within the original
 * 32 x 34 m thematic chamber and preserve a pedestrian aisle. No fake doors.
 */
export const R70_MAX_EXHIBITS_IN_ROOM = 24;
export function planModePedestals(modes, {x,zSide}) {
  if (!Array.isArray(modes)||modes.length>R70_MAX_EXHIBITS_IN_ROOM||!Number.isFinite(x)||![-1,1].includes(zSide))
    throw new TypeError('Invalid room coordinates or mode inventory');
  const n=modes.length;
  if(!n)return [];
  const cols=Math.min(4,n),rows=Math.ceil(n/cols);
  const spacingX=6.75;
  const rowSpacing=rows>=4?5.35:rows===3?6.4:7.4;
  const start=rows>=4?20.0:rows===3?23.2:rows===2?26.0:29.0;
  return modes.map((mode,i)=>{
    const row=Math.floor(i/cols);
    const inRow=Math.min(cols,n-row*cols);
    const col=i%cols;
    const px=x+(col-(inRow-1)/2)*spacingX;
    const pz=zSide*(start+row*rowSpacing);
    return {mode,x:px,z:pz,row,col,grade:mode.grade};
  });
}
