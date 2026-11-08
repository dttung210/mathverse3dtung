import * as THREE from '/vendor/three.module.js';
import {enhanceOriginalAvatar,isChibiPreset} from './cartoon-3d/avatar-adapter.mjs';
import {createMuseumVisuals} from './graphics-r74/museum-visuals.mjs';
import {createModularPostProcessorV12,createProceduralHDRIEnvironment,normalizeAOMode} from './graphics-r74/depth-pipeline-v12.mjs';
// [MATHVERSE EXHIBITION CORE R74] Native museum exhibition, not an installable addon.
import {mountMathematicianFrames} from './exhibition/frames3d.mjs';
import {createExhibitionRedFacade} from './exhibition/facade.mjs';
import {createMathModel,disposeObject} from './geometry.js';
import {GRADES} from './math-core.js';
import {detectModality} from './data/migrate-v2-v4-v5.js';
import {playJumpSound} from './ui/audio.js';
import {resolvePlinthSlide, normalizedMove, catalogRoomSelection, roomCatalogSignature} from './museum/movement-core.js';
import {qualityProfile,tuneAutoRatio} from './museum/quality-controller.js';
import {PORTAL_ZONES,PORTAL_LAYOUT,portalExhibits,zonesForGrade,portalIsAvailable} from './portal-labs/portal-registry.js';
import {createGrade6Gate,createReturnGate} from './museum/grade6-gates-v15.js';
import {makeMath6GalleryPreview} from './museum/math6-preview-v15.js';
import {R6SpatialManager} from './museum/r6-spatial-manager.js';
import {getRoomById,getRoomsForGrade} from './museum/r6-room-layout.js';
import {planRadialChapterGates,planClassroomPortalArc} from './museum/curriculum-chapter-layout.mjs';
import {
  toArabicChapterNum,
  createHighVisibilityChapterSign,
  createNeonWireframeCrest,
  createFloorDecalRunway
} from './museum/chapter-gate-mesh.mjs';

/**
 * BẢO TÀNG TOÁN HỌC 3D & PHÒNG HỌC TOÁN THỰC THẾ CHUYÊN NGHIỆP:
 * 1. GIỮ NGUYÊN HIỆN TRẠNG MÔ HÌNH 3D TRÊN BỤC:
 *    - Toàn bộ 63 mô hình được dựng bằng hình học 3D thật (createMathModel), không dùng bảng đứng trên bục.
 *    - Mô hình 3D tự động xoay nhẹ nhàng trên bục cẩm thạch có đèn viền phát sáng.
 * 2. CẢI THIỆN TOÀN DIỆN KHẢ NĂNG DI CHUYỂN:
 *    - Tốc độ bước đi nhanh hơn (7.2 m/s), chạy nước rút (13.0 m/s).
 *    - Cơ chế trượt mượt mà (sliding collision) khi chạm bục, không bị kẹt hay khựng lại.
 *    - Cổng cửa ra vào rộng rãi, thông suốt giữa sảnh chính và các phòng học.
 *    - Hỗ trợ quay góc nhìn bằng phím Q / E hoặc phím mũi tên.
 * 3. TRANG TRÍ ĐỔI MÀU CÁC LỚP HỌC ĐẶC TRƯNG:
 *    - Lớp 6: Xanh ngọc mint & lục bảo thanh tân.
 *    - Lớp 7: Xanh lam đại dương & da trời thanh lịch.
 *    - Lớp 8: Vàng cam hổ phách & sồi ấm áp.
 *    - Lớp 9: Đỏ san hô & ruby quyết tâm thi vào 10.
 *    - Lớp 10: Tím thạch anh & oải hương học thuật THPT.
 *    - Lớp 11: Xanh ngọc bích rừng thông & hình học không gian.
 *    - Lớp 12: Hoàng kim & vàng đồng sang trọng hướng tới đại học.
 * 4. BẢNG PHÂN BIỆT GIỮA CÁC LỚP:
 *    - Cổng vòm chào đón phát sáng LED, bảng tên lớp trên cao, thảm sàn lối vào.
 * 5. TRANG TRÍ KHÔNG GIAN LỚP HỌC ĐẸP:
 *    - Bảng từ xanh chống lóa lớn (9m) có viết phấn công thức Toán học chuẩn của từng lớp.
 *    - Khẩu hiệu "TIÊN HỌC LỄ · HẬU HỌC VĂN — TOÁN HỌC MỞ RA VŨ TRỤ".
 *    - Bục giảng & bàn giáo viên có máy tính laptop, sách giáo trình, lọ hoa.
 *    - Cửa sổ lớn đón ánh sáng tự nhiên và tranh chân dung các nhà toán học vĩ đại.
 */

export const ROOMS = {
  6: {
    x: -54, zSide: 1, name: 'LỚP 6',
    title: 'TOÁN LỚP 6 · HÌNH HỌC TRỰC QUAN & ĐA GIÁC ĐỀU',
    sub: 'Hình học phẳng, đa giác đều, đối xứng và chu vi diện tích',
    accent: 0x0d9488,
    accentHex: '#14b8a6',
    floorColor: 0xcbd5e1,
    wainscotColor: 0x0f766e,
    wallColor: 0xf8fafc,
    chalkboardFormula: 'LỚP 6: TAM GIÁC ĐỀU - HÌNH VUÔNG - HÌNH LỤC GIÁC ĐỀU\n• Chu vi hình chữ nhật: C = 2(a + b)\n• Diện tích hình vuông: S = a²\n• Diện tích hình thang: S = ((a + b) × h) / 2\n• Chu vi tam giác đều: C = 3a  ·  Diện tích: S = (a²√3)/4'
  },
  7: {
    x: -54, zSide: -1, name: 'LỚP 7',
    title: 'TOÁN LỚP 7 · TAM GIÁC, LĂNG TRỤ & HÌNH KHỐI',
    sub: 'Tổng các góc tam giác, các trường hợp bằng nhau, lăng trụ đứng',
    accent: 0x2563eb,
    accentHex: '#3b82f6',
    floorColor: 0xcbd5e1,
    wainscotColor: 0x1e40af,
    wallColor: 0xf8fafc,
    chalkboardFormula: 'LỚP 7: ĐỊNH LÝ TỔNG 3 GÓC TRONG TAM GIÁC = 180°\n• Hai góc kề bù: ∠A + ∠B = 180°  ·  Hai góc đối đỉnh: ∠1 = ∠2\n• Tam giác bằng nhau: (c-c-c), (c-g-c), (g-c-g)\n• Thể tích lăng trụ đứng tam giác: V = S_đáy × h\n• Diện tích xung quanh: S_xq = C_đáy × h'
  },
  8: {
    x: -18, zSide: 1, name: 'LỚP 8',
    title: 'TOÁN LỚP 8 · HÌNH CHÓP ĐỀU & ĐỊNH LÝ PYTHAGORE',
    sub: 'Hình chóp tam giác/tứ giác đều, định lý Thalès, tứ giác đặc biệt',
    accent: 0xd97706,
    accentHex: '#f59e0b',
    floorColor: 0xd6d3d1,
    wainscotColor: 0xb45309,
    wallColor: 0xf8fafc,
    chalkboardFormula: 'LỚP 8: HÌNH CHÓP ĐỀU & ĐỊNH LÝ THALÈS - PYTHAGORE\n• Thể tích hình chóp tứ giác đều: V = (1/3) × S_đáy × h = (1/3) × a² × h\n• Diện tích xung quanh chóp: S_xq = 4 × ((1/2) × a × d)\n• Định lý Pythagore: a² + b² = c² (trong tam giác vuông ABC)\n• Định lý Thalès: MN // BC  =>  AM/AB = AN/AC = MN/BC'
  },
  9: {
    x: -18, zSide: -1, name: 'LỚP 9',
    title: 'TOÁN LỚP 9 · HÌNH TRỤ - HÌNH NÓN - HÌNH CẦU',
    sub: 'Hình tròn, góc nội tiếp, tiếp tuyến, các khối tròn xoay',
    accent: 0xe11d48,
    accentHex: '#f43f5e',
    floorColor: 0xcbd5e1,
    wainscotColor: 0x9f1239,
    wallColor: 0xf8fafc,
    chalkboardFormula: 'LỚP 9: CÁC KHỐI TRÒN XOAY & HỆ THỨC LƯỢNG ĐƯỜNG TRÒN\n• Hình trụ: V = πr²h,  S_xq = 2πrh\n• Hình nón: V = (1/3)πr²h,  S_xq = πrl  (l² = h² + r²)\n• Hình cầu: V = (4/3)πR³,  S = 4πR²\n• Góc nội tiếp: α = (1/2) sđ cung bị chắn  ·  Góc chắn nửa đường tròn = 90°'
  },
  10: {
    x: 18, zSide: 1, name: 'LỚP 10',
    title: 'TOÁN LỚP 10 · VECTƠ, HỆ TỌA ĐỘ & BA ĐƯỜNG CONIC',
    sub: 'Vectơ Oxy, elip, hypebol, parabol, hệ thức lượng tam giác',
    accent: 0x7c3aed,
    accentHex: '#8b5cf6',
    floorColor: 0xcbd5e1,
    wainscotColor: 0x5b21b6,
    wallColor: 0xf8fafc,
    chalkboardFormula: 'LỚP 10: HÌNH HỌC TỌA ĐỘ OXY & BA ĐƯỜNG CONIC\n• Tích vô hướng: u · v = |u|·|v|·cos(u, v) = u_x·v_x + u_y·v_y\n• Định lý Côsin: a² = b² + c² - 2bc·cos A  ·  Định lý Sin: a/sinA = 2R\n• Phương trình Elip: x²/a² + y²/b² = 1  (c² = a² - b²)\n• Parabol: y² = 2px, đỉnh O(0,0), tiêu điểm F(p/2, 0)'
  },
  11: {
    x: 18, zSide: -1, name: 'LỚP 11',
    title: 'TOÁN LỚP 11 · HÌNH HỌC KHÔNG GIAN & LƯỢNG GIÁC',
    sub: 'Quan hệ song song, quan hệ vuông góc trong không gian, khoảng cách',
    accent: 0x059669,
    accentHex: '#10b981',
    floorColor: 0xcbd5e1,
    wainscotColor: 0x065f46,
    wallColor: 0xf8fafc,
    chalkboardFormula: 'LỚP 11: HÌNH HỌC KHÔNG GIAN THPT & KHOẢNG CÁCH\n• Đường thẳng vuông góc mặt phẳng: d ⊥ a, d ⊥ b (a cắt b trong (P))\n• Góc giữa đường thẳng và mặt phẳng: φ = (d, d\') với d\' là hình chiếu của d\n• Khoảng cách từ điểm M đến mặt phẳng (P): d(M, (P)) = MH ⊥ (P)\n• Lượng giác: sin²x + cos²x = 1,  tan x = sin x / cos x'
  },
  12: {
    x: 54, zSide: 1, name: 'LỚP 12',
    title: 'TOÁN LỚP 12 · TÍCH PHÂN & TỌA ĐỘ KHÔNG GIAN OXYZ',
    sub: 'Hình học giải tích Oxyz, mặt cầu, mặt phẳng, tích phân và ứng dụng',
    accent: 0xd97706,
    accentHex: '#f59e0b',
    floorColor: 0xcbd5e1,
    wainscotColor: 0x1e3a8a,
    wallColor: 0xf8fafc,
    chalkboardFormula: 'LỚP 12: HÌNH GIẢI TÍCH OXYZ & ỨNG DỤNG TÍCH PHÂN\n• Mặt phẳng (P): A(x - x₀) + B(y - y₀) + C(z - z₀) = 0  => n = (A, B, C)\n• Mặt cầu (S): (x - a)² + (y - b)² + (z - c)² = R²\n• Thể tích khối tròn xoay quanh trục Ox: V = π ∫_a^b [f(x)]² dx\n• Khoảng cách M(x₀,y₀,z₀) đến (P): d = |Ax₀ + By₀ + Cz₀ + D| / √(A² + B² + C²)'
  }
};

// 9 Bục trưng bày cách nhau 10m (3x3 grid)
const SLOTS_POS = [
  [-10, 18], [0, 18], [10, 18],
  [-10, 28], [0, 28], [10, 28],
  [-10, 38], [0, 38], [10, 38]
];
const SLOTS_NEG = [
  [-10, -18], [0, -18], [10, -18],
  [-10, -28], [0, -28], [10, -28],
  [-10, -38], [0, -38], [10, -38]
];

/**
 * R8 UI – crisp 3D label cards.
 * The canvas now has the SAME aspect ratio as the sprite (old 800x160 canvas
 * was stretched horizontally up to 2x, blurring every model name). Text is
 * measured and shrunk to fit, may wrap to two lines ({wrap:true}), and is
 * drawn with a dark outline so it stays readable over bright models.
 */
const R8_LABEL_FONT = '"Be Vietnam Pro", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
function r8SplitTwoLines(ctx, txt, maxW) {
  const words = txt.split(/\s+/);
  if (words.length < 2) return [txt];
  let best = [txt], bestW = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
    const w = Math.max(ctx.measureText(a).width, ctx.measureText(b).width);
    if (w < bestW) { bestW = w; best = [a, b]; }
  }
  return bestW < ctx.measureText(txt).width ? best : [txt];
}
function labelSprite(text, accent='#f8f8f8', width=3.8, height=0.74, bg='rgba(10, 20, 34, 0.95)', opts={}) {
  const aspect = Math.max(1, width / Math.max(.05, height));
  let H = Math.round(THREE.MathUtils.clamp(height * 190, 96, 288));
  let W = Math.round(H * aspect);
  if (W > 1280) { W = 1280; H = Math.max(64, Math.round(W / aspect)); }
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  // R9 UI: 'light' = high-contrast bubble (ivory card, navy text, accent ring,
  // optional tail pointing at the pedestal); 'circle' = round number badge.
  const light = opts.theme === 'light', circle = !!opts.circle;
  const tailH = light && opts.tail ? H * .16 : 0;
  const pad = Math.max(3, H * .05);
  const boxH = H - pad * 2 - tailH;
  const r = circle ? boxH / 2 : Math.min(H * .28, 34);
  const shape = () => {
    ctx.beginPath();
    if (circle) ctx.arc(W / 2, pad + boxH / 2, Math.min(W / 2 - pad, boxH / 2), 0, Math.PI * 2);
    else ctx.roundRect(pad, pad, W - pad * 2, boxH, r);
    if (tailH) { ctx.moveTo(W / 2 - tailH * .9, pad + boxH - 1); ctx.lineTo(W / 2, H - pad); ctx.lineTo(W / 2 + tailH * .9, pad + boxH - 1); ctx.closePath(); }
  };
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  if (light) { grad.addColorStop(0, '#fffdf6'); grad.addColorStop(1, '#e9eef0'); }
  else if (circle) { grad.addColorStop(0, accent); grad.addColorStop(1, '#0b2233'); }
  else { grad.addColorStop(0, bg); grad.addColorStop(1, 'rgba(4, 12, 22, 0.97)'); }
  ctx.fillStyle = grad;
  shape(); ctx.fill();
  if (!circle) {
    ctx.save(); ctx.beginPath(); ctx.roundRect(pad, pad, W - pad * 2, boxH, r); ctx.clip();
    ctx.fillStyle = accent; ctx.globalAlpha = light ? 1 : .9;
    ctx.fillRect(pad, pad, Math.max(6, H * .07), boxH); // accent spine
    if (!light) { ctx.globalAlpha = .10; ctx.fillStyle = '#ffffff'; ctx.fillRect(pad, pad, W - pad * 2, boxH * .42); }
    ctx.restore();
  }
  ctx.strokeStyle = circle ? '#fffdf6' : accent; ctx.lineWidth = Math.max(2.5, H * (light ? .035 : .04));
  shape(); ctx.stroke();
  const txt = String(text ?? '').trim();
  const maxW = circle ? W * .7 : W - pad * 2 - H * .42;
  let size = (circle ? boxH * .58 : boxH * .52), lines = [txt];
  ctx.font = `800 ${size}px ${R8_LABEL_FONT}`;
  if (opts.wrap && ctx.measureText(txt).width > maxW) {
    size = boxH * .37; ctx.font = `700 ${size}px ${R8_LABEL_FONT}`;
    lines = r8SplitTwoLines(ctx, txt, maxW);
  }
  const widest = () => Math.max(...lines.map(l => ctx.measureText(l).width));
  while (size > H * .18 && widest() > maxW) { size *= .94; ctx.font = `700 ${size}px ${R8_LABEL_FONT}`; }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2, size * (light ? .08 : .16));
  ctx.strokeStyle = light ? 'rgba(255, 255, 255, 0.9)' : 'rgba(2, 8, 16, 0.85)';
  ctx.fillStyle = opts.color || (light ? '#0b1d2c' : '#fbfaf4');
  const lh = size * 1.12, y0 = pad + boxH / 2 - (lines.length - 1) * lh / 2 + size * .04;
  const cx = circle ? W / 2 : W / 2 + H * .06;
  lines.forEach((l, i) => { ctx.strokeText(l, cx, y0 + i * lh); ctx.fillText(l, cx, y0 + i * lh); });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, fog: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(width, height, 1);
  sprite.renderOrder = 8;
  sprite.userData.r8Label = true;
  sprite.userData.r8BaseScale = [width, height];
  return sprite;
}

function material(color, metalness = 0.04, roughness = 0.70) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function cube(group, w, h, d, x, y, z, color, metalness = 0, roughness = 0.7) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness, metalness }));
  m.position.set(x, y, z);
  m.receiveShadow = true;
  m.castShadow = h > 0.6;
  group.add(m);
  return m;
}

/** Tự động ngắt dòng văn bản tiếng Việt trên Canvas 2D */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text || '').split(' ');
  let line = '';
  let curY = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, curY);
}

/** Tạo Bong bóng thoại Hologram nổi trên đầu NPC Hướng Dẫn Viên */
function createSpeechBubble(text, title = 'HƯỚNG DẪN VIÊN', accentHex = '#38bdf8') {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');

  // Nền kính Nano-Glassmorphism
  ctx.fillStyle = 'rgba(10, 22, 38, 0.95)';
  ctx.beginPath();
  ctx.roundRect(10, 10, 620, 185, 20);
  ctx.fill();

  // Viền phát sáng theo màu lớp
  ctx.strokeStyle = accentHex || '#38bdf8';
  ctx.lineWidth = 4.5;
  ctx.stroke();

  // Đuôi bong bóng thoại trỏ xuống đầu NPC
  ctx.fillStyle = 'rgba(10, 22, 38, 0.95)';
  ctx.beginPath();
  ctx.moveTo(300, 195);
  ctx.lineTo(340, 195);
  ctx.lineTo(320, 228);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = accentHex || '#38bdf8';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Tiêu đề
  ctx.fillStyle = accentHex || '#38bdf8';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText(`✦ ${String(title).toUpperCase()}`, 30, 46);

  // Nội dung lời chào
  ctx.fillStyle = '#f8fafc';
  ctx.font = '500 20px system-ui, sans-serif';
  wrapText(ctx, text, 30, 84, 575, 28);

  // Gợi ý phím bấm
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 17px monospace, system-ui';
  ctx.fillText('⚡ [Nhấn E hoặc Click để trò chuyện]', 30, 175);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(4.2, 1.58, 1);
  return sprite;
}

/** Tạo Bảng Hologram Tương Tác Trạm Thông Minh nổi trên đầu bục mô hình */
function createHologramBillboard(item, accentHex = '#38bdf8') {
  const canvas = document.createElement('canvas');
  canvas.width = 620;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');

  // Nền kính Hologram tương lai
  ctx.fillStyle = 'rgba(8, 20, 36, 0.94)';
  ctx.beginPath();
  ctx.roundRect(8, 8, 604, 224, 22);
  ctx.fill();

  // Viền neon phát sáng
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 4.5;
  ctx.stroke();

  // Huy hiệu phân loại
  const tag = item.type === 'solid' ? '3D SOLID GEOMETRY' : item.type === 'plane' ? '2D PLANE GEOMETRY' : item.type === 'graph' ? 'FUNCTION GRAPH' : 'MATH MODEL';
  ctx.fillStyle = accentHex;
  ctx.font = 'bold 18px monospace, system-ui';
  ctx.fillText(`⬡ [${tag}] · LỚP ${item.grade || ''}`, 26, 42);

  // Tên mô hình
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px system-ui, sans-serif';
  const title = item.title || 'Mô hình toán học';
  ctx.fillText(title.length > 28 ? title.slice(0, 27) + '...' : title, 26, 84);

  // Mô tả ngắn / công thức
  ctx.fillStyle = '#94a3b8';
  ctx.font = '19px system-ui, sans-serif';
  const info = item.topic || item.chapter || item.formula || 'Khám phá hình khối trực quan 3D';
  ctx.fillText(info.length > 40 ? info.slice(0, 39) + '...' : info, 26, 122);

  // Nút kêu gọi hành động
  ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
  ctx.beginPath();
  ctx.roundRect(26, 146, 568, 62, 12);
  ctx.fill();
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚡ Nhấn [E] hoặc Click để mở Thí Nghiệm', 310, 184);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(4.0, 1.55, 1);
  return sprite;
}

