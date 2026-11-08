/** R7.2: one spatial 3D exhibit room behind each thematic Lab door. */
export function planR72LabGallery(roomPlan,lab) {
  if(!roomPlan||!lab||lab.roomId!==roomPlan.roomId||!Array.isArray(lab.modes)||!lab.modes.length)
    throw new TypeError('Missing or incorrectly mapped curriculum Lab gallery');
  const modes=lab.modes;
  const columns=Math.min(4,Math.ceil(Math.sqrt(modes.length*1.6)));
  const rows=Math.ceil(modes.length/columns);
  const spacingX=9.2,spacingZ=10.4;
  const objects=modes.map((mode,i)=>{
    const col=i%columns,row=Math.floor(i/columns);
    return {mode,labId:lab.labId,roomId:roomPlan.roomId,index:i,
      x:roomPlan.x+(col-(columns-1)/2)*spacingX,
      z:roomPlan.z+roomPlan.zSide*((row-(rows-1)/2)*spacingZ+5.0)};
  });
  const back={x:roomPlan.x,z:roomPlan.z-roomPlan.zSide*25.5};
  const spawn={x:roomPlan.x,z:roomPlan.z-roomPlan.zSide*18.5};
  if(objects.some(o=>Math.abs(o.x-roomPlan.x)>roomPlan.width/2-4||
    Math.abs(o.z-roomPlan.z)>roomPlan.depth/2-4))throw new RangeError(`Lab too crowded: ${lab.labId}`);
  return {roomId:roomPlan.roomId,labId:lab.labId,grade:lab.grade,columns,rows,objects,
    spawn,returnGate:back,modeCount:modes.length};
}
