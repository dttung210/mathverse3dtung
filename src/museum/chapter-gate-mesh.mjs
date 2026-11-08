/**
 * MATHVERSE R10.1 – HIGH RECOGNITION CHAPTER GATES (CỔNG CHƯƠNG DỄ NHẬN DIỆN)
 * Cải tiến nhận diện cổng trong không gian 3D:
 * 1. Huy hiệu Số Chương Ả Rập to bản (CHƯƠNG 1, CHƯƠNG 2, CHƯƠNG 3...) viền Neon.
 * 2. Biểu tượng Hologram 3D khung dây phát sáng xoay tròn trên đỉnh vòm cổng.
 * 3. Thảm ánh sáng dẫn đường trên sàn (Floor Decal Runway) với mũi tên phát quang.
 * 4. Bảng hiệu 2 tầng kèm số lượng bài học và mô hình.
 */

const ROMAN_TO_ARABIC = {
  'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
  'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
  'XI': 11, 'XII': 12, 'XIII': 13, 'XIV': 14
};

export function toArabicChapterNum(romanOrNum, fallbackIndex = 0) {
  if (typeof romanOrNum === 'number') return romanOrNum;
  if (!romanOrNum) return fallbackIndex + 1;
  const trimmed = String(romanOrNum).trim().toUpperCase();
  return ROMAN_TO_ARABIC[trimmed] || parseInt(trimmed, 10) || (fallbackIndex + 1);
}

/**
 * Tạo biển hiệu 2 tầng độ nét cao bằng HTML Canvas Sprite (SRGB, không bị sương mù làm mờ, tự xuống 2 dòng)
 */
export function createHighVisibilityChapterSign(THREE, {
  chapterNum,
  badgeText = '',
  unitLabel = '',
  chapterTitle,
  totalLessons = 0,
  totalModels = 0,
  accent = '#2dd4bf'
}) {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');

  // Nền bảng Obsidian Navy đậm đặc (98% opacity) tạo tương phản 16:1 trên nền tường sáng
  if (typeof ctx.createLinearGradient === 'function') {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 420);
    bgGrad.addColorStop(0, '#06101e');
    bgGrad.addColorStop(1, '#0b1d35');
    ctx.fillStyle = bgGrad;
  } else {
    ctx.fillStyle = '#06101e';
  }
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(12, 12, 1256, 396, 32);
  else ctx.rect(12, 12, 1256, 396);
  ctx.fill();

  // Viền neon phát sáng kép đậm nét + viền vàng kim bên trong
  ctx.strokeStyle = accent;
  ctx.lineWidth = 10;
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(22, 22, 1236, 376, 24);
  else ctx.rect(22, 22, 1236, 376);
  ctx.stroke();

  // Dải thanh màu chương bên trái
  ctx.fillStyle = accent;
  if (ctx.fillRect) ctx.fillRect(24, 24, 16, 372);

  // Huy hiệu Số chương / Mã cổng Ả Rập to bản
  const badgeStr = badgeText || `CHƯƠNG ${chapterNum}`;
  const badgeW = Math.max(340, Math.min(560, badgeStr.length * 24 + 64));
  ctx.fillStyle = accent;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(56, 40, badgeW, 66, 16);
  else ctx.rect(56, 40, badgeW, 66);
  ctx.fill();

  ctx.fillStyle = '#030b14';
  ctx.font = '900 34px "Be Vietnam Pro", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeStr, 56 + badgeW / 2, 73);

  // Thống kê bài học / Lab & mô hình trong khung pill vàng nổi bật
  if (unitLabel || totalModels > 0) {
    const statText = unitLabel || `${totalLessons} Bài học · ${totalModels} Mô hình 3D`;
    ctx.fillStyle = '#fef08a';
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(760, 42, 464, 62, 16);
      ctx.fill();
    }
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 28px "Be Vietnam Pro", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(statText, 992, 73);
  }

  // Đường phân cách sáng
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(56, 122);
  ctx.lineTo(1224, 122);
  ctx.stroke();

  // Tên chương SGK in hoa cỡ lớn, tự động ngắt 2 dòng để KHÔNG BỊ CẮT CHỮ
  const titleUpper = String(chapterTitle || '').trim().toUpperCase();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const maxTextW = 1160;
  ctx.font = '900 50px "Be Vietnam Pro", "Segoe UI", sans-serif';
  const measureW = (str) => (typeof ctx.measureText === 'function' ? ctx.measureText(str).width : str.length * 28);

  if (measureW(titleUpper) <= maxTextW) {
    ctx.fillText(titleUpper, 56, 206);
  } else {
    ctx.font = '900 42px "Be Vietnam Pro", "Segoe UI", sans-serif';
    const words = titleUpper.split(/\s+/);
    let line1 = '';
    let line2 = '';
    for (const w of words) {
      const test = line1 ? `${line1} ${w}` : w;
      if (!line2 && measureW(test) <= maxTextW) {
        line1 = test;
      } else {
        line2 = line2 ? `${line2} ${w}` : w;
      }
    }
    if (measureW(line2) > maxTextW) {
      ctx.font = '900 36px "Be Vietnam Pro", "Segoe UI", sans-serif';
    }
    ctx.fillText(line1, 56, 174);
    ctx.fillText(line2, 56, 232);
  }

  // Nút chỉ dẫn hành động trực quan ở đáy biển
  ctx.fillStyle = '#0f766e';
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(56, 298, 1168, 74, 18);
    ctx.fill();
  }
  ctx.strokeStyle = '#5eead4';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  ctx.font = '900 29px "Be Vietnam Pro", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('▶ BƯỚC QUA CỔNG · BẤM [E] · HOẶC NHẤP CHUỘT ĐỂ VÀO LAB', 640, 335);

  const texture = new THREE.CanvasTexture(canvas);
  if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    toneMapped: false,
    fog: false
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(4.3, 1.5, 1);
  return sprite;
}

