/** Reusable THREE.js educational geometric abstractions. No photogrammetry claim.
 * Used both by the physical exhibition pedestals and the interactive math viewer.
 */
import * as THREE from '/vendor/three.module.js';
const M=(c,m=.06,r=.72,alpha=1)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,transparent:alpha<1,opacity:alpha,side:THREE.DoubleSide});
function box(g,w,h,d,c,x=0,y=0,z=0,metal=.06){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c,metal));o.position.set(x,y,z);g.add(o);return o;}
function cylinder(g,r1,r2,h,c,x=0,y=0,z=0,seg=18){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),M(c));o.position.set(x,y,z);g.add(o);return o;}
function lineTube(g,pts,r,c){const curve=new THREE.CatmullRomCurve3(pts,false,'centripetal');const o=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(12,pts.length*2),r,7,false),M(c,.1,.55));g.add(o);return o;}
function ring(g,rx,rz,y,r,c){const pts=[];for(let k=0;k<=64;k++){const t=k/64*Math.PI*2;pts.push(new THREE.Vector3(rx*Math.cos(t),y,rz*Math.sin(t)));}return lineTube(g,pts,r,c);}
const c={limestone:0xd8c5a0,limestone2:0xbba57b,terracotta:0xc7835d,sand:0xcbad75,marble:0xe3e3dd,accent:0xc5a066,stone:0xb8a07b,glass:0x7ac6e1};
function pyramid(g,glass=false){
  box(g,3.65,.16,3.65,glass?0x6a8b9f:0xbba477,0,.09,0);
  const geo=new THREE.CylinderGeometry(0,2.42,2.85,4,1,false);
  const mesh=new THREE.Mesh(geo,M(glass?0x81cade:c.limestone,glass?.38:.05,glass?.18:.85,glass?.42:1));
  mesh.rotation.y=Math.PI/4;mesh.position.y=1.6;g.add(mesh);
  if(glass){
    const mat=new THREE.LineBasicMaterial({color:0xf3f8ef});
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geo),mat);edges.rotation.copy(mesh.rotation);edges.position.copy(mesh.position);g.add(edges);
    for(let i=1;i<6;i++){
      const scale=1-i/6,y=.2+(2.85*i/6);const pts=[new THREE.Vector3(-1.18*scale,y,-1.18*scale),new THREE.Vector3(1.18*scale,y,-1.18*scale),new THREE.Vector3(1.18*scale,y,1.18*scale),new THREE.Vector3(-1.18*scale,y,1.18*scale),new THREE.Vector3(-1.18*scale,y,-1.18*scale)];lineTube(g,pts,.012,0xd9f3f0);
    }
  }else{
    for(let i=0;i<12;i++){const y=.19+i*.213;const scale=1-i/14;ring(g,1.7*scale,1.7*scale,y,.011,0x94794e);}
  }
}
function temple(g){
  box(g,4.6,.28,2.75,0xb8a17d,0,.14,0);
  box(g,4.3,.19,2.55,c.limestone,0,.36,0);
  for(let row of [-.97,.97])for(let i=0;i<9;i++){
    const x=-1.94+i*.485;
    cylinder(g,.09,.108,1.62,0xe7d6b6,x,1.2,row,14);
    box(g,.31,.10,.31,0xaf9975,x,2.05,row);box(g,.28,.08,.28,0xe4cfac,x,.48,row);
  }
  for(let x of [-1.94,1.94])for(let z of [-.5,0,.5])cylinder(g,.085,.095,1.62,0xdac8a5,x,1.2,z,14);
  box(g,4.52,.21,2.75,0xbba784,0,2.20,0);
  const roof=new THREE.Mesh(new THREE.CylinderGeometry(0,1.45,.65,3),M(0xae8e60));roof.rotation.set(0,Math.PI/2,Math.PI/2);roof.scale.set(1,2.72,.9);roof.position.set(0,2.64,0);g.add(roof);
}
function colosseum(g){
 // THREE.js native 3D Roman arcade with REAL arch-shaped openings (not a wall of isolated columns).
 // Educational structural approximation, NOT the textured eyesCloud3D/Sketchfab photogrammetry.
 const rx=2.10,rz=1.42,bays=40,levels=3,levelHeight=.73;
 box(g,4.57,.16,3.17,0x907f68,0,.10,0);
 // Use an extruded wall panel with arched holes for each bay. This makes the Colosseum
 // appear as a volumetric amphitheatre even offline and visibly different from a cage of pillars.
 const white=0xcbb89a,dark=0x8e816c;
 for(let tier=0;tier<levels;tier++){
  const y0=.18+tier*levelHeight;
  for(let k=0;k<bays;k++){
   const angle=2*Math.PI*(k+.5)/bays;
   const derivative=Math.hypot(rx*Math.sin(angle),rz*Math.cos(angle));
   const width=.88*(2*Math.PI/bays)*derivative;
   const height=.64;
   const wall=new THREE.Shape();wall.moveTo(-width/2,0);wall.lineTo(width/2,0);wall.lineTo(width/2,height);wall.lineTo(-width/2,height);wall.closePath();
   const aWidth=Math.min(width*.56,.195),foot=.045,archY=.38;
   const hole=new THREE.Path();
   hole.moveTo(-aWidth/2,foot);hole.lineTo(-aWidth/2,archY);
   for(let j=0;j<=10;j++){
    const t=Math.PI-j*Math.PI/10;
    hole.lineTo((aWidth/2)*Math.cos(t),archY+(aWidth/2)*Math.sin(t));
   }
   hole.lineTo(aWidth/2,foot);hole.closePath();wall.holes.push(hole);
   const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(wall,{depth:.105,bevelEnabled:false,curveSegments:8}),M(k%7===0?0xbba88d:white));
   // local X aligns with the tangent of the ellipse, local Z faces outward.
   const tangent=new THREE.Vector3(-rx*Math.sin(angle),0,rz*Math.cos(angle)).normalize();
   mesh.rotation.y=-Math.atan2(tangent.z,tangent.x);
   mesh.position.set(rx*Math.cos(angle),y0,rz*Math.sin(angle));g.add(mesh);
  }
  ring(g,rx,rz,y0+.68,.052,dark);
  ring(g,rx,rz,y0,.034,0xb5a287);
 }
 // Rim and the open interior with 3D seating rings; this is an architectural model, not a solid cylinder.
 ring(g,rx,rz,2.47,.12,0xbba17c);
 for(let j=0;j<5;j++){
  const scale=.88-j*.085;
  ring(g,rx*scale,rz*scale,.35+j*.20,.06,j%2?0xbda984:0xd2be9b);
 }
 const arena=new THREE.Mesh(new THREE.CylinderGeometry(.97,.97,.08,48),M(0x958a72));
 arena.scale.set(1,1,.72);arena.position.y=.22;g.add(arena);
}