/** Bộ tạo 4 nhân vật 3D avatar Mathverse (Alex, Triết, An, Bot Pi) */
function createAvatar(initialType = 'alex') {
  const root = new THREE.Group();

  // Bóng tiếp đất mềm + vòng định vị phát sáng nhẹ dưới chân
  const shadowGeo = new THREE.CircleGeometry(0.48, 28);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x050d16, transparent: true, opacity: 0.42 });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  const auraGeo = new THREE.RingGeometry(0.42, 0.50, 32);
  const auraMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28, side: THREE.DoubleSide });
  const auraRing = new THREE.Mesh(auraGeo, auraMat);
  auraRing.rotation.x = -Math.PI / 2;
  auraRing.position.y = 0.025;
  root.add(auraRing);

  const body = new THREE.Group();
  root.add(body);

  let currentType = initialType;
  let animControls = {
    legL: null, legR: null, armL: null, armR: null,
    headGroup: null, torsoGroup: null,
    droneRing: null, droneInnerRing: null, droneThruster: null, droneGroup: null,
    isDrone: false
  };

  function addFaceDetails(headGroup, skinY = 0, eyeColor = 0x0f172a) {
    // Tỷ lệ đầu Chibi 3D Cartoon tròn bầu bĩnh dễ thương
    headGroup.scale.setScalar(1.22);
    const sclMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const irisMat = new THREE.MeshBasicMaterial({ color: eyeColor });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (const side of [-1, 1]) {
      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.044, 14, 14), sclMat);
      sclera.scale.set(1.06, 1.24, 0.55);
      sclera.position.set(side * 0.082, skinY + 0.012, 0.202);
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), irisMat);
      iris.scale.set(1.02, 1.18, 0.52);
      iris.position.set(side * 0.082, skinY + 0.010, 0.218);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.019, 10, 10), pupilMat);
      pupil.scale.set(1.0, 1.12, 0.5);
      pupil.position.set(side * 0.082, skinY + 0.008, 0.228);
      const spark1 = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), sparkMat);
      spark1.position.set(side * 0.082 + 0.012, skinY + 0.025, 0.236);
      const spark2 = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 8), sparkMat);
      spark2.position.set(side * 0.082 - 0.010, skinY - 0.005, 0.235);
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.013, 0.014), material(0x292524));
      brow.position.set(side * 0.082, skinY + 0.074, 0.21);
      brow.rotation.z = side * -0.08;
      const cheek = new THREE.Mesh(new THREE.CircleGeometry(0.036, 14), new THREE.MeshBasicMaterial({ color: 0xfb7185, transparent: true, opacity: 0.48 }));
      cheek.position.set(side * 0.125, skinY - 0.034, 0.208);
      cheek.rotation.y = side * 0.38;
      headGroup.add(sclera, iris, pupil, spark1, spark2, brow, cheek);
    }
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 10), material(0xf2b591, 0.02, 0.6));
    nose.position.set(0, skinY - 0.012, 0.232);
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.007, 8, 16, Math.PI), material(0xbe123c));
    smile.position.set(0, skinY - 0.046, 0.214);
    smile.rotation.x = Math.PI + 0.15;
    headGroup.add(nose, smile);
  }

  function buildAvatar(type) {
    while (body.children.length > 0) {
      body.remove(body.children[0]);
    }
    currentType = type;
    animControls = {
      legL: null, legR: null, armL: null, armR: null,
      headGroup: null, torsoGroup: null,
      droneRing: null, droneInnerRing: null, droneThruster: null, droneGroup: null,
      isDrone: false
    };

    if (type === 'bot') {
      // 1. ROBOT DRONE BOT PI (Sci-Fi Geometric Assistant)
      animControls.isDrone = true;
      const droneGroup = new THREE.Group();
      droneGroup.position.y = 1.35;
      body.add(droneGroup);

      // Thân icosahedron kim loại bóng
      const coreGeo = new THREE.IcosahedronGeometry(0.36, 2);
      const coreMat = new THREE.MeshStandardMaterial({ color: 0x0f273d, metalness: 0.85, roughness: 0.18 });
      const core = new THREE.Mesh(coreGeo, coreMat);
      droneGroup.add(core);

      // Mắt Visor LED phát sáng cyan + 2 mắt cảm biến
      const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.13, 20), new THREE.MeshBasicMaterial({ color: 0x082f49 }));
      visor.rotation.x = Math.PI / 2;
      visor.position.set(0, 0.05, 0.27);
      droneGroup.add(visor);
      for (const s of [-1, 1]) {
        const eyeLed = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 12), new THREE.MeshBasicMaterial({ color: 0x00f2fe }));
        eyeLed.scale.set(1.2, 0.75, 0.5);
        eyeLed.position.set(s * 0.068, 0.05, 0.335);
        droneGroup.add(eyeLed);
      }

      // Vòng hào quang đa giác xoay quanh (Orbital Rings)
      const ringGeo = new THREE.TorusGeometry(0.58, 0.024, 12, 32);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.12 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 3;
      droneGroup.add(ring);
      animControls.droneRing = ring;

      const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.015, 10, 28), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      innerRing.rotation.y = Math.PI / 4;
      droneGroup.add(innerRing);
      animControls.droneInnerRing = innerRing;

      // Phản lực phát sáng bên dưới
      const thruster = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.30, 16), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 }));
      thruster.rotation.x = Math.PI;
      thruster.position.y = -0.42;
      droneGroup.add(thruster);
      animControls.droneThruster = thruster;
      animControls.droneGroup = droneGroup;

    } else if (type === 'triet') {
      // 2. MINH TRIẾT (Học sinh nam năng động, áo hoodie cyan/navy, tai nghe)
      const torsoGroup = new THREE.Group();
      torsoGroup.position.y = 1.18;
      body.add(torsoGroup);
      animControls.torsoGroup = torsoGroup;

      const hoodie = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.58, 0.30), material(0x0284c7, 0.05, 0.45));
      hoodie.castShadow = true;
      torsoGroup.add(hoodie);

      // Mũ áo sau lưng & túi kangaroo trước bụng
      const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, 0.04), material(0x0369a1, 0.05, 0.5));
      pocket.position.set(0, -0.14, 0.155);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.49, 0.06, 0.31), material(0xf8fafc, 0.05, 0.4));
      stripe.position.set(0, 0.02, 0);
      const badge = new THREE.Mesh(new THREE.CircleGeometry(0.058, 16), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      badge.position.set(0.13, 0.12, 0.16);
      torsoGroup.add(pocket, stripe, badge);

      // Đầu
      const headGroup = new THREE.Group();
      headGroup.position.y = 1.64;
      body.add(headGroup);
      animControls.headGroup = headGroup;

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.23, 24, 24), material(0xf8d4b4, 0.02, 0.65));
      headGroup.add(head);
      addFaceDetails(headGroup, 0, 0x0f172a);

      // Tóc nam nhiều lớp tự nhiên
      const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.242, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.58), material(0x1c1917, 0.05, 0.85));
      hairTop.position.set(0, 0.02, -0.01);
      hairTop.rotation.x = -0.12;
      const hairFringe = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.09, 0.14), material(0x1c1917, 0.05, 0.85));
      hairFringe.position.set(0, 0.15, 0.16);
      hairFringe.rotation.x = 0.22;
      headGroup.add(hairTop, hairFringe);

      // Tai nghe Headphone công nghệ quanh cổ
      const phoneL = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.08, 16), material(0x38bdf8, 0.6, 0.25));
      phoneL.position.set(-0.24, 0.31, 0.04);
      phoneL.rotation.z = Math.PI / 2;
      const phoneR = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.08, 16), material(0x38bdf8, 0.6, 0.25));
      phoneR.position.set(0.24, 0.31, 0.04);
      phoneR.rotation.z = Math.PI / 2;
      const phoneBand = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.022, 10, 20, Math.PI), material(0x334155));
      phoneBand.position.set(0, 0.31, 0);
      phoneBand.rotation.x = Math.PI / 2;
      torsoGroup.add(phoneL, phoneR, phoneBand);

      // Cánh tay + bàn tay
      const armL = new THREE.Group();
      armL.position.set(-0.32, 1.40, 0);
      const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 12), material(0x0284c7));
      const armLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.46, 14), material(0x0284c7));
      armLMesh.position.y = -0.22;
      const handL = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), material(0xf8d4b4));
      handL.position.y = -0.47;
      armL.add(shoulderL, armLMesh, handL);
      body.add(armL);
      animControls.armL = armL;

      const armR = new THREE.Group();
      armR.position.set(0.32, 1.40, 0);
      const shoulderR = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 12), material(0x0284c7));
      const armRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.46, 14), material(0x0284c7));
      armRMesh.position.y = -0.22;
      const handR = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), material(0xf8d4b4));
      handR.position.y = -0.47;
      const watch = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.055, 0.065), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      watch.position.set(0, -0.39, 0.045);
      armR.add(shoulderR, armRMesh, handR, watch);
      body.add(armR);
      animControls.armR = armR;

      // Chân + giày sneaker thể thao
      for (const [side, key] of [[-1, 'legL'], [1, 'legR']]) {
        const leg = new THREE.Group();
        leg.position.set(side * 0.135, 0.88, 0);
        const legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.068, 0.78, 14), material(0x1e293b));
        legMesh.position.y = -0.39;
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.085, 0.23), material(0xf8fafc));
        shoe.position.set(0, -0.80, 0.045);
        const sole = new THREE.Mesh(new THREE.BoxGeometry(0.142, 0.028, 0.24), material(0x0284c7));
        sole.position.set(0, -0.845, 0.045);
        leg.add(legMesh, shoe, sole);
        body.add(leg);
        animControls[key] = leg;
      }

    } else if (type === 'an') {
      // 3. TUỆ AN (Học sinh nữ thông thái, áo len gile, nơ ruby, ba lô hình học)
      const torsoGroup = new THREE.Group();
      torsoGroup.position.y = 1.18;
      body.add(torsoGroup);
      animControls.torsoGroup = torsoGroup;

      const vest = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.56, 0.28), material(0xbe123c, 0.05, 0.55));
      const collar = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.04), material(0xffffff));
      collar.position.set(0, 0.21, 0.135);
      const bow = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.075, 0.045), material(0xf43f5e));
      bow.position.set(0, 0.20, 0.155);
      const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.38, 0.16), material(0x1e293b));
      backpack.position.set(0, 0.02, -0.21);
      const crystal = new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 0), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
      crystal.position.set(0, 0.02, -0.31);
      torsoGroup.add(vest, collar, bow, backpack, crystal);

      const headGroup = new THREE.Group();
      headGroup.position.y = 1.63;
      body.add(headGroup);
      animControls.headGroup = headGroup;

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), material(0xf8d4b4, 0.02, 0.65));
      headGroup.add(head);
      addFaceDetails(headGroup, 0, 0x1e1b4b);

      const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.234, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62), material(0x3b1704, 0.05, 0.8));
      hairCap.rotation.x = -0.18;
      const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.30, 0.24), material(0x3b1704, 0.05, 0.8));
      hairBack.position.set(0, -0.02, -0.09);
      const hairBun = new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 16), material(0x3b1704));
      hairBun.position.set(0, 0.21, -0.16);
      const bowHair = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.065, 0.06), material(0xf43f5e));
      bowHair.position.set(0, 0.24, -0.09);
      headGroup.add(hairCap, hairBack, hairBun, bowHair);

      const armL = new THREE.Group();
      armL.position.set(-0.30, 1.38, 0);
      const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.064, 12, 12), material(0xffffff));
      const armLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.048, 0.45, 14), material(0xffffff));
      armLMesh.position.y = -0.21;
      const handL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), material(0xf8d4b4));
      handL.position.y = -0.45;
      armL.add(shoulderL, armLMesh, handL);
      body.add(armL);
      animControls.armL = armL;

      const armR = new THREE.Group();
      armR.position.set(0.30, 1.38, 0);
      const shoulderR = new THREE.Mesh(new THREE.SphereGeometry(0.064, 12, 12), material(0xffffff));
      const armRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.048, 0.45, 14), material(0xffffff));
      armRMesh.position.y = -0.21;
      const handR = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), material(0xf8d4b4));
      handR.position.y = -0.45;
      const tablet = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.024), material(0x0284c7));
      tablet.position.set(0.02, -0.39, 0.11);
      tablet.rotation.x = 0.3;
      armR.add(shoulderR, armRMesh, handR, tablet);
      body.add(armR);
      animControls.armR = armR;

      const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.34, 0.32, 20), material(0x334155));
      skirt.position.y = 0.86;
      body.add(skirt);

      for (const [side, key] of [[-1, 'legL'], [1, 'legR']]) {
        const leg = new THREE.Group();
        leg.position.set(side * 0.12, 0.72, 0);
        const legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.052, 0.68, 14), material(0xf8d4b4));
        legMesh.position.y = -0.34;
        const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.055, 0.22, 12), material(0xffffff));
        sock.position.y = -0.56;
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.075, 0.19), material(0x881337));
        shoe.position.set(0, -0.71, 0.04);
        leg.add(legMesh, sock, shoe);
        body.add(leg);
        animControls[key] = leg;
      }

    } else if (type === 'suhocba') {
      // 4. SƯ HỌC BÁ (Sư Chùa Đầu Trọc Chibi 3D — Tiểu Hòa Thượng Đầu Trọc, 6 Chấm Giới Hương, Áo Cà Sa, Tràng Hạt)
      currentType = 'suhocba';
      const torsoGroup = new THREE.Group();
      torsoGroup.position.y = 1.15;
      body.add(torsoGroup);
      animControls.torsoGroup = torsoGroup;

      const saffronMat = material(0xf59e0b, 0.06, 0.42);
      const kasayaMat = material(0xd9480f, 0.08, 0.38);
      const goldMat = material(0xfbbf24, 0.72, 0.25);
      const woodBeadMat = material(0x5c2d16, 0.12, 0.35);

      const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.35, 0.58, 24), saffronMat);
      robe.castShadow = true;
      torsoGroup.add(robe);

      // Y cà sa đỏ cam vắt chéo qua vai trái
      const sash = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.055, 12, 26), kasayaMat);
      sash.rotation.set(0.45, 0.22, 0.68);
      sash.position.set(0.01, 0.05, 0.03);
      torsoGroup.add(sash);

      const belt = new THREE.Mesh(new THREE.TorusGeometry(0.285, 0.028, 10, 24), goldMat);
      belt.rotation.x = Math.PI / 2;
      belt.position.y = -0.06;
      torsoGroup.add(belt);

      // Chuỗi tràng hạt Bồ Đề 14 hạt đeo quanh cổ
      for (let i = 0; i < 14; i++) {
        const ang = (i / 14) * Math.PI * 2;
        const bead = new THREE.Mesh(
          new THREE.SphereGeometry(i === 0 ? 0.044 : 0.032, 10, 8),
          i === 0 ? goldMat : woodBeadMat
        );
        bead.position.set(Math.sin(ang) * 0.20, 0.24 - Math.cos(ang) * 0.04, Math.cos(ang) * 0.20 + 0.04);
        torsoGroup.add(bead);
      }

      // Đầu trọc Sư Chùa Chibi tròn nhẵn bóng (không tóc, không mũ)
      const headGroup = new THREE.Group();
      headGroup.position.y = 1.64;
      body.add(headGroup);
      animControls.headGroup = headGroup;

      const monkSkin = material(0xffe2ca, 0.04, 0.28);
      const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.245, 28, 24), monkSkin);
      headMesh.castShadow = true;
      headGroup.add(headMesh);
      addFaceDetails(headGroup, 0, 0x451a03);

      // Đốm sáng bóng trên đỉnh đầu trọc
      const baldShine = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 12, 10),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.36 })
      );
      baldShine.scale.set(1.3, 0.35, 0.85);
      baldShine.position.set(-0.07, 0.21, 0.10);
      baldShine.rotation.z = 0.35;
      headGroup.add(baldShine);

      // Đôi tai to phúc hậu có dái tai dài của Sư Chùa Chibi
      for (const s of [-1, 1]) {
        const bigEar = new THREE.Mesh(new THREE.SphereGeometry(0.062, 14, 12), monkSkin);
        bigEar.scale.set(0.58, 1.25, 0.78);
        bigEar.position.set(s * 0.248, -0.01, 0.01);
        const earlobe = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 10), monkSkin);
        earlobe.scale.set(0.75, 1.15, 0.82);
        earlobe.position.set(s * 0.245, -0.082, 0.02);
        headGroup.add(bigEar, earlobe);
      }

      // 6 Chấm Giới Hương trên trán đầu trọc
      for (const row of [0.115, 0.15, 0.185]) {
        for (const s of [-1, 1]) {
          const dot = new THREE.Mesh(new THREE.SphereGeometry(0.010, 8, 8), material(0xb45309));
          dot.position.set(s * 0.036, row, Math.sqrt(Math.max(0.01, 0.246 * 0.246 - row * row)));
          headGroup.add(dot);
        }
      }

      // Nốt chu sa đỏ giữa trán
      const urna = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), material(0xe11d48));
      urna.position.set(0, 0.068, 0.242);
      headGroup.add(urna);

      const armL = new THREE.Group();
      armL.position.set(-0.31, 1.38, 0);
      const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 12), kasayaMat);
      const armLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.056, 0.44, 14), kasayaMat);
      armLMesh.position.y = -0.20;
      const handL = new THREE.Mesh(new THREE.SphereGeometry(0.056, 12, 12), monkSkin);
      handL.position.y = -0.44;
      const almsBowl = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 12, 0, Math.PI * 2, Math.PI * 0.22, Math.PI * 0.78), goldMat);
      almsBowl.position.set(0.02, -0.43, 0.10);
      armL.add(shoulderL, armLMesh, handL, almsBowl);
      body.add(armL);
      animControls.armL = armL;

      const armR = new THREE.Group();
      armR.position.set(0.31, 1.38, 0);
      const shoulderR = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 12), saffronMat);
      const armRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.056, 0.44, 14), saffronMat);
      armRMesh.position.y = -0.20;
      const handR = new THREE.Mesh(new THREE.SphereGeometry(0.056, 12, 12), monkSkin);
      handR.position.y = -0.44;
      const staffShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.68, 10), woodBeadMat);
      staffShaft.position.set(0, -0.32, 0.12);
      const staffRing = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.014, 10, 20), goldMat);
      staffRing.position.set(0, 0.06, 0.12);
      armR.add(shoulderR, armRMesh, handR, staffShaft, staffRing);
      body.add(armR);
      animControls.armR = armR;

      for (const [side, key] of [[-1, 'legL'], [1, 'legR']]) {
        const leg = new THREE.Group();
        leg.position.set(side * 0.13, 0.86, 0);
        const legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.068, 0.74, 14), material(0x78350f));
        legMesh.position.y = -0.37;
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.082, 0.22), material(0x57534e));
        shoe.position.set(0, -0.78, 0.04);
        const sole = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.025, 0.23), material(0xfef3c7));
        sole.position.set(0, -0.82, 0.04);
        leg.add(legMesh, shoe, sole);
        body.add(leg);
        animControls[key] = leg;
      }

    } else {
      // 5. MENTOR ALEX (Thầy/Cô Alex - Mặc định)
      currentType = 'alex';
      const torsoGroup = new THREE.Group();
      torsoGroup.position.y = 1.18;
      body.add(torsoGroup);
      animControls.torsoGroup = torsoGroup;

      const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.49, 0.60, 0.31), material(0x1e3f56, 0.08, 0.55));
      torsoMesh.castShadow = true;
      const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.26, 0.04), material(0xfaf8f2));
      shirt.position.set(0, 0.16, 0.145);
      const tie = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.28, 0.05), material(0xe57053));
      tie.position.set(0, 0.08, 0.156);
      const lapelL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.28, 0.042), material(0x152c3d));
      lapelL.position.set(-0.09, 0.13, 0.148);
      lapelL.rotation.z = 0.18;
      const lapelR = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.28, 0.042), material(0x152c3d));
      lapelR.position.set(0.09, 0.13, 0.148);
      lapelR.rotation.z = -0.18;
      const pin = new THREE.Mesh(new THREE.CircleGeometry(0.032, 12), new THREE.MeshBasicMaterial({ color: 0xf6c547 }));
      pin.position.set(-0.14, 0.16, 0.162);
      torsoGroup.add(torsoMesh, shirt, tie, lapelL, lapelR, pin);

      const headGroup = new THREE.Group();
      headGroup.position.y = 1.65;
      body.add(headGroup);
      animControls.headGroup = headGroup;

      const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.235, 24, 24), material(0xf8d4b4, 0.02, 0.65));
      headMesh.castShadow = true;
      headGroup.add(headMesh);
      addFaceDetails(headGroup, 0, 0x0f172a);

      const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), material(0x27272a, 0.05, 0.85));
      hairBack.rotation.x = -0.25;
      headGroup.add(hairBack);

      const capPlate = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.036, 0.48), material(0x172e3d));
      capPlate.position.y = 0.22;
      capPlate.rotation.y = Math.PI / 4;
      const capBase = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.185, 0.11, 20), material(0x172e3d));
      capBase.position.y = 0.15;
      const tassel = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), material(0xf6c547));
      tassel.position.set(0.19, 0.17, 0.19);
      headGroup.add(capPlate, capBase, tassel);

      const glassesL = new THREE.Mesh(new THREE.TorusGeometry(0.054, 0.011, 10, 20), material(0xd97706, 0.6, 0.3));
      glassesL.position.set(-0.082, 0.015, 0.218);
      const glassesR = new THREE.Mesh(new THREE.TorusGeometry(0.054, 0.011, 10, 20), material(0xd97706, 0.6, 0.3));
      glassesR.position.set(0.082, 0.015, 0.218);
      const glassesBridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.011, 0.011), material(0xd97706, 0.6, 0.3));
      glassesBridge.position.set(0, 0.018, 0.218);
      headGroup.add(glassesL, glassesR, glassesBridge);

      const armL = new THREE.Group();
      armL.position.set(-0.32, 1.40, 0);
      const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 12), material(0x1e3f56));
      const armLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.056, 0.48, 14), material(0x1e3f56));
      armLMesh.position.y = -0.22;
      const handL = new THREE.Mesh(new THREE.SphereGeometry(0.054, 12, 12), material(0xf8d4b4));
      handL.position.y = -0.47;
      armL.add(shoulderL, armLMesh, handL);
      body.add(armL);
      animControls.armL = armL;

      const armR = new THREE.Group();
      armR.position.set(0.32, 1.40, 0);
      const shoulderR = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 12), material(0x1e3f56));
      const armRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.056, 0.48, 14), material(0x1e3f56));
      armRMesh.position.y = -0.22;
      const handR = new THREE.Mesh(new THREE.SphereGeometry(0.054, 12, 12), material(0xf8d4b4));
      handR.position.y = -0.47;
      const tablet = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.26, 0.034), material(0xf2b75b));
      tablet.position.set(0.02, -0.42, 0.12);
      tablet.rotation.x = 0.32;
      armR.add(shoulderR, armRMesh, handR, tablet);
      body.add(armR);
      animControls.armR = armR;

      for (const [side, key] of [[-1, 'legL'], [1, 'legR']]) {
        const leg = new THREE.Group();
        leg.position.set(side * 0.135, 0.88, 0);
        const legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.068, 0.78, 14), material(0x142735));
        legMesh.position.y = -0.39;
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.082, 0.225), material(0x0c151c));
        shoe.position.set(0, -0.80, 0.045);
        const sole = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.025, 0.235), material(0x334155));
        sole.position.set(0, -0.842, 0.045);
        leg.add(legMesh, shoe, sole);
        body.add(leg);
        animControls[key] = leg;
      }
    }
  }

  buildAvatar(initialType);

  let walkCycle = 0;
  let idleClock = 0;
  let moveBlend = 0;
  function updateAnimation(dt, speedInput, facingYaw, jumpY = 0) {
    idleClock += dt;
    const rawSpeed = typeof speedInput === 'number' ? speedInput : (speedInput ? 1.0 : 0.0);
    const targetBlend = Math.min(1.4, Math.max(0, rawSpeed));
    moveBlend = THREE.MathUtils.damp(moveBlend, targetBlend, 12, dt);

    // Hiệu ứng vòng định vị và bóng dưới mặt đất co giãn theo độ cao nhảy & tốc độ
    const shadowScale = Math.max(0.55, 1.0 - jumpY * 0.22);
    shadow.scale.setScalar(shadowScale);
    auraRing.scale.setScalar(shadowScale * (1.0 + Math.sin(idleClock * 3.2) * 0.035));
    auraMat.opacity = 0.20 + 0.14 * Math.min(1, moveBlend);

    if (animControls.isDrone) {
      walkCycle += dt * (3.0 + moveBlend * 2.5);
      if (animControls.droneGroup) {
        animControls.droneGroup.position.y = 1.35 + Math.sin(walkCycle) * 0.075 + (jumpY > 0 ? 0.35 : 0);
        animControls.droneGroup.rotation.x = THREE.MathUtils.damp(animControls.droneGroup.rotation.x, 0.22 * moveBlend, 12, dt);
      }
      if (animControls.droneRing) {
        animControls.droneRing.rotation.z += dt * (1.8 + 3.4 * moveBlend);
      }
      if (animControls.droneInnerRing) {
        animControls.droneInnerRing.rotation.x -= dt * (2.2 + 2.8 * moveBlend);
      }
      if (animControls.droneThruster) {
        const pulse = 1 + Math.sin(walkCycle * 5) * 0.14 + (jumpY > 0 ? 0.35 : 0);
        animControls.droneThruster.scale.set(pulse, 1.0 + 0.65 * Math.max(moveBlend, jumpY > 0 ? 1 : 0), pulse);
      }
    } else {
      if (jumpY > 0.05) {
        // Tư thế đang nhảy trên không: vươn tay và co chân mềm mại
        if (animControls.legL) animControls.legL.rotation.x = THREE.MathUtils.damp(animControls.legL.rotation.x, -0.35, 14, dt);
        if (animControls.legR) animControls.legR.rotation.x = THREE.MathUtils.damp(animControls.legR.rotation.x, 0.26, 14, dt);
        if (animControls.armL) animControls.armL.rotation.x = THREE.MathUtils.damp(animControls.armL.rotation.x, -0.52, 14, dt);
        if (animControls.armR) animControls.armR.rotation.x = THREE.MathUtils.damp(animControls.armR.rotation.x, 0.34, 14, dt);
        if (animControls.torsoGroup) {
          animControls.torsoGroup.rotation.x = THREE.MathUtils.damp(animControls.torsoGroup.rotation.x, -0.05, 12, dt);
          animControls.torsoGroup.rotation.y = THREE.MathUtils.damp(animControls.torsoGroup.rotation.y, 0, 12, dt);
        }
        body.position.y = THREE.MathUtils.damp(body.position.y, 0.02, 14, dt);
      } else {
        // Chuyển động bước đi pha trộn liên tục (Continuous Stride Blending) không bị khựng khi dừng/chạy
        walkCycle += dt * (2.2 + 7.2 * moveBlend);
        const stride = Math.sin(walkCycle) * 0.52 * Math.min(1.18, moveBlend);
        const kneeLift = Math.max(0, Math.cos(walkCycle)) * 0.06 * moveBlend;
        if (animControls.legL) animControls.legL.rotation.x = THREE.MathUtils.damp(animControls.legL.rotation.x, stride, 18, dt);
        if (animControls.legR) animControls.legR.rotation.x = THREE.MathUtils.damp(animControls.legR.rotation.x, -stride, 18, dt);
        if (animControls.armL) {
          animControls.armL.rotation.x = THREE.MathUtils.damp(animControls.armL.rotation.x, -stride * 0.88, 18, dt);
          animControls.armL.rotation.z = THREE.MathUtils.damp(animControls.armL.rotation.z, 0.04 + 0.03 * Math.sin(idleClock * 2.1), 10, dt);
        }
        if (animControls.armR) {
          animControls.armR.rotation.x = THREE.MathUtils.damp(animControls.armR.rotation.x, stride * 0.48, 18, dt);
          animControls.armR.rotation.z = THREE.MathUtils.damp(animControls.armR.rotation.z, -0.04 - 0.03 * Math.sin(idleClock * 2.1), 10, dt);
        }
        if (animControls.torsoGroup) {
          animControls.torsoGroup.rotation.y = THREE.MathUtils.damp(animControls.torsoGroup.rotation.y, -stride * 0.16, 14, dt);
          animControls.torsoGroup.rotation.x = THREE.MathUtils.damp(animControls.torsoGroup.rotation.x, 0.055 * moveBlend, 12, dt);
        }
        if (animControls.headGroup) {
          animControls.headGroup.rotation.y = THREE.MathUtils.damp(animControls.headGroup.rotation.y, stride * 0.08 + Math.sin(idleClock * 1.1) * 0.035 * (1 - Math.min(1, moveBlend)), 12, dt);
          animControls.headGroup.rotation.x = THREE.MathUtils.damp(animControls.headGroup.rotation.x, Math.sin(idleClock * 1.8) * 0.02, 10, dt);
        }
        const walkBob = Math.abs(Math.sin(walkCycle)) * 0.046 * Math.min(1.15, moveBlend) + kneeLift * 0.2;
        const idleBreath = Math.sin(idleClock * 2.2) * 0.014 * (1 - Math.min(1, moveBlend));
        body.position.y = THREE.MathUtils.damp(body.position.y, walkBob + idleBreath, 16, dt);
      }
    }
    body.rotation.y = facingYaw;
  }

  return {
    root,
    body,
    updateAnimation,
    setAvatarType: buildAvatar,
    getAvatarType: () => currentType
  };
}

