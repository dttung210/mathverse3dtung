/**
 * True rigid-face net fold/unfold using a parent-child hinge tree.
 * Import path targets the EXISTING MATHVERSE vendored Three.js, not an npm add-on.
 */
import * as THREE from '../../../vendor/three.module.js?v=r107_v15';
import {makePolyhedron} from './geometry-models.mjs?v=r107_v15';

const FACE_COLORS=[0x6ee7b7,0x60a5fa,0xfbbf24,0xc4b5fd,0xfda4af,0x67e8f9,0xa7f3d0,0xfdba74];
const Z=new THREE.Vector3(0,0,1);
const clamp=t=>Math.max(0,Math.min(1,Number.isFinite(Number(t))?Number(t):0));
const v=coords=>new THREE.Vector3(...coords);
const edgeKey=(i,j)=>i<j?`${i}:${j}`:`${j}:${i}`;
function outwardNormal(poly,faceIndex){
 const f=poly.faces[faceIndex], A=v(poly.vertices[f[0]]), B=v(poly.vertices[f[1]]), C=v(poly.vertices[f[2]]);
 return B.sub(A).cross(C.sub(A)).normalize();
}
function sharedEdge(poly,faceA,faceB){
 const a=poly.faces[faceA], b=new Set(poly.faces[faceB]);
 for(let i=0;i<a.length;i++){
  const j=(i+1)%a.length;
  if(b.has(a[i])&&b.has(a[j]))return [a[i],a[j]];
 }
 throw Error(`Faces ${faceA} and ${faceB} share no hinge edge`);
}
function faceGeometry(poly, faceIndex, pivot){
 const face=poly.faces[faceIndex], positions=[];
 for(const index of face){const p=v(poly.vertices[index]).sub(pivot);positions.push(p.x,p.y,p.z);}
 const indices=[];for(let i=1;i<face.length-1;i++)indices.push(0,i,i+1);
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setIndex(indices);geometry.computeVertexNormals();
 return geometry;
}
function edgeLoop(poly,faceIndex,pivot,color){
 const pts=poly.faces[faceIndex].map(i=>v(poly.vertices[i]).sub(pivot));
 const geometry=new THREE.BufferGeometry().setFromPoints([...pts,pts[0]]);
 return new THREE.Line(geometry,new THREE.LineBasicMaterial({color}));
}
function hingeLine(poly,a,b,pivot){
 const pA=v(poly.vertices[a]).sub(pivot), pB=v(poly.vertices[b]).sub(pivot);
 const geometry=new THREE.BufferGeometry().setFromPoints([pA,pB]);
 const line=new THREE.Line(geometry,new THREE.LineDashedMaterial({color:0xd97706,dashSize:0.18,gapSize:0.11,linewidth:1}));
 line.computeLineDistances();
 line.userData.foldHinge=[a,b];return line;
}
function validateTree(poly){
 const n=poly.faces.length;
 if(poly.parents.length!==n)throw Error('Invalid hinge parent length');
 let root=-1;
 for(let i=0;i<n;i++){
  const parent=poly.parents[i];
  if(parent===-1){if(root!==-1)throw Error('More than one root face');root=i;}
  else if(!Number.isInteger(parent)||parent<0||parent>=n||parent===i)throw Error('Invalid hinge parent');
 }
 if(root<0)throw Error('No hinge root');
 for(let i=0;i<n;i++){
  const history=new Set();let at=i;
  while(at!==-1){if(history.has(at))throw Error('Hinge tree cycle');history.add(at);at=poly.parents[at];}
 }
 return root;
}
/**
 * Fold progress 0 => flat net, 1 => closed polyhedron.
 * Returns one Three.Group with rigid face meshes + actual hinge pivots.
 * This is a STAGED source module: Antigravity must connect it to MATHVERSE rooms.
 */
