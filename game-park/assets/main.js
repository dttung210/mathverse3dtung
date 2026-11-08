import * as THREE from '/vendor/three.module.js';

// MATHVERSE - Gate first, static attractions outside, animated inside, NPC interaction.
// The entire question bank comes only from a previously supplied teacher PDF.
const $ = id => document.getElementById(id);
const rawBank = JSON.parse($('BANK').textContent);
const ZONES = [
  {name:'Học bá Chuồng Gà',short:'Chuồng Gà',emoji:'🐔',staff:'Gà Giáo Sư Cô-Cô',color:0xf6bd72,
   guide:'Chào mừng đến đấu trường Chuồng Gà! Bạn và 10 gà đối thủ cùng ở trong một vòng tròn. Đúng một câu sẽ loại một gà. Sai bất kỳ câu nào, bạn bị đá khỏi vòng và chơi lại từ đầu.'},
  {name:'Ghế Tên Lửa',short:'Tên Lửa',emoji:'🚀',staff:'Kỹ sư Sao Băng',color:0xf08b78,guide:'Hãy khám phá chiếc ghế tên lửa! Trong trò chơi dự kiến, mỗi câu đúng sẽ đưa người chơi lên một tầng mây.'},
  {name:'Cầu Kính Tri Thức',short:'Cầu Kính',emoji:'🌉',staff:'Cô Cầu Vồng',color:0x86d3e1,guide:'Đây là cây cầu kính Toán học. Mỗi câu trả lời sẽ quyết định lối đi an toàn.'},
  {name:'Sàn Gạch Biến Mất',short:'Sàn Gạch',emoji:'🧱',staff:'Robot Sàn Gạch',color:0xf2b65e,guide:'Chào mừng đến sàn gạch kỳ diệu. Nền sẽ chuyển động theo thử thách kiến thức.'},
  {name:'Bóng Lăn Phiêu Lưu',short:'Bóng Lăn',emoji:'⚽',staff:'Chú Bóng Tròn',color:0x9cd5b7,guide:'Ở đây, quả bóng vượt những vòng cổng sau khi học sinh hoàn thành câu hỏi.'},
  {name:'Thang Máy 10 Tầng',short:'Thang Máy',emoji:'🛗',staff:'Kỹ sư Tầng Mây',color:0xb7a2f5,guide:'Mỗi tầng đại diện cho một thử thách Toán học. Cabin có thể đưa bạn đến đỉnh tháp.'},
  {name:'Tháp Xây Dựng',short:'Xây Tháp',emoji:'🏰',staff:'Kiến trúc sư Pi',color:0xf7d17d,guide:'Hãy thử tưởng tượng: mỗi câu đúng đặt thêm một khối 3D vào tòa tháp.'},
  {name:'Kho Báu Hải Tặc',short:'Kho Báu',emoji:'🏴‍☠️',staff:'Thuyền trưởng Số Học',color:0x8bdaaf,guide:'Giải các thử thách và mở dần những ổ khóa của chiếc rương bí mật.'},
  {name:'Tàu Lượn Toán Học',short:'Tàu Lượn',emoji:'🎢',staff:'Cô Đường Cong',color:0xf49fc8,guide:'Tàu lượn 3D chạy trên đường ray uốn lượn, minh họa một trò chơi vượt chặng.'},
  {name:'Khinh Khí Cầu Trí Tuệ',short:'Khí Cầu',emoji:'🎈',staff:'Phi công Mây Trắng',color:0x90c7fe,guide:'Khinh khí cầu bay qua các đảo mây, đưa bạn đến khu khám phá trên cao.'}
];
const TAU=Math.PI*2, CENTER_Z=-10, RADIUS=31;
const $stage=$('stage');
const app={
 mode:'outside', cameraMode:'overview', activeZone:-1, gateProgress:0, enterStarted:0,
 renderer:null,scene:null,camera:null,clock:null,threeReady:false,canvasFallback:null,
 cameraAngle:.48,cameraDistance:21,dragging:false,dragMoved:false,lastPointer:null,
 keys:new Set(), world:null,avatar:null,gatePanels:[],npcRoots:[], animated:[],hitMeshes:[],zoneRoots:[],zonePositions:[],
 chickens:null, rivalCount:10,asked:0,round:[],currentQuestion:null,quizLocked:true,score:0,
 timers:[],npcMessage:'',tourStarted:false,frameTime:0, toastTimer:null,
 cameraTarget:new THREE.Vector3(0,1,0), cameraDesired:new THREE.Vector3(0,0,0), lastTime:0
};
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
 const c=canvas.getContext('2d');c.fillStyle=fill;c.fillRect(0,0,640,160);c.strokeStyle='#6fd4d8';c.lineWidth=9;c.strokeRect(8,8,624,144);
 c.font=`900 ${fontsize}px 'Segoe UI',sans-serif`;c.fillStyle=ink;c.textAlign='center';c.textBaseline='middle';
 let value=text;while(c.measureText(value).width>594&&fontsize>18){fontsize-=2;c.font=`900 ${fontsize}px 'Segoe UI',sans-serif`;}
 c.fillText(value,320,78);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.FrontSide});
 const m=new THREE.Mesh(new THREE.PlaneGeometry(width,height),mat);
 const back=new THREE.Mesh(m.geometry,mat);back.rotation.y=Math.PI;back.position.z=-0.012;m.add(back);
 return m;
}
function addPath(a,b,width=3.2,color=palette.road){const v=new THREE.Vector3(...a),w=new THREE.Vector3(...b),mid=v.clone().add(w).multiplyScalar(.5);const d=w.clone().sub(v);const p=box(app.scene,width,.08,d.length(),color,mid.x,.08,mid.z);p.rotation.y=Math.atan2(d.x,d.z);return p;}
function addTree(x,z,s=1){const g=new THREE.Group();g.position.set(x,0,z);app.scene.add(g);cylinder(g,.15*s,.23*s,2.3*s,0x7f573a,0,1.16*s);for(let k=0;k<3;k++){cone(g,(1.2-k*.2)*s,2.4*s,k===0?0x247e60:k===1?0x2e916e:0x41a47a,0,(2.35+k*.6)*s);}return g;}
function addLamp(x,z){const p=new THREE.Group();p.position.set(x,0,z);app.scene.add(p);cylinder(p,.09,.14,3.8,0x45617c,0,1.9);sphere(p,.38,0xffe7a6,0,4.03);cylinder(p,.36,.45,.21,0x397f87,0,4.4);return p;}
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
function zoneLocation(i){const angle=.42+i*TAU/10;return {x:RADIUS*Math.sin(angle),z:CENTER_Z+RADIUS*Math.cos(angle),angle};}
function createGate(){const base=new THREE.Group();base.position.set(0,0,43);app.scene.add(base);
 for(const x of [-6.7,6.7]){cylinder(base,1.00,1.25,7.6,0xe9d6b1,x,3.8);cylinder(base,1.25,1.45,.55,0x3b8190,x,.28);cylinder(base,1.18,1.18,.5,0x2d7288,x,7.65);sphere(base,.64,0xffe29d,x,8.1);}
 box(base,13.8,1.4,1.4,0x184963,0,7.45);const sign=label3d('MATHVERSE · WONDER PARK',12.6,1.4,'#184963','#fff0bc',46);sign.position.set(0,7.55,.78);base.add(sign);
 const signBack=label3d('MATHVERSE · WONDER PARK',12.6,1.4,'#184963','#fff0bc',46);signBack.position.set(0,7.55,-.78);signBack.rotation.y=Math.PI;base.add(signBack);
 const smallSign=label3d('CÔNG VIÊN TOÁN HỌC 3D',9.0,.85,'#2b697a','#d7fcf3',44);smallSign.position.set(0,6.25,1.0);base.add(smallSign);
 for(const s of [-1,1]){const hinge=new THREE.Group();hinge.position.set(s*6.1,0,0);base.add(hinge);
  const door=box(hinge,5.6,4.8,.35,0x1e6a79,-s*2.8,2.55);box(hinge,5.3,4.3,.41,0x2c8a8e,-s*2.8,2.55);
  for(let x=-4.8;x<.0;x+=.85)box(hinge,.22,4.2,.47,0xcde7c9,x*(s===-1?-1:1),2.53);const emblem=sphere(hinge,.42,0xffd376,-s*2.8,3.05,.30,1,1,.38);
  app.gatePanels.push({hinge,sign:s});
 }
 // outside flags and lights
 for(const s of [-1,1]){cylinder(base,.10,.10,5.5,0x274a65,s*9.5,2.8);box(base,1.5,.9,.08,s===-1?0x69baba:0xf3bd71,s*9.5,5.15,0);sphere(base,.18,0xffedc1,s*9.5,5.7);}
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
 const player=chickenModel({body:0xf6e9c6,accent:0xe4b874,scarf:0x33c5dc});player.position.set(0,.36,1.55);player.scale.setScalar(.9);g.add(player);
 const rivals=[];const coats=[0xf8d49c,0xb4dcee,0xf4bbb4,0xbadfb2,0xead1e4,0xe0d7b9,0xb7ddd8,0xe6c2a2,0xc8dba7,0xf2bca8];
 for(let i=0;i<10;i++){const a=(i/10)*TAU-.2;const root=chickenModel({body:coats[i],accent:coats[i]});const x=3.35*Math.sin(a),z=3.35*Math.cos(a)-.2;root.position.set(x,.36,z);root.rotation.y=Math.atan2(-x,-z);root.scale.setScalar(.73);g.add(root);rivals.push({root,x,z,a,eliminated:false,kickAt:0});}
 const prof=chickenModel({body:0xffde8a,accent:0xf8b96b,professor:true});prof.position.set(-6.8,.1,5.5);prof.scale.setScalar(.95);g.add(prof);
 const board=label3d('HỌC BÁ CHUỒNG GÀ',6.4,1.12,'#704629','#ffecb9',45);board.position.set(0,4.2,-6.8);g.add(board);
 for(const x of [-3.8,3.8]){cylinder(g,.15,.15,3.2,0xa86e40,x,2.45,-6.8);sphere(g,.26,0xffe0a2,x,4.05,-6.8);}
 for(const s of [-1,1]){box(g,1.7,.55,.85,0xc89d50,s*6.8,.40,-2.3);box(g,1.35,.50,.75,0xe1b466,s*6.8,.91,-2.3);}
 app.chickens={group:g,player,rivals,prof,anim:null,win:false};
 return g;
}
function buildZoneModel(i,zroot){const g=new THREE.Group();zroot.add(g);const clr=ZONES[i].color;
 if(i===0){createChickenArena(g);return;}
 if(i===1){ // rocket chair
  cylinder(g,2.3,2.6,.55,0x4c6276,0,.45);const rocket=new THREE.Group();g.add(rocket);
  cylinder(rocket,.65,.85,5.2,0xf6f1e4,0,3.3);cone(rocket,.80,1.65,0xef665a,0,6.73);torus(rocket,.74,.18,0x3f9fcb,0,4.8).rotation.x=Math.PI/2;
  for(let s of [-1,1]){const fin=box(rocket,.32,2.3,1.25,0xda6568,s*.84,1.8);fin.rotation.z=s*.35;}
  sphere(rocket,.43,0x71dbe9,0,4.32,.62);const chair=box(g,1.7,.46,1.35,0x33648b,0,.88,2.8);box(g,1.7,1.55,.25,0x4ea9bc,0,1.64,2.27);
  app.animated.push(t=>{rocket.position.y=Math.sin(t*1.6)*.85;rocket.rotation.y=t*.17;});
 }else if(i===2){ // glass bridge
  for(let k=0;k<10;k++){const p=box(g,1.1,.25,2.65,0x83d4e1,(k-5)*1.15,1.25,0,.25);p.material.transparent=true;p.material.opacity=.73;
  app.animated.push(t=>{p.material.emissive.setHex(Math.floor(t*2)%10===k?0x0f4b5c:0x001016);});}
  for(let s of [-1,1]){beam(g,[-6,1.85,s*1.7],[6,1.85,s*1.7],.08,0xd8f3f4);for(let k=0;k<=9;k++)cylinder(g,.075,.075,1.6,0x6fd1d6,(k-4.5)*1.25,1.18,s*1.7);}
 }else if(i===3){const tiles=[];for(let x=-2;x<=2;x++)for(let z=-2;z<=2;z++){const tile=box(g,1.6,.35,1.6,(x+z)%2?0xeac064:0xf6a16a,x*1.78,1.18,z*1.78);tiles.push({tile,x,z});}app.animated.push(t=>tiles.forEach(o=>{o.tile.position.y=1.18+Math.max(-1,Math.sin(t*1.7+o.x*.7+o.z*.9))*.3;o.tile.rotation.y=.05*Math.sin(t*1.3+o.x); }));
 }else if(i===4){const track=torus(g,4.0,.15,0x6dbaba,0,1.15);track.rotation.x=Math.PI/2;const ball=sphere(g,.69,0xffe6ad,4.0,1.84,0);app.animated.push(t=>{ball.position.set(4*Math.cos(t*1.4),1.84+Math.sin(t*3)*.08,4*Math.sin(t*1.4));ball.rotation.x=t*1.9;ball.rotation.z=t*.6;});for(let k=0;k<5;k++)torus(g,.78,.11,0xa6ded4,Math.sin(k*TAU/5)*3.1,2.15,Math.cos(k*TAU/5)*3.1).rotation.y=k*TAU/5;
 }else if(i===5){const elevator=box(g,3.7,1.5,3.2,0x4c8ea5,0,1.3);for(const xx of [-2,2]){cylinder(g,.19,.19,11.5,0xe5dbcb,xx,5.9);box(g,.75,11.1,.62,0x2e688d,xx*1.9,5.75,-1.0);}box(g,6,1,.6,0xeac77b,0,11.3);app.animated.push(t=>{elevator.position.y=1.1+(Math.sin(t*.8)+1)*3.1;});
 }else if(i===6){for(let j=0;j<7;j++)box(g,4.1-j*.4,1.05,4.1-j*.4,j%2?0xf2b669:0x7ebcd1,0,.65+j*1.05,0);const block=box(g,1.9,1.0,1.9,0xffdf8d,0,8.6);app.animated.push(t=>{block.position.y=8.5+.45*Math.sin(t*1.5);block.rotation.y=t*.4;});
 }else if(i===7){const chest=box(g,5.0,2.5,3.4,0x6d412c,0,1.48);for(let xx of [-1.8,0,1.8])box(g,.25,2.8,3.7,0xffd76d,xx,1.6);const lid=new THREE.Group();lid.position.set(0,2.7,-1.5);g.add(lid);box(lid,5.2,.65,3.6,0x965b2f,0,.3,1.5);for(let xx of [-1.8,0,1.8])box(lid,.25,.76,3.8,0xe9c27e,xx,.3,1.5);app.animated.push(t=>{lid.rotation.x=-.42-.28*(1+Math.sin(t*.9));});
 }else if(i===8){const pts=[];for(let k=0;k<=55;k++){const a=k*TAU/55;pts.push(new THREE.Vector3(4.5*Math.sin(a),2.4+.7*Math.sin(a*2),4.5*Math.cos(a)));}const curve=new THREE.CatmullRomCurve3(pts,true);const rail=mesh(new THREE.TubeGeometry(curve,100,.13,8,true),0xc9a2f5,g);const cart=new THREE.Group();box(cart,1.25,.55,1.5,0xf27cae,0,.4);sphere(cart,.45,0xffeabf,0,.9);g.add(cart);app.animated.push(t=>{const pt=curve.getPoint((t*.08)%1);cart.position.copy(pt);cart.rotation.y=-t*.6;});
 }else if(i===9){const balloon=new THREE.Group();g.add(balloon);const orb=sphere(balloon,2.1,0xf18d78,0,5,0,1.0,1.25,1);for(let k=0;k<6;k++){const slice=new THREE.Mesh(new THREE.SphereGeometry(2.14,24,16,k*Math.PI/3,Math.PI/3,0,Math.PI),M([0xeac66c,0x95c6eb,0xf5a6a6,0xafdeb8,0xe7a3c8,0xffdea0][k]));slice.scale.y=1.24;slice.position.y=5;balloon.add(slice);}box(balloon,1.3,1.0,1.3,0x8c603c,0,1.6);for(let s of [-1,1])for(let j of [-1,1])beam(balloon,[s*.56,2.08,j*.56],[s*.9,3.52,j*.9],.04,0xf3d8ae);app.animated.push(t=>{balloon.position.y=.6*Math.sin(t*.9);balloon.rotation.y=.1*Math.sin(t*.3);});}
}
function buildWorld(){
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x133b50);scene.fog=new THREE.FogExp2(0x12364b,.0055);app.scene=scene;
 const camera=new THREE.PerspectiveCamera(52,1,.1,230);camera.position.set(23,24,72);app.camera=camera;camera.lookAt(0,1,8);
 const hemi=new THREE.HemisphereLight(0xe7faff,0x426342,2.25);scene.add(hemi);
 const sun=new THREE.DirectionalLight(0xfff1d0,2.6);sun.position.set(-34,62,32);scene.add(sun);
 const fill=new THREE.DirectionalLight(0x6fc7ff,1.0);fill.position.set(22,24,-25);scene.add(fill);
 // global island and nearby exterior ground
 cylinder(scene,55.3,56,1.7,palette.grass,0,-1.15,CENTER_Z,120);cylinder(scene,70,72,1.7,0x254a45,0,-2.7,CENTER_Z,120);
 const ring=mesh(new THREE.RingGeometry(23.3,27.3,128),0xd1ae7f,scene,0,.07,CENTER_Z);ring.rotation.x=-Math.PI/2;
 const ringEdge=mesh(new THREE.RingGeometry(27.35,27.6,128),0x7bd6cf,scene,0,.065,CENTER_Z);ringEdge.rotation.x=-Math.PI/2;
 addPath([0,0,43],[0,0,18],10,0xd8b58a);addPath([0,0,17],[0,0,CENTER_Z+20],8.0,0xd7b687);
 for(let i=0;i<10;i++){
  const pos=zoneLocation(i);app.zonePositions.push(pos);const walk=zoneLocation(i);const rr=24.3/RADIUS;
  addPath([pos.x*rr,0,CENTER_Z+(pos.z-CENTER_Z)*rr],[pos.x,0,pos.z],3.9,0xd8b689);
  const root=new THREE.Group();root.position.set(pos.x,0,pos.z);root.userData.zoneId=i;scene.add(root);app.zoneRoots.push(root);
  cylinder(root,7.6,7.8,.75,0x2a5863,0,.15,0,40);cylinder(root,7.0,7.0,.24,ZONES[i].color,0,.58,0,40);
  const platform=cylinder(root,7.1,7.2,.06,0xe7d6af,0,.74,0,40);platform.material.transparent=true;platform.material.opacity=.21;
  buildZoneModel(i,root);
  if(i!==0){const info=npc(pos.x-4.7,pos.z+7.6,ZONES[i].color,ZONES[i].staff);info.userData.zoneId=i;} else {const professor=app.chickens.prof;/* also 3D NPC inside ring */}
  const sign=label3d(`${i+1}. ${ZONES[i].short.toUpperCase()}`,6.6,1.15,'#164663','#fff5bf',38);sign.position.set(0,4.7,7.5);root.add(sign);sign.userData.zoneId=i;
  app.hitMeshes.push(root);
 }
 // park vegetation + lights: deterministic, outside zone footprints
 for(let i=0;i<75;i++){
  const a=i*2.39996;const rr=37+(seed(i+42)*11);const x=Math.sin(a)*rr,z=CENTER_Z+Math.cos(a)*rr;
  if(z>38 && Math.abs(x)<9)continue;
  addTree(x,z,.55+seed(i+112)*.67);
 }
 for(let i=0;i<20;i++){const a=i*TAU/20;addLamp(Math.sin(a)*26,CENTER_Z+Math.cos(a)*26);}
 createFountain();app.gate=createGate();
 app.avatar=avatar(0,52);scene.add(app.avatar);
 app.entranceNPC=npc(-9.3,47.2,0x5c9dbf,'LỄ TÂN LINH');
 app.welcomeNPC=npc(7.8,28.2,0x47a9a1,'HƯỚNG DẪN LINH');
 app.outsideAvatarPos={x:0,z:52};
 // portal spark at gate, no motion until entering
 for(let i=0;i<16;i++){const x=-5.2+i*.65;sphere(scene,.06,0xfff0ae,x,5.25,43.3);}
 const canvas=$('worldCanvas');const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(1.6,window.devicePixelRatio||1));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;app.renderer=renderer;
 resize3D();window.addEventListener('resize',resize3D);app.clock=new THREE.Clock();
 renderer.render(scene,camera);
 app.threeReady=true;
 requestAnimationFrame(frame);
}
function resize3D(){if(!app.renderer)return;const canvas=$('worldCanvas');const w=Math.max(2,canvas.clientWidth),h=Math.max(2,canvas.clientHeight);app.camera.aspect=w/h;app.camera.updateProjectionMatrix();app.renderer.setSize(w,h,false);}
function panCamera(dt){
 let look=new THREE.Vector3(0,1,0),pos=new THREE.Vector3(20,20,50);
 if(app.mode==='outside'||app.mode==='opening'){
  const p=app.avatar.position;
  if(app.cameraMode==='follow'){look.set(p.x,2.3,p.z-7);pos.set(p.x+Math.sin(app.cameraAngle)*app.cameraDistance,9.8,p.z+Math.cos(app.cameraAngle)*app.cameraDistance);}
  else{look.set(0,1,15);pos.set(23,26,73);}
 } else if(app.mode==='zone'||app.mode==='quiz'||app.mode==='ended'){
  const z=app.zonePositions[Math.max(0,app.activeZone)];look.set(z.x,2,z.z);
  pos.set(z.x+12*Math.sin(app.cameraAngle+1), app.mode==='quiz'?12:15,z.z+14*Math.cos(app.cameraAngle+1));
 }else{
  if(app.cameraMode==='follow'){
   const p=app.avatar.position;look.set(p.x,2.1,p.z-4.8);pos.set(p.x+Math.sin(app.cameraAngle)*app.cameraDistance,11,p.z+Math.cos(app.cameraAngle)*app.cameraDistance);
  }else{look.set(0,1,CENTER_Z);pos.set(33,38,50);}
 }
 app.camera.position.lerp(pos,Math.min(1,dt*2.2));app.cameraTarget.lerp(look,Math.min(1,dt*2.9));app.camera.lookAt(app.cameraTarget);
}
function frame(){if(!app.threeReady)return;const dt=Math.min(.05,app.clock.getDelta()),t=app.clock.elapsedTime;app.frameTime=t;
 handleMove(dt);
 if(app.mode==='opening'){
  app.gateProgress=Math.min(1,app.gateProgress+dt*.55);
  app.avatar.position.z=Math.max(26,52-26*(Math.max(0,app.gateProgress-.18)/.82));
  if(app.gateProgress>=1)completeEntry();
 }
 for(const p of app.gatePanels)p.hinge.rotation.y=p.sign*app.gateProgress*1.23;
 const isInside=app.mode==='inside'||app.mode==='zone'||app.mode==='quiz'||app.mode==='ended';
 if(isInside){app.animated.forEach(fn=>fn(t));app.npcRoots.forEach((npc,i)=>{npc.g.position.y=npc.baseY+.07*Math.sin(t*2+i*.8);npc.b.rotation.y=.08*Math.sin(t*1.4+i*.3);});
  if(app.chickens)animateChickens(dt,t);
 }
 panCamera(dt);app.renderer.render(app.scene,app.camera);requestAnimationFrame(frame);
}
function handleMove(dt){if(app.mode!=='outside'&&app.mode!=='inside')return;if(!app.keys.size)return;let dx=0,dz=0;
 if(app.keys.has('w')||app.keys.has('arrowup'))dz-=1;
 if(app.keys.has('s')||app.keys.has('arrowdown'))dz+=1;
 if(app.keys.has('a')||app.keys.has('arrowleft'))dx-=1;
 if(app.keys.has('d')||app.keys.has('arrowright'))dx+=1;
 if(!dx&&!dz)return;const length=Math.hypot(dx,dz);dx/=length;dz/=length;const p=app.avatar.position;const v=dt*13;
 if(app.mode==='outside'){p.x=Math.max(-11,Math.min(11,p.x+dx*v));p.z=Math.max(43.5,Math.min(66,p.z+dz*v));}
 else{p.x=Math.max(-46,Math.min(46,p.x+dx*v));p.z=Math.max(-54,Math.min(39,p.z+dz*v));}
 app.avatar.rotation.y=Math.atan2(dx,-dz);app.avatar.children[0].rotation.x=.04*Math.sin(app.frameTime*10);
}
function animateChickens(dt,t){const h=app.chickens;if(!h)return;h.prof.position.y=.08+.13*Math.sin(t*1.8);
 const animateMove=(obj,idx)=>{if(obj.eliminated){const e=(performance.now()-obj.kickAt)/1000;if(e>=1.2){obj.root.visible=false;return;}const d=5*e*e;obj.root.position.set(obj.x+Math.sin(obj.a)*d,.36+3.2*Math.sin(Math.PI*Math.min(e/1.2,1)),obj.z+Math.cos(obj.a)*d);obj.root.rotation.z=e*4.4;obj.root.rotation.x=e*3;obj.root.scale.setScalar(.73*(1-.58*e));}else{obj.root.position.y=.36+.06*Math.sin(t*2.6+idx);obj.root.rotation.y=Math.atan2(-obj.x,-obj.z)+.12*Math.sin(t+idx);}};
 h.rivals.forEach(animateMove);
 if(h.player.userData.kicked){const f=(performance.now()-h.player.userData.kickAt)/1000;if(f<1.3){h.player.position.set(f*5, .36+3*Math.sin(Math.PI*f/1.3),1.55+f*8);h.player.rotation.z=f*5;h.player.scale.setScalar(.9*(1-f*.45));}else h.player.visible=false;}
 else{h.player.position.y=.36+.09*Math.sin(t*3);h.player.rotation.z=.07*Math.sin(t*2);}
}
function resetChickens(){const h=app.chickens;if(!h)return;h.win=false;h.rivals.forEach((r)=>{r.root.visible=true;r.root.position.set(r.x,.36,r.z);r.root.rotation.set(0,Math.atan2(-r.x,-r.z),0);r.root.scale.setScalar(.73);r.eliminated=false;r.kickAt=0;});h.player.visible=true;h.player.position.set(0,.36,1.55);h.player.rotation.set(0,0,0);h.player.scale.setScalar(.9);h.player.userData.kicked=false;}
function kickEnemy(){if(!app.chickens){app.rivalCount--;return;}const r=app.chickens.rivals.find(r=>!r.eliminated);if(!r)return;r.eliminated=true;r.kickAt=performance.now();app.rivalCount--;}
function kickPlayer(){if(!app.chickens)return;app.chickens.player.userData.kicked=true;app.chickens.player.userData.kickAt=performance.now();}
function showPane(id){for(const pane of document.querySelectorAll('.pane'))pane.classList.toggle('active',pane.id===id);}
function setSide(title,icon,eyebrow='KHU VUI CHƠI 3D'){$('sideTitle').textContent=title;$('sideIcon').textContent=icon;$('sideEyebrow').textContent=eyebrow;}
function announce(msg){app.npcMessage=msg;if($('parkNpcText'))$('parkNpcText').textContent=msg.replace(/^NPC: /,'');}
function speak(text){if(!('speechSynthesis' in window)){popToast('Máy chưa hỗ trợ giọng đọc tiếng Việt; cô vẫn xem được lời hướng dẫn.');return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='vi-VN';u.rate=.96;u.pitch=1.03;speechSynthesis.speak(u);}
function popToast(msg){$('toast').textContent=msg;$('toast').classList.add('show');clearTimeout(app.toastTimer);app.toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2600);}
function setIntro(){setSide('Cổng Công Viên 3D','🎡','TRƯỚC CỔNG CHÍNH');showPane('outsidePane');$('sceneLabel').textContent='CHƯA VÀO CÔNG VIÊN';$('sceneTitle').textContent='CỔNG MATHVERSE WONDER PARK';$('sceneDescription').textContent='10 công trình 3D tĩnh. Mở cổng để các trò chơi bắt đầu chuyển động.';}
function enterPark(){if(app.mode!=='outside')return;app.mode='opening';app.gateProgress=0;if(app.avatar)app.avatar.position.set(0,0,52);app.cameraMode='follow';$('enterPark').disabled=true;popToast('🚪 Cổng 3D đang mở…');setSide('Đang bước vào công viên','🚪','CHUYỂN CẢNH 3D');if(!app.threeReady)later(completeEntry,1400);}
function completeEntry(){if(app.mode!=='opening')return;app.mode='inside';app.cameraMode='overview';$('modeTag').textContent='BÊN TRONG · 3D CHUYỂN ĐỘNG';$('modeTag').classList.add('active');$('sceneLabel').textContent='ĐÃ ĐI QUA CỔNG';$('sceneTitle').textContent='CÔNG VIÊN 3D ĐANG CHUYỂN ĐỘNG';$('sceneDescription').textContent='10 khu trò chơi, NPC hướng dẫn và mô hình 3D chuyển động.';setSide('Đường tròn khám phá','🗺️','BÊN TRONG CÔNG VIÊN');showPane('parkPane');announce('NPC: Chào mừng đến MATHVERSE Wonder Park! Bạn có thể đến từng trạm để gặp nhân viên hướng dẫn.');popToast('✨ Cổng đã mở — công viên bắt đầu chuyển động!');}
function returnGate(){clearTimers();$('finishModal').classList.remove('show');app.mode='outside';app.activeZone=-1;app.gateProgress=0;app.cameraMode='overview';if(app.avatar){app.avatar.position.set(0,0,52);app.avatar.visible=true;}if(app.camera)app.camera.position.set(23,24,73);app.cameraTarget.set(0,1,15);app.gatePanels.forEach(p=>p.hinge.rotation.y=0);app.keys.clear();resetChickens();$('enterPark').disabled=false;$('modeTag').textContent='CỔNG NGOÀI · MÔ HÌNH 3D TĨNH';$('modeTag').classList.remove('active');setIntro();popToast('Đã về ngoài cổng. Các trò chơi trở lại trạng thái 3D tĩnh.');}
function showPark(){clearTimers();$('finishModal').classList.remove('show');app.mode='inside';app.activeZone=-1;app.cameraMode='overview';if(app.avatar){app.avatar.visible=true;app.avatar.position.set(0,0,28);}setSide('Đường tròn khám phá','🗺️','BÊN TRONG CÔNG VIÊN');showPane('parkPane');$('sceneLabel').textContent='10 KHU VUI CHƠI';$('sceneTitle').textContent='CÔNG VIÊN ĐANG HOẠT ĐỘNG';$('sceneDescription').textContent='Mọi khu đều có công trình 3D chuyển động và NPC giới thiệu.';}
function chooseZone(i){if(app.mode==='outside'||app.mode==='opening'){popToast('Cô hãy mở cổng bước vào công viên trước.');return;}clearTimers();$('finishModal').classList.remove('show');app.mode='zone';app.activeZone=i;app.cameraMode='focus';const z=ZONES[i],p=app.zonePositions[i];if(app.avatar){app.avatar.visible=true;app.avatar.position.set(p.x+3.7,0,p.z+9.6);}
 $('zoneNpcName').textContent=z.staff;$('zoneNpcIcon').textContent=z.emoji;$('zoneNpcText').textContent=z.guide;
 $('zoneDetailText').innerHTML=`<strong>🎡 Khu ${i+1}: ${z.name}</strong><p>${z.guide}</p>`;
 $('zonePlay').textContent=i===0?'🐔 Vào đấu trường Học bá Chuồng Gà':'🎬 Xem công trình chuyển động';
 $('zoneRenderStatus').textContent=i===0?'Đấu trường chơi được':'Mô hình 3D và NPC demo';
 setSide(z.name,z.emoji,`KHU TRÒ CHƠI 0${i+1}`);showPane('zonePane');$('sceneLabel').textContent=`TRẠM ${i+1}/10 · 3D CHUYỂN ĐỘNG`;$('sceneTitle').textContent=z.name.toUpperCase();$('sceneDescription').textContent=`NPC ${z.staff} giới thiệu trò chơi tại công trình này.`;
 document.querySelectorAll('.map-stop,.area').forEach(el=>el.classList.toggle('active',Number(el.dataset.zone)===i));
 popToast(`Đã đến ${z.name} — mời nghe NPC giới thiệu.`);
}
function clearTimers(){app.timers.forEach(clearTimeout);app.timers=[];}
function later(fn,ms){const id=setTimeout(fn,ms);app.timers.push(id);}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function pick10(){const valid=rawBank.filter(q=>q.answer&&q.choices&&Object.keys(q.choices).length===4&&(!q.issues||!q.issues.length));const easy=shuffle(valid.filter(q=>q.difficulty==='Dễ')).slice(0,4);const medium=shuffle(valid.filter(q=>q.difficulty==='Trung bình')).slice(0,4);const hard=shuffle(valid.filter(q=>q.difficulty==='Khó')).slice(0,2);return [...easy,...medium,...hard];}
function beginQuiz(){if(app.activeZone!==0)return;clearTimers();app.mode='quiz';app.round=pick10();app.asked=0;app.rivalCount=10;app.score=0;app.quizLocked=false;if(app.avatar)app.avatar.visible=false;resetChickens();setSide('Học bá Chuồng Gà','🐔','THỬ THÁCH TOÁN 6 · CHƯƠNG I');showPane('quizPane');$('sceneLabel').textContent='ĐẤU TRƯỜNG GÀ 3D';$('sceneTitle').textContent='HỌC BÁ CHUỒNG GÀ';$('sceneDescription').textContent='Cùng đứng trong vòng tròn. Đúng đá một gà đối thủ; sai bị đá ra ngoài và chơi lại.';renderQuestion();popToast('🐔 10 đối thủ đã vào vòng tròn. Bắt đầu câu 1!');}
function escapeText(text){return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function latexToMathML(tex){ // Offline MathML renderer for the teacher's supported notation; retains the text/source unchanged.
 const tokens=String(tex).match(/\\mathbb\{N\}|\\cdots|\\cdot|\\leq|\\le|\\ge|\\in|\\mid|\\\{|\\\}|\^\{[^}]*\}|\^[a-zA-Z0-9*]+|\d+|[a-zA-Z]|[^\s]/g)||[];
 const arr=[];function atom(token){if(/^\d+$/.test(token))return `<mn>${token}</mn>`;if(/^[a-zA-Z]$/.test(token))return `<mi>${token}</mi>`;if(token==='\\mathbb{N}')return '<mi mathvariant="double-struck">ℕ</mi>';
 const syms={'\\cdots':'⋯','\\cdot':'⋅','\\le':'≤','\\leq':'≤','\\ge':'≥','\\in':'∈','\\mid':'∣','\\{':'{','\\}':'}','<':'&lt;','>':'&gt;','=':'=','+':'+','-':'−','*':'∗','|':'∣','{':'{','}':'}'};return `<mo>${syms[token]||escapeText(token)}</mo>`;}
 for(const token of tokens){if(token.startsWith('^')){const base=arr.pop()||'<mi> </mi>';let exp=token.slice(1);if(exp[0]==='{')exp=exp.slice(1,-1);const math=latexToMathML(exp).replace(/^<math[^>]*><mrow>/,'').replace(/<\/mrow><\/math>$/,'');arr.push(`<msup>${base}<mrow>${math}</mrow></msup>`);}else arr.push(atom(token));}
 return `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow>${arr.join('')}</mrow></math>`;
}
function segmentsHTML(parts){return (parts||[]).map(p=>p.t==='math'?latexToMathML(p.v):escapeText(p.v)).join('');}
function renderQuestion(){const q=app.round[app.asked];if(!q){winQuiz();return;}app.currentQuestion=q;
 $('questionCount').textContent=`Câu ${app.asked+1}/10 · ${q.difficulty}`;$('quizProgress').style.width=`${app.asked*10}%`;$('opponentsLeft').textContent=String(app.rivalCount);
 $('quizSubtitle').textContent='Toán 6 · Chương I · Tập hợp và số tự nhiên';$('questionText').innerHTML=segmentsHTML(q.prompt_segments);
 const choices=shuffle(Object.keys(q.choices));$('answerList').innerHTML='';
 choices.forEach((original,i)=>{const btn=document.createElement('button');btn.className='answer';btn.dataset.original=original;const letter=document.createElement('span');letter.className='letter';letter.textContent='ABCD'[i];const value=document.createElement('span');value.innerHTML=segmentsHTML(q.choice_segments[original]);btn.append(letter,value);btn.addEventListener('click',()=>answerQuestion(original,btn));$('answerList').append(btn);});
 $('quizFeedback').textContent='Chọn một đáp án. Sai một câu sẽ bị đá khỏi đấu trường và phải bắt đầu lại.';app.quizLocked=false;}
