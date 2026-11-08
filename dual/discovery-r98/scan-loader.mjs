/** Photo-textured scan GLB loader (Offline Three.js r161 GLTFLoader). No procedural UNESCO fallback is permitted. */
import * as THREE from '/vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.mjs';
import { optimizeLoadedGLBSceneV12 } from '../../src/graphics-r74/depth-pipeline-v12.mjs';
let loaderInstance = null;
export async function scanLoader(){
 if(!loaderInstance)loaderInstance=new GLTFLoader();
 return loaderInstance;
}
export async function loadR98Scan(url){
 const loader=await scanLoader();
 const gltf=await loader.loadAsync(url);
 let triangles=0;
 gltf.scene.traverse(x=>{
  if(x.isMesh){const g=x.geometry;const count=g.index?g.index.count:g.attributes.position?.count||0;triangles+=Math.floor(count/3);}
 });
 if(triangles<10000)throw Error('Mô hình sau giải mã có ít hơn 10.000 tam giác; cần kiểm tra lại GLB.');
 return gltf.scene;
}
export function fitR98Scan(group,model,maxSize=7.5){
 const box=new THREE.Box3().setFromObject(model);const size=box.getSize(new THREE.Vector3());
 if(!Number.isFinite(size.x+size.y+size.z)||size.length()<1e-6)throw Error('Model thiếu kích thước hợp lệ');
 const scale=maxSize/Math.max(size.x,size.y,size.z);
 model.scale.multiplyScalar(scale);model.updateMatrixWorld(true);
 const ref=new THREE.Box3().setFromObject(model),center=ref.getCenter(new THREE.Vector3());
 model.position.sub(center);model.position.y+=ref.getSize(new THREE.Vector3()).y/2;
 optimizeLoadedGLBSceneV12(model,{deduplicateMaterials:true,frustumCulled:true,castShadow:true,receiveShadow:true});
 group.add(model);return model;
}
