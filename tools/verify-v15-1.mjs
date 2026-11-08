/** V15.1 curation + real-geometry audit; never modifies original Math 6 sources. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {TOAN6_LAB_MODELS,LAB_TO_EXHIBIT,ALL_MATH6_LABS} from '../src/math6-lab/catalog.js';
import {buildPresets} from '../src/studio/presets.js';
import {grade6ArchivedLabs} from '../src/portal-labs/grade6-v15.js';
import {auditGrade6Selection} from '../src/portal-labs/grade6-curation-v15-1.js';
import {makeMath6GalleryPreview,hasReal3DGalleryModel} from '../src/museum/math6-preview-v15.js';
import * as THREE from '../vendor/three.module.js';
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
if(pkg.version!=='15.1.0' && pkg.version!=='16.4.0')fail('Máy chủ / metadata không phải phiên bản V15.1/R6.4');
const main=fs.readFileSync(path.join(root,'src/ui/LabShell.js'),'utf8');
if(!main.includes('SpecialtyLab')||!main.includes('_enterSpecialtyLab'))fail('Chưa chuyển sang Lab chuyên biệt');
const {portalCounts,PORTAL_ZONES,zonesForGrade,gradePortalLabs,portalExhibits}=await import('../src/portal-labs/portal-registry.js');
if(PORTAL_ZONES.length!==5)fail('Lớp 7–12 phải giữ nguyên 5 cổng');
if(zonesForGrade(6).length!==4)fail('Lớp 6 phải có 4 cổng');
for(const grade of grades){
  const portals=portalCounts(catalog,grade);
  if(portals.length!==(grade===6?4:5)||portals.some(p=>p.count<1&&!((grade===7&&p.id==='graph')||([8,9].includes(grade)&&p.id==='stats')||(grade===10&&['solid','stats'].includes(p.id))||(grade===11&&['plane','graph','stats'].includes(p.id))||(grade===12&&['plane','stats'].includes(p.id)))))fail(`Lớp ${grade} thiếu cổng có sản phẩm`);
  const all=new Set();
  for(const p of portals)for(const m of portalExhibits(catalog,grade,p.id)){
    if(all.has(m.id))fail(`Trùng mẫu ở lớp ${grade}: ${m.id}`);
    all.add(m.id);
    if(m.supplemental&&!m.sourceExhibitId)fail(`Mẫu không có liên kết nguồn lớp ${grade} ${p.id}`);
  }
}
const labZones=zonesForGrade(6),labModels=labZones.flatMap(p=>gradePortalLabs(6,p.id));
if(labModels.length!==35||ALL_MATH6_LABS.length!==63||new Set(labModels.map(x=>x.id)).size!==35)fail('Phải có 35 mẫu 3D tuyển và giữ 63 tệp MathLab gốc');
if(grade6ArchivedLabs().length!==28||auditGrade6Selection(ALL_MATH6_LABS).archived.length!==28)fail('Không đủ 28 mẫu giữ kho lưu trữ');
for(const m of TOAN6_LAB_MODELS)if(!ALL_MATH6_LABS.some(x=>x.id===m.id))fail(`Đã mất dữ liệu SGK Toán 6 gốc: ${m.id}`);
const counts=labZones.map(p=>gradePortalLabs(6,p.id).length);
if(JSON.stringify(counts)!==JSON.stringify([9,9,9,8]))fail('Chia loại cổng V15.1 không đúng: '+counts);
for(const m of labModels){
 const item={title:m.title,labId:m.id,labEngine:m.engine,labVariant:m.variant,labDefaults:m.defaults};
 if(!hasReal3DGalleryModel(item))fail('Mô hình chưa có hiện vật 3D: '+m.id);
 else{
  const group=makeMath6GalleryPreview(THREE,item);
  if(!group.userData.gallery3D)fail('Mô hình 3D không có metadata: '+m.id);
  let count=0;group.traverse(o=>{if(o.isMesh||o.isInstancedMesh)count++;if(o.geometry?.type==='PlaneGeometry')fail('Còn bảng ảnh giả 3D: '+m.id);});
  if(!count)fail('Không có khối thật cho mô hình: '+m.id);
  group.traverse(o=>{o.geometry?.dispose?.();o.material?.dispose?.();});
 }
}
const ui=fs.readFileSync(path.join(root,'src/main.js'),'utf8');
if(!ui.includes('onPortalChange:showPortalHud')||!main.includes('launchMath6('))fail('Chưa liên kết cổng vật lý, kho mô hình và MathLab 6');
if(!fs.readFileSync(path.join(root,'src/museum.js'),'utf8').includes('const selection=targetGrade===6&&!activePortal?[]:'))fail('Sảnh lớp 6 không ẩn mô hình');
if(fs.existsSync(path.join(root,'src/integrations/geogebra')))fail('GeoGebra được đưa trở lại');
if(!process.exitCode){
 console.log('ĐẠT: 35 hiện vật 3D có hình học thật (9/9/9/8); 28 mẫu lưu trữ; tổng 63 tệp MathLab, 63 mẫu bảo tàng, 42 preset, 7 phòng và 34 cổng.');
 console.log('Lưu ý: còn phải kiểm tra điều khiển bằng chuột và WebGL trên Chrome/Edge thật.');
}
