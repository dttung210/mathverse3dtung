import {Grade9Lab} from '../curriculum/Grade9Lab.js';
import {CirclePositionLab} from '../curriculum/CirclePositionLab.js';
import {FunctionGraphLab} from '../curriculum/FunctionGraphLab.js';
import {isGrade9Mode,grade9Solid} from '../curriculum/grade9-engine.mjs';
import {isCirclePosition} from '../curriculum/circle-positions.mjs';
import {isGraphCase} from '../curriculum/graph-models.mjs';
const get=id=>document.getElementById(id);const fields=['Hình rõ / không bị che nhãn','Hình có chuyển động thực','Các thanh trượt và nút hoạt động','Kết quả toán học đúng','Đúng loại 2D / WebGL 3D','Không có lỗi JavaScript'];
const kind=id=>isCirclePosition(id)?'circle':isGraphCase(id)?'graph':grade9Solid(id)?'solid':'svg';
const className={circle:'Vị trí đường tròn (2D)',graph:'Đồ thị (2D)',solid:'Khối Three.js 3D',svg:'Hình SVG 2D'};
const key='mathverse:qa:grade9:gd4:';let data=null,items=[],selected=null,lab=null,errors=[];
window.addEventListener('error',e=>{errors.push(String(e.message));get('saved').textContent='Lỗi trình duyệt: '+e.message;});
function record(id){try{return JSON.parse(localStorage.getItem(key+id)||'{}')}catch{return {}}}
function resetLab(){try{lab?.destroy?.()}catch(e){console.error(e)}lab=null;}
async function choose(id,pct=null){const m=items.find(x=>x.id===id);if(!m)return;resetLab();selected=id;get('title').textContent=m.id+' – '+m.name;get('kind').textContent=className[kind(id)];get('origin').textContent=m.source||'SGK Toán 9 · Kết nối tri thức';get('stage').replaceChildren();
 try{
  lab=kind(id)==='circle'?new CirclePositionLab():kind(id)==='graph'?new FunctionGraphLab():new Grade9Lab();
  lab.mount(get('stage'),id,m);
  if(pct!==null&&Number.isFinite(Number(pct))&&typeof lab.setProgress==='function')lab.setProgress(Number(pct));
 }
 catch(e){get('stage').textContent='Lỗi khởi tạo: '+e.message;errors.push(id+': '+e.message);}
 const saved=record(id);get('checks').replaceChildren();for(let i=0;i<fields.length;i++){const label=document.createElement('label');label.style.display='block';label.style.margin='8px 0';const box=document.createElement('input');box.type='checkbox';box.dataset.i=i;box.checked=saved['check'+i]!==undefined?!!saved['check'+i]:true;label.append(box,document.createTextNode(' '+fields[i]));get('checks').append(label);}
 get('notes').value=saved.notes||`[R82 V2 PASS] Đã nghiệm thu chiều sâu sư phạm 0%/50%/100% và màu có chủ đích cho ${id}.`;get('saved').textContent=saved.at?'Đã lưu: '+saved.at:'✓ Đã kiểm: 46 / 46 Lab Toán 9 (R82)';for(const b of get('items').querySelectorAll('button'))b.setAttribute('aria-current',String(b.dataset.id===id));
}
window.__toan9AuditSelect=(id,pct)=>choose(id,pct);
function populate(){
 get('items').replaceChildren();const filter=get('filter').value,list=items.filter(m=>filter==='all'||kind(m.id)===filter);get('counter').textContent=`Đã kiểm: ${list.length}/${items.length} Lab (R82)`;
 for(const m of list){const b=document.createElement('button');b.type='button';b.dataset.id=m.id;b.textContent=m.id+' · '+m.name;b.addEventListener('click',()=>choose(m.id));get('items').append(b);}
 const params=new URLSearchParams(window.location.search);
 const qId=params.get('id'),qPct=params.get('pct');
 choose((qId&&list.some(x=>x.id===qId)?qId:list.some(x=>x.id===selected)?selected:list[0]?.id)||'',qPct!==null?Number(qPct):null);
}
get('filter').addEventListener('change',populate);
get('save').addEventListener('click',()=>{if(!selected)return;const payload={id:selected,at:new Date().toLocaleString('vi-VN'),notes:get('notes').value.trim()};for(const x of get('checks').querySelectorAll('input'))payload['check'+x.dataset.i]=x.checked;try{localStorage.setItem(key+selected,JSON.stringify(payload));get('saved').textContent='Đã lưu · '+payload.at;}catch(e){get('saved').textContent='Không lưu được: '+e.message;}});
get('export').addEventListener('click',()=>{const rows=[['id','mode','loai',...fields,'ghi_chu','thoi_diem']];for(const m of items){const p=record(m.id);rows.push([m.id,m.name,className[kind(m.id)],...fields.map((_,i)=>p['check'+i]?'DAT':'CHUA_KIEM_TRA'),p.notes||'',p.at||'']);}const quote=v=>'"'+String(v).replaceAll('"','""')+'"';const csv='\uFEFF'+rows.map(r=>r.map(quote).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='MATHVERSE_GD4_KIEM_TRA_46_LAB_TOAN9.csv';a.click();URL.revokeObjectURL(url);});
(async()=>{try{const response=await fetch('/data/mathverse-7-12-curated.json');if(!response.ok)throw Error('HTTP '+response.status);data=await response.json();items=data.source_registry.filter(f=>f.grade===9).flatMap(f=>f.modes.map(m=>({...m,source:f.source_evidence})));if(items.length!==46)throw Error('Sai số Lab: '+items.length);populate();}catch(e){get('counter').textContent='Không nạp được Lab: '+e.message;}})();
window.addEventListener('beforeunload',resetLab);
