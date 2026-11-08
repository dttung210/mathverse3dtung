import {startMuseum} from './museum.js?v=r107_v15';
import {mountGraphicsPanel} from './graphics-r74/graphics-panel.mjs?v=r107_v15';
// [MATHVERSE EXHIBITION CORE R74] The exhibition is a native part of the app.
import './exhibition/boot.mjs?v=r107_v15';
import {CurriculumExplorer} from './curriculum/CurriculumExplorer.js?v=r107_v15';
import {makeViewer} from './viewer.js?v=r107_v15';
import {GRADES,TYPES,normalizeExhibit,recognizeIdea} from './math-core.js?v=r107_v15';
import {createMinimap} from './minimap.js?v=r107_v15';
import {LabShell} from './ui/LabShell.js?v=r107_v15';
import {migrateLibraryToV5, migrateItemToV5} from './data/migrate-v2-v4-v5.js?v=r107_v15';
import {playClickSound, playWarpSound, playProjectorSound, playFootstepSound, playHologramSound, speakText, toggleMute, getMuteState} from './ui/audio.js?v=r107_v15';
import {PORTAL_ZONES,portalExhibits,gradePortalLabs,labZoneForMath6,zonesForGrade} from './portal-labs/portal-registry.js?v=r107_v15';
import {LAB_TO_EXHIBIT} from './math6-lab/catalog.js?v=r107_v15';
import {previewMarkup} from './math6-lab/previews.js?v=r107_v15';
import {getRoomsForGrade, getChapterRoomsForGrade, getRoomById, getLabById, getModeById, getModesForRoom, searchR6, R6_MANIFEST} from './museum/r6-room-layout.js?v=r107_v15';
import {getLabDoorsForRoom,getUnifiedLabById,getUnifiedLabByModeId} from './museum/r68-unified-labs.mjs?v=r107_v15';
import {classifyPortal,resolveSelection} from './museum/r6-navigation-core.mjs?v=r107_v15';
import {StudioLaunchpad} from './curriculum/StudioLaunchpad.js?v=r107_v15';
import {HoloStageInspector} from './museum/r11-holo-stage.js?v=r107_v15';

const el=id=>document.getElementById(id),KEY='mathverse-library-v5';
const data=await fetch('/data/catalog.json').then(r=>{if(!r.ok)throw new Error('Không tải được danh mục mẫu.');return r.json();});
const defaults=data.items.map(item=>migrateItemToV5(item));
let libraryRevision=0;
const sessionDeletedIds=new Set();
let items=loadLibrary();
let teacher=false,activeGrade=0,editingId=null,toastTimer=null;
const pageByGrade=Object.fromEntries(GRADES.map(g=>[g,0]));
let museum,viewer,minimap,labShell;
let portalState={grade:0,zone:null,items:[]};
let lastPortalStateKey='';
let historyUndo=[],historyRedo=[];
const curriculumExplorer=new CurriculumExplorer({getLibraryItems:()=>[...items,...defaults.filter(d=>Number(d.grade)===6&&!items.some(it=>it.id===d.id))],
  getExhibitItems:()=>defaults, // Existing gallery references only; never modify saved user library.
});
if(typeof window!=='undefined'){window.curriculumExplorer=curriculumExplorer;}
document.getElementById('btn-curriculum')?.addEventListener('click',()=>curriculumExplorer.open(activeGrade||6));

function pushHistory(){
  historyUndo.push(JSON.stringify(items));
  if(historyUndo.length>25) historyUndo.shift();
  historyRedo=[];
  updateUndoRedoUI();
}

function undo(){
  if(!historyUndo.length) return;
  historyRedo.push(JSON.stringify(items));
  const prev=JSON.parse(historyUndo.pop());
  items=prev.map(i=>normalizeExhibit(i));
  saveLibrary();
  sync();
  updateUndoRedoUI();
  notify('Đã hoàn tác thao tác trước (Undo).');
}

function redo(){
  if(!historyRedo.length) return;
  historyUndo.push(JSON.stringify(items));
  const next=JSON.parse(historyRedo.pop());
  items=next.map(i=>normalizeExhibit(i));
  saveLibrary();
  sync();
  updateUndoRedoUI();
  notify('Đã làm lại thao tác vừa hoàn tác (Redo).');
}

function updateUndoRedoUI(){
  const btnUndo=el('btn-undo'), btnRedo=el('btn-redo');
  if(btnUndo){
    btnUndo.disabled=(historyUndo.length===0);
    btnUndo.style.opacity=historyUndo.length?'1':'0.4';
  }
  if(btnRedo){
    btnRedo.disabled=(historyRedo.length===0);
    btnRedo.style.opacity=historyRedo.length?'1':'0.4';
  }
}