/** Tạo bảng từ xanh lớp học viết phấn công thức Toán học chuẩn */
function createClassroomChalkboard(cfg, rx, zBack, isPos) {
  const group = new THREE.Group();
  const width = 9.8, height = 2.9, depth = 0.08;

  // Khung nhôm viền gỗ sồi bao quanh bảng
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x8a5a36, roughness: 0.5, metalness: 0.1 });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.24, height + 0.24, depth), frameMat);
  frame.position.set(0, 0, 0);
  group.add(frame);

  // Mặt bảng từ xanh chống lóa
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');

  // Nền bảng xanh rêu
  ctx.fillStyle = '#1b3f2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Kẻ lưới ô ly mờ 32px
  ctx.strokeStyle = 'rgba(76, 175, 80, 0.18)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  // Viết chữ phấn trắng & vàng trên bảng
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.fillText(`CHUYÊN ĐỀ TOÁN HỌC ${cfg.name} · BÀI HỌC TRỌNG TÂM`, 50, 52);

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(50, 68); ctx.lineTo(920, 68); ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = '24px system-ui, sans-serif';
  const lines = cfg.chalkboardFormula.split('\n');
  lines.forEach((line, i) => {
    if (i === 0) {
      ctx.fillStyle = '#7dd3fc';
      ctx.font = 'bold 26px system-ui, sans-serif';
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px monospace, system-ui';
    }
    ctx.fillText(line, 55, 115 + i * 42);
  });

  // Chữ ký góc bảng
  ctx.fillStyle = '#86efac';
  ctx.font = 'italic 18px system-ui, sans-serif';
  ctx.fillText('Mathverse 3D Classroom · Giáo án chuẩn GDPT 2018', 1160, 440);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const boardMat = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, fog: false, side: THREE.FrontSide });
  const boardMesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), boardMat);
  boardMesh.position.set(0, 0, (depth / 2) + 0.01);
  group.add(boardMesh);
  const boardMeshBack = new THREE.Mesh(boardMesh.geometry, boardMat);
  boardMeshBack.position.set(0, 0, -(depth / 2) - 0.01);
  boardMeshBack.rotation.y = Math.PI;
  group.add(boardMeshBack);

  // Khay để phấn dưới chân bảng
  const trayMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.4, roughness: 0.4 });
  const tray = new THREE.Mesh(new THREE.BoxGeometry(width + 0.3, 0.06, 0.16), trayMat);
  tray.position.set(0, -height / 2 - 0.03, 0.06);
  group.add(tray);

  // Viên phấn trắng & vàng trên khay
  const chalkMatW = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const chalkW = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 8), chalkMatW);
  chalkW.rotation.z = Math.PI / 2;
  chalkW.position.set(-1.2, -height / 2 + 0.02, 0.1);
  group.add(chalkW);

  // Thước kẻ gỗ 1 mét treo cạnh bảng
  const rulerMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
  const ruler = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 0.02), rulerMat);
  ruler.position.set(width / 2 + 0.28, 0, 0.02);
  group.add(ruler);

  // Vị trí đặt trên tường chính (hướng nhìn đối diện lối vào)
  const zPos = isPos ? zBack - 0.22 : zBack + 0.22;
  group.position.set(rx, 4.3, zPos);
  group.rotation.y = isPos ? Math.PI : 0;

  return group;
}

/** Tạo bục giảng và bàn giáo viên ở phía trước lớp học */
function createTeacherArea(cfg, rx, zBack, isPos) {
  const group = new THREE.Group();

  // Bục giảng nâng cao bằng gỗ
  const platformMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.6 });
  const platform = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.16, 2.2), platformMat);
  platform.position.set(0, 0.08, 0);
  group.add(platform);

  // Bàn giáo viên bằng gỗ sồi
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x7c4f30, roughness: 0.5 });
  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.07, 1.0), deskMat);
  deskTop.position.set(1.4, 0.95, 0);
  group.add(deskTop);

  // Chân bàn
  const legMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.6, roughness: 0.3 });
  [[-0.95, -0.4], [0.95, -0.4], [-0.95, 0.4], [0.95, 0.4]].forEach(([dx, dz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.82, 12), legMat);
    leg.position.set(1.4 + dx, 0.52, dz);
    group.add(leg);
  });

  // Máy tính xách tay (Laptop giáo viên) mở màn hình
  const laptopMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, metalness: 0.8, roughness: 0.2 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.015, 0.26), laptopMat);
  base.position.set(1.4, 0.99, -0.1);
  group.add(base);

  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 256; screenCanvas.height = 160;
  const sCtx = screenCanvas.getContext('2d');
  sCtx.fillStyle = '#0f172a'; sCtx.fillRect(0, 0, 256, 160);
  sCtx.fillStyle = '#38bdf8'; sCtx.font = 'bold 18px sans-serif';
  sCtx.fillText(`MATHVERSE V13 · ${cfg.name}`, 14, 34);
  sCtx.fillStyle = '#f8fafc'; sCtx.font = '14px sans-serif';
  sCtx.fillText('Giáo án điện tử 3D', 14, 64);
  sCtx.fillText('Sẵn sàng giảng dạy', 14, 88);

  const screenTex = new THREE.CanvasTexture(screenCanvas);
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTex, side: THREE.FrontSide });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.23), screenMat);
  const screenBack = new THREE.Mesh(screen.geometry, screenMat);
  screenBack.rotation.y = Math.PI;
  screenBack.position.z = -0.01;
  screen.add(screenBack);
  screen.position.set(1.4, 1.12, -0.22);
  screen.rotation.x = -0.22;
  group.add(screen);

  // Chồng sách giáo khoa Toán học
  const bookMat1 = new THREE.MeshStandardMaterial({ color: 0x2563eb });
  const book1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.32), bookMat1);
  book1.position.set(0.7, 1.01, 0.1);
  group.add(book1);
  const bookMat2 = new THREE.MeshStandardMaterial({ color: 0xd97706 });
  const book2 = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.035, 0.31), bookMat2);
  book2.position.set(0.72, 1.045, 0.09);
  book2.rotation.y = 0.12;
  group.add(book2);

  // Lọ hoa để bàn giáo viên
  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.045, 0.22, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }));
  vase.position.set(2.2, 1.1, -0.15);
  group.add(vase);
  const flower = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshBasicMaterial({ color: cfg.accent }));
  flower.position.set(2.2, 1.25, -0.15);
  group.add(flower);

  const zPos = isPos ? zBack - 3.2 : zBack + 3.2;
  group.position.set(rx, 0, zPos);
  group.rotation.y = isPos ? Math.PI : 0;

  return group;
}

/** Tạo cửa sổ lớp học đón ánh sáng trên tường bên */
function createClassroomWindows(room, rx, isPos, zCenter, ROOM_W, ROOM_D, ROOM_H) {
  const windowCount = 3;
  const startZ = zCenter - 11;
  const stepZ = 11;

  for (let i = 0; i < windowCount; i++) {
    const wz = startZ + i * stepZ;
    // Khung cửa sổ trắng
    const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.4, 2.6), new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 }));
    frameMesh.position.set(rx - ROOM_W / 2 + 0.18, 4.4, wz);
    room.add(frameMesh);

    // Kính phát sáng ánh sáng ban ngày (Daylight sky glow)
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xdbeafe });
    const glassMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.2), glassMat);
    glassMesh.rotation.y = Math.PI / 2;
    glassMesh.position.set(rx - ROOM_W / 2 + 0.23, 4.4, wz);
    room.add(glassMesh);

    // Rèm cửa màu kem ấm
    const curtainMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.8 });
    const curtainL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.5, 0.4), curtainMat);
    curtainL.position.set(rx - ROOM_W / 2 + 0.26, 4.4, wz - 1.3);
    const curtainR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.5, 0.4), curtainMat);
    curtainR.position.set(rx - ROOM_W / 2 + 0.26, 4.4, wz + 1.3);
    room.add(curtainL, curtainR);
  }
}

/** Tạo tranh poster các nhà toán học treo trên tường */
function createMathPosters(room, rx, isPos, zCenter, ROOM_W, ROOM_H) {
  const posters = [
    { name: 'PYTHAGORAS', desc: 'Định lý tam giác vuông', color: '#1e3a8a' },
    { name: 'THALES', desc: 'Định lý tỉ lệ đoạn thẳng', color: '#065f46' },
    { name: 'EUCLID', desc: 'Hình học phẳng cơ bản', color: '#831843' }
  ];

  posters.forEach((p, idx) => {
    const pz = zCenter - 8 + idx * 8;
    const canvas = document.createElement('canvas');
    canvas.width = 320; canvas.height = 440;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = p.color;
    ctx.fillRect(0, 0, 320, 440);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(16, 16, 288, 408);
    ctx.fillStyle = p.color;
    ctx.fillRect(28, 28, 264, 250);
    // Vòng tròn tượng trưng
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(160, 150, 75, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px serif';
    ctx.textAlign = 'center';
    ctx.fillText('∑', 160, 172);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText(p.name, 160, 325);
    ctx.fillStyle = '#64748b';
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText(p.desc, 160, 360);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const pMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, fog: false, side: THREE.FrontSide });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.9), pMat);
    const meshBack = new THREE.Mesh(mesh.geometry, pMat);
    meshBack.rotation.y = Math.PI;
    meshBack.position.z = -0.01;
    mesh.add(meshBack);
    mesh.rotation.y = -Math.PI / 2;
    mesh.position.set(rx + ROOM_W / 2 - 0.2, 4.4, pz);
    room.add(mesh);
  });
}

/** Tạo bàn ghế học sinh hiện đại dọc hai bên phòng học */
function createClassroomDesks(room, rx, isPos, zCenter, ROOM_W, ROOM_D) {
  const deskMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
  const bookMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  for (const side of [-1, 1]) {
    const xPos = rx + side * (ROOM_W / 2 - 2.8);
    for (let row = 0; row < 3; row++) {
      const zPos = zCenter - 9 + row * 9;
      const deskGroup = new THREE.Group();
      deskGroup.position.set(xPos, 0, zPos);
      if (side === -1) deskGroup.rotation.y = Math.PI / 2;
      else deskGroup.rotation.y = -Math.PI / 2;

      // Mặt bàn học
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.7), deskMat);
      top.position.y = 0.75;
      deskGroup.add(top);

      // 4 chân bàn sắt
      for (const [cx, cz] of [[-0.7, -0.3], [0.7, -0.3], [-0.7, 0.3], [0.7, 0.3]]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.75, 8), metalMat);
        leg.position.set(cx, 0.375, cz);
        deskGroup.add(leg);
      }

      // Sách giáo khoa toán trên bàn
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.025, 0.32), bookMat);
      book.position.set(-0.3, 0.78, 0);
      book.rotation.y = 0.15;
      deskGroup.add(book);

      // Ghế học sinh tựa lưng
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 0.44), deskMat);
      seat.position.set(0, 0.46, -0.55);
      deskGroup.add(seat);
      const backRest = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.24, 0.03), deskMat);
      backRest.position.set(0, 0.72, -0.74);
      deskGroup.add(backRest);
      for (const [gx, gz] of [[-0.2, -0.4], [0.2, -0.4], [-0.2, -0.7], [0.2, -0.7]]) {
        const chairLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.46, 8), metalMat);
        chairLeg.position.set(gx, 0.23, gz);
        deskGroup.add(chairLeg);
      }

      room.add(deskGroup);
    }
  }
}

/** Tạo thảm nhung bao quanh bục mô hình & đèn rọi spotlight từ trần chiếu sáng 9 bục */
function createClassroomPedestalAtmosphere(room, rx, isPos, zCenter, ROOM_H, ac, acHex) {
  // Thảm nhung viền ánh sáng bao quanh cụm bục mô hình
  const carpet = new THREE.Mesh(
    new THREE.BoxGeometry(24.0, 0.02, 24.0),
    new THREE.MeshStandardMaterial({ color: 0x111e2e, roughness: 0.9 })
  );
  carpet.position.set(rx, 0.01, zCenter);
  room.add(carpet);

  // Viền vàng kim / màu nhận diện của thảm
  const borderMat = new THREE.MeshBasicMaterial({ color: ac });
  const b1 = new THREE.Mesh(new THREE.BoxGeometry(24.2, 0.025, 0.18), borderMat);
  b1.position.set(rx, 0.012, zCenter - 12.0);
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(24.2, 0.025, 0.18), borderMat);
  b2.position.set(rx, 0.012, zCenter + 12.0);
  const b3 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 24.2), borderMat);
  b3.position.set(rx - 12.0, 0.012, zCenter);
  const b4 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 24.2), borderMat);
  b4.position.set(rx + 12.0, 0.012, zCenter);
  room.add(b1, b2, b3, b4);

  // 9 Đèn rọi Spotlight từ trần chiếu thẳng xuống 9 bục mô hình & Vòng hào quang neon
  const slotList = isPos ? SLOTS_POS : SLOTS_NEG;
  slotList.forEach(([dx, pz]) => {
    // Vòng hào quang tròn neon dưới mỗi bục trên nền thảm
    const ringMat = new THREE.MeshBasicMaterial({ color: ac, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.62, 1.80, 32), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(rx + dx, 0.022, pz);
    room.add(ring);

    // Chóa đèn trần kiến trúc hiện đại
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.35, 16), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 }));
    can.position.set(rx + dx, ROOM_H - 0.18, pz);
    room.add(can);

    // Kính đèn phát sáng vàng ấm
    const bulb = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16), new THREE.MeshBasicMaterial({ color: 0xfffbeb }));
    bulb.rotation.x = Math.PI / 2;
    bulb.position.set(rx + dx, ROOM_H - 0.35, pz);
    room.add(bulb);
  });
}

