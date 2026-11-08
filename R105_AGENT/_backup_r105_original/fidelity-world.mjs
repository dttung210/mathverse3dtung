/** R98 add-on over R97 rooms. No fake monuments. Approved scans only. */
import * as THREE from '/vendor/three.module.js';
import {getR98Approved,refreshR98Catalog} from './catalog.mjs';
import {loadR98Scan,fitR98Scan} from './scan-loader.mjs';
const mat=color=>new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.09});
function plaque(text,sub=''){
 const c=document.createElement('canvas');c.width=1080;c.height=260;const g=c.getContext('2d');
 g.fillStyle='#10253b';g.fillRect(0,0,c.width,c.height);g.lineWidth=9;g.strokeStyle='#c6a66e';g.strokeRect(7,7,1066,246);
 g.textAlign='center';g.fillStyle='#efdcbb';g.font='bold 51px Arial';g.fillText(text,540,105,1015);
 g.fillStyle='#8fe8d8';g.font='27px Arial';g.fillText(sub,540,185,1020);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide});
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
 const notice=new THREE.Mesh(new THREE.PlaneGeometry(23,5.5),plaque('PHÒNG UNESCO 3D — CHỜ MẪU QUÉT','Chỉ công bố GLB quang trắc/LiDAR đã đối chiếu ảnh, tác giả, giấy phép'));
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
   const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(4.0,4.25,.9,32),mat(0x30485b));pedestal.position.y=.45;stand.add(pedestal);
   const rim=new THREE.Mesh(new THREE.CylinderGeometry(4.05,4.05,.12,32),mat(0xd5ae70));rim.position.y=.95;stand.add(rim);
   const sign=new THREE.Mesh(new THREE.PlaneGeometry(7.7,1.7),plaque(item.name.slice(0,34),'GLB 3D THỰC TẾ · ĐÃ DUYỆT NGUỒN'));
   sign.position.set(0,1.58,4.5);stand.add(sign);
   const modelHolder=new THREE.Group();modelHolder.position.y=1.15;stand.add(modelHolder);
   installed.push({id:item.id,x,z});
   const img=new THREE.Mesh(new THREE.PlaneGeometry(6,4),new THREE.MeshBasicMaterial({color:0x35576a,side:THREE.DoubleSide}));
   img.position.set(0,5.3,-4.4);img.userData.discoveryAction={type:'landmark',id:item.id};stand.add(img);hits.push(img);
   // Same-site image stored locally, never a generic Wikimedia lead image.
   new THREE.TextureLoader().load(item.photo.url,texture=>{if(token!==refreshToken){texture.dispose();return;}texture.colorSpace=THREE.SRGBColorSpace;img.material.dispose();img.material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});});
   loadR98Scan(item.glb.url).then(loaded=>{
    if(token!==refreshToken)return;
    fitR98Scan(modelHolder,loaded,9.5);
    loaded.traverse(n=>{if(n.isMesh){n.userData.discoveryAction={type:'landmark',id:item.id};hits.push(n);}});
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
