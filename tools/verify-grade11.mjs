/** Grade11 release gate: preserve immutable source, verify every case family and 3D geometry. */
import fs from 'node:fs';import crypto from 'node:crypto';
import * as THREE from '../vendor/three.module.js';
import {createMathModel,disposeObject} from '../src/geometry.js';
import {GRADE11_CUSTOM_IDS,grade11Defaults,grade11Valid,grade11Math,grade11SolidModel,grade11Is3D} from '../src/curriculum/grade11-engine.mjs';
import {grade11SceneSVG} from '../src/curriculum/grade11-svg.mjs';
import {isGraphCase,graphDefaults,graphExperiment} from '../src/curriculum/graph-models.mjs';
import {caseRuntimeStatus} from '../src/curriculum/CurriculumExplorer.js';
import {portalExhibits,zonesForGrade} from '../src/portal-labs/portal-registry.js';
if(!globalThis.document)globalThis.document={createElement:()=>({width:128,height:128,getContext:()=>new Proxy({measureText:s=>({width:String(s).length*8})},{get:(o,k)=>k in o?o[k]:()=>{}})})};
const base=new URL('../',import.meta.url),read=f=>fs.readFileSync(new URL(f,base));
const fail=s=>{throw Error('MATHVERSE GD6 TOAN11: '+s)};
for(const [f,hash] of Object.entries({'data/catalog.json':'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15','data/models.toan6.json':'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9'}))if(crypto.createHash('sha256').update(read(f)).digest('hex')!==hash)fail('Immutable Math6 source changed '+f);
const data=JSON.parse(read('data/mathverse-7-12-curated.json')),catalog=JSON.parse(read('data/catalog.json')).items,families=data.source_registry.filter(f=>f.grade===11),modes=families.flatMap(f=>f.modes);
if(data.families!==67||data.modes_total!==247||data.by_grade['11']!==46||families.length!==13||modes.length!==46||new Set(modes.map(m=>m.id)).size!==46)fail('Incorrect 13 rooms / 46 modes');
let n2=0,n3=0,ng=0;
for(const m of modes){const id=m.id;if(caseRuntimeStatus(id)!=='interactive')fail('Pending case '+id);
 if(isGraphCase(id)){ng++;const g=graphExperiment(id,graphDefaults(id));if(!g.series.length||!g.latex)fail('Graph '+id);}
 else{const p=grade11Defaults(id);if(!grade11Valid(id,p)||!grade11Math(id,p).values.length)fail('Math '+id);
  if(grade11Is3D(id)){n3++;const group=createMathModel(grade11SolidModel(id,p),{labels:false,faces:true,edges:true});try{let meshes=0;group.traverse(o=>{if(o.isMesh)meshes++});if(!meshes||new THREE.Box3().setFromObject(group).isEmpty())fail('No Three.js mesh '+id);}finally{disposeObject(group)}}
  else{n2++;const a=grade11SceneSVG(id,p,0),b=grade11SceneSVG(id,p,2);if(!a.startsWith('<svg')||a===b||/NaN|Infinity|undefined/.test(a+b))fail('SVG or motion '+id);}
 }
}
if(n2!==18||n3!==17||ng!==11||GRADE11_CUSTOM_IDS.length!==35)fail(`Required 18 SVG / 17 WebGL / 11 graphs, actual ${n2}/${n3}/${ng}`);
const grade11=catalog.filter(x=>x.grade===11);if(grade11.length!==9||catalog.length!==63||grade11.filter(x=>x.type==='frustumPyramid').length!==1)fail('9 original exhibits changed');
for(const z of zonesForGrade(11))if(portalExhibits(catalog,11,z.id).some(x=>x.id.startsWith('mv_r4_')))fail('Duplicate supplement displayed '+z.id);
for(const file of ['src/curriculum/grade11-engine.mjs','src/curriculum/grade11-svg.mjs','src/curriculum/Grade11Lab.js','src/qa/toan11-audit.html','src/qa/toan11-audit.js','src/qa/toan11-hienvat.html','src/qa/toan11-hienvat.js','KIEM_TRA_TOAN_11_GD6.bat','BANG_KIEM_46_LAB_TOAN11_GD6.csv','BANG_KIEM_9_HIEN_VAT_TOAN11_GD6.csv','BAO_CAO_GD6_TOAN11_LOI_VA_NGHIEM_THU.md'])if(!fs.existsSync(new URL(file,base)))fail('Missing file '+file);
console.log('GRADE11 VERIFIED: 13 rooms, 46 modes, 18 SVG, 17 real Three.js world-spatial modes, 11 graphs.');
console.log('9 original 3D-space exhibits, including 1 volumetric frustum; sources Math6 immutable.');
console.log('Windows GPU and integrated WebGL display must be manually accepted.');
