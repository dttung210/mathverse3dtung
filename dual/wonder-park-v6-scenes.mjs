/*
 * MATHVERSE Wonder Park V6: four new playable 3D attractions, richer sanctuary,
 * and two seated rocket passengers. All geometry is original Three.js meshes.
 * Uses the EXISTING Grand Campus WebGL renderer; never creates another canvas.
 */
import * as THREE from '/vendor/three.module.js';
const TAU = 2 * Math.PI;
const clamp = (x,a,b) => Math.min(b,Math.max(a,x));
const smooth = t => {const u=clamp(t,0,1);return u*u*(3-2*u);};
function mat(hex,metalness=0,roughness=.6){return new THREE.MeshStandardMaterial({color:hex,metalness,roughness});}
const MAT={
  wood:mat(0x8d5b37), gold:mat(0xf0cf83,.55,.28), pale:mat(0xeed7ad),
  teal:mat(0x2a7b8d,.35,.38), navy:mat(0x244261), glass:new THREE.MeshStandardMaterial({color:0xb3edff,transparent:true,opacity:.38,roughness:.12,metalness:.14,depthWrite:false,side:THREE.DoubleSide}),
  water:new THREE.MeshStandardMaterial({color:0x1aa9ca,transparent:true,opacity:.72,roughness:.24,depthWrite:false}),
  red:mat(0xb94c3d), white:mat(0xf5e7c5), steel:mat(0x8499b2,.65,.24)
};
function shape(g,m,parent,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o;}
const cube=(p,w,h,d,m,x=0,y=0,z=0)=>shape(new THREE.BoxGeometry(w,h,d),m,p,x,y,z);
const ball=(p,r,m,x=0,y=0,z=0)=>shape(new THREE.SphereGeometry(r,16,12),m,p,x,y,z);
const cyl=(p,rt,rb,h,m,x=0,y=0,z=0,n=18)=>shape(new THREE.CylinderGeometry(rt,rb,h,n),m,p,x,y,z);
function line(p,a,b,r,m){const v=new THREE.Vector3(...a),w=new THREE.Vector3(...b),d=w.clone().sub(v);const o=cyl(p,r,r,d.length(),m);o.position.copy(v.add(w).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o;}
function tube(p,points,r,m,closed=false,segments=130){const path=new THREE.CatmullRomCurve3(points.map(a=>new THREE.Vector3(...a)),closed,'centripetal');shape(new THREE.TubeGeometry(path,segments,r,7,closed),m,p);return path;}
function localCamera(o,offset,lookOffset,fov=66){
 o.updateWorldMatrix(true,false);const p=o.getWorldPosition(new THREE.Vector3());
 return {eye:{x:p.x+offset[0],y:p.y+offset[1],z:p.z+offset[2]},look:{x:p.x+lookOffset[0],y:p.y+lookOffset[1],z:p.z+lookOffset[2]},fov};
}
function littleRider(parent,bodyHex=0x3476ad,skinHex=0xe5b18b,scale=1){
 const g=new THREE.Group();g.scale.setScalar(scale);parent.add(g);
 const coat=mat(bodyHex),skin=mat(skinHex),dark=mat(0x1a3756);
 ball(g,.34,coat,0,.72,0).scale.set(1.1,1.1,.82);
 ball(g,.23,skin,0,1.28,.07);
 ball(g,.2,dark,0,1.42,-.02).scale.set(1,.4,.9);
 for(const side of [-1,1]){
  cube(g,.13,.58,.17,coat,side*.38,.78,0).rotation.z=side*.34;
  ball(g,.1,skin,side*.46,.48,.04);
  cube(g,.16,.42,.19,dark,side*.17,.19,.1);
 }
 return g;
}
export function addRocketCrew(rocket){
 const crew=new THREE.Group();rocket.add(crew);crew.position.set(0,.0,0);
 cube(crew,2.6,.22,1.15,MAT.navy,0,1.3,1.85);
 cube(crew,2.6,1.05,.18,MAT.teal,0,1.92,1.32);
 for(const side of [-1,1]){
  cube(crew,.86,.14,.67,MAT.steel,side*.57,1.48,1.94);
  const rider=littleRider(crew,side===-1?0x346ab0:0xf1bd61,side===-1?0xe5b18b:0xf2c6a4,.7);
  rider.position.set(side*.58,1.45,2.03);
  const helm=ball(rider,.3,side===-1?MAT.white:MAT.gold,0,1.29,.03);helm.material.transparent=true;helm.material.opacity=.85;
  cube(crew,.1,.8,.09,MAT.gold,side*.57,2.17,2.25);
 }
 // The player and NPC sit together and move with the rocket group.
 crew.userData.seatedNpcCount=1;crew.userData.seatedPlayerCount=1;
 return crew;
}

export function createGlassBridge(root){
 const g=new THREE.Group();g.name='WONDER_GLASS_BRIDGE_10_STEPS';root.add(g);
 const water=cyl(g,7.4,7.4,.16,MAT.water,0,.83,0,48);
 const waterRim=shape(new THREE.TorusGeometry(7.45,.14,12,64),MAT.gold,g,0,.90,0);waterRim.rotation.x=Math.PI/2;
 const shore=MAT.wood,glow=mat(0x94edff,.5,.2);
 const conqueredGlass=new THREE.MeshStandardMaterial({color:0x34d399,emissive:0x059669,emissiveIntensity:.45,transparent:true,opacity:.68,roughness:.12,metalness:.16,side:THREE.DoubleSide});
 const pads=[];
 for(let k=0;k<10;k++){
  const z=5.25-k*1.16;
  const panel=cube(g,3.5,.11,1.06,MAT.glass,0,4.02,z);panel.renderOrder=2;
  cube(g,3.68,.08,.095,glow,0,4.10,z+.52);cube(g,3.68,.08,.095,glow,0,4.10,z-.52);
  cube(g,.07,.08,1.04,glow,-1.78,4.1,z);cube(g,.07,.08,1.04,glow,1.78,4.1,z);
  pads.push(panel);
  for(const side of [-1,1]){
   const x=side*1.96;
   cyl(g,.055,.065,1.0,MAT.steel,x,4.56,z+.40);
   ball(g,.09,MAT.gold,x,5.08,z+.40);
   line(g,[x,5.02,z-.54],[x,5.02,z+.55],.04,MAT.gold);
  }
 }
 for(const z of [-6.4,6.45]){
  cube(g,4.8,.35,1.5,shore,0,3.77,z);
  for(let x=-1.6;x<=1.6;x+=.8)ball(g,.13,MAT.gold,x,4.08,z);
 }
 // Shatter glass shards for fail animation
 const shards=[];
 for(let i=0;i<12;i++){
  const sh=cube(g,.32,.04,.28,MAT.glass,(i%4-1.5)*.6,4.0,0);
  sh.visible=false;shards.push(sh);
 }
 // Water is visibly below the transparent crossing and has ripple rings.
 const ripples=[];
 for(let i=0;i<4;i++){
  const r=shape(new THREE.RingGeometry(.4+i*.7,.43+i*.7,50),new THREE.MeshBasicMaterial({color:0xb3f9ff,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false}),g,0,.93,1.5);
  r.rotation.x=-Math.PI/2;ripples.push(r);
 }
 const rider=littleRider(g,0x286f9e,0xe7b18d,1.1);rider.position.set(0,4.02,5.55);
 const st={group:g,pads,rider,ripples,shards,progress:0,phase:'idle',elapsed:0,fallY:0,splashAge:0};
 st.reset=()=>{st.progress=0;st.phase='play';st.elapsed=0;st.fallY=0;st.splashAge=0;rider.position.set(0,4.02,5.55);rider.rotation.set(0,0,0);rider.visible=true;pads.forEach(p=>{p.material=MAT.glass;p.visible=true;});shards.forEach(s=>{s.visible=false;});};
 st.correct=()=>{st.progress=Math.min(10,st.progress+1);if(pads[st.progress-1])pads[st.progress-1].material=conqueredGlass;st.phase=st.progress>=10?'win':'step';st.elapsed=0;};
 st.fail=()=>{
  st.phase='fall';st.elapsed=0;st.splashAge=0;
  const failIdx=Math.min(9,st.progress);
  if(pads[failIdx])pads[failIdx].visible=false;
  const fz=5.25-failIdx*1.16;
  shards.forEach((s,i)=>{s.visible=true;s.position.set((i%4-1.5)*.65,3.98,fz+(Math.floor(i/4)-1)*.28);s.rotation.set(i*.3,i*.5,i*.2);});
 };
 st.tick=(dt,t)=>{
  st.elapsed+=dt;
  if(st.phase==='step'||st.phase==='win'){
   const dest=5.55-st.progress*1.15;rider.position.z+= (dest-rider.position.z)*Math.min(1,dt*4.0);
   rider.position.y=4.02+.16*Math.sin(st.elapsed*11)*Math.max(0,1-st.elapsed);
   if(st.phase==='step'&&st.elapsed>.85)st.phase='play';
  }else if(st.phase==='fall'){
   const e=st.elapsed;rider.position.y=Math.max(.96,4.02-7.7*e*e);
   rider.rotation.z+=dt*2.2;
   shards.forEach((s,i)=>{s.position.y=Math.max(.92,3.98-8.2*e*e-i*.04);s.rotation.x+=dt*4;s.rotation.z+=dt*3;});
   if(e>.62){st.phase='splash';st.splashAge=0;rider.visible=false;shards.forEach(s=>{s.visible=false;});}
  }else if(st.phase==='splash') st.splashAge+=dt;
  ripples.forEach((r,i)=>{r.rotation.z=t*.14;const s=1+.055*Math.sin(t*1.6+i);r.scale.setScalar(st.phase==='splash'?1+st.splashAge*2.8:s);r.material.opacity=st.phase==='splash'?Math.max(0,.62-st.splashAge*.38):.14+.08*Math.sin(t*2+i);});
 };
 st.cameraPose=(view='follow',zoom=1)=>{
  const z=clamp(zoom,.55,2.2);
  return view==='lookdown'?localCamera(rider,[1.8*z,5.5*z,5.4*z],[0,-3,0],70):localCamera(rider,[7.5*z,6.0*z,9.5*z],[0,.5,-3],65);
 };
 return st;
}

export function createArchitectScene(root){
 const g=new THREE.Group();g.name='WONDER_ARCHITECT_TEN_MODULES';root.add(g);
 cube(g,12.4,.28,11.4,mat(0xcab88c),0,.64,0);
 const wall=mat(0xf1d8a7),roof=mat(0xc45e43),wood=mat(0xa57546),windowMat=mat(0x77bed6,.15,.25);
 // 3D Rotating Golden Tower Crane beside the construction site
 const craneBase=cyl(g,.45,.58,6.8,MAT.gold,-4.8,4.0,-3.6,12);
 const craneBoom= new THREE.Group();craneBoom.position.set(-4.8,7.35,-3.6);g.add(craneBoom);
 cube(craneBoom,6.8,.22,.22,MAT.gold,2.2,0,0);
 cube(craneBoom,1.2,.42,.42,MAT.steel,-1.1,-.1,0);
 line(craneBoom,[0,.7,0],[4.8,.05,0],.035,MAT.steel);
 const craneHook=cyl(craneBoom,.12,.12,.8,MAT.steel,4.5,-.45,0,8);
 ball(craneBoom,.18,MAT.red,4.5,-.92,0);
 const specs=[
  ['foundation',0,.92,0,6,.3,5,MAT.steel],
  ['front',0,2.35,2.35,6,2.55,.25,wall],
  ['back',0,2.35,-2.35,6,2.55,.25,wall],
  ['left',-2.88,2.35,0,.24,2.55,4.4,wall],
  ['right',2.88,2.35,0,.24,2.55,4.4,wall],
  ['door',0,1.85,2.55,1.1,1.7,.24,wood],
  ['windowLeft',-1.6,2.5,2.58,1,.8,.12,windowMat],
  ['windowRight',1.6,2.5,2.58,1,.8,.12,windowMat],
  ['roofLeft',-1.6,4.36,0,3.9,.30,5.9,roof],
  ['roofRight',1.6,4.36,0,3.9,.30,5.9,roof],
 ];
 const parts=specs.map(([name,x,y,z,w,h,d,m],i)=>{
  const group=new THREE.Group();group.name='HOUSE_MODULE_'+(i+1)+'_'+name;g.add(group);
  const piece=cube(group,w,h,d,m);
  if(name==='roofLeft')piece.rotation.z=Math.PI/6;
  if(name==='roofRight')piece.rotation.z=-Math.PI/6;
  const home=new THREE.Vector3(x,y,z),waiting=new THREE.Vector3(-5.6+(i%5)*2.7,.95,7.1+Math.floor(i/5)*1.5);
  return {group,home,waiting,visible:false,placed:false,launch:new THREE.Vector3((i%3-1)*.7,.45+i*.07,(i%2?.7:-.7))};
 });
 const st={group:g,parts,craneBoom,progress:0,phase:'idle',elapsed:0};
 st.reset=()=>{st.progress=0;st.phase='play';st.elapsed=0;parts.forEach(p=>{p.group.position.copy(p.waiting);p.group.visible=true;p.group.rotation.set(0,0,0);p.placed=false;});};
 st.correct=()=>{if(st.progress>=10)return;st.progress++;st.elapsed=0;st.phase=st.progress===10?'win':'build';parts[st.progress-1].placed=true;};
 st.fail=()=>{st.phase='collapse';st.elapsed=0;};
 st.tick=(dt,t)=>{
  st.elapsed+=dt;
  const targetBoomYaw=st.phase==='build'?-.42+st.progress*.08:Math.sin(t*.7)*.25-.3;
  craneBoom.rotation.y+=(targetBoomYaw-craneBoom.rotation.y)*Math.min(1,dt*4);
  if(st.phase==='collapse'){
   parts.forEach(p=>{if(p.placed){p.group.position.addScaledVector(p.launch,dt*6);p.group.rotation.z+=dt*.9;p.group.rotation.x+=dt*1.2;p.group.position.y=Math.max(-3,p.group.position.y-6*dt*dt);}});
  }else{
   parts.forEach(p=>{if(p.placed)p.group.position.lerp(p.home,Math.min(1,dt*8));});
   if(st.phase==='build'&&st.elapsed>.55)st.phase='play';
  }
 };
 st.cameraPose=(zoom=1)=>{const z=clamp(zoom,.55,2.2);return localCamera(g,[11.5*z,9.5*z,13*z],[0,2,0],68);};
 return st;
}

export function createCoasterScene(root){
 const g=new THREE.Group();g.name='WONDER_COMPLEX_COASTER_WITH_FORK';root.add(g);
 // Main railway folds back through two vertical loops and a banked S-turn.
 const controls=[
  [0,2.6,5.6],[2.2,4.0,4.1],[4.7,8,2.5],[2.5,11.0,1.2],[-.2,9.2,.7],[-1.0,4.0,.5],
  [-2.6,2.5,-.8],[-4.5,7.2,-2.1],[-4.1,10,-2.9],[-1.1,9.3,-3.3],[1.9,5,-3.8],
  [4.4,7,-3.1],[5.2,3.3,-.8],[4.3,2.5,1.4],[2.0,2.6,3.7],[0,2.6,5.6]
 ];
 const safe=tube(g,controls,.15,mat(0xffb255,.34,.32),false,240);
 // Parallel track follows main curve, sleepers connect the rails.
 const offset=controls.map(([x,y,z])=>[x+.32,y+.04,z+.18]);
 tube(g,offset,.10,MAT.steel,false,240);
 for(let i=0;i<66;i++){
  const p=safe.getPoint(i/65),t=safe.getTangent(i/65);
  const rail=cube(g,.73,.08,.22,MAT.wood,p.x,p.y-.12,p.z);
  rail.rotation.y=Math.atan2(t.x,t.z);
 }
 // Glowing Neon Speed Gates along the coaster track
 const speedGates=[];
 for(const u of [.12,.28,.45,.62,.80,.92]){
  const p=safe.getPoint(u),tang=safe.getTangent(u);
  const gate=shape(new THREE.TorusGeometry(1.15,.065,10,32),new THREE.MeshBasicMaterial({color:u<.74?0x00f5d4:0xfbbf24}),g,p.x,p.y+.35,p.z);
  gate.lookAt(p.x+tang.x,p.y+.35+tang.y,p.z+tang.z);
  speedGates.push(gate);
 }
 for(let x of [-4,0,4])for(let z of [-3,3]){
  line(g,[x,.81,z],[x,4.6,z],.10,MAT.steel);
 }
 // Physical roller-coaster loop frames make the silhouette unmistakable.
 for(const [x,z,r] of [[-2,1.9,3.2],[2.3,-2.3,3.0]]){
  const loop=shape(new THREE.TorusGeometry(r,.12,8,68),mat(0xffb255,.3,.36),g,x,r+1.1,z);
  loop.rotation.y=.17;
  line(g,[x-r,.82,z],[x-r,r+1.1,z],.075,MAT.steel);
  line(g,[x+r,.82,z],[x+r,r+1.1,z],.075,MAT.steel);
 }
 const split=safe.getPoint(.74);
 const broken=tube(g,[[split.x,split.y,split.z],[split.x+1,split.y+1,split.z-1],[split.x+2,split.y+2,split.z-2]],.18,MAT.red,false,40);
 // The red branch visibly terminates in broken segments before the sky.
 for(let i=0;i<3;i++){
  cube(g,.38,.13,.13,MAT.red,split.x+2.2+i*.30,split.y+2.2+i*.24,split.z-2.2-i*.31).rotation.z=i*.3;
 }
 const station=cube(g,4.5,.38,3,MAT.navy,0,2.26,5.65);
 for(const x of [-2,2])cyl(g,.10,.13,3.3,MAT.gold,x,3.95,5.1);
 cube(g,5.3,.36,3.2,MAT.gold,0,5.6,5.1);
 const cart=new THREE.Group();cart.name='COASTER_CART_QUIZ_PLAYER';g.add(cart);
 cube(cart,1.35,.60,1.55,mat(0xe27f65),0,.25,0);
 cube(cart,1.32,.65,.16,MAT.steel,0,.65,-.68);
 const rider=littleRider(cart,0x3e8bb2,0xe9bd98,.88);rider.position.y=.35;
 const st={group:g,cart,safe,split,speedGates,progress:0,phase:'idle',elapsed:0,forkAt:.74,failAnchor:null};
 st.reset=()=>{st.phase='play';st.progress=0;st.elapsed=0;cart.visible=true;cart.rotation.set(0,0,0);cart.position.copy(safe.getPoint(0));};
 st.correct=()=>{st.progress=Math.min(10,st.progress+1);st.phase=st.progress>=10?'station':'move';st.elapsed=0;};
 st.fail=()=>{st.phase='broken';st.elapsed=0;st.failAnchor=safe.getPoint(st.forkAt).clone();};
 st.tick=(dt,t)=>{
  st.elapsed+=dt;
  speedGates.forEach((gt,idx)=>{gt.scale.setScalar(1+.06*Math.sin(t*3.2+idx));});
  if(st.phase==='broken'){
   const e=st.elapsed;cart.position.copy(st.failAnchor).add(new THREE.Vector3(e*5,3*e*e+e*2,-3*e));cart.rotation.z=e*2.4;cart.rotation.x=e*1.1;cart.visible=e<2.4;
  }else if(st.phase==='move'||st.phase==='play'||st.phase==='station'){
   const target=st.phase==='station'?1:st.progress/10;
   const u=st.phase==='station'?Math.min(1,.82+st.elapsed*.11):target;
   const p=safe.getPoint(clamp(u,0,1));cart.position.lerp(p,Math.min(1,dt*5));
   const tang=safe.getTangent(clamp(u,0,1));cart.rotation.set(0,Math.atan2(tang.x,tang.z),-.12*Math.sin(t*4));
   if(st.phase==='move'&&st.elapsed>.9)st.phase='play';
  }
 };
 st.cameraPose=(zoom=1)=>{const z=clamp(zoom,.55,2.2);return localCamera(cart,[9.0*z,5.8*z,10*z],[0,.8,0],73);};
 return st;
}

export function createBalloonScene(root){
 const g=new THREE.Group();g.name='WONDER_SIGHTSEEING_BALLOON';root.add(g);
 // Launchpad mooring ring & boarding steps
 cyl(g,3.8,4.1,.24,MAT.navy,0,.12,0,32);
 const padRim=shape(new THREE.TorusGeometry(3.92,.11,10,48),MAT.gold,g,0,.24,0);padRim.rotation.x=Math.PI/2;
 const flight=new THREE.Group();flight.name='BALLOON_FLIGHT_RIG';g.add(flight);
 const colorful=[
  0xf43f5e,0xfbbf24,0x10b981,0x38bdf8,0xa855f7,0xf97316,
  0xec4899,0xfacc15,0x2dd4bf,0x60a5fa,0xc084fc,0xfb923c
 ];
 for(let i=0;i<12;i++){
  const panel=shape(new THREE.SphereGeometry(3.05,18,16,i*TAU/12,TAU/12,0,Math.PI),mat(colorful[i],.14,.34),flight,0,7.45,0);
  panel.scale.y=1.22;
 }
 // Gilded equatorial belt & crown ring
 const eqBelt=shape(new THREE.TorusGeometry(3.04,.09,12,48),MAT.gold,flight,0,7.45,0);eqBelt.rotation.x=Math.PI/2;
 const lowerCollar=cyl(flight,1.05,.82,.45,MAT.gold,0,4.05,0,24);
 const cap=cyl(flight,.75,.78,.22,MAT.gold,0,11.12,0,24);
 // Radiant Burner Flame inside collar
 const burnerFlame=shape(new THREE.ConeGeometry(.42,1.25,16),new THREE.MeshBasicMaterial({color:0xffb703,transparent:true,opacity:.92}),flight,0,3.45,0);
 const burnerCore=shape(new THREE.SphereGeometry(.26,12,12),new THREE.MeshBasicMaterial({color:0xffffff}),flight,0,3.15,0);
 // Detailed Wicker Basket with Gold Trim & Sandbags
 const basket=cube(flight,2.55,1.32,2.25,mat(0x9a6a3b,.08,.65),0,1.28,0);
 basket.material.side=THREE.DoubleSide;
 cube(flight,2.68,.16,2.38,MAT.gold,0,1.94,0);
 for(const sx of [-1,1])for(const sz of [-1,1]){
  line(flight,[sx*1.12,1.92,sz*.96],[sx*1.82,5.4,sz*1.45],.055,MAT.gold);
  ball(flight,.18,MAT.red,sx*1.32,1.42,sz*.85).scale.set(.8,1.35,.8);
 }
 const rider=littleRider(flight,0x4297b7,0xecc2a0,1.18);rider.position.set(0,1.82,0);
 const st={group:g,flight,basket,rider,burnerFlame,burnerCore,progress:0,phase:'idle',elapsed:0,flightDuration:60,routeDistance:188,flightHeight:44,heading:0};
 st.reset=()=>{st.progress=0;st.phase='play';st.elapsed=0;st.heading=0;flight.visible=true;flight.position.set(0,0,0);flight.rotation.set(0,0,0);};
 st.correct=()=>{
  st.progress=Math.min(10,st.progress+1);
  if(st.progress<10){st.phase='play';flight.position.y=st.progress*.22;}
  else{st.phase='tour';st.elapsed=0;}
 };
 st.fail=()=>{st.phase='drop';st.elapsed=0;};
 st.tick=(dt,t)=>{
  st.elapsed+=dt;
  const flamePulse=1+.28*Math.sin(t*14)+(st.phase==='tour'?.35:0);
  burnerFlame.scale.set(1+.12*Math.sin(t*11),flamePulse,1+.12*Math.cos(t*11));
  burnerCore.scale.setScalar(.9+.2*Math.sin(t*16));
  if(st.phase==='tour'){
   // 60-second (1 full minute) grand scenic flight over Wonder Park, Grand Dome, Lab, Discovery & Museum!
   const e=st.elapsed,dur=st.flightDuration;
   let lift=0,px=0,pz=0;
   if(e<6){
    // 0-6s: Smooth liftoff above Wonder Park
    lift=smooth(e/6);
    pz=smooth(e/6)*18;
    px=Math.sin(e*.5)*6;
   }else if(e<52){
    // 6-52s: 46-second grand panoramic circuit across the entire Campus
    lift=1+.08*Math.sin((e-6)*.35);
    const u=(e-6)/46;
    const loopAngle=u*TAU;
    // Sweeps from Wonder Park (z=18) up to North Discovery (z=235 in local coords) and across West Lab / East Museum (x = +/- 105)
    pz=18+108*(1-Math.cos(loopAngle));
    px=96*Math.sin(loopAngle);
    st.heading=Math.atan2(96*Math.cos(loopAngle),108*Math.sin(loopAngle));
   }else if(e<dur){
    // 52-60s: Gentle descent & landing back at the Wonder Park mooring pad
    const u=smooth((e-52)/(dur-52));
    lift=1-u;
    pz=18*(1-u);
    px=0;
    st.heading*=(1-u);
   }else{
    st.phase='landed';
    flight.position.set(0,0,0);
    flight.rotation.set(0,0,0);
    return;
   }
   flight.position.set(px,lift*st.flightHeight,pz);
   flight.rotation.z=.04*Math.sin(t*1.1);
   flight.rotation.x=.03*Math.cos(t*.9);
  }else if(st.phase==='drop'){
   const e=st.elapsed;flight.position.y=-Math.min(10,3.5*e*e);flight.rotation.z=Math.sin(e*9)*.19;
   if(e>2)flight.visible=false;
  }else if(st.phase==='play'){
   flight.position.y=st.progress*.22+.18*Math.sin(t*1.4);
  }
 };
 st.cameraPose=(view='near',zoom=1)=>{
  const z=clamp(zoom,.45,2.6);
  flight.updateWorldMatrix(true,false);
  const p=flight.getWorldPosition(new THREE.Vector3());
  if(view==='eye'||view==='first'){
   // First-person Eye View right inside the balloon basket overlooking the entire 3D Grand Campus!
   const panAngle=st.phase==='tour'?(st.elapsed*.22):0;
   const lookDist=85;
   const lx=p.x*0.15+Math.sin(panAngle)*lookDist;
   const lz=Math.cos(panAngle)*lookDist;
   return {
    eye:{x:p.x,y:p.y+3.35,z:p.z+0.35},
    look:{x:lx,y:Math.max(2.5,p.y*0.32),z:lz},
    fov:76
   };
  }
  if(view==='far'||view==='overhead'||view==='promenade'){
   // Far / Wide tracking camera so user sees the entire hot air balloon flying across the sky & campus
   return {
    eye:{x:p.x+26*z,y:p.y+18*z,z:p.z+32*z},
    look:{x:p.x,y:p.y+5.5,z:p.z},
    fov:68
   };
  }
  // Near / Close follow camera ('near' or 'bow') showing the balloon clearly
  return {
   eye:{x:p.x+11.5*z,y:p.y+6.2*z,z:p.z+14.5*z},
   look:{x:p.x,y:p.y+5.8,z:p.z},
   fov:70
  };
 };
 return st;
}

export function enrichSanctuary(room){
 // A higher-quality original red/gold decorative pass without reusing external assets.
 const lacquer=mat(0x833825,.2,.34),bronze=mat(0xe4bd77,.68,.21),ivory=mat(0xf1ddba),dark=mat(0x4b211b);
 for(const x of [-13.7,13.7]){
  for(const z of [-15,-7,1,9,16]){
   const base=cyl(room,.74,.81,.38,bronze,x,.17,z);
   cyl(room,.51,.54,10.6,lacquer,x,5.7,z);
   cyl(room,.72,.76,.34,bronze,x,11.2,z);
   for(let y=1.4;y<10;y+=1.8)cyl(room,.56,.56,.11,bronze,x,y,z);
  }
 }
 // Two display-side lantern rows and hanging golden tassels.
 for(const x of [-11.5,11.5])for(const z of [-12,-5,2,9]){
  line(room,[x,12.3,z],[x,9.5,z],.035,bronze);
  const lamp=ball(room,.41,ivory,x,9.2,z);lamp.scale.set(.65,1.15,.65);
  cyl(room,.25,.28,.12,bronze,x,9.64,z);
  cyl(room,.25,.28,.12,bronze,x,8.77,z);
  const flame=ball(room,.11,new THREE.MeshBasicMaterial({color:0xffdf95}),x,9.2,z+.04);
 }
 // Floor geometric motifs and lotus blooms near the statue.
 for(let k=0;k<16;k++){
  const a=k*TAU/16,x=7.7*Math.cos(a),z=-11.5+4.0*Math.sin(a);
  const petal=ball(room,.34,k%2?bronze:ivory,x,.22,z);
  petal.scale.set(1.35,.25,.68);petal.rotation.y=a;
 }
 for(const x of [-6.7,6.7]){
  const plinth=cyl(room,1.18,1.35,.44,bronze,x,.22,-16.6);
  const lotus=ball(room,.65,ivory,x,1.0,-16.6);lotus.scale.set(1.7,.32,1.2);
  for(let i=0;i<9;i++){
   const a=i*TAU/9;
   const p=ball(room,.35,bronze,x+.56*Math.cos(a),1.0,-16.6+.56*Math.sin(a));p.scale.set(1,.43,.8);
  }
 }
 // Upper gilded roof ribs and banners give depth without huge polygon budgets.
 for(let i=0;i<7;i++)cube(room,29,.10,.21,bronze,0,12.45,-16+i*5);
 for(const x of [-8.5,8.5]){
  cube(room,.17,6,.15,bronze,x,7.8,-19.0);
  const hanging=cube(room,1.6,3.7,.10,dark,x,8.0,-19.0);
  for(let j=0;j<3;j++)cube(room,1.23,.06,.15,bronze,x,9.1-j*.9,-18.91);
 }
 return room;
}
