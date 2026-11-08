/**
 * MATHVERSE V5 - FunctionGraphViewer
 * Trình vẽ đồ thị hàm số chuẩn hệ trục Oxy (hàm bậc nhất, bậc hai, bậc ba, phân thức, lượng giác, hàm mũ).
 * Đánh giá biểu thức toán học an toàn (không dùng eval), tự động phân tích đỉnh, nghiệm, tiệm cận và dò điểm.
 */

import { SafeExpression } from '../math/safe-expression.js?v=r107_v15';
import { normalizeExhibit } from '../math-core.js?v=r107_v15';

export class FunctionGraphViewer {
  constructor(model, options = {}) {
    this.model = model;
    this.options = options;
    this.container = null;
    this.canvas = null;
    this.ctx = null;

    // Các hệ số mặc định
    this.initialParams = this._getDefaultParams(model);
    this.params = { ...this.initialParams };

    // Oxy Grid settings
    this.scale = 36; // pixels per math unit
    this.origin = { x: 0, y: 0 };
    this.hoverX = null;
    this.isPanning = false;
    this.lastMouse = { x: 0, y: 0 };

    this.showGrid = true;
    this.showVertex = true;
    this.showRoots = true;
    this.showAsymptotes = true;

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onResize = this._onResize.bind(this);
  }

  _getDefaultParams(model) {
    const type = model.type || model.builderType || 'parabolaGeneral';
    if(type==='sine')return {amp:model.params?.amp??1,freq:model.params?.freq??1};
    if(type==='exponential')return {a:model.params?.a??1.5};
    if(type==='derivative')return {a:model.params?.a??0.5,b:model.params?.b??3};
    if (type === 'parabola' || type === 'parabolaGeneral') {
      return {
        a: model.params?.a ?? 1,
        b: model.params?.b ?? -2,
        c: model.params?.c ?? -3
      };
    }
    if (type === 'linearSlope' || type === 'lineGraph') {
      return {
        a: 0,
        b: model.params?.a ?? 1.5,
        c: model.params?.b ?? 1
      };
    }
    if (type === 'cubicCurve') {
      return {
        a: model.params?.a ?? 0.5,
        b: model.params?.b ?? 0,
        c: model.params?.c ?? -3,
        d: model.params?.d ?? 1
      };
    }
    if (type === 'rationalFunc') {
      return {
        a: model.params?.a ?? 2,
        b: model.params?.b ?? 1,
        c: model.params?.c ?? 1,
        d: model.params?.d ?? -1
      };
    }
    return {
      a: model.params?.a ?? 1,
      b: model.params?.b ?? -2,
      c: model.params?.c ?? -3
    };
  }

  mount(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.container.style.position = 'relative';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.overflow = 'hidden';

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.touchAction = 'none';
    this.container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');

    this.canvas.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    this.canvas.addEventListener('wheel', this._onWheel, { passive: false });
    window.addEventListener('resize', this._onResize);

    this._onResize();
  }

  _onResize() {
    if (!this.container || !this.canvas) return;
    const rect = this.container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(260, rect.width);
    this.height = Math.max(240, rect.height);
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.origin.x = this.width / 2;
    this.origin.y = this.height / 2;
    this.render();
  }

  toScreen(x, y) {
    return [
      this.origin.x + x * this.scale,
      this.origin.y - y * this.scale
    ];
  }

  toMath(screenX, screenY) {
    return [
      (screenX - this.origin.x) / this.scale,
      (this.origin.y - screenY) / this.scale
    ];
  }

  _onPointerDown(e) {
    this.isPanning = true;
    this.lastMouse = { x: e.clientX, y: e.clientY };
    this.canvas.style.cursor = 'grabbing';
  }

