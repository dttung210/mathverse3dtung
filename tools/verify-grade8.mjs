/** MATHVERSE R5 - grade 8 math audit gate, does not pretend to test Windows GPU. */
import fs from 'node:fs';import crypto from 'node:crypto';
import {GRADE8_IDS,grade8Solid,grade8Defaults,grade8Valid,grade8Metrics,grade8Probability,pyramid8,pythag8,thales8} from '../src/curriculum/grade8-engine.mjs';
import {grade8SVGScene,grade8NetSVG} from '../src/curriculum/grade8-svg.mjs';
import {caseRuntimeStatus} from '../src/curriculum/CurriculumExplorer.js';
import {makeTrianglePair} from '../src/curriculum/triangle-engine.mjs';
import {isGraphCase,graphExperiment,graphDefaults} from '../src/curriculum/graph-models.mjs';
import {EXPLORATION_MODELS} from '../src/portal-labs/exploration-collection.js';
import {portalExhibits,zonesForGrade} from '../src/portal-labs/portal-registry.js';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root));const die=m=>{throw Error('GD3 TOAN8: '+m)};
const expected={'data/catalog.json':'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15','data/models.toan6.json':'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9'};
for(const [path,hash] of Object.entries(expected))if(crypto.createHash('sha256').update(read(path)).digest('hex')!==hash)die('Lỗi thay đổi dữ liệu gốc '+path);
const d=JSON.parse(read('data/mathverse-7-12-curated.json').toString()),c=JSON.parse(read('data/catalog.json').toString()).items;
const families=d.source_registry.filter(x=>x.grade===8),modes=families.flatMap(x=>x.modes);
if(families.length!==9||modes.length!==37||new Set(modes.map(x=>x.id)).size!==37)die('Sai 9 phòng hoặc 37 chế độ');
if(GRADE8_IDS.length!==28||GRADE8_IDS.filter(grade8Solid).length!==4)die('Sai 28 mô hình mới / 4 khối 3D');
let nsvg=0,nsolid=0,ntri=0,ngraph=0;
for(const mode of modes){const id=mode.id;
 if(caseRuntimeStatus(id)!=='interactive'||mode.implementation_status!=='VERIFIED_INTERACTIVE_R5')die('Chưa tương tác: '+id);
 if(isGraphCase(id)){ngraph++;if(!graphExperiment(id,graphDefaults(id)).series.length)die('Đồ thị trống '+id);continue;}
 if(id.startsWith('8-06-')&&Number(id.slice(-2))<=6){ntri++;if(!makeTrianglePair(id).check.passes)die('Sai tam giác '+id);continue;}
 const p=grade8Defaults(id);if(!grade8Valid(id,p)||!grade8Metrics(id,p).length)die('Thiếu tham số/số đo '+id);
 if(grade8Solid(id)){nsolid++;const x=pyramid8(id,p);if(x.volume<=0||x.faces<4||!grade8NetSVG(id,p,.7).includes('<svg'))die('Lỗi khối 3D '+id);}
 else{nsvg++;const a=grade8SVGScene(id,p,0),b=grade8SVGScene(id,p,2.7);if(!a.startsWith('<svg')||!b.startsWith('<svg')||a===b||/NaN|undefined|Infinity/.test(a+b))die('SVG lỗi/không chuyển động: '+id);}
}
if(ntri!==6||ngraph!==3||nsvg!==24||nsolid!==4)die(`Tỉ lệ 6/3/24/4 không khớp (${ntri}/${ngraph}/${nsvg}/${nsolid})`);
if(!pythag8({a:3,b:4},false).right||!thales8({a:6,h:4,u:.45,v:.45}).parallel)die('Công thức Pythagore/Thalès sai');
for(const x of ['8-08-C03','8-08-C04','8-08-C05']){const r=grade8Probability(x,grade8Defaults(x));if(r.theoretical<0||r.theoretical>1)die('Xác suất không hợp lệ: '+x);}
if(c.filter(x=>x.grade===8).length!==9||c.length!==63)die('Mất hiện vật gốc');
if(EXPLORATION_MODELS.filter(x=>x.grade===8).length!==5)die('5 mô hình lưu trữ bị xóa');
for(const z of zonesForGrade(8))if(portalExhibits(c,8,z.id).some(x=>x.id.startsWith('mv_r4_')))die('Mô hình mở rộng lớp 8 chưa ẩn');
for(const needed of ['src/curriculum/Grade8Lab.js','src/curriculum/grade8-svg.mjs','src/curriculum/grade8-engine.mjs','src/qa/toan8-audit.html','src/qa/toan8-audit.js','KIEM_TRA_TOAN_8_GD3.bat','CAI_DAT_VA_CHAY_R5.bat'])if(!fs.existsSync(new URL(needed,root)))die('Thiếu tệp '+needed);
if(!read('src/qa/toan8-audit.html').toString().includes('toan8-audit.js'))die('Trang QA không liên kết script');
console.log('TOAN8 GD3: ĐẠT 9 phòng, 37 chế độ (6 đồng dạng + 3 đồ thị + 24 SVG động + 4 mesh 3D).');
console.log('9 hiện vật gốc bảo toàn; 5 mô hình R4 ngoài chương trình ẩn chứ không xóa; thêm 3 mô hình xác suất chương VIII.');
console.log('Bộ dữ liệu gốc SHA-256 khớp. Chưa nghiệm thu Windows GPU/WebGL thực tế.');
