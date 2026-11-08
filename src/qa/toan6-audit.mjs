import {ALL_MATH6_LABS} from '../math6-lab/catalog.js?v=r107_v15';
import {GRADE6_ACTIVE_IDS} from '../portal-labs/grade6-curation-v15-1.js?v=r107_v15';
import {renderModel} from '../math6-lab/canvas.mjs?v=r107_v15';
import {motionParams} from '../math6-lab/catalog-motion.mjs?v=r107_v15';
import {mathStats} from '../math6-lab/math.mjs?v=r107_v15';
const byId=new Map(ALL_MATH6_LABS.map(m=>[m.id,m]));
const active=new Set(GRADE6_ACTIVE_IDS),$=selector=>document.querySelector(selector);
const canvas=$('#stage'),ctx=canvas.getContext('2d',{willReadFrequently:true});
let model=byId.get(GRADE6_ACTIVE_IDS[0]);let time=0,playing=false,frame=0,prev=0,themeMode='light';
const state=m=>({params:structuredClone(m.defaults),time:0,counts:[3,2,4,1,2,3],lastOutcome:2,tileFlips:new Set(),selectedDesk:2});
function view(m=model,t=time){const s=state(m);s.params=motionParams(m,m.defaults,t,8);s.time=Math.round(t*1000);renderModel(ctx,m,s,{theme:themeMode});return s;}
function render(){const s=view();$('#time').value=String(time);$('#time-label').textContent=`${time.toFixed(1).replace('.',',')} s (${Math.round(time/8*100)}%)`;
 $('#metrics').textContent=`Mã: ${model.id}\nNguồn: ${model.source?.book||'Bổ sung'} · tr. ${model.source?.printed_page||'theo chủ đề'}\nKiểu: ${model.engine}/${model.variant}\n${mathStats(model,s)}`;}
function stop(){playing=false;cancelAnimationFrame(frame);frame=0;prev=0;$('#play').textContent='▶ Phát';}
function select(id){stop();const chosen=byId.get(id);if(!chosen)return false;model=chosen;time=0;$('#name').textContent=`${model.id} — ${model.title}`;$('#category').textContent=model.group+' · '+model.action;
 $('#status').textContent=active.has(id)?'Đang trưng bày':'Kho lưu trữ';$('#result').textContent='';
 document.querySelectorAll('.entry').forEach(e=>e.classList.toggle('current',e.dataset.id===id));render();return true;}
window.__toan6AuditSelect=(id,progressPct=0)=>{
 if(!select(id))return false;
 const maxT=model.engine==='chance'?6:8;
 time=Math.max(0,Math.min(8,(Number(progressPct)/100)*maxT));
 render();
 return true;
};
function populate(){const search=$('#search').value.toLocaleLowerCase('vi-VN'),filter=$('#filter').value;
 const chosen=ALL_MATH6_LABS.filter(m=>(filter==='all'||(filter==='active')===active.has(m.id))&&(m.title.toLocaleLowerCase('vi-VN').includes(search)||m.id.includes(search)));
 $('#items').replaceChildren(...chosen.map(m=>{const b=document.createElement('button');b.className='entry';b.dataset.id=m.id;b.textContent=m.title;
  const note=document.createElement('small');note.textContent=m.engine+' / '+m.variant;b.append(note);b.addEventListener('click',()=>select(m.id));return b;}));
 document.querySelectorAll('.entry').forEach(e=>e.classList.toggle('current',e.dataset.id===model.id));}
function diffPixels(a,b){let difference=0;for(let i=0;i<a.length;i+=16){if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>24)difference++;}return difference;}
function verify(m){const current=model,restore=time;view(m,0);const original=ctx.getImageData(0,0,920,560).data.slice();
 let max=0;for(const t of [2.25,4,8]){view(m,t);max=Math.max(max,diffPixels(original,ctx.getImageData(0,0,920,560).data));}
 view(current,restore);return {id:m.id,changePixels:max,passed:max>0};}
$('#filter').addEventListener('change',populate);$('#search').addEventListener('input',populate);
$('#reset').addEventListener('click',()=>{stop();time=0;render();$('#result').textContent='Đã khôi phục tham số mẫu.';});
$('#stop').addEventListener('click',()=>{stop();time=0;render();});
$('#pct0')?.addEventListener('click',()=>{stop();time=0;render();});
$('#pct50')?.addEventListener('click',()=>{stop();time=model.engine==='chance'?3:4;render();});
$('#pct100')?.addEventListener('click',()=>{stop();time=model.engine==='chance'?6:8;render();});
$('#theme-toggle')?.addEventListener('click',()=>{
 themeMode=themeMode==='light'?'dark':'light';
 $('#theme-toggle').textContent=themeMode==='light'?'☀️ Nền sáng (R86)':'🌙 Nền tối';
 render();
});
$('#time').addEventListener('input',e=>{stop();time=Number(e.target.value);render();});
$('#play').addEventListener('click',()=>{if(playing){stop();return;}if(time>=8)time=0;playing=true;prev=0;$('#play').textContent='Ⅱ Tạm dừng';
 const tick=now=>{if(!playing)return;if(prev)time=Math.min(8,time+(now-prev)/1000);prev=now;render();if(time>=8){stop();return;}frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);});
$('#check').addEventListener('click',()=>{stop();const r=verify(model);$('#result').textContent=`${r.passed?'ĐẠT':'CHƯA ĐẠT'}: ${r.changePixels.toLocaleString('vi-VN')} mẫu pixel thay đổi khi chạy mô hình.`;});
function runAll(items){stop();let errors=[];for(const m of items){try{const r=verify(m);if(!r.passed)errors.push(`${m.id}: hình tĩnh`);}catch(e){errors.push(`${m.id}: ${e.message}`);}}
 $('#progress').textContent=`${items.length-errors.length}/${items.length} Lab qua phép kiểm tra thay đổi hình. ${errors.length?errors.slice(0,6).join('; '):'Không thấy mô hình đứng yên.'}`;render();}
$('#check-active').addEventListener('click',()=>runAll(ALL_MATH6_LABS.filter(m=>active.has(m.id))));
$('#check-all').addEventListener('click',()=>runAll(ALL_MATH6_LABS));
populate();select(model.id);
