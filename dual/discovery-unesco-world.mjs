/** Discovery R96 additive 3D layout. Original Museum/Lab/Park untouched.
 * Front foyer = single Earth; left former Earth wing = UNESCO room;
 * right wing = existing art gallery. Original world module is retained.
 */
import * as THREE from '/mathverse3dtung/vendor/three.module.js?v=r107_v15';
import {UNESCO_HERITAGE} from './discovery-unesco-data.mjs?v=r107_v15';
import {R97_VERIFIED_IDS} from './discovery-r97/verified-heritage.mjs?v=r107_v15';
const UNESCO_VERIFIED_ROOM=UNESCO_HERITAGE.filter(x=>R97_VERIFIED_IDS.includes(x.id));
import {resolveDiscoveryPhoto} from './discovery-photo-r96.mjs?v=r107_v15';
import {createDiscoveryModel} from './discovery-shapes.mjs?v=r107_v15';

const makeMaterial=(color)=>new THREE.MeshStandardMaterial({color,metalness:0.2,roughness:0.58});
function drawSign(title,subtitle,w=14,h=3.2){
  const ratio=Math.max(2.4,Math.min(9.0,w/Math.max(0.5,h)));
  const H=384,W=Math.round(H*ratio);
  const c=document.createElement('canvas');c.width=W;c.height=H;
  const g=c.getContext('2d');
  g.fillStyle='#091b2d';g.fillRect(0,0,W,H);
  g.strokeStyle='#d9b471';g.lineWidth=12;g.strokeRect(10,10,W-20,H-20);
  g.strokeStyle='#2dcab8';g.lineWidth=2;g.strokeRect(22,22,W-44,H-44);
  g.textAlign='center';g.textBaseline='middle';
  g.fillStyle='#f6e6be';g.font='bold 64px "Segoe UI", system-ui, Arial, sans-serif';g.fillText(title,W/2,H*0.38,W-80);
  g.fillStyle='#8ef0e0';g.font='bold 38px "Segoe UI", system-ui, Arial, sans-serif';g.fillText(subtitle,W/2,H*0.73,W-80);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=16;return tex;
}
function changeSign(room,x,z,title,subtitle){
  const old=room.children.find(o=>o.isMesh&&o.geometry?.type==='PlaneGeometry'&&Math.abs(o.position.x-x)<1.1&&Math.abs(o.position.z-z)<1.2);
  if(!old)return false;
  if(old.material.map)old.material.map.dispose();
  const w=old.geometry?.parameters?.width||14,h=old.geometry?.parameters?.height||3.2;
  const newMap=drawSign(title,subtitle,w,h);
  old.material.map=newMap;old.material.needsUpdate=true;
  if(old.children?.[0]?.material){old.children[0].material.map=newMap;old.children[0].material.needsUpdate=true;}
  return true;
}
function createWallFrame(item,x,z,rot){
  const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=rot;
  const border=new THREE.Mesh(new THREE.BoxGeometry(8.4,6.8,0.55),makeMaterial(0xd9b471));
  border.position.set(0,4.5,0);group.add(border);
  const c=document.createElement('canvas');c.width=768;c.height=576;
  const ctx=c.getContext('2d');
  function placeholder(){
    ctx.fillStyle='#113748';ctx.fillRect(0,0,768,576);
    ctx.fillStyle='#e0bb7b';ctx.font='bold 28px Arial';ctx.textAlign='center';ctx.fillText(`UNESCO · ${item.year}`,384,62);
    ctx.fillStyle='#edf5f8';ctx.font='bold 44px Arial';ctx.fillText(item.name,384,285,720);
    ctx.fillStyle='#2dcab8';ctx.font='26px Arial';ctx.fillText('Nhấn E hoặc bấm để xem ảnh thật & 3D',384,455,720);
  }
  placeholder();
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(7.85,5.7),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));
  panel.position.z=0.32;panel.position.y=4.5;
  panel.name=`DISCOVERY_UNESCO_EXHIBIT_${item.id}`;
  panel.userData.discoveryAction={type:'landmark',id:item.id};
  group.add(panel);
  resolveDiscoveryPhoto(item).then(meta=>{
    if(!meta?.url||tex.userData?.stale)return;
    const img=new Image();img.crossOrigin='anonymous';
    img.onload=()=>{
      if(tex.userData?.stale)return;
      try{
        ctx.fillStyle='#091b2d';ctx.fillRect(0,0,768,576);
        const ratio=Math.max(768/img.width,420/img.height);
        const w=img.width*ratio,h=img.height*ratio;
        ctx.drawImage(img,(768-w)/2,0,w,h);
        ctx.fillStyle='rgba(9,27,45,.92)';ctx.fillRect(0,420,768,156);
        ctx.fillStyle='#f4d69e';ctx.font='bold 36px Arial';ctx.textAlign='center';
        ctx.fillText(item.name,384,469,740);
        ctx.fillStyle='#d2edf1';ctx.font='24px Arial';ctx.fillText(`${item.country} · UNESCO ${item.year} · Ảnh Commons`,384,515,728);
        tex.needsUpdate=true;
      }catch(e){console.info('Không thể tạo texture ảnh Commons',item.id,e.message);}
    };
    img.src=meta.url;
  });
  return {group,panel,item};
}

