/** Add Chibi visuals to original R75 avatars while preserving R75 movement and control. */
import {createChibiAvatar,isChibiPreset} from './chibi-avatars.mjs?v=r107_v15';
export {isChibiPreset};
export function enhanceOriginalAvatar(avatar){
 const originalSet=avatar.setAvatarType,originalGet=avatar.getAvatarType,originalUpdate=avatar.updateAnimation;
 let id=null,custom=null;
 avatar.setAvatarType=(type)=>{
  if(isChibiPreset(type)){
   if(id===type)return;
   if(custom){avatar.root.remove(custom.root);custom.dispose();}
   custom=createChibiAvatar(type);avatar.root.add(custom.root);avatar.body.visible=false;id=type;
  }else{
   if(custom){avatar.root.remove(custom.root);custom.dispose();custom=null;}
   id=null;avatar.body.visible=true;originalSet.call(avatar,type);
  }
 };
 avatar.getAvatarType=()=>id||originalGet.call(avatar);
 avatar.updateAnimation=(dt,speed,yaw,jump)=>{
  originalUpdate.call(avatar,dt,speed,yaw,jump);
  if(custom)custom.update(dt,speed,yaw,jump);
 };
 return avatar;
}
