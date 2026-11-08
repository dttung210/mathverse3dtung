/**
 * MATHVERSE R11 — BÀN TƯƠNG TÁC HOLO-STAGE TRỰC TIẾP TRÊN BỤC 3D (IN-WORLD HOLO-STAGE INSPECTOR)
 * Thay vì mở cửa sổ popup 2D che khuất cảnh 3D, Holo-Stage cho phép học sinh & giáo viên
 * điều khiển trực tiếp mô hình 3D ngay trên bục trưng bày (tách lớp cấu trúc, xoay 360°,
 * tua pha chuyển động, đổi chế độ X-Ray/Khung dây, lướt nhanh giữa các bục và thực hiện
 * Nhiệm vụ Khám phá 3 Bước ngay trong không gian 3D).
 */
import { getModeById } from './r6-room-layout.js';
import { EXHIBIT_CYCLE_SECONDS, educationalFrame, modelMotionPlan } from './learning-motion.mjs';
import { getCurriculumModelById } from '../curriculum/curriculum-manifest.mjs';
import { mountGuidedDiscoveryCard } from '../curriculum/guided-discovery.mjs';
import {
  FOLD_NET_CATALOG,
  getFoldNetDefinition,
  getFoldNetPlacement,
  getFoldNetForModeId,
  getFoldNetParamSchema,
  computeFoldNetFormulas
} from './fold-net/index.mjs';

export class HoloStageInspector {
  constructor({ getMuseum, onOpenFullLab, onNotify } = {}) {
    this.getMuseum = getMuseum;
    this.onOpenFullLab = onOpenFullLab;
    this.onNotify = onNotify;
    this.activeModeId = null;
    this.activeExhibit = null;
    this.dock = null;
    this._build();
  }

