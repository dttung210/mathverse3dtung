/**
 * V7 GRAND CIRCULAR GALLERY: seven spacious sector halls around ONE rotunda.
 * Pure geometry. Does not import or modify the immutable MATHVERSE R75 engine.
 * The narrow southern gap (towards +Z) is reserved for the return portal.
 */
export const GRADES=[6,7,8,9,10,11,12];
export const ANGLES_DEG=[-148,-99,-49.5,0,49.5,99,148];
export const HUB_RADIUS=48;
export const FAR_RADIUS=142;
export const ENTRANCE_Z=24;
export const SECTOR_HALF=22.5*Math.PI/180;
export const GATE_HALF_WIDTH=7.75; // V8: 15.5-metre unobstructed exhibition entrances
export const RETURN_PORTAL={x:0,z:HUB_RADIUS-3.6};
export const CLASSIFICATION_PODIUM={x:0,z:0};
const normAngle=v=>Math.atan2(Math.sin(v),Math.cos(v));
const localOf=(world,theta)=>({r:world.x*Math.sin(theta)-world.z*Math.cos(theta),u:world.x*Math.cos(theta)+world.z*Math.sin(theta)});
export function roomWorld(theta,r,u=0){
  return {x:r*Math.sin(theta)+u*Math.cos(theta),z:-r*Math.cos(theta)+u*Math.sin(theta)};
}
export function polarPosition(pos){return {r:Math.hypot(pos.x,pos.z),theta:Math.atan2(pos.x,-pos.z)};}
export function planRooms(items){
  return GRADES.map((grade,i)=>{
    const lessons=items.filter(it=>Number(it.grade)===grade).sort((a,b)=>Number(a.number)-Number(b.number));
    const theta=ANGLES_DEG[i]*Math.PI/180;
    return {grade,theta,angleDeg:ANGLES_DEG[i],halfAngle:SECTOR_HALF,start:HUB_RADIUS,end:FAR_RADIUS,
      length:FAR_RADIUS-HUB_RADIUS,lessons,portal:roomWorld(theta,HUB_RADIUS),blocks:[]};
  });
}
function findSector(plan,position,withMargin=0){
  const {r,theta}=polarPosition(position);
  if(r<HUB_RADIUS-.8)return null;
  return plan.find(p=>{
    const delta=normAngle(theta-p.theta);
    if(Math.abs(delta)>p.halfAngle-withMargin)return false;
    return r*Math.cos(delta)<=FAR_RADIUS*Math.cos(p.halfAngle)+.2;
  })||null;
}
export function gradeForPosition(plan,posOrX,z){
  return findSector(plan,typeof posOrX==='object'?posOrX:{x:posOrX,z})?.grade||null;
}
export function nearestPortal(plan,pos,limit=9.0){
  let winner=null,dist=limit;
  for(const room of plan){
    const d=Math.hypot(pos.x-room.portal.x,pos.z-room.portal.z);
    if(d<dist){winner=room;dist=d;}
  }
  return winner;
}
function hitsDisplay(room,world,clearance=.76){
  const p=localOf(world,room.theta);
  return (room.blocks||[]).some(block=>{
    const halfThick=((block.thickness||.44)/2)+clearance;
    const halfWidth=(block.width/2)+clearance;
    return Math.abs(p.r-block.r)<halfThick && Math.abs(p.u-(block.u||0))<halfWidth;
  });
}
/** Position validator used for safe jump-to-poster targets. */
export function isWalkable(plan,position,clearance=.76){
  if(!Number.isFinite(position.x)||!Number.isFinite(position.z))return false;
  const {r,theta}=polarPosition(position);
  if(r<7.1+clearance)return false; // Only the central catalog plinth is solid.
  if(r<=HUB_RADIUS-1.05)return true;
  const room=findSector(plan,position,Math.atan(clearance/Math.max(1,r)));
  if(!room)return false;
  const p=localOf(position,room.theta);
  if(p.r>FAR_RADIUS*Math.cos(room.halfAngle)-clearance)return false;
  if(p.r<HUB_RADIUS-1.05 && Math.abs(p.u)>GATE_HALF_WIDTH-clearance)return false;
  return !hitsDisplay(room,position,clearance);
}
function clampCandidate(room,position){
  const {r,theta}=polarPosition(position);
  const margin=Math.atan(1.00/Math.max(1,r));
  const delta=Math.max(-room.halfAngle+margin,Math.min(room.halfAngle-margin,normAngle(theta-room.theta)));
  const limit=(FAR_RADIUS*Math.cos(room.halfAngle)-.85)/Math.cos(delta);
  return roomWorld(room.theta+delta,Math.max(HUB_RADIUS+.2,Math.min(r,limit)));
}
export function restrictPosition(plan,prev,next){
  const a=polarPosition(prev),b=polarPosition(next);
  const centralAvoidance=7.85;
  if(b.r<centralAvoidance)return roomWorld(b.theta,centralAvoidance);
  const prevRoom=findSector(plan,prev);
  let room=prevRoom;
  const doorway=angle=>Math.atan((GATE_HALF_WIDTH-.7)/Math.max(HUB_RADIUS,angle));
  if(!room){
    if(b.r<=HUB_RADIUS-.92)return {...next};
    room=plan.find(p=>Math.abs(normAngle(b.theta-p.theta))<doorway(HUB_RADIUS));
    if(!room)return roomWorld(b.theta,HUB_RADIUS-.96);
  }
  if(b.r<HUB_RADIUS+.25){
    if(Math.abs(normAngle(b.theta-room.theta))<doorway(HUB_RADIUS))return {...next};
    // A wall segment is solid even when the destination is slightly inside the ring.
    return a.r>=HUB_RADIUS+.25?{...prev}:roomWorld(b.theta,HUB_RADIUS-.96);
  }
  // Outside the open doorway, the circular hub walls must remain solid.
  if(a.r<HUB_RADIUS-.85 && Math.abs(normAngle(b.theta-room.theta))>=doorway(HUB_RADIUS)){
    return roomWorld(b.theta,HUB_RADIUS-.96);
  }
  const clamped=clampCandidate(room,next);
  if(!hitsDisplay(room,clamped))return clamped;
  // Slide alongside the exhibit panel instead of freezing movement entirely.
  const before=localOf(prev,room.theta),after=localOf(clamped,room.theta);
  const slideRadial=roomWorld(room.theta,after.r,before.u);
  if(isWalkable(plan,slideRadial,.68))return slideRadial;
  const slideLateral=roomWorld(room.theta,before.r,after.u);
  if(isWalkable(plan,slideLateral,.68))return slideLateral;
  return {...prev};
}
export function entranceVisibilityAtSpawn(){
  return ANGLES_DEG.map((deg,i)=>{
    const portal=roomWorld(deg*Math.PI/180,HUB_RADIUS);
    const bearing=Math.atan2(portal.x,ENTRANCE_Z-portal.z)*180/Math.PI;
    return {grade:GRADES[i],bearingDegrees:bearing,...portal};
  });
}
/** Keep exact source aspect ratio, never stretch or crop educational images. */
export function posterDisplaySize(aspect,maxHeight=5.65,maxWidth=4.75){
  if(!Number.isFinite(aspect)||aspect<=0)throw new RangeError('Invalid infographic image aspect');
  const h=Math.min(maxHeight,maxWidth/aspect);
  return {w:Number((h*aspect).toFixed(5)),h:Number(h.toFixed(5))};
}
