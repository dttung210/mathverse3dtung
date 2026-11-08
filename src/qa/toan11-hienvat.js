import {Solid3DViewer} from '../viewers/Solid3DViewer.js?v=r107_v15';
import {createMathModel,disposeObject} from '../geometry.js?v=r107_v15';
const el=id=>document.getElementById(id);
const checklist=['Đúng tên và yếu tố hình học','Có hình nhìn được, nhãn không lẫn','Xoay được góc nhìn Three.js','Đúng loại quan hệ không gian hoặc khối có thể tích','Thay đổi trạng thái (0% → 50% → 100%) không lỗi','Không lỗi WebGL trên máy Windows'];
const key=id=>'mathverse:qa:grade11:exhibit:'+id;
const types=['frustumPyramid']; // Eight spatial relationships and one volumetric frustum pyramid.
const EXHIBIT_META={
 g11_01:{lab:'11-05-C02',story:'Cảnh 1: Mặt (P) chuẩn (#1D4ED8) → Cảnh 2: Mặt (Q) nghiêng (#B45309) → Cảnh 3: Xuất hiện giao tuyến d = (P) ∩ (Q) (#6D28D9) → Cảnh 4: Đổi góc nghiêng, kiểm chứng mọi điểm chung thuộc d.',animate:(base,pct)=>({...base,angle:Math.round(25+(base.angle||55)*0.8*(0.3+0.7*pct/100))})},
 g11_02:{lab:'11-05-C03',story:'Cảnh 1: Đường d₁ ⊂ (P) (#1D4ED8) và d₂ ⊂ (Q) (#B45309) → Cảnh 2: Dựng d₁\' ∥ d₁ xác định góc φ → Cảnh 3: Hạ đoạn vuông góc chung HK (#6D28D9) → Cảnh 4: Chốt khoảng cách d(d₁, d₂) = HK.',animate:(base,pct)=>({...base,dist:Number((1.2+(base.dist||2.2)*0.55*(0.4+0.6*pct/100)).toFixed(2)),angle:Math.round(35+35*(pct/100))})},
 g11_03:{lab:'11-06-C02',story:'Cảnh 1: Mặt (P) (#1D4ED8) và đường d\' ⊂ (P) (#047857) → Cảnh 2: Nâng đường d ∥ d\' (#B45309) ra ngoài (P) → Cảnh 3: Mặt phẳng phụ chứa (d, d\') → Cảnh 4: Đo khoảng cách d(d, (P)) (#6D28D9).',animate:(base,pct)=>({...base,dist:Number((1.0+(base.dist||2.2)*(0.35+0.65*pct/100)).toFixed(2)),angle:Math.round((base.angle||35)+25*(pct/100))})},
 g11_04:{lab:'11-06-C03',story:'Cảnh 1: Hai đường cắt nhau a₁, a₂ ⊂ (P) (#1D4ED8) → Cảnh 2: Hai đường b₁ ∥ a₁, b₂ ∥ a₂ ⊂ (Q) (#047857) → Cảnh 3: Pháp tuyến chung HK ⊥ (P), (Q) (#6D28D9) → Cảnh 4: Chốt (P) ∥ (Q) và khoảng cách HK.',animate:(base,pct)=>({...base,dist:Number((1.4+(base.dist||2.6)*(0.35+0.65*pct/100)).toFixed(2))})},
 g11_05:{lab:'11-07-C02',story:'Cảnh 1: Hai đường cắt nhau a, b ⊂ (P) tại H → Cảnh 2: Dựng đường vuông góc AH ⊥ (P) (#6D28D9) → Cảnh 3: Đường xiên AB (#B45309) và hình chiếu HB (#047857) → Cảnh 4: Định lý 3 đường vuông góc d ⊥ HB ⇔ d ⊥ AB.',animate:(base,pct)=>({...base,h:Number((1.8+(base.h||3.2)*(0.35+0.65*pct/100)).toFixed(2)),slant:Math.round(42+20*(pct/100))})},
 g11_06:{lab:'11-07-C03',story:'Cảnh 1: Mặt đáy (P) (#1D4ED8) và giao tuyến d (#6D28D9) → Cảnh 2: Dựng tia pháp tuyến a ⊥ (P) (#047857) → Cảnh 3: Mặt phẳng (Q) chứa a dựng vuông góc (P) (#B45309) → Cảnh 4: Ký hiệu góc vuông nhị diện 90° (#6D28D9).',animate:(base,pct)=>({...base,h:Number((2.2+(base.h||3.5)*(0.4+0.6*pct/100)).toFixed(2))})},
 g11_07:{lab:'11-08-C01',story:'Cảnh 1: Đường xiên AB (#B45309) cắt (P) tại B → Cảnh 2: Hạ AH ⊥ (P) tìm chân đường vuông góc H → Cảnh 3: Nối hình chiếu HB ⊂ (P) (#047857) → Cảnh 4: Khắc cung góc φ = (AB, HB) (#6D28D9).',animate:(base,pct)=>({...base,deg:Math.round(25+((base.deg||50)-15)*(0.3+0.7*pct/100))})},
 g11_08:{lab:'11-08-C02',story:'Cảnh 1: Cạnh nhị diện d (#6D28D9) và nửa mặt phẳng (P) (#1D4ED8) → Cảnh 2: Mở nửa mặt phẳng (Q) (#B45309) quanh d → Cảnh 3: Dựng Ox ⊥ d, Oy ⊥ d tại O → Cảnh 4: Đo góc phẳng nhị diện φ = ∠xOy (#6D28D9).',animate:(base,pct)=>({...base,deg:Math.round(25+((base.deg||65))*(0.25+0.75*pct/100))})},
 g11_09:{lab:'11-09-C03',story:'Cảnh 1: Đáy lớn S₁ = a² (#1D4ED8) và đường nối tâm đỉnh S → Cảnh 2: Cắt song song tạo đáy nhỏ S₂ = b² (#047857) → Cảnh 3: Lát cắt trung bình (#B45309) và đường cao h (#6D28D9) → Cảnh 4: Công thức V = ⅓h(S₁ + S₂ + √(S₁S₂)).',animate:(base,pct)=>({...base,h:Number((1.8+(base.h||3.2)*(0.35+0.65*pct/100)).toFixed(2)),b:Number((1.4+(base.b||2.2)*(0.45+0.55*pct/100)).toFixed(2))})}
};
let items=[],selected=null,viewer=null,animTimer=0,curPct=100;
function existing(id){try{return JSON.parse(localStorage.getItem(key(id))||'{}')}catch{return {}}}
function stopAnim(){if(animTimer){clearInterval(animTimer);animTimer=0;}}
function dispose(){stopAnim();try{viewer?.dispose?.()}catch{}viewer=null;}
function isSolid(ex){return types.includes(ex.type)}
function setExhibitProgress(ex,pct){
 curPct=Number(pct);
 const meta=EXHIBIT_META[ex.id];
 const nextParams=meta?.animate?meta.animate(ex.params,curPct):ex.params;
 if(viewer&&typeof viewer.updateParameters==='function'){
  viewer.updateParameters(nextParams);
 }
 const stageNote=el('r84-exhibit-stage');
 if(stageNote&&meta){
  const idx=curPct<25?1:curPct<60?2:curPct<90?3:4;
  stageNote.textContent=`Tiến trình ${curPct}% (Cảnh ${idx}/4) · ${meta.story}`;
 }
}
function show(ex,initialPct=100){
 dispose();selected=ex.id;curPct=initialPct;
 const meta=EXHIBIT_META[ex.id]||{lab:'11-05-C01',story:''};
 el('title').textContent=ex.id+' · '+ex.title;
 el('desc').innerHTML=`Loại: <strong>${ex.type}</strong> (${isSolid(ex)?'khối 3D có thể tích':'quan hệ đường–mặt trong không gian 3D'}) · Tham số gốc: <code>${JSON.stringify(ex.params)}</code> · <a href="/src/qa/toan11-audit.html?id=${meta.lab}" style="color:#1D4ED8;font-weight:700;text-decoration:underline">🔗 Mở Lab tương ứng (${meta.lab})</a>`;
 el('viewer').replaceChildren();
 el('viewer').style.height='470px';
 el('renderstatus').textContent='Đang kiểm tra WebGL...';
 try{
  const initParams=meta.animate?meta.animate(ex.params,curPct):ex.params;
  const exInit={...ex,params:initParams};
  const m=createMathModel(exInit,{faces:true,edges:true,labels:false});
  let count=0;m.traverse(o=>{if(o.isMesh)count++});disposeObject(m);
  if(!count)throw Error('Không dựng được mesh');
  viewer=new Solid3DViewer(exInit);
  viewer.mount(el('viewer'));
  el('viewer').style.height='470px';
  viewer._onResize?.();
  viewer.setToolMode('orbit');viewer.setShowHandles(false);viewer.setViewPreset('iso');
  el('renderstatus').textContent=`✓ Đã dựng ${count} mesh Three.js chuẩn R84 (#1D4ED8 gốc · #047857 đối chiếu · #B45309 đang dựng · #6D28D9 kết quả).`;
 }catch(error){
  el('renderstatus').textContent='⚠ Không hiển thị được WebGL: '+error.message;dispose();
 }
 let ctrlBar=el('r84-exhibit-controls');
 if(!ctrlBar){
  ctrlBar=document.createElement('div');
  ctrlBar.id='r84-exhibit-controls';
  ctrlBar.style.cssText='display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0;padding:10px 12px;background:#F8FAFC;border:1px solid #CBD5E1;border-radius:10px;';
  el('viewer').insertAdjacentElement('afterend',ctrlBar);
 }
 ctrlBar.replaceChildren();
 for(const pct of [0,50,100]){
  const btn=document.createElement('button');btn.type='button';btn.textContent=`Mốc ${pct}%`;
  btn.style.cssText='padding:6px 12px;border-radius:7px;border:1px solid #1D4ED8;background:#EFF6FF;color:#1E3A8A;font-weight:700;cursor:pointer;';
  btn.addEventListener('click',()=>{stopAnim();setExhibitProgress(ex,pct);});
  ctrlBar.append(btn);
 }
 const playBtn=document.createElement('button');playBtn.type='button';playBtn.textContent='▶ Phát chuyển động 4 cảnh';
 playBtn.style.cssText='padding:6px 12px;border-radius:7px;border:1px solid #6D28D9;background:#F5F3FF;color:#6D28D9;font-weight:700;cursor:pointer;';
 playBtn.addEventListener('click',()=>{
  if(animTimer){stopAnim();playBtn.textContent='▶ Phát chuyển động 4 cảnh';return;}
  curPct=0;setExhibitProgress(ex,0);playBtn.textContent='⏸ Đang chạy...';
  animTimer=setInterval(()=>{
   curPct=Math.min(100,curPct+5);
   setExhibitProgress(ex,curPct);
   if(curPct>=100){stopAnim();playBtn.textContent='▶ Phát chuyển động 4 cảnh';}
  },160);
 });
 ctrlBar.append(playBtn);
 const stageNote=document.createElement('div');stageNote.id='r84-exhibit-stage';
 stageNote.style.cssText='width:100%;font-size:12.5px;color:#334155;font-weight:600;margin-top:4px;';
 ctrlBar.append(stageNote);
 setExhibitProgress(ex,curPct);

 for(const b of el('items').querySelectorAll('button'))b.setAttribute('aria-current',String(b.dataset.id===ex.id));
 const saved=existing(ex.id);el('checks').replaceChildren();
 for(let i=0;i<checklist.length;i++){
  const lab=document.createElement('label');const cb=document.createElement('input');
  cb.type='checkbox';cb.dataset.key='check'+i;cb.checked=!!saved['check'+i];
  lab.append(cb,document.createTextNode(checklist[i]));el('checks').append(lab);
 }
 el('notes').value=saved.notes||'';
 el('saved').textContent=saved.at?'Đã đánh giá: '+saved.at:'Chưa xác nhận trên Windows';
}
window.__toan11ExhibitSelect=(id,pct=100)=>{const ex=items.find(x=>x.id===id);if(!ex)return;if(selected===id&&viewer){stopAnim();setExhibitProgress(ex,pct);}else show(ex,pct);};
function csv(values){const q=x=>'"'+String(x??'').replaceAll('"','""')+'"';return '\uFEFF'+values.map(row=>row.map(q).join(',')).join('\r\n');}
el('save').addEventListener('click',()=>{if(!selected)return;const state={id:selected,at:new Date().toLocaleString('vi-VN'),notes:el('notes').value};for(const a of el('checks').querySelectorAll('input'))state[a.dataset.key]=a.checked;try{localStorage.setItem(key(selected),JSON.stringify(state));el('saved').textContent='Đã lưu: '+state.at;}catch(e){el('saved').textContent='Không lưu được: '+e.message;}});
el('export').addEventListener('click',()=>{const rows=[['ID','Hien vat','Loai','Khoi 3D',...checklist,'Ghi chu','Thoi diem']];for(const m of items){const state=existing(m.id);rows.push([m.id,m.title,m.type,isSolid(m)?'CO':'KHONG',...checklist.map((_,i)=>state['check'+i]?'DAT':'CHUA_XAC_NHAN'),state.notes||'',state.at||'']);}const url=URL.createObjectURL(new Blob([csv(rows)],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='MATHVERSE_R84_NGHIEM_THU_9_HIEN_VAT_TOAN11.csv';a.click();URL.revokeObjectURL(url);});
(async()=>{try{const res=await fetch('/data/catalog.json');if(!res.ok)throw Error('HTTP '+res.status);const catalog=await res.json();items=(catalog.items||[]).filter(x=>Number(x.grade)===11);if(items.length!==9)throw Error('Dữ liệu khác 9 hiện vật: '+items.length);el('counter').textContent='9 hiện vật không gian Three.js (R84), gồm 8 quan hệ đường–mặt và 1 hình chóp cụt có thể tích';for(const m of items){const b=document.createElement('button');b.type='button';b.dataset.id=m.id;b.textContent=`${m.id} · ${m.title}`;b.addEventListener('click',()=>show(m,100));el('items').append(b);}const urlParams=new URLSearchParams(window.location.search);const reqId=urlParams.get('id'),reqPct=urlParams.get('pct');const initEx=(reqId&&items.find(x=>x.id===reqId))||items[0];show(initEx,reqPct!==null?Number(reqPct):100);}catch(e){el('counter').textContent='Không nạp được danh mục: '+e.message;}})();
window.addEventListener('beforeunload',dispose);
