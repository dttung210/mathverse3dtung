/**
 * Universal SVG Stage Interactivity Enhancer for MATHVERSE (Grades 6–12)
 * - Makes all text/coordinate labels and pill badges draggable to prevent overlapping figures
 * - Enhances all coordinate points (<circle>) with grab cursors and interactive dragging
 * - Provides workspace frame pan/zoom (wheel zoom + double-click reset)
 */

function unpackArgs(args) {
  let state = null;
  let hostEl = null;
  let event = null;
  let fn = null;
  for (const a of args) {
    if (!a) continue;
    if (typeof a === 'function') {
      fn = a;
    } else if (typeof a === 'object') {
      if (a.labelOffsets instanceof Map) {
        state = a;
      } else if (typeof a.addEventListener === 'function' || typeof a.querySelector === 'function') {
        hostEl = a;
      } else if ('clientX' in a || 'deltaY' in a || 'pointerId' in a || typeof a.preventDefault === 'function') {
        event = a;
      }
    }
  }
  return { state, hostEl, event, fn };
}

export function createStageInteractivity() {
  return {
    labelOffsets: new Map(),
    pointOffsets: new Map(),
    viewZoom: 1,
    viewPan: [0, 0],
    baseViewBox: null,
    activeDrag: null
  };
}

export function svgScreenToUser(svg, clientX, clientY) {
  if (!svg) return null;
  const rc = svg.getBoundingClientRect?.();
  if (!rc?.width || !rc?.height) return null;
  try {
    const ctm = svg.getScreenCTM?.();
    if (ctm && typeof DOMPoint === 'function') {
      const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
      if (Number.isFinite(pt.x) && Number.isFinite(pt.y)) return [pt.x, pt.y];
    }
  } catch {}
  const vb = (svg.getAttribute?.('viewBox') || '0 0 960 520').trim().split(/[\s,]+/).map(Number);
  const [vx = 0, vy = 0, vw = 960, vh = 520] = vb;
  return [
    vx + vw * ((clientX - rc.left) / rc.width),
    vy + vh * ((clientY - rc.top) / rc.height)
  ];
}

export function decorateInteractiveSVG(...args) {
  const { hostEl, state } = unpackArgs(args);
  if (!hostEl || !state) return;
  const svg = hostEl.tagName?.toLowerCase() === 'svg' ? hostEl : hostEl.querySelector?.('svg');
  if (!svg) return;

  if (!svg.getAttribute('preserveAspectRatio') || svg.getAttribute('preserveAspectRatio') === 'none') {
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  }
  if (!state.baseViewBox) {
    const rawVb = (svg.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
    if (rawVb.length === 4 && rawVb.every(Number.isFinite)) {
      state.baseViewBox = rawVb;
    }
  }
  applyViewBoxTransform(svg, state);

  // 1. Decorate all <text> and pill <g> badges so every label/coordinate can be dragged away from the figure
  const texts = [...svg.querySelectorAll('text')];
  texts.forEach((tEl, idx) => {
    if (tEl.closest('[opacity="0"]') || tEl.closest('[data-submodel]')) return;
    const parent = tEl.parentElement;
    const isPillGroup =
      parent?.tagName?.toLowerCase() === 'g' &&
      parent.children.length === 2 &&
      parent.firstElementChild?.tagName?.toLowerCase() === 'rect';
    const target = isPillGroup ? parent : tEl;
    const key = String(idx);
    target.setAttribute('data-label-idx', key);
    target.setAttribute('data-stage-label', key);
    target.style.cursor = 'grab';
    target.style.pointerEvents = 'all';
    const off = state.labelOffsets.get(key);
    if (off && (off[0] !== 0 || off[1] !== 0)) {
      const prevTf = target.getAttribute('transform') || '';
      const cleanTf = prevTf.replace(/\s*translate\([^)]*\)/g, '').trim();
      target.setAttribute('transform', `${cleanTf} translate(${off[0].toFixed(1)}, ${off[1].toFixed(1)})`.trim());
    }
  });

  // 2. Decorate all <circle> points (both parametric handles and auxiliary coordinate points)
  const circles = [...svg.querySelectorAll('circle')];
  circles.forEach((cEl, idx) => {
    if (cEl.closest('[opacity="0"]')) return;
    const r = Number(cEl.getAttribute('r') || 0);
    // Only decorate point markers (radius between 2.5 and 18), not large geometric circles
    if (r < 2.5 || r > 18) return;
    cEl.style.cursor = 'grab';
    cEl.style.pointerEvents = 'all';
    const hasParamHandle =
      cEl.hasAttribute('data-handle') ||
      cEl.hasAttribute('data-pt') ||
      cEl.hasAttribute('data-point') ||
      cEl.hasAttribute('data-vertex') ||
      cEl.hasAttribute('data-drag');
    if (!hasParamHandle) {
      const pKey = `pt_${idx}`;
      cEl.setAttribute('data-free-pt', pKey);
      cEl.setAttribute('data-stage-pt', pKey);
      const off = state.pointOffsets.get(pKey);
      if (off && (off[0] !== 0 || off[1] !== 0)) {
        cEl.setAttribute('transform', `translate(${off[0].toFixed(1)}, ${off[1].toFixed(1)})`);
      }
    }
  });
}

