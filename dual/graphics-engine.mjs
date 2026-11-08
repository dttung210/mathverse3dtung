import * as THREE from '/mathverse3dtung/vendor/three.module.js?v=r107_v15';
import {
  QUALITY_PROFILES_V12,
  createModularPostProcessorV12,
  createPerformanceTrackerV12,
  createAdaptiveFPSGovernorV12,
  openABDepthTestModal
} from '../src/graphics-r74/depth-pipeline-v12.mjs?v=r107_v15';

export const LIGHTING_PRESETS = Object.freeze({
  royal: {
    id: 'royal',
    name: '☀️ Hoàng Gia Ban Ngày (Tương phản cao · Mặc định)',
    skyZenith: '#061a3a',
    skyMid: '#155e95',
    skyHorizon: '#fce7b2',
    skyGround: '#0a2239',
    fogColor: 0xd8ecf8,
    fogDensity: 0.00018,
    sunColor: 0xfff5dc,
    sunIntensity: 1.95,
    sunAzimuth: 38,
    sunElevation: 44,
    rimColor: 0x38bdf8,
    rimIntensity: 0.72,
    hemiSky: 0xe0f2fe,
    hemiGround: 0x1e293b,
    hemiIntensity: 1.12,
    ambientIntensity: 0.32,
    exposure: 1.12,
    contrast: 108,
    saturation: 112,
    stars: false
  },
  sunset: {
    id: 'sunset',
    name: '🌅 Hoàng Hôn Vàng Kim (Đổ bóng dài nghệ thuật)',
    skyZenith: '#160f30',
    skyMid: '#9a3412',
    skyHorizon: '#fde047',
    skyGround: '#1e1b2e',
    fogColor: 0xfed7aa,
    fogDensity: 0.00022,
    sunColor: 0xffb74d,
    sunIntensity: 2.25,
    sunAzimuth: 68,
    sunElevation: 22,
    rimColor: 0xc084fc,
    rimIntensity: 0.85,
    hemiSky: 0xffedd5,
    hemiGround: 0x1e1b4b,
    hemiIntensity: 1.05,
    ambientIntensity: 0.28,
    exposure: 1.15,
    contrast: 112,
    saturation: 118,
    stars: false
  },
  night: {
    id: 'night',
    name: '🌌 Đêm Sao Pha Lê (Phát sáng Hoàng Kim & Neon)',
    skyZenith: '#020617',
    skyMid: '#0f172a',
    skyHorizon: '#164e63',
    skyGround: '#020617',
    fogColor: 0x09192b,
    fogDensity: 0.00026,
    sunColor: 0xbae6fd,
    sunIntensity: 1.25,
    sunAzimuth: 25,
    sunElevation: 52,
    rimColor: 0xfbbf24,
    rimIntensity: 0.95,
    hemiSky: 0x38bdf8,
    hemiGround: 0x090d16,
    hemiIntensity: 0.88,
    ambientIntensity: 0.25,
    exposure: 1.06,
    contrast: 114,
    saturation: 116,
    stars: true
  },
  studio: {
    id: 'studio',
    name: '🏛️ Studio Kiến Trúc Chân Thực (PBR Sắc nét)',
    skyZenith: '#0c2d48',
    skyMid: '#2e6f95',
    skyHorizon: '#f8fafc',
    skyGround: '#172554',
    fogColor: 0xe2e8f0,
    fogDensity: 0.00014,
    sunColor: 0xffffff,
    sunIntensity: 2.05,
    sunAzimuth: 45,
    sunElevation: 50,
    rimColor: 0xfde68a,
    rimIntensity: 0.78,
    hemiSky: 0xf8fafc,
    hemiGround: 0x1e293b,
    hemiIntensity: 1.18,
    ambientIntensity: 0.35,
    exposure: 1.10,
    contrast: 110,
    saturation: 108,
    stars: false
  },
  morning: {
    id: 'morning',
    name: '🌤️ Bình Minh Ngọc Bích (Trong trẻo & Tươi sáng)',
    skyZenith: '#082f49',
    skyMid: '#0284c7',
    skyHorizon: '#fef08a',
    skyGround: '#0f172a',
    fogColor: 0xe0f2fe,
    fogDensity: 0.00016,
    sunColor: 0xfffbeb,
    sunIntensity: 1.88,
    sunAzimuth: 18,
    sunElevation: 38,
    rimColor: 0x34d399,
    rimIntensity: 0.68,
    hemiSky: 0xf0f9ff,
    hemiGround: 0x134e4a,
    hemiIntensity: 1.15,
    ambientIntensity: 0.34,
    exposure: 1.12,
    contrast: 106,
    saturation: 112,
    stars: false
  }
});

