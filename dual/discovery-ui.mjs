/** Self-contained 2-room Discovery UI (R93 + R95). No change to legacy Museum, Lab or Park UI. */
import * as THREE from '/vendor/three.module.js';
import {
  DISCOVERY_LANDMARKS,
  DISCOVERY_ARTWORKS,
  DISCOVERY_ALL_LANDMARKS,
  DISCOVERY_ALL_ARTWORKS,
  DISCOVERY_CONTINENTS,
  DISCOVERY_COLLECTIONS,
  MAX_GALLERY_PHYSICAL_FRAMES,
  discoveryById,
  filterLandmarks,
  groupGalleryByCollection,
  getGallerySliceForFrames,
  isReadyToShowPhotograph
} from './discovery-data.mjs';
import { createDiscoveryModel, disposeDiscoveryModel, geometrySVG } from './discovery-shapes.mjs';
import { renderObject3DSoftware } from './discovery-r102/geometry-viewer.mjs';
import { UNESCO_HERITAGE, isUnescoItem, trustedSketchfabEmbed } from './discovery-unesco-data.mjs';
import {resolveDiscoveryPhoto} from './discovery-photo-r96.mjs';
import {roomBMathSVG} from './discovery-r106/gallery-svg.mjs';
import {roomBMathSVG_R107} from './discovery-r107/gallery-svg.mjs';
import {R102_CATALOG} from './discovery-r102/catalog.mjs';
import {R97_VERIFIED_IDS,R97_VERIFIED_UNESCO_MODELS,isR97VerifiedGeometry,verifiedGeometryNote} from './discovery-r97/verified-heritage.mjs';
import {getR98Asset,getR98Approved,refreshR98Catalog} from './discovery-r98/catalog.mjs';
import {loadR98Scan,fitR98Scan} from './discovery-r98/scan-loader.mjs';

const $ = (id) => document.getElementById(id);