function cloneModel(item){
  const before=[...items];
  pushHistory();
  const copy=normalizeExhibit({
    ...item,
    id:`u_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    title:`${item.title} (Bản sao)`,
    custom:true
  });
  items.push(copy);
  if(!saveLibrary()){
    items=before;
    historyUndo.pop();
    updateUndoRedoUI();
    return;
  }
  sync();
  notify(`Đã nhân bản “${copy.title}”.`);
}

function moveModelOrder(id,delta){
  const gradeItems=items.filter(i=>i.grade===activeGrade);
  const idx=gradeItems.findIndex(i=>i.id===id);
  if(idx<0||idx+delta<0||idx+delta>=gradeItems.length) return;
  const before=[...items];
  pushHistory();
  const targetId=gradeItems[idx+delta].id;
  const globalIdxA=items.findIndex(i=>i.id===id);
  const globalIdxB=items.findIndex(i=>i.id===targetId);
  const tmp=items[globalIdxA];
  items[globalIdxA]=items[globalIdxB];
  items[globalIdxB]=tmp;
  if(!saveLibrary()){
    items=before;
    historyUndo.pop();
    updateUndoRedoUI();
    return;
  }
  sync();
  notify(`Đã đổi thứ tự bục trưng bày trong phòng Lớp ${activeGrade}.`);
}

function loadLibrary(){
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      // Tự động chuyển dịch an toàn từ v4, v3 hoặc v2
      for (const oldKey of ['math-3d-museum-library-v4', 'math-3d-museum-library-v3', 'math-3d-museum-library-v2']) {
        const oldRaw = localStorage.getItem(oldKey);
        if (oldRaw) {
          try {
            const oldParsed = JSON.parse(oldRaw);
            const migrated = migrateLibraryToV5(oldParsed, defaults);
            libraryRevision = 1;
            localStorage.setItem(KEY, JSON.stringify({...migrated, revision: libraryRevision}));
            return migrated.items;
          } catch {}
        }
      }
      return defaults.map(it => ({...it}));
    }
    const parsed = JSON.parse(raw);
    libraryRevision = Number(parsed?.revision) || 0;
    const migrated = migrateLibraryToV5(parsed, defaults);
    return migrated.items;
  } catch(e) {
    console.warn('Dữ liệu lưu không hợp lệ, dùng mẫu ban đầu:', e.message);
    return defaults.map(it => ({...it}));
  }
}
function saveLibrary(options={}){
  const {replaceAll=false}=options;
  try {
    let storedRev = libraryRevision;
    let mergedFromOtherTab = false;
    if (!replaceAll) {
      try {
        const existingRaw = localStorage.getItem(KEY);
        if (existingRaw) {
          const existingParsed = JSON.parse(existingRaw);
          storedRev = Number(existingParsed?.revision) || 0;
          const existingItems = Array.isArray(existingParsed?.items)
            ? existingParsed.items.map(i => normalizeExhibit(i))
            : [];
          const currentIds = new Set(items.map(i => i.id));
          for (const extItem of existingItems) {
            if (!currentIds.has(extItem.id) && !sessionDeletedIds.has(extItem.id)) {
              items.push(extItem);
              currentIds.add(extItem.id);
              mergedFromOtherTab = true;
            }
          }
        }
      } catch {}
    }
    libraryRevision = Math.max(libraryRevision, storedRev) + 1;
    localStorage.setItem(KEY, JSON.stringify({
      schemaVersion: 5,
      version: 5,
      revision: libraryRevision,
      updatedAt: new Date().toISOString(),
      items
    }));
    if (mergedFromOtherTab) {
      notify('Phát hiện thay đổi từ tab khác: đã tự động hợp nhất để không mất mô hình.');
    }
    return true;
  } catch(e) {
    notify('Không thể lưu: bộ nhớ trình duyệt đã đầy hoặc bị chặn. Hãy xuất dữ liệu.', true);
    return false;
  }
}
if (typeof window !== 'undefined') {
  window.addEventListener('storage', e => {
    if (e.key === KEY && e.newValue) {
      try {
        const incoming = JSON.parse(e.newValue);
        const migrated = migrateLibraryToV5(incoming, defaults);
        if (Array.isArray(migrated.items)) {
          libraryRevision = Math.max(libraryRevision, Number(incoming.revision) || 0);
          items = migrated.items;
          sync();
          notify('Đã đồng bộ thư viện mô hình từ tab khác.');
        }
      } catch {}
    }
  });
}
let activeThematicRoomId = null;
let activeLabId = null;
let activeModeId = null;

function notify(message,isError=false){const b=el('toast');b.textContent=message;b.style.background=isError?'#71373b':'#225f59';b.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>b.hidden=true,3400);}

function bindBreadcrumbAccessibility(crumb, action, isCurrent = false) {
  crumb.tabIndex = 0;
  crumb.setAttribute('role', 'button');
  if (isCurrent) {
    crumb.setAttribute('aria-current', 'location');
  }
  crumb.onclick = action;
  crumb.onkeydown = e => {
    if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      e.stopPropagation();
      action();
    }
  };
}

function updateBreadcrumbs() {
  const bar = el('r6-breadcrumbs');
  if (!bar) return;
  bar.replaceChildren();

  // 1. Sảnh Mathverse
  const crumbHall = document.createElement('li');
  crumbHall.className = 'r6-crumb' + (activeGrade === 0 ? ' active' : '');
  crumbHall.innerHTML = '<span class="crumb-icon">⌂</span> Sảnh Mathverse';
  bindBreadcrumbAccessibility(crumbHall, () => selectGrade(0), activeGrade === 0);
  bar.append(crumbHall);

  // 2. Lớp
  if (activeGrade > 0) {
    const sep1 = document.createElement('li');
    sep1.className = 'r6-crumb-sep';
    sep1.setAttribute('aria-hidden', 'true');
    sep1.textContent = '›';
    bar.append(sep1);

    const crumbGrade = document.createElement('li');
    crumbGrade.className = 'r6-crumb' + (!activeThematicRoomId ? ' active' : '');
    crumbGrade.textContent = `Toán ${activeGrade}`;
    bindBreadcrumbAccessibility(crumbGrade, () => navigateToGrade(activeGrade), !activeThematicRoomId);
    bar.append(crumbGrade);
  }

  // 3. Phòng chuyên đề
  if (activeThematicRoomId) {
    const room = getRoomById(activeThematicRoomId);
    if (room) {
      const sep2 = document.createElement('li');
      sep2.className = 'r6-crumb-sep';
      sep2.setAttribute('aria-hidden', 'true');
      sep2.textContent = '›';
      bar.append(sep2);

      const crumbRoom = document.createElement('li');
      crumbRoom.className = 'r6-crumb' + (!activeModeId && !activeLabId ? ' active' : '');
      crumbRoom.textContent = `${room.roomId} · ${room.name}`;
      bindBreadcrumbAccessibility(crumbRoom, () => navigateToThematicRoom(activeThematicRoomId), !activeModeId && !activeLabId);
      bar.append(crumbRoom);
    }
  }

  // 4. Lab and actual mathematical mode are separate levels.
  if(activeLabId){
    const lab=getUnifiedLabById(activeLabId);
    if(lab){
      const sep=document.createElement('li');sep.className='r6-crumb-sep';sep.setAttribute('aria-hidden','true');sep.textContent='›';bar.append(sep);
      const crumb=document.createElement('li');crumb.className='r6-crumb'+(!activeModeId?' active':'');
      crumb.textContent=lab.name;
      bindBreadcrumbAccessibility(crumb,()=>navigateToLab(lab.labId,{openFirst:false}),!activeModeId);
      bar.append(crumb);
    }
  }
  if (activeModeId) {
    const mode = getModeById(activeModeId);
    if (mode) {
      const sep3 = document.createElement('li');
      sep3.className = 'r6-crumb-sep';
      sep3.setAttribute('aria-hidden', 'true');
      sep3.textContent = '›';
      bar.append(sep3);

      const crumbMode = document.createElement('li');
      crumbMode.className = 'r6-crumb active';
      crumbMode.textContent = mode.name;
      bindBreadcrumbAccessibility(crumbMode, () => navigateToMode(activeModeId), true);
      bar.append(crumbMode);
    }
  }
}

function navigateToGrade(g) {
  playWarpSound();
  activeGrade = g;
  activeThematicRoomId = null;
  activeLabId = null;
  activeModeId = null;
  labShell?.setRoomContext?.(null,null);
  if (g === 0) {
    museum?.toHall?.();
    museum?.exitThematicRoom?.();
  } else {
    museum?.toGrade?.(g);
  }
  updateBreadcrumbs();
  renderGrades();
  renderCatalog();
  el('sidebar')?.classList.remove('is-open');
}

function navigateToThematicRoom(roomId) {
  const room = getRoomById(roomId);
  if (!room) return notify('Không tìm thấy phòng chuyên đề.',true);
  playWarpSound();
  if (museum?.getGrade?.() !== room.grade) museum?.toGrade?.(room.grade);
  if (museum?.enterThematicRoom?.(roomId) === false) return notify(`Không vào được ${room.roomId}`,true);
  activeGrade=room.grade;activeThematicRoomId=roomId;activeLabId=null;activeModeId=null;
  labShell?.setRoomContext?.(roomId,null);
  updateBreadcrumbs();renderGrades();renderCatalog();
  el('sidebar')?.classList.remove('is-open');
}

function navigateToLab(labId, {openFirst=false}={}) {
  const lab = getUnifiedLabById(labId);
  if(!lab)return notify('Lab không có trong danh mục.',true);
  if (museum?.getGrade?.() !== lab.grade) museum?.toGrade?.(lab.grade);
  if (museum?.getActiveThematicRoom?.() !== lab.roomId) {
    if (museum?.enterThematicRoom?.(lab.roomId) === false) return notify(`Không vào được phòng ${lab.roomId}`,true);
  }
  if(museum?.enterLabGallery?.(lab.labId)===false){
    return notify('Không thể vào phòng trưng bày Lab '+lab.name,true);
  }
  activeGrade=lab.grade;activeThematicRoomId=lab.roomId;activeLabId=lab.labId;activeModeId=null;
  labShell?.setRoomContext?.(lab.roomId,lab.grade===6?null:lab.labId);
  updateBreadcrumbs();renderCatalog();
  // R7.2: display every mode on its own 3D pedestal before opening the SGK renderer.
  if(openFirst && lab.modes.length)navigateToMode(lab.modes[0].id);
}

function navigateToMode(modeId) {
  const mode=getModeById(modeId);
  if(!mode)return notify(`Không tìm thấy chế độ ${modeId}`,true);
  const currentRoomId = museum?.getActiveThematicRoom?.();
  const targetRoomId = (currentRoomId && currentRoomId === mode.roomId)
    ? mode.roomId
    : (mode.chapterId || mode.roomId);
  const targetRoom = getRoomById(targetRoomId);
  const roomGrade = targetRoom?.grade || mode.chapterGrade || mode.grade;
  if (museum?.getGrade?.() !== roomGrade) museum?.toGrade?.(roomGrade);
  if (museum?.getActiveThematicRoom?.() !== targetRoomId) {
    if (museum?.enterThematicRoom?.(targetRoomId) === false)return notify(`Không vào được phòng ${targetRoomId}`,true);
  }
  // Keep the selected model inside the correct Lab-gallery context.
  const selectedLab = (targetRoomId === mode.chapterId && mode.lessonId)
    ? (getUnifiedLabById(mode.lessonId)||getUnifiedLabByModeId(mode.id))
    : (getUnifiedLabByModeId(mode.id)||getUnifiedLabById(mode.lessonId));
  if(selectedLab && museum?.getActiveLabGallery?.()!==selectedLab.labId){
    // R7.3: all Labs are already on display; only mark the Lab, do not move the player.
    museum?.enterLabGallery?.(selectedLab.labId,{teleport:false});
  }
  // On room transitions, callbacks reset the selection; assign mode AFTER scene loads.
  activeGrade=roomGrade;activeThematicRoomId=targetRoomId;
  activeLabId=selectedLab?.labId||getUnifiedLabByModeId(mode.id)?.labId||mode.labId;activeModeId=mode.id;
  labShell?.setRoomContext?.(targetRoomId,activeLabId);
  updateBreadcrumbs();renderGrades();renderCatalog();
  // R6.7: ONLY ONE warehouse for ALL grades. The old MathLab 6 / LabShell
  // screen is not used anywhere in the user flow.
  curriculumExplorer.open(mode.grade,activeLabId,mode.id);
}

if (typeof window !== 'undefined') {
  window.navigateToGrade = navigateToGrade;
  window.navigateToThematicRoom = navigateToThematicRoom;
  window.navigateToMode = navigateToMode;
  window.navigateToLab = navigateToLab;
}

function selectGrade(g){
  navigateToGrade(g);
}

function renderGrades(){
  const nav=el('grade-nav');
  if(!nav) return;
  nav.replaceChildren();
  const home=document.createElement('button');
  home.className='grade-button grade-home'+(!activeGrade?' selected':'');
  home.textContent='⌂ SẢNH CHÍNH · TOÀN BỘ BẢO TÀNG';
  home.onclick=()=>selectGrade(0);
  nav.append(home);
  for(const g of GRADES){
    const b=document.createElement('button');
    b.className='grade-button'+(g===activeGrade?' selected':'');
    const label=document.createElement('b');
    label.textContent=`LỚP ${g}`;
    const c=document.createElement('span');
    const chRooms = getChapterRoomsForGrade(g);
    const roomCount = chRooms.length || getRoomsForGrade(g).length;
    c.textContent = `${roomCount} chương`;
    b.append(label,c);
    b.onclick=()=>selectGrade(g);
    nav.append(b);
  }
}

function renderCatalog(){
  const container=el('catalog-items');
  if(!container) return;
  container.replaceChildren();
  const q=el('catalog-search').value.trim();

  // 1. TÌM KIẾM CHÍNH XÁC THEO MÃ & TÊN TIẾNG VIỆT
  if (q.length > 0) {
    const results = searchR6(q);
    el('catalog-label').textContent = 'KẾT QUẢ TÌM KIẾM';
    el('catalog-count').textContent = String(results.length);

    if (!results.length) {
      const p = document.createElement('div');
      p.className = 'catalog-empty';
      p.textContent = `Không tìm thấy mô hình hoặc chương nào khớp với “${q}”.`;
      container.append(p);
      return;
    }

    for (const item of results) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'r6-thematic-room-card';
      card.innerHTML = `
        <div class="r6-room-card-head">
          <span class="r6-room-id-badge">Lớp ${item.grade} · ${item.chapterId || item.roomId}</span>
          <span class="r6-tag r6-tag-${item.modality || 'solid'}">${item.modality || '3D'}</span>
        </div>
        <strong>${item.name}</strong>
        <small>${item.chapterRoomName || item.roomName} › ${item.lessonLabName || item.labName} (${item.id})</small>
      `;
      card.onclick = () => {
        navigateToMode(item.id);
      };
      container.append(card);
    }
    return;
  }

  // 2. Ở ĐẠI SẢNH (activeGrade === 0): HIỂN THỊ TỔNG QUAN 7 KHỐI LỚP
  if (activeGrade === 0) {
    el('catalog-label').textContent = 'TỔNG QUAN 7 KHỐI LỚP';
    el('catalog-count').textContent = '58 chương';

    for (const g of GRADES) {
      const chRooms = getChapterRoomsForGrade(g);
      const rooms = chRooms.length ? chRooms : getRoomsForGrade(g);
      const totalModes = rooms.reduce((sum, r) => sum + r.modeCount, 0);
      const totalLabs = rooms.reduce((sum, r) => sum + getLabDoorsForRoom(r.roomId).length, 0);

      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'r6-grade-overview-card';
      card.innerHTML = `
        <div>
          <strong>🏛️ TOÁN LỚP ${g}</strong>
          <small>${rooms.length} Chương SGK · ${totalLabs} Bài học · ${totalModes} mô hình</small>
        </div>
        <span class="r6-room-id-badge">Khám phá →</span>
      `;
      card.onclick = () => selectGrade(g);
      container.append(card);
    }
    return;
  }

  // 3. Ở PHÒNG LỚP (activeGrade > 0 && !activeThematicRoomId): HIỂN THỊ CÁC CHƯƠNG SÁCH GIÁO KHOA
  if (activeGrade > 0 && !activeThematicRoomId) {
    const chRooms = getChapterRoomsForGrade(activeGrade);
    const rooms = chRooms.length ? chRooms : getRoomsForGrade(activeGrade);
    el('catalog-label').textContent = `LỚP ${activeGrade} · ${rooms.length} CHƯƠNG SÁCH GIÁO KHOA`;
    el('catalog-count').textContent = String(rooms.length);

    for (const room of rooms) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'r6-thematic-room-card';
      const volBadge = room.volume ? `CHƯƠNG ${room.number} · TẬP ${room.volume}` : room.roomId;
      card.innerHTML = `
        <div class="r6-room-card-head">
          <span class="r6-room-id-badge">${volBadge}</span>
          <span class="r6-room-stats-badge">${getLabDoorsForRoom(room.roomId).length} Bài · ${room.modeCount} mô hình</span>
        </div>
        <strong>${room.name}</strong>
        <small>${room.summary || ''}</small>
      `;
      card.onclick = () => navigateToThematicRoom(room.roomId);
      container.append(card);
    }
    return;
  }

  // 4. Ở PHÒNG CHƯƠNG (activeGrade > 0 && activeThematicRoomId): HIỂN THỊ CÁC BÀI HỌC & MÔ HÌNH
  if (activeGrade > 0 && activeThematicRoomId) {
    const room = getRoomById(activeThematicRoomId);
    if (!room) return;

    el('catalog-label').textContent = `${room.roomId} · ${room.name.toUpperCase()}`;
    el('catalog-count').textContent = `${getLabDoorsForRoom(room.roomId).length} Bài · ${room.modeCount} mô hình`;

    // Nút quay lại danh sách Chương
    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'r6-nav-back-btn';
    backBtn.innerHTML = `↩ Quay lại danh sách Chương Lớp ${activeGrade}`;
    backBtn.onclick = () => navigateToGrade(activeGrade);
    container.append(backBtn);

    if(activeLabId){
      const backLab=document.createElement('button');
      backLab.type='button';backLab.className='r6-nav-back-btn';
      backLab.textContent='← Tất cả các Bài trong Chương';
      backLab.onclick=()=>{museum?.exitLabGallery?.();activeLabId=null;activeModeId=null;labShell?.setRoomContext?.(room.roomId,null);renderCatalog();updateBreadcrumbs();};
      container.append(backLab);
    }
    // Lab selection first. The individual models belong INSIDE their Lab.
    for (const lab of getLabDoorsForRoom(room.roomId).filter(l => !activeLabId || l.labId===activeLabId)) {
      const labCard = document.createElement('div');
      labCard.className = 'r6-lab-card';
      if (lab.labId===activeLabId) labCard.dataset.currentLab='true';

      const modalityTag = lab.modality ? `<span class="r6-tag r6-tag-${lab.modality}">${lab.modality}</span>` : '';
      labCard.innerHTML = `
        <div class="r6-lab-header">
          <span class="r6-lab-title">📚 ${lab.name}</span>
          ${modalityTag}
        </div>
      `;

      const openLabBtn=document.createElement('button');openLabBtn.type='button';
      openLabBtn.className='r6-lab-open-btn';
      openLabBtn.textContent=`Xem Bài · ${lab.modes.length} mô hình`;
      openLabBtn.onclick=()=>navigateToLab(lab.labId);
      labCard.append(openLabBtn);
      const modeList = document.createElement('div');
      modeList.className = 'r6-mode-list';

      for (const mode of lab.modes) {
        // Archive items remain in their correct Lab with a visible Lưu kho status.
        const modeBtn = document.createElement('button');
        modeBtn.type = 'button';
        modeBtn.className = 'r6-mode-btn' + (mode.id === activeModeId ? ' active' : '');
        modeBtn.innerHTML = `
          <span><b>${mode.id}:</b> ${mode.name}</span>
          <span class="r6-tag" style="opacity:0.75;">${mode.status === 'archived' ? 'Kho' : '●'}</span>
        `;
        modeBtn.onclick = () => {
          navigateToMode(mode.id);
        };
        modeList.append(modeBtn);
      }

      if(lab.labId===activeLabId)labCard.append(modeList);
      container.append(labCard);
    }
  }
}

function sync(){
  museum?.setCatalog?.(items);
  updateBreadcrumbs();
  renderGrades();
  renderCatalog();
  el('model-summary').textContent=`${items.length} mô hình trong thư viện`;
  if(activeGrade){
    const num=items.filter(it=>it.grade===activeGrade).length;
    el('model-summary').textContent=`${num} mô hình lớp ${activeGrade} · ${items.length} toàn hệ thống`;
  }
}
function showPortalHud(data){
  portalState=data;
  const hub=el('mv14-portal-hub');if(!hub)return;
  const grade=Number(data.grade)||0;
  const room=classifyPortal(grade,data.zone,getRoomById);
  const labId=data.labId||null;
  if(activeGrade!==grade || activeThematicRoomId!==(room?.roomId||null)||
    (Object.hasOwn(data,'labId') && activeLabId!==labId)){
    activeGrade=grade;activeThematicRoomId=room?.roomId||null;activeLabId=labId;activeModeId=null;
    labShell?.setRoomContext?.(room?.roomId||null,labId);
    updateBreadcrumbs();renderGrades();
    r9ShowRoomBanner(grade,room,labId);
  }
  // Legacy Grade6 four-gate page originally produced an enormous fixed panel.
  document.body.classList.remove('mv15-grade6-foyer','mv15-grade6-lab');
  document.body.classList.toggle('r6-classroom-foyer',grade>0&&!room);
  document.body.classList.toggle('r6-thematic-inside',!!room);
  hub.hidden=!grade;
  if(!grade){renderCatalog();return;}
  const chRooms=getChapterRoomsForGrade(grade);
  const rooms=chRooms.length?chRooms:getRoomsForGrade(grade);
  const state=el('mv14-portal-state');
  if(state)state.textContent=room?`${room.roomId} · ${room.name}`:`LỚP ${grade} · CHỌN CHƯƠNG SÁCH GIÁO KHOA`;
  const currentLab=labId?getUnifiedLabById(labId):null;
  el('room-indicator').textContent=currentLab?`LỚP ${grade} · ${currentLab.name}`:
    room?`LỚP ${grade} · ${room.name}`:`LỚP ${grade} · ${rooms.length} CHƯƠNG SGK`;
  el('model-summary').textContent=currentLab?`${currentLab.modes.length} bục mô hình · ĐANG TRƯNG BÀY`:
    room?`${getLabDoorsForRoom(room.roomId).length} Bài học · ${room.modeCount} mô hình`:
    `${rooms.length} Chương · ${rooms.reduce((a,b)=>a+b.modeCount,0)} mô hình`;
  const row=el('mv14-portal-buttons');row.replaceChildren();row.hidden=false;
  const available=room?getLabDoorsForRoom(room.roomId):[];
  row.style.setProperty('--r69-lab-count',String(available.length));
  if(room){
    // R7.1: one quiet directory action. The 3D room itself has ONE physical
    // door per Lab. Lab names remain searchable in the sidebar / SGK warehouse.
    const directory=document.createElement('button');directory.type='button';
    directory.className='mv14-gate-button r71-lab-directory';
    directory.dataset.roomId=room.roomId;
    directory.textContent=activeLabId?`◈ Đang trưng bày: ${getUnifiedLabById(activeLabId)?.name||''}`:
      `☷ Danh mục ${available.length} Bài học · ${room.modeCount} mô hình`;
    directory.title='Mở danh sách các Bài học của Chương này';
    directory.onclick=()=>{
      const sidebar=el('sidebar');sidebar?.classList.add('is-open');
      const search=el('catalog-search');if(search)search.focus();
      renderCatalog();
    };
    row.append(directory);
    const holoQuick=document.createElement('button');holoQuick.type='button';
    holoQuick.className='mv14-gate-button';
    holoQuick.textContent='🔮 Bàn Holo-Stage 3D tại bục (phím F)';
    holoQuick.title='Điều khiển trực tiếp mô hình 3D ngay trên bục mà không che màn hình';
    holoQuick.onclick=()=>{
      const firstEx=museum?.getRoomExhibits?.()?.[0];
      if(firstEx?.mode?.id)window.openHoloStageForMode?.(firstEx.mode.id);
    };
    row.append(holoQuick);
  } else {
    window.holoStageInspector?.close?.();
    for(const thematic of rooms){
      const b=document.createElement('button');b.type='button';
      b.className='mv14-gate-button';b.dataset.portal=thematic.roomId;
      const symbol=document.createElement('span');symbol.textContent=thematic.volume?`T${thematic.volume}`:'◇';
      const title=document.createElement('strong');title.textContent=thematic.name;
      const amount=document.createElement('small');amount.textContent=`${getLabDoorsForRoom(thematic.roomId).length} Bài · ${thematic.modeCount} MH`;
      b.append(symbol,title,amount);
      b.title=`Vào ${thematic.roomId} · ${thematic.name}`;
      b.addEventListener('click',()=>navigateToThematicRoom(thematic.roomId));row.append(b);
    }
  }
  const back=el('mv14-portal-back');back.hidden=!room;
  back.textContent=activeLabId?'← Về lối vào Chương':`← Danh sách Chương Toán ${grade}`;
  const browse=el('mv14-math6-browse');browse.hidden=true;
  const hall=el('mv15-hall-link');if(hall)hall.hidden=!!room;
  const count=el('mv14-portal-count');count.textContent=room?
     'Mỗi khu là 1 Lab · Nhấp bục mô hình hoặc nhấn E khi đứng gần bục':
     'Nhấp cổng hoặc đi tới cổng 3D · Phím E để tương tác';
  const hint=el('world-hint');
  if(hint){
    hint.textContent=room?
      'WASD đi giữa các khu Lab · Nhấp bục hoặc phím E để mở mô hình':
      'WASD di chuyển · Nhấp cổng hoặc phím E để vào phòng chuyên đề';
    // R9: the hint shows for a few seconds after each move, then fades away.
    hint.classList.remove('r9-hint-show');void hint.offsetWidth;hint.classList.add('r9-hint-show');
  }
  renderCatalog();
}
function openMath6Drawer(){
  // Legacy button now always enters the unified CurriculumExplorer.
  return curriculumExplorer.open(6,activeGrade===6&&activeThematicRoomId?getLabDoorsForRoom(activeThematicRoomId)[0]?.labId:null);
}
function closeMath6Drawer(){
  const legacy=el('mv14-math6-drawer');if(legacy)legacy.hidden=true;
}

function onEnter(grade){
  activeGrade=grade;
  updateBreadcrumbs();
  el('room-indicator').textContent=grade?`PHÒNG TRƯNG BÀY · TOÁN LỚP ${grade}`:'SẢNH CHÍNH · TOÁN 6—12';
  if(el('minimap-status')) el('minimap-status').textContent=grade?`PHÒNG TOÁN LỚP ${grade}`:'ĐẠI SẢNH TRUNG TÂM';
  document.querySelectorAll('.map-btn').forEach(b=>b.classList.toggle('active',Number(b.dataset.room)===grade));
  document.querySelectorAll('.dock-grade-btn').forEach(b=>b.classList.toggle('active',Number(b.dataset.grade)===grade));
  const pill=el('grade-pill');
  if(pill){
    pill.style.background=`var(--grade-${grade}-color)`;
    pill.style.boxShadow=`0 0 10px var(--grade-${grade}-color)`;
  }
  if(items){renderGrades();renderCatalog();const num=grade?items.filter(i=>i.grade===grade).length:items.length;
    el('model-summary').textContent=grade?`${num} mô hình thuộc lớp ${grade}`:`${items.length} mô hình trong thư viện`;
  }
  showPortalHud({grade,zone:activeThematicRoomId,items:[]});
}
let savedPlayerState = null;

function openViewer(item,requestedLabId=null){
  // Any legacy Grade-6 museum pedestal also opens the unified SGK warehouse.
  // No old LabShell/MathLab 6 UI is reachable from the exhibit click path.
  if(Number(item?.grade)===6 || (requestedLabId&&getModeById(requestedLabId)?.grade===6)){
    const mode=getModeById(requestedLabId) ||
      getModeById(Object.entries(LAB_TO_EXHIBIT).find(([,anchor])=>anchor===item?.id)?.[0]);
    const roomId=mode?.roomId || (activeGrade===6?activeThematicRoomId:null) || getRoomsForGrade(6)[0]?.roomId;
    curriculumExplorer.open(6,mode?.id?getUnifiedLabByModeId(mode.id)?.labId:getLabDoorsForRoom(roomId)[0]?.labId,mode?.id||null);
    return;
  }
  const model=item?.virtualLab&&item.sourceExhibitId?
    items.find(x=>x.id===item.sourceExhibitId&&Number(x.grade)===6):item;
  if(!model)return notify('Không tìm thấy mô hình gốc liên kết với thí nghiệm.',true);
  if(museum && typeof museum.getState === 'function')savedPlayerState=museum.getState();
  museum.setPaused(true);
  if(document.exitPointerLock){try{document.exitPointerLock();}catch{}}
  const initialMath6LabId=requestedLabId || (item?.virtualLab ? item.labId : null);
  labShell.open(model,{zone:portalState.zone,roomId:activeThematicRoomId,labId:activeLabId,initialMath6LabId});
  if(initialMath6LabId && !labShell.math6Lab)notify('Không mở được thí nghiệm Toán 6: '+initialMath6LabId,true);
}
function onSelect(id){
  // R87: Clicking or pressing E on a 2D<->3D Fold-Net Museum Pedestal opens the In-World 3D Holo-Stage Inspector directly on the pedestal
  if (typeof id === 'string' && id.startsWith('mv-fold-')) {
    holoStageInspector?.openForMode?.(id);
    return;
  }
  // A Grade-6 teaching Lab is a group of source modes, not an old source-Lab ID.
  if(id && typeof id==='object' && id.kind==='r6-lab' && getUnifiedLabById(id.labId)){
    navigateToLab(id.labId);
    return;
  }
  const match=resolveSelection(id,getLabById,getModeById);
  if(match?.kind==='lab'){const chosen=getUnifiedLabByModeId(match.id);navigateToLab(chosen?.labId||match.id);return;}
  if(match?.kind==='mode'){navigateToMode(match.id);return;}
  const item=typeof id==='object'?id:items.find(it=>it.id===id);
  if(item && item.type)openViewer(item);
  else notify('Không xác định được mô hình. Chọn Lab trong phòng chuyên đề.',true);
}
function pauseIfModal(){const overlays=['welcome-overlay','viewer-overlay','editor-overlay','ai-overlay','help-overlay','avatar-overlay'];
  const open=overlays.some(id=>!el(id).hidden);museum.setPaused(open);
}
function showModal(id){el(id).hidden=false;pauseIfModal();}
function hideModal(id){el(id).hidden=true;pauseIfModal();}
function initGradeOptions(){for(const id of ['editor-grade','ai-grade']){const node=el(id);for(const g of GRADES){const opt=document.createElement('option');opt.value=String(g);opt.textContent=`Lớp ${g}`;node.append(opt);}}
  for(const [type,spec] of Object.entries(TYPES)){const opt=document.createElement('option');opt.value=type;opt.textContent=spec.name;el('editor-type').append(opt);}
}
function renderEditorParams(initial={}){
  const type=el('editor-type').value;const container=el('editor-param-fields');container.replaceChildren();
  for(const [key,[label,min,max,def]] of Object.entries(TYPES[type].params)){
    const wrap=document.createElement('label');wrap.textContent=`${label} (${min}–${max})`;
    const input=document.createElement('input');input.type='number';input.id=`param-${key}`;input.dataset.param=key;
    input.step=key==='n'||key==='deg'||key==='t'?'1':'0.1';input.min=String(min);input.max=String(max);input.value=String(initial[key]??def);
    input.required=true;wrap.append(input);container.append(wrap);
  }
}
function openEditor(item=null){
  if(!teacher){notify('Vui lòng bật chế độ giáo viên trước.',true);return;}
  editingId=item?.id||null;
  const sample=item||{grade:activeGrade||8,type:'squarePyramid',title:'',chapter:'',topic:'',curriculumSource:'',colorHex:'#4cd2b2',category:'Hình học',description:'',formula:'',params:{}};
  el('editor-heading').textContent=item?'Chỉnh sửa mô hình':'Thêm mô hình mới';
  el('editor-grade').value=String(sample.grade);el('editor-type').value=sample.type;
  el('editor-title').value=sample.title||'';
  if(el('editor-chapter')) el('editor-chapter').value=sample.chapter||'';
  if(el('editor-topic')) el('editor-topic').value=sample.topic||'';
  if(el('editor-source')) el('editor-source').value=sample.curriculumSource||'';
  if(el('editor-color')) el('editor-color').value=sample.colorHex||'#4cd2b2';
  el('editor-category').value=sample.category||'Hình học';
  el('editor-description').value=sample.description||'';
  el('editor-formula').value=sample.formula||'';
  el('editor-delete').hidden=!item;
  renderEditorParams(sample.params);showModal('editor-overlay');
}
function getEditorData(){const params={};for(const n of el('editor-param-fields').querySelectorAll('[data-param]'))params[n.dataset.param]=Number(n.value);
  return normalizeExhibit({
    ...(editingId?items.find(i=>i.id===editingId):{}),
    id:editingId||`u_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    grade:Number(el('editor-grade').value),
    type:el('editor-type').value,
    title:el('editor-title').value,
    chapter:el('editor-chapter')?.value||'',
    topic:el('editor-topic')?.value||'',
    curriculumSource:el('editor-source')?.value||'',
    colorHex:el('editor-color')?.value||'#4cd2b2',
    category:el('editor-category').value,
    description:el('editor-description').value,
    formula:el('editor-formula').value,
    params,
    custom:true
  });
}
function saveFromViewer(updated){
  if(!teacher)return false;
  try {
    const normalized=normalizeExhibit({...updated,custom:true});
    const idx=items.findIndex(i=>i.id===normalized.id);
    if(idx<0&&items.length>=300){notify('Đã đạt giới hạn 300 mô hình.',true);return false;}
    const before=items;
    const next=[...items];
    if(idx<0)next.push(normalized);else next[idx]=normalized;
    pushHistory();
    items=next;
    if(!saveLibrary()){items=before;return false;}
    sync();notify(idx<0?`Đã lưu hình mới vào Lớp ${normalized.grade}.`:'Đã lưu chỉnh sửa mô hình.');
    return true;
  }catch(e){notify(`Không lưu được hình: ${e.message}`,true);return false;}
}
function downloadJSON(name,body){const blob=new Blob([JSON.stringify(body,null,2)],{type:'application/json'});
  const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(href),1000);}
