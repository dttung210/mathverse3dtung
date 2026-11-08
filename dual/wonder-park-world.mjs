/**
 * MATHVERSE Wonder Park - ONE shared Three.js scene with Grand Campus.
 * Geometry reused from Wonder Park: 11 3D stations,
 * actual animated chicken enclosure, NPCs and entrance gate.
 * NO iframe, NO second WebGL renderer, NO separate world/page.
 */
import * as THREE from '/vendor/three.module.js';
import {addRocketCrew,createGlassBridge,createArchitectScene,createCoasterScene,createBalloonScene,enrichSanctuary} from './wonder-park-v6-scenes.mjs';
import {createTugScene,createSoccerScene,createMazeEntrance,createMillionaireScene} from './wonder-park-v7-scenes.mjs';
import {createMazeScene} from './wonder-park-v7-maze.mjs';

const ZONES = [
  {name:'Học bá Chuồng Gà',short:'Chuồng Gà',emoji:'🐔',staff:'Gà Giáo Sư Cô-Cô',color:0xf6bd72,
   guide:'Camera quan sát sát chuồng gà tròn, không hóa thân nhân vật. Gà quán quân của em lớn hơn 10 gà đối thủ. Mỗi câu đúng gà quán quân đá một đối thủ khỏi vòng; sai một câu gà quán quân bị đá ra ngoài và phải chơi lại từ đầu.'},
  {name:'Học bá Tên Lửa',short:'Tên Lửa',emoji:'🚀',staff:'Kỹ sư Sao Băng',color:0xf08b78,guide:'10 câu Toán. Đúng: động cơ tích năng lượng và tăng độ cao. Sai một câu: tên lửa phóng thẳng lên trời rồi biến mất, em phải chơi lại từ đầu. Đúng 10/10 sẽ nhận danh hiệu HỌC BÁ TÊN LỬA.'},
  {name:'Phòng Thích Học Bá',short:'Thích Học Bá',emoji:'🪷',staff:'NPC Phật Trí Tuệ',color:0xc48b4e,guide:'Bước qua cổng giữa quảng trường vào không gian thiền viện 3D. Đến gần NPC Trí Tuệ, bốc một quẻ để nhận câu hỏi do giáo viên cung cấp. Đúng 10/10: THÍCH HỌC BÁ. Chỉ một câu sai: Mời thí chủ về tu luyện, trở lại cửa phòng.'},
  {name:'Cầu Kính Tri Thức',short:'Cầu Kính',emoji:'🌉',staff:'NPC Thủy Tinh',color:0x8bdff1,guide:'Cầu kính trong suốt trên nước. Đúng tiến 1 nhịp, sai rơi xuống nước. 10/10 nhận HỌC BÁ CẦU KÍNH.'},
  {name:'Kéo Co Tri Thức',short:'Kéo Co',emoji:'🪢',staff:'Huấn luyện viên Số Học',color:0x9cd5b7,guide:'Em và NPC kéo co 10 câu. Mỗi câu đúng, dây dịch về phía em; chỉ cần sai một câu, NPC kéo ngược dây và em thua ngay. Chỉ 10/10 mới nhận HỌC BÁ KÉO CO.'},
  {name:'Đá Bóng Học Bá',short:'Đá Bóng',emoji:'⚽',staff:'Thủ môn Toán Học',color:0xb7a2f5,guide:'Đá 10 quả bóng vào khung thành sau mỗi câu đúng, có thủ môn phòng ngự. Sai một câu sẽ bị cản phá và phải bắt đầu lại. Đúng 10/10 nhận HỌC BÁ RONALDO.'},
  {name:'Kiến Trúc Sư',short:'Kiến Trúc Sư',emoji:'🏠',staff:'Kiến trúc sư Pi',color:0xf7d17d,guide:'Ngôi nhà 10 phần: mỗi câu đúng đặt thêm một khối, sai là công trình vỡ ra và phải chơi lại.'},
  {name:'Mê Cung Lạc Lối',short:'Mê Cung',emoji:'🧭',staff:'Người Giữ Bản Đồ',color:0x8bdaaf,guide:'Không có trắc nghiệm. Nhìn toàn cảnh một lần trong 6 giây rồi tự tìm lối ra qua 8 mê cung 3D từ dễ đến khó, nhiều ngõ cụt, mỗi màn chỉ một đường từ đầu tới đích.'},
  {name:'Tàu Lượn Siêu Tốc',short:'Tàu Lượn',emoji:'🎢',staff:'Cô Đường Cong',color:0xf49fc8,guide:'Tàu lượn nhiều vòng và ngã ba. 10/10 tới ga; sai đi nhánh ray gãy và bay lên trời.'},
  {name:'Khinh Khí Cầu Trí Tuệ',short:'Khí Cầu',emoji:'🎈',staff:'Phi công Mây Trắng',color:0x90c7fe,guide:'10/10 sẽ bay trên cao xem sảnh, công viên, quay về và nhận HỌC BÁ TRÍ TUỆ. Sai khinh khí cầu sẽ rơi.'},
  {name:'Ai Là Triệu Phú Toán Học',short:'Triệu Phú',emoji:'💎',staff:'MC Tri Thức',color:0xffd16c,guide:'Ngồi ghế nóng cùng MC để trả lời 15 câu tăng dần độ khó. Mốc thưởng ở câu 5, 10, 15; ba trợ giúp 50:50, khán giả mô phỏng và AI mô phỏng (mỗi trợ giúp dùng một lần).'},
];
const TAU=Math.PI*2, CENTER_Z=-10, RADIUS=64;
// 10 independent outer attractions + room 2 as the sole central learning hall.
export const OUTER_GAME_IDS=Object.freeze([0,1,3,4,5,6,7,8,9,10]);
const SANCTUARY_LOCAL_Z=-280; // Separate indoor coordinates, same original Three.js scene/renderer.

// V4: the park is directly OPPOSITE the Lab + Museum across the Common Hall.
// Its model is rotated 180 degrees so the REAL gate faces the Hall.
// Same scene, same renderer and avatar; no iframe or detached world.
export const WONDER_PARK_LOCATION=Object.freeze({originX:0,originZ:128,
  centerX:0,centerZ:138,gateX:0,gateZ:66,
  startX:0,startZ:58,farZ:224});
