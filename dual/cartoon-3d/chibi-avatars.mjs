/** Original procedural Chibi-Cartoon 3D characters for MATHVERSE. No external downloads. */
import * as THREE from '/mathverse3dtung/vendor/three.module.js?v=r107_v15';

export const CHIBI_PRESETS=Object.freeze([
 {id:'chibi-amber',name:'Chibi Áo Cam',coat:0xe48c3a,hair:0x393238,skin:0xffd7b6,shoe:0xbc6942,extras:'glasses'},
 {id:'chibi-sakura',name:'Chibi Sakura',coat:0xe08dc5,hair:0x554054,skin:0xffd9c7,shoe:0x835bb2,extras:'ribbon'},
 {id:'chibi-ocean',name:'Chibi Đại Dương',coat:0x2d91cb,hair:0x28334c,skin:0xf1c5a4,shoe:0x315d93,extras:'glasses'},
 {id:'chibi-mint',name:'Chibi Bạc Hà',coat:0x45bea8,hair:0x694737,skin:0xf8d5b7,shoe:0xdbaf48,extras:'cap'},
 {id:'chibi-astro',name:'Chibi Phi Hành Gia',coat:0xe9e6db,hair:0x353344,skin:0xf6cbb3,shoe:0xe77e3c,extras:'helmet'},
 {id:'chibi-lavender',name:'Chibi Oải Hương',coat:0x9c86db,hair:0x4a3954,skin:0xf2caac,shoe:0x5d9cc4,extras:'ribbon'},
 {id:'chibi-scientist',name:'Chibi Nhà Khoa Học',coat:0xe4f4f7,hair:0x443632,skin:0xfad6bf,shoe:0x4da59e,extras:'glasses'},
 {id:'chibi-sun',name:'Chibi Mặt Trời',coat:0xecc050,hair:0x2c2738,skin:0xf6d1a7,shoe:0xc66b49,extras:'cap'},
 {id:'chibi-robot',name:'Chibi Robot',coat:0xa8d9ec,hair:0x30566e,skin:0xe4f7ff,shoe:0x2987b4,extras:'visor'},
 {id:'chibi-night',name:'Chibi Đêm Sao',coat:0x536bc2,hair:0x18263b,skin:0xffdcc8,shoe:0x7285bd,extras:'glasses'}
]);
export const isChibiPreset=id=>CHIBI_PRESETS.some(item=>item.id===id);
export const chibiPresetName=id=>CHIBI_PRESETS.find(item=>item.id===id)?.name;