export function applyViewBoxTransform(svg, state) {
  if (!svg || !state?.baseViewBox) return;
  const [bx, by, bw, bh] = state.baseViewBox;
  const zoom = Math.max(0.55, Math.min(2.4, state.viewZoom || 1));
  const [px, py] = state.viewPan || [0, 0];
  const nw = bw / zoom;
  const nh = bh / zoom;
  const nx = bx + (bw - nw) / 2 + px;
  const ny = by + (bh - nh) / 2 + py;
  svg.setAttribute('viewBox', `${nx.toFixed(1)} ${ny.toFixed(1)} ${nw.toFixed(1)} ${nh.toFixed(1)}`);
}

export function tryStartLabelOrPointDrag(...args) {
  const { hostEl, state, event: e } = unpackArgs(args);
  if (!hostEl || !state || !e) return false;
  const svg = hostEl.tagName?.toLowerCase() === 'svg' ? hostEl : hostEl.querySelector?.('svg');
  if (!svg) return false;

  // Do not hijack explicit parametric handles ([data-handle], [data-pt], [data-point], [data-vertex], [data-drag])
  const paramHandle = e.target?.closest?.('[data-handle],[data-pt],[data-point],[data-vertex],[data-drag]');
  if (paramHandle) return false;

  // Check if user clicked on a draggable text/coordinate label
  const lblEl = e.target?.closest?.('[data-label-idx]');
  if (lblEl) {
    const idx = lblEl.getAttribute('data-label-idx');
    const pt = svgScreenToUser(svg, e.clientX, e.clientY) || [0, 0];
    const cur = state.labelOffsets.get(idx) || [0, 0];
    state.activeDrag = { type: 'label', idx, sx: pt[0], sy: pt[1], ox: cur[0], oy: cur[1], svg };
    try { hostEl.setPointerCapture?.(e.pointerId); } catch {}
    e.preventDefault?.();
    return true;
  }

  // Check if user clicked on a non-parametric coordinate dot
  const freePtEl = e.target?.closest?.('[data-free-pt]');
  if (freePtEl) {
    const pKey = freePtEl.getAttribute('data-free-pt');
    const pt = svgScreenToUser(svg, e.clientX, e.clientY) || [0, 0];
    const cur = state.pointOffsets.get(pKey) || [0, 0];
    state.activeDrag = { type: 'point', key: pKey, sx: pt[0], sy: pt[1], ox: cur[0], oy: cur[1], svg };
    try { hostEl.setPointerCapture?.(e.pointerId); } catch {}
    e.preventDefault?.();
    return true;
  }

  // Check if user held Shift or middle-button to pan the workspace frame
  if (e.shiftKey || e.button === 1) {
    state.activeDrag = {
      type: 'pan',
      sx: e.clientX,
      sy: e.clientY,
      ox: state.viewPan[0],
      oy: state.viewPan[1],
      svg
    };
    try { hostEl.setPointerCapture?.(e.pointerId); } catch {}
    e.preventDefault?.();
    return true;
  }

  return false;
}

