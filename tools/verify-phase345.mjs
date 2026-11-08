/** Phases 3/4/5: offline consistency audit over every new experimental model. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from '../vendor/three.module.js';
import {TYPES,normalizeExhibit,metrics} from '../src/math-core.js';
import {EXPLORATION_MODELS} from '../src/portal-labs/exploration-collection.js';
import {portalExhibits,zonesForGrade} from '../src/portal-labs/portal-registry.js';
import {detectModality} from '../src/data/migrate-v2-v4-v5.js';
import {GEOMETRY_2D_TYPES,buildGeometry2DScene} from '../src/math/geometry2d-scenes.js';
import {createMathModel,disposeObject} from '../src/geometry.js';
import {obliqueSection} from '../src/math/oblique-sections.js';
import {FunctionGraphViewer} from '../src/viewers/FunctionGraphViewer.js';
import {StatisticsChartViewer} from '../src/viewers/StatisticsChartViewer.js';
const die=(msg)=>{throw Error('KIEM TRA R4 KHONG DAT: '+msg);};
const safe=(v)=>Number.isFinite(v)&&!Number.isNaN(v);
const originals={
  'data/catalog.json':'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15',
  'data/models.toan6.json':'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9'
};
for(const [file,digest] of Object.entries(originals)){
  const measured=crypto.createHash('sha256').update(fs.readFileSync(new URL(`../${file}`,import.meta.url))).digest('hex');
  if(measured!==digest)die(`Tep du lieu goc thay doi: ${file}`);
}
if(!globalThis.document){
 globalThis.document={createElement:()=>({width:600,height:400,getContext:()=>new Proxy({measureText:t=>({width:String(t).length*8})},{get:(o,k)=>k in o?o[k]:()=>{}})})};
}
const catalog=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8')).items;
if(catalog.length!==63)die('Khong con du 63 mo hinh goc');
let supplemental=0,paramChecks=0,sceneChecks=0,previewChecks=0,sectionChecks=0,graphChecks=0;
for(let grade=7;grade<=12;grade++)for(const zone of zonesForGrade(grade)){
  for(const x of portalExhibits(catalog,grade,zone.id))if(x.id.startsWith('mv_r4_'))supplemental++;
}
// GD4: retain 31 R4 definitions; hide 4 grade7 + 5 grade8 + 5 grade9 wrong-class/duplicated presets.
if(EXPLORATION_MODELS.length!==31||EXPLORATION_MODELS.filter(x=>x.grade===7).length!==4||supplemental!==0)die(`GĐ7 yêu cầu 0/31 phụ trợ hiển thị ở kho chính, lưu trữ cả 31 định nghĩa, hiện ${supplemental}`);
for(const [index,item] of EXPLORATION_MODELS.entries()){
 const spec=TYPES[item.type];if(!spec)die(`Chua co type ${item.type}`);
 for(let j=0;j<8;j++){
   const p={...item.params};
   for(const [key,[label,low,high,defaultValue]] of Object.entries(spec.params)){
     p[key]=j===0?low:j===1?high:j===2?defaultValue:j===3?item.params?.[key]??defaultValue:low+(high-low)*((index+j*3+key.length*7)%17)/16;
   }
   const model=normalizeExhibit({id:'test-r4-'+index,grade:item.grade,type:item.type,params:p,data:item.data});
   if(detectModality(model.type)!==({plane:'geometry2d',solid:'solid3d',graph:'functiongraph',stats:'statisticschart'})[item.zone])die(`Sai bo xem: ${item.type} / ${item.zone}`);
   for(const number of Object.values(model.params))if(!safe(number))die(`NaN tham so: ${item.type}`);
   const result=metrics(model.type,model.params);
   if(result.some(entry=>typeof entry.value==='number'&&!safe(entry.value)))die(`NaN so do: ${item.type}`);
   paramChecks++;
   if(GEOMETRY_2D_TYPES.includes(model.type)){
     const scene=buildGeometry2DScene(model.type,model.params,model.grade);
     if(!scene.primitives.length)die(`Hinh phang rong: ${item.type}`);
     for(const shape of scene.primitives){
       const pts=[shape.xy,shape.a,shape.b,shape.center,...(shape.pts||[])].filter(Array.isArray);
       if(pts.some(pt=>pt.some(x=>!safe(x))))die(`Toa do NaN: ${item.type}`);
     }
     sceneChecks++;
   }
   if(detectModality(model.type)==='functiongraph'){
     const viewer=new FunctionGraphViewer(model);
     for(const x of [-5,-1,0,.5,2,5]){
       const y=viewer.evaluate(x);
       if(y!==null&&!safe(y))die(`Ham so NaN: ${item.type}`);
     }
     const names=viewer.getMetrics();
     if(!Array.isArray(names)||names.length<1)die(`So do do thi trong: ${item.type}`);
     graphChecks++;
   }
   if(detectModality(model.type)==='statisticschart'){
     const viewer=new StatisticsChartViewer(model);
     if(!Array.isArray(viewer.getMetrics()))die(`So do bieu do trong: ${item.type}`);
   }
   if(j===0||j===1||j===3){
     const object=createMathModel(model,{faces:true,edges:true,labels:false});
     try{
       const bounds=new THREE.Box3().setFromObject(object);
       if(bounds.isEmpty()||!bounds.getSize(new THREE.Vector3()).toArray().every(safe))die(`Preview 3D loi: ${item.type}`);
       previewChecks++;
     }finally{disposeObject(object);}
   }
 }
}
for(const [type,p] of [['cube',{a:4}],['cuboid',{a:5,b:3,h:4}],['squarePyramid',{a:4,h:6}]]){
 for(const percent of [1,5,20,35,50,65,80,95,99])for(const tilt of [-65,-50,-30,0,30,50,65]){
   const s=obliqueSection(type,p,percent,tilt);
   if(!s||!safe(s.area)||!safe(s.perimeter)||s.vertices.length<3)die(`Thiet dien loi: ${type} ${percent}% ${tilt}do`);
   for(const vertex of s.vertices){
     if(!vertex.every(safe))die(`Giao diem NaN: ${type}`);
     const off=vertex.reduce((sum,c,i)=>sum+c*s.normal[i],0);
     if(Math.abs(off-s.offset)>1e-6)die(`Giao diem khong tren mat phang: ${type}`);
   }
   sectionChecks++;
 }
}
console.log('NGHIEM THU R4 - RASOAT TU DONG DAT');
console.log(`Mo hinh mo rong phu hop: ${supplemental}/31 (25 luu tru); mau tham so: ${paramChecks}; luot ve 2D: ${sceneChecks}; mo phong preview 3D: ${previewChecks}; kiem tra do thi: ${graphChecks}; giao mat phang-khoi: ${sectionChecks}`);
console.log('Bảo toàn 2 SHA-256 dữ liệu nguồn; 63 mẫu gốc. Chưa nghiệm thu WebGL/Chrome/Edge trên Windows.');
