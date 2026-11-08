import {Solid3DViewer} from '../viewers/Solid3DViewer.js?v=r107_v15';
import {createMathModel,disposeObject} from '../geometry.js?v=r107_v15';
const el=id=>document.getElementById(id);
const checklist=['Đúng tên và yếu tố hình học','Có hình nhìn được, nhãn không lẫn','Xoay được góc nhìn Three.js','Đúng loại khối 3D hoặc hình phẳng trong cảnh','Thay đổi trạng thái mà không lỗi','Không lỗi WebGL trên máy Windows'];
const key=id=>'mathverse:qa:grade10:exhibit:'+id;
const types=[]; // No volumetric Grade10 exhibit: conics and planar curves are presented in Three.js space.
const EXHIBIT_LAB_MAP={
 g10_01:{lab:'10-06-C03',role:'Hình phẳng Oxy · Hàm số bậc hai (Parabol xanh dương #1D4ED8, trục ĐX xám #475569, đỉnh I tím #6D28D9)'},
 g10_02:{lab:'10-02-C02',role:'Hình phẳng Oxy · Miền nghiệm BPT (Đường bờ #1D4ED8, miền nghiệm #15803D, pháp tuyến #B45309)'},
 g10_03:{lab:'10-03-C02',role:'Hình phẳng · Định lí Côsin & Sin trong tam giác (Cạnh biết #1D4ED8, đường cao #15803D, cạnh tìm #6D28D9)'},
 g10_04:{lab:'10-04-C01',role:'Hình phẳng Oxy · Quy tắc hình bình hành vectơ (u #1D4ED8, v #15803D, gióng #B45309, tổng u+v #6D28D9)'},
 g10_05:{lab:'10-04-C04',role:'Hình phẳng Oxy · Tích vô hướng hai vectơ (u #1D4ED8, v #15803D, góc & chiếu #B45309, tích #6D28D9)'},
 g10_06:{lab:'10-07-C01',role:'Hình phẳng Oxy · Đường thẳng & VTPT/VTCP (Đường Δ #1D4ED8, VTCP u #15803D, VTPT n #B45309, M₀ #6D28D9)'},
 g10_07:{lab:'10-08-C01',role:'Hình phẳng Oxy · Đường tròn (C) (Tâm I #1D4ED8, tam giác tọa độ #15803D, bán kính R #B45309, (C) #6D28D9)'},
 g10_08:{lab:'10-09-C01',role:'Hình phẳng Oxy · Đường Elip (Tiêu điểm F₁ #1D4ED8, F₂ #15803D, điểm M #B45309, quỹ tích Elip #6D28D9)'},
 g10_09:{lab:'10-09-C02',role:'Hình phẳng Oxy · Đường Hypebol (F₁ #1D4ED8, F₂ #15803D, tiệm cận #475569, điểm M #B45309, Hypebol #6D28D9)'}
};
let items=[],selected=null,viewer=null;
function existing(id){try{return JSON.parse(localStorage.getItem(key(id))||'{}')}catch{return {}}}
function dispose(){try{viewer?.dispose?.()}catch{}viewer=null;}
function isSolid(ex){return types.includes(ex.type)}
function show(ex){
 dispose();selected=ex.id;
 const meta=EXHIBIT_LAB_MAP[ex.id]||{lab:'10-01-C01',role:'Hình phẳng trưng bày trong cảnh 3D'};
 el('title').textContent=ex.id+' · '+ex.title;
 el('desc').innerHTML=`Loại: <b>${ex.type}</b> (${isSolid(ex)?'khối 3D thật':'hình phẳng 2D trưng bày trong không gian 3D — không có thể tích V=0'}) · ${meta.role} · <a href="/src/qa/toan10-audit.html?id=${meta.lab}" style="color:#1D4ED8;font-weight:700;text-decoration:underline">🔗 Mở Lab liên kết ${meta.lab}</a>`;
 el('viewer').replaceChildren();el('renderstatus').textContent='Đang kiểm tra WebGL...';
 try{
  const m=createMathModel(ex,{faces:true,edges:true,labels:false});let count=0;m.traverse(o=>{if(o.isMesh)count++});disposeObject(m);if(!count)throw Error('Không dựng được mesh');
  viewer=new Solid3DViewer(ex);viewer.mount(el('viewer'));
  el('viewer').style.height='470px';viewer._onResize();
  viewer.setToolMode('orbit');viewer.setShowHandles(false);viewer.setViewPreset('iso');
  el('renderstatus').textContent=`Đã dựng ${count} mesh Three.js (hình phẳng Oxy liên kết Lab ${meta.lab}); cô có thể xoay góc nhìn kiểm tra.`;
 }catch(error){el('renderstatus').textContent='⚠ Không hiển thị được WebGL: '+error.message;dispose();}
 for(const b of el('items').querySelectorAll('button'))b.setAttribute('aria-current',String(b.dataset.id===ex.id));
 const saved=existing(ex.id);el('checks').replaceChildren();for(let i=0;i<checklist.length;i++){const lab=document.createElement('label');const cb=document.createElement('input');cb.type='checkbox';cb.dataset.key='check'+i;cb.checked=!!saved['check'+i];lab.append(cb,document.createTextNode(checklist[i]));el('checks').append(lab);}el('notes').value=saved.notes||'';el('saved').textContent=saved.at?'Đã đánh giá: '+saved.at:'Chưa xác nhận trên Windows';
}
window.__toan10ExhibitSelect=id=>{const found=items.find(x=>x.id===id);if(found)show(found);};
function csv(values){const q=x=>'"'+String(x??'').replaceAll('"','""')+'"';return '\uFEFF'+values.map(row=>row.map(q).join(',')).join('\r\n');}
el('save').addEventListener('click',()=>{if(!selected)return;const state={id:selected,at:new Date().toLocaleString('vi-VN'),notes:el('notes').value};for(const a of el('checks').querySelectorAll('input'))state[a.dataset.key]=a.checked;try{localStorage.setItem(key(selected),JSON.stringify(state));el('saved').textContent='Đã lưu: '+state.at;}catch(e){el('saved').textContent='Không lưu được: '+e.message;}});
el('export').addEventListener('click',()=>{const rows=[['ID','Hien vat','Loai','Khoi 3D',...checklist,'Ghi chu','Thoi diem']];for(const m of items){const state=existing(m.id);rows.push([m.id,m.title,m.type,isSolid(m)?'CO':'KHONG',...checklist.map((_,i)=>state['check'+i]?'DAT':'CHUA_XAC_NHAN'),state.notes||'',state.at||'']);}const url=URL.createObjectURL(new Blob([csv(rows)],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='MATHVERSE_GD5_NGHIEM_THU_9_HIEN_VAT.csv';a.click();URL.revokeObjectURL(url);});
(async()=>{try{const res=await fetch('/data/catalog.json');if(!res.ok)throw Error('HTTP '+res.status);const catalog=await res.json();items=(catalog.items||[]).filter(x=>Number(x.grade)===10);if(items.length!==9)throw Error('Dữ liệu khác 9 hiện vật: '+items.length);el('counter').textContent='9 hiện vật hình phẳng/đường cong được trưng bày bằng Three.js; 0 khối có thể tích';for(const m of items){const b=document.createElement('button');b.type='button';b.dataset.id=m.id;b.textContent=`${m.id} · ${m.title}`;b.addEventListener('click',()=>show(m));el('items').append(b);}const sp=new URLSearchParams(window.location.search);const qId=sp.get('id');const initEx=(qId&&items.find(x=>x.id===qId))||items[0];show(initEx);}catch(e){el('counter').textContent='Không nạp được danh mục: '+e.message;}})();
window.addEventListener('beforeunload',dispose);
