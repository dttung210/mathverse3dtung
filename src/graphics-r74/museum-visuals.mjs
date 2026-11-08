/**
 * MATHVERSE R74 - source-integrated visual architecture.
 * Purely decorative geometry: never registers as a Lab, exhibit, collider or hit target.
 * Uses only the Three.js revision already bundled with MATHVERSE.
 */
export const GRAPHICS_STATIONS = Object.freeze([-54, -18, 18, 54]);
export const GRAPHICS_MODES = Object.freeze(['classic', 'enhanced']);

export function visualLayout(rooms) {
  const doors = Object.entries(rooms)
    .filter(([key]) => Number(key) >= 6 && Number(key) <= 12)
    .map(([key, r]) => ({
      grade: Number(key),
      x: Number(r.x),
      z: (r.zSide === -1 ? -1 : 1) * 8,
      facing: r.zSide === -1 ? 1 : -1,
      accent: Number(r.accent)
    }))
    .sort((a, b) => a.grade - b.grade);
  return Object.freeze({
    hall: Object.freeze({ width: 154, depth: 16.4, height: 8.5 }),
    doors,
    suspensionX: Object.freeze([-36, 36]),
    ceilingRows: Object.freeze(Array.from({ length: 15 }, (_, i) => -70 + i * 10))
  });
}

