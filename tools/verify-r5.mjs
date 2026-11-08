import fs from 'node:fs';
import crypto from 'node:crypto';
import {TRIANGLE_CASE_IDS,makeTrianglePair} from '../src/curriculum/triangle-engine.mjs';
import {CIRCLE_POSITION_IDS,circleDefaults,circleExpected,lineCircleGeometry,twoCircleGeometry} from '../src/curriculum/circle-positions.mjs';
import {isGraphCase,graphExperiment,graphDefaults} from '../src/curriculum/graph-models.mjs';
const root=new URL('../',import.meta.url),r=relative=>new URL(relative,root);
const sourceHashes={'data/catalog.json':'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15','data/models.toan6.json':'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9'};
for(const [name,want] of Object.entries(sourceHashes)){
 const got=crypto.createHash('sha256').update(fs.readFileSync(r(name))).digest('hex');if(got!==want)throw Error('Mất tính toàn vẹn tệp gốc: '+name);
}
const d=JSON.parse(fs.readFileSync(r('data/mathverse-7-12-curated.json'),'utf8'));
const modes=d.source_registry.flatMap(x=>x.modes);
if(d.source_registry.length!==67||modes.length!==247||new Set(modes.map(x=>x.id)).size!==247)throw Error('Sai danh mục 67/247');
const implemented=modes.filter(m=>m.implementation_status==='VERIFIED_INTERACTIVE_R5');
if(implemented.length!==113)throw Error(`Cần đủ 113 chế độ tương tác sau GĐ3, hiện có ${implemented.length}`);
for(const id of TRIANGLE_CASE_IDS)if(!makeTrianglePair(id).check.passes||makeTrianglePair(id,undefined,{perturb:true}).check.passes)throw Error('Lỗi bất biến tam giác: '+id);
for(const id of CIRCLE_POSITION_IDS){const p=circleDefaults(id),s=id<='9-06-C03'?lineCircleGeometry(p.r,p.d):twoCircleGeometry(p.R,p.r,p.d);if(!circleExpected(id,s.state))throw Error('Lỗi vị trí đường tròn: '+id);}
for(const m of implemented.filter(x=>isGraphCase(x.id)))if(!graphExperiment(m.id,graphDefaults(m.id)).series.length)throw Error('Thiếu đồ thị: '+m.id);
for(const f of ['src/curriculum/CurriculumExplorer.js','src/curriculum/curriculum.css','src/curriculum/FunctionGraphLab.js','src/curriculum/CirclePositionLab.js','index.html','CHAY_UNG_DUNG.bat'])if(!fs.existsSync(r(f)))throw Error('Thiếu bộ cài: '+f);
const entry=fs.readFileSync(r('index.html'),'utf8');if(!entry.includes('btn-curriculum')||!entry.includes('curriculum.css'))throw Error('Chưa gắn nút vào giao diện');
console.log('MATHVERSE R5: 67 nhóm, 247 mã không trùng; 113 chế độ tương tác (51 R5 + 34 Toán 7 + 28 Toán 8).');
console.log('SHA-256 tệp dữ liệu nguồn: KHỚP; bộ cài Windows và menu chuyên đề: OK.');
