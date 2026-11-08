/** R104/R106/R107 heritage room: never leave physical podiums empty.
 * True locally licensed GLB meshes have priority, following the R98 Parthenon technique.
 * When an original model has NOT been supplied, an explicitly identified educational 3D
 * architectural preview (not photogrammetry) is shown ON the physical podium.
 * A Sketchfab iframe is NOT a native Three.js mesh and never floats above the scene.
 */
import * as THREE from '/vendor/three.module.js';
import {GALLERY_ITEMS,FLOOR3_WONDERS,GLOBE_MAP_ITEMS,GROUP_COLORS,ZONES} from './catalog.mjs';
import {scanLoader} from '../discovery-r98/scan-loader.mjs';
import {createTeachingModel,disposeTeachingModel} from './geometry-models.mjs';

const mat=(c,m=.09)=>new THREE.MeshStandardMaterial({color:c,roughness:.68,metalness:m,side:THREE.DoubleSide});
function cube(g,w,h,d,c,x,y,z){const n=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));n.position.set(x,y,z);g.add(n);return n;}
function disk(g,r,thick,c,y){const n=new THREE.Mesh(new THREE.CylinderGeometry(r,r,thick,40),mat(c));n.position.y=y;g.add(n);return n;}
function sign(text,sub,width=10,height=1.95,accent='#ddb77e'){
 const ratio=Math.max(2.4,Math.min(6.5,width/Math.max(0.5,height)));
 const H=512,W=Math.round(H*ratio);
 const cv=document.createElement('canvas');cv.width=Math.round(W*0.375);cv.height=Math.round(H*0.375);const c=cv.getContext('2d');
 c.scale?.(0.375,0.375);
 c.fillStyle='#092033';c.fillRect(0,0,W,H);c.lineWidth=16;c.strokeStyle=accent;c.strokeRect(14,14,W-28,H-28);
 c.lineWidth=3;c.strokeStyle='#38c8be';c.strokeRect(30,30,W-60,H-60);
 c.textAlign='center';c.textBaseline='middle';
 let tSize=88;c.font=`bold ${tSize}px "Segoe UI", system-ui, Arial, sans-serif`;
 while(c.measureText(text).width>W-120&&tSize>42){tSize-=2;c.font=`bold ${tSize}px "Segoe UI", system-ui, Arial, sans-serif`;}
 c.fillStyle='#fff6df';c.fillText(text,W/2,H*0.38);
 let sSize=52;c.font=`bold ${sSize}px "Segoe UI", system-ui, Arial, sans-serif`;
 while(c.measureText(sub).width>W-120&&sSize>28){sSize-=2;c.font=`bold ${sSize}px "Segoe UI", system-ui, Arial, sans-serif`;}
 c.fillStyle='#bef8ef';c.fillText(sub,W/2,H*0.74);
 const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;
 const m=new THREE.MeshBasicMaterial({map:t,side:THREE.FrontSide});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),m);
 const back=new THREE.Mesh(mesh.geometry,m);
 back.rotation.y=Math.PI;back.position.z=-0.012;mesh.add(back);
 return mesh;
}
function assignAction(node,id){node.userData.discoveryAction={type:'world-wonder',id};if(node.children){for(const ch of node.children)ch.userData.discoveryAction={type:'world-wonder',id};}return node;}
function photoCard(item,group){
 const w=7.6,h=4.25;
 const border=cube(group,w+.24,h+.24,.14,0xd9bf83,0,7.45,-3.95);
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:0x18384e,side:THREE.FrontSide}));
 screen.position.set(0,7.45,-3.84);assignAction(screen,item.id);group.add(screen);
 const screenBack=new THREE.Mesh(screen.geometry,screen.material);
 screenBack.position.set(0,7.45,-4.06);screenBack.rotation.y=Math.PI;assignAction(screenBack,item.id);group.add(screenBack);
 const text=sign('ẢNH THỰC TẾ · ẢNH TƯ LIỆU',item.isReconstruction?'Công trình cổ không còn nguyên dạng':'KÉO CHUỘT XOAY 3D TRÊN BỤC · NHẤN E ĐỌC TIỂU SỬ',7.1,3.85);
 text.position.set(0,7.44,-3.80);assignAction(text,item.id);group.add(text);
 // Exact-site lead image only; never show an unrelated image of a naked sculpture.
 const localUrl=`/dual/discovery-r106/assets/photos/${item.id}.jpg`;
 const page=item.photoWiki||item.wiki||item.english;
 const title=encodeURIComponent(String(page).replaceAll('_',' '));
 const api=`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail&pithumbsize=800&titles=${title}`;
 const applyTex=texture=>{
  if(!screen.parent){texture.dispose();return;}
  texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;
  const mat=new THREE.MeshBasicMaterial({map:texture,side:THREE.FrontSide});
  screen.material.dispose();screen.material=mat;
  screenBack.material=mat;
  text.visible=false;
 };
 const loadRemote=()=>item.photoUrl ? new Promise(resolve=>{
   const loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');
   loader.load(item.photoUrl,texture=>{applyTex(texture);resolve(true);},undefined,()=>resolve(false));
 }) : fetch(api).then(r=>r.ok?r.json():null).then(info=>{
   const data=Object.values(info?.query?.pages||{})[0];
   if(!data?.thumbnail?.source)return;
   const loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');
   loader.load(data.thumbnail.source,applyTex,undefined,()=>{});
 }).catch(()=>{});
 const load=()=>new Promise(resolve=>{
   const loader=new THREE.TextureLoader();
   loader.load(localUrl,texture=>{applyTex(texture);resolve(true);},undefined,()=>{void loadRemote().then(resolve);});
 });
 return {screen,load};
}
function furniture(room,stairHits=[]){
 // Remove ONLY the old low-ceiling 44×44 shell. Keep door, floor scripts, all GLBs and curations.
 for(const child of room.children){
  if(child.isMesh && (
    ['DISCOVERY_ROOM_FLOOR','DISCOVERY_ROOM_CEILING','DISCOVERY_SIDE_WALL','DISCOVERY_BACK_WALL','DISCOVERY_FRONT_WALL','DISCOVERY_FLOOR_EDGE','DISCOVERY_WAINSCOT_N','DISCOVERY_WAINSCOT_W','DISCOVERY_WAINSCOT_E'].includes(child.name)
    || (child.geometry?.type==='PlaneGeometry'&&child.position.z<-33&&child.position.z>-35&&child.position.y>=5)
  ))child.visible=false;
 }
 // Expand the UNESCO 3D hall to a 3-Floor Grand Hall (112m x 98m x 36m, Floors at y = 0m, 11m, 22m) housing ALL 35 pedestals in 1 room.
 const root=new THREE.Group();root.name='R102_LARGE_GALLERY_SHELL';room.add(root);
 const cx=-46,cz=-31,w=112,d=98,h=36;
 cube(root,w,.36,d,0xb6c9c5,cx,-.18,cz);
 cube(root,w,.42,d,0x12283b,cx,h-.18,cz);
 cube(root,.42,h,d,0xe4e6e0,cx-w/2,h/2,cz);
 cube(root,.42,h,d,0xe4e6e0,cx+w/2,h/2,cz);
 cube(root,w,h,.42,0xdde0da,cx,h/2,cz-d/2);
 // Front wall is split around the legacy entrance at x=-34, z=9 (visible and still functional).
 cube(root,62,h,.38,0xe0e3dd,-71,h/2,cz+d/2);
 cube(root,38,h,.38,0xe0e3dd,-9,h/2,cz+d/2);
 for(const [w2,x,z] of [[w,cx,cz-d/2+.23],[w,cx,cz+d/2-.23]])cube(root,w2,.12,.28,0xc2a66f,x,.16,z);
 // Perimeter gold trim and slim walk lighting.
 for(const x of [cx-w/2+.35,cx+w/2-.35])cube(root,.24,1.35,d-.7,0x112d40,x,.66,cz);
 for(const z of [cz-d/2+.25,cz+d/2-.25])cube(root,w-.6,1.35,.22,0x112d40,cx,.66,z);

 // Build Floor 2 (y = 11.0m) and Floor 3 (y = 22.0m) full-coverage solid corridors & central reinforced sky-promenade decks
 // Leaving only the exact 5.4m-wide stairwell openings for Staircase 1 (x=-71.5 on Floor 2) and Staircase 2 (x=-20.5 on Floor 3)
 for(const fy of [11.0,22.0]){
  // West Exhibition Corridor (x from -101.6 to -74.3, full depth 96.8m)
  cube(root,27.3,.38,96.8,0xcbd8d5,-87.95,fy-.19,-31.0);
  // East Exhibition Corridor (x from -17.7 to +9.6, full depth 96.8m)
  cube(root,27.3,.38,96.8,0xcbd8d5,-4.05,fy-.19,-31.0);
  // North Exhibition Corridor & Landing Deck (x from -74.3 to -17.7, z from -79.5 to -25.5)
  cube(root,56.6,.38,54.0,0xcbd8d5,-46.0,fy-.19,-52.5);
  // South Connecting Corridor (x from -74.3 to -17.7, z from +2.5 to +17.5)
  cube(root,56.6,.38,15.0,0xcbd8d5,-46.0,fy-.19,10.0);
  // Central Promenade Deck between the two stairwells (x from -68.7 to -23.3, z from -25.5 to +2.5)
  cube(root,45.4,.38,28.0,0xc4d4d2,-46.0,fy-.19,-11.5);
  // Seal the inactive stairwell on each floor so only the active downward stairwell is open
  if(fy===11.0){
   // On Floor 2, Staircase 2 goes UP from y=11 to y=22, so Floor 2 has solid floor under Staircase 2 (x in [-23.3, -17.7])
   cube(root,5.6,.38,28.0,0xcbd8d5,-20.5,fy-.19,-11.5);
  }else{
   // On Floor 3, Staircase 1 ended at Floor 2, so Floor 3 has solid floor over Staircase 1 (x in [-74.3, -68.7])
   cube(root,5.6,.38,28.0,0xcbd8d5,-71.5,fy-.19,-11.5);
  }
  // Decorative gold-trimmed corridor runner carpets along West, North, East, South walkways
  cube(root,7.6,.04,88.0,0x152c42,-81.5,fy+.02,-31.0);
  cube(root,7.6,.04,88.0,0x152c42,-10.5,fy+.02,-31.0);
  cube(root,78.0,.04,7.6,0x152c42,-46.0,fy+.02,-58.5);
  cube(root,78.0,.04,6.4,0x152c42,-46.0,fy+.02,8.5);
 }

 // Walkable 3D Staircases with solid inclined ramp, 28 steps, and 1.25m high left/right & stairwell guardrails
 function buildStaircase(xPos,y0,y1,z0,z1,titleUp,floorUp,floorDown){
  const nSteps=28,dz=z1-z0,dy=y1-y0,len=Math.hypot(dz,dy),angle=Math.atan2(dy,-dz);
  // Continuous inclined structural ramp underneath steps so there are zero gaps
  const ramp=cube(root,5.0,.32,len+.6,0x102538,xPos,(y0+y1)/2-.12,(z0+z1)/2);
  ramp.rotation.x=angle;
  // Left & Right 1.25m-high inclined safety handrails along the entire staircase
  for(const side of [-2.48,2.48]){
   const railWall=cube(root,.18,1.15,len+.4,0x38bdf8,xPos+side,(y0+y1)/2+.62,(z0+z1)/2);
   railWall.rotation.x=angle;
   const railCap=cube(root,.26,.14,len+.5,0xc9a66d,xPos+side,(y0+y1)/2+1.22,(z0+z1)/2);
   railCap.rotation.x=angle;
  }
  // Upper-floor U-shaped stairwell safety guardrails (West, East, and South sides of stairwell opening)
  cube(root,.22,1.18,28.4,0x38bdf8,xPos-2.65,y1+.59,-11.5);
  cube(root,.30,.16,28.6,0xc9a66d,xPos-2.65,y1+1.20,-11.5);
  cube(root,.22,1.18,28.4,0x38bdf8,xPos+2.65,y1+.59,-11.5);
  cube(root,.30,.16,28.6,0xc9a66d,xPos+2.65,y1+1.20,-11.5);
  cube(root,5.5,1.18,.22,0x38bdf8,xPos,y1+.59,z0+.6);
  cube(root,5.6,.16,.30,0xc9a66d,xPos,y1+1.20,z0+.6);
  // Bottom and Top landing floor pads
  cube(root,5.4,.08,3.2,0xc9a66d,xPos,y0+.04,z0+1.4);
  cube(root,5.4,.08,3.2,0xc9a66d,xPos,y1+.04,z1-1.4);

  for(let s=0;s<nSteps;s++){
   const t=s/(nSteps-1),sy=y0+t*(y1-y0),sz=z0+t*(z1-z0);
   const st=cube(root,4.8,.28,1.18,s%2===0?0xc9a66d:0x152c42,xPos,sy+.14,sz);
   st.userData.discoveryAction={type:'unesco-floor',floor:floorUp};
   stairHits.push(st);
  }
  const sUp=sign(titleUp,'ĐI BỘ LÊN CẦU THANG HOẶC BẤM ĐỂ LÊN TẦNG',7.6,1.45,'#ebc87f');
  sUp.position.set(xPos,y0+3.3,z0+1.5);
  sUp.userData.discoveryAction={type:'unesco-floor',floor:floorUp};
  root.add(sUp);stairHits.push(sUp);
  const sDn=sign(`🔽 CẦU THANG XUỐNG TẦNG ${floorDown+1}`,'BẤM HOẶC ĐI BỘ XUỐNG TẦNG DƯỚI',7.0,1.32,'#38c8be');
  sDn.position.set(xPos,y1+2.8,z1-1.5);
  sDn.rotation.y=Math.PI;
  sDn.userData.discoveryAction={type:'unesco-floor',floor:floorDown};
  root.add(sDn);stairHits.push(sDn);
 }
 buildStaircase(-71.5,0,11.0,2.0,-26.0,'🔼 CẦU THANG LÊN TẦNG 2 · 10 CÔNG TRÌNH R107',1,0);
 buildStaircase(-20.5,11.0,22.0,2.0,-26.0,'🔼 CẦU THANG LÊN TẦNG 3 · 9 KỲ QUAN THẾ GIỚI',2,1);

 const hemi=new THREE.HemisphereLight(0xfff6dd,0x7b9bad,.85);hemi.position.set(cx,32,cz);root.add(hemi);
 for(const [x,z] of [[-88,-58],[-46,-65],[-4,-58],[-88,-25],[-4,-25],[-88,4],[-4,4]]){
   const light=new THREE.PointLight(0xffedc7,.82,42,2);light.position.set(x,31,z);root.add(light);
 }
 return root;
}

