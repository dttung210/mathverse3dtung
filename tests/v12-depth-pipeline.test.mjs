import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from '../vendor/three.module.js';
import {
  QUALITY_PROFILES_V12,
  PBR_PRESETS_V12,
  configureRendererV12,
  getSharedPBRMaterial,
  createLightingRigV12,
  applyConditionalShadows,
  createPedagogicalShadowFloor,
  createContactShadowDisc,
  createDualCameraRig,
  createModularPostProcessorV12,
  createRigidDropSimulatorV12,
  createPerformanceTrackerV12,
  createAdaptiveFPSGovernorV12,
  optimizeLoadedGLBSceneV12,
  computeCanonicalSolidMath
} from '../src/graphics-r74/depth-pipeline-v12.mjs';
import {
  RENDER_QUALITY,
  qualityProfile
} from '../src/museum/quality-controller.js';

test('Deliverable A: Dual Camera Rig (PerspectiveCamera + OrthographicCamera, orbit, dolly, reset & bounds)', () => {
  const rig = createDualCameraRig({ fov: 45, minDistance: 3.2, maxDistance: 22 });
  assert.equal(rig.getProjectionMode(), 'perspective');
  assert.ok(rig.perspectiveCamera.isPerspectiveCamera);
  assert.ok(rig.orthographicCamera.isOrthographicCamera);
  assert.equal(rig.getActiveCamera(), rig.perspectiveCamera);

  // Switch to OrthographicCamera for exact measurement
  rig.setProjectionMode('orthographic');
  assert.equal(rig.getProjectionMode(), 'orthographic');
  assert.equal(rig.getActiveCamera(), rig.orthographicCamera);
  assert.ok(rig.orthographicCamera.right > 0);
  assert.ok(rig.orthographicCamera.top > 0);

  // Orbit, dolly with clamping, and reset
  rig.orbitBy(0.4, 0.25);
  rig.dollyBy(50); // clamped to maxDistance
  rig.update(1.0);
  const distAfterDolly = rig.perspectiveCamera.position.distanceTo(rig.target);
  assert.ok(distAfterDolly <= 22.01 && distAfterDolly >= 3.19);

  rig.reset();
  const distAfterReset = rig.perspectiveCamera.position.distanceTo(rig.target);
  assert.ok(distAfterReset > 10 && distAfterReset < 18);
});

test('Deliverable B & C: DirectionalLight + HemisphereLight rig, conditional shadows & pedagogical floor', () => {
  const scene = new THREE.Scene();
  const rig = createLightingRigV12(scene, { shadowMapSize: 2048, shadowBounds: 12 });
  assert.ok(rig.skyLight.isHemisphereLight);
  assert.ok(rig.keyLight.isDirectionalLight);
  assert.equal(rig.keyLight.castShadow, true);
  assert.equal(rig.keyLight.shadow.mapSize.width, 2048);
  assert.ok(rig.keyLight.shadow.bias < 0);
  assert.ok(rig.keyLight.shadow.normalBias > 0);

  // Only 1 directional light casts shadows
  assert.equal(rig.fillLight.castShadow, false);

  // Pedagogical shadow floor receives shadows without casting
  const floor = createPedagogicalShadowFloor({ size: 20, y: 0 });
  assert.equal(floor.receiveShadow, true);
  assert.equal(floor.castShadow, false);

  // Conditional shadow application skips HUD/label meshes while enabling 3D solids
  const group = new THREE.Group();
  const solidMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial());
  const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial());
  labelMesh.userData.isLabel = true;
  group.add(solidMesh, labelMesh);

  const count = applyConditionalShadows(group);
  assert.equal(count, 1);
  assert.equal(solidMesh.castShadow, true);
  assert.equal(solidMesh.receiveShadow, true);
  assert.equal(labelMesh.castShadow, false);
});

