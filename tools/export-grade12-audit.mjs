import fs from 'node:fs';import * as THREE from '../vendor/three.module.js';
import {createMathModel,disposeObject} from '../src/geometry.js';
import {GRADE12_CUSTOM_IDS,grade12Defaults,grade12Valid,grade12Math,grade12SolidModel,grade12AnimatedParams,grade12Is3D} from '../src/curriculum/grade12-engine.mjs';
import {grade12SceneSVG} from '../src/curriculum/grade12-svg.mjs';
import {isGraphCase,graphDefaults,graphExperiment,graphParamSchema} from '../src/curriculum/graph-models.mjs';
const dir=new URL('../',import.meta.url),read=f=>JSON.parse(fs.readFileSync(new URL(f,dir),'utf8'));
const items=read('data/mathverse-7-12-curated.json').source_registry.filter(f=>f.grade===12).flatMap(f=>f.modes.map(x=>({...x,source:f.source_evidence,family:f.id}))),exhibits=read('data/catalog.json').items.filter(x=>x.grade===12);
if(!globalThis.document)globalThis.document={createElement:()=>({width:128,height:128,getContext:()=>new Proxy({measureText:s=>({width:String(s).length*8})},{get:(o,k)=>k in o?o[k]:()=>{}})})};
const csv=(cols,rows)=>'\ufeff'+[cols,...rows].map(row=>row.map(x=>'"'+String(x??'').replaceAll('"','""')+'"').join(',')).join('\r\n');
const checkMesh=m=>{const g=createMathModel(m,{faces:true,edges:true,labels:false});try{let meshes=0;g.traverse(x=>{if(x.isMesh)meshes++});return meshes>0&&!new THREE.Box3().setFromObject(g).isEmpty()}finally{disposeObject(g)}};
const labRows=[],result={};for(const m of items){const id=m.id,type=isGraphCase(id)?'DO_THI_2D':grade12Is3D(id)?'WEBGL_3D':'SVG_2D';let math=false,animate=false,shape=false;
 if(type==='DO_THI_2D'){const p=graphDefaults(id),r=graphExperiment(id,p);math=!!(r.latex&&r.series.length);const schema=graphParamSchema(id);const k=schema[0],b={...p,[k.key]:p[k.key]+k.step};const r2=graphExperiment(id,b);animate=JSON.stringify({...r,series:[]})!==JSON.stringify({...r2,series:[]}) || r.series[0]?.evaluate(1.27)!==r2.series[0]?.evaluate(1.27);shape=math;}
 else {const p=grade12Defaults(id);math=grade12Valid(id,p)&&grade12Math(id,p).values.length>0;if(type==='WEBGL_3D'){shape=checkMesh(grade12SolidModel(id,p));animate=JSON.stringify(grade12SolidModel(id,p,0).params)!==JSON.stringify(grade12SolidModel(id,p,2.2).params)&&grade12Valid(id,grade12AnimatedParams(id,p,2.2));}else{const a=grade12SceneSVG(id,p,0),b=grade12SceneSVG(id,p,2.2);shape=a.startsWith('<svg')&&a.includes('<');animate=a!==b&&!/NaN|undefined|Infinity/.test(a+b);}}
 result[id]={type,math,animate,shape};if(!(math&&animate&&shape))throw Error(`Mô hình chưa đạt bộ kiểm tra ${id}: `+JSON.stringify(result[id]));
 labRows.push([m.family,id,m.name,type,m.display_status,m.source,math?'DAT':'LOI',animate?'DAT':'LOI',shape?'DAT':'LOI','CHUA_XAC_NHAN','CHUA_XAC_NHAN','Đã chạy kiểm thử thuật toán; Phát/kéo chuột/độ rõ và WebGL cần xác nhận thêm trên Windows']);
}
fs.writeFileSync(new URL('BANG_KIEM_39_LAB_TOAN12_GD7.csv',dir),csv(['Phong','ID','Ten che do','Loai','Phan loai','Doi chieu SGK','Phep tinh','Khung hinh dong','Dung hinh 2D hoac mesh 3D','Thao tac UI tren Windows','GPU Windows','Ghi chu'],labRows));
const exhibitRows=[];for(const e of exhibits){const mesh=checkMesh(e),solid=['revolvedSolid','oxyzSphere'].includes(e.type);if(!mesh)throw Error('Khong co mesh '+e.id);exhibitRows.push([e.id,e.title,e.type,solid?'KHOI_CO_THE_TICH':'DUONG_CONG_DUONG_MAT_OXYZ',mesh?'DAT':'LOI','CHUA_XAC_NHAN','CHUA_XAC_NHAN',e.description||'']);}
fs.writeFileSync(new URL('BANG_KIEM_9_HIEN_VAT_TOAN12_GD7.csv',dir),csv(['ID','Ten hien vat','Kieu mo hinh','Ban chat 3D','Mesh Three.js','Xoay GPU Windows','Do ro Windows','Mo ta'],exhibitRows));
fs.writeFileSync(new URL('KIEM_THU_TOAN12_MAY.json',dir),JSON.stringify({generated:'2026-10-27',modes:39,breakdown:{svg:10,graph:10,webgl:19},exhibits:9,results:result,windows_webgl:'NOT_VERIFIED'},null,2));
console.log('Grade12 audit CSV exported:',labRows.length,'labs;',exhibitRows.length,'exhibits.');
