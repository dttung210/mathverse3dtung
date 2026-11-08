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
 function makeFrameNode(){
  const f=node('iframe','r103-podium-frame');
  f.title='Mô hình 3D Sketchfab tại bục, kéo để xoay hoặc cuộn để phóng to';
  f.allow='autoplay; fullscreen; xr-spatial-tracking; accelerometer; gyroscope';
  f.allowFullscreen=true;f.loading='eager';
  return f;
 }
 let frame=makeFrameNode();
 const foot=node('div','r103-podium-footer');
 const hint=node('small','','Kéo để xoay · cuộn phóng to');
 const toggleMeshBtn=node('button','r103-upload-button','🔄 KHỐI 3D');toggleMeshBtn.type='button';toggleMeshBtn.title='Chuyển đổi giữa khung Sketchfab trực tiếp trên bục và khối 3D trên bục';
 const detail=node('button','r103-details-button','📖 XEM ẢNH · TIỂU SỬ · 3D/2D');detail.type='button';
 const upload=node('button','r103-upload-button','⬆ GLB CÓ PHÉP');upload.type='button';upload.title='Giáo viên chọn GLB được cấp phép để đặt mô hình thật lên bục';
 const input=node('input','r103-file-input');input.type='file';input.accept='.glb,model/gltf-binary';input.hidden=true;
 head.append(toggleMeshBtn);
 foot.append(hint,upload,detail);card.append(head,frame,foot,input);
 const pill=node('button','r103-podium-pill','🌐 NHÚNG SKETCHFAB TRỰC TIẾP LÊN BỤC');pill.type='button';pill.hidden=true;
 root.append(card,pill);document.body.append(root);
 let activeId=null,lastSeen=null,shown=false,frameLoadedForId=null,loadTimer=null,fallbackTimer=null;
 const forceSketchfabIds=new Set(),hideSketchfabIds=new Set();
 const aWorld=new THREE.Vector3(),topWorld=new THREE.Vector3(),sBottom=new THREE.Vector3(),sTop=new THREE.Vector3();
 function bindFrameEvents(f,targetId){
  f.onload=()=>{
   if(f!==frame||!activeId||activeId!==targetId||!String(f.src||'').includes('sketchfab.com/models/'))return;
   clearTimeout(loadTimer);
   loadTimer=setTimeout(()=>{
    if(f===frame&&activeId===targetId){
     frameLoadedForId=targetId;
     clearTimeout(fallbackTimer);
     card.style.opacity='1';
     card.style.pointerEvents='auto';
     f.style.opacity='1';
     if(lastSeen?.model)lastSeen.model.visible=false;
    }
   },550);
  };
  f.onerror=()=>{
   if(f!==frame||!activeId||activeId!==targetId)return;
   hideSketchfabIds.add(targetId);
   restoreStandPreview();
   activeId=null;
  };
 }
 function mountFreshFrame(url,targetId){
  const nextFrame=makeFrameNode();
  nextFrame.style.opacity='1';
  bindFrameEvents(nextFrame,targetId);
  if(frame&&frame.parentNode===card)card.replaceChild(nextFrame,frame);
  else card.insertBefore(nextFrame,foot);
  frame=nextFrame;
  if(url)frame.src=url;
 }
 detail.onclick=()=>{const item=lastSeen?.item;if(item)onDetails?.(item.id);};
 upload.onclick=()=>{if(lastSeen)input.click();};
 toggleMeshBtn.onclick=()=>{
  if(!lastSeen)return;
  const id=lastSeen.id;
  if(forceSketchfabIds.has(id))forceSketchfabIds.delete(id);
  else hideSketchfabIds.add(id);
  restoreStandPreview();
  if(frame?.parentNode)frame.remove();
  activeId=null;
 };
 pill.onclick=()=>{
  if(!lastSeen)return;
  const id=lastSeen.id;
  hideSketchfabIds.delete(id);
  forceSketchfabIds.add(id);
  activeId=null;
 };
 input.onchange=async()=>{
  const file=input.files?.[0];const id=lastSeen?.id;input.value='';if(!file||!id)return;
  upload.disabled=true;upload.textContent='ĐANG NẠP GLB...';
  try{await onUpload?.(id,file);reset();}
  catch(error){upload.textContent='LỖI: '+String(error?.message||error).slice(0,34);}
  finally{upload.disabled=false;setTimeout(()=>upload.textContent='⬆ GLB CÓ PHÉP',3200);}
 };
 function restoreStandPreview(){
  clearTimeout(loadTimer);clearTimeout(fallbackTimer);frameLoadedForId=null;
  if(lastSeen?.model)lastSeen.model.visible=true;
 }
 function reset(){restoreStandPreview();if(frame?.parentNode)frame.remove();root.hidden=true;root.style.visibility='hidden';card.hidden=false;pill.hidden=true;shown=false;lastSeen=null;activeId=null;}
 function hideNoReset(){restoreStandPreview();root.style.visibility='hidden';shown=false;}
 function projectStand(stand,camera,viewport){
  stand.group.updateWorldMatrix(true,false);
  aWorld.set(0,1.03,0);stand.group.localToWorld(aWorld);
  topWorld.set(0,6.25,0);stand.group.localToWorld(topWorld);
  sBottom.copy(aWorld).project(camera);sTop.copy(topWorld).project(camera);
  const sBottomX=sBottom.x;
  if(sBottom.z<=-1||sBottom.z>=1||sTop.z<=-1||sTop.z>=1||Math.abs(sBottomX)>0.86)return null;
  const centerX=(sBottomX+1)*.5*viewport.width+viewport.left;
  const bottomY=(1-sBottom.y)*.5*viewport.height+viewport.top;
  const topY=(1-sTop.y)*.5*viewport.height+viewport.top;
  const naturalHeight=Math.max(280,Math.min(450,Math.abs(bottomY-topY)*1.18));
  const w=Math.round(Math.max(390,Math.min(530,naturalHeight*1.38)));
  const h=Math.round(Math.max(280,Math.min(430,naturalHeight)));
  const x=Math.round(Math.max(viewport.left+14,Math.min(viewport.left+viewport.width-w-14,centerX-w/2)));
  const y=Math.round(Math.max(viewport.top+48,Math.min(viewport.top+viewport.height-h-54,bottomY-h-2)));
  return{x,y,w,h,centerX:Math.round(centerX),bottomY:Math.round(bottomY)};
 }
 function update({enabled=false,fallbackNonGLB=false,camera,player,canvas,modalOpen=false}={}){
  const anyOverlayOpen=modalOpen||Boolean(typeof document!=='undefined'&&((document.getElementById('r75-modal')&&!document.getElementById('r75-modal').hidden)||(document.getElementById('discovery-detail')&&!document.getElementById('discovery-detail').hidden)));
  if((!enabled&&!fallbackNonGLB)||anyOverlayOpen||!camera||!canvas||!player){if(shown||activeId)reset();return;}
  if(!getStands){reset();return;}
  // At 60 fps just update the transform; never create multiple Sketchfab viewers.
  const active=nearestPedestal(getStands(),player,{currentId:activeId,maxDistance:14.2});
  if(!active){if(shown||activeId)reset();return;}
  const viewport=canvas.getBoundingClientRect();
  const rect=projectStand(active,camera,viewport);
  if(!rect){hideNoReset();return;}
  const hasLocalGLB=Boolean(getLocalIds?.()?.has(active.id));
  const isOffline=typeof navigator!=='undefined'&&navigator.onLine===false;
  // r107_brasilia Sketchfab /embed returns HTTP 500 upstream; automatically fall back to its 3D model on the podium unless forced.
  const upstreamEmbedBroken=active.id==='r107_brasilia'&&!forceSketchfabIds.has(active.id);
  const nextUrl=!isOffline&&!upstreamEmbedBroken?makeSketchfabEmbedUrl(active.item?.uid,{autostart:true,transparent:false}):null;
  const showEmbed=Boolean(nextUrl)&&(forceSketchfabIds.has(active.id)||(!hasLocalGLB&&!hideSketchfabIds.has(active.id)));
  if(!showEmbed){
   if(lastSeen&&lastSeen.id!==active.id)restoreStandPreview();
   lastSeen=active;
   if(activeId){if(frame?.parentNode)frame.remove();activeId=null;}
   if(active.model)active.model.visible=true;
   root.hidden=false;root.style.visibility='visible';card.hidden=true;pill.hidden=false;shown=true;
   pill.textContent=`🌐 NHÚNG SKETCHFAB TRÊN BỤC: ${active.item.name}`;
   pill.style.left=Math.max(16,Math.min(viewport.width-280,rect.centerX-135))+'px';
   pill.style.top=Math.max(54,Math.min(viewport.height-58,rect.bottomY-36))+'px';
   return;
  }
  pill.hidden=true;card.hidden=false;root.hidden=false;root.style.visibility='visible';
  card.style.width=rect.w+'px';card.style.height=rect.h+'px';card.style.left=rect.x+'px';card.style.top=rect.y+'px';
  if(active.id!==activeId){
    restoreStandPreview();
    activeId=active.id;lastSeen=active;
    // Keep 3D model visible on podium until Sketchfab finishes loading so there is never an empty box blocking the podium.
    if(active.model)active.model.visible=true;
    card.style.opacity='0.01';
    card.style.pointerEvents='none';
    frame.style.opacity='1';
    title.textContent=active.item.name;
    accent.textContent=(active.item.group==='ancient'?'KỲ QUAN CỔ ĐẠI':active.item.group==='new2007'?'NEW7WONDERS 2007':'KIẾN TRÚC HÌNH HỌC')+' · SKETCHFAB';
    card.dataset.group=active.item.group;
    const targetId=active.id;
    mountFreshFrame(nextUrl,targetId);
    clearTimeout(fallbackTimer);
    fallbackTimer=setTimeout(()=>{
     if(activeId===targetId&&frameLoadedForId!==targetId){
      hideSketchfabIds.add(targetId);
      restoreStandPreview();
      activeId=null;
     }
    },12000);
  }
  if(active.model)active.model.visible=(frameLoadedForId!==active.id);
  shown=true;
 }
 return {update,reset,get activeId(){return activeId;},get visible(){return shown;}};
}