export function handleLabelOrPointMove(...args) {
  const { state, event: e } = unpackArgs(args);
  if (!state?.activeDrag || !e) return false;
  const d = state.activeDrag;
  const svg = d.svg;
  if (!svg) return false;

  if (d.type === 'label') {
    const pt = svgScreenToUser(svg, e.clientX, e.clientY);
    if (!pt) return true;
    const nx = d.ox + (pt[0] - d.sx);
    const ny = d.oy + (pt[1] - d.sy);
    state.labelOffsets.set(d.idx, [nx, ny]);
    const el = svg.querySelector(`[data-label-idx="${d.idx}"]`);
    if (el) {
      const prevTf = el.getAttribute('transform') || '';
      const cleanTf = prevTf.replace(/\s*translate\([^)]*\)/g, '').trim();
      el.setAttribute('transform', `${cleanTf} translate(${nx.toFixed(1)}, ${ny.toFixed(1)})`.trim());
    }
    e.preventDefault?.();
    return true;
  }

  if (d.type === 'point') {
    const pt = svgScreenToUser(svg, e.clientX, e.clientY);
    if (!pt) return true;
    const nx = d.ox + (pt[0] - d.sx);
    const ny = d.oy + (pt[1] - d.sy);
    state.pointOffsets.set(d.key, [nx, ny]);
    const el = svg.querySelector(`[data-free-pt="${d.key}"]`);
    if (el) el.setAttribute('transform', `translate(${nx.toFixed(1)}, ${ny.toFixed(1)})`);
    e.preventDefault?.();
    return true;
  }

  if (d.type === 'pan' && state.baseViewBox) {
    const rc = svg.getBoundingClientRect?.();
    if (rc?.width && rc?.height) {
      const [, , bw, bh] = state.baseViewBox;
      const zoom = state.viewZoom || 1;
      const dx = ((e.clientX - d.sx) / rc.width) * (bw / zoom);
      const dy = ((e.clientY - d.sy) / rc.height) * (bh / zoom);
      state.viewPan = [d.ox - dx, d.oy - dy];
      applyViewBoxTransform(svg, state);
    }
    e.preventDefault?.();
    return true;
  }

  return false;
}

export function stopLabelOrPointDrag(...args) {
  const { state } = unpackArgs(args);
  if (!state?.activeDrag) return false;
  state.activeDrag = null;
  return true;
}

export function bindFrameWheelZoom(...args) {
  const { hostEl, state, fn } = unpackArgs(args);
  if (!hostEl || !state || typeof hostEl.addEventListener !== 'function') return;

  const onWheel = (e) => {
    const svg = hostEl.tagName?.toLowerCase() === 'svg' ? hostEl : hostEl.querySelector?.('svg');
    if (!svg) return;
    if (!e.ctrlKey && !e.altKey && !e.shiftKey) return;
    e.preventDefault?.();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    state.viewZoom = Math.max(0.55, Math.min(2.4, (state.viewZoom || 1) * factor));
    applyViewBoxTransform(svg, state);
  };

  const onDblClick = () => {
    resetStageInteractivity(state, hostEl);
  };

  if (typeof fn === 'function' && fn.length >= 3) {
    try {
      fn(hostEl, 'wheel', onWheel);
      fn(hostEl, 'dblclick', onDblClick);
      return;
    } catch {}
  }
  hostEl.addEventListener('wheel', onWheel, { passive: false });
  hostEl.addEventListener('dblclick', onDblClick);
}

export function resetStageInteractivity(...args) {
  const { state, hostEl } = unpackArgs(args);
  if (!state) return;
  state.labelOffsets.clear();
  state.pointOffsets.clear();
  state.viewZoom = 1;
  state.viewPan = [0, 0];
  state.activeDrag = null;
  const svg = hostEl?.tagName?.toLowerCase() === 'svg' ? hostEl : hostEl?.querySelector?.('svg');
  if (svg && state.baseViewBox) applyViewBoxTransform(svg, state);
}
