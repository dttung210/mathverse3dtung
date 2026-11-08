/** A genuinely interactive model inspector for the same 3D meshes placed on real room pedestals.
 * Switch between perspective 3D and orthographic mathematical 2D.
 * Includes a resilient offscreen WebGL + 3D Software Mesh Rasterizer so 'Hình học 3D'
 * NEVER fails with WebGL context exhaustion ('Cannot read properties of null (reading precision)').
 */
import * as THREE from '/vendor/three.module.js';
import {createTeachingModel,disposeTeachingModel} from './geometry-models.mjs';

let sharedWebGL=null,sharedFailed=false;
function getSharedWebGL(){
 if(sharedWebGL)return sharedWebGL;
 if(sharedFailed||typeof document==='undefined')return null;
 try{
  const off=document.createElement('canvas');
  off.width=640;off.height=480;
  const gl=off.getContext('webgl2',{antialias:true,powerPreference:'low-power'})||off.getContext('webgl',{antialias:true,powerPreference:'low-power'});
  if(!gl||gl.isContextLost()||!gl.getShaderPrecisionFormat(gl.VERTEX_SHADER,gl.HIGH_FLOAT)){
   sharedFailed=true;return null;
  }
  const r=new THREE.WebGLRenderer({canvas:off,context:gl,antialias:true,alpha:false,powerPreference:'low-power'});
  r.setPixelRatio(1);
  r.outputColorSpace=THREE.SRGBColorSpace;
  sharedWebGL=r;
  return r;
 }catch{
  sharedFailed=true;
  return null;
 }
}

const vA=new THREE.Vector3(),vB=new THREE.Vector3(),vC=new THREE.Vector3();
const wA=new THREE.Vector3(),wB=new THREE.Vector3(),wC=new THREE.Vector3();
const nAB=new THREE.Vector3(),nAC=new THREE.Vector3(),faceN=new THREE.Vector3();
const lightDir=new THREE.Vector3(0.48,0.74,0.47).normalize();
const tmpMat4=new THREE.Matrix4();