function mayan(g){
  box(g,4.45,.15,4.45,0x9d855d,0,.075,0);
  for(let i=0;i<9;i++){
    const w=3.85-i*.37;box(g,w,.29,w, i%2?0xcbb78b:0xdfcea2,0,.20+i*.29,0);
  }
  box(g,.93,.55,.83,0xe0d4b5,0,3.17,0);box(g,1.2,.14,.98,0xb4a17c,0,3.50,0);
  for(let i=0;i<12;i++){const z=1.86-i*.135,y=.26+i*.23;box(g,.45,.09,.21,0xb49e75,0,y,z);}
}
function taj(g){
  box(g,4.1,.20,4.1,0xd8d4c7,0,.10,0);box(g,3.05,1.35,2.58,c.marble,0,1.02,0);
  box(g,3.35,.16,2.86,0xcdd2cf,0,1.75,0);cylinder(g,.9,.97,.40,0xf1f1ed,0,1.95,0,28);
  const geo=new THREE.SphereGeometry(.95,32,18,0,Math.PI*2,0,Math.PI/2);const dome=new THREE.Mesh(geo,M(0xf6f3e8));dome.position.y=2.16;g.add(dome);
  cylinder(g,.08,.11,.22,0xcab57d,0,3.17,0);cylinder(g,.03,.04,.22,0xd7b55a,0,3.38,0);
  for(const x of [-1.66,1.66])for(const z of [-1.35,1.35]){
    cylinder(g,.16,.18,2.56,0xf0eee7,x,1.47,z,18);
    cylinder(g,.21,.23,.11,0xc5cbd1,x,2.72,z,20);
    const turret=new THREE.Mesh(new THREE.SphereGeometry(.19,20,10,0,Math.PI*2,0,Math.PI/2),M(0xf6f3e8));turret.position.set(x,2.79,z);g.add(turret);
    cylinder(g,.03,.04,.2,0xcab57d,x,3.03,z);
  }
  for(let x of [-.92,0,.92]){
    const top=new THREE.Mesh(new THREE.SphereGeometry(.31,16,12,0,Math.PI,0,Math.PI),M(0x9da5aa));top.scale.set(1,1,.22);top.position.set(x,1.10,1.297);g.add(top);
    box(g,.57,.63,.02,0x879296,x,.76,1.30);
  }
}
function petronas(g){
  box(g,5,.19,2.5,0x5e7d8c,0,.09,0);
  for(const x of [-1.17,1.17]){
    for(let i=0;i<17;i++){
      const taper=i>12?1-(i-12)*.065:1;
      cylinder(g,.44*taper,.48*taper,.17,i%3===0?0xaac2ca:0x738b9b,x,.34+i*.168,0,16);
      cylinder(g,.49*taper,.48*taper,.035,0xdce5e5,x,.43+i*.168,0,16);
    }
    cylinder(g,.30,.44,.39,0xcbd6db,x,3.24,0,12);cylinder(g,.12,.26,.31,0xcbd6db,x,3.61,0,12);
    cylinder(g,.04,.085,.40,0xf5f1e5,x,3.96,0,10);
  }
  box(g,1.52,.20,.36,0x9ab4bd,0,1.83,0,.35);
  // supporting diagonal legs below skybridge
  for(const sign of [-1,1]){const points=[new THREE.Vector3(sign*.22,1.72,0),new THREE.Vector3(sign*.54,1.34,0),new THREE.Vector3(sign*.77,1.18,0)];lineTube(g,points,.039,0xbfcdd1);}
}
function bridge(g){
  box(g,5.65,.20,.79,0x7a818a,0,.50,0);
  for(let x of [-1.77,1.77]){
    for(let z of [-.25,.25]){box(g,.19,2.76,.19,0xd65d48,x,1.71,z);}
    box(g,.45,.13,.67,0xb43e34,x,3.12,0);
    for(let i=0;i<3;i++)box(g,.34,.07,.46,0xb54a3e,x,.90+i*.75,0);
  }
  const pairs=[[-2.82,-1.77],[-1.77,1.77],[1.77,2.82]];
  for(let z of [-.32,.32])for(const [a,b] of pairs){
    const pts=[];for(let i=0;i<=24;i++){
      const t=i/24,x=a+(b-a)*t;
      const y=a===-1.77&&b===1.77?1.36+1.72*(2*t-1)**2:1.13+(2.92-1.13)*(a===-2.82?t:1-t)**1.4;
      pts.push(new THREE.Vector3(x,y,z));
    }
    lineTube(g,pts,.038,0xf2e3b2);
    for(let i=1;i<12;i++){const t=i/12,x=a+(b-a)*t;const y=a===-1.77&&b===1.77?1.36+1.72*(2*t-1)**2:1.13+(2.92-1.13)*(a===-2.82?t:1-t)**1.4;
      lineTube(g,[new THREE.Vector3(x,.64,z),new THREE.Vector3(x,y,z)],.013,0xcbb39b);}
  }
}
function catenary(g){
 const width=4.4,k=1.6,height=3.5;
 const pts=[];for(let i=0;i<=56;i++){
  const t=(i/56*2-1),x=width*t/2,y=height*(Math.cosh(k)-Math.cosh(k*t))/(Math.cosh(k)-1);
  pts.push(new THREE.Vector3(x,y,0));
 }
 lineTube(g,pts,.15,0xcdd7da);
 for(let x of [-width/2,width/2])box(g,.46,.14,.55,0xb3bdbf,x,.08,0);
}
/** Physically rendered structural abstraction – never claimed to be heritage scan. */
export function createTeachingModel(shape){
 const g=new THREE.Group();g.name=`R102_EDUCATIONAL_GEOMETRY_${shape}`;
 if(shape==='pyramid')pyramid(g,false);
 else if(shape==='glasspyramid')pyramid(g,true);
 else if(shape==='temple')temple(g);
 else if(shape==='colosseum')colosseum(g);
 else if(shape==='mayan')mayan(g);
 else if(shape==='taj')taj(g);
 else if(shape==='petronas')petronas(g);
 else if(shape==='bridge')bridge(g);
 else if(shape==='catenary')catenary(g);
 else throw new Error(`No verified geometry lesson for ${shape}`);
 g.userData.modelSource='MATHVERSE educational geometric abstraction; not a LiDAR/photogrammetry scan';
 return g;
}
export function disposeTeachingModel(group){group?.traverse?.(o=>{o.geometry?.dispose?.();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose?.());}});}