// Procedural architectural textures for high-contrast 3D surfaces
export function createMarblePlazaTexture({
  baseColor = '#faf5eb',
  veinColor = '#cbd5e1',
  gridColor = '#d97706',
  subGridColor = '#94a3b8',
  repeat = 14
} = {}) {
  if (typeof document === 'undefined') return null;
  const cvs = document.createElement('canvas');
  cvs.width = 512;
  cvs.height = 512;
  const ctx = cvs.getContext('2d');
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle diagonal marble veining
  ctx.strokeStyle = veinColor;
  ctx.lineWidth = 2.2;
  ctx.globalAlpha = 0.32;
  for (let i = -256; i < 512; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.bezierCurveTo(i + 80, 160, i + 40, 340, i + 180, 512);
    ctx.stroke();
  }

  // Sub-tile masonry joints
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = subGridColor;
  ctx.lineWidth = 2;
  for (let k = 128; k < 512; k += 128) {
    ctx.beginPath();
    ctx.moveTo(k, 0);
    ctx.lineTo(k, 512);
    ctx.moveTo(0, k);
    ctx.lineTo(512, k);
    ctx.stroke();
  }

  // Outer royal brass/gold border per tile block
  ctx.globalAlpha = 0.65;
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 5;
  ctx.strokeRect(3, 3, 506, 506);

  // Corner diamond inlays
  ctx.fillStyle = gridColor;
  ctx.globalAlpha = 0.55;
  for (const [cx, cy] of [[0, 0], [512, 0], [0, 512], [512, 512], [256, 256]]) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 12);
    ctx.lineTo(cx + 12, cy);
    ctx.lineTo(cx, cy + 12);
    ctx.lineTo(cx - 12, cy);
    ctx.closePath();
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 8;
  return tex;
}