/** Tạo giá sách thư viện toán học và góc trưng bày mô hình hình học ở góc lớp */
function createClassroomBookshelf(room, rx, zBack, isPos, ROOM_W, ac) {
  const shelfGroup = new THREE.Group();
  const shelfX = rx - ROOM_W / 2 + 1.4;
  const shelfZ = zBack + (isPos ? -2.4 : 2.4);
  shelfGroup.position.set(shelfX, 0, shelfZ);
  if (!isPos) shelfGroup.rotation.y = Math.PI;

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2c11, roughness: 0.6 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });

  // 2 tấm vách đứng tủ sách
  const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.2, 0.8), woodMat);
  sideL.position.set(-0.9, 1.6, 0);
  const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.2, 0.8), woodMat);
  sideR.position.set(0.9, 1.6, 0);
  // Tấm lưng tủ sách
  const backPanel = new THREE.Mesh(new THREE.BoxGeometry(1.86, 3.2, 0.04), woodMat);
  backPanel.position.set(0, 1.6, -0.38);
  shelfGroup.add(sideL, sideR, backPanel);

  // 4 tầng kệ ngang
  [0.1, 0.9, 1.7, 2.5, 3.2].forEach(y => {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.06, 0.8), woodMat);
    shelf.position.set(0, y, 0);
    shelfGroup.add(shelf);
  });

  // Tầng 1: Các chồng sách Toán học đa dạng
  const bookColors = [0x2563eb, 0xd97706, 0x16a34a, 0xdc2626, 0x9333ea];
  bookColors.forEach((col, idx) => {
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.5), new THREE.MeshStandardMaterial({ color: col }));
    book.position.set(-0.7 + idx * 0.14, 0.34, -0.05);
    shelfGroup.add(book);
  });

  // Tầng 2: Khối hình học 3D đa diện mini
  const miniPyramid = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.32, 4), new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.5, roughness: 0.2 }));
  miniPyramid.position.set(-0.45, 1.12, 0);
  const miniIcosa = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 0), new THREE.MeshStandardMaterial({ color: 0xf43f5e, metalness: 0.6, roughness: 0.2 }));
  miniIcosa.position.set(0.1, 1.12, 0);
  const miniSphere = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.4, roughness: 0.3 }));
  miniSphere.position.set(0.55, 1.12, 0);
  shelfGroup.add(miniPyramid, miniIcosa, miniSphere);

  // Tầng 3: Cúp vinh danh Toán học Vàng (Golden Math Trophy)
  const trophyBase = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.22), woodMat);
  trophyBase.position.set(0, 1.8, 0);
  const trophyStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.18, 12), goldMat);
  trophyStem.position.set(0, 1.94, 0);
  const trophyCup = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.08, 0.28, 12), goldMat);
  trophyCup.position.set(0, 2.16, 0);
  shelfGroup.add(trophyBase, trophyStem, trophyCup);

  room.add(shelfGroup);
}

/** Tạo bảng tin ghim tài liệu học tập & vinh danh Toán học */
function createClassroomNoticeBoard(room, rx, isPos, zCenter, ROOM_W) {
  const canvas = document.createElement('canvas');
  canvas.width = 600; canvas.height = 380;
  const ctx = canvas.getContext('2d');

  // Nền gỗ bần (Cork board)
  ctx.fillStyle = '#b48256';
  ctx.fillRect(0, 0, 600, 380);

  // Viền bảng gỗ
  ctx.strokeStyle = '#6b4324';
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, 588, 368);

  // Tiêu đề bảng tin
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(20, 20, 560, 48);
  ctx.fillStyle = '#854d0e';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📌 BẢNG TIN HỌC TẬP TOÁN HỌC & VINH DANH', 300, 52);

  // Tờ giấy note 1 (Vàng): Mẹo học tốt
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(35, 90, 245, 140);
  ctx.fillStyle = '#854d0e';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('💡 MẸO HỌC HÌNH 3D:', 48, 120);
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText('• Vẽ hình từ đáy lên đỉnh', 48, 148);
  ctx.fillText('• Xác định đúng đường cao', 48, 172);
  ctx.fillText('• Thuộc hệ thức Pythagore', 48, 196);

  // Tờ giấy note 2 (Xanh): Vinh danh
  ctx.fillStyle = '#bae6fd';
  ctx.fillRect(315, 90, 245, 140);
  ctx.fillStyle = '#0369a1';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillText('🏆 GƯƠNG SÁNG TOÁN HỌC:', 328, 120);
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText('• 100% đạt chuẩn GDPT 2018', 328, 148);
  ctx.fillText('• Tích hợp STEM & AI số', 328, 172);
  ctx.fillText('• Khám phá mô hình thực tế', 328, 196);

  // Băng rôn dưới
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(35, 255, 525, 75);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TOÁN HỌC LÀ CỘI NGUỒN CỦA TƯ DUY VÀ SÁNG TẠO', 300, 300);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const bMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, fog: false, side: THREE.FrontSide });
  const boardMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.0), bMat);
  const boardBack = new THREE.Mesh(boardMesh.geometry, bMat);
  boardBack.rotation.y = Math.PI;
  boardBack.position.z = -0.01;
  boardMesh.add(boardBack);
  boardMesh.rotation.y = -Math.PI / 2;
  boardMesh.position.set(rx + ROOM_W / 2 - 0.22, 4.4, zCenter + 6.0);
  room.add(boardMesh);
}

/** Tạo chậu cây cảnh xanh và đồng hồ lớp học */
function createClassroomGreeneryAndClock(room, rx, zBack, isPos, ROOM_H) {
  // Chậu cây cảnh cạnh bục giảng
  const plantGroup = new THREE.Group();
  plantGroup.position.set(rx - 6.2, 0, zBack + (isPos ? 1.5 : -1.5));
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.24, 0.65, 16), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 }));
  pot.position.y = 0.325;
  plantGroup.add(pot);
  // Tán cây nhiệt đới xanh mát
  for (let i = 0; i < 4; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 }));
    leaf.scale.set(1.4, 0.6, 1.0);
    leaf.position.set(Math.sin(i * 1.5) * 0.2, 0.8 + i * 0.18, Math.cos(i * 1.5) * 0.2);
    plantGroup.add(leaf);
  }
  room.add(plantGroup);

  // Đồng hồ treo tường trên bảng đen
  const clockGroup = new THREE.Group();
  clockGroup.position.set(rx, 8.1, zBack + (isPos ? -0.38 : 0.38));
  if (!isPos) clockGroup.rotation.y = Math.PI;
  const clockRim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 8, 24), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 }));
  const clockFace = new THREE.Mesh(new THREE.CircleGeometry(0.40, 24), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  clockGroup.add(clockRim, clockFace);
  // Kim đồng hồ
  const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.01), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
  hourHand.position.set(0, 0.08, 0.01);
  const minHand = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.32, 0.01), new THREE.MeshBasicMaterial({ color: 0xe11d48 }));
  minHand.position.set(0.08, 0.05, 0.01);
  minHand.rotation.z = -Math.PI / 3;
  clockGroup.add(hourHand, minHand);
  room.add(clockGroup);
}

/**
 * Tạo Sàn Kiến Trúc 2D/3D (Architectural Blueprint Grid & Radial Portal Hub)
 * Giúp phân tách rõ mặt sàn, lối đi dẫn vào từng Cổng Chương và vị trí đứng của nhân vật.
 */
function createClassroomFloorBlueprint(room, cfg, rx, zCenter, isPos, ROOM_W, ROOM_D) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // 1. Nền đá Studio trung tính ấm (không chói trắng, không tối xỉn)
  ctx.fillStyle = '#d8e0ea';
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Lưới ô gạch kiến trúc 2D/3D sắc nét (16x16 ô)
  const step = 64;
  for (let gx = 0; gx < 16; gx++) {
    for (let gy = 0; gy < 16; gy++) {
      ctx.fillStyle = (gx + gy) % 2 === 0 ? '#dfe6ef' : '#cfd9e5';
      ctx.fillRect(gx * step + 2, gy * step + 2, step - 4, step - 4);
    }
  }
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 1024; i += step) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1024); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1024, i); ctx.stroke();
  }

  // 3. Viền khung kiến trúc Obsidian Navy đậm quanh chu vi phòng
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 24;
  ctx.strokeRect(20, 20, 984, 984);
  ctx.strokeStyle = cfg.accentHex || '#14b8a6';
  ctx.lineWidth = 6;
  ctx.strokeRect(36, 36, 952, 952);

  // 4. Thảm dẫn đường trung tâm & Vòng cung La bàn 2D/3D hướng tới các Cổng Chương
  const cx = 512;
  const cy = isPos ? 310 : 714;
  const targetAngles = isPos
    ? [Math.PI * 0.16, Math.PI * 0.33, Math.PI * 0.5, Math.PI * 0.67, Math.PI * 0.84]
    : [-Math.PI * 0.16, -Math.PI * 0.33, -Math.PI * 0.5, -Math.PI * 0.67, -Math.PI * 0.84];

  // Các tia dẫn đường (Radial Spokes) nối từ tâm phòng tới vòng cung cổng Chương
  for (const ang of targetAngles) {
    const tx = cx + Math.cos(ang) * 390;
    const ty = cy + Math.sin(ang) * 390;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 26;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.strokeStyle = cfg.accentHex || '#14b8a6';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke();
  }

  // Vòng cung nối các cổng Chương (Portal Arc Track)
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 34;
  ctx.beginPath();
  ctx.arc(cx, cy, 365, isPos ? 0.12 * Math.PI : 1.12 * Math.PI, isPos ? 0.88 * Math.PI : 1.88 * Math.PI);
  ctx.stroke();

  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, 365, isPos ? 0.12 * Math.PI : 1.12 * Math.PI, isPos ? 0.88 * Math.PI : 1.88 * Math.PI);
  ctx.stroke();

  // Đĩa tâm la bàn Obsidian Navy nơi nhân vật đứng khi bước vào phòng
  ctx.fillStyle = '#091526';
  ctx.beginPath(); ctx.arc(cx, cy, 138, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = cfg.accentHex || '#14b8a6';
  ctx.lineWidth = 10;
  ctx.beginPath(); ctx.arc(cx, cy, 134, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx, cy, 116, 0, Math.PI * 2); ctx.stroke();

  ctx.save();
  ctx.translate(cx, cy);
  if (!isPos) ctx.rotate(Math.PI);
  ctx.fillStyle = '#fef08a';
  ctx.font = '900 28px "Be Vietnam Pro", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`TOÁN ${cfg.name}`, 0, -20);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 20px "Be Vietnam Pro", "Segoe UI", sans-serif';
  ctx.fillText('CHỌN CỔNG CHƯƠNG SGK', 0, 18);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    toneMapped: false,
    fog: false
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W - 0.6, ROOM_D - 0.6), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(rx, 0.006, zCenter);
  room.add(mesh);
}

