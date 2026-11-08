/**
 * Crystal Infinity architectural layer (V4). Only new Museum source.
 * Does not modify or import the R75 business logic / interactive laboratories.
 * Designed for the vendored Three.js already shipped with MATHVERSE R75.
 */
import * as THREE from '/vendor/three.module.js';
import {HUB_RADIUS,FAR_RADIUS,GATE_HALF_WIDTH,RETURN_PORTAL,CLASSIFICATION_PODIUM,roomWorld} from './layout-plan.mjs';

function material(g,properties,physical=false){
  const props={...properties};
  delete props.transmission;
  delete props.clearcoat;
  delete props.clearcoatRoughness;
  const m=new THREE.MeshStandardMaterial(props);
  g.extraMaterials.push(m);return m;
}
function object(g,parent,geometry,mat,position,rotation){
  g.extraGeometries.push(geometry);
  const m=new THREE.Mesh(geometry,mat);
  if(position)m.position.set(...position);
  if(rotation)m.rotation.set(...rotation);
  parent.add(m);return m;
}
function goldRing(g,parent,r,y,thickness=.075,mat=g.mat.gold){
  return object(g,parent,new THREE.TorusGeometry(r,thickness,8,128),mat,[0,y,0],[Math.PI/2,0,0]);
}
function rod(g,parent,begin,end,mat,radius=.035){
  const a=new THREE.Vector3(...begin),b=new THREE.Vector3(...end),v=b.clone().sub(a);
  const geo=new THREE.CylinderGeometry(radius,radius,v.length(),6,1);
  const mesh=object(g,parent,geo,mat,[(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2]);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return mesh;
}
function domeHeight(r){return 9.15+7.55*(1-(r/HUB_RADIUS)**2);}
function crystalDome(g,group){
  // V16: Unified Ceiling Vault System Group
  // Allows clean aerial/isometric view of the clean pastel floor without any overhead wires or rings
  // obstructing the view, while fully preserving the royal golden dome when walking on the ground!
  const ceilingVaultGroup=new THREE.Group();
  ceilingVaultGroup.name='CRYSTAL_ROTUNDA_CEILING_VAULT_SYSTEM';
  group.add(ceilingVaultGroup);
  g.ceilingVaultGroup=ceilingVaultGroup;

  const seg=72,rings=9,positions=[],colors=[],indices=[];
  const tones=[0xb4e8f2,0xd6f7f5,0x7dcbd5,0xf2ffff,0x9cdae9].map(c=>new THREE.Color(c));
  for(let row=0;row<=rings;row++){
    const r=5.4+(HUB_RADIUS-5.7)*row/rings;
    for(let i=0;i<=seg;i++){
      const a=2*Math.PI*i/seg;
      positions.push(Math.sin(a)*r,domeHeight(r),Math.cos(a)*r);
      const t=tones[(Math.floor(i/5)+row*3)%tones.length];
      colors.push(t.r,t.g,t.b);
    }
  }
  for(let row=0;row<rings;row++)for(let i=0;i<seg;i++){
    const a=row*(seg+1)+i,b=a+seg+1;
    if((row+i)%2){indices.push(a,b,a+1,b,b+1,a+1);}else{indices.push(a,b,b+1,a,b+1,a+1);}
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geo.setIndex(indices);geo.computeVertexNormals();
  const glass=material(g,{vertexColors:true,metalness:.05,roughness:.08,transmission:0,transparent:true,opacity:.27,depthWrite:false,side:THREE.DoubleSide},true);
  object(g,ceilingVaultGroup,geo,glass);

  // V15 & V16: CELESTIAL CEILING VAULT TRACERY & GOLDEN RIBS (Hoa văn trần vòm hoàng gia ngước nhìn lên)
  // 1. 8 Slender Radial Vault Ribs curving smoothly along dome vault.
  // V16 FIX: Max radius is safely capped at 32.0m (dome height 13.34m). Ribs NEVER dip down
  // to 10.7m near doorways (r=48) or NPCs (r=43.5). This permanently prevents any structural
  // tube from slicing through doorway signs ("TRIỂN LÃM TOÁN...") or NPC heads!
  const maxRibRadius=32.0;
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    const ribCurve=[];
    for(let k=0;k<=18;k++){
      const r=5.2+(maxRibRadius-5.2)*k/18;
      ribCurve.push(new THREE.Vector3(Math.sin(a)*r,domeHeight(r)+.06,-Math.cos(a)*r));
    }
    const ribGeo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ribCurve),36,.068,8,false);
    g.extraGeometries.push(ribGeo);
    const ribMesh=object(g,ceilingVaultGroup,ribGeo,g.mat.gold);
    ribMesh.name=`CRYSTAL_DOME_VAULT_RIB_${i}`;
  }
  // Architectural Vault Termination Cornice Ring at r=32.0m connecting all 8 ribs high overhead
  const termRingGeo=new THREE.TorusGeometry(maxRibRadius,.068,8,128);
  g.extraGeometries.push(termRingGeo);
  const termRing=object(g,ceilingVaultGroup,termRingGeo,g.mat.gold,[0,domeHeight(maxRibRadius)+.06,0],[Math.PI/2,0,0]);
  termRing.name='CRYSTAL_DOME_VAULT_TERMINATION_CORNICE';

  // 2. Concentric Golden Ceiling Tracery Rings following dome curve (y >= 13.5m)
  for(const r of [7.5,12.0,16.8,21.6,26.2]){
    const h=domeHeight(r)+.05;
    const ringGeo=new THREE.TorusGeometry(r,.058,8,128);
    g.extraGeometries.push(ringGeo);
    const ring=object(g,ceilingVaultGroup,ringGeo,g.mat.gold,[0,h,0],[Math.PI/2,0,0]);
    ring.name=`CRYSTAL_DOME_CEILING_RING_${Math.round(r)}`;
  }

  // 3. 8-Pointed Celestial Geometric Octagram Star Tracery overhead (y = 15.5m - 16.5m)
  const starGroup=new THREE.Group();starGroup.name='CRYSTAL_CELESTIAL_OCTAGRAM_STAR';ceilingVaultGroup.add(starGroup);
  for(let sq=0;sq<2;sq++){
    const angOff=sq*Math.PI/4;
    const pts=[];
    const starR=4.2;
    for(let k=0;k<=4;k++){
      const a=angOff+k*Math.PI/2;
      pts.push(new THREE.Vector3(Math.sin(a)*starR,domeHeight(starR)+.08,-Math.cos(a)*starR));
    }
    const sqGeo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.052,8,false);
    g.extraGeometries.push(sqGeo);
    object(g,starGroup,sqGeo,g.mat.brightGold);
  }

  // 4. Gothic Pointed Arcs connecting the 8 ceiling ribs at mid-radius
  for(let i=0;i<8;i++){
    const a1=i*Math.PI/4;
    const a2=(i+1)*Math.PI/4;
    const midR=15.5;
    const arcPts=[];
    for(let k=0;k<=12;k++){
      const t=k/12;
      const curA=a1+(a2-a1)*t;
      const peakLift=1.25*Math.sin(t*Math.PI);
      const r=midR-1.6*Math.sin(t*Math.PI);
      arcPts.push(new THREE.Vector3(Math.sin(curA)*r,domeHeight(r)+peakLift+.06,-Math.cos(curA)*r));
    }
    const arcGeo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arcPts),20,.048,6,false);
    g.extraGeometries.push(arcGeo);
    object(g,ceilingVaultGroup,arcGeo,g.mat.gold);
  }

  // 5. Soft Luminous Cove Light Rings overhead
  for(const r of [12.0,21.6]){
    const h=domeHeight(r)+.02;
    const coveGeo=new THREE.RingGeometry(r-.14,r+.14,64);
    g.extraGeometries.push(coveGeo);
    const coveMesh=object(g,ceilingVaultGroup,coveGeo,g.mat.brightGold,[0,h,0],[Math.PI/2,0,0]);
    coveMesh.name=`CEILING_COVE_LIGHT_RING_${Math.round(r)}`;
  }
}
function infinityChandelier(g,group){
  const spin=new THREE.Group();spin.name='CRYSTAL_INFINITY_SCULPTURE';spin.position.y=7.3;group.add(spin);
  const curve=[];
  for(let i=0;i<=96;i++){
    const t=2*Math.PI*i/96;
    // Lemniscate: mathematically recognizable infinity symbol.
    const k=1.0/(1+Math.sin(t)**2);
    curve.push(new THREE.Vector3(4.5*Math.cos(t)*k,0,4.5*Math.sin(t)*Math.cos(t)*k));
  }
  object(g,spin,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curve),108,.115,9,false),g.mat.gold);
  const innerGlass=material(g,{color:0x7bdce6,metalness:.14,roughness:.08,transparent:true,opacity:.55,depthWrite:false},true);
  const facets=object(g,spin,new THREE.IcosahedronGeometry(1.7,0),innerGlass,[0,.5,0]);
  const wire=new THREE.LineSegments(new THREE.EdgesGeometry(facets.geometry),new THREE.LineBasicMaterial({color:0xffe1a8,transparent:true,opacity:.92}));
  g.extraGeometries.push(wire.geometry);g.extraMaterials.push(wire.material);wire.position.copy(facets.position);spin.add(wire);
  // V13: Rainbow Prism Mega-Chandelier Pendants in 7 grade spectrum colors
  const rainbowColors=[0x0d9488,0x2563eb,0xd97706,0xe11d48,0x7c3aed,0x059669,0xb59342];
  for(let i=0;i<7;i++){
    const ang=i*2*Math.PI/7,pr=4.2;
    const px=Math.sin(ang)*pr,pz=Math.cos(ang)*pr;
    const pMat=material(g,{color:rainbowColors[i],roughness:.06,metalness:.22,transparent:true,opacity:.82},true);
    rod(g,group,[px,8.8,pz],[px,7.35,pz],g.mat.gold,.018);
    const prism=object(g,group,new THREE.OctahedronGeometry(.36,0),pMat,[px,7.15,pz]);
    prism.scale.set(1.1,2.3,1.1);
    prism.name=`RAINBOW_CHANDELIER_PRISM_${i}`;
  }
  g.crystalSpinner=spin;
}
function makeRadialSectorGeometry(rInner,rOuter,startAngle,endAngle,radialSegments=16,ringSegments=6){
  const positions=[],uvs=[],indices=[];
  for(let j=0;j<=ringSegments;j++){
    const r=rInner+(rOuter-rInner)*(j/ringSegments);
    for(let i=0;i<=radialSegments;i++){
      const a=startAngle+(endAngle-startAngle)*(i/radialSegments);
      positions.push(r*Math.sin(a),0,-r*Math.cos(a));
      uvs.push(i/radialSegments,j/ringSegments);
    }
  }
  for(let j=0;j<ringSegments;j++){
    for(let i=0;i<radialSegments;i++){
      const p1=j*(radialSegments+1)+i;
      const p2=p1+radialSegments+1;
      const p3=p2+1;
      const p4=p1+1;
      indices.push(p1,p4,p2);
      indices.push(p4,p3,p2);
    }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geo.setIndex(indices);geo.computeVertexNormals();
  return geo;
}
const GRADE_MEDALLIONS={
  6:{title:'LỚP 6',formula:'ℕ · ℤ · %',sub:'SỐ HỌC & TRỰC QUAN'},
  7:{title:'LỚP 7',formula:'ℚ · △ · ∥',sub:'SỐ HỮU TỈ & TAM GIÁC'},
  8:{title:'LỚP 8',formula:'a²+b² · ▱',sub:'HẰNG ĐẲNG THỨC & TỨ GIÁC'},
  9:{title:'LỚP 9',formula:'√x · ◯ · f(x)',sub:'CĂN THỨC & ĐƯỜNG TRÒN'},
  10:{title:'LỚP 10',formula:'v⃗ · ∈ · ∪',sub:'VECTƠ & MỆNH ĐỀ'},
  11:{title:'LỚP 11',formula:'sin · cos · lim',sub:'LƯỢNG GIÁC & GIẢI TÍCH'},
  12:{title:'LỚP 12',formula:'∫ · Oxyz · eˣ',sub:'TÍCH PHÂN & KHÔNG GIAN'}
};
function floorRosette(g,group,plan){
  // Central white stone ring & dark polished onyx plinth
  object(g,group,new THREE.CylinderGeometry(5.2,5.2,.24,72),g.mat.whiteStone,[0,-.01,0]);
  const onyxMat=material(g,{color:0x091522,roughness:.14,metalness:.42});
  object(g,group,new THREE.CylinderGeometry(5.0,5.0,.14,72),onyxMat,[0,.12,0]);

  // V13 & V14: CLEAN LUXURY MARBLE SECTOR WHEEL (Sàn cẩm thạch hoàn toàn phẳng mịn, sạch bóng)
  if(plan){
    const halfStepDeg=49.5/2; // 24.75 deg
    const rInner=5.25;
    const rOuter=HUB_RADIUS-.45;

    for(const p of plan){
      const aStart=(p.angleDeg-halfStepDeg)*Math.PI/180;
      const aEnd=(p.angleDeg+halfStepDeg)*Math.PI/180;

      // Grade radial marble floor sector - vibrant royal color with golden inlay border
      const sectorGeo=makeRadialSectorGeometry(rInner,rOuter,aStart,aEnd,24,10);
      g.extraGeometries.push(sectorGeo);
      const sectorCol=new THREE.Color(p.style.accent);
      sectorCol.lerp(new THREE.Color(0xffffff),.16);
      const sectorMat=material(g,{
        color:sectorCol,
        emissive:new THREE.Color(p.style.accent),
        emissiveIntensity:.08,
        roughness:.16,
        metalness:.26,
        side:THREE.DoubleSide
      });
      const sectorMesh=new THREE.Mesh(sectorGeo,sectorMat);
      sectorMesh.position.y=.022;
      sectorMesh.name=`SECTOR_FLOOR_GRADE_${p.grade}`;
      group.add(sectorMesh);
      // Radial golden border ray separating each grade sector
      rod(g,group,[Math.sin(aStart)*rInner,.04,-Math.cos(aStart)*rInner],[Math.sin(aStart)*rOuter,.04,-Math.cos(aStart)*rOuter],g.mat.gold,.065);
    }
    goldRing(g,group,5.28,.045,.095);
    goldRing(g,group,24.5,.042,.08);
    goldRing(g,group,rOuter,.045,.11);

    // Sector for Return / Southern Entrance Gate
    const southStart=(148+halfStepDeg)*Math.PI/180;
    const southEnd=(-148-halfStepDeg)*Math.PI/180+Math.PI*2;
    const southGeo=makeRadialSectorGeometry(rInner,rOuter,southStart,southEnd,16,8);
    g.extraGeometries.push(southGeo);
    const southMat=material(g,{
      color:0x0c2538,
      roughness:.18,
      metalness:.28,
      side:THREE.DoubleSide
    });
    const southMesh=new THREE.Mesh(southGeo,southMat);
    southMesh.position.y=.022;
    southMesh.name='SECTOR_FLOOR_RETURN_GATE';
    group.add(southMesh);
  }
  g.label(group,'CRYSTAL INFINITY MUSEUM',12.5,.8,'#d9bd81',0,8.0,20,Math.PI);
}
function portalFacade(g,group,p){
  // V8: genuinely wider doorway; do not cover the passage with opaque meshes.
  const door=new THREE.Group();door.name=`CRYSTAL_PORTAL_GRADE_${p.grade}`;
  door.position.set(p.portal.x,0,p.portal.z);door.rotation.y=-p.theta;group.add(door);
  const gradeMat=g.makeAccent(p.grade),gold=g.mat.gold;
  const jamb=GATE_HALF_WIDTH+.52;
  for(const side of [-1,1]){
    g.box(door,.82,7.7,.94,side*jamb,3.85,0,g.mat.whiteStone);
    g.box(door,1.05,.28,1.14,side*jamb,.16,.03,gold);
    g.box(door,1.08,.26,1.14,side*jamb,7.66,.03,gold);
    g.box(door,.22,7.1,.21,side*(jamb-.29),3.73,.42,g.mat.crystal);
    g.box(door,.12,7.0,.34,side*(jamb-.49),3.76,.25,gradeMat);
  }
  g.box(door,GATE_HALF_WIDTH*2+1.94,.31,.86,0,7.82,.02,gold);
  const arch=[];
  for(let i=0;i<=28;i++){
    const x=-GATE_HALF_WIDTH+2*GATE_HALF_WIDTH*i/28;
    const height=7.82+1.20*Math.sqrt(Math.max(0,1-(x/GATE_HALF_WIDTH)**2));
    arch.push(new THREE.Vector3(x,height,.2));
  }
  object(g,door,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arch),42,.11,8,false),gold);
  // V12: Perfectly sized portal sign fitting the clear opening without side-clipping
  const sign=g.label(door,`TRIỂN LÃM TOÁN ${p.grade} · ${p.lessons.length} BÀI`,11.8,.86,p.style.hex,0,8.65,.55);
  sign.userData.grade=p.grade;g.doorTargets.push(sign);
  // Glowing Grade Badge atop the arch
  const bCanvas=document.createElement('canvas');bCanvas.width=256;bCanvas.height=256;
  const bctx=bCanvas.getContext('2d');
  bctx.fillStyle='#091c2b';bctx.beginPath();bctx.arc(128,128,122,0,Math.PI*2);bctx.fill();
  bctx.strokeStyle=p.style.hex;bctx.lineWidth=14;bctx.stroke();
  bctx.strokeStyle='#f5d488';bctx.lineWidth=4;bctx.stroke();
  bctx.fillStyle='#ffffff';bctx.font='bold 112px Segoe UI,sans-serif';bctx.textAlign='center';bctx.textBaseline='middle';
  bctx.fillText(`L${p.grade}`,128,130);
  const bTex=new THREE.CanvasTexture(bCanvas);bTex.colorSpace=THREE.SRGBColorSpace;g.textures.push(bTex);
  const bMat=new THREE.MeshBasicMaterial({map:bTex,toneMapped:false,side:THREE.FrontSide});g.extraMaterials.push(bMat);
  const badgeMesh=new THREE.Mesh(new THREE.PlaneGeometry(1.45,1.45),bMat);
  const badgeBack=new THREE.Mesh(badgeMesh.geometry,bMat);badgeBack.rotation.y=Math.PI;badgeBack.position.z=-0.02;badgeMesh.add(badgeBack);
  badgeMesh.position.set(0,9.45,.56);door.add(badgeMesh);
  // Rich carpet runner at the doorway connects seamlessly into the room
  const floor=g.box(door,3.4,.045,2.6,0,.05,1.3,gradeMat);
  floor.userData.grade=p.grade;g.doorTargets.push(floor);
  return door;
}
/** ONE physical central catalog plinth, with a single interactive 7-class display. */
function buildClassificationPodium(g,parent,plan){
  const station=new THREE.Group();station.name='INFOGRAPHIC_CLASSIFICATION_PODIUM_6_TO_12';
  station.position.set(CLASSIFICATION_PODIUM.x,0,CLASSIFICATION_PODIUM.z);parent.add(station);
  const total=plan.reduce((n,r)=>n+r.lessons.length,0);
  object(g,station,new THREE.CylinderGeometry(6.25,6.45,.6,72),g.mat.whiteStone,[0,.32,0]);
  object(g,station,new THREE.CylinderGeometry(6.3,6.3,.12,72),g.mat.trim,[0,.69,0]);
  object(g,station,new THREE.TorusGeometry(6.35,.10,9,72),g.mat.brightGold,[0,.78,0],[Math.PI/2,0,0]);
  object(g,station,new THREE.CylinderGeometry(3.5,3.9,1.55,48),g.mat.whiteStone,[0,1.55,0]);
  object(g,station,new THREE.CylinderGeometry(3.58,3.58,.18,48),g.mat.gold,[0,2.34,0]);
  const screenMaterial=material(g,{color:0x123d55,metalness:.36,roughness:.15,emissive:0x0b5367,emissiveIntensity:.35});
  const base=g.box(station,8.5,3.0,.36,0,2.95,4.7,screenMaterial);
  base.name='CENTRAL_ONE_CATALOG_TOUCHSCREEN';base.userData.catalogAll=true;g.classificationTargets.push(base);
  const title=g.label(station,`KHO TRA CỨU ${total} INFOGRAPHIC`,8.25,.80,'#f6d999',0,3.68,4.97);
  title.userData.catalogAll=true;g.classificationTargets.push(title);
  const tabs=g.label(station,'LỚP 6  •  7  •  8  •  9  •  10  •  11  •  12',8.25,.79,'#4bdce5',0,2.72,4.98);
  tabs.userData.catalogAll=true;g.classificationTargets.push(tabs);
  const guide=g.label(station,'NHẤN E / BẤM ĐỂ MỞ KHO BÀI HỌC',8.0,.43,'#f6d999',0,1.98,4.98);
  guide.userData.catalogAll=true;g.classificationTargets.push(guide);
  const titleBack=g.label(station,`KHO TRA CỨU ${total} INFOGRAPHIC`,8.25,.80,'#f6d999',0,3.68,4.43,Math.PI);
  titleBack.userData.catalogAll=true;g.classificationTargets.push(titleBack);
  const tabsBack=g.label(station,'LỚP 6  •  7  •  8  •  9  •  10  •  11  •  12',8.25,.79,'#4bdce5',0,2.72,4.42,Math.PI);
  tabsBack.userData.catalogAll=true;g.classificationTargets.push(tabsBack);
  const guideBack=g.label(station,'NHẤN E / BẤM ĐỂ MỞ KHO BÀI HỌC',8.0,.43,'#f6d999',0,1.98,4.42,Math.PI);
  guideBack.userData.catalogAll=true;g.classificationTargets.push(guideBack);
  // The single plinth is the only physical central teaching station.
  const crown=object(g,station,new THREE.OctahedronGeometry(.89,0),g.mat.crystal,[0,3.85,0]);
  crown.name='ONE_CATALOG_KIOSK_CRYSTAL_CROWN';
  return station;
}
/** A real, raycastable two-world lobby return GATE, not just a HUD button. */
function buildMainLobbyReturnGate(g,parent){
  const gate=new THREE.Group();gate.name='RETURN_GATE_TO_MAIN_LOBBY';
  gate.position.set(RETURN_PORTAL.x,0,RETURN_PORTAL.z);
  gate.rotation.y=Math.PI;parent.add(gate);
  const gold=g.mat.gold;
  for(const x of [-4.1,4.1]){
    g.box(gate,.84,7.6,1.0,x,3.83,0,g.mat.whiteStone);
    g.box(gate,.18,6.82,.17,x,3.55,.59,g.mat.crystal);
    g.box(gate,1.0,.21,1.12,x,7.56,.03,gold);
    g.box(gate,1.0,.23,1.12,x,.2,.03,gold);
  }
  g.box(gate,9.1,.32,1.05,0,7.66,0,gold);
  const arch=[];for(let k=0;k<=32;k++){
    const xx=-4.12+k*8.24/32;
    arch.push(new THREE.Vector3(xx,7.62+1.12*Math.sqrt(Math.max(0,1-(xx/4.12)**2)),.22));
  }
  object(g,gate,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arch),48,.14,8,false),gold);
  const paneMat=material(g,{color:0x5ce8e4,roughness:.1,metalness:.12,transparent:true,opacity:.16,side:THREE.DoubleSide,depthWrite:false},true);
  const pane=g.box(gate,7.25,5.86,.06,0,3.65,.18,paneMat);
  pane.name='RETURN_GATE_INTERACTIVE_SURFACE';pane.userData.returnToLobby=true;g.returnTargets.push(pane);
  const sign=g.label(gate,'VỀ SẢNH CHÍNH',8.1,.92,'#f4d697',0,8.33,.68);
  sign.userData.returnToLobby=true;g.returnTargets.push(sign);
  const base=g.box(gate,7.25,.035,3.0,0,.065,1.30,g.mat.brightGold);
  base.userData.returnToLobby=true;g.returnTargets.push(base);
  const caption=g.label(gate,'MATHVERSE R75  ⇄  MUSEUM',7.7,.49,'#7fd8d7',0,6.66,.68);
  caption.userData.returnToLobby=true;g.returnTargets.push(caption);
  return gate;
}
/** PBR and emissive accent architecture stays local to each grade wing. */
function decorateColorfulGrade(g,room){
  const {info,group,accent}=room;
  const corners=[];
  for(const r of [54,66,78,90,102,114]){
    for(const side of [-1,1]){
      const angle=info.theta+side*info.halfAngle;
      const loc=roomWorld(angle,r);
      corners.push(loc);
      g.box(group,.16,8.8,.16,loc.x,4.42,loc.z,accent);
      g.box(group,.7,.26,.70,loc.x,.18,loc.z,g.mat.gold);
      g.box(group,.55,.22,.55,loc.x,8.83,loc.z,g.mat.gold);
    }
  }
  const wallBands=material(g,{color:info.style.accent,roughness:.36,metalness:.46,emissive:info.style.accent,emissiveIntensity:.14});
  for(const side of [-1,1]){
    const a=roomWorld(info.theta+side*info.halfAngle,52);
    const b=roomWorld(info.theta+side*info.halfAngle,FAR_RADIUS-3);
    const len=Math.hypot(b.x-a.x,b.z-a.z);
    const rot=-Math.atan2(b.z-a.z,b.x-a.x);
    for(const y of [.65,8.45])g.box(group,len,.15,.24,(a.x+b.x)/2,y,(a.z+b.z)/2,wallBands,rot);
    const banner=g.box(group,len,1.15,.16,(a.x+b.x)/2,7.75,(a.z+b.z)/2,wallBands,rot);
    banner.name=`GRADE_${info.grade}_ACCENT_WALL_BANNER`;
  }
  // V8 architectural identity for each class: relief frieze, mathematical
  // emblems and colored ceiling coves, all ABOVE the infographic reading area.
  const dark=material(g,{color:info.style.accent,roughness:.26,metalness:.32,emissive:info.style.accent,emissiveIntensity:.09});
  const motifs=['Σ','π','x²','ƒ(x)','∠','∞','∫'];
  const motif=motifs[info.grade-6];
  for(const r of [64,90,112]){
    for(const side of [-1,1]){
      const wallAngle=info.theta+side*info.halfAngle;
      const v=roomWorld(wallAngle,r);
      const inward=side<0?1:-1;
      const nx=inward*Math.cos(wallAngle),nz=inward*Math.sin(wallAngle);
      const normalRot=Math.atan2(nx,nz);
      const relief=object(g,group,new THREE.TorusGeometry(.42,.055,7,24),dark,[v.x+nx*.40,7.88,v.z+nz*.40]);
      relief.rotation.y=normalRot;
    }
  }
  // Theme signage is decorative, NOT a substitute for the fixed numbered lesson labels.
  const feature=roomWorld(info.theta,FAR_RADIUS-2);
  g.label(group,`TOÁN ${info.grade}  ·  ${info.style.title}`,13.2,.62,info.style.hex,
    feature.x,8.17,feature.z,-info.theta);
  // Decorative suspended math objects sit beside the two outer aisles, not in front of posters or central sightlines.
  for(const [j,r] of [63,84,105].entries()){
    const side=j%2===0?-1:1;
    const pos=roomWorld(info.theta,r,side*8.2);
    const ornament=object(g,group,new THREE.TorusKnotGeometry(.52,.12,40,7,2,3),accent,[pos.x,7.92,pos.z]);
    ornament.name=`GRADE_${info.grade}_MATH_ORNAMENT_${j}`;
  }
}

