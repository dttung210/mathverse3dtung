/** Accessible garden boulevard, information junctions and plazas on the ORIGINAL Grand Campus scene. */
import * as THREE from '/mathverse3dtung/vendor/three.module.js?v=r107_v15';
import {CAMPUS_MASTERPLAN as MAP} from './campus-masterplan.mjs?v=r107_v15';
const mat=(hex)=>new THREE.MeshStandardMaterial({color:hex,roughness:.8,metalness:.06});
const cobble=mat(0xfffdf7),edge=mat(0xfacc15),turf=mat(0x34d399),wood=mat(0x885b38),teal=mat(0x0c4a6e),gold=mat(0xfde047);
function box(group,w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);group.add(o);return o;}
function sphere(group,r,m,x,y,z){const o=new THREE.Mesh(new THREE.SphereGeometry(r,12,8),m);o.position.set(x,y,z);group.add(o);return o;}
function disk(group,r,m,x,z,y=.1){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.13,40),m);o.position.set(x,y,z);group.add(o);return o;}
function strip(group,a,b,width,m,y=.09){const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);const o=box(group,width,.075,length,m,(a[0]+b[0])/2,y,(a[1]+b[1])/2);o.rotation.y=Math.atan2(dx,dz);return o;}
function tree(g,x,z,scale=1){box(g,.32*scale,2.7*scale,.32*scale,wood,x,1.35*scale,z);const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1.35*scale,1),turf);crown.position.set(x,3.35*scale,z);g.add(crown);}
function pillar(g,x,z,h=3.5){box(g,.22,h,.22,teal,x,h/2,z);sphere(g,.32,gold,x,h+.3,z);}
function billboard(g,text,x,z,theta=0){
 const cvs=typeof document==='undefined'?null:document.createElement('canvas');if(!cvs)return;
 cvs.width=1280;cvs.height=256;
 const ctx=cvs.getContext('2d');
 if(ctx){
  if('imageSmoothingQuality' in ctx)ctx.imageSmoothingQuality='high';
  ctx.fillStyle='#183f5d';ctx.fillRect(0,0,1280,256);
  ctx.strokeStyle='#f7d28a';ctx.lineWidth=14;ctx.strokeRect(8,8,1264,240);
  ctx.font='900 74px "Segoe UI",Arial,sans-serif';ctx.fillStyle='#fff9d9';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(text,640,128);
 }
 const tex=new THREE.CanvasTexture(cvs);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;
 const pMat=new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.FrontSide});
 const panel=new THREE.Mesh(new THREE.PlaneGeometry(9.5,1.9),pMat);
 const panelBack=new THREE.Mesh(panel.geometry,pMat);panelBack.rotation.y=Math.PI;panelBack.position.z=-0.012;panel.add(panelBack);
 panel.position.set(x,4.2,z);panel.rotation.y=theta;g.add(panel);
 // Architectural bronze stanchions & sa thạch plinth
 box(g,.38,3.2,.38,wood,x-3.8*Math.cos(theta),1.6,z+3.8*Math.sin(theta));
 box(g,.38,3.2,.38,wood,x+3.8*Math.cos(theta),1.6,z-3.8*Math.sin(theta));
 box(g,8.8,.28,.6,edge,x,.14,z);
}
export function createCampusRoutes(){
 const g=new THREE.Group();g.name='CAMPUS_V4_COMMON_HALL_DIRECT_OPPOSITE_PARK_AVENUE';
 const route=MAP.boulevard;
 // R107: Cầu Xuyên Tâm Hướng Nam (từ Đảo Trung Tâm GRAND DOME tới Đảo Nam WONDER PARK, không có dải cỏ chữ nhật thừa)
 strip(g,[0,42],[0,74],10.4,edge,.045);
 strip(g,[0,42],[0,74],8.8,cobble,.082);
 strip(g,[0,42],[0,74],1.2,edge,.095);
 g.userData.masterplan='V4-LAB-MUSEUM-DIRECT-HALL-PARK-OPPOSITE';
 return {group:g,route};
}
