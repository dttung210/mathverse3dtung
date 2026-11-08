/**
 * MATHVERSE R11 — CHẾ ĐỘ STUDIO BÀI HỌC TỨC THỜI (LESSON-FIRST BENTO LAUNCHPAD)
 * Cho phép Giáo viên & Học sinh truy cập bất kỳ mô hình nào trong 310 mô hình (Lớp 6–12)
 * chỉ bằng 1 cú nhấp chuột (< 1 giây) theo đúng cấu trúc SGK:
 *   Khối Lớp (6–12) -> Tập (1, 2) -> Chương -> Bài học -> Mô hình
 * Hoặc chuyển mượt sang Không gian Bảo tàng 3D / Bục 3D Holo-Stage bất kỳ lúc nào.
 */
import {
  CURRICULUM_CHAPTERS_MANIFEST,
  getChaptersForGrade,
  getAllCurriculumModels
} from './curriculum-manifest.mjs';
import { getGuidedDiscoveryPlan } from './guided-discovery.mjs';
import { isDuplicateMergedModeId, getMergedSecondaryIds } from './dedup-modes.mjs';

const MODALITY_LABELS = {
  solid: { label: 'Khối 3D', cls: 'mod-3d' },
  '3d': { label: 'Khối 3D', cls: 'mod-3d' },
  real: { label: 'Thực tế 3D', cls: 'mod-3d' },
  plane: { label: 'Hình phẳng', cls: 'mod-plane' },
  composition: { label: 'Cắt ghép hình', cls: 'mod-plane' },
  symmetry: { label: 'Đối xứng', cls: 'mod-plane' },
  grid: { label: 'Lưới ô vuông', cls: 'mod-plane' },
  measure: { label: 'Đo độ dài', cls: 'mod-plane' },
  angle: { label: 'Góc & Tia', cls: 'mod-plane' },
  graph: { label: 'Đồ thị động', cls: 'mod-graph' },
  number: { label: 'Trục số & Đại số', cls: 'mod-number' },
  venn: { label: 'Tập hợp Venn', cls: 'mod-number' },
  stat: { label: 'Thống kê', cls: 'mod-stat' },
  stats: { label: 'Thống kê', cls: 'mod-stat' },
  prob: { label: 'Xác suất', cls: 'mod-prob' },
  probability: { label: 'Xác suất', cls: 'mod-prob' }
};

function inferModalityBadge(model) {
  const raw = String(model.modality || '').toLowerCase();
  if (MODALITY_LABELS[raw]) return MODALITY_LABELS[raw];
  const id = String(model.id || '');
  if (/^(7-08|7-09|8-09|9-09|9-10|9-11|11-05|11-06|11-07|11-08|11-09|12-04|12-07|12-08|12-09|12-10)/.test(id)) {
    return { label: 'Không gian 3D', cls: 'mod-3d' };
  }
  if (/^(8-07|9-08|10-06|11-01|11-02|11-10|11-11|11-12|12-01|12-02|12-03|12-06)/.test(id)) {
    return { label: 'Đồ thị & Giải tích', cls: 'mod-graph' };
  }
  if (/^(7-06|7-07|7-10|8-08|9-12|9-13|10-10|10-11|11-04|11-13|12-05|12-11)/.test(id)) {
    return { label: 'Thống kê & Xác suất', cls: 'mod-stat' };
  }
  return { label: 'Hình học & Đại số', cls: 'mod-plane' };
}

export class StudioLaunchpad {
  constructor({ onOpenLabMode, onOpenHoloStage, onEnter3DMuseum, onEnter3DChapter } = {}) {
    this.onOpenLabMode = onOpenLabMode;
    this.onOpenHoloStage = onOpenHoloStage;
    this.onEnter3DMuseum = onEnter3DMuseum;
    this.onEnter3DChapter = onEnter3DChapter;
    this.selectedGrade = 8;
    this.selectedVolume = 0; // 0 = Tất cả, 1 = Tập 1, 2 = Tập 2
    this.selectedChapterId = 'ALL';
    this.searchQuery = '';
    this.root = null;
    this._build();
  }

