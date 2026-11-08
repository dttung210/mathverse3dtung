/** Interactive planisphere: geographical coordinates, not a traced/AI-generated map. */
import {
 OFFLINE_COUNTRIES_PATH,NATURAL_EARTH_50M_URL,OFFICIAL_UNESCO_DATASET,
 fetchOfficialUNESCO,lonLatToPixel,pixelToLonLat,countryFeatures,geometryRings,getCountryName,
 lonLatDistanceDeg
} from './geo-core.mjs?v=r107_v15';
import {UNESCO_HERITAGE} from '../discovery-unesco-data.mjs?v=r107_v15';
import {getR98Approved,refreshR98Catalog} from '../discovery-r98/catalog.mjs?v=r107_v15';
import {R102_CATALOG,R102_BY_ID,GROUP_COLORS} from '../discovery-r102/catalog.mjs?v=r107_v15';

const enc=s=>String(s??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
const htmlEscape=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

export function createDiscoveryWorldMapUI({onOpen,onReturn,onOfficialData}={}){
 const layer=document.createElement('section');layer.id='r97-world-map-ui';layer.hidden=true;
 layer.setAttribute('aria-label','Bản đồ thế giới và các di sản UNESCO');
 layer.innerHTML=`
 <header class="r97-map-header">
  <div><small>DISCOVERY · BẢN ĐỒ ĐỊA LÝ CHÍNH XÁC THEO TỶ LỆ NGUỒN</small><h2>🗺 BẢN ĐỒ THẾ GIỚI · 14 KỲ QUAN + 20 KIẾN TRÚC</h2></div>
  <div class="r97-map-top-actions"><button id="r97-map-update" type="button">↻ Cập nhật UNESCO</button><button id="r97-map-50m" type="button">⬇ Bản đồ 1:50 triệu</button><button id="r97-map-foyer" type="button">← Về sảnh địa cầu</button></div>
 </header>
 <div class="r97-map-main">
  <div class="r97-map-content"><div class="r97-map-stage"><canvas id="r97-world-canvas" aria-label="Bản đồ các nước thế giới, kéo để di chuyển, cuộn để phóng to" tabindex="0"></canvas><div id="r97-map-label" class="r97-map-label" aria-live="polite">Natural Earth · WGS84 · Chọn điểm để xem ảnh, tiểu sử và 3D Sketchfab trong ứng dụng.</div></div>
   <div class="r97-map-controls"><button id="r97-map-in" type="button">＋ Phóng to</button><button id="r97-map-out" type="button">－ Thu nhỏ</button><button id="r97-map-reset" type="button">◎ Toàn thế giới</button><label><input id="r97-map-curated-only" type="checkbox"/> ${R102_CATALOG.length} điểm công trình + GLB đã duyệt</label><span style="font-size:12px;color:#e2e8f0;margin-left:8px">🟡 UNESCO GLB đã duyệt · 🟠 Cổ đại · 🟡 New7Wonders 2007 · 🔴 Kiến trúc hình học khác</span></div>
   <p class="r97-map-source">Bản đồ: <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a> (public domain). Di sản: <a href="${OFFICIAL_UNESCO_DATASET}" target="_blank" rel="noopener noreferrer">UNESCO DataHub</a> (CC BY-SA 4.0). Ranh giới địa lý được khái quát theo tỷ lệ bản đồ, không thay thế hồ sơ pháp lý.</p>
  </div>
  <aside class="r97-map-sidebar"><strong id="r97-map-count">${R102_CATALOG.length} điểm kỳ quan và kiến trúc + di sản UNESCO đã duyệt</strong><input id="r97-map-search" type="search" placeholder="Tìm công trình, quốc gia..." aria-label="Tìm di sản UNESCO"/><div id="r97-map-records" role="list"></div><div id="r97-map-selected" class="r97-map-selected" aria-live="polite"><p>Chọn một chấm trên bản đồ hoặc di sản trong danh sách.</p></div></aside>
 </div>`;
 document.body.appendChild(layer);
 const $=id=>layer.querySelector(`#${id}`), canvas=$('r97-world-canvas'),g=canvas.getContext('2d');
 let offline=null,countries=null,curated=[],official=[],currentSites=curated, selected=null;
 let scale=1, panX=0,panY=0,down=null,curatedOnly=false,fullLoaded=false;
 let dataPromise=null,geoPromise=null;
 const WIDTH=1440,HEIGHT=720;
 canvas.width=WIDTH;canvas.height=HEIGHT;
 const geoPoint=item=>lonLatToPixel(item.lng,item.lat,WIDTH,HEIGHT);
 const toScreen=item=>{const p=geoPoint(item);return{x:p.x*scale+panX,y:p.y*scale+panY};};
 function visibleSites(){return curatedOnly?curated:currentSites;}
 function drawCountries(){
   if(!countries)return;
   g.save();g.translate(panX,panY);g.scale(scale,scale);
   const lines=countryFeatures(countries);
   for(let n=0;n<lines.length;n++){
     const f=lines[n];const rings=geometryRings(f);
     g.beginPath();
     for(const ring of rings){
       if(!ring?.length)continue;
       const p=lonLatToPixel(ring[0][0],ring[0][1],WIDTH,HEIGHT);g.moveTo(p.x,p.y);
       let last=p.x;
       for(let i=1;i<ring.length;i++){
         const u=lonLatToPixel(ring[i][0],ring[i][1],WIDTH,HEIGHT);
         if(Math.abs(u.x-last)>WIDTH*.9)g.moveTo(u.x,u.y);else g.lineTo(u.x,u.y);
         last=u.x;
       }
       g.closePath();
     }
     g.fillStyle=n%4===0?'#244e63':n%4===1?'#1f4355':n%4===2?'#2a5363':'#2b5160';
     g.strokeStyle='#75b6b8';g.lineWidth=0.7/scale;g.fill('evenodd');g.stroke();
   }
   if(scale>=1.8){
     g.fillStyle='#e6e8dd';g.font=`bold ${Math.max(5,12/scale)}px Arial`;g.textAlign='center';
     for(const f of lines){
       const ring=geometryRings(f).sort((a,b)=>b.length-a.length)[0];
       if(!ring?.length)continue;
       const country=getCountryName(f.properties);
       if(!country)continue;
       const stride=Math.max(1,Math.floor(ring.length/150));
       let minX=180,maxX=-180,minY=90,maxY=-90;
       for(let i=0;i<ring.length;i+=stride){const pt=ring[i];minX=Math.min(minX,pt[0]);maxX=Math.max(maxX,pt[0]);minY=Math.min(minY,pt[1]);maxY=Math.max(maxY,pt[1]);}
       if(maxX-minX<3&&scale<4)continue;
       const pos=lonLatToPixel((minX+maxX)/2,(minY+maxY)/2,WIDTH,HEIGHT);
       g.fillText(country.slice(0,20),pos.x,pos.y,140/scale);
     }
   }
   g.restore();
 }
 function drawGrid(){
   g.save();g.fillStyle='#0a253a';g.fillRect(0,0,WIDTH,HEIGHT);
   g.strokeStyle='rgba(124,186,204,.16)';g.lineWidth=1;
   for(let lng=-180;lng<=180;lng+=30){const x=(lng+180)/360*WIDTH*scale+panX;g.beginPath();g.moveTo(x,0);g.lineTo(x,HEIGHT);g.stroke();}
   for(let lat=-60;lat<=60;lat+=30){const y=(90-lat)/180*HEIGHT*scale+panY;g.beginPath();g.moveTo(0,y);g.lineTo(WIDTH,y);g.stroke();}
   g.restore();
 }
 function drawPins(){
   const sites=visibleSites();
   const selectedId=selected?.id;
   for(const it of sites){
     const p=toScreen(it);
     if(p.x<-6||p.x>WIDTH+6||p.y<-6||p.y>HEIGHT+6)continue;
     const isWonder=it.id.startsWith('wonder_')||it.id.startsWith('other_');
     const isUnescoCurated=it.id.startsWith('unesco_')&&!it.id.startsWith('unesco_official_');
     const isCurated=isUnescoCurated||isWonder;
     const r=it.id===selectedId?8.4:isCurated?5.6:2.4;
     g.beginPath();g.arc(p.x,p.y,r,0,Math.PI*2);
     g.fillStyle=it.id===selectedId?'#ffffff':isUnescoCurated?'#ffd166':isWonder?(it.group==='ancient'?'#f5946f':it.group==='new2007'?'#e9c07a':'#f35a65'):'#38ddc7';g.fill();
     if(isCurated||it.id===selectedId){g.lineWidth=1.5;g.strokeStyle='#0e2534';g.stroke();}
   }
   if(selected){const p=toScreen(selected);g.font='bold 18px Arial';
      const title=selected.name.slice(0,44);const width=Math.min(g.measureText(title).width+28,550),x=Math.max(7,Math.min(WIDTH-width-7,p.x+13)),y=Math.max(22,Math.min(HEIGHT-14,p.y-12));
      g.fillStyle='rgba(4,27,44,.94)';g.fillRect(x,y-22,width,30);g.fillStyle='#ffe4a6';g.fillText(title,x+10,y,Math.max(50,width-22));}
 }
 function render(){drawGrid();drawCountries();drawPins();}
 async function loadOffline(){
   try{offline=await fetch(OFFLINE_COUNTRIES_PATH).then(r=>{if(!r.ok)throw Error(`HTTP ${r.status}`);return r.json();});countries=offline;render();
       return true;
   }catch(e){$('r97-map-label').textContent=`Không tải được ranh giới quốc gia: ${e.message}`;return false;}
 }
 function renderList(){
  const term=enc($('r97-map-search').value.trim());
  const filtered=visibleSites().filter(s=>!term||enc(`${s.name} ${s.country} ${s.year||''}`).includes(term));
  const list=$('r97-map-records');list.replaceChildren();
  const limit=130;
  for(const it of filtered.slice(0,limit)){
    const b=document.createElement('button');b.type='button';b.className='r97-map-entry';b.dataset.id=it.id;
    b.innerHTML=`<strong>${htmlEscape(it.name)}</strong><small>${htmlEscape(it.country)} · ${R102_BY_ID.has(it.id)?(it.group==='ancient'?'Kỳ quan cổ đại':it.group==='new2007'?'Kỳ quan mới 2007':'Kiến trúc hình học khác'):it.year||'UNESCO'}</small>`;
    b.addEventListener('click',()=>selectSite(it,true));list.appendChild(b);
  }
  if(filtered.length>limit){const p=document.createElement('p');p.textContent=`Còn ${filtered.length-limit} mục. Hãy nhập tên để lọc danh sách.`;list.append(p);}
  $('r97-map-count').textContent=fullLoaded?
      `${filtered.length} / ${visibleSites().length} địa điểm gồm GLB UNESCO được duyệt và ${R102_CATALOG.length} công trình có Sketchfab · UNESCO DataHub tham khảo ${official.length} bản ghi`:
      `Đang hiển thị ${filtered.length} / ${curated.length}: UNESCO được duyệt + ${R102_CATALOG.length} kỳ quan/công trình dùng Sketchfab`;
 }
 function focus(x,y){scale=Math.max(1.2,scale);panX=WIDTH/2-x*scale;panY=HEIGHT/2-y*scale;render();}
 function selectSite(it,center=false){
  if(!it)return;selected=it;
  const wonder=R102_BY_ID.has(it.id);
  const page=wonder?(it.sketchfabUrl||it.source||`https://sketchfab.com/search?q=${encodeURIComponent(it.name)}&type=models`):(it.unescoUrl||`https://whc.unesco.org/en/list/${it.whcId}/`);
  const body=$('r97-map-selected');body.replaceChildren();
  const h=document.createElement('h3');h.textContent=it.name;
  const p=document.createElement('p');p.textContent=`${it.country} · ${it.year||'UNESCO'} · ${it.lat.toFixed(4)}°, ${it.lng.toFixed(4)}°`;
  const desc=document.createElement('p');desc.textContent=it.history||'Chưa có bản tóm tắt được kiểm chứng.';
  const src=document.createElement('a');src.href=page;src.target='_blank';src.rel='noopener noreferrer';src.textContent=wonder?'Sketchfab · tác giả mô hình 3D (không mặc định UNESCO)':'UNESCO · hồ sơ ghi danh chính thức';
  const b=document.createElement('button');b.type='button';b.textContent=wonder?'🏛 Xem kỳ quan, lịch sử và mô hình Sketchfab 3D':it.officialWorldHeritage?'Xem hồ sơ (ảnh và 3D chưa xác minh)':'🖼 Xem ảnh thật & 3D kiểm duyệt';
  b.addEventListener('click',()=>onOpen?.(it.id));
  body.append(h,p,desc,src,b);
  if(wonder)onOpen?.(it.id); // Open the same real photo + biography + Sketchfab on pin click or list click.
  if(center){const pt=geoPoint(it);focus(pt.x,pt.y);}else render();
 }
 function zoomAbout(delta,atX=WIDTH/2,atY=HEIGHT/2){
   const old=scale;scale=Math.min(12,Math.max(1,scale*delta));
   panX=atX-(atX-panX)*(scale/old);panY=atY-(atY-panY)*(scale/old);render();
 }
 canvas.addEventListener('pointerdown',e=>{down={x:e.offsetX*WIDTH/canvas.clientWidth,y:e.offsetY*HEIGHT/canvas.clientHeight,panX,panY,moved:false};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!down)return;const x=e.offsetX*WIDTH/canvas.clientWidth,y=e.offsetY*HEIGHT/canvas.clientHeight;
   if(Math.hypot(x-down.x,y-down.y)>5)down.moved=true;
   if(down.moved){panX=down.panX+x-down.x;panY=down.panY+y-down.y;render();}
 });
 canvas.addEventListener('pointerup',e=>{if(!down)return;const moved=down.moved;down=null;if(moved)return;
   const x=e.offsetX*WIDTH/canvas.clientWidth,y=e.offsetY*HEIGHT/canvas.clientHeight;
   let closest=null,dist=curatedOnly?17:12;
   for(const it of visibleSites()){const p=toScreen(it),d=Math.hypot(p.x-x,p.y-y);if(d<dist){dist=d;closest=it;}}
   if(closest)selectSite(closest);
 });
 canvas.addEventListener('wheel',e=>{e.preventDefault();const r=canvas.getBoundingClientRect();zoomAbout(e.deltaY>0?0.83:1.2,(e.clientX-r.left)*WIDTH/r.width,(e.clientY-r.top)*HEIGHT/r.height);},{passive:false});
 $('r97-map-in').onclick=()=>zoomAbout(1.4);$('r97-map-out').onclick=()=>zoomAbout(1/1.4);
 $('r97-map-reset').onclick=()=>{scale=1;panX=0;panY=0;render();};
 $('r97-map-search').addEventListener('input',renderList);
 $('r97-map-curated-only').addEventListener('change',e=>{curatedOnly=e.target.checked;render();renderList();});
 // No button jumping from the world map to the UNESCO room.
 $('r97-map-foyer').onclick=()=>{hide();onReturn?.();};
 $('r97-map-50m').onclick=async()=>{
  const b=$('r97-map-50m');b.disabled=true;b.textContent='Đang tải Natural Earth 1:50m…';
  try{
    let data=null;
    try{const local=await fetch('/api/discovery/countries').then(r=>{if(!r.ok)throw Error(`HTTP ${r.status}`);return r.json();});if(local.ok&&countryFeatures(local.geojson).length>=200)data=local.geojson;}catch(_){}
    if(!data)data=await fetch(NATURAL_EARTH_50M_URL).then(r=>{if(!r.ok)throw Error(`HTTP ${r.status}`);return r.json();});
    if(countryFeatures(data).length<200)throw Error('Tệp thiếu ranh giới quốc gia');
    countries=data;render();b.textContent=`✓ Bản đồ 1:50m (${countryFeatures(data).length} đơn vị)`;
    $('r97-map-label').textContent=`Đang dùng Natural Earth 1:50m (${countryFeatures(data).length} nước/vùng lãnh thổ).`;
  }catch(e){b.disabled=false;b.textContent='Thử tải lại 1:50m';$('r97-map-label').textContent=`Không thể tải 1:50m: ${e.message}. Vẫn dùng bản đồ 1:110m ngoại tuyến.`;}
 };
 async function update(){
  if(dataPromise)return dataPromise;
  $('r97-map-update').disabled=true;$('r97-map-count').textContent='Đang tải điểm UNESCO chính thức…';
  dataPromise=fetchOfficialUNESCO().then(sites=>{
   const curatedIds=new Set(curated.filter(s=>s.whcId).map(s=>s.whcId));
   official=sites; currentSites=[...curated];fullLoaded=true;
   onOfficialData?.([]);render();renderList();$('r97-map-label').textContent=`${sites.length} di sản UNESCO tham khảo. Bản đồ chỉ đánh dấu di sản có GLB kiểm duyệt và ${R102_CATALOG.length} kỳ quan/công trình có hồ sơ Sketchfab.`;
  }).catch(e=>{
    fullLoaded=false;renderList();$('r97-map-label').textContent=`Chưa tải được danh mục UNESCO toàn thế giới: ${e.message}. Có ${R102_CATALOG.length} điểm công trình và hồ sơ UNESCO đã duyệt (ngoại tuyến).`;
  }).finally(()=>{$('r97-map-update').disabled=false;dataPromise=null;});
  return dataPromise;
 }
 $('r97-map-update').onclick=()=>update();
 geoPromise=loadOffline();
 window.addEventListener('mathverse-r98-catalog-updated',e=>{
   const approved=new Set((e.detail.approved||[]).map(a=>a.id));
   curated=UNESCO_HERITAGE.filter(a=>approved.has(a.id));
   curated.push(...R102_CATALOG);
   currentSites=[...curated];selected=curated.find(a=>a.id===selected?.id)||null;render();renderList();
 });
 function show(){layer.hidden=false;render();renderList();if(!fullLoaded&&!dataPromise)update();void refreshR98Catalog();}
 function hide(){layer.hidden=true;}
 return {show,hide,update,get isOpen(){return !layer.hidden;},get officialSites(){return official;},get currentSites(){return currentSites;},get countries(){return countries;},chooseSite:selectSite,ready:geoPromise};
}
