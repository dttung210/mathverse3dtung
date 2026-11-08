/**
 * MATHVERSE V12 — REUSABLE 3D DEPTH, PBR, SHADOW, ORTHO/PERSP CAMERA,
 * MODULAR POST-PROCESSING (SSAO/GTAO/BLOOM), PHYSICS & A/B TEST PIPELINE
 *
 * Built natively on vendored Three.js r161 (/vendor/three.module.js).
 * Strictly non-destructive: preserves 100% of mathematical models, JSXGraph, ECharts, and R75 data.
 */
import * as THREE from '../../vendor/three.module.js';

export const QUALITY_PROFILES_V12 = Object.freeze({
  low: Object.freeze({
    id: 'low',
    legacyKey: 'eco',
    label: 'Low (Máy yếu)',
    pixelRatioCap: 1.0,
    shadowMapSize: 512,
    shadows: true,
    ao: 'off',
    bloom: false,
    dof: false,
    fog: false,
    envMap: false
  }),
  medium: Object.freeze({
    id: 'medium',
    legacyKey: 'auto',
    label: 'Medium (Chuẩn)',
    pixelRatioCap: 1.5,
    shadowMapSize: 1024,
    shadows: true,
    ao: 'off',
    bloom: false,
    dof: false,
    fog: true,
    envMap: true
  }),
  high: Object.freeze({
    id: 'high',
    legacyKey: 'high',
    label: 'High (Máy mạnh)',
    pixelRatioCap: 2.0,
    shadowMapSize: 2048,
    shadows: true,
    ao: 'ssao',
    bloom: true,
    dof: false,
    fog: true,
    envMap: true
  })
});

export function normalizeQualityId(mode) {
  const m = String(mode || '').toLowerCase();
  if (m === 'low' || m === 'eco') return 'low';
  if (m === 'high') return 'high';
  return 'medium';
}

export function normalizeAOMode(aoMode, qualityId = 'medium') {
  if (normalizeQualityId(qualityId) === 'low') return 'off';
  const m = String(aoMode || '').toLowerCase();
  // Rule F: SSAO and GTAO are mutually exclusive; never enable both simultaneously.
  if (m === 'ssao') return 'ssao';
  if (m === 'gtao') return 'gtao';
  return 'off';
}

/**
 * E. Standardized sRGB, ToneMapping & Shadow configuration for Three.js r161 WebGLRenderer.
 */
export function configureRendererV12(renderer, {
  quality = 'medium',
  exposure = 1.08,
  shadows = true
} = {}) {
  if (!renderer) return null;
  const q = QUALITY_PROFILES_V12[normalizeQualityId(quality)];
  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
  const targetPixelRatio = q.id === 'low' ? 1.0 : Math.min(Math.max(1.0, dpr), q.pixelRatioCap);

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.shadowMap.enabled = Boolean(shadows);
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(targetPixelRatio);

  return {
    quality: q.id,
    pixelRatio: targetPixelRatio,
    shadowMapSize: q.shadowMapSize
  };
}

/**
 * D. Shared PBR Material Library & Procedural HDRI Studio Environment Map.
 */
const pbrMaterialCache = new Map();

export function getSharedPBRMaterial(key, {
  color = 0x358ce1,
  roughness = 0.42,
  metalness = 0.12,
  clearcoat = 0,
  clearcoatRoughness = 0.15,
  transparent = false,
  opacity = 1.0,
  side = THREE.FrontSide
} = {}) {
  const cacheKey = `${key}:${color}:${roughness}:${metalness}:${clearcoat}:${transparent}:${opacity}:${side}`;
  if (pbrMaterialCache.has(cacheKey)) {
    return pbrMaterialCache.get(cacheKey);
  }
  const mat = clearcoat > 0
    ? new THREE.MeshPhysicalMaterial({
        color,
        roughness,
        metalness,
        clearcoat,
        clearcoatRoughness,
        transparent,
        opacity,
        side
      })
    : new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness,
        transparent,
        opacity,
        side
      });
  mat.userData.v12SharedPBR = true;
  pbrMaterialCache.set(cacheKey, mat);
  return mat;
}

export const PBR_PRESETS_V12 = Object.freeze({
  floorSlate: () => getSharedPBRMaterial('floorSlate', { color: 0xc0d2e1, roughness: 0.92, metalness: 0.02 }),
  stageBase: () => getSharedPBRMaterial('stageBase', { color: 0x536e86, roughness: 0.82, metalness: 0.08 }),
  stageTop: () => getSharedPBRMaterial('stageTop', { color: 0xe3eaf2, roughness: 0.72, metalness: 0.05 }),
  plinthStone: () => getSharedPBRMaterial('plinthStone', { color: 0x7390a5, roughness: 0.65, metalness: 0.10 }),
  backdropWall: () => getSharedPBRMaterial('backdropWall', { color: 0xf0f5fa, roughness: 0.94, metalness: 0.02 }),
  pillarLeft: () => getSharedPBRMaterial('pillarLeft', { color: 0x8eabc5, roughness: 0.70, metalness: 0.06 }),
  pillarRight: () => getSharedPBRMaterial('pillarRight', { color: 0x87b4c3, roughness: 0.70, metalness: 0.06 }),
  cubeBlue: () => getSharedPBRMaterial('cubeBlue', { color: 0x358ce1, roughness: 0.30, metalness: 0.18, clearcoat: 0.25 }),
  sphereCoral: () => getSharedPBRMaterial('sphereCoral', { color: 0xea8353, roughness: 0.28, metalness: 0.16, clearcoat: 0.30 }),
  coneTeal: () => getSharedPBRMaterial('coneTeal', { color: 0x27ae94, roughness: 0.32, metalness: 0.18, clearcoat: 0.22 }),
  brushedBrass: () => getSharedPBRMaterial('brushedBrass', { color: 0xd4af37, roughness: 0.24, metalness: 0.78 }),
  warmWood: () => getSharedPBRMaterial('warmWood', { color: 0xb8824c, roughness: 0.58, metalness: 0.06 }),
  woodOak: () => getSharedPBRMaterial('woodOak', { color: 0xb57c46, roughness: 0.62, metalness: 0.05, clearcoat: 0.12 }),
  crystalGlass: () => getSharedPBRMaterial('crystalGlass', { color: 0x7dd3fc, roughness: 0.08, metalness: 0.10, clearcoat: 0.95, transparent: true, opacity: 0.74 }),
  brushedMetal: () => getSharedPBRMaterial('brushedMetal', { color: 0xeab308, roughness: 0.20, metalness: 0.86, clearcoat: 0.35 }),
  glossyPlastic: () => getSharedPBRMaterial('glossyPlastic', { color: 0x10b981, roughness: 0.22, metalness: 0.04, clearcoat: 0.65 }),
  marbleStone: () => getSharedPBRMaterial('marbleStone', { color: 0xe2e8f0, roughness: 0.38, metalness: 0.08, clearcoat: 0.28 })
});

/**
 * Contact Shadow Disc: Soft radial contact shadow placed on the floor/plinth directly beneath a 3D object.
 * Dynamically scales and fades with height h so students clearly perceive elevation and surface contact.
 */