  _build() {
    const root = document.createElement('section');
    root.id = 'r11-studio-launchpad';
    root.className = 'r11-launchpad';
    root.hidden = true;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Studio Bài Học Toán 6–12 Mở Nhanh 1 Chạm');

    root.innerHTML = `
      <div class="r11-lp-shell">
        <header class="r11-lp-header">
          <div class="r11-lp-brand">
            <span class="r11-lp-logo">✳</span>
            <div>
              <div class="r11-lp-eyebrow">KIẾN TRÚC KÉP MATHVERSE R11 · CHUẨN GDPT 2018</div>
              <h1>Bản Đồ Chương Trình Toán 6–12 · Mở Nhanh 1 Chạm</h1>
            </div>
          </div>
          <div class="r11-lp-mode-switch" role="group" aria-label="Chuyển đổi chế độ ứng dụng">
            <button type="button" class="r11-mode-pill is-active" id="r11-mode-studio">
              ⚡ Studio Bài Học SGK (1 Chạm)
            </button>
            <button type="button" class="r11-mode-pill" id="r11-mode-3d">
              🏛️ Bước Vào Bảo Tàng 3D
            </button>
          </div>
          <button type="button" class="r11-lp-close" id="r11-lp-close" title="Đóng bảng Studio để về không gian 3D (Esc)">✕ Đóng</button>
        </header>

        <div class="r11-lp-controls">
          <div class="r11-lp-grades" id="r11-lp-grades" role="tablist" aria-label="Chọn khối lớp"></div>
          <div class="r11-lp-subbar">
            <div class="r11-lp-volumes" id="r11-lp-volumes" role="group" aria-label="Chọn tập sách">
              <button type="button" class="r11-vol-btn is-active" data-vol="0">Tất cả Tập 1 & 2</button>
              <button type="button" class="r11-vol-btn" data-vol="1">📘 Tập 1</button>
              <button type="button" class="r11-vol-btn" data-vol="2">📙 Tập 2</button>
            </div>
            <div class="r11-lp-search-wrap">
              <input type="search" id="r11-lp-search" class="r11-lp-search" placeholder="🔍 Tìm nhanh bài học, định lý, mô hình (VD: hình thoi, Thales, Pythagore, đạo hàm, Oxyz...)" aria-label="Tìm nhanh mô hình"/>
            </div>
            <div class="r11-lp-stats" id="r11-lp-stats">310 mô hình</div>
          </div>
          <div class="r11-lp-chapters" id="r11-lp-chapters" aria-label="Chọn chương học"></div>
        </div>

        <main class="r11-lp-content" id="r11-lp-content"></main>
      </div>
    `;

    document.body.append(root);
    this.root = root;

    root.querySelector('#r11-lp-close')?.addEventListener('click', () => this.close());
    root.querySelector('#r11-mode-3d')?.addEventListener('click', () => {
      const targetGrade = this.selectedGrade || 8;
      this.close();
      this.onEnter3DMuseum?.(targetGrade);
    });

    const searchInput = root.querySelector('#r11-lp-search');
    searchInput?.addEventListener('input', () => {
      this.searchQuery = searchInput.value.trim().toLocaleLowerCase('vi');
      this.renderContent();
    });

    for (const btn of root.querySelectorAll('.r11-vol-btn')) {
      btn.addEventListener('click', () => {
        this.selectedVolume = Number(btn.dataset.vol) || 0;
        for (const b of root.querySelectorAll('.r11-vol-btn')) {
          b.classList.toggle('is-active', b === btn);
        }
        this.selectedChapterId = 'ALL';
        this.renderChapters();
        this.renderContent();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.root.hidden) {
        this.close();
      }
    });
  }

  open(grade = null) {
    if (grade && [6, 7, 8, 9, 10, 11, 12].includes(Number(grade))) {
      this.selectedGrade = Number(grade);
    }
    this.root.hidden = false;
    document.body.classList.add('r11-launchpad-open');
    this.renderGrades();
    this.renderChapters();
    this.renderContent();
  }

  close() {
    if (!this.root) return;
    this.root.hidden = true;
    document.body.classList.remove('r11-launchpad-open');
  }

  toggle(grade = null) {
    if (this.root.hidden) this.open(grade);
    else this.close();
  }

