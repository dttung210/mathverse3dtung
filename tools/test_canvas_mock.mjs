import { ALL_MATH6_LABS } from '../src/math6-lab/catalog.js';
import { renderModel, W, H } from '../src/math6-lab/canvas.mjs';
import { motionParams } from '../src/math6-lab/catalog-motion.mjs';

function createMockCtx() {
  const noop = () => {};
  return {
    save: noop, restore: noop, beginPath: noop, closePath: noop,
    moveTo: noop, lineTo: noop, stroke: noop, fill: noop, arc: noop,
    fillRect: noop, strokeRect: noop, fillText: noop, setLineDash: noop,
    rect: noop, clip: noop,
    translate: noop, rotate: noop, scale: noop, quadraticCurveTo: noop,
    measureText: (str) => ({ width: str.length * 9 }),
    fillStyle: '', strokeStyle: '', lineWidth: 1, font: '', textAlign: '', textBaseline: ''
  };
}

const ctx = createMockCtx();
let passed = 0;
let errors = [];

for (const model of ALL_MATH6_LABS) {
  for (const t of [0, 2, 4, 8]) {
    try {
      const p = motionParams(model, model.defaults, t, 8);
      const state = { params: p, time: t * 1000, counts: [2, 3, 1, 4], tileFlips: new Set(), selectedDesk: 1 };
      renderModel(ctx, model, state);
      passed++;
    } catch (e) {
      errors.push(`${model.id} @ ${t}s: ${e.message}`);
    }
  }
}

console.log(`Passed checks: ${passed} / ${ALL_MATH6_LABS.length * 4}`);
if (errors.length) {
  console.error('Errors:', errors);
  process.exit(1);
} else {
  console.log('ALL 63 MODELS RENDERED WITHOUT ERROR!');
}
