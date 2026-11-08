/**
 * MATHVERSE Exhibition Gallery V2 -- 18 Frames / 3 Walls / 6 Slots each.
 * Back wall (6): pythagoras, euclid, archimedes, al-khwarizmi, fibonacci, luong-the-vinh
 * Left wall (6): descartes, fermat, pascal, gauss, sophie-germain, ada-lovelace
 * Right wall (6): newton, leibniz, euler, emmy-noether, maryam-mirzakhani, ngo-bao-chau
 */
export const DEFAULT_CONFIG = Object.freeze({
  centerX: 54, backZ: -48, roomWidth: 34, roomDepth: 40,
  frameWidth: 4.2, frameHeight: 5.2, frameCenterY: 3.72,
  doorWidth: 6.8, doorZ: -8,
  insetX: 3.8, sideStart: 5.8, sideEnd: 32.4,
});

export const WALL_GROUPS = Object.freeze({
  back: ['pythagoras', 'euclid', 'archimedes', 'al-khwarizmi', 'fibonacci', 'luong-the-vinh'],
  left: ['descartes', 'fermat', 'pascal', 'gauss', 'sophie-germain', 'ada-lovelace'],
  right: ['newton', 'leibniz', 'euler', 'emmy-noether', 'maryam-mirzakhani', 'ngo-bao-chau']
});

export const WALL_TITLES = Object.freeze({
  back: 'TƯỜNG CUỐI PHÒNG · HÌNH HỌC CỔ ĐẠI & LỊCH SỬ TOÁN HỌC',
  left: 'TƯỜNG TRÁI · ĐẠI SỐ, XÁC SUẤT & QUY LUẬT THUẬT TOÁN',
  right: 'TƯỜNG PHẢI · GIẢI TÍCH & TOÁN HỌC HIỆN ĐẠI'
});

export function proposedGalleryLayout(config={}, wallGroups=WALL_GROUPS) {
  const c = { ...DEFAULT_CONFIG, ...config };
  if (!Number.isFinite(c.centerX) || !Number.isFinite(c.backZ) || c.roomWidth < 25 || c.roomDepth < 32)
    throw new Error('Kích thước phòng không đủ để dùng bố trí tham khảo: hãy tính lại kích thước khung và số cột.');
  if (c.frameWidth <= 0 || c.frameHeight <= 0 || c.doorWidth <= 0)
    throw new Error('Kích thước không hợp lệ');

  const all = [];
  const spans = {
    back: [-c.roomWidth / 2 + c.insetX, c.roomWidth / 2 - c.insetX],
    left: [c.sideStart, c.sideEnd],
    right: [c.sideStart, c.sideEnd],
  };

  for (const wall of ['back', 'left', 'right']) {
    const ids = wallGroups[wall] || [];
    if (!ids.length) continue;
    const [start, end] = spans[wall];
    const step = ids.length > 1 ? (end - start) / (ids.length - 1) : 0;
    if (ids.length > 1 && step - c.frameWidth < 0.75)
      throw new Error('Khoảng cách giữa khung quá nhỏ ở tường ' + wall);

    ids.forEach((id, i) => {
      const v = ids.length === 1 ? (start + end) / 2 : start + i * step;
      if (wall === 'back')
        all.push({ id, wall, x: c.centerX + v, z: c.backZ + 0.56, y: c.frameCenterY, yaw: 0 });
      if (wall === 'left')
        all.push({ id, wall, x: c.centerX - c.roomWidth / 2 + 0.56, z: c.backZ + v, y: c.frameCenterY, yaw: Math.PI / 2 });
      if (wall === 'right')
        all.push({ id, wall, x: c.centerX + c.roomWidth / 2 - 0.56, z: c.backZ + v, y: c.frameCenterY, yaw: -Math.PI / 2 });
    });
  }

  const ids = all.map(p => p.id);
  if (new Set(ids).size !== ids.length) throw new Error('Trùng ID chân dung');
  const minHallway = c.roomDepth - (c.sideEnd + c.frameWidth / 2);
  if (minHallway < 2) throw new Error('Khung cạnh cửa quá gần lối vào');
  return Object.freeze(all.map(x => Object.freeze({ ...x })));
}

export function validateGalleryLayout(slots, config={}) {
  const c = { ...DEFAULT_CONFIG, ...config };
  const messages = [];
  if (slots.length !== 18) messages.push(`Số chân dung dự kiến 18, thấy ${slots.length}`);
  for (const wall of ['back', 'left', 'right']) {
    const list = slots.filter(s => s.wall === wall);
    if (list.length !== 6) messages.push(`${wall}: cần 6, đang có ${list.length}`);
    const pos = list.map(s => wall === 'back' ? s.x : s.z).sort((a, b) => a - b);
    for (let i = 1; i < pos.length; i++) {
      if (pos[i] - pos[i - 1] < c.frameWidth + 0.75)
        messages.push(`${wall}: các khung có thể quá gần nhau`);
    }
  }
  return { ok: messages.length === 0, messages };
}

