import fs from 'node:fs';
import {createIntegratedSgkDirectory} from '../src/curriculum/sgk-integrated-directory.mjs';
import {isGrade7Mode,grade7Solid} from '../src/curriculum/grade7-engine.mjs';
import {isGrade8Mode,grade8Solid} from '../src/curriculum/grade8-engine.mjs';
import {isGrade9Mode,grade9Solid} from '../src/curriculum/grade9-engine.mjs';
import {isGrade10Mode} from '../src/curriculum/grade10-engine.mjs';
import {isGrade11Mode,grade11Is3D} from '../src/curriculum/grade11-engine.mjs';
import {isGrade12Mode,grade12Is3D} from '../src/curriculum/grade12-engine.mjs';
import {isGraphCase} from '../src/curriculum/graph-models.mjs';
import {isCirclePosition} from '../src/curriculum/circle-positions.mjs';
import {isTriangleCase} from '../src/curriculum/triangle-engine.mjs';
import {isTrue3DCapable} from '../src/math6-lab/math6-taxonomy.mjs';
import {detectModality} from '../src/data/migrate-v2-v4-v5.js';
const curated=JSON.parse(fs.readFileSync(new URL('../data/mathverse-7-12-curated.json',import.meta.url)));
const gallery=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url))).items;
const directory=createIntegratedSgkDirectory(curated,{exhibits:gallery});
if(directory.errors.length||directory.labCount!==310||directory.exhibitCount!==54)throw Error('R90 directory audit invalid '+directory.errors.join(';'));
const kind=id=>{
 if(isTrue3DCapable(id))return 'Toán 6 - Hình 3D';
 if(grade7Solid(id)||grade8Solid(id)||grade9Solid(id)||grade11Is3D(id)||grade12Is3D(id))return 'WebGL 3D + minh họa 2D';
 if(isGraphCase(id))return 'Đồ thị 2D chuyên biệt';
 if(isCirclePosition(id))return 'Đường tròn động';
 if(isTriangleCase(id))return 'Tam giác động có bất biến';
 if(isGrade7Mode(id)||isGrade8Mode(id)||isGrade9Mode(id)||isGrade10Mode(id)||isGrade11Mode(id)||isGrade12Mode(id))return 'SVG 2D / chứng minh theo giai đoạn';
 return 'Canvas 2D Toán 6';
};
const header=['ID','Lop_SGK','Tap','Chuong','Ten_Chuong','Bai','Ten_Bai','Ten_Mo_Hinh','Loai','Lop_Nguon','Lab_Nguon','Lab_Dich','Ma_Tham_Chieu','Mau_Du_Kien','Mau_Dang_Dung','Mau_Doi_Chieu','Mau_Ket_Qua','Trang_Thai_Cau_Truc','Nghiem_Thu_Trinh_Duyet'];
const rows=[header];
for(let g=6;g<=12;g++)for(const chapter of directory.getChapters(g))for(const mode of chapter.modes){
 const ex=mode.relatedExhibit;
 const source=ex?gallery.find(x=>x.id===mode.sourceExhibitId):null;
 rows.push([mode.id,g,mode.volume,chapter.chapterNum,chapter.name,mode.lessonNum,mode.lessonTitle,mode.name,
  ex?`Hiện vật gốc · ${detectModality(source?.type||'')}`:mode.relatedVariant?'Chế độ bài học · '+kind(mode.baseId):kind(mode.id),
  mode.sourceGrade||g,mode.sourceLabId||'',mode.targetLabId||'',ex?mode.anchorModeId:mode.auditSourceId||'',
  '#1D4ED8','#B45309','#15803D','#6D28D9',
  ex?'Đã liên kết hiện vật gốc, không nhân bản':mode.relatedVariant?'Đã giữ chế độ bài học riêng':'Đã đặt đúng bài/chương SGK',
  'CHƯA XÁC NHẬN TRỰC QUAN TỪNG MÔ HÌNH TRÊN WINDOWS CHROME/EDGE'
 ]);
}
const quote=x=>'"'+String(x??'').replaceAll('"','""')+'"';
fs.writeFileSync(new URL('../R90_BANG_310_LAB_54_HIEN_VAT_THEO_CHUONG.csv',import.meta.url),'\uFEFF'+rows.map(row=>row.map(quote).join(',')).join('\r\n'),'utf8');
const stats={version:'R90',classes:[6,7,8,9,10,11,12],chapters:[...directory.chaptersByGrade.values()].reduce((a,v)=>a+v.length,0),canonicalLabIds:directory.labCount,additionalLessonSubmodes:directory.variantCount,linkedExistingExhibits:directory.exhibitCount,uniqueVisibleEntries:rows.length-1,missingMappings:directory.errors.length,byGrade:Object.fromEntries([6,7,8,9,10,11,12].map(g=>[g,{chapters:directory.getChapters(g).length,labIds:directory.getChapters(g).flatMap(c=>c.modes).filter(m=>!m.relatedExhibit&&!m.relatedVariant).length,linkedExhibits:directory.getChapters(g).flatMap(c=>c.modes).filter(m=>m.relatedExhibit).length}]))};
fs.writeFileSync(new URL('../R90_TONG_HOP_KIEM_KE.json',import.meta.url),JSON.stringify(stats,null,2)+'\n');
console.log(JSON.stringify(stats,null,2));