function fileAsBase64(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');reader.onerror=()=>reject(new Error('Không đọc được tệp ảnh.'));reader.readAsDataURL(file);});}
async function interpretAI(){
  const button=el('ai-generate'),res=el('ai-result'),text=el('ai-prompt').value.trim(),file=el('ai-file').files[0],grade=Number(el('ai-grade').value);
  if(!text&&!file){res.textContent='Cô cần nhập ý tưởng hoặc chọn ảnh đề bài.';return;}
  if(file&&(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>4*1024*1024)){res.textContent='Chỉ nhận PNG/JPG/WEBP tối đa 4 MB.';return;}
  button.disabled=true;res.textContent='Đang yêu cầu Gemini phân tích dữ kiện...';
  try {
    const body={text,grade};if(file)body.image={mimeType:file.type,data:await fileAsBase64(file)};
    const response=await fetch('/api/interpret',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    const payload=await response.json();if(!response.ok)throw Error(payload.error||`Máy chủ trả về ${response.status}`);
    const draft=normalizeExhibit({...payload.draft,id:`u_${Date.now()}`,grade,custom:true});
    res.textContent=`Đã nhận đề xuất: ${draft.title}. Cô kiểm tra lại dữ kiện trên màn hình tiếp theo trước khi lưu.`;
    hideModal('ai-overlay');openEditor(draft);editingId=null;
    notify('Đã phân tích. Đây là bản nháp; cô kiểm tra các kích thước.');
  }catch(e){res.textContent=`Chưa tạo được mô hình: ${e.message}`;}
  finally{button.disabled=false;}
}
async function importJSON(file){if(file.size>1_000_000){notify('Tệp JSON vượt quá 1 MB.',true);return;}
  try{const data=JSON.parse(await file.text());if(!data||!Array.isArray(data.items)||data.items.length>300)throw Error('File không đúng định dạng thư viện');
    const normalized=data.items.map(i=>normalizeExhibit(i));
    if(new Set(normalized.map(i=>i.id)).size!==normalized.length)throw Error('Có mã mô hình trùng nhau');
    if(!confirm(`Thay thế thư viện hiện tại (${items.length} mô hình) bằng tệp có ${normalized.length} mô hình? Hãy xuất bản sao lưu trước khi đồng ý.`))return;
    const before=items;
    pushHistory();
    items=normalized;
    if(!saveLibrary({replaceAll:true})){
      items=before;
      historyUndo.pop();
      updateUndoRedoUI();
      notify('Không thể lưu thư viện vừa nhập vào bộ nhớ. Đã phục hồi danh mục cũ.',true);
      return;
    }
    sessionDeletedIds.clear();
    for(const g of GRADES)pageByGrade[g]=0;
    sync();
    notify(`Đã nhập ${items.length} mô hình.`);
  }catch(e){notify(`Không thể nhập: ${e.message}`,true);}
}
initGradeOptions();
function onPointerLockChange(isLocked){
  const btn=el('btn-pointerlock');
  if(btn) btn.innerHTML=isLocked?'🔓 <span>Thoát chuột (ESC)</span>':'🎯 <span>Khóa chuột</span>';
  if(isLocked) notify('Đã khóa chuột. Rê chuột để nhìn quanh, nhấp để chọn mô hình. Nhấn ESC để thoát.');
}
function openNPCDialog(npc) {
  if (!npc) return;
  playHologramSound();

  const iconEl = el('npc-dialog-icon');
  const badgeEl = el('npc-dialog-badge');
  const titleEl = el('npc-dialog-title');
  const quoteEl = el('npc-dialog-quote');
  const topicsEl = el('npc-dialog-topics');
  const speakBtn = el('npc-dialog-speak');
  const exploreBtn = el('npc-dialog-explore');

  if (iconEl) iconEl.textContent = npc.icon || '👨‍🏫';
  if (badgeEl) {
    badgeEl.textContent = npc.title || 'HƯỚNG DẪN VIÊN';
    badgeEl.style.color = npc.accent || '#38bdf8';
  }
  if (titleEl) titleEl.textContent = `${npc.guideName || 'Hướng dẫn viên'} · ${npc.grade ? `Lớp ${npc.grade}` : 'Sảnh'}`;
  if (quoteEl) {
    quoteEl.textContent = `"${npc.greeting}"`;
    quoteEl.style.borderLeftColor = npc.accent || '#38bdf8';
  }

  if (topicsEl) {
    topicsEl.innerHTML = '';
    const topics = npc.topics || ['Khám phá mô hình 3D trực quan'];
    topics.forEach(t => {
      const li = document.createElement('li');
      li.textContent = t;
      topicsEl.appendChild(li);
    });
  }

  if (speakBtn) {
    speakBtn.onclick = () => {
      speakText(npc.greeting);
    };
  }

  if (exploreBtn) {
    exploreBtn.onclick = () => {
      hideModal('npc-overlay');
      if (npc.grade && npc.grade >= 6) {
        museum.toGrade(npc.grade);
        if (npc.featuredModelId) {
          const target = items.find(it => it.id === npc.featuredModelId);
          if (target) {
            setTimeout(() => {
              viewer.open(target);
            }, 600);
          }
        }
      }
    };
  }

  showModal('npc-overlay');
}

museum=startMuseum({
  canvas:el('world'),
  onEnter,
  onSelect,
  onPortalChange:showPortalHud,
  onPointerLockChange,
  onTick:()=>minimap?.render?.(),
  onFootstep:playFootstepSound,
  onNPCInteract:(npc)=>{
    openNPCDialog(npc);
  }
});
if (typeof window !== 'undefined') window.museum = museum;
// Native visual upgrade toggle (not an addon). Keep the existing quality selector.
mountGraphicsPanel(museum);
el('mv14-portal-back')?.addEventListener('click',()=>museum.enterPortal(null));
el('mv15-hall-link')?.addEventListener('click',()=>museum.toHall());
el('mv14-math6-browse')?.addEventListener('click',openMath6Drawer);
el('mv14-math6-close')?.addEventListener('click',closeMath6Drawer);

const btnThemeToggle = el('btn-theme-toggle');
function syncThemeUI(isDay) {
  if (btnThemeToggle) {
    btnThemeToggle.innerHTML = isDay ? '☀️ <span id="theme-label">Ban ngày</span>' : '🌙 <span id="theme-label">Không gian</span>';
    btnThemeToggle.setAttribute('title', isDay ? 'Chế độ: ☀️ Tươi sáng (Daylight). Nhấp để đổi sang 🌙 Không gian (Dark).' : 'Chế độ: 🌙 Không gian (Dark). Nhấp để đổi sang ☀️ Tươi sáng (Daylight).');
  }
  document.body.classList.toggle('theme-daylight', isDay);
}
btnThemeToggle?.addEventListener('click', () => {
  const isDay = museum.toggleDaylightTheme();
  try { localStorage.setItem('mathverse_theme', isDay ? 'daylight' : 'dark'); } catch {}
  syncThemeUI(isDay);
  notify(isDay ? 'Đã bật chế độ Tươi sáng (Daylight Math Campus).' : 'Đã bật chế độ Không gian đêm (Midnight Sci-Fi).');
});
try {
  const savedTheme = localStorage.getItem('mathverse_theme');
  if (savedTheme === 'dark') {
    museum.setDaylightTheme(false);
    syncThemeUI(false);
  } else {
    museum.setDaylightTheme(true);
    syncThemeUI(true);
  }
} catch {
  syncThemeUI(true);
}

const qualitySelect=el('museum-render-quality');
if(qualitySelect){
  qualitySelect.value=museum.getQuality?.().name||'auto';
  qualitySelect.addEventListener('change',()=>{
    const q=museum.setQuality(qualitySelect.value);
    try{localStorage.setItem('mathverse-render-quality',q.name);}catch{}
    notify(q.name==='eco'?'Đã bật chế độ ưu tiên độ mượt.':q.name==='high'?'Đã bật chất lượng hình ảnh cao.':'Đã bật tự điều chỉnh chất lượng đồ họa.');
  });
}

viewer=makeViewer({onClose:pauseIfModal,onSave:saveFromViewer});
labShell=new LabShell({
  onBackToMuseum: () => {
    museum.setPaused(false);
    if(savedPlayerState && typeof museum.restoreState === 'function') {
      museum.restoreState(savedPlayerState);
    }
  },
  onSaveModel: saveFromViewer,
  getLibraryItems: () => items,
  getIsTeacher: () => teacher,
  onOpenGrade6Warehouse: ({model,modeId,roomId}) => {
    const selected=getModeById(modeId)||getModeById(Object.entries(LAB_TO_EXHIBIT).find(([,anchor])=>anchor===model?.id)?.[0]);
    curriculumExplorer.open(6,selected?.id?getUnifiedLabByModeId(selected.id)?.labId:getLabDoorsForRoom(roomId||getRoomsForGrade(6)[0]?.roomId)[0]?.labId,selected?.id||null);
  }
});
// Legacy controls are removed from the visible interface, not merely renamed.
// The old LabShell remains for historical custom viewer compatibility in Grades 7–12.
for(const legacy of document.querySelectorAll('.math6-library-option, .math6-launch, [data-unified-mode="math6"]')) legacy.remove();
window.labShell = labShell;
const mapCanvas=el('minimap-canvas');
if(mapCanvas){
  minimap=createMinimap({
    canvas:mapCanvas,
    getPlayer:museum.getPlayer,
    getActiveGrade:museum.getGrade,
    onSelectRoom:selectGrade,
    onSelectThematicRoom:(roomId)=>{
      navigateToThematicRoom(roomId);
    },
    onSelectLab:(labId)=>navigateToLab(labId),
    onSelectMode:(modeId)=>navigateToMode(modeId),
    getActiveLabGallery:()=>museum.getActiveLabGallery?.()||null,
    getActiveThematicRoom:()=>museum.getActiveThematicRoom?.()||activeThematicRoomId
  });
}
sync();
el('page-prev').onclick=()=>{if(activeGrade){pageByGrade[activeGrade]--;museum.setPage(activeGrade,pageByGrade[activeGrade]);renderCatalog();}};
el('page-next').onclick=()=>{if(activeGrade){pageByGrade[activeGrade]++;museum.setPage(activeGrade,pageByGrade[activeGrade]);renderCatalog();}};
el('btn-home').onclick=()=>museum.toHall();el('btn-focus8').onclick=()=>museum.toGrade(8);
// R8/R9 UI: camera presets – character (3rd), eye (1st), 3/4, bird's-eye, whole-room overview.
const R9_VIEW_BUTTONS={iso:'btn-view-iso',top:'btn-view-top',overview:'btn-view-overview'};
const R9_AERIAL_LABEL={iso:'◩ GÓC 3/4',top:'🛰 TRÊN CAO',overview:'⤢ TOÀN CẢNH'};
function r8SyncViewUI(){
  const mode=museum.getViewModeName?.()||'third';
  const aerial=mode==='top'||mode==='iso'||mode==='overview';
  document.body.classList.toggle('r8-top-view',aerial);
  document.body.dataset.r9View=mode;
  el('btn-view-mode').innerHTML=`${mode==='first'?'👁':'👤'} <span>${mode==='first'?'Góc mắt':'3D'}</span>`;
  el('btn-view-mode').classList.toggle('is-active',!aerial);
  el('btn-view-mode').title='Đổi giữa góc có nhân vật và góc mắt';
  for(const [m,id] of Object.entries(R9_VIEW_BUTTONS)){
    const b=el(id);if(!b)continue;
    b.classList.toggle('is-active',mode===m);b.setAttribute('aria-pressed',String(mode===m));
  }
  const lbl=el('r9-aerial-label');if(lbl&&aerial)lbl.textContent=R9_AERIAL_LABEL[mode];
  const slider=el('r9-aerial-height');
  if(slider){slider.disabled=mode==='overview';slider.value=String(Math.round((museum.getAerialHeight?.()??.27)*100));}
}
function r8SetView(mode){
  museum.setViewMode(mode);r8SyncViewUI();
  notify({top:'Góc nhìn TRÊN CAO: lăn chuột hoặc kéo thanh độ cao, phím T để thoát.',
    iso:'Góc nhìn 3/4: thấy cả khu Lab mà vẫn có chiều sâu (phím G).',
    overview:'TOÀN CẢNH: camera đặt cố định nhìn cả phòng; vẫn đi lại bằng WASD (phím O).',
    first:'Chế độ góc nhìn thứ nhất (Góc nhìn mắt).',
    third:'Chế độ góc nhìn thứ 3 (Có nhân vật hướng dẫn viên).'}[mode]);
}
const r9Toggle=m=>r8SetView(museum.getViewModeName()===m?'third':m);
el('btn-view-mode').onclick=()=>{
  const mode=museum.getViewModeName();
  r8SetView(mode==='third'?'first':'third');
};
el('btn-view-top')?.addEventListener('click',()=>r9Toggle('top'));
el('btn-view-iso')?.addEventListener('click',()=>r9Toggle('iso'));
el('btn-view-overview')?.addEventListener('click',()=>r9Toggle('overview'));
el('r8-top-zoom-in')?.addEventListener('click',()=>{museum.zoomTopView(-6);r8SyncViewUI();});
el('r8-top-zoom-out')?.addEventListener('click',()=>{museum.zoomTopView(6);r8SyncViewUI();});
el('r9-aerial-height')?.addEventListener('input',e=>museum.setAerialHeight?.(Number(e.target.value)/100));
el('r8-top-exit')?.addEventListener('click',()=>r8SetView('third'));
el('world')?.addEventListener('wheel',()=>requestAnimationFrame(r8SyncViewUI),{passive:true});
// R9: enlargeable minimap (the canvas backing store grows so it stays crisp).
function r9SetMapExpanded(on){
  const panel=el('minimap-panel'),cv=el('minimap-canvas'),btn=el('minimap-expand');
  if(!panel||!cv)return;
  panel.classList.toggle('r9-expanded',on);panel.classList.remove('collapsed');
  const w=on?Math.min(760,Math.round(window.innerWidth*.62)):240;
  cv.width=w;cv.height=Math.round(w*145/240);
  btn?.setAttribute('aria-pressed',String(on));if(btn)btn.textContent=on?'✕':'⤢';
}
el('minimap-expand')?.addEventListener('click',()=>r9SetMapExpanded(!el('minimap-panel').classList.contains('r9-expanded')));
const r9Shortcuts=on=>{const s=el('r9-shortcuts');if(s)s.hidden=!on;};
el('btn-shortcuts')?.addEventListener('click',()=>r9Shortcuts(el('r9-shortcuts')?.hidden));
el('r9-shortcuts-close')?.addEventListener('click',()=>r9Shortcuts(false));
function isTypingOrFormTarget(target) {
  if (!target) return false;
  const tag = (target.tagName || '').toUpperCase();
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return true;
  if (target.isContentEditable || target.getAttribute?.('contenteditable') === 'true' || target.getAttribute?.('contenteditable') === '') return true;
  if (typeof target.closest === 'function' && target.closest('input,textarea,select,[contenteditable="true"],[contenteditable=""]')) return true;
  return false;
}

function isAnyModalOrOverlayOpen() {
  if (viewer?.isOpen?.()) return true;
  for (const id of ['viewer-overlay', 'editor-overlay', 'ai-overlay', 'help-overlay', 'avatar-overlay', 'npc-overlay', 'welcome-overlay']) {
    const node = el(id);
    if (node && !node.hidden) return true;
  }
  if (document.querySelector('.curriculum-overlay:not([hidden]), .studio-launchpad-overlay.is-open, .holo-stage-overlay.is-open')) {
    return true;
  }
  return false;
}

window.addEventListener('keydown',e=>{
  if(e.repeat||e.ctrlKey||e.altKey||e.metaKey)return;
  if(isTypingOrFormTarget(e.target))return;
  if(e.code==='Escape'&&!el('r9-shortcuts')?.hidden){r9Shortcuts(false);return;}
  if(isAnyModalOrOverlayOpen())return;
  if(e.code==='KeyT')r9Toggle('top');
  else if(e.code==='KeyG')r9Toggle('iso');
  else if(e.code==='KeyO')r9Toggle('overview');
  else if(e.code==='KeyM')r9SetMapExpanded(!el('minimap-panel')?.classList.contains('r9-expanded'));
  else if(e.code==='KeyH')toggleAllHudCollapse();
  else if(e.key==='?')r9Shortcuts(el('r9-shortcuts')?.hidden);
});
r8SyncViewUI();
const btnPointerLock=el('btn-pointerlock');
if(btnPointerLock){
  btnPointerLock.onclick=()=>museum.togglePointerLock();
}
document.querySelectorAll('.map-btn').forEach(btn=>{
  btn.onclick=()=>{
    const r=Number(btn.dataset.room);
    selectGrade(r);
  };
});
const minimapToggle=el('minimap-toggle');
if(minimapToggle){
  minimapToggle.onclick=()=>{
    const panel=el('minimap-panel');
    panel.classList.toggle('collapsed');
    minimapToggle.textContent=panel.classList.contains('collapsed')?'▼':'▲';
  };
}
const btnSprint=el('btn-sprint');
if(btnSprint){
  btnSprint.onclick=()=>{
    const isSprint=museum.toggleSprint();
    btnSprint.innerHTML=`⚡ <span>Tốc độ: ${isSprint?'Chạy (2x)':'Đi bộ (1x)'}</span>`;
    notify(isSprint?'Đã bật tốc độ chạy nhanh (2x).':'Đã về tốc độ đi bộ bình thường (1x).');
  };
}
const btnStop=el('btn-stop');
if(btnStop){
  btnStop.onclick=()=>{
    museum.stopMovement();
    notify('Đã dừng di chuyển.');
  };
}
el('catalog-search').addEventListener('input',renderCatalog);
el('btn-teacher').onclick=()=>{teacher=!teacher;el('btn-teacher').textContent=teacher?'✓ Đang ở chế độ giáo viên':'⚙ Giáo viên';
  document.querySelectorAll('.teacher-action').forEach(b=>b.hidden=!teacher);
  renderCatalog();notify(teacher?'Đã bật chế độ giáo viên (không có mật khẩu).':'Đã tắt chế độ giáo viên.');};
el('btn-new').onclick=()=>openEditor();el('btn-ai').onclick=()=>{el('ai-grade').value=String(activeGrade||8);el('ai-result').textContent='Chưa tạo mô hình. Nếu dùng AI, ảnh chỉ gửi đi khi cô nhấn nút Gemini.';showModal('ai-overlay');};
el('btn-help').onclick=()=>showModal('help-overlay');
el('btn-export').onclick=()=>{const stamp=new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);downloadJSON(`MATH3D_DU_LIEU_${stamp}.json`,{version:5,schemaVersion:5,revision:libraryRevision,exportedAt:new Date().toISOString(),items});notify('Đã xuất bản sao lưu mô hình JSON.');};
el('btn-import').onclick=()=>el('file-import').click();
el('file-import').addEventListener('change',async e=>{if(e.target.files?.[0])await importJSON(e.target.files[0]);e.target.value='';});
el('btn-reset').onclick=()=>{if(!confirm('Xóa tất cả chỉnh sửa và mô hình cô thêm để trở về các mô hình gốc? Hãy Xuất dữ liệu trước khi làm.'))return;
  const before=items;
  pushHistory();
  items=defaults.map(it=>({...it}));
  if(!saveLibrary({replaceAll:true})){items=before;historyUndo.pop();updateUndoRedoUI();return;}
  sessionDeletedIds.clear();
  for(const g of GRADES)pageByGrade[g]=0;sync();notify('Đã khôi phục các mô hình mẫu ban đầu.');};
el('editor-type').onchange=()=>renderEditorParams();
el('editor-form').addEventListener('submit',e=>{e.preventDefault();try{const model=getEditorData(),idx=items.findIndex(i=>i.id===model.id);
    const before=[...items];
    pushHistory();
    if(idx<0)items.push(model);else items[idx]=model;
    if(items.length>300){items=before;historyUndo.pop();updateUndoRedoUI();throw Error('Thư viện tối đa 300 mô hình.');}
    sessionDeletedIds.delete(model.id);
    if(!saveLibrary()){items=before;historyUndo.pop();updateUndoRedoUI();return;}
    hideModal('editor-overlay');sync();museum.toGrade(model.grade);
    notify(`Đã lưu “${model.title}” vào phòng lớp ${model.grade}.`);
  }catch(err){notify(`Không lưu được: ${err.message}`,true);}});
el('editor-delete').onclick=()=>{if(!editingId)return;const model=items.find(i=>i.id===editingId);if(!model||!confirm(`Ẩn/Xóa “${model.title}” khỏi thư viện?`))return;
  const before=[...items];
  pushHistory();
  sessionDeletedIds.add(editingId);
  items=items.filter(i=>i.id!==editingId);
  if(!saveLibrary()){items=before;sessionDeletedIds.delete(editingId);historyUndo.pop();updateUndoRedoUI();return;}
  hideModal('editor-overlay');sync();notify('Đã xóa mô hình khỏi thư viện hiện tại.');};
const btnUndo=el('btn-undo');if(btnUndo)btnUndo.onclick=undo;
const btnRedo=el('btn-redo');if(btnRedo)btnRedo.onclick=redo;
updateUndoRedoUI();
el('ai-generate').onclick=interpretAI;
el('ai-offline').onclick=()=>{
  const file=el('ai-file').files[0];if(file){el('ai-result').textContent='Chế độ offline không đọc được ảnh. Hãy dùng Gemini nếu cô muốn phân tích ảnh.';return;}
  const idea=recognizeIdea(el('ai-prompt').value,Number(el('ai-grade').value));
  if(!idea){el('ai-result').textContent='Không nhận ra hình đã hỗ trợ. Hãy thử “hình chóp tứ giác đều”, “hình trụ”, “parabol”... hoặc dùng Gemini.';return;}
  hideModal('ai-overlay');openEditor(idea);editingId=null;notify('Đã nhận diện mẫu từ khóa. Cô kiểm tra lại tham số.');
};
// Cụm nút chọn nhanh 7 lớp trên Dock nổi
document.querySelectorAll('.dock-grade-btn').forEach(btn => {
  btn.onclick = () => {
    const g = Number(btn.dataset.grade);
    selectGrade(g);
    r9GradeMenu(false);
  };
});
// R9: L6–L12 grouped in one pop-up menu on the dock.
function r9GradeMenu(open){
  const strip=document.querySelector('.dock-grade-strip'),btn=el('r9-grade-toggle');
  if(!strip||!btn)return;
  const on=typeof open==='boolean'?open:!strip.classList.contains('r9-open');
  strip.classList.toggle('r9-open',on);btn.setAttribute('aria-expanded',String(on));
}
function r9SyncGradeToggle(){
  const a=document.querySelector('.dock-grade-btn.active'),lbl=el('r9-grade-current');
  if(lbl)lbl.textContent=a?(Number(a.dataset.grade)?`Lớp ${a.dataset.grade}`:'Sảnh'):'Sảnh';
}
el('r9-grade-toggle')?.addEventListener('click',e=>{e.stopPropagation();r9GradeMenu();});
document.addEventListener('pointerdown',e=>{if(!e.target.closest?.('.r9-grade-wrap'))r9GradeMenu(false);});
{const strip=document.querySelector('.dock-grade-strip');
 if(strip)new MutationObserver(r9SyncGradeToggle).observe(strip,{subtree:true,attributes:true,attributeFilter:['class']});
 r9SyncGradeToggle();}

// R9: short banner when a room is entered (purely informative).
function r9ShowRoomBanner(grade,room,labId){
  let b=el('r9-room-banner');
  if(!b){b=document.createElement('div');b.id='r9-room-banner';b.className='r9-room-banner';b.setAttribute('role','status');document.body.append(b);}
  if(!grade){b.classList.remove('is-on');return;}
  const chRooms=getChapterRoomsForGrade(grade);
  const labs=room?getLabDoorsForRoom(room.roomId):[];
  const title=room?`${room.roomId} · ${room.name}`:`PHÒNG TOÁN LỚP ${grade}`;
  const sub=room?`${labs.length} Bài học · ${room.modeCount} mô hình · nhấn O để xem toàn cảnh`:`${chRooms.length||getRoomsForGrade(grade).length} Chương Sách Giáo Khoa`;
  b.replaceChildren();
  const t=document.createElement('strong');t.textContent=title;
  const s=document.createElement('span');s.textContent=sub;
  b.append(t,s);
  if(room&&labs.length){
    const chips=document.createElement('div');chips.className='r9-room-chips';
    labs.forEach((l,i)=>{const c=document.createElement('em');c.dataset.i=String(i%4);c.textContent=l.isChapterLessonLab?l.name:`Lab ${i+1} · ${l.name}`;chips.append(c);});
    b.append(chips);
  }
  b.classList.remove('is-on');void b.offsetWidth;b.classList.add('is-on');
  clearTimeout(r9ShowRoomBanner.t);r9ShowRoomBanner.t=setTimeout(()=>b.classList.remove('is-on'),3200);
}

// R9: hover card for 3D pedestals (dispatched by museum.js).
{
  const tip=document.createElement('div');tip.id='r9-hover-tip';tip.className='r9-hover-tip';tip.hidden=true;
  document.body.append(tip);
  window.addEventListener('mv-hover-mode',e=>{
    const d=e.detail;
    if(!d){tip.hidden=true;return;}
    tip.replaceChildren();
    const n=document.createElement('b');n.className='r9-tip-num';n.textContent=String(d.index+1);n.dataset.i=String((d.zone||0)%4);
    const box=document.createElement('div');
    const t=document.createElement('strong');t.textContent=d.name;
    const m=document.createElement('small');m.textContent=`${d.labName?`Lab ${(d.zone||0)+1} · ${d.labName} · `:''}${d.modeId}`;
    const a=document.createElement('span');a.textContent='Nhấp để mở mô hình';
    box.append(t,m,a);tip.append(n,box);
    tip.hidden=false;
    const x=Math.min(window.innerWidth-tip.offsetWidth-12,d.clientX+16),y=Math.min(window.innerHeight-tip.offsetHeight-12,d.clientY+18);
    tip.style.transform=`translate(${Math.max(8,x)}px,${Math.max(8,y)}px)`;
  });
}

// Bật / Tắt âm thanh phản hồi UI
const btnAudio = el('btn-audio');
if (btnAudio) {
  const updateAudioBtn = () => {
    const muted = getMuteState();
    btnAudio.innerHTML = muted ? '🔇 <span>Âm thanh: Tắt</span>' : '🔊 <span>Âm thanh: Bật</span>';
    btnAudio.title = muted ? 'Nhấp để bật âm thanh' : 'Nhấp để tắt âm thanh';
  };
  updateAudioBtn();
  btnAudio.onclick = () => {
    toggleMute();
    updateAudioBtn();
    notify(getMuteState() ? 'Đã tắt âm thanh phản hồi.' : 'Đã bật âm thanh phản hồi UI.');
  };
}

// Bật modal chọn nhân vật 3D đại diện
const btnAvatar = el('btn-avatar');
if (btnAvatar) {
  btnAvatar.onclick = () => {
    const cur = (museum && typeof museum.getAvatarType === 'function') ? museum.getAvatarType() : 'alex';
    document.querySelectorAll('.avatar-card').forEach(c => {
      c.classList.toggle('active', c.dataset.avatar === cur);
    });
    showModal('avatar-overlay');
  };
}

document.querySelectorAll('.avatar-card').forEach(card => {
  card.onclick = () => {
    const type = card.dataset.avatar;
    if (museum && typeof museum.setAvatarType === 'function') {
      museum.setAvatarType(type);
      document.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      playClickSound();
      hideModal('avatar-overlay');
      const names = {
        alex: 'Thầy Tùng (Giảng viên Chibi 3D)',
        triet: 'Minh Triết (Nam sinh Chibi 3D)',
        an: 'Tuệ An (Nữ sinh Chibi 3D)',
        bot: 'Bot Pi (Robot Chibi 3D)',
        suhocba: 'Sư Học Bá (Sư chùa đầu trọc Chibi 3D)'
      };
      notify(`Đã đổi nhân vật 3D: ${names[type] || type}.`);
    }
  };
});

// Âm thanh phản hồi khi bấm nút
document.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (btn && !btn.classList.contains('dock-grade-btn')) {
    playClickSound();
  }
});

