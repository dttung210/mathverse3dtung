/** Verified visual exhibits for the 63 Grade-6 Lab stations.
 * True 3D meshes for 8 supported physical/solid models; faithful SGK drawings
 * rendered as textures on THREE-dimensional gallery panels for the other 55.
 */
import * as THREE from '../../vendor/three.module.js?v=r107_v15';
import {labById} from '../math6-lab/catalog.js?v=r107_v15';
import {renderModel,W,H} from '../math6-lab/canvas.mjs?v=r107_v15';
import {isTrue3DCapable} from '../math6-lab/math6-taxonomy.mjs?v=r107_v15';
import {makeMath6GalleryPreview, hasReal3DGalleryModel} from './math6-preview-v15.js?v=r107_v15';
const PI=Math.PI;
const material=(hex,extra={})=>new THREE.MeshStandardMaterial({color:hex,roughness:.5,metalness:.06,side:THREE.DoubleSide,...extra});
const add=(parent,geo,mat,xyz=[0,0,0])=>{const m=new THREE.Mesh(geo,mat);m.position.set(...xyz);m.castShadow=true;parent.add(m);return m;};
const cube=(parent,size,pos,color)=>add(parent,new THREE.BoxGeometry(...size),material(color),pos);
const cylinder=(parent,r1,r2,h,pos,color,n=20)=>add(parent,new THREE.CylinderGeometry(r1,r2,h,n),material(color),pos);
function solidPreview(model,group){
 const v=model.variant;
 if(v==='dice'){
  group.userData.solidMotionParts={variant:v};
  const d=cube(group,[1.3,1.3,1.3],[0,1.5,0],'#f2f7f6');d.rotation.set(.22,.42,.1);group.userData.solidMotionParts.die=d;
  for(const [x,y] of [[-.34,.34],[0,0],[.34,-.34]]){
   const dot=add(d,new THREE.SphereGeometry(.10,12,8),new THREE.MeshBasicMaterial({color:0x173b4a}),[x,y,.68]);dot.rotation.copy(d.rotation);
  }
 }else if(v==='cubes'){
  const cubes=[];for(let i=0;i<4;i++)for(let j=0;j<=i;j++)cubes.push(cube(group,[.52,.52,.52],[(i-1.5)*.54,1.05+j*.54,0],(i+j)%2?'#1eb2aa':'#5ca6de'));
  group.userData.solidMotionParts={variant:v,cubes};
 }else if(v==='coin'){
  const coin=cylinder(group,.8,.8,.14,[0,1.8,0],'#eab554',42);coin.rotation.set(.65,.15,.5);
  const rim=add(group,new THREE.TorusGeometry(.84,.052,8,44),material('#ffdf84'),[0,1.8,0]);rim.rotation.copy(coin.rotation);
  group.userData.solidMotionParts={variant:v,coin,rim};
 }else if(v==='spinner'){
  const wheel=cylinder(group,1.0,1.0,.11,[0,1.4,0],'#3fd0c4',48);const wheelSpokes=[];
  for(let i=0;i<6;i++){
   const a=i*PI/3;const spoke=cube(group,[.06,.04,.93],[.44*Math.cos(a),1.50,.44*Math.sin(a)],i%2?'#faf3b7':'#26728c');spoke.rotation.y=-a;wheelSpokes.push(spoke);
  }
  cylinder(group,.07,.07,1.1,[0,.75,0],'#768e9a');
  group.userData.solidMotionParts={variant:v,wheel,spokes:wheelSpokes};
 }else if(v==='ferris'){
  const ferrisSpokes=[],ferrisCabins=[];
  for(const z of [-.22,.22]){
   const ring=add(group,new THREE.TorusGeometry(.89,.065,12,48),material('#21c4bf'),[0,2.15,z]);ring.rotation.y=.05;
   for(let i=0;i<6;i++){const a=i*PI/3;
    const spoke=cylinder(group,.03,.03,.88,[.43*Math.cos(a),2.15+.43*Math.sin(a),z],'#8fdcde',8);spoke.rotation.z=a-PI/2;ferrisSpokes.push({spoke,z,index:i});
   }
  }
  for(const x of [-.43,.43]){
   const leg=cylinder(group,.052,.052,2.1,[x,1.07,0],'#8ba5b3',8);leg.rotation.z=x<0?-.40:.40;
  }
  for(let i=0;i<6;i++){const a=i*PI/3;ferrisCabins.push(cube(group,[.31,.26,.24],[.93*Math.cos(a),2.15+.93*Math.sin(a),0],i%2?'#f7b965':'#62b6db'));}
  group.userData.solidMotionParts={variant:v,spokes:ferrisSpokes,cabins:ferrisCabins};
 }else if(v==='card'){
  const left=cube(group,[.9,1.52,.05],[-.43,1.64,0],'#eca16a');left.rotation.y=-.42;
  const right=cube(group,[.9,1.52,.05],[.43,1.64,0],'#62bdcc');right.rotation.y=.42;
  const hinge=new THREE.Group();group.remove(right);hinge.add(right);group.add(hinge);group.userData.solidMotionParts={variant:v,hinge};
 }else if(v==='roads'){
  cube(group,[2.3,.06,.55],[0,.96,0],'#748896');
  const road=cube(group,[.55,.07,2.3],[0,.98,0],'#4a718a');road.rotation.y=.46;group.userData.solidMotionParts={variant:v,road};
  for(const a of [-.6,-.2,.2,.6])cube(group,[.11,.01,.025],[a,1.02,0],'#f2c56b');
 }else if(v==='room'){
  const desks=[];cube(group,[2.35,.08,2],[0,.93,0],'#c4e6df');
  for(let r=0;r<2;r++)for(let c=0;c<3;c++){
   desks.push(cube(group,[.54,.09,.38],[(c-1)*.67,1.17,(r-.5)*.65],'#c68b55'));
   for(const dx of [-.20,.20])cylinder(group,.03,.03,.26,[(c-1)*.67+dx,1.04,(r-.5)*.65],'#547a87',7);
  }
  group.userData.solidMotionParts={variant:v,desks};
 }else return false;
 group.userData.animateGrade6=progress=>{
   const x=Math.min(1,Math.max(0,Number(progress)||0)),parts=group.userData.solidMotionParts;
   if(!parts)return;
   if(parts.variant==='cubes')parts.cubes.forEach((cube,i)=>{cube.visible=i<Math.max(1,Math.ceil(x*parts.cubes.length));});
   else if(parts.variant==='ferris'){
     for(const s of parts.spokes){const a=s.index*PI/3+x*2*PI;s.spoke.position.set(.43*Math.cos(a),2.15+.43*Math.sin(a),s.z);s.spoke.rotation.z=a-PI/2;}
     parts.cabins.forEach((c,i)=>{const a=i*PI/3+x*2*PI;c.position.set(.93*Math.cos(a),2.15+.93*Math.sin(a),0);});
   }else if(parts.variant==='spinner'){
     parts.wheel.rotation.y=2*PI*x;
     parts.spokes.forEach((spoke,i)=>{const a=i*PI/3+2*PI*x;spoke.position.set(.44*Math.cos(a),1.5,.44*Math.sin(a));spoke.rotation.y=-a;});
   }else if(parts.variant==='coin'){parts.coin.rotation.x=.65+2*PI*x;parts.rim.rotation.x=.65+2*PI*x;}
   else if(parts.variant==='dice')parts.die.rotation.set(.22+2*PI*x,.42+2*PI*x,.1);
   else if(parts.variant==='card')parts.hinge.rotation.y=-PI*.60*x;
   else if(parts.variant==='roads')parts.road.rotation.y=.46+PI*.36*x;
   else if(parts.variant==='room')parts.desks.forEach((desk,i)=>{desk.scale.setScalar(i<Math.ceil(x*parts.desks.length)?1.10:1);});
 };
 return true;
}