let app;
const palette={ground:0x346946,grass:0x3e8352,road:0xd5b17d,wood:0x95633b,woodLight:0xd7a56b,teal:0x37c1bd,sky:0xa5dbe3,dark:0x193951,gold:0xffdf83};
const materialCache=new Map();
function M(color,metal=0,rough=.68,emissive=0){const k=`${color}-${metal}-${rough}-${emissive}`;if(!materialCache.has(k))materialCache.set(k,new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough,emissive}));return materialCache.get(k);}
function mesh(geo,color,parent,x=0,y=0,z=0,metal=0,rough=.68){const o=new THREE.Mesh(geo,M(color,metal,rough));o.position.set(x,y,z);parent.add(o);return o;}
const box=(parent,w,h,d,color,x=0,y=0,z=0,metal=0)=>mesh(new THREE.BoxGeometry(w,h,d),color,parent,x,y,z,metal);
const sphere=(parent,r,color,x=0,y=0,z=0,rx=1,ry=1,rz=1)=>{const o=mesh(new THREE.SphereGeometry(r,16,12),color,parent,x,y,z);o.scale.set(rx,ry,rz);return o;};
const cylinder=(parent,rt,rb,h,color,x=0,y=0,z=0,segments=18)=>mesh(new THREE.CylinderGeometry(rt,rb,h,segments),color,parent,x,y,z);
const cone=(parent,rad,h,color,x=0,y=0,z=0,n=16)=>mesh(new THREE.ConeGeometry(rad,h,n),color,parent,x,y,z);
const torus=(parent,r,t,color,x=0,y=0,z=0)=>mesh(new THREE.TorusGeometry(r,t,9,64),color,parent,x,y,z);
function beam(parent,start,end,r,color){const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end);const diff=b.clone().sub(a);const o=cylinder(parent,r,r,diff.length(),color);o.position.copy(a.add(b).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),diff.normalize());return o;}
function seed(n){let x=Math.sin(n*124.223)*65212.39;return x-Math.floor(x);}
function label3d(text,width=5.5,height=1.25,fill='#143c52',ink='#f5edcb',fontsize=40){
 const canvas=document.createElement('canvas');canvas.width=640;canvas.height=160;
 const c=canvas.getContext('2d');
 if(c){
  c.scale?.(0.5,0.5);
  c.fillStyle=fill;
  if(typeof c.roundRect==='function'){
    c.beginPath();c.roundRect(12,12,1256,296,28);c.fill();
    c.strokeStyle='#6fd4d8';c.lineWidth=16;c.stroke();
  }else{
    c.fillRect(0,0,1280,320);c.strokeStyle='#6fd4d8';c.lineWidth=16;c.strokeRect(12,12,1256,296);
  }
  let fs=fontsize*2;
  c.font=`900 ${fs}px "Segoe UI",Arial,sans-serif`;c.fillStyle=ink;c.textAlign='center';c.textBaseline='middle';
  let value=text;while(c.measureText(value).width>1190&&fs>32){fs-=3;c.font=`900 ${fs}px "Segoe UI",Arial,sans-serif`;}
  c.fillText(value,640,160);
 }
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 tex.generateMipmaps=false;tex.minFilter=THREE.LinearFilter;tex.anisotropy=4;
 const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.FrontSide});
 const m=new THREE.Mesh(new THREE.PlaneGeometry(width,height),mat);
 const back=new THREE.Mesh(m.geometry,mat);back.rotation.y=Math.PI;back.position.z=-0.012;m.add(back);
 return m;
}
function addPath(a,b,width=3.2,color=palette.road){const v=new THREE.Vector3(...a),w=new THREE.Vector3(...b),mid=v.clone().add(w).multiplyScalar(.5);const d=w.clone().sub(v);const p=box(app.scene,width,.08,d.length(),color,mid.x,.08,mid.z);p.rotation.y=Math.atan2(d.x,d.z);return p;}
function addFlowerClump(x,z){const g=new THREE.Group();g.position.set(x,.07,z);app.scene.add(g);cylinder(g,.28,.32,.08,0x2d6a4f,0,.04,0,8);const colors=[0xf43f5e,0xfbbf24,0xa855f7];for(let i=0;i<3;i++){const ang=i*TAU/3,fx=Math.cos(ang)*.18,fz=Math.sin(ang)*.18;sphere(g,.10,colors[i],fx,.14,fz,1.2,.5,1.2);}}
function addTree(x,z,s=1){const g=new THREE.Group();g.position.set(x,0,z);app.scene.add(g);cylinder(g,.15*s,.23*s,2.3*s,0x7f573a,0,1.16*s,8);for(let k=0;k<2;k++){cone(g,(1.2-k*.28)*s,2.6*s,k===0?0x247e60:0x41a47a,0,(2.4+k*.75)*s,10);}return g;}
function addLamp(x,z){
 const p=new THREE.Group();p.position.set(x,0,z);app.scene.add(p);
 cylinder(p,.09,.16,3.9,0x294354,0,1.95,8);
 const core=sphere(p,.26,0xfffae0,0,4.20,0);
 if(core.material){core.material.emissive=new THREE.Color(0xffe699);core.material.emissiveIntensity=0.92;}
 cone(p,.22,.36,0xd4af37,0,4.62,0,8);
 return p;
}
function avatar(x=0,z=50){const g=new THREE.Group();g.position.set(x,0,z);
 // stylized MATHVERSE uniform with proportions similar to the project's 3D avatar
 for(const xx of [-.25,.25]){cylinder(g,.16,.21,1.25,0x183451,xx,.68);sphere(g,.24,0x18283b,xx,.14,.15,.7,.25,1.3);}
 box(g,.96,1.25,.6,0x267eaa,0,1.98);box(g,.87,.16,.68,0x1fb8be,0,2.51);
 sphere(g,.48,0xe3b69a,0,3.05,.02);sphere(g,.48,0x26314a,0,3.36,-.08,1,.36,1);
 sphere(g,.07,0x153448,-.18,3.09,.43);sphere(g,.07,0x153448,.18,3.09,.43);
 for(const s of [-1,1]){box(g,.26,1.16,.28,0x165d87,s*.64,1.95);sphere(g,.17,0xe3b69a,s*.64,1.26,.02);}
 box(g,.7,.8,.22,0x1b4664,0,1.95,-.4);const sign=label3d('HỌC SINH',1.1,.27,'#1e435e','#ffe3a0',36);sign.position.set(0,2.1,.31);g.add(sign);
 g.userData.baseY=0;return g;
}
function npc(x,z,shirt,name,kind='human'){
 const g=new THREE.Group();g.position.set(x,0,z);g.userData.baseY=0;const b=new THREE.Group();g.add(b);
 if(kind==='human'){
  for(const xx of [-.21,.21])cylinder(b,.11,.16,.95,0x142f44,xx,.52);
  cylinder(b,.48,.36,1.36,shirt,0,1.62);
  sphere(b,.4,0xf1c9a8,0,2.7,.06);
  sphere(b,.43,0x2a3c4c,0,2.95,-.08,1,.33,1);
  sphere(b,.043,0x172c3a,-.14,2.72,.43);sphere(b,.043,0x172c3a,.14,2.72,.43);
  for(const s of [-1,1]){const a=box(b,.21,1.05,.22,shirt,s*.54,1.72);a.rotation.z=s*.19; sphere(b,.13,0xf1c9a8,s*.67,1.20,.01);}
  box(b,.28,.29,.06,0xffd27e,0,1.73,.44);
  cylinder(b,.55,.45,.16,0x1e4764,0,3.11);
 }else{const ch=chickenModel({body:0xffe093,accent:0xf2b75a,professor:true});b.add(ch);}
 const stand=cylinder(g,1.25,1.38,.25,0x183e55,0,.12);const sign=label3d(name,3.6,.69,'#143d4e','#fff2b7',31);sign.position.set(0,kind==='human'?3.87:2.18,0);g.add(sign);
 app.npcRoots.push({g,b,kind,baseY:g.position.y});app.scene.add(g);return g;
}
function chickenModel({body=0xffe6a4,accent=0xeebc69,scarf=null,professor=false}={}){
 const g=new THREE.Group();const bodyMesh=sphere(g,.64,body,0,.83,0,1.05,1.1,.8);
 sphere(g,.45,body,0,1.43,.34,1,1,1);
 for(const s of [-1,1]){
  const wing=sphere(g,.29,accent,s*.61,.86,.03,.55,.95,1);wing.rotation.z=s*.22;
  cylinder(g,.062,.08,.43,0xd88329,s*.27,.29,.03);sphere(g,.15,0xeaa03c,s*.27,.12,.24,1,.35,1.4);
  sphere(g,.088,0xffffff,s*.18,1.50,.70);sphere(g,.039,0x182c3b,s*.18,1.50,.774);
  sphere(g,.026,0xffffff,s*.19-.012,1.52,.81);
 }
 for(let i=0;i<3;i++){sphere(g,.18,0xe64847,(i-1)*.16,1.97+((i%2)*.06),.22,1.03,.84,1);}
 const beak=cone(g,.17,.32,0xffac3f,0,1.33,.86);beak.rotation.x=Math.PI/2;
 for(const d of [-.32,0,.32]){const t=cone(g,.16,.50,accent,d,1.09,-.57);t.rotation.x=-.55;t.rotation.z=d*.65;}
 if(scarf){const collar=torus(g,.44,.083,scarf,0,1.22,.37);collar.rotation.x=Math.PI/2;box(g,.13,.42,.13,scarf,.2,.99,.73);}
 if(professor){for(const s of [-1,1])torus(g,.19,.035,0x27415a,s*.20,1.51,.74);box(g,.14,.05,.08,0x27415a,0,1.52,.75);const hat=box(g,1.18,.09,.86,0x283d72,0,2.19,.08);box(g,.63,.25,.55,0x283d72,0,2.31,.08);sphere(g,.07,0xffd36f,.52,2.09,.48);}
 return g;
}
function zoneLocation(i){
 if(i===2)return {x:0,z:CENTER_Z,angle:0}; // Permanent central Thích Học Bá study room.
 const slot=OUTER_GAME_IDS.indexOf(i);
 if(slot<0)throw new RangeError('Unknown attraction '+i);
 const angle=.34+slot*TAU/OUTER_GAME_IDS.length;
 return {x:RADIUS*Math.sin(angle),z:CENTER_Z+RADIUS*Math.cos(angle),angle};
}
function createGate(){const base=new THREE.Group();base.position.set(0,0,62);app.scene.add(base);
 // Twin Cyber Pylons (Khải Hoàn Môn Đôi Hoàng Gia)
 for(const x of [-6.8,6.8]){
  box(base,2.6,.7,2.6,0x142b3b,x,.35,0);
  box(base,2.3,.3,2.3,0xd4af37,x,.85,0);
  cylinder(base,1.05,1.25,8.2,0xf0e4cf,x,4.95,0,24);
  const conduit=cylinder(base,.08,.08,7.8,0x38bdf8,x,4.95,1.15,8);
  if(conduit.material){conduit.material.emissive=new THREE.Color(0x38bdf8);conduit.material.emissiveIntensity=0.85;}
  box(base,2.4,.55,2.4,0xd4af37,x,9.2,0);
  cone(base,.9,1.8,0x1b4158,x,10.35,0,8);
  const gem=mesh(new THREE.OctahedronGeometry(.5,0),0x67e8f9,base,x,11.45,0);
  if(gem.material){gem.material.emissive=new THREE.Color(0x38bdf8);gem.material.emissiveIntensity=0.9;}
 }
 // Majestic Parabolic Header & Gilded Frieze
 box(base,14.6,1.5,1.5,0x16394e,0,8.2,0);
 box(base,14.8,.18,1.6,0xd4af37,0,9.0,0);
 const sign=label3d('MATHVERSE · WONDER PARK',12.6,1.4,'#0f273d','#fff2c6',46);sign.position.set(0,8.25,.82);base.add(sign);
 const signBack=label3d('MATHVERSE · WONDER PARK',12.6,1.4,'#0f273d','#fff2c6',46);signBack.position.set(0,8.25,-.82);signBack.rotation.y=Math.PI;base.add(signBack);
 const smallSign=label3d('CÔNG VIÊN TOÁN HỌC 3D',9.2,.95,'#1e5568','#dcfef7',44);smallSign.position.set(0,6.75,1.05);base.add(smallSign);
 // Gilded filigree gate panels (preserving app.gatePanels)
 for(const s of [-1,1]){const hinge=new THREE.Group();hinge.position.set(s*6.1,0,0);base.add(hinge);
  box(hinge,5.8,5.0,.35,0x1a4e63,-s*2.9,2.65,0);
  box(hinge,5.4,4.5,.42,0xd4af37,-s*2.9,2.65,0);
  box(hinge,5.1,4.2,.45,0x143749,-s*2.9,2.65,0);
  for(let x=-4.8;x<.0;x+=.85)box(hinge,.18,4.1,.48,0xcde7c9,x*(s===-1?-1:1),2.65);
  const emblem=sphere(hinge,.48,0xffd376,-s*2.9,3.1,.32,1,1,.4);
  app.gatePanels.push({hinge,sign:s});
 }
 // Flanking beacon towers & banners
 for(const s of [-1,1]){
  cylinder(base,.12,.14,6.2,0x223f54,s*10.2,3.1,0);
  box(base,1.6,1.0,.08,s===-1?0x38bdf8:0xf59e0b,s*10.2,5.8,0);
  sphere(base,.20,0xffedc1,s*10.2,6.4,0);
 }
 return base;
}
function createFountain(){const g=new THREE.Group();g.position.set(0,0,CENTER_Z);app.scene.add(g);cylinder(g,5.3,5.5,.75,0x4b8b91,0,.39);cylinder(g,4.65,4.65,.21,0x67b1c0,0,.82);cylinder(g,3.95,3.95,.10,0x3fa6bf,0,.95);cylinder(g,1.45,1.7,2.8,0xcddbd1,0,2.24);sphere(g,.88,0xe1e3ba,0,4.05);const jets=[];
 for(let i=0;i<10;i++){const a=i*TAU/10;const j=sphere(g,.16,0x8ceafa,Math.sin(a)*3.15,1.7,Math.cos(a)*3.15,1,5,1);jets.push(j);}app.animated.push(t=>{jets.forEach((j,i)=>{j.scale.y=3.8+Math.sin(t*2.9+i*.7)*1.6;j.position.y=1.58+Math.sin(t*2.9+i*.7)*.36;});});
 const title=label3d('QUẢNG TRƯỜNG TRUNG TÂM',7.5,.9,'#1a5b69','#ffe6b2',34);title.position.set(0,5.4,0);g.add(title);
}
function createChickenArena(zone){const g=new THREE.Group();g.position.set(0,.55,0);zone.add(g);
 // Entire competition ring is contained within this one arena.
 cylinder(g,6.1,6.25,.45,0x96603b,0,.05);cylinder(g,5.82,5.82,.12,0xddb779,0,.31);
 const marks=torus(g,4.55,.075,0xf4d59a,0,.42,0);marks.rotation.x=Math.PI/2;
 for(let i=0;i<22;i++){const a=i*TAU/22;const x=5.8*Math.sin(a),z=5.8*Math.cos(a);cylinder(g,.105,.13,1.42,0x8f5f3a,x,.91,z);sphere(g,.18,0xf0c487,x,1.67,z);}
 for(const y of [.9,1.35]){const rail=torus(g,5.83,.065,0xc99762,0,y,0);rail.rotation.x=Math.PI/2;}
 const player=chickenModel({body:0xf6e9c6,accent:0xe4b874,scarf:0x33c5dc});player.position.set(0,.36,1.55);player.scale.setScalar(1.36);g.add(player);
 // R107: Golden 24K Champion Crown on top of Champion Chicken + Spin-Kick Shockwave Ring
 const crown=torus(player,.22,.045,0xffd700,0,2.12,.22);crown.rotation.x=Math.PI/2;
 const shockRing=torus(g,1.2,.06,0xfbbf24,0,.40,1.55);shockRing.rotation.x=Math.PI/2;shockRing.visible=false;
 const rivals=[];const coats=[0xf8d49c,0xb4dcee,0xf4bbb4,0xbadfb2,0xead1e4,0xe0d7b9,0xb7ddd8,0xe6c2a2,0xc8dba7,0xf2bca8];
 for(let i=0;i<10;i++){const a=(i/10)*TAU-.2;const root=chickenModel({body:coats[i],accent:coats[i]});const x=3.35*Math.sin(a),z=3.35*Math.cos(a)-.2;root.position.set(x,.36,z);root.rotation.y=Math.atan2(-x,-z);root.scale.setScalar(.73);g.add(root);rivals.push({root,x,z,a,eliminated:false,kickAt:0});}
 const prof=chickenModel({body:0xffde8a,accent:0xf8b96b,professor:true});prof.position.set(-6.8,.1,5.5);prof.scale.setScalar(.95);g.add(prof);
 const board=label3d('HỌC BÁ CHUỒNG GÀ',6.4,1.12,'#704629','#ffecb9',45);board.position.set(0,4.2,-6.8);g.add(board);
 for(const x of [-3.8,3.8]){cylinder(g,.15,.15,3.2,0xa86e40,x,2.45,-6.8);sphere(g,.26,0xffe0a2,x,4.05,-6.8);}
 for(const s of [-1,1]){box(g,1.7,.55,.85,0xc89d50,s*6.8,.40,-2.3);box(g,1.35,.50,.75,0xe1b466,s*6.8,.91,-2.3);}
 cylinder(g,.24,.30,.45,0x1f3c4d,-6.8,.35,3.6);
 cylinder(g,.09,.13,.40,0xd4af37,-6.8,.75,3.6);
 cylinder(g,.30,.16,.50,0xffd700,-6.8,1.2,3.6);
 sphere(g,.11,0xffe082,-6.8,1.52,3.6);
 app.chickens={group:g,player,crown,shockRing,rivals,prof,anim:null,attackTarget:null,win:false};
 return g;
}
function buildZoneModel(i,zroot){const g=new THREE.Group();zroot.add(g);const clr=ZONES[i].color;
 if(i===0){createChickenArena(g);return;}
 if(i===1){ // Rocket launch game with controlled progress and distinct fail/win cinematic.
  cylinder(g,3.8,4.0,.48,0x26384f,0,.45,0,36);
  for(let k=0;k<12;k++){const a=k*TAU/12;sphere(g,.10,0xffdf93,3.4*Math.sin(a),.83,3.4*Math.cos(a));}
  const rocket=new THREE.Group();rocket.name='ROCKET_V5_PLAYER';g.add(rocket);
  const body=cylinder(rocket,.74,.90,5.45,0xf2f2ef,0,3.5);body.material=M(0xf2f2ef,.22,.28);
  cone(rocket,.78,1.7,0xe75150,0,7.04);
  cylinder(rocket,.91,.91,.20,0xc7484a,0,1.0);
  torus(rocket,.73,.14,0x327fb4,0,5.03).rotation.x=Math.PI/2;
  for(let s of [-1,1]){const fin=box(rocket,.34,2.55,1.60,0xce4351,s*.98,1.75);fin.rotation.z=s*.25;}
  for(let y of [3.9,5.3]){const w=sphere(rocket,.4,0x7bd1e2,0,y,.7,1,1,.3);}
  // Both the player and an NPC sit on the rocket and fly together.
  const rocketCrew=addRocketCrew(rocket);
  const plume=new THREE.Group();plume.position.y=.6;rocket.add(plume);
  const flame=cone(plume,.62,1.8,0xffba43,0,-.95,0);
  const inner=cone(plume,.29,1.28,0xfff5b3,0,-.82,0);
  const badge=label3d('10 CÂU · 1 TÊN LỬA',5.9,.86,'#273a50','#fff3c6',40);
  badge.position.set(0,7.8,-3);g.add(badge);
  const altitudeOrbs=[];
  for(const side of [-1,1]){
    cylinder(g,.18,.22,7.2,0x2b3d52,side*3.8,3.6,0,16);
    beam(g,[side*3.8,2.0,0],[side*1.4,3.1,0],.08,0xf0ad4e);
    beam(g,[side*3.8,4.8,0],[side*1.4,5.6,0],.08,0xf0ad4e);
    const beacon=sphere(g,.17,0xff3b30,side*3.8,7.3,0);
    beacon.material.emissive=new THREE.Color(0xff3b30);
    beacon.material.emissiveIntensity=0.88;
  }
  // R107: 10-Tier Altitude Telemetry Lights along the launch gantry
  for(let step=0;step<10;step++){
    const orb=sphere(g,.14,0x334155,-3.8,1.15+step*0.58,.28);
    altitudeOrbs.push(orb);
  }
  const shockRing=torus(g,2.2,.08,0x38bdf8,0,.74,0);shockRing.rotation.x=Math.PI/2;
  app.rocket={rocket,plume,flame,inner,crew:rocketCrew,altitudeOrbs,shockRing,progress:0,state:'idle',at:0,baseY:0};
 }else if(i===2){ // Central portal into the special room; NO separate page/renderer.
  cylinder(g,4.8,4.9,.3,0x7f442a,0,.7,0,38);
  const pond=mesh(new THREE.RingGeometry(5.2,7.2,48),0x1aa9ca,g,0,.08,0);pond.rotation.x=-Math.PI/2;pond.material.transparent=true;pond.material.opacity=.82;
  for(let lp=0;lp<10;lp++){
    const la=lp*TAU/10;
    const pad=cylinder(g,.38,.42,.03,0x2d8a55,6.2*Math.sin(la),.12,6.2*Math.cos(la));
    sphere(pad,.14,0xf472b6,0,.08,0);
  }
  for(const x of [-2.1,2.1]){
    cylinder(g,.3,.35,5.1,0xb55d31,x,3.28,0);
    cylinder(g,.43,.48,.35,0xe6b96d,x,5.9);
  }
  box(g,5.6,.35,1.2,0xa0422c,0,6.2,0);
  box(g,6.4,.22,1.4,0x7d2816,0,6.45,0);
  const arch=torus(g,2.4,.21,0xffd878,0,3.6,0);arch.rotation.z=Math.PI;
  const vortex=mesh(new THREE.CircleGeometry(2.05,48),0x80466b,g,0,3.5,.1);
  vortex.material=new THREE.MeshBasicMaterial({color:0x9a587c,transparent:true,opacity:.48,side:THREE.DoubleSide,depthWrite:false});
  const lotus=sphere(g,.58,0xe6c885,0,1.42,.62,1.45,.45,.8);
  for(const side of [-3.4,3.4]){
    cylinder(g,.3,.36,.55,0x4a2c20,side,.65,1.2,16);
    cylinder(g,.12,.16,1.7,0x8c5338,side,1.75,1.2,16);
    const lantern=sphere(g,.32,0xffbe55,side,2.8,1.2);
    lantern.material.emissive=new THREE.Color(0xffbe55);
    lantern.material.emissiveIntensity=0.85;
  }
  const censer=cylinder(g,.55,.45,.58,0x8b6538,0,.85,2.4,18);
  for(let l=0;l<3;l++){
    const la=l*TAU/3;cylinder(g,.08,.12,.45,0x6e4f2a,.35*Math.sin(la),.3,.35*Math.cos(la)+2.4);
  }
  for(const s of [-1,1]){
    const h=torus(g,.24,.05,0xaa824c,s*.55,.9,2.4);h.rotation.y=Math.PI/2;
  }
  for(let st=-1;st<=1;st++){
    cylinder(g,.02,.02,.6,0xba3228,st*.12,1.3,2.4);
    const tip=sphere(g,.035,0xff3b30,st*.12,1.6,2.4);tip.material.emissive=new THREE.Color(0xff3b30);
  }
  const banner=label3d('THÍCH HỌC BÁ TỰ',5.6,.9,'#5c2214','#ffe099',40);banner.position.set(0,5.4,.2);g.add(banner);
  const subBanner=label3d('CỬA PHÒNG THÍCH HỌC BÁ',7.0,.85,'#6d3024','#ffdfa1',32);subBanner.position.set(0,7.25,.2);g.add(subBanner);
  app.portal={vortex,lotus,correctAt:0,failAt:0};
  app.animated.push(t=>{
    const ageOk=(performance.now()-(app.portal.correctAt||0))/1000;
    const ageFail=(performance.now()-(app.portal.failAt||0))/1000;
    if(ageOk<2.0){
      vortex.material.opacity=.75+.25*Math.sin(t*22);
      vortex.material.color.setHex([0xffd700,0x48e3be,0x38bdf8,0xf472b6][Math.floor((t*8)%4)]);
      lotus.rotation.y=t*2.8;
      lotus.scale.setScalar(1.0+.3*Math.sin(Math.PI*Math.min(1,ageOk/2.0)));
    }else if(ageFail<2.0){
      vortex.material.opacity=.22;
      vortex.material.color.setHex(0x5c3d2e);
      lotus.rotation.y=t*.15;
    }else{
      vortex.material.opacity=.33+.14*Math.sin(t*1.35);
      vortex.material.color.setHex(0x9a587c);
      lotus.rotation.y=t*.35;
      lotus.scale.setScalar(1.0);
    }
  });
 }else if(i===3){app.bridge=createGlassBridge(g);
 }else if(i===4){app.tug=createTugScene(g);
 }else if(i===5){app.soccer=createSoccerScene(g);
 }else if(i===6){app.architect=createArchitectScene(g);
 }else if(i===7){createMazeEntrance(g);
 }else if(i===8){app.coaster=createCoasterScene(g);
 }else if(i===9){app.balloon=createBalloonScene(g);}
 else if(i===10){app.millionaire=createMillionaireScene(g);}
}