for(const button of document.querySelectorAll('[data-close]'))button.onclick=()=>hideModal(button.dataset.close);
for(const id of ['editor-overlay','ai-overlay','help-overlay','avatar-overlay','npc-overlay'])el(id)?.addEventListener('pointerdown',e=>{if(e.target===el(id))hideModal(id);});
window.addEventListener('keydown',e=>{
  if (
    e.code === 'KeyE' &&
    !isTypingOrFormTarget(e.target) &&
    !isAnyModalOrOverlayOpen()
  ) {
    if (museum?.interactNearby?.()) {
      e.preventDefault();
      return;
    }
  }
  if(e.key==='Escape'){
    if(viewer.isOpen())viewer.close();
    else for(const id of ['editor-overlay','ai-overlay','help-overlay','avatar-overlay','npc-overlay'])if(!el(id)?.hidden){hideModal(id);break;}
  }
});
if(el('welcome-enter'))el('welcome-enter').onclick=()=>{hideModal('welcome-overlay');try{localStorage.setItem('math3d-welcomed','yes');}catch{}};
if(el('welcome-class8'))el('welcome-class8').onclick=()=>{hideModal('welcome-overlay');try{localStorage.setItem('math3d-welcomed','yes');}catch{}museum.toGrade(8);};

// R11: Dual-Mode Adaptive Studio Launchpad + In-World 3D Holo-Stage Inspector
const holoStageInspector = new HoloStageInspector({
  getMuseum: () => museum,
  onOpenFullLab: (modeId) => navigateToMode(modeId),
  onNotify: notify
});
const studioLaunchpad = new StudioLaunchpad({
  onOpenLabMode: (modeId) => {
    holoStageInspector.close();
    navigateToMode(modeId);
  },
  onOpenHoloStage: (modeId) => {
    holoStageInspector.openForMode(modeId);
  },
  onEnter3DMuseum: (grade) => {
    if (grade && GRADES.includes(Number(grade))) selectGrade(Number(grade));
  },
  onEnter3DChapter: (grade, chapterId) => {
    if (grade && GRADES.includes(Number(grade))) selectGrade(Number(grade));
    if (chapterId) setTimeout(() => museum?.enterPortal?.(chapterId), 90);
  }
});
if (typeof window !== 'undefined') {
  window.holoStageInspector = holoStageInspector;
  window.studioLaunchpad = studioLaunchpad;
  window.openHoloStageForMode = (modeId) => holoStageInspector.openForMode(modeId);
}
el('btn-studio-launchpad')?.addEventListener('click', () => studioLaunchpad.toggle(activeGrade || 8));
el('welcome-studio')?.addEventListener('click', () => {
  hideModal('welcome-overlay');
  try { localStorage.setItem('math3d-welcomed', 'yes'); } catch {}
  studioLaunchpad.open(activeGrade || 8);
});
window.addEventListener('keydown', e => {
  if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
  if (isTypingOrFormTarget(e.target)) return;
  if (isAnyModalOrOverlayOpen()) return;
  if (e.code === 'KeyL') {
    e.preventDefault();
    studioLaunchpad.toggle(activeGrade || 8);
  } else if (e.code === 'KeyF' && activeThematicRoomId) {
    e.preventDefault();
    const exs = museum?.getRoomExhibits?.() || [];
    if (exs.length) {
      const p = museum.getPlayer?.() || { x: 0, z: 0 };
      let best = exs[0], bestD = 999;
      for (const ex of exs) {
        const d = Math.hypot(p.x - ex.x, p.z - ex.z);
        if (d < bestD) { bestD = d; best = ex; }
      }
      holoStageInspector.openForMode(best.mode.id);
    }
  }
});