/**
 * Tạo biểu tượng Hologram 3D khung dây neon phát sáng nhẹ xoay quanh đỉnh cổng
 */
export function createNeonWireframeCrest(THREE, { chapterNum, accent = '#2dd4bf' }) {
  const crestGroup = new THREE.Group();
  crestGroup.name = 'NeonHologramCrest';

  const color = new THREE.Color(accent);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x0f172a,
    wireframe: true,
    transparent: true,
    opacity: 0.96,
    toneMapped: false,
    fog: false
  });
  const innerMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    toneMapped: false,
    fog: false
  });

  const type = ((chapterNum - 1) % 9);

  if (type === 0) {
    // Chương 1 (Tập hợp/Số tự nhiên): Khối lập phương khung dây lồng vòng tròn Venn
    const cube = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.72, 0.72), wireMat);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.04, 8, 32), innerMat);
    ring.rotation.x = Math.PI / 4;
    crestGroup.add(cube);
    crestGroup.add(ring);
  } else if (type === 1) {
    // Chương 2 (Tính chia hết/Số nguyên tố): Khối Bát diện đều (Octahedron crystal)
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.68, 0), wireMat);
    const inner = new THREE.Mesh(new THREE.OctahedronGeometry(0.52, 0), innerMat);
    crestGroup.add(crystal);
    crestGroup.add(inner);
  } else if (type === 2) {
    // Chương 3 (Số nguyên/Trục số): Trục cân bằng hai đầu âm dương
    const axis = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), wireMat);
    axis.rotation.z = Math.PI / 2;
    const bPos = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.32), innerMat);
    bPos.position.x = 0.55;
    const bNeg = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), innerMat);
    bNeg.position.x = -0.55;
    crestGroup.add(axis);
    crestGroup.add(bPos);
    crestGroup.add(bNeg);
  } else if (type === 3) {
    // Chương 4 (Hình phẳng thực tiễn): Khối Lăng trụ lục giác đều
    const hex = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.28, 6), wireMat);
    hex.rotation.x = Math.PI / 6;
    crestGroup.add(hex);
  } else if (type === 4) {
    // Chương 5 (Tính đối xứng): Biểu tượng Cánh bướm đôi đối xứng
    const leftWing = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.8, 3), wireMat);
    leftWing.rotation.z = Math.PI / 3;
    leftWing.position.x = -0.32;
    const rightWing = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.8, 3), wireMat);
    rightWing.rotation.z = -Math.PI / 3;
    rightWing.position.x = 0.32;
    crestGroup.add(leftWing);
    crestGroup.add(rightWing);
  } else if (type === 5) {
    // Chương 6 (Phân số): Bánh tròn phân số cắt khuyết
    const cake = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.12, 10, 36, Math.PI * 1.6), wireMat);
    cake.rotation.x = Math.PI / 4;
    crestGroup.add(cake);
  } else if (type === 6) {
    // Chương 7 (Số thập phân): Thước kẹp / Khung lưới đo đạc
    const grid = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9, 4, 4), wireMat);
    grid.rotation.y = Math.PI / 6;
    crestGroup.add(grid);
  } else if (type === 7) {
    // Chương 8 (Hình học cơ bản / Góc): Vòng đo góc kim đồng hồ
    const dial = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.05, 8, 36), wireMat);
    const ray1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), innerMat);
    ray1.position.y = 0.3;
    const ray2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), innerMat);
    ray2.rotation.z = -Math.PI / 3;
    ray2.position.set(0.26, 0.15, 0);
    crestGroup.add(dial);
    crestGroup.add(ray1);
    crestGroup.add(ray2);
  } else {
    // Chương 9 (Thống kê & Xác suất): Xúc xắc 3D nghiêng
    const dice = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.65), wireMat);
    dice.rotation.set(Math.PI / 4, Math.PI / 4, 0);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), innerMat);
    crestGroup.add(dice);
    crestGroup.add(core);
  }

  // Vòng phát sáng bệ đỡ dưới chân biểu tượng
  const pedestalRing = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.035, 6, 32), wireMat);
  pedestalRing.rotation.x = Math.PI / 2;
  pedestalRing.position.y = -0.55;
  crestGroup.add(pedestalRing);

  return crestGroup;
}

