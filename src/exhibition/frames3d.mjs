import {mountHallwayBoards} from './wall2d.mjs?v=r107_v15';
import {PEOPLE} from './people.mjs?v=r107_v15';
import {getPortrait} from './storage.mjs?v=r107_v15';
import {proposedGalleryLayout, WALL_GROUPS, DEFAULT_CONFIG} from './layout.mjs?v=r107_v15';

const BASE='/src/exhibition/';
const WALL='#d5b984';
const GOLD=0xc1a467;

export {proposedGalleryLayout, WALL_GROUPS, DEFAULT_CONFIG};

function imageLabelTexture(THREE, entry, kind){
  const c=document.createElement('canvas');
  c.width=kind==='portrait'?512:1024;c.height=kind==='portrait'?660:200;
  const ctx=c.getContext('2d');
  ctx.fillStyle=kind==='portrait'?'#182e42':'#091a2b';ctx.fillRect(0,0,c.width,c.height);
  if(kind==='portrait'){
    const g=ctx.createLinearGradient(0,0,c.width,c.height);g.addColorStop(0,entry.accent);g.addColorStop(1,'#092438');
    ctx.fillStyle=g;ctx.globalAlpha=.38;ctx.fillRect(0,0,c.width,c.height);ctx.globalAlpha=1;
    // Deliberate geometric placeholder — never an invented portrait.
    ctx.strokeStyle='#e4f3ff';ctx.globalAlpha=.5;ctx.lineWidth=6;
    ctx.beginPath();ctx.arc(256,235,95,0,Math.PI*2);ctx.moveTo(85,535);ctx.quadraticCurveTo(256,320,427,535);ctx.stroke();ctx.globalAlpha=1;
    ctx.textAlign='center';ctx.font='700 26px sans-serif';ctx.fillStyle='#d7e9f9';ctx.fillText('CHƯA TẢI ẢNH',256,595);
  }else{
    ctx.textAlign='center';ctx.textBaseline='middle';
    const titleStr=(entry.displayName||entry.vietnamese||'').toUpperCase();
    let f1=64;ctx.font=`bold ${f1}px "Segoe UI", Arial, sans-serif`;
    while(ctx.measureText(titleStr).width>c.width-64&&f1>26){f1-=2;ctx.font=`bold ${f1}px "Segoe UI", Arial, sans-serif`;}
    ctx.fillStyle='#f2deb2';ctx.fillText(titleStr,512,68);
    const subStr=entry.displaySubtitle||entry.name||'';
    let f2=42;ctx.font=`600 ${f2}px "Segoe UI", Arial, sans-serif`;
    while(ctx.measureText(subStr).width>c.width-64&&f2>22){f2-=2;ctx.font=`600 ${f2}px "Segoe UI", Arial, sans-serif`;}
    ctx.fillStyle='#b7dfea';ctx.fillText(subStr,512,144);
  }
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t;
}
function smallSign(THREE,text,w=4.4,h=.57){
  const c=document.createElement('canvas');c.width=1024;c.height=160;
  const x=c.getContext('2d');x.fillStyle='#162637';x.fillRect(0,0,1024,160);
  x.strokeStyle='#c1a467';x.lineWidth=4;x.strokeRect(6,6,1012,148);
  x.textAlign='center';x.textBaseline='middle';
  const fullText=String(text||'');
  let fs=40;x.font=`bold ${fs}px "Segoe UI", Arial, sans-serif`;
  while(x.measureText(fullText).width>960&&fs>20){fs-=2;x.font=`bold ${fs}px "Segoe UI", Arial, sans-serif`;}
  x.fillStyle='#e2f4f8';x.fillText(fullText,512,80);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  const sMat=new THREE.MeshBasicMaterial({map:t,side:THREE.FrontSide,transparent:false});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),sMat);
  const back=new THREE.Mesh(mesh.geometry,sMat);back.rotation.y=Math.PI;back.position.z=-0.012;mesh.add(back);
  return mesh;
}

