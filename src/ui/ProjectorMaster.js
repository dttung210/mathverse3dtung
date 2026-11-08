/**
 * MATHVERSE PROJECTOR MASTER SUITE
 * Công cụ giảng dạy máy chiếu chuyên nghiệp:
 * - Bút vẽ laser ảo (Virtual Laser Pointer with Glowing Trail)
 * - Bút vẽ ghi chú trực tiếp trên không gian 3D (Interactive Teacher Pen)
 * - Tự động xóa nét vẽ & quản lý lớp phủ đồ họa
 */

export class ProjectorMaster {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isActive = false;
    this.tool = 'laser'; // 'laser' | 'pen' | 'off'
    this.strokes = [];
    this.currentStroke = null;
    this.laserPos = { x: -100, y: -100 };
    this.laserTrail = [];
    this.animId = null;
    this.isDrawing = false;
    this.penColor = '#ef4444'; // Red laser ink
    this.penWidth = 4.5;
  }

  init() {
    this.unbindEvents();
    if (this.resize) {
      window.removeEventListener('resize', this.resize);
    }
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    let c = document.getElementById('projector-canvas');
    if (!c) {
      c = document.createElement('canvas');
      c.id = 'projector-canvas';
      c.className = 'projector-canvas-layer';
      document.body.appendChild(c);
    }
    this.canvas = c;
    this.ctx = c.getContext('2d');

    this.resize = () => {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.redraw();
    };

    window.addEventListener('resize', this.resize);
    this.resize();

    this.bindEvents();
    this.startLoop();
  }

  bindEvents() {
    this.unbindEvents();

    const onMove = (clientX, clientY) => {
      this.laserPos.x = clientX;
      this.laserPos.y = clientY;

      if (this.isActive) {
        this.laserTrail.push({
          x: clientX,
          y: clientY,
          time: performance.now(),
          alpha: 1.0
        });
      }

      if (this.isDrawing && this.currentStroke) {
        this.currentStroke.points.push({ x: clientX, y: clientY });
      }
    };

    const onDown = (clientX, clientY) => {
      if (!this.isActive || this.tool !== 'pen') return;
      this.isDrawing = true;
      this.currentStroke = {
        color: this.penColor,
        width: this.penWidth,
        points: [{ x: clientX, y: clientY }]
      };
      this.strokes.push(this.currentStroke);
    };

    const onUp = () => {
      this.isDrawing = false;
      this.currentStroke = null;
    };

    this._onMouseMove = e => onMove(e.clientX, e.clientY);
    this._onMouseDown = e => {
      if (this.isActive && this.tool === 'pen' && e.target === this.canvas) {
        e.stopPropagation?.();
        onDown(e.clientX, e.clientY);
      }
    };
    this._onMouseUp = onUp;

    this._onTouchMove = e => {
      if (e.touches?.[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    this._onTouchStart = e => {
      if (this.isActive && this.tool === 'pen' && e.touches?.[0] && e.target === this.canvas) {
        e.stopPropagation?.();
        onDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    this._onTouchEnd = onUp;

    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mouseup', this._onMouseUp);

    // Touch support for interactive screens & smartboards
    window.addEventListener('touchmove', this._onTouchMove, { passive: true });
    window.addEventListener('touchstart', this._onTouchStart, { passive: true });
    window.addEventListener('touchend', this._onTouchEnd);
  }

  unbindEvents() {
    if (this._onMouseMove) window.removeEventListener('mousemove', this._onMouseMove);
    if (this._onMouseDown) window.removeEventListener('mousedown', this._onMouseDown);
    if (this._onMouseUp) window.removeEventListener('mouseup', this._onMouseUp);
    if (this._onTouchMove) window.removeEventListener('touchmove', this._onTouchMove);
    if (this._onTouchStart) window.removeEventListener('touchstart', this._onTouchStart);
    if (this._onTouchEnd) window.removeEventListener('touchend', this._onTouchEnd);
    this._onMouseMove = null;
    this._onMouseDown = null;
    this._onMouseUp = null;
    this._onTouchMove = null;
    this._onTouchStart = null;
    this._onTouchEnd = null;
  }

  setTool(tool) {
    // Ngắt nét vẽ đang dở khi chuyển công cụ để nét không tự kéo dài sang phiên mới
    this.isDrawing = false;
    this.currentStroke = null;
    this.tool = tool;
    if (this.canvas) {
      if (tool === 'pen') {
        this.canvas.style.pointerEvents = 'auto';
        this.canvas.style.cursor = 'crosshair';
      } else {
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.cursor = 'default';
      }
    }
  }

  clear() {
    this.strokes = [];
    this.laserTrail = [];
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  setActive(active) {
    this.isActive = active;
    if (this.canvas) {
      this.canvas.style.display = active ? 'block' : 'none';
      if (!active) {
        this.clear();
        this.setTool('laser');
      }
    }
  }

  startLoop() {
    const loop = () => {
      this.animId = requestAnimationFrame(loop);
      if (!this.isActive || !this.ctx) return;
      this.render();
    };
    loop();
  }

  redraw() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Vẽ toàn bộ nét vẽ của giáo viên
    for (const stroke of this.strokes) {
      if (!stroke.points || stroke.points.length < 2) continue;
      this.ctx.beginPath();
      this.ctx.strokeStyle = stroke.color;
      this.ctx.lineWidth = stroke.width;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.shadowColor = stroke.color;
      this.ctx.shadowBlur = 8;

      this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      this.ctx.stroke();
    }
    this.ctx.shadowBlur = 0;
  }

  render() {
    this.redraw();

    const now = performance.now();
    // 1. Cập nhật và vẽ vệt laser phát sáng
    this.laserTrail = this.laserTrail.filter(pt => now - pt.time < 320);

    if (this.laserTrail.length > 1) {
      for (let i = 0; i < this.laserTrail.length - 1; i++) {
        const p1 = this.laserTrail[i];
        const p2 = this.laserTrail[i + 1];
        const age = (now - p1.time) / 320;
        const alpha = Math.max(0, 1 - age);

        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(239, 68, 68, ${alpha * 0.75})`;
        this.ctx.lineWidth = 3.5 * alpha;
        this.ctx.lineCap = 'round';
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
      }
    }

    // 2. Điểm chấm Laser rực rỡ ở đầu con trỏ
    if (this.laserPos.x > 0 && this.laserPos.y > 0) {
      const { x, y } = this.laserPos;

      // Hào quang ngoài
      const grad = this.ctx.createRadialGradient(x, y, 1, x, y, 18);
      grad.addColorStop(0, 'rgba(255, 68, 68, 0.95)');
      grad.addColorStop(0.35, 'rgba(239, 68, 68, 0.6)');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 18, 0, Math.PI * 2);
      this.ctx.fill();

      // Tâm laser trắng siêu sáng
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.isDrawing = false;
    this.currentStroke = null;
    this.isActive = false;
    if (this.resize) {
      window.removeEventListener('resize', this.resize);
      this.resize = null;
    }
    this.unbindEvents();
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
      this.ctx = null;
    }
  }
}