/**
 * Tạo thảm ánh sáng dẫn đường trên sàn (Floor Decal Runway) tương phản cao 15:1
 */
export function createFloorDecalRunway(THREE, { chapterNum, accent = '#2dd4bf' }) {
  const runwayGroup = new THREE.Group();
  runwayGroup.name = 'FloorDecalRunway';

  // 1. Tấm thảm nền Obsidian Navy đậm tạo tương phản mạnh trên sàn phòng học
  const mat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x091628),
    transparent: true,
    opacity: 0.90,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
    fog: false
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 1.95), mat);
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(0, 0.02, 0.88); // Hướng ra phía trước cổng
  runwayGroup.add(plane);

  // 2. Viền thảm dạ quang sắc nét theo màu Chương
  const edgeMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(accent),
    transparent: true,
    opacity: 0.96,
    depthWrite: false,
    toneMapped: false,
    fog: false
  });
  const border = new THREE.Mesh(new THREE.RingGeometry(1.22, 1.34, 32), edgeMat);
  border.rotation.x = -Math.PI / 2;
  border.position.set(0, 0.024, 0.88);
  runwayGroup.add(border);

  // 3. Chữ in nổi phát sáng trên thảm dẫn đường
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = accent;
  ctx.lineWidth = 8;
  if (typeof ctx.strokeRect === 'function') ctx.strokeRect(8, 8, 624, 184);
  ctx.fillStyle = '#fef08a';
  ctx.font = '900 42px "Be Vietnam Pro", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`▲ BƯỚC VÀO CHƯƠNG ${chapterNum} ▲`, 320, 100);

  const texture = new THREE.CanvasTexture(canvas);
  if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  const textMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.98,
    depthWrite: false,
    toneMapped: false,
    fog: false
  });
  const textMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.88), textMat);
  textMesh.rotation.x = -Math.PI / 2;
  textMesh.position.set(0, 0.028, 0.96);
  runwayGroup.add(textMesh);

  return runwayGroup;
}