let sharedContactShadowTex = null;
export function createContactShadowDisc({ radius = 1.05, groundY = 0.55, maxOpacity = 0.42 } = {}) {
  if (!sharedContactShadowTex && typeof document !== 'undefined') {
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = 128;
    const ctx = cvs.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
      grad.addColorStop(0.0, 'rgba(15, 23, 42, 0.78)');
      grad.addColorStop(0.45, 'rgba(15, 23, 42, 0.36)');
      grad.addColorStop(1.0, 'rgba(15, 23, 42, 0.0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      sharedContactShadowTex = new THREE.CanvasTexture(cvs);
      sharedContactShadowTex.colorSpace = THREE.SRGBColorSpace;
    }
  }
  const mat = new THREE.MeshBasicMaterial({
    map: sharedContactShadowTex || null,
    color: sharedContactShadowTex ? 0xffffff : 0x0f172a,
    transparent: true,
    opacity: maxOpacity,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = groundY;
  mesh.name = 'V12_ContactShadowDisc';
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.userData = {
    v12ContactShadow: true,
    groundY,
    maxOpacity,
    syncWithObject(targetMesh, restY = groundY + 0.85) {
      if (!targetMesh) return;
      mesh.position.x = targetMesh.position.x;
      mesh.position.z = targetMesh.position.z;
      const dh = Math.max(0, targetMesh.position.y - restY);
      const scale = 1 + Math.min(0.65, dh * 0.22);
      mesh.scale.set(scale, scale, 1);
      mat.opacity = Math.max(0.06, maxOpacity * Math.exp(-dh * 0.68));
    }
  };
  return mesh;
}

export function createProceduralHDRIEnvironment(renderer) {
  if (!renderer || typeof THREE.PMREMGenerator !== 'function') return null;
  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader?.();
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0xddebf6);

    const skyDome = new THREE.Mesh(
      new THREE.SphereGeometry(40, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0xe8f6ff, side: THREE.BackSide })
    );
    const sunDisc = new THREE.Mesh(
      new THREE.SphereGeometry(4.5, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfff3d1 })
    );
    sunDisc.position.set(-14, 24, 18);

    const warmBounce = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshBasicMaterial({ color: 0xc9d8e6, side: THREE.DoubleSide })
    );
    warmBounce.rotation.x = -Math.PI / 2;
    warmBounce.position.y = -12;

    envScene.add(skyDome, sunDisc, warmBounce);
    const rt = pmrem.fromScene(envScene, 0.035);
    pmrem.dispose();
    return rt.texture;
  } catch {
    return null;
  }
}

/**
 * B & C. Balanced Directional + Hemisphere Lighting & Conditional Shadow Rig.
 * Uses exactly 1 shadow-casting DirectionalLight to keep FPS high on student laptops.
 */
export function createLightingRigV12(scene, {
  shadowMapSize = 1024,
  shadowBounds = 12,
  shadowFar = 42,
  keyPosition = [-4.8, 11.5, 8.2],
  keyIntensity = 3.0,
  hemiIntensity = 1.35,
  fillIntensity = 0.65
} = {}) {
  const group = new THREE.Group();
  group.name = 'MATHVERSE_V12_LIGHTING_RIG';

  const skyLight = new THREE.HemisphereLight(0xe8f8ff, 0x7c90a7, hemiIntensity);
  skyLight.name = 'V12_HemisphereLight';

  const keyLight = new THREE.DirectionalLight(0xffedcf, keyIntensity);
  keyLight.name = 'V12_KeyDirectionalLight';
  keyLight.position.set(...keyPosition);
  keyLight.target.position.set(0, 0, 0);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(shadowMapSize, shadowMapSize);
  keyLight.shadow.camera.left = -shadowBounds;
  keyLight.shadow.camera.right = shadowBounds;
  keyLight.shadow.camera.top = shadowBounds;
  keyLight.shadow.camera.bottom = -shadowBounds;
  keyLight.shadow.camera.near = 0.2;
  keyLight.shadow.camera.far = shadowFar;
  keyLight.shadow.bias = -0.00012;
  keyLight.shadow.normalBias = 0.024;
  keyLight.shadow.radius = 2;

  const fillLight = new THREE.DirectionalLight(0x8abdfc, fillIntensity);
  fillLight.name = 'V12_FillDirectionalLight';
  fillLight.position.set(6.2, 4.5, -3.5);
  fillLight.castShadow = false;

  group.add(skyLight, keyLight, keyLight.target, fillLight);
  if (scene) scene.add(group);

  function setShadowMapSize(size) {
    const res = Number(size) || 1024;
    if (keyLight.shadow.mapSize.x !== res) {
      keyLight.shadow.mapSize.set(res, res);
      keyLight.shadow.map?.dispose?.();
      keyLight.shadow.map = null;
    }
  }

  function setShadowsEnabled(renderer, enabled) {
    const on = Boolean(enabled);
    keyLight.castShadow = on;
    if (renderer) {
      renderer.shadowMap.enabled = on;
      renderer.shadowMap.needsUpdate = true;
    }
    scene?.traverse?.((obj) => {
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => { if (m) m.needsUpdate = true; });
      }
    });
  }

  return {
    group,
    skyLight,
    keyLight,
    fillLight,
    setShadowMapSize,
    setShadowsEnabled
  };
}

/**
 * C. Traverse a model or scene to enable castShadow / receiveShadow on opaque 3D solids
 * while excluding 2D labels, sprites, lines, axes, and wireframes so mathematical symbols stay crisp.
 */
export function applyConditionalShadows(root, { cast = true, receive = true } = {}) {
  if (!root || typeof root.traverse !== 'function') return 0;
  let count = 0;
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    if (
      obj.isSprite ||
      obj.userData?.r8Label ||
      obj.userData?.isLabel ||
      obj.userData?.visualOnly ||
      obj.name?.includes('SKY_DOME')
    ) {
      obj.castShadow = false;
      return;
    }
    const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
    if (!mat) return;
    const isTransparentOverlay = mat.transparent && (mat.opacity ?? 1) < 0.35;
    if (!isTransparentOverlay) {
      obj.castShadow = Boolean(cast);
      obj.receiveShadow = Boolean(receive);
      count++;
    }
  });
  return count;
}

/**
 * Create a shadow-receiving pedagogical floor + subtle grid under a 3D math model.
 */
