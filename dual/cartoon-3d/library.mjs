import * as THREE from '/vendor/three.module.js';
import {createChibiAvatar} from './chibi-avatars.mjs';
import {makeLabExterior,makeMuseumExterior} from './architecture.mjs';
const $=id=>document.getElementById(id);
const catalog=await fetch('./model-catalog.json').then(r=>r.json());
const select=$('asset'),dl=$('download');
for(const item of catalog.assets){const option=new Option(`${item.type==='character'?'👦':item.type==='lab'?'⚗️':'🏛️'} ${item.name}`,item.id);select.add(option);}
const renderer=new THREE.WebGLRenderer({canvas:$('viewer'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x122d49);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0xa4c4df,2));
const sun=new THREE.DirectionalLight(0xffefd7,2.4);sun.position.set(7,10,8);scene.add(sun);
const camera=new THREE.PerspectiveCamera(46,1,.01,1000);
let object=null,rig=null,angle=.6,elevation=.24,zoom=1,clock=new THREE.Clock(),spin=true;
const center=new THREE.Vector3();let radius=4;
function resetView(){angle=.64;elevation=.24;zoom=1;}$('reset-camera').onclick=resetView;
function display(){
 const item=catalog.assets.find(x=>x.id===select.value)||catalog.assets[0];
 if(object){scene.remove(object);if(rig)rig.dispose();else object.traverse(o=>{if(o.isMesh)o.geometry?.dispose?.();});object=null;rig=null;}
 if(item.type==='character'){rig=createChibiAvatar(item.id);object=rig.root;}
 else{const built=item.type==='lab'?makeLabExterior(item.style):makeMuseumExterior(item.style);object=built.group;rig={dispose:built.dispose,update:null};object.position.set(0,0,0);}
 scene.add(object);
 const box=new THREE.Box3().setFromObject(object);box.getCenter(center);const size=box.getSize(new THREE.Vector3());radius=Math.max(1,Math.max(size.x,size.y,size.z)*1.35);
 dl.href='./'+item.file;dl.download=item.id+'.glb';$('detail').innerHTML=`<strong>${item.name}</strong><p>Định dạng: GLB · Mô hình 3D thực · Có trong bộ cài · Xem được offline sau khi khởi chạy MATHVERSE.</p><p>Nhóm: ${item.type==='character'?'Nhân vật Chibi 3D':item.type==='lab'?'Kiến trúc phòng LAB':'Kiến trúc bảo tàng'}</p>`;
 resetView();
}
select.addEventListener('change',display);display();
let drag=null;
$('viewer').addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];spin=false;$('viewer').setPointerCapture(e.pointerId);});
$('viewer').addEventListener('pointermove',e=>{if(!drag)return;angle+=(e.clientX-drag[0])*.007;elevation=THREE.MathUtils.clamp(elevation+(e.clientY-drag[1])*.005,-.6,1.2);drag=[e.clientX,e.clientY];});
$('viewer').addEventListener('pointerup',()=>drag=null);
$('viewer').addEventListener('wheel',e=>{e.preventDefault();zoom=THREE.MathUtils.clamp(zoom*Math.exp(e.deltaY*.001),.55,2.4);},{passive:false});
function tick(){requestAnimationFrame(tick);const dt=Math.min(.05,clock.getDelta());if(spin)angle+=dt*.21;
 if(rig?.update)rig.update(dt,.22,Math.sin(angle)*.05,0);
 const w=$('viewer').clientWidth,h=$('viewer').clientHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(h,1);camera.updateProjectionMatrix();
 const d=radius*zoom;camera.position.set(center.x+Math.sin(angle)*d*Math.cos(elevation),center.y+d*.22+Math.sin(elevation)*d*.52,center.z+Math.cos(angle)*d*Math.cos(elevation));
 camera.lookAt(center);renderer.render(scene,camera);
}tick();
