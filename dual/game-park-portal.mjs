/**
 * MATHVERSE WONDER PARK entrance inside Grand Campus V11 lobby.
 * Additive scene only: do NOT alter R75 laboratory or infographic museum geometry.
 * From the central reception, walk behind the concierge to the third 3D gate.
 */
import * as THREE from '/vendor/three.module.js';

export const GAME_PARK_PORTAL=Object.freeze({x:0,z:-28.5,triggerRadius:9.3});

export function createGameParkPortal(){
  const group=new THREE.Group();
  group.name='MATHVERSE_WONDER_PARK_GATE_IN_CAMPUS';
  group.position.set(GAME_PARK_PORTAL.x,0,GAME_PARK_PORTAL.z);
  const clickable=[];
  const mat=(color,metalness=.08,roughness=.54)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
  const GOLD=mat(0xf0c573,.66,.24),CREAM=mat(0xffe7b3,.05,.56),NAVY=mat(0x143b59,.42,.32),GLASS=new THREE.MeshPhysicalMaterial({color:0x4fc8d9,transparent:true,opacity:.69,metalness:.18,roughness:.14,side:THREE.DoubleSide,depthWrite:true});
  const SKY=new THREE.MeshBasicMaterial({color:0x88eeff,toneMapped:false});
  const VIOLET=mat(0x9574d6,.4,.38),WHITE=mat(0xfdf5df);
  function add(geometry,material,x=0,y=0,z=0,name=''){
    const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.name=name;
    group.add(m);return m;
  }
  const box=(w,h,d,x,y,z,ma,name)=>add(new THREE.BoxGeometry(w,h,d),ma,x,y,z,name);
  const cyl=(r,h,x,y,z,ma,name)=>add(new THREE.CylinderGeometry(r,r,h,14),ma,x,y,z,name);
  // Level approach: not an obstacle in existing Lab/Museum paths.
  box(17,.10,17,0,.11,5.3,CREAM,'PARK_FRONT_WALKWAY');
  cyl(9,.32,0,.20,0,NAVY,'PARK_CEREMONIAL_PLATFORM');
  const floor=add(new THREE.RingGeometry(7.3,8.4,64),GOLD,0,.397,0,'PARK_GOLD_FLOOR_RING');floor.rotation.x=-Math.PI/2;
  for(const x of [-7,7]){
    cyl(1.0,10.4,x,5.2,0,CREAM,'PARK_GATE_3D_PILLAR');
    cyl(1.17,.35,x,10.55,0,GOLD,'PARK_GATE_CROWN');
    cyl(1.16,.32,x,.16,0,GOLD,'PARK_GATE_BASE');
    const gem=add(new THREE.OctahedronGeometry(.68,0),SKY,x,11.18,0,'PARK_CROWN_CRYSTAL');gem.rotation.y=Math.PI/4;
  }
  box(15.5,1.3,2.4,0,11.35,0,NAVY,'PARK_GATE_ARCH_BEAM');
  box(15.7,.22,2.6,0,12.08,0,GOLD,'PARK_GATE_TOP_GOLD');
  // Large central clickable 3D glass; explicitly separate target from other doors.
  const entry=box(12.0,8.25,.16,0,5.3,0.35,GLASS,'PARK_ENTRANCE_INTERACTION');
  entry.userData.grandTarget='gamepark';clickable.push(entry);
  // Upright torus of light makes the gateway recognizable from the starting plaza.
  const ring=add(new THREE.TorusGeometry(5.0,.17,10,72),SKY,0,5.4,.58,'PARK_ILLUMINATED_CIRCLE');
  ring.rotation.z=0;
  function sign(text,width=13.4,height=1.32,y=11.37,z=1.42){
    const cw=1536,ch=Math.round(cw*height/width),canvas=document.createElement('canvas');
    canvas.width=cw;canvas.height=ch;
    const c=canvas.getContext('2d');
    c.fillStyle='#153b59';c.fillRect(0,0,cw,ch);
    c.strokeStyle='#f7d790';c.lineWidth=Math.max(6,Math.round(ch*.045));c.strokeRect(6,6,cw-12,ch-12);
    let fontsize=Math.round(ch*.57);c.textAlign='center';c.textBaseline='middle';
    c.fillStyle='#fff2c9';
    do{c.font=`800 ${fontsize}px Arial,sans-serif`;if(c.measureText(text).width<cw-80)break;fontsize-=3;}while(fontsize>18);
    c.fillText(text,cw/2,ch/2);
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
    const sMat=new THREE.MeshBasicMaterial({map:tex,side:THREE.FrontSide,toneMapped:false});
    const panel=add(new THREE.PlaneGeometry(width,height),sMat,0,y,z,'PARK_SIGN_MATHVERSE_WONDER_PARK');
    const panelBack=new THREE.Mesh(panel.geometry,sMat);panelBack.rotation.y=Math.PI;panelBack.position.z=-0.012;panelBack.userData.grandTarget='gamepark';panel.add(panelBack);
    panel.userData.grandTarget='gamepark';clickable.push(panel,panelBack);
  }
  sign('CÔNG VIÊN TOÁN HỌC 3D');
  // Two small stationary chicken guardians: a recognizable symbol of the first game.
  function chicken(x){
    const chickenGroup=new THREE.Group();chickenGroup.position.set(x,.40,3.2);group.add(chickenGroup);
    function sphere(r,ma,x,y,z,scaleX=1,scaleY=1,scaleZ=1){const o=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),ma);o.scale.set(scaleX,scaleY,scaleZ);o.position.set(x,y,z);chickenGroup.add(o);return o;}
    sphere(1.04,WHITE,0,1.1,0,1.10,1.07,.94);
    sphere(.70,WHITE,0,2.15,.29);
    for(const xx of [-.29,.29]){sphere(.12,NAVY,xx,2.24,.86);sphere(.045,WHITE,xx+.04,2.28,.95);}
    const beak=add(new THREE.ConeGeometry(.27,.55,4),GOLD,x,2.40,4.22,'PARK_CHICKEN_BEAK');beak.rotation.x=Math.PI/2;
    for(let i=0;i<3;i++)sphere(.21,VIOLET,(i-1)*.26,2.85,.27);
    for(const xx of [-.35,.35]){sphere(.15,GOLD,xx,.19,.22,1,.42,1.6);}
    const badge=sphere(.24,SKY,0,1.2,.85);
    badge.name='PARK_CHICKEN_BADGE';
    return chickenGroup;
  }
  chicken(-10.1);chicken(10.1);
  return {group,clickable,getTarget(player){
    if(!player||!Number.isFinite(player.x)||!Number.isFinite(player.z))return null;
    return Math.hypot(player.x-GAME_PARK_PORTAL.x,player.z-GAME_PARK_PORTAL.z)<GAME_PARK_PORTAL.triggerRadius?'gamepark':null;
  }};
}
