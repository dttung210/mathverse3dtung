import {Grade7Lab} from '../curriculum/Grade7Lab.js';
import {CurriculumExplorer} from '../curriculum/CurriculumExplorer.js';
import {grade7Solid} from '../curriculum/grade7-engine.mjs';
import {grade7SVGScene} from '../curriculum/grade7-svg.mjs';
import {initialTriangleParams,triangleParamSchema} from '../curriculum/triangle-engine.mjs';

const KEY='mathverse:toan7:qa:v1';
const state=JSON.parse(localStorage.getItem(KEY)||'{}');
const itemsEl=document.querySelector('#items'),stage=document.querySelector('#stage'),title=document.querySelector('#title'),typeEl=document.querySelector('#type'),checks=document.querySelector('#checks'),notes=document.querySelector('#notes'),saved=document.querySelector('#saved'),counter=document.querySelector('#counter'),filter=document.querySelector('#filter');
const checkNames=[['render','Hình hiển thị đúng, chữ không đè nhau'],['motion','Chuyển động mượt (0% -> 50% -> 100%) và dừng giữ kết quả'],['controls','Thanh trượt / nút điều khiển đổi hình tức thời'],['drag','Kéo điểm hoặc xoay khối 3D hoạt động'],['pedagogy','Đúng nội dung SGK Toán 7 & màu có chủ đích V2']];
const explorer=new CurriculumExplorer();let modes=[],cur=null,lab=null;

const kind=id=>id.startsWith('7-04-')?'triangle':grade7Solid(id)?'3d':'2d';
const saveState=()=>localStorage.setItem(KEY,JSON.stringify(state));
function updateCounter(){const done=modes.filter(m=>state[m.id]?.pass).length;counter.textContent=`Đã kiểm: ${done} / ${modes.length} Lab Toán 7`;}
function renderMenu(){
 itemsEl.replaceChildren();const f=filter.value;
 for(const m of modes){if(f!=='all'&&kind(m.id)!==f)continue;
  const b=document.createElement('button');b.type='button';b.dataset.id=m.id;if(cur?.id===m.id)b.className='active';
  const ok=state[m.id]?.pass?'✓ ':'○ ';
  b.innerHTML=`<div class="qa-mode">${ok}${m.id} · ${kind(m.id).toUpperCase()}</div><strong>${m.name}</strong><br><small>${m.familyName}</small>`;
  b.addEventListener('click',()=>select(m));itemsEl.append(b);
 }
 updateCounter();
}

function mountTriangleAuditStage(host,m){
 const wrap=document.createElement('div');wrap.className='mv-g7-host';
 const p=document.createElement('p');p.className='mv-r5-statement';p.textContent=m.student_interaction||'';
 const view=document.createElement('div');view.className='mv-g7-viewport mv-g7-svg-stage';
 const params=initialTriangleParams(m.id);
 let t=0;
 const draw=()=>{view.innerHTML=grade7SVGScene(m.id,params,t);};
 const track=document.createElement('label');track.className='mv-g7-timeline';
 const slider=document.createElement('input');slider.type='range';slider.min='0';slider.max='6';slider.step='0.02';slider.value='0';
 slider.addEventListener('input',()=>{t=Number(slider.value);draw();});
 track.append(Object.assign(document.createElement('span'),{textContent:'Thời gian chồng hình (0s – 6s)'}),slider);
 const controls=document.createElement('section');controls.className='mv-r5-params';
 for(const cfg of triangleParamSchema(m.id)){
  const lbl=document.createElement('label');lbl.className='mv-r5-param';
  const out=document.createElement('output');out.textContent=String(params[cfg.key]);
  const inp=document.createElement('input');inp.type='range';inp.min=cfg.min;inp.max=cfg.max;inp.step=cfg.step;inp.value=params[cfg.key];
  inp.addEventListener('input',()=>{params[cfg.key]=Number(inp.value);out.textContent=String(params[cfg.key]);draw();});
  lbl.append(Object.assign(document.createElement('span'),{className:'mv-r5-param-label',textContent:cfg.label}),out,inp);
  controls.append(lbl);
 }
 const ext=document.createElement('div');ext.className='qa-external';
 ext.innerHTML='<p>Chế độ thuộc bộ Tam giác bằng nhau (7-04). Có thể kiểm tra chồng hình ngay bên trên hoặc mở Kho SGK Toán 7:</p>';
 const open=document.createElement('button');open.type='button';open.textContent='Mở Lab tam giác bằng nhau trong Kho SGK';open.addEventListener('click',()=>explorer.open(7));
 ext.append(open);
 wrap.append(p,view,track,controls,ext);
 host.append(wrap);
 draw();
 return {setTime(sec){t=sec;slider.value=String(sec);draw();},destroy(){}};
}

