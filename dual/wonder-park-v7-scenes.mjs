/** Original procedural 3D scenes for Wonder Park V7. Same renderer and scene. */
import * as THREE from '/vendor/three.module.js';
const TAU=2*Math.PI;
const mat=(hex,emissive=0)=>new THREE.MeshStandardMaterial({color:hex,roughness:.64,metalness:.08,emissive});
function add(parent,geo,color,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat(color));m.position.set(x,y,z);parent.add(m);return m;}
const box=(p,w,h,d,c,x=0,y=0,z=0)=>add(p,new THREE.BoxGeometry(w,h,d),c,x,y,z);
const sphere=(p,r,c,x=0,y=0,z=0)=>add(p,new THREE.SphereGeometry(r,16,12),c,x,y,z);
const cyl=(p,r1,r2,h,c,x=0,y=0,z=0,n=24)=>add(p,new THREE.CylinderGeometry(r1,r2,h,n),c,x,y,z);
function tube(parent,a,b,r,color){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),dir=B.clone().sub(A),m=cyl(parent,r,r,dir.length(),color);
  m.position.copy(A.add(B).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());return m;}
function figure(parent,x,z,shirt,head=0xe5b48b){
  const root=new THREE.Group();root.position.set(x,0,z);parent.add(root);
  for(const dx of [-.18,.18])cyl(root,.12,.13,.78,0x25364f,dx,.46);
  cyl(root,.39,.28,1.13,shirt,0,1.35);sphere(root,.36,head,0,2.25);
  const arms=[];
  for(const s of [-1,1]){const arm=cyl(root,.11,.11,.9,shirt,s*.52,1.55);arm.rotation.z=s*.28;arms.push(arm);}
  sphere(root,.33,0x233b4c,0,2.52,-.03).scale.set(1,.35,1);
  return {root,arms};
}
function roundStage(parent,color=0x306781){cyl(parent,6.9,7.1,.38,0x173d55,0,.20);cyl(parent,6.45,6.55,.12,color,0,.47);}
function plaque(parent,text,x=0,y=4.3,z=-4.8,width=7){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=128;
  const c=canvas.getContext('2d');c.fillStyle='#12354b';c.fillRect(0,0,768,128);c.strokeStyle='#f6d47a';c.lineWidth=10;c.strokeRect(5,5,758,118);
  c.font='bold 48px Segoe UI,Arial';while(c.measureText(text).width>690&&parseInt(c.font)>25){c.font=`bold ${parseInt(c.font)-2}px Segoe UI,Arial`;}c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff7d8';c.fillText(text,384,63);
  const tx=new THREE.CanvasTexture(canvas);tx.colorSpace=THREE.SRGBColorSpace;
  const bMat=new THREE.MeshBasicMaterial({map:tx,side:THREE.FrontSide,transparent:true});
  const board=new THREE.Mesh(new THREE.PlaneGeometry(width,1.18),bMat);
  const boardBack=new THREE.Mesh(board.geometry,bMat);boardBack.rotation.y=Math.PI;boardBack.position.z=-0.012;board.add(boardBack);
  board.position.set(x,y,z);parent.add(board);return board;
}

export function createTugScene(parent){
  const g=new THREE.Group();parent.add(g);roundStage(g,0xb8ac77);
  const player=figure(g,-3.65,.4,0x2799c7),npc=figure(g,3.65,.4,0xc75a61);
  const runner=new THREE.Group();g.add(runner);
  tube(runner,[-3.2,1.25,0],[3.2,1.25,0],.125,0xf5e0a5);
  const knot=sphere(runner,.31,0xffcb6e,0,1.25,0);
  for(let i=-3;i<=3;i++)sphere(runner,.10,0xe3b56c,i,1.32,0);
  box(g,.24,.05,4.3,0xffffff,0,.56,0);
  // 3D Newton Force Gauge Arch above the tug center
  for(const sx of [-2.4,2.4])cyl(g,.11,.13,3.2,0x1e3a5f,sx,2.1,-1.5);
  box(g,5.2,.38,.28,0x0f172a,0,3.65,-1.5);
  box(g,2.35,.22,.32,0x10b981,-1.22,3.65,-1.5);
  box(g,2.35,.22,.32,0xf43f5e,1.22,3.65,-1.5);
  const gaugeNeedle=box(g,.16,.54,.36,0xfbbf24,0,3.65,-1.48);
  for(const x of [-5.55,5.55]){cyl(g,.1,.1,2.25,0xffffff,x,1.2,-1.8);sphere(g,.24,x<0?0x5de7c9:0xffa9a9,x,2.36,-1.8);}
  plaque(g,'KÉO CO TRI THỨC',0,4.55,-5.5,7.4);
  let score=0,state='idle',at=0,startOffset=0,targetOffset=0;
  function action(correct){at=performance.now();state=correct?'pull':'lose';startOffset=runner.position.x;
    targetOffset=correct?-Math.min(2.15,(score+1)*.22):2.9;if(correct)score++;}
  function tick(){
    if(state==='idle')return;const p=Math.min(1,(performance.now()-at)/750),t=1-Math.pow(1-p,3);
    runner.position.x=startOffset+(targetOffset-startOffset)*t;
    gaugeNeedle.position.x=runner.position.x*0.85;
    player.root.rotation.z=-.07*Math.sin(p*Math.PI);npc.root.rotation.z=.07*Math.sin(p*Math.PI);
    if(p>=1&&state==='pull')state='idle';
    if(p>=1&&state==='lose'){npc.root.rotation.z=-.25;player.root.rotation.z=-.85;}
  }
  return {reset(){score=0;state='idle';runner.position.x=0;gaugeNeedle.position.x=0;player.root.rotation.z=0;npc.root.rotation.z=0;},correct(){action(true);},fail(){action(false);},tick, cameraPose:(zoom=1)=>{const z=Math.min(2.2,Math.max(.55,zoom));g.updateWorldMatrix(true,false);const p=g.getWorldPosition(new THREE.Vector3());return {eye:{x:p.x+8*z,y:p.y+7*z,z:p.z+9*z},look:{x:p.x,y:p.y+1.2,z:p.z},fov:62};}};
}