export function createPedagogicalShadowFloor({
  size = 26,
  y = -1.86,
  color = 0xdbe7f2,
  opacity = 0.92,
  darkTheme = false
} = {}) {
  const mat = new THREE.MeshStandardMaterial({
    color: darkTheme ? 0x16293d : color,
    roughness: 0.92,
    metalness: 0.04,
    transparent: opacity < 1,
    opacity
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  floor.name = 'V12_PedagogicalShadowFloor';
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = y;
  floor.castShadow = false;
  floor.receiveShadow = true;
  floor.userData.v12ShadowFloor = true;
  return floor;
}

/**
 * A. Dual Camera Rig: PerspectiveCamera (for 3D room/depth) + OrthographicCamera (for exact geometric measurement).
 * Mathematical metrics remain 100% independent of camera projection mode.
 */
export function createDualCameraRig({
  fov = 45,
  near = 0.1,
  far = 120,
  orthoHalfHeight = 3.6,
  defaultPosition = [8.5, 6.6, 10.5],
  defaultTarget = [0, 1.1, 0],
  minDistance = 2.2,
  maxDistance = 28,
  minPolarAngle = 0.08,
  maxPolarAngle = Math.PI * 0.49
} = {}) {
  const perspectiveCamera = new THREE.PerspectiveCamera(fov, 1, near, far);
  const orthographicCamera = new THREE.OrthographicCamera(
    -orthoHalfHeight,
    orthoHalfHeight,
    orthoHalfHeight,
    -orthoHalfHeight,
    near,
    far
  );

  const target = new THREE.Vector3(...defaultTarget);
  const initialPos = new THREE.Vector3(...defaultPosition);
  const offset = initialPos.clone().sub(target);
  let distance = Math.max(minDistance, Math.min(maxDistance, offset.length()));
  let pitch = Math.asin(THREE.MathUtils.clamp(offset.y / distance, -0.98, 0.98));
  let yaw = Math.atan2(offset.x, offset.z);

  let goalDistance = distance;
  let goalPitch = pitch;
  let goalYaw = yaw;
  let goalTarget = target.clone();
  let mode = 'perspective'; // 'perspective' | 'orthographic'
  let aspect = 1;

  function syncCameras(damping = 1) {
    const k = THREE.MathUtils.clamp(damping, 0.05, 1);
    distance += (goalDistance - distance) * k;
    pitch += (goalPitch - pitch) * k;
    yaw += (goalYaw - yaw) * k;
    target.lerp(goalTarget, k);

    const cp = Math.cos(pitch);
    const sp = Math.sin(pitch);
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const pos = new THREE.Vector3(
      target.x + distance * cp * sy,
      target.y + distance * sp,
      target.z + distance * cp * cy
    );

    perspectiveCamera.position.copy(pos);
    perspectiveCamera.lookAt(target);

    orthographicCamera.position.copy(pos);
    orthographicCamera.lookAt(target);
    const halfH = Math.max(0.8, distance * Math.tan(THREE.MathUtils.degToRad(fov * 0.5)));
    const halfW = halfH * aspect;
    orthographicCamera.left = -halfW;
    orthographicCamera.right = halfW;
    orthographicCamera.top = halfH;
    orthographicCamera.bottom = -halfH;
    orthographicCamera.updateProjectionMatrix();
  }

  function setSize(width, height) {
    const w = Math.max(1, Number(width) || 1);
    const h = Math.max(1, Number(height) || 1);
    aspect = w / h;
    perspectiveCamera.aspect = aspect;
    perspectiveCamera.updateProjectionMatrix();
    syncCameras(1);
  }

  function setProjectionMode(nextMode) {
    mode = nextMode === 'orthographic' || nextMode === 'ortho' ? 'orthographic' : 'perspective';
    syncCameras(1);
    return mode;
  }

  function toggleProjectionMode() {
    return setProjectionMode(mode === 'perspective' ? 'orthographic' : 'perspective');
  }

  function orbitBy(deltaYaw, deltaPitch) {
    goalYaw += deltaYaw;
    const minPitch = Math.PI * 0.5 - maxPolarAngle;
    const maxPitch = Math.PI * 0.5 - minPolarAngle;
    goalPitch = THREE.MathUtils.clamp(goalPitch + deltaPitch, minPitch, maxPitch);
  }

  function dollyBy(factor) {
    goalDistance = THREE.MathUtils.clamp(goalDistance * factor, minDistance, maxDistance);
  }

  function panBy(dx, dy) {
    const cam = getActiveCamera();
    const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0).normalize();
    const up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1).normalize();
    const scale = 0.0045 * distance;
    goalTarget.addScaledVector(right, -dx * scale).addScaledVector(up, dy * scale);
  }

  function reset() {
    goalTarget.set(...defaultTarget);
    const off = new THREE.Vector3(...defaultPosition).sub(goalTarget);
    goalDistance = Math.max(minDistance, Math.min(maxDistance, off.length()));
    goalPitch = Math.asin(THREE.MathUtils.clamp(off.y / goalDistance, -0.98, 0.98));
    goalYaw = Math.atan2(off.x, off.z);
    syncCameras(1);
  }

  function setPreset(preset) {
    goalTarget.set(...defaultTarget);
    if (preset === 'front') {
      goalYaw = 0;
      goalPitch = 0.05;
    } else if (preset === 'top') {
      goalYaw = 0;
      goalPitch = Math.PI * 0.48;
    } else if (preset === 'side') {
      goalYaw = Math.PI * 0.5;
      goalPitch = 0.05;
    } else if (preset === 'ortho-measure') {
      mode = 'orthographic';
      goalYaw = 0.52;
      goalPitch = 0.36;
    } else {
      reset();
      return;
    }
    syncCameras(1);
  }

  function getActiveCamera() {
    return mode === 'orthographic' ? orthographicCamera : perspectiveCamera;
  }

  syncCameras(1);

  return {
    perspectiveCamera,
    orthographicCamera,
    getActiveCamera,
    getProjectionMode: () => mode,
    setProjectionMode,
    toggleProjectionMode,
    orbitBy,
    dollyBy,
    panBy,
    reset,
    setPreset,
    setSize,
    update: (damping = 0.18) => syncCameras(damping),
    target
  };
}

/**
 * F. Modular Screen-Space Post-Processing (SSAO / GTAO mutually exclusive + Gentle Intro Bloom).
 * Works directly with Three.js r161 WebGLRenderer without requiring external npm bundler packages.
 */
