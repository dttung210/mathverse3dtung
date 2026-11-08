/** V13 release audit. Runs offline from this directory; never modifies the catalog. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {TOAN6_LAB_MODELS,LAB_TO_EXHIBIT} from '../src/math6-lab/catalog.js';
import {buildPresets} from '../src/studio/presets.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const originals={
 'data/catalog.json':'1dffaa1b824e78fec068f4c718918f169e5a60742c3f6aedde1577937e17ce15',
 'data/models.toan6.json':'a0236450797b5146ff7f69f8efaf83a22ee10102e24989bec32cab4eda69a0b9'
};
const fail=(message)=>{console.error('KHÔNG ĐẠT:',message);process.exitCode=1;};
for(const [name,expected] of Object.entries(originals)){
 const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex');
 if(actual!==expected)fail(`Tệp dữ liệu gốc đã bị sửa: ${name}`);
 else console.log('GIỮ NGUYÊN:',name);
}
const catalog=JSON.parse(fs.readFileSync(path.join(root,'data/catalog.json'),'utf8')).items;
const grades=[...new Set(catalog.map(m=>m.grade))].sort((a,b)=>a-b);
if(catalog.length!==63||catalog.some(m=>m.grade<6||m.grade>12)||JSON.stringify(grades)!==JSON.stringify([6,7,8,9,10,11,12]))fail('Kho 63 mô hình / 7 phòng không nguyên vẹn');
const grade6=new Set(catalog.filter(m=>m.grade===6).map(m=>m.id));
if(grade6.size!==9)fail('Không đủ 9 bục Toán 6 gốc');
if(TOAN6_LAB_MODELS.length!==60||new Set(TOAN6_LAB_MODELS.map(m=>m.id)).size!==60)fail('Số mô hình SGK Toán 6 hoặc ID không đúng');
for(const m of TOAN6_LAB_MODELS)if(!grade6.has(LAB_TO_EXHIBIT[m.id]))fail(`Thiếu liên kết bục gốc: ${m.id}`);
const presets=buildPresets(catalog);
if(presets.length!==42)fail('Không đủ 42 mẫu tham số');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if(pkg.version!=='13.0.0')fail('Máy chủ / metadata không phải phiên bản V13');
const main=fs.readFileSync(path.join(root,'src/ui/LabShell.js'),'utf8');
for(const mode of ['model','math6','2d','3d'])if(!main.includes(`data-unified-mode="${mode}"`))fail('Thiếu không gian thống nhất: '+mode);
if(fs.existsSync(path.join(root,'src/integrations/geogebra')))fail('GeoGebra được đưa trở lại');
if(!process.exitCode){
 console.log('ĐẠT: 7 phòng, 63 mô hình, 9 bục Toán 6, 60 thí nghiệm, 42 mẫu, 4 chế độ làm việc.');
 console.log('Lưu ý: còn phải kiểm tra điều khiển bằng chuột và WebGL trên Chrome/Edge thật.');
}
