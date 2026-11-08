/** Reusable THREE.js educational geometric abstractions. No photogrammetry claim.
 * Used both by the physical exhibition pedestals and the interactive math viewer.
 */
import * as THREE from '/mathverse3dtung/vendor/three.module.js?v=r107_v15';
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
  // High-detail Greek Ionic dipteral Temple of Artemis at Ephesus:
  // Stepped marble crepidoma, double colonnade of fluted Ionic columns with volute capitals,
  // inner cella sanctuary, carved entablature & triangular pediments, and terracotta red pitched roof.
  box(g,5.1,.16,3.15,0xc8c2b4,0,.08,0);
  box(g,4.85,.15,2.92,0xdad4c6,0,.23,0);
  box(g,4.6,.15,2.70,0xeae5d9,0,.38,0);
  // Inner cella (naos) sanctuary walls & bronze doors
  box(g,2.85,1.58,1.36,0xdfd8c8,0,1.24,0);
  box(g,.08,1.12,.52,0x6e4f35,1.43,1.02,0);
  box(g,.08,1.12,.52,0x6e4f35,-1.43,1.02,0);
  // Outer and inner Ionic colonnades (peripteral dipteral arrangement)
  for(const zRow of [-1.18,-0.88,0.88,1.18]){
    for(let i=0;i<11;i++){
      if(Math.abs(zRow)<1.0 && i>1 && i<9) continue; // inner row wraps front/back + outer flanks
      const x=-2.05+i*.41;
      box(g,.24,.07,.24,0xd8d0c0,x,.49,zRow);
      cylinder(g,.076,.092,1.54,0xf3efe6,x,1.29,zRow,16);
      box(g,.25,.08,.21,0xe2d9c5,x,2.08,zRow);
    }
  }
  for(const xCol of [-2.05,-1.64,1.64,2.05]){
    for(const z of [-.58,-.29,0,.29,.58]){
      box(g,.24,.07,.24,0xd8d0c0,xCol,.49,z);
      cylinder(g,.076,.092,1.54,0xf3efe6,xCol,1.29,z,16);
      box(g,.25,.08,.21,0xe2d9c5,xCol,2.08,z);
    }
  }
  // Architrave, frieze & cornice
  box(g,4.62,.16,2.72,0xe6dfd1,0,2.20,0);
  box(g,4.72,.12,2.82,0xd4cab8,0,2.34,0);
  // Pitched terracotta red roof & marble triangular pediments
  const roof=new THREE.Mesh(new THREE.CylinderGeometry(0,1.62,4.76,3),M(0xa84232,.08,.62));
  roof.rotation.set(0,0,Math.PI/2);
  roof.scale.set(0.42,1,0.92);
  roof.position.set(0,2.62,0);
  g.add(roof);
  const pedGeo=new THREE.CylinderGeometry(0,1.54,.16,3);
  for(const sx of [-2.32,2.32]){
    const ped=new THREE.Mesh(pedGeo,M(0xebe5d8));
    ped.rotation.set(0,0,Math.PI/2);
    ped.scale.set(0.39,1,0.90);
    ped.position.set(sx,2.61,0);
    g.add(ped);
  }
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
/** R106 educational primitives; NOT the downloaded models of the landmarks. */
function shellOpera(g){
 box(g,4.8,.25,3.35,0xcbbd9a,0,.12,0);
 for(let i=0;i<5;i++){
  const x=-1.7+i*.83, z=(i%2===0?-.55:.55);
  const part=new THREE.Mesh(new THREE.SphereGeometry(.95,20,12,0,Math.PI,0,Math.PI/2),M(0xf0efeb,.14,.3));
  part.scale.set(.65,1.65,1.2);part.rotation.y=(i%2===0?.22:-.22);part.position.set(x,.36,z);g.add(part);
  box(g,.68,.32,1.8,0x6ba8b6,x,.25,z);
 }
}
function hagia(g){
 box(g,4.8,.16,4.0,0xa99e8b,0,.08,0);
 box(g,3.2,1.65,2.85,0xd2a896,0,0.98,0);
 box(g,2.2,2.05,2.2,0xd8b19f,0,1.18,0);
 for(const sx of [-1,1])for(const sz of [-1,1]){
  box(g,.38,1.9,.42,0xc59b89,sx*1.38,1.1,sz*1.18);
 }
 cylinder(g,1.18,1.22,.32,0xdfcbb6,0,2.28,0,36);
 for(let i=0;i<24;i++){
  const a=(i/24)*Math.PI*2;
  box(g,.07,.19,.07,0x3c4d5e,Math.cos(a)*1.20,2.28,Math.sin(a)*1.20);
 }
 const dome=new THREE.Mesh(new THREE.SphereGeometry(1.18,36,18,0,Math.PI*2,0,Math.PI/2),M(0x7d8b8c,.25,.5));dome.scale.y=.72;dome.position.y=2.42;g.add(dome);
 cylinder(g,.03,.04,.26,0xd4af37,0,3.35,0,12);
 for(const x of [-1.42,1.42]){
  const side=new THREE.Mesh(new THREE.SphereGeometry(.76,24,14,0,Math.PI*2,0,Math.PI/2),M(0x889596,.25,.5));side.position.set(x,1.82,0);side.scale.y=.65;g.add(side);
  for(const z of [-.55,.55]){
   const ex=new THREE.Mesh(new THREE.SphereGeometry(.42,18,10,0,Math.PI*2,0,Math.PI/2),M(0x939f9f,.25,.5));ex.position.set(x*1.12,1.45,z);ex.scale.y=.62;g.add(ex);
  }
 }
 for(const x of [-2.05,2.05])for(const z of [-1.58,1.58]){
  box(g,.34,.65,.34,0xc8b9a6,x,.48,z);
  cylinder(g,.11,.15,2.95,0xe0d6c8,x,1.85,z,20);
  cylinder(g,.17,.17,.08,0xc4b59f,x,2.55,z,20);
  cylinder(g,.15,.15,.07,0xc4b59f,x,3.05,z,20);
  const top=new THREE.Mesh(new THREE.ConeGeometry(.13,.52,20),M(0x5f6e73,.3,.4));top.position.set(x,3.58,z);g.add(top);
 }
}
function pantheon(g){
 box(g,4.55,.16,4.4,0xbab1a0,0,.08,0);
 cylinder(g,1.68,1.68,1.93,0xd5c2a4,0,1.13,-.38,42);
 const dome=new THREE.Mesh(new THREE.SphereGeometry(1.68,36,18,0,Math.PI*2,0,Math.PI/2),M(0xb6b0a4));dome.position.set(0,2.10,-.38);g.add(dome);
 box(g,2.85,.22,1.45,0xc4b8a4,0,.31,1.13);
 for(let i=0;i<6;i++)cylinder(g,.12,.13,1.3,0xd7cbb3,-1.1+i*.44,1.1,1.33);
 const ped=new THREE.Mesh(new THREE.ConeGeometry(1.52,.63,3),M(0xb1a48d));ped.rotation.set(Math.PI/2,Math.PI/2,0);ped.position.set(0,2.1,1.30);g.add(ped);
}
function eiffel(g){
 const heights=[.18,1.12,2.15,3.0,3.64];const widths=[1.9,1.22,.7,.30,.08];
 box(g,4.3,.18,4.3,0xb4aea4,0,.09,0);
 for(let layer=0;layer<4;layer++)for(let corner=0;corner<4;corner++){
  const sx=corner%2?1:-1,sz=corner>=2?1:-1;
  const a=new THREE.Vector3(sx*widths[layer]/2,heights[layer],sz*widths[layer]/2);
  const b=new THREE.Vector3(sx*widths[layer+1]/2,heights[layer+1],sz*widths[layer+1]/2);
  lineTube(g,[a,b],.055,0x93775a);
  const next=new THREE.Vector3(-sx*widths[layer]/2,heights[layer],sz*widths[layer]/2);
  if(corner%2===0)lineTube(g,[a,new THREE.Vector3(0,(heights[layer]+heights[layer+1])*.5,sz*(widths[layer]+widths[layer+1])*.25),next],.022,0xbfa17b);
 }
 for(const y of [.93,2.06,2.91])box(g,(3.7-y)*.6,.08,(3.7-y)*.6,0x977e61,0,y,0);
 cylinder(g,.035,.07,.43,0x9b8a72,0,3.9,0);
}
function atomium(g){
 const s=1.2,points=[];
 for(const x of [-s,s])for(const y of [.55,2.95])for(const z of [-s,s])points.push(new THREE.Vector3(x,y,z));
 points.push(new THREE.Vector3(0,1.75,0));
 for(let i=0;i<8;i++)for(let j=i+1;j<8;j++){
  const a=points[i],b=points[j],v=b.clone().sub(a);
  if(Math.abs(v.length()-2*s)<.1)lineTube(g,[a,b],.10,0x8f9d9e);
 }
 for(const corner of points.slice(0,8))lineTube(g,[corner,points[8]],.085,0xa0aeaa);
 for(const point of points){const ball=new THREE.Mesh(new THREE.SphereGeometry(.39,20,13),M(0xd4ddd9,.45,.24));ball.position.copy(point);g.add(ball);}
 box(g,4.4,.15,4.4,0x9fadaa,0,.1,0);
}
function burj(g){
 box(g,3.8,.15,3.8,0xb2b9bf,0,.08,0);
 for(let tier=0;tier<14;tier++){
  const t=tier/14,w=1.25*(1-.75*t),y=.25+tier*.24;
  for(const angle of [0,Math.PI*2/3,Math.PI*4/3]){
   const x=.45*(1-.35*t)*Math.cos(angle),z=.45*(1-.35*t)*Math.sin(angle);
   box(g,w,.245,w*.76,tier%3===0?0x9ec6d9:0x6e9cae,x,y,z,.4);
  }
 }
 cylinder(g,.07,.12,.67,0xd6dddf,0,4.00,0);
}
/* R107 educational previews. THESE ARE NOT PHOTOGRAMMETRY / GLB scans. */
function borobudur(g){
 box(g,5.0,.15,5.0,0xa79a78,0,.10,0);
 for(let level=0;level<5;level++){const w=4.65-level*.56;box(g,w,.32,w,level%2?0xbfb092:0xd4c5aa,0,.28+level*.29,0);}
 for(let level=0;level<3;level++){const y=1.89+level*.43,r=1.55-level*.42; cylinder(g,r,r,.25,0xbeb5a2,0,y,0,32);
  for(let j=0;j<8+level*2;j++){const t=2*Math.PI*j/(8+level*2),x=.82*r*Math.cos(t),z=.82*r*Math.sin(t);cylinder(g,.10,.13,.24,0x9d9b92,x,y+.22,z,10);
   const top=new THREE.Mesh(new THREE.ConeGeometry(.12,.21,10),M(0xa8a69b));top.position.set(x,y+.43,z);g.add(top);}
 }
 cylinder(g,.28,.38,.75,0xdad2bd,0,3.08,0,24);
 const stupa=new THREE.Mesh(new THREE.ConeGeometry(.36,.52,18),M(0xc2bba8));stupa.position.y=3.67;g.add(stupa);
}
function angkor(g){
 box(g,5.1,.20,4.2,0x86836e,0,.11,0);box(g,4.75,.31,3.95,0xb4a182,0,.40,0);
 box(g,3.50,.24,2.8,0xc9ba97,0,.70,0);
 for(const x of [-1.38,1.38])for(const z of [-1.0,1.0]){
  cylinder(g,.28,.43,1.25,0xb7a88c,x,1.34,z,12);
  for(let k=0;k<4;k++)cylinder(g,.28-k*.055,.31-k*.03,.18,0xa99b80,x,2.05+k*.17,z,12);
  const cap=new THREE.Mesh(new THREE.ConeGeometry(.09,.47,10),M(0xd0bc93));cap.position.set(x,2.9,z);g.add(cap);
 }
 cylinder(g,.43,.64,1.95,0xcbb68e,0,1.80,0,12);
 for(let k=0;k<5;k++)cylinder(g,.48-k*.085,.50-k*.09,.19,0xa99e83,0,2.75+k*.19,0,12);
 cylinder(g,.035,.06,.38,0xd2c4a7,0,3.81,0);
}
function pisa(g){
 box(g,4.6,.17,4.6,0x93a08a,0,.08,0);
 const tower=new THREE.Group();tower.rotation.z=.125;tower.position.set(0,.26,0);g.add(tower);
 cylinder(tower,.90,1.07,.33,0xc6bea6,0,.18,0,32);
 for(let k=0;k<8;k++){
  const y=.46+k*.38;cylinder(tower,.73,.83,.32,0xd3cebb,0,y,0,32);
  for(let j=0;j<18;j++){const a=2*Math.PI*j/18;cylinder(tower,.045,.05,.31,0xe4dbca,.82*Math.cos(a),y,.82*Math.sin(a),8);}
  const ringObj=new THREE.Mesh(new THREE.TorusGeometry(.87,.05,7,32),M(0xa99d87));ringObj.rotation.x=Math.PI/2;ringObj.position.y=y+.19;tower.add(ringObj);
 }
 cylinder(tower,.68,.79,.36,0xc7c6b5,0,3.55,0,28);
}
function samarra(g){
 box(g,5.0,.17,5.0,0x9a8a67,0,.10,0);
 const tower=new THREE.Group();tower.position.y=.23;g.add(tower);
 const h=3.7,r0=1.60;
 const body=new THREE.Mesh(new THREE.CylinderGeometry(.28,r0,h,48),M(0xc8aa77));body.position.y=h/2;tower.add(body);
 const pts=[];for(let i=0;i<=210;i++){const t=i/210,th=9*Math.PI*t,r=r0+( .30-r0)*t+.12;
  pts.push(new THREE.Vector3(r*Math.cos(th),.12+t*h,r*Math.sin(th)));}
 lineTube(tower,pts,.095,0xe5c996);
 cylinder(tower,.33,.42,.22,0xf0d5a4,0,h+.05,0,24);
}
function himeji(g){
 box(g,5.15,.20,4.4,0x9da89a,0,.10,0);
 const widths=[4.2,3.65,3.08,2.48,1.87];
 for(let i=0;i<5;i++){
  const y=.35+i*.61,w=widths[i];box(g,w,.46,w*.74,i%2?0xeee8d9:0xdadfd5,0,y+.22,0);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(w*.65,.46,4),M(0x485565,.05,.5));roof.rotation.y=Math.PI/4;
  roof.scale.z=.77;roof.position.y=y+.68;g.add(roof);
  for(const x of [-w*.26,w*.26])box(g,w*.07,.22,.02,0x425769,x,y+.40,w*.37+.02);
 }
}
function sagrada(g){
 box(g,4.5,.18,3.7,0xb9a080,0,.09,0);box(g,3.75,1.7,2.6,0xd4c6aa,0,1.1,0);
 const towers=[[-1.57,-1.18],[-.57,-1.18],[.57,-1.18],[1.57,-1.18],[-1.57,1.15],[-.57,1.15],[.57,1.15],[1.57,1.15]];
 for(const [x,z] of towers){cylinder(g,.23,.39,2.6,0xcbb897,x,2.13,z,14);
  const cone=new THREE.Mesh(new THREE.ConeGeometry(.25,.63,12),M(0xb49d77));cone.position.set(x,3.79,z);g.add(cone);
  for(let j=0;j<8;j++)cylinder(g,.23,.23,.028,0x8d8f78,x,1.26+j*.30,z,14);
 }
 cylinder(g,.30,.50,3.00,0xb4a88d,0,2.55,0,14);const spire=new THREE.Mesh(new THREE.ConeGeometry(.33,.66,14),M(0xcfb783));spire.position.y=4.33;g.add(spire);
}
function brasilia(g){
 cylinder(g,2.05,2.20,.15,0x8194a1,0,.08,0,32);
 const n=16;for(let j=0;j<n;j++){const theta=j*2*Math.PI/n;const pts=[];
  for(let i=0;i<=20;i++){const t=i/20;const radius=2.0-1.1*Math.sin(Math.PI*t)+.48*t, y=.15+3.0*t;
   pts.push(new THREE.Vector3(radius*Math.cos(theta),y,radius*Math.sin(theta)));}
  lineTube(g,pts,.057,0xf2efe5);
 }
 cylinder(g,1.21,1.6,1.56,0x84bdd2,0,.88,0,32);
}
function lotus(g){
 cylinder(g,2.42,2.42,.19,0x93a9a9,0,.09,0,40);
 for(let k=0;k<9;k++){
  const theta=2*Math.PI*k/9;const vertices=[],indices=[];const n=12,m=8;
  for(let i=0;i<=n;i++){const t=i/n,rad=.43+2.05*t,y=.28+2.15*Math.sin(Math.PI*t*.83);
   const half=.13+.49*Math.sin(Math.PI*t);
   for(let j=0;j<=m;j++){const side=(j/m*2-1)*half;
    vertices.push(rad*Math.cos(theta+side),y+.20*(1-(side/half)**2),rad*Math.sin(theta+side));}
  }
  for(let i=0;i<n;i++)for(let j=0;j<m;j++){const a=i*(m+1)+j,b=a+m+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
  g.add(new THREE.Mesh(geo,M(0xf0ede2,.02,.4)));
 }
}
function millau(g){
 box(g,6.9,.20,1.05,0x6d8890,0,2.58,0);
 for(let j=0;j<6;j++){
  const x=-2.95+j*1.16;
  box(g,.14,2.42,.14,0xbfc6bf,x,1.31,0);
  cylinder(g,.06,.10,1.40,0xdadcd3,x,3.34,0,10);
  for(const dir of [-1,1])for(let i=1;i<=3;i++){
   const target=x+dir*i*.36;if(target<-3.38||target>3.38)continue;
   lineTube(g,[new THREE.Vector3(x,4.06-i*.18,0),new THREE.Vector3(target,2.69,0)],.016,0xc7d4d6);
  }
 }
 box(g,7.12,.16,1.45,0x7b9885,0,.06,0);
}
function needle(g){
 cylinder(g,2.0,2.1,.15,0x9ea5a1,0,.08,0,32);
 const end=new THREE.Vector3(0,3.30,0);
 for(let j=0;j<3;j++){const a=j*2*Math.PI/3,start=new THREE.Vector3(1.52*Math.cos(a),.2,1.52*Math.sin(a));
  lineTube(g,[start,new THREE.Vector3(.76*Math.cos(a),1.66,.76*Math.sin(a)),end],.10,0xc8d0ca);
 }
 cylinder(g,.95,.56,.36,0x9eafba,0,3.38,0,32);
 cylinder(g,.65,1.02,.12,0xf2efe3,0,3.59,0,32);
 const dome=new THREE.Mesh(new THREE.SphereGeometry(.70,28,13,0,Math.PI*2,0,Math.PI/2),M(0xc2d8da));dome.position.y=3.62;g.add(dome);
 cylinder(g,.04,.06,.59,0xdce2e5,0,4.22,0,8);
}
/* 9 Additional Ancient & Modern Wonder 3D Architectural & Sculptural Reconstructions */
function limb(g,p1,p2,r1,r2,col,metal=.32,rough=.42,seg=18){
 const v=new THREE.Vector3().subVectors(p2,p1),len=v.length();
 const m=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,len,seg),M(col,metal,rough));
 m.position.copy(p1).add(p2).multiplyScalar(.5);
 m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());
 g.add(m);
 for(const [pt,r] of [[p1,r1*.96],[p2,r2*.96]]){
  const j=new THREE.Mesh(new THREE.SphereGeometry(r,14,12),M(col,metal,rough));
  j.position.copy(pt);g.add(j);
 }
 return m;
}
function pediment3D(g,w,h,d,col,x,y,z){
 const s=new THREE.Shape();
 s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,h);s.closePath();
 const m=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false}),M(col));
 m.position.set(x,y,z-d/2);g.add(m);
 const sIn=new THREE.Shape();
 sIn.moveTo(-w*.38,h*.14);sIn.lineTo(w*.38,h*.14);sIn.lineTo(0,h*.78);sIn.closePath();
 const mIn=new THREE.Mesh(new THREE.ExtrudeGeometry(sIn,{depth:d+.04,bevelEnabled:false}),M(0xb86f54));
 mIn.position.set(x,y,z-d/2-.01);g.add(mIn);
 return m;
}
function babylon(g){
 // Euphrates river channel & Ishtar glazed brick foundation
 box(g,5.2,.18,5.2,0x2b6e84,0,.09,0);
 box(g,4.75,.22,4.75,0xa88b61,0,.22,0);
 box(g,4.55,.14,4.55,0x26547c,0,.36,0);
 for(let tier=0;tier<5;tier++){
  const w=4.25-tier*.72,y=.42+tier*.56;
  // Brick masonry vault core
  box(g,w,.48,w,tier%2?0xcba978:0xd9bc8c,0,y+.24,0);
  // Arched vault colonnades on all 4 sides
  const cols=7-tier;
  for(let i=0;i<cols;i++){
   const off=-w*.42+(cols>1?i*(w*.84)/(cols-1):0);
   for(const s of [-1,1]){
    cylinder(g,.048,.058,.46,0xeadbc0,off,y+.24,s*(w/2+.03),12);
    cylinder(g,.048,.058,.46,0xeadbc0,s*(w/2+.03),y+.24,off,12);
    box(g,.14,.10,.08,0xb89664,off,y+.43,s*(w/2+.03));
   }
  }
  // Lush Hanging Botanical Terrace & cascading vines/palms
  box(g,w+.14,.10,w+.14,0x3d7d47,0,y+.50,0);
  box(g,w+.06,.06,w+.06,0x56a35f,0,y+.55,0);
  for(let b=0;b<cols;b++){
   const bx=-w*.38+(cols>1?b*(w*.76)/(cols-1):0);
   for(const sz of [-1,1]){
    const bush=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),M(b%2?0x2e6f3e:0x4b9454));
    bush.scale.set(1.2,.85,1.1);bush.position.set(bx,y+.60,sz*(w/2-.04));g.add(bush);
   }
  }
 }
 // Summit Royal Pavilion & cascading turquoise aqueduct waterfalls
 box(g,1.15,.48,1.15,0x26547c,0,3.42,0);
 const dome=new THREE.Mesh(new THREE.SphereGeometry(.46,20,12,0,Math.PI*2,0,Math.PI/2),M(0xd4af37,.35,.35));
 dome.position.set(0,3.66,0);g.add(dome);
 for(let s=0;s<14;s++){
  box(g,.62,.12,.22,0xd8c39e,0,.28+s*.21,2.32-s*.13);
  box(g,.32,.13,.24,0x4cc9f0,0,.30+s*.21,2.33-s*.13);
 }
}
function zeus(g){
 // Temple of Zeus at Olympia sanctuary stylobate & dark Eleusinian reflecting pool
 box(g,5.0,.18,3.9,0xc5beb0,0,.09,0);
 box(g,4.6,.18,3.5,0xd8d2c5,0,.27,0);
 box(g,4.25,.16,3.15,0xebe6da,0,.44,0);
 box(g,1.85,.04,1.15,0x1d2d3a,0,.53,.82,.25);
 // Flanking Doric colonnades & rear temple wall (open front for full view of Zeus)
 for(const sx of [-1.85,1.85])for(let k=0;k<6;k++){
  const z=-1.28+k*.51;
  cylinder(g,.10,.12,2.45,0xf2eee4,sx,1.74,z,16);
  box(g,.28,.10,.28,0xe2dcd0,sx,2.98,z);
 }
 for(let i=0;i<5;i++)cylinder(g,.10,.12,2.45,0xf2eee4,-1.28+i*.64,1.74,-1.28,16);
 box(g,4.15,.18,.26,0xdfd9cc,0,3.12,-1.28);
 box(g,.24,.18,2.85,0xdfd9cc,-1.85,3.12,0);
 box(g,.24,.18,2.85,0xdfd9cc,1.85,3.12,0);
 // Ornate Ebony, Ivory & Gold Throne of Zeus
 box(g,1.95,.42,1.65,0x2b3542,0,.73,-.12);
 box(g,1.82,.10,1.52,0xd4af37,0,.97,-.12,.42);
 // Golden footstool & lions
 box(g,1.15,.22,.56,0xc59b27,0,.64,.55,.38);
 // Throne legs, seat & high carved backrest with finial columns
 box(g,1.38,.78,1.18,0x3a2a1d,0,1.36,-.22);
 box(g,1.44,.14,1.24,0xd4af37,0,1.76,-.20,.4);
 box(g,1.42,1.68,.20,0x4a3525,0,2.52,-.72);
 for(const sx of [-.64,.64]){
  cylinder(g,.08,.09,1.82,0xd4af37,sx,2.58,-.70,14);
  box(g,.18,.14,1.18,0xd4af37,sx,2.08,-.18,.4);
  // Sphinx armrest sculptures
  cylinder(g,.10,.12,.32,0xc59b27,sx,1.90,.32,12);
 }
 // Chryselephantine (Ivory & Gold) Seated Statue of Zeus
 // Draped golden Himation robe over legs & lower body
 cylinder(g,.46,.52,.42,0xd4af37,0,1.96,-.12,18);
 limb(g,new THREE.Vector3(-.28,1.88,-.05),new THREE.Vector3(-.32,1.78,.42),.19,.17,0xd4af37,.42,.32);
 limb(g,new THREE.Vector3(.28,1.88,-.05),new THREE.Vector3(.32,1.78,.42),.19,.17,0xd4af37,.42,.32);
 limb(g,new THREE.Vector3(-.32,1.76,.42),new THREE.Vector3(-.30,1.02,.52),.16,.12,0xe2bf55,.4,.35);
 limb(g,new THREE.Vector3(.32,1.76,.42),new THREE.Vector3(.30,1.02,.52),.16,.12,0xe2bf55,.4,.35);
 // Sculpted Ivory Torso & Golden Mantle over Left Shoulder
 cylinder(g,.36,.31,.72,0xf7f2e4,0,2.44,-.14,18);
 limb(g,new THREE.Vector3(-.32,2.78,-.08),new THREE.Vector3(.18,2.12,.14),.13,.16,0xd4af37,.42,.32);
 // Noble Bearded Ivory Head & Olive Wreath Crown
 const head=new THREE.Mesh(new THREE.SphereGeometry(.25,20,16),M(0xf7f2e4,.08,.45));
 head.scale.set(.92,1.12,.96);head.position.set(0,3.04,-.10);g.add(head);
 const beard=new THREE.Mesh(new THREE.ConeGeometry(.18,.32,14),M(0xe5dec9));
 beard.rotation.x=Math.PI;beard.position.set(0,2.84,.02);g.add(beard);
 const wreath=new THREE.Mesh(new THREE.TorusGeometry(.24,.035,8,24),M(0x6b8e23,.3,.4));
 wreath.rotation.x=Math.PI/2-.15;wreath.position.set(0,3.16,-.10);g.add(wreath);
 // Right arm holding Winged Golden Nike; Left arm holding Eagle-topped Scepter
 limb(g,new THREE.Vector3(-.38,2.74,-.10),new THREE.Vector3(-.62,2.42,.22),.11,.09,0xf7f2e4,.08,.45);
 limb(g,new THREE.Vector3(-.62,2.42,.22),new THREE.Vector3(-.58,2.48,.58),.09,.08,0xf7f2e4,.08,.45);
 cylinder(g,.05,.08,.36,0xffd700,-.58,2.72,.58,12); // Golden Nike
 limb(g,new THREE.Vector3(.38,2.74,-.10),new THREE.Vector3(.66,2.56,.18),.11,.09,0xf7f2e4,.08,.45);
 limb(g,new THREE.Vector3(.66,2.56,.18),new THREE.Vector3(.68,2.85,.35),.09,.08,0xf7f2e4,.08,.45);
 cylinder(g,.032,.038,2.55,0xd4af37,.68,2.28,.36,12); // Scepter
 const eagle=new THREE.Mesh(new THREE.SphereGeometry(.09,12,10),M(0xffd700,.5,.25));
 eagle.scale.set(1.6,.9,.8);eagle.position.set(.68,3.58,.36);g.add(eagle);
}
function mausoleum(g){
 box(g,5.0,.20,4.5,0xb8b2a4,0,.10,0);
 box(g,4.4,.22,3.9,0xd0cabd,0,.31,0);
 // Tier 1: High Proconnesian Marble Podium with Amazonian Frieze & Guardian Lions
 box(g,3.75,1.28,3.25,0xeae5d9,0,1.06,0);
 box(g,3.82,.18,3.32,0xc5a876,0,1.62,0); // Sculpted Amazonian battle frieze band
 for(let i=0;i<6;i++){
  const x=-1.45+i*.58;
  box(g,.16,.28,.16,0xd5cfc2,x,.56,1.72);
  box(g,.16,.28,.16,0xd5cfc2,x,.56,-1.72);
 }
 // Tier 2: Pteron Colonnade (36 fluted Ionic columns surrounding cella + statues between columns)
 box(g,2.65,1.15,2.15,0xd8d2c4,0,2.28,0);
 for(let i=0;i<9;i++){
  const x=-1.60+i*.40;
  for(const z of [-1.36,1.36]){
   cylinder(g,.062,.074,1.12,0xf6f3ec,x,2.28,z,14);
   box(g,.16,.07,.16,0xe2dacb,x,2.85,z);
   if(i<8)cylinder(g,.04,.05,.42,0xc9a96e,x+.20,1.92,z,10);
  }
 }
 for(let j=1;j<6;j++){
  const z=-1.36+j*.453;
  for(const x of [-1.60,1.60]){
   cylinder(g,.062,.074,1.12,0xf6f3ec,x,2.28,z,14);
   box(g,.16,.07,.16,0xe2dacb,x,2.85,z);
  }
 }
 box(g,3.62,.16,3.12,0xe6e0d3,0,2.94,0);
 // Tier 3: 24-Step Pyramidal Marble Roof & Summit Royal Quadriga (4-Horse Chariot)
 for(let k=0;k<10;k++){
  const w=3.48-k*.28,d=2.98-k*.23;
  box(g,w,.10,d,k%2?0xdcd5c6:0xeee9dd,0,3.07+k*.10,0);
 }
 box(g,.96,.22,.82,0xe5dfd1,0,4.08,0);
 // 4 Bronze Horses + Royal Chariot of Mausolus & Artemisia
 for(const hx of [-.28,-.09,.09,.28]){
  box(g,.10,.26,.34,0xd4af37,hx,4.32,.14,.42);
  box(g,.08,.20,.14,0xd4af37,hx,4.48,.28,.42);
 }
 cylinder(g,.18,.22,.32,0xc59b27,0,4.35,-.18,12);
 cylinder(g,.08,.09,.38,0xf5ebd6,-.08,4.55,-.16,10);
 cylinder(g,.08,.09,.36,0xf5ebd6,.08,4.54,-.16,10);
}
function colossus(g){
 // Mandraki Harbor Aegean Sea Basin, Waves & Classical Greek Trireme Ship passing below
 box(g,5.4,.18,4.1,0x1b526b,0,.09,0);
 box(g,5.0,.06,3.7,0x287694,0,.19,0);
 for(const r of [.75,1.35,1.95])ring(g,r,r*.72,.22,.018,0x8fd3e8);
 // Classical Greek Trireme sailing through the harbor channel (z axis)
 const hull=new THREE.Mesh(new THREE.CylinderGeometry(.14,.10,1.35,12),M(0x6e472b,.1,.65));
 hull.rotation.x=Math.PI/2;hull.scale.set(1.0,.68,1);hull.position.set(0,.26,.18);g.add(hull);
 cylinder(g,.020,.025,.76,0x8d5e3c,0,.62,.15,10); // Mast
 const sail=new THREE.Mesh(new THREE.BoxGeometry(.52,.40,.03),M(0xf4efe6));
 sail.position.set(0,.65,.22);g.add(sail);

 // Twin Fortified Harbor Breakwater Moles & Tiered Parian Marble Pedestals
 for(const sx of [-.88,.88]){
  // Rusticated stone harbor mole & battlements
  box(g,1.46,.28,2.35,0xb5ad9c,sx,.28,0);
  box(g,1.28,.22,2.05,0xc8c0af,sx,.50,0);
  for(let c=0;c<4;c++)box(g,.20,.14,.18,0xb5ad9c,sx-.39+c*.26,.64,.96);
  // Octagonal White-Marble Monumental Pedestal with Bronze Relief Frieze
  cylinder(g,.58,.66,.24,0xdcd6c8,sx,.72,0,8);
  cylinder(g,.48,.54,.68,0xefeae0,sx,1.16,0,8);
  cylinder(g,.52,.52,.14,0xc8963e,sx,1.18,0,8); // Bronze bas-relief band
  cylinder(g,.56,.50,.14,0xf5f1e8,sx,1.54,0,8); // Molded marble capital
 }

 // SCULPTED CLASSICAL BRONZE STATUE OF HELIOS (Continuous Lathe Torso + Anatomical Limbs + Draped Cloak)
 const bronze=0xcd873c,bronzeHi=0xdc994e,gold=0xf4c84b,cloakCol=0x9e5b24;
 // 1. Bronze Sandals, Ankles, Sculpted Calves, Knees & Muscular Thighs joining seamlessly into Pelvis
 for(const s of [-1,1]){
  const foot=new THREE.Vector3(s*.82,1.64,.06);
  const knee=new THREE.Vector3(s*.54,2.38,.10);
  const hip=new THREE.Vector3(s*.26,3.10,.02);
  // Sculpted foot & sandal platform
  box(g,.24,.10,.40,bronze,s*.82,1.64,.10,.35);
  // Lower leg (ankle to knee) + calf muscle contour
  limb(g,foot,knee,.13,.17,bronze,.38,.36,20);
  const calf=new THREE.Mesh(new THREE.SphereGeometry(.165,18,14),M(bronzeHi,.38,.36));
  calf.scale.set(.92,1.75,1.12);calf.position.set(s*.69,2.02,.04);
  calf.rotation.z=s*.34;g.add(calf);
  // Upper leg (knee to hip) + quadriceps muscle contour
  limb(g,knee,hip,.17,.25,bronzeHi,.38,.36,20);
  const thigh=new THREE.Mesh(new THREE.SphereGeometry(.23,18,14),M(bronze,.38,.36));
  thigh.scale.set(.98,1.65,1.08);thigh.position.set(s*.39,2.76,.06);
  thigh.rotation.z=s*.35;g.add(thigh);
 }

 // 2. Seamless Anatomical Pelvis, Pleated Tunic Skirt & Gilded Greek-Key Belt
 const pelvis=new THREE.Mesh(new THREE.SphereGeometry(.38,20,16),M(bronze,.38,.36));
 pelvis.scale.set(1.15,.85,.82);pelvis.position.set(0,3.06,.02);g.add(pelvis);
 cylinder(g,.39,.48,.42,cloakCol,0,3.12,.02,24);
 for(let f=0;f<14;f++){
  const a=(f/14)*Math.PI*2;
  cylinder(g,.038,.048,.44,bronze,Math.cos(a)*.42,3.12,.02+Math.sin(a)*.36,10);
 }
 const belt=new THREE.Mesh(new THREE.CylinderGeometry(.40,.41,.10,24),M(gold,.5,.25));
 belt.scale.set(1.08,1,.86);belt.position.set(0,3.33,.02);g.add(belt);

 // 3. Continuous Sculpted Lathe Torso (Athletic Waist -> Flaring Lats -> Heroic Chest -> Neck)
 const torsoProfile=[
  new THREE.Vector2(.01,3.02),
  new THREE.Vector2(.36,3.15),
  new THREE.Vector2(.33,3.38),
  new THREE.Vector2(.38,3.62),
  new THREE.Vector2(.46,3.88),
  new THREE.Vector2(.50,4.08),
  new THREE.Vector2(.38,4.20),
  new THREE.Vector2(.18,4.28),
  new THREE.Vector2(.17,4.42),
  new THREE.Vector2(.01,4.44)
 ];
 const torsoMesh=new THREE.Mesh(new THREE.LatheGeometry(torsoProfile,28),M(bronzeHi,.38,.34));
 torsoMesh.scale.set(1.12,1,.78);torsoMesh.position.set(0,0,.02);g.add(torsoMesh);
 // Sculpted pectoral chest plates & abdominal relief
 for(const sx of [-.18,.18]){
  const pec=new THREE.Mesh(new THREE.SphereGeometry(.20,18,14),M(bronzeHi,.4,.32));
  pec.scale.set(1.08,.82,.65);pec.position.set(sx,3.98,.26);g.add(pec);
 }
 for(let row=0;row<3;row++)for(const sx of [-.08,.08]){
  const ab=new THREE.Mesh(new THREE.SphereGeometry(.078,12,10),M(bronze,.38,.36));
  ab.scale.set(1.12,.75,.55);ab.position.set(sx,3.48+row*.13,.31);g.add(ab);
 }

 // 4. Flowing Imperial Bronze Chlamys Cloak draped over Left Shoulder & cascading to Pedestal
 const fibula=new THREE.Mesh(new THREE.SphereGeometry(.085,14,12),M(gold,.55,.22));
 fibula.position.set(-.36,4.14,.26);g.add(fibula);
 limb(g,new THREE.Vector3(-.44,4.16,.16),new THREE.Vector3(.26,3.58,.22),.13,.10,cloakCol,.28,.45);
 for(let fold=0;fold<6;fold++){
  const fx=-.42-fold*.07,fz=-.08+fold*.04;
  limb(g,new THREE.Vector3(-.46,4.12,fz),new THREE.Vector3(fx,1.78,fz-.06),.08,.13,fold%2?cloakCol:bronze,.3,.42);
 }

 // 5. Noble Classical Head, Facial Features, Sculpted Hair Curls & 11-Rayed Golden Solar Crown
 const head=new THREE.Mesh(new THREE.SphereGeometry(.28,24,20),M(bronzeHi,.4,.32));
 head.scale.set(.90,1.14,.96);head.position.set(0,4.60,.04);g.add(head);
 box(g,.055,.15,.08,bronzeHi,0,4.60,.30,.4); // Nose bridge
 for(let h=0;h<12;h++){
  const a=(h/12)*Math.PI*2;
  if(Math.cos(a)<.55){
   const curl=new THREE.Mesh(new THREE.SphereGeometry(.078,10,8),M(cloakCol,.3,.4));
   curl.position.set(Math.sin(a)*.25,4.66,Math.cos(a)*.25+.02);g.add(curl);
  }
 }
 const diadem=new THREE.Mesh(new THREE.TorusGeometry(.26,.036,10,24),M(gold,.55,.22));
 diadem.rotation.x=Math.PI/2-.18;diadem.position.set(0,4.70,.04);g.add(diadem);
 for(let r=0;r<11;r++){
  const a=-Math.PI*.48+r*(Math.PI*.96/10);
  const pBase=new THREE.Vector3(.25*Math.sin(a),4.70+.25*Math.cos(a),.02);
  const pTip=new THREE.Vector3(.80*Math.sin(a),4.70+.80*Math.cos(a),.02);
  limb(g,pBase,pTip,.042,.008,gold,.55,.2,8);
 }

 // 6. Muscular Right Arm Raised High Holding the Blazing Beacon Torch of Rhodes
 const rShoulder=new THREE.Vector3(.52,4.08,.02);
 const rElbow=new THREE.Vector3(.88,4.45,.12);
 const rHand=new THREE.Vector3(.98,4.98,.16);
 limb(g,rShoulder,rElbow,.16,.13,bronzeHi,.38,.36);
 limb(g,rElbow,rHand,.13,.11,bronze,.38,.36);
 cylinder(g,.055,.045,.50,cloakCol,.98,5.02,.16,14);
 cylinder(g,.23,.085,.19,gold,.98,5.28,.16,18);
 const flameOuter=new THREE.Mesh(new THREE.ConeGeometry(.19,.50,16),M(0xff8c00,.1,.2));
 flameOuter.position.set(.98,5.58,.16);g.add(flameOuter);
 const flameInner=new THREE.Mesh(new THREE.SphereGeometry(.15,14,12),M(0xffdd44,.05,.15));
 flameInner.scale.set(1,1.4,1);flameInner.position.set(.98,5.46,.16);g.add(flameInner);

 // 7. Left Arm Bent at Hip Holding Drapery & Ceremonial Golden Scroll
 const lShoulder=new THREE.Vector3(-.52,4.08,.02);
 const lElbow=new THREE.Vector3(-.78,3.60,.14);
 const lHand=new THREE.Vector3(-.48,3.34,.30);
 limb(g,lShoulder,lElbow,.15,.12,bronzeHi,.38,.36);
 limb(g,lElbow,lHand,.12,.10,bronze,.38,.36);
 cylinder(g,.048,.048,.42,gold,-.46,3.34,.36,12);
}
function pharos(g){
 // Mediterranean Sea Base & Pharos Island Causeway (Heptastadion)
 box(g,5.0,.18,5.0,0x1f5f78,0,.09,0);
 box(g,4.2,.24,4.2,0xb8ae99,0,.26,0);
 box(g,3.5,.24,3.5,0xd2c9b4,0,.48,0);
 // Corner Sea-Wall Fortifications & Triton Statues
 for(const sx of [-1.58,1.58])for(const sz of [-1.58,1.58]){
  cylinder(g,.22,.26,.56,0xc4baa4,sx,.64,sz,12);
  cylinder(g,.08,.10,.26,0xd4af37,sx,.98,sz,10);
 }
 // Tier 1: Tapered Square Limestone Prism with Windows & Cornice Balustrade
 const t1=new THREE.Mesh(new THREE.CylinderGeometry(1.22,1.44,1.62,4),M(0xe6decb));
 t1.rotation.y=Math.PI/4;t1.position.y=1.40;g.add(t1);
 for(let row=0;row<3;row++)for(const off of [-.38,0,.38]){
  box(g,.12,.18,1.98,0x4a555e,off,.92+row*.44,0);
  box(g,1.98,.18,.12,0x4a555e,0,.92+row*.44,off);
 }
 box(g,2.15,.14,2.15,0xcbb894,0,2.24,0);
 // Tier 2: Octagonal Marble Tower with Ribbed Pilasters
 cylinder(g,.78,.86,1.12,0xdfd6c1,0,2.86,0,8);
 cylinder(g,.88,.84,.12,0xc5b08a,0,3.44,0,8);
 // Tier 3: Cylindrical Open Tholos Lantern (8 columns around the blazing beacon mirror)
 cylinder(g,.54,.58,.12,0xe8e0ce,0,3.56,0,24);
 for(let k=0;k<8;k++){
  const a=(k/8)*Math.PI*2;
  cylinder(g,.048,.055,.68,0xf2ece0,Math.cos(a)*.46,3.94,Math.sin(a)*.46,12);
 }
 // Blazing Beacon Fire & Polished Bronze Mirror inside Lantern
 const beacon=new THREE.Mesh(new THREE.SphereGeometry(.22,18,14),M(0xffaa2b,.1,.2));
 beacon.position.y=3.92;g.add(beacon);
 // Conical Cupola Dome & Summit Bronze Statue of Poseidon/Helios
 const cap=new THREE.Mesh(new THREE.ConeGeometry(.58,.42,24),M(0xb88b4a,.32,.4));
 cap.position.y=4.48;g.add(cap);
 cylinder(g,.05,.07,.38,0xd4af37,0,4.82,0,12);
}
function greatwall(g){
 // Rugged Yanshan Mountain Range Base & Terraced Slopes
 box(g,6.0,.18,3.6,0x526b49,0,.09,0);
 box(g,5.6,.22,3.1,0x647f58,0,.26,0);
 const pts=[
  new THREE.Vector3(-2.55,.62,-.75),
  new THREE.Vector3(-1.30,1.28,.48),
  new THREE.Vector3(0,.92,-.28),
  new THREE.Vector3(1.35,1.68,.52),
  new THREE.Vector3(2.55,1.28,-.45)
 ];
 // Ridgeline Mountain Mass & Crenellated Ming Dynasty Stone Wall Segments
 for(let i=0;i<pts.length-1;i++){
  const a=pts[i],b=pts[i+1],mid=a.clone().add(b).multiplyScalar(.5),len=a.distanceTo(b);
  const ridge=new THREE.Mesh(new THREE.BoxGeometry(len,mid.y,.68),M(0x6e8760));
  ridge.position.set(mid.x,mid.y/2,mid.z);
  ridge.lookAt(b.x,mid.y/2,b.z);ridge.rotateY(Math.PI/2);g.add(ridge);

  const wallSeg=new THREE.Mesh(new THREE.BoxGeometry(len,.58,.42),M(0xc8beaa));
  wallSeg.position.copy(mid);wallSeg.position.y+=.29;
  wallSeg.lookAt(b.x,b.y+.29,b.z);wallSeg.rotateY(Math.PI/2);g.add(wallSeg);

  const road=new THREE.Mesh(new THREE.BoxGeometry(len,.06,.30),M(0x9e9583));
  road.position.copy(mid);road.position.y+=.59;
  road.lookAt(b.x,b.y+.59,b.z);road.rotateY(Math.PI/2);g.add(road);
 }
 // Multi-Story Watchtowers with Arched Windows & Crenellated Parapets at Peaks
 for(const p of [pts[0],pts[1],pts[2],pts[3],pts[4]]){
  box(g,.78,p.y+.20,.78,0x6e8560,p.x,(p.y+.20)/2,p.z);
  const tower=new THREE.Mesh(new THREE.CylinderGeometry(.44,.54,.96,4),M(0xd6ccb8));
  tower.rotation.y=Math.PI/4;tower.position.set(p.x,p.y+.58,p.z);g.add(tower);
  box(g,.70,.14,.70,0xb5aa94,p.x,p.y+1.08,p.z);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(.42,.32,4),M(0x4a555e));
  roof.rotation.y=Math.PI/4;roof.position.set(p.x,p.y+1.30,p.z);g.add(roof);
 }
}
function petra(g){
 // Rose-Red Siq Sandstone Canyon Cliff Surround & Deep Excavated Niche
 const cliffDark=0x8f4936,cliffMid=0xa85842,cliffRose=0xc46d54,roseFacade=0xdc8569,roseLight=0xeb9b80,shadow=0x2d1711;
 box(g,5.4,.22,3.6,cliffDark,0,.11,0);
 // Back sandstone canyon massif & natural rock strata
 box(g,5.2,4.55,1.15,cliffMid,0,2.38,-.82);
 // Left & Right rugged Siq canyon rock walls framing the carved monument
 for(const sx of [-2.22,2.22]){
  box(g,.82,4.45,1.65,cliffDark,sx,2.34,-.22);
  box(g,.62,3.85,1.85,cliffMid,sx*.96,2.04,-.05);
  for(let st=0;st<6;st++)box(g,.86,.14,1.72,st%2?cliffRose:cliffDark,sx,.55+st*.68,-.18);
 }
 // Overhanging sandstone cliff brow at top of canyon
 box(g,5.25,.42,1.68,cliffDark,0,4.52,-.24);
 box(g,4.85,.24,1.48,cliffMid,0,4.28,-.18);
 // Deep dark carved architectural recess so columns & Tholos stand out in 3D relief
 box(g,3.72,3.92,.48,shadow,0,2.16,-.22);

 // LOWER ORDER: Stepped Portico, Pronaos Doorways, 6 Fluted Corinthian Columns & True 3D Pediment
 box(g,3.88,.24,.96,cliffRose,0,.32,.08);
 for(let s=0;s<4;s++)box(g,1.45,.07,.18,roseLight,0,.22+s*.06,.62-s*.10);
 // Inner Vestibule (Pronaos) portals: grand central doorway + 2 flanking portals
 box(g,.92,1.28,.12,roseFacade,0,1.08,-.02);
 box(g,.64,1.06,.14,0x1a0c08,0,.98,.02); // Central dark sanctuary portal
 pediment3D(g,1.04,.24,.14,roseLight,0,1.72,.04);
 for(const sx of [-1.18,1.18]){
  box(g,.56,.88,.10,roseFacade,sx,.92,-.02);
  box(g,.38,.68,.12,0x1a0c08,sx,.88,.02);
 }
 // 6 Fluted Corinthian Columns with Attic Bases & Double-Tier Acanthus Capitals
 const colX=[-1.58,-.98,-.38,.38,.98,1.58];
 for(const x of colX){
  box(g,.24,.10,.24,roseLight,x,.48,.28);
  cylinder(g,.086,.098,1.38,roseLight,x,1.22,.28,16);
  cylinder(g,.118,.088,.14,0xf5b097,x,1.94,.28,12); // Corinthian capital
  box(g,.24,.06,.24,roseFacade,x,2.03,.28);
 }
 // Lower Entablature (Architrave, Floral Frieze with Medallions, Dentil Cornice)
 box(g,3.78,.14,.62,roseFacade,0,2.12,.14);
 box(g,3.84,.16,.66,cliffRose,0,2.26,.16);
 for(let m=0;m<7;m++)cylinder(g,.055,.055,.08,roseLight,-1.50+m*.50,2.26,.48,12);
 box(g,3.92,.10,.74,roseLight,0,2.38,.18);
 // True 3D Triangular Pediment over central 4 columns
 pediment3D(g,2.35,.46,.56,roseLight,0,2.43,.22);
 // Attic plinth above lower cornice
 box(g,3.76,.18,.58,cliffRose,0,2.52,.10);

 // UPPER ORDER: Central Cylindrical Tholos (Rotunda), Conical Tent Roof, Khazneh Urn & Broken Pediments
 // Central Tholos cylinder + 6 engaged Corinthian columns
 cylinder(g,.46,.48,1.02,roseFacade,0,3.12,.12,24);
 for(let k=0;k<6;k++){
  const a=-Math.PI*.42+k*(Math.PI*.84/5);
  const cx=Math.sin(a)*.48,cz=.12+Math.cos(a)*.48;
  cylinder(g,.052,.060,.96,roseLight,cx,3.12,cz,12);
  cylinder(g,.075,.055,.10,0xf5b097,cx,3.62,cz,10);
 }
 cylinder(g,.54,.50,.12,roseLight,0,3.68,.12,24);
 // Conical Tent Roof & Sculpted Finial Khazneh Urn (The Treasury's signature crown)
 const roof=new THREE.Mesh(new THREE.ConeGeometry(.56,.48,24),M(cliffRose));
 roof.position.set(0,3.98,.12);g.add(roof);
 cylinder(g,.08,.11,.12,roseLight,0,4.24,.12,14);
 const urn=new THREE.Mesh(new THREE.SphereGeometry(.15,18,14),M(0xf7bfa8,.15,.45));
 urn.scale.set(1,1.22,1);urn.position.set(0,4.38,.12);g.add(urn);
 cylinder(g,.09,.05,.10,0xf7bfa8,0,4.54,.12,14);

 // Left & Right Wing Bays with Corinthian Columns, Sculptural Relief Niches & Broken Pediments
 for(const s of [-1,1]){
  const bx=s*1.28;
  box(g,.82,.96,.38,roseFacade,bx,3.08,.04);
  box(g,.42,.68,.12,shadow,bx,3.06,.20); // Niche shadow
  // Sculpted Amazon/Victory relief statue inside each wing niche
  cylinder(g,.06,.08,.42,0xf5b097,bx,3.02,.22,10);
  const stHead=new THREE.Mesh(new THREE.SphereGeometry(.055,10,8),M(0xf5b097));
  stHead.position.set(bx,3.28,.22);g.add(stHead);
  // Pair of flanking columns for each wing bay
  for(const ox of [-.28,.28]){
   cylinder(g,.058,.066,.94,roseLight,bx+ox,3.08,.26,12);
   cylinder(g,.082,.060,.10,0xf5b097,bx+ox,3.58,.26,10);
  }
  box(g,.88,.12,.48,roseLight,bx,3.64,.12);
  // Authentic Nabataean Broken Pediment (sloping raking cornice angled toward center)
  const brk=new THREE.Mesh(new THREE.BoxGeometry(.84,.16,.46),M(roseLight));
  brk.position.set(bx,3.78,.14);
  brk.rotation.z=-s*.28;
  g.add(brk);
 }
}
function machu(g){
 // Dramatic Huayna Picchu & Machu Picchu Andean Mountain Saddle + Agricultural Terraces
 box(g,5.2,.18,4.4,0x4a6340,0,.09,0);
 for(let k=0;k<7;k++){
  const w=4.8-k*.52,d=4.0-k*.40,y=.22+k*.30;
  box(g,w,.24,d,0x8a8578,0,y,0);
  box(g,w-.08,.08,d-.08,k%2?0x5d8c49:0x6fa158,0,y+.14,0);
 }
 // Towering Huayna Picchu green peak in the background
 const peak=new THREE.Mesh(new THREE.ConeGeometry(.95,1.85,7),M(0x46693b));
 peak.position.set(-1.35,2.45,-1.05);g.add(peak);
 // Inca Urban Sector: Trapezoidal Stone Houses with Ichu-Grass Gable Roofs + Central Plaza
 for(const [hx,hz] of [[-.92,.42],[.92,.42],[-.92,-.38],[.92,-.38]]){
  box(g,.78,.42,.54,0xc2bcb0,hx,2.42,hz);
  const roof=new THREE.Mesh(new THREE.CylinderGeometry(0,.42,.82,3),M(0x9e825a));
  roof.rotation.set(0,0,Math.PI/2);roof.scale.set(.62,1,.75);roof.position.set(hx,2.75,hz);g.add(roof);
 }
 // Sacred Intihuatana Hitching Post of the Sun on Summit Pyramid
 box(g,.62,.24,.62,0xd6d1c4,0,2.38,0);
 box(g,.38,.18,.38,0xe2ddd0,0,2.58,0);
 box(g,.16,.36,.16,0xf2ede2,0,2.82,0);
}
function christ(g){
 // Corcovado Mountain Tropical Forest Peak & Multi-Tier Granite Viewing Plaza
 box(g,4.6,.18,4.6,0x4d6b4a,0,.09,0);
 cylinder(g,1.85,2.15,.32,0x738276,0,.32,0,12);
 cylinder(g,1.38,1.58,.36,0x959e97,0,.64,0,8);
 // 8m Art Deco Octagonal Soapstone Pedestal with Vertical Pilasters & Chapel Door
 cylinder(g,.72,.84,1.02,0xbec4bf,0,1.32,0,8);
 cylinder(g,.80,.76,.12,0xd4d9d5,0,1.84,0,8);
 box(g,.28,.44,.08,0x4a524d,0,1.08,.78); // Chapel of Our Lady of Aparecida entrance

 // SCULPTED ART DECO STATUE OF CHRIST THE REDEEMER (Paul Landowski & Heitor da Silva Costa)
 const soapstone=0xe8ece9,robeShade=0xd5dbd7,heartGold=0xd4af37;
 // 1. Fluted Art Deco Chiton Tunic & Flowing Himation Mantle
 cylinder(g,.38,.48,1.95,soapstone,0,2.86,0,20);
 for(let f=0;f<8;f++){
  const fx=-.28+f*.08;
  cylinder(g,.032,.042,1.88,robeShade,fx,2.84,.34,10);
 }
 // Draped Himation mantle sash crossing diagonally from left shoulder to right hip
 limb(g,new THREE.Vector3(-.38,3.62,.22),new THREE.Vector3(.34,2.48,.28),.14,.18,robeShade,.08,.55);

 // 2. Outstretched Horizontal Arms (28m wingspan) with Draped Sleeves & Sculpted Hands
 // Main horizontal arm beam + tapered draping sleeves underneath
 box(g,2.52,.26,.28,soapstone,0,3.52,0);
 for(const s of [-1,1]){
  limb(g,new THREE.Vector3(s*.36,3.26,0),new THREE.Vector3(s*1.22,3.48,0),.22,.12,robeShade,.08,.55);
  // Sculpted open hands extending at the ends of the cross
  box(g,.24,.14,.09,soapstone,s*1.36,3.52,.02);
 }

 // 3. Sacred Heart Relief on Chest
 const heart=new THREE.Mesh(new THREE.SphereGeometry(.095,14,12),M(heartGold,.35,.35));
 heart.scale.set(1,1.15,.55);heart.position.set(0,3.44,.38);g.add(heart);

 // 4. Gently Bowed Art Deco Sculpted Head, Hair Locks & Beard
 cylinder(g,.15,.18,.22,soapstone,0,3.92,.02,16);
 const head=new THREE.Group();
 head.position.set(0,4.16,.06);
 head.rotation.x=.16; // Characteristic gentle downward gaze over Rio de Janeiro
 g.add(head);
 const skull=new THREE.Mesh(new THREE.SphereGeometry(.23,20,16),M(soapstone));
 skull.scale.set(.88,1.15,.95);head.add(skull);
 // Sculpted Art Deco hair locks framing the face & beard
 for(const sx of [-.18,.18])cylinder(head,.05,.07,.32,robeShade,sx,-.04,-.02,10);
 const beard=new THREE.Mesh(new THREE.ConeGeometry(.14,.22,12),M(robeShade));
 beard.rotation.x=Math.PI;beard.position.set(0,-.18,.08);head.add(beard);
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
 else if(shape==='opera')shellOpera(g);
 else if(shape==='hagia')hagia(g);
 else if(shape==='pantheon')pantheon(g);
 else if(shape==='eiffel')eiffel(g);
 else if(shape==='atomium')atomium(g);
 else if(shape==='burj')burj(g);
 else if(shape==='borobudur')borobudur(g);
 else if(shape==='angkor')angkor(g);
 else if(shape==='pisa')pisa(g);
 else if(shape==='samarra')samarra(g);
 else if(shape==='himeji')himeji(g);
 else if(shape==='sagrada')sagrada(g);
 else if(shape==='brasilia')brasilia(g);
 else if(shape==='lotus')lotus(g);
 else if(shape==='millau')millau(g);
 else if(shape==='needle')needle(g);
 else if(shape==='babylon')babylon(g);
 else if(shape==='zeus')zeus(g);
 else if(shape==='mausoleum')mausoleum(g);
 else if(shape==='colossus')colossus(g);
 else if(shape==='pharos')pharos(g);
 else if(shape==='greatwall')greatwall(g);
 else if(shape==='petra')petra(g);
 else if(shape==='machu')machu(g);
 else if(shape==='christ')christ(g);
 else throw new Error(`No verified geometry lesson for ${shape}`);
 g.userData.modelSource='MATHVERSE educational geometric abstraction; not a LiDAR/photogrammetry scan';
 return g;
}
export function disposeTeachingModel(group){group?.traverse?.(o=>{o.geometry?.dispose?.();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose?.());}});}
