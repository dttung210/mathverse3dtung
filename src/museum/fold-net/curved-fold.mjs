/**
 * True developable-surface fold/unroll for cylinder, cone and truncated cone.
 * For intermediate poses, in-surface distances are preserved by parametric bending.
 * No rigid polygon hinges are incorrectly applied to curved surfaces.
 */
import * as THREE from '../../../vendor/three.module.js';

const clamp=t=>Math.max(0,Math.min(1,Number.isFinite(Number(t))?Number(t):0));
const positive=(x,f)=>Number.isFinite(Number(x))&&Number(x)>0?Number(x):f;
const mat=(hex,opacity=0.88)=>new THREE.MeshStandardMaterial({
 color:hex,transparent:true,opacity,side:THREE.DoubleSide,roughness:0.72,metalness:0.03
});
function disk(radius,color){
 const mesh=new THREE.Mesh(new THREE.CircleGeometry(radius,96),mat(color,0.9));
 mesh.userData.mathFoldCap=true;return mesh;
}
function surfaceGrid(columns,rows){
 const position=new Float32Array((columns+1)*(rows+1)*3),indices=[];
 for(let i=0;i<columns;i++)for(let j=0;j<rows;j++){
  const a=i*(rows+1)+j, b=(i+1)*(rows+1)+j;
  indices.push(a,b,a+1,b,b+1,a+1);
 }
 const geom=new THREE.BufferGeometry();
 geom.setAttribute('position',new THREE.BufferAttribute(position,3));
 geom.setIndex(indices);
 return geom;
}
function metricCylinder(R,h){return {radius:R,height:h,lateralArea:2*Math.PI*R*h,totalArea:2*Math.PI*R*(R+h),volume:Math.PI*R*R*h,flatWidth:2*Math.PI*R};}
function metricCone(R,h){const slant=Math.hypot(R,h);return {radius:R,height:h,slant,sectorAngle:2*Math.PI*R/slant,lateralArea:Math.PI*R*slant,totalArea:Math.PI*R*(R+slant),volume:Math.PI*R*R*h/3};}
function metricFrustum(R1,R2,h){
 const lo=Math.max(R1,R2),hi=Math.min(R1,R2),gap=lo-hi;
 if(gap<0.02)throw Error('Ban kinh hai day qua gan nhau: dung mo hinh tru thay cho non cut');
 const slant=Math.hypot(h,gap),k=gap/slant;
 return {radiusLarge:lo,radiusSmall:hi,height:h,slant,innerSlant:slant*hi/gap,outerSlant:slant*lo/gap,sectorAngle:2*Math.PI*k,
  lateralArea:Math.PI*(lo+hi)*slant,totalArea:Math.PI*(lo+hi)*slant+Math.PI*(lo*lo+hi*hi),
  volume:Math.PI*h*(lo*lo+lo*hi+hi*hi)/3};
}
/** Notebook indices 8=cone, 9=cylinder, 18=frustum. */
export function createCurvedFold(index, input={}){
 if(![8,9,18].includes(index))throw Error(`Unsupported developable model ${index}`);
 const R=positive(input.R,1.2),h=positive(input.h,2),R1=positive(input.R1,1.6),R2=positive(input.R2,0.8);
 const kind=index===8?'cone':index===9?'cylinder':'conical-frustum';
 const metrics=index===8?metricCone(R,h):index===9?metricCylinder(R,h):metricFrustum(R1,R2,h);
 const columns=96,rows=index===9?28:30;
 const geom=surfaceGrid(columns,rows);
 const root=new THREE.Group();root.name=`MATHVERSE-CURVED-FOLD-${index}`;
 if(index===9)root.rotation.x=Math.PI/2; // cylinder rectangular net is in XZ; rotate it flat to XY
 const shell=new THREE.Mesh(geom,mat(index===8?0x38bdf8:index===9?0x2dd4bf:0xe879f9,0.86));
 shell.name=`fold-curved-surface-${index}`;root.add(shell);
 const caps=index===8?[disk(R,0xfacc15)]:index===9?[disk(R,0xfacc15),disk(R,0xfacc15)]:[disk(metrics.radiusSmall,0xfbbf24),disk(metrics.radiusLarge,0x60a5fa)];
 for(const cap of caps)root.add(cap);
 const seamGeom=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,1)]);
 const seam=new THREE.Line(seamGeom,new THREE.LineBasicMaterial({color:0xb45309}));root.add(seam);
 const a=geom.getAttribute('position');
 let progress=0;
 function point(i,j,t){
  const u=i/columns, v=j/rows;
  if(index===9){
   const z=(v-0.5)*h;
   const arc=(u-0.5)*(2*Math.PI*R);
   if(t<1e-10)return [arc,0,z];
   const rad=R/t,phi=arc/rad;
   return [rad*Math.sin(phi),rad*(1-Math.cos(phi)),z];
  }
  const sector=index===8?metrics.sectorAngle:metrics.sectorAngle;
  const phi=(u-0.5)*sector;
  const rInner=index===8?0:metrics.innerSlant;
  const rOuter=index===8?metrics.slant:metrics.outerSlant;
  const slant=rInner+(rOuter-rInner)*v;
  const kFinal=index===8?metrics.radius/metrics.slant:(metrics.radiusLarge-metrics.radiusSmall)/metrics.slant;
  const k=1-(1-kFinal)*t;
  const angle=phi/k;
  const z=(slant-rInner)*Math.sqrt(Math.max(0,1-k*k));
  return [slant*k*Math.cos(angle),slant*k*Math.sin(angle),z];
 }
 function setProgress(t){
  progress=clamp(t);
  for(let i=0;i<=columns;i++)for(let j=0;j<=rows;j++){
   const k=i*(rows+1)+j;const p=point(i,j,progress);
   a.setXYZ(k,p[0],p[1],p[2]);
  }
  a.needsUpdate=true;geom.computeVertexNormals();
  geom.computeBoundingSphere();
  const tCap=clamp((progress-0.55)/0.45);
  if(index===9){
   for(let i=0;i<2;i++){
    const sign=i===0?-1:1;
    caps[i].rotation.x=(1-tCap)*Math.PI/2;
    caps[i].position.set(0,R*tCap,sign*(h/2+R*(1-tCap)));
   }
   seam.geometry.setFromPoints([new THREE.Vector3(0,2*R*progress,-h/2),new THREE.Vector3(0,2*R*progress,h/2)]);
  }else if(index===8){
   caps[0].position.set(0,-(metrics.slant+R+0.4)*(1-tCap),h*tCap);
   seam.geometry.setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(-R,0,h)]);
  }else{
   const bottom=metrics.radiusSmall,top=metrics.radiusLarge;
   caps[0].position.set(0,-(metrics.outerSlant+bottom+0.4)*(1-tCap),0);
   caps[1].position.set(0,(metrics.outerSlant+top+0.4)*(1-tCap),h*tCap);
   seam.geometry.setFromPoints([new THREE.Vector3(-bottom,0,0),new THREE.Vector3(-top,0,h)]);
  }
  // The seam marker is informational only; the actual shell is the animated mesh.
  seam.visible=progress>0.94;
  root.updateMatrixWorld(true);
  return progress;
 }
 function getDiagnostic(){
  const A=point(0,0,progress),B=point(columns,0,progress),C=point(0,rows,progress),D=point(columns,rows,progress);
  const distance=(x,y)=>Math.hypot(...x.map((v,i)=>v-y[i]));
  const flatMaxOutOfPlane=progress===0?(index===9?Math.max(...[A,B,C,D].map(p=>Math.abs(p[1]))):Math.max(...[A,B,C,D].map(p=>Math.abs(p[2])))):null;
  return {kind,progress,maxSeamGap:Math.max(distance(A,B),distance(C,D)),flatMaxOutOfPlane,
   metrics,vertices:(columns+1)*(rows+1),caps:caps.length};
 }
 function dispose(){
  shell.geometry.dispose();shell.material.dispose();
  for(const cap of caps){cap.geometry.dispose();cap.material.dispose();}
  seam.geometry.dispose();seam.material.dispose();root.clear();
 }
 setProgress(0);
 return {type:'curved',index,group:root,metrics,setProgress,getProgress:()=>progress,getDiagnostic,
   unfold:()=>setProgress(0),fold:()=>setProgress(1),
   setWireframe(on){shell.material.wireframe=Boolean(on);for(const cap of caps)cap.material.wireframe=Boolean(on);},
   setFacesVisible(on){shell.visible=Boolean(on);for(const cap of caps)cap.visible=Boolean(on);},
   setEdgesVisible(on){seam.visible=Boolean(on)&&progress>0.94;},
   setXRayMode(on){
    const xray=Boolean(on);
    shell.material.opacity=xray?0.34:0.86;
    shell.material.depthWrite=!xray;
    for(const cap of caps){cap.material.opacity=xray?0.38:0.9;cap.material.depthWrite=!xray;}
   },
   setFoldMarkersVisible(on){seam.visible=Boolean(on)&&progress>0.94;},
   dispose};
}
