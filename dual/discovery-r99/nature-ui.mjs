/** 3D-first real DEM & Sentinel-2 photo atlas inside Discovery. */
import * as THREE from '/vendor/three.module.js';
import {NATURE_WONDERS,NATURE_BY_ID,TERRAIN_WONDERS,PENDING_WONDERS,NATURE_OFFICIAL} from './nature-data.mjs';
import {loadNatureTerrain,disposeNatureTerrain} from './terrain3d.mjs';
import {downloadNatureGLB} from './export-glb.mjs';
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
export function createNatureDiscoveryUI({onRoom,onNotify}={}){
 const overlay=document.createElement('section');overlay.id='r99-nature-overlay';overlay.hidden=true;
 overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Phòng kỳ quan thiên nhiên 3D');
 overlay.innerHTML=`<header class="r99-header">
  <div><small>DISCOVERY R99 · 3D CẢNH QUAN ĐỊA HÌNH THỰC</small><h2>🌿 KỲ QUAN THIÊN NHIÊN THẾ GIỚI</h2><p>14 kỳ quan trong 2 danh sách · Chỉ dựng 3D nơi dữ liệu phù hợp</p></div>
  <div class="r99-actions"><button id="r99-room" type="button">🏛 Đi vào phòng 3D</button><button id="r99-close" type="button">✕ ĐÓNG</button></div>
 </header><div class="r99-body">
  <aside class="r99-sidebar"><label for="r99-search">Tìm kỳ quan thiên nhiên</label><input id="r99-search" type="search" placeholder="Tìm theo tên, quốc gia…"/>
  <div class="r99-filter-pills" style="display:flex;flex-wrap:wrap;gap:5px;margin:6px 0"><button type="button" class="r99-filter-btn active" data-filter="all" style="font-size:11px;padding:4px 8px;border-radius:6px;background:#164e63;color:#fff;border:1px solid #38bdf8;cursor:pointer">Tất cả (14)</button><button type="button" class="r99-filter-btn" data-filter="terrain_dem" style="font-size:11px;padding:4px 8px;border-radius:6px;background:#0f293a;color:#bae6fd;border:1px solid #2b5d76;cursor:pointer">🌄 10 điểm DEM 3D</button><button type="button" class="r99-filter-btn" data-filter="pending" style="font-size:11px;padding:4px 8px;border-radius:6px;background:#0f293a;color:#bae6fd;border:1px solid #2b5d76;cursor:pointer">⏳ 4 chờ khảo sát</button><button type="button" class="r99-filter-btn" data-filter="cached_glb" style="font-size:11px;padding:4px 8px;border-radius:6px;background:#0f293a;color:#bae6fd;border:1px solid #2b5d76;cursor:pointer">📦 5 GLB vệ tinh</button></div>
  <div id="r99-count"></div><div id="r99-list"></div>
  <p class="r99-credit">Danh sách: <a href="${NATURE_OFFICIAL.traditional}" target="_blank" rel="noopener noreferrer">Seven Natural Wonders</a> · <a href="${NATURE_OFFICIAL.new7}" target="_blank" rel="noopener noreferrer">New7Wonders of Nature</a>. Hai danh sách không đồng nghĩa được UNESCO ghi danh.</p></aside>
  <main class="r99-main"><div class="r99-summary"><small id="r99-collection"></small><h3 id="r99-name">Chọn địa danh</h3><p id="r99-history"></p></div>
  <div class="r99-panels"><div class="r99-photo-card"><strong>ẢNH TƯ LIỆU THỰC TẾ</strong><div class="r99-image-wrap"><img id="r99-photo" alt="Ảnh tư liệu địa danh" hidden/><p id="r99-photo-status">Đang truy xuất ảnh có nguồn và giấy phép…</p></div><a id="r99-photo-credit" target="_blank" rel="noopener noreferrer" hidden></a></div>
   <div class="r99-viewer-card"><div class="r99-viewer-head"><strong>3D ĐỊA HÌNH ĐO ĐẠC + ẢNH VỆ TINH</strong><span id="r99-quality">Chờ dữ liệu</span></div><div class="r99-canvas-wrap"><canvas id="r99-canvas" aria-label="Mô hình 3D từ dữ liệu địa hình thật; kéo để xoay" tabindex="0"></canvas><p id="r99-loading" role="status">Chọn cảnh quan để nạp mô hình 3D</p></div>
   <div class="r99-viewer-controls"><button id="r99-zoom-in" type="button">＋</button><button id="r99-zoom-out" type="button">－</button><button id="r99-reset" type="button">⟲ Đặt lại</button><button id="r99-retry" type="button" title="Kiểm tra kết nối và tải lại dữ liệu DEM / vệ tinh">↻ Thử lại 3D</button><label>Phóng đại chiều cao <select id="r99-exag"><option value="1">1× — đúng tỉ lệ địa hình</option><option value="1.5">1,5×</option><option value="2">2×</option><option value="3">3×</option></select></label><button id="r99-export" type="button" disabled>⬇ Xuất GLB địa hình</button><a id="r99-cached-glb" href="#" download hidden style="font-size:12px;padding:6px 10px;border-radius:8px;background:#0d9488;color:#fff;text-decoration:none;font-weight:700">📦 GLB Vệ tinh chuẩn</a></div></div>
  </div><div class="r99-notes"><div id="r99-measures"></div><p id="r99-scientific-note"></p><p style="color:#fcd34d;font-weight:600;margin:4px 0">⚖ Phân cấp độ trung thực (Fidelity): Địa hình DEM thực (~30m/bước lưới) &lt; Mô hình quang trắc/LiDAR đo quét công trình cận cảnh (như Đền Parthenon R98). Tọa độ chấm trên địa cầu là điểm tham chiếu vùng địa lý, không phải ranh giới pháp lý toàn cảnh quan.</p><p>Độ cao: <a href="${NATURE_OFFICIAL.terrain}" target="_blank" rel="noopener noreferrer">Mapzen Terrain Tiles / AWS Open Data</a>. Ảnh vệ tinh (nếu tải được): <a href="${NATURE_OFFICIAL.imagery}" target="_blank" rel="noopener noreferrer">EOX Sentinel-2 Cloudless 2016 · CC BY 4.0</a>. Ghi công bắt buộc: EOxCloudless https://cloudless.eox.at by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017). Không phân phối bộ tile thô. Không phải dữ liệu đo sai số chuẩn công trình.</p></div>
  </main></div>`;
 document.body.appendChild(overlay);
 const $=id=>overlay.querySelector('#'+id);
 const canvas=$('r99-canvas');let renderer=null,scene=null,camera=null,active=null,bundle=null,aborter=null,raf=0;
 let orbit=.7,tilt=.55,zoom=20,focusY=.7,loadingSeq=0,drag=null,modeFilter='all';
 function prepare(){if(renderer)return;
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(1.6,window.devicePixelRatio||1));renderer.outputColorSpace=THREE.SRGBColorSpace;
  scene=new THREE.Scene();scene.background=new THREE.Color(0x0d2435);
  scene.add(new THREE.HemisphereLight(0xc7eaff,0x77766c,2.0));const sun=new THREE.DirectionalLight(0xffefc6,2.8);sun.position.set(-6,15,10);scene.add(sun);
  const edge=new THREE.DirectionalLight(0x8bcfdf,1.0);edge.position.set(10,8,-8);scene.add(edge);
  camera=new THREE.PerspectiveCamera(42,1,.05,200);
 }
 function draw(){if(overlay.hidden||!renderer||!scene||!camera){raf=0;return;}
  const w=Math.max(300,canvas.clientWidth),h=Math.max(230,canvas.clientHeight);renderer.setSize(w,h,false);
  camera.aspect=w/h;camera.updateProjectionMatrix();
  const r=zoom;camera.position.set(r*Math.sin(orbit)*Math.cos(tilt),focusY+r*Math.sin(tilt),r*Math.cos(orbit)*Math.cos(tilt));camera.lookAt(0,focusY,0);
  renderer.render(scene,camera);raf=requestAnimationFrame(draw);
 }
 function loop(){if(!raf&&!overlay.hidden)raf=requestAnimationFrame(draw);}
 function clearModel(){aborter?.abort();aborter=null;if(bundle){scene?.remove(bundle.group);disposeNatureTerrain(bundle);bundle=null;}$('r99-export').disabled=true;}
 function renderList(){const term=$('r99-search').value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');const list=$('r99-list');list.replaceChildren();
  overlay.querySelectorAll('.r99-filter-pill').forEach(btn=>{
   const on=btn.dataset.filter===modeFilter;
   btn.classList.toggle('is-active',on);
   btn.style.background=on?'#0d9488':'rgba(15,43,60,.8)';
   btn.style.color=on?'#fff':'#cde8f6';
   btn.style.border=on?'1px solid #5eead4':'1px solid rgba(125,211,252,.25)';
  });
  let count=0;for(const [groupName,items] of [['7 kỳ quan truyền thống',NATURE_WONDERS.slice(0,7)],['7 kỳ quan mới · 2011',NATURE_WONDERS.slice(7)]]){
   const filtered=items.filter(w=>(modeFilter==='all'||w.model===modeFilter)&&`${w.name} ${w.english} ${w.country}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(term));
   if(!filtered.length)continue;const title=document.createElement('h4');title.textContent=groupName;list.append(title);
   for(const w of filtered){count++;const button=document.createElement('button');button.className=`r99-entry${active?.id===w.id?' active':''}${w.model==='pending'?' is-pending':''}`;
    const badge=w.model==='terrain_dem'?(w.reviewed_3d?'🌄 3D DEM + GLB chuẩn':'🌄 Dựng 3D từ DEM'):'⏳ Chờ nguồn quét 3D';
    const whc=w.unescoWhcId?` · UNESCO #${w.unescoWhcId}`:'';
    button.innerHTML=`<strong>${esc(w.name)}</strong><small>${esc(w.country)}${esc(whc)}</small><span>${badge}</span>`;button.onclick=()=>open(w.id);list.append(button);}
  }$('r99-count').textContent=`${count} / 14 địa danh · ${TERRAIN_WONDERS.length} hỗ trợ DEM 3D · ${PENDING_WONDERS.length} chờ dữ liệu chuyên dụng`;
 }
 async function loadPhoto(item,seq){const img=$('r99-photo'),status=$('r99-photo-status'),credit=$('r99-photo-credit');img.hidden=true;img.removeAttribute('src');credit.hidden=true;status.hidden=false;status.textContent='Đang lấy ảnh đúng bài viết địa danh từ Wikimedia Commons…';
  try{const r=await fetch(`/api/discovery/r99/photo?id=${encodeURIComponent(item.id)}`);const result=await r.json();
   if(seq!==loadingSeq)return;if(!r.ok)throw Error(result.error||'Nguồn Commons lỗi');
   img.onload=()=>{if(seq===loadingSeq){img.hidden=false;status.hidden=true;}};
   img.onerror=()=>{if(seq===loadingSeq)status.textContent='Không tải được ảnh tư liệu từ Commons';};
   img.alt=`Ảnh tư liệu ${item.name} từ Wikimedia Commons`;img.src=result.url;
   credit.textContent=`Nguồn ảnh: ${result.author} · ${result.license} · Đối chiếu ảnh trước khi xuất bản`;credit.href=result.source;credit.hidden=false;
  }catch(error){if(seq===loadingSeq)status.textContent=`Chưa có ảnh xác minh hoặc chưa kết nối: ${error.message}`;}
 }
 async function load3D(item,seq){clearModel();$('r99-loading').hidden=false;
  const cachedLink=$('r99-cached-glb');
  if(cachedLink){if(item.cachedGlbUrl){cachedLink.href=item.cachedGlbUrl;cachedLink.download=`${item.id}_dem_s2.glb`;cachedLink.hidden=false;}else{cachedLink.hidden=true;}}
  $('r99-loading').textContent='Đang tải dữ liệu độ cao thực và ảnh vệ tinh (cần Internet trong lần đầu)…';
  $('r99-quality').textContent='Đang dựng 3D từ DEM';
  if(item.model!=='terrain_dem'){$('r99-loading').textContent=`CHƯA CÓ 3D TIN CẬY: ${item.reason}`;$('r99-quality').textContent='Không có mô hình giả';$('r99-measures').textContent='Không có tệp đo địa hình thích hợp để mô phỏng đối tượng.';return;}
  try{prepare();aborter=new AbortController();const result=await loadNatureTerrain(item,{detail:true,verticalExaggeration:Number($('r99-exag').value),signal:aborter.signal});
   if(seq!==loadingSeq){disposeNatureTerrain(result);return;}
   bundle=result;scene.add(bundle.group);$('r99-loading').hidden=true;$('r99-export').disabled=false;
   const bounds=new THREE.Box3().setFromObject(bundle.group);const size=bounds.getSize(new THREE.Vector3());focusY=Math.max(.4,size.y*.4);zoom=Math.max(16,Math.max(size.x,size.z)*1.55);orbit=.65;tilt=.55;
   $('r99-quality').textContent=bundle.stats.imagery?'✓ DEM thật + ảnh Sentinel-2':'✓ DEM thật · Chưa có ảnh vệ tinh';
   $('r99-measures').textContent=`Độ cao: ${bundle.stats.minElevationMeters.toFixed(0)}–${bundle.stats.maxElevationMeters.toFixed(0)} m · Vùng rộng ~${(bundle.stats.spanMeters/1000).toFixed(1)} km · ${bundle.stats.vertices.toLocaleString('vi-VN')} đỉnh 3D · Bước lưới ~${bundle.stats.resolutionMetres.toFixed(1)} m · Độ phóng đại đứng: ${bundle.stats.verticalExaggeration}×`;
   if(!bundle.stats.imagery)$('r99-scientific-note').textContent+=' Ảnh vệ tinh chưa tải được; màu địa hình theo cao độ, không phải màu của cảnh quan thực tế.';
   loop();
  }catch(err){if(seq!==loadingSeq)return;$('r99-quality').textContent='Chưa tải được dữ liệu';$('r99-loading').textContent=`KHÔNG TẠO MÔ HÌNH GIẢ: ${err.message}. Kiểm tra Internet hoặc bấm ↻ Thử lại 3D.`;$('r99-export').disabled=true;
   $('r99-measures').textContent='Lần đầu cần tải dữ liệu từ các nguồn công khai. Những ô tải thành công được lưu đệm trên máy để dùng lại.';
  }
 }
 function open(id){const item=NATURE_BY_ID.get(id);if(!item)return false;active=item;
  overlay.hidden=false;renderList();
  const whcNote=item.unescoWhcId?` · Hồ sơ Di sản thiên nhiên UNESCO #${item.unescoWhcId}`:' · Danh mục Kỳ quan Thiên nhiên (không thuộc danh mục công trình kiến trúc UNESCO)';
  $('r99-collection').textContent=item.list+whcNote;$('r99-name').textContent=item.name;
  $('r99-history').textContent=`${item.country} · Vĩ độ ${item.lat.toFixed(4)}°; kinh độ ${item.lng.toFixed(4)}° (tâm vùng địa lý tham chiếu). ${item.history}`;
  $('r99-scientific-note').textContent=item.model==='pending'?item.reason:`Mô hình: ${item.landform}. Độ cao lấy từ bản đồ DEM thực, bề mặt phủ ảnh vệ tinh EOX Sentinel-2 (CC BY 4.0). Đây là bản địa hình tại tọa độ chọn, KHÔNG phải bản quét quang trắc/LiDAR hay tái dựng từng chi tiết vật thể.`;
  $('r99-exag').value='1';const seq=++loadingSeq;void loadPhoto(item,seq);void load3D(item,seq);loop();return true;
 }
 function show(){overlay.hidden=false;renderList();if(!active)open('nature_halong');else loop();}
 function close(){overlay.hidden=true;++loadingSeq;clearModel();if(raf)cancelAnimationFrame(raf);raf=0;}
 $('r99-close').onclick=close;$('r99-room').onclick=()=>{onRoom?.('nature');close();};
 $('r99-search').oninput=renderList;
 overlay.querySelectorAll('.r99-filter-pill').forEach(btn=>{btn.onclick=()=>{modeFilter=btn.dataset.filter||'all';renderList();};});
 $('r99-exag').onchange=()=>{if(active&&active.model==='terrain_dem'){const seq=++loadingSeq;void load3D(active,seq);}};
 $('r99-retry').onclick=()=>{if(active){const seq=++loadingSeq;void loadPhoto(active,seq);void load3D(active,seq);}};
 $('r99-zoom-in').onclick=()=>zoom=Math.max(5,zoom*.78);
 $('r99-zoom-out').onclick=()=>zoom=Math.min(80,zoom*1.25);
 $('r99-reset').onclick=()=>{orbit=.7;tilt=.55;zoom=20;};
 $('r99-export').onclick=()=>{if(!bundle)return;try{const n=downloadNatureGLB(bundle);onNotify?.(`Đã xuất GLB địa hình DEM (${(n/1024/1024).toFixed(1)} MB), không phải 3D quang trắc.`);}catch(err){$('r99-loading').hidden=false;$('r99-loading').textContent=err.message;}};
 canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!drag)return;orbit+=(e.clientX-drag.x)*.008;tilt=THREE.MathUtils.clamp(tilt+(e.clientY-drag.y)*.006,.06,1.35);drag={x:e.clientX,y:e.clientY};});
 canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
 canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=THREE.MathUtils.clamp(zoom*(e.deltaY>0?1.1:.9),4,80);},{passive:false});
 overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}});
 renderList();
 return {open,show,close,get isOpen(){return !overlay.hidden;},get selected(){return active;},get catalog(){return NATURE_WONDERS;}};
}
