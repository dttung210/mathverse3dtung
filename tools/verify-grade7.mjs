/** MATHVERSE Giai doan 2 - Cung mot phep ra soat roi moi chinh sua. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {GRADE7_IDS,grade7Solid,grade7Defaults,grade7Metrics,grade7SolidProperties,grade7Frequency} from '../src/curriculum/grade7-engine.mjs';
import {grade7SVGScene,grade7NetSVG} from '../src/curriculum/grade7-svg.mjs';
import {TRIANGLE_CASE_IDS,makeTrianglePair} from '../src/curriculum/triangle-engine.mjs';
import {EXPLORATION_MODELS} from '../src/portal-labs/exploration-collection.js';
import {portalExhibits,zonesForGrade} from '../src/portal-labs/portal-registry.js';
import {caseRuntimeStatus} from '../src/curriculum/CurriculumExplorer.js';
const root=new URL('../',import.meta.url),file=p=>new URL(p,root);const fail=msg=>{throw Error('GD2 TOAN7: '+msg)};
for(const [path,expected] of Object.entries({
 'data/catalog.json':'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15',
 'data/models.toan6.json':'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9'
})){
 const digest=crypto.createHash('sha256').update(fs.readFileSync(file(path))).digest('hex');
 if(digest!==expected)fail('Tep goc Toan6 da bi thay doi: '+path);
}
const data=JSON.parse(fs.readFileSync(file('data/mathverse-7-12-curated.json'),'utf8'));
const orig=JSON.parse(fs.readFileSync(file('data/catalog.json'),'utf8')).items;
const groups=data.source_registry.filter(x=>x.grade===7),cases=groups.flatMap(x=>x.modes);
if(groups.length!==10||cases.length!==41||new Set(cases.map(c=>c.id)).size!==41)fail('Thieu/nhan doi ca Toan7: 10 phong 41 che do');
if(GRADE7_IDS.length!==34||TRIANGLE_CASE_IDS.filter(id=>id.startsWith('7-')).length!==7)fail('Sai 34 che do moi + 7 tam giac');
let n2d=0,n3d=0,ntri=0;
for(const m of cases){
 if(m.implementation_status!=='VERIFIED_INTERACTIVE_R5'||caseRuntimeStatus(m.id)!=='interactive')fail('Chua hoat dong: '+m.id);
 if(m.id.startsWith('7-04-')){ntri++;if(!makeTrianglePair(m.id).check.passes)fail('Sai tam giac: '+m.id);continue;}
 const p=grade7Defaults(m.id);
 if(grade7Solid(m.id)){n3d++;const sol=grade7SolidProperties(m.id,p);if(!Number.isFinite(sol.volume)||sol.volume<=0||sol.faces<5)fail('Loi 3D: '+m.id);}
 else{n2d++;const a=grade7SVGScene(m.id,p,0,{count:100});const b=grade7SVGScene(m.id,p,2.5,{count:100});if(a===b||/NaN|undefined|Infinity/.test(a+b))fail('Hinh 2D khong chuyen dong: '+m.id);}
 if(!grade7Metrics(m.id,p).length)fail('Thieu so do cua Lab: '+m.id);
}
if(ntri!==7||n2d!==26||n3d!==8)fail(`Ty le hinh khong dung: ${ntri}/${n2d}/${n3d}`);
for(const id of ['7-08-C03','7-09-C03'])if(!grade7NetSVG(id,grade7Defaults(id),.7).includes('<svg'))fail('Thieu hinh khai trien: '+id);
if(Math.abs(grade7Frequency('7-10-C02',10000).relative-.5)>.05)fail('Loi phan phoi xuc xac');
const orig7=orig.filter(x=>x.grade===7);if(orig7.length!==9)fail('Mat hien vat ban dau Toan7');
if(EXPLORATION_MODELS.filter(x=>x.grade===7).length!==4)fail('4 mo hinh mo rong khong con luu');
for(const z of zonesForGrade(7))if(portalExhibits(orig,7,z.id).some(x=>x.id.startsWith('mv_r4_')))fail('Mo hinh ngoai SGK con tren san 7');
for(const needed of ['src/curriculum/Grade7Lab.js','src/curriculum/grade7-engine.mjs','src/curriculum/grade7-svg.mjs','src/qa/toan7-audit.html','src/qa/toan7-audit.js','KIEM_TRA_TOAN_7_GD2.bat','CHAY_UNG_DUNG.bat'])if(!fs.existsSync(file(needed)))fail('Thieu tep: '+needed);
const content=fs.readFileSync(file('src/qa/toan7-audit.html'),'utf8');if(!content.includes('toan7-audit.js'))fail('Khong co giao dien QA');
console.log('TOAN7 GD2: DAT 10 phong | 41/41 che do | 7 tam giac + 26 SVG 2D + 8 WebGL 3D');
console.log('9 hien vat goc duoc bao toan, 4 mo hinh mo rong ngoai pham vi an co chu dich.');
console.log('SHA-256 2 tep du lieu Toan6: khop | Khong thay doi nguon Toan6.');
console.log('Luu y: WebGL Windows va giao dien bao tang phai kiem tra tren may giao vien.');
