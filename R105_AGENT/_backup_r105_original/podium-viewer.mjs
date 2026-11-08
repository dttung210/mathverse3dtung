/** Screen-projected transparent Sketchfab viewer anchored above a REAL Three.js pedestal.
 * This is a cross-origin iframe, not a GLB mesh. On approach, the external 3D viewer loads
 * automatically; dragging it rotates the MODEL in its own Sketchfab scene. Local licensed GLB
 * installed through the manifest replaces the panel with a true Three.js world mesh.
 */
import * as THREE from '/vendor/three.module.js';
import {makeSketchfabEmbedUrl,nearestPedestal} from './podium-logic.mjs';

function node(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!=null)el.textContent=text;return el;}
export function createPodiumSketchfabViewer({getStands,onDetails,getLocalIds,onUpload}={}){
 const root=node('section','r103-podium-layer');root.id='r103-podium-layer';root.hidden=true;
 root.setAttribute('aria-label','Mô hình 3D tương tác trên bục trưng bày');
 const card=node('div','r103-podium-card');
 const head=node('div','r103-podium-head');
 const accent=node('span','r103-podium-accent','3D SKETCHFAB · TRỰC TIẾP TRÊN BỤC');
 const title=node('strong','r103-podium-title','');head.append(accent,title);
 const frame=node('iframe','r103-podium-frame');frame.title='Mô hình 3D Sketchfab tại bục, kéo để xoay hoặc cuộn để phóng to';
 frame.allow='autoplay; fullscreen; xr-spatial-tracking';frame.allowFullscreen=true;frame.loading='eager';
 frame.sandbox='allow-scripts allow-same-origin allow-popups allow-forms allow-presentation';
 frame.referrerPolicy='strict-origin-when-cross-origin';
 const foot=node('div','r103-podium-footer');
 const hint=node('small','','Kéo mô hình để xoay · cuộn để phóng to');
 const detail=node('button','r103-details-button','📖 XEM ẢNH · TIỂU SỬ · 3D/2D');detail.type='button';
 const upload=node('button','r103-upload-button','⬆ GLB CÓ PHÉP');upload.type='button';upload.title='Giáo viên chọn GLB được cấp phép để đặt mô hình thật lên bục';
 const input=node('input','r103-file-input');input.type='file';input.accept='.glb,model/gltf-binary';input.hidden=true;
 foot.append(hint,upload,detail);card.append(head,frame,foot,input);root.append(card);document.body.append(root);
 let activeId=null,lastSeen=null,shown=false,lastFrame=0,selectorLock=0;
 const aWorld=new THREE.Vector3(),topWorld=new THREE.Vector3(),sBottom=new THREE.Vector3(),sTop=new THREE.Vector3();
 detail.onclick=()=>{const item=lastSeen?.item;if(item)onDetails?.(item.id);};
 upload.onclick=()=>{if(lastSeen)input.click();};
 input.onchange=async()=>{
  const file=input.files?.[0];const id=lastSeen?.id;input.value='';if(!file||!id)return;
  upload.disabled=true;upload.textContent='ĐANG NẠP GLB...';
  try{await onUpload?.(id,file);reset();}
  catch(error){upload.textContent='LỖI: '+String(error?.message||error).slice(0,34);}
  finally{upload.disabled=false;setTimeout(()=>upload.textContent='⬆ GLB CÓ PHÉP',3200);}
 };
 function reset(){root.hidden=true;shown=false;lastSeen=null;activeId=null;frame.removeAttribute('src');}
 function hideNoReset(){root.hidden=true;shown=false;}
 function projectStand(stand,camera,viewport){
  stand.group.updateWorldMatrix(true,false);
  aWorld.set(0,1.03,0);stand.group.localToWorld(aWorld);
  topWorld.set(0,6.25,0);stand.group.localToWorld(topWorld);
  sBottom.copy(aWorld).project(camera);sTop.copy(topWorld).project(camera);
  if(sBottom.z<=-1||sBottom.z>=1||sTop.z<=-1||sTop.z>=1)return null;
  const centerX=(sBottom.x+1)*.5*viewport.width+viewport.left;
  const bottomY=(1-sBottom.y)*.5*viewport.height+viewport.top;
  const topY=(1-sTop.y)*.5*viewport.height+viewport.top;
  const naturalHeight=Math.max(145,Math.min(440,Math.abs(bottomY-topY)*1.04));
  const w=Math.round(Math.max(230,Math.min(500,naturalHeight*1.32)));
  const h=Math.round(Math.max(170,Math.min(420,naturalHeight)));
  const x=Math.round(centerX-w/2),y=Math.round(bottomY-h-2);
  if(x+w<viewport.left+50||x>viewport.left+viewport.width-50||y+h<viewport.top+35||y>viewport.top+viewport.height-50)return null;
  return{x,y,w,h};
 }
 function update({enabled=false,camera,player,canvas,modalOpen=false}={}){
  if(!enabled||modalOpen||!camera||!canvas||!player){if(shown||activeId)reset();return;}
  if(!getStands){reset();return;}
  // At 60 fps just update the transform; never create multiple Sketchfab viewers.
  const active=nearestPedestal(getStands(),player,{currentId:activeId,maxDistance:17});
  if(!active||getLocalIds?.()?.has(active.id)){if(shown||activeId)reset();return;}
  const viewport=canvas.getBoundingClientRect();
  const rect=projectStand(active,camera,viewport);
  if(!rect){hideNoReset();return;}
  if(active.id!==activeId){
    activeId=active.id;lastSeen=active;root.hidden=false;
    title.textContent=active.item.name;
    accent.textContent=(active.item.group==='ancient'?'KỲ QUAN CỔ ĐẠI':active.item.group==='new2007'?'NEW7WONDERS 2007':'KIẾN TRÚC HÌNH HỌC')+' · SKETCHFAB';
    card.dataset.group=active.item.group;
    const next=makeSketchfabEmbedUrl(active.item.uid);
    frame.removeAttribute('src');if(next)frame.src=next;
  }
  root.hidden=false;shown=true;
  card.style.width=rect.w+'px';card.style.height=rect.h+'px';card.style.left=rect.x+'px';card.style.top=rect.y+'px';
 }
 return {update,reset,get activeId(){return activeId;},get visible(){return shown;}};
}