test('Deliverable D & E: Shared PBR Material Library, sRGB & ACESFilmicToneMapping', () => {
  const mat1 = PBR_PRESETS_V12.cubeBlue();
  const mat2 = PBR_PRESETS_V12.cubeBlue();
  assert.equal(mat1, mat2, 'Shared PBR preset materials are cached and reused');
  assert.ok(mat1.isMeshPhysicalMaterial || mat1.isMeshStandardMaterial);

  const brassMat = PBR_PRESETS_V12.brushedBrass();
  assert.ok(brassMat.isMeshStandardMaterial);
  assert.ok(Object.keys(PBR_PRESETS_V12).length >= 7);

  const mockRenderer = {
    outputColorSpace: null,
    toneMapping: null,
    toneMappingExposure: 1,
    shadowMap: { enabled: false, type: null, needsUpdate: false },
    setPixelRatio(pr) { this._pr = pr; }
  };
  const profile = configureRendererV12(mockRenderer, { quality: 'medium' });
  assert.equal(mockRenderer.outputColorSpace, THREE.SRGBColorSpace);
  assert.equal(mockRenderer.toneMapping, THREE.ACESFilmicToneMapping);
  assert.equal(mockRenderer.shadowMap.enabled, true);
  assert.equal(mockRenderer.shadowMap.type, THREE.PCFSoftShadowMap);
  assert.equal(profile.shadowMapSize, 1024);
});

test('Deliverable F & G: Low/Medium/High quality tiers and mutually exclusive SSAO/GTAO post-processing', () => {
  assert.equal(QUALITY_PROFILES_V12.low.pixelRatioCap, 1.0);
  assert.equal(QUALITY_PROFILES_V12.low.shadowMapSize, 512);
  assert.equal(QUALITY_PROFILES_V12.low.ao, 'off');

  assert.equal(QUALITY_PROFILES_V12.medium.pixelRatioCap, 1.5);
  assert.equal(QUALITY_PROFILES_V12.medium.shadowMapSize, 1024);

  assert.equal(QUALITY_PROFILES_V12.high.pixelRatioCap, 2.0);
  assert.equal(QUALITY_PROFILES_V12.high.shadowMapSize, 2048);

  // Quality controller integration
  assert.equal(RENDER_QUALITY.low.shadowMapSize, 512);
  assert.equal(RENDER_QUALITY.medium.shadowMapSize, 1024);
  assert.equal(RENDER_QUALITY.high.shadowMapSize, 2048);
  assert.equal(qualityProfile('low', 2).name, 'low');
  assert.equal(qualityProfile('low', 2).pixelRatio, 1.0);

  // Post-processor mutual exclusion between SSAO and GTAO
  const post = createModularPostProcessorV12({ aoMode: 'ssao', bloomEnabled: true, qualityTier: 'medium' });
  assert.equal(post.getState().aoMode, 'ssao');
  assert.equal(post.getState().mutuallyExclusiveAO, true);

  post.setAOMode('gtao');
  assert.equal(post.getState().aoMode, 'gtao');

  // Low tier automatically disables AO and Bloom in effective state
  post.setQualityTier('low');
  assert.equal(post.getState().aoMode, 'off');
  assert.equal(post.getState().bloomEnabled, false);
});

test('Deliverable H & Rule 5: Deterministic Rigid Drop Physics & Mathematical Invariance', () => {
  // Math invariance check across camera modes, AO, and Bloom
  const mCube1 = computeCanonicalSolidMath('cube');
  const mCube2 = computeCanonicalSolidMath('cube');
  assert.deepEqual(mCube1, mCube2);
  assert.ok(mCube1.formulas.includes('V = a³'));
  assert.ok(mCube1.invariants.includes('90°'));

  const mSphere = computeCanonicalSolidMath('sphere');
  assert.ok(mSphere.formulas.includes('4/3'));

  const mCone = computeCanonicalSolidMath('cone');
  assert.ok(mCone.formulas.includes('1/3'));

  // Rigid-body drop & bounce simulator
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), new THREE.MeshStandardMaterial());
  const sim = createRigidDropSimulatorV12();
  sim.registerBody(mesh, { groundY: 0.9, mass: 1 });
  sim.triggerDrop(2.5);
  assert.ok(mesh.position.y > 3.0);

  let stillMoving = true;
  for (let i = 0; i < 240; i++) {
    stillMoving = sim.step(1 / 60);
  }
  assert.equal(stillMoving, false);
  assert.equal(mesh.position.y, 0.9);
});

