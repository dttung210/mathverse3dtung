/**
 * MATHVERSE V5 - LabShell (Phòng Thí Nghiệm Toán Học Cấp 2)
 * Điều phối toàn bộ giao diện chuyên nghiệp 3 cột:
 * - Header: Breadcrumb, tiêu đề, nút "Quay lại phòng", Toàn màn hình, Máy chiếu
 * - Cột trái: Thư viện mô hình chỉ thuộc lớp hiện tại, bộ lọc 4 chế độ
 * - Vùng giữa: Sân khấu hiển thị lớn, công cụ Đặt lại, Lưu ảnh PNG, So sánh A/B, Liên kết 3D-2D
 * - Cột phải: Inspector điều khiển tham số, công thức KaTeX, sao chép LaTeX
 * - Dải dưới: Thẻ thông số kết quả toán học thời gian thực
 */

import { ViewerRegistry } from '../viewers/ViewerRegistry.js?v=r107_v15';
import { formatMathHtml, TYPES } from '../math-core.js?v=r107_v15';
import { detectModality } from '../data/migrate-v2-v4-v5.js?v=r107_v15';
import { Section2DViewer } from '../viewers/Section2DViewer.js?v=r107_v15';
import { buildPresets, loadFavorites, saveFavorites } from '../studio/presets.js?v=r107_v15';
import { WorkspaceComposer } from '../studio/WorkspaceComposer.js?v=r107_v15';
import { V } from '../studio/workspace-labels.js?v=r107_v15';
import {Grade6Lab} from '../curriculum/Grade6Lab.js?v=r107_v15';
import {TOAN6_LAB_MODELS,ALL_MATH6_LABS,LAB_TO_EXHIBIT,labsForExhibit,labById} from '../math6-lab/catalog.js?v=r107_v15';
import {isGrade6ActiveLab,GRADE6_CURATED_TOTAL} from '../portal-labs/grade6-curation-v15-1.js?v=r107_v15';
import {previewMarkup,groupLabels} from '../math6-lab/previews.js?v=r107_v15';
import {SpecialtyLab} from '../portal-labs/SpecialtyLab.js?v=r107_v15';
import {PORTAL_ZONES,portalExhibits,gradePortalLabs,zoneById,zoneForModel} from '../portal-labs/portal-registry.js?v=r107_v15';
import {getRoomById,getLabById} from '../museum/r6-room-layout.js?v=r107_v15';

export class LabShell {
  constructor({ onBackToMuseum, onSaveModel, getLibraryItems, getIsTeacher=()=>false, onOpenGrade6Warehouse=()=>{} }) {
    this.onBackToMuseum = onBackToMuseum;
    this.onOpenGrade6Warehouse=onOpenGrade6Warehouse;
    this.onSaveModel = onSaveModel;
    this.getIsTeacher = getIsTeacher;
    this.getLibraryItems = getLibraryItems;

    this.activeModel = null;
    this.activeViewer = null;
    this.workspaceEditor = null;
    this.specialtyLab=null;
    this.portalZone=null;
    this.math6Lab=null; // embedded inside an original grade-6 exhibit; never replaces the exhibit catalogue
    this.activeFilter = 'all'; // 'all' | 'solid3d' | 'geometry2d' | 'functiongraph' | 'statisticschart'
    this.searchQuery = '';
    this.isSplitCompare = false;
    this.compareViewer = null;
    this.sectionViewer = null;
    this.isLinkedSection = false;
    this.isProjectorMode = false;
    this.libraryMode='presets';
    this.labGroupFilter='all';
    this.curatedPresets=[];
    this.favorites=loadFavorites();
    this.toolMode='edit';
    this.geometryHistory=[];
    this.geometryHistoryIndex=-1;
    this.themeDark=false;
    this.roomContext={roomId:null,labId:null};


    this.dom = {};
    this._buildDom();
    this._bindEvents();
  }

