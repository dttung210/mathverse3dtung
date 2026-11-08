/**
 * MATHVERSE V5 - StatisticsChartViewer
 * Trình biểu diễn và phân tích biểu đồ thống kê (Cột, Đường, Quạt tròn, Histogram).
 * Hỗ trợ bảng số liệu chỉnh sửa trực tiếp, tính tổng, trung bình, trung vị chính xác.
 */

import { Stats } from '../math/stats.js?v=r107_v15';

export class StatisticsChartViewer {
  constructor(model, options = {}) {
    this.model = model;
    this.options = options;
    this.container = null;
    this.canvas = null;
    this.ctx = null;

    // Dữ liệu mẫu ban đầu
    const defaultData = this._getDefaultData(model);
    this.initialData = JSON.parse(JSON.stringify(defaultData));
    this.data = JSON.parse(JSON.stringify(defaultData));

    this.chartKind = model.type === 'boxPlot'?'box':model.type === 'pieChart' ? 'pie' : 'bar'; // correct default to exhibit type
    this.colors = ['#1f77b4', '#2ca02c', '#ff7f0e', '#9467bd', '#d62728', '#8c564b'];
    this.hoverIndex = null;

    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerLeave = this._onPointerLeave.bind(this);
    this._onResize = this._onResize.bind(this);
  }

  _getDefaultData(model) {
    // User-imported/persisted numbers take precedence over exhibit defaults.
    if (model.data && Array.isArray(model.data.values) && model.data.values.length) {
      const values=model.data.values.map(Number).filter(Number.isFinite);
      if(values.length) return {
        kind:model.data.kind==='raw_numeric'?'raw_numeric':'categorical_frequency',
        labels:values.map((_,i)=>String(model.data.labels?.[i] || `Nhóm ${i+1}`)),
        values,unit:model.data.unit || 'đơn vị'
      };
    }
    if(model.type === 'barChart') return {
      kind:'categorical_frequency', labels:['Toán','Ngữ văn','Tiếng Anh','KHTN'],
      values:[model.params?.c1 ?? 6, model.params?.c2 ?? 8, model.params?.c3 ?? 5, model.params?.c4 ?? 9],unit:'số lượng'
    };
    if(model.type === 'pieChart') return {
      kind:'categorical_frequency', labels:['Nhóm 1','Nhóm 2','Nhóm 3'],
      values:[model.params?.p1 ?? 40, model.params?.p2 ?? 35, model.params?.p3 ?? 25],unit:'số lượng'
    };
    return {kind:'raw_numeric',labels:['A','B','C','D'],values:[12,18,9,15],unit:'giá trị'};
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
    this.container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');

    this.canvas.addEventListener('pointermove', this._onPointerMove);
    this.canvas.addEventListener('pointerleave', this._onPointerLeave);
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
    this.render();
  }

  setChartKind(kind) {
    if (['bar', 'line', 'pie', 'hist','box'].includes(kind) && (!['hist','box'].includes(kind) || this.data.kind === 'raw_numeric')) {
      this.chartKind = kind;
      this.render();
    }
  }

  setDataValues(newValues) {
    if (!Array.isArray(newValues)) return;
    const minAllowed = this.data.kind === 'raw_numeric' ? -1000000 : 0;
    const cleaned = [];
    for (const v of newValues) {
      const n = typeof v === 'number' ? v : (typeof v === 'string' && v.trim() !== '' ? Number(v.trim()) : NaN);
      if (Number.isFinite(n)) {
        cleaned.push(Math.max(minAllowed, Math.min(1000000, n)));
      }
    }
    if (cleaned.length > 0) {
      this.data.values = cleaned;
      if (this.data.kind !== 'raw_numeric' && (!Array.isArray(this.data.labels) || this.data.labels.length !== cleaned.length)) {
        this.data.labels = cleaned.map((_, i) => this.data.labels?.[i] || `Nhóm ${i + 1}`);
      }
    }
    this.render();
  }

  _onPointerMove(e) {
    // Dò tìm phần tử đang hover
    this.render();
  }