export function renderObject3DSoftware(ctx,w,h,rootObj,camera,titleText=''){
 ctx.save();
 const grad=ctx.createLinearGradient(0,0,0,h);
 grad.addColorStop(0,'#081b2c');
 grad.addColorStop(1,'#102d44');
 ctx.fillStyle=grad;
 ctx.fillRect(0,0,w,h);

 camera.updateMatrixWorld(true);
 camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
 tmpMat4.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);

 const project=(vec)=>{
  const v=vec.clone().applyMatrix4(tmpMat4);
  if(v.z<-1||v.z>1||!Number.isFinite(v.x)||!Number.isFinite(v.y))return null;
  return {x:(v.x*0.5+0.5)*w,y:(-v.y*0.5+0.5)*h,z:v.z};
 };

 // Draw 3D reference grid on y = -0.05
 ctx.lineWidth=1;
 for(let i=-4;i<=4;i++){
  const p1=project(new THREE.Vector3(i*0.85,-0.02,-3.4));
  const p2=project(new THREE.Vector3(i*0.85,-0.02,3.4));
  if(p1&&p2){
   ctx.strokeStyle=i===0?'rgba(94,234,212,0.45)':'rgba(135,179,193,0.20)';
   ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();
  }
  const q1=project(new THREE.Vector3(-3.4,-0.02,i*0.85));
  const q2=project(new THREE.Vector3(3.4,-0.02,i*0.85));
  if(q1&&q2){
   ctx.strokeStyle=i===0?'rgba(244,207,129,0.45)':'rgba(135,179,193,0.20)';
   ctx.beginPath();ctx.moveTo(q1.x,q1.y);ctx.lineTo(q2.x,q2.y);ctx.stroke();
  }
 }

 if(rootObj){
  rootObj.updateWorldMatrix(true,true);
  const tris=[];
  rootObj.traverse(node=>{
   if(!node.visible)return;
   if(node.isMesh&&node.geometry){
    const geo=node.geometry;
    const pos=geo.attributes?.position;
    if(!pos)return;
    const idx=geo.index;
    const colAttr=geo.attributes?.color;
    const mat=Array.isArray(node.material)?node.material[0]:node.material;
    const baseCol=mat?.color||new THREE.Color(0xd8c5a0);
    const opacity=mat?.transparent?Math.max(0.35,mat.opacity??0.85):1;
    const count=idx?idx.count:pos.count;
    const step=count>9000?3:1;
    for(let i=0;i<=count-3;i+=3*step){
     const ia=idx?idx.getX(i):i;
     const ib=idx?idx.getX(i+1):i+1;
     const ic=idx?idx.getX(i+2):i+2;
     vA.fromBufferAttribute(pos,ia).applyMatrix4(node.matrixWorld);
     vB.fromBufferAttribute(pos,ib).applyMatrix4(node.matrixWorld);
     vC.fromBufferAttribute(pos,ic).applyMatrix4(node.matrixWorld);
     wA.copy(vA).applyMatrix4(tmpMat4);
     wB.copy(vB).applyMatrix4(tmpMat4);
     wC.copy(vC).applyMatrix4(tmpMat4);
     if(wA.z<-1||wA.z>1||wB.z<-1||wB.z>1||wC.z<-1||wC.z>1)continue;
     nAB.subVectors(vB,vA);
     nAC.subVectors(vC,vA);
     faceN.crossVectors(nAB,nAC).normalize();
     const dot=Math.abs(faceN.dot(lightDir));
     const shade=0.46+0.54*dot;
     let r=baseCol.r,g=baseCol.g,b=baseCol.b;
     if(colAttr){
      r=(colAttr.getX(ia)+colAttr.getX(ib)+colAttr.getX(ic))/3;
      g=(colAttr.getY(ia)+colAttr.getY(ib)+colAttr.getY(ic))/3;
      b=(colAttr.getZ(ia)+colAttr.getZ(ib)+colAttr.getZ(ic))/3;
     }
     const R=Math.min(255,Math.round(r*shade*255));
     const G=Math.min(255,Math.round(g*shade*255));
     const B=Math.min(255,Math.round(b*shade*255));
     tris.push({
      ax:(wA.x*0.5+0.5)*w,ay:(-wA.y*0.5+0.5)*h,
      bx:(wB.x*0.5+0.5)*w,by:(-wB.y*0.5+0.5)*h,
      cx:(wC.x*0.5+0.5)*w,cy:(-wC.y*0.5+0.5)*h,
      depth:(wA.z+wB.z+wC.z)/3,
      fill:opacity<1?`rgba(${R},${G},${B},${opacity.toFixed(2)})`:`rgb(${R},${G},${B})`,
      stroke:`rgba(${Math.min(255,R+28)},${Math.min(255,G+28)},${Math.min(255,B+28)},0.28)`
     });
    }
   }
  });
  tris.sort((a,b)=>b.depth-a.depth);
  ctx.lineJoin='round';
  ctx.lineWidth=0.65;
  for(const t of tris){
   ctx.fillStyle=t.fill;
   ctx.strokeStyle=t.stroke;
   ctx.beginPath();
   ctx.moveTo(t.ax,t.ay);
   ctx.lineTo(t.bx,t.by);
   ctx.lineTo(t.cx,t.cy);
   ctx.closePath();
   ctx.fill();
   ctx.stroke();
  }
 }
 // HUD overlay hint
 ctx.fillStyle='rgba(8,27,44,0.78)';
 ctx.fillRect(10,h-34,Math.min(w-20,380),24);
 ctx.fillStyle='#99f6e4';
 ctx.font='bold 12px "Segoe UI", system-ui, sans-serif';
 ctx.fillText(titleText||'🔄 Kéo chuột xoay mô hình 3D • Cuộn chuột phóng to/thu nhỏ',18,h-18);
 ctx.restore();
}

