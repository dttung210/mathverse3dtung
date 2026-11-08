import { labById } from '../src/math6-lab/catalog.js';
import { renderModel } from '../src/math6-lab/canvas.mjs';

function spyCanvas() {
  const texts = [];
  return {
    texts,
    ctx: {
      save: ()=>{}, restore: ()=>{}, beginPath: ()=>{}, closePath: ()=>{},
      moveTo: ()=>{}, lineTo: ()=>{}, stroke: ()=>{}, fill: ()=>{}, arc: ()=>{},
      fillRect: ()=>{}, strokeRect: ()=>{},
      fillText: (t)=>{ texts.push(String(t)); },
      setLineDash: ()=>{}, rect: ()=>{}, clip: ()=>{},
      translate: ()=>{}, rotate: ()=>{}, scale: ()=>{}, quadraticCurveTo: ()=>{},
      measureText: (str) => ({ width: str.length * 9 }),
      fillStyle: '', strokeStyle: '', lineWidth: 1, font: '', textAlign: '', textBaseline: ''
    }
  };
}

const m = labById('toan6-buoc-nhay-so-nguyen');
const a = spyCanvas();
renderModel(a.ctx, m, { params: { ...m.defaults, value: 9, step: 6 }, time: 0 });
console.log('texts:', a.texts);
console.log('includes B:', a.texts.includes('B'));
