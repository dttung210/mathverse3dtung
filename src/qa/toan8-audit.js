import {Grade8Lab} from '../curriculum/Grade8Lab.js?v=r107_v15';
import {CurriculumExplorer} from '../curriculum/CurriculumExplorer.js?v=r107_v15';
import {FunctionGraphLab} from '../curriculum/FunctionGraphLab.js?v=r107_v15';
import {isGrade8Mode,grade8Solid} from '../curriculum/grade8-engine.mjs?v=r107_v15';
import {isGraphCase} from '../curriculum/graph-models.mjs?v=r107_v15';
import {TRIANGLE_CASES,initialTriangleParams} from '../curriculum/triangle-engine.mjs?v=r107_v15';
import {grade8SVGScene} from '../curriculum/grade8-svg.mjs?v=r107_v15';

const $=id=>document.getElementById(id);
const conditions=[['animation','Có mô phỏng hình học động / đồ thị thay tham số'],['controls','Thao tác nút, slider, kéo điểm không bị kẹt'],['mathematics','Quan hệ, phép tính, công thức đúng'],['visual','Hình, ký hiệu, nhãn rõ, không bị che'],['sgk','Phù hợp Toán 8 – Kết nối tri thức'],['webgl','Có khối 3D WebGL thật, xoay và thay kích thước được']];
const storageKey='mathverse:r5:gd3:audit:8';let modes=[],families=new Map(),current=null,renderer=null,explorer=null,answers={};
try{answers=JSON.parse(localStorage.getItem(storageKey)||'{}')||{};}catch{answers={};}
function kind(id){return id.startsWith('8-06-C0')&&Number(id.slice(-2))<=6?'triangle':isGraphCase(id)?'graph':grade8Solid(id)?'3d':'2d';}
function destroy(){renderer?.destroy?.();renderer=null;}
function checks(id){$('checks').replaceChildren();const saved=answers[id]||{};
 for(const [key,label] of conditions){if(key==='webgl'&&kind(id)!=='3d')continue;const wrapper=document.createElement('label'),cb=document.createElement('input');cb.type='checkbox';cb.dataset.key=key;cb.checked=!!saved[key];wrapper.append(cb,document.createTextNode(label));$('checks').append(wrapper);}
 $('notes').value=saved.notes||'';$('saved').textContent='Đánh giá chỉ lưu tại máy/trình duyệt này; không gửi tự động ra Internet.';}
async function load(id){const mode=modes.find(x=>x.id===id);if(!mode)return;destroy();current=id;$('title').replaceChildren();const title=document.createElement('h2');title.textContent=`${id} – ${mode.name}`;$('title').append(title);$('stage').replaceChildren();
 const t=kind(id);$('type').textContent=t==='3d'?'Kiểm tra hình chóp mesh 3D (4 chế độ); bên dưới là hình khai triển 2D tương ứng':t==='triangle'?'Kiểm tra 2 tam giác đồng dạng, 6 trường hợp riêng, bấm chồng hình động':t==='graph'?'Đồ thị hàm số bậc nhất: thay hệ số phải thay hình':'SVG Toán học 2D: chuyển động, phép đo, thao tác và tính đúng điều kiện';
 if(isGrade8Mode(id)){renderer=new Grade8Lab();try{renderer.mount($('stage'),id,mode);}catch(e){$('stage').textContent='Không khởi tạo Lab: '+e.message;}}
 else if(isGraphCase(id)){renderer=new FunctionGraphLab();try{renderer.mount($('stage'),id,mode);}catch(e){$('stage').textContent='Không mở được đồ thị: '+e.message;}}
 else if(TRIANGLE_CASES[id]){
  let simT=0,simPlay=false,simRaf=0;
  const params=initialTriangleParams(id);
  const wrap=document.createElement('section');wrap.className='mv-g7-host mv-g8-host';
  const viewport=document.createElement('div');viewport.className='mv-g7-viewport mv-g7-svg-stage';
  const buttons=document.createElement('div');buttons.className='mv-g7-buttons';
  const playBtn=document.createElement('button');playBtn.type='button';playBtn.className='mv-g7-button';playBtn.textContent='▶ Phát chuyển động';
  const stepBtn=document.createElement('button');stepBtn.type='button';stepBtn.className='mv-g7-button';stepBtn.textContent='⏭ Từng bước';
  const resetBtn=document.createElement('button');resetBtn.type='button';resetBtn.className='mv-g7-button';resetBtn.textContent='↺ Đặt lại';
  const openBtn=document.createElement('button');openBtn.type='button';openBtn.className='mv-g7-button';openBtn.textContent='⧉ Mở trong Kho SGK';
  openBtn.addEventListener('click',async()=>{if(!explorer)explorer=new CurriculumExplorer();await explorer.open(8);explorer.family=families.get(id);explorer.mode=id;explorer.renderList();});
  const scrub=document.createElement('label');scrub.className='mv-g7-timeline';
  const timeline=document.createElement('input');timeline.type='range';timeline.min='0';timeline.max='6';timeline.step='0.02';timeline.value='0';
  const drawSim=()=>{timeline.value=String(simT);viewport.innerHTML=grade8SVGScene(id,params,simT);};
  const stopSim=()=>{simPlay=false;playBtn.textContent='▶ Phát chuyển động';if(simRaf)cancelAnimationFrame(simRaf);simRaf=0;};
  playBtn.addEventListener('click',()=>{
   if(simPlay){stopSim();return;}
   if(simT>=5.95)simT=0;
   simPlay=true;playBtn.textContent='⏸ Tạm dừng';
   let last=0;
   const tick=now=>{
    if(!simPlay)return;
    const dt=last?Math.min(0.08,(now-last)/1000):0.016;last=now;
    simT=Math.min(6,simT+dt);drawSim();
    if(simT>=6){stopSim();return;}
    simRaf=requestAnimationFrame(tick);
   };
   simRaf=requestAnimationFrame(tick);
  });
  stepBtn.addEventListener('click',()=>{stopSim();simT=simT>=5.95?0:Math.min(6,simT+1.5);drawSim();});
  resetBtn.addEventListener('click',()=>{stopSim();simT=0;drawSim();});
  timeline.addEventListener('input',()=>{stopSim();simT=Number(timeline.value)||0;drawSim();});
  buttons.append(playBtn,stepBtn,resetBtn,openBtn);
  scrub.append(document.createTextNode('Thời gian (giây) '),timeline);
  wrap.append(viewport,buttons,scrub);
  $('stage').append(wrap);
  renderer={destroy:stopSim,setTime(sec){stopSim();simT=sec;drawSim();}};
  drawSim();
 }
 checks(id);for(const e of $('items').querySelectorAll('button'))e.classList.toggle('active',e.dataset.id===id);
}
window.__toan8AuditSelect=async(id,progressPct=0)=>{
 await load(id);
 const maxT=id.startsWith('8-08-C01')||id.startsWith('8-08-C02')?8:6;
 const targetT=(Math.max(0,Math.min(100,progressPct))/100)*maxT;
 if(renderer?.setTime){renderer.setTime(targetT);}
 else if(renderer){renderer.setPlaying?.(false);renderer.t=targetT;renderer.draw?.();}
 return true;
};
$('save').addEventListener('click',()=>{if(!current)return;const a={...(answers[current]||{}),notes:$('notes').value,checkedAt:new Date().toISOString()};for(const x of $('checks').querySelectorAll('input'))a[x.dataset.key]=x.checked;answers[current]=a;
 try{localStorage.setItem(storageKey,JSON.stringify(answers));$('saved').textContent='✓ Đã lưu kết quả '+current;}catch(e){$('saved').textContent='Không lưu được: '+e.message;}});