let hasWelcomed = false;
try { hasWelcomed = !!localStorage.getItem('math3d-welcomed'); } catch {}
if(!hasWelcomed)showModal('welcome-overlay');
const sidebar=el('sidebar');
function setSidebarCollapsed(collapsed){
  if(window.innerWidth<=768){
    sidebar?.classList.toggle('is-open',!collapsed);
  }else{
    document.body.classList.toggle('mv-sidebar-collapsed',collapsed);
  }
}
el('sidebar-collapse')?.addEventListener('click',()=>{
  if(window.innerWidth<=768)sidebar?.classList.toggle('is-open');
  else setSidebarCollapsed(!document.body.classList.contains('mv-sidebar-collapsed'));
});
el('sidebar-reopen-btn')?.addEventListener('click',()=>setSidebarCollapsed(false));
el('mobile-menu-button')?.addEventListener('click',()=>sidebar?.classList.toggle('is-open'));

function setDockCollapsed(collapsed){
  document.body.classList.toggle('mv-dock-collapsed',collapsed);
}
el('btn-dock-collapse')?.addEventListener('click',()=>setDockCollapsed(true));
el('dock-reopen-btn')?.addEventListener('click',()=>setDockCollapsed(false));

function toggleAllHudCollapse(force){
  const next=typeof force==='boolean'?force:!document.body.classList.contains('mv-hud-collapsed');
  document.body.classList.toggle('mv-hud-collapsed',next);
  document.body.classList.toggle('mv-sidebar-collapsed',next);
  document.body.classList.toggle('mv-dock-collapsed',next);
  const mm=el('minimap-panel'),mmBtn=el('minimap-toggle');
  if(mm){
    mm.classList.toggle('collapsed',next);
    if(mmBtn)mmBtn.textContent=next?'▼':'▲';
  }
  const hudBtn=el('btn-hud-collapse');
  if(hudBtn){
    hudBtn.innerHTML=next?'▼ <span>Mở thanh UI</span>':'▲ <span>Thu gọn UI</span>';
  }
  const qlExpand=el('mv-ql-expand-all');
  if(qlExpand){
    qlExpand.innerHTML=next?'⤢ <span>Mở toàn bộ UI</span>':'▴ <span>Thu gọn toàn bộ</span>';
    qlExpand.classList.toggle('is-active',!next);
  }
}
el('btn-hud-collapse')?.addEventListener('click',()=>toggleAllHudCollapse());

