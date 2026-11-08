import {Grade11Lab} from '../curriculum/Grade11Lab.js?v=r107_v15';
import {FunctionGraphLab} from '../curriculum/FunctionGraphLab.js?v=r107_v15';
import {isGrade11Mode,grade11Is3D} from '../curriculum/grade11-engine.mjs?v=r107_v15';
import {isGraphCase} from '../curriculum/graph-models.mjs?v=r107_v15';
const get=id=>document.getElementById(id);
const fields=['Hình rõ / không bị che nhãn','Hình có chuyển động thực (0% → 50% → 100%)','Các thanh trượt và nút hoạt động','Kết quả toán học đúng','Đúng bảng màu ngữ nghĩa R84 & loại 2D / WebGL 3D','Không có lỗi JavaScript'];
const kind=id=>isGraphCase(id)?'graph':grade11Is3D(id)?'solid':'svg';
const className={graph:'Đồ thị hàm số 2D (R84)',svg:'SVG 2D tương tác (R84)',solid:'WebGL 3D với mesh Three.js + sơ đồ 2D (R84)'};
const key='mathverse:qa:grade11:gd6:';let data=null,items=[],selected=null,lab=null,errors=[];
window.addEventListener('error',e=>{errors.push(String(e.message));get('saved').textContent='Lỗi trình duyệt: '+e.message;});
function record(id){try{return JSON.parse(localStorage.getItem(key+id)||'{}')}catch{return {}}}
function resetLab(){try{lab?.destroy?.()}catch(e){console.error(e)}lab=null;}
async function choose(id,pct){
 const m=items.find(x=>x.id===id);if(!m)return;
 if(selected===id&&lab&&pct!==undefined&&pct!==null&&typeof lab.setProgress==='function'){
  lab.setProgress(Number(pct));
  return;
 }
 if(kind(id)!=='graph'&&!isGrade11Mode(id))throw Error('Không có bộ dựng Lab: '+id);
 resetLab();selected=id;
 get('title').textContent=m.id+' – '+m.name;
 get('kind').textContent=className[kind(id)];
 get('origin').textContent=(m.source||'SGK Toán 11 · Kết nối tri thức')+' · Bảng màu R84: #1D4ED8 (gốc) · #047857 (đối chiếu) · #B45309 (đang dựng) · #6D28D9 (kết quả)';
 get('stage').replaceChildren();
 try{
  lab=kind(id)==='graph'?new FunctionGraphLab():new Grade11Lab();
  lab.mount(get('stage'),id,m);
  if(pct!==undefined&&pct!==null&&typeof lab.setProgress==='function')lab.setProgress(Number(pct));
 }catch(e){get('stage').textContent='Lỗi khởi tạo: '+e.message;errors.push(id+': '+e.message);}
 const saved=record(id);get('checks').replaceChildren();
 for(let i=0;i<fields.length;i++){
  const label=document.createElement('label');label.style.display='block';label.style.margin='8px 0';
  const box=document.createElement('input');box.type='checkbox';box.dataset.i=i;box.checked=!!saved['check'+i];
  label.append(box,document.createTextNode(' '+fields[i]));get('checks').append(label);
 }
 get('notes').value=saved.notes||'';
 get('saved').textContent=saved.at?'Đã lưu: '+saved.at:'Chưa nghiệm thu trên máy cô';
 for(const b of get('items').querySelectorAll('button'))b.setAttribute('aria-current',String(b.dataset.id===id));
}
window.__toan11AuditSelect=choose;
function populate(){
 get('items').replaceChildren();
 const filter=get('filter').value,list=items.filter(m=>filter==='all'||kind(m.id)===filter);
 get('counter').textContent=`${list.length}/${items.length} Lab`;
 for(const m of list){
  const b=document.createElement('button');b.type='button';b.dataset.id=m.id;b.textContent=m.id+' · '+m.name;
  b.addEventListener('click',()=>choose(m.id));get('items').append(b);
 }
 const urlParams=new URLSearchParams(window.location.search);
 const reqId=urlParams.get('id'),reqPct=urlParams.get('pct');
 const initId=(reqId&&list.some(x=>x.id===reqId))?reqId:(list.some(x=>x.id===selected)?selected:list[0]?.id)||'';
 choose(initId,reqPct!==null?Number(reqPct):undefined);
}
get('filter').addEventListener('change',populate);
get('save').addEventListener('click',()=>{if(!selected)return;const payload={id:selected,at:new Date().toLocaleString('vi-VN'),notes:get('notes').value.trim()};for(const x of get('checks').querySelectorAll('input'))payload['check'+x.dataset.i]=x.checked;try{localStorage.setItem(key+selected,JSON.stringify(payload));get('saved').textContent='Đã lưu · '+payload.at;}catch(e){get('saved').textContent='Không lưu được: '+e.message;}});
get('export').addEventListener('click',()=>{const rows=[['id','mode','loai',...fields,'ghi_chu','thoi_diem']];for(const m of items){const p=record(m.id);rows.push([m.id,m.name,className[kind(m.id)],...fields.map((_,i)=>p['check'+i]?'DAT':'CHUA_KIEM_TRA'),p.notes||'',p.at||'']);}const quote=v=>'"'+String(v).replaceAll('"','""')+'"';const csv='\uFEFF'+rows.map(r=>r.map(quote).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='MATHVERSE_R84_KIEM_TRA_46_LAB_TOAN11.csv';a.click();URL.revokeObjectURL(url);});
(async()=>{try{const response=await fetch('/data/mathverse-7-12-curated.json');if(!response.ok)throw Error('HTTP '+response.status);data=await response.json();items=data.source_registry.filter(f=>f.grade===11).flatMap(f=>f.modes.map(m=>({...m,source:f.source_evidence})));if(items.length!==46)throw Error('Sai số Lab: '+items.length);populate();}catch(e){get('counter').textContent='Không nạp được Lab: '+e.message;}})();
window.addEventListener('beforeunload',resetLab);