export function createPolyhedronFold(index,params={}){
 const poly=makePolyhedron(index,params), rootIndex=validateTree(poly), n=poly.faces.length;
 const main=new THREE.Group();main.name=`MATHVERSE-FOLD-${index}`;
 const rootHolder=new THREE.Group();main.add(rootHolder);
 const normal=outwardNormal(poly,rootIndex);
 rootHolder.quaternion.setFromUnitVectors(normal,Z);
 const faceCenter=poly.faces[rootIndex].map(i=>v(poly.vertices[i])).reduce((a,b)=>a.add(b),new THREE.Vector3()).multiplyScalar(1/poly.faces[rootIndex].length);
 rootHolder.position.copy(faceCenter).applyQuaternion(rootHolder.quaternion).multiplyScalar(-1);
 const nodes=Array(n);
 const children=Array.from({length:n},()=>[]);
 for(let i=0;i<n;i++)if(poly.parents[i]>=0)children[poly.parents[i]].push(i);
 function addFace(faceIndex,parentGroup,parentPivot){
  const parent=poly.parents[faceIndex];
  let hinge=null, axis=null, angle=0, pivot=new THREE.Vector3();
  if(parent>=0){
   const [a,b]=sharedEdge(poly,parent,faceIndex);
   const A=v(poly.vertices[a]),B=v(poly.vertices[b]);
   pivot.copy(A);
   axis=B.clone().sub(A).normalize();
   const nParent=outwardNormal(poly,parent),nChild=outwardNormal(poly,faceIndex);
   // Signed rigid rotation that aligns the child face normal with its parent normal.
   angle=Math.atan2(axis.dot(nChild.clone().cross(nParent)),nChild.dot(nParent));
   hinge=[a,b];
  }
  const node=new THREE.Group();node.name=`face-${faceIndex}-hinge-pivot`;
  node.position.copy(pivot).sub(parentPivot);
  parentGroup.add(node);
  const geometry=faceGeometry(poly,faceIndex,pivot);
  const material=new THREE.MeshStandardMaterial({
   color:FACE_COLORS[faceIndex%FACE_COLORS.length],
   side:THREE.DoubleSide,transparent:true,opacity:0.86,roughness:0.76,
   metalness:0.02,depthWrite:true
  });
  const mesh=new THREE.Mesh(geometry,material);mesh.name=`fold-face-${faceIndex}`;
  mesh.userData.foldFaceIndex=faceIndex;
  node.add(mesh);
  const outline=edgeLoop(poly,faceIndex,pivot,0x334155);node.add(outline);
  const foldMark=hinge ? hingeLine(poly,...hinge,pivot):null;
  if(foldMark)node.add(foldMark);
  nodes[faceIndex]={node,pivot,mesh,outline,foldMark,axis,angle,hinge};
  for(const child of children[faceIndex])addFace(child,node,pivot);
 }
 addFace(rootIndex,rootHolder,new THREE.Vector3());
 let progress=0;
 function setProgress(t){
  progress=clamp(t);
  for(const obj of nodes)if(obj.axis)obj.node.quaternion.setFromAxisAngle(obj.axis,(1-progress)*obj.angle);
  main.updateMatrixWorld(true);
  return progress;
 }
 function getWorldFaces(){
  main.updateMatrixWorld(true);
  return nodes.map((obj,i)=>poly.faces[i].map(index=>v(poly.vertices[index]).sub(obj.pivot).applyMatrix4(obj.node.matrixWorld).toArray()));
 }
 function getDiagnostic(){
  const faces=getWorldFaces();
  // For closed shape, shared 3D vertices coincide; for open net, all face coordinates lie on root plane.
  const all=faces.flat();
  const deviation=all.reduce((m,p)=>Math.max(m,Math.abs(p[2])),0);
  let joined=0,maxSharedGap=0;
  if(progress>=1-1e-9){
   const verticesById=new Map();
   for(let i=0;i<faces.length;i++)for(let j=0;j<poly.faces[i].length;j++){
    const key=poly.faces[i][j];if(!verticesById.has(key))verticesById.set(key,[]);
    verticesById.get(key).push(v(faces[i][j]));
   }
   for(const instances of verticesById.values())for(const p of instances)for(const q of instances){
    maxSharedGap=Math.max(maxSharedGap,p.distanceTo(q));joined++;
   }
  }
  return {progress,flatDeviation:deviation,maxSharedGap,vertexComparisons:joined,faces:poly.faces.length};
 }
 function dispose(){
  for(const obj of nodes){obj.mesh.geometry.dispose();obj.mesh.material.dispose();obj.outline.geometry.dispose();obj.outline.material.dispose();if(obj.foldMark){obj.foldMark.geometry.dispose();obj.foldMark.material.dispose();}}
  main.clear();
 }
 setProgress(0);
 return {
  type:'polyhedron',index,group:main,geometry:poly,
  setProgress,unfold:()=>setProgress(0),fold:()=>setProgress(1),
  getProgress:()=>progress,getWorldFaces,getDiagnostic,
  setWireframe(on){for(const obj of nodes)obj.mesh.material.wireframe=Boolean(on);},
  setFacesVisible(on){for(const obj of nodes)obj.mesh.visible=Boolean(on);},
  setEdgesVisible(on){for(const obj of nodes)if(obj.outline)obj.outline.visible=Boolean(on);},
  setXRayMode(on){
   const xray=Boolean(on);
   for(const obj of nodes){
    obj.mesh.material.opacity=xray?0.34:0.86;
    obj.mesh.material.depthWrite=!xray;
    obj.mesh.material.needsUpdate=true;
   }
  },
  setFoldMarkersVisible(on){for(const obj of nodes)if(obj.foldMark)obj.foldMark.visible=Boolean(on);},
  dispose
 };
}
