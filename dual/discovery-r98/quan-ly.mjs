import {UNESCO_HERITAGE} from '../discovery-unesco-data.mjs';
import * as THREE from '/vendor/three.module.js';
import {loadR98Scan,fitR98Scan} from './scan-loader.mjs';
const $=id=>document.getElementById(id);const sel=$('site');
for(const h of UNESCO_HERITAGE){const o=document.createElement('option');o.value=h.id;o.textContent=`${h.name} · ${h.country}`;sel.append(o);}
function status(message,ok=true){$('status').textContent=message;$('status').className=ok?'ok':'bad';}
async function api(url,opts={}){const r=await fetch(url,opts);const data=await r.json();if(!r.ok||!data.ok)throw Error(data.error||`HTTP ${r.status}`);return data;}
// 3D preflight preview in the administrator screen. A loaded GLB is not automatically accurate.
let previewUrl=null,previewModel=null,renderer=null,scene=null,camera=null,angle=0,tilt=.35,drag=null;
const cv=$('glbPreview');
function ensurePreview(){if(renderer)return;renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setSize(520,300,false);scene=new THREE.Scene();scene.background=new THREE.Color(0x081827);scene.add(new THREE.AmbientLight(0xffffff,1.65));const light=new THREE.DirectionalLight(0xffe4b1,2.5);light.position.set(4,8,6);scene.add(light);camera=new THREE.PerspectiveCamera(35,520/300,.1,200);function frame(){requestAnimationFrame(frame);if(previewModel){camera.position.set(11*Math.sin(angle)*Math.cos(tilt),5+11*Math.sin(tilt),11*Math.cos(angle)*Math.cos(tilt));camera.lookAt(0,0.5,0);}renderer.render(scene,camera);}frame();}
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointermove',e=>{if(!drag)return;angle+=(e.clientX-drag.x)*.008;tilt=Math.max(-1,Math.min(1,tilt+(e.clientY-drag.y)*.007));drag={x:e.clientX,y:e.clientY};});
cv.addEventListener('pointerup',()=>drag=null);cv.addEventListener('pointercancel',()=>drag=null);
$('glbAngles')?.querySelectorAll('button[data-angle]').forEach(btn=>{
 btn.addEventListener('click',()=>{angle=Number(btn.dataset.angle||0);tilt=Number(btn.dataset.tilt||0.2);});
});
$('loadParthenonPreset')?.addEventListener('click',async()=>{
 try{
  sel.value='unesco_parthenon';
  status('Đang nạp bản Parthenon đã lưu (Zenodo #10319004 + Wikimedia Commons) vào hệ thống xem trước...');
  const [glbRes,photoRes]=await Promise.all([
   fetch('/dual/discovery-r98/assets/unesco_parthenon_glb.glb'),
   fetch('/dual/discovery-r98/assets/unesco_parthenon_photo.jpg')
  ]);
  if(!glbRes.ok||!photoRes.ok)throw Error('Không tìm thấy tệp Parthenon trong /dual/discovery-r98/assets/');
  const [glbBuf,photoBuf]=await Promise.all([glbRes.arrayBuffer(),photoRes.arrayBuffer()]);
  const upGlb=await api('/api/discovery/r98/upload?id=unesco_parthenon&type=glb',{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:glbBuf});
  await api('/api/discovery/r98/upload?id=unesco_parthenon&type=photo',{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:photoBuf});
  const im=$('preview');im.src='/dual/discovery-r98/assets/unesco_parthenon_photo.jpg';im.hidden=false;
  ensurePreview();if(previewModel){scene.remove(previewModel);previewModel=null;}
  const scan=await loadR98Scan('/dual/discovery-r98/assets/unesco_parthenon_glb.glb');
  previewModel=new THREE.Group();fitR98Scan(previewModel,scan,10.5);scene.add(previewModel);
  $('glbPreviewStatus').textContent=`Đã nạp GLB Parthenon (${upGlb.stats.triangles.toLocaleString('vi-VN')} tam giác, ${upGlb.stats.images} texture). Bấm các góc nhìn để đối chiếu với ảnh thật trước khi duyệt.`;
  $('modelAuthor').value='Nick G. Gizelis (aumakua)';
  $('modelSource').value='https://zenodo.org/records/10319004';
  $('modelLicense').value='CC BY 4.0';
  $('modelMethod').value='photogrammetry';
  $('photoAuthor').value='DJDunsie';
  $('photoSource').value='https://commons.wikimedia.org/wiki/File:Parthenon,_Athens,_Greece.jpg';
  $('photoLicense').value='CC BY 3.0';
  $('comparisonSource').value='https://whc.unesco.org/en/list/404/';
  $('reviewer').value='Giáo viên Toán & Kỹ sư QA MATHVERSE R98';
  $('notes').value='Bản quét quang trắc từ video drone (450.305 tam giác, 2 texture) khớp hiện trạng Đền Parthenon trên đồi Acropolis; có nền đồi bao quanh, chưa có chứng nhận sai số đo đạc trắc địa.';
  status('Đã nạp ứng viên Parthenon (CHƯA DUYỆT). Hãy kiểm tra 4 góc nhìn 3D, đối chiếu ảnh thật và tích 4 ô xác nhận ở Bước 2 để duyệt.');
  await refresh();
 }catch(e){status('LỖI NẠP ỨNG VIÊN: '+e.message,false);}
});
$('glb').addEventListener('change',async()=>{const file=$('glb').files?.[0];if(!file)return;if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=URL.createObjectURL(file);$('glbPreviewStatus').textContent='Đang thử mở GLB ở góc nhìn tương tác...';try{ensurePreview();if(previewModel){scene.remove(previewModel);previewModel=null;}const scan=await loadR98Scan(previewUrl);previewModel=new THREE.Group();fitR98Scan(previewModel,scan,7);scene.add(previewModel);$('glbPreviewStatus').textContent='Đã mở GLB. Kéo chuột để xoay, kiểm tra hình khối và texture. Chưa chứng nhận sai số hình học.';}catch(e){$('glbPreviewStatus').textContent='Không xem trước được: '+e.message;}});
$('photo').addEventListener('change',()=>{const file=$('photo').files?.[0];if(!file)return;const im=$('preview');if(im.dataset.objectURL)URL.revokeObjectURL(im.dataset.objectURL);im.dataset.objectURL=URL.createObjectURL(file);im.src=im.dataset.objectURL;im.hidden=false;});
async function upload(type,input){const f=$(input).files?.[0];if(!f){status('Hãy chọn tệp '+input,false);return;}status(`Đang tải ${f.name} ...`);try{const data=await api(`/api/discovery/r98/upload?id=${encodeURIComponent(sel.value)}&type=${type}`,{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:f});status(`Đã tải ${type}: ${(data.size/1024/1024).toFixed(2)} MB${data.stats?` · khoảng ${data.stats.triangles.toLocaleString('vi-VN')} tam giác; ${data.stats.images} texture image`:''}. CHƯA DUYỆT.`);await refresh();}catch(e){status(`LỖI TẢI: ${e.message}`,false);}}
$('uploadGlb').onclick=()=>upload('glb','glb');$('uploadPhoto').onclick=()=>upload('photo','photo');
const keys=['modelAuthor','modelSource','modelLicense','modelMethod','photoAuthor','photoSource','photoLicense','comparisonSource','reviewer','notes'];
$('approve').onclick=async()=>{const input={id:sel.value};for(const k of keys)input[k]=$(k).value;for(const k of ['comparePhoto','compareDimensions','compareLicense','compareIdentity'])input[k]=$(k).checked;
 if(!confirm('Cô đã kiểm tra trực tiếp nguồn và GLB đúng công trình? Thao tác này công khai trên bản đồ, địa cầu và phòng UNESCO 3D.'))return;
 try{const data=await api('/api/discovery/r98/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});status(`Đã duyệt: ${sel.options[sel.selectedIndex].text}. Lưu ý: ${data.notice}`);await refresh();}catch(e){status('CHƯA THỂ DUYỆT: '+e.message,false);}
};
async function refresh(){try{const data=await api('/api/discovery/r98/catalog');const wrap=$('records');wrap.replaceChildren();status(`${data.approvedCount} hiện vật đã duyệt / ${data.records.length} hồ sơ; mô hình chờ duyệt không xuất hiện trước học sinh.`);
 for(const rec of data.records){const card=document.createElement('article');const h=document.createElement('strong');h.textContent=`${rec.name} — ${rec.status==='approved'?'✅ ĐÃ DUYỆT':'⏳ CHỜ DUYỆT'}`;card.append(h);const p=document.createElement('p');p.textContent=`GLB: ${rec.glb?'đã nhập':'thiếu'} | Ảnh: ${rec.photo?'đã nhập':'thiếu'} | ${rec.glb?.triangles||0} tam giác`;card.append(p);
 if(rec.status==='approved'){const b=document.createElement('button');b.textContent='Ngừng công bố';b.addEventListener('click',async()=>{if(!confirm('Ẩn công trình này trên các phòng Discovery?'))return;await api('/api/discovery/r98/revoke',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:rec.id})});await refresh();});card.append(b);}
 wrap.append(card);}
 }catch(e){status('Không kết nối máy chủ MATHVERSE: '+e.message,false);}}
$('refresh').onclick=refresh;void refresh();
