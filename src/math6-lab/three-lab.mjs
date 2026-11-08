/** Offline Three.js r161 renderer for SGK grade-6 real-world geometric experiments.
 * This intentionally does NOT replace 2D mathematical constructions. */
import * as THREE from '../../vendor/three.module.js?v=r107_v15';
import {readStoredPixelRatio} from '../museum/quality-controller.js?v=r107_v15';
import {createContactShadowDisc,createProceduralHDRIEnvironment,getSharedPBRMaterial} from '../graphics-r74/depth-pipeline-v12.mjs?v=r107_v15';
import {renderModel,W,H} from './canvas.mjs?v=r107_v15';
import {GRADE6_3D_CAPABLE_IDS, isTrue3DCapable, getModelTaxonomy} from './math6-taxonomy.mjs?v=r107_v15';
const PI=Math.PI;
const mat=(color,roughness=.7)=>new THREE.MeshStandardMaterial({color,roughness,metalness:.08,side:THREE.DoubleSide});
const gray=mat('#657d91'),teal=mat('#18b5aa'),amber=mat('#ffbc64'),blue=mat('#66a8da'),pink=mat('#f293a7'),snow=mat('#eaf4ff');
const materials=[teal,blue,amber,pink];
const mesh=(geo,material,parent,pos=[0,0,0])=>{const o=new THREE.Mesh(geo,material);o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
const line=(p,q,parent,color='#3d7d8f')=>{const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...p),new THREE.Vector3(...q)]);const o=new THREE.Line(g,new THREE.LineBasicMaterial({color}));parent.add(o);return o;};
const cyl=(r,ht,parent,material,pos=[0,0,0])=>mesh(new THREE.CylinderGeometry(r,r,ht,18),material,parent,pos);
export const SUPPORTS_3D=(m)=>Boolean(m && (isTrue3DCapable(m.id) || m.engine==='real'||(m.engine==='chance'&&['dice','spinner','coin'].includes(m.variant))));
export function model3DLabel(m){
  const tax = getModelTaxonomy(m?.id);
  return tax.badge || (m?.engine==='chance'?'Thí nghiệm xác suất 3D':'Mô hình thực tế 3D');
}
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
function pipTexture(value){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#f5fafc';g.fillRect(0,0,256,256);g.strokeStyle='#a4c5d3';g.lineWidth=8;g.strokeRect(6,6,244,244);
 const q={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[-1,0],[-1,1],[1,-1],[1,0],[1,1]]};g.fillStyle='#194d66';for(const [x,y]of q[value]){g.beginPath();g.arc(128+x*70,128+y*70,17,0,PI*2);g.fill();}
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}
export class Math6ThreeLab{
 constructor(canvas,onNotice=()=>{}){
  this.canvas=canvas;this.onNotice=onNotice;this.ready=false;this.active=false;this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#edf6f7');this.scene.fog=new THREE.Fog('#edf6f7',18,39);
  try{this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true,alpha:false});this.renderer.setPixelRatio(readStoredPixelRatio(window.devicePixelRatio||1));this.renderer.setSize(920,560,false);this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.08;const envTex=createProceduralHDRIEnvironment(this.renderer);if(envTex)this.scene.environment=envTex;this.ready=true;}
  catch(e){this.onNotice('Máy chưa tạo được không gian WebGL 3D: '+e.message);return;}
  this.camera=new THREE.PerspectiveCamera(43,920/560,.1,100);this.orthoCamera=new THREE.OrthographicCamera(-6,6,4,-4,.1,100);this.projectionMode='perspective';this.cameraDistance=13.5;this.targetDistance=13.5;this.yaw=.52;this.pitch=.37;this.targetYaw=.52;this.targetPitch=.37;
  const hemi=new THREE.HemisphereLight('#fff9ed','#688596',2);this.scene.add(hemi);
  const sun=new THREE.DirectionalLight('#ffffff',3);sun.position.set(6,13,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-13;sun.shadow.camera.right=13;sun.shadow.camera.top=13;sun.shadow.camera.bottom=-13;sun.shadow.bias=-0.00012;sun.shadow.normalBias=0.024;this.sun=sun;this.scene.add(sun);
  const floor=mesh(new THREE.PlaneGeometry(200,200),mat('#cddfe2',1),this.scene);floor.rotation.x=-PI/2;floor.position.y=-.04;floor.castShadow=false;floor.receiveShadow=true;
  this.contactDisc=createContactShadowDisc({radius:3.2,groundY:-0.015,maxOpacity:0.34});this.scene.add(this.contactDisc);
  const grid=new THREE.GridHelper(24,24,'#aac4c7','#d9e9ea');grid.position.y=-.02;this.scene.add(grid);
  this.pbrPresetKey='default';
  this.root=new THREE.Group();this.scene.add(this.root);this.animated=[];this.model=null;this.state=null;this.raf=0;this.prevTime=0;this.drag=null;this._registerEvents();
  this._frame=this._frame.bind(this);this._updateCamera();
  this._mountV12Toolbar();
  if(typeof ResizeObserver !== 'undefined' && canvas?.parentElement){
    this._ro = new ResizeObserver(entries => {
      for(const entry of entries){
        const cr = entry.contentRect;
        if(cr.width > 50 && cr.height > 50){
          this.resize(cr.width, cr.height);
        }
      }
    });
    this._ro.observe(canvas.parentElement);
  }
 }
 _syncOrthoFrustum(){
  const aspect=this.camera?.aspect||(920/560);
  const halfH=Math.max(2.0,this.cameraDistance*Math.tan(THREE.MathUtils.degToRad(43*0.5)));
  const halfW=halfH*aspect;
  this.orthoCamera.left=-halfW;this.orthoCamera.right=halfW;this.orthoCamera.top=halfH;this.orthoCamera.bottom=-halfH;
  this.orthoCamera.updateProjectionMatrix();
 }
 getActiveCamera(){return this.projectionMode==='orthographic'?this.orthoCamera:this.camera;}
 setProjectionMode(mode){this.projectionMode=mode==='orthographic'?'orthographic':'perspective';this._updateCamera();return this.projectionMode;}
 toggleProjectionMode(){return this.setProjectionMode(this.projectionMode==='orthographic'?'perspective':'orthographic');}
 resetCamera(){this.targetYaw=.52;this.targetPitch=.37;this.targetDistance=13.5;this.root.position.set(0,0,0);}
 setQualityTier(tier='medium'){
  if(!this.ready)return;
  const mapSizes={low:512,medium:1024,high:2048};
  const prCaps={low:1.0,medium:1.5,high:2.0};
  const key=mapSizes[tier]?tier:'medium';
  this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,prCaps[key]));
  if(this.sun?.shadow){
   this.sun.shadow.mapSize.set(mapSizes[key],mapSizes[key]);
   if(this.sun.shadow.map){this.sun.shadow.map.dispose();this.sun.shadow.map=null;}
  }
 }
 setPBRMaterialPreset(presetKey='default'){
  this.pbrPresetKey=presetKey||'default';
  if(this.model)this.setModel(this.model,this.state);
  return this.pbrPresetKey;
 }
 _mountV12Toolbar(){
  if(typeof document==='undefined'||!this.canvas?.parentElement)return;
  const host=this.canvas.parentElement;
  if(host.querySelector('.mv-math6-v12-bar'))return;
  if(getComputedStyle(host).position==='static')host.style.position='relative';
  const bar=document.createElement('div');
  bar.className='mv-math6-v12-bar';
  bar.style.cssText='position:absolute;top:10px;right:12px;z-index:8;display:flex;gap:6px;align-items:center;flex-wrap:wrap;';
  const pbrSel=document.createElement('select');
  pbrSel.style.cssText='padding:4px 9px;border-radius:999px;border:1px solid rgba(14,116,144,.4);background:rgba(255,255,255,.92);color:#0f2b3c;font-size:11px;font-weight:800;cursor:pointer;';
  for(const [v,lbl] of [['default','🎨 PBR: Mặc định'],['woodOak','🪵 Gỗ Sồi'],['crystalGlass','💎 Kính'],['brushedMetal','🥇 Kim Loại'],['glossyPlastic','🧪 Nhựa'],['marbleStone','🏛️ Đá']]){
   const o=document.createElement('option');o.value=v;o.textContent=lbl;pbrSel.appendChild(o);
  }
  pbrSel.addEventListener('change',()=>this.setPBRMaterialPreset(pbrSel.value));
  const orthoBtn=document.createElement('button');
  orthoBtn.type='button';orthoBtn.textContent='🎥 Phối cảnh 3D';
  orthoBtn.style.cssText='padding:4px 10px;border-radius:999px;border:1px solid rgba(14,116,144,.4);background:rgba(255,255,255,.92);color:#0f2b3c;font-size:11px;font-weight:800;cursor:pointer;';
  orthoBtn.addEventListener('click',()=>{
   const m=this.toggleProjectionMode();
   orthoBtn.textContent=m==='orthographic'?'📐 Đo đạc Ortho':'🎥 Phối cảnh 3D';
  });
  bar.append(pbrSel,orthoBtn);
  host.appendChild(bar);
 }
 resize(width, height){
  if(!this.ready) return;
  const w = Math.max(100, Math.round(width || this.canvas.clientWidth || 920));
  const h = Math.max(100, Math.round(height || this.canvas.clientHeight || 560));
  this.camera.aspect = w / h;
  this.camera.updateProjectionMatrix();
  this._syncOrthoFrustum();
  this.renderer.setSize(w, h, false);
 }
 _registerEvents(){if(!this.ready)return;this.canvas.addEventListener('contextmenu',e=>e.preventDefault());this.canvas.addEventListener('pointerdown',e=>{
  if(!this.active)return;this.canvas.setPointerCapture(e.pointerId);const xy=[e.clientX,e.clientY];
  let move=!e.shiftKey&&e.button===0;const planePoint=this._groundPoint(e);
  if(move){const mouse=this._mouseNDC(e);const ray=new THREE.Raycaster();ray.setFromCamera(mouse,this.camera);move=ray.intersectObjects(this.root.children,true).some(o=>o.object.isMesh);}
  this.drag={mode:move?'move':'orbit',x:e.clientX,y:e.clientY,yaw:this.targetYaw,pitch:this.targetPitch,world:planePoint,position:this.root.position.clone()};
 });
 this.canvas.addEventListener('pointermove',e=>{if(!this.active||!this.drag)return;
  if(this.drag.mode==='orbit'){this.targetYaw=this.drag.yaw-(e.clientX-this.drag.x)*.008;this.targetPitch=clamp(this.drag.pitch-(e.clientY-this.drag.y)*.006,-1.20,1.25);}
  else{const at=this._groundPoint(e);if(at&&this.drag.world){this.root.position.x=clamp(this.drag.position.x+at.x-this.drag.world.x,-5,5);this.root.position.z=clamp(this.drag.position.z+at.z-this.drag.world.z,-4,4);}}
 });
 const end=()=>{this.drag=null;};this.canvas.addEventListener('pointerup',end);this.canvas.addEventListener('pointercancel',end);
 this.canvas.addEventListener('wheel',e=>{if(!this.active)return;e.preventDefault();this.targetDistance=clamp(this.targetDistance*(e.deltaY<0?.9:1.1),7,28);},{passive:false});}
 _mouseNDC(e){
  const b=this.canvas.getBoundingClientRect();
  if(!b.width||!b.height)return new THREE.Vector2(0,0);
  return new THREE.Vector2(((e.clientX-b.left)/b.width)*2-1,-(((e.clientY-b.top)/b.height)*2-1));
 }
 _groundPoint(e){const mouse=this._mouseNDC(e),ray=new THREE.Raycaster();ray.setFromCamera(mouse,this.camera);
  const point=new THREE.Vector3();return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),point)?point:null;}
 _updateCamera(){this.camera.position.set(Math.sin(this.yaw)*Math.cos(this.pitch)*this.cameraDistance,2.0+Math.sin(this.pitch)*this.cameraDistance,Math.cos(this.yaw)*Math.cos(this.pitch)*this.cameraDistance);this.camera.lookAt(0,1.4,0);this.orthoCamera.position.copy(this.camera.position);this.orthoCamera.quaternion.copy(this.camera.quaternion);this._syncOrthoFrustum();}
 async init(){return this.ready;}
 enter(model,state,{allowBoard=false}={}){if(!this.ready||(!SUPPORTS_3D(model)&&!allowBoard))return false;this.active=true;this.allowBoard=allowBoard;this.setModel(model,state);if(!this.raf)this.raf=requestAnimationFrame(this._frame);return true;}
 leave(){this.active=false;if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;this.prevTime=0;this.drag=null;}
 _dispose(node){node.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms)if(![gray,teal,amber,blue,pink,snow].includes(m)){m.map?.dispose();m.dispose();}}});}
 _clear(){this._dispose(this.root);this.root.clear();this.animated=[];this.root.position.set(0,0,0);this.boardCanvas=null;this.boardCtx=null;this.boardTexture=null;this.boardFrame=null;}
 setModel(model,state){if(!this.ready)return;this._clear();this.model=model;this.state=state;this.supported=SUPPORTS_3D(model);if(!this.supported){if(this.allowBoard)this._board();return;}
  const variant=model.variant;
  if(variant==='ferris')this._ferris();
  else if(variant==='cubes')this._cubes();
  else if(variant==='card')this._card();
  else if(variant==='roads')this._roads();
  else if(variant==='room')this._room();
  else if(variant==='dice')this._dice();
  else if(variant==='spinner')this._spinner();
  else if(variant==='coin')this._coin();
  if(this.pbrPresetKey&&this.pbrPresetKey!=='default'){
   const sharedMat=getSharedPBRMaterial(this.pbrPresetKey);
   if(sharedMat)this.root.traverse(o=>{if(o?.isMesh&&o.material&&!Array.isArray(o.material)&&!o.material.map)o.material=sharedMat;});
  }
  this._applyModel();
 }
 _board(){
  // Authentic Grade-6 2D diagram presented on a physical 3D exhibition board.
  // It is explicitly NOT modeled as a mathematical solid with volume.
  const source=document.createElement('canvas');source.width=W;source.height=H;
  const ctx=source.getContext('2d');if(!ctx)return;
  renderModel(ctx,this.model,this.state);
  const tex=new THREE.CanvasTexture(source);tex.colorSpace=THREE.SRGBColorSpace;
  this.boardCanvas=source;this.boardCtx=ctx;this.boardTexture=tex;
  const backing=new THREE.Mesh(new THREE.BoxGeometry(8,4.85,.22),mat('#1b4054'));
  backing.position.set(0,3.0,0);this.root.add(backing);
  const bMat=new THREE.MeshBasicMaterial({map:tex,side:THREE.FrontSide});
  const board=new THREE.Mesh(new THREE.PlaneGeometry(7.7,4.48),bMat);
  board.position.set(0,3.0,.13);this.root.add(board);
  const boardBack=new THREE.Mesh(board.geometry,bMat);
  boardBack.position.set(0,3.0,-.13);boardBack.rotation.y=Math.PI;this.root.add(boardBack);
  for(const x of [-3.4,3.4])mesh(new THREE.BoxGeometry(.13,3.3,.13),gray,this.root,[x,1.0,0]);
  this.boardFrame=board;
 }
 _refreshBoard(){if(!this.boardCanvas||!this.boardTexture)return;renderModel(this.boardCtx,this.model,this.state);this.boardTexture.needsUpdate=true;}
 _ferris(){const root=this.root,base=cyl(.8,.25,root,gray,[0,.2,0]);base.scale.z=2;
  for(const z of [-.6,.6]){line([-1,0,z],[0,3.6,z],root);line([1,0,z],[0,3.6,z],root);const ring=new THREE.Mesh(new THREE.TorusGeometry(2.7,.045,9,96),teal);ring.position.set(0,3.6,z);root.add(ring);}
  cyl(.18,1.5,root,amber,[0,3.6,0]).rotation.x=PI/2;
  this.cabins=[];this.spokes=[];
  for(let i=0;i<8;i++){const a=i*2*PI/8,spoke=new THREE.Group();root.add(spoke);
   spoke.position.y=3.6;for(const z of [-.6,.6])line([0,0,z],[2.7*Math.cos(a),2.7*Math.sin(a),z],spoke,'#6d9eac');this.spokes.push(spoke);
   const basket=new THREE.Group();root.add(basket);mesh(new THREE.BoxGeometry(.62,.42,.48),materials[i%4],basket,[0,-.26,0]);cyl(.04,.52,basket,gray,[0,.21,0]);this.cabins.push(basket);
  }
 }
 _cubes(){const root=this.root,n=Math.round(clamp(this.state?.params.speed||4,2,8));this.cubesN=n;for(let i=0;i<n;i++)for(let j=0;j<=i;j++)mesh(new THREE.BoxGeometry(.86,.86,.86),materials[(i+j)%4],root,[(i-(n-1)/2)*.92,j*.91+.43,0]);}
 _card(){const left=new THREE.Group(),right=new THREE.Group();this.root.add(left,right);
  mesh(new THREE.BoxGeometry(2.35,3.1,.055),mat('#ecaf7f'),left,[-1.2,1.7,0]);mesh(new THREE.BoxGeometry(2.35,3.1,.055),mat('#6bbdca'),right,[1.2,1.7,0]);
  const ribbon=mesh(new THREE.BoxGeometry(.18,1.15,.07),mat('#f2c75f'),left,[-1.2,1.8,.05]);ribbon.rotation.z=.35;
  this.cardRight=right;
 }
 _roads(){const root=this.root;mesh(new THREE.BoxGeometry(9,.15,1.6),mat('#607486'),root,[0,.08,0]);const moving=new THREE.Group();root.add(moving);mesh(new THREE.BoxGeometry(9,.16,1.6),mat('#7c91a0'),moving,[0,.16,0]);
  for(let k=-3;k<=3;k++){mesh(new THREE.BoxGeometry(.7,.02,.06),amber,root,[k*1.2,.17,0]);mesh(new THREE.BoxGeometry(.7,.02,.06),amber,moving,[k*1.2,.25,0]);}
  this.road=moving;
 }
 _room(){const root=this.root;mesh(new THREE.BoxGeometry(9,.12,7),mat('#ddd8cb'),root,[0,.02,0]);const desks=[];for(let r=0;r<3;r++)for(let c=0;c<4;c++){
  const group=new THREE.Group();group.position.set((c-1.5)*1.9,.45,(r-1)*1.9);root.add(group);
  mesh(new THREE.BoxGeometry(1.4,.14,.85),mat('#c89461'),group,[0,.35,0]);for(const x of [-.53,.53])for(const z of [-.31,.31])mesh(new THREE.BoxGeometry(.08,.7,.08),gray,group,[x,-.08,z]);desks.push(group);
 }this.desks=desks;
 }
 _dice(){const tex=[1,6,2,5,3,4].map(v=>new THREE.MeshStandardMaterial({map:pipTexture(v),roughness:.7}));const box=mesh(new THREE.BoxGeometry(3,3,3),tex,this.root,[0,2.1,0]);this.dice=box;}
 _coin(){const face=label=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');
   c.fillStyle='#ffdf87';c.fillRect(0,0,256,256);c.fillStyle='#75511d';c.font='bold 160px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(label,128,133);
   const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;};
  const sides=mat('#e0a33c'),top=new THREE.MeshStandardMaterial({map:face('N'),roughness:.45}),bottom=new THREE.MeshStandardMaterial({map:face('S'),roughness:.45});
  this.coin=mesh(new THREE.CylinderGeometry(1.58,1.58,.22,64),[sides,top,bottom],this.root,[0,2.0,0]);
 }
 _spinner(){const wheel=new THREE.Group();wheel.rotation.x=-PI/2;this.root.add(wheel);
  for(let i=0;i<6;i++){const a=i*2*PI/6;const geo=new THREE.CylinderGeometry(2.45,2.45,.12,48,1,false,a,2*PI/6);mesh(geo,materials[i%4],wheel,[0,0,0]);}
  const peg=cyl(.11,.3,this.root,gray,[0,.5,0]);this.wheel=wheel;
  const pointer=mesh(new THREE.ConeGeometry(.24,.65,3),pink,this.root,[0,.65,-2.65]);pointer.rotation.x=-PI/2;
 }
 _applyModel(){if(!this.model||!this.state)return;const p=this.state.params,v=this.model.variant,t=this.state.time/1000;if(!this.supported){this._refreshBoard();return;}
  if(v==='ferris'){for(let i=0;i<this.cabins.length;i++){const a=(p.rotation||0)*PI/180+t*(p.speed||0)*.13+i*2*PI/8;const x=2.7*Math.cos(a),y=3.6+2.7*Math.sin(a);this.cabins[i].position.set(x,y,0);this.cabins[i].rotation.set(0,0,0);
   const s=this.spokes[i];s.rotation.z=(p.rotation||0)*PI/180+t*(p.speed||0)*.13;
  }}
  if(v==='card'&&this.cardRight)this.cardRight.rotation.y=(p.rotation||0)*PI/180;
  if(v==='roads'&&this.road)this.road.rotation.y=(p.rotation||0)*PI/180;
  if((v==='cubes'||v==='room')&&this.root)this.root.rotation.y=(p.rotation||0)*PI/180;
  const cycleSec = t % 4, isSpin3D = t > 0 && cycleSec < 2.0, ease3D = isSpin3D ? 1 - Math.pow(1 - cycleSec / 2.0, 3) : 1;
  if(v==='dice'&&this.dice){const n=Number.isInteger(this.state.lastOutcome)?this.state.lastOutcome+1:3;this.dice.rotation.set(.3+(n%3)*.65,(n%2)*.5+.2,isSpin3D?(1-ease3D)*PI*4:0);}
  if(v==='spinner'&&this.wheel){const win=Number.isInteger(this.state.lastOutcome)?this.state.lastOutcome%6:(Math.floor(t/4)%6);const target=(win+0.5)*PI/3;this.wheel.rotation.z=(p.rotation||0)*PI/180+target-(1-ease3D)*PI*4;}
  if(v==='coin'&&this.coin)this.coin.rotation.x=(this.state.lastOutcome===1?PI:0)+(isSpin3D?(1-ease3D)*PI*6:0); 
  if(v==='room'&&this.desks){const focus=this.state.time>0?Math.min(11,Math.floor(this.state.time/8000*12)):this.state.selectedDesk;
   for(let i=0;i<this.desks.length;i++)this.desks[i].scale.setScalar(i===focus?1.13:1);}
 }
 _frame(time){if(!this.active||!this.ready)return;const dt=this.prevTime?Math.min(.06,(time-this.prevTime)/1000):1/60;this.prevTime=time;const f=1-Math.exp(-12*dt);
  this.yaw+=(this.targetYaw-this.yaw)*f;this.pitch+=(this.targetPitch-this.pitch)*f;this.cameraDistance+=(this.targetDistance-this.cameraDistance)*f;
  this._updateCamera();this._applyModel();if(!document.hidden)this.renderer.render(this.scene,this.getActiveCamera());this.raf=requestAnimationFrame(this._frame);
 }
 refresh(){if(!this.ready)return;if(this.model?.variant==='cubes'&&this.cubesN!==Math.round(clamp(this.state?.params.speed||4,2,8)))this.setModel(this.model,this.state);else this._applyModel();}
 setState(state){this.state=state;this.refresh();if(this.ready&&this.active&&!document.hidden)this.renderer?.render(this.scene,this.getActiveCamera());}
 screenshot(){if(!this.ready)return null;this.renderer.render(this.scene,this.getActiveCamera());return this.canvas.toDataURL('image/png');}
 dispose(){if(this._ro){this._ro.disconnect();this._ro=null;}this.leave();this._clear();this.renderer?.dispose();}
}
