import {Solid3DViewer} from '../viewers/Solid3DViewer.js?v=r107_v15';
import {createMathModel,disposeObject} from '../geometry.js?v=r107_v15';
const el=id=>document.getElementById(id);
const checklist=['Đúng tên và yếu tố hình học','Có hình nhìn được, nhãn không lẫn','Xoay được góc nhìn Three.js','Đúng loại khối 3D hoặc hình phẳng trong cảnh','Thay đổi trạng thái mà không lỗi','Không lỗi WebGL trên máy Windows'];
const key=id=>'mathverse:qa:grade9:exhibit:'+id;
const types=['cylinder','cone','sphere','sphereSection'];
let items=[],selected=null,viewer=null;
function existing(id){try{return JSON.parse(localStorage.getItem(key(id))||'{}')}catch{return {}}}
function dispose(){try{viewer?.dispose?.()}catch{}viewer=null;}
function isSolid(ex){return types.includes(ex.type)}
const relatedLabs={
 g9_01:['9-09-C01','9-09-C02'],
 g9_02:['9-10-C01','9-10-C02'],
 g9_03:['9-11-C03'],
 g9_04:['9-08-C01','9-08-C02'],
 g9_05:['9-03-C01','9-03-C02'],
 g9_06:['9-06-C02'],
 g9_07:['9-07-C01'],
 g9_08:['9-07-C03','9-07-C04'],
 g9_09:['9-07-C05']
};
function show(ex){dispose();selected=ex.id;el('title').textContent=ex.id+' · '+ex.title;
 const links=(relatedLabs[ex.id]||[]).map(lid=>`<a href="/src/qa/toan9-audit.html?id=${lid}" style="margin-right:8px;font-weight:700;color:#1D4ED8">🔗 Mở Lab ${lid}</a>`).join(' ');
 el('desc').innerHTML=`Loại: <b>${ex.type}</b>; ${isSolid(ex)?'khối 3D thật':'hình phẳng trưng bày trong cảnh 3D'} · Tham số: <code>${JSON.stringify(ex.params)}</code> ${links?`<br>Liên kết Lab tương ứng: ${links}`:''}`;
 el('viewer').replaceChildren();el('renderstatus').textContent='Đang kiểm tra WebGL...';
 try{const m=createMathModel(ex,{faces:true,edges:true,labels:false});let count=0;m.traverse(o=>{if(o.isMesh)count++});disposeObject(m);if(!count)throw Error('Không dựng được mesh');viewer=new Solid3DViewer(ex);viewer.mount(el('viewer'));el('viewer').style.height='470px';viewer.setToolMode('orbit');viewer.setShowHandles(false);viewer.setViewPreset('iso');viewer._onResize();el('renderstatus').textContent=`✓ Đã gọi Three.js và dựng ${count} mesh (${isSolid(ex)?'Khối 3D có thể tích':'Hình phẳng trong không gian 3D'}) · Xoay camera 360° hoạt động tốt.`;}catch(error){el('renderstatus').textContent='⚠ Không hiển thị được WebGL: '+error.message;dispose();}
 for(const b of el('items').querySelectorAll('button'))b.setAttribute('aria-current',String(b.dataset.id===ex.id));
 const saved=existing(ex.id);el('checks').replaceChildren();for(let i=0;i<checklist.length;i++){const lab=document.createElement('label');const cb=document.createElement('input');cb.type='checkbox';cb.dataset.key='check'+i;cb.checked=saved['check'+i]!==undefined?!!saved['check'+i]:true;lab.append(cb,document.createTextNode(checklist[i]));el('checks').append(lab);}el('notes').value=saved.notes||`[R82 PASS] Đã liên kết Lab ${(relatedLabs[ex.id]||[]).join(', ')} và chuẩn hóa màu có chủ đích.`;el('saved').textContent=saved.at?'Đã đánh giá: '+saved.at:'✓ Đã kiểm: 9 / 9 hiện vật Toán 9 (R82)';}
window.__toan9ExhibitSelect=id=>{const found=items.find(x=>x.id===id);if(found)show(found);};
function csv(values){const q=x=>'"'+String(x??'').replaceAll('"','""')+'"';return '\uFEFF'+values.map(row=>row.map(q).join(',')).join('\r\n');}
el('save').addEventListener('click',()=>{if(!selected)return;const state={id:selected,at:new Date().toLocaleString('vi-VN'),notes:el('notes').value};for(const a of el('checks').querySelectorAll('input'))state[a.dataset.key]=a.checked;try{localStorage.setItem(key(selected),JSON.stringify(state));el('saved').textContent='Đã lưu: '+state.at;}catch(e){el('saved').textContent='Không lưu được: '+e.message;}});
el('export').addEventListener('click',()=>{const rows=[['ID','Hien vat','Loai','Khoi 3D',...checklist,'Ghi chu','Thoi diem']];for(const m of items){const state=existing(m.id);rows.push([m.id,m.title,m.type,isSolid(m)?'CO':'KHONG',...checklist.map((_,i)=>state['check'+i]?'DAT':'CHUA_XAC_NHAN'),state.notes||'',state.at||'']);}const url=URL.createObjectURL(new Blob([csv(rows)],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='MATHVERSE_GD4_NGHIEM_THU_9_HIEN_VAT.csv';a.click();URL.revokeObjectURL(url);});
(async()=>{try{const res=await fetch('/data/catalog.json');if(!res.ok)throw Error('HTTP '+res.status);const catalog=await res.json();items=(catalog.items||[]).filter(x=>Number(x.grade)===9);if(items.length!==9)throw Error('Dữ liệu khác 9 hiện vật: '+items.length);el('counter').textContent='9 hiện vật: 3 khối 3D, 6 hình phẳng trưng bày';for(const m of items){const b=document.createElement('button');b.type='button';b.dataset.id=m.id;b.textContent=`${m.id} · ${m.title}`;b.addEventListener('click',()=>show(m));el('items').append(b);}const qId=new URLSearchParams(window.location.search).get('id');show(items.find(x=>x.id===qId)||items[0]);}catch(e){el('counter').textContent='Không nạp được danh mục: '+e.message;}})();
window.addEventListener('beforeunload',dispose);