export function makeGeometryInspector(canvas){
 let scene=null,model=null,raf=0,orbit=.56,tilt=.38,zoom=9.5,mode='3d',pointer=null,active=false,currentTitle='';
 function ensureScene(){
  if(scene)return;
  scene=new THREE.Scene();scene.background=new THREE.Color(0x0b2236);
  scene.add(new THREE.HemisphereLight(0xfff6e4,0x7b9c9d,2.5));
  const sun=new THREE.DirectionalLight(0xffecc7,2.7);sun.position.set(5,9,7);scene.add(sun);
  const side=new THREE.DirectionalLight(0xb4d9fa,1);side.position.set(-7,5,-4);scene.add(side);
  const grid=new THREE.GridHelper(8,16,0x87b3c1,0x355569);grid.position.y=-.15;scene.add(grid);
  const axes=new THREE.AxesHelper(1.8);axes.position.set(-3.2,.03,-2.8);scene.add(axes);
 }
 function render(){
  if(!active||!canvas)return;
  if(!pointer&&mode==='3d')orbit+=0.0045;
  const w=Math.max(320,canvas.clientWidth||520),h=Math.max(250,canvas.clientHeight||340);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  const camera=mode==='2d'?new THREE.OrthographicCamera(-5,5,5*h/w,-5*h/w,.1,60):new THREE.PerspectiveCamera(42,w/h,.1,75);
  if(mode==='2d'){camera.position.set(.05,3.0,12);camera.lookAt(0,1.30,0);}
  else{camera.position.set(zoom*Math.sin(orbit)*Math.cos(tilt),1.8+zoom*Math.sin(tilt),zoom*Math.cos(orbit)*Math.cos(tilt));camera.lookAt(0,1.35,0);}
  const ctx2d=canvas.getContext('2d');
  const glRenderer=getSharedWebGL();
  let drawnByWebGL=false;
  if(glRenderer&&ctx2d){
   try{
    glRenderer.setSize(w,h,false);
    glRenderer.render(scene,camera);
    ctx2d.clearRect(0,0,w,h);
    ctx2d.drawImage(glRenderer.domElement,0,0,w,h);
    ctx2d.fillStyle='rgba(8,27,44,0.78)';
    ctx2d.fillRect(10,h-34,Math.min(w-20,410),24);
    ctx2d.fillStyle='#99f6e4';
    ctx2d.font='bold 12px "Segoe UI", system-ui, sans-serif';
    ctx2d.fillText(currentTitle||'🔄 Kéo chuột xoay 3D 360° • Cuộn chuột phóng to/thu nhỏ',18,h-18);
    drawnByWebGL=true;
   }catch{
    sharedWebGL=null;sharedFailed=true;
   }
  }
  if(!drawnByWebGL&&ctx2d){
   renderObject3DSoftware(ctx2d,w,h,model,camera,currentTitle);
  }
  raf=requestAnimationFrame(render);
 }
 function update(item,newMode='3d'){
  try{
   ensureScene();
   if(model){scene.remove(model);disposeTeachingModel(model);model=null;}
   const shapeName=item?.shape||'pyramid';
   model=createTeachingModel(shapeName);
   model.position.y=.20;
   const bounds=new THREE.Box3().setFromObject(model);
   const size=bounds.getSize(new THREE.Vector3());
   const max=Math.max(size.x,size.y,size.z);
   model.scale.setScalar(Math.min(1.55,4.9/Math.max(max,.001)));
   model.updateWorldMatrix(true,true);
   const centered=new THREE.Box3().setFromObject(model);
   const ctr=centered.getCenter(new THREE.Vector3());
   model.position.sub(ctr);
   model.position.y+=centered.getSize(new THREE.Vector3()).y/2;
   scene.add(model);
   currentTitle=`${item?.name||'Mô hình 3D'} · ${item?.caption||item?.math||'Kéo chuột xoay 360°'}`;
   mode=newMode;orbit=.65;tilt=.34;zoom=8.8;
   active=true;if(!raf)render();
   return{ok:true};
  }catch(error){
   return{ok:false,error:String(error.message||error)};
  }
 }
 function setMode(nextMode){mode=nextMode==='2d'?'2d':'3d';}
 function close(){
  active=false;
  if(raf)cancelAnimationFrame(raf);
  raf=0;
  if(model){scene?.remove(model);disposeTeachingModel(model);model=null;}
 }
 canvas.addEventListener('pointerdown',e=>{if(mode==='2d')return;pointer={x:e.clientX,y:e.clientY};try{canvas.setPointerCapture(e.pointerId);}catch{}});
 canvas.addEventListener('pointermove',e=>{if(!pointer)return;orbit+=(e.clientX-pointer.x)*.008;tilt=THREE.MathUtils.clamp(tilt+(e.clientY-pointer.y)*.005,.05,1.2);pointer={x:e.clientX,y:e.clientY};});
 canvas.addEventListener('pointerup',()=>pointer=null);canvas.addEventListener('pointercancel',()=>pointer=null);
 canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=THREE.MathUtils.clamp(zoom*(e.deltaY>0?1.12:.9),4.5,22);},{passive:false});
 return {update,setMode,close,get isActive(){return active;}};
}