  _build() {
    const dock = document.createElement('aside');
    dock.id = 'r11-holo-dock';
    dock.className = 'r11-holo-dock glass';
    dock.hidden = true;
    dock.setAttribute('aria-label', 'Bảng điều khiển mô hình 3D Holo-Stage tại bục');

    dock.innerHTML = `
      <div class="r11-holo-head">
        <div class="r11-holo-badge-row">
          <span class="r11-holo-pill">🔮 HOLO-STAGE 3D TẠI BỤC</span>
          <span class="r11-holo-pos" id="r11-holo-pos">Bục 1/5</span>
          <button type="button" class="r11-holo-close" id="r11-holo-close" title="Thoát chế độ Holo-Stage">✕</button>
        </div>
        <small class="r11-holo-meta" id="r11-holo-meta">LỚP 8 · CHƯƠNG II</small>
        <h3 class="r11-holo-title" id="r11-holo-title">Tên mô hình</h3>
        <p id="r11-learning-step" class="r11-holo-meta" aria-live="polite"></p>
        <div class="r11-holo-nav">
          <button type="button" id="r11-holo-prev" class="r11-holo-nav-btn">◀ Bục trước</button>
          <button type="button" id="r11-holo-reset" class="r11-holo-nav-btn">↺ Mặc định 3D</button>
          <button type="button" id="r11-holo-next" class="r11-holo-nav-btn">Bục tiếp ▶</button>
        </div>
      </div>

      <div class="r11-holo-body" id="r11-holo-body">
        <div class="r11-holo-controls">
          <div class="r11-holo-row">
            <button type="button" id="r11-holo-play" class="r11-holo-play-btn">▶ Phát mô phỏng</button>
            <button type="button" id="r77-holo-step-back" class="r11-holo-nav-btn">◀ Bước</button>
            <button type="button" id="r77-holo-step-next" class="r11-holo-nav-btn">Bước ▶</button>
            <select id="r77-holo-speed" aria-label="Tốc độ diễn giải Toán học" title="Tốc độ chuyển động">
              <option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option><option value="2">2×</option>
            </select>
            <div class="r11-holo-mat-group" role="group" aria-label="Chế độ hiển thị 3D">
              <button type="button" class="r11-mat-btn is-active" data-mat="solid">Đặc</button>
              <button type="button" class="r11-mat-btn" data-mat="xray">X-Ray</button>
              <button type="button" class="r11-mat-btn" data-mat="wire">Khung dây</button>
            </div>
          </div>

          <div class="r87-holo-switcher-row" style="margin:6px 0 8px;display:flex;gap:6px;align-items:center;">
            <label for="r87-holo-model-select" style="font-size:11px;font-weight:700;color:#fbbf24;white-space:nowrap;">📐 20 Mô hình Gấp/Trải:</label>
            <select id="r87-holo-model-select" aria-label="Chọn nhanh 1 trong 20 hiện vật gấp trải 2D 3D trong bảo tàng" style="flex:1;min-width:0;font-size:12px;padding:4px 6px;border-radius:6px;background:rgba(15,23,42,0.9);color:#f8fafc;border:1px solid rgba(251,191,36,0.45);">
              <option value="">— Chọn hiện vật Gấp/Trải 2D ⇄ 3D (R87) —</option>
              ${FOLD_NET_CATALOG.map(m => `<option value="${m.id}">#${String(m.notebookIndex).padStart(2, '0')} · ${m.name} (Lớp ${m.grades.join(', ')})</option>`).join('')}
            </select>
          </div>

          <div id="r87-holo-fold-panel" class="r87-holo-fold-panel" hidden style="margin:6px 0 10px;padding:8px 10px;border-radius:10px;background:rgba(15,23,42,0.78);border:1px solid rgba(245,158,11,0.42);">
            <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:7px;">
              <button type="button" id="r87-btn-unfold" class="r11-holo-nav-btn" style="flex:1;background:rgba(16,185,129,0.2);border-color:#10b981;color:#ecfdf5;font-weight:700;"> phẳng 2D (0%)</button>
              <button type="button" id="r87-btn-fold" class="r11-holo-nav-btn" style="flex:1;background:rgba(59,130,246,0.22);border-color:#3b82f6;color:#eff6ff;font-weight:700;"> khối 3D (100%)</button>
              <button type="button" id="r87-btn-replay" class="r11-holo-nav-btn" style="flex:1;background:rgba(245,158,11,0.2);border-color:#f59e0b;color:#fffbeb;font-weight:700;">↺ Làm lại</button>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:10px;font-size:11.5px;color:#e2e8f0;margin-bottom:7px;">
              <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;">
                <input type="checkbox" id="r87-chk-edges" checked/> Viền cạnh
              </label>
              <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;">
                <input type="checkbox" id="r87-chk-hinges" checked/> Nếp gấp bản lề
              </label>
              <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;">
                <input type="checkbox" id="r87-chk-formulas" checked/> Bảng công thức & Bước gấp
              </label>
            </div>
            <div id="r87-param-sliders" style="display:grid;gap:5px;margin-bottom:7px;"></div>
            <div id="r87-formula-card" style="font-size:11.5px;line-height:1.42;color:#f1f5f9;background:rgba(2,6,23,0.68);padding:7px 9px;border-radius:8px;border-left:3px solid #f59e0b;"></div>
          </div>

          <label class="r11-holo-slider">
            <span>⏱ Tua tiến trình dựng hình <output id="r11-out-phase">Tự động</output></span>
            <input type="range" id="r11-in-phase" min="0" max="10" step="0.05" value="0"/>
          </label>

          <label class="r11-holo-slider">
            <span>🧩 Tách lớp cấu trúc không gian 3D <output id="r11-out-explode">0%</output></span>
            <input type="range" id="r11-in-explode" min="0" max="1" step="0.02" value="0"/>
          </label>

          <label class="r11-holo-slider">
            <span>🔄 Góc xoay 360° trên bục <output id="r11-out-spin">0°</output></span>
            <input type="range" id="r11-in-spin" min="-180" max="180" step="2" value="0"/>
          </label>

          <label class="r11-holo-slider">
            <span>🔍 Phóng đại mô hình trên bục <output id="r11-out-scale">1.25x</output></span>
            <input type="range" id="r11-in-scale" min="0.75" max="1.75" step="0.05" value="1.25"/>
          </label>
        </div>

        <div class="r11-holo-discovery" id="r11-holo-discovery"></div>
      </div>

      <div class="r11-holo-foot">
        <button type="button" class="r11-holo-full-btn" id="r11-holo-full">
          ⛶ Mở Bàn Thí Nghiệm Đầy Đủ (Hình 2D/3D SGK & LaTeX)
        </button>
      </div>
    `;

    document.body.append(dock);
    this.dock = dock;
    this._onLearningStep = event => {
      const d=event.detail;
      if(!d||d.modeId!==this.activeModeId||!this.dock||this.dock.hidden)return;
      const output=this.dock.querySelector('#r11-learning-step');
      if(output)output.textContent=`${d.stage+1}/3: ${d.description}`;
    };
    document.addEventListener('mathverse:learning-step',this._onLearningStep);
    this._onLearningProgress=event=>{
      const d=event.detail;
      if(!d||d.modeId!==this.activeModeId||this.dock.hidden)return;
      const range=this.dock.querySelector('#r11-in-phase');
      const out=this.dock.querySelector('#r11-out-phase');
      const play=this.dock.querySelector('#r11-holo-play');
      if(range)range.value=String(d.phase);
      if(out)out.textContent=Math.round(d.phase*100/EXHIBIT_CYCLE_SECONDS)+'%';
      if(play)play.textContent=d.paused?'▶ Phát mô phỏng':'⏸ Tạm dừng';
      this._renderR87FormulaCard();
    };
    document.addEventListener('mathverse:learning-progress',this._onLearningProgress);

    dock.querySelector('#r11-holo-close')?.addEventListener('click', () => this.close());
    dock.querySelector('#r11-holo-prev')?.addEventListener('click', () => this.stepPedestal(-1));
    dock.querySelector('#r11-holo-next')?.addEventListener('click', () => this.stepPedestal(1));
    dock.querySelector('#r11-holo-reset')?.addEventListener('click', () => this.resetHoloState());
    dock.querySelector('#r11-holo-full')?.addEventListener('click', () => {
      if (!this.activeModeId) return;
      if (getFoldNetDefinition(this.activeModeId)) {
        const hs = this._ensureHoloState();
        if (hs) {
          hs.paused = false;
          hs.phase = 0;
          hs._lastTickSeconds = undefined;
          this.activeExhibit?.preview?.userData?.playAgain?.();
          this._syncControlInputs();
          this._renderR87FormulaCard();
        }
        return;
      }
      this.onOpenFullLab?.(this.activeModeId);
    });

    const playBtn = dock.querySelector('#r11-holo-play');
    const phaseIn = dock.querySelector('#r11-in-phase');
    const explodeIn = dock.querySelector('#r11-in-explode');
    const spinIn = dock.querySelector('#r11-in-spin');
    const scaleIn = dock.querySelector('#r11-in-scale');

    playBtn?.addEventListener('click', () => {
      const hs = this._ensureHoloState();
      if (!hs) return;
      if(hs.paused&&hs.phase>=EXHIBIT_CYCLE_SECONDS)hs.phase=0; // Replay only by teacher action.
      hs.paused = !hs.paused;
      hs._lastTickSeconds=undefined;
      playBtn.textContent = hs.paused ? '▶ Phát mô phỏng' : '⏸ Tạm dừng';
      dock.querySelector('#r11-out-phase').textContent = hs.paused ? `${Math.round((hs.phase / EXHIBIT_CYCLE_SECONDS) * 100)}%` : 'Tự động';
    });

    phaseIn?.addEventListener('input', () => {
      const hs = this._ensureHoloState();
      if (!hs) return;
      hs.paused = true;
      hs.phase = Number(phaseIn.value) || 0;
      playBtn.textContent = '▶ Phát mô phỏng';
      dock.querySelector('#r11-out-phase').textContent = `${Math.round((hs.phase / EXHIBIT_CYCLE_SECONDS) * 100)}%`;
      const step=educationalFrame(hs.phase).stage;
      const steps=this.activeExhibit?.preview?.userData?.motionPlan?.steps;
      if(steps)dock.querySelector('#r11-learning-step').textContent=`${step+1}/3: ${steps[step]}`;
    });

    for(const [id,offset] of [['r77-holo-step-back',-EXHIBIT_CYCLE_SECONDS/3],['r77-holo-step-next',EXHIBIT_CYCLE_SECONDS/3]]){
      dock.querySelector('#'+id)?.addEventListener('click',()=>{
        const hs=this._ensureHoloState();if(!hs)return;
        hs.paused=true;
        hs.phase=Math.max(0,Math.min(EXHIBIT_CYCLE_SECONDS,Math.round(hs.phase/(EXHIBIT_CYCLE_SECONDS/3))*(EXHIBIT_CYCLE_SECONDS/3)+offset));
        this._syncControlInputs();
      });
    }
    dock.querySelector('#r77-holo-speed')?.addEventListener('change',e=>{
      const hs=this._ensureHoloState();if(hs)hs.speed=Number(e.target.value)||1;
    });

    explodeIn?.addEventListener('input', () => {
      const hs = this._ensureHoloState();
      if (!hs) return;
      hs.explode = Number(explodeIn.value) || 0;
      dock.querySelector('#r11-out-explode').textContent = `${Math.round(hs.explode * 100)}%`;
    });

    spinIn?.addEventListener('input', () => {
      const hs = this._ensureHoloState();
      if (!hs) return;
      const deg = Number(spinIn.value) || 0;
      hs.spinOffset = (deg * Math.PI) / 180;
      dock.querySelector('#r11-out-spin').textContent = `${deg}°`;
    });

    scaleIn?.addEventListener('input', () => {
      const hs = this._ensureHoloState();
      if (!hs) return;
      hs.scale = Number(scaleIn.value) || 1.25;
      dock.querySelector('#r11-out-scale').textContent = `${hs.scale.toFixed(2)}x`;
    });

    for (const btn of dock.querySelectorAll('.r11-mat-btn')) {
      btn.addEventListener('click', () => {
        const hs = this._ensureHoloState();
        if (!hs) return;
        hs.renderMode = btn.dataset.mat || 'solid';
        const preview = this.activeExhibit?.preview;
        preview?.userData?.setDisplayOptions?.({
          displayMode: hs.renderMode === 'wire' ? 'wireframe' : hs.renderMode
        });
        for (const b of dock.querySelectorAll('.r11-mat-btn')) {
          b.classList.toggle('is-active', b === btn);
        }
      });
    }

    // R87: 2D <-> 3D Fold-Net Museum Exhibit Controls
    dock.querySelector('#r87-holo-model-select')?.addEventListener('change', (e) => {
      const foldId = e.target.value;
      if (!foldId) return;
      const place = getFoldNetPlacement(foldId);
      const targetId = place?.action === 'EXTEND_EXISTING_MUSEUM' ? place.primaryModeId : foldId;
      this.openForMode(targetId);
    });

    dock.querySelector('#r87-btn-unfold')?.addEventListener('click', () => {
      const hs = this._ensureHoloState();
      if (!hs) return;
      hs.paused = true;
      hs.phase = 0;
      this.activeExhibit?.preview?.userData?.openFlat?.();
      this._syncControlInputs();
      this._renderR87FormulaCard();
    });

    dock.querySelector('#r87-btn-fold')?.addEventListener('click', () => {
      const hs = this._ensureHoloState();
      if (!hs) return;
      hs.paused = true;
      hs.phase = EXHIBIT_CYCLE_SECONDS;
      this.activeExhibit?.preview?.userData?.closeSolid?.();
      this._syncControlInputs();
      this._renderR87FormulaCard();
    });

    dock.querySelector('#r87-btn-replay')?.addEventListener('click', () => {
      const hs = this._ensureHoloState();
      if (!hs) return;
      hs.paused = false;
      hs.phase = 0;
      hs._lastTickSeconds = undefined;
      this.activeExhibit?.preview?.userData?.playAgain?.();
      this._syncControlInputs();
      this._renderR87FormulaCard();
    });

    dock.querySelector('#r87-chk-edges')?.addEventListener('change', (e) => {
      this.activeExhibit?.preview?.userData?.setDisplayOptions?.({ showEdges: !!e.target.checked });
    });

    dock.querySelector('#r87-chk-hinges')?.addEventListener('change', (e) => {
      this.activeExhibit?.preview?.userData?.setDisplayOptions?.({ showHinges: !!e.target.checked });
    });

    dock.querySelector('#r87-chk-formulas')?.addEventListener('change', (e) => {
      const card = dock.querySelector('#r87-formula-card');
      if (card) card.hidden = !e.target.checked;
    });

    phaseIn?.addEventListener('input', () => {
      this._renderR87FormulaCard();
    });
  }

  _resolveModeOrFoldNet(modeId) {
    const mode = getModeById(modeId);
    if (mode) return mode;
    const foldDef = getFoldNetDefinition(modeId);
    if (!foldDef) return null;
    const place = getFoldNetPlacement(modeId);
    return {
      id: foldDef.id,
      name: `${foldDef.name} (Gấp/Trải 2D ⇄ 3D)`,
      grade: place?.primaryGrade || foldDef.grades[0] || 11,
      roomId: place?.primaryRoomId || 'G11-R04',
      chapterId: place?.chapterRoomId || place?.primaryRoomId || 'G11-R04',
      chapterGrade: place?.primaryGrade || foldDef.grades[0] || 11,
      labId: `${place?.primaryRoomId || 'G11-R04'}-R87-FOLD`,
      isFoldNetExhibit: true
    };
  }

  _syncR87FoldPanel(mode) {
    if (!this.dock) return;
    const panel = this.dock.querySelector('#r87-holo-fold-panel');
    const select = this.dock.querySelector('#r87-holo-model-select');
    const preview = this.activeExhibit?.preview;
    const foldId = preview?.userData?.foldNetModelId || getFoldNetForModeId(mode?.id);
    if (select) {
      select.value = foldId || '';
    }
    if (!panel) return;
    if (!foldId) {
      panel.hidden = true;
      return;
    }
    panel.hidden = false;
    const slidersHost = this.dock.querySelector('#r87-param-sliders');
    if (slidersHost) {
      slidersHost.replaceChildren();
      const schema = getFoldNetParamSchema(foldId);
      const curParams = preview?.userData?.foldNetGroup?.userData?.foldNetParams || getFoldNetDefinition(foldId)?.defaultParams || {};
      for (const item of schema) {
        const val = curParams[item.key] ?? item.defaultValue;
        const row = document.createElement('label');
        row.style.cssText = 'display:grid;grid-template-columns:1fr auto;gap:2px 8px;font-size:11px;color:#cbd5e1;align-items:center;';
        row.innerHTML = `
          <span>${item.label}</span>
          <output data-out="${item.key}" style="color:#fbbf24;font-weight:700;">${Number(val).toFixed(2)}</output>
          <input type="range" data-param-key="${item.key}" min="${item.min}" max="${item.max}" step="${item.step}" value="${val}" style="grid-column:1 / -1;width:100%;accent-color:#f59e0b;"/>
        `;
        const input = row.querySelector('input');
        const out = row.querySelector('output');
        input?.addEventListener('input', () => {
          const num = Number(input.value);
          if (out) out.textContent = num.toFixed(2);
          preview?.userData?.setParams?.({ [item.key]: num });
          this._renderR87FormulaCard();
        });
        slidersHost.append(row);
      }
    }
    this._renderR87FormulaCard();
  }

  _renderR87FormulaCard() {
    if (!this.dock) return;
    const card = this.dock.querySelector('#r87-formula-card');
    const preview = this.activeExhibit?.preview;
    const foldId = preview?.userData?.foldNetModelId || getFoldNetForModeId(this.activeModeId);
    if (!card || !foldId) return;
    const hs = this._ensureHoloState();
    const progress = hs ? Math.max(0, Math.min(1, (hs.phase || 0) / EXHIBIT_CYCLE_SECONDS)) : 0;
    const curParams = preview?.userData?.foldNetGroup?.userData?.foldNetParams || {};
    const info = computeFoldNetFormulas(foldId, curParams, progress);
    if (!info) return;
    const stepsHtml = info.storyboard
      .map((s, i) => `<div style="${i + 1 === info.stageIndex ? 'color:#fbbf24;font-weight:700;' : 'color:#94a3b8;'}">${i + 1 === info.stageIndex ? '▶' : '•'} Bước ${i + 1}/4: ${s}</div>`)
      .join('');
    const formulasHtml = info.formulas
      .map(f => `<div style="display:flex;justify-content:space-between;gap:8px;border-top:1px dashed rgba(148,163,184,0.2);padding-top:3px;margin-top:3px;">
        <span style="color:#cbd5e1;">${f.label}: <code style="color:#93c5fd;">${f.expr}</code></span>
        <strong style="color:#6ee7b7;white-space:nowrap;">${f.value} ${f.unit}</strong>
      </div>`)
      .join('');
    card.innerHTML = `
      <div style="font-weight:700;color:#fde68a;margin-bottom:4px;">📐 #${String(info.notebookIndex).padStart(2, '0')} · ${info.name} — Tiến độ Gấp: ${info.progressPct}%</div>
      <div style="margin-bottom:5px;font-size:11px;">${stepsHtml}</div>
      <div>${formulasHtml}</div>
    `;
  }

  _ensureHoloState() {
    const p = this.activeExhibit?.preview;
    if (!p) return null;
    if (!p.userData.holoState) {
      p.userData.holoState = {
        paused: true,
        phase: 0,
        speed: 1,
        scale: 1.25,
        explode: 0,
        spinOffset: 0,
        renderMode: 'solid'
      };
    }
    return p.userData.holoState;
  }

  resetHoloState() {
    const p = this.activeExhibit?.preview;
    if (p) {
      p.userData.holoState = {
        paused: true,
        phase: 0,
        speed: 1,
        scale: 1.22,
        explode: 0,
        spinOffset: 0,
        renderMode: 'solid'
      };
    }
    this._syncControlInputs();
  }

  _syncControlInputs() {
    const hs = this._ensureHoloState() || {
      paused: false,
      phase: 0,
      scale: 1.22,
      explode: 0,
      spinOffset: 0,
      renderMode: 'solid'
    };
    const d = this.dock;
    if (!d) return;
    d.querySelector('#r11-holo-play').textContent = hs.paused ? '▶ Phát mô phỏng' : '⏸ Tạm dừng';
    d.querySelector('#r11-in-phase').value = String(hs.phase || 0);
    if(d.querySelector('#r77-holo-speed'))d.querySelector('#r77-holo-speed').value=String(hs.speed||1);
    d.querySelector('#r11-out-phase').textContent = hs.paused ? `${Math.round((hs.phase / EXHIBIT_CYCLE_SECONDS) * 100)}%` : 'Tự động';
    d.querySelector('#r11-in-explode').value = String(hs.explode || 0);
    d.querySelector('#r11-out-explode').textContent = `${Math.round((hs.explode || 0) * 100)}%`;
    const deg = Math.round(((hs.spinOffset || 0) * 180) / Math.PI);
    d.querySelector('#r11-in-spin').value = String(deg);
    d.querySelector('#r11-out-spin').textContent = `${deg}°`;
    d.querySelector('#r11-in-scale').value = String(hs.scale || 1.22);
    d.querySelector('#r11-out-scale').textContent = `${Number(hs.scale || 1.22).toFixed(2)}x`;
    for (const b of d.querySelectorAll('.r11-mat-btn')) {
      b.classList.toggle('is-active', b.dataset.mat === (hs.renderMode || 'solid'));
    }
  }

  openForMode(modeId) {
    const museum = this.getMuseum?.();
    const mode = this._resolveModeOrFoldNet(modeId);
    if (!museum || !mode) {
      this.onNotify?.(`Không tìm thấy bục 3D cho mô hình ${modeId}`, true);
      return false;
    }

    // Khôi phục bục cũ về kích thước chuẩn trước khi chuyển sang bục mới
    this._clearPreviousPedestalEffect();

    const currentRoomId = museum.getActiveThematicRoom?.();
    const targetRoomId = (currentRoomId && (currentRoomId === mode.roomId || currentRoomId === mode.chapterId))
      ? currentRoomId
      : (mode.roomId || mode.chapterId);
    const targetGrade = mode.chapterGrade || mode.grade;
    if (museum.getGrade?.() !== targetGrade) {
      museum.toGrade?.(targetGrade);
    }
    if (museum.getActiveThematicRoom?.() !== targetRoomId) {
      museum.enterThematicRoom?.(targetRoomId);
    }

    const ex = museum.focusPedestal3D?.(mode.id);
    if (!ex) {
      this.onNotify?.(`Đang vào phòng ${targetRoomId}...`, false);
      return false;
    }

    this.activeModeId = mode.id;
    this.activeExhibit = ex;
    ex.preview?.userData?.onViewEnter?.();
    this.resetHoloState();
    const hsAuto = this._ensureHoloState();
    if (hsAuto) {
      hsAuto.paused = false;
      hsAuto.phase = 0;
      this._syncControlInputs();
    }
    this._syncR87FoldPanel(mode);

    const allEx = museum.getRoomExhibits?.() || [];
    const idx = allEx.findIndex(x => x.mode.id === mode.id);
    const cm = getCurriculumModelById(mode.id);

    this.dock.querySelector('#r11-holo-pos').textContent =
      idx >= 0 ? `Bục ${idx + 1} / ${allEx.length}` : `Bục 3D`;
    this.dock.querySelector('#r11-holo-meta').textContent = cm
      ? `#${String(cm.num).padStart(3, '0')} · LỚP ${cm.targetGrade} (Tập ${cm.volume}) · Chương ${cm.chapterNum} · Bài ${cm.lessonNum}`
      : `LỚP ${mode.grade} · ${mode.roomId} · ${mode.id}`;
    this.dock.querySelector('#r11-holo-title').textContent = mode.name;
    const steps=modelMotionPlan(mode).steps;
    this.dock.querySelector('#r11-learning-step').textContent=`1/3: ${steps[0]}`;

    const discHost = this.dock.querySelector('#r11-holo-discovery');
    if (discHost) {
      discHost.replaceChildren();
      mountGuidedDiscoveryCard(discHost, {
        modeId: mode.id,
        mode,
        compact: true,
        onDemonstrate: () => {
          const hs = this._ensureHoloState();
          if (hs) {
            hs.paused = false;
            hs.explode = 0.35;
            hs.scale = 1.4;
            this._syncControlInputs();
          }
        }
      });
      // Lắng nghe kéo thanh trượt 3D để cập nhật tiến độ khám phá
      this.dock.querySelector('.r11-holo-controls')?.addEventListener('input', () => {
        discHost.dispatchEvent(new Event('input', { bubbles: true }));
      }, { once: false });
    }

    this.dock.hidden = false;
    return true;
  }

  stepPedestal(delta) {
    const museum = this.getMuseum?.();
    const allEx = museum?.getRoomExhibits?.() || [];
    if (!allEx.length) return;
    const curIdx = allEx.findIndex(x => x.mode.id === this.activeModeId);
    const nextIdx = (curIdx + delta + allEx.length) % allEx.length;
    const nextMode = allEx[nextIdx]?.mode;
    if (nextMode) {
      this.openForMode(nextMode.id);
    }
  }

  _clearPreviousPedestalEffect() {
    const p = this.activeExhibit?.preview;
    if (p && p.userData.holoState) {
      p.userData.holoState = {
        paused: true,
        phase: 0,
        speed: 1,
        scale: 1,
        explode: 0,
        spinOffset: 0,
        renderMode: 'solid'
      };
    }
  }

  close() {
    this._clearPreviousPedestalEffect();
    this.activeModeId = null;
    this.activeExhibit = null;
    if (this.dock) this.dock.hidden = true;
  }
}