  _buildDom() {
    let overlay = document.getElementById('labshell-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'labshell-overlay';
      overlay.className = 'labshell-overlay';
      overlay.hidden = true;
      document.body.appendChild(overlay);
    }
    this.overlay = overlay;

    overlay.innerHTML = `
      <div class="labshell-app" id="labshell-app">
        <!-- HEADER -->
        <header class="labshell-header">
          <div class="labshell-header-left">
            <button class="lab-btn lab-btn-back" id="lab-btn-back" title="Quay lại thế giới bảo tàng 3D">
              ← Quay lại phòng
            </button>
            <div class="lab-breadcrumb" id="lab-breadcrumb">
              <span id="lab-crumb-museum">Bảo tàng</span>
              <span class="sep">/</span>
              <span id="lab-crumb-grade">Lớp 8</span>
              <span class="sep">/</span>
              <span id="lab-crumb-modality">3D Không gian</span>
              <span class="sep">/</span>
              <strong id="lab-crumb-title">Hình chóp tứ giác đều</strong>
            </div>
          </div>
          <div class="labshell-header-right">
            <span class="lab-badge" id="lab-badge-grade">LỚP 8</span>
            <button class="lab-btn" id="lab-btn-theme" title="Đổi giao diện sáng hoặc tối">◐ Sáng / Tối</button>
            <button class="lab-btn" id="lab-btn-projector" title="Chế độ chiếu bảng lớp học (tương phản cao, chữ lớn)">📽 Máy chiếu</button>
            <button class="lab-btn" id="lab-btn-fullscreen" title="Bật / tắt toàn màn hình">⛶ Toàn màn hình</button>
          </div>
        </header>

        <!-- 3-COLUMN WORKSPACE -->
        <div class="labshell-workspace" id="lab-workspace">
          <!-- CỘT TRÁI: THƯ VIỆN LỚP & BỘ LỌC -->
          <aside class="labshell-sidebar" id="labshell-sidebar">
            <div class="sidebar-header">
              <span class="sidebar-title" id="lab-sidebar-title">MÔ HÌNH LỚP 8</span>
              <button class="sidebar-toggle-btn" id="lab-sidebar-toggle" title="Thu gọn danh mục">‹</button>
            </div>
            <div class="library-modes" role="group" aria-label="Nguồn mô hình">
              <button class="library-mode active" data-library-mode="presets">Kho dựng sẵn</button>
              <button class="library-mode" data-library-mode="room">Trong phòng</button>
              <button class="library-mode math6-library-option" data-library-mode="math6" hidden>🔬 MathLab 6 (60)</button>
              <button class="library-mode" data-library-mode="mine">Của tôi</button>
              <button class="library-mode" data-library-mode="favorites">Yêu thích</button>
            </div>
            <div class="library-count" id="lab-library-count">Kho mô hình tham số · kéo vào vùng làm việc</div>
            <div class="filter-tabs">
              <button class="filter-tab active" data-filter="all">Tất cả</button>
              <button class="filter-tab" data-filter="solid3d">3D</button>
              <button class="filter-tab" data-filter="geometry2d">2D</button>
              <button class="filter-tab" data-filter="functiongraph">Đồ thị</button>
              <button class="filter-tab" data-filter="statisticschart">Thống kê</button>
            </div>
            <div class="mv13-library-categories" id="lab-math6-categories" hidden aria-label="Nhóm mô hình Toán 6"></div>
            <div class="sidebar-search-box">
              <input type="text" id="lab-search-input" placeholder="Tìm kiếm mô hình..." />
            </div>
            <div class="sidebar-model-list" id="lab-model-list"></div>
            <div class="library-footer-hint">↗ Giữ và kéo thẻ hình vào khung giữa, hoặc nhấp để mở.</div>
          </aside>

          <!-- VÙNG GIỮA: SÂN KHẤU MÔ HÌNH -->
          <div class="lab-resizer left" id="lab-resize-left" role="separator" aria-orientation="vertical" aria-label="Thay đổi độ rộng kho hình" tabindex="0"></div>
          <main class="labshell-stage-wrap">
            <nav class="mv13-mode-nav" id="lab-unified-mode" aria-label="Không gian làm việc thống nhất">
              <span class="mv13-mode-heading">KHÔNG GIAN</span>
              <button type="button" class="mv13-mode-option active" data-unified-mode="model" aria-pressed="true">◇ Mô hình gốc</button>
              <button type="button" class="mv13-mode-option" data-unified-mode="math6">✦ Thí nghiệm SGK</button>
              <button type="button" class="mv13-mode-option" data-unified-mode="2d">△ Xưởng 2D</button>
              <button type="button" class="mv13-mode-option" data-unified-mode="3d">⬡ Xưởng 3D</button>
              <span class="mv13-mode-hint">Kéo thả · Dựng hình · Chuyển động</span>
            </nav>
            <div class="stage-subhead">
              <div>
                <span class="stage-eyebrow" id="lab-stage-eyebrow">HÌNH HỌC KHÔNG GIAN 3D</span>
                <h1 class="stage-main-title" id="lab-stage-title">Hình chóp tứ giác đều</h1>
              </div>
              <div class="stage-tools-top">
                <button class="lab-tool-btn math6-launch" id="lab-btn-math6" title="Thí nghiệm MathLab 6 ngay tại bục mô hình này" hidden>🔬 Thí nghiệm Toán 6</button>
                <button class="lab-tool-btn mv11-compose-switch" id="lab-btn-compose" title="Vung dung hinh nhieu doi tuong 2D/3D">&#x25a3; X&#x1AF;&#x1EDE;NG D&#x1EF0;NG H&#xCC;NH</button>
                <button class="lab-tool-btn" id="lab-btn-tool-edit" title="Keo diem dieu khien">&#x2725; S&#x1EED;a h&#xEC;nh</button>
                <button class="lab-tool-btn" id="lab-btn-tool-orbit" title="Di chuyen goc nhin">&#x27f3; Xoay khung</button>
                <button class="lab-tool-btn" id="lab-btn-frame" title="Can giua hinh">&#x229e; C&#x103;n gi&#x1EEF;a</button>
                <button class="lab-tool-btn" id="lab-btn-undo" title="Hoan tac">&#x21b6;</button>
                <button class="lab-tool-btn" id="lab-btn-redo" title="Lam lai">&#x21b7;</button>
                <details class="mv11-toolbar-more" id="lab-toolbar-more">
                  <summary title="Cac thao tac khac">&#x22ef; C&#xF4;ng c&#x1EE5;</summary>
                  <div class="mv11-toolbar-menu">
                    <button class="lab-tool-btn" id="lab-btn-compare" title="So sanh A/B">So sanh A/B</button>
                    <button class="lab-tool-btn" id="lab-btn-linked" title="Xem thiet dien" hidden>3D &amp; Thiet dien</button>
                    <button class="lab-tool-btn" id="lab-btn-reset">Dat lai</button>
                    <button class="lab-tool-btn" id="lab-btn-export-png">Luu anh PNG</button>
                    <button class="lab-tool-btn" id="lab-btn-save" hidden>Luu thay doi</button>
                    <button class="lab-tool-btn primary" id="lab-btn-save-as" hidden>Luu thanh hinh moi</button>
                    <button class="lab-tool-btn" id="lab-btn-toggle-inspector" title="An/hien bang thuoc tinh">Thu bang</button>
                  </div>
                </details>
              </div>
            </div>

            <!-- VIEWPORT CONTAINER -->
            <div class="stage-viewport-outer">
              <div class="stage-viewport" id="lab-viewport-main"></div>
              <div class="v10-viewport-badge" id="lab-canvas-badge" aria-live="polite">2D / 3D • Kéo tay nắm để chỉnh</div>
              <div class="stage-viewport split-right" id="lab-viewport-compare" hidden></div>
              <div class="stage-drop-target" id="lab-stage-drop" hidden><span>⬇</span><b>Thả mô hình tại đây</b><small>Hình sẽ mở ở trung tâm để cô chỉnh sửa</small></div>
            </div>

            <!-- DẢI THẺ KẾT QUẢ DƯỚI CÙNG -->
            <div class="stage-metrics-strip" id="lab-metrics-strip"></div>
            <div class="stage-status" id="lab-stage-status">Kéo hình từ kho bên trái vào đây. Chỉnh điểm bằng chuột hoặc thay số liệu ở bảng bên phải.</div>
          </main>

          <!-- CỘT PHẢI: BẢNG ĐIỀU KHIỂN INSPECTOR -->
          <div class="lab-resizer right" id="lab-resize-right" role="separator" aria-orientation="vertical" aria-label="Thay đổi độ rộng bảng thông số" tabindex="0"></div>
          <aside class="labshell-inspector" id="lab-inspector" data-tab="controls">
            <div class="inspector-header">
              <h2>⚙ Bảng thông số</h2>
              <span class="inspector-modality-tag" id="lab-ins-tag">3D SOLID</span>
            </div>
            <nav class="inspector-tab-bar" aria-label="Chuyen bang thong tin">
              <button class="active" type="button" data-ins-tab="controls">Thu&#x1ED9;c t&#xED;nh</button>
              <button type="button" data-ins-tab="formula">C&#xF4;ng th&#x1EE9;c</button>
              <button type="button" data-ins-tab="info">Th&#xF4;ng tin</button>
            </nav>
            <p class="inspector-desc" id="lab-ins-desc"></p>

            <!-- KHUNG ĐIỀU KHIỂN ĐẶC THÙ -->
            <div class="inspector-controls" id="lab-ins-controls"></div>

            <!-- KHUNG CÔNG THỨC TOÁN HỌC & LATEX -->
            <div class="inspector-formula-box">
              <div class="formula-label">CÔNG THỨC TOÁN HỌC</div>
              <div class="formula-render" id="lab-formula-render"></div>
              <button class="copy-latex-btn" id="lab-btn-copy-latex">📋 Sao chép LaTeX (dán vào Word)</button>
            </div>

            <!-- THÔNG TIN BÀI HỌC SGK -->
            <div class="inspector-curriculum">
              <div class="curr-label">THÔNG TIN CHƯƠNG TRÌNH</div>
              <div class="curr-row"><span>Chương:</span> <b id="lab-curr-chapter">—</b></div>
              <div class="curr-row"><span>Chủ đề:</span> <b id="lab-curr-topic">—</b></div>
              <div class="curr-row"><span>Nguồn:</span> <small id="lab-curr-source">—</small></div>
            </div>
          </aside>
        </div>
      </div>
    `;

    // Cache elements
    this.dom = {
      app: document.getElementById('labshell-app'),
      btnBack: document.getElementById('lab-btn-back'),
      btnProjector: document.getElementById('lab-btn-projector'),
      btnFullscreen: document.getElementById('lab-btn-fullscreen'),
      btnTheme: document.getElementById('lab-btn-theme'),
      btnFrame: document.getElementById('lab-btn-frame'),
      canvasBadge: document.getElementById('lab-canvas-badge'),
      workspace: document.getElementById('lab-workspace'),
      crumbGrade: document.getElementById('lab-crumb-grade'),
      crumbModality: document.getElementById('lab-crumb-modality'),
      crumbTitle: document.getElementById('lab-crumb-title'),
      badgeGrade: document.getElementById('lab-badge-grade'),
      sidebarTitle: document.getElementById('lab-sidebar-title'),
      sidebarToggle: document.getElementById('lab-sidebar-toggle'),
      sidebar: document.getElementById('labshell-sidebar'),
      searchInput: document.getElementById('lab-search-input'),
      modelList: document.getElementById('lab-model-list'),
      libraryCount: document.getElementById('lab-library-count'),
      stageDrop: document.getElementById('lab-stage-drop'),
      stageStatus: document.getElementById('lab-stage-status'),
      stageEyebrow: document.getElementById('lab-stage-eyebrow'),
      stageTitle: document.getElementById('lab-stage-title'),
      btnToolEdit: document.getElementById('lab-btn-tool-edit'),
      btnCompose: document.getElementById('lab-btn-compose'),
      btnMath6: document.getElementById('lab-btn-math6'),
      unifiedMode: document.getElementById('lab-unified-mode'),
      inspector: document.getElementById('lab-inspector'),
      labCategories: document.getElementById('lab-math6-categories'),
      btnToolOrbit: document.getElementById('lab-btn-tool-orbit'),
      btnSaveAs: document.getElementById('lab-btn-save-as'),
      btnToggleInspector: document.getElementById('lab-btn-toggle-inspector'),
      btnCompare: document.getElementById('lab-btn-compare'),
      btnLinked: document.getElementById('lab-btn-linked'),
      btnReset: document.getElementById('lab-btn-reset'),
      btnUndo: document.getElementById('lab-btn-undo'),
      btnRedo: document.getElementById('lab-btn-redo'),
      btnExportPng: document.getElementById('lab-btn-export-png'),
      btnSave: document.getElementById('lab-btn-save'),
      viewportMain: document.getElementById('lab-viewport-main'),
      viewportCompare: document.getElementById('lab-viewport-compare'),
      metricsStrip: document.getElementById('lab-metrics-strip'),
      insTag: document.getElementById('lab-ins-tag'),
      insDesc: document.getElementById('lab-ins-desc'),
      insControls: document.getElementById('lab-ins-controls'),
      formulaRender: document.getElementById('lab-formula-render'),
      btnCopyLatex: document.getElementById('lab-btn-copy-latex'),
      currChapter: document.getElementById('lab-curr-chapter'),
      currTopic: document.getElementById('lab-curr-topic'),
      currSource: document.getElementById('lab-curr-source')
    };
  }