// INFINITY V9: cinematic layered architectural accents; purely visual.
// All picture planes, routes, ports, data and clickable meshes remain V8 original.
function addInfinityAtriumIllumination(g,group){
  // The existing kiosk and seven grade portals stay completely unobstructed.
}
function addInfinityGradeIllumination(g,room){
  const {info,group}=room;
  const ceilingArcs=new THREE.Group();
  ceilingArcs.name=`GRADE_${info.grade}_CEILING_ARCS_GROUP`;
  group.add(ceilingArcs);
  room.ceilingArcs=ceilingArcs;

  const accent=material(g,{color:info.style.accent,metalness:.56,roughness:.25,
    emissive:info.style.accent,emissiveIntensity:.22});
  const pearl=material(g,{color:0xf4e3b8,metalness:.65,roughness:.24,emissive:0x766046,emissiveIntensity:.11});
  for(const r of [60,77,96,113]){
    const points=[];
    for(let i=0;i<=24;i++){
      const a=info.theta+(-.85+1.7*i/24)*info.halfAngle;
      const pos=roomWorld(a,r);points.push(new THREE.Vector3(pos.x,8.89,pos.z));
    }
    const mesh=object(g,ceilingArcs,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),32,.046,5,false),accent);
    mesh.name=`INFINITY_V9_GRADE_${info.grade}_CEILING_LIGHT_ARC`;
  }
  // Two far-side friezes are always above the infographic image region (>7.2m).
  for(const side of [-1,1]){
    const angle=info.theta+side*info.halfAngle;
    const steps=[];
    for(let i=0;i<=20;i++){
      const r=58+i*2.7,p=roomWorld(angle,r);
      steps.push(new THREE.Vector3(p.x,7.48+.20*Math.sin(i*.55),p.z));
    }
    object(g,ceilingArcs,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(steps),36,.038,5,false),pearl);
  }
}