function buildSkyCanvas(preset) {
  if (typeof document === 'undefined') return null;
  const cvs = document.createElement('canvas');
  cvs.width = 1024;
  cvs.height = 512;
  const ctx = cvs.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.0, preset.skyZenith);
  grad.addColorStop(0.36, preset.skyMid);
  grad.addColorStop(0.51, preset.skyHorizon);
  grad.addColorStop(0.58, preset.skyMid);
  grad.addColorStop(1.0, preset.skyGround);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Subtle horizon glow band
  const glow = ctx.createLinearGradient(0, 220, 0, 295);
  glow.addColorStop(0, 'rgba(255,255,255,0)');
  glow.addColorStop(0.5, 'rgba(255,248,220,0.38)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 220, 1024, 75);

  if (preset.stars) {
    for (let i = 0; i < 240; i++) {
      const sx = (Math.sin(i * 127.1) * 0.5 + 0.5) * 1024;
      const sy = (Math.cos(i * 311.7) * 0.5 + 0.5) * 235;
      const r = (i % 5 === 0) ? 2.1 : 1.2;
      ctx.fillStyle = (i % 7 === 0) ? '#fde047' : (i % 3 === 0 ? '#7dd3fc' : '#ffffff');
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return cvs;
}

export function initializeGraphicsEngine({ renderer, scene, canvas, onStatus = () => {} }) {
  // 1. Setup 3D Sky Dome Mesh
  const skyGeo = new THREE.SphereGeometry(680, 48, 32);
  const skyMat = new THREE.MeshBasicMaterial({ side: THREE.BackSide, depthWrite: false, fog: false });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  skyDome.name = 'MATHVERSE_3D_SKY_DOME';
  skyDome.renderOrder = -100;
  scene.add(skyDome);

  // 2. Find or create primary lights in scene
  let hemiLight = null;
  let ambientLight = null;
  let sunLight = null;
  scene.traverse(obj => {
    if (obj.isHemisphereLight && !hemiLight) hemiLight = obj;
    else if (obj.isAmbientLight && !ambientLight) ambientLight = obj;
    else if (obj.isDirectionalLight && !sunLight) sunLight = obj;
  });

  if (!hemiLight) {
    hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 1.12);
    scene.add(hemiLight);
  }
  if (!ambientLight) {
    ambientLight = new THREE.AmbientLight(0xffffff, 0.32);
    scene.add(ambientLight);
  }
  if (!sunLight) {
    sunLight = new THREE.DirectionalLight(0xfff5dc, 1.95);
    scene.add(sunLight);
  }

  // Configure static-baked directional shadow map on sunLight (disabled by default for 60 FPS; baked once on toggle)
  sunLight.castShadow = false;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 360;
  const shadowBounds = 160;
  sunLight.shadow.camera.left = -shadowBounds;
  sunLight.shadow.camera.right = shadowBounds;
  sunLight.shadow.camera.top = shadowBounds;
  sunLight.shadow.camera.bottom = -shadowBounds;
  sunLight.shadow.bias = -0.00045;
  sunLight.shadow.normalBias = 0.025;

  // Add Counter Rim Directional Light for strong 3D edge contrast
  const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.72);
  rimLight.name = 'MATHVERSE_3D_RIM_LIGHT';
  rimLight.position.set(-85, 55, -90);
  scene.add(rimLight);

  // 3. Build PMREM Procedural Environment Reflection Map so gold, glass & marble gleam
  let pmremGenerator = null;
  let currentEnvRT = null;
  function rebuildEnvironmentMap(preset) {
    try {
      if (state.qualityTier !== 'high') {
        scene.environment = null;
        return;
      }
      if (!pmremGenerator && THREE.PMREMGenerator) {
        pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader?.();
      }
      if (!pmremGenerator) return;
      const envScene = new THREE.Scene();
      const envSky = new THREE.Mesh(
        new THREE.SphereGeometry(50, 16, 12),
        new THREE.MeshBasicMaterial({ map: skyMat.map, side: THREE.BackSide })
      );
      envScene.add(envSky);
      const sunOrb = new THREE.Mesh(
        new THREE.SphereGeometry(4.5, 12, 12),
        new THREE.MeshBasicMaterial({ color: preset.sunColor })
      );
      sunOrb.position.copy(sunLight.position).normalize().multiplyScalar(42);
      envScene.add(sunOrb);

      const nextRT = pmremGenerator.fromScene(envScene, 0.035);
      if (currentEnvRT) currentEnvRT.dispose();
      currentEnvRT = nextRT;
      scene.environment = currentEnvRT.texture;
    } catch (e) {
      console.warn('PMREM environment reflection fallback:', e);
    }
  }

  // 4. Enable shadows only on major architectural structures (>=2.8m) to avoid thousands of shadow draw calls
  function enableSceneShadows(rootGroup) {
    if (!rootGroup) return;
    rootGroup.traverse(obj => {
      if (!obj.isMesh) return;
      const nm = obj.name || '';
      if (
        nm.startsWith('LEGIBLE_SIGN_') ||
        nm.startsWith('AERIAL_BANNER_') ||
        nm.includes('TOUCH_TARGET') ||
        nm.includes('INTERACTION') ||
        nm.includes('ROOF_MINIMAL_VISUAL') ||
        (obj.material && obj.material.transparent)
      ) {
        obj.castShadow = false;
        obj.receiveShadow = false;
        return;
      }
      let radius = 0;
      if (obj.geometry) {
        if (!obj.geometry.boundingSphere) obj.geometry.computeBoundingSphere();
        if (obj.geometry.boundingSphere) {
          const maxScale = Math.max(obj.scale?.x || 1, obj.scale?.y || 1, obj.scale?.z || 1);
          radius = obj.geometry.boundingSphere.radius * maxScale;
        }
      }
      obj.castShadow = radius >= 2.8;
      obj.receiveShadow = radius >= 4.5;
    });
  }

  // State — defaulted to ultra-smooth 60 FPS zero-compositor-overhead profile
  const state = {
    preset: 'royal',
    qualityTier: 'medium',
    aoMode: 'off',
    bloomEnabled: false,
    dofEnabled: false,
    colorGrading: 'neutral',
    sunAzimuth: 38,
    sunElevation: 44,
    exposure: 1.12,
    contrast: 100,
    saturation: 100,
    shadowsEnabled: false,
    cinemaFrame: false
  };

  const postProcessor = createModularPostProcessorV12({
    aoMode: state.aoMode,
    bloomEnabled: state.bloomEnabled,
    dofEnabled: state.dofEnabled,
    colorGrading: state.colorGrading,
    qualityTier: state.qualityTier
  });
  const perfTracker = createPerformanceTrackerV12(renderer);
  const fpsGovernor = createAdaptiveFPSGovernorV12(renderer);
  perfTracker.markModelLoadStart();
  setTimeout(() => perfTracker.markModelLoadEnd(), 120);

  function applyQualityTier(tier, notify = false) {
    const profile = QUALITY_PROFILES_V12[tier] || QUALITY_PROFILES_V12.medium;
    state.qualityTier = profile.id;
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const cap = Math.min(profile.pixelRatioCap || profile.pixelRatio || 1.25, 1.35);
    renderer.setPixelRatio(Math.min(dpr, cap));
    if (profile.id === 'low') {
      state.aoMode = 'off';
      state.bloomEnabled = false;
    }
    if (sunLight && sunLight.shadow) {
      const sSize = Math.min(profile.shadowMapSize || 1024, 1024);
      sunLight.shadow.mapSize.set(sSize, sSize);
      if (sunLight.shadow.map) {
        sunLight.shadow.map.dispose();
        sunLight.shadow.map = null;
      }
    }
    postProcessor.setQualityTier(profile.id);
    postProcessor.setAOMode(state.aoMode);
    postProcessor.setBloomEnabled(state.bloomEnabled);
    applyCanvasFilter();
    syncUI();
    if (notify) {
      onStatus(`⚙️ Chế độ V12 ${profile.label}: PixelRatio≤${cap} · FPS mượt tối đa`);
    }
  }

  function updateSunPosition() {
    const az = (state.sunAzimuth * Math.PI) / 180;
    const el = (state.sunElevation * Math.PI) / 180;
    const dist = 165;
    const horiz = Math.cos(el) * dist;
    sunLight.position.set(
      Math.sin(az) * horiz,
      Math.max(24, Math.sin(el) * dist),
      Math.cos(az) * horiz
    );
    rimLight.position.set(
      -Math.sin(az) * 110,
      58,
      -Math.cos(az) * 110
    );
    if (state.shadowsEnabled && renderer.shadowMap) {
      renderer.shadowMap.needsUpdate = true;
    }
  }

  function applyCanvasFilter() {
    if (!canvas) return;
    postProcessor.setAOMode(state.qualityTier === 'low' ? 'off' : state.aoMode);
    postProcessor.setBloomEnabled(state.qualityTier === 'low' ? false : state.bloomEnabled);
    postProcessor.setDOFEnabled?.(state.qualityTier === 'low' ? false : state.dofEnabled, false);
    (postProcessor.setColorGrade || postProcessor.setColorGrading)?.(state.colorGrading || 'neutral');
    postProcessor.applyToCanvas(canvas);
    // Keep canvas.style.filter empty for direct hardware flip compositing (zero GPU->CPU readback)
    canvas.style.filter = '';
    document.body.classList.toggle('mv-cinema-render-frame', Boolean(state.cinemaFrame));
  }

  function applyPreset(presetId, notify = false) {
    const p = LIGHTING_PRESETS[presetId] || LIGHTING_PRESETS.royal;
    state.preset = p.id;
    state.sunAzimuth = p.sunAzimuth;
    state.sunElevation = p.sunElevation;
    state.exposure = p.exposure;
    state.contrast = 100;
    state.saturation = 100;

    const skyCvs = buildSkyCanvas(p);
    if (skyCvs) {
      const tex = new THREE.CanvasTexture(skyCvs);
      tex.colorSpace = THREE.SRGBColorSpace;
      if (skyMat.map) skyMat.map.dispose();
      skyMat.map = tex;
      skyMat.needsUpdate = true;
    }

    scene.background = new THREE.Color(p.fogColor);
    if (scene.fog) {
      scene.fog.color.setHex(p.fogColor);
      scene.fog.density = p.fogDensity;
    }

    sunLight.color.setHex(p.sunColor);
    sunLight.intensity = p.sunIntensity;
    rimLight.color.setHex(p.rimColor);
    rimLight.intensity = p.rimIntensity;
    hemiLight.color.setHex(p.hemiSky);
    hemiLight.groundColor.setHex(p.hemiGround);
    hemiLight.intensity = p.hemiIntensity;
    ambientLight.intensity = p.ambientIntensity;

    renderer.toneMappingExposure = state.exposure;
    sunLight.castShadow = Boolean(state.shadowsEnabled);
    renderer.shadowMap.enabled = Boolean(state.shadowsEnabled);
    renderer.shadowMap.autoUpdate = false;
    if (state.shadowsEnabled) renderer.shadowMap.needsUpdate = true;
    updateSunPosition();
    rebuildEnvironmentMap(p);
    applyCanvasFilter();
    syncUI();
    if (notify) onStatus(`🎨 Đã áp dụng Đồ họa 3D: ${p.name}`);
  }

  // 5. Bind UI Controls if present in DOM
  const $ = id => document.getElementById(id);
  function syncUI() {
    if ($('gfx-preset-select')) $('gfx-preset-select').value = state.preset;
    if ($('gfx-v12-quality')) $('gfx-v12-quality').value = state.qualityTier;
    if ($('gfx-v12-ao')) $('gfx-v12-ao').value = state.aoMode;
    if ($('gfx-v12-grade')) $('gfx-v12-grade').value = state.colorGrading || 'neutral';
    if ($('gfx-v12-bloom')) $('gfx-v12-bloom').checked = Boolean(state.bloomEnabled);
    if ($('gfx-v12-dof')) $('gfx-v12-dof').checked = Boolean(state.dofEnabled);
    if ($('gfx-sun-azimuth')) $('gfx-sun-azimuth').value = String(state.sunAzimuth);
    if ($('gfx-sun-elevation')) $('gfx-sun-elevation').value = String(state.sunElevation);
    if ($('gfx-exposure')) $('gfx-exposure').value = String(Math.round(state.exposure * 100));
    if ($('gfx-contrast')) $('gfx-contrast').value = String(state.contrast);
    if ($('gfx-saturation')) $('gfx-saturation').value = String(state.saturation);
    if ($('gfx-shadows-toggle')) $('gfx-shadows-toggle').checked = state.shadowsEnabled;
    if ($('gfx-cinema-toggle')) $('gfx-cinema-toggle').checked = state.cinemaFrame;
    for (const pill of document.querySelectorAll('[data-gfx-preset]')) {
      pill.classList.toggle('is-active', pill.dataset.gfxPreset === state.preset);
    }
  }

  function wireUI() {
    for (const pill of document.querySelectorAll('[data-gfx-preset]')) {
      pill.addEventListener('click', () => applyPreset(pill.dataset.gfxPreset, true));
    }
    if ($('gfx-preset-select')) {
      $('gfx-preset-select').addEventListener('change', e => applyPreset(e.target.value, true));
    }
    if ($('gfx-sun-azimuth')) {
      $('gfx-sun-azimuth').addEventListener('input', e => {
        state.sunAzimuth = Number(e.target.value) || 38;
        updateSunPosition();
      });
    }
    if ($('gfx-sun-elevation')) {
      $('gfx-sun-elevation').addEventListener('input', e => {
        state.sunElevation = Number(e.target.value) || 44;
        updateSunPosition();
      });
    }
    if ($('gfx-exposure')) {
      $('gfx-exposure').addEventListener('input', e => {
        state.exposure = (Number(e.target.value) || 112) / 100;
        renderer.toneMappingExposure = state.exposure;
      });
    }
    if ($('gfx-contrast')) {
      $('gfx-contrast').addEventListener('input', e => {
        state.contrast = Number(e.target.value) || 108;
        applyCanvasFilter();
      });
    }
    if ($('gfx-saturation')) {
      $('gfx-saturation').addEventListener('input', e => {
        state.saturation = Number(e.target.value) || 112;
        applyCanvasFilter();
      });
    }
    if ($('gfx-shadows-toggle')) {
      $('gfx-shadows-toggle').addEventListener('change', e => {
        state.shadowsEnabled = Boolean(e.target.checked);
        sunLight.castShadow = state.shadowsEnabled;
        renderer.shadowMap.enabled = state.shadowsEnabled;
        renderer.shadowMap.autoUpdate = false;
        if (state.shadowsEnabled) renderer.shadowMap.needsUpdate = true;
        onStatus(state.shadowsEnabled ? '☀️ Đã bật Đổ bóng 3D Tĩnh (1024px PCFSoftShadow)' : '⚡ Đã tắt đổ bóng để tăng FPS tối đa');
      });
    }
    if ($('gfx-cinema-toggle')) {
      $('gfx-cinema-toggle').addEventListener('change', e => {
        state.cinemaFrame = Boolean(e.target.checked);
        applyCanvasFilter();
        onStatus(state.cinemaFrame ? '🎬 Đã bật Khung Render Điện Ảnh (Cinema Frame)' : 'Đã tắt Khung Render Điện Ảnh');
      });
    }
    if ($('gfx-capture-btn')) {
      $('gfx-capture-btn').addEventListener('click', () => {
        try {
          const url = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = url;
          a.download = `MATHVERSE-3D-Render-${state.preset}-${Date.now()}.png`;
          a.click();
          onStatus('📸 Đã kết xuất & tải xuống khung hình 3D HD!');
        } catch (e) {
          onStatus('Không thể chụp khung hình: ' + e.message);
        }
      });
    }
    if ($('gfx-studio-open')) {
      $('gfx-studio-open').addEventListener('click', () => {
        const panel = $('gfx-studio-modal');
        if (panel) panel.hidden = false;
      });
    }
    if ($('gfx-studio-close')) {
      $('gfx-studio-close').addEventListener('click', () => {
        const panel = $('gfx-studio-modal');
        if (panel) panel.hidden = true;
      });
    }
    if ($('gfx-v12-quality')) {
      $('gfx-v12-quality').addEventListener('change', e => {
        applyQualityTier(e.target.value, true);
      });
    }
    if ($('gfx-v12-ao')) {
      $('gfx-v12-ao').addEventListener('change', e => {
        state.aoMode = e.target.value === 'ssao' || e.target.value === 'gtao' ? e.target.value : 'off';
        if (state.qualityTier === 'low' && state.aoMode !== 'off') {
          state.qualityTier = 'medium';
        }
        applyCanvasFilter();
        syncUI();
        onStatus(`◐ Post-Processing AO: ${state.aoMode.toUpperCase()} (độc lập, không bật trùng)`);
      });
    }
    if ($('gfx-v12-bloom')) {
      $('gfx-v12-bloom').addEventListener('change', e => {
        state.bloomEnabled = Boolean(e.target.checked);
        applyCanvasFilter();
        onStatus(state.bloomEnabled ? '✨ Đã bật Bloom nhẹ cảnh giới thiệu' : 'Đã tắt Bloom');
      });
    }
    if ($('gfx-v12-dof')) {
      $('gfx-v12-dof').addEventListener('change', e => {
        state.dofEnabled = Boolean(e.target.checked);
        applyCanvasFilter();
        onStatus(state.dofEnabled ? '🎬 Đã bật Depth of Field (DOF mở đầu)' : 'Đã tắt DOF để quan sát hình học rõ nét');
      });
    }
    if ($('gfx-v12-grade')) {
      $('gfx-v12-grade').addEventListener('change', e => {
        state.colorGrading = e.target.value || 'neutral';
        applyCanvasFilter();
        onStatus(`🎨 Color Grading: ${state.colorGrading}`);
      });
    }
    if ($('gfx-v12-ab-open')) {
      $('gfx-v12-ab-open').addEventListener('click', () => {
        openABDepthTestModal();
      });
    }
  }

  if (typeof window !== 'undefined') {
    setInterval(() => {
      const statsEl = $('gfx-v12-stats');
      if (!statsEl) return;
      const snap = perfTracker.getSnapshot();
      const fpsText = document.getElementById('fps-counter')?.textContent || `${snap.fps} FPS`;
      const dpr = renderer.getPixelRatio ? renderer.getPixelRatio() : 1.0;
      statsEl.textContent = `${fpsText} (DPR ${dpr}) | DrawCalls: ${snap.drawCalls} | Tris: ${snap.triangles} | Geoms: ${snap.geometries} | Tex: ${snap.textures} | Load: ${snap.modelLoadMs}ms`;
    }, 1000);
  }

  wireUI();
  applyPreset('royal', false);

  return {
    applyPreset,
    applyQualityTier,
    enableSceneShadows,
    openABDepthTestModal,
    getPerformanceSnapshot: () => perfTracker.getSnapshot(),
    getState: () => ({ ...state }),
    setShadows: (enabled) => {
      state.shadowsEnabled = Boolean(enabled);
      sunLight.castShadow = state.shadowsEnabled;
      renderer.shadowMap.enabled = state.shadowsEnabled;
      renderer.shadowMap.autoUpdate = false;
      if (state.shadowsEnabled) renderer.shadowMap.needsUpdate = true;
      syncUI();
    }
  };
}

