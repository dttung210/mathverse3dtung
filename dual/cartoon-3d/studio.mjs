/** MATHVERSE Cartoon 3D Studio. Additive, opt-in appearance controls only. */
import {createChibiAvatar,CHIBI_PRESETS,isChibiPreset} from './chibi-avatars.mjs?v=r107_v15';
import {makeLabExterior,makeMuseumExterior,makeGarden,LAB_STYLES,MUSEUM_STYLES,GARDEN_STYLES} from './architecture.mjs?v=r107_v15';

export {CHIBI_PRESETS,isChibiPreset};
export const ALL_AVATAR_IDS=Object.freeze(['alex','triet','an','bot','suhocba']);

function saved(k,valid,fallback='classic'){
 try{const value=localStorage.getItem('mathverse-r107-master-'+k);return valid.some(v=>v.id===value)?value:fallback;}catch{return fallback;}
}
function putSaved(k,value){try{localStorage.setItem('mathverse-r107-master-'+k,value);}catch{}}

/** Wrap the existing avatar methods without changing navigation, collision or mathematical engines. */
export function enableChibiCharacters(avatar){
 const oldUpdate=avatar.updateAnimation,oldGet=avatar.getAvatarType,oldSet=avatar.setAvatarType;
 let current=null,model=null;
 avatar.setAvatarType=(id)=>{
  if(isChibiPreset(id)){
   if(current===id)return;
   if(model){avatar.root.remove(model.root);model.dispose();}
   model=createChibiAvatar(id);avatar.root.add(model.root);avatar.body.visible=false;current=id;
  }else{
   if(model){avatar.root.remove(model.root);model.dispose();model=null;}
   current=null;avatar.body.visible=true;oldSet.call(avatar,id);
  }
 };
 avatar.getAvatarType=()=>current||oldGet.call(avatar);
 avatar.updateAnimation=(dt,speed,yaw,jump)=>{
  oldUpdate.call(avatar,dt,speed,yaw,jump);
  if(model)model.update(dt,speed,yaw,jump);
 };
 return {isActive:()=>Boolean(current),getId:()=>current};
}

export function createCartoonStudio({avatar,lobbyGroup,onAvatarChange=()=>{},onStatus=()=>{}}){
 const selector={avatar:document.getElementById('avatar-select'),
   character:document.getElementById('cartoon-character'),lab:document.getElementById('cartoon-lab'),
   museum:document.getElementById('cartoon-museum'),garden:document.getElementById('cartoon-garden')};
 const root=document.getElementById('cartoon-studio-panel');
 const open=document.getElementById('cartoon-studio-open');
 const close=document.getElementById('cartoon-studio-close');
 const reset=document.getElementById('cartoon-studio-reset');
 if(!root||!open||!selector.character||!selector.lab||!selector.museum||!selector.garden){
  throw Error('Cartoon Studio HTML is not installed; run the full ZIP installer.');
 }
 const chibi=enableChibiCharacters(avatar);
 const choices={lab:saved('lab',LAB_STYLES,'quantum'),museum:saved('museum',MUSEUM_STYLES,'orbital'),garden:saved('garden',GARDEN_STYLES,'orbital')};
 const parts={lab:null,museum:null,garden:null};
 const sets={lab:LAB_STYLES,museum:MUSEUM_STYLES,garden:GARDEN_STYLES};
 const builders={lab:makeLabExterior,museum:makeMuseumExterior,garden:makeGarden};
 const populate=(sel,arr)=>{sel.replaceChildren(...arr.map(({id,name})=>new Option(name,id)));};
 populate(selector.character,[
  {id:'alex',name:'👨‍🏫 Thầy Tùng · Giảng viên Chibi 3D Cartoon'},
  {id:'triet',name:'👦 Minh Triết · Nam sinh Chibi 3D Cartoon'},
  {id:'an',name:'👧 Tuệ An · Nữ sinh Chibi 3D Cartoon'},
  {id:'bot',name:'🤖 Bot Pi · Robot Chibi 3D Cartoon'},
  {id:'suhocba',name:'🧘 Sư Học Bá · Sư Chùa Đầu Trọc Chibi 3D'}
 ]);
 for(const key of ['lab','museum','garden']){
  populate(selector[key],sets[key]);selector[key].value=choices[key];
 }
 function setArchitecture(key,value){
  if(!sets[key].some(item=>item.id===value))return false;
  const previous=parts[key];if(previous){lobbyGroup.remove(previous.group);previous.dispose();}
  parts[key]=null;choices[key]=value;selector[key].value=value;
  if(value!=='classic'){const next=builders[key](value);parts[key]=next;lobbyGroup.add(next.group);}
  putSaved(key,value);return true;
 }
 for(const key of ['lab','museum','garden']){
  selector[key].addEventListener('change',()=>{
   setArchitecture(key,selector[key].value);
   onStatus('Đã cập nhật ngoại thất '+({lab:'LAB',museum:'bảo tàng',garden:'cảnh quan'}[key]));
  });
  setArchitecture(key,choices[key]);
 }
 const startupId=(()=>{try{return localStorage.getItem('mathverse_avatar');}catch{return null;}})();
 if(startupId&&isChibiPreset(startupId))avatar.setAvatarType(startupId);
 selector.character.value=avatar.getAvatarType();
 // Existing avatar selector is kept as the authoritative control; this secondary
 // selector simply forwards its change, leaving all app-side save logic intact.
 selector.character.addEventListener('change',()=>onAvatarChange(selector.character.value));
 function syncAvatar(){const current=avatar.getAvatarType();if(selector.character.value!==current)selector.character.value=current;}
 function toggle(force){const show=force===undefined?root.hidden:Boolean(force);root.hidden=!show;open.setAttribute('aria-expanded',String(show));syncAvatar();}
 open.addEventListener('click',()=>toggle());
 close.addEventListener('click',()=>toggle(false));
 root.addEventListener('click',event=>{if(event.target===root)toggle(false);});
 reset.addEventListener('click',()=>{
  setArchitecture('lab','quantum');
  setArchitecture('museum','orbital');
  setArchitecture('garden','orbital');
  onAvatarChange('suhocba');syncAvatar();onStatus('Đã áp dụng Phương án chuẩn: PA4 Vòng Quỹ Đạo + PA1 Kiến trúc + Sư Học Bá Chibi 3D');
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!root.hidden)toggle(false);});
 return {
  get isOpen(){return !root.hidden;},
  isChibiSelected:()=>chibi.isActive(),
  syncAvatar,setArchitecture,
  getSelection:()=>({...choices,avatar:avatar.getAvatarType()}),
  setQuality:(q)=>{if(parts.garden)parts.garden.group.visible=q!=='eco';},
  dispose:()=>{for(const k of Object.keys(parts))if(parts[k]){lobbyGroup.remove(parts[k].group);parts[k].dispose();}}
 };
}