// R7.3+: Mặc định thu gọn toàn bộ công cụ để không che màn hình 3D; bấm vào từng nút sẽ sổ ra chức năng tương ứng
toggleAllHudCollapse(true);

const brPopover = el('mv-brightness-popover');
const grPopover = el('mv-grade-popover');
const brSlider = el('mv-brightness-slider');
const brVal = el('mv-brightness-val');
const brLabel = el('mv-ql-brightness-label');

function closeAllToolPopovers(except = null) {
  if (except !== 'brightness' && brPopover) {
    brPopover.hidden = true;
    el('mv-ql-brightness')?.setAttribute('aria-expanded', 'false');
    el('mv-ql-brightness')?.classList.remove('is-active');
  }
  if (except !== 'grades' && grPopover) {
    grPopover.hidden = true;
    el('mv-ql-grades')?.setAttribute('aria-expanded', 'false');
    el('mv-ql-grades')?.classList.remove('is-active');
  }
}

function toggleToolPopover(which) {
  const target = which === 'brightness' ? brPopover : grPopover;
  const btn = which === 'brightness' ? el('mv-ql-brightness') : el('mv-ql-grades');
  if (!target) return;
  const willOpen = target.hidden;
  closeAllToolPopovers(willOpen ? which : null);
  target.hidden = !willOpen;
  btn?.setAttribute('aria-expanded', String(willOpen));
  btn?.classList.toggle('is-active', willOpen);
}