export function createDiscoveryUI({ onRoom, onBack, onLandmarkSelect, onRotateGlobe } = {}) {
  const panel = $('discovery-quick-panel'),
    modal = $('discovery-detail'),
    galleryNav = $('discovery-item-list');
  const source = $('discovery-source'),
    photo = $('discovery-photo'),
    fallback = $('discovery-photo-fallback');

  let item = null,
    view = '3d',
    subset = false,
    renderer = null,
    scene = null,
    camera = null,
    model = null,
    raf = 0,
    orbit = 0,
    tilt = .2,
    zoom = 15,
    drag = null,
    photoToken = 0,
    modelToken=0;

  const officialById=new Map();
  let currentRoomId = 'foyer';
  let searchQuery = '';
  let selectedContinent = 'all';
  let selectedGrade = '';
  let selectedCollection = 'Ảnh thật và hình học R106';
  let galleryPage=0;
  let galleryApprovedOnly = true;
  let unescoPage = 0;

  // Inject single Quick-Access button in Museum HUD (#museum-hud) without duplicating or altering index.html
  function ensureMuseumQuickAccess() {
    const hudContent = $('hud-content');
    if (hudContent && !$('museum-quick-discovery')) {
      const btn = document.createElement('button');
      btn.id = 'museum-quick-discovery';
      btn.className = 'mini-primary discovery-museum-shortcut';
      btn.type = 'button';
      btn.textContent = '🌍 ĐỊA CẦU & TRIỂN LÃM HÌNH HỌC · UNESCO';
      btn.title = 'Mở sảnh địa cầu với 18 di sản UNESCO, Phòng UNESCO và Phòng tranh hình học (40 chủ đề)';
      btn.onclick = () => {
        $('enter-discovery')?.click();
      };
      const backBtn = $('back-to-start');
      if (backBtn && backBtn.parentNode === hudContent) {
        hudContent.insertBefore(btn, backBtn);
      } else {
        hudContent.appendChild(btn);
      }
    }
  }
  ensureMuseumQuickAccess();

  // Inject R95 Filter / Collection containers into #discovery-quick-panel and LaTeX badge into #discovery-detail
  const filterWrap = document.createElement('div');
  filterWrap.id = 'discovery-r95-controls';
  filterWrap.className = 'discovery-r95-controls';
  if (galleryNav && galleryNav.parentNode) {
    galleryNav.parentNode.insertBefore(filterWrap, galleryNav);
  }

  const globeTools = $('discovery-globe-tools');
  if (globeTools && !$('discovery-reset-globe')) {
    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.id = 'discovery-reset-globe';
    resetBtn.textContent = '↺ Đặt lại góc nhìn';
    resetBtn.onclick = () => {
      window.__discoveryWorld?.resetGlobeView?.();
    };
    globeTools.appendChild(resetBtn);
  }

  const mathCard = modal?.querySelector('.discovery-math-card');
  let latexBox = $('discovery-latex-box');
  if (mathCard && !latexBox) {
    latexBox = document.createElement('div');
    latexBox.id = 'discovery-latex-box';
    latexBox.className = 'discovery-latex-box';
    const dl = mathCard.querySelector('dl');
    if (dl) mathCard.insertBefore(latexBox, dl);
    else mathCard.appendChild(latexBox);
  }

  let statusBadge = $('discovery-verify-badge');
  const factCard = modal?.querySelector('.discovery-fact-card');
  if (factCard && !statusBadge) {
    statusBadge = document.createElement('div');
    statusBadge.id = 'discovery-verify-badge';
    statusBadge.className = 'discovery-verify-badge';
    factCard.insertBefore(statusBadge, factCard.firstChild);
  }

  function modeButton(name) {
    $('discovery-show-3d').classList.toggle('selected', name === '3d');
    $('discovery-show-2d').classList.toggle('selected', name === '2d');
    $('discovery-show-sketchfab')?.classList.toggle('selected', name === 'sketchfab');
  }

  let software2dCtx = null;
  function prepareViewer() {
    if (!scene) {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x091b2d);
      scene.add(new THREE.AmbientLight(0xffffff, 1.25));
      const key = new THREE.DirectionalLight(0xffdfad, 2.2);
      key.position.set(5, 12, 10);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x2dcab8, 1.1);
      rim.position.set(-6, -4, -8);
      scene.add(rim);
      camera = new THREE.PerspectiveCamera(40, 1, .1, 100);
    }
    if (renderer || software2dCtx) return;
    const cv = $('discovery-preview');
    try {
      const gl = cv?.getContext('webgl2', { antialias: true, powerPreference: 'low-power' }) ||
                 cv?.getContext('webgl', { antialias: true, powerPreference: 'low-power' });
      if (!gl) throw new Error('WebGL context unavailable');
      renderer = new THREE.WebGLRenderer({
        canvas: cv,
        context: gl,
        alpha: false,
        antialias: true,
        powerPreference: 'low-power'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } catch (error) {
      renderer = null;
      software2dCtx = cv?.getContext('2d') || null;
    }
  }

  function replaceModel(kindOrEntry) {
    if (model) {
      scene?.remove(model);
      disposeDiscoveryModel(model);
      model = null;
    }
    if (!scene) return;
    const target = item || kindOrEntry;
    const k = typeof kindOrEntry === 'string' ? kindOrEntry : target?.kind;
    if(isUnescoItem(target)){
      const approved=getR98Asset(target.id);
      if(!approved){$('discovery-preview-status').textContent='Chưa có mô hình quét 3D được duyệt. Không tạo hình khối giả.';return;}
      const key=++modelToken;model=new THREE.Group();scene.add(model);
      $('discovery-preview-status').textContent='Đang nạp GLB quang trắc/LiDAR đã kiểm chứng nguồn…';
      loadR98Scan(approved.glb.url).then(scan=>{
        if(key!==modelToken)return;
        fitR98Scan(model,scan,11.5);
        $('discovery-preview-status').textContent=`GLB tư liệu đã duyệt bởi ${approved.review.reviewer}. Độ chính xác đo đạc chưa được chứng nhận.`;
      }).catch(err=>{$('discovery-preview-status').textContent='LỖI MÔ HÌNH: '+err.message;});
    } else {
      model=createDiscoveryModel(target || kindOrEntry);
      scene.add(model);
      $('discovery-preview-status').textContent='Mô hình 3D khớp cấu trúc vật thể — kéo chuột để xoay 360°, cuộn chuột để phóng to.';
    }
    orbit = .35;
    tilt = .22;
    zoom = isUnescoItem(target) ? 9.2 : k === 'bridge' ? 22 : k === 'truss' ? 19 : k === 'traffic' ? 15.5 : 14;
  }

  function draw() {
    if ((!renderer && !software2dCtx) || modal.hidden || view !== '3d') {
      raf = 0;
      return;
    }
    const cv = $('discovery-preview'),
      w = Math.max(200, cv.clientWidth),
      h = Math.max(160, cv.clientHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    camera.position.set(
      zoom * Math.sin(orbit) * Math.cos(tilt),
      zoom * Math.sin(tilt) + 1.8,
      zoom * Math.cos(orbit) * Math.cos(tilt)
    );
    camera.lookAt(0, 0.5, 0);
    if (renderer) {
      if (cv.width !== Math.round(w * renderer.getPixelRatio()) || cv.height !== Math.round(h * renderer.getPixelRatio())) {
        renderer.setSize(w, h, false);
      }
      renderer.render(scene, camera);
    } else if (software2dCtx && model) {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const tw = Math.round(w * dpr), th = Math.round(h * dpr);
      if (cv.width !== tw || cv.height !== th) { cv.width = tw; cv.height = th; }
      software2dCtx.save();
      software2dCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderObject3DSoftware(software2dCtx, w, h, model, camera, `${item?.name || 'Mô hình 3D'} · Kéo chuột xoay 360°`);
      software2dCtx.restore();
    }
    raf = requestAnimationFrame(draw);
  }

  function showView(which) {
    if(which==='sketchfab' && (currentRoomId==='unesco'||currentRoomId==='globe'||!trustedSketchfabEmbed(item)))which='3d';
    if(which==='3d' && isUnescoItem(item)&&!getR98Asset(item.id))which='2d';
    view=which;
    modeButton(which);
    const is3d=which==='3d';
    $('discovery-model-3d').hidden=!is3d;
    $('discovery-model-2d').hidden=which!=='2d';
    $('discovery-model-sketchfab').hidden=which!=='sketchfab';
    const iframe=$('discovery-sketchfab-iframe');
    if(which==='sketchfab') {
      const url=trustedSketchfabEmbed(item);
      // Lazy loading: only the selected viewer is attached to the iframe.
      if(url && iframe.getAttribute('src')!==url) iframe.src=url;
    } else if(iframe.hasAttribute('src')) {
      iframe.removeAttribute('src');
    }
    $('discovery-fish-toggle').hidden=!(item?.kind==='fish' && which==='2d');
    if(is3d){
      prepareViewer();
      if(renderer || software2dCtx){
        replaceModel(item || item?.kind);
        if(!raf)raf=requestAnimationFrame(draw);
      }
    } else {
      if(raf){cancelAnimationFrame(raf);raf=0;}
      if(which==='2d') $('discovery-svg-holder').innerHTML=item?.officialWorldHeritage?'<p class="discovery-unverified-geometry">Chưa có bản vẽ 2D được đối chiếu cho di sản này. Không tự sinh hình minh họa dễ gây hiểu nhầm.</p>':(item?.collection==='Ảnh thật và hình học R106'?roomBMathSVG(item):item?.id?.startsWith('r107_')?roomBMathSVG_R107(item):geometrySVG(item || item?.kind,subset));
    }
  }

  /** Always attempt a genuine, licence-attributed photo. Never label SVG as real. */
  function selectPhoto(data) {
    const token=++photoToken;
    fallback.hidden=false;
    photo.hidden=true;
    photo.removeAttribute('src');
    const asset=isUnescoItem(data)?getR98Asset(data.id):null;
    const approved=asset?true:isUnescoItem(data)?false:isReadyToShowPhotograph(data);
    if(asset){
      fallback.textContent='Đang tải ảnh thực tế đã được duyệt';
      photo.onload=()=>{if(token!==photoToken)return;fallback.hidden=true;photo.hidden=false;};
      photo.onerror=()=>{if(token!==photoToken)return;fallback.hidden=false;photo.hidden=true;fallback.textContent='Không đọc được ảnh đã duyệt';};
      photo.alt=`Ảnh thực tế công trình: ${data.name}`;photo.src=asset.photo.url;
      source.href=asset.review.photoSource;source.textContent=`Ảnh: ${asset.review.photoAuthor} · ${asset.review.photoLicense} · nguồn đã đối chiếu`;
      return;
    }
    if(isUnescoItem(data)){fallback.textContent='Chưa có ảnh đúng công trình + GLB đã duyệt. Không dùng ảnh Wikipedia chung thay thế.';return;}
    if(!approved){
      if(data.diagramType){
        fallback.innerHTML=geometrySVG(data);
      }else{
        fallback.textContent='🖼 Chưa có ảnh thực tế được kiểm chứng đúng công trình và giấy phép. Không thay ảnh bằng hình minh họa.';
      }
    }else {
      fallback.textContent='🖼 Đang tải ảnh thực tế từ Wikimedia Commons...';
    }
    photo.onload=()=>{if(token!==photoToken)return;fallback.hidden=true;photo.hidden=false;};
    photo.onerror=()=>{if(token!==photoToken)return;fallback.hidden=false;photo.hidden=true;};
    resolveDiscoveryPhoto(data).then(media=>{
      if(token!==photoToken)return;
      if(!media?.url){
        if(!approved){
          if(data.diagramType){
            fallback.innerHTML=geometrySVG(data);
          }else{
            fallback.textContent='⚠ Không tải được ảnh thực tế được xác minh. Vui lòng kiểm tra lại kết nối, tên công trình và giấy phép.';
          }
        }
        return;
      }
      photo.alt=`Ảnh tư liệu Wikimedia Commons liên quan đến: ${data.name}`;
      photo.src=media.url;
      source.href=media.source;
      source.textContent=`Nguồn ảnh: ${media.author} · ${media.license} · Wikimedia Commons${media.referenceOnly?' (ảnh minh họa tham khảo)':''}`;
      if(statusBadge){
        const extra=isUnescoItem(data)?'✓ Di sản ghi danh UNESCO · Ảnh minh họa tham khảo':'Ảnh tư liệu tham khảo; giáo viên kiểm tra nội dung ảnh';
        statusBadge.className='discovery-verify-badge is-verified';
        statusBadge.replaceChildren();
        for(const content of [extra,`${media.license} · Wikimedia Commons`]){
          const badge=document.createElement('span');badge.textContent=content;statusBadge.appendChild(badge);
        }
      }
    });
  }

  function openItem(id) {
    const entry = discoveryById(id)||officialById.get(id);
    if (!entry) return false;
    if(isUnescoItem(entry)&&!getR98Asset(entry.id))return false;
    item = entry;
    subset = false;
    modal.hidden = false;
    const isLandmark = 'lat' in entry;
    const isUNESCO = isUnescoItem(entry)||entry.officialWorldHeritage===true;
    $('discovery-category').textContent = isUNESCO
      ? `DI SẢN VĂN HÓA THẾ GIỚI UNESCO · ${entry.country.toUpperCase()} · ${entry.year}`
      : isLandmark
        ? `ĐỊA DANH TRÊN ĐỊA CẦU · ${(entry.continent || entry.country || '').toUpperCase()}`
      : `TRIỂN LÃM HÌNH HỌC · ${(entry.collection || 'ĐỜI SỐNG').toUpperCase()}`;
    $('discovery-title').textContent = entry.name;

    if (statusBadge) {
      const approved = isReadyToShowPhotograph(entry);
      statusBadge.className = 'discovery-verify-badge ' + (approved ? 'is-verified' : 'is-pending');
      statusBadge.innerHTML = isUNESCO
        ? `<span>✓ UNESCO đã ghi danh di sản</span><span>🖼 Đang tải ảnh tư liệu có metadata giấy phép</span>`
        : approved
          ? `<span>✓ Ảnh thực tế có giấy phép Wikimedia Commons</span><span>📐 Mô hình toán học lý tưởng hóa</span>`
          : `<span>⏳ Đang bổ sung ảnh thực tế có giấy phép</span><span>📐 Mô hình Toán không phải bản scan kiến trúc</span>`;
    }

    const coordLine = isLandmark
      ? `📍 Quốc gia: ${entry.country} (${entry.continent || 'Thế giới'}) · Tọa độ: ${entry.lat.toFixed(4)}°, ${entry.lng.toFixed(4)}°\n\n`
      : '';
    $('discovery-description').textContent = coordLine + (isLandmark ? entry.history + '\n\n' : '') + (entry.explanation || entry.math);
    $('discovery-math').textContent = entry.math;
    $('discovery-shape').textContent = entry.shape || entry.math;
    $('discovery-grades').textContent = entry.grade;

    if (latexBox) {
      const formula = entry.latex || entry.geometry?.latex || '';
      latexBox.hidden = !formula;
      latexBox.innerHTML = formula
        ? `<span class="latex-label">CÔNG THỨC TOÁN HỌC (LaTeX):</span><code class="latex-code">${formula}</code>`
        : '';
    }

    $('discovery-note').textContent = isUNESCO
      ? `Di sản UNESCO: ${entry.unescoUrl} · Sketchfab là mô hình của tác giả độc lập; 3D Toán/GLB trong MATHVERSE chỉ là mô hình hình học lý tưởng hóa, không phải bản quét chính xác công trình.`
      : isLandmark
        ? 'Mô hình toán học lý tưởng hóa — không phải bản quét kiến trúc thực tế hay bản vẽ CAD công trình.'
      : entry.kind === 'fish'
        ? 'Hình 5 con cá là ví dụ minh họa tập hợp A = {c₁, c₂, c₃, c₄, c₅}, KHÔNG phải phép đếm số cá trong ảnh thực.'
      : entry.kind === 'traffic'
        ? 'Mô hình hình học khớp cấu trúc vật thể (vỏ hộp chữ nhật bo góc, nắp che nắng, 3 cụm đèn tròn lồi — mặt khối trụ dẹt) đối chiếu ảnh thực tế; không phải bản sao đo đạc của một thiết bị cụ thể.'
        : (entry.fidelityNote || 'Mô hình toán học lý tưởng hóa từ vật thể đời thực để học sinh quan sát hình học trực quan.');

    if (isReadyToShowPhotograph(entry)) {
      source.href = entry.media.source;
      source.textContent = `Nguồn ảnh: ${entry.media.author} · ${entry.media.license} (Wikimedia Commons)`;
    } else {
      source.href = entry.unescoUrl||entry.sourceUrl || 'https://commons.wikimedia.org/';
      source.textContent = `Nguồn tham khảo: ${entry.sourceUrl || 'Wikimedia Commons'} · Trạng thái ảnh: Đang bổ sung ảnh thực tế có giấy phép (${entry.photo?.commonsSearch || entry.name})`;
    }

    const unescoSource=$('discovery-unesco-source');
    if(unescoSource){
      unescoSource.hidden=!isUNESCO;
      if(isUNESCO){unescoSource.href=entry.unescoUrl;unescoSource.textContent=`UNESCO · Hồ sơ chính thức số ${entry.whcId} (ghi danh ${entry.year})`;}
    }
    const authorSource=$('discovery-sketchfab-source');
    if(authorSource){
      authorSource.hidden=!isUNESCO||!entry.sketchfabId;
      if(!authorSource.hidden){
        authorSource.href=`https://sketchfab.com/models/${entry.sketchfabId}`;
        authorSource.textContent=`3D Sketchfab · Tác giả: ${entry.modelAuthor || 'xem tại nguồn'} · Xem giấy phép tại nguồn`;
      }
    }
    selectPhoto(entry);
    const embed=trustedSketchfabEmbed(entry);
    const permitEmbed=Boolean(embed) && !['unesco','globe','gallery'].includes(currentRoomId);
    $('discovery-show-sketchfab').hidden=!permitEmbed;
    $('discovery-show-3d').hidden=(isUnescoItem(entry)&&!getR98Asset(entry.id));
    $('discovery-show-2d').hidden=entry.officialWorldHeritage===true || entry.geometry2DApproved===false;
    const geometryNote=isR97VerifiedGeometry(entry.id)?verifiedGeometryNote(entry.id):'';
    if(isUNESCO&&getR98Asset(entry.id)){const approved=getR98Asset(entry.id);$('discovery-note').textContent=`Ảnh và GLB quang trắc/LiDAR được ${approved.review.reviewer} duyệt nội bộ. Nguồn 3D: ${approved.review.modelSource}. Không phải chứng nhận sai số kiến trúc.`;}
    else if(geometryNote && currentRoomId==='unesco')$('discovery-note').textContent=geometryNote;
    showView(permitEmbed?'sketchfab':'3d');
    if(entry.officialWorldHeritage){$('discovery-model-2d').hidden=false;$('discovery-svg-holder').innerHTML='<p class="discovery-unverified-geometry">Nguồn UNESCO chỉ xác nhận dữ liệu di sản. Chưa có ảnh hay 3D đã đối chiếu cho địa điểm này.</p>';}
    if (isLandmark) {
      window.__discoveryWorld?.focusLandmark?.(entry);
      onLandmarkSelect?.(entry);
    }
    return true;
  }

  function close() {
    modal.hidden = true;
    ++photoToken;
    ++modelToken;
    photo.removeAttribute('src');
    $('discovery-sketchfab-iframe')?.removeAttribute('src');
    photo.onload = null;
    photo.onerror = null;
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    if (model) {
      scene?.remove(model);
      disposeDiscoveryModel(model);
      model = null;
    }
  }

  function renderGlobeList() {
    const inVerifiedRoom=['unesco','globe'].includes(currentRoomId);
    const allowed=new Set(getR98Approved().map(x=>x.id));
    const sourceList=UNESCO_HERITAGE.filter(x=>allowed.has(x.id));
    const filtered=filterLandmarks(sourceList,{
      text:searchQuery,continent:selectedContinent,
      classes:selectedGrade?String(selectedGrade):'all',limit:100
    });
    window.__discoveryWorld?.setGlobeFilter?.(new Set(filtered.map(x=>x.id)));
    const qNorm=(searchQuery||'').toLocaleLowerCase('vi').trim();
    const wondersFiltered=R102_CATALOG.filter(w=>{
      if(!qNorm)return true;
      return `${w.name} ${w.english||''} ${w.country||''} ${w.math||''}`.toLocaleLowerCase('vi').includes(qNorm);
    });
    const visWonderIds=new Set(wondersFiltered.map(w=>w.id));
    for(const pin of window.__discoveryWorld?.r102GlobePins||[]){
      const id=pin.userData?.discoveryAction?.id;
      if(id)pin.visible=visWonderIds.has(id);
    }
    for(const pin of window.__discoveryWorld?.r107FoyerMapPins||[]){
      const id=pin.userData?.discoveryAction?.id;
      if(id)pin.visible=visWonderIds.has(id);
    }
    const countEl=$('discovery-filter-count');
    if(countEl)countEl.textContent=inVerifiedRoom?`Phòng UNESCO 3D: ${wondersFiltered.length} công trình (2 trang R106/R107) + ${filtered.length} GLB R98`:`Địa cầu & Bản đồ đối xứng: ${wondersFiltered.length} / ${R102_CATALOG.length} điểm (Ảnh thật + Sketchfab 3D)`;
    galleryNav.replaceChildren();
    for(const it of filtered){
      const b=document.createElement('button');b.type='button';
      b.className='discovery-list-item unesco-list-item';b.dataset.id=it.id;
      const main=document.createElement('div');main.className='item-main';
      const title=document.createElement('strong');title.textContent=it.name;
      const small=document.createElement('small');small.textContent=`${it.country} · UNESCO ${it.year} · ${it.grade}`;
      main.append(title,small);
      const badge=document.createElement('span');badge.className='item-badge';
      badge.textContent=inVerifiedRoom?'GLB QUÉT ĐÃ DUYỆT':'ẢNH + GLB ĐÃ DUYỆT';
      b.append(main,badge);b.addEventListener('click',()=>openItem(it.id));
      galleryNav.appendChild(b);
    }
    for(const w of wondersFiltered){
      const b=document.createElement('button');b.type='button';
      b.className='discovery-list-item unesco-list-item';b.dataset.id=w.id;
      const main=document.createElement('div');main.className='item-main';
      const title=document.createElement('strong');title.textContent=`${w.order}. ${w.name}`;
      const small=document.createElement('small');small.textContent=`${w.country} · ${w.caption||w.math}`;
      main.append(title,small);
      const badge=document.createElement('span');badge.className='item-badge';
      badge.textContent='ẢNH + SKETCHFAB 3D';
      b.append(main,badge);
      b.addEventListener('click',()=>{
        window.__discoveryWorld?.focusLandmark?.(w);
        window.__wondersUI?.open?.(w.id,inVerifiedRoom?'room':'globe');
      });
      galleryNav.appendChild(b);
    }
  }

  const VERIFIED_GALLERY_COLLECTIONS = [
    'Ảnh thật và hình học R106',
    'Ảnh R107 · Thiên nhiên',
    'Ảnh R107 · Kỹ thuật',
    'Bộ sưu tập trước đây'
  ];
  const isVerifiedPhotoArtwork = (x) =>
    Boolean(x && (x.photoApproved || x.id?.startsWith('r106_') || x.id?.startsWith('r107_') || ['traffic', 'fish', 'wheel', 'clock'].includes(x.id)));

  function renderGalleryList() {
    if (!VERIFIED_GALLERY_COLLECTIONS.includes(selectedCollection)) {
      selectedCollection = 'Ảnh thật và hình học R106';
    }
    const groups = groupGalleryByCollection(DISCOVERY_ALL_ARTWORKS);
    const rawColItems = (groups.get(selectedCollection) || DISCOVERY_ARTWORKS).filter(isVerifiedPhotoArtwork);
    const colItems = rawColItems.length ? rawColItems : DISCOVERY_ARTWORKS;
    const numberOfPages=Math.max(1,Math.ceil(colItems.length/MAX_GALLERY_PHYSICAL_FRAMES));
    galleryPage=Math.min(galleryPage,numberOfPages-1);
    const frameSlice = colItems.slice(galleryPage*MAX_GALLERY_PHYSICAL_FRAMES,(galleryPage+1)*MAX_GALLERY_PHYSICAL_FRAMES);
    window.__discoveryWorld?.setGalleryCollectionItems?.(frameSlice);

    const countEl = $('discovery-gallery-count');
    if (countEl) {
      countEl.textContent = `Đã xác thực: ${colItems.length} ảnh chụp thực tế có bản quyền · Đang treo ${frameSlice.length}/${MAX_GALLERY_PHYSICAL_FRAMES} khung ở Tầng 1`;
    }
    // R106: keep exactly 8 physical photo frames in Room B North wall, and allow paging 11 photographs.
    const oldPager=$('r106-room-b-pager');oldPager?.remove();
    if(numberOfPages>1){
      const pager=document.createElement('div');pager.id='r106-room-b-pager';pager.style.cssText='display:flex;align-items:center;gap:7px;margin:7px 0;flex-wrap:wrap';
      const label=document.createElement('span');label.textContent=`Đang treo trang ${galleryPage+1}/${numberOfPages} · ${frameSlice.length} khung ảnh thật`;label.style.fontSize='12px';
      for(const [caption,delta] of [['◀ Trước',-1],['Sau ▶',1]]){
        const btn=document.createElement('button');btn.type='button';btn.textContent=caption;btn.disabled=delta<0?galleryPage===0:galleryPage===numberOfPages-1;
        btn.onclick=()=>{galleryPage+=delta;renderGalleryList();};pager.appendChild(btn);
      }
      pager.appendChild(label);$('discovery-gallery-count')?.after(pager);
    }
    galleryNav.replaceChildren();
    for (const it of colItems) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'discovery-list-item';
      b.dataset.id = it.id;
      const modeLabel = '2D + 3D';
      const statusTag = `✓ Ảnh thật · ${modeLabel}`;
      b.innerHTML = `<div class="item-main"><strong>${it.name}</strong><small>${it.math} · ${it.grade}</small></div><span class="item-badge has-3d">${statusTag}</span>`;
      b.addEventListener('click', () => openItem(it.id));
      galleryNav.appendChild(b);
    }
  }

  function buildRoomControls(room) {
    filterWrap.replaceChildren();
    if (room === 'foyer' || room === 'unesco' || room === 'globe') {
      filterWrap.hidden = false;
      filterWrap.innerHTML = `
        <div class="r95-filter-group">
          <input id="discovery-search-input" type="search" placeholder="🔎 Tìm di sản UNESCO, quốc gia, hình học..." value="${searchQuery.replaceAll('&','&amp;').replaceAll('\"','&quot;').replaceAll('<','&lt;')}" aria-label="Tìm kiếm địa danh không dấu"/>
          <div class="r95-filter-row">
            <select id="discovery-continent-select" aria-label="Lọc theo châu lục">
              ${DISCOVERY_CONTINENTS.map((c) => `<option value="${c}" ${c === selectedContinent ? 'selected' : ''}>${c === 'all' ? '🌍 Tất cả châu lục (18 UNESCO)' : c}</option>`).join('')}
            </select>
            <select id="discovery-grade-select" aria-label="Lọc theo khối lớp">
              <option value="">🎓 Tất cả lớp (6–12)</option>
              ${[6, 7, 8, 9, 10, 11, 12].map((g) => `<option value="${g}" ${String(g) === String(selectedGrade) ? 'selected' : ''}>Toán lớp ${g}</option>`).join('')}
            </select>
          </div>
          <div id="discovery-filter-count" class="r95-filter-count"></div>
          ${room === 'foyer' ? `<div style="margin-top:6px;padding:7px 9px;border-radius:8px;background:rgba(15,41,58,.85);border:1px solid rgba(94,234,212,.28);font-size:11.5px;line-height:1.45;color:#dbeafe">
            <div><strong style="color:#5eead4">● Di sản Văn hóa UNESCO:</strong> Đã duyệt GLB quang trắc + ảnh thật (Hồ sơ WHC chính thức).</div>
            <div><strong style="color:#fbbf24">● 10 Kỳ quan Thiên nhiên DEM 3D:</strong> Bình chọn <em>Seven Natural Wonders</em> / <em>New7Wonders 2011</em> (không đồng nghĩa UNESCO; tọa độ chấm là điểm tham chiếu vùng).</div>
          </div>` : ''}
          <div style="margin-top:6px"><a href="/dual/discovery-r98/quan-ly.html" target="_blank" rel="noopener noreferrer" style="color:#5eead4;font-size:12px;font-weight:700;text-decoration:underline">🛠 Mở trang Quản lý &amp; Duyệt GLB/Ảnh thật R98</a></div>
        </div>
      `;
      const sInput = $('discovery-search-input');
      const cSelect = $('discovery-continent-select');
      const gSelect = $('discovery-grade-select');
      sInput?.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderGlobeList();
      });
      cSelect?.addEventListener('change', (e) => {
        selectedContinent = e.target.value;
        renderGlobeList();
      });
      gSelect?.addEventListener('change', (e) => {
        selectedGrade = e.target.value;
        renderGlobeList();
      });
      if (room === 'unesco') {
        const controls=document.createElement('div');controls.className='unesco-page-controls';
        controls.innerHTML='<small id="unesco-page-label">Chỉ mô hình được đối chiếu ảnh và dữ liệu quét thực tế</small>';
        filterWrap.appendChild(controls);
        window.__discoveryWorld?.setUNESCOPage?.(0);
      }
      renderGlobeList();
    } else if (room === 'nature') {
      filterWrap.hidden=false;galleryNav.replaceChildren();
      filterWrap.innerHTML='<div class="r95-filter-group"><strong>🌿 KỲ QUAN THIÊN NHIÊN THẾ GIỚI</strong><p>10 cảnh quan địa hình có thể dựng 3D từ DEM + ảnh vệ tinh. 4 hiện tượng/đối tượng đặc biệt được lưu trong danh sách chờ dữ liệu 3D chuyên dụng.</p><p>Bấm nút “🌿 Danh sách 14 kỳ quan” để xem mô hình 3D từ nguồn đo đạc.</p></div>';
    } else if (room === 'gallery') {
      if (!VERIFIED_GALLERY_COLLECTIONS.includes(selectedCollection)) {
        selectedCollection = 'Ảnh thật và hình học R106';
      }
      filterWrap.hidden = false;
      filterWrap.innerHTML = `
        <div class="r95-filter-group">
          <label class="r95-collection-label" for="discovery-collection-select">🗂 CHỌN BỘ SƯU TẬP ẢNH THẬT ĐÃ XÁC THỰC (32 TRANH):</label>
          <select id="discovery-collection-select" aria-label="Chọn bộ sưu tập tranh Phòng B">
            ${VERIFIED_GALLERY_COLLECTIONS.map((col) => `<option value="${col}" ${col === selectedCollection ? 'selected' : ''}>${col}</option>`).join('')}
          </select>
          <div class="r95-collection-pills" role="tablist" aria-label="Bộ sưu tập nhanh">
            ${VERIFIED_GALLERY_COLLECTIONS.map((col, idx) => `<button type="button" class="r95-col-pill ${col === selectedCollection ? 'active' : ''}" data-collection="${col}">${idx + 1}. ${col}</button>`).join('')}
          </div>
          <div id="discovery-gallery-count" class="r95-filter-count"></div>
        </div>
      `;
      const colSelect = $('discovery-collection-select');
      colSelect?.addEventListener('change', (e) => {
        selectedCollection = e.target.value;galleryPage=0;
        buildRoomControls('gallery');
      });
      filterWrap.querySelectorAll('.r95-col-pill').forEach((pill) => {
        pill.addEventListener('click', () => {
          selectedCollection = pill.dataset.collection;galleryPage=0;
          buildRoomControls('gallery');
        });
      });
      renderGalleryList();
    } else {
      filterWrap.hidden = true;
      galleryNav.replaceChildren();
    }
  }

  function showRoom(room) {
    currentRoomId = room;
    panel.hidden = false;
    $('discovery-room-heading').textContent =
      room === 'nature' ? 'PHÒNG KỲ QUAN THIÊN NHIÊN · 3D TỪ DEM' :
      room === 'unesco' || room === 'globe'
        ? 'PHÒNG UNESCO 3D · ẢNH THẬT + GLB ĐÃ DUYỆT'
        : room === 'foyer'
          ? 'SẢNH ĐỊA CẦU · CHỈ HIỆN VẬT ĐÃ DUYỆT'
          : room === 'map'
            ? 'BẢN ĐỒ ĐỊA LÝ THẾ GIỚI UNESCO'
          : room === 'gallery'
          ? 'PHÒNG B · 32 ẢNH THẬT HÌNH HỌC (3 TẦNG)'
          : 'SẢNH MATHVERSE DISCOVERY';
    $('discovery-panel-hint').textContent =
      room === 'nature' ? 'Đi bộ đến từng bệ 3D, nhấn E để mở ảnh tư liệu và địa hình DEM; 2D chỉ dùng cho bản đồ.' :
      room === 'foyer'
        ? 'Xoay địa cầu trước sảnh và chạm vào chấm UNESCO; chọn tên ở dưới để so sánh ảnh thật với hình 2D/3D.'
        : room === 'unesco' || room === 'globe'
          ? 'Chỉ trưng bày GLB quang trắc/LiDAR đã được duyệt; không Sketchfab và không dùng hình khối lý tưởng hóa.'
        : room === 'gallery'
          ? 'Chọn 1 trong 6 bộ sưu tập R95 (tối đa 8 khung 3D/lần) hoặc nhấn E / nhấp vào khung tranh.'
          : 'Sảnh có địa cầu UNESCO ở phía trước; phòng trái là UNESCO, phòng phải là tranh hình học.';

    buildRoomControls(room);

    $('discovery-btn-foyer').hidden = room === 'foyer';
    $('discovery-btn-map').hidden=room === 'map';
    $('discovery-btn-globe').hidden = room === 'unesco' || room === 'globe';
    $('discovery-btn-gallery').hidden = room === 'gallery';
    $('discovery-globe-tools').hidden = room !== 'foyer';
  }

  $('discovery-detail-close').onclick = close;
  $('discovery-detail-backdrop').onclick = close;
  $('discovery-show-3d').onclick = () => item && showView('3d');
  $('discovery-show-sketchfab').onclick=()=>item&&showView('sketchfab');
  $('discovery-show-2d').onclick = () => item && showView('2d');
  $('discovery-fish-toggle').onclick = () => {
    subset = !subset;
    $('discovery-svg-holder').innerHTML = geometrySVG('fish', subset);
    $('discovery-fish-toggle').textContent = subset ? 'Xem cả tập A' : 'Tô màu tập con B';
  };
  $('discovery-btn-foyer').onclick = () => onRoom?.('foyer');
  $('discovery-btn-map').onclick = () => onRoom?.('map');
  $('discovery-btn-globe').onclick = () => onRoom?.('unesco');
  $('discovery-btn-gallery').onclick = () => onRoom?.('gallery');
  $('discovery-btn-exit').onclick = () => onBack?.();
  $('discovery-spin-left').onclick = () => onRotateGlobe?.(-35, 0);
  $('discovery-spin-right').onclick = () => onRotateGlobe?.(35, 0);

  const cvs = $('discovery-preview');
  cvs.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY };
    cvs.setPointerCapture(e.pointerId);
  });
  cvs.addEventListener('pointermove', (e) => {
    if (!drag) return;
    orbit += (e.clientX - drag.x) * .009;
    tilt = THREE.MathUtils.clamp(tilt + (e.clientY - drag.y) * .007, -1.12, 1.1);
    drag = { x: e.clientX, y: e.clientY };
  });
  cvs.addEventListener('pointerup', () => (drag = null));
  cvs.addEventListener('pointercancel', () => (drag = null));
  cvs.addEventListener(
    'wheel',
    (e) => {
      if (view === '3d') {
        e.preventDefault();
        zoom = THREE.MathUtils.clamp(zoom * (e.deltaY > 0 ? 1.11 : .89), 7, 32);
      }
    },
    { passive: false }
  );
  $('discovery-preview-in').onclick = () => {
    zoom = THREE.MathUtils.clamp(zoom * .86, 7, 32);
  };
  $('discovery-preview-out').onclick = () => {
    zoom = THREE.MathUtils.clamp(zoom * 1.17, 7, 32);
  };

  window.addEventListener('mathverse-r98-catalog-updated',()=>{if(currentRoomId!=='map')buildRoomControls(currentRoomId);});
  void refreshR98Catalog();
  return {
    openItem,
    registerOfficialSites(sites=[]){for(const site of sites)if(site?.officialWorldHeritage&&site.id)officialById.set(site.id,site);return officialById.size;},
    close,
    showRoom,
    setCollection(colName) {
      selectedCollection = colName;galleryPage=0;
      if (currentRoomId === 'gallery') buildRoomControls('gallery');
    },
    hide() {
      close();
      panel.hidden = true;
    },
    get isOpen() {
      return !modal.hidden;
    },
    get item() {
      return item;
    }
  };
}
