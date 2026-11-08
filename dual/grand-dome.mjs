/*
 * MATHVERSE GRAND CAMPUS V11 - ARCHITECTURE AND RECEPTION REFINEMENT.
 * Two intentionally DIFFERENT architectural identities:
 *   LEFT  / MATHVERSE LAB: rectilinear research institute with seven science wings.
 *   RIGHT / INFOGRAPHIC MUSEUM: radial-petal stone-and-glass cultural pavilion.
 * One centrally placed receptionist, symmetric Y-shaped paths and shared skyline.
 * Do not modify R75, infographic inventory, avatar factory or transition API.
 */
import * as THREE from '/vendor/three.module.js';
import {createMarblePlazaTexture} from './graphics-engine.mjs';

export const GRAND_DOME_LAYOUT=Object.freeze({
  playerSpawn:Object.freeze({x:0,z:28}),
  grandDome:Object.freeze({x:0,z:0,radius:26,height:22}),
  lab:Object.freeze({x:-108,z:0,triggerRadius:11.5,buildingX:-138,buildingZ:0}),
  museum:Object.freeze({x:108,z:0,triggerRadius:11.5,buildingX:138,buildingZ:0}),
  discovery:Object.freeze({x:0,z:-78,triggerRadius:11.5,buildingX:0,buildingZ:-138}),
  guide:Object.freeze({x:0,z:-7,triggerRadius:8.4}),
  limits:Object.freeze({xMin:-212,xMax:212,zMin:-212,zMax:226})
});

// Helper: check if (x, z) lies strictly on the designated paved walkways, rotunda, bridges, orbital ring & plazas
function isOnWalkableCampusNetwork(x,z){
  const r0=Math.hypot(x,z);
  // 1. Central Grand Dome rotunda (radius 25.4m inside Corinthian colonnade)
  if(r0<=25.4)return true;
  // 2. Outer Orbital Ring marble deck (133.5m <= r <= 142.5m between golden railings)
  if(r0>=133.5&&r0<=142.5)return true;
  // 3. North-South Radial Avenue & Bridges (width 9.0m between golden railings)
  if(Math.abs(x)<=4.5&&z>=-138.0&&z<=138.0)return true;
  // 4. West-East Radial Avenue & Bridges (width 9.0m between golden railings)
  if(Math.abs(z)<=4.5&&x>=-138.0&&x<=138.0)return true;
  // 5. West Lab Entrance Forecourt & Promenade (-138, 0)
  if(x>=-114.2&&x<=-80.0&&Math.abs(z)<=18.5)return true;
  if(Math.hypot(x+138,z)<=42.0)return true;
  // 6. East Museum Entrance Forecourt & Circular Promenade (138, 0)
  if(x>=80.0&&x<=108.0&&Math.abs(z)<=18.5)return true;
  if(Math.hypot(x-138,z)<=44.5)return true;
  // 7. North Discovery Entrance Forecourt & Observatory Promenade (0, -138)
  if(Math.abs(x)<=16.5&&z>=-124.0&&z<=-76.0)return true;
  if(Math.hypot(x,z+138)<=38.0)return true;
  // 8. South Wonder Park Expanded Paved Plaza (0, 138, radius 74.8m inside the expanded green lawn border)
  if(Math.hypot(x,z-138)<=74.8)return true;
  return false;
}

// Helper: project an off-path point (x, z) onto the nearest point on the designated walkable network
function projectToWalkableCampusNetwork(x,z){
  if(isOnWalkableCampusNetwork(x,z))return {x,z};
  let bestX=x,bestZ=z,bestD2=Infinity;
  const consider=(cx,cz)=>{
    const d2=(cx-x)*(cx-x)+(cz-z)*(cz-z);
    if(d2<bestD2){bestD2=d2;bestX=cx;bestZ=cz;}
  };
  // 1. Central Rotunda disc (0, 0, R=25.4)
  const r0=Math.hypot(x,z);
  if(r0>0.001)consider(x*(25.4/r0),z*(25.4/r0));
  // 2. Orbital Ring annulus (0, 0, R in [133.5, 142.5])
  if(r0>0.001){
    const cr=THREE.MathUtils.clamp(r0,133.5,142.5);
    consider(x*(cr/r0),z*(cr/r0));
  }
  // 3. North-South Radial Bridge box [-4.5, 4.5] x [-138.0, 138.0]
  consider(THREE.MathUtils.clamp(x,-4.5,4.5),THREE.MathUtils.clamp(z,-138.0,138.0));
  // 4. West-East Radial Bridge box [-138.0, 138.0] x [-4.5, 4.5]
  consider(THREE.MathUtils.clamp(x,-138.0,138.0),THREE.MathUtils.clamp(z,-4.5,4.5));
  // 5. West Lab Forecourt box [-114.2, -80.0] x [-18.5, 18.5]
  consider(THREE.MathUtils.clamp(x,-114.2,-80.0),THREE.MathUtils.clamp(z,-18.5,18.5));
  // 6. East Museum Forecourt box [80.0, 108.0] x [-18.5, 18.5]
  consider(THREE.MathUtils.clamp(x,80.0,108.0),THREE.MathUtils.clamp(z,-18.5,18.5));
  // 7. North Discovery Forecourt box [-16.5, 16.5] x [-124.0, -76.0]
  consider(THREE.MathUtils.clamp(x,-16.5,16.5),THREE.MathUtils.clamp(z,-124.0,-76.0));
  // 8. Satellite Island Plazas
  for(const [ix,iz,ir] of [[-138,0,42.0],[138,0,44.5],[0,-138,38.0],[0,138,74.8]]){
    const dx=x-ix,dz=z-iz,d=Math.hypot(dx,dz);
    if(d>0.001)consider(ix+dx*(ir/d),iz+dz*(ir/d));
  }
  return {x:bestX,z:bestZ};
}

// Exterior-only collider with strict designated-path constraint & zero-bounce tangential sliding.
// Prevents walking onto the blue sky/ocean void or outer green grass rings while preserving the navigation API.
export function clampToGrandDome(previous,next){
  const l=GRAND_DOME_LAYOUT;
  let p={x:THREE.MathUtils.clamp(next.x,l.limits.xMin,l.limits.xMax),
    z:THREE.MathUtils.clamp(next.z,l.limits.zMin,l.limits.zMax)};
  // 1. Constrain strictly to the designated marble walkways, bridges, orbital ring & plazas
  p=projectToWalkableCampusNetwork(p.x,p.z);
  // 2. Central Grand Dome interior obstacles: Möbius Fountain at (0, 8, R=4.05) & Reception Desk at (0, -11.5)
  const dxF=p.x,dzF=p.z-8.0,dF=Math.hypot(dxF,dzF);
  if(dF<4.05){
    const norm=1/Math.max(0.001,dF);
    p.x=dxF*norm*4.05;
    p.z=8.0+dzF*norm*4.05;
  }
  if(p.x>-7.3&&p.x<7.3&&p.z>-14.2&&p.z<-9.1){
    if(previous.z>=-9.1)p.z=-9.1;
    else if(previous.z<=-14.2)p.z=-14.2;
    else if(previous.x<=-7.3)p.x=-7.3;
    else p.x=7.3;
  }
  // 3. Solid LAB academy rectangle on West Island (-138, 0), rotated +90 deg facing East (+X).
  if(p.x<-114.2&&p.x>-168.0&&p.z>-31.5&&p.z<31.5){
    if(previous.x>=-114.2){
      p.x=-114.2;
    }else if(previous.x<=-168.0){
      p.x=-168.0;
    }else if(previous.z<=-31.5){
      p.z=-31.5;
    }else if(previous.z>=31.5){
      p.z=31.5;
    }else{
      const dEast=Math.abs(p.x+114.2),dWest=Math.abs(p.x+168.0),dNorth=Math.abs(p.z+31.5),dSouth=Math.abs(p.z-31.5);
      const m=Math.min(dEast,dWest,dNorth,dSouth);
      if(m===dEast)p.x=-114.2;
      else if(m===dWest)p.x=-168.0;
      else if(m===dNorth)p.z=-31.5;
      else p.z=31.5;
    }
  }
  // 4. Discovery North Island monument base at (0, -142): smooth radial projection (tangential slide).
  const dxDisc=p.x,dzDisc=p.z+142;
  const dDisc=Math.hypot(dxDisc,dzDisc),rDisc=18.5;
  if(dDisc<rDisc){
    const norm=1/Math.max(0.001,dDisc);
    p.x=dxDisc*norm*rDisc;
    p.z=-142+dzDisc*norm*rDisc;
  }
  // 5. MUSEUM's sculptural fan facade on East Island (+138, 0): smooth radial projection (tangential slide).
  const dx=p.x-l.museum.buildingX,dz=p.z-l.museum.buildingZ;
  const dist=Math.hypot(dx,dz),R=30.4;
  if(dist<R){
    const norm=1/Math.max(0.001,dist);
    p.x=l.museum.buildingX+dx*norm*R;
    p.z=l.museum.buildingZ+dz*norm*R;
  }
  return p;
}