  _onPointerMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (this.isPanning) {
      const dx = e.clientX - this.lastMouse.x;
      const dy = e.clientY - this.lastMouse.y;
      this.lastMouse = { x: e.clientX, y: e.clientY };
      this.origin.x += dx;
      this.origin.y += dy;
      this.render();
    } else {
      this.hoverX = this.toMath(mx, my)[0];
      this.render();
    }
  }

  _onPointerUp() {
    this.isPanning = false;
    if (this.canvas) this.canvas.style.cursor = 'crosshair';
  }

  _onWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    this.scale = Math.max(12, Math.min(150, this.scale * factor));
    this.render();
  }

  evaluate(x) {
    const type = this.model.type || this.model.builderType || 'parabolaGeneral';
    const { a, b, c, d } = this.params;
    if (type === 'inequalityRegion') return null;
    if(type==='sine')return this.params.amp*Math.sin(this.params.freq*x);
    if(type==='exponential')return Math.pow(this.params.a,x);
    if(type==='derivative')return this.params.a*x*x*x-this.params.b*x;
    if (type === 'rationalFunc') {
      return SafeExpression.evaluateRational(x, a, b, c, d);
    }
    if (type === 'cubicCurve') {
      return SafeExpression.evaluateCubic(x, a, b, c, d);
    }
    return SafeExpression.evaluateQuadratic(x, a, b, c);
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Hệ trục Oxy và lưới
    this._drawAxesAndGrid(ctx);

    // 2. Miền nghiệm là nửa mặt phẳng, KHÔNG phải đồ thị parabol.
    if (this.model.type === 'inequalityRegion') { this._drawInequalityRegion(ctx); return; }
    this._drawCurve(ctx);
    if(this.model.type==='derivative')this._drawDerivativeCurve(ctx);

    // 3. Đỉnh và nghiệm (nếu có)
    this._drawFeatures(ctx);

    // 4. Điểm dò trace point x -> (x, f(x))
    if (this.hoverX !== null) {
      this._drawTrace(ctx);
    }
  }


  _drawInequalityRegion(ctx) {
    const {a,b,c}=this.params;
    const w=this.width,h=this.height;
    const f=([sx,sy])=>{const [x,y]=this.toMath(sx,sy);return a*x+b*y-c;};
    // Clip canvas to ax + by <= c using Sutherland-Hodgman.
    let poly=[[0,0],[w,0],[w,h],[0,h]];
    const result=[];
    for(let i=0;i<poly.length;i++){
      const A=poly[i],B=poly[(i+1)%poly.length],fa=f(A),fb=f(B);
      if(fa<=0)result.push(A);
      if((fa<0&&fb>0)||(fa>0&&fb<0)){
        const t=fa/(fa-fb);result.push([A[0]+t*(B[0]-A[0]),A[1]+t*(B[1]-A[1])]);
      }
    }
    poly=result;
    ctx.save();
    if(poly.length>2){ctx.beginPath();poly.forEach((pt,i)=>{if(i)ctx.lineTo(...pt);else ctx.moveTo(...pt);});ctx.closePath();ctx.fillStyle='rgba(37,168,131,0.19)';ctx.fill();}
    const rect=[[0,0],[w,0],[w,h],[0,h]],inter=[];
    for(let i=0;i<4;i++){
      const A=rect[i],B=rect[(i+1)%4],fa=f(A),fb=f(B);
      if(Math.abs(fa)<1e-8)inter.push(A);
      if(fa*fb<0){const t=fa/(fa-fb);inter.push([A[0]+t*(B[0]-A[0]),A[1]+t*(B[1]-A[1])]);}
    }
    if(inter.length>=2){ctx.beginPath();ctx.moveTo(...inter[0]);ctx.lineTo(...inter[1]);ctx.strokeStyle='#137c72';ctx.lineWidth=3;ctx.stroke();}
    ctx.font='bold 14px system-ui';ctx.fillStyle='#165c64';ctx.fillText(`${a}x + ${b}y ≤ ${c}`,15,24);
    ctx.restore();
  }

  _drawAxesAndGrid(ctx) {
    const sp = this.scale;
    ctx.save();

    // Lưới mờ
    if (this.showGrid) {
      ctx.strokeStyle = '#e9f0f6';
      ctx.lineWidth = 1;
      const startX = this.origin.x % sp;
      for (let x = startX; x < this.width; x += sp) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.height);
        ctx.stroke();
      }
      const startY = this.origin.y % sp;
      for (let y = startY; y < this.height; y += sp) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.width, y);
        ctx.stroke();
      }
    }

    // Trục chính Ox và Oy
    ctx.strokeStyle = '#688098';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, this.origin.y);
    ctx.lineTo(this.width, this.origin.y);
    ctx.moveTo(this.origin.x, 0);
    ctx.lineTo(this.origin.x, this.height);
    ctx.stroke();

    // Mũi tên trục
    ctx.fillStyle = '#688098';
    ctx.beginPath();
    ctx.moveTo(this.width - 2, this.origin.y);
    ctx.lineTo(this.width - 12, this.origin.y - 4);
    ctx.lineTo(this.width - 12, this.origin.y + 4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(this.origin.x, 2);
    ctx.lineTo(this.origin.x - 4, 12);
    ctx.lineTo(this.origin.x + 4, 12);
    ctx.closePath();
    ctx.fill();

    // Nhãn trục và số đánh dấu
    ctx.font = 'bold 12px system-ui';
    ctx.fillText('x', this.width - 16, this.origin.y - 8);
    ctx.fillText('y', this.origin.x + 8, 16);
    ctx.fillText('O', this.origin.x + 6, this.origin.y + 15);

    // Đánh số trên trục (bước nhảy phù hợp với tỉ lệ zoom)
    const stepUnits = this.scale < 25 ? 5 : (this.scale < 50 ? 2 : 1);
    ctx.font = '10px system-ui';
    ctx.fillStyle = '#899fb5';

    // Đánh số Ox
    for (let u = stepUnits; u < 40; u += stepUnits) {
      const [sx] = this.toScreen(u, 0);
      if (sx > 0 && sx < this.width) {
        ctx.fillText(String(u), sx - 4, this.origin.y + 14);
      }
      const [snx] = this.toScreen(-u, 0);
      if (snx > 0 && snx < this.width) {
        ctx.fillText(String(-u), snx - 8, this.origin.y + 14);
      }
    }

    ctx.restore();
  }

  _drawCurve(ctx) {
    ctx.save();
    ctx.strokeStyle = '#256ec2';
    ctx.lineWidth = 3.2;

    const stepPx = 2;
    let penDown = false;

    ctx.beginPath();
    for (let sx = 0; sx <= this.width; sx += stepPx) {
      const [mathX] = this.toMath(sx, 0);
      const mathY = this.evaluate(mathX);

      if (mathY === null || isNaN(mathY) || !isFinite(mathY)) {
        penDown = false;
        continue;
      }

      const [, sy] = this.toScreen(mathX, mathY);

      if (sy < -150 || sy > this.height + 150) {
        penDown = false;
        continue;
      }

      if (!penDown) {
        ctx.moveTo(sx, sy);
        penDown = true;
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  _drawDerivativeCurve(ctx){
    const {a,b}=this.params,c=this.ctx;c.save();c.strokeStyle='#e38a36';c.lineWidth=2;c.setLineDash([7,4]);
    c.beginPath();let active=false;
    for(let sx=0;sx<=this.width;sx+=3){const [x]=this.toMath(sx,0);const y=3*a*x*x-b;
      const [,sy]=this.toScreen(x,y);if(sy< -150||sy>this.height+150){active=false;continue;}
      if(!active){c.moveTo(sx,sy);active=true;}else c.lineTo(sx,sy);
    }c.stroke();c.restore();
  }

  _drawFeatures(ctx) {
    const type = this.model.type || this.model.builderType || 'parabolaGeneral';
    const { a, b, c, d } = this.params;

    if (type === 'parabola' || type === 'parabolaGeneral') {
      const analysis = SafeExpression.analyzeQuadratic(a, b, c);

      // 1. Đỉnh parabol (nếu a != 0)
      if (analysis.vertex && this.showVertex) {
        const [vx, vy] = analysis.vertex;
        const [sx, sy] = this.toScreen(vx, vy);

        if (sx >= 0 && sx <= this.width && sy >= 0 && sy <= this.height) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(sx, sy, 6.5, 0, Math.PI * 2);
          ctx.fillStyle = '#e58e26';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = 'bold 12px system-ui';
          ctx.fillStyle = '#b36200';
          ctx.fillText(`Đỉnh I(${vx}; ${vy})`, sx + 10, sy - 8);

          // Trục đối xứng
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = 'rgba(229, 142, 38, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx, this.height);
          ctx.stroke();
          ctx.restore();
        }
      }

      // 2. Nghiệm (giao điểm với trục hoành Ox)
      if (Array.isArray(analysis.roots) && this.showRoots) {
        analysis.roots.forEach((rx, idx) => {
          const [sx, sy] = this.toScreen(rx, 0);
          if (sx >= 0 && sx <= this.width) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(sx, sy, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#27ae60';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.font = 'bold 11px system-ui';
            ctx.fillStyle = '#1e7e43';
            ctx.fillText(`x${analysis.roots.length > 1 ? idx + 1 : ''} = ${rx}`, sx - 15, sy - 10);
            ctx.restore();
          }
        });
      }
    } else if (type === 'rationalFunc' && this.showAsymptotes) {
      const analysis = SafeExpression.analyzeRational(a, b, c, d);
      if (analysis.type === 'rational' || analysis.type === 'removable') {
        ctx.save();
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 1.8;

        // Tiệm cận đứng
        if (analysis.verticalAsymptote !== null) {
          const [sx] = this.toScreen(analysis.verticalAsymptote, 0);
          ctx.beginPath();
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx, this.height);
          ctx.stroke();
          ctx.font = 'bold 11px system-ui';
          ctx.fillStyle = '#c0392b';
          ctx.fillText(`TCĐ: x = ${analysis.verticalAsymptote}`, sx + 6, 24);
        }

        // Tiệm cận ngang
        if (analysis.horizontalAsymptote !== null) {
          const [, sy] = this.toScreen(0, analysis.horizontalAsymptote);
          ctx.beginPath();
          ctx.moveTo(0, sy);
          ctx.lineTo(this.width, sy);
          ctx.stroke();
          ctx.font = 'bold 11px system-ui';
          ctx.fillStyle = '#c0392b';
          ctx.fillText(`TCN: y = ${analysis.horizontalAsymptote}`, 12, sy - 6);
        }
        if(analysis.hole){
          const [hx,hy]=this.toScreen(...analysis.hole);
          ctx.setLineDash([]);ctx.beginPath();ctx.arc(hx,hy,6,0,2*Math.PI);
          ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#e74c3c';ctx.lineWidth=2;ctx.stroke();
          ctx.fillStyle='#ae3232';ctx.fillText('Lỗ thủng',hx+10,hy-9);
        }
        ctx.restore();
      }
    }
  }

  _drawTrace(ctx) {
    const mathX = Math.round(this.hoverX * 100) / 100;
    const mathY = this.evaluate(mathX);
    if (mathY === null || isNaN(mathY) || !isFinite(mathY)) return;

    const [sx, sy] = this.toScreen(mathX, mathY);
    if (sx < 0 || sx > this.width || sy < 0 || sy > this.height) return;

    ctx.save();
    // Đường gióng nét đứt tới 2 trục
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(37, 110, 194, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(sx, this.origin.y);
    ctx.lineTo(sx, sy);
    ctx.lineTo(this.origin.x, sy);
    ctx.stroke();

    // Điểm trace
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(sx, sy, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = '#f39c12';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hộp tọa độ hiển thị
    const label = `M(${mathX}; ${Math.round(mathY * 100) / 100})`;
    ctx.font = 'bold 11px system-ui';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    const textWidth = ctx.measureText(label).width;
    ctx.fillRect(sx + 10, sy - 24, textWidth + 12, 20);
    ctx.strokeStyle = '#cbd5e1';
    ctx.strokeRect(sx + 10, sy - 24, textWidth + 12, 20);

    ctx.fillStyle = '#1e3d59';
    ctx.fillText(label, sx + 16, sy - 10);
    ctx.restore();
  }

  updateParameters(patch) {
    const next={...this.params,...patch};
    // The graph viewer uses (b,c) for slope/intercept but catalog uses (a,b).
    const raw=['linearSlope','lineGraph'].includes(this.model.type)
      ? {a:next.b,b:next.c} : next;
    const checked=normalizeExhibit({...this.model,params:raw});
    this.params=this._getDefaultParams(checked);
    this.render();
  }

  reset() {
    this.params = { ...this.initialParams };
    this.origin = { x: this.width / 2, y: this.height / 2 };
    this.scale = 36;
    this.hoverX = null;
    this.render();
  }

  getMetrics() {
    const type = this.model.type || this.model.builderType || 'parabolaGeneral';
    const { a, b, c, d } = this.params;

    if(type==='sine')return [
      {name:'Biên độ',value:String(this.params.amp)},
      {name:'Chu kỳ',value:String(Math.round(2000*Math.PI/this.params.freq)/1000)+' rad'},
      {name:'Biểu thức',value:`y=${this.params.amp} sin(${this.params.freq}x)`}];
    if(type==='exponential')return [
      {name:'Cơ số',value:String(this.params.a)},
      {name:'Trạng thái',value:this.params.a>1?'Đồng biến':'Nghịch biến'},
      {name:'Giá trị tại 0',value:'1'}];
    if(type==='derivative')return [
      {name:'Hàm số',value:`f(x)=${this.params.a}x³−${this.params.b}x`},
      {name:'Đạo hàm (đường cam)',value:`f′(x)=${3*this.params.a}x²−${this.params.b}`}];

    if (type === 'parabola' || type === 'parabolaGeneral') {
      const an = SafeExpression.analyzeQuadratic(a, b, c);
      const metricsList = [
        { name: 'Loại hàm số', value: an.title }
      ];
      if (an.vertex) {
        metricsList.push({ name: 'Tọa độ đỉnh I', value: `(${an.vertex[0]}; ${an.vertex[1]})` });
        metricsList.push({ name: 'Trục đối xứng', value: `x = ${an.axisOfSymmetry}` });
      }
      if (an.infiniteRoots || an.type === 'identity_zero') {
        metricsList.push({ name: 'Nghiệm của f(x) = 0', value: 'Vô số nghiệm (S = ℝ)' });
      } else if (Array.isArray(an.roots) && an.roots.length > 0) {
        metricsList.push({ name: 'Nghiệm của f(x) = 0', value: an.roots.join(' ; ') });
      } else if (an.type === 'parabola') {
        metricsList.push({ name: 'Nghiệm của f(x) = 0', value: 'Vô nghiệm thực (Δ < 0, S = ∅)' });
      } else {
        metricsList.push({ name: 'Nghiệm của f(x) = 0', value: 'Vô nghiệm (S = ∅)' });
      }
      metricsList.push({ name: 'Tung độ gốc f(0)', value: String(c) });
      return metricsList;
    }

    if(type === 'inequalityRegion') return [
      {name:'Đường biên',value:`${a}x + ${b}y = ${c}`},
      {name:'Miền nghiệm',value:`${a}x + ${b}y ≤ ${c}`},
      {name:'Gốc O(0;0)',value:0<=c?'Thuộc miền nghiệm':'Không thuộc miền nghiệm'}
    ];
    if(type === 'linearSlope'||type === 'lineGraph') return [
      {name:'Hệ số góc',value:String(b)},
      {name:'Tung độ gốc',value:String(c)},
      {name:'Đồ thị',value:`y=${b}x+(${c})`}
    ];
    if (type === 'rationalFunc') {
      const an = SafeExpression.analyzeRational(a, b, c, d);
      return [
        { name: 'Tiệm cận đứng', value: an.verticalAsymptote !== null ? `x = ${an.verticalAsymptote}` : 'Không có' },
        { name: 'Tiệm cận ngang', value: an.horizontalAsymptote !== null ? `y = ${an.horizontalAsymptote}` : 'Không có' },
        { name: 'Tâm đối xứng', value: an.center ? `I(${an.center[0]}; ${an.center[1]})` : 'Không có' },
        ...(an.hole?[{name:'Điểm loại khỏi miền xác định',value:`(${an.hole[0]}; ${an.hole[1]})`}]:[])
      ];
    }

    if (type === 'cubicCurve') {
      const inf = SafeExpression.inflectionPointCubic(a, b, c, d);
      return [
        { name: 'Điểm uốn I', value: inf ? `(${inf[0]}; ${inf[1]})` : 'Không có' },
        { name: 'Tung độ gốc f(0)', value: String(d) }
      ];
    }

    return [
      { name: 'Hệ số a', value: String(a) },
      { name: 'Hệ số b', value: String(b) }
    ];
  }

  exportSnapshot() {
    if (!this.canvas) return '';
    return this.canvas.toDataURL('image/png');
  }

  getState() {
    return {
      type: this.model.type,
      modality: 'functiongraph',
      params: ['linearSlope','lineGraph'].includes(this.model.type) ? {
        a:this.params.b,b:this.params.c
      } : { ...this.params }
    };
  }

  dispose() {
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    window.removeEventListener('resize', this._onResize);
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