export function createSoccerScene(parent){
  const g=new THREE.Group();parent.add(g);roundStage(g,0x15803d);
  box(g,10,.055,10,0x16a34a,0,.55,0);
  // Crisp penalty box & midfield lines
  for(const x of [-4.8,4.8])tube(g,[x,.63,-4.8],[x,.63,4.8],.045,0xffffff);
  for(const z of [-4.8,4.8])tube(g,[-4.8,.63,z],[4.8,.63,z],.045,0xffffff);
  // 4 Stadium Floodlight Towers
  for(const [fx,fz] of [[-4.9,-4.6],[4.9,-4.6],[-4.9,4.6],[4.9,4.6]]){
    cyl(g,.09,.12,4.2,0x334155,fx,2.6,fz);
    box(g,.65,.32,.22,0xfef08a,fx,4.75,fz);
  }
  // net and goal on far side
  tube(g,[-2.25,.65,-4.1],[-2.25,3.25,-4.1],.11,0xfbbf24);
  tube(g,[2.25,.65,-4.1],[2.25,3.25,-4.1],.11,0xfbbf24);
  tube(g,[-2.25,3.25,-4.1],[2.25,3.25,-4.1],.11,0xfbbf24);
  for(let k=-4;k<=4;k++){const x=k*.5;tube(g,[x,1,-4.2],[x,3.1,-4.2],.018,0xb9e9f5);}
  for(let k=0;k<5;k++){const y=.9+k*.51;tube(g,[-2.1,y,-4.25],[2.1,y,-4.25],.018,0xb9e9f5);}
  const striker=figure(g,-.8,2.9,0x2563eb),goalie=figure(g,0,-3.6,0xf59e0b);
  goalie.root.scale.setScalar(.9);goalie.root.rotation.y=Math.PI;
  const ball=new THREE.Group();ball.position.set(0,.82,2);g.add(ball);
  sphere(ball,.35,0xffffff);
  for(let i=0;i<5;i++){const a=i*TAU/5;sphere(ball,.14,0x1a2b3d,.30*Math.sin(a),.12*Math.cos(a),.30*Math.cos(a));}
  plaque(g,'HỌC BÁ RONALDO',0,4.5,-5.6);
  let state='idle',at=0,goals=0;
  function tick(){if(state==='idle')return;const p=Math.min(1,(performance.now()-at)/1050);
    if(state==='goal'){
      ball.position.set(Math.sin(p*Math.PI*.66)*.65,.82+.42*Math.sin(p*Math.PI),2-6.35*p);ball.rotation.x+=.14;
      goalie.root.position.x=Math.sin(p*Math.PI)*-1.4;
    }else{
      ball.position.set(Math.sin(p*Math.PI)*-1.15,.82,2-5.0*p);ball.rotation.x+=.06;
      goalie.root.position.x=-Math.sin(p*Math.PI)*1.2;
    }
    if(p>=1){if(state==='goal')state='waiting';else state='blocked';}
  }
  return {reset(){state='idle';goals=0;ball.position.set(0,.82,2);ball.rotation.set(0,0,0);goalie.root.position.x=0;},correct(){goals++;state='goal';at=performance.now();},fail(){state='block';at=performance.now();},tick,
    cameraPose:(zoom=1)=>{const z=Math.min(2.2,Math.max(.55,zoom));g.updateWorldMatrix(true,false);const p=g.getWorldPosition(new THREE.Vector3());return {eye:{x:p.x+6*z,y:p.y+6.7*z,z:p.z+11*z},look:{x:p.x,y:p.y+1.2,z:p.z-1},fov:66};}};
}