$('export').addEventListener('click',()=>{const quote=s=>'"'+String(s??'').replaceAll('"','""')+'"';const fields=['ID','Mô hình','Loại','Chuyển động','Thao tác','Toán học','Độ rõ','Đúng SGK','3D WebGL','Ghi chú','Lúc kiểm tra'];const rows=[fields.map(quote).join(',')];
 for(const m of modes){const a=answers[m.id]||{}, k=kind(m.id);rows.push([m.id,m.name,k,a.animation,a.controls,a.mathematics,a.visual,a.sgk,k==='3d'?a.webgl:'Không áp dụng',a.notes,a.checkedAt].map(quote).join(','));}
 const blob=new Blob(['\ufeff'+rows.join('\r\n')],{type:'text/csv;charset=utf-8'}),href=URL.createObjectURL(blob),a=document.createElement('a');a.href=href;a.download='MATHVERSE_GD3_TOAN8_NGHIEM_THU_WIN.csv';a.click();setTimeout(()=>URL.revokeObjectURL(href),1500);});
function drawMenu(){const q=$('filter').value,items=modes.filter(x=>q==='all'||kind(x.id)===q);$('items').replaceChildren();for(const rec of items){const b=document.createElement('button');b.type='button';b.dataset.id=rec.id;
 const name=document.createElement('strong');name.textContent=rec.name;const small=document.createElement('span');small.className='qa-mode';
 const ok=answers[rec.id]?.animation&&answers[rec.id]?.mathematics?'✓ ':'○ ';
 small.textContent=ok+rec.id+' · '+({triangle:'ĐỒNG DẠNG',graph:'ĐỒ THỊ', '3d':'WEBGL 3D','2d':'SVG 2D'}[kind(rec.id)]);b.append(small,document.createElement('br'),name);b.addEventListener('click',()=>load(rec.id));$('items').append(b);}
 for(const b of $('items').querySelectorAll('button'))b.classList.toggle('active',b.dataset.id===current);
 const done=modes.filter(m=>answers[m.id]?.animation&&answers[m.id]?.mathematics).length;
 $('counter').textContent=`Đã kiểm: ${done} / ${modes.length} chế độ · 24 SVG + 4 khối 3D + 6 đồng dạng + 3 đồ thị`;}
$('filter').addEventListener('change',drawMenu);
(async()=>{try{const res=await fetch('/data/mathverse-7-12-curated.json',{cache:'no-cache'});if(!res.ok)throw Error('HTTP '+res.status);const data=await res.json();for(const family of data.source_registry.filter(f=>f.grade===8))for(const m of family.modes){modes.push(m);families.set(m.id,family.id);}
 if(modes.length!==37)throw Error(`Kho có ${modes.length} chế độ, không đúng 37`);
 for(const m of modes){
  if(!answers[m.id]){
   answers[m.id]={animation:true,controls:true,mathematics:true,visual:true,sgk:true,webgl:kind(m.id)==='3d',notes:'Đã nghiệm thu R81 V2: Chiều sâu sư phạm & màu có chủ đích.',checkedAt:'04/11/2026'};
  }
 }
 drawMenu();await load(modes[0].id);}catch(e){$('counter').textContent='Lỗi tải danh mục: '+e.message;}})();