export function createChibiAvatar(id){
 const cfg=CHIBI_PRESETS.find(x=>x.id===id)||CHIBI_PRESETS[0];
 const root=new THREE.Group();root.name='MATHVERSE_CHIBI_CHARACTER_'+cfg.id;
 const limbGroup=new THREE.Group();root.add(limbGroup);
 const mat=(c,rough=.74)=>new THREE.MeshStandardMaterial({color:c,roughness:rough,metalness:.01});
 const colors={coat:mat(cfg.coat),hair:mat(cfg.hair,.84),skin:mat(cfg.skin),shoe:mat(cfg.shoe),trousers:mat(0x596279),white:mat(0xffffff),black:mat(0x172334),pink:mat(0xdd8095),zip:mat(0xe7eef5),pack:mat(0x8f6a52),accent:mat(0xf4c76e)};
 const add=(parent,geometry,m,x=0,y=0,z=0,name='')=>{const o=new THREE.Mesh(geometry,m);o.position.set(x,y,z);o.castShadow=false;o.receiveShadow=false;o.name=name;parent.add(o);return o;};
 const sph=(p,m,x,y,z,sx,sy,sz,name='')=>{const mesh=add(p,new THREE.SphereGeometry(1,16,12),m,x,y,z,name);mesh.scale.set(sx,sy,sz);return mesh;};
 const box=(p,m,x,y,z,sx,sy,sz)=>add(p,new THREE.BoxGeometry(sx,sy,sz),m,x,y,z);
 const head=new THREE.Group();head.name='head';head.position.y=1.53;limbGroup.add(head);
 sph(head,colors.skin,0,0,0,.355,.385,.325,'CHIBI_HEAD');
 for(const side of [-1,1]){
  sph(head,colors.skin,side*.335,0,-.008,.082,.105,.082);
  sph(head,colors.white,side*.145,.038,.307,.105,.138,.046,'CHIBI_EYE');
  sph(head,colors.black,side*.145,.03,.353,.055,.081,.027,'CHIBI_PUPIL');
  sph(head,colors.white,side*.126,.070,.377,.021,.030,.012,'CHIBI_EYE_HIGHLIGHT');
  sph(head,colors.pink,side*.231,-.120,.258,.065,.034,.016);
  const brow=sph(head,colors.hair,side*.151,.208,.283,.087,.024,.017);brow.rotation.z=side*.12;
 }
 sph(head,colors.skin,0,-.038,.328,.034,.043,.042);
 const smile=add(head,new THREE.TorusGeometry(.071,.009,6,18,Math.PI),colors.pink,0,-.133,.307);
 smile.rotation.x=Math.PI;
 sph(head,colors.hair,0,.255,-.031,.36,.175,.31,'CHIBI_HAIR_CAP');
 for(let i=0;i<5;i++){
  const tuft=sph(head,colors.hair,-.227+i*.111,.300+(i%2)*.016,.185,.102,.105,.137);
  tuft.rotation.z=-.17+i*.13;
 }
 if(cfg.extras==='glasses'){
  for(const side of [-1,1]){
   const ring=add(head,new THREE.TorusGeometry(.121,.014,6,26),colors.black,side*.15,.040,.36,'CHIBI_GLASSES');
   ring.rotation.z=side*.05;
  }
  box(head,colors.black,0,.046,.36,.073,.017,.026);
 }
 if(cfg.extras==='visor')box(head,colors.black,0,.04,.344,.36,.17,.055);
 if(cfg.extras==='cap'){
  sph(head,colors.accent,0,.367,-.01,.36,.12,.32);
  sph(head,colors.accent,0,.327,.237,.27,.038,.195);
 }
 if(cfg.extras==='ribbon'){
  sph(head,colors.accent,.247,.343,.055,.108,.062,.07);
  sph(head,colors.pink,.319,.332,.068,.073,.047,.045);
 }
 if(cfg.extras==='helmet'){
  const hoop=add(head,new THREE.TorusGeometry(.388,.033,8,44),colors.accent,0,.01,-.01);
  hoop.rotation.x=Math.PI/2;
 }
 const torso=new THREE.Group();torso.name='torso';torso.position.y=1.00;limbGroup.add(torso);
 sph(torso,colors.coat,0,0,0,.299,.352,.244,'CHIBI_HOODIE');
 sph(torso,colors.pack,0,.035,-.283,.210,.244,.105,'CHIBI_BACKPACK');
 sph(torso,colors.coat,0,.260,-.133,.231,.104,.130,'CHIBI_HOOD');
 box(torso,colors.zip,0,-.025,.241,.017,.430,.022);
 sph(torso,colors.accent,0,-.155,.246,.105,.058,.019,'CHIBI_POCKET');
 const shoulderY=1.28,legY=.74;
 const arms=[],legs=[];
 for(const side of [-1,1]){
  const arm=new THREE.Group();arm.name=side<0?'armL':'armR';arm.position.set(side*.315,shoulderY,0);limbGroup.add(arm);
  sph(arm,colors.coat,side*.055,-.166,0,.13,.255,.14,'CHIBI_SLEEVE');
  sph(arm,colors.skin,side*.07,-.405,.030,.087,.095,.084,'CHIBI_HAND');arms.push(arm);
  const leg=new THREE.Group();leg.name=side<0?'legL':'legR';leg.position.set(side*.15,legY,0);limbGroup.add(leg);
  sph(leg,colors.trousers,0,-.205,-.013,.137,.273,.139,'CHIBI_LEG');
  sph(leg,colors.shoe,0,-.52,.082,.15,.112,.217,'CHIBI_SHOE');
  box(leg,colors.white,0,-.606,.115,.28,.025,.32);legs.push(leg);
 }
 let clock=0,cycle=0,moveBlend=0;
 function update(dt,speed=0,yaw=0,jump=0){
  clock+=dt;moveBlend=THREE.MathUtils.damp(moveBlend,Math.max(0,Math.min(1.35,speed)),11,dt);
  cycle+=dt*(2.2+moveBlend*7.8);
  const stride=Math.sin(cycle)*Math.min(moveBlend,1.0)*.48;
  legs[0].rotation.x=THREE.MathUtils.damp(legs[0].rotation.x,jump>.04?-.33:stride,13,dt);
  legs[1].rotation.x=THREE.MathUtils.damp(legs[1].rotation.x,jump>.04?.28:-stride,13,dt);
  arms[0].rotation.x=THREE.MathUtils.damp(arms[0].rotation.x,jump>.04?-.45:-stride*.8,12,dt);
  arms[1].rotation.x=THREE.MathUtils.damp(arms[1].rotation.x,jump>.04?.32:stride*.8,12,dt);
  head.rotation.y=Math.sin(clock*.9)*.03;
  head.rotation.x=Math.sin(clock*1.8)*.02;
  torso.rotation.z=THREE.MathUtils.damp(torso.rotation.z,-stride*.05,10,dt);
  limbGroup.position.y=Math.abs(Math.sin(cycle))*.040*Math.min(1,moveBlend)+Math.sin(clock*1.7)*.012*(1-Math.min(1,moveBlend));
  root.rotation.y=yaw;
 }
 function dispose(){root.traverse(obj=>{if(obj.isMesh)obj.geometry.dispose();});Object.values(colors).forEach(m=>m.dispose());}
 return {root,update,dispose,modelId:cfg.id};
}
