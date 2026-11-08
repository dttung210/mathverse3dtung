/** Structural review of all 310 mathematical exhibit instances (no WebGL). */
import fs from 'node:fs';
import {MODE_BY_ID} from '../src/museum/r6-room-layout.js';
import {createModeExhibit} from '../src/museum/r67-mode-exhibits.mjs';
import {modelMotionPlan} from '../src/museum/learning-motion.mjs';
import {disposeObject} from '../src/geometry.js';
const rows=[];
const quote=x=>'"'+String(x??'').replaceAll('"','""')+'"';
let rendered=0,failed=0,nonfinite=0,custom=0,printed=0;
for(const [id,mode] of MODE_BY_ID){
 const grade=Number(mode.grade);
 const plan=modelMotionPlan({...mode,id});
 let status='PASS',meshCount=0, bespoke='Sắp xếp theo từng bước',notes='Bản dựng học tập theo giai đoạn; cần nghiệm thu WebGL';
 try{
  const obj=createModeExhibit(grade,mode);
  if(!obj?.isGroup)throw Error('No THREE.Group returned');
  if(typeof obj.userData.animate!=='function')throw Error('Missing motion callback');
  if(grade===6){
   const nature=obj.userData.mathNature||'';
   if(nature==='TRUE_3D'){bespoke='Chuyển động mô hình 3D riêng';custom++;}
   else if(nature==='2D_SGK_EXHIBITION_BOARD'){bespoke='Hình SGK 2D cố định';notes='Không ép tranh SGK thành hình 3D';}
   else if(nature==='SGK_2D_MATH_IN_3D_RELIEF'){bespoke='Hình SGK nổi 3D';notes='Kiểm tra minh họa chuyên biệt';}
  }else{
   const carrier=obj.children.find(x=>x.isGroup);
   if(carrier?.userData?.animatePart){bespoke='Hoạt ảnh riêng theo mô hình';custom++;}
   if(mode.sourceLabId?.startsWith('12-07'))bespoke='Hoạt ảnh xoay tạo khối (bản bục)';
  }
  for(const t of [0,3.5,8.6,10])obj.userData.animate(t);
  obj.traverse(x=>{
   if(!x.isMesh)return;
   meshCount++;
   const p=x.geometry?.getAttribute?.('position');
   if(!p)return;
   for(let i=0;i<p.count;i++){
    if(!Number.isFinite(p.getX(i))||!Number.isFinite(p.getY(i))||!Number.isFinite(p.getZ(i))){nonfinite++;throw Error('Nonfinite vertex coordinates');}
   }
  });
  if(meshCount<=0)throw Error('No meshes');
  rendered++;
  disposeObject(obj);
 }catch(e){status='FAIL';failed++;notes=String(e?.message||e).slice(0,200);if(printed++<15)console.error(id,notes);}
 rows.push([id,grade,mode.roomName||'',mode.labName||'',mode.name||mode.title||'',mode.modality||'',plan.kind,bespoke,meshCount,status,notes]);
}
const headers=['ID mô hình','Khối lớp','Phòng chuyên đề','Lab','Tên mô hình','Kiểu học liệu','Nhóm hoạt ảnh','Chuyển động hiện tại','Số mesh','Kiểm tra mã','Ghi chú'];
const csv='\uFEFF'+[headers,...rows].map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n';
const output=process.argv[2]||'AUDIT_310_MODELS.csv';
fs.writeFileSync(output,csv);
const byGrade={};for(const r of rows){const g=r[1];byGrade[g]??={total:0,pass:0,custom:0};byGrade[g].total++;if(r[9]==='PASS')byGrade[g].pass++;if(r[7].includes('riêng'))byGrade[g].custom++;}
const result={total:rows.length,rendered,failed,nonfinite,custom,byGrade,output};
console.log(JSON.stringify(result,null,2));
if(failed)process.exitCode=1;