function applyBrightnessPercent(pctInput, save = true) {
  const pct = Math.min(160, Math.max(50, Math.round(Number(pctInput) || 100)));
  if (brSlider) brSlider.value = String(pct);
  if (brVal) brVal.textContent = `${pct}%`;
  if (brLabel) brLabel.textContent = `Độ sáng ${pct}%`;
  museum?.setBrightness?.(pct / 100);
  const worldCanvas = el('world');
  if (worldCanvas) {
    const cssBr = (0.94 + (pct - 100) * 0.0055).toFixed(3);
    const cssCt = (1.02 + Math.max(0, pct - 100) * 0.0018).toFixed(3);
    worldCanvas.style.filter = pct === 100 ? '' : `brightness(${cssBr}) contrast(${cssCt})`;
  }
  document.querySelectorAll('.mv-br-preset').forEach(b => {
    b.classList.toggle('is-active', Number(b.dataset.val) === pct);
  });
  if (save) {
    try { localStorage.setItem('mathverse_brightness_pct', String(pct)); } catch {}
  }
}

let savedBr = 100;
try { savedBr = Number((typeof localStorage !== 'undefined' && localStorage.getItem('mathverse_brightness_pct')) || 100); } catch {}
applyBrightnessPercent(Number.isFinite(savedBr) ? savedBr : 100, false);