  _onPointerLeave() {
    this.hoverIndex = null;
    this.render();
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.chartKind === 'pie') {
      this._renderPieChart(ctx);
    } else if (this.chartKind === 'hist') {
      this._renderHistogram(ctx);
    } else if (this.chartKind === 'box') {
      this._renderBoxPlot(ctx);
    } else if (this.chartKind === 'line') {
      this._renderLineChart(ctx);
    } else {
      this._renderBarChart(ctx);
    }
  }

  _renderBoxPlot(ctx){
    const stats=Stats.fiveNumberSummary(this.data.values);
    if(!stats)return;
    const {min,q1,median,q3,max}=stats;
    const left=65,right=this.width-42,middle=this.height/2;
    const span=Math.max(1,max-min), margin=span*.06;
    const lo=min-margin,hi=max+margin;
    const x=v=>left+(v-lo)/(hi-lo)*(right-left);
    ctx.save();ctx.strokeStyle='#277c91';ctx.lineWidth=2.7;
    ctx.beginPath();ctx.moveTo(x(min),middle);ctx.lineTo(x(max),middle);ctx.stroke();
    ctx.fillStyle='rgba(54,177,169,.22)';ctx.fillRect(x(q1),middle-38,x(q3)-x(q1),76);
    ctx.strokeRect(x(q1),middle-38,x(q3)-x(q1),76);
    ctx.beginPath();ctx.moveTo(x(median),middle-38);ctx.lineTo(x(median),middle+38);
    ctx.moveTo(x(min),middle-19);ctx.lineTo(x(min),middle+19);
    ctx.moveTo(x(max),middle-19);ctx.lineTo(x(max),middle+19);ctx.stroke();
    ctx.fillStyle='#21455d';ctx.font='bold 12px system-ui';
    ctx.fillText('Biểu đồ hộp – trung vị của mỗi nửa dãy số (Tukey)',left,32);
    for(const [key,value] of [['Min',min],['Q1',q1],['Me',median],['Q3',q3],['Max',max]]){
      ctx.fillText(`${key}: ${value}`,Math.max(8,Math.min(this.width-85,x(value)-24)),middle+75+(key==='Me'?18:0));
    }
    ctx.restore();
  }

  _renderBarChart(ctx) {
    const vals = this.data.values;
    const labels = this.data.labels;
    const n = vals.length;
    const maxVal = Math.max(...vals, 1);

    const padL = 60, padR = 30, padT = 40, padB = 55;
    const plotW = this.width - padL - padR;
    const plotH = this.height - padT - padB;

    // Trục và lưới ngang
    ctx.save();
    ctx.strokeStyle = '#9bb1c4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, this.height - padB);
    ctx.lineTo(this.width - padR, this.height - padB);
    ctx.stroke();

    ctx.font = '11px system-ui';
    ctx.fillStyle = '#687e91';
    for (let i = 0; i <= 4; i++) {
      const yVal = Math.round((maxVal * i / 4) * 10) / 10;
      const y = (this.height - padB) - (i / 4) * plotH;
      ctx.fillText(String(yVal), padL - 32, y + 4);

      if (i > 0) {
        ctx.strokeStyle = '#e9f1f6';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(this.width - padR, y);
        ctx.stroke();
      }
    }

    // Vẽ từng cột
    const barSlot = plotW / n;
    const barWidth = Math.min(65, barSlot * 0.65);

    vals.forEach((v, idx) => {
      const h = (v / maxVal) * plotH;
      const x = padL + idx * barSlot + (barSlot - barWidth) / 2;
      const y = (this.height - padB) - h;

      // Cột
      ctx.fillStyle = this.colors[idx % this.colors.length];
      if(v>0)ctx.fillRect(x, y, barWidth, h);

      // Nhãn giá trị trên cột
      ctx.font = 'bold 12px system-ui';
      ctx.fillStyle = '#1e384d';
      ctx.textAlign = 'center';
      ctx.fillText(String(v), x + barWidth / 2, y - 8);

      // Tên danh mục bên dưới
      ctx.font = '12px system-ui';
      ctx.fillStyle = '#4c6478';
      ctx.fillText(labels[idx] || `Mục ${idx + 1}`, x + barWidth / 2, this.height - padB + 22);
    });

    ctx.restore();
  }

  _renderLineChart(ctx) {
    const vals = this.data.values;
    const labels = this.data.labels;
    const n = vals.length;
    const maxVal = Math.max(...vals, 1);

    const padL = 60, padR = 30, padT = 40, padB = 55;
    const plotW = this.width - padL - padR;
    const plotH = this.height - padT - padB;

    ctx.save();
    ctx.strokeStyle = '#9bb1c4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, this.height - padB);
    ctx.lineTo(this.width - padR, this.height - padB);
    ctx.stroke();

    const barSlot = plotW / n;
    const points = vals.map((v, idx) => {
      const x = padL + idx * barSlot + barSlot / 2;
      const y = (this.height - padB) - (v / maxVal) * plotH;
      return [x, y];
    });

    // Đường gấp khúc
    ctx.strokeStyle = '#1a8b9d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach(([x, y], idx) => {
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Điểm nút
    points.forEach(([x, y], idx) => {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = this.colors[idx % this.colors.length];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = 'bold 12px system-ui';
      ctx.fillStyle = '#1e384d';
      ctx.textAlign = 'center';
      ctx.fillText(String(vals[idx]), x, y - 10);
      ctx.fillText(labels[idx] || `Mục ${idx + 1}`, x, this.height - padB + 22);
    });

    ctx.restore();
  }

  _renderPieChart(ctx) {
    const vals = this.data.values;
    const labels = this.data.labels;
    const sum = vals.reduce((a, b) => a + b, 0);

    const cx = this.width * 0.42;
    const cy = this.height * 0.52;
    const r = Math.min(this.width * 0.28, this.height * 0.38);

    ctx.save();
    if (sum === 0) {
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      let startAngle = -Math.PI / 2;
      vals.forEach((v, idx) => {
        const sliceAngle = (v / sum) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = this.colors[idx % this.colors.length];
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        startAngle += sliceAngle;
      });
    }

    // Chú thích Legend bên phải
    const legX = this.width * 0.72;
    const legY = Math.max(25, cy - vals.length * 16);

    vals.forEach((v, idx) => {
      const y = legY + idx * 30;
      const pct = sum > 0 ? Math.round((v / sum) * 1000) / 10 : 0;

      ctx.fillStyle = this.colors[idx % this.colors.length];
      ctx.fillRect(legX, y, 14, 14);

      ctx.font = '12px system-ui';
      ctx.fillStyle = '#2d4558';
      ctx.textAlign = 'start';
      ctx.fillText(`${labels[idx] || 'Mục ' + (idx + 1)}: ${v} (${pct}%)`, legX + 22, y + 12);
    });

    ctx.restore();
  }

  _renderHistogram(ctx) {
    const bins = Stats.makeHistogramEdges(this.data.values);
    const freqs = Stats.computeHistogramBins(this.data.values, bins);
    const maxFreq = Math.max(...freqs, 1);

    const padL = 60, padR = 30, padT = 40, padB = 55;
    const plotW = this.width - padL - padR;
    const plotH = this.height - padT - padB;

    ctx.save();
    ctx.strokeStyle = '#9bb1c4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, this.height - padB);
    ctx.lineTo(this.width - padR, this.height - padB);
    ctx.stroke();

    const nBins = freqs.length;
    const binWidth = plotW / nBins;

    freqs.forEach((count, idx) => {
      const h = (count / maxFreq) * plotH;
      const x = padL + idx * binWidth;
      const y = (this.height - padB) - h;

      ctx.fillStyle = this.colors[idx % this.colors.length];
      if(count>0)ctx.fillRect(x, y, binWidth, h);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      if(count>0)ctx.strokeRect(x, y, binWidth, h);

      ctx.font = 'bold 12px system-ui';
      ctx.fillStyle = '#1e384d';
      ctx.textAlign = 'center';
      ctx.fillText(String(count), x + binWidth / 2, y - 8);

      const label = idx === nBins - 1 ? `[${bins[idx]}; ${bins[idx + 1]}]` : `[${bins[idx]}; ${bins[idx + 1]})`;
      ctx.font = '11px system-ui';
      ctx.fillStyle = '#4c6478';
      ctx.fillText(label, x + binWidth / 2, this.height - padB + 20);
    });

    ctx.restore();
  }

  updateParameters(patch) {
    if (patch.values) {
      this.setDataValues(patch.values);
    }
    if (patch.chartKind) {
      this.setChartKind(patch.chartKind);
    }
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(this.initialData));
    this.chartKind = this.model.type === 'boxPlot'?'box':this.model.type === 'pieChart' ? 'pie' : 'bar';
    this.render();
  }

  getMetrics() {
    if(this.data.kind !== 'raw_numeric') {
      const an=Stats.analyzeCategorical(this.data.labels,this.data.values);
      if (!an.valid && an.error && an.totalCount === 0) {
        return [{ name: 'Lỗi cấu trúc bảng', value: an.error }];
      }
      return [
        {name:'Tổng số lượng',value:String(an.totalCount)},
        {name:'Nhóm nhiều nhất',value:an.modeCategories.join(', ')||'Chưa có dữ liệu'},
        {name:'Tỉ trọng các nhóm',value:an.percentages.map(x=>x+'%').join(' · ')},
        ...(an.error ? [{ name: 'Lưu ý dữ liệu', value: an.error }] : [])
      ];
    }
    const an=Stats.analyzeRaw(this.data.values);
    const five=Stats.fiveNumberSummary(this.data.values);
    return [
      {name:'Số quan sát n',value:String(an.count)},
      {name:'Tổng ∑x',value:String(an.sum)},
      {name:'Trung bình',value:String(an.mean)},
      {name:'Trung vị',value:String(an.median)},
      ...(an.warning ? [{name:'Lưu ý dữ liệu',value:an.warning}] : []),
      ...(this.chartKind==='box'&&five?[{name:'Q1',value:String(five.q1)},{name:'Q3',value:String(five.q3)},{name:'IQR',value:String(five.q3-five.q1)}]:[])
    ];
  }

  exportSnapshot() {
    if (!this.canvas) return '';
    return this.canvas.toDataURL('image/png');
  }

  getState() {
    return {
      type: this.model.type,
      modality: 'statisticschart',
      chartKind: this.chartKind,
      data: JSON.parse(JSON.stringify(this.data))
    };
  }

  dispose() {
    this.canvas?.removeEventListener('pointermove', this._onPointerMove);
    this.canvas?.removeEventListener('pointerleave', this._onPointerLeave);
    window.removeEventListener('resize', this._onResize);
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