function buildSanctuaryRoom(){
  const room=new THREE.Group();room.name='SPECIAL_THICH_HOC_BA_ROOM_IN_SAME_WORLD';
  room.position.set(0,0,SANCTUARY_LOCAL_Z);app.scene.add(room);
  room.visible=false;
  // Original stylized low-poly contemplative study room; the reference website's assets are NOT imported.
  const red=0x632819, darkRed=0x36180f, gold=0xe8b76c, blue=0x345f7c;
  box(room,30,.50,40,0x4f2d21,0,-.30,0);
  for(let x=-12;x<=12;x+=4){for(let z=-17;z<=17;z+=4){box(room,3.75,.05,3.75,((x+z)/4)%2===0?0x5a3325:0x71422d,x,.02,z);}}
  for(const x of [-15,15])box(room,.6,14,40,darkRed,x,6.5,0);
  box(room,30,13,.60,darkRed,0,6.4,-20);
  const roof=box(room,31,.8,41,0x4e271a,0,13.1,0);
  for(const x of [-12,-6,6,12]){
    for(const z of [-16,0,16]){
      cylinder(room,.47,.51,12,0x8b3021,x,6,z);
      cylinder(room,.63,.68,.48,gold,x,11.85,z);
      cylinder(room,.63,.70,.5,gold,x,.28,z);
    }
  }
  // Center aisle and 24 meditation cushions.
  box(room,4.0,.1,30,0x864c30,0,.07,1);
  for(const x of [-9.5,-6.8,-4.1,4.1,6.8,9.5]){
    for(const z of [-10,-3,4,11]){
      box(room,2.1,.10,2.5,0x8a422b,x,.12,z);
      box(room,1.87,.09,2.25,0xd3a053,x,.19,z);
      cylinder(room,.85,.88,.14,0x765135,x,.31,z,14);
    }
  }
  // Seated visiting avatars make the hall feel alive, while keeping every model original.
  const robes=[0x477698,0x355d79,0x507b8f,0x4b6484];
  for(let i=0;i<12;i++){
    const col=i%6,row=Math.floor(i/6),x=[-9.5,-6.8,-4.1,4.1,6.8,9.5][col],z=3+row*7;
    const person=new THREE.Group();person.position.set(x,.39,z);room.add(person);
    sphere(person,.56,robes[i%4],0,.53,0,1.25,.90,.84);
    cylinder(person,.38,.56,.65,robes[i%4],0,1.15,0,16);
    sphere(person,.34,i%3===0?0xc8916a:0xe0a779,0,1.7,.07);
    sphere(person,.31,0x39261e,0,1.86,-.11,1,.5,.8);
    for(const side of [-1,1])sphere(person,.16,0xdba674,side*.18,1.08,.4,1,.9,.65);
    sphere(person,.07,0xe9bf72,0,1.07,.50);
  }
  // Altar with a primary statue and respectful original iconographic shapes.
  box(room,12,1.45,5.5,0x6c291d,0,.78,-16.2);
  box(room,11.0,.22,5.4,gold,0,1.57,-16.2);
  box(room,9.7,.66,4.9,0x963d25,0,1.94,-16.2);
  const aureole=torus(room,3.0,.30,gold,0,8.1,-17.9);aureole.rotation.y=0;
  const glow=sphere(room,3.1,0xb27337,0,8.1,-18.2,1,.98,.12);
  const statue=new THREE.Group();statue.position.set(0,2.25,-16.45);room.add(statue);
  // Sitting Buddha statue: golden head, halo, draped garment, folded legs and hands.
  cylinder(statue,2.2,2.45,.48,0xb68c43,0,.2,0,32);
  const seated=sphere(statue,2.05,0x395773,0,1.22,0,1.5,.58,1);
  cylinder(statue,1.65,2.2,2.95,0x3d6380,0,3.05,0,22);
  for(const x of [-1.25,1.25]){
    sphere(statue,.52,0xc68b53,x,3.15,.65,.55,1.35,1);
    sphere(statue,.37,0xc68b53,x*.52,1.98,1.55,1,1,.6);
  }
  sphere(statue,.95,0xd99d61,0,5.45,.20);
  const hair=sphere(statue,.95,0x8e542d,0,5.82,-.02,1.04,.70,.95);
  for(let i=0;i<10;i++){const a=i*TAU/10;sphere(statue,.12,0xa36e3a,.77*Math.sin(a),6.05,.78*Math.cos(a));}
  sphere(statue,.11,0x8e552d,-.35,5.48,1.09,1,.46,.35);
  sphere(statue,.11,0x8e552d,.35,5.48,1.09,1,.46,.35);
  // The second small seated NPC poses and presents questions — R107: Sư Học Bá (Sư Chùa Đầu Trọc Chibi)
  const monkNpc=new THREE.Group();monkNpc.position.set(-4,0,-8);room.add(monkNpc);
  cylinder(monkNpc,1.25,1.35,.24,0xd97706,0,.12,0,24);
  const monkHalo=torus(monkNpc,1.42,.045,0xfbbf24,0,.26,0);monkHalo.rotation.x=Math.PI/2;
  sphere(monkNpc,1.05,0xd97706,0,.87,0,1.35,.63,.95);
  cylinder(monkNpc,.72,.99,1.65,0xf59e0b,0,2.10,0,18);
  // Kasaya diagonal red-brown monastic sash
  box(monkNpc,.36,1.45,.52,0x9a3412,.18,2.12,.36).rotation.z=-0.38;
  // Bald Chibi Monk Head + 6 Wisdom Dots on forehead
  sphere(monkNpc,.64,0xf3c69f,0,3.22,.09);
  for(const [dx,dy] of [[-.09,3.56],[.09,3.56],[-.09,3.47],[.09,3.47],[-.09,3.38],[.09,3.38]]){
    sphere(monkNpc,.028,0xb45309,dx,dy,.68);
  }
  sphere(monkNpc,.17,0xf3c69f,-.38,2.04,.73);
  sphere(monkNpc,.17,0xf3c69f,.38,2.04,.73);
  const guideSign=label3d('SƯ HỌC BÁ CHIBI · BỐC QUẺ',6.5,1.12,'#4b291d','#ffdfa1',35);
  guideSign.position.set(-4,5.0,-8);room.add(guideSign);
  // Hand-drawn fortune stick tube: the drawn wooden stick rises above the vessel.
  cylinder(room,.55,.38,.8,0x9c5930,-1.30,1.05,-8,18);
  cylinder(room,.46,.46,.14,0xe7bd70,-1.30,1.49,-8,18);
  for(let k=0;k<9;k++){
    const a=k*TAU/9;
    const stick=box(room,.075,1.35,.075,0xf0cd88,-1.30+.25*Math.cos(a),2.05,-8+.25*Math.sin(a));
    stick.rotation.x=.15*Math.sin(a);stick.rotation.z=.15*Math.cos(a);
  }
  const fortuneStick=box(room,.13,1.66,.13,0xfce3a4,-1.30,2.2,-8);
  fortuneStick.visible=false;
  const plaques=[['TÂM AN · TRÍ SÁNG',-11.0],['KIẾN THỨC · KIÊN TRÌ',11.0]];
  plaques.forEach(([text,x])=>{box(room,4.1,6,.12,0x381b13,x,8,-19.52);const sign=label3d(text,3.9,1.65,'#51261a','#eac47b',34);sign.position.set(x,8,-19.36);room.add(sign);});
  for(const x of [-5.7,5.7]){
    cylinder(room,.28,.43,2.4,0xb06c32,x,2.7,-13.2);
    const sBulb=sphere(room,.30,0xffdba7,x,4.14,-13.2);
    if(sBulb.material){sBulb.material.emissive=new THREE.Color(0xffd29d);sBulb.material.emissiveIntensity=0.8;}
  }
  const title=label3d('PHÒNG THÍCH HỌC BÁ',12,1.2,'#5e281b','#fff0c2',51);
  title.position.set(0,11.0,-19.4);room.add(title);
  // Exit arch at near/front end of room.
  box(room,7,1.2,.6,0x8d3929,0,6.1,18.7);
  for(const x of [-3.1,3.1])box(room,.7,7,.7,0x913923,x,3.2,18.7);
  const exitSign=label3d('CỬA TRỞ VỀ CÔNG VIÊN',6.2,.75,'#4e2a1c','#f7dfab',37);
  exitSign.position.set(0,7.2,18.7);room.add(exitSign);
  enrichSanctuary(room);
  app.sanctuary={room,monkNpc,fortuneStick,fortuneAt:0,doorLocalZ:SANCTUARY_LOCAL_Z+14,altarLocalZ:SANCTUARY_LOCAL_Z-8,active:false};
}
function updateRocketAnimation(t){
  const r=app.rocket;if(!r)return;
  const since=(performance.now()-r.at)/1000;
  if(r.state==='fail'){
    r.rocket.position.y= Math.min(160,7.5*Math.pow(Math.max(0,since),2.5)*7);
    r.rocket.rotation.z=.10*Math.sin(since*18);
    r.rocket.visible=since<2.15;
    r.plume.visible=since<2.15;
    r.plume.scale.set(1+Math.sin(t*31)*.17,1.7+Math.sin(t*42)*.4,1);
  }else if(r.state==='win'){
    r.rocket.position.y=12*Math.min(since,2.7)*Math.min(since,2.7);
    r.rocket.rotation.z=.03*Math.sin(since*10);
    r.rocket.visible=since<3.4;
    r.plume.visible=since<3.4;
  }else{
    r.rocket.visible=true;
    r.rocket.position.y= r.progress*.43 + Math.sin(t*2.2)*.07;
    r.rocket.rotation.set(0,Math.sin(t*.4)*.06,0);
    r.plume.visible=r.state==='play';
    r.plume.scale.y=.8+.12*Math.sin(t*21);
    if(r.altitudeOrbs){
      r.altitudeOrbs.forEach((orb,idx)=>{
        const lit=idx<r.progress;
        orb.material=M(lit?0x34d399:0x334155,lit?.3:0,lit?.25:.68,lit?0x10b981:0);
        orb.scale.setScalar(lit?1.25:1.0);
      });
    }
    if(r.shockRing){
      r.shockRing.scale.setScalar(1+.12*r.progress+.08*Math.sin(t*5));
    }
  }
}
function animateChickens(dt,t){const h=app.chickens;if(!h)return;h.prof.position.y=.08+.13*Math.sin(t*1.8);
 const eliminatedCount=h.rivals.filter(r=>r.eliminated).length;
 if(h.crown)h.crown.scale.setScalar(1+eliminatedCount*0.06);
 const animateMove=(obj,idx)=>{if(obj.eliminated){const e=(performance.now()-obj.kickAt)/1000;if(e>=1.2){obj.root.visible=false;return;}const d=5*e*e;obj.root.position.set(obj.x+Math.sin(obj.a)*d,.36+3.2*Math.sin(Math.PI*Math.min(e/1.2,1)),obj.z+Math.cos(obj.a)*d);obj.root.rotation.z=e*4.4;obj.root.rotation.x=e*3;obj.root.scale.setScalar(.73*(1-.58*e));}else{obj.root.position.y=.36+.06*Math.sin(t*2.6+idx);obj.root.rotation.y=Math.atan2(-obj.x,-obj.z)+.12*Math.sin(t+idx);}};
 h.rivals.forEach(animateMove);
 if(h.player.userData.kicked){const f=(performance.now()-h.player.userData.kickAt)/1000;if(f<1.3){h.player.position.set(f*5, .36+3*Math.sin(Math.PI*f/1.3),1.55+f*8);h.player.rotation.z=f*5;h.player.scale.setScalar(1.36*(1-f*.45));}else h.player.visible=false;}
 else{const attackAge=(performance.now()-(h.player.userData.attackAt||-10000))/1000;
  if(attackAge>=0&&attackAge<.64){
   const p=Math.sin(Math.PI*attackAge/.64);const target=h.attackTarget;
   h.player.position.set(target?.x*p*.78||0,.36+.52*p,1.55+((target?.z??-1.0)-1.55)*p*.82);
   h.player.rotation.x=-.4*p;
   h.player.rotation.y=(attackAge/.64)*TAU;
   if(h.shockRing){h.shockRing.visible=true;h.shockRing.scale.setScalar(0.6+attackAge*3.2);}
  }
  else{
   h.player.position.set(0,.36+.09*Math.sin(t*3),1.55);h.player.rotation.x=0;h.player.rotation.y=0;
   if(h.shockRing)h.shockRing.visible=false;
  }
  h.player.rotation.z=.07*Math.sin(t*2);}
}
function resetChickens(){const h=app.chickens;if(!h)return;h.win=false;h.rivals.forEach((r)=>{r.root.visible=true;r.root.position.set(r.x,.36,r.z);r.root.rotation.set(0,Math.atan2(-r.x,-r.z),0);r.root.scale.setScalar(.73);r.eliminated=false;r.kickAt=0;});h.player.visible=true;h.player.position.set(0,.36,1.55);h.player.rotation.set(0,0,0);h.player.scale.setScalar(1.36);h.attackTarget=null;h.player.userData.kicked=false;h.player.userData.attackAt=0;}
function kickEnemy(){if(!app.chickens){app.rivalCount--;return;}const r=app.chickens.rivals.find(r=>!r.eliminated);if(!r)return;r.eliminated=true;r.kickAt=performance.now();app.chickens.attackTarget={x:r.x,z:r.z};app.chickens.player.userData.attackAt=performance.now();app.rivalCount--;}
function kickPlayer(){if(!app.chickens)return;app.chickens.player.userData.kicked=true;app.chickens.player.userData.kickAt=performance.now();}