function buildRotundaMathMurals(g,group,plan){
  const muralThemes=[
    {title:'XOẮN ỐC FIBONACCI',sub:'TỶ LỆ VÀNG φ = 1.618...',color:'#e8c76b',draw:'spiral'},
    {title:'TAM GIÁC PASCAL',sub:'HỆ SỐ NHỊ THỨC & TỔ HỢP',color:'#14b8a6',draw:'pascal'},
    {title:'ĐỊNH LÝ PYTHAGORE',sub:'a² + b² = c² · HÌNH HỌC PHẲNG',color:'#3b82f6',draw:'pythagoras'},
    {title:'ĐA DIỆN ĐỀU PLATON',sub:'5 KHỐI ĐA DIỆN KINH ĐIỂN',color:'#f59e0b',draw:'plato'},
    {title:'ĐƯỜNG TRÒN LƯỢNG GIÁC',sub:'sin²(x) + cos²(x) = 1',color:'#f43f5e',draw:'trig'},
    {title:'HÌNH HỌC FRACTAL',sub:'DẢI MOBIUS & VÔ CỰC ∞',color:'#8b5cf6',draw:'fractal'},
    {title:'VI TÍCH PHÂN CƠ BẢN',sub:'∫ f(x)dx · TÍCH PHÂN & ĐẠO HÀM',color:'#10b981',draw:'calculus'},
    {title:'TỌA ĐỘ OXYZ',sub:'KHÔNG GIAN HÌNH HỌC 3D',color:'#d9bb84',draw:'oxyz'}
  ];
  const portalAngles=[...plan.map(p=>p.theta),Math.PI].sort((a,b)=>a-b);
  const brass=material(g,{color:0xd9bb84,metalness:.75,roughness:.22});
  const warmGlow=new THREE.MeshBasicMaterial({color:0xffeaad,toneMapped:false});g.extraMaterials.push(warmGlow);
  const plantGreen=new THREE.MeshStandardMaterial({color:0x1f5c38,roughness:.65,metalness:.05});g.extraMaterials.push(plantGreen);
  const planterStone=material(g,{color:0x163448,metalness:.35,roughness:.3});

  for(let i=0;i<8;i++){
    let diff=portalAngles[(i+1)%8]-portalAngles[i];
    if(diff<0)diff+=2*Math.PI;
    const midAngle=portalAngles[i]+diff/2;
    const p=roomWorld(midAngle,HUB_RADIUS-.25);
    const theme=muralThemes[i%muralThemes.length];

    const c=document.createElement('canvas');c.width=512;c.height=512;
    const ctx=c.getContext('2d');
    ctx.scale?.(0.5,0.5);
    const bgGrad=ctx.createLinearGradient(0,0,1024,1024);
    bgGrad.addColorStop(0,'#091c2c');bgGrad.addColorStop(.5,'#05121e');bgGrad.addColorStop(1,'#0e2b42');
    ctx.fillStyle=bgGrad;ctx.fillRect(0,0,1024,1024);

    ctx.strokeStyle='#d4af37';ctx.lineWidth=14;ctx.strokeRect(28,28,968,968);
    ctx.strokeStyle=theme.color;ctx.lineWidth=4;ctx.strokeRect(48,48,928,928);

    for(const [cx,cy] of [[54,54],[970,54],[54,970],[970,970]]){
      ctx.fillStyle='#f5d488';ctx.beginPath();ctx.arc(cx,cy,14,0,Math.PI*2);ctx.fill();
    }

    ctx.save();
    ctx.translate(512,530);
    ctx.strokeStyle=theme.color;ctx.lineWidth=6;ctx.shadowColor=theme.color;ctx.shadowBlur=18;

    if(theme.draw==='spiral'){
      ctx.beginPath();
      for(let t=0;t<18;t+=.08){
        const r=8*Math.exp(.18*t);const x=r*Math.cos(t),y=r*Math.sin(t);
        if(t===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.stroke();
    }else if(theme.draw==='pascal'){
      ctx.fillStyle='#ffffff';ctx.font='bold 36px Segoe UI,sans-serif';ctx.textAlign='center';
      const rows=[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1],[1,5,10,10,5,1]];
      rows.forEach((row,rIdx)=>{
        const yPos=-160+rIdx*62;
        row.forEach((val,cIdx)=>{
          const xPos=(cIdx-(row.length-1)/2)*82;ctx.fillText(String(val),xPos,yPos);
        });
      });
    }else if(theme.draw==='pythagoras'){
      ctx.beginPath();ctx.moveTo(-120,80);ctx.lineTo(100,80);ctx.lineTo(-120,-100);ctx.closePath();ctx.stroke();
      ctx.strokeStyle='#f5d488';ctx.strokeRect(-120,80,-90,90);ctx.strokeRect(-120,80,220,90);
    }else if(theme.draw==='trig'){
      ctx.beginPath();ctx.arc(0,0,150,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle='#ffffff';ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(-190,0);ctx.lineTo(190,0);ctx.moveTo(0,-190);ctx.lineTo(0,190);ctx.stroke();
      ctx.strokeStyle='#f5d488';ctx.lineWidth=5;
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(106,-106);ctx.stroke();
    }else{
      ctx.beginPath();
      for(let s=0;s<6;s++){
        const a1=s*Math.PI/3,x1=150*Math.cos(a1),y1=150*Math.sin(a1);
        for(let t=s+1;t<6;t++){
          const a2=t*Math.PI/3;ctx.moveTo(x1,y1);ctx.lineTo(150*Math.cos(a2),150*Math.sin(a2));
        }
      }
      ctx.stroke();
    }
    ctx.restore();

    ctx.shadowBlur=0;ctx.fillStyle='#fbe3a9';ctx.font='bold 50px Segoe UI,Arial,sans-serif';ctx.textAlign='center';
    ctx.fillText(theme.title,512,130);
    ctx.fillStyle='#9fe8f2';ctx.font='600 32px Segoe UI,sans-serif';
    ctx.fillText(theme.sub,512,195);

    const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;g.textures.push(tex);
    const mat=new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,toneMapped:false});g.extraMaterials.push(mat);

    const frame=g.box(group,3.8,5.5,.15,p.x,4.8,p.z,mat,-midAngle);frame.name=`ROTUNDA_MATH_FRESCO_${i}`;
    const rim=g.box(group,4.0,5.7,.08,p.x,4.8,p.z,g.mat.gold,-midAngle);rim.name=`ROTUNDA_FRESCO_GOLD_RIM_${i}`;

    for(const side of [-1,1]){
      const sp=roomWorld(midAngle+side*.045,HUB_RADIUS-.28);
      g.box(group,.25,.8,.25,sp.x,4.8,sp.z,brass,-midAngle);
      const lantern=object(g,group,new THREE.OctahedronGeometry(.24,0),warmGlow,[sp.x,5.2,sp.z]);
      lantern.name=`ROTUNDA_SCONCE_LANTERN_${i}_${side}`;
    }

    const planterPos=roomWorld(midAngle,HUB_RADIUS-.7);
    g.box(group,3.6,.65,.7,planterPos.x,.32,planterPos.z,planterStone,-midAngle);
    g.box(group,3.8,.1,.8,planterPos.x,.68,planterPos.z,g.mat.gold,-midAngle);
    for(let bx=-1.2;bx<=1.2;bx+=.8){
      const bush=object(g,group,new THREE.IcosahedronGeometry(.38,1),plantGreen,[planterPos.x,.95,planterPos.z]);
      bush.scale.set(1.2,.8,.9);
      bush.position.x+=bx*Math.cos(-midAngle);
      bush.position.z+=bx*Math.sin(-midAngle);
    }

    // V13: Academic Royal Banners on columns flanking the bay
    const bannerCanvas=document.createElement('canvas');bannerCanvas.width=128;bannerCanvas.height=384;
    const bctx=bannerCanvas.getContext('2d');
    bctx.scale?.(0.5,0.5);
    bctx.fillStyle='#071626';bctx.fillRect(0,0,256,768);
    bctx.strokeStyle='#e8c76b';bctx.lineWidth=8;bctx.strokeRect(6,6,244,756);
    bctx.fillStyle='#fce29d';bctx.font='bold 34px Segoe UI,sans-serif';bctx.textAlign='center';
    bctx.fillText('MATHVERSE',128,75);
    bctx.fillStyle=theme.color;bctx.font='bold 68px "Cambria Math",serif';
    bctx.fillText(theme.draw==='spiral'?'φ':theme.draw==='trig'?'sin':theme.draw==='pythagoras'?'π':'∞',128,260);
    bctx.fillStyle='#9fe8f2';bctx.font='600 28px Segoe UI,sans-serif';
    bctx.fillText('HỌC THUẬT',128,420);
    bctx.fillText('DANH DỰ',128,470);
    bctx.fillStyle='#e8c76b';
    for(let f=18;f<238;f+=24)bctx.fillRect(f,710,16,36);
    const bTex=new THREE.CanvasTexture(bannerCanvas);bTex.colorSpace=THREE.SRGBColorSpace;g.textures.push(bTex);
    const bannerMat=new THREE.MeshBasicMaterial({map:bTex,side:THREE.DoubleSide,toneMapped:false});g.extraMaterials.push(bannerMat);

    for(const side of [-1,1]){
      const bp=roomWorld(midAngle+side*.075,HUB_RADIUS-.22);
      const bannerMesh=g.box(group,1.1,3.2,.04,bp.x,5.0,bp.z,bannerMat,-midAngle);
      bannerMesh.name=`ACADEMIC_BANNER_${i}_${side}`;
      g.box(group,1.25,.10,.08,bp.x,6.65,bp.z,g.mat.gold,-midAngle);
      g.box(group,1.15,.06,.06,bp.x,3.38,bp.z,g.mat.gold,-midAngle);
    }

    // V13: Marble Lounge Benches in rotunda wall bays
    const benchPos=roomWorld(midAngle,HUB_RADIUS-2.6);
    const benchCushionMat=material(g,{color:0x153b52,roughness:.32,metalness:.18});
    const benchBase=g.box(group,3.2,.42,.85,benchPos.x,.21,benchPos.z,g.mat.whiteStone,-midAngle);
    benchBase.name=`ROTUNDA_LOUNGE_BENCH_${i}`;
    g.box(group,3.3,.05,.90,benchPos.x,.43,benchPos.z,g.mat.gold,-midAngle);
    g.box(group,3.0,.12,.75,benchPos.x,.50,benchPos.z,benchCushionMat,-midAngle);
  }
}

