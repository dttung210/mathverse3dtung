/** R104 heritage room: never leave physical podiums empty.
 * True locally licensed GLB meshes have priority, following the R98 Parthenon technique.
 * When an original model has NOT been supplied, an explicitly identified educational 3D
 * architectural preview (not photogrammetry) is shown ON the physical podium.
 * A Sketchfab iframe is NOT a native Three.js mesh and never floats above the scene.
 */
import * as THREE from '/vendor/three.module.js';
import {GALLERY_ITEMS,GLOBE_MAP_ITEMS,GROUP_COLORS,ZONES} from './catalog.mjs';
import {scanLoader} from '../discovery-r98/scan-loader.mjs';
import {createTeachingModel,disposeTeachingModel} from './geometry-models.mjs';

const mat=(c,m=.09)=>new THREE.MeshStandardMaterial({color:c,roughness:.68,metalness:m,side:THREE.DoubleSide});
function cube(g,w,h,d,c,x,y,z){const n=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));n.position.set(x,y,z);g.add(n);return n;}
function disk(g,r,thick,c,y){const n=new THREE.Mesh(new THREE.CylinderGeometry(r,r,thick,40),mat(c));n.position.y=y;g.add(n);return n;}
function sign(text,sub,width=10,height=1.95,accent='#ddb77e'){
 const cv=document.createElement('canvas');cv.width=1200;cv.height=320;const c=cv.getContext('2d');
 c.fillStyle='#0b2436';c.fillRect(0,0,1200,320);c.lineWidth=12;c.strokeStyle=accent;c.strokeRect(10,10,1180,300);
 c.fillStyle='#fde5b1';c.font='bold 56px Arial';c.textAlign='center';c.fillText(text,600,131,1140);
 c.fillStyle='#83e6d6';c.font='28px Arial';c.fillText(sub,600,230,1130);
 const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));return mesh;
}
function assignAction(node,id){node.userData.discoveryAction={type:'world-wonder',id};return node;}
function photoCard(item,group){
 const w=5.7,h=3.15;
 const border=cube(group,w+.20,h+.20,.12,0xd9bf83,0,6.05,-3.05);
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:0x18384e,side:THREE.DoubleSide}));
 screen.position.set(0,6.05,-2.955);assignAction(screen,item.id);group.add(screen);
 const text=sign('ẢNH THỰC TẾ · ẢNH TƯ LIỆU',item.isReconstruction?'Công trình cổ không còn nguyên dạng':'LẠI GẦN ĐỂ XEM SKETCHFAB · NHẤN E ĐỌC TIỂU SỬ',5.30,2.85);
 text.position.set(0,6.04,-2.92);assignAction(text,item.id);group.add(text);
 // Exact-site lead image only; never show an unrelated image of a naked sculpture.
 const page=item.photoWiki||item.wiki||item.english;
 const title=encodeURIComponent(String(page).replaceAll('_',' '));
 const api=`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail&pithumbsize=800&titles=${title}`;
 const load=()=>item.photoUrl ? new Promise(resolve=>{
   const loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');
   loader.load(item.photoUrl,texture=>{if(screen.parent){texture.colorSpace=THREE.SRGBColorSpace;screen.material.dispose();screen.material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});text.visible=false;}else texture.dispose();resolve(true);},undefined,()=>resolve(false));
 }) : fetch(api).then(r=>r.ok?r.json():null).then(info=>{
   const data=Object.values(info?.query?.pages||{})[0];
   if(!data?.thumbnail?.source)return;
   const loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');
   loader.load(data.thumbnail.source,texture=>{
     if(!screen.parent){texture.dispose();return;}
     texture.colorSpace=THREE.SRGBColorSpace;screen.material.dispose();screen.material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});
     text.visible=false;
   },undefined,()=>{});
 }).catch(()=>{});
 return {screen,load};
}
function furniture(room){
 // Remove ONLY the old low-ceiling 44×44 shell. Keep door, floor scripts, all GLBs and curations.
 for(const child of room.children){
  if(child.isMesh && (
    ['DISCOVERY_ROOM_FLOOR','DISCOVERY_ROOM_CEILING','DISCOVERY_SIDE_WALL','DISCOVERY_BACK_WALL','DISCOVERY_FRONT_WALL','DISCOVERY_FLOOR_EDGE','DISCOVERY_WAINSCOT_N','DISCOVERY_WAINSCOT_W','DISCOVERY_WAINSCOT_E'].includes(child.name)
    || (child.geometry?.type==='PlaneGeometry'&&child.position.z<-33&&child.position.z>-35&&child.position.y>=5)
  ))child.visible=false;
 }
 // Expand the former 44m x 44m hall to 72m x 60m without touching adjacent rooms.
 const root=new THREE.Group();root.name='R102_LARGE_GALLERY_SHELL';room.add(root);
 const cx=-34,cz=-15,w=72,d=60,h=20;
 cube(root,w,.32,d,0xb6c9c5,cx,-.18,cz);
 cube(root,w,.35,d,0x12283b,cx,h-.18,cz);
 cube(root,.34,h,d,0xe4e6e0,cx-w/2,h/2,cz);
 cube(root,.34,h,d,0xe4e6e0,cx+w/2,h/2,cz);
 cube(root,w,h,.34,0xdde0da,cx,h/2,cz-d/2);
 // Front wall is split around the legacy entrance at x=-34, z=9 (visible and still functional).
 cube(root,30,20,.32,0xe0e3dd,-55,10,cz+d/2);
 cube(root,30,20,.32,0xe0e3dd,-13,10,cz+d/2);
 for(const [w2,x,z] of [[w,cx,cz-d/2+.23],[w,cx,cz+d/2-.23]])cube(root,w2,.12,.28,0xc2a66f,x,.16,z);
 // Perimeter gold trim and slim walk lighting.
 for(const x of [cx-w/2+.35,cx+w/2-.35])cube(root,.24,1.35,d-.7,0x112d40,x,.66,cz);
 for(const z of [cz-d/2+.25,cz+d/2-.25])cube(root,w-.6,1.35,.22,0x112d40,cx,.66,z);
 const hemi=new THREE.HemisphereLight(0xfff6dd,0x7b9bad,.65);hemi.position.set(cx,14,cz);root.add(hemi);
 for(const [x,z] of [[-60,-37],[-34,-40],[-8,-37],[-60,-10],[-8,-10]]){
   const light=new THREE.PointLight(0xffedc7,.68,20,2);light.position.set(x,14,z);root.add(light);
 }
 return root;
}

