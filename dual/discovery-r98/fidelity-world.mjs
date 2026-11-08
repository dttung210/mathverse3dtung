/** R98 add-on over R97 rooms. No fake monuments. Approved scans only. */
import * as THREE from '/vendor/three.module.js';
import {getR98Approved,refreshR98Catalog} from './catalog.mjs';
import {loadR98Scan,fitR98Scan} from './scan-loader.mjs';
const mat=color=>new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.09});
function plaque(text,sub='',w=7.7,h=1.7){
 const ratio=Math.max(2.2,Math.min(8.5,w/Math.max(0.5,h)));
 const sc=0.375;
 const H=Math.round(512*sc),W=Math.round(H*ratio);
 const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 g.scale(sc,sc);
 const LW=W/sc,LH=512;
 g.fillStyle='#0c2238';g.fillRect(0,0,LW,LH);g.lineWidth=16;g.strokeStyle='#d4b275';g.strokeRect(14,14,LW-28,LH-28);
 g.lineWidth=3;g.strokeStyle='#4cd7cb';g.strokeRect(30,30,LW-60,LH-60);
 g.textAlign='center';g.textBaseline='middle';
 let tSize=88;g.font=`bold ${tSize}px "Segoe UI", system-ui, Arial, sans-serif`;
 while(g.measureText(text).width>LW-120&&tSize>42){tSize-=2;g.font=`bold ${tSize}px "Segoe UI", system-ui, Arial, sans-serif`;}
 g.fillStyle='#fff6df';g.fillText(text,LW/2,LH*0.39);
 let sSize=52;g.font=`bold ${sSize}px "Segoe UI", system-ui, Arial, sans-serif`;
 while(g.measureText(sub).width>LW-120&&sSize>28){sSize-=2;g.font=`bold ${sSize}px "Segoe UI", system-ui, Arial, sans-serif`;}
 g.fillStyle='#bef8ef';g.fillText(sub,LW/2,LH*0.73);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.generateMipmaps=false;tex.minFilter=THREE.LinearFilter;tex.magFilter=THREE.LinearFilter;tex.anisotropy=4;
 return new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide});
}
const entries=[[-48,-17],[-34,-17],[-20,-17],[-48,-3],[-34,-3],[-20,-3]];
export function upgradeDiscoveryToFidelityR98(world){
 const room=world.interior.getObjectByName('DISCOVERY_GLOBE_ROOM_UNESCO_GALLERY');
 if(!room)throw Error('R98 must be applied after R97 UNESCO room');
 // Hide every R97 schematic and previous image panel: R98 never advertises them as scans.
 room.traverse(n=>{
  if(n.name?.startsWith('R97_UNESCO_') || n.name?.startsWith('DISCOVERY_UNESCO_EXHIBIT_')){
   n.visible=false;
   if(n.name?.startsWith('DISCOVERY_UNESCO_EXHIBIT_')&&n.parent)n.parent.visible=false;
  }
  if(n.geometry?.type==='PlaneGeometry'&&n.material?.map&&n.position?.y===1.5)n.visible=false;
  if(n.geometry?.type==='CylinderGeometry'&&Math.abs(n.position?.y-1.15)<.04&&Math.abs(n.position?.z+16)<.04&&[-46,-34,-22].some(x=>Math.abs(n.position.x-x)<.1))n.visible=false;
 });
 const approvedGroup=new THREE.Group();approvedGroup.name='R98_APPROVED_ARCHITECTURE_ONLY';room.add(approvedGroup);
 const noticeMat=plaque('PHÒNG UNESCO 3D — CHỜ MẪU QUÉT','Chỉ công bố GLB quang trắc/LiDAR đã đối chiếu ảnh, tác giả, giấy phép',23,5.5);
 noticeMat.side=THREE.FrontSide;
 const notice=new THREE.Mesh(new THREE.PlaneGeometry(23,5.5),noticeMat);
 const noticeBack=new THREE.Mesh(notice.geometry,noticeMat);noticeBack.rotation.y=Math.PI;noticeBack.position.z=-0.012;notice.add(noticeBack);
 notice.name='R98_EMPTY_GALLERY_NOTICE';notice.position.set(-34,8,-33.8);approvedGroup.add(notice);
 let hits=[],installed=[];const caster=new THREE.Raycaster();
 const r97Click=world.onClick.bind(world),r97Near=world.getNear.bind(world),r97SetGlobeFilter=world.setGlobeFilter.bind(world),r97SetOfficial=world.setWorldHeritageDots?.bind(world);
 world.setGlobeFilter=(ids)=>{
  const ok=new Set(getR98Approved().map(x=>x.id));const wanted=new Set(ids||ok);
  r97SetGlobeFilter(new Set([...ok].filter(id=>wanted.has(id))));
  for(const pin of world.mapCuratedPins||[]){const name=pin.name||'';pin.visible=ok.has(name.replace('R97_MAP_PIN_',''))&&wanted.has(name.replace('R97_MAP_PIN_',''));}
 };
 world.setWorldHeritageDots=()=>{r97SetOfficial?.([]);return 0;};
 world.setUNESCOPage=()=>0;
 world.onClick=(p,c)=>{
  if(world.currentRoom==='globe'&&hits.length){caster.setFromCamera(p,c);const h=caster.intersectObjects(hits,true)[0];if(h){let n=h.object;while(n&&!n.userData?.discoveryAction)n=n.parent;return n?.userData?.discoveryAction||null;}}
  const action=r97Click(p,c);
  if(action?.type==='landmark'&&!getR98Approved().some(a=>a.id===action.id))return null;
  return action;
 };
 world.getNear=p=>{
  if(world.currentRoom==='globe')for(const {id,x,z} of installed)if(Math.hypot(x-p.x,z-p.z)<4.6)return{type:'landmark',id};
  const action=r97Near(p);
  if(action?.type==='landmark'&&!getR98Approved().some(a=>a.id===action.id))return null;
  return action;
 };
 let refreshToken=0;
 async function apply(records=getR98Approved()){
  const token=++refreshToken;
  for(const obj of [...approvedGroup.children])if(obj!==notice){approvedGroup.remove(obj);obj.traverse(o=>{o.geometry?.dispose();if(o.material?.map)o.material.map.dispose();o.material?.dispose?.();});}
  hits=[];installed=[];notice.visible=records.length===0;
  for(let i=0;i<Math.min(entries.length,records.length);i++){
   const item=records[i];const [x,z]=entries[i];
   const stand=new THREE.Group();stand.position.set(x,0,z);approvedGroup.add(stand);
   const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(4.45,4.7,.92,40),mat(0x30485b));pedestal.position.y=.46;pedestal.userData.r103NativeId=item.id;stand.add(pedestal);
   const rim=new THREE.Mesh(new THREE.CylinderGeometry(4.55,4.55,.14,40),mat(0xd5ae70));rim.position.y=.98;rim.userData.r103NativeId=item.id;stand.add(rim);
   const signMat=plaque(item.name.slice(0,34),'GLB 3D THỰC TẾ · KÉO CHUỘT ĐỂ XOAY · NHẤN E ĐỌC CHI TIẾT',8.2,1.72);
   signMat.side=THREE.FrontSide;
   const sign=new THREE.Mesh(new THREE.PlaneGeometry(8.2,1.72),signMat);
   const signBack=new THREE.Mesh(sign.geometry,signMat);signBack.rotation.y=Math.PI;signBack.position.z=-0.012;sign.add(signBack);
   sign.position.set(0,1.42,4.85);sign.userData.discoveryAction={type:'landmark',id:item.id};stand.add(sign);hits.push(sign);
   const modelHolder=new THREE.Group();modelHolder.position.y=1.18;modelHolder.name=`R98_SCAN_HOLDER_${item.id}`;stand.add(modelHolder);
   installed.push({id:item.id,x,z});
   const img=new THREE.Mesh(new THREE.PlaneGeometry(7.6,4.25),new THREE.MeshBasicMaterial({color:0x35576a,side:THREE.FrontSide}));
   const imgBack=new THREE.Mesh(img.geometry,img.material);imgBack.rotation.y=Math.PI;imgBack.position.z=-0.012;img.add(imgBack);
   img.position.set(0,7.45,-3.85);img.userData.discoveryAction={type:'landmark',id:item.id};stand.add(img);hits.push(img);
   // Same-site image stored locally, never a generic Wikimedia lead image.
   new THREE.TextureLoader().load(item.photo.url,texture=>{if(token!==refreshToken){texture.dispose();return;}texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=16;const m=new THREE.MeshBasicMaterial({map:texture,side:THREE.FrontSide});img.material.dispose();img.material=m;imgBack.material=m;});
   loadR98Scan(item.glb.url).then(loaded=>{
    if(token!==refreshToken)return;
    fitR98Scan(modelHolder,loaded,11.2);
    loaded.traverse(n=>{if(n.isMesh){n.userData.discoveryAction={type:'landmark',id:item.id};n.userData.r103NativeId=item.id;hits.push(n);}});
    window.dispatchEvent(new CustomEvent('mathverse-r98-scan-mounted',{detail:{id:item.id,holder:modelHolder,stand}}));
   }).catch(error=>console.error('R98 GLB: unable to show vetted scan',item.id,error));
  }
  world.setGlobeFilter(new Set(records.map(x=>x.id)));
  world.r98ApprovedCount=records.length;
 }
 window.addEventListener('mathverse-r98-catalog-updated',e=>apply(e.detail.approved));
 world.refreshApprovedHeritage=()=>refreshR98Catalog();
 void refreshR98Catalog();
 return world;
}
