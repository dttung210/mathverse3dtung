/** New physical 3D wing. Original UNESCO Cultural gallery, map, globe and Art remain untouched. */
import * as THREE from '/mathverse3dtung/vendor/three.module.js?v=r107_v15';
import {TERRAIN_WONDERS} from './nature-data.mjs?v=r107_v15';
import {loadNatureTerrain,disposeNatureTerrain} from './terrain3d.mjs?v=r107_v15';
const solid=(color)=>new THREE.MeshStandardMaterial({color,metalness:.06,roughness:.77,side:THREE.DoubleSide});
function block(p,w,h,d,color,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),solid(color));m.position.set(x,y,z);p.add(m);return m;}
function board(text,sub='',w=960,h=220){const cvs=document.createElement('canvas');cvs.width=w;cvs.height=h;const c=cvs.getContext('2d');
 c.fillStyle='#0c2338';c.fillRect(0,0,w,h);c.strokeStyle='#dbba78';c.lineWidth=9;c.strokeRect(5,5,w-10,h-10);
 c.fillStyle='#ffe4b5';c.textAlign='center';c.font='bold 43px Arial';c.fillText(text,w/2,h*.41,w-38);
 c.fillStyle='#63e8dc';c.font='25px Arial';c.fillText(sub,w/2,h*.75,w-42);
 const tex=new THREE.CanvasTexture(cvs);tex.colorSpace=THREE.SRGBColorSpace;
 return new THREE.MeshBasicMaterial({map:tex,side:THREE.FrontSide});}