export function startMuseum({ canvas, onEnter, onSelect, onPointerLockChange, onTick, onNPCInteract, onFootstep, onPortalChange=()=>{} }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.35));
  let currentQuality='auto',dynamicRatio=Math.min(devicePixelRatio||1,1.35);
  let fpsCount=0,fpsElapsed=0,lastFps=0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdbe4ef);
  scene.fog = new THREE.FogExp2(0xdbe4ef, 0.00025);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcbd5e1, 1.25);
  scene.add(hemiLight);
  const ambient = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambient);
  const sunLight = new THREE.DirectionalLight(0xfffbeb, 0.95);
  sunLight.position.set(25, 45, 30);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(1024, 1024);
  sunLight.shadow.camera.left = -85;
  sunLight.shadow.camera.right = 85;
  sunLight.shadow.camera.top = 58;
  sunLight.shadow.camera.bottom = -58;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 160;
  sunLight.shadow.bias = -0.00018;
  sunLight.shadow.normalBias = 0.025;
  scene.add(sunLight);
  const envMapTexture = createProceduralHDRIEnvironment(renderer);
  if (envMapTexture) scene.environment = envMapTexture;
  let currentAOMode = 'off';

  let isDaylightTheme = true;
  let brightnessFactor = 1.0;
  function applySceneLighting() {
    const b = THREE.MathUtils.clamp(Number(brightnessFactor) || 1.0, 0.5, 1.6);
    renderer.toneMappingExposure = 0.98 * b;
    if (isDaylightTheme) {
      scene.background.set(0xdbe4ef);
      scene.fog.color.set(0xdbe4ef);
      scene.fog.density = 0.00025;
      hemiLight.color.set(0xffffff);
      hemiLight.groundColor.set(0xcbd5e1);
      hemiLight.intensity = 1.25 * b;
      ambient.intensity = 0.65 * b;
      sunLight.intensity = 0.85 * b;
    } else {
      scene.background.set(0x0b1522);
      scene.fog.color.set(0x0b1522);
      scene.fog.density = 0.0012;
      hemiLight.color.set(0xfcf8ee);
      hemiLight.groundColor.set(0x1e293b);
      hemiLight.intensity = 1.45 * b;
      ambient.intensity = 0.65 * b;
      sunLight.intensity = 0.45 * b;
    }
    graphics.setTheme(isDaylightTheme);
  }
  function setDaylightTheme(daylight) {
    isDaylightTheme = !!daylight;
    applySceneLighting();
  }
  function setBrightness(factor) {
    brightnessFactor = THREE.MathUtils.clamp(Number(factor) || 1.0, 0.5, 1.6);
    applySceneLighting();
    return brightnessFactor;
  }

  const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 280);
  camera.rotation.order = 'YXZ';

  // Tọa độ người chơi & nhân vật
  const player = { x: 0, z: 0 };
  let yaw = 0;
  let pitch = 0.22;
  let targetYaw = 0;
  let targetPitch = 0.22;
  let charYaw = 0;
  let grade = 0;
  let activePortal=null;
  let activeNearPortal=null;
  let lastPortalTransitionAt=-100000;
  const portalGates={};
  let grade6ReturnGate=null;
  let grade6Gallery=null;
  let paused = false;
  let destroyed = false;
  let isThirdPerson = true;
  // R8 UI: bird's-eye view. Purely a camera mode; movement/interaction unchanged.
  let isTopView = false;
  let topHeight = 26, curTopHeight = 26;
  // R9 UI: extra camera presets (visual only) – 'iso' = 3/4 tilted view that
  // follows the player, 'overview' = fixed bird's-eye framing the whole room.
  let aerialMode = null; // null | 'iso' | 'overview'
  let isoHeight = 16;
  const upGoal = new THREE.Vector3(0, 1, 0);
  const r8HiddenCeilings = new Set();
  let r8CeilingScanAt = 0;
  const r8Box = new THREE.Box3(), r8Size = new THREE.Vector3();
  function r8HideCeilings() {
    scene.updateMatrixWorld();
    scene.traverse(o => {
      if (!o.isMesh || !o.visible || r8HiddenCeilings.has(o) || !o.geometry) return;
      r8Box.setFromObject(o); r8Box.getSize(r8Size);
      // Large, thin, horizontal slabs high above the floor = ceilings/roofs.
      if (r8Box.min.y > 4.5 && r8Size.y < .7 && r8Size.x > 7 && r8Size.z > 7) {
        o.visible = false; r8HiddenCeilings.add(o);
      }
    });
  }
  function r8RestoreCeilings() {
    for (const o of r8HiddenCeilings) o.visible = true;
    r8HiddenCeilings.clear();
  }
  function setViewMode(mode) {
    const next = ['top', 'first', 'iso', 'overview'].includes(mode) ? mode : 'third';
    const wasFirst = !isThirdPerson;
    aerialMode = (next === 'iso' || next === 'overview') ? next : null;
    isTopView = next === 'top';
    isThirdPerson = next !== 'first';
    if (isTopView || aerialMode) { r8CeilingScanAt = 0; curTopHeight = Math.max(curTopHeight, 10); }
    else r8RestoreCeilings();
    // R9: glide between camera presets; only snap when leaving the eye view.
    if (wasFirst || next === 'first') { camera.up.set(0, 1, 0); camReady = false; }
    return next;
  }
  const getViewModeName = () => aerialMode || (isTopView ? 'top' : isThirdPerson ? 'third' : 'first');
  function r9OverviewFrame() {
    const P = r6SpatialManager?.getActiveRoomPlan?.();
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2), aspect = Math.max(.5, camera.aspect || 1.6);
    if (P && Number.isFinite(P.x)) {
      const zs = P.zSide || 1;
      // Frame the Lab zones (front row → back wall) rather than the whole hall.
      const zA = P.z + zs * -16.5, zB = P.z + zs * (P.depth / 2 - 2.5);
      const zones = P.zones || [];
      const minX = zones.length ? Math.min(...zones.map(z => z.minX)) : P.x - P.width / 2;
      const maxX = zones.length ? Math.max(...zones.map(z => z.maxX)) : P.x + P.width / 2;
      const halfW = (maxX - minX) / 2 + 2, halfD = Math.abs(zB - zA) / 2 + 5;
      const h = Math.min(150, Math.max(halfD, halfW / aspect) / Math.tan(halfFov) * 1.04);
      return { x: (minX + maxX) / 2, z: (zA + zB) / 2 - zs * 2.5, h, upZ: zs };
    }
    return { x: player.x, z: player.z, h: 70, upZ: Math.cos(yaw) >= 0 ? 1 : -1 };
  }

  let activeNearNpc = null;
  let activeNearExhibit = null;
  let activeNearThematicLab = null;
  let activeNearThematicMode = null;
  let closestDist = 999;
  let lastFootstepTime = 0;

  const savedAvatar = (typeof localStorage !== 'undefined' && localStorage.getItem('mathverse_avatar')) || 'alex';
  const avatar = createAvatar(isChibiPreset(savedAvatar)?'triet':savedAvatar);
  enhanceOriginalAvatar(avatar);
  if(isChibiPreset(savedAvatar))avatar.setAvatarType(savedAvatar);
  scene.add(avatar.root);

  // Bộ quản lý phím bấm
  const keys = new Set();
  const virtualKeys = new Set();
  const playerSpeed = 7.2; // Tốc độ di chuyển nhạy bén, linh hoạt

  const pickRaycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hitTargets = [];
  const modelLayers = {};
  const exhibitModels = [];
  let allItems = [];
  const pages = {};

  const building = new THREE.Group();
  scene.add(building);
  // R74 built-in 3D architectural upgrade; decorations never enter Lab/model routing.
  const graphics = createMuseumVisuals(THREE, building, ROOMS, {
    reducedMotion: Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)
  });

  const r6SpatialManager = new R6SpatialManager({
    scene,
    camera,
    building,
    labelSpriteFn: labelSprite,
    onSelectMode: (mode) => {
      onSelect?.(mode);
    },
    onReturnToGrade: (g) => {
      activePortal = null;
      lastPortalTransitionAt=performance.now();
      for(const gate of portalGates[g]||[])gate.group.visible=true;
      if(modelLayers[g])modelLayers[g].visible=false;
      syncGrade6Scene();
      hitTargets = portalTargets();
      onPortalChange?.({ grade: g, zone: null, items: [] });
    }
  });

  // 1. ĐẠI SẢNH HÀNH LANG TRUNG TÂM (RỘNG 16m x DÀI 150m x CAO 8.5m):
  const HALL_W = 154.0;
  const HALL_D = 16.4;
  const HALL_H = 8.5;
  cube(building, HALL_W, 0.26, HALL_D, 0, -0.13, 0, 0xf3efe6, 0.05, 0.45); // Sàn đá hoa cương sảnh tươi sáng
  cube(building, HALL_W, 0.22, HALL_D, 0, HALL_H, 0, 0xf8fafc);       // Trần thạch cao sáng
  // Tường 2 đầu hồi sảnh
  cube(building, 0.4, HALL_H, HALL_D, -HALL_W / 2, HALL_H / 2, 0, 0xf1f5f9);
  cube(building, 0.4, HALL_H, HALL_D, HALL_W / 2, HALL_H / 2, 0, 0xf1f5f9);

  // Các dải hoa văn cẩm thạch chạy dọc sảnh
  for (let i = -21; i <= 21; i++) {
    cube(building, 0.12, 0.02, HALL_D - 0.4, i * 3.6, 0.005, 0, 0xa18d78);
  }

  // Đèn chùm đại sảnh tại các trạm giao cắt
  for (const lx of [-54, -18, 18, 54]) {
    const lamp = new THREE.PointLight(0xfff5e0, 65, 42, 1.8);
    lamp.position.set(lx, HALL_H - 1.2, 0);
    building.add(lamp);
    const arch = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, HALL_D - 0.4), material(0x2f4d63));
    arch.position.set(lx, HALL_H - 0.15, 0);
    building.add(arch);
  }

  // 2. DỰNG CÁC PHÒNG HỌC ĐỐI DIỆN NHAU (RỘNG 34m x SÂU 40m x CAO 8.5m):
  const ROOM_W = 34.0;
  const ROOM_D = 40.0;
  const ROOM_H = 8.5;
  const DOOR_W = 6.8;

  for (const g of GRADES) {
    const cfg = ROOMS[g];
    const rx = cfg.x;
    const isPos = cfg.zSide === 1;
    const ac = cfg.accent;
    const acHex = cfg.accentHex;
    const zCenter = isPos ? 28 : -28;
    const zDoor = isPos ? 8 : -8;
    const zBack = isPos ? 48 : -48;

    const room = new THREE.Group();
    building.add(room);

    // SÀN LỚP HỌC ĐỔI MÀU RIÊNG TỪNG LỚP + BẢN ĐỒ SÀN KIẾN TRÚC 2D/3D TƯƠNG PHẢN CAO
    cube(room, ROOM_W, 0.24, ROOM_D, rx, -0.12, zCenter, cfg.floorColor, 0.08, 0.45);
    createClassroomFloorBlueprint(room, cfg, rx, zCenter, isPos, ROOM_W, ROOM_D);
    cube(room, ROOM_W, 0.22, ROOM_D, rx, ROOM_H, zCenter, 0xf8fafc);

    // Tường Đông & Tây có ốp chân tường màu lớp học đậm nét (wainscot) + phào chỉ vàng kim
    cube(room, 0.35, ROOM_H, ROOM_D, rx - ROOM_W / 2, ROOM_H / 2, zCenter, cfg.wallColor);
    cube(room, 0.35, ROOM_H, ROOM_D, rx + ROOM_W / 2, ROOM_H / 2, zCenter, cfg.wallColor);
    // Ốp chân tường Đông/Tây + Phào chỉ tách biệt rõ tường và sàn
    cube(room, 0.38, 1.32, ROOM_D, rx - ROOM_W / 2, 0.66, zCenter, cfg.wainscotColor);
    cube(room, 0.38, 1.32, ROOM_D, rx + ROOM_W / 2, 0.66, zCenter, cfg.wainscotColor);
    cube(room, 0.42, 0.08, ROOM_D, rx - ROOM_W / 2, 1.34, zCenter, 0xf59e0b);
    cube(room, 0.42, 0.08, ROOM_D, rx + ROOM_W / 2, 1.34, zCenter, 0xf59e0b);

    // Tường hậu
    cube(room, ROOM_W, ROOM_H, 0.35, rx, ROOM_H / 2, zBack, cfg.wallColor);
    cube(room, ROOM_W, 1.32, 0.38, rx, 0.66, zBack, cfg.wainscotColor);
    cube(room, ROOM_W, 0.08, 0.42, rx, 1.34, zBack, 0xf59e0b);

    // Tường mặt tiền (giáp sảnh) có cửa vòm rộng DOOR_W
    const sideWallW = (ROOM_W - DOOR_W) / 2;
    cube(room, sideWallW, ROOM_H, 0.35, rx - ROOM_W / 2 + sideWallW / 2, ROOM_H / 2, zDoor, cfg.wallColor);
    cube(room, sideWallW, ROOM_H, 0.35, rx + ROOM_W / 2 - sideWallW / 2, ROOM_H / 2, zDoor, cfg.wallColor);
    cube(room, sideWallW, 1.2, 0.38, rx - ROOM_W / 2 + sideWallW / 2, 0.6, zDoor, cfg.wainscotColor);
    cube(room, sideWallW, 1.2, 0.38, rx + ROOM_W / 2 - sideWallW / 2, 0.6, zDoor, cfg.wainscotColor);

    // Trán cửa vòm phát sáng theo màu lớp
    cube(room, DOOR_W, ROOM_H - 5.4, 0.40, rx, 5.4 + (ROOM_H - 5.4) / 2, zDoor, ac, 0.2);

    // CỔNG VÀO PHÒNG HỌC & TRỤ CỔNG CÓ DẢI LED NEON PHÁT SÁNG
    cube(room, 0.45, 5.4, 0.45, rx - DOOR_W / 2, 2.7, zDoor, ac);
    cube(room, 0.45, 5.4, 0.45, rx + DOOR_W / 2, 2.7, zDoor, ac);
    const ledMat = new THREE.MeshBasicMaterial({ color: ac });
    const ledL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 5.2, 0.08), ledMat);
    ledL.position.set(rx - DOOR_W / 2 + 0.24, 2.7, zDoor + (isPos ? -0.24 : 0.24));
    const ledR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 5.2, 0.08), ledMat);
    ledR.position.set(rx + DOOR_W / 2 - 0.24, 2.7, zDoor + (isPos ? -0.24 : 0.24));
    room.add(ledL, ledR);

    // Dải thảm chào đón ở lối vào cửa lớp
    cube(room, DOOR_W - 0.4, 0.015, 3.2, rx, 0.008, zDoor + (isPos ? -1.6 : 1.6), ac, 0.05);

    // BẢNG TÊN PHÒNG HỌC LỚN NGOÀI CỬA (Hướng ra sảnh chính)
    const signOuter = labelSprite(`🏛️ PHÒNG HỌC TOÁN LỚP ${g}`, acHex, 5.4, 0.95, 'rgba(12, 25, 42, 0.96)');
    signOuter.position.set(rx, 5.1, zDoor + (isPos ? -0.42 : 0.42));
    room.add(signOuter);

    // BẢNG TIÊU ĐỀ LỚP HỌC PHÍA TRÊN BẢNG ĐEN
    const signInner = labelSprite(`🏛️ PHÒNG TOÁN ${cfg.name} · ${cfg.title}`, acHex, 9.6, 1.15, 'rgba(15, 28, 48, 0.96)');
    signInner.position.set(rx, 6.7, zBack + (isPos ? -0.42 : 0.42));
    room.add(signInner);

    // KHẨU HIỆU LỚP HỌC SƯ PHẠM TRÊN TƯỜNG TRƯỚC
    const mottoBanner = labelSprite('TIÊN HỌC LỄ · HẬU HỌC VĂN — TOÁN HỌC LÀ CHIẾC CHÌA KHÓA MỞ RA VŨ TRỤ', '#fef08a', 11.2, 0.85, 'rgba(185, 28, 28, 0.96)');
    mottoBanner.position.set(rx, 7.6, zBack + (isPos ? -0.42 : 0.42));
    room.add(mottoBanner);

    // BẢNG TỪ XANH LỚP HỌC VIẾT PHẤN CÔNG THỨC TOÁN HỌC CHUẨN
    const chalkboard = createClassroomChalkboard(cfg, rx, zBack, isPos);
    room.add(chalkboard);

    // BỤC GIẢNG VÀ BÀN GIÁO VIÊN
    const teacherArea = createTeacherArea(cfg, rx, zBack, isPos);
    room.add(teacherArea);

    // CỬA SỔ LỚP HỌC ĐÓN ÁNH SÁNG
    createClassroomWindows(room, rx, isPos, zCenter, ROOM_W, ROOM_D, ROOM_H);

    // TRANH POSTER TOÁN HỌC VĨ ĐẠI TRÊN TƯỜNG
    createMathPosters(room, rx, isPos, zCenter, ROOM_W, ROOM_H);

    // THẢM NHUNG BỤC MÔ HÌNH VÀ ĐÈN RỌI SPOTLIGHT TỪ TRẦN
    // R6.9: no nine empty pedestal halos in door-only thematic rooms.
    // The clear aisle and visible 3D Lab doors replace unused display stations.

    // BÀN GHẾ HỌC SINH HIỆN ĐẠI DỌC HAI BÊN LỚP
    createClassroomDesks(room, rx, isPos, zCenter, ROOM_W, ROOM_D);

    // KỆ SÁCH THƯ VIỆN TOÁN HỌC VÀ GÓC MÔ HÌNH HÌNH HỌC Ở GÓC LỚP
    createClassroomBookshelf(room, rx, zBack, isPos, ROOM_W, ac);

    // BẢNG TIN HỌC TẬP TOÁN HỌC & VINH DANH TRÊN TƯỜNG
    createClassroomNoticeBoard(room, rx, isPos, zCenter, ROOM_W);

    // CÂY XANH TIỂU CẢNH VÀ ĐỒNG HỒ LỚP HỌC
    createClassroomGreeneryAndClock(room, rx, zBack, isPos, ROOM_H);

    // Dàn đèn trần LED âm trần hiện đại
    for (let row = 0; row < 3; row++) {
      const lz = isPos ? 18 + row * 10 : -18 - row * 10;
      const lightBar = new THREE.Mesh(new THREE.BoxGeometry(24, 0.08, 0.6), new THREE.MeshBasicMaterial({ color: 0xfffcf2 }));
      lightBar.position.set(rx, ROOM_H - 0.06, lz);
      room.add(lightBar);
    }
    const roomLight = new THREE.PointLight(0xffffff, 12, 48, 1.5);
    roomLight.position.set(rx, ROOM_H - 1.4, zCenter);
    room.add(roomLight);

    // Lớp chứa 9 mô hình
    const layer = new THREE.Group();
    room.add(layer);
    modelLayers[g] = layer;

    // 9 BỤC TRƯNG BÀY SANG TRỌNG (3x3), CÁCH NHAU 10 MÉT:
    const slotList = isPos ? SLOTS_POS : SLOTS_NEG;
    slotList.forEach(([dx, pz], idx) => {
      const plinth = new THREE.Group();
      plinth.position.set(rx + dx, 0, pz);
      layer.add(plinth);

      // Bục chân đá granite
      cube(plinth, 2.8, 0.70, 2.8, 0, 0.35, 0, 0x1e293b, 0.2, 0.4);
      // Viền đèn LED phát sáng theo màu lớp
      const ledTrim=cube(plinth, 2.94, 0.16, 2.94, 0, 0.78, 0, ac, 0.1, 0.3);
      ledTrim.material.emissive=new THREE.Color(ac);ledTrim.material.emissiveIntensity=.17;
      // Mặt đá cẩm thạch trắng sáng bóng
      cube(plinth, 2.70, 0.10, 2.70, 0, 0.90, 0, 0xf8fafc, 0.3, 0.2);

      plinth.userData.slot = idx;
      graphics.decoratePlinth(plinth, ac);
    });
  }

  const rotatingHologramCrests = [];

  // R10/R11: Mỗi lớp (Toán 6–12) dựng đầy đủ các Cổng Chương chuẩn Sách Giáo Khoa (58 Chương toàn hệ thống)
  for(const gradeId of GRADES){
    const config=ROOMS[gradeId],gates=[];
    const radialPlan=planRadialChapterGates(gradeId,config);
    const portalArc=planClassroomPortalArc(gradeId,config,radialPlan.length);
    if(gradeId===6){
      const baseZones=zonesForGrade(6);
      for(let index=0;index<portalArc.length;index++){
        const rp=portalArc[index]||radialPlan[index];
        const baseZone=baseZones[index%baseZones.length];
        const zone={
          ...baseZone,
          id:rp?rp.chapterId:baseZone.id,
          accent:rp?rp.accent:(baseZone.accent||'#2dd4bf'),
          label:rp?rp.chapterTitle:baseZone.label,
          short:rp?`CHƯƠNG ${rp.chapterNumber}`:baseZone.short
        };
        const gate=createGrade6Gate(THREE,zone,index%4,config,labelSprite);
        if(rp){
          gate.group.position.set(rp.x,0,rp.z);
          gate.group.rotation.y=rp.rotY;
          gate.x=rp.x;gate.z=rp.z;
          gate.thematicRoomId=rp.chapterId;
          gate.zone=rp.chapterId;
          gate.group.userData.thematicRoomId=rp.chapterId;
          gate.group.userData.portalKey=rp.chapterId;
          gate.group.userData.portalGrade=gradeId;
        }
        if(gate.inner?.material?.uniforms?.uOpacity){
          gate.inner.material.uniforms.uOpacity.value=0.32;
        }

        // R11: Cổng Chương SGK hiển thị rõ Chương + Tập + Tên Chương chuẩn SGK
        const chapterNum = rp ? toArabicChapterNum(rp.chapterNumber, index) : (index + 1);
        const accent = rp ? rp.accent : (zone.accent || '#2dd4bf');
        const badgeText = rp ? `CHƯƠNG ${rp.chapterNumber} · TẬP ${rp.volume || 1}` : `CHƯƠNG ${chapterNum}`;
        const chapterTitle = rp ? rp.chapterTitle : (zone.label || `Chương ${index + 1}`);
        const totalLessons = rp ? (rp.totalLessons || 0) : 0;
        const totalModels = rp ? (rp.totalModels || 0) : 0;
        const unitLabel = `${totalLessons} Bài · ${totalModels} Mô hình`;

        // Dọn dẹp biển hiệu cũ đơn điệu để chỉ giữ biển hiệu 2 tầng hiện đại
        const oldSprites = gate.group.children.filter(c => c.isSprite);
        for (const sp of oldSprites) {
          gate.group.remove(sp);
          disposeObject(sp);
        }
        gate.group.userData.r71SignFor = rp ? rp.chapterId : `CH-${chapterNum}`;
        gate.group.userData.hasChapterSign = true;

        // 1. Biểu tượng Hologram 3D xoay trên đỉnh vòm cổng (gọn nhẹ)
        const hologram = createNeonWireframeCrest(THREE, { chapterNum, accent });
        hologram.scale.setScalar(0.62);
        hologram.position.set(0, 3.85, 0);
        gate.group.add(hologram);
        rotatingHologramCrests.push(hologram);

        // 2. Thảm ánh sáng dẫn đường trên sàn
        const runway = createFloorDecalRunway(THREE, { chapterNum, accent });
        gate.group.add(runway);

        // 3. Biển hiệu 2 tầng rõ nét mang đúng tên Chương SGK
        const highVisSign = createHighVisibilityChapterSign(THREE, {
          chapterNum,
          badgeText,
          unitLabel,
          chapterTitle,
          totalLessons,
          totalModels,
          accent
        });
        highVisSign.scale.set(3.35, 1.15, 1);
        highVisSign.position.set(0, 3.22, 0.14);
        gate.group.add(highVisSign);

        building.add(gate.group);gates.push(gate);
      }
    }else{
      const side=config.zSide;
      for(let index=0;index<portalArc.length;index++){
        const zone=PORTAL_ZONES[index%PORTAL_ZONES.length];
        const group=new THREE.Group();
        const rp=portalArc[index]||radialPlan[index];
        if(rp){
          group.position.set(rp.x,0,rp.z);
          group.rotation.y=rp.rotY;
        }else{
          group.position.set(config.x+(index-2)*6.3,0,side*12.35);
        }
        const chapterRoomId=rp?rp.chapterId:zone.id;
        group.userData.portalKey=chapterRoomId;
        group.userData.thematicRoomId=chapterRoomId;
        group.userData.portalGrade=gradeId;
        const color=new THREE.Color(rp?rp.accent:zone.accent);
        // R11.2: Cổng vòm Obsidian Navy + Viền Neon sắc nét (tương phản 15:1 trên nền tường sáng)
        const doorFrame=new THREE.MeshStandardMaterial({color:0x0b1628,metalness:.38,roughness:.24});
        const neonMat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.98,toneMapped:false,fog:false});
        const basePad=new THREE.Mesh(new THREE.CylinderGeometry(1.52,1.68,.16,28),doorFrame);
        basePad.position.y=.08;group.add(basePad);
        const floorRing=new THREE.Mesh(new THREE.TorusGeometry(1.36,.065,10,38),neonMat);
        floorRing.rotation.x=-Math.PI/2;floorRing.position.y=.17;group.add(floorRing);
        for(const pSide of [-1,1]){
          const post=new THREE.Mesh(new THREE.CylinderGeometry(.16,.19,2.68,12),doorFrame);
          post.position.set(pSide*1.32,1.38,0);group.add(post);
          const neonStrip=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,2.62,10),neonMat);
          neonStrip.position.set(pSide*1.32,1.38,.16);group.add(neonStrip);
        }
        const archFrame=new THREE.Mesh(new THREE.TorusGeometry(1.32,.15,12,40,Math.PI),doorFrame);
        archFrame.position.y=2.68;group.add(archFrame);
        const ring=new THREE.Mesh(new THREE.TorusGeometry(1.32,.065,10,40,Math.PI),neonMat);
        ring.position.set(0,2.68,.15);group.add(ring);
        const inner=new THREE.Mesh(new THREE.BoxGeometry(2.42,2.62,.06),
          new THREE.MeshBasicMaterial({color,transparent:true,opacity:.26,depthWrite:false,toneMapped:false,fog:false}));
        inner.position.y=1.38;group.add(inner);
        const core=new THREE.Mesh(new THREE.OctahedronGeometry(.16,0),
          new THREE.MeshStandardMaterial({color:0xfef08a,emissive:color,emissiveIntensity:.65}));
        core.position.set(0,1.95,.12);group.add(core);

        // R11: Biển nhận diện hiển thị đúng Chương + Tập + Tên Chương trong Sách Giáo Khoa
        const chapterNum = rp ? toArabicChapterNum(rp.chapterNumber, index) : (index + 1);
        const accent = rp ? rp.accent : (zone.accent || '#2dd4bf');
        const badgeText = rp ? `CHƯƠNG ${rp.chapterNumber} · TẬP ${rp.volume || 1}` : `CHƯƠNG ${chapterNum}`;
        const chapterTitle = rp ? rp.chapterTitle : (zone.label || `Chương ${index + 1}`);
        const totalLessons = rp ? (rp.totalLessons || 0) : 0;
        const totalModels = rp ? (rp.totalModels || 0) : 0;
        const unitLabel = `${totalLessons} Bài · ${totalModels} Mô hình`;
        group.userData.r71SignFor = chapterRoomId;
        group.userData.hasChapterSign = true;

        // 1. Biểu tượng Hologram 3D xoay trên đỉnh vòm cổng (gọn nhẹ)
        const hologram = createNeonWireframeCrest(THREE, { chapterNum, accent });
        hologram.scale.setScalar(0.62);
        hologram.position.set(0, 4.18, 0);
        group.add(hologram);
        rotatingHologramCrests.push(hologram);

        // 2. Thảm ánh sáng dẫn đường trên sàn
        const runway = createFloorDecalRunway(THREE, { chapterNum, accent });
        group.add(runway);

        // 3. Biển hiệu 2 tầng độ tương phản cao mang đúng tên Chương SGK
        const highVisSign = createHighVisibilityChapterSign(THREE, {
          chapterNum,
          badgeText,
          unitLabel,
          chapterTitle,
          totalLessons,
          totalModels,
          accent
        });
        highVisSign.scale.set(3.35, 1.15, 1);
        highVisSign.position.set(0, 3.22, 0.16);
        group.add(highVisSign);

        building.add(group);gates.push({zone:chapterRoomId,thematicRoomId:chapterRoomId,x:group.position.x,z:group.position.z,group,ring,inner,core});
      }
    }
    portalGates[gradeId]=gates;
  }
  grade6ReturnGate=createReturnGate(THREE,labelSprite,ROOMS[6]);
  building.add(grade6ReturnGate.group);grade6ReturnGate.group.visible=false;
  grade6Gallery=new THREE.Group();grade6Gallery.visible=false;
  grade6Gallery.position.set(ROOMS[6].x,0,0);building.add(grade6Gallery);
  const galleryCarpet=new THREE.Mesh(new THREE.PlaneGeometry(27,28),new THREE.MeshBasicMaterial({color:0x56d9c1,transparent:true,opacity:.075,depthWrite:false,side:THREE.DoubleSide}));
  galleryCarpet.rotation.x=-Math.PI/2;galleryCarpet.position.set(0,.015,31);grade6Gallery.add(galleryCarpet);
  const galleryTitle=labelSprite('PHÒNG THÍ NGHIỆM · TOÁN 6','#6df9d8',9.0,1,'rgba(9,29,40,.86)');
  galleryTitle.position.set(0,5.0,41);grade6Gallery.add(galleryTitle);
  grade6Gallery.userData={carpet:galleryCarpet,sign:galleryTitle};
  function syncGrade6Scene(){
    const inThematic=!!r6SpatialManager.activeThematicRoomId;
    const foyer=grade===6&&!activePortal,inside=grade===6&&!!activePortal&&!inThematic;
    if(modelLayers[6])modelLayers[6].visible=false;
    for(const gate of portalGates[6]||[])gate.group.visible=foyer;
    grade6ReturnGate.group.visible=false;
    grade6Gallery.visible=false;
    if(inside){
      const zone=zonesForGrade(6).find(z=>z.id===activePortal);
      if(zone){grade6Gallery.userData.carpet.material.color.set(zone.accent);
        const old=grade6Gallery.userData.sign;
        if(old){grade6Gallery.remove(old);disposeObject(old);}
        const label=labelSprite(`PHÒNG LAB ${zone.short.toUpperCase()} · TOÁN 6`,zone.accent,8.5,.95,'rgba(9,25,38,.9)');
        label.position.set(0,5,41);grade6Gallery.add(label);grade6Gallery.userData.sign=label;
      }
    }
  }
  // [EXHIBITION CORE] These are part of the same native 3D scene/raycast index.
  let mathHistoryTargets=[];
  let mathHistoryGallery=null;
  function portalTargets(){
    const exhibitTargets=grade&&modelLayers[grade]?.visible?modelLayers[grade].children.filter(p=>p.visible&&p.userData.exhibitId):[];
    const guides=npcGuides.map(n=>n.avatar.root);
    const gates=(portalGates[grade]||[]).filter(p=>p.group.visible).map(p=>p.group);
    if(grade===6&&grade6ReturnGate.group.visible)gates.push(grade6ReturnGate.group);
    const r6Targets = r6SpatialManager ? r6SpatialManager.getClickTargets() : [];
    const r87Targets = r6SpatialManager?.getR87FoldTargets ? r6SpatialManager.getR87FoldTargets() : [];
    return [...exhibitTargets,...guides,...gates,...r6Targets,...r87Targets,...mathHistoryTargets];
  }

  // 3. PHÒNG TRIỂN LÃM TOÁN HỌC ĐỐI DIỆN LỚP 12 (X = 54, Z < 0):
  const libX = 54, libZDoor = -8, libZCenter = -28, libZBack = -48;
  const libRoom = new THREE.Group();
  building.add(libRoom);
  cube(libRoom, ROOM_W, 0.24, ROOM_D, libX, -0.12, libZCenter, 0x5a4a3e, 0.1, 0.5);
  cube(libRoom, ROOM_W, 0.22, ROOM_D, libX, ROOM_H, libZCenter, 0xcdd1cf);
  cube(libRoom, 0.35, ROOM_H, ROOM_D, libX - ROOM_W / 2, ROOM_H / 2, libZCenter, 0xe5ebe6);
  cube(libRoom, 0.35, ROOM_H, ROOM_D, libX + ROOM_W / 2, ROOM_H / 2, libZCenter, 0xe5ebe6);
  cube(libRoom, ROOM_W, ROOM_H, 0.35, libX, ROOM_H / 2, libZBack, 0xe5ebe6);
  const libSideW = (ROOM_W - DOOR_W) / 2;
  // Mặt tiền phòng Triển lãm màu đỏ đô chủ đạo #861B30, thanh ngang trên cửa đỏ nhung #A42A3D
  cube(libRoom, libSideW, ROOM_H, 0.35, libX - ROOM_W / 2 + libSideW / 2, ROOM_H / 2, libZDoor, 0x861B30);
  cube(libRoom, libSideW, ROOM_H, 0.35, libX + ROOM_W / 2 - libSideW / 2, ROOM_H / 2, libZDoor, 0x861B30);
  cube(libRoom, DOOR_W, ROOM_H - 5.4, 0.35, libX, 5.4 + (ROOM_H - 5.4) / 2, libZDoor, 0xA42A3D);
  // Mặt tiền đỏ đô trang trí hoàng gia viền vàng đồng & bảng hiệu nổi bật (loại bỏ nhãn đè để bảng hiệu tường sau hiển thị rõ nét)
  const mathverseExhibitionFacade = createExhibitionRedFacade(THREE, libRoom, {
    centerX: libX, doorZ: libZDoor, backZ: libZBack, width: ROOM_W, depth: ROOM_D, height: ROOM_H
  });
  // [MATHVERSE EXHIBITION CORE R74] 18 portraits + 14 corridor displays + 2 GeoGebra pedestals.
  mathHistoryGallery=mountMathematicianFrames(THREE,libRoom,{centerX:libX,backZ:libZBack,width:ROOM_W,depth:ROOM_D,building,rooms:ROOMS});
  mathHistoryTargets=mathHistoryGallery.targets;

  // Biển chính tại sảnh trung tâm
  const titleSign = labelSprite('MATH 3D MUSEUM · BẢO TÀNG TOÁN HỌC 6—12', '#7ee8d3', 9.2, 1.25);
  titleSign.position.set(0, 6.6, 0);
  building.add(titleSign);

  // Biển chỉ dẫn hướng phòng tại sảnh
  const dirPairs = [
    { x: -54, north: 'LỚP 6 ◀', south: '▶ LỚP 7' },
    { x: -18, north: 'LỚP 8 ◀', south: '▶ LỚP 9' },
    { x:  18, north: 'LỚP 10 ◀', south: '▶ LỚP 11' },
    { x:  54, north: 'LỚP 12 ◀', south: '▶ TRIỂN LÃM' }
  ];
  for (const d of dirPairs) {
    const sNorth = labelSprite(d.north, '#fde293', 3.2, 0.72);
    sNorth.position.set(d.x, 4.4, 4.0);
    building.add(sNorth);
    const sSouth = labelSprite(d.south, '#fde293', 3.2, 0.72);
    sSouth.position.set(d.x, 4.4, -4.0);
    sSouth.rotation.y = Math.PI;
    building.add(sSouth);
  }

  // 4. HỆ THỐNG 8 NPC HƯỚNG DẪN VIÊN ẢO (VIRTUAL CLASS GUIDES)
  const npcGuides = [];
  const NPC_DATA = [
    {
      id: 'lobby', grade: 0, type: 'bot', x: 0, z: 4.5,
      guideName: 'Bot Pi',
      icon: '🤖',
      title: 'HƯỚNG DẪN VIÊN SẢNH CHÍNH',
      accent: '#38bdf8',
      greeting: 'Chào mừng bạn đến với Mathverse 3D! Khám phá 7 phòng học từ Lớp 6 đến Lớp 12 trên thanh Dock hoặc đi qua các cổng vòm.',
      topics: [
        'Tham quan 7 phòng học chuyên đề chuẩn SGK mới',
        'Điều khiển nhân vật góc nhìn thứ 3 với phím WASD, Nhảy Space',
        'Tương tác phím E với mô hình 3D và hướng dẫn viên'
      ],
      featuredModelId: 'g8_01'
    },
    {
      id: 'g6', grade: 6, type: 'an', x: -54, z: 6.2,
      guideName: 'Tuệ An',
      icon: '👩‍🎓',
      title: 'HƯỚNG DẪN VIÊN LỚP 6',
      accent: '#1abc9c',
      greeting: 'Chào em! Khám phá thế giới đa giác đều, tính đối xứng và chu vi diện tích cùng Lớp 6 nhé!',
      topics: [
        'Tam giác đều, hình vuông, lục giác đều và tính chất đối xứng',
        'Hình chữ nhật, hình thoi, hình bình hành và hình thang cân',
        'Ứng dụng chu vi, diện tích và hình học trực quan trong thực tế'
      ],
      featuredModelId: 'g6_03'
    },
    {
      id: 'g7', grade: 7, type: 'triet', x: -54, z: -6.2,
      guideName: 'Minh Triết',
      icon: '🏃‍♂️',
      title: 'HƯỚNG DẪN VIÊN LỚP 7',
      accent: '#3498db',
      greeting: 'Chào bạn! Cùng chinh phục định lý 3 góc tam giác, tam giác bằng nhau và lăng trụ đứng Lớp 7!',
      topics: [
        'Hai góc kề bù, góc đối đỉnh, tia phân giác của một góc',
        'Hai đường thẳng song song và dấu hiệu nhận biết (so le trong, đồng vị)',
        'Hình lăng trụ đứng tam giác và lăng trụ đứng tứ giác'
      ],
      featuredModelId: 'g7_09'
    },
    {
      id: 'g8', grade: 8, type: 'alex', x: -18, z: 6.2,
      guideName: 'Thầy Tùng',
      icon: '👨‍🏫',
      title: 'HƯỚNG DẪN VIÊN LỚP 8',
      accent: '#e67e22',
      greeting: 'Chào mừng em! Khám phá thể tích hình chóp tứ giác đều, định lý Pythagore và Thales Lớp 8 ngay trên bục!',
      topics: [
        'Hình chóp tam giác đều và hình chóp tứ giác đều (thể tích & diện tích)',
        'Định lý Pythagore và các trường hợp đồng dạng của tam giác',
        'Định lý Thales trong tam giác và ứng dụng đo đạc thực tế'
      ],
      featuredModelId: 'g8_01'
    },
    {
      id: 'g9', grade: 9, type: 'an', x: -18, z: -6.2,
      guideName: 'Tuệ An',
      icon: '👩‍🎓',
      title: 'HƯỚNG DẪN VIÊN LỚP 9',
      accent: '#e74c3c',
      greeting: 'Chào em! Cùng ôn luyện các khối tròn xoay: hình trụ, nón, cầu và hệ thức lượng đường tròn thi vào 10!',
      topics: [
        'Hình trụ tròn xoay, hình nón và hình cầu (diện tích & thể tích)',
        'Góc ở tâm, góc nội tiếp, tiếp tuyến và đường tròn ngoại tiếp',
        'Hệ thức lượng trong tam giác vuông & tỉ số lượng giác'
      ],
      featuredModelId: 'g9_01'
    },
    {
      id: 'g10', grade: 10, type: 'triet', x: 18, z: 6.2,
      guideName: 'Minh Triết',
      icon: '🏃‍♂️',
      title: 'HƯỚNG DẪN VIÊN LỚP 10',
      accent: '#9b59b6',
      greeting: 'Chào mừng đến THPT! Khám phá vectơ không gian, hệ trục toạ độ Oxy và 3 đường conic tuyệt đẹp!',
      topics: [
        'Vectơ và các phép toán, tích vô hướng trong mặt phẳng Oxy',
        'Hàm số bậc hai parabol y = ax² + bx + c và ứng dụng cực trị',
        'Phương trình ba đường conic: Elip, Hypebol, Parabol'
      ],
      featuredModelId: 'g10_01'
    },
    {
      id: 'g11', grade: 11, type: 'alex', x: 18, z: -6.2,
      guideName: 'Thầy Tùng',
      icon: '👨‍🏫',
      title: 'HƯỚNG DẪN VIÊN LỚP 11',
      accent: '#27ae60',
      greeting: 'Chào bạn! Cùng làm chủ hình học không gian 11: quan hệ song song, vuông góc và lăng trụ xiên!',
      topics: [
        'Đường thẳng và mặt phẳng song song, hai mặt phẳng song song',
        'Đường thẳng vuông góc với mặt phẳng và định lý ba đường vuông góc',
        'Góc và khoảng cách trong không gian (điểm đến mặt phẳng, hai đường chéo nhau)'
      ],
      featuredModelId: 'g11_01'
    },
    {
      id: 'g12', grade: 12, type: 'alex', x: 54, z: 6.2,
      guideName: 'Thầy Tùng',
      icon: '👨‍🏫',
      title: 'HƯỚNG DẪN VIÊN LỚP 12',
      accent: '#f39c12',
      greeting: 'Chào các sĩ tử! Tự tin làm chủ phương pháp tọa độ Oxyz và ứng dụng tích phân tính thể tích khối tròn xoay!',
      topics: [
        'Hệ tọa độ Oxyz trong không gian, phương trình mặt phẳng và mặt cầu',
        'Đồ thị hàm số khảo sát: hàm bậc ba, hàm phân thức và tiệm cận',
        'Ứng dụng tích phân tính diện tích hình phẳng và thể tích vật thể tròn xoay'
      ],
      featuredModelId: 'g12_01'
    },
    {
      id: 'lib_guide', grade: 'lib', type: 'alex', x: 54, z: -6.0,
      guideName: 'GS. Euler',
      icon: '🏛️',
      title: 'HƯỚNG DẪN VIÊN TRIỂN LÃM',
      accent: '#2bb5b5',
      greeting: 'Chào mừng bạn đến với Phòng Triển lãm Toán học! Nơi hội tụ 11 danh nhân kiệt xuất và 2 xưởng thực nghiệm GeoGebra 2D & 3D hiện đại.',
      topics: [
        '11 chân dung danh nhân: Pythagoras, Euclid, Archimedes, Gauss, Euler...',
        'Xưởng vẽ hình 2D GeoGebra & Xưởng dựng hình không gian 3D',
        '14 tranh hành lang trực quan kết nối trực tiếp với 310 mô hình SGK'
      ],
      featuredModelId: 'g12_01'
    }
  ];

  NPC_DATA.forEach(data => {
    const guideAvatar = createAvatar(data.type);
    guideAvatar.root.position.set(data.x, 0, data.z);
    guideAvatar.root.userData.npcData = data;
    building.add(guideAvatar.root);

    const bubble = createSpeechBubble(data.greeting, data.title, data.accent);
    bubble.position.set(0, data.type === 'bot' ? 2.6 : 2.5, 0);
    bubble.scale.set(0.001, 0.001, 0.001);
    bubble.userData.npcData = data;
    guideAvatar.root.add(bubble);

    npcGuides.push({
      ...data,
      avatar: guideAvatar,
      bubble,
      currentScale: 0
    });
  });

  // 5. BỤI SÁNG LƠ LỬNG KHÔNG GIAN SỐ (CINEMATIC FLOATING AMBIENT MOTES)
  const MOTE_COUNT = 320;
  const moteGeo = new THREE.BufferGeometry();
  const motePositions = new Float32Array(MOTE_COUNT * 3);
  for (let i = 0; i < MOTE_COUNT; i++) {
    motePositions[i * 3] = (Math.random() - 0.5) * 150;
    motePositions[i * 3 + 1] = 0.4 + Math.random() * 6.5;
    motePositions[i * 3 + 2] = (Math.random() - 0.5) * 85;
  }
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
  const moteMat = new THREE.PointsMaterial({
    color: 0x67e8f9,
    size: 0.14,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const ambientMotes = new THREE.Points(moteGeo, moteMat);
  building.add(ambientMotes);
  const postProcessor = createModularPostProcessorV12(renderer, scene, () => camera);
  function setAOMode(mode){
    currentAOMode = normalizeAOMode(mode, currentQuality);
    postProcessor.setConfig({ ao: currentAOMode, quality: currentQuality });
    return currentAOMode;
  }
  function setQuality(name){
    const q=qualityProfile(name,devicePixelRatio||1);
    currentQuality=q.name;dynamicRatio=q.pixelRatio;
    renderer.setPixelRatio(dynamicRatio);
    renderer.shadowMap.enabled=q.shadows;
    sunLight.castShadow=q.shadows;
    const targetShadowSize=q.shadowMapSize||1024;
    if(sunLight.shadow.mapSize.x!==targetShadowSize){
      sunLight.shadow.mapSize.set(targetShadowSize,targetShadowSize);
      sunLight.shadow.map?.dispose?.();
      sunLight.shadow.map=null;
    }
    if(q.name==='low'||q.name==='eco'){
      currentAOMode='off';
    }
    postProcessor.setConfig({ ao: currentAOMode, quality: currentQuality });
    ambientMotes.visible=q.particles;
    graphics.setQuality(q.name==='low'?'eco':q.name==='medium'?'auto':q.name);
    fpsCount=0;fpsElapsed=0;
    resize();
    return {...q,aoMode:currentAOMode};
  }
  function observeRenderRate(dt){
    if(paused||document.hidden)return;
    fpsCount++;fpsElapsed+=dt;
    if(fpsElapsed>=0.6){
      lastFps=Math.round(fpsCount/fpsElapsed);
    }
    if((currentQuality!=='auto'&&currentQuality!=='medium')||fpsCount<150||fpsElapsed<2.4)return;
    lastFps=Math.round(fpsCount/fpsElapsed);
    const next=tuneAutoRatio(dynamicRatio,lastFps,devicePixelRatio||1);
    if(Math.abs(next-dynamicRatio)>.02){dynamicRatio=next;renderer.setPixelRatio(next);resize();}
    fpsCount=0;fpsElapsed=0;
  }


  // Lazy, grade-local exhibit construction avoids rebuilding 63 3D models (and
  // dozens of Canvas textures) on every library refresh. Preserve the catalog
  // itself; only the visible room is populated and cached until its data changes.
  const roomSignatureCache = new Map();
  function loadRoomExhibits(targetGrade){
    if(!GRADES.includes(targetGrade))return;
    const signature=`${activePortal||'original'}|${pages[targetGrade]||0}|`+roomCatalogSignature(allItems,targetGrade,pages[targetGrade]||0);
    if(roomSignatureCache.get(targetGrade)===signature)return;
    const layer=modelLayers[targetGrade];if(!layer)return;
    for(let j=exhibitModels.length-1;j>=0;j--){
      const m=exhibitModels[j];if(m.item.grade!==targetGrade)continue;
      for(const component of [m.model,m.label,m.hologram]){
        component?.parent?.remove(component);if(component)disposeObject(component);
      }
      exhibitModels.splice(j,1);
    }
    const selection=targetGrade===6&&!activePortal?[]:activePortal?portalExhibits(allItems,targetGrade,activePortal).slice((pages[targetGrade]||0)*9,(pages[targetGrade]||0)*9+9):catalogRoomSelection(allItems,targetGrade,pages[targetGrade]||0);
    const slots=activePortal?(PORTAL_LAYOUT[Math.min(9,selection.length)]||[]):[0,1,2,3,4,5,6,7,8];
    for(let i=0;i<9;i++){
      const plinth=layer.children[i];if(!plinth)continue;
      // Three permanent plinth components are retained: granite base, LED trim, marble top.
      for(const child of [...plinth.children].slice(3)){plinth.remove(child);disposeObject(child);}
      const spot=slots.indexOf(i),item=spot>=0?selection[spot]:null;
      plinth.visible=targetGrade===6?!!item:!activePortal||!!item;
      plinth.userData.exhibitId=item?.id||null;
      if(!item)continue;
      const zoneAccent=targetGrade===6?zonesForGrade(6).find(z=>z.id===item.portalZone)?.accent:null;
      const led=plinth.children[1]?.material;
      if(led&&zoneAccent){led.color.set(zoneAccent);led.emissive.set(zoneAccent);}
      let obj;
      try{obj=item.virtualLab?makeMath6GalleryPreview(THREE,item):createMathModel(item);}
      catch(error){
        console.error('Loi tao hinh 3D. An buc thay vi hien sai mot khoi mac dinh:',item.id,error);
        if(item.virtualLab){plinth.visible=false;plinth.userData.exhibitId=null;continue;}
        obj=createMathModel({...item,type:'cube'});
      }
      const isGrade6Artifact=targetGrade===6&&!!item.virtualLab;
      obj.position.set(0,isGrade6Artifact?1.05:2.05,0);
      obj.userData.exhibitId=item.id;plinth.add(obj);
      const label=labelSprite(item.title,zoneAccent||ROOMS[targetGrade].accentHex,isGrade6Artifact?3.24:3.6,isGrade6Artifact?.63:.72);
      label.position.set(0,isGrade6Artifact?3.85:3.95,0);plinth.add(label);
      // Grade-six stations show the mathematics AS 3D geometry; no giant hover
      // blackboards that can cover the model. Other grades keep old holograms.
      const hologram=isGrade6Artifact?null:createHologramBillboard(item,ROOMS[targetGrade].accentHex);
      if(hologram){hologram.position.set(0,4.35,0);hologram.scale.set(.001,.001,.001);plinth.add(hologram);}
      exhibitModels.push({model:obj,label,hologram,item,isSolid:true,plinth});
    }
    roomSignatureCache.set(targetGrade,signature);
  }
  function enterPortal(zone){
    // Convert inherited portal-zone identifiers to a real thematic room.
    // R6.8 has no active legacy four/five-gate gallery runtime.
    if(typeof zone==='string' && !getRoomById(zone) && grade){
      const all=getRoomsForGrade(grade);
      const legacy=grade===6?zonesForGrade(6):PORTAL_ZONES;
      const index=legacy.findIndex(item=>item.id===zone);
      if(index>=0 && all[index])zone=all[index].roomId;
    }
    const thematic=typeof zone==='string'?getRoomById(zone):null;
    if(thematic){
      if(!grade || thematic.grade!==grade)return false;
      if(r6SpatialManager.activeThematicRoomId===zone){return r6SpatialManager.activeLabId?exitLabGallery():true;}
      const ok=r6SpatialManager.enterThematicRoom(zone,player,()=>{
        activePortal=zone;
        pages[grade]=0;
        lastPortalTransitionAt=performance.now();
        activeNearPortal=null;activeNearExhibit=null;activeNearThematicLab=null;activeNearThematicMode=null;
        clearAllMovement();camReady=false;
        // Point directly at the Lab gallery pedestals (if 2 zones straddle the center aisle, angle gently toward Zone 1 so models fill the viewport).
        const P=r6SpatialManager.getActiveRoomPlan?.();
        if(P?.zones?.length===2){
          const z0=P.zones[0];
          yaw=Math.atan2((z0.x-player.x)*0.55,(P.z-player.z));
        }else{
          yaw=ROOMS[grade].zSide===1?0:Math.PI;
        }
        targetYaw=yaw;charYaw=yaw;
        pitch=.14;targetPitch=.14;
        avatar.root.position.set(player.x,0,player.z);
        for(const gate of portalGates[grade]||[])gate.group.visible=false;
        if(modelLayers[grade])modelLayers[grade].visible=false;
        syncGrade6Scene();
        hitTargets=portalTargets();
        onPortalChange({grade,zone,items:[]});
      });
      return ok;
    }
    if (zone === null && r6SpatialManager?.activeLabId) {
      return exitLabGallery();
    }
    if (zone === null && r6SpatialManager?.activeThematicRoomId) {
      r6SpatialManager.exitThematicRoom(player);
      activePortal = null;
      lastPortalTransitionAt=performance.now();
      activeNearThematicLab=null;activeNearThematicMode=null;
      avatar.root.position.set(player.x,0,player.z);camReady=false;
      for(const gate of portalGates[grade]||[])gate.group.visible=true;
      if(modelLayers[grade])modelLayers[grade].visible=false;
      syncGrade6Scene();
      hitTargets = portalTargets();
      onPortalChange({ grade, zone: null, items: [] });
      return true;
    }
    if(!grade || (zone!==null&&!portalIsAvailable(grade,zone)))return false;
    if(zone===activePortal)return true;
    activePortal=zone;
    pages[grade]=0;
    if(grade===6){
      player.x=ROOMS[6].x;
      player.z=zone?ROOMS[6].zSide*24.0:ROOMS[6].zSide*11.5;
      yaw=0;targetYaw=0;pitch=.20;targetPitch=.20;
      avatar.root.position.set(player.x,0,player.z);camReady=false;
    }else{
      if(zone){player.x=ROOMS[grade].x;player.z=ROOMS[grade].zSide*21;}
      else{player.x=ROOMS[grade].x;player.z=ROOMS[grade].zSide*11.5;}
      avatar.root.position.set(player.x,0,player.z);camReady=false;
    }
    // R6.8: the former display model layer stays disabled.
    syncGrade6Scene();
    for(const gate of portalGates[grade]||[]){
      const active=gate.zone===zone;
      if(gate.inner.material.uniforms){gate.inner.material.uniforms.uOpacity.value=active?.8:.55;}
      else gate.inner.material.opacity=active?.39:.14;
      gate.ring.material.opacity=active?1:.8;
    }
    lastPortalTransitionAt=performance.now();
    activeNearPortal=null;activeNearExhibit=null;
    hitTargets=portalTargets();
    onPortalChange({grade,zone,items:zone?portalExhibits(allItems,grade,zone):[]});
    return true;
  }
  function enterLabGallery(labId,{teleport=true}={}){
    if(!r6SpatialManager.activeThematicRoomId)return false;
    if(r6SpatialManager.activeLabId===labId)return true;
    const ok=r6SpatialManager.enterLabGallery(labId,player,()=>{
      activeNearThematicLab=null;
      if(teleport){
        activeNearThematicMode=null;
        lastPortalTransitionAt=performance.now();
        curVelX=0;curVelZ=0;camReady=false;
        yaw=ROOMS[grade].zSide===1?0:Math.PI;
        targetYaw=yaw;charYaw=yaw;pitch=.12;targetPitch=.12;
        avatar.root.position.set(player.x,0,player.z);
      }
      hitTargets=portalTargets();
      onPortalChange({grade,zone:r6SpatialManager.activeThematicRoomId,
        labId:r6SpatialManager.activeLabId,items:[]});
    },{teleport});
    return ok;
  }
  function exitLabGallery(){
    if(!r6SpatialManager.activeLabId)return false;
    const ok=r6SpatialManager.exitLabGallery(player,()=>{
      activeNearThematicLab=null;activeNearThematicMode=null;
      lastPortalTransitionAt=performance.now();
      curVelX=0;curVelZ=0;camReady=false;
      yaw=ROOMS[grade].zSide===1?0:Math.PI;
      targetYaw=yaw;charYaw=yaw;
      avatar.root.position.set(player.x,0,player.z);
      hitTargets=portalTargets();
      onPortalChange({grade,zone:r6SpatialManager.activeThematicRoomId,labId:null,items:[]});
    });
    return ok;
  }
  const resolveExhibit=(id)=>exhibitModels.find(x=>x.item.id===id)?.item||allItems.find(x=>x.id===id)||null;
  const openExhibit=(id)=>{const model=resolveExhibit(id);if(model)onSelect(model.supplemental||model.realWorld?model:model.id);};

  function setCatalog(all){
    if(!Array.isArray(all))throw new TypeError('Museum catalog must be an array');
    allItems=all;
    // R6.8: Do not allocate the old nine model sculptures in door-only classrooms.
    setActiveRoom(grade,true);
  }

  function setActiveRoom(newGrade, force = false) {
    if (!force && grade === newGrade) return;
    if(newGrade!==grade){
      activePortal=null;pages[newGrade]=0;
      if (r6SpatialManager?.activeThematicRoomId) {
        r6SpatialManager.clearChamber();
        r6SpatialManager.activeThematicRoomId = null;
      }
      for(const gg of Object.values(portalGates))for(const gate of gg){
        if(gate.inner.material.uniforms)gate.inner.material.uniforms.uOpacity.value=.55;
        else gate.inner.material.opacity=.14;
        gate.ring.material.opacity=.8;
      }
    }
    if (r6SpatialManager) {
      r6SpatialManager.updateGradeGates(newGrade, portalGates);
    }
    // R6.8: thematic Lab doors replace these old display pedestals.
    grade = newGrade;
    // R6.8: Classrooms are door-only; original nine exhibition pedestals are retired from navigation.
    for(const g of GRADES)modelLayers[g].visible=false;
    for(const gate of portalGates[grade]||[])gate.group.visible=!r6SpatialManager.activeThematicRoomId && (grade!==6 || !activePortal);
    syncGrade6Scene();
    hitTargets=portalTargets();
    onEnter(grade);
    onPortalChange({grade,zone:activePortal,items:activePortal?portalExhibits(allItems,grade,activePortal):[]});
  }

  // Nhận diện phòng dựa trên tọa độ
  function detectRoom(x, z) {
    // R7.1 separate larger Lab gallery must remain in its parent grade.
    if(r6SpatialManager.activeThematicRoomId && r6SpatialManager.isWithinActiveChamber(x,z)) return r6SpatialManager.activeGrade;
    if (Math.abs(z) <= 7.8) return 0; // Sảnh chính
    if (z > 7.8) {
      // Phía Bắc (+Z): Lớp 6, 8, 10, 12
      const candidate = [6, 8, 10, 12].find(g => Math.abs(x - ROOMS[g].x) <= 17.0);
      return (candidate && z <= 48.0) ? candidate : 0;
    } else {
      // Phía Nam (-Z): Lớp 7, 9, 11 và Phòng Triển Lãm (x=54)
      const candidate = [7, 9, 11].find(g => Math.abs(x - ROOMS[g].x) <= 17.0);
      if (candidate && z >= -48.0) return candidate;
      if (Math.abs(x - 54) <= 17.0 && z >= -48.0) return 'lib';
      return 0;
    }
  }

  // CƠ CHẾ DI CHUYỂN TRƯỢT MƯỢT MÀ (SLIDING COLLISION)
  function changePosition(toX, toZ) {
    // Unlike the original classroom, the thematic gallery is a detached 48x56
    // room. Original global [-47.2,47.2] limits would teleport its player out.
    if (r6SpatialManager.activeThematicRoomId) {
      const next=r6SpatialManager.constrainToRoom(toX,toZ);
      player.x=next.x;player.z=next.z;
      avatar.root.position.set(player.x,0,player.z);
      return; // active grade and chapter do not change while walking inside.
    }
    const fromX = player.x, fromZ = player.z;
    let targetX = THREE.MathUtils.clamp(toX, -74.0, 74.0);
    let targetZ = THREE.MathUtils.clamp(toZ, -47.2, 47.2);

    const fromRoom = detectRoom(fromX, fromZ);

    // Kiểm tra đi qua tường ngăn giữa sảnh và các phòng
    if (fromRoom === 0) {
      if (targetZ > 7.8) {
        const targetRoom = [6, 8, 10, 12].find(g => Math.abs(targetX - ROOMS[g].x) <= 17.0);
        if (!targetRoom || Math.abs(targetX - ROOMS[targetRoom].x) > 3.2) {
          targetZ = 7.7;
        }
      } else if (targetZ < -7.8) {
        const targetRoom = [7, 9, 11].find(g => Math.abs(targetX - ROOMS[g].x) <= 17.0);
        const isLib = Math.abs(targetX - 54) <= 17.0;
        const doorX = targetRoom ? ROOMS[targetRoom].x : isLib ? 54 : 999;
        if (Math.abs(targetX - doorX) > 3.2) {
          targetZ = -7.7;
        }
      }
    } else if (fromRoom === 'lib') {
      // Đang ở trong phòng Triển lãm Toán học (tâm x=54, z=-28, rộng 34, sâu 40, cửa tại z=-8)
      targetX = THREE.MathUtils.clamp(targetX, 54 - 16.5, 54 + 16.5);
      if (Math.abs(targetX - 54) > 3.2) {
        targetZ = THREE.MathUtils.clamp(targetZ, -47.2, -8.1);
      } else {
        targetZ = THREE.MathUtils.clamp(targetZ, -47.2, 7.7);
      }
    } else {
      const rCfg = ROOMS[fromRoom];
      if (rCfg) {
        targetX = THREE.MathUtils.clamp(targetX, rCfg.x - 16.5, rCfg.x + 16.5);
        if (rCfg.zSide === 1) {
          if (Math.abs(targetX - rCfg.x) > 3.2) targetZ = THREE.MathUtils.clamp(targetZ, 8.1, 47.2);
          else targetZ = THREE.MathUtils.clamp(targetZ, -7.7, 47.2);
        } else {
          if (Math.abs(targetX - rCfg.x) > 3.2) targetZ = THREE.MathUtils.clamp(targetZ, -47.2, -8.1);
          else targetZ = THREE.MathUtils.clamp(targetZ, -47.2, 7.7);
        }
      }
    }

    // Stable circle-collider sweep for pedestals: slide along free axes.
    const curRoom = detectRoom(targetX, targetZ);
    if (!r6SpatialManager.activeThematicRoomId && modelLayers[curRoom]?.visible && curRoom && ROOMS[curRoom]) {
      const centres=(ROOMS[curRoom].zSide===1?SLOTS_POS:SLOTS_NEG).map(([dx,pz])=>[ROOMS[curRoom].x+dx,pz]);
      const resolved=resolvePlinthSlide(fromX,fromZ,targetX,targetZ,centres,1.70);
      targetX=resolved.x;targetZ=resolved.z;
    }

    player.x = targetX;
    player.z = targetZ;
    avatar.root.position.set(player.x, 0, player.z);

    setActiveRoom(detectRoom(player.x, player.z));
  }

  function toGrade(g) {
    if (g === 'lib' || String(g).toLowerCase() === 'lib' || g === 'exhibition') {
      if (r6SpatialManager.activeLabId) exitLabGallery();
      if (r6SpatialManager.activeThematicRoomId) enterPortal(null);
      player.x = 54;
      player.z = -18.0;
      yaw = Math.PI; targetYaw = Math.PI;
      charYaw = Math.PI;
      pitch = 0.22; targetPitch = 0.22;
      avatar.root.position.set(player.x, 0, player.z);
      setActiveRoom('lib', true);
      return;
    }
    const num = Number(g);
    if (!GRADES.includes(num)) return;
    if (r6SpatialManager.activeLabId) exitLabGallery();
    if (r6SpatialManager.activeThematicRoomId) enterPortal(null);
    const cfg = ROOMS[num];
    player.x = cfg.x;
    if (cfg.zSide === 1) {
      player.z = 19.0;
      yaw = 0; targetYaw = 0;
      charYaw = 0;
    } else {
      player.z = -19.0;
      yaw = Math.PI; targetYaw = Math.PI;
      charYaw = Math.PI;
    }
    pitch = 0.22; targetPitch = 0.22;
    avatar.root.position.set(player.x, 0, player.z);
    setActiveRoom(num, true);
  }

  function toHall() {
    if (r6SpatialManager.activeLabId) exitLabGallery();
    if (r6SpatialManager.activeThematicRoomId) enterPortal(null);
    player.x = 0;
    player.z = 0;
    yaw = 0; targetYaw = 0;
    pitch = 0.22; targetPitch = 0.22;
    charYaw = 0;
    avatar.root.position.set(player.x, 0, player.z);
    setActiveRoom(0, true);
  }

  // [MATHVERSE EXHIBITION CORE R74] Shared handler for pointer and crosshair click.
  const exhibitionWorldPosition=new THREE.Vector3();
  function handleExhibitionHit(object){
    const action=object.userData?.mathExhibitionAction;
    const id=object.userData?.mathHistoryId;
    if(!action&&!id)return false;
    object.getWorldPosition(exhibitionWorldPosition);
    if(Math.hypot(player.x-exhibitionWorldPosition.x,player.z-exhibitionWorldPosition.z)<8.5){
      if(action)window.dispatchEvent(new CustomEvent('mathverse:exhibition-action',{detail:action}));
      else window.dispatchEvent(new CustomEvent('mathverse:history-open',{detail:{id}}));
    }
    return true;
  }
  function pointerRay(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    pickRaycaster.setFromCamera(mouse, camera);
    const hits = pickRaycaster.intersectObjects(hitTargets, true);
    for (const hit of hits) {
      let cur = hit.object;
      while (cur) {
        if(handleExhibitionHit(cur))return;
        if(cur.userData.isLabReturn){exitLabGallery();return;}
        if(cur.userData.isReturnGate || cur.userData.portalReturn){enterPortal(null);return;}
        if(cur.userData.thematicRoomId){enterPortal(cur.userData.thematicRoomId);return;}
          if(cur.userData.thematicMode || cur.userData.modeId){onSelect?.(cur.userData.thematicMode || cur.userData.modeId);return;}
        if(cur.userData.thematicLabId){onSelect?.({kind:"r6-lab",labId:cur.userData.thematicLabId,roomId:cur.userData.thematicRoomForLab});return;}
        if(cur.userData.portalKey){enterPortal(cur.userData.portalKey);return;}
        if(cur.userData.thematicMode || cur.userData.modeId){
          if(onSelect)onSelect(cur.userData.thematicMode || cur.userData.modeId);
          return;
        }
        if (cur.userData.npcData) {
          if (onNPCInteract) onNPCInteract(cur.userData.npcData);
          return;
        }
        if (cur.userData.exhibitId) {
          openExhibit(cur.userData.exhibitId);
          return;
        }
        cur = cur.parent;
      }
    }
  }

  let dragging = null;
  canvas.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    dragging = { x: e.clientX, y: e.clientY, px: e.clientX, py: e.clientY, moved: 0 };
    canvas.setPointerCapture?.(e.pointerId);
  });

  canvas.addEventListener('pointermove', e => {
    if (!dragging || paused) return;
    const dx = e.clientX - dragging.px, dy = e.clientY - dragging.py;
    dragging.px = e.clientX;
    dragging.py = e.clientY;
    dragging.moved += Math.abs(dx) + Math.abs(dy);

    targetYaw += dx * 0.0030;
    targetPitch = THREE.MathUtils.clamp(targetPitch + dy * 0.0022, -0.45, 0.95);
  });

  canvas.addEventListener('pointerup', e => {
    if (dragging && dragging.moved < 9 && !paused) pointerRay(e);
    dragging = null;
  });
  canvas.addEventListener('pointercancel', () => dragging = null);

  // R9 UI: hover card over 3D pedestals (throttled, read-only raycast).
  let r9HoverAt = 0, r9HoverId = null;
  const r9Mouse = new THREE.Vector2();
  function r9EmitHover(detail) {
    const id = detail ? detail.modeId : null;
    canvas.style.cursor = detail ? 'pointer' : '';
    if (id === r9HoverId && !detail) return;
    r9HoverId = id;
    window.dispatchEvent(new CustomEvent('mv-hover-mode', { detail }));
  }
  canvas.addEventListener('pointermove', e => {
    if (dragging || paused || isPointerLocked) { if (r9HoverId) r9EmitHover(null); return; }
    const now = performance.now(); if (now - r9HoverAt < 70) return; r9HoverAt = now;
    const exs = r6SpatialManager?.thematicExhibits;
    if (!exs?.length) { if (r9HoverId) r9EmitHover(null); return; }
    const rect = canvas.getBoundingClientRect();
    r9Mouse.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    pickRaycaster.setFromCamera(r9Mouse, camera);
    const hit = pickRaycaster.intersectObjects(exs.map(x => x.plinth), true)[0];
    let cur = hit?.object; while (cur && !cur.userData?.thematicMode) cur = cur.parent;
    const ex = cur ? exs.find(x => x.plinth === cur) : null;
    if (!ex) { if (r9HoverId) r9EmitHover(null); return; }
    const zone = r6SpatialManager.labZones?.find(z => z.lab.labId === ex.labId);
    const item = r6SpatialManager.activeRoomPlan?.objects?.find(o => o.mode.id === ex.mode.id && o.labId === ex.labId);
    r9EmitHover({ modeId: ex.mode.id, name: ex.mode.name, labId: ex.labId, labName: zone?.lab?.name || '',
      zone: zone?.zone?.index ?? 0, index: item?.index ?? 0, clientX: e.clientX, clientY: e.clientY });
  });
  canvas.addEventListener('pointerleave', () => { if (r9HoverId) r9EmitHover(null); });

  // CHẾ ĐỘ KHÓA CON TRỎ CHUỘT (POINTER LOCK)
  let isPointerLocked = false;
  document.addEventListener('pointerlockchange', () => {
    isPointerLocked = (document.pointerLockElement === canvas);
    if (onPointerLockChange) onPointerLockChange(isPointerLocked);
  });

  document.addEventListener('mousemove', e => {
    if (!isPointerLocked || paused) return;
    targetYaw += e.movementX * 0.0022;
    targetPitch = THREE.MathUtils.clamp(targetPitch - e.movementY * 0.0018, -0.45, 0.95);
  });

  canvas.addEventListener('click', () => {
    if (isPointerLocked && !paused) {
      pickRaycaster.setFromCamera({ x: 0, y: 0 }, camera);
      const hits = pickRaycaster.intersectObjects(hitTargets, true);
      for (const hit of hits) {
        let cur = hit.object;
        while (cur) {
          if(handleExhibitionHit(cur))return;
          if(cur.userData.isLabReturn){exitLabGallery();return;}
        if(cur.userData.isReturnGate || cur.userData.portalReturn){enterPortal(null);return;}
          if(cur.userData.thematicRoomId){enterPortal(cur.userData.thematicRoomId);return;}
          if(cur.userData.thematicLabId){onSelect?.({kind:"r6-lab",labId:cur.userData.thematicLabId,roomId:cur.userData.thematicRoomForLab});return;}
          if(cur.userData.portalKey){enterPortal(cur.userData.portalKey);return;}
          if(cur.userData.thematicMode || cur.userData.modeId){
            if(onSelect)onSelect(cur.userData.thematicMode || cur.userData.modeId);
            return;
          }
          if (cur.userData.npcData) {
            if (onNPCInteract) onNPCInteract(cur.userData.npcData);
            return;
          }
          if (cur.userData.exhibitId) {
            openExhibit(cur.userData.exhibitId);
            return;
          }
          cur = cur.parent;
        }
      }
    }
  });

  function togglePointerLock() {
    if (document.pointerLockElement === canvas) {
      document.exitPointerLock?.();
      return false;
    } else {
      canvas.requestPointerLock?.();
      return true;
    }
  }

  // CHUẨN HÓA BỘ PHÍM BẤM CHỐNG LỖI UNIKEY VÀ HỖ TRỢ PHÍM QUAY Q / E
  function normalizeKey(e) {
    const codeMap = {
      'KeyW': 'w', 'KeyA': 'a', 'KeyS': 's', 'KeyD': 'd',
      'KeyQ': 'q', 'KeyE': 'e',
      'ArrowUp': 'arrowup', 'ArrowDown': 'arrowdown',
      'ArrowLeft': 'arrowleft', 'ArrowRight': 'arrowright',
      'ShiftLeft': 'shift', 'ShiftRight': 'shift'
    };
    if (codeMap[e.code]) return codeMap[e.code];
    const k = (e.key || '').toLowerCase();
    if (['w', 'a', 's', 'd', 'q', 'e', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'].includes(k)) return k;
    return null;
  }

  const isTyping = el =>
    el?.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes((el?.tagName || '').toUpperCase()) ||
    el?.closest?.('input, textarea, select, [contenteditable="true"], [contenteditable=""]');

  window.addEventListener('keydown', e => {
    if (paused || isTyping(e.target)) return;
    const k = normalizeKey(e);
    if (k) {
      keys.add(k);
      if (k.startsWith('arrow')) e.preventDefault();
    }
  });

  window.addEventListener('keyup', e => {
    const k = normalizeKey(e);
    if (k) keys.delete(k);
    if (e.key) keys.delete(e.key.toLowerCase());
  });

  let isSprint = false;
  const camPos = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();
  const cameraGoal = new THREE.Vector3();
  const lookGoal = new THREE.Vector3();
  const pedestalWorldPos = new THREE.Vector3();
  let camReady = false;
  let curVelX = 0, curVelZ = 0;
  let jumpY = 0;
  let jumpVel = 0;
  const GRAVITY = 17.0;
  let targetCamDist = 5.2;
  let curCamDist = 5.2;

  // Thu phóng camera mượt mà bằng con lăn chuột (Smooth Mouse Wheel Zoom)
  canvas.addEventListener('wheel', e => {
    if (paused) return;
    e.preventDefault();
    if (aerialMode === 'overview') return;
    if (aerialMode === 'iso') { isoHeight = THREE.MathUtils.clamp(isoHeight + e.deltaY * 0.02, 8, 40); return; }
    if (isTopView) { topHeight = THREE.MathUtils.clamp(topHeight + e.deltaY * 0.03, 12, 64); return; }
    targetCamDist = THREE.MathUtils.clamp(targetCamDist + e.deltaY * 0.0035, 2.2, 8.5);
  }, { passive: false });

  function clearAllMovement() {
    keys.clear();
    virtualKeys.clear();
    curVelX = 0;
    curVelZ = 0;
  }

  window.addEventListener('blur', clearAllMovement);
  window.addEventListener('focus', clearAllMovement);
  document.addEventListener('visibilitychange', clearAllMovement);
  window.addEventListener('keydown', e => {
    if (paused || isTyping(e.target)) return;
    if (e.code === 'Space' || e.key === ' ') {
      if (e.target?.closest?.('button, a, [role="button"], .r6-crumb')) return;
      if (jumpY <= 0.01) {
        jumpVel = 5.4;
        playJumpSound();
      }
      e.preventDefault();
      return;
    }
    if ((e.code === 'KeyE' || e.key === 'e' || e.key === 'E') && !e.repeat) {
      if (interactNearby()) {
        e.preventDefault();
        return;
      }
    }
  });

  window.addEventListener('mathverse:exhibition-exit-to-lab-lobby', () => {
    toHall();
  });

  window.addEventListener('message', e => {
    const msg = e.data;
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'mathverse-r75-cam') {
      if (msg.preset === 'eye') {
        setViewMode('first');
      } else if (msg.preset === 'near') {
        setViewMode('third');
        targetCamDist = 3.2;
      } else if (msg.preset === 'far') {
        setViewMode('third');
        targetCamDist = 7.6;
      }
    } else if (msg.type === 'mathverse-r75-sprint') {
      isSprint = typeof msg.active === 'boolean' ? msg.active : !isSprint;
    } else if (msg.type === 'mathverse-r75-to-hall') {
      toHall();
    }
  });

  function resize() {
    const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
    renderer.setSize(w, h, false);
    postProcessor.setSize(w, h, dynamicRatio);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  const clock = new THREE.Clock();

  function tick() {
    if (destroyed) return;
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    // [EXHIBITION CORE] Animate only nearby hallway boards; show the gallery button only in the room.
    mathHistoryGallery?.syncProximity(player.x,player.z);
    observeRenderRate(dt);

    if (!paused && !document.hidden) {
      const now = performance.now();
      graphics.animate(dt);

      // R10.1: Xoay nhẹ nhàng các biểu tượng Hologram 3D trên đỉnh cổng
      for (let i = 0; i < rotatingHologramCrests.length; i++) {
        rotatingHologramCrests[i].rotation.y += dt * 0.75;
      }

      // Cập nhật vật lý nhảy tự nhiên (Smooth Jump Physics)
      if (jumpVel !== 0 || jumpY > 0) {
        jumpY += jumpVel * dt;
        jumpVel -= GRAVITY * dt;
        if (jumpY <= 0) {
          jumpY = 0;
          jumpVel = 0;
        }
      }

      // Chuyển động xoay góc nhìn siêu mượt
      yaw = THREE.MathUtils.damp(yaw, targetYaw, 22, dt);
      pitch = THREE.MathUtils.damp(pitch, targetPitch, 22, dt);

      // Quay góc nhìn bằng phím Q / E hoặc phím mũi tên trái / phải
      if (keys.has('q') || virtualKeys.has('q')) {
        targetYaw -= dt * 1.8;
      }
      if (keys.has('e') || virtualKeys.has('e')) {
        targetYaw += dt * 1.8;
      }

      const hasW = keys.has('w') || keys.has('arrowup') || virtualKeys.has('w');
      const hasS = keys.has('s') || keys.has('arrowdown') || virtualKeys.has('s');
      const hasA = keys.has('a') || keys.has('arrowleft') || virtualKeys.has('a');
      const hasD = keys.has('d') || keys.has('arrowright') || virtualKeys.has('d');
      const hasShift = keys.has('shift') || virtualKeys.has('shift') || isSprint;

      const f = (hasW ? 1 : 0) - (hasS ? 1 : 0);
      const side = (hasD ? 1 : 0) - (hasA ? 1 : 0);
      const isMoving = (f !== 0 || side !== 0);

      const targetSpeed = playerSpeed * (hasShift ? 1.8 : 1.0);
      let targetMoveDx = 0, targetMoveDz = 0;

      if (isMoving) {
        const move=normalizedMove(f,side,yaw,targetSpeed);
        targetMoveDx=move.x;targetMoveDz=move.z;

        const targetYawHeading = Math.atan2(targetMoveDx, targetMoveDz);
        const diff = THREE.MathUtils.euclideanModulo(targetYawHeading - charYaw + Math.PI, Math.PI * 2) - Math.PI;
        charYaw = THREE.MathUtils.damp(charYaw, charYaw + diff, 15, dt);

        // Nghiêng người tự nhiên khi rẽ cua ở tốc độ cao (Body Banking Tilt)
        const turnLean = THREE.MathUtils.clamp(-diff * 0.24, -0.18, 0.18);
        avatar.body.rotation.z = THREE.MathUtils.damp(avatar.body.rotation.z, turnLean, 12, dt);
      } else {
        avatar.body.rotation.z = THREE.MathUtils.damp(avatar.body.rotation.z, 0, 12, dt);
      }

      // Dynamic FOV khi chạy nước rút (Sprint Speed Warp)
      const targetFov = hasShift && isMoving ? 66 : 60;
      if (Math.abs(camera.fov - targetFov) > 0.05) {
        camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 10, dt);
        camera.updateProjectionMatrix();
      }

      // Gia tốc mượt mà có quán tính như game AAA (không bị giật khựng)
      const accel = isMoving ? 16 : 20;
      curVelX = THREE.MathUtils.damp(curVelX, targetMoveDx, accel, dt);
      curVelZ = THREE.MathUtils.damp(curVelZ, targetMoveDz, accel, dt);

      const curSpeed = Math.hypot(curVelX, curVelZ);
      if (curSpeed > 0.008) {
        changePosition(player.x + curVelX * dt, player.z + curVelZ * dt);
      }

      avatar.root.position.set(player.x, jumpY, player.z);
      const speedRatio = curSpeed / Math.max(0.1, playerSpeed);
      avatar.updateAnimation(dt, speedRatio, charYaw, jumpY);

      // Âm thanh bước chân nhịp nhàng chân thực khi đi trên sàn
      if (isMoving && jumpY === 0) {
        const stepInterval = hasShift ? 230 : 340;
        if (now - lastFootstepTime > stepInterval) {
          lastFootstepTime = now;
          onFootstep?.();
        }
      }

      // TOÀN BỘ MÔ HÌNH 3D TRÊN BỤC TỰ XOAY TRÒN & BẢNG HOLOGRAM TRẠM THÔNG MINH
      const nowMs = performance.now();

      // Cập nhật bụi sáng lơ lửng chuyển động chậm rãi
      ambientMotes.position.y=Math.sin(nowMs*.00048)*.07;
      ambientMotes.rotation.y=Math.sin(nowMs*.00004)*.015;

      // 1. Cập nhật 8 NPC Hướng Dẫn Viên Ảo
      activeNearPortal=null;
      if(grade){let near=2.4;
        const candidates=(portalGates[grade]||[]).filter(gate=>gate.group.visible);
        if(grade===6&&grade6ReturnGate.group.visible)candidates.push(grade6ReturnGate);
        for(const gate of candidates){
          const d=Math.hypot(player.x-gate.x,player.z-gate.z);
          if(d<near){near=d;activeNearPortal=gate;}
          if(gate.core)gate.core.rotation.y+=dt*.34;
          if(gate.shader)gate.shader.uniforms.uTime.value=nowMs*.001;
        }
        // Walking THROUGH a portal is a genuine spatial transition.
        if(activeNearPortal&&near<1.15&&nowMs-lastPortalTransitionAt>1200){
          enterPortal(activeNearPortal.thematicRoomId || activeNearPortal.zone);return;
        }
      }
      if (r6SpatialManager) {
        const r6Ev = r6SpatialManager.update(dt, nowMs, player);
        activeNearThematicLab=r6Ev?.action==='nearLab'?r6Ev:null;
        activeNearThematicMode=r6Ev?.action==='nearMode'?r6Ev:null;
        if(r6Ev?.action==='labReturn'){
          activeNearThematicLab=null;activeNearThematicMode=null;
          lastPortalTransitionAt=nowMs;
          avatar.root.position.set(player.x,0,player.z);camReady=false;
          hitTargets=portalTargets();
          onPortalChange({grade,zone:r6SpatialManager.activeThematicRoomId,labId:null,items:[]});
        }
        if (r6Ev?.action === 'exit') {
          activePortal = null;
          activeNearThematicLab=null;activeNearThematicMode=null;
          activeNearThematicMode=null;
          lastPortalTransitionAt=nowMs;
          avatar.root.position.set(player.x,0,player.z);camReady=false;
          for(const gate of portalGates[grade]||[])gate.group.visible=true;
          if(modelLayers[grade])modelLayers[grade].visible=false;
          syncGrade6Scene();
          hitTargets = portalTargets();
          onPortalChange({ grade, zone: null, items: [] });
        }
      }
      activeNearNpc = null;
      for (const npc of npcGuides) {
        const dist = Math.hypot(player.x - npc.x, player.z - npc.z);
        const isNear = dist < 4.2;
        if (isNear) {
          activeNearNpc = npc;
          const targetAngle = Math.atan2(player.x - npc.x, player.z - npc.z);
          npc.avatar.root.rotation.y = THREE.MathUtils.damp(npc.avatar.root.rotation.y, targetAngle, 8, dt);
          npc.currentScale = THREE.MathUtils.damp(npc.currentScale, 1.0, 10, dt);
        } else {
          npc.currentScale = THREE.MathUtils.damp(npc.currentScale, 0.001, 14, dt);
        }
        npc.bubble.scale.set(4.2 * npc.currentScale, 1.58 * npc.currentScale, 1);
        npc.avatar.updateAnimation(dt, false, 0, 0);
      }

      // 2. Cập nhật Mô hình 3D và Bảng Hologram Tương Tác Trạm Thông Minh
      activeNearExhibit = null;
      closestDist = 999;
      for (const m of exhibitModels) {
        if (m.item.grade === grade && m.model && m.plinth?.visible) {
            m.plinth.getWorldPosition(pedestalWorldPos);
            const dist = Math.hypot(player.x - pedestalWorldPos.x, player.z - pedestalWorldPos.z);
            if(m.model.userData.gallery3D){
              // Turn no planar relief edge-on: tiny, calm motion reveals its depth.
              m.model.rotation.y=0;
              m.model.userData.animate?.(nowMs*.001);
            }else m.model.rotation.y+=dt*(dist<3.5?.035:.16);
            const led=m.plinth.children[1]?.material;
            if(led?.emissive){led.emissiveIntensity=THREE.MathUtils.damp(led.emissiveIntensity,dist<3.5?.55:.17,8,dt);}
            if(dist<3.2&&dist<closestDist){closestDist=dist;activeNearExhibit=m.item;}
            if(m.hologram){
            if (dist < 3.2) {
              if (dist < closestDist) {
                closestDist = dist;
                activeNearExhibit = m.item;
              }
              m.hologram.scale.x = THREE.MathUtils.damp(m.hologram.scale.x, 4.0, 12, dt);
              m.hologram.scale.y = THREE.MathUtils.damp(m.hologram.scale.y, 1.55, 12, dt);
              m.hologram.scale.z = 1;
              m.hologram.position.y = 4.35 + Math.sin(nowMs * 0.003) * 0.06;
            } else {
              m.hologram.scale.x = THREE.MathUtils.damp(m.hologram.scale.x, 0.001, 16, dt);
              m.hologram.scale.y = THREE.MathUtils.damp(m.hologram.scale.y, 0.001, 16, dt);
            }
          }
        }
      }
    }

    // Camera theo sau nhân vật mượt mà
    if (aerialMode) {
      // R9: 3/4 view follows the player; overview frames the whole active room.
      avatar.root.visible = true;
      const nowT = performance.now();
      if (nowT - r8CeilingScanAt > 900) { r8CeilingScanAt = nowT; r8HideCeilings(); }
      let tx, ty, tz, lx, lz;
      if (aerialMode === 'iso') {
        const fx = Math.sin(yaw), fz = Math.cos(yaw);
        ty = isoHeight; tx = player.x - fx * isoHeight * .78; tz = player.z - fz * isoHeight * .78;
        lx = player.x + fx * 2.5; lz = player.z + fz * 2.5;
        upGoal.set(0, 1, 0);
      } else {
        const f = r9OverviewFrame();
        tx = f.x; ty = f.h; tz = f.z - f.upZ * f.h * .05; lx = f.x; lz = f.z;
        upGoal.set(0, 0, f.upZ);
      }
      if (!camReady) { camPos.set(tx, ty, tz); lookTarget.set(lx, 0, lz); camera.up.copy(upGoal); camReady = true; }
      else {
        camPos.lerp(cameraGoal.set(tx, ty, tz), 1 - Math.exp(-5 * dt));
        lookTarget.lerp(lookGoal.set(lx, 0, lz), 1 - Math.exp(-7 * dt));
        camera.up.lerp(upGoal, 1 - Math.exp(-6 * dt)).normalize();
      }
      camera.position.copy(camPos);
      camera.lookAt(lookTarget);
    } else if (isTopView) {
      // R8: bird's-eye camera, screen-up = the walking direction (W key).
      avatar.root.visible = true;
      const nowT = performance.now();
      if (nowT - r8CeilingScanAt > 900) { r8CeilingScanAt = nowT; r8HideCeilings(); }
      curTopHeight = THREE.MathUtils.damp(curTopHeight, topHeight, 8, dt);
      const fx = Math.sin(yaw), fz = Math.cos(yaw);
      const tx = player.x - fx * curTopHeight * .30, tz = player.z - fz * curTopHeight * .30;
      const lx = player.x + fx * curTopHeight * .14, lz = player.z + fz * curTopHeight * .14;
      upGoal.set(fx, 0, fz);
      if (!camReady) {
        camPos.set(tx, curTopHeight, tz); lookTarget.set(lx, 0, lz); camera.up.copy(upGoal); camReady = true;
      } else {
        camPos.lerp(cameraGoal.set(tx, curTopHeight, tz), 1 - Math.exp(-6 * dt));
        lookTarget.lerp(lookGoal.set(lx, 0, lz), 1 - Math.exp(-8 * dt));
        camera.up.lerp(upGoal, 1 - Math.exp(-6 * dt)).normalize();
      }
      camera.position.copy(camPos);
      camera.lookAt(lookTarget);
    } else if (isThirdPerson) {
      if (camera.up.y < .9999) camera.up.lerp(upGoal.set(0, 1, 0), 1 - Math.exp(-6 * dt)).normalize();
      curCamDist = THREE.MathUtils.damp(curCamDist, targetCamDist, 14, dt);
      const camDist = curCamDist;
      avatar.root.scale.setScalar(0.84);
      avatar.root.visible = camDist >= 2.15;

      // Góc nhìn thứ 3 nâng cao qua vai phải (Over-the-shoulder & Elevated) để nhân vật
      // không bao giờ che tâm ngắm (+) hay chắn tầm nhìn tới bảng và các cổng phía trước.
      const camH = 2.18 + jumpY * 0.55;
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const fwdX = Math.sin(yaw);
      const fwdZ = Math.cos(yaw);
      const rightX = -Math.cos(yaw);
      const rightZ = Math.sin(yaw);
      const shoulderOffset = 0.42;
      const lookAhead = 3.6;

      const targetX = player.x + rightX * shoulderOffset - camDist * fwdX * cosP;
      const targetY = Math.max(0.55, camH + camDist * sinP);
      const targetZ = player.z + rightZ * shoulderOffset - camDist * fwdZ * cosP;
      const lookX = player.x + rightX * (shoulderOffset * 0.65) + fwdX * lookAhead * cosP;
      const lookY = Math.max(0.65, (1.96 + jumpY * 0.55) - lookAhead * sinP * 0.65);
      const lookZ = player.z + rightZ * (shoulderOffset * 0.65) + fwdZ * lookAhead * cosP;

      if (!camReady) {
        camPos.set(targetX, targetY, targetZ);
        lookTarget.set(lookX, lookY, lookZ);
        camReady = true;
      } else {
        camPos.lerp(cameraGoal.set(targetX,targetY,targetZ), 1-Math.exp(-14*dt));
        lookTarget.lerp(lookGoal.set(lookX,lookY,lookZ), 1-Math.exp(-18*dt));
      }

      camera.position.copy(camPos);
      camera.lookAt(lookTarget);
    } else {
      avatar.root.visible = false;
      camera.position.set(player.x, 1.75 + jumpY, player.z);
      camera.rotation.set(pitch, Math.PI + yaw, 0, 'YXZ');
      camReady = false;
    }

    r6SpatialManager?.updateLabelLOD?.(player, isTopView || !!aerialMode, aerialMode === 'overview' ? camPos : null);
    if(!document.hidden){
      if(currentAOMode!=='off')postProcessor.render();
      else renderer.render(scene,camera);
      if(onTick)onTick();
    }
  }

  function resetCamSnap() {
    camReady = false;
    curVelX = 0;
    curVelZ = 0;
  }

  const origToGrade = toGrade;
  toGrade = function(g) {
    resetCamSnap();
    origToGrade(g);
  };
  const origToHall = toHall;
  function interactNearby() {
    // [MATHVERSE EXHIBITION CORE R74] E works for exhibits when there is no active SGK door/lab.
    if(!activeNearThematicMode&&!activeNearThematicLab&&!activeNearPortal&&mathHistoryTargets.length){
      let nearest=null,nearestDist=4.6;
      for(const target of mathHistoryTargets){
        const action=target.userData?.mathExhibitionAction;
        const id=target.userData?.mathHistoryId;
        if(!action&&!id)continue;
        target.getWorldPosition(exhibitionWorldPosition);
        const dist=Math.hypot(player.x-exhibitionWorldPosition.x,player.z-exhibitionWorldPosition.z);
        if(dist<nearestDist){nearestDist=dist;nearest={action,id};}
      }
      if(nearest){
        if(nearest.action)window.dispatchEvent(new CustomEvent('mathverse:exhibition-action',{detail:nearest.action}));
        else window.dispatchEvent(new CustomEvent('mathverse:history-open',{detail:{id:nearest.id}}));
        return true;
      }
    }

    if(activeNearThematicMode?.modeId){onSelect?.(activeNearThematicMode.modeId);return true;}
    if(activeNearThematicLab){onSelect?.({kind:'r6-lab',
      labId:activeNearThematicLab.labId,roomId:activeNearThematicLab.roomId});return true;}
    if(activeNearPortal){enterPortal(activeNearPortal.thematicRoomId||activeNearPortal.zone);return true;}
    if (activeNearExhibit && closestDist < 3.2) {
      openExhibit(activeNearExhibit.id);
      return true;
    }
    if (activeNearNpc) {
      if (onNPCInteract) onNPCInteract(activeNearNpc);
      return true;
    }
    return false;
  }

  toHall();
  try{setQuality(localStorage.getItem('mathverse-render-quality')||'auto');}catch{setQuality('auto');}
  tick();

  return {
    toGrade,
    toHall,
    enterPortal,
    enterThematicRoom: (roomId) => enterPortal(roomId),
    exitThematicRoom: () => enterPortal(null),
    enterLabGallery,
    exitLabGallery,
    getActiveLabGallery: () => r6SpatialManager?.activeLabId||null,
    getActiveThematicRoom: () => r6SpatialManager?.activeThematicRoomId || null,
    getRoomExhibits: () => r6SpatialManager?.getRoomExhibits?.() || [],
    focusPedestal3D: (modeId) => {
      const ex = r6SpatialManager?.getExhibitByModeId?.(modeId);
      if (!ex) return null;
      clearAllMovement();
      const zSide = ROOMS[grade]?.zSide === -1 ? -1 : 1;
      const offsetZ = -zSide * 2.55;
      const next = r6SpatialManager.constrainToRoom(ex.x + zSide * 0.35, ex.z + offsetZ);
      player.x = next.x;
      player.z = next.z;
      avatar.root.position.set(player.x, 0, player.z);
      yaw = Math.atan2(ex.x - player.x, ex.z - player.z);
      targetYaw = yaw;
      charYaw = yaw;
      pitch = 0.34;
      targetPitch = 0.34;
      targetCamDist = 3.1;
      curCamDist = 3.1;
      camReady = false;
      return ex;
    },
    getPortal:()=>activePortal,
    getPortalOptions:()=>grade?zonesForGrade(grade):[],
    interactNearby,
    getActiveNearNpc: () => activeNearNpc,
    getActiveNearExhibit: () => activeNearExhibit,
    setCatalog,
    setPage: (g, p) => {
      pages[g] = Math.max(0, Math.floor(p));
      setCatalog(allItems);
    },
    setQuality,
    setAOMode,
    getAOMode: () => currentAOMode,
    setGraphicsMode: mode => graphics.setMode(mode),
    getGraphicsMode: () => graphics.getMode(),
    getGraphicsDiagnostics: () => graphics.diagnostics(),
    getQuality:()=>({name:currentQuality,pixelRatio:dynamicRatio,fps:lastFps,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,shadowMapSize:sunLight.shadow.mapSize.x,aoMode:currentAOMode,loadedRooms:roomSignatureCache.size}),
    setPaused: b => {
      paused = !!b;
      clearAllMovement();
    },
    getGrade: () => grade,
    getPlayer: () => ({ x: player.x, z: player.z, yaw }),
    getState: () => ({
      x: player.x,
      z: player.z,
      yaw,
      pitch,
      charYaw,
      grade
    }),
    restoreState: (s) => {
      if (!s) return;
      player.x = s.x;
      player.z = s.z;
      yaw = s.yaw; targetYaw = s.yaw;
      pitch = s.pitch; targetPitch = s.pitch;
      charYaw = s.charYaw || 0;
      avatar.root.position.set(player.x, 0, player.z);
      if (s.grade !== undefined && s.grade !== grade) {
        setActiveRoom(s.grade, true);
      }
      camReady = false;
    },
    getActiveGrade: () => grade,
    setVirtualKey: (key, on) => {
      if (on) virtualKeys.add(key);
      else virtualKeys.delete(key);
    },
    toggleViewMode: () => {
      setViewMode(isTopView ? 'third' : (isThirdPerson ? 'first' : 'third'));
      return isThirdPerson;
    },
    getViewMode: () => isThirdPerson,
    setViewMode,
    getViewModeName,
    cycleViewMode: () => setViewMode({third:'top',top:'first',first:'third'}[getViewModeName()]),
    zoomTopView: (delta) => {
      if (aerialMode === 'iso') { isoHeight = THREE.MathUtils.clamp(isoHeight + delta * .6, 8, 40); return isoHeight; }
      topHeight = THREE.MathUtils.clamp(topHeight + delta, 12, 64); return topHeight;
    },
    setAerialHeight: (t) => { // R9: slider 0..1 for the current aerial preset
      const k = THREE.MathUtils.clamp(Number(t) || 0, 0, 1);
      if (aerialMode === 'iso') isoHeight = 8 + k * 32; else topHeight = 12 + k * 52;
    },
    setDaylightTheme,
    isDaylightTheme: () => isDaylightTheme,
    toggleDaylightTheme: () => {
      setDaylightTheme(!isDaylightTheme);
      return isDaylightTheme;
    },
    setBrightness,
    getBrightness: () => brightnessFactor,
    getAerialHeight: () => aerialMode === 'iso' ? (isoHeight - 8) / 32 : (topHeight - 12) / 52,
    setAvatarType: (type) => {
      avatar.setAvatarType(type);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('mathverse_avatar', type);
      }
    },
    getAvatarType: () => avatar.getAvatarType(),
    supportsChibiCartoon: true,
    toggleSprint: () => {
      isSprint = !isSprint;
      return isSprint;
    },
    getSprint: () => isSprint,
    stopMovement: () => {
      clearAllMovement();
    },
    togglePointerLock,
    isPointerLocked: () => isPointerLocked,
    dispose: () => {
      destroyed = true;
      mathHistoryGallery?.destroy();
      resizeObserver.disconnect();
      disposeObject(scene);
      renderer.dispose();
    }
  };
}