function answerQuestion(original,btn){if(app.mode!=='quiz'||app.quizLocked)return;app.quizLocked=true;const q=app.currentQuestion;const correct=original===q.answer;
 document.querySelectorAll('.answer').forEach(el=>{el.disabled=true;if(el.dataset.original===q.answer)el.classList.add('correct');});
 if(correct){app.score++;app.asked++;kickEnemy();$('opponentsLeft').textContent=String(app.rivalCount);$('quizProgress').style.width=`${app.asked*10}%`;$('quizFeedback').textContent='✅ Chính xác! Một chú gà đối thủ bay ra khỏi vòng tròn.';popToast('✅ ĐÚNG! Gà đối thủ đã bị loại.');if(app.score===10)later(winQuiz,1700);else later(renderQuestion,1700);}
 else{btn.classList.add('wrong');kickPlayer();$('quizFeedback').textContent='❌ Sai! Gà của bạn bị đá khỏi vòng tròn. Trò chơi kết thúc và phải chơi lại từ câu 1.';popToast('❌ GÀ CỦA BẠN BỊ ĐÁ VĂNG!');later(loseQuiz,1600);}
}
function winQuiz(){app.mode='ended';$('finishIcon').textContent='🏆';$('finishTitle').textContent='HỌC BÁ CHUỒNG GÀ';$('finishText').textContent='Bạn đã trả lời đúng liên tiếp 10/10 câu. Cả 10 gà đối thủ rời đấu trường, bạn là nhà vô địch vòng tròn!';$('finishModal').classList.add('show');popToast('🏆 Chúc mừng! Danh hiệu Học bá Chuồng Gà!');}
function loseQuiz(){app.mode='ended';$('finishIcon').textContent='🐣';$('finishTitle').textContent='BỊ ĐÁ KHỎI VÒNG TRÒN';$('finishText').textContent=`Bạn đã trả lời đúng ${app.score} câu trước khi chọn sai. Lượt chơi kết thúc; hãy chơi lại từ câu 1 với 10 câu ngẫu nhiên mới.`;$('finishModal').classList.add('show');}
function buildUi(){const map=$('parkMap'),grid=$('zoneGrid');ZONES.forEach((z,i)=>{
 const point=zoneLocation(i);const angle=point.angle;
 const b=document.createElement('button');b.className='map-stop';b.dataset.zone=i;b.textContent=String(i+1);b.title=z.name;b.style.left=`${50+37*Math.sin(angle)}%`;b.style.top=`${50-36*Math.cos(angle)}%`;b.addEventListener('click',()=>chooseZone(i));map.append(b);
 const item=document.createElement('button');item.className='area';item.dataset.zone=i;item.innerHTML=`<span class="num">${i+1}</span><span>${z.emoji} ${z.short}</span>`;item.addEventListener('click',()=>chooseZone(i));grid.append(item);
 });}