export function createMuseumVisuals(THREE, building, rooms, { reducedMotion = false } = {}) {
  const layout = visualLayout(rooms);
  const root = new THREE.Group();
  root.name = 'MATHVERSE R74 | architectural visuals | non-interactive';
  root.userData.visualOnly = true;
  building.add(root);

  const premium = new THREE.Group();
  premium.name = 'MATHVERSE | high detail accents';
  root.add(premium);
  const mobiles = [];
  const emissions = [];
  const pedestalAccents = [];
  let enabled = true;
  let currentQuality = 'auto';
  let daylight = true;

  // Shared high-efficiency PBR architectural materials
  const metal = new THREE.MeshStandardMaterial({
    color: 0x22364a, metalness: 0.82, roughness: 0.24
  });
  const brass = new THREE.MeshStandardMaterial({
    color: 0xd4af37, metalness: 0.76, roughness: 0.22
  });
  const goldGlow = new THREE.MeshBasicMaterial({
    color: 0xfde3a7, transparent: true, opacity: 0.78,
    depthWrite: false, toneMapped: false
  });
  const mintGlow = new THREE.MeshBasicMaterial({
    color: 0x48bbaa, transparent: true, opacity: 0.68,
    depthWrite: false, toneMapped: false
  });
  const runnerMat = new THREE.MeshStandardMaterial({
    color: 0x122232, metalness: 0.20, roughness: 0.42
  });

  function addBox(group, dimensions, position, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...dimensions), material);
    mesh.position.set(...position);
    mesh.userData.visualOnly = true;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    group.add(mesh);
    return mesh;
  }

  // 1. SẢNH CHÍNH & HÀNH LANG: Thảm điêu khắc kiến trúc tinh tế, bảo đảm lối đi thông thoáng
  addBox(root, [150.0, 0.008, 6.2], [0, 0.014, 0], runnerMat);
  for (const z of [-3.45, 3.45]) {
    addBox(root, [149.5, 0.012, 0.045], [0, 0.025, z], brass);
    addBox(root, [149.5, 0.008, 0.023], [0, 0.034, z + (z < 0 ? -0.09 : 0.09)], mintGlow);
  }

  // Vòng hoa văn toán học trung tâm sảnh (Central Math Medallion)
  const medallionRingOuter = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.032, 8, 48), brass);
  medallionRingOuter.rotation.x = Math.PI / 2;
  medallionRingOuter.position.set(0, 0.026, 0);
  medallionRingOuter.userData.visualOnly = true;
  premium.add(medallionRingOuter);

  const medallionRingInner = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.024, 8, 40), goldGlow);
  medallionRingInner.rotation.x = Math.PI / 2;
  medallionRingInner.position.set(0, 0.028, 0);
  medallionRingInner.userData.visualOnly = true;
  premium.add(medallionRingInner);

  // 2. TRẦN NHÀ: Khung sườn dầm kiến trúc dùng InstancedMesh duy nhất (Zero draw-call overhead)
  const ribGeometry = new THREE.BoxGeometry(0.12, 0.12, 15.2);
  const ribMesh = new THREE.InstancedMesh(ribGeometry, metal, layout.ceilingRows.length);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < layout.ceilingRows.length; i++) {
    dummy.position.set(layout.ceilingRows[i], 8.32, 0);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    ribMesh.setMatrixAt(i, dummy.matrix);
  }
  ribMesh.instanceMatrix.needsUpdate = true;
  ribMesh.userData.visualOnly = true;
  root.add(ribMesh);

  // 30 Đèn trần hình học âm trần trong đúng 1 draw call, không dùng point light nặng
  const panelGeometry = new THREE.BoxGeometry(2.85, 0.035, 0.24);
  const panelMesh = new THREE.InstancedMesh(panelGeometry, goldGlow, layout.ceilingRows.length * 2);
  let panelIndex = 0;
  for (const x of layout.ceilingRows) {
    for (const z of [-4.55, 4.55]) {
      dummy.position.set(x, 8.175, z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      panelMesh.setMatrixAt(panelIndex++, dummy.matrix);
    }
  }
  panelMesh.instanceMatrix.needsUpdate = true;
  panelMesh.userData.visualOnly = true;
  premium.add(panelMesh);

  // 3. 7 CỬA LỚP HỌC (LỚP 6-12): Khung vòm kiến trúc hiện đại, giữ màu nhận diện đặc trưng
  for (const door of layout.doors) {
    const gradeMat = new THREE.MeshStandardMaterial({
      color: door.accent, metalness: 0.42, roughness: 0.22,
      emissive: door.accent, emissiveIntensity: 0.25
    });
    emissions.push({ material: gradeMat, day: 0.25, night: 0.60 });

    addBox(root, [7.4, 0.075, 0.20],
      [door.x, 5.95, door.z + door.facing * 0.27], gradeMat);

    const frame = addBox(root, [8.20, 0.14, 0.48],
      [door.x, 6.10, door.z + door.facing * 0.31], metal);
    frame.name = `Architectural lintel - grade ${door.grade}`;

    // Hai họa tiết hình học torus thanh lịch trên trán cửa
    for (const delta of [-2.55, 2.55]) {
      const geometry = new THREE.TorusGeometry(0.44, 0.046, 7, 24);
      const motif = new THREE.Mesh(geometry, gradeMat);
      motif.position.set(door.x + delta, 7.36, door.z + door.facing * 0.37);
      motif.userData.visualOnly = true;
      premium.add(motif);
    }

    // Dải đèn chào đón tại chân cửa, ngoài phạm vi va chạm lối đi
    addBox(root, [7.4, 0.014, 0.045],
      [door.x, 0.027, door.z + door.facing * 1.10], gradeMat);
  }

  // 4. MÔ HÌNH TOÁN HỌC TREO 3D (SUSPENDED MATHEMATICAL MOBILES): 2 mô hình theo chuẩn test
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0x77b6c6, metalness: 0.68, roughness: 0.24,
    emissive: 0x164457, emissiveIntensity: 0.22
  });
  emissions.push({ material: ringMaterial, day: 0.22, night: 0.48 });

  for (let i = 0; i < layout.suspensionX.length; i++) {
    const group = new THREE.Group();
    group.name = `Mathematical hanging mobile ${i + 1}`;
    group.position.set(layout.suspensionX[i], 6.86, 0);

    for (const [radius, rot] of [[1.12, 0], [0.95, Math.PI / 2.6], [0.76, Math.PI / 2]]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.035, 8, 52), ringMaterial);
      ring.rotation.set(rot, rot / 1.8, 0);
      group.add(ring);
    }

    const core = new THREE.Mesh(
      i === 0 ? new THREE.IcosahedronGeometry(0.32, 0) : new THREE.OctahedronGeometry(0.35, 0),
      new THREE.MeshStandardMaterial({
        color: 0xe6ca7f, metalness: 0.55, roughness: 0.22,
        emissive: 0x4d3915, emissiveIntensity: 0.24
      })
    );
    group.add(core);
    premium.add(group);
    mobiles.push(group);
  }

  // 5. PHÒNG TRIỂN LÃM TOÁN HỌC: Phào chỉ trần sang trọng và viền định hình không gian
  addBox(root, [30.0, 0.075, 0.08], [54, 8.13, -27.8], brass);
  for (const x of [39.8, 68.2]) {
    addBox(root, [0.06, 0.05, 34.0], [x, 8.13, -28], brass);
  }
  // Cổng vòm lối vào phòng triển lãm (x=54, z=-8)
  const libPortalMat = new THREE.MeshStandardMaterial({
    color: 0x24d4c4, metalness: 0.5, roughness: 0.25,
    emissive: 0x10605a, emissiveIntensity: 0.3
  });
  addBox(root, [8.2, 0.12, 0.45], [54, 6.10, -8.32], metal);
  addBox(root, [7.4, 0.07, 0.18], [54, 5.95, -8.28], libPortalMat);

  // 6. BỤC TRƯNG BÀY (PLINTH DECORATION): Tối ưu tái sử dụng Material tránh giật lag
  const sharedPlinthCapMat = new THREE.MeshPhysicalMaterial({
    color: 0x15222e, metalness: 0.22, roughness: 0.15,
    clearcoat: 0.92, clearcoatRoughness: 0.10
  });
  const accentMaterialsCache = new Map();
  function getAccentRimMaterial(accent) {
    let mat = accentMaterialsCache.get(accent);
    if (!mat) {
      mat = new THREE.MeshBasicMaterial({ color: accent, toneMapped: false });
      accentMaterialsCache.set(accent, mat);
    }
    return mat;
  }

  function decoratePlinth(plinth, accent) {
    if (!plinth || !plinth.isGroup) return;
    // Bổ sung đúng 2 Mesh trang trí vào plinth để giữ nguyên children.length = 3
    const cap = addBox(plinth, [2.52, 0.022, 2.52], [0, 0.975, 0], sharedPlinthCapMat);
    cap.name = 'MATHVERSE visual plinth cap (not a model)';
    cap.userData.mathGraphicsDecorative = true;

    const accentStripMat = getAccentRimMaterial(accent);
    const strip = addBox(plinth, [2.88, 0.026, 2.88], [0, 0.939, 0], accentStripMat);
    strip.name = 'MATHVERSE visual plinth rim (not a model)';
    strip.userData.mathGraphicsDecorative = true;

    pedestalAccents.push(cap, strip);
  }

  function syncVisibility() {
    root.visible = enabled;
    premium.visible = enabled && currentQuality !== 'eco';
    for (const item of pedestalAccents) item.visible = enabled;
  }

  function setMode(mode) {
    enabled = mode !== 'classic';
    syncVisibility();
    return enabled ? 'enhanced' : 'classic';
  }

  function getMode() { return enabled ? 'enhanced' : 'classic'; }

  function setQuality(quality) {
    currentQuality = ['eco', 'auto', 'high'].includes(quality) ? quality : 'auto';
    syncVisibility();
  }

  function setTheme(day) {
    daylight = !!day;
    for (const obj of emissions) obj.material.emissiveIntensity = daylight ? obj.day : obj.night;
    goldGlow.opacity = daylight ? 0.70 : 0.88;
    mintGlow.opacity = daylight ? 0.52 : 0.82;
  }

  function animate(dt) {
    if (!enabled || currentQuality === 'eco' || reducedMotion) return;
    const delta = Math.min(Math.max(0, dt), 0.05);
    for (const [i, mobile] of mobiles.entries()) {
      mobile.rotation.y += delta * (i === 0 ? 0.10 : -0.085);
      mobile.rotation.x += delta * 0.027;
    }
  }

  function diagnostics() {
    return {
      mode: getMode(), quality: currentQuality,
      gradeDoors: layout.doors.length,
      mobiles: mobiles.length,
      plinths: pedestalAccents.length / 2,
      drawCallsEstimate: 'instanced ceiling ribs / lighting'
    };
  }

  syncVisibility();
  setTheme(true);
  return {
    root, premium, visualLayout: layout, setMode, getMode, setQuality,
    setTheme, animate, decoratePlinth, diagnostics
  };
}
