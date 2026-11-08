/** R100: physical pedestals for 14 documented architectural wonders inside the EXISTING UNESCO room.
 * Existing R98 approved photogrammetry GLB remains in the centre; Nature wing is not mounted.
 * Sketchfab iframes are opened on demand in one integrated modal. Three.js cannot show a live iframe as a mesh texture.
 */
import * as THREE from '/mathverse3dtung/vendor/three.module.js?v=r107_v15';
import {WORLD_WONDERS_14} from './wonders-data.mjs?v=r107_v15';
const material=(c,metalness=.12)=>new THREE.MeshStandardMaterial({color:c,roughness:.66,metalness,side:THREE.DoubleSide});
function block(p,w,h,d,c,x,y,z){const a=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(c));a.position.set(x,y,z);p.add(a);return a;}
function labelTexture(title,sub,opt={}){
 const c=document.createElement('canvas');c.width=1024;c.height=360;const g=c.getContext('2d');
 g.fillStyle='#071b2c';g.fillRect(0,0,1024,360);g.strokeStyle=opt.border||'#daba78';g.lineWidth=10;g.strokeRect(8,8,1008,344);
 g.textAlign='center';g.fillStyle='#f6dfad';g.font='bold 59px Arial';g.fillText(title,512,146,975);
 g.fillStyle='#8cece0';g.font='bold 34px Arial';g.fillText(sub,512,258,980);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function label(title,sub,w,h){const m=new THREE.MeshBasicMaterial({map:labelTexture(title,sub),side:THREE.FrontSide});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);const back=new THREE.Mesh(mesh.geometry,m);back.rotation.y=Math.PI;back.position.z=-0.012;mesh.add(back);return mesh;}
