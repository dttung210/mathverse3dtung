/**
 * MINIMAP 2 CẤP ĐỒ HỌA BẢO TÀNG TOÁN HỌC 3D (MUSEUM ATLAS)
 * - Cấp 1 (Global): Toàn cảnh Sảnh trung tâm và 7 phòng khối lớp (6–12).
 * - Cấp 2 (Thematic / Sub-map): Sơ đồ phòng học chi tiết với 4 hoặc 5 Cổng phòng chuyên đề
 *   hoặc không gian Phòng chuyên đề 3D với các bục hiện vật và cửa quay về.
 * - Nhấp trực tiếp vào phòng hoặc cổng để dịch chuyển tức thì.
 */
import { ROOMS } from './museum.js?v=r107_v15';
import { getRoomsForGrade, getChapterRoomsForGrade, getRoomById } from './museum/r6-room-layout.js?v=r107_v15';
import {getLabDoorsForRoom} from './museum/r68-unified-labs.mjs?v=r107_v15';
import {planR71ExpandedRoom} from './museum/r71-expanded-room-plan.mjs?v=r107_v15';
import {getUnifiedLabById} from './museum/r68-unified-labs.mjs?v=r107_v15';
import {planR73RoomGallery} from './museum/r73-room-gallery-plan.mjs?v=r107_v15';

