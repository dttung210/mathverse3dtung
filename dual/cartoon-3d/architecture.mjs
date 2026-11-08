/** Optional exterior decorations, deliberately non-collidable and independent of doors. */
import * as THREE from '/vendor/three.module.js';

export const LAB_STYLES=Object.freeze([
 {id:'classic',name:'Giữ nguyên kiến trúc LAB'},
 {id:'quantum',name:'Quantum Core · quỹ đạo'},
 {id:'crystal',name:'Crystal Research · pha lê'},
 {id:'honeycomb',name:'Hexa Research · tổ ong'},
 {id:'aerowave',name:'Aero Wave · mái sóng'},
 {id:'solar',name:'Solar Future · mái năng lượng'},
 {id:'tubes',name:'Science Tubes · ống nghiên cứu'},
 {id:'petals',name:'Bio Fluid · mái cánh'}
]);
export const MUSEUM_STYLES=Object.freeze([
 {id:'classic',name:'Giữ nguyên bảo tàng'},
 {id:'geodesic',name:'Geodesic · vòm tam giác'},
 {id:'silver',name:'Silver Canopy · vòm bạc'},
 {id:'orbital',name:'Orbital Dome · vòng quỹ đạo'},
 {id:'lotus',name:'Lotus Dome · vòm cánh sen'},
 {id:'nebula',name:'Nebula Dome · mái thiên hà'},
 {id:'crystal',name:'Crystal Dome · tinh thể'},
 {id:'halo',name:'Halo Dome · vòm năng lượng'}
]);
export const GARDEN_STYLES=Object.freeze([
 {id:'orbital',name:'PA4 · Vòng Quỹ Đạo Tri Thức (4 Cầu & Vòng Liên Đảo)'},
 {id:'pastel',name:'PA1 · Đại Lộ Hoàng Gia & Đảo Mây Pastel'},
 {id:'starlight',name:'PA2 · Quảng Trường Sao Bát Giác Tinh Thể'},
 {id:'fountain',name:'PA3 · Sảnh Vườn Địa Đàng & Hồ Ngọc Bích'},
 {id:'skybridge',name:'PA5 · Giao Lộ Pha Lê Đa Tầng Cầu Vồng'},
 {id:'classic',name:'Giữ nguyên cảnh quan cơ bản'}
]);
const CM=(hex,metal=0.22,rough=.34)=>new THREE.MeshStandardMaterial({color:hex,roughness:rough,metalness:metal,flatShading:false});
function createBuilder(name){
 const group=new THREE.Group();group.name=name;
 const p={white:CM(0xfdfaf2,.08,.32),silver:CM(0xe2e8f0,.56,.24),cyan:CM(0x0284c7,.42,.26),
    blue:CM(0x0c4a6e,.48,.28),violet:CM(0x5b21b6,.36,.30),pink:CM(0xd97706,.62,.24),
    gold:CM(0xf59e0b,.78,.18),mint:CM(0x059669,.28,.38),navy:CM(0x0a192f,.55,.24),
    glass:new THREE.MeshStandardMaterial({color:0x38bdf8,transparent:true,opacity:.52,metalness:.22,roughness:.12,depthWrite:false,side:THREE.DoubleSide}),
    soft:new THREE.MeshStandardMaterial({color:0xfde047,emissive:0xf59e0b,emissiveIntensity:.45,metalness:.65,roughness:.2}),
    water:new THREE.MeshStandardMaterial({color:0x0284c7,metalness:.25,roughness:.12,transparent:true,opacity:.85})};
 const add=(geo,mat,x=0,y=0,z=0,name='')=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.name=name;m.castShadow=false;m.receiveShadow=false;group.add(m);return m;};
 const sphere=(x,y,z,sx,sy,sz,mat)=>{const m=add(new THREE.SphereGeometry(1,18,11),mat,x,y,z);m.scale.set(sx,sy,sz);return m;};
 const box=(x,y,z,sx,sy,sz,mat)=>add(new THREE.BoxGeometry(sx,sy,sz),mat,x,y,z);
 const cyl=(x,y,z,r,h,mat,segments=18)=>add(new THREE.CylinderGeometry(r,r,h,segments),mat,x,y,z);
 const torus=(x,y,z,r,th,mat,rx=Math.PI/2,ry=0)=>{const m=add(new THREE.TorusGeometry(r,th,7,42),mat,x,y,z);m.rotation.set(rx,ry,0);return m;};
 const path=(pts,r,mat,closed=false)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)),closed,'centripetal'),Math.max(12,pts.length*4),r,6,closed),mat);
 const dispose=()=>{group.traverse(o=>{if(o.isMesh)o.geometry.dispose();});Object.values(p).forEach(m=>m.dispose());};
 return {group,p,add,sphere,box,cyl,torus,path,dispose};
}
export function makeLabExterior(style){
 const b=createBuilder('CARTOON_LAB_'+style),{p,box,sphere,cyl,torus,path}=b;
 b.group.position.set(-138,0,0);
 b.group.rotation.y=Math.PI/2;
 if(style==='classic')return b;
 // All additions are above the current solid roof (y>23). Existing entrances
 // remain at local z=26, y<22, so neither click zones nor entrances are covered.
 if(style==='quantum'){
  sphere(0,34,-5,5,5,5,p.cyan);
  torus(0,34,-5,11,.28,p.silver,.35,.6);
  torus(0,34,-5,13,.23,p.gold,1.2,0);
  torus(0,34,-5,15,.17,p.soft,.6,1.0);
  for(let x=-28;x<=28;x+=14){cyl(x,26,-3,1.25,7,p.navy);sphere(x,30,-3,1.9,2.6,1.9,p.glass);}
 }else if(style==='crystal'){
  for(let x=-28;x<=28;x+=7){
   const h=5+((x+28)/7%3)*3;
   const spike=b.add(new THREE.OctahedronGeometry(2.4+h*.12,0),x%2?p.violet:p.cyan,x,24.2+h*.47,-5);
   spike.scale.y=1.1+h*.13;
   box(x,23.4,-5,5,.45,22,p.silver);
  }
  torus(0,26,-5,25,.18,p.soft);
 }else if(style==='honeycomb'){
  for(let x=-28;x<=28;x+=8)for(let z=-19;z<=12;z+=7.3){
   const m=cyl(x+(Math.floor(z/7.3)%2)*3.8,24.1,z,4.2,1.9,p.silver,6);
   m.rotation.y=Math.PI/6;
   cyl(x+(Math.floor(z/7.3)%2)*3.8,25.4,z,2.2,.20,p.glass,6);
  }
 }else if(style==='aerowave'){
  for(const x of [-26,-19,-12,-5,5,12,19,26]){
   const pts=[];for(let z=-23;z<=16;z+=3){pts.push([x,25+2.7*Math.sin((z+26)*.084+x*.022),z]);}
   path(pts,.37,p.white);
  }
  for(let x=-28;x<=28;x+=4.5)box(x,23.4,-4,.34,.34,43,p.blue);
 }else if(style==='solar'){
  for(const x of [-23,-13,-3,7,17,27])for(const z of [-16,-6,4,14]){
   const m=box(x,25.3,z,7.5,.19,6.6,p.blue);
   m.rotation.x=-.16;m.rotation.z=.07;
   box(x,23.75,z,.25,2.8,.3,p.silver);
  }
  for(const x of [-31,31])torus(x,29,-5,3.0,.17,p.gold,0,0);
 }else if(style==='tubes'){
  for(const x of [-22,0,22]){
   cyl(x,27,-6,5.5,4,p.navy,20);
   sphere(x,29,-6,5.5,2.0,5.5,p.glass);
   for(const y of [25.1,27,29])torus(x,y,-6,5.45,.17,p.cyan);
  }
  path([[-22,27,-6],[-11,32,-6],[0,34,-6],[11,32,-6],[22,27,-6]],.39,p.silver);
 }else if(style==='petals'){
  for(let i=0;i<7;i++){
   const x=-29+i*9.5;
   const wave=path([[x,24,-24],[x,28,-12],[x,33,-3],[x,28,8],[x,24,19]],.68,i%2?p.pink:p.cyan);
   box(x,23.5,-3,7,.3,42,p.glass);
  }
  torus(0,31,-3,8,.24,p.gold,0,0);
 }
 return b;
}
export function makeMuseumExterior(style){
 const b=createBuilder('CARTOON_MUSEUM_'+style),{p,box,sphere,cyl,torus,path}=b;
 b.group.position.set(138,0,0);
 b.group.rotation.y=-Math.PI/2;
 if(style==='classic')return b;
 // Museum's real 3D entry is at front local z=30.5 and y<23. All roof
 // geometry is added high above the entrance; decorated shells are see-through.
 if(style==='geodesic'){
  const dome=b.add(new THREE.SphereGeometry(32.8,28,13,0,Math.PI*2,0,Math.PI/2),p.glass,0,22.2,0);
  dome.material=new THREE.MeshStandardMaterial({color:0x93e4f5,metalness:.24,roughness:.28,transparent:true,opacity:.24,side:THREE.DoubleSide,depthWrite:false});
  for(let i=0;i<16;i++){
   const angle=i*Math.PI*2/16;const pts=[];
   for(let j=0;j<=13;j++){const t=j*Math.PI/2/13;pts.push([32.8*Math.sin(t)*Math.sin(angle),22.2+32.8*Math.cos(t),32.8*Math.sin(t)*Math.cos(angle)]);}
   path(pts,.14,p.silver);
  }
  for(let t=.17;t<=1.4;t+=.25){const r=32.8*Math.sin(t),y=22.2+32.8*Math.cos(t);torus(0,y,0,r,.11,p.cyan);}
 }else if(style==='silver'){
  const roof=b.add(new THREE.SphereGeometry(33.5,38,16,0,Math.PI*2,0,Math.PI/2),p.glass,0,23,0);
  roof.scale.y=.55;
  torus(0,23,0,33.8,.39,p.silver);
  for(let i=0;i<20;i++){
   const a=i*Math.PI/10;
   path([[32.9*Math.sin(a),23.1,32.9*Math.cos(a)],[23*Math.sin(a),34.3,23*Math.cos(a)],[0,41.4,0]],.19,p.silver);
  }
 }else if(style==='orbital'){
  sphere(0,41,0,4.4,4.4,4.4,p.gold);
  const r1=torus(0,40,0,25,.35,p.cyan,Math.PI/3,.25);
  const r2=torus(0,42,0,29,.27,p.silver,Math.PI/2.7,1);
  torus(0,44,0,21,.19,p.violet,.28,1.4);
  for(let i=0;i<10;i++){const a=i*Math.PI/5;sphere(28*Math.cos(a),26,28*Math.sin(a),1.4,1.4,1.4,p.glass);}
 }else if(style==='lotus'){
  for(let i=0;i<10;i++){
   const a=2*Math.PI*i/10;
   const petal=sphere(22*Math.sin(a),34,22*Math.cos(a),4.4,11,10,p.glass);
   petal.rotation.y=a;petal.rotation.x=.25;
   path([[28*Math.sin(a),24,28*Math.cos(a)],[21*Math.sin(a),38,21*Math.cos(a)],[11*Math.sin(a),45,11*Math.cos(a)]],.39,i%2?p.pink:p.white);
  }
  torus(0,46,0,12,.24,p.gold);
 }else if(style==='nebula'){
  const pts=[];for(let i=0;i<=130;i++){const t=i/130;const a=t*7*Math.PI;const r=28*(1-t)+1;pts.push([r*Math.cos(a),24+34*t,r*Math.sin(a)]);}
  path(pts,.38,p.violet);path(pts.map(([x,y,z])=>[x*.9,y+.5,z*.9]),.12,p.soft);
  sphere(0,58,0,2.4,2.4,2.4,p.gold);
 }else if(style==='crystal'){
  for(let i=0;i<12;i++){
   const a=i*Math.PI/6;
   const x=23*Math.cos(a),z=23*Math.sin(a),h=(i%3)*4+11;
   const m=b.add(new THREE.OctahedronGeometry(3.2,0),i%2?p.mint:p.violet,x,27+h*.48,z);
   m.scale.y=h/5;
  }
  const top=b.add(new THREE.OctahedronGeometry(8,0),p.glass,0,43,0);top.scale.y=1.9;
  torus(0,28,0,30,.25,p.gold);
 }else if(style==='halo'){
  for(const [r,y] of [[31,29],[27,35],[21,41],[13,46]])torus(0,y,0,r,.5,p.silver);
  const roof=b.add(new THREE.SphereGeometry(29,36,12,0,Math.PI*2,0,Math.PI/2),p.glass,0,23.8,0);roof.scale.y=.66;
  for(let i=0;i<6;i++){const a=i*Math.PI/3;sphere(23*Math.sin(a),36,23*Math.cos(a),1.1,1.1,1.1,p.cyan);}
 }
 return b;
}
export function makeGarden(style){
 const b=createBuilder('CARTOON_GARDENS_'+style),{p,sphere,cyl,torus,box,path}=b;
 if(style==='classic')return b;
 // Vòng mây hoạt hình 3D bồng bềnh quanh Quần Đảo Trên Mây & cổng vòm Vòng Cầu Liên Đảo (Tâm (0, 0), Bán kính R = 138m)
 const orbitR=138.0;
 for(let i=0;i<12;i++){
  const a=i*Math.PI*2/12 + Math.PI/12;
  const cx=Math.cos(a)*(orbitR+58), cz=Math.sin(a)*(orbitR+58);
  sphere(cx,-1.8,cz,13.5,2.6,9.2,p.white);
  sphere(cx-6.2,-1.5,cz+3.2,8.8,2.1,6.4,p.white);
  sphere(cx+6.4,-1.5,cz-3.0,9.2,2.2,6.8,p.white);
 }
 if(style==='orbital'||style==='skybridge'){
  // 8 Cổng vòm Hoàng Kim đối xứng trên 4 cung Vòng Cầu Liên Đảo (r = 138m quanh tâm (0, 0)), KHÔNG vẽ vòng lơ lửng đè lên Sảnh Trung Tâm
  for(const deg of [34,56,124,146,214,236,304,326]){
   const a=deg*Math.PI/180;
   const ax=Math.cos(a)*orbitR, az=Math.sin(a)*orbitR;
   const arch=torus(ax,0.2,az,5.2,.32,p.gold,0, -a+Math.PI/2);
   arch.scale.y=1.38;
   sphere(ax,7.4,az,.75,.75,.75,p.soft);
  }
 }
 // 4 Sao chữ thập (+) vàng lấp lánh ở 4 góc chéo giống hệt Ảnh 2
 for(const [sx,sz] of [[-110,-168],[88,-176],[-185,96],[178,82]]){
  box(sx,-0.4,sz,8.4,.28,1.5,p.gold);
  box(sx,-0.4,sz,1.5,.28,8.4,p.gold);
 }
 return b;
}