function signClickable(mesh,parkType,index=null){
  mesh.userData.parkType=parkType;
  if(index!==null)mesh.userData.parkZone=index;
  app.clickable.push(mesh);
}
function buildInlinePark(){
  const scene=app.scene;
  // R107: Cầu Xuyên Tâm Hướng Nam nối thẳng từ Đảo Trung Tâm GRAND DOME (0,0) tới Cổng Wonder Park (0, 66)
  addPath([0,0,84],[0,0,62],9.2,0xfffdf8);
  // Elegant ground pathway guide strips along both borders
  for(const side of [-4.6, 4.6]){
    box(scene,.32,.14,22,0xfbbf24,side,.09,73);
    for(let gz=64;gz<=82;gz+=6){
      const beacon=box(scene,.18,.14,.45,0x38bdf8,side,.10,gz);
      if(beacon.material){beacon.material.emissive=new THREE.Color(0x38bdf8);beacon.material.emissiveIntensity=0.8;}
    }
  }
  // Symmetrical cyber-lantern pairs spaced gracefully along the South radial bridge
  for(const lz of [66, 78]){
    addLamp(-7.0, lz);
    addLamp(7.0, lz);
  }
  // Đảo Vệ Tinh Hướng Nam WONDER PARK Mở Rộng (Tâm (0, 138), Bán kính R = 82m thoáng rộng cho 11 khu vực riêng)
  cylinder(scene,82.0,82.5,1.25,0x6ee7b7,0,-0.78,CENTER_Z,128);
  const southGoldRim=torus(scene,82.2,.46,0xfbbf24,0,0.05,CENTER_Z);
  southGoldRim.rotation.x=Math.PI/2;
  cylinder(scene,74.8,75.2,1.22,0xfffdf8,0,-0.62,CENTER_Z,128);
  // Inner Sanctuary Promenade Ring & Outer Game Boulevard Ring
  const ring=mesh(new THREE.RingGeometry(24.5,32.5,128),0xf5ebd6,scene,0,.07,CENTER_Z);
  ring.rotation.x=-Math.PI/2;
  const ringEdge=mesh(new THREE.RingGeometry(32.55,33.1,128),0xfbbf24,scene,0,.075,CENTER_Z);
  ringEdge.rotation.x=-Math.PI/2;
  const outerBoulevard=mesh(new THREE.RingGeometry(RADIUS-5.2,RADIUS+5.2,128),0xf5ebd6,scene,0,.065,CENTER_Z);
  outerBoulevard.rotation.x=-Math.PI/2;
  const outerBoulevardRim=mesh(new THREE.RingGeometry(RADIUS+5.2,RADIUS+5.7,128),0xfbbf24,scene,0,.07,CENTER_Z);
  outerBoulevardRim.rotation.x=-Math.PI/2;
  addPath([0,0,62],[0,0,21.8],9.2,0xd2b18b);
  addPath([0,0,15.6],[0,0,3.5],7.6,0xd8b58a);
  for(let i=0;i<ZONES.length;i++){
    const pos=zoneLocation(i);app.zonePositions.push(pos);
    const rr=32.2/RADIUS;
    const rEnd=(RADIUS-11.8)/RADIUS;
    if(i!==2)addPath([pos.x*rr,0,CENTER_Z+(pos.z-CENTER_Z)*rr],[pos.x*rEnd,0,CENTER_Z+(pos.z-CENTER_Z)*rEnd],5.2,0xd8b689);
    const root=new THREE.Group();root.name=`WONDER_PARK_ZONE_${i+1}`;root.position.set(pos.x,0,pos.z);root.userData.parkZone=i;
    scene.add(root);app.zoneRoots.push(root);
    // Khu vực Quảng trường riêng (Private Spacious Plaza) bao quanh từng trò chơi để không gian rộng rãi, tách biệt
    const outerPlazaR=i===2?16.2:12.4;
    const outerPlaza=cylinder(root,outerPlazaR,outerPlazaR+.3,.10,0xfdf8ee,0,.04,0,56);
    signClickable(outerPlaza,'zone',i);
    const outerZoneRim=torus(root,outerPlazaR+.1,.12,ZONES[i].color,0,.10,0);
    outerZoneRim.rotation.x=Math.PI/2;
    if(outerZoneRim.material){
      outerZoneRim.material.emissive=new THREE.Color(ZONES[i].color);
      outerZoneRim.material.emissiveIntensity=0.55;
    }
    cylinder(root,i===2?12.8:8.85,i===2?13.1:9.15,.20,0x18333e,0,.08,0,48);
    const pedestal=cylinder(root,i===2?12.0:8.25,i===2?12.2:8.45,.75,0x2a5863,0,.15,0,48);
    signClickable(pedestal,'zone',i);
    cylinder(root,i===2?11.5:7.65,i===2?11.5:7.65,.24,ZONES[i].color,0,.58,0,48);
    const platform=cylinder(root,i===2?11.6:7.72,i===2?11.7:7.82,.06,0xe7d6af,0,.74,0,48);
    platform.material.transparent=true;platform.material.opacity=.21;
    signClickable(platform,'zone',i);
    const neonRim=torus(root,i===2?11.75:7.85,.095,ZONES[i].color,0,.72,0);
    neonRim.rotation.x=Math.PI/2;
    neonRim.material.emissive=new THREE.Color(ZONES[i].color);
    neonRim.material.emissiveIntensity=0.88;
    for(let c=0;c<4;c++){
      const ang=c*Math.PI/2+Math.PI/4;
      const cr=i===2?14.8:11.4;
      const cx=Math.sin(ang)*cr,cz=Math.cos(ang)*cr;
      cylinder(root,.16,.21,2.2,0x1e3a5f,cx,1.15,cz,16);
      cylinder(root,.25,.28,.18,0xd4af37,cx,2.30,cz,16);
      const orb=sphere(root,.26,ZONES[i].color,cx,2.62,cz);
      orb.material.emissive=new THREE.Color(ZONES[i].color);
      orb.material.emissiveIntensity=0.85;
    }
    const holoGem=mesh(new THREE.OctahedronGeometry(i===2?.75:.52,0),ZONES[i].color,root,0,i===2?8.6:6.6,0);
    holoGem.material.emissive=new THREE.Color(ZONES[i].color);
    holoGem.material.emissiveIntensity=0.85;
    holoGem.material.transparent=true;
    holoGem.material.opacity=0.88;
    app.animated.push(t=>{
      holoGem.rotation.y=t*1.6;
      holoGem.rotation.x=Math.sin(t*1.2)*0.22;
      holoGem.position.y=(i===2?8.6:6.6)+Math.sin(t*2.2+i)*0.26;
    });
    buildZoneModel(i,root);
    if(i!==0&&i!==2){const staff=npc(pos.x-5.4,pos.z+9.4,ZONES[i].color,ZONES[i].staff);
      staff.userData.parkZone=i;
      staff.traverse(obj=>{if(obj.isMesh && obj.geometry?.type==='CylinderGeometry'){obj.userData.parkZone=i;}});
      signClickable(staff,'zone',i);
    }
    // Architectural gateway arch for station sign at the entrance of each private game plaza
    const gateZ=i===2?12.2:10.4;
    cylinder(root,.15,.18,5.0,0x1e3a5f,-3.4,2.5,gateZ,14);
    cylinder(root,.15,.18,5.0,0x1e3a5f,3.4,2.5,gateZ,14);
    sphere(root,.26,0xd4af37,-3.4,5.1,gateZ);
    sphere(root,.26,0xd4af37,3.4,5.1,gateZ);
    box(root,7.4,.22,.36,0xd4af37,0,5.18,gateZ);
    const sign=label3d(`${i+1}. ${ZONES[i].short.toUpperCase()}`,7.2,1.25,'#0f2942','#fff5bf',40);
    sign.position.set(0,5.25,gateZ);root.add(sign);signClickable(sign,'zone',i);
  }
  // Partition gardens between each pair of adjacent games for distinct separation
  for(let k=0;k<OUTER_GAME_IDS.length;k++){
    const slotA=k,slotB=(k+1)%OUTER_GAME_IDS.length;
    const angA=.34+slotA*TAU/OUTER_GAME_IDS.length,angB=.34+slotB*TAU/OUTER_GAME_IDS.length;
    const midAng=(angA+(slotB===0?angB+TAU:angB))/2;
    const px=(RADIUS+3.2)*Math.sin(midAng),pz=CENTER_Z+(RADIUS+3.2)*Math.cos(midAng);
    cylinder(scene,4.2,4.5,.14,0xc9b996,px,.07,pz,24);
    addLamp(px,pz);
    for(const s of [-1,1]){
      const bx=px+s*2.2*Math.cos(midAng),bz=pz-s*2.2*Math.sin(midAng);
      box(scene,1.4,.38,.45,0x6f4225,bx,.28,bz);
      box(scene,1.4,.48,.1,0x8b5632,bx,.58,bz-.18);
    }
    addTree(px*1.10,CENTER_Z+(pz-CENTER_Z)*1.10,.72);
    addFlowerClump(px+1.5*Math.cos(midAng),pz-1.5*Math.sin(midAng));
    addFlowerClump(px-1.5*Math.cos(midAng),pz+1.5*Math.sin(midAng));
  }
  // Low-poly perimeter boundary, interrupted at the main entrance (+Z).
  // 10 separate games stay on the outer circle; learning sanctuary is centered.
  const fenceRadius=78.5, fenceSteps=44;
  for(let k=0;k<fenceSteps;k++){
    const a=k*TAU/fenceSteps, b=(k+1)*TAU/fenceSteps;
    if(Math.min(Math.abs(a),Math.abs(TAU-a))<.20)continue;
    const x=Math.sin(a)*fenceRadius,z=CENTER_Z+Math.cos(a)*fenceRadius;
    box(scene,.45,2.15,.45,0x9d653d,x,1.08,z);
    if(Math.abs(b-a)<.30){
      const nx=Math.sin(b)*fenceRadius,nz=CENTER_Z+Math.cos(b)*fenceRadius;
      if(Math.min(Math.abs(b),Math.abs(TAU-b))>=.20){
        beam(scene,[x,1.25,z],[nx,1.25,nz],.09,0xd1a16c);
      }
    }
  }
  // Vegetation deliberately kept inside the 82m island rim to preserve symmetry and FPS.
  for(let i=0;i<24;i++){
    const a=i*TAU/24, rr=75.8+(i%2)*1.4;
    const x=Math.sin(a)*rr,z=CENTER_Z+Math.cos(a)*rr;
    if(z>36&&Math.abs(x)<14)continue;
    addTree(x,z,.66);
  }
  for(let i=0;i<12;i++){const a=i*TAU/12;
    addLamp(Math.sin(a)*38,CENTER_Z+Math.cos(a)*38);
  }
  // Phòng Thích Học Bá remains the one central portal, surrounded by 10 separate game zones.
  const gate=createGate();gate.name='ACTUAL_PARK_ENTRANCE_IN_SAME_SCENE';
  gate.traverse(obj=>{
    if(obj.isMesh && (obj.geometry.type==='BoxGeometry'||obj.geometry.type==='PlaneGeometry')){
      if(obj.position.y>4.5)signClickable(obj,'gate');
    }
  });
  const reception=npc(-10,49,0x5c9dbf,'LỄ TÂN LINH');
  signClickable(reception,'gate');
  const insideNpc=npc(8.5,29,0x47a9a1,'HƯỚNG DẪN LINH');
  signClickable(insideNpc,'guide');
  return scene;
}
export function createWonderParkWorld(){
  const group=new THREE.Group();group.name='WONDER_PARK_PHYSICAL_GROUNDS_IN_GRAND_CAMPUS';
  group.position.set(WONDER_PARK_LOCATION.originX,0,WONDER_PARK_LOCATION.originZ);
  group.rotation.y=Math.PI; // gate now opens TOWARD the central hall (negative world Z)
  app={scene:group,gatePanels:[],npcRoots:[],animated:[],chickens:null,rocket:null,bridge:null,architect:null,coaster:null,balloon:null,tug:null,soccer:null,millionaire:null,maze:null,portal:null,sanctuary:null,
    zonePositions:[],zoneRoots:[],clickable:[],rivalCount:10,focusedGame:null};
  buildInlinePark();
  buildSanctuaryRoom();
  app.maze=createMazeScene(THREE,group);
  let gateOpen=false,gateProgress=0,opening=false,elapsed=0;
  const at=p=>({x:group.position.x-p.x,z:group.position.z-p.z}); // 180-degree rotated park
  const getSanctuaryDoorWorldPosition=()=>at({x:0,z:SANCTUARY_LOCAL_Z+13});
  const getSanctuaryNpcWorldPosition=()=>at({x:-4,z:SANCTUARY_LOCAL_Z-8});
  const getNear=(player)=>{
    if(!player)return null;
    if(app.sanctuary?.active){const door=getSanctuaryDoorWorldPosition();
      if(Math.hypot(player.x-door.x,player.z-door.z)<5)return {type:'sanctuary-exit'};
      const npc=getSanctuaryNpcWorldPosition();if(Math.hypot(player.x-npc.x,player.z-npc.z)<7)return {type:'sanctuary-npc'};
      return null;}
    const gd=Math.hypot(player.x-WONDER_PARK_LOCATION.gateX,
      player.z-WONDER_PARK_LOCATION.gateZ);
    if(gd<12) return {type:'gate',distance:gd};
    if(!gateOpen && !opening)return null;
    for(let i=0;i<app.zonePositions.length;i++){
      const pos=at(app.zonePositions[i]);const d=Math.hypot(player.x-pos.x,player.z-pos.z);
      if(d<(i===2?16.2:13.2))return {type:'zone',index:i,distance:d};
    }
    const guide=at({x:8.5,z:29});
    const d=Math.hypot(player.x-guide.x,player.z-guide.z);
    if(d<11)return {type:'guide',distance:d};
    return null;
  };
  function collidePark(old,next){
    let p={x:next.x,z:next.z};
    if(p.z<52)return p;
    const parkCenter={x:0,z:138};
    const dCenter=Math.hypot(p.x-parkCenter.x,p.z-parkCenter.z);
    // Auto-open the Wonder Park gate when the player approaches the South Island or walks along the bridge
    if(!gateOpen&&!opening&&dCenter<82.0){
      opening=true;
    }
    // Cột cổng chào Khải Hoàn Môn (Twin Cyber Pylons) luôn có va chạm vật lý cố định
    for(const postX of [-6.8,6.8]){
      const dx=p.x-postX,dz=p.z-66;
      const d=Math.hypot(dx,dz);
      const postRadius=2.1;
      if(d<postRadius){
        const factor=postRadius/(d||0.001);
        p.x=postX+dx*factor;p.z=66+dz*factor;
      }
    }
    // Only constrain to fenceRadius if player was already inside the park AND not walking on the North bridge or Orbital Ring (r≈138)
    const dOldCenter=Math.hypot((old?.x??p.x)-parkCenter.x,(old?.z??p.z)-parkCenter.z);
    const fenceRadius=76.5;
    const onNorthBridge=Math.abs(p.x)<=11.5&&p.z<=72.0;
    const onOrbitalRing=Math.abs(Math.hypot(p.x,p.z)-138.0)<=12.5;
    if(p.z>=66&&dOldCenter<=fenceRadius&&dCenter>fenceRadius&&!onNorthBridge&&!onOrbitalRing){
      const factor=fenceRadius/(dCenter||0.001);
      p.x=parkCenter.x+(p.x-parkCenter.x)*factor;
      p.z=parkCenter.z+(p.z-parkCenter.z)*factor;
    }
    // Bục trung tâm Phòng Thích Học Bá (Zone 2) có bán kính bục 12.8m, ngăn đi xuyên vào điện thờ
    const dCentral=Math.hypot(p.x-parkCenter.x,p.z-parkCenter.z);
    const centralRadius=12.8;
    if(dCentral<centralRadius){
      const factor=centralRadius/(dCentral||0.001);
      p.x=parkCenter.x+(p.x-parkCenter.x)*factor;
      p.z=parkCenter.z+(p.z-parkCenter.z)*factor;
    }
    // 10 bục trò chơi xung quanh: bán kính bục thực tế 8.85m, ngăn hoàn toàn việc đi xuyên vào bục
    for(let i=0;i<app.zonePositions.length;i++){
      if(i===2)continue;
      const pos=at(app.zonePositions[i]);
      const dx=p.x-pos.x,dz=p.z-pos.z;
      const dist=Math.hypot(dx,dz);
      const rPedestal=8.85;
      if(dist<rPedestal){
        const factor=rPedestal/(dist||0.001);
        p.x=pos.x+dx*factor;p.z=pos.z+dz*factor;
      }
    }
    return p;
  }
  return {
    group,zones:ZONES,clickable:app.clickable,location:WONDER_PARK_LOCATION,
    collidePark,
    get gateOpen(){return gateOpen;},
    get opening(){return opening;},
    getZoneWorldPosition(i){return at(app.zonePositions[i]);},
    getNear,
    getClickableInfo(object){
      for(let obj=object;obj&&obj!==group;obj=obj.parent){
        if(obj.userData?.parkType==='gate')return {type:'gate'};
        if(Number.isInteger(obj.userData?.parkZone))return {type:'zone',index:obj.userData.parkZone};
        if(obj.userData?.parkType==='guide')return {type:'guide'};
      }
      return null;
    },
    openGate(){if(gateOpen||opening)return false;opening=true;return true;},
    closeGate(){opening=false;gateOpen=false;gateProgress=0;app.gatePanels.forEach(p=>p.hinge.rotation.y=0);
      app.sanctuary.active=false;app.sanctuary.room.visible=false;app.focusedGame=null;app.zoneRoots.forEach(root=>{root.visible=true;});
      resetChickens();app.bridge?.reset();app.architect?.reset();app.coaster?.reset();app.balloon?.reset();app.tug?.reset();app.soccer?.reset();app.millionaire?.reset();app.maze?.hide();return true;},
    resetChicken:resetChickens,
    kickEnemy,
    kickPlayer,
    get activeGame(){return app.focusedGame;},
    get sanctuaryActive(){return app.sanctuary.active;},
    focusGame(i){app.focusedGame=i;app.zoneRoots.forEach((root,k)=>{root.visible=i===9||k===i;});},
    clearGameFocus(){app.focusedGame=null;app.maze?.hide();app.zoneRoots.forEach(root=>{root.visible=true;});},
    resetTug(){app.tug?.reset();}, correctTug(){app.tug?.correct();}, failTug(){app.tug?.fail();},
    getTugCameraPose(view='sideline',zoom=1){
      const base=app.tug?.cameraPose?.(zoom)||null;if(!base)return null;
      if(view==='faceoff')return {eye:{x:base.look.x+3.8*zoom,y:base.look.y+1.5*zoom,z:base.look.z+4.6*zoom},look:{x:base.look.x,y:base.look.y+1.0,z:base.look.z},fov:62};
      if(view==='overhead')return {eye:{x:base.look.x,y:base.look.y+15.0*zoom,z:base.look.z+1.5*zoom},look:{x:base.look.x,y:base.look.y,z:base.look.z},fov:65};
      return base;
    },
    resetSoccer(){app.soccer?.reset();},correctSoccer(){app.soccer?.correct();},failSoccer(){app.soccer?.fail();},
    getSoccerCameraPose(view='striker',zoom=1){
      const base=app.soccer?.cameraPose?.(zoom)||null;if(!base)return null;
      if(view==='keeper')return {eye:{x:base.look.x,y:base.look.y+2.2*zoom,z:base.look.z-6.5*zoom},look:{x:base.look.x,y:base.look.y+1.0,z:base.look.z+4.0},fov:68};
      if(view==='stadium')return {eye:{x:base.look.x+13.0*zoom,y:base.look.y+11.0*zoom,z:base.look.z+14.0*zoom},look:{x:base.look.x,y:base.look.y+1.2,z:base.look.z},fov:64};
      return base;
    },
    resetMillionaire(){app.millionaire?.reset();},correctMillionaire(){app.millionaire?.correct();},failMillionaire(){app.millionaire?.fail();},
    getMillionaireCameraPose(view='hotseat',zoom=1){
      const base=app.millionaire?.cameraPose?.(zoom)||null;if(!base)return null;
      if(view==='crane')return {eye:{x:base.look.x+12.0*zoom,y:base.look.y+10.0*zoom,z:base.look.z+13.0*zoom},look:{x:base.look.x,y:base.look.y+1.2,z:base.look.z},fov:64};
      if(view==='overhead')return {eye:{x:base.look.x,y:base.look.y+16.0*zoom,z:base.look.z+2.0*zoom},look:{x:base.look.x,y:base.look.y,z:base.look.z},fov:68};
      return base;
    },
    startMazeLevel(level){return app.maze.reset(level);},
    showMazeRoute(visible){app.maze?.setRouteVisible(visible);},
    exitMaze(){app.maze?.hide();},
    collideMaze(old,next){return app.maze?.collide(old,next)||old;},
    mazeReachedExit(x,z){return app.maze?.atExit(x,z)||false;},
    getMazeCameraPose(player,yaw=0,view='maze_preview'){
      const isWalk = view==='maze_walk'||view===false;
      const isTop = view==='maze_top';
      if(isTop&&player){
        return {eye:{x:player.x,y:32,z:player.z+.1},look:{x:player.x,y:0,z:player.z},fov:68};
      }
      return app.maze?.cameraPose(player,yaw,view==='maze_preview'||view===true)||null;
    },
    get mazeActive(){return Boolean(app.maze?.active);},
    resetRocket(){const r=app.rocket;if(!r)return;r.state='play';r.progress=0;r.at=performance.now();r.rocket.visible=true;r.rocket.position.set(0,0,0);},
    correctRocket(){if(app.rocket){app.rocket.progress=Math.min(10,app.rocket.progress+1);}},
    failRocket(){if(app.rocket){app.rocket.state='fail';app.rocket.at=performance.now();}},
    winRocket(){if(app.rocket){app.rocket.state='win';app.rocket.at=performance.now();}},
    resetBridge(){app.bridge?.reset();},
    correctBridge(){app.bridge?.correct();},
    failBridge(){app.bridge?.fail();},
    getBridgeCameraPose(view='follow',zoom=1){
      if(view==='side')return app.bridge?.cameraPose('lookdown',zoom)||null;
      return app.bridge?.cameraPose(view,zoom)||null;
    },
    resetArchitect(){app.architect?.reset();},
    correctArchitect(){app.architect?.correct();},
    failArchitect(){app.architect?.fail();},
    getArchitectCameraPose(view='facade',zoom=1){
      const base=app.architect?.cameraPose?.(zoom)||null;if(!base)return null;
      if(view==='isometric')return {eye:{x:base.look.x+15.0*zoom,y:base.look.y+13.5*zoom,z:base.look.z+16.0*zoom},look:{x:base.look.x,y:base.look.y+2.0,z:base.look.z},fov:62};
      if(view==='walk')return {eye:{x:base.look.x+5.2*zoom,y:base.look.y+2.4*zoom,z:base.look.z+6.2*zoom},look:{x:base.look.x,y:base.look.y+2.0,z:base.look.z},fov:72};
      return base;
    },
    resetCoaster(){app.coaster?.reset();},
    correctCoaster(){app.coaster?.correct();},
    failCoaster(){app.coaster?.fail();},
    winCoaster(){if(app.coaster){app.coaster.phase='station';app.coaster.elapsed=0;}},
    getCoasterCameraPose(view='rider',zoom=1){
      const base=app.coaster?.cameraPose?.(zoom)||null;if(!base)return null;
      if(view==='wheel_front')return {eye:{x:base.look.x,y:base.look.y+6.5*zoom,z:base.look.z+16.5*zoom},look:{x:base.look.x,y:base.look.y+5.0,z:base.look.z},fov:68};
      if(view==='aerial')return {eye:{x:base.look.x+19.0*zoom,y:base.look.y+23.0*zoom,z:base.look.z+19.0*zoom},look:{x:base.look.x,y:base.look.y+4.0,z:base.look.z},fov:65};
      return base;
    },
    resetBalloon(){app.balloon?.reset();},
    correctBalloon(){app.balloon?.correct();},
    failBalloon(){app.balloon?.fail();},
    winBalloon(){if(app.balloon){app.balloon.phase='tour';app.balloon.elapsed=0;}},
    getBalloonCameraPose(view='near',zoom=1){
      return app.balloon?.cameraPose?.(view,zoom)||null;
    },
    getChickenCameraPose(view='close',zoom=1){
      const obj=app.chickens?.group;if(!obj)return null;
      group.updateMatrixWorld(true);
      const p=obj.getWorldPosition(new THREE.Vector3());
      const z=Math.min(2.2,Math.max(.55,zoom));
      if(view==='stand'||view===false)return {eye:{x:p.x+14*z,y:p.y+10.8*z,z:p.z+17.5*z},look:{x:p.x,y:p.y+1.7,z:p.z},fov:67};
      if(view==='track')return {eye:{x:p.x,y:p.y+17.0*z,z:p.z+2.0*z},look:{x:p.x,y:p.y,z:p.z},fov:65};
      return {eye:{x:p.x+9.0*z,y:p.y+5.0*z,z:p.z+10.5*z},look:{x:p.x,y:p.y+1.5,z:p.z},fov:60};
    },
    getRocketCameraPose(view='pad',zoom=1){
      const r=app.rocket;if(!r)return null;group.updateMatrixWorld(true);
      const p=r.rocket.getWorldPosition(new THREE.Vector3());
      const z=Math.min(2.2,Math.max(.55,zoom));
      if(view==='orbit')return {eye:{x:p.x+24*z,y:Math.max(p.y+22*z,25),z:p.z+24*z},look:{x:p.x,y:p.y+5,z:p.z},fov:62};
      if(view==='tracker')return {eye:{x:p.x-8.5*z,y:Math.max(p.y+5*z,7.5),z:p.z-12.5*z},look:{x:p.x,y:p.y+4,z:p.z},fov:68};
      return {eye:{x:p.x+12*z,y:Math.max(p.y+6.6*z,8.4),z:p.z-16*z},look:{x:p.x,y:p.y+3,z:p.z},fov:67};
    },
    getSanctuaryDoorWorldPosition(){return getSanctuaryDoorWorldPosition();},
    correctSanctuary(){if(app.portal)app.portal.correctAt=performance.now();},
    failSanctuary(){if(app.portal)app.portal.failAt=performance.now();},
    enterSanctuary(){app.sanctuary.active=true;app.sanctuary.room.visible=true;},
    leaveSanctuary(){app.sanctuary.active=false;app.sanctuary.room.visible=false;},
    drawFortuneLot(){if(app.sanctuary?.active){app.sanctuary.fortuneAt=performance.now();app.sanctuary.fortuneStick.visible=true;}},
    getSanctuaryNpcWorldPosition(){return getSanctuaryNpcWorldPosition();},
    getSanctuaryCameraPose(view='altar'){
      if(view==='pond')return {eye:{x:12,y:5.2,z:group.position.z-SANCTUARY_LOCAL_Z-14},look:{x:0,y:3.5,z:group.position.z-SANCTUARY_LOCAL_Z},fov:68};
      if(view==='overview')return {eye:{x:0,y:17.0,z:group.position.z-SANCTUARY_LOCAL_Z-24},look:{x:0,y:4.0,z:group.position.z-SANCTUARY_LOCAL_Z},fov:65};
      return {eye:{x:0,y:6.7,z:group.position.z-SANCTUARY_LOCAL_Z-8},look:{x:0,y:5.1,z:group.position.z-SANCTUARY_LOCAL_Z+15},fov:72};
    },

    tick(dt,playerPos=null,isParkCameraActive=false){
      elapsed+=dt;
      if(opening){gateProgress=Math.min(1,gateProgress+dt*.75);if(gateProgress>=1){opening=false;gateOpen=true;}}
      for(const p of app.gatePanels)p.hinge.rotation.y=p.sign*gateProgress*1.23;
      const nearPark=!playerPos||playerPos.z>=32||isParkCameraActive||app.focusedGame!==null||app.sanctuary.active;
      if(gateOpen&&nearPark){
        const fg=app.focusedGame;
        for(const animate of app.animated)animate(elapsed);
        if(fg===null){
          app.npcRoots.forEach((obj,i)=>{
            obj.g.position.y=obj.baseY+.075*Math.sin(elapsed*2+i*.9);
            obj.b.rotation.y=.08*Math.sin(elapsed*1.4+i*.3);
          });
        }
        if(fg===null||fg===0)animateChickens(dt,elapsed);
        if(fg===null||fg===1)updateRocketAnimation(elapsed);
        if(fg===null||fg===3)app.bridge?.tick(dt,elapsed);
        if(fg===null||fg===6)app.architect?.tick(dt,elapsed);
        if(fg===null||fg===8)app.coaster?.tick(dt,elapsed);
        if(fg===null||fg===9)app.balloon?.tick(dt,elapsed);
        if(fg===null||fg===4)app.tug?.tick(dt,elapsed);
        if(fg===null||fg===5)app.soccer?.tick(dt,elapsed);
        if(fg===null||fg===10)app.millionaire?.tick(elapsed);
        if(app.sanctuary.active){const lot=app.sanctuary;
          const age=(performance.now()-lot.fortuneAt)/1000;
          lot.fortuneStick.visible=lot.fortuneAt>0&&age<1.35;
          if(lot.fortuneStick.visible)lot.fortuneStick.position.y=2.2+2.4*Math.sin(Math.PI*Math.min(1,age/1.35));
        }
      }
    }
  };
}