export function createMinimap({
  canvas,
  getPlayer,
  getActiveGrade,
  onSelectRoom,
  onSelectThematicRoom,
  onSelectLab = () => {},
  onSelectMode = () => {},
  getActiveLabGallery = () => null,
  getActiveThematicRoom = () => null
}) {
  const ctx = canvas.getContext('2d');
  let currentLevel = 'auto'; // 'auto' | 'global' | 'room'

  const ROOM_BOXES = [
    { grade: 6,  name: 'Lớp 6',  x: -54, z1: 8,   z2: 46, color: '#5ccfbe' },
    { grade: 7,  name: 'Lớp 7',  x: -54, z1: -46, z2: -8, color: '#7bc0ef' },
    { grade: 8,  name: 'Lớp 8',  x: -18, z1: 8,   z2: 46, color: '#ffc06c' },
    { grade: 9,  name: 'Lớp 9',  x: -18, z1: -46, z2: -8, color: '#f58e9a' },
    { grade: 10, name: 'Lớp 10', x: 18,  z1: 8,   z2: 46, color: '#b197f5' },
    { grade: 11, name: 'Lớp 11', x: 18,  z1: -46, z2: -8, color: '#9cce91' },
    { grade: 12, name: 'Lớp 12', x: 54,  z1: 8,   z2: 46, color: '#f3ba81' },
    { grade: -1, name: 'Triển lãm', x: 54, z1: -46, z2: -8, color: '#688e99' }
  ];

  const MAP_X_MIN = -76;
  const MAP_X_MAX = 76;
  const MAP_Z_MIN = -52;
  const MAP_Z_MAX = 52;

  function toScreenX(worldX, w) {
    return ((worldX - MAP_X_MIN) / (MAP_X_MAX - MAP_X_MIN)) * w;
  }
  function toScreenY(worldZ, h) {
    return h - ((worldZ - MAP_Z_MIN) / (MAP_Z_MAX - MAP_Z_MIN)) * h;
  }
  function toWorldX(screenX, w) {
    return MAP_X_MIN + (screenX / w) * (MAP_X_MAX - MAP_X_MIN);
  }
  function toWorldZ(screenY, h) {
    return MAP_Z_MIN + ((h - screenY) / h) * (MAP_Z_MAX - MAP_Z_MIN);
  }

  // Interactive targets for Level 2 click-detection
  let currentLevel2ClickTargets = [];

  function renderLevel1Global(w, h, activeGrade, player) {
    currentLevel2ClickTargets = [];
    const isDay = typeof document !== 'undefined' && document.body?.classList?.contains('theme-daylight');

    // 1. Nền sảnh chính
    const hallLeft = toScreenX(-72, w);
    const hallRight = toScreenX(72, w);
    const hallTop = toScreenY(7.8, h);
    const hallBottom = toScreenY(-7.8, h);

    ctx.fillStyle = isDay ? '#f8fafc' : '#08131e';
    ctx.fillRect(0, 0, w, h);

    // Hành lang trung tâm
    ctx.fillStyle = isDay
      ? (activeGrade === 0 ? 'rgba(13, 148, 136, 0.22)' : 'rgba(203, 213, 225, 0.45)')
      : ((activeGrade === 0) ? 'rgba(78, 172, 196, 0.28)' : 'rgba(28, 54, 76, 0.45)');
    ctx.fillRect(hallLeft, hallTop, hallRight - hallLeft, hallBottom - hallTop);
    ctx.strokeStyle = isDay ? (activeGrade === 0 ? '#0d9488' : '#94a3b8') : (activeGrade === 0 ? '#62e0cd' : '#335b75');
    ctx.lineWidth = 1.2;
    ctx.strokeRect(hallLeft, hallTop, hallRight - hallLeft, hallBottom - hallTop);

    ctx.fillStyle = '#7a9eb3';
    ctx.font = 'bold 8px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ĐẠI SẢNH TRUNG TÂM', w / 2, (hallTop + hallBottom) / 2);

    // 2. Vẽ 7 phòng và Triển lãm
    const roomWidthWorld = 33;
    for (const r of ROOM_BOXES) {
      const rx1 = toScreenX(r.x - roomWidthWorld / 2, w);
      const rx2 = toScreenX(r.x + roomWidthWorld / 2, w);
      const rzTop = toScreenY(Math.max(r.z1, r.z2), h);
      const rzBottom = toScreenY(Math.min(r.z1, r.z2), h);

      const rw = rx2 - rx1;
      const rh = rzBottom - rzTop;

      const isActive = (r.grade === activeGrade);

      ctx.fillStyle = isActive ? 'rgba(103, 222, 207, 0.26)' : 'rgba(17, 36, 52, 0.75)';
      ctx.fillRect(rx1, rzTop, rw, rh);

      ctx.strokeStyle = isActive ? r.color : 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(rx1, rzTop, rw, rh);

      // Cửa vào phòng nối với sảnh
      const doorW = toScreenX(2.8, w) - toScreenX(0, w);
      const doorX = toScreenX(r.x, w) - doorW / 2;
      const doorY = r.z1 > 0 ? toScreenY(7.8, h) : toScreenY(-7.8, h);
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(doorX, doorY - 1, doorW, 2.5);

      // Nhãn phòng
      ctx.fillStyle = isActive ? '#ffffff' : r.color;
      ctx.font = `bold ${isActive ? '10px' : '9px'} system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(r.name, (rx1 + rx2) / 2, (rzTop + rzBottom) / 2);
    }
  }

  function renderLevel2Room(w, h, grade, player, activeThematicRoom) {
    currentLevel2ClickTargets = [];
    const cfg = ROOMS[grade];
    if (!cfg) return;
    const isDay = typeof document !== 'undefined' && document.body?.classList?.contains('theme-daylight');

    // Nền phòng học
    ctx.fillStyle = isDay ? '#f1f5f9' : '#0a1a29';
    ctx.fillRect(0, 0, w, h);

    // Khung phòng học chính
    const pad = 12;
    const roomW = w - pad * 2;
    const roomH = h - pad * 2;
    ctx.fillStyle = isDay ? 'rgba(255, 255, 255, 0.92)' : 'rgba(18, 43, 62, 0.7)';
    ctx.fillRect(pad, pad, roomW, roomH);
    ctx.strokeStyle = cfg.accentHex || '#53d3c5';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pad, pad, roomW, roomH);

    // Tiêu đề phòng ở phía trên
    ctx.fillStyle = isDay ? '#0f172a' : '#ffffff';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const roomHeader = activeThematicRoom
      ? `🏛️ ${activeThematicRoom}`
      : `🏛️ PHÒNG LỚP ${grade} — CÁC CỔNG CHƯƠNG SGK`;
    ctx.fillText(roomHeader, w / 2, pad + 4);

    // Cửa ra sảnh chính (ở cạnh dưới hoặc trên tùy zSide)
    const doorW = 44;
    const doorH = 7;
    const doorX = (w - doorW) / 2;
    const doorY = h - pad - doorH / 2;
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(doorX, doorY, doorW, doorH);
    ctx.fillStyle = '#08131e';
    ctx.font = 'bold 8px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('↩ VỀ SẢNH', w / 2, doorY + doorH / 2);

    currentLevel2ClickTargets.push({
      type: 'exitToHall',
      x: doorX,
      y: doorY,
      w: doorW,
      h: doorH
    });

    // Vẽ các cổng Chương SGK của lớp
    const chRooms = getChapterRoomsForGrade(grade);
    const thematicRooms = chRooms.length ? chRooms : getRoomsForGrade(grade);
    const gateCount = thematicRooms.length;
    const cols = gateCount > 5 ? Math.ceil(gateCount / 2) : gateCount;
    const gateW = (roomW - (cols + 1) * 4) / cols;
    const gateH = gateCount > 5 ? 20 : 26;

    for (let i = 0; i < gateCount; i++) {
      const r = thematicRooms[i];
      const row = gateCount > 5 ? Math.floor(i / cols) : 0;
      const col = gateCount > 5 ? (i % cols) : i;
      const gx = pad + 4 + col * (gateW + 4);
      const gateY = pad + 20 + row * (gateH + 4);
      const isCurrentThematic = (r.roomId === activeThematicRoom);

      ctx.fillStyle = isCurrentThematic ? 'rgba(83, 211, 197, 0.45)' : 'rgba(22, 125, 128, 0.25)';
      ctx.fillRect(gx, gateY, gateW, gateH);

      ctx.strokeStyle = isCurrentThematic ? '#ffd166' : 'rgba(83, 211, 197, 0.4)';
      ctx.lineWidth = isCurrentThematic ? 2 : 1;
      ctx.strokeRect(gx, gateY, gateW, gateH);

      // Nhãn Chương
      ctx.fillStyle = isCurrentThematic ? '#ffd166' : '#53d3c5';
      ctx.font = 'bold 7.5px monospace, system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(r.number ? `CH.${r.number}` : r.roomId, gx + gateW / 2, gateY + 2);

      // Tên ngắn
      ctx.fillStyle = isDay ? '#0f172a' : '#eaf4f4';
      ctx.font = '7px system-ui';
      const rawTitle = r.shortTitle || r.name;
      const shortName = rawTitle.length > 7 ? rawTitle.slice(0, 6) + '…' : rawTitle;
      ctx.fillText(shortName, gx + gateW / 2, gateY + 11);

      currentLevel2ClickTargets.push({
        type: 'thematicGate',
        roomId: r.roomId,
        x: gx,
        y: gateY,
        w: gateW,
        h: gateH
      });
    }

    // Trung tâm: khu vực trải nghiệm 3D
    const rowsTotal = gateCount > 5 ? 2 : 1;
    const gatesBottomY = pad + 20 + rowsTotal * (gateH + 4);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(pad + 10, gatesBottomY + 4, roomW - 20, Math.max(18, roomH - (gatesBottomY - pad) - 24));
    ctx.fillStyle = '#8daab6';
    ctx.font = '8px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Khu vực trải nghiệm 3D', w / 2, gatesBottomY + 14);
  }

  // R7.3: the thematic room shows every Lab zone and its pedestals at once.
  function renderExpandedLabMap(w,h,roomId,player,focusLabId=null) {
    currentLevel2ClickTargets=[];
    const room=getRoomById(roomId);
    if(!room)return;
    const plan=planR73RoomGallery(room,ROOMS[room.grade],getLabDoorsForRoom(roomId));
    ctx.fillStyle='#081a29';ctx.fillRect(0,0,w,h);
    const pad=12,innerW=w-2*pad,innerH=h-2*pad;
    ctx.fillStyle='#143345';ctx.fillRect(pad,pad,innerW,innerH);
    ctx.strokeStyle=ROOMS[room.grade].accentHex||'#53d3c5';
    ctx.lineWidth=1.5;ctx.strokeRect(pad,pad,innerW,innerH);
    const xmap=x=>pad+((x-(plan.x-plan.width/2))/plan.width)*innerW;
    const ymap=z=>pad+innerH-(plan.zSide*(z-plan.z)+plan.depth/2)/plan.depth*innerH;
    const k=Math.max(1,w/240),kf=Math.min(k,2.1),F=(px,wt='bold')=>`${wt} ${Math.round(px*kf)}px "Be Vietnam Pro","Segoe UI",sans-serif`;
    const LABC=['#2dd4bf','#f5b544','#a78bfa','#f472b6']; // R9: same identity colours as the 3D Lab zones
    const zTop=ymap(plan.z+plan.zSide*(plan.depth/2-4)),zBottom=ymap(plan.z+plan.zSide*-13.2);
    for(const zone of plan.zones){
      const x0=xmap(zone.minX),x1=xmap(zone.maxX),focus=zone.lab.labId===focusLabId,c=LABC[zone.index%LABC.length];
      ctx.globalAlpha=focus?.34:.18;ctx.fillStyle=c;ctx.fillRect(x0,zTop,x1-x0,zBottom-zTop);ctx.globalAlpha=1;
      ctx.strokeStyle=c;ctx.lineWidth=(focus?2.2:1.2)*k;ctx.strokeRect(x0,zTop,x1-x0,zBottom-zTop);
      ctx.fillStyle=c;ctx.font=F(7.5);ctx.textAlign='center';ctx.textBaseline='bottom';
      ctx.fillText(`LAB ${zone.index+1}`,(x0+x1)/2,zBottom+10*k);
      if(k>1.6){
        ctx.fillStyle='#eaf6f7';ctx.font=F(5.6,'600');
        const nm=zone.lab.name.length>34?zone.lab.name.slice(0,33)+'…':zone.lab.name;
        ctx.fillText(nm,(x0+x1)/2,zBottom+18*k);
      }
    }
    ctx.fillStyle='#edf9fa';ctx.font=F(9);
    ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText(`${room.roomId} · ${plan.zones.length} LAB · ${plan.modeCount} BỤC`,w/2,pad+3);
    for(const {mode,x,z,index,zone} of plan.objects){
      const xx=xmap(x),yy=ymap(z),s=Math.max(6*kf,Math.min(12*kf,innerW/plan.width*4.4));
      ctx.beginPath();ctx.arc(xx,yy,s/2,0,Math.PI*2);
      ctx.fillStyle=LABC[(zone||0)%LABC.length];ctx.fill();
      ctx.strokeStyle='#0b1d2c';ctx.lineWidth=1*k;ctx.stroke();
      ctx.fillStyle='#0b1d2c';ctx.font=F(6.4,'800');ctx.textBaseline='middle';
      ctx.fillText(String(index+1),xx,yy+.5);
      if(k>1.6){
        ctx.fillStyle='#d8e9ec';ctx.font=F(5,'600');ctx.textBaseline='top';
        const nm=mode.name.length>18?mode.name.slice(0,17)+'…':mode.name;
        ctx.fillText(nm,xx,yy+s/2+2*k);
      }
      currentLevel2ClickTargets.push({type:'modePedestal',modeId:mode.id,x:xx-s/2,y:yy-s/2,w:s,h:s});
    }
    const ex=xmap(plan.returnGate.x),ey=ymap(plan.returnGate.z),gw=48*k,gh=12*k;
    ctx.fillStyle='#f1c775';ctx.fillRect(ex-gw/2,ey-3*k,gw,gh);
    ctx.fillStyle='#061823';ctx.font=F(8);ctx.textBaseline='top';
    ctx.fillText('↩ LỚP '+room.grade,ex,ey-1*k);
    currentLevel2ClickTargets.push({type:'returnToGrade',grade:room.grade,x:ex-gw/2,y:ey-3*k,w:gw,h:gh});
    if(player){
      const px=xmap(player.x),py=ymap(player.z);
      ctx.beginPath();ctx.arc(px,py,4.5*k,0,Math.PI*2);
      ctx.fillStyle='#ffe3a8';ctx.fill();
      ctx.strokeStyle='#ffffff';ctx.lineWidth=1.2*k;ctx.stroke();
    }
  }

  function renderLabGalleryMap(w,h,labId,player){
    const lab=getUnifiedLabById(labId);
    if(lab)renderExpandedLabMap(w,h,lab.roomId,player,lab.labId);
  }

  function renderPlayer(w, h, player) {
    if (!player) return;
    const px = toScreenX(player.x, w);
    const py = toScreenY(player.z, h);

    const yaw = player.yaw || 0;
    const viewAngle = -yaw - Math.PI / 2;
    const fov = 0.55;
    const viewDist = 18;

    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, viewDist, viewAngle - fov, viewAngle + fov);
    ctx.closePath();
    ctx.fillStyle = 'rgba(103, 222, 207, 0.28)';
    ctx.fill();

    // Vòng tròn phát sáng
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 209, 102, 0.35)';
    ctx.fill();

    // Điểm nhân vật
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd166';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  function render() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const activeGrade = getActiveGrade();
    const activeLab=getActiveLabGallery();
    if(activeLab && currentLevel!=='global'){
      renderLabGalleryMap(w,h,activeLab,getPlayer());
      return;
    }
    const activeThematic = getActiveThematicRoom();
    if (activeThematic && currentLevel!=='global') {
      renderExpandedLabMap(w,h,activeThematic,getPlayer());
      return;
    }

    const isLevel2 = (currentLevel === 'room') || (currentLevel === 'auto' && activeGrade > 0);

    if (isLevel2) {
      renderLevel2Room(w, h, activeGrade, getPlayer(), activeThematic);
    } else {
      renderLevel1Global(w, h, activeGrade, getPlayer());
    }

    renderPlayer(w, h, getPlayer());
  }

  // Click handler on minimap
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Check if clicked inside Level 2 interactive targets
    for (const t of currentLevel2ClickTargets) {
      if (clickX >= t.x && clickX <= t.x + t.w && clickY >= t.y && clickY <= t.y + t.h) {
        if (t.type === 'exitToHall') {
          onSelectRoom(0);
        } else if(t.type === 'returnToGrade') {
          onSelectRoom(t.grade);
        } else if(t.type === 'modePedestal') {
          onSelectMode(t.modeId);
        } else if(t.type === 'returnToLabDoors') {
          onSelectThematicRoom?.(t.roomId);
        } else if(t.type === 'labDoor') {
          onSelectLab(t.labId);
        } else if (t.type === 'thematicGate' && onSelectThematicRoom) {
          onSelectThematicRoom(t.roomId);
        }
        return;
      }
    }

    // Otherwise standard Level 1 room selection
    const wx = toWorldX(clickX, canvas.width);
    const wz = toWorldZ(clickY, canvas.height);

    if (Math.abs(wz) <= 7.8) {
      onSelectRoom(0);
      return;
    }
    for (const r of ROOM_BOXES) {
      if (Math.abs(wx - r.x) <= 16.5) {
        if (r.z1 > 0 && wz >= 7.8 && wz <= 48) {
          if (r.grade > 0) onSelectRoom(r.grade);
          return;
        } else if (r.z1 < 0 && wz <= -7.8 && wz >= -48) {
          if (r.grade > 0) onSelectRoom(r.grade);
          return;
        }
      }
    }
  });

  return {
    render,
    setLevel: (lvl) => { currentLevel = lvl; },
    getLevel: () => currentLevel
  };
}