function layout(){
 const west=GALLERY_ITEMS.filter(x=>x.zone==='unesco');
 const south=GALLERY_ITEMS.filter(x=>x.zone==='new7');
 const east=GALLERY_ITEMS.filter(x=>x.zone==='other');
 const slots=[];
 west.forEach((item,i)=>slots.push({item,x:-64.2,z:-35+i*14,rot:Math.PI/2}));
 south.forEach((item,i)=>slots.push({item,x:-51+i*17,z:-38.5,rot:0}));
 east.forEach((item,i)=>slots.push({item,x:-3.7,z:-35+i*11,rot:-Math.PI/2}));
 return slots;
}
export function upgradeDiscoveryWondersR102(world){
 const room=world.interior.getObjectByName('DISCOVERY_GLOBE_ROOM_UNESCO_GALLERY');
 const foyer=world.interior.getObjectByName('DISCOVERY_FOYER');
 const mapRoom=world.interior.getObjectByName('DISCOVERY_R97_WORLD_MAP_ROOM');
 if(!room||!foyer||!mapRoom||!world.unescoGlobe)throw Error('R102 needs preserved R98 UNESCO and R97 world map');
 const shell=furniture(room);
 const exhibition=new THREE.Group();exhibition.name='R102_THREE_ZONES_REAL_3D_EXHIBITION';room.add(exhibition);
 const standItems=layout(),hits=[],stands=[],photos=[];
 for(const {item,x,z,rot} of standItems){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;g.name='R102_MODEL_ON_REAL_PEDESTAL_'+item.id;exhibition.add(g);
  const pedestal=disk(g,3.55,.72,0x152c42,.36);const top=disk(g,3.62,.20,0xc9a66d,.79);
  const ring=disk(g,2.72,.12,item.color||GROUP_COLORS[item.group],.91);assignAction(ring,item.id);hits.push(ring);
  const model=new THREE.Group();model.position.y=1.03;model.name=`R104_NATIVE_THREE_MODEL_${item.id}`;g.add(model);
  // The public Sketchfab viewer is an iframe, NOT an object that can be positioned inside Three.js.
  // Therefore preserve a real 3D shape on EVERY stand as a clearly labelled educational preview.
  // When a licensed GLB is imported, replace this preview with the actual full-resolution model.
  const preview=createTeachingModel(item.shape);
  const educationalBounds=new THREE.Box3().setFromObject(preview);
  const dimensions=educationalBounds.getSize(new THREE.Vector3());
  const previewScale=6.0/Math.max(dimensions.x,dimensions.y,dimensions.z);
  preview.scale.multiplyScalar(previewScale);
  preview.updateWorldMatrix(true,true);
  const accurateBounds=new THREE.Box3().setFromObject(preview);
  const modelCenter=accurateBounds.getCenter(new THREE.Vector3());
  preview.position.sub(modelCenter);
  preview.position.y+=accurateBounds.getSize(new THREE.Vector3()).y/2;
  model.add(preview);
  const empty=sign('HÌNH HỌC 3D · TRỰC TIẾP','CÓ GLB BẢN QUÉT CẤP PHÉP → THAY MÔ HÌNH MINH HỌA',6.65,1.28);
  empty.name=`R104_PREVIEW_STATUS_${item.id}`;empty.position.set(0,3.9,1.45);g.add(empty);
  // The caption is explicit: mathematical abstraction, not a digitized heritage scan.
  const plaque=sign(item.name,'XEM MÔ HÌNH SKETCHFAB TRÊN BỤC · NHẤN E ĐỂ XEM THÊM 2D/3D',7.15,1.32);
  plaque.position.set(0,1.29,3.96);assignAction(plaque,item.id);g.add(plaque);hits.push(plaque);
  const pic=photoCard(item,g);hits.push(pic.screen);photos.push(pic.load);
  stands.push({id:item.id,item,x,z,group:g,model,empty,preview});
 }
 // Native GLB rendering is available when the model is legitimately acquired by the school.
 // The manifest is empty by default. Embedding Sketchfab never authorizes redistributing its meshes.
 const locallyLoaded=new Set(),nativeMeshes=[],nativeMap=new Map(),previewMap=new Map();
 for(const stand of stands){
   previewMap.set(stand.id,stand.preview);
   stand.preview.traverse(n=>{if(n.isMesh){n.userData.r103NativeId=stand.id;n.userData.r104Preview=true;nativeMeshes.push(n);}});
 }

 async function installNativeGLB(id,url,source){
  const stand=stands.find(s=>s.id===id);if(!stand)throw Error('Không tìm thấy bục 3D: '+id);
  const loader=await scanLoader();const parsed=await loader.loadAsync(url);
  const scene=parsed.scene;let tris=0;
  scene.traverse(node=>{if(node.isMesh){const g=node.geometry;const count=g?.index?.count||g?.attributes?.position?.count||0;tris+=Math.floor(count/3);}});
  if(tris<2000)throw Error('Mô hình không đủ lưới 3D để trưng bày đáng tin cậy');
  const bounds=new THREE.Box3().setFromObject(scene),size=bounds.getSize(new THREE.Vector3());
  if(!Number.isFinite(size.length())||size.length()<1e-5)throw Error('GLB có kích thước không hợp lệ');
  const sc=Math.min(5.8/Math.max(size.x,size.y,size.z),100000);
  scene.scale.multiplyScalar(sc);scene.updateWorldMatrix(true,true);
  const bb=new THREE.Box3().setFromObject(scene),ctr=bb.getCenter(new THREE.Vector3());
  scene.position.sub(ctr);scene.position.y+=bb.getSize(new THREE.Vector3()).y/2;
  const old=nativeMap.get(id);
  if(old){
    stand.model.remove(old);
    old.traverse(n=>{if(n.isMesh){const i=nativeMeshes.indexOf(n);if(i>=0)nativeMeshes.splice(i,1);n.geometry?.dispose();const ms=Array.isArray(n.material)?n.material:[n.material];ms.forEach(m=>m?.dispose?.());}});
  }
  // Fully REMOVE educational preview only after the licensed GLB has loaded successfully.
  const preview=previewMap.get(id);
  if(preview){
    stand.model.remove(preview);
    preview.traverse(n=>{if(n.isMesh){const i=nativeMeshes.indexOf(n);if(i>=0)nativeMeshes.splice(i,1);}});
    disposeTeachingModel(preview);previewMap.delete(id);
  }
  stand.model.add(scene);stand.empty.visible=false;
  // The model's attribution belongs on its physical podium, not only in the download logs.
  if(stand.licenseBoard){stand.group.remove(stand.licenseBoard);stand.licenseBoard.material?.map?.dispose?.();stand.licenseBoard.material?.dispose?.();}
  const licenseBoard=sign('MÔ HÌNH GLB · NGUỒN CÓ GHI CÔNG',source||'GLB được giáo viên cung cấp',6.6,.96);
  licenseBoard.position.set(0,4.15,1.55);
  stand.group.add(licenseBoard);stand.licenseBoard=licenseBoard;
  world.r104PreviewIds?.delete(id);
  locallyLoaded.add(id);nativeMap.set(id,scene);
  // Teacher-owned GLB meshes are real scene objects. Interacting directly uses drag to rotate.
  scene.traverse(n=>{if(n.isMesh){n.userData.r103NativeId=id;nativeMeshes.push(n);}});
  stand.licensedAssetSource=source||'Giáo viên cung cấp GLB';
  return{ok:true,id,triangles:tris};
 }
 async function importUploadedGLB(id,file){
  if(!file||!/\.glb$/i.test(file.name))throw Error('Chỉ nhận file GLB');
  if(file.size>180*1024*1024)throw Error('GLB lớn hơn 180 MB, cần tối ưu trước khi tải');
  const url=URL.createObjectURL(file);
  try{return await installNativeGLB(id,url,'Tệp GLB do giáo viên cung cấp (trong phiên hiện tại)');}
  finally{URL.revokeObjectURL(url);}
 }
 async function installManifest(){
  try{
   const res=await fetch('/dual/discovery-r103/assets/approved-local-models.json');
   if(!res.ok)return;
   const manifest=await res.json();
   for(const rec of manifest.models||[]){
    if(!stands.some(s=>s.id===rec.id)||typeof rec.file!=='string'||!/^[a-z0-9_-]+\.glb$/i.test(rec.file)||!rec.author||!rec.license)continue;
    try{await installNativeGLB(rec.id,'/dual/discovery-r103/assets/'+rec.file,rec.author+' · '+rec.license);}catch(e){console.warn('R103: local GLB unavailable',rec.id,e.message);}
   }
  }catch(e){console.warn('R103: optional licensed assets manifest unavailable',e.message);}
 }
 void installManifest();
 const nativeRay=new THREE.Raycaster();
 world.pickNativeModel=(pointer,camera)=>{
  if(world.currentRoom!=='globe')return null;
  nativeRay.setFromCamera(pointer,camera);
  const hit=nativeRay.intersectObjects(nativeMeshes.filter(n=>n.parent),false)[0];
  return hit?.object?.userData?.r103NativeId||null;
 };
 world.rotateNativeModel=(id,dx,dy)=>{
  const model=nativeMap.get(id)||previewMap.get(id);if(!model)return false;
  model.rotation.y+=dx*0.009;
  model.rotation.x=THREE.MathUtils.clamp(model.rotation.x+dy*.004,-.48,.48);return true;
 };
 world.importLicensedGLB=importUploadedGLB;
 world.r103LocalGLBIds=locallyLoaded;
 world.r104PreviewIds=new Set(previewMap.keys());
 world.r104PodiumMode='native-three-model-first';
 world.r103NativeScene=nativeMap;
 const zones=[
  {title:ZONES.unesco,sub:'Giza, Ephesus & mẫu quét Parthenon R98',x:-68.9,z:-27,rot:Math.PI/2,col:'#f6aa7a',w:22},
  {title:ZONES.new7,sub:'Colosseum · Chichén Itzá · Taj Mahal',x:-34,z:-43.70,rot:0,col:'#ebc87f',w:29},
  {title:ZONES.other,sub:'Petronas · Louvre · Golden Gate · Gateway Arch',x:.90,z:-26,rot:-Math.PI/2,col:'#f17a84',w:29}
 ];
 for(const zone of zones){
  const board=sign(zone.title,zone.sub,zone.w,2.25,zone.col);board.position.set(zone.x,13.8,zone.z);board.rotation.y=zone.rot;exhibition.add(board);
 }
 // Keep the *actual* approved Parthenon scan. It is already mounted on its own large podium by R98.
 const approved=room.getObjectByName('R98_APPROVED_ARCHITECTURE_ONLY');
 function parkScan(){
  if(!approved)return;
  approved.position.set(-16,0,11); // R98 [-48,-17] becomes [-64,-6], the third place on the west wall.
  for(const child of approved.children){if(child.isGroup)child.rotation.y=Math.PI/2;}
 }
 parkScan();window.addEventListener('mathverse-r98-catalog-updated',parkScan);
 // New pin colors: ancient amber-orange, New7Wonders champagne, other bright red.
 const pivot=world.unescoGlobe.parent,globePins=[];
 for(const item of GLOBE_MAP_ITEMS){
  const a=item.lat*Math.PI/180,b=item.lng*Math.PI/180,r=7.015;
  const p=new THREE.Mesh(new THREE.SphereGeometry(item.group==='other' ? .34 : .29,12,9),new THREE.MeshBasicMaterial({color:GROUP_COLORS[item.group]}));
  p.position.set(r*Math.cos(a)*Math.cos(b),r*Math.sin(a),r*Math.cos(a)*Math.sin(b));p.name=`R102_GLOBE_PIN_${item.id}`;assignAction(p,item.id);pivot.add(p);globePins.push(p);
 }
 const mapPins=[];
 for(const item of GLOBE_MAP_ITEMS){
  const p=new THREE.Mesh(new THREE.SphereGeometry(item.group==='other' ? .28 : .23,12,9),new THREE.MeshBasicMaterial({color:GROUP_COLORS[item.group]}));
  p.position.set(item.lng/10,10+item.lat/10,-34.47);p.name=`R102_WORLD_MAP_PIN_${item.id}`;assignAction(p,item.id);mapRoom.add(p);mapPins.push(p);
 }
 const ray=new THREE.Raycaster(),oldClick=world.onClick.bind(world),oldNear=world.getNear.bind(world),oldRestrict=world.restrict.bind(world),oldSetRoom=world.setRoom.bind(world);
 let picturesRequested=false;
 world.setRoom=id=>{const spawn=oldSetRoom(id);if(id==='globe'&&!picturesRequested){picturesRequested=true;for(const load of photos)void load();}return spawn;};
 world.onClick=(pointer,camera)=>{
  ray.setFromCamera(pointer,camera);
  if(world.currentRoom==='globe'){
   const hit=ray.intersectObjects(hits,false)[0];if(hit)return hit.object.userData.discoveryAction;
  }
  if(world.currentRoom==='foyer'||world.currentRoom==='globe'){
   const h=ray.intersectObjects(globePins,false)[0],face=ray.intersectObject(world.unescoGlobe,false)[0];
   if(h&&(!face||h.distance<=face.distance+.10))return h.object.userData.discoveryAction;
  }
  if(world.currentRoom==='map'){
   const h=ray.intersectObjects(mapPins,false)[0];if(h)return h.object.userData.discoveryAction;
  }
  return oldClick(pointer,camera);
 };
 world.getNear=p=>{
  if(world.currentRoom==='globe'){
   if(Math.hypot(p.x+34,p.z-6)<5.5)return{type:'go',room:'foyer'};
   let near=null,best=5.1;
   for(const s of stands){const d=Math.hypot(s.x-p.x,s.z-p.z);if(d<best){near=s;best=d;}}
   if(near)return{type:'world-wonder',id:near.id};
   if(Math.hypot(p.x+64,p.z+6)<5.4)return{type:'landmark',id:'unesco_parthenon'};
   return null; // Do not trigger obsolete pre-expansion R98 stand positions.
  }
  return oldNear(p);
 };
 world.restrict=(prev,next)=>world.currentRoom==='globe'?
  {x:THREE.MathUtils.clamp(next.x,-67.9,-.1),z:THREE.MathUtils.clamp(next.z,-42.7,11.9)}:oldRestrict(prev,next);
 world.r102Pedestals=stands;world.r102AllPoints=GLOBE_MAP_ITEMS;world.r102GlobePins=globePins;world.r102MapPins=mapPins;
 return world;
}