export function upgradeDiscoveryToUNESCO(world){
  const root=world.interior;
  const foyer=root.getObjectByName('DISCOVERY_FOYER');
  const oldGlobeRoom=root.getObjectByName('DISCOVERY_GLOBE_ROOM');
  if(!foyer||!oldGlobeRoom)throw Error('Missing preserved Discovery foyer or globe wing');
  const earth=oldGlobeRoom.getObjectByName('DISCOVERY_EARTH_GLOBE');
  if(!earth||!earth.parent)throw Error('Missing preserved Earth');
  const pivot=earth.parent;
  foyer.add(pivot);pivot.position.set(-15.5,5.55,21.5);pivot.scale.setScalar(0.64);
  const oldMarkers=[];
  pivot.traverse(o=>{if(o.name?.startsWith('DISCOVERY_GLOBE_MARKER_')){o.visible=false;oldMarkers.push(o);}});
  for(const m of oldMarkers)m.userData.discoveryAction=null;
  // Single globe: former oversized globe base is hidden, not duplicated.
  const oldStand=oldGlobeRoom.getObjectByName('DISCOVERY_GLOBE_STAND');
  if(oldStand)oldStand.visible=false;
  for(const child of oldGlobeRoom.children){
    if(child.isMesh&&child.geometry?.type==='CylinderGeometry'&&child.position.y<0.8)child.visible=false;
  }
  const podium=foyer.getObjectByName('DISCOVERY_WELCOME_PODIUM');
  if(podium){podium.scale.set(1.1,1,1.1);}
  for(const child of foyer.children){
    if(child.isMesh&&child.geometry?.type==='SphereGeometry'&&child.position.y>1.8&&child.position.y<2.4&&Math.abs(child.position.z-19)<0.5)child.visible=false;
  }
  changeSign(world.exterior,-80.6,8,'MATHVERSE DISCOVERY · UNESCO','SẢNH ĐỊA CẦU · PHÒNG UNESCO · PHÒNG TRANH');
  changeSign(foyer,0,6.2,'SẢNH ĐỊA CẦU DI SẢN','ĐỊA CẦU UNESCO · BẢN ĐỒ THẾ GIỚI · PHÒNG 3D · PHÒNG TRANH');
  changeSign(foyer,-7,8.4,'PHÒNG A · UNESCO','3 CẤU TRÚC HÌNH HỌC ĐỐI CHIẾU');
  changeSign(foyer,7,8.4,'PHÒNG B · TRANH','40 CHỦ ĐỀ HÌNH HỌC');
  changeSign(oldGlobeRoom,-34,-34.3,'PHÒNG A • UNESCO 3D KIỂM ĐỊNH','MÔ HÌNH CẤU TRÚC ĐỐI CHIẾU · KHÔNG SKETCHFAB');
  oldGlobeRoom.name='DISCOVERY_GLOBE_ROOM_UNESCO_GALLERY';

  // New single-globe pins only correspond to confirmed UNESCO World Heritage properties.
  const pins=new Map();
  for(const item of UNESCO_HERITAGE){
    const lat=item.lat*Math.PI/180,lng=item.lng*Math.PI/180;
    const r=6.92;
    const dot=new THREE.Mesh(new THREE.SphereGeometry(0.46,12,10),
      new THREE.MeshBasicMaterial({color:item.country==='Việt Nam'?0xf6d18a:0x2de7ce}));
    dot.position.set(r*Math.cos(lat)*Math.cos(lng),r*Math.sin(lat),r*Math.cos(lat)*Math.sin(lng));
    dot.name=`DISCOVERY_GLOBE_MARKER_${item.id}`;
    dot.userData.discoveryAction={type:'landmark',id:item.id};
    dot.userData.unescoPin=true;
    pivot.add(dot);pins.set(item.id,dot);
  }

  // Reuse 8 physical slots, not 18 simultaneous hi-poly GLBs.
  const coords=[
    [-49.4,-33.5,0],[-39.15,-33.5,0],[-28.85,-33.5,0],[-18.6,-33.5,0],
    [-55.35,-21,Math.PI/2],[-55.35,-8.5,Math.PI/2],
    [-12.65,-21,-Math.PI/2],[-12.65,-8.5,-Math.PI/2]
  ];
  const slots=[];const artHits=[];
  for(let i=0;i<8;i++){
    const entry=UNESCO_VERIFIED_ROOM[i];const [x,z,rot]=coords[i];
    if(!entry){slots.push({item:null,group:new THREE.Group(),panel:null});artHits.push(null);continue;}
    const slot=createWallFrame(entry,x,z,rot);oldGlobeRoom.add(slot.group);
    slots.push(slot);artHits.push(slot.panel);
  }
  // Actual 3D mathematical exhibits inside the UNESCO room (not only wall pictures).
  // These are reviewed structural diagrams, NOT photogrammetric heritage scans.
  const verifiedModelHits=[];
  const pedestalLocations=[[-46,-16],[-34,-16],[-22,-16]];
  for(const [i,item] of UNESCO_VERIFIED_ROOM.entries()){
    const [x,z]=pedestalLocations[i];
    const stand=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.9,1.05,32),makeMaterial(0x253f55));
    stand.name=`R97_UNESCO_PEDESTAL_${item.id}`;stand.position.set(x,.53,z);oldGlobeRoom.add(stand);
    const top=new THREE.Mesh(new THREE.CylinderGeometry(2.62,2.62,.16,32),makeMaterial(0xd3aa69));
    top.position.set(x,1.15,z);oldGlobeRoom.add(top);
    const geometry=createDiscoveryModel(item);
    geometry.name=`R97_UNESCO_VERIFIED_GEOMETRY_${item.id}`;
    geometry.scale.setScalar(.62);geometry.position.set(x,3.85,z);
    geometry.traverse(o=>{if(o.isMesh){o.userData.discoveryAction={type:'landmark',id:item.id};verifiedModelHits.push(o);}});
    oldGlobeRoom.add(geometry);
    const title=item.id==='unesco_giza'?'KHUFU · HÌNH CHÓP':item.id==='unesco_borobudur'?'BOROBUDUR · NỀN ĐỒNG TÂM':'PARTHENON · LƯỚI CỘT';
    const sign=new THREE.Mesh(new THREE.PlaneGeometry(5.7,1.3),new THREE.MeshBasicMaterial({map:drawSign(title,'HÌNH HỌC ĐỐI CHIẾU · KHÔNG PHẢI BẢN QUÉT'),side:THREE.DoubleSide}));
    sign.position.set(x,1.5,z+3.1);oldGlobeRoom.add(sign);
  }
  let page=0;
  function showUNESCOPage(index=0){
    page=0;
    slots.forEach((slot,i)=>{
      const entry=UNESCO_VERIFIED_ROOM[page*8+i];
      if((slot.item||null)===(entry||null))return;
      if(slot.panel?.material?.map){slot.panel.material.map.userData.stale=true;slot.panel.material.map.dispose();}
      oldGlobeRoom.remove(slot.group);
      slot.group.traverse(node=>{node.geometry?.dispose();node.material?.dispose();});
      if(!entry){slots[i]={item:null,group:new THREE.Group(),panel:null};artHits[i]=null;return;}
      const [x,z,rot]=coords[i];
      const next=createWallFrame(entry,x,z,rot);oldGlobeRoom.add(next.group);
      slots[i]=next;artHits[i]=next.panel;
    });
    return page;
  }
  // Existing caller's API unchanged; 'unesco' routes to former globe wing.
  const baseSetRoom=world.setRoom.bind(world);
  const baseOnClick=world.onClick.bind(world);
  const baseGetNear=world.getNear.bind(world);
  const baseRestrict=world.restrict.bind(world);
  const baseTick=world.tick.bind(world);
  const ray=new THREE.Raycaster();
  const inRoom=()=>world.currentRoom;
  const translate=(action)=>action?.type==='go'&&action.room==='globe'?{type:'go',room:'unesco'}:action;
  world.setRoom=(name)=>{
    const spawn=baseSetRoom(name==='unesco'?'globe':name);
    if(name==='unesco')showUNESCOPage(page);
    return spawn;
  };
  world.onClick=(pointer,camera)=>{
    if(inRoom()==='foyer'){
      ray.setFromCamera(pointer,camera);
      const hits=ray.intersectObjects([...pins.values()].filter(o=>o.visible),false);
      const face=ray.intersectObject(earth,false)[0];
      if(hits.length&&(!face||hits[0].distance<=face.distance+0.07))return hits[0].object.userData.discoveryAction;
      return translate(baseOnClick(pointer,camera));
    }
    if(inRoom()==='globe'){
      ray.setFromCamera(pointer,camera);
      const hit=ray.intersectObjects([...verifiedModelHits,...artHits.filter(o=>o && o.parent?.visible!==false)],false)[0];
      if(hit)return hit.object.userData.discoveryAction;
      const action=baseOnClick(pointer,camera);
      return action?.type==='go'?{type:'go',room:'foyer'}:null;
    }
    return baseOnClick(pointer,camera);
  };
  world.getNear=(pos)=>{
    if(inRoom()==='foyer'){
      const old=baseGetNear(pos);
      if(old)return translate(old);
      if(Math.hypot(pos.x+15.5,pos.z-21.5)<8.2)return {type:'globe-list'};
      return null;
    }
    if(inRoom()==='globe'){
      if(Math.hypot(pos.x+34,pos.z-6)<6.5)return {type:'go',room:'foyer'};
      let nearest=null,distance=6.3;
      for(const [i,verified] of UNESCO_VERIFIED_ROOM.entries()){
        const [x,z]=pedestalLocations[i];
        if(Math.hypot(pos.x-x,pos.z-z)<3.7)return{type:'landmark',id:verified.id};
      }
      for(const slot of slots){
        if(!slot.item)continue;
        const d=Math.hypot(pos.x-slot.group.position.x,pos.z-slot.group.position.z);
        if(d<distance){distance=d;nearest={type:'landmark',id:slot.item.id};}
      }
      return nearest;
    }
    return baseGetNear(pos);
  };
  world.restrict=(prev,next)=>{
    if(inRoom()==='globe')return {x:THREE.MathUtils.clamp(next.x,-53.7,-14.3),z:THREE.MathUtils.clamp(next.z,-32.5,7.0)};
    if(inRoom()==='foyer'){
      const p=baseRestrict(prev,next);
      if(Math.hypot(p.x+15.5,p.z-21.5)<5.2||Math.hypot(p.x-15.5,p.z-21.5)<5.2)return prev;
      return p;
    }
    return baseRestrict(prev,next);
  };
  world.isEarthHit=(pointer,camera)=>{
    if(inRoom()!=='foyer')return false;
    ray.setFromCamera(pointer,camera);
    return ray.intersectObject(earth,false).length>0;
  };
  world.setGlobeFilter=(ids)=>{
    const visible=ids instanceof Set?ids:new Set(ids||UNESCO_HERITAGE.map(x=>x.id));
    for(const dot of oldMarkers)dot.visible=false;
    for(const [id,pin] of pins)pin.visible=visible.has(id);
  };
  world.tick=(dt)=>{
    if(inRoom()==='foyer'&&world.interior.visible)pivot.rotation.y+=dt*0.045;
    else baseTick(0);
  };
  world.resetGlobeView=()=>{pivot.rotation.set(0,-Math.PI/2,0);};
  world.setUNESCOPage=showUNESCOPage;
  world.unescoPageCount=1;
  world.verifiedUNESCOModels=UNESCO_VERIFIED_ROOM;
  world.unescoPins=pins;
  world.unescoGlobe=earth;
  world.unescoEntries=UNESCO_HERITAGE;
  world.setGlobeFilter(new Set(UNESCO_HERITAGE.map(x=>x.id)));
  return world;
}