export function buildCrystalAtrium(g,group,plan){
  g.mat.whiteStone=material(g,{color:0xf6f8f5,metalness:.08,roughness:.35});
  g.mat.crystal=material(g,{color:0x96e6e9,metalness:.20,roughness:.07,transparent:true,opacity:.58,depthWrite:false},true);
  g.mat.brightGold=new THREE.MeshBasicMaterial({color:0xf6d99e,toneMapped:false});g.extraMaterials.push(g.mat.brightGold);
  const floor=object(g,group,new THREE.CylinderGeometry(HUB_RADIUS+.18,HUB_RADIUS+.18,.22,128),g.mat.floor,[0,-.16,0]);
  floor.name='MAIN_CRYSTAL_ROTUNDA_FLOOR';
  crystalDome(g,group);
  floorRosette(g,group,plan);
  infinityChandelier(g,group);
  addInfinityAtriumIllumination(g,group);
  buildRotundaMathMurals(g,group,plan);
  // Seven doors with visual sightlines into their halls.
  for(const p of plan)portalFacade(g,group,p);
  buildClassificationPodium(g,group,plan);
  buildMainLobbyReturnGate(g,group);
  
  // TRUE curved rotunda. Never place pilasters or walls in front of any grade gate.
  const isDoorway=(a)=>{
    const norm=x=>Math.atan2(Math.sin(x),Math.cos(x));
    const entrances=[...plan.map(p=>p.theta),Math.PI];
    return entrances.some(c=>Math.abs(norm(a-c))<.23);
  };
  // 120 small radial segments create a continuous wall between the eight open portals.
  for(let i=0;i<120;i++){
    const a=2*Math.PI*(i+.5)/120;
    if(isDoorway(a))continue;
    const p=roomWorld(a,HUB_RADIUS);
    const wall=g.box(group,2.65,9.22,.30,p.x,4.61,p.z,g.mat.whiteStone,-a);
    wall.name='ROTUNDA_CIRCULAR_WALL_BETWEEN_DOORS';
    g.box(group,2.66,.12,.36,p.x,8.62,p.z,g.mat.gold,-a);
    g.box(group,2.66,.13,.36,p.x,.60,p.z,g.mat.gold,-a);
  }
  // One column at each ten degrees, deliberately omitting door-clearance areas.
  for(let i=0;i<48;i++){
    const a=2*Math.PI*i/48;
    if(isDoorway(a))continue;
    const v=roomWorld(a,HUB_RADIUS-.16);
    object(g,group,new THREE.CylinderGeometry(.41,.47,8.6,14),g.mat.whiteStone,[v.x,4.37,v.z]);
    g.box(group,1.11,.33,1.11,v.x,8.72,v.z,g.mat.gold,-a);
    g.box(group,1.08,.22,1.08,v.x,.18,v.z,g.mat.gold,-a);
  }
  const ambient=new THREE.PointLight(0xbfeff7,2.4,60,2);ambient.position.set(0,13,0);group.add(ambient);
  g.crystalLights=[ambient];
}
export function buildCrystalHall(g,room){
  const {info,group,accent}=room;
  const theta=info.theta,half=info.halfAngle;
  // A tasteful, grade-colored frieze, luminescent ceiling lines and PBR lighting.
  for(const sign of [-1,1]){
    const a=roomWorld(theta+sign*half,HUB_RADIUS+3),b=roomWorld(theta+sign*half,FAR_RADIUS-2);
    const len=Math.hypot(b.x-a.x,b.z-a.z),rot=-Math.atan2(b.z-a.z,b.x-a.x);
    g.box(group,len,.22,.27,(a.x+b.x)/2,8.7,(a.z+b.z)/2,accent,rot);
    g.box(group,len,.17,.35,(a.x+b.x)/2,.79,(a.z+b.z)/2,g.mat.gold,rot);
  }
  const roomCenter=roomWorld(theta,84);
  // Global directional & hemisphere lights illuminate all 7 grade halls without 7 extra PointLight shader loops
  // The centre aisle is reserved for teacher/student movement. Sculptures are
  // at the corners near the room entrance, NEVER between a person and a picture.
  for(const side of [-1,1]){
    const place=roomWorld(theta,HUB_RADIUS+10,side*15);
    g.box(group,1.45,.92,1.45,place.x,.46,place.z,g.mat.whiteStone);
    g.box(group,1.58,.14,1.58,place.x,.94,place.z,g.mat.gold);
    const art=object(g,group,new THREE.OctahedronGeometry(.68,0),accent,[place.x,1.62,place.z]);
    art.name=`G${info.grade}_ENTRANCE_CRYSTAL_${side}`;
    const halo=object(g,group,new THREE.TorusGeometry(.95,.05,8,32),g.mat.gold,[place.x,1.62,place.z],[Math.PI/3,side*.4,0]);
    halo.name=`G${info.grade}_ENTRANCE_HALO_${side}`;
  }
  for(const r of [66,89,110]){
    const p=roomWorld(theta,r);
    const lamp=object(g,group,new THREE.IcosahedronGeometry(.46,0),g.mat.crystal,[p.x,8.7,p.z]);
    lamp.name=`GRADE_${info.grade}_SUSPENDED_PRISM`;
  }
  decorateColorfulGrade(g,room);
  addInfinityGradeIllumination(g,room);
}
