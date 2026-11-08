/** Giai doan 7 / Toan 12: independent source, geometry, catalogue, animation and packaging gate. */
import fs from 'node:fs';import crypto from 'node:crypto';
import * as THREE from '../vendor/three.module.js';
import {createMathModel,disposeObject} from '../src/geometry.js';
import {GRADE12_CUSTOM_IDS,grade12Defaults,grade12Valid,grade12Math,grade12SolidModel,grade12AnimatedParams,grade12Is3D} from '../src/curriculum/grade12-engine.mjs';
import {grade12SceneSVG} from '../src/curriculum/grade12-svg.mjs';
import {isGraphCase,graphDefaults,graphExperiment} from '../src/curriculum/graph-models.mjs';
import {caseRuntimeStatus} from '../src/curriculum/CurriculumExplorer.js';
import {portalExhibits,zonesForGrade} from '../src/portal-labs/portal-registry.js';
const dir=new URL('../',import.meta.url),raw=file=>fs.readFileSync(new URL(file,dir));
const fail=s=>{throw new Error('[GD7 TOAN12] '+s)};
if(!globalThis.document)globalThis.document={createElement:()=>({width:128,height:128,getContext:()=>new Proxy({measureText:s=>({width:String(s).length*8})},{get:(o,k)=>k in o?o[k]:()=>{}})})};
const hashes={'data/catalog.json':'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15','data/models.toan6.json':'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9'};
for(const [f,h] of Object.entries(hashes))if(crypto.createHash('sha256').update(raw(f)).digest('hex')!==h)fail('Thay doi du lieu nguon: '+f);
const d=JSON.parse(raw('data/mathverse-7-12-curated.json')),cat=JSON.parse(raw('data/catalog.json')).items,families=d.source_registry.filter(f=>f.grade===12),modes=families.flatMap(f=>f.modes);
if(d.families!==67||d.modes_total!==247||d.by_grade['12']!==39||families.length!==11||modes.length!==39)fail('Danh muc khong dung 67/247/11/39');
let two=0,three=0,graphs=0;const ids=new Set();
for(const m of modes){const id=m.id;if(ids.has(id)||caseRuntimeStatus(id)!=='interactive')fail('ID trung/khong tuong tac: '+id);ids.add(id);
 if(isGraphCase(id)){graphs++;const g=graphExperiment(id,graphDefaults(id));if(!g.series.length||!g.latex||!g.summary)fail('Do thi: '+id);for(const s of g.series){if(!Number.isFinite(s.evaluate(id==='12-06-C03'?.5:1.5)))fail('Do thi khong huu han: '+id);}continue;}
 const p=grade12Defaults(id);if(!grade12Valid(id,p)||!grade12Math(id,p).latex)fail('Toan hoc: '+id);
 if(grade12Is3D(id)){three++;const model=grade12SolidModel(id,p),group=createMathModel(model,{labels:false,faces:true,edges:true});try{let meshes=0;group.traverse(o=>{if(o.isMesh)meshes++});const b=new THREE.Box3().setFromObject(group);if(!meshes||b.isEmpty())fail('Khong co khoi 3D: '+id);}finally{disposeObject(group)}
  if(JSON.stringify(grade12SolidModel(id,p,0).params)===JSON.stringify(grade12SolidModel(id,p,2.2).params))fail('Khoi 3D khong thay doi: '+id);
  if(!grade12Valid(id,grade12AnimatedParams(id,p,2.2)))fail('Tham so hoat canh 3D sai: '+id);
 }else{two++;const a=grade12SceneSVG(id,p,0),b=grade12SceneSVG(id,p,2.2);if(a===b||!a.startsWith('<svg')||/NaN|Infinity|undefined/.test(a+b))fail('SVG khong co hoat canh: '+id);}
}
if(two!==10||three!==19||graphs!==10||GRADE12_CUSTOM_IDS.length!==29)fail('Sai 10 SVG + 19 3D + 10 do thi');
if(cat.length!==63||cat.filter(x=>x.grade===12).length!==9)fail('Thay doi 63 nguon/9 hien vat Toan12');
if(cat.filter(x=>x.grade===12&&['revolvedSolid','oxyzSphere'].includes(x.type)).length!==2)fail('Sai phan loai khoi co the tich');
for(const z of zonesForGrade(12))if(portalExhibits(cat,12,z.id).some(x=>x.id.startsWith('mv_r4_')))fail('Mo hinh trung lap con hien thi');
for(const id of ['12-04-C04','12-08-C04','12-09-C04','12-11-C04'])if(!ids.has(id))fail('Thieu truong hop SGK '+id);
for(const file of ['src/curriculum/grade12-engine.mjs','src/curriculum/grade12-svg.mjs','src/curriculum/Grade12Lab.js','src/qa/toan12-audit.html','src/qa/toan12-audit.js','src/qa/toan12-hienvat.html','src/qa/toan12-hienvat.js','KIEM_TRA_TOAN_12_GD7.bat','BANG_KIEM_39_LAB_TOAN12_GD7.csv','BANG_KIEM_9_HIEN_VAT_TOAN12_GD7.csv','BAO_CAO_GD7_TOAN12_LOI_VA_NGHIEM_THU.md'])if(!fs.existsSync(new URL(file,dir)))fail('Thieu tep trong bo cai: '+file);
for(const [file,phrases] of [['src/qa/toan12-audit.js',['f.grade===12','items.length!==39','TOAN12.csv']],['src/qa/toan12-hienvat.js',['Number(x.grade)===12','TOAN12.csv']]]){const src=raw(file).toString();for(const q of phrases)if(!src.includes(q))fail('Trang nghiem thu chua dung Toan12: '+q);}
console.log('MATHVERSE GD7 TOAN 12 VERIFIED: 11 Lab groups, 39 modes (10 SVG, 10 graphs, 19 real Three.js 3D).');
console.log('Original: 63 exhibits unchanged; Grade12: 9 originals (2 volumetric), 6 duplicate extensions hidden.');
console.log('Source SHA-256 passed; real GPU/Windows WebGL remains a separate manual acceptance test.');