  renderGrades() {
    const wrap = this.root.querySelector('#r11-lp-grades');
    if (!wrap) return;
    wrap.replaceChildren();

    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'r11-grade-tab' + (this.selectedGrade === 0 ? ' is-active' : '');
    allBtn.innerHTML = `<strong>TẤT CẢ 6–12</strong><small>58 Chương · 310 Mô hình</small>`;
    allBtn.addEventListener('click', () => {
      this.selectedGrade = 0;
      this.selectedChapterId = 'ALL';
      this.renderGrades();
      this.renderChapters();
      this.renderContent();
    });
    wrap.append(allBtn);

    for (const g of CURRICULUM_CHAPTERS_MANIFEST.grades) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'r11-grade-tab' + (this.selectedGrade === g.grade ? ' is-active' : '');
      btn.style.setProperty('--g-accent', g.accentHex);
      btn.innerHTML = `<strong>TOÁN LỚP ${g.grade}</strong><small>${g.chapters.length} Chương · ${g.totalModels} Mô hình</small>`;
      btn.addEventListener('click', () => {
        this.selectedGrade = g.grade;
        this.selectedChapterId = 'ALL';
        this.renderGrades();
        this.renderChapters();
        this.renderContent();
      });
      wrap.append(btn);
    }
  }

  renderChapters() {
    const wrap = this.root.querySelector('#r11-lp-chapters');
    if (!wrap) return;
    wrap.replaceChildren();

    if (this.selectedGrade === 0) {
      const info = document.createElement('div');
      info.className = 'r11-chap-hint';
      info.textContent = 'Đang hiển thị toàn bộ 7 khối lớp (Toán 6 → Toán 12). Chọn một khối lớp phía trên để lọc theo từng Chương.';
      wrap.append(info);
      return;
    }

    const chapters = getChaptersForGrade(this.selectedGrade).filter(
      ch => !this.selectedVolume || ch.volume === this.selectedVolume
    );

    const allChip = document.createElement('button');
    allChip.type = 'button';
    allChip.className = 'r11-chap-chip' + (this.selectedChapterId === 'ALL' ? ' is-active' : '');
    allChip.textContent = `Tất cả Chương Lớp ${this.selectedGrade} (${chapters.length})`;
    allChip.addEventListener('click', () => {
      this.selectedChapterId = 'ALL';
      this.renderChapters();
      this.renderContent();
    });
    wrap.append(allChip);

    for (const ch of chapters) {
      const modelCount = ch.lessons.reduce((s, l) => s + l.models.filter(m => !isDuplicateMergedModeId(m.id) || l.models.length === 1).length, 0);
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'r11-chap-chip' + (this.selectedChapterId === ch.id ? ' is-active' : '');
      chip.innerHTML = `<span>Chương ${ch.number}: ${ch.title}</span> <em>${modelCount}</em>`;
      chip.addEventListener('click', () => {
        this.selectedChapterId = ch.id;
        this.renderChapters();
        this.renderContent();
      });
      wrap.append(chip);
    }
  }

  renderContent() {
    const content = this.root.querySelector('#r11-lp-content');
    const statsEl = this.root.querySelector('#r11-lp-stats');
    if (!content) return;
    content.replaceChildren();

    const q = this.searchQuery;
    const gradesToShow = this.selectedGrade === 0
      ? CURRICULUM_CHAPTERS_MANIFEST.grades
      : CURRICULUM_CHAPTERS_MANIFEST.grades.filter(g => g.grade === this.selectedGrade);

    let totalShownModels = 0;
    let totalShownChapters = 0;

    // R11.2: Sơ đồ Phòng Học 2D Trực Quan (2D Architectural Classroom & Chapter Gate Blueprint)
    if (this.selectedGrade >= 6 && !q) {
      const gInfo = gradesToShow[0];
      if (gInfo) {
        const room2D = document.createElement('section');
        room2D.className = 'r11-2d-room-blueprint';
        const visibleChaps = gInfo.chapters.filter(ch => !this.selectedVolume || ch.volume === this.selectedVolume);
        room2D.innerHTML = `
          <div class="r11-2d-room-head">
            <div>
              <span class="r11-2d-room-badge">🗺️ PHÒNG HỌC 2D TRỰC QUAN · TOÁN LỚP ${gInfo.grade}</span>
              <h2>Sơ Đồ Cổng Chương SGK & Không Gian Lớp Học 2D/3D</h2>
            </div>
            <button type="button" class="r11-2d-enter-room-btn" data-enter-grade="${gInfo.grade}">
              🏛️ Bước Vào Phòng Lớp ${gInfo.grade} (3D)
            </button>
          </div>
          <div class="r11-2d-portal-arc"></div>
        `;
        room2D.querySelector('[data-enter-grade]')?.addEventListener('click', () => {
          this.close();
          this.onEnter3DMuseum?.(gInfo.grade);
        });
        const arcEl = room2D.querySelector('.r11-2d-portal-arc');
        for (const ch of visibleChaps) {
          const mCount = ch.lessons.reduce((s, l) => s + l.models.filter(m => !isDuplicateMergedModeId(m.id) || l.models.length === 1).length, 0);
          const isCurrent = this.selectedChapterId === ch.id;
          const gateCard = document.createElement('div');
          gateCard.className = 'r11-2d-gate-card' + (isCurrent ? ' is-selected' : '');
          gateCard.style.setProperty('--gate-accent', ch.accent || gInfo.accentHex || '#14b8a6');
          gateCard.innerHTML = `
            <div class="r11-2d-gate-arch">
              <span class="r11-2d-gate-pill">CHƯƠNG ${ch.number} · TẬP ${ch.volume}</span>
              <span class="r11-2d-gate-stat">${ch.lessons.length} Bài · ${mCount} Mô hình</span>
            </div>
            <strong class="r11-2d-gate-title">${ch.title}</strong>
            <div class="r11-2d-gate-btns">
              <button type="button" class="r11-2d-gate-filter" data-filter-chap="${ch.id}">
                📐 Lọc Chương Này (2D)
              </button>
              <button type="button" class="r11-2d-gate-warp" data-warp-chap="${ch.id}">
                🚪 Vào Cổng 3D
              </button>
            </div>
          `;
          gateCard.querySelector('[data-filter-chap]')?.addEventListener('click', () => {
            this.selectedChapterId = this.selectedChapterId === ch.id ? 'ALL' : ch.id;
            this.renderChapters();
            this.renderContent();
          });
          gateCard.querySelector('[data-warp-chap]')?.addEventListener('click', () => {
            this.close();
            if (this.onEnter3DChapter) this.onEnter3DChapter(gInfo.grade, ch.id);
            else this.onEnter3DMuseum?.(gInfo.grade);
          });
          arcEl.append(gateCard);
        }
        content.append(room2D);
      }
    }

    for (const g of gradesToShow) {
      for (const ch of g.chapters) {
        if (this.selectedVolume && ch.volume !== this.selectedVolume) continue;
        if (this.selectedChapterId !== 'ALL' && ch.id !== this.selectedChapterId) continue;

        const matchingLessons = [];
        for (const les of ch.lessons) {
          const uniqueLessonModels = les.models.filter(m => !isDuplicateMergedModeId(m.id) || les.models.length === 1);
          const models = uniqueLessonModels.filter(m => {
            if (!q) return true;
            const mergedIds = getMergedSecondaryIds(m.id).join(' ');
            const hay = `${m.num} ${m.id} ${mergedIds} ${m.name} bài ${les.lesson} ${les.title} chương ${ch.number} ${ch.title} lớp ${g.grade}`.toLocaleLowerCase('vi');
            return hay.includes(q);
          });
          if (models.length > 0) {
            matchingLessons.push({ lesson: les, models });
            totalShownModels += models.length;
          }
        }

        if (matchingLessons.length === 0) continue;
        totalShownChapters++;

        const chapSection = document.createElement('section');
        chapSection.className = 'r11-chap-section';
        const chapModelCount = matchingLessons.reduce((s, x) => s + x.models.length, 0);

        const chapHeader = document.createElement('div');
        chapHeader.className = 'r11-chap-header';
        chapHeader.innerHTML = `
          <div class="r11-chap-title-group">
            <span class="r11-chap-pill">LỚP ${g.grade} · TẬP ${ch.volume} · CHƯƠNG ${ch.number}</span>
            <h2>${ch.title}</h2>
          </div>
          <span class="r11-chap-count">${matchingLessons.length} Bài · ${chapModelCount} Mô hình</span>
        `;
        chapSection.append(chapHeader);

        const bentoGrid = document.createElement('div');
        bentoGrid.className = 'r11-bento-grid';

        for (const { lesson, models } of matchingLessons) {
          for (const m of models) {
            const plan = getGuidedDiscoveryPlan(m.id);
            const modBadge = inferModalityBadge(m);
            const card = document.createElement('article');
            card.className = 'r11-model-card';

            card.innerHTML = `
              <div class="r11-card-top">
                <span class="r11-card-num">#${String(m.num).padStart(3, '0')}</span>
                <span class="r11-card-lesson">Bài ${lesson.lesson}: ${lesson.title}</span>
                <span class="r11-card-mod ${modBadge.cls}">${modBadge.label}</span>
              </div>
              <h3 class="r11-card-title">${m.name}</h3>
              <p class="r11-card-desc"><strong>🎯 Khám phá:</strong> ${plan.step1}</p>
              <div class="r11-card-actions">
                <button type="button" class="r11-btn-instant" data-action="lab">
                  ⚡ Mở Lab Tương Tác
                </button>
                <button type="button" class="r11-btn-holo" data-action="holo" title="Dịch chuyển đến bục 3D của mô hình này trong Bảo tàng và bật Holo-Stage">
                  🔮 Bục 3D Holo
                </button>
              </div>
            `;

            card.querySelector('[data-action="lab"]')?.addEventListener('click', () => {
              this.close();
              this.onOpenLabMode?.(m.id);
            });
            card.querySelector('[data-action="holo"]')?.addEventListener('click', () => {
              this.close();
              this.onOpenHoloStage?.(m.id);
            });

            bentoGrid.append(card);
          }
        }

        chapSection.append(bentoGrid);
        content.append(chapSection);
      }
    }

    if (statsEl) {
      statsEl.textContent = `${totalShownChapters} Chương · ${totalShownModels} Mô hình`;
    }

    if (totalShownModels === 0) {
      const empty = document.createElement('div');
      empty.className = 'r11-lp-empty';
      empty.innerHTML = `
        <strong>Không tìm thấy mô hình nào khớp với từ khóa “${this.searchQuery}”.</strong>
        <p>Hãy thử tìm với từ khóa khác hoặc chọn “TẤT CẢ 6–12” để tìm trên toàn bộ 310 mô hình.</p>
      `;
      content.append(empty);
    }
  }
}

