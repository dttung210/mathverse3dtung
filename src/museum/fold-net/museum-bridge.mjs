/**
 * MATHVERSE R87 museum bridge — Integrated into r67-mode-exhibits.mjs, r6-spatial-manager.js & r11-holo-stage.js.
 * Strictly for IN-UNIVERSE museum pedestals & Holo-Stage Inspector (never auto-registered in Lab screens).
 */
import * as THREE from '../../../vendor/three.module.js?v=r107_v15';
import {
  createFoldNetExhibit,
  getFoldNetDefinition,
  getFoldNetPlacement,
  getFoldNetParamSchema,
  computeFoldNetFormulas
} from './index.mjs?v=r107_v15';

export function createMuseumFoldGroup(modelId, opts = {}) {
  const def = getFoldNetDefinition(modelId);
  if (!def) throw Error(`Unknown R87 fold-net model: ${modelId}`);
  let currentParams = { ...(def.defaultParams || {}), ...(opts.params || {}) };
  let exhibit = createFoldNetExhibit(modelId, currentParams);

  const root = new THREE.Group();
  root.name = `R87-MUSEUM-FOLD-${modelId}`;
  // If uprightForPedestal is set, rotate local XY plane to horizontal XZ plane so +Z folds upward along +Y.
  const orientHolder = new THREE.Group();
  if (opts.uprightForPedestal) {
    orientHolder.rotation.x = -Math.PI / 2;
    const sc = Number(opts.pedestalScale) || 0.24;
    orientHolder.scale.setScalar(sc);
    orientHolder.position.y = Number.isFinite(opts.pedestalOffsetY) ? opts.pedestalOffsetY : -0.18;
  }
  orientHolder.add(exhibit.group);
  root.add(orientHolder);

  const duration = Math.max(1, Number(opts.duration) || 7);
  let startTime = null;
  let paused = false;
  let speed = 1;
  let displayState = {
    displayMode: 'solid', // 'solid' | 'wireframe' | 'xray'
    showEdges: true,
    showHinges: true
  };

  function syncUserData() {
    const p = exhibit.timeline.progress;
    const stageInfo = computeFoldNetFormulas(modelId, currentParams, p);
    root.userData.mathNature = 'TRUE_3D';
    root.userData.foldNetModelId = modelId;
    root.userData.foldNetDefinition = def;
    root.userData.foldNetPlacement = getFoldNetPlacement(modelId);
    root.userData.foldNetParamSchema = getFoldNetParamSchema(modelId);
    root.userData.foldNetParams = { ...currentParams };
    root.userData.foldNetExhibit = exhibit;
    root.userData.foldNetFormulas = stageInfo;
    root.userData.motionMeaning = `${def.name}: ${stageInfo?.stageText || def.unfolding}`;
    root.userData.motionStage = {
      progress: p,
      stage: (stageInfo?.stageIndex || 1) - 1,
      phase: p >= 1 - 1e-6 ? 'completed' : p <= 1e-6 ? 'flat-net' : 'folding',
      description: stageInfo?.stageText || def.unfolding
    };
  }

  function applyDisplayOptions(patch = {}) {
    displayState = { ...displayState, ...patch };
    exhibit.setWireframe(displayState.displayMode === 'wireframe');
    exhibit.setXRayMode(displayState.displayMode === 'xray');
    exhibit.setEdgesVisible(displayState.showEdges);
    exhibit.setHingesVisible(displayState.showHinges);
    root.userData.foldNetDisplay = { ...displayState };
  }

  /** On exhibit enter, rebase the animation to this viewing session, not global world time. */
  root.userData.onViewEnter = () => {
    startTime = null;
    paused = false;
    exhibit.reset();
    syncUserData();
  };

  root.userData.onViewLeave = () => {
    paused = true;
    exhibit.pause();
  };

  root.userData.animate = (seconds) => {
    if (paused) return root.userData.motionStage;
    const t = Number.isFinite(Number(seconds)) ? Number(seconds) : 0;
    if (startTime === null || t < startTime) startTime = t;
    const elapsed = (t - startTime) * speed;
    const p = Math.min(1, Math.max(0, elapsed / duration));
    exhibit.setProgress(p);
    if (p >= 1 - 1e-6) paused = true; // Hold at 100% without endless looping
    syncUserData();
    return root.userData.motionStage;
  };

  root.userData.play = () => {
    const cur = exhibit.timeline.progress;
    const nextStartProgress = cur >= 1 - 1e-6 ? 0 : cur;
    exhibit.setProgress(nextStartProgress);
    startTime = null;
    paused = false;
    syncUserData();
  };

  root.userData.pause = () => {
    paused = true;
    exhibit.pause();
    syncUserData();
  };

  root.userData.playAgain = () => {
    startTime = null;
    paused = false;
    exhibit.reset();
    syncUserData();
  };

  root.userData.openFlat = () => {
    paused = true;
    exhibit.setProgress(0);
    syncUserData();
  };

  root.userData.closeSolid = () => {
    paused = true;
    exhibit.setProgress(1);
    syncUserData();
  };

  root.userData.setFoldProgress = (p) => {
    paused = true;
    exhibit.setProgress(Math.max(0, Math.min(1, Number(p) || 0)));
    syncUserData();
    return exhibit.timeline.progress;
  };

  root.userData.setUnfoldPercent = (pct) => {
    paused = true;
    exhibit.setProgress(1 - Math.max(0, Math.min(100, Number(pct) || 0)) / 100);
    syncUserData();
  };

  root.userData.stepForward = () => {
    paused = true;
    exhibit.stepForward();
    syncUserData();
    return exhibit.timeline.progress;
  };

  root.userData.stepBackward = () => {
    paused = true;
    exhibit.stepBackward();
    syncUserData();
    return exhibit.timeline.progress;
  };

  root.userData.setSpeed = (s) => {
    speed = Math.max(0.25, Math.min(3, Number(s) || 1));
    exhibit.setSpeed(speed);
    root.userData.foldNetSpeed = speed;
  };

  root.userData.setDisplayOptions = (patch) => {
    applyDisplayOptions(patch);
  };

  root.userData.setParams = (paramPatch = {}) => {
    const prevProgress = exhibit.timeline.progress;
    const nextParams = { ...currentParams, ...paramPatch };
    // Enforce frustum constraints (a > b + 0.2, R1 > R2 + 0.1)
    if (modelId === 'mv-fold-square-frustum' && nextParams.a <= nextParams.b + 0.15) {
      nextParams.b = Math.max(0.4, Number((nextParams.a - 0.2).toFixed(2)));
    }
    if (modelId === 'mv-fold-conical-frustum' && nextParams.R1 <= nextParams.R2 + 0.15) {
      nextParams.R2 = Math.max(0.3, Number((nextParams.R1 - 0.2).toFixed(2)));
    }
    currentParams = nextParams;
    orientHolder.remove(exhibit.group);
    exhibit.dispose();
    exhibit = createFoldNetExhibit(modelId, currentParams);
    exhibit.setProgress(prevProgress);
    orientHolder.add(exhibit.group);
    applyDisplayOptions(displayState);
    syncUserData();
    return root.userData.foldNetFormulas;
  };

  root.userData.getFormulas = () => computeFoldNetFormulas(modelId, currentParams, exhibit.timeline.progress);

  root.userData.disposeFoldNet = () => {
    exhibit.dispose();
  };

  applyDisplayOptions(displayState);
  syncUserData();
  return root;
}