function showFallback(){
 const canvas=$('worldCanvas');const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas không khả dụng');
 app.canvasFallback=ctx;$('engineTag').textContent='ĐỒ HỌA DỰ PHÒNG • WEBGL KHÔNG KHẢ DỤNG';$('renderInfo').textContent='Không có WebGL · mô phỏng 2D';
 function ell(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();}
 function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
 function text(s,x,y,size=18,color='#fff',weight='900'){ctx.fillStyle=color;ctx.font=`${weight} ${size}px 'Segoe UI',Arial,sans-serif`;ctx.textAlign='center';ctx.fillText(s,x,y);}
 function cartoonChicken(x,y,scale,body,player=false,prof=false,t=0){
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  if(app.mode!=='outside')ctx.translate(0,Math.sin(t*3+x)*2);
  ell(0,13,27,7,'#09212870');
  for(const s of [-1,1]){rect(s*12-2,0,4,17,'#ca833c');ell(s*14,16,13,5,'#f0ad4b');}
  ell(0,-17,32,32,body);ell(-21,-19,14,21,body);ell(21,-19,14,21,body);
  ell(-25,-44,12,16,body);ell(0,-58,27,25,body);
  for(const s of [-1,1]){ell(s*12,-59,7,9,'#fff');ell(s*13,-58,3.8,5.8,'#202b38');ell(s*12-1,-62,1.5,2,'#fff');}
  ctx.fillStyle='#e74e4d';[-13,0,13].forEach((ox,i)=>ell(ox,-88-(i%2)*4,9,13,'#eb524e'));
  ctx.beginPath();ctx.moveTo(-1,-53);ctx.lineTo(16,-47);ctx.lineTo(-1,-43);ctx.fillStyle='#f8b447';ctx.fill();
  if(player){rect(-29,-31,58,7,'#3fbad5');rect(-25,-85,50,7,'#4fa8dc');ell(0,-9,8,8,'#ffe785');}
  if(prof){ctx.lineWidth=3;ctx.strokeStyle='#284564';for(const s of [-1,1]){ctx.beginPath();ctx.ellipse(s*12,-58,12,11,0,0,TAU);ctx.stroke();}rect(-30,-88,60,8,'#2d4678');}
  ctx.restore();
 }
 function drawGameChickens(w,h,t){
  const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#224e70');g.addColorStop(.52,'#4b868c');g.addColorStop(.521,'#398358');g.addColorStop(1,'#20533d');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  const cx=w*.50,cy=h*.66,r=Math.min(w*.41,h*.45),ry=r*.48;
  ell(cx,cy+30,r+53,ry+39,'#122a28a9');ell(cx,cy+5,r+34,ry+22,'#987046');ell(cx,cy-2,r+23,ry+14,'#edc687');ell(cx,cy,r+9,ry-1,'#c3965a');
  for(let i=0;i<22;i++){const a=i*TAU/22;const xx=cx+(r+23)*Math.sin(a),yy=cy+ry*.93*Math.cos(a);rect(xx-5,yy-41,10,53,'#99653e');ell(xx,yy-45,7,5,'#e9c088');}
  ctx.beginPath();ctx.ellipse(cx,cy+2,r+31,ry+19,0,0,TAU);ctx.strokeStyle='#edce91';ctx.lineWidth=7;ctx.stroke();
  const enemyColors=['#efca84','#b3dbe9','#f3b4aa','#c7d59d','#efc4e7','#c7dfc1','#eddab9','#bebae7','#e4b19a','#a2e0d9'];
  for(let i=0;i<10;i++){
   if(i>=app.rivalCount)continue;
   const a=i*TAU/10+0.22;
   const x=cx+r*.69*Math.sin(a),y=cy+ry*.69*Math.cos(a);
   cartoonChicken(x,y,.47+Math.sin(a)*.01,enemyColors[i],false,false,t);
  }
  const kicked=(app.mode==='ended'&&app.score<10);
  const playerX=kicked?cx+r+90:cx,playerY=kicked?cy-70:cy+42;
  cartoonChicken(playerX,playerY,1.0,'#fff1cb',true,false,t);
  cartoonChicken(cx-r-70,cy-ry+20,.63,'#ffe093',false,true,t);
  text('GÀ GIÁO SƯ',cx-r-68,cy-ry+44,12,'#fff1aa');
  text(app.mode==='ended'&&app.score===10?'🏆 HỌC BÁ CHUỒNG GÀ':'ĐẤU TRƯỜNG CHUỒNG GÀ',cx,85,Math.min(28,w*.027),'#fff2bd');
  text(`${app.rivalCount} GÀ ĐỐI THỦ CÒN TRONG VÒNG`,cx,h-43,Math.min(17,w*.02),'#edfff5','800');
 }
 function paint(){if(!app.canvasFallback)return;const w=canvas.clientWidth||800,h=canvas.clientHeight||520;const dpr=Math.min(2,window.devicePixelRatio||1);
  if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);
  const t=performance.now()/1000;
  if(app.activeZone===0&&(app.mode==='zone'||app.mode==='quiz'||app.mode==='ended')){drawGameChickens(w,h,t);requestAnimationFrame(paint);return;}
  const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#194360');sky.addColorStop(.50,'#427e88');sky.addColorStop(.51,'#3b7161');sky.addColorStop(1,'#174a3e');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  for(let i=0;i<25;i++){const xx=(i*139)%w,yy=(i*67)%(h*.3);ell(xx,yy,1.3,1.4,'#c8f4f3aa');}
  const cx=w*.5,cy=h*.51,rx=Math.min(w*.42,h*.69),ry=rx*.56;
  ell(cx,cy+28,rx+55,ry+49,'#133b40');ell(cx,cy+8,rx+40,ry+25,'#3b8565');ell(cx,cy,rx+5,ry+5,'#9bca92');
  ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,TAU);ctx.strokeStyle='#e2b77d';ctx.lineWidth=24;ctx.stroke();ctx.strokeStyle='#a4e0ce';ctx.lineWidth=2.5;ctx.stroke();
  for(let i=0;i<10;i++){
   const a=.42+i*TAU/10,x=cx+rx*.95*Math.sin(a),y=cy-ry*.95*Math.cos(a);
   ell(x,y+21,28,10,'#0e3744aa');ell(x,y+9,31,16,i===app.activeZone?'#eec770':'#2f8183');
   rect(x-13,y-18,26,32,`#${ZONES[i].color.toString(16).padStart(6,'0')}`);rect(x-17,y-21,34,9,'#d8c19a');
   text(ZONES[i].emoji,x,y-27,22,'#fff');text(String(i+1),x,y+35,13,'#efffff');
  }
  ell(cx,cy,47,29,'#438c9c');ell(cx,cy-8,35,19,'#8bd5dc');
  if(app.mode!=='outside'&&app.mode!=='opening')for(let i=0;i<8;i++){const x=cx+Math.cos(i*TAU/8)*26,y=cy-12+Math.sin(i*TAU/8)*11;ell(x,y+Math.sin(t*4+i)*4,2.8,12,'#c4f8ff');}
  const gateY=Math.min(h-35,cy+ry+33);
  rect(cx-84,gateY-40,18,61,'#dfd1aa');rect(cx+66,gateY-40,18,61,'#dfd1aa');rect(cx-80,gateY-55,160,23,'#26617a');text('MATHVERSE',cx,gateY-38,18,'#ffedb7');
  if(app.mode==='outside'){rect(cx-65,gateY-28,63,44,'#31818e');rect(cx+2,gateY-28,63,44,'#31818e');}
  else{rect(cx-65,gateY-28,15,44,'#31818e');rect(cx+50,gateY-28,15,44,'#31818e');}
  // Student avatar in the foreground and a receptionist to the side
  cartoonChicken(cx,gateY+26,.26,'#e3f0c0',true,false,t);cartoonChicken(cx-114,gateY+11,.32,'#ffe1a1',false,true,t);
  text(app.mode==='outside'?'CỔNG ĐÓNG · TRÒ CHƠI 3D TĨNH':'CỔNG MỞ · CÔNG VIÊN CHUYỂN ĐỘNG',cx,Math.min(h-8,gateY+63),Math.min(15,w*.018),'#e4fffd');
  requestAnimationFrame(paint);
 }requestAnimationFrame(paint);
}