export const CAMPUS_ROUTES=Object.freeze({
  common:Object.freeze([[0,44],[0,22],[0,0]]),
  lab:Object.freeze([[-38,0],[-56,0],[-74,0],[-92,0]]),
  museum:Object.freeze([[38,0],[56,0],[74,0],[92,0]])
});

export function createGrandDome({createAvatar,catalogCounts=null}){
  const group=new THREE.Group();group.name='GRAND_CAMPUS_WORLD_0';
  const clickable=[];
  const marbleMap=createMarblePlazaTexture({baseColor:'#faf5ea',veinColor:'#cbd5e1',gridColor:'#d97706',subGridColor:'#94a3b8',repeat:12});
  const satelliteMarbleMap=createMarblePlazaTexture({baseColor:'#f8f4ec',veinColor:'#cbd5e1',gridColor:'#b45309',subGridColor:'#94a3b8',repeat:16});
  const materials={
    stone:new THREE.MeshStandardMaterial({color:0xfdf8ee,metalness:.08,roughness:.36}),
    stoneSide:new THREE.MeshStandardMaterial({color:0xeadcc5,metalness:.12,roughness:.44}),
    polished:new THREE.MeshStandardMaterial({color:0xffffff,map:marbleMap||null,metalness:.16,roughness:.24}),
    satellitePlaza:new THREE.MeshStandardMaterial({color:0xffffff,map:satelliteMarbleMap||null,metalness:.14,roughness:.28}),
    dark:new THREE.MeshStandardMaterial({color:0x0b2138,metalness:.46,roughness:.28}),
    onyx:new THREE.MeshStandardMaterial({color:0x061325,metalness:.58,roughness:.16}),
    cliff:new THREE.MeshStandardMaterial({color:0x16293d,metalness:.26,roughness:.64}),
    metal:new THREE.MeshStandardMaterial({color:0xd97706,metalness:.78,roughness:.20}),
    goldBright:new THREE.MeshStandardMaterial({color:0xf59e0b,metalness:.85,roughness:.15}),
    paleMetal:new THREE.MeshStandardMaterial({color:0xfbbf24,metalness:.68,roughness:.24}),
    lab:new THREE.MeshStandardMaterial({color:0x0369a1,metalness:.44,roughness:.28}),
    labDeep:new THREE.MeshStandardMaterial({color:0x082f49,metalness:.54,roughness:.26}),
    labGlass:new THREE.MeshStandardMaterial({color:0x38bdf8,metalness:.30,roughness:.16,transparent:true,opacity:.82,depthWrite:true}),
    water:new THREE.MeshStandardMaterial({color:0x0ea5e9,metalness:.18,roughness:.12,transparent:true,opacity:.84,depthWrite:false}),
    museum:new THREE.MeshStandardMaterial({color:0x5b21b6,metalness:.34,roughness:.32}),
    museumGlass:new THREE.MeshStandardMaterial({color:0xa855f7,metalness:.26,roughness:.18,transparent:true,opacity:.76,depthWrite:true}),
    museumStone:new THREE.MeshStandardMaterial({color:0xfcf8f2,metalness:.10,roughness:.38}),
    walk:new THREE.MeshStandardMaterial({color:0xf8fafc,metalness:.12,roughness:.34}),
    walkEdge:new THREE.MeshStandardMaterial({color:0xf59e0b,metalness:.72,roughness:.22}),
    goldGlow:new THREE.MeshBasicMaterial({color:0xfde047,toneMapped:false}),
    blueGlow:new THREE.MeshBasicMaterial({color:0x38bdf8,toneMapped:false}),
    violetGlow:new THREE.MeshBasicMaterial({color:0xc084fc,toneMapped:false}),
    green:new THREE.MeshStandardMaterial({color:0x047857,roughness:.58,metalness:.08}),
    greenBright:new THREE.MeshStandardMaterial({color:0x059669,roughness:.54,metalness:.08}),
    hydrangeaBlue:new THREE.MeshStandardMaterial({color:0x0284c7,roughness:.48,metalness:.16}),
    lavenderViolet:new THREE.MeshStandardMaterial({color:0x7c3aed,roughness:.48,metalness:.16}),
    roseRed:new THREE.MeshStandardMaterial({color:0xe11d48,roughness:.52,metalness:.12}),
    bark:new THREE.MeshStandardMaterial({color:0x5c4033,roughness:.82}),
    soil:new THREE.MeshStandardMaterial({color:0x059669,roughness:.62,metalness:.08}),
    canopy:new THREE.MeshStandardMaterial({color:0x38bdf8,transparent:true,opacity:.14,depthWrite:false,side:THREE.DoubleSide,roughness:.18,metalness:.22})
  };
  const draft=new THREE.Object3D();
  const gradePalette=[0x0284c7,0x2563eb,0xd97706,0xdb2777,0x7c3aed,0x059669,0xb45309];
  function add(parent,geom,material,x=0,y=0,z=0,name){
    const obj=new THREE.Mesh(geom,material);obj.position.set(x,y,z);
    if(name)obj.name=name;obj.castShadow=false;obj.receiveShadow=false;parent.add(obj);return obj;
  }
  function block(parent,sx,sy,sz,x,y,z,material,name){
    return add(parent,new THREE.BoxGeometry(sx,sy,sz),material,x,y,z,name);
  }
  function column(parent,r,h,x,y,z,material,name){
    return add(parent,new THREE.CylinderGeometry(r,r,h,12),material,x,y,z,name);
  }
  function disk(parent,r,y,x,z,material,name){
    return column(parent,r,.18,x,y,z,material,name);
  }
  function tube(parent,points,material,r=.08,name='',closed=false){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),closed,'centripetal');
    return add(parent,new THREE.TubeGeometry(curve,Math.max(18,points.length*6),r,6,closed),material,0,0,0,name);
  }
  function annulus(parent,r,y,thickness,material,name='',arc=Math.PI*2){
    const m=add(parent,new THREE.TorusGeometry(r,thickness,6,90,arc),material,0,y,0,name);m.rotation.x=Math.PI/2;return m;
  }
  function frame(parent,w,h,x,y,z,material,thickness=.25){
    block(parent,w,thickness,thickness,x,y+h/2,z,material);
    block(parent,w,thickness,thickness,x,y-h/2,z,material);
    block(parent,thickness,h,thickness,x-w/2,y,z,material);
    block(parent,thickness,h,thickness,x+w/2,y,z,material);
  }
  // Pixel-space and world-space aspect ratios MUST match. Previous labels
  // distorted Vietnamese text by stretching a 1024x180 canvas onto very wide
  // signboards, and fillText(..., maxWidth) compressed glyphs horizontally.
  // Adapted from the non-stretch SDF text principles in troika-three-text;
  // implemented with the existing bundled Three.js only (zero dependencies).
  function label(parent,text,x,y,z,w=16,h=1.9,color='#e3c58b',target=null,rotation=0){
    const aspect=Math.max(1,w/Math.max(.1,h));
    const ch=Math.max(72,Math.round(768/aspect)),cw=Math.round(ch*aspect);
    const canvas=document.createElement('canvas');canvas.width=cw;canvas.height=ch;
    const cx=canvas.getContext('2d');
    cx.fillStyle='#102d43';cx.fillRect(0,0,cw,ch);
    cx.strokeStyle=color;cx.lineWidth=Math.max(5,Math.round(ch*.055));
    const pad=Math.max(7,Math.round(ch*.065));
    cx.strokeRect(pad,pad,cw-2*pad,ch-2*pad);
    const words=String(text).normalize('NFC');
    let fontSize=Math.round(ch*.56);
    cx.textAlign='center';cx.textBaseline='middle';
    function setFont(){cx.font=`700 ${fontSize}px Arial, sans-serif`;}
    setFont();
    const measure=()=>typeof cx.measureText==='function'?cx.measureText(words).width:words.length*fontSize*.58;
    while(fontSize>Math.max(17,Math.floor(ch*.25))&&measure()>cw-pad*5){fontSize-=3;setFont();}
    cx.fillStyle='#fff9ed';cx.fillText(words,cw/2,ch/2+ch*.014);
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
    tex.anisotropy=4;
    const mat=new THREE.MeshBasicMaterial({map:tex,side:THREE.FrontSide,toneMapped:false});
    const panel=add(parent,new THREE.PlaneGeometry(w,h),mat,x,y,z);
    const panelBack=new THREE.Mesh(panel.geometry,mat);panelBack.rotation.y=Math.PI;panelBack.position.z=-0.012;panel.add(panelBack);
    panel.name=`LEGIBLE_SIGN_${words.replace(/[^A-Z0-9]+/gi,'_').slice(0,36)}`;
    panel.rotation.y=rotation;
    panel.userData.signGeometryAspect=w/h;
    panel.userData.signTextureAspect=cw/ch;
    if(target){panel.userData.grandTarget=target;panelBack.userData.grandTarget=target;clickable.push(panel,panelBack);}
    return panel;
  }
  function instanced(parent,geo,material,transforms,name){
    const out=new THREE.InstancedMesh(geo,material,transforms.length);out.name=name;
    transforms.forEach(([x,y,z,ry=0,sx=1,sy=1,sz=1],i)=>{
      draft.position.set(x,y,z);draft.rotation.set(0,ry,0);draft.scale.set(sx,sy,sz);
      draft.updateMatrix();out.setMatrixAt(i,draft.matrix);
    });out.instanceMatrix.needsUpdate=true;parent.add(out);return out;
  }
  // ---- R107 BIG UPDATE: QUẦN ĐẢO TRÊN MÂY — VÒNG QUỸ ĐẠO TRI THỨC (04/05) ----
  // Tuyệt đối KHÔNG dùng tấm nền chữ nhật xám (CAMPUS_WALKABLE_FOUNDATION) để 5 đảo tròn nổi trên biển mây đúng chuẩn Ảnh 2!
  function aerialBanner(parent,text,x,y,z,w=46,h=11,borderColor='#eab308',textColor='#1e293b',bgColor='#ffffff',target=null){
    const aspect=Math.max(1,w/Math.max(.1,h));
    const ch=256,cw=Math.round(ch*aspect);
    const canvas=document.createElement('canvas');canvas.width=cw;canvas.height=ch;
    const cx=canvas.getContext('2d');
    cx.fillStyle=bgColor;cx.fillRect(0,0,cw,ch);
    cx.strokeStyle=borderColor;cx.lineWidth=18;
    cx.strokeRect(12,12,cw-24,ch-24);
    cx.font=`700 ${Math.round(ch*0.50)}px Arial, sans-serif`;
    cx.textAlign='center';cx.textBaseline='middle';
    cx.fillStyle=textColor;cx.fillText(text,cw/2,ch/2+4);
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
    const mat=new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,toneMapped:false});
    const m=add(parent,new THREE.PlaneGeometry(w,h),mat,x,y,z,`AERIAL_BANNER_${text.replace(/[^A-Z0-9]+/gi,'_')}`);
    m.rotation.x=-Math.PI/2;
    if(target){m.userData.grandTarget=target;clickable.push(m);}
    return m;
  }

  // 1. ĐẢO TRUNG TÂM GRAND DOME TẠI TÂM (0, 0) — KIẾN TRÚC THÀNH TRÌ ĐÁ CẨM THẠCH 3 TẦNG TƯƠNG PHẢN CAO
  const centralIsland=new THREE.Group();centralIsland.name='GRAND_DOME_CENTRAL_ISLAND';centralIsland.position.set(0,0,0);group.add(centralIsland);
  // Đế vách đá nổi 3D dưới đáy đảo (Tapered Floating Basalt-Granite Cliff)
  add(centralIsland,new THREE.CylinderGeometry(48.5,33.5,5.2,64),materials.cliff,0,-2.65,0,'GRAND_DOME_ISLAND_CLIFF_HULL');
  annulus(centralIsland,41.2,-2.4,.55,materials.metal,'GRAND_DOME_CLIFF_GOLD_BELT');
  // Vành cỏ Lục Bảo Hoàng Gia & Viền Vàng 24K
  disk(centralIsland,48.0,-.04,0,0,materials.soil,'GRAND_DOME_ISLAND_EMERALD_RING');
  annulus(centralIsland,48.3,.08,.52,materials.goldBright,'GRAND_DOME_ISLAND_OUTER_GOLD_RIM');
  // Sàn Quảng Trường Đá Cẩm Thạch Carrara Vân Vàng & Vành Đá Sapphire Tương Phản
  disk(centralIsland,40.5,.02,0,0,materials.polished,'GRAND_DOME_ISLAND_CREAM_PLAZA');
  const sapphireRing=add(centralIsland,new THREE.RingGeometry(25.2,27.6,72),materials.onyx,0,.065,0,'GRAND_DOME_SAPPHIRE_INLAY_RING');
  sapphireRing.rotation.x=-Math.PI/2;
  annulus(centralIsland,40.7,.09,.38,materials.metal,'GRAND_DOME_ISLAND_INNER_GOLD_RIM');

  // 2. VÒNG CẦU LIÊN ĐẢO ĐỒNG TÂM (Outer Orbital Ring Bridge, R = 138m quanh tâm (0, 0)) nối 4 đảo Bắc - Đông - Nam - Tây
  const orbitalRing=new THREE.Group();orbitalRing.name='ORBITAL_KNOWLEDGE_RING_BRIDGE';orbitalRing.position.set(0,0,0);group.add(orbitalRing);
  const orbitR=138.0;
  // Dầm đá nâng dưới gầm Vòng Cầu Liên Đảo
  const orbitUnder=add(orbitalRing,new THREE.TorusGeometry(orbitR,2.2,8,128),materials.dark,0,-1.25,0,'ORBITAL_RING_UNDER_ARCH');
  orbitUnder.rotation.x=Math.PI/2;
  const orbitDeck=add(orbitalRing,new THREE.RingGeometry(orbitR-4.8,orbitR+4.8,128),materials.polished,0,.035,0,'ORBITAL_RING_DECK');
  orbitDeck.rotation.x=-Math.PI/2;
  annulus(orbitalRing,orbitR-4.9,.14,.55,materials.goldBright,'ORBITAL_RING_INNER_GOLD_RAIL');
  annulus(orbitalRing,orbitR+4.9,.14,.55,materials.goldBright,'ORBITAL_RING_OUTER_GOLD_RAIL');
  annulus(orbitalRing,orbitR,.08,.22,materials.metal,'ORBITAL_RING_CENTER_LIGHT_LINE');

  // 3. 4 ĐẢO VỆ TINH ĐỐI XỨNG CHỮ THẬP (+) TẠI KHOẢNG CÁCH R_orbit = 138m (Đảo Nam Wonder Park mở rộng R = 82m)
  for(const [ix,iz,ir,iname] of [
    [-138,0,66,'LAB_SATELLITE_ISLAND_HALO'],
    [138,0,66,'MUSEUM_SATELLITE_ISLAND_HALO'],
    [0,-138,66,'DISCOVERY_NORTH_ISLAND_HALO'],
    [0,138,82,'PARK_SOUTH_ISLAND_HALO']
  ]){
    add(group,new THREE.CylinderGeometry(ir+.4,ir-16,5.6,64),materials.cliff,ix,-2.85,iz,iname+'_CLIFF_HULL');
    disk(group,ir,-.03,ix,iz,materials.soil,iname);
    const rim=add(group,new THREE.TorusGeometry(ir+.3,.52,10,84),materials.goldBright,ix,.08,iz,iname+'_GOLD_RIM');
    rim.rotation.x=Math.PI/2;
    disk(group,ir-7.2,.015,ix,iz,materials.satellitePlaza,iname+'_MARBLE');
  }

  // 4. 4 ĐƯỜNG ĐI / CẦU XUYÊN TÂM ĐỐI XỨNG 4 HƯỚNG (BẮC - NAM - TÂY - ĐÔNG) KÈM DẦM CẦU ĐÁ SAPPHIRE & LAN CAN VÀNG 3D
  // Cầu Xuyên Tâm Hướng Bắc (từ (0, -40) tới (0, -82))
  block(group,10.4,1.2,42,0,-.58,-61,materials.dark,'NORTH_RADIAL_BRIDGE_SUBSTRUCTURE');
  block(group,9.6,.08,42,0,.05,-61,materials.polished,'NORTH_RADIAL_BRIDGE_DECK');
  for(const sx of [-4.8,4.8])block(group,.48,.46,42,sx,.26,-61,materials.goldBright,'NORTH_RADIAL_BRIDGE_GOLD_RAIL');
  block(group,.32,.09,42,0,.08,-61,materials.metal,'NORTH_RADIAL_BRIDGE_CENTER_GOLD');
  // Cầu Xuyên Tâm Hướng Nam (từ (0, +40) tới (0, +82))
  block(group,10.4,1.2,42,0,-.58,61,materials.dark,'SOUTH_RADIAL_BRIDGE_SUBSTRUCTURE');
  block(group,9.6,.08,42,0,.05,61,materials.polished,'SOUTH_RADIAL_BRIDGE_DECK');
  for(const sx of [-4.8,4.8])block(group,.48,.46,42,sx,.26,61,materials.goldBright,'SOUTH_RADIAL_BRIDGE_GOLD_RAIL');
  block(group,.32,.09,42,0,.08,61,materials.metal,'SOUTH_RADIAL_BRIDGE_CENTER_GOLD');
  // Dầm đỡ dưới Cầu Tây & Cầu Đông
  block(group,54,1.2,10.4,-65,-.58,0,materials.dark,'WEST_RADIAL_BRIDGE_SUBSTRUCTURE');
  block(group,54,1.2,10.4,65,-.58,0,materials.dark,'EAST_RADIAL_BRIDGE_SUBSTRUCTURE');

  function ribbonFromPoints(parent,control,width,material,edgeMaterial,name,isSide=0){
    const curve=new THREE.CatmullRomCurve3(control.map(([x,z])=>new THREE.Vector3(x,0,z)),false,'centripetal');
    const segments=72;
    function surfaceStrip(offsetLeft,offsetRight,material,y,suffix){
      const verts=[],uv=[],indices=[];
      for(let i=0;i<=segments;i++){
        const t=i/segments,pos=curve.getPoint(t),dir=curve.getTangent(t);
        let nx=-dir.z,nz=dir.x;
        const len=Math.hypot(nx,nz);if(len>1e-6){nx/=len;nz/=len;}
        for(const off of [offsetLeft,offsetRight]){
          const vx=pos.x+nx*off, vz=pos.z+nz*off;
          verts.push(vx,y,vz);uv.push(i/segments,off/width+.5);
        }
        if(i<segments){const n=i*2;indices.push(n,n+2,n+1,n+1,n+2,n+3);}
      }
      const geom=new THREE.BufferGeometry();
      geom.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
      geom.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
      geom.setIndex(indices);geom.computeVertexNormals();
      return add(parent,geom,material,0,0,0,(suffix==='PAVEMENT'?name:`${name}_${suffix}`));
    }
    const road=surfaceStrip(width/2,-width/2,material,.082,'PAVEMENT');
    surfaceStrip(width/2,width/2-.36,edgeMaterial,.094,'EDGE_LEFT');
    surfaceStrip(-width/2+.36,-width/2,edgeMaterial,.094,'EDGE_RIGHT');
    surfaceStrip(.22,-.22,edgeMaterial,.094,'CENTER_STRIPE');
    return road;
  }
  const commonWalkMaterial=new THREE.MeshStandardMaterial({color:0xfdfaf3,roughness:.26,metalness:.14,side:THREE.DoubleSide});
  ribbonFromPoints(group,[[0,42],[0,28],[0,14],[0,0]],9.6,commonWalkMaterial,materials.walkEdge,'COMMON_RECEPTION_WALKWAY',0);
  const labPathMaterial=new THREE.MeshStandardMaterial({color:0xfdfaf3,roughness:.26,metalness:.14,side:THREE.DoubleSide});
  const museumPathMaterial=new THREE.MeshStandardMaterial({color:0xfdfaf3,roughness:.26,metalness:.14,side:THREE.DoubleSide});
  const left=ribbonFromPoints(group,CAMPUS_ROUTES.lab,9.6,labPathMaterial,materials.walkEdge,'SYMMETRIC_LAB_WALKWAY',0);
  const right=ribbonFromPoints(group,CAMPUS_ROUTES.museum,9.6,museumPathMaterial,materials.walkEdge,'SYMMETRIC_MUSEUM_WALKWAY',0);
  block(group,.18,.032,5.2,0,.096,0,materials.metal,'FORK_JUNCTION_BRASS_DIVIDER');
  function routeMarkers(points,material,name){
    const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,.13,z)));
    const marks=[];
    for(let i=1;i<=10;i++){
      const p=curve.getPoint(i/11),v=curve.getTangent(i/11);
      marks.push([p.x,.13,p.z,Math.atan2(-v.x,-v.z)]);
    }
    return instanced(group,new THREE.BoxGeometry(.55,.05,1.08),material,marks,name);
  }
  routeMarkers(CAMPUS_ROUTES.lab,materials.blueGlow,'LAB_SAME_DISTANCE_WAYPOINTS');
  routeMarkers(CAMPUS_ROUTES.museum,materials.violetGlow,'MUSEUM_SAME_DISTANCE_WAYPOINTS');

  // 5. ĐẠI SẢNH VÒM PANTHEON HOÀNG GIA TRUNG TÂM (GRAND DOME) TẠI TÂM (0, 0) — GỌN ĐẸP, CHÂN THỰC & TƯƠNG PHẢN CAO
  const domeData=GRAND_DOME_LAYOUT.grandDome;
  const canopy=new THREE.Group();canopy.name='SHARED_MEGA_DOME_COVERS_TWO_BUILDINGS';canopy.position.set(0,0,0);group.add(canopy);
  const shell=add(canopy,new THREE.SphereGeometry(1,48,20,0,2*Math.PI,0,Math.PI/2),materials.canopy,0,11.6,0,'GRAND_DOME_ROOF_MINIMAL_VISUAL');
  shell.scale.set(domeData.radius,12.5,domeData.radius);shell.renderOrder=0;
  for(let i=0;i<16;i++){
    const a=2*Math.PI*i/16;
    const points=[];
    for(let j=0;j<=12;j++){
      const t=(j/12)*Math.PI/2;
      points.push([domeData.radius*Math.sin(t)*Math.sin(a),11.6+12.5*Math.cos(t),domeData.radius*Math.sin(t)*Math.cos(a)]);
    }
    tube(canopy,points,i%4===0?materials.goldBright:materials.dark,i%4===0?.20:.12,'LIGHTWEIGHT_GRAND_DOME_ARCH_RIB');
  }
  // Vòng Đỉnh Vòm (Oculus Ring) & Tháp Đèn Hoàng Kim trên đỉnh (y = 24.1m)
  annulus(canopy,5.2,23.8,.35,materials.goldBright,'GRAND_DOME_OCULUS_CROWN_RING');
  column(canopy,.45,3.2,0,25.4,0,materials.goldBright,'GRAND_DOME_APEX_SPIRE');
  add(canopy,new THREE.OctahedronGeometry(1.15,0),materials.goldGlow,0,27.4,0,'GRAND_DOME_APEX_SUNBURST');
  const domeRim=annulus(canopy,domeData.radius,0.22,.36,materials.goldBright,'GRAND_DOME_BASE_RING',Math.PI*2);

  // ---- LAB: Đặt tại Đảo Vệ Tinh Hướng TÂY (-138, 0), xoay +90° hướng mặt tiền về Sảnh Trung Tâm (0, 0) ----
  const lab=new THREE.Group();lab.name='MATHVERSE_R75_LAB_EXTERIOR';lab.position.set(-138,0,0);lab.rotation.y=Math.PI/2;group.add(lab);
  block(lab,69,.92,61,0,.20,0,materials.stoneSide,'LAB_ACADEMY_FOUNDATION');
  block(lab,61,20.3,48,0,11.0,-3.6,materials.stone,'LAB_RESEARCH_MAIN_BLOCK');
  block(lab,56,1.3,50,0,22.05,-3.6,materials.lab,'LAB_ACADEMIC_ROOFLINE');
  block(lab,58.4,1.2,50.8,0,20.95,-3.6,materials.labDeep);
  // 6 Ô Giếng Trời Khoa Học Màu Trắng Sáng trên mái xanh để nhìn từ Góc Trên Cao giống hệt biểu tượng LAB của Ảnh 2
  for(const rx of [-16,0,16])for(const rz of [-14,6]){
    block(lab,10.5,.45,11.5,rx,22.65,rz,materials.polished,'LAB_ROOF_SKYLIGHT_BAY');
  }
  // University-scale facade: warm cornices, independent stone piers,
  // recessed blue glazing and luminous architectural fins (no extra engine).
  for(const y of [3.6,19.4]){
    block(lab,62.4,.38,1.15,0,y,21.3,materials.paleMetal,'LAB_HORIZONTAL_GOLD_CORNICE');
  }
  const pillarPositions=[-29,-20.3,-2.7,2.7,20.3,29];
  instanced(lab,new THREE.BoxGeometry(.92,17.4,1.45),materials.stoneSide,
    pillarPositions.map(x=>[x,11.0,21.5]),'LAB_STRONG_FACADE_PILASTERS');
  instanced(lab,new THREE.BoxGeometry(.23,15,.33),materials.blueGlow,
    [-27.3,-16.2,16.2,27.3].map(x=>[x,11.3,22.02]),'LAB_ARCHITECTURAL_LIGHT_STRIPS');
  // Distinct white scientific facade instead of the previous unlit teal slab.
  block(lab,17.5,2.4,.5,0,15.0,21.5,materials.stone,'LAB_ACADEMY_MEDALLION_BACKGROUND');
  const labLogo=add(lab,new THREE.TorusGeometry(2.1,.16,10,46),materials.blueGlow,0,14.2,22.0,'LAB_MATH_SYMBOL_MEDALLION');
  labLogo.rotation.x=Math.PI*.12;

  // Solid rhythm and wide glass volumes rather than dozens of thin uprights.
  const windows=[];for(const x of [-25,-18,-11,11,18,25])for(const y of [8,15]){
    windows.push([x,y,20.65]);
  }
  instanced(lab,new THREE.BoxGeometry(5.3,5.1,.3),materials.labGlass,windows,'LAB_GLASS_FACADE_BAYS');
  const sills=[];for(const x of [-25,-18,-11,11,18,25])for(const y of [5.4,12.4,18.5])sills.push([x,y,20.95]);
  instanced(lab,new THREE.BoxGeometry(5.7,.16,.4),materials.metal,sills,'LAB_MULLION_INSTANCES');
  // Seven identifiable wings, visibly different from Museum's petal vaults.
  const wingLoc=[[-38,-22],[-38,-1],[-38,19],[-1,-32],[38,-22],[38,-1],[38,19]];
  const labCounts=[9,10,9,13,11,13,11];
  wingLoc.forEach(([wx,wz],i)=>{
    const wing=new THREE.Group();wing.name=`LAB_WING_GRADE_${i+6}`;wing.position.set(wx,0,wz);lab.add(wing);
    const palette=new THREE.MeshStandardMaterial({color:gradePalette[i],roughness:.42,metalness:.34});
    block(wing,14,13.7,14,0,8.1,0,materials.stoneSide,'SCIENCE_WING_SOLID_WALLS');
    block(wing,12.7,8.6,.3,0,9.0,7.25,materials.labGlass);
    block(wing,14.6,.70,15,0,15.25,0,palette);
    block(wing,15.7,.75,16.1,0,15.95,0,materials.metal);
    label(wing,`LOP ${i+6}`,0,11.2,7.55,9.2,1.3,'#80ddeb');
    for(const bx of [-5.7,5.7])block(wing,.6,12,.8,bx,8.8,7.57,palette);
  });
  // Main ceremonial entrance and shaded portico, flat accessible floor.
  const labDoor=new THREE.Group();labDoor.name='LAB_ENTRANCE_ARCH';labDoor.position.set(0,0,26);lab.add(labDoor);
  block(labDoor,31,.58,9.5,0,.50,0,materials.polished,'LAB_ENTRANCE_PLATFORM');
  for(const x of [-14.4,-9.1,9.1,14.4]){
    column(labDoor,.74,16,x,8,.4,materials.stone,'LAB_MONUMENTAL_PILLAR');
    column(labDoor,.88,.45,x,16.28,.4,materials.metal);
  }
  block(labDoor,33.2,1.50,10.3,0,17.5,0,materials.dark,'LAB_PORTICO_CANOPY');
  block(labDoor,32.7,.18,10.5,0,18.28,0,materials.metal);
  // Real doorway is dark teal glass; only central glass is clickable.
  block(labDoor,18.4,12.9,.35,0,7.3,-.65,materials.labDeep,'LAB_ENTRANCE_FRAME_SURFACE');
  const labHit=block(labDoor,17.9,12.4,.12,0,7.2,.18,materials.labGlass,'LAB_ENTRANCE_INTERACTION');
  labHit.userData.grandTarget='r75';clickable.push(labHit);
  label(labDoor,'MATHVERSE LAB',0,21.5,4.8,25.3,2.3,'#79ddf5','r75');
  label(labDoor,'R75 - 76 LAB - 310 MO HINH',0,18.1,5.1,25.0,1.17,'#cdeeff','r75');
  // Scientific rooftop sculpture tells the building's science purpose.
  const science=new THREE.Group();science.position.set(0,30,-6);lab.add(science);
  const atom=add(science,new THREE.IcosahedronGeometry(2.2,1),materials.blueGlow,0,0,0,'LAB_SCIENCE_ATOM');
  for(const [a,b] of [[0,.3],[.7,.3],[1.4,.7]]){
    const ring=add(science,new THREE.TorusGeometry(3.7,.12,8,58),materials.metal);
    ring.rotation.set(a,b,0);
  }
  // ---- MUSEUM: Đặt tại Đảo Vệ Tinh Hướng ĐÔNG (+138, 0), xoay -90° hướng mặt tiền về Sảnh Trung Tâm (0, 0) ----
  const museum=new THREE.Group();museum.name='CRYSTAL_INFINITY_MUSEUM_EXTERIOR';museum.position.set(138,0,0);museum.rotation.y=-Math.PI/2;group.add(museum);
  disk(museum,32.6,.22,0,0,materials.museumStone,'MUSEUM_CIRCULAR_BASE');
  annulus(museum,32.3,.4,.32,materials.metal);
  disk(museum,29.4,.64,0,0,materials.polished,'MUSEUM_CENTRAL_GALLERY_SLAB');
  // Seven petals: visible different facade colors, curved outer walls and high
  // shell petals. No thin all-glass cylinder identical to the LAB.
  const petalColors=[];
  for(let i=0;i<7;i++)petalColors.push(new THREE.MeshStandardMaterial({color:gradePalette[i],roughness:.52,metalness:.19}));
  const museumPetals=new THREE.Group();museumPetals.name='MUSEUM_SEVEN_RADIAL_PETAL_GALLERIES';museum.add(museumPetals);
  for(let i=0;i<7;i++){
    const grade=i+6;
    const theta=(i+.5)*Math.PI*2/7+.25;
    const wing=new THREE.Group();wing.name=`MUSEUM_GRADE_${i+6}_PETAL`;wing.rotation.y=theta;museumPetals.add(wing);
    // segment wall curving along museum perimeter (outside is local +Z)
    const arc=add(wing,new THREE.CylinderGeometry(29.7,29.7,13.2,16,1,true,-Math.PI/7,Math.PI*2/7),materials.museumStone,0,8.0,0,'PETAL_ROUNDED_STONE_FACADE');
    // Colored glass panel standing on the perimeter with clear marble edges.
    block(wing,15.4,8.2,.40,0,8.4,29.84,materials.museumGlass,'PETAL_FACADE_WINDOW');
    block(wing,16.0,.62,.75,0,12.76,30.3,petalColors[i]);
    block(wing,16.0,.34,.75,0,4.10,30.3,materials.metal);
    // Arcaded museum perimeter: visitor-scale openings and accent lighting.
    const archTrim=[];
    for(let k=0;k<=16;k++){
      const xx=-8.1+16.2*k/16;
      const archHeight=11.2+2.9*Math.sqrt(Math.max(0,1-(xx/8.1)**2));
      archTrim.push([xx,archHeight,30.64]);
    }
    tube(wing,archTrim,materials.paleMetal,.14,'MUSEUM_GALLERY_ARCH_PROFILE');
    for(const xx of [-7.8,7.8])block(wing,.78,8.3,.75,xx,8.3,30.61,materials.museumStone,'MUSEUM_MASSIVE_SIDE_PIER');
    block(wing,15.8,.18,.65,0,4.31,30.60,materials.goldGlow,'MUSEUM_SOFT_COVE_LIGHT');

    const roof=add(wing,new THREE.SphereGeometry(16.0,26,14,0,Math.PI,0,Math.PI/2),
      materials.museumStone,0,16.2,17.9,'PETAL_VAULT_ROOF');
    roof.scale.set(1,.47,.64);roof.rotation.y=Math.PI/2;
    tube(wing,[[-11,17.1,14],[0,24.0,17.9],[11,17.1,14]],materials.metal,.19,'PETAL_ROOF_CROWN');
    label(wing,`TOAN ${grade} - ${Number(catalogCounts?.[grade]??0)} ANH`,0,13.75,30.62,13.5,1.32,'#ecc58f');
    // The colored soffit is tangible architecture, not UI overlay.
    block(wing,7.2,.20,8.4,0,16.45,22.0,petalColors[i]);
  }
  // Center skylight creates recognizable museum silhouette independent of LAB.
  const crown=add(museum,new THREE.SphereGeometry(15.2,36,15,0,Math.PI*2,0,Math.PI/2),
    materials.museumGlass,0,18.2,0,'MUSEUM_PETAL_GLASS_OCULUS');
  crown.scale.y=.71;
  annulus(museum,15.1,18.5,.26,materials.metal,'MUSEUM_OCULUS_GOLD_FRAME');
  for(const r of [16.6,22.4])annulus(museum,r,16.1+(r===16.6?2.2:-.5),.15,materials.paleMetal,'MUSEUM_PETAL_RING_CORNICE');

  // Physical entrance aligned with original click / keyboard transition contract.
  const museumDoor=new THREE.Group();museumDoor.name='MUSEUM_CRYSTAL_FRONT_ENTRANCE';museumDoor.position.set(0,0,30.5);museum.add(museumDoor);
  block(museumDoor,28,.65,8.8,0,.47,.7,materials.museumStone,'MUSEUM_ACCESSIBLE_ENTRANCE');
  const wall=block(museumDoor,28.7,16.2,2.15,0,9,-.8,materials.museumStone,'MUSEUM_ENTRANCE_STONE_ARCH');
  block(museumDoor,20.1,12.2,.66,0,7.9,.4,materials.museum,'MUSEUM_DOOR_PORTAL_FRAME');
  const museHit=block(museumDoor,19.8,11.7,.21,0,7.9,1.12,materials.museumGlass,'MUSEUM_ENTRANCE_INTERACTION');
  museHit.userData.grandTarget='gallery';clickable.push(museHit);
  for(const x of [-12.5,12.5]){
    column(museumDoor,1.01,16.0,x,8,.8,materials.museumStone,'MUSEUM_STONE_PORTAL_PILLAR');
    column(museumDoor,1.17,.45,x,16.24,.8,materials.metal);
  }
  const welcomeArc=[];
  for(let i=0;i<=18;i++){
    const x=-12.5+i*25/18;
    welcomeArc.push([x,17.1+4.8*Math.sqrt(Math.max(0,1-(x/12.5)**2)),1.4]);
  }
  tube(museumDoor,welcomeArc,materials.metal,.30,'MUSEUM_GRAND_STONE_ARCH_CURVE');
  label(museumDoor,'INFOGRAPHIC MUSEUM',0,21.65,2.20,26.9,2.20,'#f5d8a9','gallery');
  label(museumDoor,'7 PHONG - 230 INFOGRAPHIC',0,18.6,2.4,23.5,1.2,'#ead0ff','gallery');
  // Compatibility identifier needed by original V6 smoke check. This is NOT
  // the former opaque globe: here it is a small inner oculus only.
  const innerDome=add(museum,new THREE.SphereGeometry(14.3,24,9,0,Math.PI*2,0,Math.PI/2),materials.museumGlass,
    0,18.2,0,'RIGHT_SIDE_CRYSTAL_MUSEUM_DOME');innerDome.scale.y=.63;
  // Tháp Đỉnh Pha Lê Tím Hoàng Gia & Vòng Nhật Nguyệt Vàng 24K trên đỉnh Bảo Tàng
  const museumCrown=new THREE.Group();museumCrown.position.set(0,30.2,0);museum.add(museumCrown);
  const museumGem=add(museumCrown,new THREE.OctahedronGeometry(2.35,0),materials.violetGlow,0,0,0,'MUSEUM_ROYAL_AMETHYST_GEM');
  for(const [rx,ry,rz] of [[.35,0,0],[0,.55,.35],[.85,.25,-.4]]){
    const mRing=add(museumCrown,new THREE.TorusGeometry(3.85,.14,10,64),materials.goldBright);
    mRing.rotation.set(rx,ry,rz);
  }
  for(const r of [35.5,41.5])annulus(museum,r,.12,.22,materials.goldBright,'MUSEUM_FORECOURT_GOLD_INLAY');
  // ---- Reception: Quầy Lễ Tân Hoàng Gia Mở (Không có mái hộp đen che khuất tầm nhìn trong vòm) ----
  const reception=new THREE.Group();reception.name='CENTRAL_RECEPTION_PAVILION';
  reception.position.set(0,0,-11);group.add(reception);
  disk(reception,9.4,.18,0,0,materials.stone,'RECEPTION_ROUND_COURT');
  annulus(reception,9.5,.28,.16,materials.goldBright,'RECEPTION_ROUND_COURT_INLAY');
  // Quầy Đá Sapphire Xanh Đen & Mặt Đá Cẩm Thạch Kem Viền Vàng 24K Tương Phản Cao
  block(reception,13.6,1.36,3.2,0,.78,-.35,materials.dark,'NPC_GREETING_AND_INFORMATION_DESK');
  block(reception,14.2,.22,3.6,0,1.56,-.35,materials.stone,'RECEPTION_COUNTERTOP');
  block(reception,14.4,.08,3.7,0,1.68,-.35,materials.goldBright,'RECEPTION_GOLD_EDGE');
  block(reception,12.2,.82,.18,0,.86,1.32,materials.onyx,'RECEPTION_NAVY_FRONTPANEL');
  label(reception,'TRUNG TÂM TIẾP ĐÓN HỌC SINH & GIÁO VIÊN',0,.92,1.46,11.6,.72,'#fbd493','guide');

  const npc=createAvatar('an');npc.root.name='NPC_HUONG_DAN_R75_AVATAR';
  npc.root.position.set(0,1.36,-12.6);npc.root.rotation.y=0;
  npc.root.scale.setScalar(2.25);
  group.add(npc.root);
  const receptionistPlatform=block(reception,4.2,1.25,2.6,0,.64,-1.68,materials.dark,'NPC_RAISED_STAFF_PLATFORM');
  receptionistPlatform.visible=true;
  const uniform=new THREE.Group();uniform.name='NPC_RECEPTION_STAFF_UNIFORM';npc.root.add(uniform);
  block(uniform,.59,.54,.35,0,1.24,.09,materials.labDeep,'RECEPTION_BLAZER');
  for(const x of [-.13,.13])block(uniform,.20,.24,.04,x,1.35,.285,materials.stone,'RECEPTION_WHITE_LAPEL');
  block(uniform,.18,.10,.04,.16,1.34,.34,materials.goldGlow,'RECEPTION_STAFF_BADGE');
  const halo=add(reception,new THREE.TorusGeometry(2.1,.09,10,54),materials.goldBright,0,5.2,-1.55,'RECEPTION_GREETER_LIGHT_RING');
  halo.rotation.y=Math.PI/12;
  label(reception,'QUẦY LỄ TÂN · NHẤN E CHỌN 4 KHU',0,6.25,-.8,11.4,1.05,'#fde047','guide');
  const guideHit=block(reception,14.3,5.9,.15,0,3.6,2.2,
    new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}),
    'RECEPTION_GUIDE_TOUCH_TARGET');
  guideHit.userData.grandTarget='guide';clickable.push(guideHit);

  // ---- QUẢNG TRƯỜNG LA BÀN ĐỐI XỨNG & ĐÀI PHUN NƯỚC VÔ CỰC (0, 0, +8) ----
  const plaza=new THREE.Group();plaza.name='NEW_CENTRAL_GRAND_PLAZA';plaza.position.set(0,0,8);group.add(plaza);
  disk(plaza,9.8,.05,0,0,materials.onyx,'WELCOME_ROTUNDA_FLOOR');
  for(const r of [5.8,9.8])annulus(plaza,r,.10,.16,materials.goldBright);

  // Ngôi Sao La Bàn 8 Cánh Vàng 24K Nổi Bật Trên Nền Đá Sapphire Đen
  disk(plaza,4.2,.12,0,0,materials.dark,'BIPOLAR_CENTRAL_ONYX_MEDALLION');
  const compass=add(plaza,new THREE.RingGeometry(1.9,2.25,48),materials.goldBright,0,.17,0,'CAMPUS_DIRECTION_ROSE');
  compass.rotation.x=-Math.PI/2;
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    const rayLen=i%2===0?4.2:2.8;
    const ray=add(plaza,new THREE.ConeGeometry(i%2===0?.30:.18,rayLen,4),materials.goldBright,0,.16,0);
    ray.rotation.x=Math.PI/2;ray.rotation.z=-a;
    ray.position.set(Math.sin(a)*rayLen/2,.16,-Math.cos(a)*rayLen/2);
  }

  // ---- HÀNG CỘT ĐÁ CẨM THẠCH CORINTHIAN 16 TRỤ & VÀNH ĐẠI SẢNH TÍCH HỢP 4 CỔNG HƯỚNG CHỮ THẬP (R = 26m) ----
  // Tuyệt đối không đặt cổng rời hay totem chắn giữa đường cầu để sảnh gọn đẹp, thông thoáng và sang trọng!
  const peristyle=new THREE.Group();peristyle.name='GRAND_DOME_ROYAL_COLONNADE';group.add(peristyle);
  // 16 trụ chia làm 4 cụm góc đối xứng, chừa 4 lối đi rộng 12m tại Bắc (0°), Đông (90°), Nam (180°), Tây (270°)
  const colAngles=[20,36,54,70, 110,126,144,160, 200,216,234,250, 290,306,324,340];
  for(const deg of colAngles){
    const ang=(deg*Math.PI)/180;
    const cx=Math.sin(ang)*26.0,cz=Math.cos(ang)*26.0;
    // Bệ cột đá Sapphire & Vàng
    block(peristyle,1.95,.55,1.95,cx,.28,cz,materials.dark,'GRAND_DOME_COLUMN_PLINTH');
    column(peristyle,.95,.26,cx,.68,cz,materials.goldBright);
    // Thân cột đá cẩm thạch trắng kem
    column(peristyle,.76,10.2,cx,5.8,cz,materials.stone,'GRAND_DOME_PERISTYLE_COLUMN');
    // Đầu cột Corinthian mạ vàng 24K
    column(peristyle,.98,.48,cx,11.05,cz,materials.goldBright);
    block(peristyle,1.85,.32,1.85,cx,11.42,cz,materials.stoneSide);
  }
  // 4 CỬA TRẮNG CHẮN 4 GÓC CHÉO KHÔNG ĐI QUA ĐƯỢC (Chừa trống hoàn toàn 4 Cổng Chính Bắc - Nam - Đông - Tây)
  const whiteDoorMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xf8fafc,emissiveIntensity:0.28,roughness:0.18,metalness:0.08,side:THREE.DoubleSide});
  const whiteFrameMat=new THREE.MeshStandardMaterial({color:0xe2e8f0,emissive:0xffffff,emissiveIntensity:0.18,roughness:0.22,metalness:0.15});
  const sectorPairs=[
    [20,36],[36,54],[54,70],
    [110,126],[126,144],[144,160],
    [200,216],[216,234],[234,250],
    [290,306],[306,324],[324,340]
  ];
  for(const [d1,d2] of sectorPairs){
    const a1=(d1*Math.PI)/180,a2=(d2*Math.PI)/180,amid=(a1+a2)/2;
    const x1=Math.sin(a1)*25.85,z1=Math.cos(a1)*25.85;
    const x2=Math.sin(a2)*25.85,z2=Math.cos(a2)*25.85;
    const mx=(x1+x2)/2,mz=(z1+z2)/2;
    const span=Math.hypot(x2-x1,z2-z1);
    const doorGroup=new THREE.Group();
    doorGroup.name=`GRAND_DOME_WHITE_BARRIER_DOOR_${d1}_${d2}`;
    doorGroup.position.set(mx,0,mz);
    doorGroup.rotation.y=amid;
    // Bệ ngưỡng cửa trắng
    block(doorGroup,span,.48,.52,0,.24,0,whiteFrameMat,'WHITE_DOOR_SILL');
    // Cánh cửa đôi màu trắng sáng cao 5.2m
    block(doorGroup,span-0.35,5.1,.26,0,2.82,0,whiteDoorMat,'WHITE_DOOR_PANEL');
    // Khung chỉ phào trắng & tay nắm vàng ở giữa cánh cửa đôi
    block(doorGroup,.14,5.15,.34,0,2.82,0,materials.goldBright,'WHITE_DOOR_CENTER_STILE');
    block(doorGroup,span,0.28,.44,0,5.45,0,materials.goldBright,'WHITE_DOOR_TOP_LINTEL');
    block(doorGroup,span*0.42,1.9,.32,-span*0.24,3.6,0,whiteFrameMat);
    block(doorGroup,span*0.42,1.9,.32,span*0.24,3.6,0,whiteFrameMat);
    block(doorGroup,span*0.42,1.6,.32,-span*0.24,1.5,0,whiteFrameMat);
    block(doorGroup,span*0.42,1.6,.32,span*0.24,1.5,0,whiteFrameMat);
    // Biển báo ở ô cửa trung tâm của mỗi góc chéo (36-54, 126-144, 216-234, 306-324)
    if(d1===36||d1===126||d1===216||d1===306){
      label(doorGroup,'⛔ CỬA TRẮNG ĐÓNG · ĐI THEO 4 CỔNG CHÍNH',0,3.15,-0.25,5.6,.78,'#ffffff',null,Math.PI);
    }
    peristyle.add(doorGroup);
  }
  // Vành Dầm Entablature Đá Sapphire Xanh Đen & Phào Chỉ Vàng 24K Đỡ Chân Vòm (y = 11.6m -> 12.8m)
  const drumRing=add(peristyle,new THREE.CylinderGeometry(26.3,26.3,1.25,72,1,true),materials.dark,0,12.15,0,'GRAND_DOME_ENTABLATURE_DRUM');
  drumRing.material.side=THREE.DoubleSide;
  annulus(peristyle,26.35,11.55,.32,materials.goldBright,'GRAND_DOME_PERISTYLE_RING_BEAM');
  annulus(peristyle,26.35,12.82,.36,materials.goldBright,'GRAND_DOME_UPPER_CORNICE_RING');

  // 4 Bảng Trán Cổng Hoàng Gia (Integrated Portico Signboards) gắn gọn ngay trên Vành Đại Sảnh tại 4 hướng Bắc - Nam - Tây - Đông
  label(peristyle,'HƯỚNG NAM · WONDER PARK 3D (11 TRÒ CHƠI)',0,12.18,26.65,15.2,1.22,'#fde047','gamepark',0);
  label(peristyle,'HƯỚNG BẮC · KHU DISCOVERY 3D (UNESCO & ẢNH THẬT)',0,12.18,-26.65,15.8,1.22,'#7dd3fc','discovery',Math.PI);
  label(peristyle,'HƯỚNG TÂY · MATHVERSE LAB (310 MÔ HÌNH SGK)',-26.65,12.18,0,15.6,1.22,'#38bdf8','r75',-Math.PI/2);
  label(peristyle,'HƯỚNG ĐÔNG · BẢO TÀNG INFOGRAPHIC (230 TRANH)',26.65,12.18,0,15.6,1.22,'#f0abfc','gallery',Math.PI/2);

  // V14: ĐÀI PHUN NƯỚC VÔ CỰC MÖBIUS BẰNG ĐÁ CẨM THẠCH & VÀNG 24K (Tại tâm quảng trường 0, 0, +8)
  const fountain=new THREE.Group();fountain.name='CAMPUS_INFINITY_MOBIUS_FOUNTAIN';fountain.position.set(0,0,0);plaza.add(fountain);
  add(fountain,new THREE.CylinderGeometry(3.55,3.8,.76,48),materials.stone,0,.38,0,'INFINITY_FOUNTAIN_BASIN');
  annulus(fountain,3.65,.78,.14,materials.dark,'INFINITY_FOUNTAIN_BASIN_RIM');
  annulus(fountain,3.72,.84,.06,materials.goldBright,'INFINITY_FOUNTAIN_GOLD_RIM');
  add(fountain,new THREE.CylinderGeometry(3.4,3.4,.08,36),materials.water,0,.69,0,'INFINITY_FOUNTAIN_WATER_SURFACE');
  add(fountain,new THREE.CylinderGeometry(1.35,1.55,.55,24),materials.dark,0,.92,0);
  add(fountain,new THREE.CylinderGeometry(.95,1.15,.45,24),materials.goldBright,0,1.38,0);

  const mobiusCurve=[];
  for(let i=0;i<=72;i++){
    const t=i*2*Math.PI/72;
    const scale=1.55/(1+Math.sin(t)**2);
    const x=scale*Math.cos(t);
    const z=scale*Math.sin(t)*Math.cos(t);
    const y=0.32*Math.sin(2*t);
    mobiusCurve.push(new THREE.Vector3(x,y,z));
  }
  const mobiusGeo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(mobiusCurve,true),84,.105,10,true);
  const mobiusSculpture=add(fountain,mobiusGeo,materials.goldBright,0,2.45,0,'INFINITY_MOBIUS_SCULPTURE');
  const coreGem=add(fountain,new THREE.OctahedronGeometry(.44,0),materials.goldGlow,0,2.45,0,'FOUNTAIN_CORE_CRYSTAL');

  for(let i=0;i<8;i++){
    const a=i*2*Math.PI/8;
    const jetPts=[];
    for(let k=0;k<=10;k++){
      const u=k/10;
      const r=3.2-u*2.1;
      const hy=.72+1.1*Math.sin(u*Math.PI);
      jetPts.push([r*Math.sin(a),hy,r*Math.cos(a)]);
    }
    tube(fountain,jetPts,materials.labGlass,.032,`FOUNTAIN_WATER_JET_${i}`);
  }

  // Điểm tương tác ẩn tại đầu Cầu Bắc (0, 0, -78) để giữ nguyên hợp đồng điều hướng vào Discovery
  const northDiscHit=block(group,14,8,.5,0,4,-78,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),'NORTH_DISCOVERY_INTERACTION');
  northDiscHit.userData.grandTarget='discovery';clickable.push(northDiscHit);

  // Cây xanh cảnh quan đối xứng trên vành cỏ ngoài của 5 đảo (Không che chắn mặt tiền kiến trúc)
  const trees=[
    [-34,-28],[34,-28],[-34,28],[34,28],
    [-112,-44],[-164,-44],[-112,44],[-164,44],
    [112,-44],[164,-44],[112,44],[164,44]
  ];
  const trunks=[],crowns=[],beds=[];
  for(const [x,z] of trees){
    beds.push([x,.35,z]);trunks.push([x,2.4,z]);crowns.push([x,6.2,z]);
  }
  instanced(group,new THREE.CylinderGeometry(2.4,2.6,.65,16),materials.stoneSide,beds,'CAMPUS_PLANTER_INSTANCES');
  instanced(group,new THREE.CylinderGeometry(.25,.39,3.8,10),materials.bark,trunks,'CAMPUS_TREE_TRUNKS');
  instanced(group,new THREE.IcosahedronGeometry(2.7,1),materials.green,crowns,'CAMPUS_TREE_CROWNS');

  // Đèn lồng Hoàng Gia dọc theo quảng trường và đầu cầu
  for(const [lx,lz] of [[-19,21],[19,21],[-19,-21],[19,-21],[-32,-6],[32,-6],[-32,6],[32,6]]){
    column(group,.18,4.6,lx,2.3,lz,materials.dark,'CAMPUS_HERITAGE_LANTERN_POST');
    block(group,.75,.22,.75,lx,.12,lz,materials.goldBright);
    block(group,.58,.16,.58,lx,4.62,lz,materials.goldBright);
    const head=add(group,new THREE.OctahedronGeometry(.38,0),materials.goldGlow,lx,4.95,lz,'LANTERN_WARM_GLOW');
    head.scale.set(1,1.4,1);
    add(group,new THREE.ConeGeometry(.52,.34,4),materials.goldBright,lx,5.38,lz);
  }

  // Global directional + hemisphere lighting handles campus illumination without per-pixel PointLight shader overhead
  let elapsed=0;
  function update(dt){
    elapsed+=dt;science.rotation.y+=dt*.12;atom.rotation.z+=dt*.06;
    museumCrown.rotation.y-=dt*.15;museumGem.rotation.y+=dt*.35;
    mobiusSculpture.rotation.y+=dt*.24;
    coreGem.rotation.y+=dt*.42;
    npc.updateAnimation(dt,0,0,0);
  }
  function getTarget(player){
    for(const [target,key] of [['guide','guide'],['r75','lab'],['gallery','museum'],['discovery','discovery']]){
      const p=GRAND_DOME_LAYOUT[key];
      if(p&&Math.hypot(player.x-p.x,player.z-p.z)<p.triggerRadius)return target;
    }
    return null;
  }
  return {group,clickable,npc,update,getTarget,clampPosition:clampToGrandDome,layout:GRAND_DOME_LAYOUT};
}