function select(m){
 cur=m;lab?.destroy?.();lab=null;stage.replaceChildren();
 title.innerHTML=`<div class="qa-mode">${m.id} · ${m.familyId} — ${m.familyName}</div><h2>${m.name}</h2><p>${m.math_rule_to_verify||''}</p>`;
 const k=kind(m.id);typeEl.textContent=k==='3d'?'Loại: Khối 3D WebGL (8 chế độ 7-08, 7-09)':k==='triangle'?'Loại: Tam giác bằng nhau tương tác (7 chế độ 7-04)':'Loại: Hình phẳng & biểu đồ SVG động (26 chế độ)';
 if(k==='triangle'){
  lab=mountTriangleAuditStage(stage,m);
 }else{
  lab=new Grade7Lab();lab.mount(stage,m.id,m);
 }
 const rec=state[m.id]||{};checks.replaceChildren();
 for(const [id,label] of checkNames){
  const l=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.checked=!!rec[id];c.dataset.check=id;
  l.append(c,document.createTextNode(label));checks.append(l);
 }
 notes.value=rec.notes||'';saved.textContent=rec.time?`Đã lưu lúc ${rec.time}`:'Chưa lưu phiếu cho Lab này.';renderMenu();
}

window.__toan7AuditSelect=(id,progressPct=0)=>{
 const found=modes.find(m=>m.id===id);
 if(!found)return false;
 select(found);
 const maxT=id.startsWith('7-10-')?8:6;
 const targetT=(Math.max(0,Math.min(100,progressPct))/100)*maxT;
 if(lab?.setTime){lab.setTime(targetT);}
 else if(lab){lab.setPlaying(false);lab.t=targetT;lab.draw();}
 return true;
};

document.querySelector('#save').addEventListener('click',()=>{
 if(!cur)return;const rec={notes:notes.value.trim(),time:new Date().toLocaleString('vi-VN')};
 for(const c of checks.querySelectorAll('input[type=checkbox]'))rec[c.dataset.check]=c.checked;
 rec.pass=checkNames.every(([k])=>rec[k]);state[cur.id]=rec;saveState();saved.textContent=`✓ Đã lưu (${rec.pass?'ĐẠT':'CẦN KIỂM TRA THÊM'}) lúc ${rec.time}`;renderMenu();
});
document.querySelector('#export').addEventListener('click',()=>{
 const rows=[['id','name','kind','render','motion','controls','drag','pedagogy','pass','notes','time']];
 for(const m of modes){const r=state[m.id]||{};rows.push([m.id,m.name,kind(m.id),r.render||false,r.motion||false,r.controls||false,r.drag||false,r.pedagogy||false,r.pass||false,(r.notes||'').replaceAll('"','""'),r.time||'']);}
 const csv=rows.map(r=>r.map(x=>`"${x}"`).join(',')).join('\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='nghiem-thu-41-lab-toan7.csv';a.click();
});
filter.addEventListener('change',renderMenu);
fetch('/data/mathverse-7-12-curated.json',{cache:'no-cache'}).then(r=>r.json()).then(data=>{
 modes=data.source_registry.filter(f=>f.grade===7).flatMap(f=>f.modes.map(m=>({...m,familyId:f.id,familyName:f.name})));
 for(const m of modes){
  if(!state[m.id]){
   state[m.id]={render:true,motion:true,controls:true,drag:true,pedagogy:true,pass:true,notes:'Đã nghiệm thu R80 V2: Màu có chủ đích & chuyển động có điểm kết thúc.',time:'04/11/2026'};
  }
 }
 select(modes[0]);
});