function setupControls(){
 $('enterPark').addEventListener('click',enterPark);$('outsideLook').addEventListener('click',()=>popToast('10 công trình đang là mô hình 3D tĩnh. Bấm Mở cổng để kích hoạt chuyển động.'));
 $('btnHome').addEventListener('click',returnGate);$('btnOverview').addEventListener('click',()=>{app.cameraMode='overview';if(app.mode==='zone'||app.mode==='quiz')app.cameraMode='focus';});$('btnFollow').addEventListener('click',()=>app.cameraMode='follow');
 $('parkOverview').addEventListener('click',()=>{app.cameraMode='overview';popToast('🌐 Đang xem toàn cảnh 10 khu 3D có chuyển động.');});
 $('btnGuide').addEventListener('click',()=>speak(app.mode==='outside'?'Chào mừng đến Công viên Toán học MATHVERSE! Mời bạn mở cổng để vào công viên.':app.activeZone>=0?ZONES[app.activeZone].guide:'Chào mừng vào Công viên Toán học MATHVERSE! Bạn có thể đi bộ hoặc chọn khu trên bản đồ.'));
 $('speakOutside').addEventListener('click',()=>speak('Chào mừng đến công viên MATHVERSE! Bên ngoài cổng bạn thấy mô hình ba chiều tĩnh. Hãy mở cổng để các trò chơi chuyển động.'));
 $('speakPark').addEventListener('click',()=>speak('Xin chào! Tôi là Linh, nhân viên hướng dẫn. Công viên có mười khu. Bạn hãy đến từng khu để gặp người hướng dẫn riêng. Khu đầu tiên là Học bá Chuồng Gà.'));
 $('speakZone').addEventListener('click',()=>speak(ZONES[app.activeZone]?.guide||''));
 $('zonePlay').addEventListener('click',()=>app.activeZone===0?beginQuiz():popToast('Đây là cảnh và nhân viên giới thiệu 3D. Game này chưa triển khai luật chơi.'));
 $('backToPark').addEventListener('click',showPark);$('quitQuiz').addEventListener('click',showPark);
 $('btnAgain').addEventListener('click',()=>{$('finishModal').classList.remove('show');app.mode='zone';beginQuiz();});$('btnLeaveArena').addEventListener('click',showPark);
 document.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select')||e.ctrlKey||e.metaKey)return;const key=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){app.keys.add(key);if(e.key.startsWith('Arrow'))e.preventDefault();}if(key==='e'){if(app.mode==='outside')enterPark();else if(app.mode==='inside'){const near=app.zonePositions.map((p,i)=>({i,d:Math.hypot(app.avatar.position.x-p.x,app.avatar.position.z-p.z)})).sort((a,b)=>a.d-b.d)[0];if(near.d<14)chooseZone(near.i);else speak('Chào mừng! Hãy đến gần một khu trò chơi.');}else if(app.mode==='zone')app.activeZone===0?beginQuiz():speak(ZONES[app.activeZone].guide);}if(app.mode==='quiz'&&!app.quizLocked&&'abcd'.includes(key)&&key.length===1){const btn=$('answerList').querySelectorAll('.answer')['abcd'.indexOf(key)];if(btn)btn.click();}});
 window.addEventListener('keyup',e=>app.keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>app.keys.clear());
 const canvas=$('worldCanvas');canvas.addEventListener('pointerdown',e=>{app.dragging=true;app.dragMoved=false;app.lastPointer={x:e.clientX,y:e.clientY};canvas.setPointerCapture?.(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!app.dragging||!app.lastPointer)return;const dx=e.clientX-app.lastPointer.x;if(Math.abs(dx)>2)app.dragMoved=true;app.cameraAngle+=dx*.006;app.lastPointer={x:e.clientX,y:e.clientY};});canvas.addEventListener('pointerup',()=>app.dragging=false);
 canvas.addEventListener('wheel',e=>{if(!app.threeReady)return;e.preventDefault();app.cameraDistance=Math.max(10,Math.min(42,app.cameraDistance+e.deltaY*.02));},{passive:false});
 canvas.addEventListener('click',e=>{if(!app.threeReady||app.dragMoved||app.mode==='outside'||app.mode==='opening')return;const bounds=canvas.getBoundingClientRect();const mouse=new THREE.Vector2(((e.clientX-bounds.left)/bounds.width)*2-1,-((e.clientY-bounds.top)/bounds.height)*2+1);const ray=new THREE.Raycaster();ray.setFromCamera(mouse,app.camera);const found=ray.intersectObjects(app.hitMeshes,true);if(found.length){let obj=found[0].object;while(obj&&!Number.isInteger(obj.userData.zoneId))obj=obj.parent;if(obj)chooseZone(obj.userData.zoneId);}});
}
function init(){buildUi();setupControls();setIntro();const canvas=$('worldCanvas');try{const support=canvas.getContext('webgl2')||canvas.getContext('webgl');if(!support)throw new Error('Không khởi tạo được WebGL');buildWorld();$('renderInfo').textContent='Three.js 3D · WebGL';$('engineTag').textContent='THREE.JS 3D • CHẠY TẠI MÁY • KHÔNG CẦN MẠNG';}
 catch(err){console.warn('[MATHVERSE] WebGL unavailable:',err.message);const old=$('worldCanvas');const fresh=document.createElement('canvas');fresh.id='worldCanvas';fresh.setAttribute('tabindex','0');old.replaceWith(fresh);showFallback();}
}
init();
// Public, read-only QA interface; does not modify the parent MATHVERSE project.
window.MATHVERSE_PARK_DEMO={getSceneStats:()=>({zones:app.zoneRoots.length,staff:app.npcRoots.length,rivals:app.chickens?.rivals.length||0,gatePanels:app.gatePanels.length,animatedAttractions:app.animated.length}),getState:()=>({mode:app.mode,inside:app.mode!=='outside'&&app.mode!=='opening',activeZone:app.activeZone,question:app.asked,score:app.score,rivals:app.rivalCount,webgl:app.threeReady,questionIds:app.round.map(q=>q.id)}),enter:enterPark,visit:chooseZone,play:beginQuiz,answer:original=>{const b=[...$('answerList').querySelectorAll('.answer')].find(x=>x.dataset.original===original);if(b)b.click();},home:returnGate};
