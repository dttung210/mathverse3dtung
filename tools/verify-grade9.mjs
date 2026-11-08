/** GD4 validation: 46 curated cases; 9 original gallery items; no claim of Windows GPU acceptance. */
import fs from 'node:fs';import crypto from 'node:crypto';
import {GRADE9_IDS,grade9Solid,grade9Defaults,grade9Math,grade9Valid,grade9SolidModel} from '../src/curriculum/grade9-engine.mjs';
import {grade9SceneSVG,grade9NetSVG} from '../src/curriculum/grade9-svg.mjs';
import {isGraphCase,graphDefaults,graphExperiment} from '../src/curriculum/graph-models.mjs';
import {CIRCLE_POSITION_IDS,isCirclePosition,circleDefaults,circleExpected,lineCircleGeometry,twoCircleGeometry} from '../src/curriculum/circle-positions.mjs';
import {caseRuntimeStatus} from '../src/curriculum/CurriculumExplorer.js';
import {EXPLORATION_MODELS} from '../src/portal-labs/exploration-collection.js';
import {portalExhibits,zonesForGrade} from '../src/portal-labs/portal-registry.js';
const base=new URL('../',import.meta.url),read=x=>fs.readFileSync(new URL(x,base));const fail=s=>{throw Error('TOAN9 GD4: '+s)};
for(const [f,sha] of Object.entries({'data/catalog.json':'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15','data/models.toan6.json':'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9'}))if(crypto.createHash('sha256').update(read(f)).digest('hex')!==sha)fail('Changed immutable source: '+f);
const data=JSON.parse(read('data/mathverse-7-12-curated.json')),catalog=JSON.parse(read('data/catalog.json')).items,rooms=data.source_registry.filter(f=>f.grade===9),modes=rooms.flatMap(f=>f.modes);
if(data.families!==67||data.modes_total!==247||rooms.length!==13||modes.length!==46||new Set(modes.map(m=>m.id)).size!==46)fail('Expected 67 rooms, 247 modes, 13/46 Grade9');
let n2=0,n3=0,ng=0,nc=0;
for(const m of modes){if(caseRuntimeStatus(m.id)!=='interactive')fail('Not interactive: '+m.id);const id=m.id;
 if(isCirclePosition(id)){nc++;const p=circleDefaults(id),state=id<='9-06-C03'?lineCircleGeometry(p.r,p.d).state:twoCircleGeometry(p.R,p.r,p.d).state;if(!circleExpected(id,state))fail('Circle math: '+id);}
 else if(isGraphCase(id)){ng++;const out=graphExperiment(id,graphDefaults(id));if(!out.series.length||!out.latex)fail('Graph missing: '+id);}
 else {const p=grade9Defaults(id);if(!grade9Valid(id,p)||!grade9Math(id,p).values.length)fail('Invalid math: '+id);
  if(grade9Solid(id)){n3++;const model=grade9SolidModel(id,p);if(!['sphere','sphereSection','cylinder','cone'].includes(model.type)||!grade9NetSVG(id,p).includes('<svg'))fail('Missing 3D model: '+id);}
  else{n2++;const s=grade9SceneSVG(id,p,0),t=grade9SceneSVG(id,p,2.7);if(s===t||/NaN|Infinity|undefined/.test(s+t))fail('Motion/SVG missing: '+id);}
 }
}
if(n2!==23||n3!==9||ng!==8||nc!==6)fail(`Categories 23/9/8/6, got ${n2}/${n3}/${ng}/${nc}`);
if(catalog.filter(x=>x.grade===9).length!==9||catalog.length!==63)fail('Missing Grade9 originals');
if(EXPLORATION_MODELS.filter(x=>x.grade===9).length!==5)fail('Missing archived R4 models');
for(const zone of zonesForGrade(9))if(portalExhibits(catalog,9,zone.id).some(x=>x.id.startsWith('mv_r4_')))fail('Inappropriate R4 model still displayed: '+zone.id);
for(const name of ['src/qa/toan9-audit.html','src/qa/toan9-audit.js','src/qa/toan9-hienvat.html','src/qa/toan9-hienvat.js','src/curriculum/Grade9Lab.js','src/curriculum/grade9-svg.mjs','KIEM_TRA_TOAN_9_GD4.bat'])if(!fs.existsSync(new URL(name,base)))fail('Missing file '+name);
console.log('GD4 TOAN9: 13 phòng, 46 chế độ, 23 SVG, 9 khối Three.js, 8 đồ thị, 6 vị trí đường tròn.');
console.log('9 hiện vật nguồn và hai SHA-256 Math6 bảo toàn; 5 mô hình R4 lớp9 ẩn an toàn.');
console.log('Chưa chứng nhận WebGL GPU hoặc UX toàn bảo tàng trên Windows.');