function panel(parent,text,sub,x,y,z,width=9,height=1.95){const m=board(text,sub);const obj=new THREE.Mesh(new THREE.PlaneGeometry(width,height),m);const back=new THREE.Mesh(obj.geometry,m);back.rotation.y=Math.PI;back.position.z=-0.012;obj.add(back);obj.position.set(x,y,z);parent.add(obj);return obj;}
const xPositions=[-27,-13.5,0,13.5,27],zPositions=[-12,-29];
export function upgradeDiscoveryNatureR99(world){
 const oldSetRoom=world.setRoom.bind(world),oldClick=world.onClick.bind(world),oldNear=world.getNear.bind(world),oldRestrict=world.restrict.bind(world),oldTick=world.tick.bind(world);
 const currentDescriptor=Object.getOwnPropertyDescriptor(world,'currentRoom');
 if(!currentDescriptor?.get)throw Error('R99 requires preserved Discovery R98 currentRoom getter');
 let active=false,starting=false;const room=new THREE.Group();room.name='DISCOVERY_R99_NATURE_3D_ROOM';room.visible=false;
 block(room,72,.4,58,0xb7c8c7,0,-.2,-13);block(room,72,.4,58,0x172d43,0,18,-13);
 block(room,72,18,.6,0x30475a,0,9,-42);block(room,.55,18,58,0xe3e6e0,-36,9,-13);block(room,.55,18,58,0xe3e6e0,36,9,-13);
 // Front wall is split with a door-sized opening to preserve the entry sightline.
 block(room,32,18,.6,0xd9dfdb,-20,9,15.8);block(room,32,18,.6,0xd9dfdb,20,9,15.8);
 panel(room,'KỲ QUAN THIÊN NHIÊN · 3D TỪ DEM','ẢNH VỆ TINH & CAO ĐỘ THẬT · KHÔNG PHẢI BẢN QUÉT CẬN CẢNH',0,11,-41.5,42,4);
 panel(room,'VỀ SẢNH DISCOVERY','NHẤN E TẠI CỔNG HOẶC CHỌN NÚT SẢNH',0,7.4,15.25,12.5,2.2);
 const hits=[],stands=[];
 for(let idx=0;idx<TERRAIN_WONDERS.length;idx++){
  const site=TERRAIN_WONDERS[idx],x=xPositions[idx%5],z=zPositions[Math.floor(idx/5)];
  const stand=new THREE.Group();stand.position.set(x,0,z);room.add(stand);
  block(stand,10.8,.55,10.8,0xa98552,0,.3,0);block(stand,10.95,.16,10.95,0xdec48d,0,.68,0);
  const model=new THREE.Group();model.position.set(0,.8,-.75);model.scale.setScalar(.72);stand.add(model);
  const label=panel(stand,site.name,`${site.country} · Nguồn DEM: Mapzen Terrarium · Đang chờ 3D`,0,1.55,5.7,11.4,1.9);
  const hint=panel(stand,'ĐANG CHỜ DỮ LIỆU DEM','Mô hình thật tải qua Internet lần đầu',0,4,-.2,8.5,2.3);
  const photoFrame=block(stand,5.8,3.9,.14,0x2a4558,0,4.85,-5.25);
  const photoPlane=new THREE.Mesh(new THREE.PlaneGeometry(5.5,3.6),new THREE.MeshBasicMaterial({color:0x1b3346,side:THREE.FrontSide}));
  photoPlane.position.set(0,4.85,-5.16);photoPlane.userData.discoveryAction={type:'nature-wonder',id:site.id};stand.add(photoPlane);hits.push(photoPlane);
  const photoPlaneBack=new THREE.Mesh(photoPlane.geometry,photoPlane.material);photoPlaneBack.position.set(0,4.85,-5.34);photoPlaneBack.rotation.y=Math.PI;photoPlaneBack.userData.discoveryAction={type:'nature-wonder',id:site.id};stand.add(photoPlaneBack);hits.push(photoPlaneBack);
  // Transparent hit target only for interaction. Does not pretend to be a 3D wonder.
  const hit=new THREE.Mesh(new THREE.BoxGeometry(11,7.4,11),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
  hit.position.set(0,3.8,0);hit.userData.discoveryAction={type:'nature-wonder',id:site.id};stand.add(hit);hits.push(hit);
  stands.push({site,x,z,stand,model,label,hint,photoFrame,photoPlane,photoPlaneBack,photoLoaded:false,loaded:null});
 }
 const foyer=world.interior.getObjectByName('DISCOVERY_FOYER');
 if(!foyer)throw Error('R99 needs original Discovery foyer');
 const portal=panel(foyer,'KỲ QUAN THIÊN NHIÊN 3D','10 CẢNH QUAN DEM · 4 LOẠI CẦN DỮ LIỆU RIÊNG',0,5.4,9.65,8.7,1.95);
 portal.userData.discoveryAction={type:'go',room:'nature'};
 world.interior.add(room);
 // Add only 10 terrain-capable geo pins, not the unverified four missing a physical 3D representation.
 const globePivot=world.unescoGlobe?.parent;const globePins=[];
 if(globePivot){for(const site of TERRAIN_WONDERS){const phi=site.lat*Math.PI/180,lambda=site.lng*Math.PI/180,r=7.02;
  const pin=new THREE.Mesh(new THREE.SphereGeometry(.29,12,10),new THREE.MeshBasicMaterial({color:0x4ade80}));
  pin.position.set(r*Math.cos(phi)*Math.cos(lambda),r*Math.sin(phi),r*Math.cos(phi)*Math.sin(lambda));
  pin.name=`R99_NATURE_PIN_${site.id}`;pin.userData.discoveryAction={type:'nature-wonder',id:site.id};globePivot.add(pin);globePins.push(pin);
 }}
 const mapPins=[];
 if(world.mapRoom){for(const site of TERRAIN_WONDERS){const pin=new THREE.Mesh(new THREE.SphereGeometry(.30,12,10),new THREE.MeshBasicMaterial({color:0x4ade80}));
  pin.position.set(site.lng/10,10+site.lat/10,-34.48);pin.name=`R99_MAP_NATURE_${site.id}`;pin.userData.discoveryAction={type:'nature-wonder',id:site.id};world.mapRoom.add(pin);mapPins.push(pin);
 }}
 const ray=new THREE.Raycaster(),texLoader=new THREE.TextureLoader();
 // Only do rendering/fetch for the visited room; throttle batches so public data endpoints are respected.
 async function fillRoom(){
  if(starting)return;starting=true;
  let cursor=0;
  async function worker(){
   while(active){
    const slot=stands[cursor++];if(!slot)break;
    if(!slot.photoLoaded){
     slot.photoLoaded=true;
     fetch(`/api/discovery/r99/photo?id=${encodeURIComponent(slot.site.id)}`).then(r=>r.ok?r.json():null).then(p=>{
      if(!p?.url)return;
      texLoader.load(p.url,tex=>{tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.MeshBasicMaterial({map:tex,side:THREE.FrontSide});slot.photoPlane.material.dispose();slot.photoPlane.material=m;if(slot.photoPlaneBack)slot.photoPlaneBack.material=m;});
     }).catch(()=>{});
    }
    if(slot.loaded)continue;
    try{
     const data=await loadNatureTerrain(slot.site,{detail:false});
     slot.loaded=data;slot.model.add(data.group);slot.hint.visible=false;
     slot.label.material.map?.dispose();slot.label.material.dispose();
     const statusTxt=`${slot.site.country} · DEM Mapzen${data.stats.imagery?' + Sentinel-2':''} (${Math.round(data.stats.minElevationMeters)}..${Math.round(data.stats.maxElevationMeters)}m) · 3D Đã nạp`;
     const lblMat=board(slot.site.name,statusTxt);
     slot.label.material=lblMat;if(slot.label.children[0])slot.label.children[0].material=lblMat;
    }catch(e){
     slot.hint.material.map?.dispose();slot.hint.material.dispose();
     const hMat=board('CHƯA CÓ DỮ LIỆU 3D',String(e.message).slice(0,75));
     slot.hint.material=hMat;if(slot.hint.children[0])slot.hint.children[0].material=hMat;
    }
   }
  }
  // Only two previews concurrently; reduce load on public DEM / imagery tile hosts.
  try{await Promise.all([worker(),worker()]);}finally{starting=false;}
 }

 world.setRoom=function(id){
  if(id==='nature'){
   oldSetRoom('foyer');active=true;foyer.visible=false;room.visible=true;
   // Triggers only on first visit; caches assets locally for later offline use.
   void fillRoom();return{x:0,z:5.5};
  }
  active=false;room.visible=false;return oldSetRoom(id);
 };
 Object.defineProperty(world,'currentRoom',{configurable:true,enumerable:true,get(){return active?'nature':currentDescriptor.get.call(world);}});
 world.onClick=(pointer,camera)=>{
  ray.setFromCamera(pointer,camera);
  if(active){const h=ray.intersectObjects(hits,false)[0];if(h)return h.object.userData.discoveryAction;
   if(ray.intersectObject(portal,false).length)return{type:'go',room:'foyer'};return null;}
  if(world.currentRoom==='foyer'){
   const first=ray.intersectObjects(globePins,false)[0],earth=world.unescoGlobe&&ray.intersectObject(world.unescoGlobe,false)[0];
   if(first&&(!earth||first.distance<=earth.distance+.2))return first.object.userData.discoveryAction;
   if(ray.intersectObject(portal,false).length)return{type:'go',room:'nature'};
  }
  if(world.currentRoom==='map'){const first=ray.intersectObjects(mapPins,false)[0];if(first)return first.object.userData.discoveryAction;}
  return oldClick(pointer,camera);
 };
 world.getNear=pos=>{
  if(active){if(pos.z>9.2&&Math.abs(pos.x)<5)return{type:'go',room:'foyer'};
   const nearest=stands.find(s=>Math.hypot(s.x-pos.x,s.z-pos.z)<5.7);
   return nearest?{type:'nature-wonder',id:nearest.site.id}:null;}
  if(world.currentRoom==='foyer'&&pos.z>9&&pos.z<14&&Math.abs(pos.x)<3)return{type:'go',room:'nature'};
  return oldNear(pos);
 };
 world.restrict=(prev,next)=>active?{x:THREE.MathUtils.clamp(next.x,-34,34),z:THREE.MathUtils.clamp(next.z,-39,13)}:oldRestrict(prev,next);
 world.tick=(dt)=>{if(!active)oldTick(dt);};
 world.natureRoom=room;world.natureStands=stands;world.naturePins=globePins;world.natureMapPins=mapPins;
 return world;
}