function thumbnailMaterial(item){
 const c=document.createElement('canvas');c.width=768;c.height=512;const g=c.getContext('2d');
 g.fillStyle='#0c3047';g.fillRect(0,0,768,512);g.strokeStyle='#d7b67a';g.lineWidth=9;g.strokeRect(8,8,752,496);
 g.textAlign='center';g.fillStyle='#e8f6ee';g.font='bold 37px Arial';g.fillText(item.name,384,220,710);
 g.fillStyle='#62decf';g.font='28px Arial';g.fillText('BẤM HOẶC NHẤN E ĐỂ XEM 3D',384,305,700);
 g.fillStyle='#d1c0a4';g.font='24px Arial';g.fillText('Sketchfab · '+(item.group==='ancient'?'CỔ ĐẠI':'NĂM 2007'),384,400,680);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 return new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide});
}
export function upgradeDiscoveryWondersR100(world){
 const room=world.interior.getObjectByName('DISCOVERY_GLOBE_ROOM_UNESCO_GALLERY');
 const foyer=world.interior.getObjectByName('DISCOVERY_FOYER');
 const mapRoom=world.interior.getObjectByName('DISCOVERY_R97_WORLD_MAP_ROOM');
 if(!room||!foyer||!mapRoom||!world.unescoGlobe)throw Error('R100 requires R97/R98 Discovery source');
 const exhibition=new THREE.Group();exhibition.name='DISCOVERY_R100_14_ARCHITECTURAL_WONDERS';room.add(exhibition);
 const hits=[],stands=[];
 const rowZ=[-29,-23.6,-18.2,-12.8,-7.4,-2,3.4];
 for(const item of WORLD_WONDERS_14){
   const ancient=item.group==='ancient',ix=ancient?item.order-1:item.order-8;
   const group=new THREE.Group();group.name=`R100_WONDER_PEDESTAL_${item.id}`;
   group.position.set(ancient?-50.4:-17.6,0,rowZ[ix]);
   group.rotation.y=ancient?Math.PI/2:-Math.PI/2;
   exhibition.add(group);
   const foot=new THREE.Mesh(new THREE.CylinderGeometry(1.88,1.99,.62,26),material(0x173147));foot.position.y=.31;group.add(foot);
   const cap=new THREE.Mesh(new THREE.CylinderGeometry(1.92,1.92,.16,26),material(0xd8b77e,.33));cap.position.y=.7;group.add(cap);
   const stem=block(group,.24,2.6,.24,0x213e51,0,2.06,0);
   const poster=new THREE.Mesh(new THREE.PlaneGeometry(4.28,2.85),thumbnailMaterial(item));
   poster.position.set(0,3.2,.29);poster.name=`R100_SKETCHFAB_POSTER_${item.id}`;
   poster.userData.discoveryAction={type:'world-wonder',id:item.id};group.add(poster);hits.push(poster);
   const plaque=label(item.name,item.isReconstruction?'PHỤC DỰNG GIẢ ĐỊNH':'THAM QUAN 3D · SKETCHFAB',4.65,1.05);
   plaque.position.set(0,1.05,1.6);plaque.rotation.x=-0.18;plaque.userData.discoveryAction={type:'world-wonder',id:item.id};group.add(plaque);hits.push(plaque);
   const pad=new THREE.Mesh(new THREE.CylinderGeometry(.89,.92,.1,18),material(ancient?0xdd835c:0x4fcfbc,.12));pad.position.set(0,.86,0);pad.userData.discoveryAction={type:'world-wonder',id:item.id};group.add(pad);hits.push(pad);
   stands.push({id:item.id,x:group.position.x,z:group.position.z,group,poster});
   // Best-effort live photo of the EXACT embedded model, not a fabricated architecture image.
   // The standalone viewer always works if Sketchfab allows embedding; no downloaded asset is implied.
   const oembed=`https://sketchfab.com/oembed?url=${encodeURIComponent(item.sketchfabUrl)}&maxwidth=900`;
   fetch(oembed).then(r=>{if(!r.ok)throw Error('oEmbed unavailable');return r.json();}).then(info=>{
     if(!info.thumbnail_url||!String(info.title||'').trim())return;
     const loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');loader.load(info.thumbnail_url,tex=>{
       tex.colorSpace=THREE.SRGBColorSpace;
       const old=poster.material;poster.material=new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide});old?.map?.dispose?.();old?.dispose?.();
     },undefined,()=>{});
   }).catch(()=>{});
 }
 // Restore original R98 vetted scan. Move the one vetted exhibit to the centre aisle, not into the 14 side booths.
 const approved=room.getObjectByName('R98_APPROVED_ARCHITECTURE_ONLY');
 function centerScan(){
   if(!approved)return;
   const count=Number(world.r98ApprovedCount||0);
   approved.position.set(count<=1?14:0,0,count<=1?-11:0);
   // For more than one approved GLB, later teacher curation can use separate display pages.
 }
 centerScan();window.addEventListener('mathverse-r98-catalog-updated',centerScan);
 const board=label('14 KỲ QUAN KIẾN TRÚC','7 CỔ ĐẠI · 7 MỚI (2007) · KHÔNG PHẢI BÌNH CHỌN UNESCO',21,3.1);
 board.position.set(-34,10,-33.55);exhibition.add(board);
 // 3D Globe pins added independently of the UNESCO-only R98 approval gate.
 const pivot=world.unescoGlobe.parent, globePins=[];
 for(const item of WORLD_WONDERS_14){
   const lat=item.lat*Math.PI/180,lng=item.lng*Math.PI/180, r=7.01;
   const pin=new THREE.Mesh(new THREE.SphereGeometry(.35,12,9),new THREE.MeshBasicMaterial({color:item.group==='ancient'?0xff9865:0xe5c17c}));
   pin.position.set(r*Math.cos(lat)*Math.cos(lng),r*Math.sin(lat),r*Math.cos(lat)*Math.sin(lng));
   pin.name=`R100_WONDER_GLOBE_${item.id}`;pin.userData.discoveryAction={type:'world-wonder',id:item.id};pivot.add(pin);globePins.push(pin);
 }
 const mapPins=[];
 for(const item of WORLD_WONDERS_14){
   const p=new THREE.Mesh(new THREE.SphereGeometry(.25,12,8),new THREE.MeshBasicMaterial({color:item.group==='ancient'?0xfa986f:0xe4c678}));
   p.position.set(item.lng/10,10+item.lat/10,-34.48);
   p.name=`R100_WONDER_MAP_${item.id}`;p.userData.discoveryAction={type:'world-wonder',id:item.id};mapRoom.add(p);mapPins.push(p);
 }
 const ray=new THREE.Raycaster();const oldClick=world.onClick.bind(world),oldNear=world.getNear.bind(world);
 world.onClick=(pointer,camera)=>{
   ray.setFromCamera(pointer,camera);
   if(world.currentRoom==='globe'){
     const hit=ray.intersectObjects(hits,false)[0];if(hit)return hit.object.userData.discoveryAction;
     const pinHit=ray.intersectObjects(globePins,false)[0];
     const globeHit=ray.intersectObject(world.unescoGlobe,false)[0];
     if(pinHit&&(!globeHit||pinHit.distance<=globeHit.distance+.12))return pinHit.object.userData.discoveryAction;
   }
   if(world.currentRoom==='foyer'){
     const hit=ray.intersectObjects(globePins,false)[0];const globeHit=ray.intersectObject(world.unescoGlobe,false)[0];
     if(hit&&(!globeHit||hit.distance<=globeHit.distance+.12))return hit.object.userData.discoveryAction;
   }
   if(world.currentRoom==='map'){
     const hit=ray.intersectObjects(mapPins,false)[0];if(hit)return hit.object.userData.discoveryAction;
   }
   return oldClick(pointer,camera);
 };
 world.getNear=pos=>{
   if(world.currentRoom==='globe'){
     let nearest=null,d=2.65;
     for(const row of stands){const ds=Math.hypot(pos.x-row.x,pos.z-row.z);if(ds<d){nearest=row;d=ds;}}
     if(nearest)return{type:'world-wonder',id:nearest.id};
   }
   return oldNear(pos);
 };
 world.r100Wonders=Object.freeze([...WORLD_WONDERS_14]);world.r100Pedestals=stands;world.r100GlobePins=globePins;world.r100MapPins=mapPins;
 return world;
}