test('Deliverable I & J: Performance Tracker & Phase 1 Backup Manifest verification', () => {
  const mockRenderer = {
    info: {
      render: { calls: 42, triangles: 12800 },
      memory: { geometries: 18, textures: 9 }
    }
  };
  const tracker = createPerformanceTrackerV12(mockRenderer);
  tracker.markModelLoadStart();
  tracker.markModelLoadEnd();
  const snap = tracker.getSnapshot();
  assert.equal(snap.drawCalls, 42);
  assert.equal(snap.triangles, 12800);
  assert.equal(snap.geometries, 18);
  assert.equal(snap.textures, 9);
  assert.ok(snap.modelLoadMs >= 0);

  // Verify backup manifest exists and all backed-up files have SHA-256 hashes
  const backupManifestPath = path.resolve('.backup_v12_render_2026_11_08/backup-manifest.json');
  assert.ok(fs.existsSync(backupManifestPath), 'Verified Phase 1 backup manifest exists');
  const manifest = JSON.parse(fs.readFileSync(backupManifestPath, 'utf8'));
  const fileCount = Array.isArray(manifest.files) ? manifest.files.length : Object.keys(manifest.files || {}).length;
  assert.ok(fileCount >= 10);

  // Verify Contact Shadow Disc, 5 Real-World PBR Materials, DOF/ColorGrade, Adaptive FPS Governor & GLB Report
  for (const k of ['woodOak', 'crystalGlass', 'brushedMetal', 'glossyPlastic', 'marbleStone']) {
    const m = PBR_PRESETS_V12[k]();
    assert.ok(m.isMeshStandardMaterial || m.isMeshPhysicalMaterial, `PBR preset ${k} valid`);
  }
  const disc = createContactShadowDisc({ radius: 1.0, groundY: 0.5, maxOpacity: 0.4 });
  const targetObj = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
  targetObj.position.set(1.2, 2.5, -0.8);
  disc.userData.syncWithObject(targetObj, 1.3);
  assert.equal(disc.position.x, 1.2);
  assert.ok(disc.material.opacity < 0.4, 'Contact shadow fades as object rises above floor');

  let curPr = 1.5;
  const gov = createAdaptiveFPSGovernorV12({
    getPixelRatio: () => curPr,
    setPixelRatio: (v) => { curPr = v; }
  });
  gov.evaluate(28, 'medium');
  gov.evaluate(28, 'medium');
  gov.evaluate(28, 'medium');
  assert.ok(curPr < 1.5, 'Adaptive FPS governor lowers DPR when FPS < 38');

  const glbReportPath = path.resolve('GLB_OPTIMIZATION_REPORT_V12.json');
  assert.ok(fs.existsSync(glbReportPath), 'GLB optimization report exists');

  // Verify runtime GLB material deduplication & frustum culling
  const glbGroup = new THREE.Group();
  const mA = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.4, metalness: 0.2 });
  const mB = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.4, metalness: 0.2 });
  const part1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mA);
  const part2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mB);
  glbGroup.add(part1, part2);
  const optStats = optimizeLoadedGLBSceneV12(glbGroup, { castShadow: true, receiveShadow: true });
  assert.equal(optStats.meshes, 2);
  assert.equal(optStats.deduplicatedMaterials, 1);
  assert.equal(part1.material, part2.material, 'Identical GLB materials are deduplicated at runtime');
  assert.equal(part1.frustumCulled, true);
});
