import {ALL_MATH6_LABS} from '../src/math6-lab/catalog.js';
import {motionParams} from '../src/math6-lab/catalog-motion.mjs';
import {renderModel} from '../src/math6-lab/canvas.mjs';

// Create a mock 2D context that records pixel-like draw operations
function createMockContext() {
  const commands = [];
  const noop = () => {};
  const handler = {
    get(target, prop) {
      if (['canvas', 'width', 'height'].includes(prop)) return 920;
      if (typeof prop === 'string' && ['font', 'fillStyle', 'strokeStyle', 'lineWidth', 'textAlign', 'textBaseline'].includes(prop)) {
        return target[prop];
      }
      return (...args) => {
        commands.push(`${prop}:${args.map(a => typeof a === 'number' ? Math.round(a*10)/10 : (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(',')}`);
      };
    },
    set(target, prop, value) {
      target[prop] = value;
      commands.push(`set:${prop}=${value}`);
      return true;
    }
  };
  const ctx = new Proxy({}, handler);
  return {ctx, commands};
}

const failed = [];
for (const m of ALL_MATH6_LABS) {
  const c0 = createMockContext();
  const s0 = {params: motionParams(m, m.defaults, 0, 8), time: 0, counts: [], tileFlips: new Set(), selectedDesk: 0};
  renderModel(c0.ctx, m, s0);
  const log0 = c0.commands.join('\n');

  let maxDiff = 0;
  for (const t of [2.25, 4.0]) {
    const cT = createMockContext();
    const sT = {params: motionParams(m, m.defaults, t, 8), time: Math.round(t * 1000), counts: [], tileFlips: new Set(), selectedDesk: 0};
    renderModel(cT.ctx, m, sT);
    const logT = cT.commands.join('\n');
    if (log0 !== logT) maxDiff++;
  }
  if (maxDiff === 0) {
    failed.push({id: m.id, engine: m.engine, variant: m.variant, title: m.title});
  }
}

console.log('Failed count:', failed.length);
console.log('Failed models:', failed);

