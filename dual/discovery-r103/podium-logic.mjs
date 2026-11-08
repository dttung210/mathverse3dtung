/** Pure, testable selectors: max ONE Sketchfab iframe at a time (on-demand, no click required). */
export function makeSketchfabEmbedUrl(uid,{autostart=true,transparent=true}={}){
 if(!/^[a-f0-9]{32}$/i.test(String(uid||'')))return null;
 const params=new URLSearchParams({
  autostart:autostart?'1':'0',camera:'0',autospin:'0',transparent:transparent?'1':'0',
  ui_infos:'0',ui_controls:'1',ui_hint:'2',ui_settings:'0',
  ui_stop:'0',ui_annotations:'0',ui_inspector:'0'
 });
 return `https://sketchfab.com/models/${uid}/embed?${params.toString()}`;
}
export function nearestPedestal(stands,player,{
 maxDistance=16,excludeIds=new Set(),currentId=null,hysteresisMeters=2.2
}={}){
 if(!player||!stands?.length)return null;
 let best=null,dist=Infinity,previous=null,prevDist=Infinity;
 for(const s of stands){
  if(!s?.item?.uid||excludeIds.has(s.id))continue;
  if(s.group&&s.group.visible===false)continue;
  if(Number.isFinite(player.y)&&Number.isFinite(s.y)&&Math.abs(s.y-player.y)>4.8)continue;
  const d=Math.hypot((s.x||0)-player.x,(s.z||0)-player.z);
  if(d<dist){best=s;dist=d;}
  if(s.id===currentId){previous=s;prevDist=d;}
 }
 if(previous&&prevDist<=maxDistance&&prevDist<=dist+hysteresisMeters)return previous;
 return dist<=maxDistance?best:null;
}