function layout(){
 // 3-Floor Grand Hall inside the spacious 112x98x36 room:
 // Floor 1 (y=0m, page 0): 15 R105/R106 stands + Parthenon R98 GLB (16 stands total)
 // Floor 2 (y=11m, page 1): 10 R107 stands
 // Floor 3 (y=22m, page 2): 9 Ancient & New Wonders (FLOOR3_WONDERS)
 const old=GALLERY_ITEMS.filter(x=>!x.id.startsWith('r107_'));
 const newer=GALLERY_ITEMS.filter(x=>x.id.startsWith('r107_'));
 const oldWest=old.filter(x=>x.zone==='unesco'),south=old.filter(x=>x.zone==='new7'),oldEast=old.filter(x=>x.zone==='other');
 const newWest=newer.filter(x=>x.zone==='unesco'),newEast=newer.filter(x=>x.zone==='other');
 const slots=[];
 oldWest.forEach((item,i)=>slots.push({item,page:0,floor:0,y:0,x:-89.5,z:-62+i*13.5,rot:Math.PI/2}));
 south.forEach((item,i)=>slots.push({item,page:'shared',floor:0,y:0,x:-69+i*23,z:-68.5,rot:0}));
 oldEast.forEach((item,i)=>slots.push({item,page:0,floor:0,y:0,x:-2.5,z:-64+i*11.8,rot:-Math.PI/2}));
 const westPositions=[-62,-48.5,-35,-21.5,-8,5.5];
 newWest.forEach((item,i)=>slots.push({item,page:1,floor:1,y:11.0,x:-89.5,z:westPositions[i],rot:Math.PI/2}));
 newEast.forEach((item,i)=>slots.push({item,page:1,floor:1,y:11.0,x:-2.5,z:-58+i*18.5,rot:-Math.PI/2}));
 if(newWest.length>westPositions.length||newEast.length>4)throw Error('R107 page 2 has more UNESCO/other structures than allocated positions');
 // Floor 3 (y = 22.0m): 9 Additional Wonders (3 West + 3 North + 3 East)
 const f3Coords=[
  {x:-89.5,z:-48,rot:Math.PI/2},{x:-89.5,z:-24,rot:Math.PI/2},{x:-89.5,z:0,rot:Math.PI/2},
  {x:-69,z:-68.5,rot:0},{x:-46,z:-68.5,rot:0},{x:-23,z:-68.5,rot:0},
  {x:-2.5,z:-48,rot:-Math.PI/2},{x:-2.5,z:-24,rot:-Math.PI/2},{x:-2.5,z:0,rot:-Math.PI/2}
 ];
 FLOOR3_WONDERS.forEach((item,i)=>{
  const c=f3Coords[i]||f3Coords[0];
  slots.push({item,page:2,floor:2,y:22.0,x:c.x,z:c.z,rot:c.rot});
 });
 return slots;
}
function visibleInHierarchy(obj){for(let node=obj;node;node=node.parent)if(!node.visible)return false;return true;}

