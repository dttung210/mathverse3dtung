/** R97: second geographic location (a flat world map), preserving globe + two R96 rooms. */
import * as THREE from '/mathverse3dtung/vendor/three.module.js?v=r107_v15';
import {UNESCO_HERITAGE} from '../discovery-unesco-data.mjs?v=r107_v15';
import {OFFLINE_COUNTRIES_PATH,lonLatToPixel,countryFeatures,geometryRings} from './geo-core.mjs?v=r107_v15';

const material=(color)=>new THREE.MeshStandardMaterial({color,metalness:.12,roughness:.62,side:THREE.DoubleSide});
function box(group,w,h,d,color,x,y,z,name){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));o.position.set(x,y,z);if(name)o.name=name;group.add(o);return o;}
function drawMapBackground(canvas,geo){
 const ctx=canvas.getContext('2d');const W=canvas.width,H=canvas.height;
 ctx.fillStyle='#10293d';ctx.fillRect(0,0,W,H);
 ctx.strokeStyle='rgba(90,183,189,.18)';ctx.lineWidth=1;
 for(let lat=-60;lat<=60;lat+=30){const y=(90-lat)/180*H;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
 for(let lon=-150;lon<=150;lon+=30){const x=(lon+180)/360*W;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
 for(const [idx,f] of countryFeatures(geo).entries()){
  ctx.beginPath();
  for(const ring of geometryRings(f)){
   if(!ring.length)continue;
   const s=lonLatToPixel(ring[0][0],ring[0][1],W,H);ctx.moveTo(s.x,s.y);
   let last=s.x;
   for(let i=1;i<ring.length;i++){
      const p=lonLatToPixel(ring[i][0],ring[i][1],W,H);
      if(Math.abs(p.x-last)>W*.9){ctx.moveTo(p.x,p.y);}else{ctx.lineTo(p.x,p.y);}last=p.x;
   }
   ctx.closePath();
  }
  ctx.fillStyle=idx%3===0?'#356274':idx%3===1?'#275063':'#2d596e';
  ctx.fill('evenodd');ctx.strokeStyle='#a2d5c5';ctx.lineWidth=.85;ctx.stroke();
 }
 ctx.fillStyle='#f1cf8f';ctx.textAlign='center';ctx.font='bold 31px Arial';ctx.fillText('BẢN ĐỒ THẾ GIỚI · VỊ TRÍ DI SẢN UNESCO',W/2,44);
 ctx.fillStyle='#d4e7e7';ctx.font='18px Arial';ctx.fillText('Natural Earth · WGS84 · bản đồ địa lý khái quát 1:110 triệu (ngoại tuyến)',W/2,H-15);
}
function mapCanvas(){const c=document.createElement('canvas');c.width=1440;c.height=720;drawMapBackground(c,{features:[]});return c;}
const mapPosition=(lng,lat)=>({x:lng/10, y:10+lat/10}); // wall width 36 m, height 18 m

export function upgradeDiscoveryToWorldMapR97(world){
 const {interior}=world;const foyer=interior.getObjectByName('DISCOVERY_FOYER');
 if(!foyer||!world.unescoGlobe)throw Error('R97 requires R96 UNESCO Discovery base');
 const room=new THREE.Group();room.name='DISCOVERY_R97_WORLD_MAP_ROOM';room.visible=false;
 box(room,48,.3,46,0xc3d0d1,0,-.18,-13,'R97_MAP_FLOOR');
 box(room,48,.42,46,0x12283e,0,22,-13,'R97_MAP_CEILING');
 box(room,.5,22,46,0xe5e8e3,-24,11,-13);box(room,.5,22,46,0xe5e8e3,24,11,-13);
 box(room,48,22,.4,0x18344a,0,11,-36);
 box(room,48,22,.4,0x18344a,0,11,10);
 const carpet=box(room,36,.06,30,0x225363,0,.02,-11);carpet.material.roughness=1;
 box(room,40,20,.5,0xd6ad6c,0,11.2,-35.7,'R97_MAP_BORDER');
 const back=box(room,38,18.9,.4,0x142d44,0,11.2,-35.35);
 const cvs=mapCanvas(); const texture=new THREE.CanvasTexture(cvs);texture.colorSpace=THREE.SRGBColorSpace;
 const planeMat=new THREE.MeshBasicMaterial({map:texture,side:THREE.FrontSide});
 const plane=new THREE.Mesh(new THREE.PlaneGeometry(36,18),planeMat);
 plane.name='R97_GEOGRAPHIC_PLANISPHERE';plane.position.set(0,10.5,-34.98);plane.userData.discoveryAction={type:'world-map-open'};room.add(plane);
 const planeBack=new THREE.Mesh(plane.geometry,planeMat);planeBack.position.set(0,10.5,-36.02);planeBack.rotation.y=Math.PI;planeBack.userData.discoveryAction={type:'world-map-open'};room.add(planeBack);
 for(const x of [-17.5,17.5])box(room,.4,18,.6,0xffcc8c,x,10.5,-34.8);
 const pinMeshes=[];
 for(const site of UNESCO_HERITAGE){
   const p=mapPosition(site.lng,site.lat);
   const pin=new THREE.Mesh(new THREE.SphereGeometry(.23,12,10),new THREE.MeshBasicMaterial({color:site.country==='Việt Nam'?0xfde39c:0x31e2c4}));
   pin.position.set(p.x,p.y,-34.62);pin.name=`R97_MAP_PIN_${site.id}`;
   pin.userData.discoveryAction={type:'landmark',id:site.id};room.add(pin);pinMeshes.push(pin);
 }
 const portalMapCanvas=mapCanvas(),mapPortalTex=new THREE.CanvasTexture(portalMapCanvas);mapPortalTex.colorSpace=THREE.SRGBColorSpace;
 const mapPortalMat=new THREE.MeshBasicMaterial({map:mapPortalTex,side:THREE.FrontSide});
 const mapPortal=new THREE.Mesh(new THREE.PlaneGeometry(13.2,6.6),mapPortalMat);
 mapPortal.name='DISCOVERY_R97_MAP_PORTAL';mapPortal.position.set(15.5,5.55,21.5);mapPortal.rotation.y=-0.28;
 mapPortal.userData.discoveryAction={type:'world-map-open'};foyer.add(mapPortal);
 const mapPortalBack=new THREE.Mesh(new THREE.PlaneGeometry(13.2,6.6),mapPortalMat);
 mapPortalBack.name='DISCOVERY_R97_MAP_PORTAL_BACK';mapPortalBack.position.set(15.66,5.55,21.02);mapPortalBack.rotation.y=-0.28+Math.PI;
 mapPortalBack.userData.discoveryAction={type:'world-map-open'};foyer.add(mapPortalBack);
 const portalStand=box(foyer,13.8,7.2,.38,0xd1ac73,15.58,5.55,21.25,'R97_WORLD_MAP_PODIUM');
 portalStand.rotation.y=-0.28;
 portalStand.userData.discoveryAction={type:'world-map-open'};
 const portalPillar=box(foyer,2.8,2.2,1.6,0x10293d,15.5,1.6,21.5,'R97_WORLD_MAP_PILLAR');
 portalPillar.rotation.y=-0.28;
 interior.add(room);
 const ray=new THREE.Raycaster(),rayed=[...pinMeshes,plane];
 let mapActive=false,officialInstanced=null,officialInstances=[];
 const originalCurrent=Object.getOwnPropertyDescriptor(world,'currentRoom').get.bind(world);
 const baseSetRoom=world.setRoom.bind(world),baseOnClick=world.onClick.bind(world);
 const baseGetNear=world.getNear.bind(world),baseRestrict=world.restrict.bind(world),baseTick=world.tick.bind(world);
 world.setRoom=function(id){
  if(id==='map'){
   baseSetRoom('foyer');mapActive=true;foyer.visible=false;room.visible=true;return{x:0,z:-4};
  }
  mapActive=false;room.visible=false;return baseSetRoom(id);
 };
 Object.defineProperty(world,'currentRoom',{configurable:true,enumerable:true,get(){return mapActive?'map':originalCurrent();}});
 world.getNear=function(p){
   if(mapActive){if(Math.abs(p.x)<9&&p.z>0.5)return{type:'go',room:'foyer'};
     if(p.z<0)return{type:'world-map-open'};
     return null;}
   if(originalCurrent()==='foyer'&&Math.hypot(p.x-15.5,p.z-21.5)<8.2)return{type:'world-map-open'};
   return baseGetNear(p);
 };
 world.restrict=function(prev,next){
   if(mapActive)return{x:THREE.MathUtils.clamp(next.x,-21,21),z:THREE.MathUtils.clamp(next.z,-31,1.5)};
   return baseRestrict(prev,next);
 };
 world.onClick=function(pointer,camera){
   if(mapActive){ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(rayed.filter(o=>o.visible),false)[0];
      return hit?.object?.userData.discoveryAction||null;}
   if(originalCurrent()==='foyer'){
     ray.setFromCamera(pointer,camera);
     const portalHit=ray.intersectObjects([mapPortal,portalStand],false)[0];
     if(portalHit)return {type:'go',room:'map'};
     const action=baseOnClick(pointer,camera);
     if(action?.type==='landmark'||action?.type==='go'||action?.type==='exit')return action;
     if(officialInstanced){
        const hit=ray.intersectObject(officialInstanced,false)[0];
        const earthHit=ray.intersectObject(world.unescoGlobe,false)[0];
        if(hit&&(!earthHit||hit.distance<=earthHit.distance+.18)&&hit.instanceId>=0){
          const site=officialInstances[hit.instanceId];return site?{type:'landmark',id:site.id}:null;
        }
     }
     return action;
   }
   return baseOnClick(pointer,camera);
 };
 world.tick=dt=>{if(!mapActive)baseTick(dt);};
 world.roomClickables.push(...pinMeshes,mapPortal,plane);
 // Add UNESCO's *verified* official cultural properties to the same rotating globe.
 world.setWorldHeritageDots=function(sites=[]){
   if(officialInstanced){officialInstanced.parent?.remove(officialInstanced);officialInstanced.geometry?.dispose();officialInstanced.material?.dispose();}
   const exclude=new Set(UNESCO_HERITAGE.map(x=>x.whcId));officialInstances=sites.filter(s=>!exclude.has(s.whcId));
   if(!officialInstances.length){officialInstanced=null;return 0;}
   const geo=new THREE.SphereGeometry(.08,6,4),mat=new THREE.MeshBasicMaterial({color:0x4be2d4});
   officialInstanced=new THREE.InstancedMesh(geo,mat,officialInstances.length);
   officialInstanced.name='DISCOVERY_R97_UNESCO_WORLD_POINTS';
   const dummy=new THREE.Object3D(),R=6.96;
   for(let i=0;i<officialInstances.length;i++){
     const it=officialInstances[i],phi=it.lat*Math.PI/180,lam=it.lng*Math.PI/180;
     dummy.position.set(R*Math.cos(phi)*Math.cos(lam),R*Math.sin(phi),R*Math.cos(phi)*Math.sin(lam));dummy.updateMatrix();
     officialInstanced.setMatrixAt(i,dummy.matrix);
   }
   officialInstanced.instanceMatrix.needsUpdate=true;
   world.unescoGlobe.parent.add(officialInstanced);
   return officialInstances.length;
 };
 fetch(OFFLINE_COUNTRIES_PATH).then(r=>{if(!r.ok)throw Error('Map unavailable');return r.json();}).then(geo=>{
  drawMapBackground(cvs,geo);drawMapBackground(portalMapCanvas,geo);texture.needsUpdate=true;mapPortalTex.needsUpdate=true;
 }).catch(err=>console.warn('R97 map offline borders',err.message));
 world.mapPlane=plane;world.mapRoom=room;world.mapCuratedPins=pinMeshes;
 return world;
}
