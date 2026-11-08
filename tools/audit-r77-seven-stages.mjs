/** R77 structural 310-model teaching-motion audit. Does NOT claim visual WebGL proof. */
import fs from 'node:fs';
import {MODE_BY_ID} from '../src/museum/r6-room-layout.js';
import {createModeExhibit} from '../src/museum/r67-mode-exhibits.mjs';
import {disposeObject} from '../src/geometry.js';
import {SEVEN_GRADE_PHASES,modelMotionPlan} from '../src/museum/learning-motion.mjs';
const quote=x=>'"'+String(x??'').replaceAll('"','""')+'"';
const advice={
  6:'Cắt/ghép, gấp đối xứng, quay vật thể thật hoặc dựng trên trục số; giữ hình phẳng nếu là ảnh SGK',
  7:'Dựng góc, tịnh tiến hai tam giác chồng khít, đường đồng quy hoặc thay đổi dữ liệu',
  8:'Biến đổi đồng dạng/vị tự, ghép diện tích Pythagore, gấp/mở khối hay vẽ quỹ tích',
  9:'Dịch chuyển đường cắt tròn, dựng mặt cắt cầu, khai triển nón/trụ có kiểm tra kích thước',
  10:'Vẽ đồ thị bằng miền xác định, dịch vectơ theo đầu-đuôi, biến đổi miền nghiệm',
  11:'Quay góc lượng giác, tăng chiều cao khối, gấp nhị diện quanh giao tuyến',
  12:'Quét mặt tròn xoay 0-360°, dịch mặt phẳng cắt, biểu diễn tổng Riemann và Oxyz'
};
const rows=[],byGrade={};
let bad=0;
for(const [id,mode] of MODE_BY_ID){
  const grade=Number(mode.grade),plan=modelMotionPlan({...mode,id});
  const record={id,grade,name:mode.name||mode.title||'',lab:mode.sourceLabId||mode.labId||'',phase:grade-5,
    class:'',meaning:'',measured:false,valid:true,action:advice[grade]};
  let ex;
  try{
    ex=createModeExhibit(grade,{...mode,id,sourceLabId:mode.sourceLabId||mode.labId});
    const c=grade===6?ex:ex.children.find(o=>o.isGroup);
    if(grade===6){
      const nature=ex.userData.mathNature||'';
      record.class=nature==='TRUE_3D'?'physical-3d':nature==='2D_SGK_EXHIBITION_BOARD'?'static-sgk-2d':'relief-sgk-2d';
      record.meaning=ex.userData.motionMeaning||'';
    }else{
      const flag=typeof c.userData.animatePart==='function';
      const segments=[];c.traverse(o=>{if(o.userData.mathLine||o.userData.mathCurve)segments.push(o);});
      record.class=flag?'geometric-transformation':segments.length?'geometric-construction':'static-presentation';
      record.meaning=c.userData.motionMeaning||plan.steps[1];
    }
    const snaps=[];
    for(const t of [0,4.5,10]){
      ex.userData.animate(t);
      ex.updateMatrixWorld(true);
      const metrics=[];
      ex.traverse(o=>{
        if(!o.isMesh)return;
        if(!o.position.toArray().every(Number.isFinite)||!o.scale.toArray().every(Number.isFinite))throw Error('NaN transforms');
        if(o.geometry?.getAttribute?.('position')){
          const a=o.geometry.getAttribute('position');for(let i=0;i<a.count;i++){
            if(!Number.isFinite(a.getX(i))||!Number.isFinite(a.getY(i))||!Number.isFinite(a.getZ(i)))throw Error('NaN vertices');
          }
        }
        metrics.push(`${o.matrixWorld.elements.map(x=>x.toFixed(3)).join(',')}/${o.visible}/${o.geometry?.drawRange?.count??''}`);
      });
      snaps.push(metrics.join('|'));
    }
    record.measured=snaps[0]!==snaps[1]||snaps[1]!==snaps[2];
    // If there is no measurable effect, do not claim animation is real.
    if(!record.measured&&record.class!=='static-sgk-2d')record.class='static-or-unproven';
  }catch(e){bad++;record.valid=false;record.class='ERROR';record.meaning=String(e?.message||e)}
  finally{if(ex)disposeObject(ex);}
  rows.push(record);
  byGrade[grade]??={total:0,'geometric-transformation':0,'geometric-construction':0,'physical-3d':0,'static-sgk-2d':0,'relief-sgk-2d':0,'static-or-unproven':0,'static-presentation':0,ERROR:0};
  byGrade[grade].total++;byGrade[grade][record.class]=(byGrade[grade][record.class]||0)+1;
}
const header=['Giai đoạn','Khối lớp','ID','Lab','Tên mô hình','Mức chuyển động mã nguồn','Có thay đổi quan sát qua ma trận','Ý nghĩa Toán học đang thể hiện','Đề xuất tiếp tục','Kiểm tra tính hữu hạn'];
const lines=[header,...rows.map(r=>[r.phase,r.grade,r.id,r.lab,r.name,r.class,r.measured?'có':'không',r.meaning,r.action,r.valid?'PASS':'FAIL'])];
const path=process.argv[2]||'AUDIT_R77_310_MO_HINH.csv';
fs.writeFileSync(path,'\uFEFF'+lines.map(x=>x.map(quote).join(',')).join('\r\n')+'\r\n');
const summary={total:rows.length,bad,byGrade,sevenStages:SEVEN_GRADE_PHASES,output:path,warning:'Đây là kiểm thử hình học bằng Node. Phải nghiệm thu chuyển động thực tế WebGL, không đồng nhất dựng theo nét với biến hình.'};
console.log(JSON.stringify(summary,null,2));
if(bad||rows.length!==310)process.exitCode=1;