export function upgradeDiscoveryWondersR102(world){
 const room=world.interior.getObjectByName('DISCOVERY_GLOBE_ROOM_UNESCO_GALLERY');
 const foyer=world.interior.getObjectByName('DISCOVERY_FOYER');
 const mapRoom=world.interior.getObjectByName('DISCOVERY_R97_WORLD_MAP_ROOM');
 if(!room||!foyer||!mapRoom||!world.unescoGlobe)throw Error('R102 needs preserved R98 UNESCO and R97 world map');
 const standItems=layout(),hits=[],stands=[],photos=[];
 const shell=furniture(room,hits);
 const exhibition=new THREE.Group();exhibition.name='R102_THREE_ZONES_REAL_3D_EXHIBITION';room.add(exhibition);
 let currentGalleryPage=0;
 for(const {item,x,y,z,rot,page,floor} of standItems){
  const g=new THREE.Group();g.position.set(x,y||0,z);g.rotation.y=rot;g.name='R102_MODEL_ON_REAL_PEDESTAL_'+item.id;g.visible=page==='shared'||page===currentGalleryPage;g.visible=true;exhibition.add(g);
  const pedestal=disk(g,4.45,.78,0x152c42,.39);const top=disk(g,4.55,.22,0xc9a66d,.86);
  const ring=disk(g,3.45,.13,item.color||GROUP_COLORS[item.group],.99);assignAction(ring,item.id);hits.push(ring);
  pedestal.userData.r103NativeId=item.id;top.userData.r103NativeId=item.id;ring.userData.r103NativeId=item.id;
  const model=new THREE.Group();model.position.y=1.12;model.name=`R104_NATIVE_THREE_MODEL_${item.id}`;g.add(model);
  // The public Sketchfab viewer is an iframe, NOT an object that can be positioned inside Three.js.
  // Therefore preserve a real 3D shape on EVERY stand as a clearly labelled educational preview.
  // When a licensed GLB is imported, replace this preview with the actual full-resolution model.
  const preview=createTeachingModel(item.shape);
  const educationalBounds=new THREE.Box3().setFromObject(preview);
  const dimensions=educationalBounds.getSize(new THREE.Vector3());
  const previewScale=8.5/Math.max(dimensions.x,dimensions.y,dimensions.z);
  preview.scale.multiplyScalar(previewScale);
  preview.updateWorldMatrix(true,true);
  const accurateBounds=new THREE.Box3().setFromObject(preview);
  const modelCenter=accurateBounds.getCenter(new THREE.Vector3());
  preview.position.sub(modelCenter);
  preview.position.y+=accurateBounds.getSize(new THREE.Vector3()).y/2;
  model.add(preview);
  const empty=sign('HÌNH HỌC MINH HỌA · 3D TRỰC TIẾP','MÔ HÌNH KIẾN TRÚC 3D TRÊN BỤC · NHẤN E ĐỂ XEM CHI TIẾT',7.4,1.35);
  empty.name=`R104_PREVIEW_STATUS_${item.id}`;empty.position.set(0,10.35,-3.80);g.add(empty);
  // The caption is explicit: mathematical abstraction, not a digitized heritage scan.
  const plaque=sign(item.name,'KÉO CHUỘT XOAY 3D TRÊN BỤC · NHẤN E ĐỂ XEM THÊM 2D/3D',8.2,1.72);
  plaque.position.set(0,1.32,4.85);assignAction(plaque,item.id);g.add(plaque);hits.push(plaque);
  const pic=photoCard(item,g);hits.push(pic.screen);photos.push({page,load:pic.load});
  stands.push({id:item.id,item,x,y:y||0,z,page,floor:floor||0,group:g,model,empty,preview,pedestal,top,ring});
 }
 // Native GLB rendering is available when the model is legitimately acquired by the school.
 const locallyLoaded=new Set(),nativeMeshes=[],nativeMap=new Map(),previewMap=new Map();
 for(const stand of stands){
   previewMap.set(stand.id,stand.preview);
   nativeMeshes.push(stand.pedestal,stand.top,stand.ring);
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
  const sc=Math.min(8.6/Math.max(size.x,size.y,size.z),100000);
  scene.scale.multiplyScalar(sc);
  const ctr=bounds.getCenter(new THREE.Vector3()).multiplyScalar(sc);
  scene.position.sub(ctr);scene.position.y+=(size.y*sc)/2;
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
  const licenseBoard=sign('MÔ HÌNH GLB · NGUỒN CÓ GHI CÔNG',source||'GLB được giáo viên cung cấp',7.4,1.35);
  licenseBoard.position.set(0,10.35,-3.80);
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
   await new Promise(r=>setTimeout(r,350));
   const res=await fetch('/dual/discovery-r103/assets/approved-local-models.json');
   if(!res.ok)return;
   const manifest=await res.json();
   for(const rec of manifest.models||[]){
    if(!stands.some(s=>s.id===rec.id)||typeof rec.file!=='string'||!/^[a-z0-9_-]+\.glb$/i.test(rec.file)||!rec.author||!rec.license)continue;
    while(world.r107UnescoFloor>0)await new Promise(r=>setTimeout(r,350));
    await new Promise(r=>setTimeout(r,120));
    try{await installNativeGLB(rec.id,'/dual/discovery-r103/assets/'+rec.file,rec.author+' · '+rec.license);}catch(e){console.warn('R103: local GLB unavailable',rec.id,e.message);}
   }
  }catch(e){console.warn('R103: optional licensed assets manifest unavailable',e.message);}
 }
 void installManifest();
 const nativeRay=new THREE.Raycaster();
 world.pickNativeModel=(pointer,camera)=>{
  if(world.currentRoom!=='globe')return null;
  nativeRay.setFromCamera(pointer,camera);
  const hit=nativeRay.intersectObjects(nativeMeshes.filter(n=>n.parent&&visibleInHierarchy(n)),false)[0];
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
  {title:ZONES.unesco,sub:'Tầng 1: 16 Bục R106 + GLB Parthenon · Tầng 2: 10 Bục R107 · Tầng 3: 9 Kỳ quan',x:-100.8,y:9.2,z:-28,rot:Math.PI/2,col:'#f6aa7a',w:28},
  {title:ZONES.new7,sub:'Đấu trường Colosseum · Chichén Itzá · Lăng Taj Mahal',x:-46,y:9.2,z:-78.8,rot:0,col:'#ebc87f',w:28},
  {title:ZONES.other,sub:'Kiến trúc hình học khác · Trưng bày toàn bộ 35 mô hình trên 3 tầng',x:8.8,y:9.2,z:-28,rot:-Math.PI/2,col:'#f17a84',w:28},
  {title:'TẦNG 2 · 10 CÔNG TRÌNH DI SẢN & KỸ THUẬT R107',sub:'Borobudur · Angkor Wat · Tháp Pisa · Khuê Văn Các · Tháp Rùa · Chùa Một Cột · Brasília · Lotus · Millau · Space Needle',x:-46,y:20.2,z:-78.8,rot:0,col:'#5eead4',w:34},
  {title:'TẦNG 3 · 9 KỲ QUAN CỔ ĐẠI & THẾ GIỚI MỚI',sub:'Babylon · Tượng Zeus · Lăng Halicarnassus · Colossus Rhodes · Hải đăng Alexandria · Vạn Lý Trường Thành · Petra · Machu Picchu · Chúa Cứu Thế',x:-46,y:31.2,z:-78.8,rot:0,col:'#fcd34d',w:36}
 ];
 for(const zone of zones){
  const board=sign(zone.title,zone.sub,zone.w,3.0,zone.col);board.position.set(zone.x,zone.y,zone.z);board.rotation.y=zone.rot;exhibition.add(board);
 }
 // Keep the *actual* approved Parthenon scan. It is already mounted on its own large podium by R98.
 const approved=room.getObjectByName('R98_APPROVED_ARCHITECTURE_ONLY');
 function parkScan(){
  if(!approved)return;
  approved.position.set(-41.5,0,22.5); // R98 [-48,-17] becomes [-89.5, +5.5], the 6th pedestal on the west wall.
  for(const child of approved.children){if(child.isGroup)child.rotation.y=Math.PI/2;}
  approved.traverse(n=>{
   if(n.name?.startsWith('R98_SCAN_HOLDER_')){
    const id=n.name.replace('R98_SCAN_HOLDER_','');
    nativeMap.set(id,n);
   }
   if(n.isMesh&&(n.userData?.r103NativeId||n.userData?.discoveryAction?.id==='unesco_parthenon')){
    n.userData.r103NativeId=n.userData.r103NativeId||'unesco_parthenon';
    if(!nativeMeshes.includes(n))nativeMeshes.push(n);
   }
  });
 }
 parkScan();
 window.addEventListener('mathverse-r98-catalog-updated',parkScan);
 window.addEventListener('mathverse-r98-scan-mounted',parkScan);
 // Hide obsolete R96 unescoPins on the Foyer Earth Globe so only the 34 R107 pins are active.
 if(world.unescoPins){
  for(const pin of world.unescoPins.values()){pin.visible=false;pin.userData.discoveryAction=null;}
 }
 // New pin colors: ancient amber-orange, New7Wonders champagne, other bright red.
 const pivot=world.unescoGlobe.parent,globePins=[];
 for(const item of GLOBE_MAP_ITEMS){
  const a=item.lat*Math.PI/180,b=item.lng*Math.PI/180,r=7.02;
  const p=new THREE.Mesh(new THREE.SphereGeometry(item.group==='other' ? .46 : .42,16,12),new THREE.MeshBasicMaterial({color:GROUP_COLORS[item.group]}));
  p.position.set(r*Math.cos(a)*Math.cos(b),r*Math.sin(a),r*Math.cos(a)*Math.sin(b));p.name=`R102_GLOBE_PIN_${item.id}`;assignAction(p,item.id);pivot.add(p);globePins.push(p);
 }
 const mapPins=[],foyerMapPins=[];
 const foyerMapPortal=foyer.getObjectByName('DISCOVERY_R97_MAP_PORTAL');
 for(const item of GLOBE_MAP_ITEMS){
  const p=new THREE.Mesh(new THREE.SphereGeometry(item.group==='other' ? .28 : .23,12,9),new THREE.MeshBasicMaterial({color:GROUP_COLORS[item.group]}));
  p.position.set(item.lng/10,10+item.lat/10,-34.47);p.name=`R102_WORLD_MAP_PIN_${item.id}`;assignAction(p,item.id);mapRoom.add(p);mapPins.push(p);
  if(foyerMapPortal){
   const fp=new THREE.Mesh(new THREE.SphereGeometry(item.group==='other' ? .17 : .15,12,10),new THREE.MeshBasicMaterial({color:GROUP_COLORS[item.group]}));
   fp.position.set((item.lng/180)*6.6,(item.lat/90)*3.3,0.16);
   fp.name=`R107_FOYER_MAP_PIN_${item.id}`;assignAction(fp,item.id);foyerMapPortal.add(fp);foyerMapPins.push(fp);
  }
 }
 const ray=new THREE.Raycaster(),tmpV=new THREE.Vector3(),oldClick=world.onClick.bind(world),oldNear=world.getNear.bind(world),oldRestrict=world.restrict.bind(world),oldSetRoom=world.setRoom.bind(world);
 const loadedPhotos=new Set();
 function ensurePhotosForPage(fl=0){
  for(const job of photos){
   if(loadedPhotos.has(job))continue;
   if(fl!==undefined&&job.page!=='shared'&&job.page!==fl)continue;
   loadedPhotos.add(job);void job.load();
  }
 }
 const switcher=document.createElement('div');switcher.id='r107-gallery-switch';switcher.className='r107-gallery-switch';switcher.hidden=true;
 const status=document.createElement('span');status.className='r107-gallery-status';
 const change=document.createElement('button');change.type='button';change.className='r107-gallery-next';
 const btnF1=document.createElement('button');btnF1.type='button';btnF1.className='r107-gallery-next';btnF1.textContent='Tầng 1 (16 bục)';
 const btnF2=document.createElement('button');btnF2.type='button';btnF2.className='r107-gallery-next';btnF2.textContent='🔼 Tầng 2 (10 bục R107)';
 const btnF3=document.createElement('button');btnF3.type='button';btnF3.className='r107-gallery-next';btnF3.textContent='🔼 Tầng 3 (9 Kỳ quan)';
 switcher.append(status,btnF1,btnF2,btnF3,change);document.body.appendChild(switcher);
 let currentUnescoFloor=0;
 function setGalleryPage(page){
  const fl=THREE.MathUtils.clamp(Number(page)||0,0,2);
  currentUnescoFloor=fl;
  currentGalleryPage=fl===1?1:0;
  for(const stand of stands){stand.group.visible=stand.page==='shared'||stand.page===currentGalleryPage;stand.group.visible=true;}
  status.textContent=`PHÒNG UNESCO 3 TẦNG (35 BỤC 3D) · ĐANG Ở TẦNG ${fl+1} (y=${fl*11}m)`;
  change.textContent=fl===0?'Lên Tầng 2 (R107) ▶':fl===1?'Lên Tầng 3 (Kỳ quan) ▶':'◀ Về Tầng 1';
  [btnF1,btnF2,btnF3].forEach((b,idx)=>{b.style.outline=idx===fl?'2px solid #5eead4':'none';});
  ensurePhotosForPage(fl);
  world.r107GalleryPage=currentGalleryPage;
  world.r107UnescoFloor=fl;
  return currentGalleryPage;
 }
 btnF1.onclick=()=>{setGalleryPage(0);window.__teleportDiscoveryFloor?.('unesco',0);};
 btnF2.onclick=()=>{setGalleryPage(1);window.__teleportDiscoveryFloor?.('unesco',1);};
 btnF3.onclick=()=>{setGalleryPage(2);window.__teleportDiscoveryFloor?.('unesco',2);};
 change.onclick=()=>{const next=(currentUnescoFloor+1)%3;setGalleryPage(next);window.__teleportDiscoveryFloor?.('unesco',next);};
 world.r107SetGalleryPage=setGalleryPage;world.r107GalleryPage=0;world.r107UnescoFloor=0;
 world.setUnescoFloor=(fl)=>{
  const f=THREE.MathUtils.clamp(Number(fl)||0,0,2);
  setGalleryPage(f);
  return {x:f===0?-80.5:-80.5,y:f*11.0,z:f===0?-48.5:f===1?-21.5:-24.0,yaw:-Math.PI/2};
 };
 setGalleryPage(0);
 world.setRoom=id=>{const spawn=oldSetRoom(id);switcher.hidden=id!=='globe'&&id!=='unesco';if(id==='globe'||id==='unesco'){setGalleryPage(0);}return spawn;};
 world.onClick=(pointer,camera)=>{
  ray.setFromCamera(pointer,camera);
  if(world.currentRoom==='globe'){
   const hit=ray.intersectObjects(hits.filter(visibleInHierarchy),true)[0];
   if(hit){let n=hit.object;while(n&&!n.userData?.discoveryAction)n=n.parent;if(n?.userData?.discoveryAction)return n.userData.discoveryAction;}
  }
  if(world.currentRoom==='foyer'||world.currentRoom==='globe'){
   if(world.currentRoom==='foyer'&&foyerMapPins.length){
    const mh=ray.intersectObjects(foyerMapPins.filter(p=>p.visible),false)[0];
    if(mh)return mh.object.userData.discoveryAction;
   }
   const visPins=globePins.filter(p=>p.visible);
   const h=ray.intersectObjects(visPins,false)[0],face=ray.intersectObject(world.unescoGlobe,false)[0];
   if(h&&(!face||h.distance<=face.distance+.55))return h.object.userData.discoveryAction;
   if(face&&visPins.length){
    let bestPin=null,bestDist=1.35;
    for(const pin of visPins){
     pin.getWorldPosition(tmpV);
     const d=tmpV.distanceTo(face.point);
     if(d<bestDist){bestDist=d;bestPin=pin;}
    }
    if(bestPin)return bestPin.userData.discoveryAction;
   }
  }
  if(world.currentRoom==='map'){
   const h=ray.intersectObjects(mapPins,false)[0];if(h)return h.object.userData.discoveryAction;
  }
  return oldClick(pointer,camera);
 };
 world.getNear=p=>{
  if(world.currentRoom==='globe'){
   const py=Number(p?.y)||0;
   if(py<3.5&&Math.hypot(p.x+34,p.z-6)<6.0)return{type:'go',room:'foyer'};
   let near=null,best=6.5;
   for(const s of stands){if(!s.group.visible)continue;if(Math.abs(py-(s.y||0))>5.5)continue;const d=Math.hypot(s.x-p.x,s.z-p.z);if(d<best){near=s;best=d;}}
   if(near)return{type:'world-wonder',id:near.id};
   if(py<5.5&&Math.hypot(p.x+89.5,p.z-5.5)<6.5)return{type:'landmark',id:'unesco_parthenon'};
   if(Math.hypot(p.x+71.5,p.z-2.0)<4.8&&py<5.5)return{type:'unesco-floor',floor:1};
   if(Math.hypot(p.x+71.5,p.z+26.0)<4.8&&Math.abs(py-11.0)<5.5)return{type:'unesco-floor',floor:0};
   if(Math.hypot(p.x+20.5,p.z-2.0)<4.8&&Math.abs(py-11.0)<5.5)return{type:'unesco-floor',floor:2};
   if(Math.hypot(p.x+20.5,p.z+26.0)<4.8&&Math.abs(py-22.0)<5.5)return{type:'unesco-floor',floor:1};
   return null;
  }
  return oldNear(p);
 };
 world.restrict=(prev,next)=>{
  if(world.currentRoom==='globe'){
   const prevY=Number(prev?.y)??(currentUnescoFloor*11.0);
   const prevX=Number(prev?.x)||0,prevZ=Number(prev?.z)||0;
   const p={
    x:THREE.MathUtils.clamp(next.x,-99.5,7.5),
    y:prevY,
    z:THREE.MathUtils.clamp(next.z,-77.5,15.5)
   };
   // State-based anti-fall Staircase 1 (xCenter = -71.5, z: 2.0 <-> -26.0, Floor 1 y=0 <-> Floor 2 y=11)
   const wasOnStair1=prevX>=-74.1&&prevX<=-68.9&&prevZ>=-26.2&&prevZ<=2.2&&prevY>0.04&&prevY<10.96;
   const enterStair1Bottom=prevY<=0.5&&p.x>=-73.7&&p.x<=-69.3&&p.z<=2.2&&p.z>=-1.5&&prevZ>=0.2;
   const enterStair1Top=Math.abs(prevY-11.0)<=0.6&&p.x>=-73.7&&p.x<=-69.3&&p.z>=-26.2&&p.z<=-22.5&&prevZ<=-24.2;
   // State-based anti-fall Staircase 2 (xCenter = -20.5, z: 2.0 <-> -26.0, Floor 2 y=11 <-> Floor 3 y=22)
   const wasOnStair2=prevX>=-23.1&&prevX<=-17.9&&prevZ>=-26.2&&prevZ<=2.2&&prevY>11.04&&prevY<21.96;
   const enterStair2Bottom=Math.abs(prevY-11.0)<=0.6&&p.x>=-22.7&&p.x<=-18.3&&p.z<=2.2&&p.z>=-1.5&&prevZ>=0.2;
   const enterStair2Top=Math.abs(prevY-22.0)<=0.6&&p.x>=-22.7&&p.x<=-18.3&&p.z>=-26.2&&p.z<=-22.5&&prevZ<=-24.2;

   if(wasOnStair1||enterStair1Bottom||enterStair1Top){
    // Lock X strictly inside Staircase 1 guardrails until exiting top/bottom landing
    if(p.z<=-26.0){
     p.y=11.0;if(currentUnescoFloor!==1)setGalleryPage(1);
    }else if(p.z>=2.0){
     p.y=0.0;if(currentUnescoFloor!==0)setGalleryPage(0);
    }else{
     p.x=THREE.MathUtils.clamp(p.x,-73.5,-69.5);
     const t=THREE.MathUtils.clamp((2.0-p.z)/28.0,0,1);
     p.y=t*11.0;
     const fl=p.y>5.5?1:0;
     if(fl!==currentUnescoFloor)setGalleryPage(fl);
    }
    return p;
   }
   if(wasOnStair2||enterStair2Bottom||enterStair2Top){
    // Lock X strictly inside Staircase 2 guardrails until exiting top/bottom landing
    if(p.z<=-26.0){
     p.y=22.0;if(currentUnescoFloor!==2)setGalleryPage(2);
    }else if(p.z>=2.0){
     p.y=11.0;if(currentUnescoFloor!==1)setGalleryPage(1);
    }else{
     p.x=THREE.MathUtils.clamp(p.x,-22.5,-18.5);
     const t=THREE.MathUtils.clamp((2.0-p.z)/28.0,0,1);
     p.y=11.0+t*11.0;
     const fl=p.y>16.5?2:1;
     if(fl!==currentUnescoFloor)setGalleryPage(fl);
    }
    return p;
   }

   // Lock player to current floor elevation
   p.y=currentUnescoFloor*11.0;

   // Prevent walking through stairwell side/back guardrails on upper floors
   if(currentUnescoFloor===1&&p.x>-74.4&&p.x<-68.6&&p.z>-25.4&&p.z<2.9){
    if(prevX<=-74.4)p.x=-74.4;
    else if(prevX>=-68.6)p.x=-68.6;
    else if(prevZ>=2.9)p.z=2.9;
    else p.z=-25.4;
   }
   if(currentUnescoFloor===2&&p.x>-23.4&&p.x<-17.6&&p.z>-25.4&&p.z<2.9){
    if(prevX<=-23.4)p.x=-23.4;
    else if(prevX>=-17.6)p.x=-17.6;
    else if(prevZ>=2.9)p.z=2.9;
    else p.z=-25.4;
   }
   return p;
  }
  return oldRestrict(prev,next);
 };
 world.r102Pedestals=stands;world.r102AllPoints=GLOBE_MAP_ITEMS;world.r102GlobePins=globePins;world.r102MapPins=mapPins;world.r107FoyerMapPins=foyerMapPins;
 return world;
}
