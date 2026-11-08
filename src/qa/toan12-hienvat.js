import {Solid3DViewer} from '../viewers/Solid3DViewer.js';
import {createMathModel,disposeObject} from '../geometry.js';
const el=id=>document.getElementById(id);
const checklist=['Đúng tên và yếu tố hình học','Có hình nhìn được, nhãn không lẫn','Xoay được góc nhìn Three.js','Đúng loại quan hệ không gian hoặc khối có thể tích','Thay đổi trạng thái mà không lỗi','Không lỗi WebGL trên máy Windows'];
const key=id=>'mathverse:qa:grade12:exhibit:'+id;
const types=['revolvedSolid','oxyzSphere']; // Exactly two volumetric exhibits; the others are curves or Oxyz spatial relations.
const STORYBOARDS={
 g12_01:{lab:'12-02-C01',stages:['Cảnh 1 (0%): Đường cong bậc ba y = ax³+bx²+cx+d (#1D4ED8)','Cảnh 2 (50%): Hai điểm cực trị CĐ, CT (#15803D) và tiếp tuyến ngang (#C2410C)','Cảnh 3 (75%): Điểm uốn U(-b/3a; f(U)) (#7C3AED) và tiếp tuyến tại U','Cảnh 4 (100%): Tâm đối xứng U của đồ thị hàm bậc ba']},
 g12_02:{lab:'12-02-C02',stages:['Cảnh 1 (0%): Hai nhánh hyperbol phân thức y = (ax+b)/(cx+d) (#1D4ED8)','Cảnh 2 (50%): Tiệm cận đứng x = -d/c (#B91C1C) và tiệm cận ngang y = a/c (#15803D)','Cảnh 3 (75%): Giao điểm hai tiệm cận I(-d/c; a/c) (#7C3AED)','Cảnh 4 (100%): Tâm đối xứng I và kiểm tra điều kiện suy biến ad-bc=0']},
 g12_03:{lab:'12-07-C01',stages:['Cảnh 1 (0%): Đường sinh r(x) và trục quay Ox (#9A3412)','Cảnh 2 (50%): Quét góc quay quanh trục Ox tạo mặt tròn xoay (#1D4ED8)','Cảnh 3 (75%): Thiết diện tròn S(x) = πr(x)² (#7C3AED) vuông góc Ox','Cảnh 4 (100%): Khối tròn xoay hoàn chỉnh V = π∫r(x)²dx']},
 g12_04:{lab:'12-04-C01',stages:['Cảnh 1 (0%): Ba trục tọa độ vuông góc Ox (#9A3412), Oy (#15803D), Oz (#1D4ED8)','Cảnh 2 (50%): Ba mặt phẳng tọa độ (Oxy), (Oyz), (Ozx)','Cảnh 3 (75%): Điểm M(x;y;z) và hình hộp chữ nhật chiếu vuông góc (#64748B)','Cảnh 4 (100%): Vectơ vị trí OM (#7C3AED) trong hệ trục Oxyz']},
 g12_05:{lab:'12-04-C02',stages:['Cảnh 1 (0%): Gốc O và điểm cuối M(x;y;z) trong Oxyz','Cảnh 2 (50%): Hình chiếu M₁(x;y;0) trên mặt phẳng (Oxy) (#15803D)','Cảnh 3 (75%): Dựng cao độ z (#C2410C) và hình hộp tọa độ (#64748B)','Cảnh 4 (100%): Vectơ OM = (x;y;z) (#7C3AED) và độ dài |OM| = √(x²+y²+z²)']},
 g12_06:{lab:'12-10-C01',stages:['Cảnh 1 (0%): Tâm I(x;y;z) và đường gióng xuống (Oxy) (#64748B)','Cảnh 2 (50%): Bán kính IM = R (#7C3AED) và 3 đường tròn lớn qua tâm I','Cảnh 3 (75%): Mặt cầu (S) (#1D4ED8) bao quanh quỹ tích IM = R','Cảnh 4 (100%): Phương trình (x-a)²+(y-b)²+(z-c)² = R²']},
 g12_07:{lab:'12-08-C01',stages:['Cảnh 1 (0%): Điểm M₀ thuộc mặt phẳng (P) và vectơ pháp tuyến n(A;B;C) (#C2410C)','Cảnh 2 (50%): Vectơ M₀M nằm trên mặt phẳng (P) (#15803D)','Cảnh 3 (75%): Ký hiệu góc vuông n ⊥ M₀M tại M₀ (#7C3AED)','Cảnh 4 (100%): Mặt phẳng (P): Ax+By+Cz+D = 0 (#2563EB)']},
 g12_08:{lab:'12-09-C01',stages:['Cảnh 1 (0%): Điểm gốc M₀(x₀;y₀;z₀) (#15803D) trong không gian Oxyz','Cảnh 2 (50%): Vectơ chỉ phương u(u₁;u₂;u₃) (#C2410C) đặt tại M₀','Cảnh 3 (75%): Điểm động M(t) = M₀ + t·u (#7C3AED) trượt dọc đường thẳng','Cảnh 4 (100%): Đường thẳng d (#1D4ED8) hoàn chỉnh trong Oxyz']},
 g12_09:{lab:'12-08-C03',stages:['Cảnh 1 (0%): Mặt phẳng (P) (#2563EB) và điểm M₀ ngoài mặt phẳng','Cảnh 2 (50%): Hạ đoạn vuông góc M₀H ⊥ (P) (#7C3AED) song song pháp tuyến n (#C2410C)','Cảnh 3 (75%): So sánh đoạn vuông góc M₀H với đường xiên M₀A (#15803D)','Cảnh 4 (100%): Khoảng cách ngắn nhất d(M₀,(P)) = M₀H']}
};
let items=[],selected=null,viewer=null,currentEx=null,currentPct=100;
function existing(id){try{return JSON.parse(localStorage.getItem(key(id))||'{}')}catch{return {}}}
function dispose(){try{viewer?.dispose?.()}catch{}viewer=null;}
function isSolid(ex){return types.includes(ex.type)}
function scaledParams(ex,pct=100){
 const p={...ex.params},f=Math.max(0,Math.min(100,Number(pct)||0))/100,sc=0.35+0.65*f;
 if(ex.type==='cubicCurve')return {...p,a:Number((p.a*sc).toFixed(3))};
 if(ex.type==='rationalFunc')return {...p,a:Number((p.a*sc).toFixed(3))};
 if(ex.type==='revolvedSolid')return {...p,r2:Number((p.r1+(p.r2-p.r1)*sc).toFixed(3))};
 if(ex.type==='oxyzAxes')return {...p,len:Number((p.len*(0.65+0.35*f)).toFixed(3))};
 if(ex.type==='oxyzVector')return {...p,x:Number((p.x*sc).toFixed(3)),y:Number((p.y*sc).toFixed(3)),z:Number((p.z*sc).toFixed(3))};
 if(ex.type==='oxyzSphere')return {...p,r:Number((p.r*(0.45+0.55*f)).toFixed(3))};
 if(ex.type==='oxyzPlane')return {...p,D:Number((p.D*sc).toFixed(3))};
 if(ex.type==='oxyzLine')return {...p,u3:Number((p.u3*sc).toFixed(3))};
 if(ex.type==='oxyzDistance')return {...p,z:Number((p.d+(p.z-p.d)*sc).toFixed(3))};
 return p;
}
function setExhibitProgress(pct=100){
 if(!currentEx||!viewer)return;
 currentPct=Math.max(0,Math.min(100,Number(pct)||0));
 const f=currentPct/100;
 const nextParams=scaledParams(currentEx,currentPct);
 viewer.updateParameters(nextParams);
 if(currentEx.type==='revolvedSolid'&&viewer.setRevolutionProgress){
  viewer.setRevolutionProgress(Math.max(0.2,0.2+0.8*f));
 }
 const sb=STORYBOARDS[currentEx.id];
 const stageIdx=f<0.25?0:f<0.55?1:f<0.85?2:3;
 const stageText=sb?sb.stages[stageIdx]:'';
 el('desc').textContent=`Loại: ${currentEx.type}; ${isSolid(currentEx)?'khối 3D thật':'quan hệ đường–mặt thực trong không gian 3D'} · Tiến trình ${currentPct}% · ${stageText} · Lab đối chiếu: ${sb?.lab||'Toán 12'}`;
}
function ensureMilestoneControls(){
 if(document.getElementById('r85-exhibit-milestones'))return;
 const bar=document.createElement('div');
 bar.id='r85-exhibit-milestones';
 bar.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin:8px 0;align-items:center;';
 for(const pct of [0,50,100]){
  const b=document.createElement('button');
  b.type='button';
  b.textContent=`Mốc ${pct}%`;
  b.addEventListener('click',()=>setExhibitProgress(pct));
  bar.append(b);
 }
 el('viewer')?.parentElement?.insertBefore(bar,el('viewer'));
}
function show(ex,pct=100){
 ensureMilestoneControls();
 el('viewer').style.minHeight='470px';
 el('viewer').style.height='470px';
 if(selected!==ex.id||!viewer){
  dispose();selected=ex.id;currentEx=ex;el('title').textContent=ex.id+' · '+ex.title;
  el('viewer').replaceChildren();el('renderstatus').textContent='Đang kiểm tra WebGL...';
  try{const m=createMathModel(ex,{faces:true,edges:true,labels:false});let count=0;m.traverse(o=>{if(o.isMesh)count++});disposeObject(m);if(!count)throw Error('Không dựng được mesh');viewer=new Solid3DViewer(ex);viewer.mount(el('viewer'));viewer.setToolMode('orbit');viewer.setShowHandles(false);viewer.setViewPreset('iso');el('renderstatus').textContent=`Đã gọi Three.js và dựng ${count} mesh (R85 Palette); cô cần xác nhận hình thực tế và khả năng xoay.`;}catch(error){el('renderstatus').textContent='⚠ Không hiển thị được WebGL: '+error.message;dispose();}
  for(const b of el('items').querySelectorAll('button'))b.setAttribute('aria-current',String(b.dataset.id===ex.id));
  const saved=existing(ex.id);el('checks').replaceChildren();for(let i=0;i<checklist.length;i++){const lab=document.createElement('label');const cb=document.createElement('input');cb.type='checkbox';cb.dataset.key='check'+i;cb.checked=!!saved['check'+i];lab.append(cb,document.createTextNode(checklist[i]));el('checks').append(lab);}el('notes').value=saved.notes||'';el('saved').textContent=saved.at?'Đã đánh giá: '+saved.at:'Chưa xác nhận trên Windows';
 }
 setExhibitProgress(pct);
}
window.__toan12ExhibitSelect=(id,pct=100)=>{const ex=items.find(x=>x.id===id);if(ex)show(ex,pct);};
function csv(values){const q=x=>'"'+String(x??'').replaceAll('"','""')+'"';return '\uFEFF'+values.map(row=>row.map(q).join(',')).join('\r\n');}
el('save').addEventListener('click',()=>{if(!selected)return;const state={id:selected,at:new Date().toLocaleString('vi-VN'),notes:el('notes').value};for(const a of el('checks').querySelectorAll('input'))state[a.dataset.key]=a.checked;try{localStorage.setItem(key(selected),JSON.stringify(state));el('saved').textContent='Đã lưu: '+state.at;}catch(e){el('saved').textContent='Không lưu được: '+e.message;}});
el('export').addEventListener('click',()=>{const rows=[['ID','Hien vat','Loai','Khoi 3D',...checklist,'Ghi chu','Thoi diem']];for(const m of items){const state=existing(m.id);rows.push([m.id,m.title,m.type,isSolid(m)?'CO':'KHONG',...checklist.map((_,i)=>state['check'+i]?'DAT':'CHUA_XAC_NHAN'),state.notes||'',state.at||'']);}const url=URL.createObjectURL(new Blob([csv(rows)],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='MATHVERSE_GD7_NGHIEM_THU_9_HIEN_VAT_TOAN12.csv';a.click();URL.revokeObjectURL(url);});
(async()=>{try{const res=await fetch('/data/catalog.json');if(!res.ok)throw Error('HTTP '+res.status);const catalog=await res.json();items=(catalog.items||[]).filter(x=>Number(x.grade)===12);if(items.length!==9)throw Error('Dữ liệu khác 9 hiện vật: '+items.length);el('counter').textContent='9 hiện vật Three.js (R85): 2 khối có thể tích, 7 mô hình điểm–vectơ–đường cong–đường/mặt trong không gian';for(const m of items){const b=document.createElement('button');b.type='button';b.dataset.id=m.id;b.textContent=`${m.id} · ${m.title}`;b.addEventListener('click',()=>show(m,100));el('items').append(b);}show(items[0],100);}catch(e){el('counter').textContent='Không nạp được danh mục: '+e.message;}})();
window.addEventListener('beforeunload',dispose);