  _bindEvents() {
    this.dom.btnBack.addEventListener('click', () => this.close());
    this.dom.unifiedMode.querySelectorAll('[data-unified-mode]').forEach(btn=>btn.addEventListener('click',()=>this._setUnifiedMode(btn.dataset.unifiedMode)));
    this.overlay.querySelectorAll('[data-ins-tab]').forEach(btn=>btn.addEventListener('click',()=>{
      this.dom.inspector.dataset.tab=btn.dataset.insTab;
      this.overlay.querySelectorAll('[data-ins-tab]').forEach(b=>b.classList.toggle('active',b===btn));
    }));
    
    // ESC để quay lại phòng
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.overlay.hidden) {
        if(this.workspaceEditor){
          if(this.workspaceEditor.controller?.tool!=='select')this.workspaceEditor.controller?.setTool('select');
          else this._exitWorkspace();
        }else this.close();
      }
    });

    this.dom.btnReset.addEventListener('click', () => {
      if (this.activeViewer) {
        this.activeViewer.reset();
        this._renderInspectorControls();
        this._updateMetrics();
        this._recordState();
      }
    });

    this.dom.btnExportPng.addEventListener('click', () => {
      if (!this.activeViewer) return;
      const dataUrl = this.activeViewer.exportSnapshot();
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = `MATHVERSE_Lop${this.activeModel.grade}_${this.activeModel.id}.png`;
        link.href = dataUrl;
        link.click();
      }
    });

    this.dom.btnCopyLatex.addEventListener('click', async () => {
      const latex = this.activeModel?.formulaLatex || this.activeModel?.formula || '';
      if (!latex) return;
      try {
        await navigator.clipboard.writeText(latex);
        this.dom.btnCopyLatex.textContent = '✓ Đã sao chép vào bộ nhớ!';
      } catch {
        window.prompt('Sao chép công thức LaTeX:', latex);
      }
      setTimeout(() => {
        this.dom.btnCopyLatex.textContent = '📋 Sao chép LaTeX (dán vào Word)';
      }, 1800);
    });

    this.dom.btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    this.dom.btnProjector.addEventListener('click', () => {
      this.isProjectorMode = !this.isProjectorMode;
      this.dom.app.classList.toggle('projector-mode', this.isProjectorMode);
      this.dom.btnProjector.classList.toggle('active', this.isProjectorMode);
      this._resizeViewers();
      this.activeViewer?.setTheme?.(this.isProjectorMode || this.themeDark);
      this.compareViewer?.setTheme?.(this.isProjectorMode || this.themeDark);
    });

    this.dom.sidebarToggle.addEventListener('click', () => {
      const collapsed=this.dom.app.classList.toggle('library-collapsed');
      this.dom.sidebar.classList.toggle('collapsed',collapsed);
      this.dom.sidebarToggle.textContent=collapsed?'›':'‹';
      this._resizeViewers();
    });
    this.dom.btnToggleInspector.addEventListener('click',()=>{
      const folded=this.dom.app.classList.toggle('inspector-collapsed');
      this.dom.btnToggleInspector.textContent=folded?'☷ Mở bảng':'☷ Thu bảng';
      this._resizeViewers();
    });
    this.dom.btnTheme.addEventListener('click',()=>{
      this.themeDark=!this.themeDark;
      this.dom.app.classList.toggle('theme-dark',this.themeDark);
      this.dom.btnTheme.classList.toggle('active',this.themeDark);
      this.activeViewer?.setTheme?.(this.isProjectorMode || this.themeDark);
      this.compareViewer?.setTheme?.(this.isProjectorMode || this.themeDark);
      try{localStorage.setItem('mathverse-v9-studio-dark',String(this.themeDark));}catch{}
    });
    this.overlay.querySelectorAll('[data-library-mode]').forEach(btn=>btn.addEventListener('click',()=>{
      this.libraryMode=btn.dataset.libraryMode;
      if(this.libraryMode==='math6'){
        this.activeFilter='all';
        this.overlay.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter==='all'));
      }
      this._syncLibraryMode();
      this._renderModelList();
    }));
    this.dom.btnCompose.addEventListener('click',()=>this._toggleWorkspace());
    this.dom.btnMath6.addEventListener('click',()=>this._toggleMath6Lab());
    this.dom.btnToolEdit.addEventListener('click',()=>this._setToolMode('edit'));
    this.dom.btnFrame.addEventListener('click',()=>this._frameActiveViewer());
    this._setupPanelResize();
    this.dom.btnToolOrbit.addEventListener('click',()=>this._setToolMode('orbit'));
    this.dom.btnSaveAs.addEventListener('click',()=>this._saveAsNew());
    this.dom.btnUndo.addEventListener('click',()=>this._stepHistory(-1));
    this.dom.btnRedo.addEventListener('click',()=>this._stepHistory(1));
    window.addEventListener('keydown',event=>{
      if(this.overlay.hidden || this.workspaceEditor || this.math6Lab || this.specialtyLab)return;
      const typing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);
      if(!typing && !event.ctrlKey && !event.metaKey){
        if(event.key.toLowerCase()==='f'){event.preventDefault();this._frameActiveViewer();}
        if(event.key.toLowerCase()==='e'){event.preventDefault();this._setToolMode('edit');}
        if(event.key.toLowerCase()==='r'){event.preventDefault();this._setToolMode('orbit');}
      }
      if(!event.ctrlKey&&!event.metaKey)return;
      if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
      if(event.key.toLowerCase()==='z'&&!event.shiftKey){event.preventDefault();this._stepHistory(-1);}
      else if(event.key.toLowerCase()==='y'||event.key.toLowerCase()==='z'&&event.shiftKey){event.preventDefault();this._stepHistory(1);}
    });
    for(const id of ['lab-viewport-main','lab-viewport-compare']){
      const box=document.getElementById(id);
      box.addEventListener('dragenter',event=>{if(this.math6Lab&&event.dataTransfer?.types?.includes('application/x-math6-geometry'))return;event.preventDefault();this.dom.stageDrop.hidden=false;});
      box.addEventListener('dragover',event=>{if(this.math6Lab&&event.dataTransfer?.types?.includes('application/x-math6-geometry'))return;event.preventDefault();if(event.dataTransfer)event.dataTransfer.dropEffect='copy';this.dom.stageDrop.hidden=false;});
      box.addEventListener('dragleave',event=>{if(!box.contains(event.relatedTarget))this.dom.stageDrop.hidden=true;});
      box.addEventListener('drop',event=>{
        event.preventDefault();this.dom.stageDrop.hidden=true;
        const math6Id=event.dataTransfer?.getData('application/x-mathverse-math6');
        if(math6Id&&this.activeModel?.grade===6){this._selectMath6Lab(math6Id);return;}
        const id=event.dataTransfer?.getData('application/x-mathverse-model')||event.dataTransfer?.getData('text/plain');
        if(labById(id)&&this.activeModel?.grade===6){this._selectMath6Lab(id);return;}
        const all=[...(this.getLibraryItems()||[]),...this.curatedPresets];
        const item=all.find(m=>m.id===id && m.grade===this.activeModel?.grade);
        if(item){
          if(this.specialtyLab){this.switchModel(item);return;}
          if(this.workspaceEditor)this.workspaceEditor.addFromCatalog(item,event.clientX,event.clientY);
          else this.switchModel(item);
        }
      });
    }

    // Bộ lọc theo modality
    this.overlay.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.overlay.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeFilter = tab.dataset.filter;
        this._renderModelList();
      });
    });

    this.dom.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this._renderModelList();
    });

    // So sánh A/B và mặt cắt 2D liên kết cùng hình 3D.
    this.dom.btnCompare.addEventListener('click', () => this._toggleCompare());
    this.dom.btnLinked.addEventListener('click', () => this._toggleLinked());
    this.dom.btnSave.addEventListener('click', () => {
      if(!this.activeViewer || !this.getIsTeacher()) return;
      const state=this.activeViewer.getState();
      const updated={...this.activeModel};
      if(state.params)updated.params={...updated.params,...state.params};
      if(state.data)updated.data=state.data;
      if(state.points)updated.viewState={points:state.points};
      this.onSaveModel?.(updated);
      this.activeModel=updated;
      this.dom.btnSave.textContent='✓ Đã lưu';
      setTimeout(()=>this.dom.btnSave.textContent='💾 Lưu thay đổi',1400);
    });
  }

  setRoomContext(roomId=null,labId=null){
    const room=roomId?getRoomById(roomId):null;
    const lab=labId?getLabById(labId):null;
    this.roomContext={roomId:room?.roomId||null,labId:(lab&&room&&lab.roomId===room.roomId)?lab.labId:null};
  }

  open(model,{zone=null,roomId=null,labId=null,initialMath6LabId=null}={}) {
    // R6.7 hard guard: the old MathLab 6 / LabShell workspace cannot open.
    // All Grade-6 entries are forwarded to the shared SGK warehouse (Grades 6–12).
    if(Number(model?.grade)===6){
      this.onOpenGrade6Warehouse({model,modeId:initialMath6LabId||labId||null,roomId});
      return;
    }
    if(this.specialtyLab){this.specialtyLab.dispose();this.specialtyLab=null;}
    if(this.math6Lab)this._exitMath6Lab(false);
    this.activeModel=model;
    this.setRoomContext(roomId,labId);
    this.portalZone=zoneById(zone)?zone:zoneForModel(model);
    if(Number(model.grade)===6){
      this.labGroupFilter='all';
      this.libraryMode='room';this.activeFilter='all';
      this.overlay.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter==='all'));
      this._syncLibraryMode();
    }
    this.curatedPresets=buildPresets(this.getLibraryItems()||[]);
    this.geometryHistory=[];this.geometryHistoryIndex=-1;
    this._updateHistoryButtons();
    try{this.themeDark=localStorage.getItem('mathverse-v9-studio-dark')==='true';}catch{}
    this.dom.app.classList.toggle('theme-dark',this.themeDark);
    this.overlay.hidden = false;
    this.dom.app.classList.add('visible');

    // V14: one category-specific laboratory; old V11 2D/3D composer and
    // redundant mode switch remain only for legacy code/data compatibility.
    if(initialMath6LabId && Number(model.grade)===6){
      // The original SpecialtyLab may clear its own viewport while switching to
      // R6.5: Grade6Lab uses the same specialist-lab UI as grade 7-12.
      this._updateHeader();
      this.launchMath6(initialMath6LabId);
    } else this._enterSpecialtyLab();
  }

  close() {
    if(this.specialtyLab){this.specialtyLab.dispose();this.specialtyLab=null;}
    this.dom.app.classList.remove('mv14-specialty-active');
    if(this.math6Lab)this._exitMath6Lab(false);
    if(this.workspaceEditor){this.workspaceEditor.dispose();this.workspaceEditor=null;this.dom.app.classList.remove('v11-compose');}
    this.overlay.hidden = true;
    this.dom.app.classList.remove('visible');

    if (this.activeViewer) {
      this.activeViewer.dispose();
      this.activeViewer = null;
    }
    if (this.compareViewer) {
      this.compareViewer.dispose();
      this.compareViewer = null;
      this.dom.viewportCompare.hidden = true;
      this.isSplitCompare = false;
      this.dom.btnCompare.classList.remove('active');
    }
    if(this.sectionViewer){this.sectionViewer.dispose();this.sectionViewer=null;}
    this.isLinkedSection=false;this.dom.btnLinked.classList.remove('active');
    this.dom.viewportCompare.hidden=true;


    if (typeof this.onBackToMuseum === 'function') {
      this.onBackToMuseum();
    }
  }

  _updateHeader() {
    const m = this.activeModel;
    const grade = m.grade || 8;
    const modality = m.modality || detectModality(m.type);

    this.dom.btnSave.hidden=!this.getIsTeacher()||m.id?.startsWith('preset_');
    this.dom.btnSaveAs.hidden=!this.getIsTeacher();
    this.dom.crumbGrade.textContent = `Lớp ${grade}`;
    this.dom.badgeGrade.textContent = `LỚP ${grade}`;
    this.dom.sidebarTitle.textContent = `MÔ HÌNH LỚP ${grade}`;
    this.dom.btnMath6.hidden=Number(grade)!==6;
    const math6ModeButton=this.overlay.querySelector('[data-library-mode=math6]');
    if(math6ModeButton)math6ModeButton.hidden=Number(grade)!==6;

    const modalityNames = {
      solid3d: '3D Không gian',
      geometry2d: 'Hình phẳng 2D',
      functiongraph: 'Đồ thị hàm số',
      statisticschart: 'Thống kê'
    };
    const thematic=this.roomContext.roomId?getRoomById(this.roomContext.roomId):null;
    const selectedLab=this.roomContext.labId?getLabById(this.roomContext.labId):null;
    this.dom.crumbModality.textContent=selectedLab?`${thematic?.name||'Phòng chuyên đề'} / ${selectedLab.name}`:
      thematic?thematic.name:(modalityNames[modality]||'Mô hình Toán');
    this.dom.crumbTitle.textContent = m.title;

    this.dom.stageEyebrow.textContent = `PHÒNG TOÁN LỚP ${grade} · ${modalityNames[modality] || ''}`.toUpperCase();
    this.dom.stageTitle.textContent = m.title;

    this.dom.insTag.textContent = (modalityNames[modality] || 'TOÁN HỌC').toUpperCase();
    this.dom.insDesc.textContent = m.description || '';

    // Render formula
    const formulaLatex = m.formulaLatex || m.formula || '';
    this.dom.formulaRender.innerHTML = formatMathHtml(formulaLatex);

    // Curriculum info
    this.dom.currChapter.textContent = m.chapter || 'Theo phân phối chuẩn GDPT 2018';
    this.dom.currTopic.textContent = m.topic || m.category || 'Mô hình chuẩn';
    this.dom.currSource.textContent = m.curriculumSource || 'Thông tư 32/2018/TT-BGDĐT';

    // Nút liên kết thiết diện (chỉ hiện khi mô hình 3D có hỗ trợ thiết diện)
    const hasCrossSection = modality === 'solid3d' && ['squarePyramid', 'cube', 'cuboid', 'sphereSection'].includes(m.type);
    this.dom.btnLinked.hidden = !hasCrossSection;
    this._syncUnifiedMode();
  }

  _renderModelList() {
    if(this.specialtyLab){this._renderSpecialtyList();return;}
    if(Number(this.activeModel?.grade)===6 && this.libraryMode==='math6'){this._renderMath6ModelList();return;}
    const all=this.getLibraryItems()||[];
    const grade=this.activeModel?.grade||8;
    const room=all.filter(m=>m.grade===grade);
    const presets=this.curatedPresets.filter(m=>m.grade===grade);
    const sources={
      room,
      presets,
      mine:room.filter(m=>m.custom),
      favorites:[...room,...presets].filter(m=>this.favorites.has(m.id))
    };
    const list=(sources[this.libraryMode]||room).filter(m=>{
      if(this.workspaceEditor && (m.modality||detectModality(m.type)) !== (this.workspaceEditor.dimension==='2d'?'geometry2d':'solid3d'))return false;
      const modality=m.modality||detectModality(m.type);
      return (this.activeFilter==='all'||this.activeFilter===modality)&&
        `${m.title} ${m.category||''} ${m.topic||''}`.toLocaleLowerCase('vi').includes(this.searchQuery);
    });
    const total=sources[this.libraryMode]?.length||0;
    this.dom.libraryCount.textContent=this.workspaceEditor?`${total} hinh · Lop ${grade} · Nhap de them vao cung mot bang ve`:`${total} hình · Lớp ${grade} · Chọn hoặc kéo để mở`;
    this.dom.modelList.replaceChildren();
    if(!list.length){
      const empty=document.createElement('div');empty.className='sidebar-empty';
      empty.textContent=this.libraryMode==='mine'?'Chưa có bản cô lưu. Chọn mẫu trong kho rồi nhấn “Lưu thành hình mới”.':
        this.libraryMode==='favorites'?'Nhấn ☆ bên cạnh một hình để thêm vào mục Yêu thích.':'Không có hình phù hợp với bộ lọc.';
      this.dom.modelList.append(empty);return;
    }
    const modalityIcon={solid3d:'⬡',geometry2d:'△',functiongraph:'⌁',statisticschart:'▥'};
    for(const m of list){
      const modality=m.modality||detectModality(m.type);
      const row=document.createElement('div');row.className='studio-model-row';
      const btn=document.createElement('button');btn.type='button';btn.draggable=true;
      btn.className='model-card-item studio-model-card'+(m.id===this.activeModel?.id?' active':'');
      btn.title='Nhấp để mở, hoặc giữ và kéo vào vùng làm việc';
      const icon=document.createElement('span');icon.className='card-icon '+modality;icon.textContent=modalityIcon[modality]||'◇';
      const text=document.createElement('span');text.className='card-body';
      const name=document.createElement('strong');name.className='card-title';name.textContent=m.title;
      const sub=document.createElement('small');sub.className='card-sub';sub.textContent=(m.id.startsWith('preset_')?'MẪU DỰNG SẴN · ':'')+(m.topic||m.category||'');
      text.append(name,sub);btn.append(icon,text);
      btn.addEventListener('click',()=>{
        if(this.workspaceEditor)this.workspaceEditor.addFromCatalog(m);
        else if(m.id!==this.activeModel?.id)this.switchModel(m);
      });
      btn.addEventListener('dragstart',event=>{
        event.dataTransfer?.setData('application/x-mathverse-model',m.id);
        event.dataTransfer?.setData('text/plain',m.id);
        if(event.dataTransfer)event.dataTransfer.effectAllowed='copy';
        row.classList.add('dragging');
      });
      btn.addEventListener('dragend',()=>{row.classList.remove('dragging');this.dom.stageDrop.hidden=true;});
      const fav=document.createElement('button');fav.type='button';fav.className='studio-fav'+(this.favorites.has(m.id)?' is-fav':'');
      fav.textContent=this.favorites.has(m.id)?'★':'☆';fav.title='Đánh dấu yêu thích';
      fav.setAttribute('aria-label',`Yêu thích ${m.title}`);
      fav.addEventListener('click',()=>{
        if(this.favorites.has(m.id))this.favorites.delete(m.id);else this.favorites.add(m.id);
        saveFavorites(this.favorites);this._renderModelList();
      });
      row.append(btn,fav);this.dom.modelList.append(row);
    }
  }

  switchModel(newModel) {
    if(this.specialtyLab){this.specialtyLab.dispose();this.specialtyLab=null;
      this.activeModel={...newModel,params:{...(newModel.params||{})}};
      this.portalZone=zoneById(newModel.portalZone)?newModel.portalZone:this.portalZone||zoneForModel(newModel);
      this._enterSpecialtyLab();return;
    }
    if(this.math6Lab)this._exitMath6Lab(false);
    if(this.workspaceEditor)this._exitWorkspace();
    if (this.activeViewer) {
      this.activeViewer.dispose();
      this.activeViewer = null;
    }
    if (this.compareViewer) {
      this.compareViewer.dispose();
      this.compareViewer = null;
      this.dom.viewportCompare.hidden = true;
      this.isSplitCompare = false;
      this.dom.btnCompare.classList.remove('active');
    }

    if(this.sectionViewer){this.sectionViewer.dispose();this.sectionViewer=null;}
    this.isLinkedSection=false;this.dom.btnLinked.classList.remove('active');
    this.activeModel = {...newModel,params:{...newModel.params}};
    this.geometryHistory=[];this.geometryHistoryIndex=-1;
    this._updateHistoryButtons();
    this._updateHeader();
    this._renderModelList();
    this._mountViewer();
    this._renderInspectorControls();
    this._updateMetrics();
    this._setToolMode(this.toolMode);
    this._recordState();
  }

  _mountViewer() {
    if(this.workspaceEditor || this.math6Lab)return;
    this.dom.viewportMain.innerHTML = '';
    this.activeViewer = ViewerRegistry.createViewer(this.activeModel, {
      onMetricsChange: () => this._updateMetrics(),
      onParametersChange: params => this._syncInspectorParameters(params),
      onInteractionEnd: () => this._recordState()
    });
    this.activeViewer.mount(this.dom.viewportMain);
    this.activeViewer?.setTheme?.(this.isProjectorMode || this.themeDark);
    this._updateStageHint();
  }

  _syncUnifiedMode(){
    if(this.specialtyLab){this.dom.app.dataset.viewMode='specialty';return;}
    if(!this.activeModel)return;
    const mode=this.math6Lab?'math6':this.workspaceEditor?this.workspaceEditor.dimension:'model';
    this.dom.app.dataset.viewMode=mode;
    for(const button of this.dom.unifiedMode.querySelectorAll('[data-unified-mode]')){
      const isClassSix=Number(this.activeModel.grade)===6;
      button.hidden=button.dataset.unifiedMode==='math6'&&!isClassSix;
      const active=button.dataset.unifiedMode===mode;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
    }
  }
  async _setUnifiedMode(mode){
    if(this.specialtyLab)return;
    if(!this.activeModel||!['model','math6','2d','3d'].includes(mode))return;
    if(mode==='model'){
      if(this.math6Lab)this._exitMath6Lab(true);
      else if(this.workspaceEditor)this._exitWorkspace();
      this._syncUnifiedMode();return;
    }
    if(mode==='math6'){
      if(Number(this.activeModel.grade)!==6)return;
      if(this.workspaceEditor)this._exitWorkspace();
      if(!this.math6Lab)this._enterMath6Lab();
      else if(this.math6Lab.mode!=='model')await this.math6Lab.setMode('model');
      this._syncUnifiedMode();return;
    }
    if(this.math6Lab)this._exitMath6Lab(false);
    if(!this.workspaceEditor)this._enterWorkspace();
    if(this.workspaceEditor){
      if(this.workspaceEditor.dimension!==mode)this.workspaceEditor.setDimension(mode);
      this.libraryMode='presets';this.activeFilter='all';
      this.overlay.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter==='all'));
      this._syncLibraryMode();this._renderModelList();
    }
    this._syncUnifiedMode();
  }
  _enterSpecialtyLab(){
    if(!this.activeModel)return;
    this.activeViewer?.dispose();this.activeViewer=null;
    this.dom.app.classList.add('mv14-specialty-active');
    this.dom.app.classList.remove('v11-compose','math6-active');
    this.dom.inspector.dataset.tab='controls';
    this.dom.viewportCompare.hidden=true;
    this.dom.stageDrop.hidden=true;
    this.dom.viewportMain.replaceChildren();this.dom.insControls.replaceChildren();
    this._updateHeader();
    const zone=zoneById(this.portalZone)||zoneById(zoneForModel(this.activeModel));
    this.dom.sidebarTitle.textContent=`KHU ${zone.label.toUpperCase()} · LỚP ${this.activeModel.grade}`;
    this.dom.stageEyebrow.textContent=`CỔNG ${zone.name.toUpperCase()} · PHÒNG LỚP ${this.activeModel.grade}`;
    this.dom.stageTitle.textContent=this.activeModel.title;
    this.dom.insTag.textContent=zone.name.toUpperCase();
    this.dom.stageStatus.textContent=zone.description;
    this.dom.canvasBadge.textContent=zone.label.toUpperCase();
    this.specialtyLab=new SpecialtyLab({model:this.activeModel,zone:zone.id,onNotice:msg=>this._showStudioToast(msg)});
    this.specialtyLab.mount(this.dom.viewportMain,this.dom.insControls);
    this._renderSpecialtyList();this._syncUnifiedMode();this._resizeViewers();
  }
  launchMath6(labId){
    const lab=labById(labId);
    if(!lab||Number(this.activeModel?.grade)!==6)return false;
    const anchorId=LAB_TO_EXHIBIT[labId];
    const anchor=(this.getLibraryItems()||[]).find(item=>item.id===anchorId&&Number(item.grade)===6);
    if(!anchor)return false;
    try{
      if(this.specialtyLab){this.specialtyLab.dispose();this.specialtyLab=null;}
      this.dom.app.classList.remove('mv14-specialty-active');
      if(this.math6Lab)this._exitMath6Lab(false);
      this.activeModel=anchor;
      this.portalZone=zoneForModel(anchor);
      this.dom.stageTitle.textContent=lab.title;
      this.dom.stageEyebrow.textContent=lab.supplemental?`MÔ HÌNH MỞ RỘNG TOÁN 6 · ${lab.group}`:`THÍ NGHIỆM SGK LỚP 6 · ${lab.group}`;
      this._enterMath6Lab(labId);
      if(!this.math6Lab||this.math6Lab.selected?.id!==labId)throw new Error('Bộ dựng không chọn đúng mô hình.');
      this._renderModelList();this._syncUnifiedMode();
      return true;
    }catch(error){
      console.error('R6 Math6 Lab failed:',labId,error);
      this.dom.viewportMain.replaceChildren();
      const note=document.createElement('div');note.className='r6-lab-render-error';
      note.textContent=`Không thể hiển thị mô hình ${lab.title}: ${error.message}`;
      this.dom.viewportMain.append(note);
      this.dom.stageStatus.textContent=note.textContent;
      return false;
    }
  }
  _renderSpecialtyList(){
    if(!this.activeModel)return;
    const grade=Number(this.activeModel.grade),zone=this.portalZone||zoneForModel(this.activeModel);
    const available=portalExhibits(this.getLibraryItems()||[],grade,zone);
    const labs=gradePortalLabs(grade,zone);
    const q=this.searchQuery||'';
    // Grade 6 virtual plinths and SGK labs are the SAME exhibits, never list them twice.
    const shownModels=grade===6?[]:available.filter(m=>m.title.toLocaleLowerCase('vi').includes(q));
    const shownLabs=labs.filter(m=>m.title.toLocaleLowerCase('vi').includes(q));
    this.dom.libraryCount.textContent=grade===6?`${labs.length} thí nghiệm Toán 6 trong khu này`:`${available.length} mô hình · ${labs.length} thí nghiệm SGK`;
    this.dom.modelList.replaceChildren();
    const thumbnails={rhombus:'rhombus',rectangleSquare:'rectangle',polygon:'hexagon',trapezoid:'trapezoid',parallelogram:'parallelogram',cube:'cubes',cuboid:'cubes',squarePyramid:'cubes',trianglePyramid:'cubes',pieChart:'double',barChart:'double',doubleBarChart:'double',circle:'spinner',symmetryAxis:'symmetry',symmetryCenter:'symmetry'};
    const append=(name,subtitle,fn,isLab,item=null)=>{
      const row=document.createElement('button');row.type='button';row.className='mv14-library-card';
      const mark=document.createElement('span');mark.className='mv14-library-icon';
      const variant=item&&!isLab?thumbnails[item.type]:null;
      const engine=isLab?item?.engine:zone==='solid'?'real':zone==='graph'?'geometry':zone==='stats'?'chart':zone==='real'?'real':'geometry';
      mark.innerHTML=previewMarkup({engine,variant:isLab?item?.variant:variant});
      const label=document.createElement('span');label.className='mv14-library-text';
      const title=document.createElement('strong');title.textContent=name;
      const small=document.createElement('small');small.textContent=subtitle;
      label.append(title,small);row.append(mark,label);row.addEventListener('click',fn);this.dom.modelList.append(row);
    };
    for(const m of shownModels)append(m.title,m.supplemental?'Mẫu bổ sung · không phải SGK':(m.realWorld?'Ứng dụng hình học':'Mô hình gốc'),()=>{if(m.id!==this.activeModel.id)this.switchModel(m);},false,m);
    for(const lab of shownLabs)append(lab.title,lab.supplemental?'Mô hình mở rộng · Toán 6':`${lab.source.book} · trang ${lab.source.printed_page}`,()=>this.launchMath6(lab.id),true,lab);
    if(!shownModels.length&&!shownLabs.length){const empty=document.createElement('p');empty.className='mv14-list-empty';empty.textContent='Không có mô hình phù hợp với từ khóa.';this.dom.modelList.append(empty);}
  }
  _toggleWorkspace(){
    if(this.workspaceEditor)this._exitWorkspace();else this._enterWorkspace();
  }
  _enterWorkspace(){
    if(this.math6Lab)this._exitMath6Lab(false);
    if(this.workspaceEditor||!this.activeModel)return;
    if(this.isSplitCompare)this._toggleCompare();
    if(this.isLinkedSection)this._toggleLinked();
    this.activeViewer?.dispose();this.activeViewer=null;
    this.dom.app.classList.add('v11-compose');
    this.dom.inspector.dataset.tab='controls';
    this.dom.btnCompose.textContent=V.back;
    this._libraryBeforeWorkspace=this.libraryMode;this.libraryMode='presets';this._syncLibraryMode();
    const modality=this.activeModel.modality||detectModality(this.activeModel.type);
    const initial=modality==='solid3d'?'3d':'2d';
    this.workspaceEditor=new WorkspaceComposer({
      grade:this.activeModel.grade,dimension:initial,
      container:this.dom.viewportMain,inspector:this.dom.insControls,
      onToast:msg=>this._showStudioToast(msg),
      onChange:({dimension,count})=>{
        this.dom.insTag.textContent=(dimension==='2d'?V.mode2d:V.mode3d).toUpperCase();
        this.dom.stageEyebrow.textContent=V.editor.toUpperCase()+' / '+dimension.toUpperCase();
        this.dom.canvasBadge.textContent=`${count} doi tuong / Lop ${this.activeModel.grade}`;
        this._renderModelList();
      }
    });
    if(!this.workspaceEditor.doc.items.length&&['solid3d','geometry2d'].includes(modality)){
      this.workspaceEditor.addFromCatalog(this.activeModel);
    }
    this.dom.stageTitle.textContent=V.editor;
    this.dom.stageEyebrow.textContent=V.editor.toUpperCase();
    this.dom.insTag.textContent=(initial==='2d'?V.mode2d:V.mode3d).toUpperCase();
    this.dom.stageStatus.textContent=V.dragtip;
    this._renderModelList();
    this._resizeViewers();
    this._syncUnifiedMode();
  }
  _exitWorkspace(){
    if(!this.workspaceEditor)return;
    this.workspaceEditor.dispose();this.workspaceEditor=null;
    this.dom.app.classList.remove('v11-compose');
    this.dom.inspector.dataset.tab='controls';
    this.dom.btnCompose.textContent='▣ '+V.editor.toUpperCase();
    if(this._libraryBeforeWorkspace){this.libraryMode=this._libraryBeforeWorkspace;this._libraryBeforeWorkspace=null;this._syncLibraryMode();}
    this._updateHeader();this._renderModelList();this._mountViewer();this._renderInspectorControls();this._updateMetrics();
    this._setToolMode('edit');this._resizeViewers();this._syncUnifiedMode();
  }
  _showStudioToast(message){
    this.dom.stageStatus.textContent=String(message);
  }

  _syncLibraryMode(){
    const showCategories=Number(this.activeModel?.grade)===6&&this.libraryMode==='math6';
    // Legacy modality filters must not silently hide curated MathLab lessons. All 9
    // MathLab category chips remain available while the legacy filters fold away.
    if(showCategories&&this.activeFilter!=='all'){
      this.activeFilter='all';
      this.overlay.querySelectorAll('[data-filter]').forEach(btn=>btn.classList.toggle('active',btn.dataset.filter==='all'));
    }
    this.dom.app.classList.toggle('mv13-math6-library',showCategories);
    this.dom.labCategories.hidden=!showCategories;
    this.overlay.querySelectorAll('[data-library-mode]').forEach(b=>b.classList.toggle('active',b.dataset.libraryMode===this.libraryMode));
  }
  _renderMath6ModelList(){
    const grade=this.activeModel.grade;
    const text=this.searchQuery.trim().toLocaleLowerCase('vi');
    this.dom.labCategories.replaceChildren();
    const room=this.roomContext.roomId?getRoomById(this.roomContext.roomId):null;
    const lab=this.roomContext.labId?getLabById(this.roomContext.labId):null;
    const allowed=lab&&room?.roomId===lab.roomId?new Set(lab.modes.map(m=>m.id)):
      room&&room.grade===6?new Set(room.labs.flatMap(l=>l.modes.map(m=>m.id))):null;
    const galleryLabs=ALL_MATH6_LABS.filter(m=>allowed?allowed.has(m.id):isGrade6ActiveLab(m.id));
    for(const group of ['all',...new Set(galleryLabs.map(m=>m.group))]){
      const b=document.createElement('button');b.type='button';b.className='mv13-category-chip';
      b.textContent=group==='all'?(room?`${room.name} · ${galleryLabs.length} mẫu`:`Đang trưng bày ${GRADE6_CURATED_TOTAL}`):groupLabels[group]||group;
      b.title=group==='all'?`35 thí nghiệm tiêu biểu, 28 mẫu được lưu trong thư mục bảo tồn`:group;
      b.classList.toggle('active',this.labGroupFilter===group);
      b.setAttribute('aria-pressed',String(this.labGroupFilter===group));
      b.addEventListener('click',()=>{this.labGroupFilter=group;this._renderMath6ModelList();});
      this.dom.labCategories.append(b);
    }
    let list=galleryLabs.filter(m=>(this.labGroupFilter==='all'||m.group===this.labGroupFilter)&&
      `${m.title} ${m.group} ${m.action}`.toLocaleLowerCase('vi').includes(text));
    // MathLab's 60 categories are not incorrectly reclassified as old 2D/3D studio types.
    if(this.activeFilter==='solid3d')list=list.filter(m=>m.engine==='real'||(m.engine==='chance'&&['dice','spinner'].includes(m.variant)));
    if(this.activeFilter==='geometry2d')list=list.filter(m=>!['chart','chance'].includes(m.engine));
    if(this.activeFilter==='statisticschart')list=list.filter(m=>['chart','chance'].includes(m.engine));
    if(this.activeFilter==='functiongraph')list=[];
    this.dom.modelList.replaceChildren();
    this.dom.libraryCount.textContent=room?`${list.length}/${galleryLabs.length} mô hình trong ${room.name}`:`${list.length}/${GRADE6_CURATED_TOTAL} mô hình tiêu biểu · 9 bục gốc được giữ nguyên`;
    if(!list.length){const p=document.createElement('p');p.className='sidebar-empty';p.textContent='Không có thí nghiệm phù hợp. Chọn “Đang trưng bày” để xem mô hình tiêu biểu.';this.dom.modelList.append(p);return;}
    const anchors=new Map((this.getLibraryItems()||[]).filter(m=>m.grade===6).map(m=>[m.id,m]));
    const fragment=document.createDocumentFragment();
    for(const m of list){
      const originalId=LAB_TO_EXHIBIT[m.id];
      const row=document.createElement('div');row.className='studio-model-row math6-library-row';
      const button=document.createElement('button');button.className='model-card-item studio-model-card math6-library-card';button.type='button';button.draggable=true;
      button.dataset.math6ModelId=m.id;button.classList.toggle('active',this.math6Lab?.selected?.id===m.id);
      const icon=document.createElement('span');icon.className='mv13-math6-preview';
      icon.dataset.engine=m.engine;icon.innerHTML=previewMarkup(m);
      const body=document.createElement('span');body.className='card-body';
      const title=document.createElement('strong');title.className='card-title';title.textContent=m.title;
      const sub=document.createElement('small');sub.className='card-sub';sub.textContent=m.supplemental?`Mẫu mở rộng · ${m.group}`:`${m.source.book} tr. ${m.source.printed_page} · ${anchors.get(originalId)?.title||originalId}`;
      const badge=document.createElement('span');badge.className='mv13-lab-card-kind';badge.textContent=!isGrade6ActiveLab(m.id)?'Lưu kho · '+(groupLabels[m.group]||m.group):groupLabels[m.group]||m.group;
      body.append(title,sub,badge);button.append(icon,body);
      button.title=`Thí nghiệm thuộc ${m.group}. Gắn với bục: ${anchors.get(originalId)?.title}`;
      button.addEventListener('click',()=>this._selectMath6Lab(m.id));
      button.addEventListener('dragstart',event=>{
        event.dataTransfer?.setData('application/x-mathverse-math6',m.id);
        event.dataTransfer?.setData('text/plain',m.id);
        if(event.dataTransfer)event.dataTransfer.effectAllowed='copy';
      });
      row.append(button);fragment.append(row);
    }
    this.dom.modelList.append(fragment);
  }
  _selectMath6Lab(labId){
    if(this.specialtyLab)return this.launchMath6(labId);
    const item=labById(labId);if(!item||this.activeModel?.grade!==6)return;
    const anchorId=LAB_TO_EXHIBIT[labId];
    if(this.activeModel?.id!==anchorId){
      const original=(this.getLibraryItems()||[]).find(m=>m.grade===6&&m.id===anchorId);
      if(!original){this.dom.stageStatus.textContent='Chưa tìm được mô hình lớp 6 gốc liên kết với thí nghiệm này.';return;}
      this.switchModel(original); // switches original pedestal, never adds to or deletes the source catalogue
      this.libraryMode='math6';this._syncLibraryMode();
    }
    if(!this.math6Lab)this._enterMath6Lab(labId);
    else this.math6Lab.select(labId);
    this._renderModelList();
  }
  _toggleMath6Lab(){
    if(this.activeModel?.grade!==6)return;
    if(this.math6Lab)this._exitMath6Lab(true);
    else this._enterMath6Lab();
  }
  _enterMath6Lab(initialLabId){
    if(this.activeModel?.grade!==6)return;
    if(this.workspaceEditor)this._exitWorkspace();
    if(this.isSplitCompare){this.isSplitCompare=false;this.compareViewer?.dispose();this.compareViewer=null;this.dom.viewportCompare.hidden=true;this.dom.btnCompare.classList.remove('active');}
    if(this.isLinkedSection){this.isLinkedSection=false;this.sectionViewer?.dispose();this.sectionViewer=null;this.dom.viewportCompare.hidden=true;this.dom.btnLinked.classList.remove('active');}
    this.activeViewer?.dispose();this.activeViewer=null;
    if(this.libraryMode!=='math6'){this._libraryBeforeMath6=this.libraryMode;this.libraryMode='math6';this._syncLibraryMode();}
    this.math6Lab=new Grade6Lab({anchor:this.activeModel,initialLabId,
      onNotice:msg=>{this.dom.stageStatus.textContent=String(msg);},
      onSelected:(lab,anchor)=>{
        this.dom.stageTitle.textContent=lab.title;
        this.dom.stageEyebrow.textContent=`MATHLAB 6 · ${anchor.title}`.toUpperCase();
        this.dom.crumbTitle.textContent=lab.title;
        this.dom.crumbModality.textContent=this.roomContext.roomId?(getRoomById(this.roomContext.roomId)?.name||'Thí nghiệm SGK'):'🔬 Thí nghiệm SGK';
        this.dom.insTag.textContent='MATHLAB TOÁN 6';
        this.dom.insDesc.textContent=lab.action||'';
        this.dom.currTopic.textContent=lab.group;
        this.dom.currSource.textContent=`SGK Toán 6 KNTT · ${lab.source.book} · trang ${lab.source.printed_page}`;
        this.dom.stageStatus.textContent=`Thí nghiệm ${lab.title} liên kết với bục “${anchor.title}”. Kéo hình, điều chỉnh tham số hoặc chạy chuyển động.`;
        this._renderModelList();
      }
    });
    this.dom.app.classList.add('math6-active');
    this.dom.btnMath6.textContent='↩ Về mô hình gốc';
    this.dom.btnMath6.title='Quay về mô hình gốc tại cùng bục trong bảo tàng';
    this.dom.metricsStrip.replaceChildren();
    try{this.math6Lab.mount(this.dom.viewportMain,this.dom.insControls);}catch(error){
      console.error('MathLab 6 inline mount failed',error);
      this._exitMath6Lab(true);
      this.dom.stageStatus.textContent='Không thể mở thí nghiệm; đã khôi phục mô hình gốc. '+error.message;
      const note=document.createElement('div');note.className='r6-lab-render-error';note.textContent=this.dom.stageStatus.textContent;this.dom.viewportMain.prepend(note);
      return;
    }
    this._renderModelList();this._syncUnifiedMode();
  }
  _exitMath6Lab(restoreViewer=true){
    if(!this.math6Lab)return;
    this.math6Lab.dispose();this.math6Lab=null;
    this.dom.app.classList.remove('math6-active');
    this.dom.btnMath6.textContent='🔬 Thí nghiệm Toán 6';
    this.dom.btnMath6.title='Mở MathLab 6 gắn trực tiếp với bục mô hình này';
    if(this.libraryMode==='math6'){this.libraryMode=this._libraryBeforeMath6||'room';this._libraryBeforeMath6=null;this._syncLibraryMode();}
    if(restoreViewer){
      this._updateHeader();this._mountViewer();this._renderInspectorControls();this._updateMetrics();this._setToolMode(this.toolMode);this._recordState();this._renderModelList();this._syncUnifiedMode();
    }
  }

  _updateStageHint(){
    if(this.math6Lab)return;
    const modality=this.activeModel.modality||detectModality(this.activeModel.type);
    const n=this.activeViewer?.getEditableHandleCount?.()||0;
    const label={solid3d:'KHỐI 3D',geometry2d:'HÌNH PHẲNG 2D',functiongraph:'ĐỒ THỊ',statisticschart:'THỐNG KÊ'}[modality]||'TOÁN HỌC';
    this.dom.canvasBadge.textContent=label+'  ·  '+(n?`${n} điểm điều khiển`:'Bảng tham số bên phải');
    this.dom.stageStatus.textContent=modality==='solid3d'&&n
      ?`KÉO ${n} TAY NẮM TRÊN HÌNH ĐỂ THAY KÍCH THƯỚC  •  Giữ Shift + kéo để dịch chuyển camera  •  Cuộn để zoom.`:
      modality==='geometry2d'&&n
      ?`KÉO TRỰC TIẾP ${n} ĐIỂM MÀU CAM  •  Các ràng buộc hình học luôn được giữ  •  Chọn Di chuyển khung để dịch bảng vẽ.`:
      modality==='functiongraph'?'Đổi tham số để xem biến đổi đồ thị theo thời gian thực.':
      modality==='statisticschart'?'Chỉnh bảng số liệu để biểu đồ cập nhật.':
      'Dùng thanh thuộc tính để thay tham số và kéo vùng nền để quan sát.';
    const direct=(modality==='solid3d'||modality==='geometry2d')&&n>0;
    this.dom.btnToolEdit.hidden=!direct;
    this.dom.btnToolOrbit.hidden=!(modality==='solid3d'||modality==='geometry2d');
    this.dom.btnToolOrbit.textContent=modality==='solid3d'?'⟳ Xoay 3D':'✋ Di chuyển khung';
    this.dom.btnFrame.hidden=!(modality==='solid3d'||modality==='geometry2d');
    this.dom.btnSave.hidden=!this.getIsTeacher()||this.activeModel.id?.startsWith('preset_');
    this.dom.btnSaveAs.hidden=!this.getIsTeacher();
  }
  _frameActiveViewer(){
    if(this.activeViewer?.frame)this.activeViewer.frame();
    else if(this.activeViewer?.setViewPreset)this.activeViewer.setViewPreset('iso');
    this._updateStageHint();
  }
  _setupPanelResize(){
    const wrapper=this.dom.workspace,app=this.dom.app;
    const min=178,max=460;
    try{
      const widths=JSON.parse(localStorage.getItem('mathverse-v10-panel-widths')||'{}');
      if(Number.isFinite(widths.left))app.style.setProperty('--v10-left',`${Math.max(min,Math.min(max,widths.left))}px`);
      if(Number.isFinite(widths.right))app.style.setProperty('--v10-right',`${Math.max(min,Math.min(max,widths.right))}px`);
    }catch{}
    for(const [side,id] of [['left','lab-resize-left'],['right','lab-resize-right']]){
      const bar=document.getElementById(id);
      bar.addEventListener('pointerdown',event=>{
        if(event.button!==0||window.matchMedia('(max-width:780px)').matches)return;
        event.preventDefault();bar.setPointerCapture(event.pointerId);
        app.classList.add('resizing-panels');
        const move=e=>{
          const rect=wrapper.getBoundingClientRect();
          const width=side==='left'?e.clientX-rect.left:rect.right-e.clientX;
          app.style.setProperty(`--v10-${side}`,`${Math.max(min,Math.min(max,width))}px`);
          this._resizeViewers();
        };
        const up=()=>{
          bar.removeEventListener('pointermove',move);bar.removeEventListener('pointerup',up);
          bar.removeEventListener('pointercancel',up);app.classList.remove('resizing-panels');
          const css=getComputedStyle(app);
          try{localStorage.setItem('mathverse-v10-panel-widths',JSON.stringify({left:parseFloat(css.getPropertyValue('--v10-left'))||270,right:parseFloat(css.getPropertyValue('--v10-right'))||318}));}catch{}
          this._resizeViewers();
        };
        bar.addEventListener('pointermove',move);bar.addEventListener('pointerup',up);bar.addEventListener('pointercancel',up);
      });
      bar.addEventListener('keydown',event=>{
        if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
        event.preventDefault();const css=getComputedStyle(app);
        const current=parseFloat(css.getPropertyValue(`--v10-${side}`))||(side==='left'?270:318);
        const delta=(event.key==='ArrowRight'?12:-12)*(side==='right'?-1:1);
        app.style.setProperty(`--v10-${side}`,`${Math.max(min,Math.min(max,current+delta))}px`);
        this._resizeViewers();
      });
    }
  }
  _setToolMode(mode){
    this.toolMode=mode;
    this.activeViewer?.setToolMode?.(mode);
    this.dom.btnToolEdit.classList.toggle('active',mode==='edit');
    this.dom.btnToolOrbit.classList.toggle('active',mode==='orbit');
  }
  _syncInspectorParameters(params){
    for(const input of this.dom.insControls.querySelectorAll('input[data-param]')){
      const key=input.dataset.param;
      if(params[key]===undefined)continue;
      input.value=String(params[key]);
      const out=input.parentElement?.querySelector(`#val_${key}`)||input.parentElement?.querySelector('.studio-param-value');
      if(out)out.textContent=String(params[key]);
    }
    this._updateMetrics();
  }
  _resizeViewers(){
    setTimeout(()=>{
      this.specialtyLab?.symmetry?.resize?.();
      this.specialtyLab?.viewer?._onResize?.();
      this.workspaceEditor?.controller?.resize?.();
      this.activeViewer?._onResize?.();this.compareViewer?._onResize?.();
      this.sectionViewer?._onResize?.();
    },280);
  }
  _saveAsNew(){
    if(!this.getIsTeacher()||!this.activeViewer||!this.activeModel)return;
    const draft=structuredClone(this.activeModel);
    const state=this.activeViewer.getState();
    const suggested=String(draft.title).replace(/^Mẫu\s*/i,'').slice(0,100);
    const title=window.prompt('Tên hình mới để đưa vào phòng lớp '+draft.grade+':',suggested);
    if(title===null)return;
    if(!title.trim()){window.alert('Tên mô hình không được để trống.');return;}
    draft.id=`studio_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
    draft.title=title.trim();
    draft.custom=true;
    draft.params={...draft.params,...(state.params||{})};
    if(state.points)draft.viewState={points:state.points};
    if(state.data)draft.data=state.data;
    const success=this.onSaveModel?.(draft);
    if(success===false){window.alert('Không lưu được, hãy kiểm tra dung lượng bộ nhớ.');return;}
    const newItem=(this.getLibraryItems()||[]).find(m=>m.id===draft.id);
    if(!newItem){window.alert('Chưa lưu được.');return;}
    this.libraryMode='mine';
    this.overlay.querySelectorAll('[data-library-mode]').forEach(btn=>btn.classList.toggle('active',btn.dataset.libraryMode==='mine'));
    this.switchModel(newItem);
  }
  _recordState(){
    if(!this.activeViewer||this._restoringHistory)return;
    const state=JSON.stringify(this.activeViewer.getState());
    if(this.geometryHistory[this.geometryHistoryIndex]===state)return;
    this.geometryHistory=this.geometryHistory.slice(0,this.geometryHistoryIndex+1);
    this.geometryHistory.push(state);
    if(this.geometryHistory.length>30)this.geometryHistory.shift();
    this.geometryHistoryIndex=this.geometryHistory.length-1;
    this._updateHistoryButtons();
  }
  _updateHistoryButtons(){
    this.dom.btnUndo.disabled=this.geometryHistoryIndex<=0;
    this.dom.btnRedo.disabled=this.geometryHistoryIndex>=this.geometryHistory.length-1;
  }
  _stepHistory(direction){
    const target=this.geometryHistoryIndex+direction;
    if(target<0||target>=this.geometryHistory.length||!this.activeViewer)return;
    const state=JSON.parse(this.geometryHistory[target]);
    this._restoringHistory=true;
    try {
      const viewer=this.activeViewer;
      if(state.params){
        const p=state.modality==='functiongraph'&&['linearSlope','lineGraph'].includes(this.activeModel?.type)
          ? {b:state.params.a,c:state.params.b}:state.params;
        viewer.updateParameters(p);
      }
      if(state.points && typeof viewer.updateParameters==='function')viewer.updateParameters({points:state.points});
      if(state.data){
        viewer.data=structuredClone(state.data);
        viewer.setChartKind?.(state.chartKind||viewer.chartKind);
        viewer.render?.();
      }
      if(state.displayMode)viewer.setDisplayMode?.(state.displayMode);
      if(state.crossSectionEnabled!==undefined)viewer.setCrossSection?.(state.crossSectionEnabled,state.crossSectionPct||50);
      this._syncInspectorParameters(viewer.params||{});
      this._updateMetrics();this._refreshLinked();
      this.geometryHistoryIndex=target;
      this._updateHistoryButtons();
    } finally {this._restoringHistory=false;}
  }

  _toggleCompare() {
    if(this.isLinkedSection)this._toggleLinked();
    this.isSplitCompare = !this.isSplitCompare;
    this.dom.viewportCompare.hidden = !this.isSplitCompare;
    this.dom.btnCompare.classList.toggle('active', this.isSplitCompare);

    if (this.isSplitCompare) {
      // Khởi tạo bản B (sao chép độc lập của activeModel)
      this.dom.viewportCompare.innerHTML = '';
      const copyModel = JSON.parse(JSON.stringify(this.activeModel));
      copyModel.id = `${this.activeModel.id}_compare`;
      this.compareViewer = ViewerRegistry.createViewer(copyModel);
      this.compareViewer.mount(this.dom.viewportCompare);
    } else {
      if (this.compareViewer) {
        this.compareViewer.dispose();
        this.compareViewer = null;
      }
    }

    if (this.activeViewer && typeof this.activeViewer._onResize === 'function') {
      this.activeViewer._onResize();
    }
  }

  _toggleLinked() {
    if(this.isSplitCompare)this._toggleCompare();
    this.isLinkedSection=!this.isLinkedSection;
    this.dom.btnLinked.classList.toggle('active',this.isLinkedSection);
    this.dom.viewportCompare.hidden=!this.isLinkedSection;
    if(this.isLinkedSection){
      this.dom.viewportCompare.replaceChildren();
      this.sectionViewer=new Section2DViewer(this.activeModel,this.activeViewer);
      this.sectionViewer.mount(this.dom.viewportCompare);
      if(this.activeViewer?.meshGroup?.supportsCrossSection){
        this.activeViewer.setCrossSection(true,this.activeViewer.crossSectionPct);
        const checkbox=this.dom.insControls.querySelector('#chk-cross-section');if(checkbox)checkbox.checked=true;
        const wrapper=this.dom.insControls.querySelector('#cross-section-slider-wrap');if(wrapper)wrapper.style.display='block';
      }
    }else{
      this.sectionViewer?.dispose();this.sectionViewer=null;
    }
    this.activeViewer?._onResize?.();
  }

  _refreshLinked(){if(this.sectionViewer)this.sectionViewer.render();}

  _renderInspectorControls() {
    if(this.math6Lab)return;
    const holder = this.dom.insControls;
    holder.innerHTML = '';
    const m = this.activeModel;
    const modality = m.modality || detectModality(m.type);

    if (modality === 'solid3d') {
      this._renderSolid3DControls(holder);
    } else if (modality === 'geometry2d') {
      this._renderGeometry2DControls(holder);
    } else if (modality === 'functiongraph') {
      this._renderFunctionGraphControls(holder);
    } else if (modality === 'statisticschart') {
      this._renderStatisticsChartControls(holder);
    }
    // Save one undo step after an entire slider or data-edit gesture, not per frame.
    holder.querySelectorAll('input[type="range"],input[type="number"],input[type="checkbox"]').forEach(input=>
      input.addEventListener('change',()=>this._recordState())
    );
  }

  _renderSolid3DControls(holder) {
    const typeSpec = TYPES[this.activeModel.type];
    const params = this.activeViewer?.params || this.activeModel.params || {};

    // 1. Các thanh trượt tham số hình học
    if (typeSpec?.params) {
      const grp = document.createElement('div');
      grp.className = 'ctrl-group';
      grp.innerHTML = `<label class="ctrl-group-title">KÍCH THƯỚC HÌNH HỌC</label>`;

      for (const [key, [label, min, max]] of Object.entries(typeSpec.params)) {
        const val = params[key] !== undefined ? params[key] : (min + max) / 2;
        const row = document.createElement('div');
        row.className = 'slider-row';
        row.innerHTML = `
          <div class="slider-head">
            <span>${label}</span>
            <strong id="val_${key}">${val}</strong>
          </div>
          <input type="range" min="${min}" max="${max}" step="${['n','deg','angle'].includes(key)?1:0.1}" value="${val}" data-param="${key}" />
        `;
        row.querySelector('input').addEventListener('input', (e) => {
          const num = Number(e.target.value);
          this.activeViewer.updateParameters({ [key]: num });
          const checked=this.activeViewer.params[key];
          row.querySelector(`#val_${key}`).textContent = String(checked);
          e.target.value=String(checked);
          this._updateMetrics();this._refreshLinked();
        });
        grp.appendChild(row);
      }
      holder.appendChild(grp);
    }

    // 2. Góc nhìn chuẩn 4 hướng
    const viewGrp = document.createElement('div');
    viewGrp.className = 'ctrl-group';
    viewGrp.innerHTML = `
      <label class="ctrl-group-title">GÓC NHÌN CHUẨN</label>
      <div class="btn-group-row">
        <button class="small-tag-btn active" data-view="iso">3D Phối cảnh</button>
        <button class="small-tag-btn" data-view="front">Chính diện</button>
        <button class="small-tag-btn" data-view="top">Từ trên</button>
        <button class="small-tag-btn" data-view="side">Từ bên</button>
      </div>
    `;
    viewGrp.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        viewGrp.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeViewer.setViewPreset(btn.dataset.view);
      });
    });
    holder.appendChild(viewGrp);

    const visual=document.createElement('div');visual.className='ctrl-group';
    visual.innerHTML=`<label class="ctrl-group-title">HIỂN THỊ VẬT THỂ</label>
      <div class="btn-group-row"><button class="small-tag-btn active" data-visual="solid">Khối</button><button class="small-tag-btn" data-visual="wireframe">Khung</button><button class="small-tag-btn" data-visual="transparent">Trong suốt</button></div>
      <label class="check-toggle"><input type="checkbox" data-toggle="labels" checked /> Tên điểm và nhãn</label>
      <label class="check-toggle"><input type="checkbox" data-toggle="faces" checked /> Hiện mặt</label>
      <label class="check-toggle"><input type="checkbox" data-toggle="edges" checked /> Hiện cạnh</label>`;
    visual.querySelectorAll('[data-visual]').forEach(btn=>btn.addEventListener('click',()=>{
      visual.querySelectorAll('[data-visual]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');
      this.activeViewer.setDisplayMode(btn.dataset.visual);
    }));
    visual.querySelectorAll('[data-toggle]').forEach(inp=>inp.addEventListener('change',()=>{
      this.activeViewer.setToggles({[inp.dataset.toggle]:inp.checked});
    }));
    holder.appendChild(visual);
    const grips=document.createElement('div');grips.className='ctrl-group v10-direct-tools';
    const cnt=this.activeViewer?.getEditableHandleCount?.()||0;
    grips.innerHTML=`<label class="ctrl-group-title">CHỈNH TRỰC TIẾP 3D</label>
      <label class="check-toggle"><input id="v10-show-3d-handles" type="checkbox" ${cnt?'checked':''} ${cnt?'':'disabled'}/> Hiện ${cnt} tay nắm kéo</label>
      <p class="small-hint">Giữ chuột trên điểm màu và kéo theo trục. Chọn <b>Xoay 3D</b> nếu muốn thay góc nhìn.</p>`;
    grips.querySelector('#v10-show-3d-handles').addEventListener('change',e=>this.activeViewer?.setShowHandles?.(e.target.checked));
    holder.appendChild(grips);
    if(this.activeModel.type==='squarePyramid'){
      const unfold=document.createElement('div');unfold.className='ctrl-group';
      unfold.innerHTML='<label class="ctrl-group-title">TRẢI HÌNH CHÓP</label><input type="range" min="0" max="100" value="0" step="1" aria-label="Tiến độ trải hình" /><p class="small-hint">0%: khối kín · 100%: hình khai triển</p>';
      unfold.querySelector('input').addEventListener('input',e=>this.activeViewer.setUnfold(Number(e.target.value)>0,Number(e.target.value)/100));
      holder.append(unfold);
    }

    // 3. Mặt phẳng cắt thiết diện (nếu hỗ trợ)
    if (['squarePyramid', 'cube', 'cuboid', 'sphereSection'].includes(this.activeModel.type)) {
      const cutGrp = document.createElement('div');
      cutGrp.className = 'ctrl-group';
      cutGrp.innerHTML = `
        <label class="ctrl-group-title">MẶT PHẲNG CẮT (THIẾT DIỆN)</label>
        <label class="check-toggle">
          <input type="checkbox" id="chk-cross-section" /> Bật mặt phẳng cắt song song đáy
        </label>
        <div id="cross-section-slider-wrap" class="slider-row" style="display:none; margin-top:8px;">
          <div class="slider-head">
            <span>Độ cao mặt cắt z:</span>
            <strong id="val-cut-z">50%</strong>
          </div>
          <input type="range" id="slider-cut-z" min="5" max="95" value="50" step="1" />
        </div>
      `;
      const chk = cutGrp.querySelector('#chk-cross-section');
      const wrap = cutGrp.querySelector('#cross-section-slider-wrap');
      const slider = cutGrp.querySelector('#slider-cut-z');
      const valZ = cutGrp.querySelector('#val-cut-z');

      chk.addEventListener('change', () => {
        wrap.style.display = chk.checked ? 'block' : 'none';
        this.activeViewer.setCrossSection(chk.checked, Number(slider.value));
        this._updateMetrics();this._refreshLinked();
      });
      slider.addEventListener('input', () => {
        valZ.textContent = `${slider.value}%`;
        this.activeViewer.setCrossSection(true, Number(slider.value));
        this._updateMetrics();this._refreshLinked();
      });
      holder.appendChild(cutGrp);
    }
  }

  _renderGeometry2DControls(holder) {
    const grp=document.createElement('div');grp.className='ctrl-group';
    const editable=!!this.activeViewer?.isEditable;
    const intro=document.createElement('p');intro.className='small-hint';
    intro.textContent=editable?'Kéo đỉnh màu cam để thay đổi hình. Điểm màu xanh là điểm được tính từ ràng buộc.':'Thay đổi các tham số để xây dựng lại hình chính xác theo nội dung bài toán.';
    grp.append(intro);
    const toggles=document.createElement('div');toggles.className='v10-2d-toggles';
    toggles.innerHTML=`<label class="check-toggle"><input id="v10-show-2d-handles" type="checkbox" checked/> Hiện điểm kéo</label>
      <label class="check-toggle"><input id="v10-show-2d-grid" type="checkbox" checked/> Hiện lưới tọa độ</label>`;
    toggles.querySelector('#v10-show-2d-handles').addEventListener('change',e=>this.activeViewer?.setShowHandles?.(e.target.checked));
    toggles.querySelector('#v10-show-2d-grid').addEventListener('change',e=>{if(this.activeViewer){this.activeViewer.showGrid=e.target.checked;this.activeViewer.render();}});
    grp.append(toggles);
    const params=this.activeViewer?.params||this.activeModel.params||{};
    for(const [key,[label,lo,hi]] of Object.entries(TYPES[this.activeModel.type]?.params||{})){
      const row=document.createElement('label');row.className='slider-row';
      const title=document.createElement('span');title.className='slider-head';title.textContent=label;
      const value=document.createElement('strong');value.textContent=String(params[key]);value.className='studio-param-value';
      const input=document.createElement('input');input.type='range';input.min=String(lo);input.max=String(hi);
      input.step=['n','deg','angle'].includes(key)?'1':'0.1';input.value=String(params[key]);input.dataset.param=key;
      input.addEventListener('input',()=>{
        this.activeViewer.updateParameters({[key]:Number(input.value)});
        value.textContent=String(this.activeViewer.params[key]);this._updateMetrics();
      });
      row.append(title,value,input);grp.append(row);
    }
    holder.append(grp);
  }

  _renderFunctionGraphControls(holder) {
    const grp=document.createElement('div');grp.className='ctrl-group';
    const header=document.createElement('label');header.className='ctrl-group-title';header.textContent='HỆ SỐ VÀ THAM SỐ';grp.append(header);
    const type=this.activeModel.type;
    const spec=TYPES[type];const params=this.activeViewer?.params||{};
    const mapping=type==='linearSlope'||type==='lineGraph'?{a:'b',b:'c'}:Object.fromEntries(Object.keys(spec?.params||{}).map(x=>[x,x]));
    for(const [modelKey,viewerKey] of Object.entries(mapping)){
      const [label,min,max]=spec.params[modelKey];
      const row=document.createElement('label');row.className='slider-row';
      const title=document.createElement('div');title.className='slider-head';title.textContent=label;
      const val=document.createElement('strong');val.textContent=String(params[viewerKey]);val.className='studio-param-value';
      const input=document.createElement('input');input.type='range';input.min=String(min);input.max=String(max);input.step='0.1';input.value=String(params[viewerKey]);input.dataset.param=viewerKey;
      input.addEventListener('input',()=>{
        const value=Number(input.value);this.activeViewer.updateParameters({[viewerKey]:value});
        const checked=this.activeViewer.params[viewerKey];val.textContent=String(checked);input.value=String(checked);this._updateMetrics();
      });row.append(title,val,input);grp.append(row);
    }
    const help=document.createElement('p');help.className='small-hint';
    help.textContent=type==='inequalityRegion'?'Miền màu xanh biểu diễn ax + by ≤ c; đường đậm là biên.':type==='rationalFunc'?'Chú ý tiệm cận đứng và điểm gián đoạn có thể khử.':'Di chuột lên đồ thị để đọc tọa độ; kéo nền để dịch chuyển, lăn chuột để phóng to.';
    grp.append(help);holder.append(grp);
  }

  _renderStatisticsChartControls(holder) {
    const grp = document.createElement('div');
    grp.className = 'ctrl-group';
    grp.innerHTML = `
      <label class="ctrl-group-title">CHỌN DẠNG BIỂU ĐỒ</label>
      <div class="btn-group-row">
        <button class="small-tag-btn active" data-chart="bar">Cột</button>
        <button class="small-tag-btn" data-chart="line">Đường</button>
        <button class="small-tag-btn" data-chart="pie">Quạt tròn</button>
        <button class="small-tag-btn" data-chart="hist">Tần số</button>
      </div>
      <div class="rule-divider"></div>
      <label class="ctrl-group-title">BẢNG SỐ LIỆU ĐANG DÙNG</label>
      <div class="data-table-edit" id="stats-data-table"></div>
    `;

    const currentKind=this.activeViewer.chartKind;
    grp.querySelectorAll('[data-chart]').forEach(btn=>{
      btn.classList.toggle('active',btn.dataset.chart===currentKind);
      if(btn.dataset.chart==='hist'&&this.activeViewer.data.kind!=='raw_numeric'){
        btn.disabled=true;btn.title='Biểu đồ tần số ghép nhóm cần dãy quan sát gốc, không dùng tần số của nhóm làm mẫu';
      }
    });
    grp.querySelectorAll('[data-chart]').forEach(btn => {
      btn.addEventListener('click', () => {
        grp.querySelectorAll('[data-chart]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeViewer.setChartKind(btn.dataset.chart);
        this._updateMetrics();
      });
    });

    const tableHolder = grp.querySelector('#stats-data-table');
    const dataVals = this.activeViewer?.data?.values || [];
    const dataLabels = this.activeViewer?.data?.labels || ['Nhóm A', 'Nhóm B', 'Nhóm C', 'Nhóm D'];

    dataVals.forEach((val, idx) => {
      const row = document.createElement('div');
      row.className = 'table-row-edit';
      // Do not insert teacher-controlled CSV labels into HTML markup.
      const label=document.createElement('span');
      label.textContent=String(dataLabels[idx] || `Mục ${idx+1}`);
      const input=document.createElement('input');
      input.type='number'; input.min='0';input.max='1000000';input.value=String(val);
      input.dataset.idx=String(idx);
      row.append(label,input);
      input.addEventListener('input', (e) => {
        const newVal = Math.max(0, Number(e.target.value) || 0);
        dataVals[idx] = newVal;
        this.activeViewer.setDataValues(dataVals);
        this._updateMetrics();
      });
      tableHolder.appendChild(row);
    });

    holder.appendChild(grp);
  }

  _updateMetrics() {
    if(this.math6Lab)return;
    if (!this.activeViewer) return;
    const metricsList = this.activeViewer.getMetrics() || [];
    this.dom.metricsStrip.innerHTML = '';

    metricsList.forEach(m => {
      const card=document.createElement('div');card.className='metric-strip-card';
      const label=document.createElement('span');label.className='m-label';label.textContent=String(m.name??'');
      const value=document.createElement('strong');value.className='m-val';value.textContent=`${m.value??''}${m.unit?' '+m.unit:''}`;
      card.append(label,value);this.dom.metricsStrip.appendChild(card);
    });
  }
}