function boardPreview(model,group){
 const frame=cube(group,[2.50,1.66,.13],[0,1.7,0],'#e4f4f1');
 cube(group,[.08,.9,.1],[0,.91,-.03],'#517785');
 const pointer=cube(group,[.08,.14,.04],[-1.15,.92,.09],'#1d4ed8');
 let canvasCtx=null,canvasTex=null,canvasState=null,lastStep=-1;
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=312;
  const ctx=canvas.getContext('2d');
  if(ctx){
   ctx.scale(512/W,312/H);
   const state={params:structuredClone(model.defaults),time:0,counts:[],tileFlips:new Set(),selectedDesk:0};
   try{
    renderModel(ctx,model,state);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const bMat=new THREE.MeshBasicMaterial({map:texture,side:THREE.FrontSide});
    const board=add(group,new THREE.PlaneGeometry(2.40,1.46),bMat,[0,1.7,.085]);
    board.name='AUTHENTIC_2D_SGK_ON_3D_PANEL';
    const boardBack=add(group,board.geometry,bMat,[0,1.7,-.085]);
    boardBack.rotation.y=Math.PI;
    canvasCtx=ctx;canvasTex=texture;canvasState=state;
   }catch(e){console.warn('Grade6 preview canvas:',model.id,e.message);}
  }
 }
 group.userData.animateGrade6=progress=>{
  const x=Math.min(1,Math.max(0,Number(progress)||0));
  pointer.position.x=-1.15+2.30*x;
  if(canvasCtx&&canvasTex&&canvasState){
   const step=Math.round(x*24);
   if(step!==lastStep){
    lastStep=step;
    canvasState.time=x*6;
    try{renderModel(canvasCtx,model,canvasState);canvasTex.needsUpdate=true;}catch(_){}
   }
  }
 };
 return true;
}
export function createGrade6Preview(modelId){
 const model=labById(modelId);if(!model)return null;
 const group=new THREE.Group();group.userData.grade6Model=model.id;
 const built=isTrue3DCapable(model.id)&&solidPreview(model,group);
 if(built){group.userData.mathNature='TRUE_3D';}
 else {
  const item={labId:model.id,labEngine:model.engine,labVariant:model.variant,labDefaults:model.defaults,title:model.title};
  if(hasReal3DGalleryModel(item)){
   const diorama=makeMath6GalleryPreview(THREE,item);
   group.add(diorama);
   const meshes=[];
   diorama.traverse(o=>{if(o.isMesh)meshes.push({o,baseY:o.position.y,baseScale:o.scale.x||1});});
   group.userData.animateGrade6=progress=>{
    const x=Math.min(1,Math.max(0,Number(progress)||0));
    meshes.forEach(({o,baseY,baseScale},i)=>{
     if(meshes.length>1&&i===0)return;
     const p=meshes.length===1?(.45+.55*x):Math.min(1,Math.max(0.15,x*meshes.length*0.65-i*0.35));
     o.scale.setScalar(baseScale*(0.72+0.28*p));
     o.position.y=baseY+(1-p)*0.12;
    });
   };
   group.userData.mathNature='SGK_2D_MATH_IN_3D_RELIEF'; // a tangible 3D exhibit; mathematics remains planar
  }else{
   boardPreview(model,group);
   group.userData.mathNature='2D_SGK_EXHIBITION_BOARD';
  }
 }
 group.name='R65_'+model.id;
 return group;
}