export function mountMathematicianFrames(THREE, room, {centerX=54,backZ=-48,width=34,depth=40,building=null,rooms=null}={}){
  const group=new THREE.Group();group.name=`MATHVERSE EXHIBITION · ${PEOPLE.length} HISTORICAL PORTRAITS`;
  room.add(group);
  const frameTargets=[],pictures=new Map();
  const wallGallery=building&&rooms?mountHallwayBoards(THREE,building,rooms):null;
  if(wallGallery)frameTargets.push(...wallGallery.targets);
  const workshopSigns=[];
  const borderMat=new THREE.MeshStandardMaterial({color:GOLD,metalness:.65,roughness:.3});
  const bgMat=new THREE.MeshStandardMaterial({color:0x0c1c2d,metalness:.08,roughness:.83});
  const accentMat=new THREE.MeshStandardMaterial({color:0xcadfea,metalness:.35,roughness:.4});
  const slots=proposedGalleryLayout({centerX,backZ,roomWidth:width,roomDepth:depth});
  function replacePicture(pic,img){
    if(!pic?.material||!img)return;
    const c=document.createElement('canvas');c.width=512;c.height=640;
    const ctx=c.getContext('2d');
    ctx.drawImage(img,0,0,512,640);
    const texture=new THREE.CanvasTexture(c);
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.generateMipmaps=true;
    texture.minFilter=THREE.LinearMipmapLinearFilter;
    const old=pic.material.map;pic.material.map=texture;pic.material.needsUpdate=true;
    if(old)old.dispose();
  }
  let manifestCache = null;
  async function getManifest() {
    if (!manifestCache) {
      manifestCache = await fetch(BASE+'assets/available.json',{cache:'no-cache'}).then(r=>r.ok?r.json():{}).catch(()=>({}));
    }
    return manifestCache;
  }
  async function tryLoadImage(entry){
    const pic=pictures.get(entry.id);if(!pic)return;
    const custom=await getPortrait(entry.id).catch(()=>null);
    let urls=[];
    if(custom){const u=URL.createObjectURL(custom);urls.push({url:u,dispose:true});}
    else{
      const localManifest=await getManifest();
      if(localManifest?.[entry.id] || entry.asset)urls.push({url:BASE+'assets/'+entry.asset});
      if(entry.imageUrl)urls.push({url:entry.imageUrl});
    }
    for(const candidate of urls){
      try{
        const image=new Image();image.crossOrigin='anonymous';
        await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('Không tải được ảnh'));image.src=candidate.url;});
        replacePicture(pic,image);return;
      }catch{}finally{if(candidate.dispose)URL.revokeObjectURL(candidate.url);}
    }
  }
  slots.forEach(slot=>{
    const entry=PEOPLE.find(p=>p.id===slot.id);if(!entry)return;
    const f=new THREE.Group();f.name='Khung chân dung '+entry.name;f.position.set(slot.x,slot.y||3.72,slot.z);f.rotation.y=slot.yaw;
    f.userData.mathHistoryId=entry.id;
    const backing=new THREE.Mesh(new THREE.BoxGeometry(4.20,5.20,.22),borderMat);
    const inlay=new THREE.Mesh(new THREE.BoxGeometry(3.98,4.98,.25),bgMat);inlay.position.z=.11;
    const mat=new THREE.MeshBasicMaterial({map:imageLabelTexture(THREE,entry,'portrait'),side:THREE.FrontSide});
    const portrait=new THREE.Mesh(new THREE.PlaneGeometry(3.60,3.20),mat);portrait.position.set(0,.65,.255);
    const portraitBack=new THREE.Mesh(portrait.geometry,mat);portraitBack.position.set(0,.65,-.125);portraitBack.rotation.y=Math.PI;
    const lblMat=new THREE.MeshBasicMaterial({map:imageLabelTexture(THREE,entry,'label'),side:THREE.FrontSide});
    const label=new THREE.Mesh(new THREE.PlaneGeometry(3.90,.75),lblMat);label.position.set(0,-1.45,.255);
    const labelBack=new THREE.Mesh(label.geometry,lblMat);labelBack.position.set(0,-1.45,-.125);labelBack.rotation.y=Math.PI;
    const subtitle=smallSign(THREE,entry.contribution,3.90,.48);subtitle.position.set(0,-2.10,.256);
    const subtitleBack=smallSign(THREE,entry.contribution,3.90,.48);subtitleBack.position.set(0,-2.10,-.126);subtitleBack.rotation.y=Math.PI;
    f.add(backing,inlay,portrait,portraitBack,label,labelBack,subtitle,subtitleBack);group.add(f);pictures.set(entry.id,portrait);frameTargets.push(f);
  });
  let imagesLoaded = false;
  function loadAllPortraits() {
    if (imagesLoaded) return;
    imagesLoaded = true;
    PEOPLE.forEach((entry, i) => {
      setTimeout(() => { void tryLoadImage(entry); }, i * 60);
    });
  }
  // Tải trước toàn bộ 18 ảnh chân dung ngay khi khởi tạo phòng
  setTimeout(loadAllPortraits, 100);
  // Two physically separate interactive pedestals inside the exhibition room.
  for(const item of [
    {kind:'ggb-2d',title:'XƯỞNG VẼ HÌNH 2D',color:'#63e2ed',x:centerX-8,z:backZ+28},
    {kind:'ggb-3d',title:'XƯỞNG DỰNG HÌNH 3D',color:'#e4be85',x:centerX+8,z:backZ+28}
  ]){
    const pedestal=new THREE.Group();pedestal.name='GeoGebra Pedestal '+item.kind;
    pedestal.userData.mathExhibitionAction={type:item.kind};pedestal.position.set(item.x,0,item.z);
    const pillar=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.3,1.25,24),new THREE.MeshStandardMaterial({color:0x1b3847,metalness:.5,roughness:.4}));
    pillar.position.y=.63;pedestal.add(pillar);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.05,.085,12,40),new THREE.MeshBasicMaterial({color:item.color}));
    ring.rotation.x=Math.PI/2;ring.position.y=1.28;pedestal.add(ring);
    const c=document.createElement('canvas');c.width=720;c.height=160;
    const ctx=c.getContext('2d');ctx.fillStyle='#102a3d';ctx.fillRect(0,0,c.width,c.height);
    ctx.strokeStyle=item.color;ctx.lineWidth=4;ctx.strokeRect(6,6,c.width-12,c.height-12);
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle=item.color;ctx.font='bold 42px "Segoe UI", Arial, sans-serif';ctx.fillText(item.title,c.width/2,58);
    ctx.fillStyle='#f4f7fa';ctx.font='600 26px "Segoe UI", Arial, sans-serif';ctx.fillText('NHẤP CHUỘT ĐỂ MỞ',c.width/2,114);
    const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
    const pMat=new THREE.MeshBasicMaterial({map:tex,side:THREE.FrontSide});
    const plate=new THREE.Mesh(new THREE.PlaneGeometry(5.5,1.3),pMat);
    const plateBack=new THREE.Mesh(plate.geometry,pMat);plateBack.rotation.y=Math.PI;plateBack.position.z=-0.012;plate.add(plateBack);
    plate.position.y=2.62;plate.rotation.y=0;pedestal.add(plate);
    const icon=new THREE.Group();icon.position.y=1.88;
    const icoMat=new THREE.MeshStandardMaterial({color:item.kind==='ggb-2d'?0x4ddde2:0xe8b767,metalness:.2,roughness:.32,emissive:item.kind==='ggb-2d'?0x0a5555:0x4e300a,emissiveIntensity:.35});
    if(item.kind==='ggb-2d'){
      const p=[[0,0.38,0],[-.7,-.28,0],[.7,-.28,0]];
      for(let i=0;i<3;i++){
        const a=new THREE.Vector3(...p[i]),b=new THREE.Vector3(...p[(i+1)%3]);const v=b.clone().sub(a);
        const e=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,v.length(),8),icoMat);e.position.copy(a.clone().add(b).multiplyScalar(.5));e.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());icon.add(e);
      }
    }else{
      const cube=new THREE.Mesh(new THREE.BoxGeometry(.85,.85,.85),icoMat);cube.rotation.set(.24,.43,.12);icon.add(cube);
      const axis=new THREE.AxesHelper(1.1);icon.add(axis);
    }
    pedestal.add(icon);room.add(pedestal);frameTargets.push(pedestal);workshopSigns.push({icon,ring});
  }
  function onUpdated(e){const entry=PEOPLE.find(p=>p.id===e.detail?.id);if(entry)void tryLoadImage(entry);}
  window.addEventListener('mathverse:history-image-updated',onUpdated);
  let wasNear=false;
  function syncProximity(x,z){
    const near=x>centerX-width/2+1&&x<centerX+width/2-1&&z< -7.9&&z>backZ+.7;
    if(near && !imagesLoaded) loadAllPortraits();
    wallGallery?.animateNearby(x,z,performance.now());
    if(near!==wasNear){wasNear=near;window.dispatchEvent(new CustomEvent('mathverse:history-nearby',{detail:{near}}));}
  }
  function destroy(){window.removeEventListener('mathverse:history-image-updated',onUpdated);wallGallery?.destroy();}
  return {targets:frameTargets,syncProximity,destroy,room:group,wallCount:wallGallery?.count||0,pedestalCount:workshopSigns.length};
}
