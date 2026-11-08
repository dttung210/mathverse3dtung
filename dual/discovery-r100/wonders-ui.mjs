/** R100 single Sketchfab viewer, checked historical notes, and real-world photo sourcing.
 * Never call an artist's reconstruction a scan. No hidden offsite navigation is required.
 */
import {R102_CATALOG,R102_BY_ID,ZONES} from '../discovery-r102/catalog.mjs';
import {makeGeometryInspector} from '../discovery-r102/geometry-viewer.mjs';
import {geometricSVG} from '../discovery-r102/geometry-2d.mjs';
const qs=(id)=>document.getElementById(id);
const wikiUrl=t=>'https://en.wikipedia.org/wiki/'+encodeURIComponent(t).replace(/%2F/g,'/');
function el(tag,cls,txt){const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x;}
export function createWorldWondersR100UI({onRoom,onMap,onImport}={}){
 const layer=el('section','r100-cover');layer.id='r100-wonders-overlay';layer.hidden=true;layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','Kiến trúc thế giới – ảnh thực tế, tiểu sử và mô hình 3D');
 layer.innerHTML=`<div class="r100-window"><header class="r100-top"><div><small>MATHVERSE · DISCOVERY R105 · MÔ HÌNH 3D CÓ NGUỒN</small><h2>CÔNG TRÌNH KIẾN TRÚC THẾ GIỚI · 3D / 2D</h2><p>Ảnh tư liệu · tiểu sử · Sketchfab · hình học 3D và 2D có kiểm chứng</p></div><button type="button" id="r100-close">✕ ĐÓNG</button></header>
 <div class="r100-tools"><input id="r100-search" type="search" placeholder="Tìm tên kỳ quan, quốc gia..." aria-label="Tìm kỳ quan"><select id="r100-filter" aria-label="Lọc kỳ quan"><option value="all">Tất cả 34 địa điểm</option><option value="ancient">7 kỳ quan cổ đại</option><option value="new2007">7 kỳ quan mới (2007)</option><option value="other">Công trình kiến trúc khác</option></select><button id="r100-back-room" type="button" hidden>🏛 Phòng UNESCO 3D</button><button id="r100-map" type="button">🗺 Bản đồ thế giới</button><button id="r104-import-glb" type="button" hidden title="Nhập tệp GLB đã được cấp phép vào bục, dùng được trong phiên này">⬆ ĐẶT GLB LÊN BỤC</button><input id="r104-glb-file" type="file" accept=".glb,model/gltf-binary" hidden /></div>
 <div class="r100-body"><nav class="r100-list" id="r100-list" aria-label="Danh sách kỳ quan và công trình"></nav><section class="r100-details"><div class="r100-subtitle" id="r100-kind"></div><h3 id="r100-title"></h3><div class="r100-media-grid"><section><h4 id="r100-photo-heading">Ảnh công trình thực tế</h4><div class="r100-photo-box"><img id="r100-photo" alt="Ảnh tham khảo kỳ quan" hidden><div id="r100-photo-fallback">Đang tải ảnh nguồn, không dùng hình AI để thay thế.</div></div><a target="_blank" rel="noopener noreferrer" id="r100-photo-source">Nguồn ảnh / di tích</a></section><section><h4 id="r102-model-title">3D Sketchfab · mô hình thực tế/tham khảo</h4><nav class="r102-tabs" id="r102-tabs" hidden><button type="button" id="r102-tab-sketchfab" class="active">🏛 Sketchfab</button><button type="button" id="r102-tab-3d">⬡ Hình học 3D</button><button type="button" id="r102-tab-2d">▤ Hình 2D</button></nav><div class="r100-viewer" id="r102-iframe-container"><iframe id="r100-sketchfab" title="Trình xem 3D Sketchfab" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation" referrerpolicy="strict-origin-when-cross-origin"></iframe><div id="r100-viewer-notice" class="r100-viewer-notice">Mô hình từ Sketchfab – cần Internet. Nội dung phục dựng cổ đại không phải bản quét.</div></div><div id="r102-geometry-container" class="r102-geometry-container" hidden><canvas id="r102-geometry-canvas" aria-label="Mô hình hình học dựng trong không gian 3D, kéo xoay"></canvas><div id="r102-svg-2d" class="r102-svg-2d" hidden></div><p id="r102-geometry-fallback" class="r102-geometry-fallback" hidden></p></div><div id="r102-math-line" class="r102-math-line" hidden><span id="r102-math-text"></span><button type="button" id="r102-copy-latex">Sao chép LaTeX</button></div><a id="r100-sketchfab-link" target="_blank" rel="noopener noreferrer">Tác giả và nguồn Sketchfab</a></section></div><div class="r100-info"><p id="r100-history"></p><dl><dt>Vị trí</dt><dd id="r100-location"></dd><dt>Loại mô hình</dt><dd id="r100-model-type"></dd><dt>Tìm hiểu Toán học</dt><dd id="r100-math"></dd><dt>Mô hình hình học</dt><dd id="r102-shape-note"></dd><dt>GLB trên bục</dt><dd id="r105-glb-status">Đang kiểm tra nguồn...</dd><dt>UNESCO</dt><dd id="r100-unesco"></dd></dl><p id="r100-caution"></p></div></section></div><footer>UNESCO ghi danh Di sản Thế giới; New7Wonders (2007) là bình chọn độc lập. Phòng UNESCO: GLB có phép được đặt trực tiếp trên bục; khi chưa có GLB sử dụng mô hình hình học minh họa, không phải bản quét. Sketchfab chỉ xuất hiện trong tab xem chi tiết và thuộc tác giả.</footer></div>`;
 document.body.appendChild(layer);
 let current=null,loadId=0,origin='globe',activeTab='sketchfab';
 let installedModels=[];
 const refreshInstalled=async()=>{
   try{
     const res=await fetch('/dual/discovery-r103/assets/approved-local-models.json',{cache:'no-store'});
     const json=res.ok?await res.json():{models:[]};installedModels=Array.isArray(json.models)?json.models:[];
   }catch{installedModels=[];}
   if(current)renderGLBStatus(current);
 };
 const renderGLBStatus=(item)=>{
   const target=qs('r105-glb-status');if(!target)return;
   if(!item.inGallery){target.textContent='Địa danh này chỉ trưng bày trong bản đồ/địa cầu.';return;}
   const asset=installedModels.find(x=>x.id===item.id);
   if(!asset){target.textContent='Chưa có GLB được phê duyệt trong bộ cài. Bục đang dùng mô hình hình học MINH HỌA; Sketchfab chỉ là trình xem nguồn.';return;}
   target.replaceChildren();target.append(`Đã đăng ký GLB: ${asset.author} · ${asset.license} · `);
   if(asset.sourceURL&&/^https:\/\//i.test(asset.sourceURL)){
     const a=el('a','', 'Xem nguồn mô hình');a.href=asset.sourceURL;a.target='_blank';a.rel='noopener noreferrer';target.append(a);
   }
   if(asset.verifiedWebGL!==true)target.append(' · Chưa nghiệm thu hình ảnh WebGL');
 };
 void refreshInstalled();
 const inspector=makeGeometryInspector(qs('r102-geometry-canvas'));
 const list=qs('r100-list'),search=qs('r100-search'),filter=qs('r100-filter'),frame=qs('r100-sketchfab'),photo=qs('r100-photo');
 function renderList(){
  const term=search.value.toLocaleLowerCase('vi').trim(),group=filter.value;list.replaceChildren();
  for(const w of R102_CATALOG){
   if(group!=='all'&&w.group!==group)continue;
   if(term&&!`${w.name} ${w.english} ${w.country} ${w.caption||''}`.toLocaleLowerCase('vi').includes(term))continue;
   const b=el('button','r100-entry'+(current?.id===w.id?' current':''));b.type='button';b.dataset.id=w.id;
   b.append(el('b','',`${String(w.order||'').padStart(2,'0')}. ${w.name}`),el('span','',`${w.country} · ${w.group==='ancient'?'Cổ đại':w.group==='new2007'?'Năm 2007':'Kiến trúc hình học'} · ${w.inGallery?'Có bục 3D':'Chỉ địa cầu và bản đồ'}`));
   b.onclick=()=>open(w.id,origin);list.appendChild(b);
  }
  if(!list.children.length)list.append(el('p','r100-no-result','Không có kỳ quan phù hợp từ khóa.'));
 }
 async function loadPhoto(w){
   const token=++loadId;photo.hidden=true;photo.removeAttribute('src');
   const fallback=qs('r100-photo-fallback'),source=qs('r100-photo-source');fallback.hidden=false;
   const wikiTitle=w.photoWiki||w.wiki||w.english;
   source.href=wikiUrl(wikiTitle);source.textContent=w.isReconstruction?'Ảnh di tích / hình minh họa: xem chú thích nguồn':'Ảnh tư liệu: Wikipedia / Wikimedia Commons (xem nguồn gốc)';
   qs('r100-photo-heading').textContent=w.photoSiteCaption|| (w.isReconstruction?'Ảnh di tích hoặc tư liệu hiện trạng (không phải ảnh tượng gốc)':'Ảnh thực tế công trình');
   fallback.textContent=w.photoUrl?'Đang tải ảnh thực tế đúng nguồn từ Wikimedia Commons.':w.isReconstruction?'Công trình không còn nguyên vẹn. Không có ảnh chụp lịch sử nguyên gốc; đang tìm tư liệu thích hợp.':'Đang tải ảnh thực tế từ nguồn Wikimedia / Wikipedia.';
   const localCached=`/dual/discovery-r106/assets/photos/${w.id}.jpg`;
   if(w.photoUrl){
     source.href=w.photoSource||wikiUrl(w.photoWiki||w.wiki);
     source.textContent=`Nguồn ảnh: ${w.photoAttribution||'Wikimedia Commons'} · ảnh chụp địa điểm hiện nay`;
     photo.onload=()=>{if(token===loadId){photo.hidden=false;fallback.hidden=true;}};
     photo.onerror=()=>{
       if(token!==loadId)return;
       if(photo.src.includes('/dual/discovery-r106/assets/photos/')){photo.src=w.photoUrl;return;}
       photo.hidden=true;fallback.hidden=false;fallback.textContent='Chưa tải được ảnh thực tế từ Wikimedia Commons. Vui lòng kiểm tra Internet và trang nguồn bên dưới.';
     };
     photo.alt=w.photoSiteCaption||`Ảnh chụp hiện tại của ${w.name}`;
     photo.src=localCached;
     return;
   }
   photo.onload=()=>{if(token===loadId){photo.hidden=false;fallback.hidden=true;}};
   photo.onerror=async()=>{
     if(token!==loadId)return;
     try{
       const endpoint=`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail%7Cname&pithumbsize=1000&titles=${encodeURIComponent(wikiTitle.replaceAll('_',' '))}`;
       const r=await fetch(endpoint,{mode:'cors'});if(!r.ok)throw Error(`Wikipedia ${r.status}`);
       const json=await r.json();const record=Object.values(json.query?.pages||{})[0];if(!record?.thumbnail?.source)throw Error('Chưa có ảnh phù hợp');
       if(token!==loadId)return;
       photo.onerror=()=>{if(token===loadId){photo.hidden=true;fallback.hidden=false;fallback.textContent='Chưa tải được ảnh từ nguồn. Vui lòng kiểm tra Internet.';}};
       photo.src=record.thumbnail.source;
       if(record.pageimage){const title=record.pageimage.startsWith('File:')?record.pageimage:`File:${record.pageimage}`;
         source.href=`https://commons.wikimedia.org/wiki/${encodeURIComponent(title).replaceAll('%3A',':')}`;source.textContent='Nguồn ảnh trên Wikimedia Commons · xem tác giả / giấy phép';}
     }catch(err){if(token===loadId)fallback.textContent='Không thể tự tải ảnh đúng địa danh. Không dùng ảnh thay thế sai công trình. Xem nguồn ảnh bên dưới.';}
   };
   photo.alt=w.isReconstruction?`Ảnh tư liệu hoặc hình minh họa liên quan tới ${w.name}; không xác nhận phục dựng`:`Ảnh tham khảo thực tế cho ${w.name}`;
   photo.src=localCached;
 }
 function open(id,from='globe'){
   const w=R102_BY_ID.get(id);if(!w)return false;
   layer.hidden=false;current=w;origin=from;activeTab='sketchfab';inspector.close();renderList();
   qs('r100-back-room').hidden=false;
   qs('r104-import-glb').hidden=!w.inGallery;
   qs('r102-tabs').hidden=!w.shape;
   qs('r102-shape-note').textContent=w.shape?`${w.caption||w.math}: bấm tab "⬡ Hình học 3D" hoặc "▤ Hình 2D" để xoay mô phỏng hình học 3D trực tiếp và xem mặt cắt 2D.`:'Địa điểm chỉ có hồ sơ, ảnh và Sketchfab.';
   setTab('sketchfab',w);renderGLBStatus(w);
   qs('r100-title').textContent=w.name;qs('r100-kind').textContent=(w.group==='ancient'?'7 kỳ quan cổ đại':w.group==='new2007'?'7 kỳ quan mới (2007)':'Công trình kiến trúc hình học')+' · '+w.country;
   qs('r100-history').textContent=w.history;qs('r100-location').textContent=w.location+(w.locationNote?' · '+w.locationNote:'');
   qs('r100-model-type').textContent=w.kind+' · Tác giả: '+w.author;
   qs('r100-math').textContent=w.caption?`${w.math} · ${w.caption}`:w.math;
   const unesco=qs('r100-unesco');unesco.replaceChildren();
   if(w.unescoUrl){unesco.append('Địa điểm thuộc khu di sản thế giới UNESCO – ');const a=el('a','',`hồ sơ #${w.whc}`);a.href=w.unescoUrl;a.target='_blank';a.rel='noopener noreferrer';unesco.append(a);}
   else unesco.textContent='Không gắn nhãn UNESCO cho riêng công trình này.';
   qs('r100-caution').textContent=w.isReconstruction?'LƯU Ý: Đây là phục dựng giả định/di tích của kỳ quan cổ đại, không có mô hình quét nguyên trạng. Tọa độ có thể là điểm khảo cổ đại diện.':'LƯU Ý: Mô hình 3D trên Sketchfab do tác giả độc lập cung cấp. Có thể là quang trắc hoặc dựng thủ công tùy nguồn, không có nghĩa được chứng nhận sai số kiến trúc.';
   qs('r100-sketchfab-link').href=w.sketchfabUrl||w.source||'#';qs('r100-sketchfab-link').textContent=`Sketchfab · ${w.author} · mô hình ${w.isReconstruction?'PHỤC DỰNG':'THAM KHẢO'} · nguồn và giấy phép`; 
   // Autostart=1 so clicking a pin on the Earth Globe or Map immediately displays the 3D model.
   frame.removeAttribute('src');if(w.uid)frame.src=`https://sketchfab.com/models/${w.uid}/embed?autostart=1&ui_infos=1&ui_controls=1&ui_watermark=1`; 
   qs('r100-viewer-notice').textContent=w.modelAccuracyNote||'Xoay/phóng to trong MATHVERSE. Cần Internet và quyền nhúng của Sketchfab.';
   void loadPhoto(w);return true;
 }
 function show(from='globe'){layer.hidden=false;renderList();if(!current)open(R102_CATALOG[0].id,from);}
 function close(){layer.hidden=true;frame.removeAttribute('src');photo.removeAttribute('src');inspector.close();loadId++;}
 function setTab(tab,item=current){
  if(!item)return;activeTab=tab;const isSketchfab=tab==='sketchfab';
  qs('r102-iframe-container').hidden=!isSketchfab;
  qs('r102-geometry-container').hidden=isSketchfab;
  qs('r102-math-line').hidden=isSketchfab;
  qs('r100-sketchfab-link').hidden=!isSketchfab;
  for(const key of ['sketchfab','3d','2d'])qs('r102-tab-'+key).classList.toggle('active',key===tab);
  qs('r102-model-title').textContent=isSketchfab?'3D Sketchfab · ảnh mô hình nguồn':tab==='3d'?'Mô hình hình học dựng trong không gian 3D':'Hình chiếu 2D · phân tích cấu trúc';
  qs('r102-geometry-canvas').hidden=tab!=='3d';
  qs('r102-svg-2d').hidden=tab!=='2d';
  if(tab==='2d'){inspector.close();qs('r102-svg-2d').innerHTML=geometricSVG(item);qs('r102-geometry-fallback').hidden=true;}
  if(tab==='3d'){const result=inspector.update(item,'3d');
   qs('r102-geometry-fallback').hidden=result.ok;
   if(!result.ok)qs('r102-geometry-fallback').textContent='Không thể khởi tạo trình dựng hình: '+result.error;
  }else inspector.close();
  if(!isSketchfab)qs('r102-math-text').textContent=item.formula||item.math||'';
 }
 const importBtn=qs('r104-import-glb'),importInput=qs('r104-glb-file');
 importBtn.onclick=()=>{if(current?.inGallery)importInput.click();};
 importInput.onchange=async()=>{
   const file=importInput.files?.[0],target=current;
   importInput.value='';
   if(!file||!target?.inGallery)return;
   if(!/\.glb$/i.test(file.name)){importBtn.textContent='Chỉ nhận tệp .glb';return;}
   importBtn.disabled=true;importBtn.textContent='ĐANG NẠP GLB...';
   try{
     const result=await onImport?.(target.id,file);
     if(!result?.ok)throw new Error('Không thể nạp GLB lên bục');
     importBtn.textContent='✅ GLB ĐÃ NẰM TRÊN BỤC';
     qs('r102-shape-note').textContent='GLB vừa được nạp lên bục trong phiên hiện tại. Để lưu vĩnh viễn, Antigravity sẽ đăng ký vào manifest hoặc cô sử dụng menu nạp GLB của R105.';
   }catch(error){importBtn.textContent='LỖI: '+String(error?.message||error).slice(0,30);}
   finally{importBtn.disabled=false;setTimeout(()=>importBtn.textContent='⬆ ĐẶT GLB LÊN BỤC',3400);}
 };
 qs('r102-tab-sketchfab').onclick=()=>setTab('sketchfab');
 qs('r102-tab-3d').onclick=()=>setTab('3d');
 qs('r102-tab-2d').onclick=()=>setTab('2d');
 qs('r102-copy-latex').onclick=async()=>{try{await navigator.clipboard.writeText(current?.formula||'');qs('r102-copy-latex').textContent='Đã sao chép';}catch{qs('r102-copy-latex').textContent='Chọn công thức để sao chép';}};
 qs('r100-close').onclick=close;qs('r100-back-room').onclick=()=>{close();onRoom?.('globe');};qs('r100-map').onclick=()=>{close();onMap?.();};
 search.addEventListener('input',renderList);filter.addEventListener('change',renderList);
 layer.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}});
 const api={open,show,close,has:(id)=>R102_BY_ID.has(id),get isOpen(){return !layer.hidden;},get current(){return current;}};
 if(typeof window!=='undefined')window.__wondersUI=api;
 return api;
}
