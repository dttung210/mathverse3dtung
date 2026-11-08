/** Reusable, geometry-only navigation helpers. Independent from WebGL/DOM. */
export function dampVelocity(current,target,smoothing,delta){
  const t=1-Math.exp(-Math.max(0,smoothing)*Math.max(0,Math.min(delta,.1)));
  return current+(target-current)*t;
}
export function resolvePlinthSlide(fromX,fromZ,toX,toZ,centres,radius=1.7){
  let x=toX,z=toZ;
  const blocked=(px,pz)=>centres.some(([cx,cz])=>Math.hypot(px-cx,pz-cz)<radius);
  // Sweep X and Z individually for a stable, sliding collision rather than freezing the player.
  // Max dt is 50ms (step < 1m), so no plinth can be tunnelled through in one frame.
  if(blocked(x,fromZ))x=fromX;
  if(blocked(x,z))z=fromZ;
  // If the player's saved spawn location was within a plinth, allow escape by moving outward.
  if(blocked(fromX,fromZ)&&blocked(x,z)){
    const oldDist=Math.min(...centres.map(([cx,cz])=>Math.hypot(fromX-cx,fromZ-cz)));
    const newDist=Math.min(...centres.map(([cx,cz])=>Math.hypot(toX-cx,toZ-cz)));
    if(newDist>oldDist){x=toX;z=toZ;}
  }
  return {x,z};
}
export function normalizedMove(forward,side,yaw,speed){
  const norm=Math.max(1,Math.hypot(forward,side));
  return {x:(forward*Math.sin(yaw)-side*Math.cos(yaw))*speed/norm,
    z:(forward*Math.cos(yaw)+side*Math.sin(yaw))*speed/norm};
}
export function catalogRoomSelection(items,grade,page=0){
  return items.filter(m=>m.grade===grade).slice(Math.max(0,Math.floor(page))*9,(Math.max(0,Math.floor(page))+1)*9);
}
export function roomCatalogSignature(items,grade,page=0){
  const selected=catalogRoomSelection(items,grade,page);
  return JSON.stringify(selected.map(m=>[m.id,m.type,m.params,m.data,m.viewState,m.title]));
}