brSlider?.addEventListener('input', () => applyBrightnessPercent(brSlider.value));
document.querySelectorAll('.mv-br-preset').forEach(btn => {
  btn.addEventListener('click', () => applyBrightnessPercent(btn.dataset.val));
});
el('btn-brightness-toggle')?.addEventListener('click', e => { e.stopPropagation(); toggleToolPopover('brightness'); });
el('mv-ql-brightness')?.addEventListener('click', e => { e.stopPropagation(); toggleToolPopover('brightness'); });
el('mv-brightness-close')?.addEventListener('click', () => closeAllToolPopovers());

function syncThemeButtons() {
  const isDay = museum?.isDaylightTheme ? museum.isDaylightTheme() : !document.body.classList.contains('theme-dark');
  el('mv-br-daylight')?.classList.toggle('is-active', isDay);
  el('mv-br-dark')?.classList.toggle('is-active', !isDay);
}
el('mv-br-daylight')?.addEventListener('click', () => {
  if (museum && !museum.isDaylightTheme()) el('btn-theme-toggle')?.click();
  syncThemeButtons();
});
el('mv-br-dark')?.addEventListener('click', () => {
  if (museum && museum.isDaylightTheme()) el('btn-theme-toggle')?.click();
  syncThemeButtons();
});
el('btn-theme-toggle')?.addEventListener('click', () => setTimeout(syncThemeButtons, 20));
syncThemeButtons();

// Các nút trên Thanh công cụ thu gọn (#mv-compact-launcher): bấm vào nút nào sổ ra chức năng tương ứng
el('mv-ql-sidebar')?.addEventListener('click', () => {
  closeAllToolPopovers();
  const nextCollapsed = !document.body.classList.contains('mv-sidebar-collapsed');
  setSidebarCollapsed(nextCollapsed);
  el('mv-ql-sidebar')?.classList.toggle('is-active', !nextCollapsed);
});
el('mv-ql-studio')?.addEventListener('click', () => {
  closeAllToolPopovers();
  studioLaunchpad.toggle(activeGrade || 8);
});
el('mv-ql-grades')?.addEventListener('click', e => {
  e.stopPropagation();
  document.querySelectorAll('.mv-pop-grade-btn').forEach(b => {
    b.classList.toggle('is-active', Number(b.dataset.grade) === (activeGrade || 0));
  });
  toggleToolPopover('grades');
});
el('mv-grade-popover-close')?.addEventListener('click', () => closeAllToolPopovers());
document.querySelectorAll('.mv-pop-grade-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const g = Number(btn.dataset.grade);
    selectGrade(g);
    const lbl = el('mv-ql-grade-label');
    if (lbl) lbl.textContent = g ? `Lớp ${g}` : 'Sảnh';
    closeAllToolPopovers();
  });
});
el('mv-pop-open-kho')?.addEventListener('click', () => {
  closeAllToolPopovers();
  curriculumExplorer.open(activeGrade || 6);
});
el('mv-pop-open-studio')?.addEventListener('click', () => {
  closeAllToolPopovers();
  studioLaunchpad.open(activeGrade || 8);
});
el('mv-ql-minimap')?.addEventListener('click', () => {
  closeAllToolPopovers();
  const panel = el('minimap-panel'), mmBtn = el('minimap-toggle');
  if (!panel) return;
  const collapsed = panel.classList.toggle('collapsed');
  if (mmBtn) mmBtn.textContent = collapsed ? '▼' : '▲';
  el('mv-ql-minimap')?.classList.toggle('is-active', !collapsed);
});
el('mv-ql-dock')?.addEventListener('click', () => {
  closeAllToolPopovers();
  const nextCollapsed = !document.body.classList.contains('mv-dock-collapsed');
  setDockCollapsed(nextCollapsed);
  el('mv-ql-dock')?.classList.toggle('is-active', !nextCollapsed);
});
el('mv-ql-expand-all')?.addEventListener('click', () => {
  closeAllToolPopovers();
  toggleAllHudCollapse();
});
const openHistoryGallery = () => {
  closeAllToolPopovers();
  window.__MATHVERSE_EXHIBITION_CORE_R74__?.open?.();
};
el('btn-history-gallery')?.addEventListener('click', openHistoryGallery);
el('mv-ql-history')?.addEventListener('click', openHistoryGallery);
el('btn-lab-tts')?.addEventListener('click', () => {
  const g = activeGrade;
  const room = activeThematicRoomId ? getRoomById(activeThematicRoomId) : null;
  const text = g
    ? `Chào mừng các em đến với Phòng Thực Nghiệm Toán Lớp ${g} của Thầy Tùng! ${room ? `Hiện tại các em đang ở chuyên đề ${room.name} với ${room.modeCount} mô hình tương tác.` : 'Các em hãy đi qua các cổng chương sách giáo khoa hoặc nhấp vào bục mô hình ba đê để khám phá công thức và điều chỉnh tham số trực tiếp!'}`
    : 'Chào mừng các em đến với Tòa Nhà Lab Toán Học ba đê của Thầy Tùng! Tại đây có bảy khu vực phòng học từ Lớp sáu đến Lớp mười hai với ba trăm mười mô hình sách giáo khoa và Phòng Triển Lãm mười tám Danh Nhân Toán Học.';
  speakText(text);
});
const returnToGrandCampus = () => {
  closeAllToolPopovers();
  try {
    if (window.parent && window.parent !== window && window.parent.DUAL_WORLD_DEBUG?.toLobby) {
      window.parent.DUAL_WORLD_DEBUG.toLobby();
      return;
    }
  } catch {}
  window.location.href = '/';
};
el('btn-grand-campus')?.addEventListener('click', returnToGrandCampus);
el('mv-ql-campus')?.addEventListener('click', returnToGrandCampus);
document.addEventListener('pointerdown', e => {
  if (!e.target.closest?.('#mv-brightness-popover, #mv-grade-popover, #mv-compact-launcher, #btn-brightness-toggle')) {
    closeAllToolPopovers();
  }
});
for(const button of document.querySelectorAll('[data-move]')){
  const k=button.dataset.move;
  const clear=()=>museum.setVirtualKey(k,false);
  button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);museum.setVirtualKey(k,true);});
  button.addEventListener('pointerup',clear);button.addEventListener('pointercancel',clear);button.addEventListener('lostpointercapture',clear);
}
console.info('MATH 3D MUSEUM loaded:',items.length,'models and',GRADES.length,'rooms.');