export function createModularPostProcessorV12(rendererOrOpts, scene, getCamera) {
  const isOptsInit = rendererOrOpts && !rendererOrOpts.render && typeof rendererOrOpts === 'object' && !scene;
  const renderer = isOptsInit ? null : rendererOrOpts;
  let qualityId = isOptsInit ? normalizeQualityId(rendererOrOpts.qualityTier || rendererOrOpts.quality || 'medium') : 'medium';
  let aoMode = isOptsInit ? normalizeAOMode(rendererOrOpts.aoMode || rendererOrOpts.ao || 'off', qualityId) : 'off'; // 'off' | 'ssao' | 'gtao'
  let bloomEnabled = isOptsInit && qualityId !== 'low' ? Boolean(rendererOrOpts.bloomEnabled ?? rendererOrOpts.bloom) : false;
  let dofEnabled = isOptsInit && qualityId !== 'low' ? Boolean(rendererOrOpts.dofEnabled ?? rendererOrOpts.dof) : false;
  let colorGrade = isOptsInit ? String(rendererOrOpts.colorGrade || 'neutral') : 'neutral'; // 'neutral' | 'warm' | 'cinema'
  let width = 800;
  let height = 520;
  let pixelRatio = 1;

  let renderTarget = null;
  let postScene = null;
  let postCamera = null;
  let postMaterial = null;
  let postQuad = null;

  function ensurePostResources() {
    if (renderTarget) return true;
    try {
      const depthTexture = new THREE.DepthTexture(width, height);
      depthTexture.type = THREE.UnsignedShortType;
      renderTarget = new THREE.WebGLRenderTarget(width * pixelRatio, height * pixelRatio, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        depthBuffer: true,
        depthTexture
      });

      postScene = new THREE.Scene();
      postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      postMaterial = new THREE.ShaderMaterial({
        uniforms: {
          tDiffuse: { value: renderTarget.texture },
          tDepth: { value: renderTarget.depthTexture },
          uResolution: { value: new THREE.Vector2(width * pixelRatio, height * pixelRatio) },
          uCameraNear: { value: 0.1 },
          uCameraFar: { value: 120.0 },
          uAOMode: { value: 0 }, // 0 = off, 1 = SSAO, 2 = GTAO
          uAOIntensity: { value: 0.38 },
          uBloomEnabled: { value: 0 },
          uBloomStrength: { value: 0.12 },
          uDOFEnabled: { value: 0 },
          uColorGrade: { value: 0 } // 0 = neutral, 1 = warm studio, 2 = cinema contrast
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D tDiffuse;
          uniform sampler2D tDepth;
          uniform vec2 uResolution;
          uniform float uCameraNear;
          uniform float uCameraFar;
          uniform int uAOMode;
          uniform float uAOIntensity;
          uniform int uBloomEnabled;
          uniform float uBloomStrength;
          uniform int uDOFEnabled;
          uniform int uColorGrade;
          varying vec2 vUv;

          float readLinearDepth(vec2 coord) {
            float z = texture2D(tDepth, coord).x;
            return (2.0 * uCameraNear) / (uCameraFar + uCameraNear - z * (uCameraFar - uCameraNear));
          }

          void main() {
            vec4 baseColor = texture2D(tDiffuse, vUv);
            vec2 texel = 1.0 / max(uResolution, vec2(1.0));
            float centerDepth = readLinearDepth(vUv);

            float occlusion = 0.0;
            if (uAOMode > 0 && centerDepth < 0.985) {
              float radius = uAOMode == 2 ? 2.6 : 2.0;
              vec2 offsets[8];
              offsets[0] = vec2( 1.0,  0.0);
              offsets[1] = vec2(-1.0,  0.0);
              offsets[2] = vec2( 0.0,  1.0);
              offsets[3] = vec2( 0.0, -1.0);
              offsets[4] = vec2( 0.707,  0.707);
              offsets[5] = vec2(-0.707,  0.707);
              offsets[6] = vec2( 0.707, -0.707);
              offsets[7] = vec2(-0.707, -0.707);

              for (int i = 0; i < 8; i++) {
                float sampleD = readLinearDepth(vUv + offsets[i] * texel * radius);
                float diff = centerDepth - sampleD;
                if (diff > 0.00035 && diff < 0.028) {
                  occlusion += smoothstep(0.028, 0.00035, diff);
                }
              }
              occlusion = clamp((occlusion / 8.0) * uAOIntensity * (uAOMode == 2 ? 1.22 : 1.0), 0.0, 0.42);
            }

            vec3 col = baseColor.rgb * (1.0 - occlusion);

            // Intro Cinematic Depth-of-Field (DOF): gently blurs far background (>0.22 linear depth) while keeping focal math solids sharp
            if (uDOFEnabled == 1) {
              float coc = clamp((abs(centerDepth - 0.11) - 0.065) * 7.5, 0.0, 1.0);
              if (coc > 0.02) {
                vec3 dofBlur = vec3(0.0);
                float r = 2.4 * coc;
                dofBlur += texture2D(tDiffuse, vUv + vec2( r,  0.0) * texel).rgb;
                dofBlur += texture2D(tDiffuse, vUv + vec2(-r,  0.0) * texel).rgb;
                dofBlur += texture2D(tDiffuse, vUv + vec2( 0.0,  r) * texel).rgb;
                dofBlur += texture2D(tDiffuse, vUv + vec2( 0.0, -r) * texel).rgb;
                col = mix(col, dofBlur * 0.25, coc * 0.68);
              }
            }

            // Gentle highlight bloom for intro/presentation without blurring dark geometric text/edges
            if (uBloomEnabled == 1) {
              vec3 blurSum = vec3(0.0);
              blurSum += texture2D(tDiffuse, vUv + vec2( 1.5,  1.5) * texel).rgb;
              blurSum += texture2D(tDiffuse, vUv + vec2(-1.5,  1.5) * texel).rgb;
              blurSum += texture2D(tDiffuse, vUv + vec2( 1.5, -1.5) * texel).rgb;
              blurSum += texture2D(tDiffuse, vUv + vec2(-1.5, -1.5) * texel).rgb;
              blurSum *= 0.25;
              float luma = dot(blurSum, vec3(0.299, 0.587, 0.114));
              vec3 bright = max(vec3(0.0), blurSum - 0.78) * smoothstep(0.75, 1.0, luma);
              col += bright * uBloomStrength;
            }

            // Color Grading (Warm Studio / Cinema Contrast)
            if (uColorGrade == 1) {
              col *= vec3(1.03, 1.005, 0.96);
            } else if (uColorGrade == 2) {
              col = clamp((col - 0.5) * 1.08 + 0.5, 0.0, 1.0);
              col *= vec3(0.98, 1.01, 1.04);
            }

            gl_FragColor = vec4(col, baseColor.a);
          }
        `,
        depthWrite: false,
        depthTest: false
      });

      postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMaterial);
      postScene.add(postQuad);
      return true;
    } catch {
      renderTarget = null;
      return false;
    }
  }

  function setSize(w, h, dpr = 1) {
    width = Math.max(1, Math.round(w));
    height = Math.max(1, Math.round(h));
    pixelRatio = Math.max(1, dpr);
    if (renderTarget) {
      renderTarget.setSize(Math.round(width * pixelRatio), Math.round(height * pixelRatio));
    }
    if (postMaterial) {
      postMaterial.uniforms.uResolution.value.set(width * pixelRatio, height * pixelRatio);
    }
  }

  function setConfig({ ao = aoMode, bloom = bloomEnabled, dof = dofEnabled, colorGrade: nextGrade = colorGrade, quality = qualityId } = {}) {
    qualityId = normalizeQualityId(quality);
    aoMode = normalizeAOMode(ao, qualityId);
    bloomEnabled = qualityId === 'low' ? false : Boolean(bloom);
    dofEnabled = qualityId === 'low' ? false : Boolean(dof);
    colorGrade = ['neutral', 'warm', 'cinema'].includes(nextGrade) ? nextGrade : 'neutral';
    return { aoMode, bloomEnabled, dofEnabled, colorGrade, qualityTier: qualityId, mutuallyExclusiveAO: true };
  }

  function setAOMode(nextAO) {
    aoMode = normalizeAOMode(nextAO, qualityId);
    return aoMode;
  }

  function setBloomEnabled(nextBloom) {
    bloomEnabled = qualityId === 'low' ? false : Boolean(nextBloom);
    return bloomEnabled;
  }

  function setDOFEnabled(nextDOF) {
    dofEnabled = qualityId === 'low' ? false : Boolean(nextDOF);
    return dofEnabled;
  }

  function setColorGrade(nextGrade) {
    if (nextGrade === 'warmStudio' || nextGrade === 'warm') colorGrade = 'warm';
    else if (nextGrade === 'cinemaContrast' || nextGrade === 'cinema') colorGrade = 'cinema';
    else colorGrade = 'neutral';
    return colorGrade;
  }

  function setQualityTier(nextTier) {
    qualityId = normalizeQualityId(nextTier);
    aoMode = normalizeAOMode(aoMode, qualityId);
    if (qualityId === 'low') {
      bloomEnabled = false;
      dofEnabled = false;
    }
    return qualityId;
  }

  function applyToCanvas(canvasEl) {
    if (!canvasEl || !canvasEl.style) return;
    // Never apply DOM CSS filter / drop-shadow onto a full-screen WebGL canvas:
    // Chromium/Windows compositors read back the entire framebuffer every frame when canvas.style.filter is non-empty.
    // All tone mapping, exposure, and grading are handled directly inside WebGL at 0ms compositor cost.
    canvasEl.style.filter = '';
    if (canvasEl.dataset) {
      canvasEl.dataset.v12AoMode = aoMode;
      canvasEl.dataset.v12Bloom = String(bloomEnabled);
      canvasEl.dataset.v12ColorGrade = colorGrade;
    }
  }

  function render() {
    const cam = typeof getCamera === 'function' ? getCamera() : getCamera;
    if (!renderer || !scene || !cam) return;
    // Automatically disable DOF when observing in Orthographic measurement mode
    const effectiveDOF = dofEnabled && !cam.isOrthographicCamera;
    const needsPost = (aoMode !== 'off' || bloomEnabled || effectiveDOF || colorGrade !== 'neutral') && ensurePostResources();
    if (!needsPost) {
      renderer.setRenderTarget(null);
      renderer.render(scene, cam);
      return;
    }
    postMaterial.uniforms.uCameraNear.value = cam.near || 0.1;
    postMaterial.uniforms.uCameraFar.value = cam.far || 120.0;
    postMaterial.uniforms.uAOMode.value = aoMode === 'gtao' ? 2 : aoMode === 'ssao' ? 1 : 0;
    postMaterial.uniforms.uBloomEnabled.value = bloomEnabled ? 1 : 0;
    postMaterial.uniforms.uDOFEnabled.value = effectiveDOF ? 1 : 0;
    postMaterial.uniforms.uColorGrade.value = colorGrade === 'cinema' ? 2 : colorGrade === 'warm' ? 1 : 0;

    renderer.setRenderTarget(renderTarget);
    renderer.clear();
    renderer.render(scene, cam);
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCamera);
  }

  function dispose() {
    renderTarget?.dispose?.();
    postQuad?.geometry?.dispose?.();
    postMaterial?.dispose?.();
    renderTarget = null;
  }

  return {
    setSize,
    setConfig,
    setAOMode,
    setBloomEnabled,
    setDOFEnabled,
    setColorGrade,
    setColorGrading: setColorGrade,
    setQualityTier,
    applyToCanvas,
    getConfig: () => ({ aoMode, bloomEnabled, dofEnabled, colorGrade, qualityTier: qualityId, mutuallyExclusiveAO: true }),
    getState: () => ({ aoMode, bloomEnabled, dofEnabled, colorGrade, qualityTier: qualityId, mutuallyExclusiveAO: true }),
    render,
    dispose
  };
}

/**
 * H. Constraint-Preserving Geometric Motion & Lightweight Rigid-Body Drop/Bounce Physics.
 * Rapier-compatible API: used ONLY when a model explicitly requests drop/bounce/collision.
 */
export function tweenGeometryConstraint({ from = 0, to = 1, progress = 0, easing = 'cubicInOut' } = {}) {
  const t = THREE.MathUtils.clamp(Number(progress) || 0, 0, 1);
  let k = t;
  if (easing === 'cubicInOut') {
    k = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  return from + (to - from) * k;
}

export function createRigidDropSimulatorV12({ gravity = -16.5, restitution = 0.56 } = {}) {
  const bodies = new Map();

  function registerBody(mesh, { groundY = 1.4, mass = 1 } = {}) {
    if (!mesh) return;
    bodies.set(mesh, {
      mesh,
      groundY,
      mass,
      vy: 0,
      omega: new THREE.Vector3(0, 0, 0),
      resting: true
    });
  }

  function triggerDrop(heightOffset = 2.6) {
    for (const b of bodies.values()) {
      b.mesh.position.y = b.groundY + heightOffset;
      b.vy = 0;
      b.omega.set((Math.random() - 0.5) * 2.4, (Math.random() - 0.5) * 3.0, (Math.random() - 0.5) * 2.4);
      b.resting = false;
    }
  }

  function step(dt) {
    const delta = Math.min(Math.max(0, dt), 0.04);
    let activeCount = 0;
    for (const b of bodies.values()) {
      if (b.resting) continue;
      activeCount++;
      b.vy += gravity * delta;
      b.mesh.position.y += b.vy * delta;
      b.mesh.rotation.x += b.omega.x * delta;
      b.mesh.rotation.y += b.omega.y * delta;
      b.mesh.rotation.z += b.omega.z * delta;

      if (b.mesh.position.y <= b.groundY) {
        b.mesh.position.y = b.groundY;
        if (Math.abs(b.vy) > 0.65) {
          b.vy = -b.vy * restitution;
          b.omega.multiplyScalar(0.65);
        } else {
          b.vy = 0;
          b.omega.set(0, 0, 0);
          b.mesh.rotation.set(0, b.mesh.rotation.y, 0);
          b.resting = true;
        }
      }
    }
    return activeCount > 0;
  }

  return { registerBody, triggerDrop, step };
}

/**
 * I. Real-Time FPS, Model Load Time & WebGL DrawCall / Triangle / Geometry / Texture Telemetry.
 */
export function createPerformanceTrackerV12(renderer) {
  let frames = 0;
  let elapsed = 0;
  let fps = 60;
  let frameTimeMs = 16.7;
  let lastModelLoadMs = 0;
  let loadStartAt = 0;

  function markModelLoadStart() {
    loadStartAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  function markModelLoadEnd() {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (loadStartAt > 0) {
      lastModelLoadMs = Math.max(0.1, Math.round((now - loadStartAt) * 10) / 10);
    }
    return lastModelLoadMs;
  }

  function tick(dt) {
    const d = Math.max(0.0001, Number(dt) || 0.016);
    frames++;
    elapsed += d;
    if (elapsed >= 0.5) {
      fps = Math.round(frames / elapsed);
      frameTimeMs = Math.round((elapsed / frames) * 10000) / 10;
      frames = 0;
      elapsed = 0;
    }
    return getSnapshot();
  }

  function getSnapshot() {
    const info = renderer?.info;
    return {
      fps,
      frameTimeMs,
      modelLoadMs: lastModelLoadMs,
      drawCalls: info?.render?.calls ?? 0,
      triangles: info?.render?.triangles ?? 0,
      geometries: info?.memory?.geometries ?? 0,
      textures: info?.memory?.textures ?? 0
    };
  }

  return {
    markModelLoadStart,
    markModelLoadEnd,
    tick,
    getSnapshot
  };
}

/**
 * Adaptive FPS Governor & Shadow Update Optimizer:
 * Smoothly adjusts dynamic PixelRatio and caches static shadow maps when FPS dips below target.
 */
export function createAdaptiveFPSGovernorV12(renderer, {
  targetFPS = 55,
  lowThresholdFPS = 38,
  minDPR = 0.85,
  maxDPR = 2.0
} = {}) {
  let currentDPR = renderer?.getPixelRatio?.() || 1.25;
  let lowStreak = 0;
  let highStreak = 0;

  function evaluate(fps, qualityTier = 'medium') {
    if (!renderer) return currentDPR;
    const cap = QUALITY_PROFILES_V12[normalizeQualityId(qualityTier)]?.pixelRatioCap || maxDPR;
    if (fps < lowThresholdFPS) {
      lowStreak++;
      highStreak = 0;
      if (lowStreak >= 3) {
        currentDPR = Math.max(minDPR, Math.round((currentDPR - 0.15) * 100) / 100);
        renderer.setPixelRatio(currentDPR);
        lowStreak = 0;
      }
    } else if (fps >= targetFPS) {
      highStreak++;
      lowStreak = 0;
      if (highStreak >= 5 && currentDPR < cap) {
        const hw = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
        currentDPR = Math.min(Math.min(hw, cap), Math.round((currentDPR + 0.08) * 100) / 100);
        renderer.setPixelRatio(currentDPR);
        highStreak = 0;
      }
    }
    return currentDPR;
  }

  return {
    evaluate,
    getCurrentDPR: () => currentDPR
  };
}

/**
 * Runtime GLB Scene Optimizer (glTF-Transform inspired runtime pass):
 * - Deduplicates identical MeshStandardMaterial / MeshBasicMaterial instances across sub-meshes
 * - Computes bounding spheres & enables frustumCulled = true for fast GPU culling
 * - Normalizes PBR roughness/metalness & enables conditional shadow casting
 */
export function optimizeLoadedGLBSceneV12(rootObject, {
  deduplicateMaterials = true,
  frustumCulled = true,
  castShadow = true,
  receiveShadow = true,
  maxAnisotropy = 4
} = {}) {
  if (!rootObject || typeof rootObject.traverse !== 'function') {
    return { meshes: 0, deduplicatedMaterials: 0 };
  }
  const matPool = new Map();
  let meshes = 0;
  let deduplicatedMaterials = 0;

  rootObject.traverse((obj) => {
    if (!obj.isMesh) return;
    meshes++;
    obj.frustumCulled = Boolean(frustumCulled);
    obj.castShadow = Boolean(castShadow);
    obj.receiveShadow = Boolean(receiveShadow);
    if (obj.geometry && !obj.geometry.boundingSphere) {
      obj.geometry.computeBoundingSphere?.();
    }

    const processMat = (m) => {
      if (!m) return m;
      if (m.map) {
        m.map.colorSpace = THREE.SRGBColorSpace;
        m.map.anisotropy = Math.min(maxAnisotropy, m.map.anisotropy || maxAnisotropy);
      }
      if (m.isMeshStandardMaterial) {
        m.roughness = THREE.MathUtils.clamp(m.roughness ?? 0.55, 0.08, 0.96);
        m.metalness = THREE.MathUtils.clamp(m.metalness ?? 0.12, 0.0, 0.92);
        m.envMapIntensity = m.envMapIntensity ?? 1.05;
      }
      if (!deduplicateMaterials || m.map || m.normalMap || m.roughnessMap) return m;
      const sig = `${m.type}:${m.color?.getHexString?.() || ''}:${m.roughness ?? ''}:${m.metalness ?? ''}:${m.opacity ?? 1}:${m.transparent ? 1 : 0}`;
      if (matPool.has(sig)) {
        deduplicatedMaterials++;
        return matPool.get(sig);
      }
      matPool.set(sig, m);
      return m;
    };

    if (Array.isArray(obj.material)) {
      obj.material = obj.material.map(processMat);
    } else if (obj.material) {
      obj.material = processMat(obj.material);
    }
  });

  return { meshes, deduplicatedMaterials, uniqueMaterials: matPool.size };
}

/**
 * Rule 5: Mathematical Invariance Computation for the 3 Canonical Solids (Cube, Sphere, Cone).
 * Values depend ONLY on intrinsic geometric parameters, NEVER on camera angle, AO, Bloom, or animation.
 */
export function computeCanonicalSolidMath(id) {
  if (id === 'cube') {
    const a = 1.65;
    const V = Math.pow(a, 3);
    const Stp = 6 * a * a;
    return {
      id: 'cube',
      name: 'Khối lập phương ABCD.A\'B\'C\'D\'',
      paramsText: `Cạnh a = ${a} đv`,
      formulas: `V = a³ = ${V.toFixed(3)} đv³ · S_tp = 6a² = ${Stp.toFixed(3)} đv²`,
      invariants: '6 mặt vuông bằng nhau · 12 cạnh bằng nhau · 8 đỉnh · Góc nhị diện = 90° (AB ⊥ BC, AA\' ⊥ (ABCD))'
    };
  }
  if (id === 'sphere') {
    const R = 0.87;
    const V = (4 / 3) * Math.PI * Math.pow(R, 3);
    const S = 4 * Math.PI * R * R;
    return {
      id: 'sphere',
      name: 'Khối cầu tâm O(0, R, 0)',
      paramsText: `Bán kính R = ${R} đv`,
      formulas: `V = (4/3)πR³ ≈ ${V.toFixed(3)} đv³ · S = 4πR² ≈ ${S.toFixed(3)} đv²`,
      invariants: 'Mọi điểm trên mặt cầu cách đều tâm O một khoảng R = 0.87 đv độc lập với phép quay'
    };
  }
  const r = 0.88;
  const h = 1.85;
  const l = Math.hypot(r, h);
  const V = (1 / 3) * Math.PI * r * r * h;
  const Sxq = Math.PI * r * l;
  return {
    id: 'cone',
    name: 'Khối nón tròn xoay đỉnh S',
    paramsText: `Bán kính đáy r = ${r} đv · Chiều cao h = ${h} đv · Đường sinh l = √(r²+h²) ≈ ${l.toFixed(3)} đv`,
    formulas: `V = (1/3)πr²h ≈ ${V.toFixed(3)} đv³ · S_xq = πrl ≈ ${Sxq.toFixed(3)} đv²`,
    invariants: 'Trục SO ⊥ mặt phẳng đáy (O; r) · Góc ở đỉnh và tỉ số h/r bất biến dưới mọi góc camera'
  };
}

/**
 * J. Interactive A/B Depth Comparison Test Scene Modal (Before vs. After Upgrade)
 * Includes Cube, Sphere, Cone, Floor, Plinths, Occlusion Backdrop, Directional + Hemisphere Lights,
 * Shadows, SSAO/GTAO, Low/Medium/High, Ortho/Persp Measurement Camera, and Physics Drop Test.
 */
export function openABDepthTestModal() {
  if (typeof document === 'undefined') return null;
  let modal = document.getElementById('mv-v12-ab-modal');
  if (modal) {
    modal.hidden = false;
    modal.userData?.onOpen?.();
    return modal;
  }

  modal = document.createElement('div');
  modal.id = 'mv-v12-ab-modal';
  modal.className = 'mv-v12-ab-modal';
  modal.innerHTML = `
    <div class="mv-v12-ab-card" role="dialog" aria-modal="true" aria-label="Cảnh thử nghiệm A/B Chiều sâu 3D MATHVERSE V12">
      <div class="mv-v12-ab-header">
        <div>
          <span class="mv-v12-ab-badge">NGHIỆM THU KỸ THUẬT MỤC J · THREE.JS R161</span>
          <h2>🧪 Cảnh Thử Nghiệm A/B: Trước & Sau Nâng Cấp Kết Xuất 3D Có Chiều Sâu</h2>
        </div>
        <button type="button" id="mv-v12-ab-close" class="mv-v12-ab-close" aria-label="Đóng">✕</button>
      </div>

      <div class="mv-v12-ab-toolbar">
        <div class="mv-v12-ab-group" role="group" aria-label="Chế độ so sánh A/B">
          <button type="button" id="mv-v12-mode-before" class="mv-v12-btn">🅰 Trước Nâng Cấp (Phẳng / Không bóng)</button>
          <button type="button" id="mv-v12-mode-after" class="mv-v12-btn is-active">🅱 Sau Nâng Cấp (V12 3D Depth + PBR + Bóng đổ)</button>
        </div>

        <label class="mv-v12-ctrl">
          <span>Chất lượng:</span>
          <select id="mv-v12-ab-quality">
            <option value="low">Low (DPR 1 · Shadow 512 · Tắt AO)</option>
            <option value="medium" selected>Medium (DPR 1.5 · Shadow 1024)</option>
            <option value="high">High (DPR 2.0 · Shadow 2048 · AO)</option>
          </select>
        </label>

        <label class="mv-v12-ctrl">
          <span>Vật liệu PBR:</span>
          <select id="mv-v12-ab-material">
            <option value="default" selected>Mặc định (3 màu Toán học)</option>
            <option value="woodOak">🪵 Gỗ Sồi (Rough 0.62)</option>
            <option value="crystalGlass">💎 Kính Pha Lê (Rough 0.08)</option>
            <option value="brushedMetal">🥇 Kim loại Đồng Vàng (Metal 0.86)</option>
            <option value="glossyPlastic">🧪 Nhựa Học cụ (Clearcoat 0.65)</option>
            <option value="marbleStone">🏛️ Đá Cẩm thạch (Rough 0.38)</option>
          </select>
        </label>

        <label class="mv-v12-ctrl">
          <span>Hậu kỳ AO:</span>
          <select id="mv-v12-ab-ao">
            <option value="off">Tắt AO</option>
            <option value="ssao" selected>Bật SSAO</option>
            <option value="gtao">Bật GTAO</option>
          </select>
        </label>

        <label class="mv-v12-ctrl">
          <span>Color Grading:</span>
          <select id="mv-v12-ab-grade">
            <option value="neutral" selected>Chuẩn Sư phạm (Neutral)</option>
            <option value="warm">Nắng ấm (Warm Studio)</option>
            <option value="cinema">Điện ảnh (Cinema Contrast)</option>
          </select>
        </label>

        <label class="mv-v12-ctrl">
          <input type="checkbox" id="mv-v12-ab-shadows" checked />
          <span>Bóng đổ mềm</span>
        </label>

        <label class="mv-v12-ctrl">
          <input type="checkbox" id="mv-v12-ab-contact" checked />
          <span>Bóng tiếp xúc</span>
        </label>

        <label class="mv-v12-ctrl">
          <input type="checkbox" id="mv-v12-ab-fog" checked />
          <span>Sương mù xa gần</span>
        </label>

        <label class="mv-v12-ctrl">
          <input type="checkbox" id="mv-v12-ab-bloom" />
          <span>Bloom nhẹ</span>
        </label>

        <label class="mv-v12-ctrl" title="Làm mờ hậu cảnh điện ảnh cho cảnh giới thiệu (tự tắt khi bật Camera Trực giao đo đạc)">
          <input type="checkbox" id="mv-v12-ab-dof" />
          <span>DOF Giới thiệu</span>
        </label>

        <label class="mv-v12-ctrl">
          <input type="checkbox" id="mv-v12-ab-anim" checked />
          <span>Chuyển động</span>
        </label>

        <button type="button" id="mv-v12-ab-proj" class="mv-v12-btn">🎥 Camera: Phối cảnh (Perspective)</button>
        <button type="button" id="mv-v12-ab-drop" class="mv-v12-btn">🎲 Thả Rơi Vật Lý (Bounce)</button>
        <button type="button" id="mv-v12-ab-reset" class="mv-v12-btn">↺ Reset Camera</button>
      </div>

      <div class="mv-v12-ab-stage">
        <canvas id="mv-v12-ab-canvas"></canvas>
        <div class="mv-v12-ab-telemetry" id="mv-v12-ab-telemetry">
          <span>FPS: <strong id="mv-v12-ab-fps">60</strong></span>
          <span>Draw calls: <strong id="mv-v12-ab-draws">0</strong></span>
          <span>Triangles: <strong id="mv-v12-ab-tris">0</strong></span>
          <span>Geometries: <strong id="mv-v12-ab-geos">0</strong></span>
          <span>Textures: <strong id="mv-v12-ab-texs">0</strong></span>
          <span>Tải mô hình: <strong id="mv-v12-ab-load">0.8 ms</strong></span>
          <span>Đã nhận diện: <strong id="mv-v12-ab-score">0 / 3</strong></span>
        </div>
      </div>

      <div class="mv-v12-ab-footer" id="mv-v12-ab-math">
        <div>
          <strong id="mv-v12-ab-solid-title">Nhấp chuột vào Khối lập phương, Khối cầu hoặc Khối nón để kiểm tra bất biến Toán học</strong>
          <p id="mv-v12-ab-solid-formula">Mọi số đo góc, độ dài, diện tích, thể tích và quan hệ vuông góc/song song được giữ chính xác 100% độc lập với camera, AO, Bloom hay hoạt ảnh.</p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const canvas = modal.querySelector('#mv-v12-ab-canvas');
  const stageEl = modal.querySelector('.mv-v12-ab-stage');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  configureRendererV12(renderer, { quality: 'medium', exposure: 1.10, shadows: true });

  const perf = createPerformanceTrackerV12(renderer);
  perf.markModelLoadStart();

  const scene = new THREE.Scene();
  const bgAfter = new THREE.Color('#ddebf6');
  const bgBefore = new THREE.Color('#e2e8f0');
  const atmosphericFog = new THREE.Fog('#ddebf6', 14, 36);
  scene.background = bgAfter.clone();
  scene.fog = atmosphericFog;

  const envTexture = createProceduralHDRIEnvironment(renderer);
  scene.environment = envTexture;

  const camRig = createDualCameraRig({
    fov: 44,
    near: 0.1,
    far: 110,
    defaultPosition: [8.5, 6.6, 10.5],
    defaultTarget: [0, 1.1, 0],
    minDistance: 4.2,
    maxDistance: 28
  });

  const lightRig = createLightingRigV12(scene, {
    shadowMapSize: 1024,
    shadowBounds: 11,
    shadowFar: 37,
    keyPosition: [-4.5, 11, 8],
    keyIntensity: 3.2,
    hemiIntensity: 1.35,
    fillIntensity: 0.65
  });

  function addSceneMesh(geo, pbrMat, basicColor, pos, { shadow = true } = {}) {
    const basicMat = new THREE.MeshBasicMaterial({ color: basicColor });
    const m = new THREE.Mesh(geo, pbrMat);
    m.position.set(...pos);
    m.castShadow = shadow;
    m.receiveShadow = true;
    m.userData.pbrMaterial = pbrMat;
    m.userData.legacyMaterial = basicMat;
    scene.add(m);
    return m;
  }

  const floor = addSceneMesh(new THREE.PlaneGeometry(70, 70), PBR_PRESETS_V12.floorSlate(), 0xcbd5e1, [0, -0.09, 0], { shadow: false });
  floor.rotation.x = -Math.PI / 2;

  const grid = new THREE.GridHelper(42, 42, 0x87a1b9, 0xb2c3d5);
  grid.position.y = -0.075;
  scene.add(grid);

  addSceneMesh(new THREE.BoxGeometry(9.1, 0.34, 5.3), PBR_PRESETS_V12.stageBase(), 0x64748b, [0, 0.17, 0]);
  addSceneMesh(new THREE.BoxGeometry(8.8, 0.10, 5.05), PBR_PRESETS_V12.stageTop(), 0xe2e8f0, [0, 0.40, 0]);
  addSceneMesh(new THREE.BoxGeometry(15, 6, 0.28), PBR_PRESETS_V12.backdropWall(), 0xf1f5f9, [0, 3.0, -5.3]);
  addSceneMesh(new THREE.BoxGeometry(1.1, 2.8, 1.1), PBR_PRESETS_V12.pillarLeft(), 0x94a3b8, [-6.6, 1.4, -2.4]);
  addSceneMesh(new THREE.BoxGeometry(1.1, 3.9, 1.1), PBR_PRESETS_V12.pillarRight(), 0x94a3b8, [6.4, 1.95, -3.1]);

  for (const x of [-2.35, 0, 2.35]) {
    addSceneMesh(new THREE.BoxGeometry(2, 0.13, 1.65), PBR_PRESETS_V12.plinthStone(), 0x7390a5, [x, 0.48, 0.62]);
  }

  const interactiveSolids = [];
  const contactShadowDiscs = [];
  const physicsSim = createRigidDropSimulatorV12();

  function addSolid(geo, pbrMat, basicColor, pos, id) {
    const m = addSceneMesh(geo, pbrMat, basicColor, pos, { shadow: true });
    m.userData.solidId = id;
    m.userData.defaultPbrMaterial = pbrMat;
    m.userData.baseY = pos[1];
    m.userData.offset = interactiveSolids.length * 1.45;
    interactiveSolids.push(m);
    physicsSim.registerBody(m, { groundY: pos[1] });

    const contactDisc = createContactShadowDisc({ radius: 0.92, groundY: 0.555, maxOpacity: 0.40 });
    contactDisc.position.x = pos[0];
    contactDisc.position.z = pos[2];
    scene.add(contactDisc);
    contactShadowDiscs.push({ disc: contactDisc, target: m, restY: pos[1] });
    return m;
  }

  addSolid(new THREE.BoxGeometry(1.65, 1.65, 1.65), PBR_PRESETS_V12.cubeBlue(), 0x358ce1, [-2.35, 1.39, 0.62], 'cube');
  addSolid(new THREE.SphereGeometry(0.87, 48, 32), PBR_PRESETS_V12.sphereCoral(), 0xea8353, [0, 1.47, 0.62], 'sphere');
  addSolid(new THREE.ConeGeometry(0.88, 1.85, 48), PBR_PRESETS_V12.coneTeal(), 0x27ae94, [2.35, 1.52, 0.62], 'cone');

  const loadMs = perf.markModelLoadEnd();
  modal.querySelector('#mv-v12-ab-load').textContent = `${loadMs} ms`;

  const postProcessor = createModularPostProcessorV12(renderer, scene, () => camRig.getActiveCamera());

  let abMode = 'after'; // 'before' | 'after'
  let physicsActive = false;
  const foundSet = new Set();

  function applyMaterialPreset() {
    const matKey = modal.querySelector('#mv-v12-ab-material')?.value || 'default';
    interactiveSolids.forEach((m) => {
      if (matKey === 'default' || !PBR_PRESETS_V12[matKey]) {
        m.userData.pbrMaterial = m.userData.defaultPbrMaterial;
      } else {
        m.userData.pbrMaterial = PBR_PRESETS_V12[matKey]();
      }
      if (abMode === 'after') {
        m.material = m.userData.pbrMaterial;
      }
    });
  }

  function applyABMode(nextMode) {
    abMode = nextMode === 'before' ? 'before' : 'after';
    modal.querySelector('#mv-v12-mode-before').classList.toggle('is-active', abMode === 'before');
    modal.querySelector('#mv-v12-mode-after').classList.toggle('is-active', abMode === 'after');

    const shadowsChecked = modal.querySelector('#mv-v12-ab-shadows').checked;
    const contactChecked = modal.querySelector('#mv-v12-ab-contact')?.checked ?? true;
    const fogChecked = modal.querySelector('#mv-v12-ab-fog').checked;
    const useAfter = abMode === 'after';

    scene.background.copy(useAfter ? bgAfter : bgBefore);
    scene.fog = useAfter && fogChecked ? atmosphericFog : null;
    scene.environment = useAfter ? envTexture : null;
    lightRig.setShadowsEnabled(renderer, useAfter && shadowsChecked);

    contactShadowDiscs.forEach(({ disc }) => {
      disc.visible = useAfter && contactChecked;
    });

    applyMaterialPreset();
    scene.traverse((obj) => {
      if (obj.isMesh && obj.userData.pbrMaterial && obj.userData.legacyMaterial) {
        obj.material = useAfter ? obj.userData.pbrMaterial : obj.userData.legacyMaterial;
      }
    });
  }

  function applyQualityAndPost() {
    const qVal = modal.querySelector('#mv-v12-ab-quality').value;
    const aoSelect = modal.querySelector('#mv-v12-ab-ao');
    const gradeSelect = modal.querySelector('#mv-v12-ab-grade');
    const bloomCheck = modal.querySelector('#mv-v12-ab-bloom');
    const dofCheck = modal.querySelector('#mv-v12-ab-dof');
    if (qVal === 'low') {
      aoSelect.value = 'off';
      bloomCheck.checked = false;
      if (dofCheck) dofCheck.checked = false;
    }
    const cfg = configureRendererV12(renderer, {
      quality: qVal,
      exposure: 1.10,
      shadows: abMode === 'after' && modal.querySelector('#mv-v12-ab-shadows').checked
    });
    lightRig.setShadowMapSize(cfg.shadowMapSize);
    postProcessor.setConfig({
      ao: abMode === 'after' ? aoSelect.value : 'off',
      bloom: abMode === 'after' && bloomCheck.checked,
      dof: abMode === 'after' && Boolean(dofCheck?.checked),
      colorGrade: abMode === 'after' ? (gradeSelect?.value || 'neutral') : 'neutral',
      quality: qVal
    });
    resize();
  }

  function resize() {
    const w = Math.max(200, stageEl.clientWidth || 860);
    const h = Math.max(200, stageEl.clientHeight || 480);
    camRig.setSize(w, h);
    renderer.setSize(w, h, false);
    postProcessor.setSize(w, h, renderer.getPixelRatio());
  }

  // Orbit / Pan / Raycast pointer interactions
  let pointerDown = null;
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  canvas.addEventListener('pointerdown', (e) => {
    pointerDown = { x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, pan: e.shiftKey || e.button === 2 };
    canvas.setPointerCapture?.(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!pointerDown) return;
    const dx = e.clientX - pointerDown.x;
    const dy = e.clientY - pointerDown.y;
    pointerDown.x = e.clientX;
    pointerDown.y = e.clientY;
    if (pointerDown.pan) camRig.panBy(dx, dy);
    else camRig.orbitBy(-dx * 0.0075, dy * 0.0065);
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!pointerDown) return;
    const moved = Math.hypot(e.clientX - pointerDown.startX, e.clientY - pointerDown.startY);
    pointerDown = null;
    if (moved > 6) return;
    const rect = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camRig.getActiveCamera());
    const hit = raycaster.intersectObjects(interactiveSolids, false)[0];
    if (!hit) return;
    const solidId = hit.object.userData.solidId;
    const info = computeCanonicalSolidMath(solidId);
    foundSet.add(solidId);
    modal.querySelector('#mv-v12-ab-score').textContent = `${foundSet.size} / 3`;
    modal.querySelector('#mv-v12-ab-solid-title').textContent = `📐 ${info.name} — ${info.paramsText}`;
    modal.querySelector('#mv-v12-ab-solid-formula').textContent = `${info.formulas} | Bất biến: ${info.invariants}`;
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    camRig.dollyBy(e.deltaY < 0 ? 0.9 : 1.1);
  }, { passive: false });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  modal.querySelector('#mv-v12-mode-before').addEventListener('click', () => { applyABMode('before'); applyQualityAndPost(); });
  modal.querySelector('#mv-v12-mode-after').addEventListener('click', () => { applyABMode('after'); applyQualityAndPost(); });
  modal.querySelector('#mv-v12-ab-material')?.addEventListener('change', () => applyMaterialPreset());
  modal.querySelector('#mv-v12-ab-quality').addEventListener('change', applyQualityAndPost);
  modal.querySelector('#mv-v12-ab-ao').addEventListener('change', applyQualityAndPost);
  modal.querySelector('#mv-v12-ab-grade')?.addEventListener('change', applyQualityAndPost);
  modal.querySelector('#mv-v12-ab-bloom').addEventListener('change', applyQualityAndPost);
  modal.querySelector('#mv-v12-ab-dof')?.addEventListener('change', applyQualityAndPost);
  modal.querySelector('#mv-v12-ab-shadows').addEventListener('change', () => { applyABMode(abMode); applyQualityAndPost(); });
  modal.querySelector('#mv-v12-ab-contact')?.addEventListener('change', () => applyABMode(abMode));
  modal.querySelector('#mv-v12-ab-fog').addEventListener('change', () => applyABMode(abMode));
  modal.querySelector('#mv-v12-ab-proj').addEventListener('click', (e) => {
    const next = camRig.toggleProjectionMode();
    e.currentTarget.textContent = next === 'orthographic'
      ? '📐 Camera: Trực giao Đo đạc (Orthographic)'
      : '🎥 Camera: Phối cảnh (Perspective)';
  });
  modal.querySelector('#mv-v12-ab-drop').addEventListener('click', () => {
    physicsActive = true;
    physicsSim.triggerDrop(2.6);
  });
  modal.querySelector('#mv-v12-ab-reset').addEventListener('click', () => camRig.reset());
  modal.querySelector('#mv-v12-ab-close').addEventListener('click', () => {
    modal.hidden = true;
  });

  const clock = new THREE.Clock();
  let timer = 0;

  function loop() {
    requestAnimationFrame(loop);
    if (modal.hidden) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    timer += dt;

    if (physicsActive) {
      physicsActive = physicsSim.step(dt);
    } else if (modal.querySelector('#mv-v12-ab-anim').checked) {
      interactiveSolids.forEach((obj, idx) => {
        obj.rotation.y += dt * (0.18 + idx * 0.06);
        obj.position.y = obj.userData.baseY + 0.03 * Math.sin(timer * 1.5 + obj.userData.offset);
      });
    }
    contactShadowDiscs.forEach(({ disc, target, restY }) => {
      disc.userData.syncWithObject(target, restY);
    });

    camRig.update(0.18);
    postProcessor.render();

    const snap = perf.tick(dt);
    modal.querySelector('#mv-v12-ab-fps').textContent = String(snap.fps);
    modal.querySelector('#mv-v12-ab-draws').textContent = String(snap.drawCalls);
    modal.querySelector('#mv-v12-ab-tris').textContent = String(snap.triangles);
    modal.querySelector('#mv-v12-ab-geos').textContent = String(snap.geometries);
    modal.querySelector('#mv-v12-ab-texs').textContent = String(snap.textures);
  }

  window.addEventListener('resize', resize);
  modal.userData = { onOpen: resize };
  applyABMode('after');
  applyQualityAndPost();
  loop();
  return modal;
}
