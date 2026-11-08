/** Giai doan 2: systematic real geometry test without a browser/GPU. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from '../vendor/three.module.js';
import {TYPES,normalizeExhibit,metrics} from '../src/math-core.js';
import {GEOMETRY_2D_TYPES,buildGeometry2DScene} from '../src/math/geometry2d-scenes.js';
import {Geometry2DViewer} from '../src/viewers/Geometry2DViewer.js';
import {createMathModel,disposeObject} from '../src/geometry.js';
import {grade6Labs} from '../src/portal-labs/grade6-v15.js';
import {makeMath6GalleryPreview} from '../src/museum/math6-preview-v15.js';
import {mathStats} from '../src/math6-lab/math.mjs';
import {renderModel} from '../src/math6-lab/canvas.mjs';
const fail=message=>{throw new Error(`GIAI DOAN 2 CHUA DAT: ${message}`)};
const original={
 'data/catalog.json':'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15',
 'data/models.toan6.json':'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9'
};
for(const [name,digest] of Object.entries(original)){
  const actual=crypto.createHash('sha256').update(fs.readFileSync(new URL(`../${name}`,import.meta.url))).digest('hex');
  if(actual!==digest)fail(`Du lieu nguon bi thay doi: ${name}`);
}
const records=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url),'utf8')).items;
if(records.length!==63)fail('Kho goc khong con 63 mo hinh');
if(!globalThis.document){
  globalThis.document={createElement(tag){if(tag!=='canvas')return {};
    return {width:0,height:0,getContext(){return new Proxy({measureText:text=>({width:String(text).length*9})},{get:(obj,key)=>key in obj?obj[key]:()=>{}});}};
  }};
}
const makeCanvas=()=>new Proxy({canvas:{width:920,height:560},measureText:text=>({width:String(text).length*11})},
  {get:(obj,key)=>key in obj?obj[key]:()=>{}});
let sampled=0,groups=0;
for(const m of records){
  for(let i=0;i<12;i++){
    const params={};
    for(const [key,[,lo,hi,def]] of Object.entries(TYPES[m.type].params)){
      params[key]=i===0?lo:i===1?hi:i===2?def:lo+(hi-lo)*((i*5+key.length*3)%13)/12;
    }
    const model=normalizeExhibit({...m,params});
    const entries=metrics(model.type,model.params);
    if(entries.some(x=>typeof x.value==='number'&&!Number.isFinite(x.value)))fail(`Chi so NaN: ${m.type}/${i}`);
    if(GEOMETRY_2D_TYPES.includes(model.type)){
      for(const primitives of [buildGeometry2DScene(model.type,model.params,model.grade).primitives,
        new Geometry2DViewer(model)._getScene().primitives]){
        if(!primitives.length)fail(`Hinh phang khong co net ve: ${m.type}`);
        for(const item of primitives){
          for(const point of [item.xy,item.center,item.a,item.b,...(item.pts||[])]){
            if(Array.isArray(point)&&point.some(x=>!Number.isFinite(x)))fail(`Toa do loi: ${m.type}`);
          }
        }
      }
    }
    sampled++;
  }
  // The three extreme 3D constructions per catalog model are instantiated and disposed.
  for(const position of [3,1,2]){
    const params=Object.fromEntries(Object.entries(TYPES[m.type].params).map(([key,s])=>[key,s[position]]));
    const valid=normalizeExhibit({...m,params});
    const object=createMathModel(valid,{faces:true,edges:true,labels:true});
    try{
      const bounds=new THREE.Box3().setFromObject(object),size=bounds.getSize(new THREE.Vector3());
      if(bounds.isEmpty()||size.toArray().some(v=>!Number.isFinite(v)))fail(`Hinh 3D trong hoac NaN: ${m.type}`);
      groups++;
    }finally{disposeObject(object);}
  }
}
const curated=['plane','symmetry','number','data'].flatMap(grade6Labs);
if(curated.length!==35)fail('Mat danh muc 35 hien vat Toan 6');
for(const lab of curated){
  const item={title:lab.title,labId:lab.id,labEngine:lab.engine,labVariant:lab.variant,labDefaults:lab.defaults};
  const object=makeMath6GalleryPreview(THREE,item);
  try{
    object.userData.animate?.(1.25);
    const bounds=new THREE.Box3().setFromObject(object);
    if(bounds.isEmpty()||!object.userData.gallery3D)fail(`Hien vat 3D Toan 6 loi: ${lab.id}`);
    const state={params:structuredClone(lab.defaults),counts:[],tileFlips:new Set(),time:1};
    renderModel(makeCanvas(),lab,state);
    if(typeof mathStats(lab,state)!=='string')fail(`Thong so Math6 loi: ${lab.id}`);
  }finally{disposeObject(object);}
}
console.log(`GIAI DOAN 2 DAT: ${sampled} cau hinh tham so cua 63 mo hinh, ${groups} lan tao 3D, 35 hien vat Toan 6 + mo phong va so lieu. Doi chieu 2 SHA-256 du lieu goc OK.`);
console.log('CAN NGHIEM THU RIENG: tuong tac chuot, CSS, Canvas va WebGL tren Chrome/Edge cua may nguoi dung.');