export function createMillionaireScene(parent){
  const g=new THREE.Group();parent.add(g);roundStage(g,0x172b60);
  for(let i=0;i<24;i++){
    const a=i*TAU/24;cyl(g,.09,.1,.3,i%3?0xfbbf24:0x38bdf8,6.0*Math.sin(a),.75,6.0*Math.cos(a));
  }
  cyl(g,4.6,4.8,.22,0x312e81,0,.58);
  // 3 Concentric Neon Stage Rings
  const stageRings=[
    add(g,new THREE.TorusGeometry(4.5,.07,10,48),0x38bdf8,0,.71,0),
    add(g,new THREE.TorusGeometry(3.4,.07,10,48),0xa855f7,0,.72,0),
    add(g,new THREE.TorusGeometry(2.3,.07,10,48),0xfbbf24,0,.73,0)
  ];
  stageRings.forEach(r=>{r.rotation.x=Math.PI/2;});
  // 4 3D Hologram Audience Poll Columns behind the stage
  const pollBars=[];
  for(let i=0;i<4;i++){
    const bx=-2.7+i*1.8;
    const bar=cyl(g,.24,.24,1.2,i%2?0x38bdf8:0xfbbf24,bx,1.35,-3.6);
    pollBars.push(bar);
  }
  const player=figure(g,1.9,.8,0x4a8cd1),host=figure(g,-2,.8,0x7b5ba0);
  for(const x of [-2,1.9]){cyl(g,.56,.69,.22,0xf6d17d,x,.82,.45);box(g,1.4,.17,.8,0x202c45,x,1.38,.3);}
  // small podium and MC microphone
  tube(g,[-1.45,1.5,1.35],[-1.45,2.1,1.35],.055,0xc7d9e5);sphere(g,.12,0x17283c,-1.45,2.22,1.35);
  plaque(g,'AI LÀ TRIỆU PHÚ · 15 CÂU',0,4.7,-5.3,9);
  for(const side of [-1,1]){
    cyl(g,.13,.18,5.6,0xebc06e,side*5.3,2.9,-2.4);
    sphere(g,.28,0xd4f2ff,side*5.3,5.65,-2.4);
  }
  let level=0;
  return {reset(){level=0;},correct(){level++;},fail(){},tick(t){
    player.root.rotation.y=.07*Math.sin(t*1.5);host.root.rotation.y=.1*Math.sin(t*1.1);
    pollBars.forEach((b,i)=>{const s=1+.35*Math.sin(t*2.2+i)+level*.06;b.scale.y=s;b.position.y=.75+.6*s;});
  },cameraPose:(zoom=1)=>{const z=Math.min(2.2,Math.max(.55,zoom));g.updateWorldMatrix(true,false);const p=g.getWorldPosition(new THREE.Vector3());return {eye:{x:p.x+7*z,y:p.y+5.3*z,z:p.z+10*z},look:{x:p.x,y:p.y+1.5,z:p.z},fov:68};}};
}

export function createMazeEntrance(parent){
  const g=new THREE.Group();parent.add(g);roundStage(g,0x134e4a);
  for(let r=0;r<9;r++)for(let c=0;c<9;c++){
    if(r!==0&&c!==0&&r!==8&&c!==8&&(r+c)%3===0)continue;
    if((r===8&&c===4)||(r===0&&c===4))continue; // Open clear doorway at Entrance (+Z) and Exit (-Z)
    const b=box(g,.78,2.15,.78,((r+c)%2?0x0f766e:0x1e3a8a),-4+c,1.68,-4+r);
    box(g,.82,.12,.82,0xfbbf24,-4+c,2.80,-4+r);
  }
  // CỬA VÀO (Front +Z): Nổi bật với màu Xanh Ngọc Lục Bảo Phát Quang (#00f5d4)
  box(g,2.2,.18,1.35,0x00f5d4,0,.65,4.65);
  for(const sx of [-1.05,1.05]){
    cyl(g,.16,.19,3.2,0x10b981,sx,2.2,4.65);
    sphere(g,.24,0x00f5d4,sx,3.95,4.65);
  }
  box(g,2.5,.36,.36,0x059669,0,3.65,4.65);
  plaque(g,'🚪 CỬA VÀO (XANH NGỌC)',0,4.35,4.65,4.2);

  // CỬA RA (Back -Z): Nổi bật đối lập với màu Đỏ Ruby & Vàng Hoàng Gia (#ff2a85 / #fbbf24)
  box(g,2.4,.20,1.45,0xff2a85,0,.66,-4.65);
  for(const sx of [-1.15,1.15]){
    cyl(g,.18,.22,3.7,0xe11d48,sx,2.45,-4.65);
    sphere(g,.28,0xfbbf24,sx,4.45,-4.65);
  }
  box(g,2.7,.42,.42,0xfbbf24,0,4.15,-4.65);
  plaque(g,'🏁 CỬA RA (ĐỎ VÀNG)',0,4.95,-4.65,4.4);
  plaque(g,'MÊ CUNG LẠC LỐI · 8 CẤP ĐỘ',0,5.85,-5.5,7.6);
  return g;
}
