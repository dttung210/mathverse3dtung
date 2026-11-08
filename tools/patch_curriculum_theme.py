import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

# 1. Patch src/curriculum/CurriculumExplorer.js
explorer_path = 'src/curriculum/CurriculumExplorer.js'
with open(explorer_path, 'r', encoding='utf-8') as f:
    explorer_content = f.read()

target_build = """  _build(){
   const overlay=node('div','mv-r5-backdrop');overlay.hidden=true;overlay.id='mv-r5-browser';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Kho SGK và Lab tương tác Toán 6 đến 12');
   const root=node('section','mv-r5-window');overlay.append(root);
   const header=node('header','mv-r5-header');const headline=node('div','mv-r5-heading');headline.append(node('strong','', 'MATHVERSE · KHO SGK TOÁN 6–12'),node('small','', '7 khối lớp · 58 chương SGK (34 phòng) · 166 Lab bài học (76 Lab chuyên đề) · 310 mô hình/chế độ'));
   const focus=button('⛶ Mở rộng hình',()=>{this.focusMode=!this.focusMode;overlay.classList.toggle('mv-r63-focus',this.focusMode);focus.textContent=this.focusMode?'⊞ Hiện danh mục':'⛶ Mở rộng hình';focus.setAttribute('aria-pressed',String(this.focusMode));},'mv-r63-focus-btn');focus.setAttribute('aria-pressed','false');this.btnFocus=focus;
   const actions=node('div','mv-r63-header-actions');const close=button('✕ Đóng',()=>this.close(),'mv-r5-close');actions.append(focus,close);header.append(headline,actions);root.append(header);"""

replacement_build = """  _build(){
   const overlay=node('div','mv-r5-backdrop');overlay.hidden=true;overlay.id='mv-r5-browser';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Kho SGK và Lab tương tác Toán 6 đến 12');
   const root=node('section','mv-r5-window');overlay.append(root);
   this.root=root;
   const header=node('header','mv-r5-header');const headline=node('div','mv-r5-heading');headline.append(node('strong','', 'MATHVERSE · KHO SGK TOÁN 6–12'),node('small','', '7 khối lớp · 58 chương SGK (34 phòng) · 166 Lab bài học (76 Lab chuyên đề) · 310 mô hình/chế độ'));
   
   this.theme = (typeof localStorage !== 'undefined' && localStorage.getItem('mathverse_curriculum_theme')) || 'light';
   const themeBtn=button(this.theme==='dark'?'🌙 Đen Teal':'☀️ Trắng Teal',()=>{
     this.theme = this.theme === 'dark' ? 'light' : 'dark';
     try { localStorage.setItem('mathverse_curriculum_theme', this.theme); } catch(e){}
     this._applyTheme();
   },'mv-r63-theme-btn');
   this.themeBtn=themeBtn;

   const focus=button('⛶ Mở rộng hình',()=>{this.focusMode=!this.focusMode;overlay.classList.toggle('mv-r63-focus',this.focusMode);focus.textContent=this.focusMode?'⊞ Hiện danh mục':'⛶ Mở rộng hình';focus.setAttribute('aria-pressed',String(this.focusMode));},'mv-r63-focus-btn');focus.setAttribute('aria-pressed','false');this.btnFocus=focus;
   const actions=node('div','mv-r63-header-actions');const close=button('✕ Đóng',()=>this.close(),'mv-r5-close');actions.append(themeBtn,focus,close);header.append(headline,actions);root.append(header);"""

target_open = """  this.overlay.hidden=false;this.overlay.classList.toggle('mv-r63-focus',this.focusMode);document.body.classList.add('mv-r5-open');document.addEventListener('keydown',this.keyHandler);
  this.render();this.overlay.querySelector('.mv-r5-close').focus();"""

replacement_open = """  this.overlay.hidden=false;this.overlay.classList.toggle('mv-r63-focus',this.focusMode);document.body.classList.add('mv-r5-open');document.addEventListener('keydown',this.keyHandler);
  this._applyTheme();
  this.render();this.overlay.querySelector('.mv-r5-close').focus();"""

apply_theme_method = """  _applyTheme(){
   const isDark = this.theme === 'dark';
   this.overlay?.classList.toggle('mv-theme-dark', isDark);
   this.overlay?.classList.toggle('mv-theme-light', !isDark);
   this.root?.classList.toggle('mv-theme-dark', isDark);
   this.root?.classList.toggle('mv-theme-light', !isDark);
   if (this.themeBtn) {
     this.themeBtn.innerHTML = isDark ? '🌙 <span>Đen Teal</span>' : '☀️ <span>Trắng Teal</span>';
     this.themeBtn.title = isDark ? 'Đang bật giao diện Đen Teal. Bấm để chuyển sang ☀️ Trắng Teal' : 'Đang bật giao diện Trắng Teal. Bấm để chuyển sang 🌙 Đen Teal';
     this.themeBtn.setAttribute('aria-label', isDark ? 'Chế độ Đen Teal. Nhấn để chuyển sang Trắng Teal' : 'Chế độ Trắng Teal. Nhấn để chuyển sang Đen Teal');
   }
  }
"""

if target_build in explorer_content:
    explorer_content = explorer_content.replace(target_build, replacement_build)
    if target_open in explorer_content:
        explorer_content = explorer_content.replace(target_open, replacement_open)
    # Add _applyTheme right before _build
    explorer_content = explorer_content.replace("  _build(){", apply_theme_method + "  _build(){")
    with open(explorer_path, 'w', encoding='utf-8') as f:
        f.write(explorer_content)
    print("SUCCESS: Patched CurriculumExplorer.js")
else:
    print("WARNING: target_build not found in CurriculumExplorer.js")

# 2. Update src/r6-lab-layout.css to support both themes without !important collision
layout_path = 'src/r6-lab-layout.css'
with open(layout_path, 'r', encoding='utf-8') as f:
    layout_content = f.read()

# Replace lines 14-185 dark theme forced rules with scoped rules
target_layout_dark = """.mv-r5-window {
  width: min(var(--mv-r6-lab-max-width), 98vw) !important;
  height: min(960px, 96vh) !important;
  max-width: 98vw !important;
  background: #0f2133 !important;
  border: 1px solid rgba(83, 211, 197, 0.3) !important;
  box-shadow: 0 25px 90px rgba(0, 0, 0, 0.75), 0 0 40px rgba(22, 125, 128, 0.25) !important;
}"""

replacement_layout_dimensions = """.mv-r5-window {
  width: min(var(--mv-r6-lab-max-width), 98vw) !important;
  height: min(960px, 96vh) !important;
  max-width: 98vw !important;
  transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease !important;
}

/* Giao diện Đen Teal: Kích hoạt khi người dùng bật nút đổi màu */
.mv-r5-backdrop.mv-theme-dark .mv-r5-window,
.mv-r5-window.mv-theme-dark {
  background: #0f2133 !important;
  border: 1px solid rgba(83, 211, 197, 0.3) !important;
  box-shadow: 0 25px 90px rgba(0, 0, 0, 0.75), 0 0 40px rgba(22, 125, 128, 0.25) !important;
}"""

if target_layout_dark in layout_content:
    layout_content = layout_content.replace(target_layout_dark, replacement_layout_dimensions)
    with open(layout_path, 'w', encoding='utf-8') as f:
        f.write(layout_content)
    print("SUCCESS: Patched src/r6-lab-layout.css")
else:
    print("NOTE: target_layout_dark already updated or not found")

# 3. Append complete White-Teal & Dark-Teal Theme System to src/graphics-r74/graphics-ui.css
graphics_ui_path = 'src/graphics-r74/graphics-ui.css'
with open(graphics_ui_path, 'r', encoding='utf-8') as f:
    graphics_ui_content = f.read()

theme_css = """

/* ==========================================================================
   MATHVERSE R7.4 — PHÒNG SGK: HỆ THỐNG GIAO DIỆN TRẮNG TEAL & ĐEN TEAL
   - Mặc định: TRẮNG TEAL CHUẨN HÌNH ẢNH (Thanh lịch, rõ nét, tương phản cao)
   - Nút đổi màu trên thanh tiêu đề: ☀️ Trắng Teal / 🌙 Đen Teal
   - Nút bấm trực quan, rõ ràng, đẹp như tranh mẫu
   ========================================================================== */

/* ---------- 1. NÚT ĐỔI MÀU TRÊN THANH TIÊU ĐỀ ---------- */
.mv-r63-theme-btn {
  display: inline-flex !important;
  align-items: center !important;
  gap: 7px !important;
  padding: 8px 15px !important;
  font-weight: 800 !important;
  font-size: 13px !important;
  border-radius: 9px !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  user-select: none !important;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1) !important;
}

/* Nút ở chế độ Trắng Teal: Nổi bật, sang trọng */
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r63-theme-btn,
.mv-r5-backdrop.mv-theme-light .mv-r63-theme-btn {
  background: #ffffff !important;
  color: #0e7490 !important;
  border: 1.5px solid #ffffff !important;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(14, 116, 144, 0.12) !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r63-theme-btn:hover,
.mv-r5-backdrop.mv-theme-light .mv-r63-theme-btn:hover {
  background: #f0fdfa !important;
  color: #0891b2 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.25) !important;
}

/* Nút ở chế độ Đen Teal: Phong cách Neon Teal */
.mv-r5-backdrop.mv-theme-dark .mv-r63-theme-btn {
  background: #14384d !important;
  color: #53d3c5 !important;
  border: 1.5px solid #53d3c5 !important;
  box-shadow: 0 0 12px rgba(83, 211, 197, 0.3) !important;
}
.mv-r5-backdrop.mv-theme-dark .mv-r63-theme-btn:hover {
  background: #167d80 !important;
  color: #ffffff !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 0 16px rgba(83, 211, 197, 0.45) !important;
}

/* ---------- 2. GIAO DIỆN MẶC ĐỊNH: TRẮNG TEAL (LIGHT TEAL - CHUẨN HÌNH ẢNH) ---------- */

/* Cửa sổ Kho SGK */
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-window,
.mv-r5-backdrop.mv-theme-light .mv-r5-window {
  background: #ffffff !important;
  border: 1.5px solid #bce1ea !important;
  box-shadow: 0 25px 90px rgba(14, 116, 144, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.9) inset !important;
  border-radius: 20px !important;
  color: #0f2b3c !important;
}

/* Header Kho SGK: Dải màu Teal hiện đại */
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-header,
.mv-r5-backdrop.mv-theme-light .mv-r5-header {
  background: linear-gradient(95deg, #0e7490 0%, #0891b2 55%, #0f766e 100%) !important;
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.22) !important;
  color: #ffffff !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-heading strong,
.mv-r5-backdrop.mv-theme-light .mv-r5-heading strong {
  color: #ffffff !important;
  font-weight: 850 !important;
  letter-spacing: 0.3px !important;
  font-size: 16px !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-heading small,
.mv-r5-backdrop.mv-theme-light .mv-r5-heading small {
  color: #cffafe !important;
  font-weight: 600 !important;
  font-size: 11.5px !important;
}

/* Nút Mở rộng hình & Đóng */
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r63-focus-btn,
.mv-r5-backdrop.mv-theme-light .mv-r63-focus-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
  border: 1.5px solid rgba(255, 255, 255, 0.45) !important;
  border-radius: 9px !important;
  padding: 8px 14px !important;
  font-weight: 750 !important;
  transition: all 0.15s ease !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r63-focus-btn:hover,
.mv-r5-backdrop.mv-theme-light .mv-r63-focus-btn:hover {
  background: rgba(255, 255, 255, 0.35) !important;
  border-color: #ffffff !important;
}

.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-close,
.mv-r5-backdrop.mv-theme-light .mv-r5-close {
  background: rgba(239, 68, 68, 0.25) !important;
  color: #ffffff !important;
  border: 1.5px solid rgba(239, 68, 68, 0.6) !important;
  border-radius: 9px !important;
  padding: 8px 16px !important;
  font-weight: 750 !important;
  transition: all 0.15s ease !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-close:hover,
.mv-r5-backdrop.mv-theme-light .mv-r5-close:hover {
  background: rgba(239, 68, 68, 0.45) !important;
  border-color: #fee2e2 !important;
}

/* Toolbar chọn lớp & tìm kiếm */
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-toolbar,
.mv-r5-backdrop.mv-theme-light .mv-r5-toolbar {
  background: #eef7f9 !important;
  border-bottom: 1.5px solid #d5e8ef !important;
  color: #164e63 !important;
  padding: 10px 18px !important;
}

.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-grade,
.mv-r5-backdrop.mv-theme-light .mv-r5-grade {
  background: #ffffff !important;
  border: 1.5px solid #cbdfe8 !important;
  color: #164e63 !important;
  border-radius: 8px !important;
  font-weight: 750 !important;
  padding: 7px 11px !important;
  transition: all 0.15s ease !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-grade:hover,
.mv-r5-backdrop.mv-theme-light .mv-r5-grade:hover {
  background: #e0f4f7 !important;
  border-color: #0891b2 !important;
  color: #0e7490 !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-grade.selected,
.mv-r5-backdrop.mv-theme-light .mv-r5-grade.selected {
  background: linear-gradient(135deg, #0e7490, #0891b2) !important;
  color: #ffffff !important;
  border-color: #0891b2 !important;
  box-shadow: 0 2px 8px rgba(14, 116, 144, 0.3) !important;
}

.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-search,
.mv-r5-backdrop.mv-theme-light .mv-r5-search {
  background: #ffffff !important;
  border: 1.5px solid #cbdfe8 !important;
  color: #0f172a !important;
  border-radius: 9px !important;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05) !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-search:focus,
.mv-r5-backdrop.mv-theme-light .mv-r5-search:focus {
  border-color: #0891b2 !important;
  outline: 2px solid rgba(8, 145, 178, 0.25) !important;
}

.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-filter,
.mv-r5-backdrop.mv-theme-light .mv-r5-filter {
  color: #164e63 !important;
  font-weight: 700 !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-filter input,
.mv-r5-backdrop.mv-theme-light .mv-r5-filter input {
  accent-color: #0e7490 !important;
}

/* Cột danh mục bài học bên trái */
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-families,
.mv-r5-backdrop.mv-theme-light .mv-r5-families {
  background: #f1f7f9 !important;
  border-right: 1.5px solid #d5e8ef !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-cases,
.mv-r5-backdrop.mv-theme-light .mv-r5-cases {
  background: #f8fafc !important;
  border-right: 1.5px solid #d5e8ef !important;
}

.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-families h3,
.mv-r5-backdrop.mv-theme-light .mv-r5-families h3,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-cases h3,
.mv-r5-backdrop.mv-theme-light .mv-r5-cases h3 {
  color: #0f3b4c !important;
  font-weight: 800 !important;
  letter-spacing: 0.03em !important;
}

.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-family,
.mv-r5-backdrop.mv-theme-light .mv-r5-family,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-case,
.mv-r5-backdrop.mv-theme-light .mv-r5-case {
  background: #ffffff !important;
  border: 1.5px solid #dce8ee !important;
  border-radius: 9px !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03) !important;
  color: #0f2b3c !important;
  transition: all 0.15s ease !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-family strong,
.mv-r5-backdrop.mv-theme-light .mv-r5-family strong,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-case strong,
.mv-r5-backdrop.mv-theme-light .mv-r5-case strong {
  color: #0f2b3c !important;
  font-size: 13px !important;
  font-weight: 750 !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-family small,
.mv-r5-backdrop.mv-theme-light .mv-r5-family small,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-case small,
.mv-r5-backdrop.mv-theme-light .mv-r5-case small {
  color: #52798e !important;
  font-size: 11px !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-case-id,
.mv-r5-backdrop.mv-theme-light .mv-r5-case-id {
  color: #0e7490 !important;
  font-weight: 800 !important;
}

.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-family:hover,
.mv-r5-backdrop.mv-theme-light .mv-r5-family:hover,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-case:hover,
.mv-r5-backdrop.mv-theme-light .mv-r5-case:hover {
  background: #f0f9fa !important;
  border-color: #38bdf8 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 3px 10px rgba(14, 116, 144, 0.09) !important;
}

.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-family.active,
.mv-r5-backdrop.mv-theme-light .mv-r5-family.active,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-case.active,
.mv-r5-backdrop.mv-theme-light .mv-r5-case.active {
  background: linear-gradient(135deg, #ecfdf5, #e0f2fe) !important;
  border: 2px solid #0d9488 !important;
  box-shadow: 0 3px 12px rgba(13, 148, 136, 0.18) !important;
}

.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-status.ready,
.mv-r5-backdrop.mv-theme-light .mv-r5-status.ready {
  background: #dcfce7 !important;
  color: #166534 !important;
  font-weight: 750 !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-status.pending,
.mv-r5-backdrop.mv-theme-light .mv-r5-status.pending {
  background: #fef3c7 !important;
  color: #92400e !important;
  font-weight: 750 !important;
}

/* Sân khấu chính Stage (Nền trắng tinh khiết, tương phản chữ cao) */
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-stage,
.mv-r5-backdrop.mv-theme-light .mv-r5-stage {
  background: #ffffff !important;
  color: #0f2b3c !important;
}

.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-stage-header h2,
.mv-r5-backdrop.mv-theme-light .mv-r5-stage-header h2 {
  color: #0f2b3c !important;
  font-weight: 850 !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-stage-header small,
.mv-r5-backdrop.mv-theme-light .mv-r5-stage-header small {
  color: #0284c7 !important;
  font-weight: 750 !important;
}

.mv-r5-backdrop:not(.mv-theme-dark) .mv-r11-holo-jump-btn,
.mv-r5-backdrop.mv-theme-light .mv-r11-holo-jump-btn {
  background: linear-gradient(135deg, #0e7490, #0891b2) !important;
  color: #ffffff !important;
  border: 1.5px solid #0891b2 !important;
  box-shadow: 0 2px 8px rgba(14, 116, 144, 0.25) !important;
}

/* Thẻ khám phá 3 bước */
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r11-discovery-card,
.mv-r5-backdrop.mv-theme-light .mv-r11-discovery-card {
  background: linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%) !important;
  border: 1.5px solid #bce1ea !important;
  border-radius: 14px !important;
  box-shadow: 0 4px 16px rgba(14, 116, 144, 0.05) !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r11-disc-title strong,
.mv-r5-backdrop.mv-theme-light .mv-r11-disc-title strong {
  color: #0f2b3c !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r11-disc-step,
.mv-r5-backdrop.mv-theme-light .mv-r11-disc-step {
  background: #ffffff !important;
  border: 1.5px solid #d5e8ef !important;
  border-radius: 10px !important;
  color: #0f2b3c !important;
}

/* Khung hình ảnh / Đồ thị SVG / 3D Canvas (Chuẩn hình ảnh cô gửi) */
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-viewbox,
.mv-r5-backdrop.mv-theme-light .mv-r5-viewbox,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-g7-viewport,
.mv-r5-backdrop.mv-theme-light .mv-g7-viewport,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-g7-net,
.mv-r5-backdrop.mv-theme-light .mv-g7-net,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-g6-viewport,
.mv-r5-backdrop.mv-theme-light .mv-g6-viewport {
  background: #ffffff !important;
  border: 1.5px solid #d4ebf2 !important;
  border-radius: 14px !important;
  box-shadow: 0 4px 18px rgba(14, 116, 144, 0.05) !important;
}

/* Thẻ trạng thái & Kết luận học tập (Xanh mint thanh mát) */
.mv-r5-backdrop:not(.mv-theme-dark) .mv-g7-status,
.mv-r5-backdrop.mv-theme-light .mv-g7-status,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-triangle-status.valid,
.mv-r5-backdrop.mv-theme-light .mv-r5-triangle-status.valid,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-g6-status,
.mv-r5-backdrop.mv-theme-light .mv-g6-status {
  background: #ecfdf5 !important;
  border: 1.5px solid #a7f3d0 !important;
  color: #065f46 !important;
  border-radius: 10px !important;
  font-weight: 750 !important;
  padding: 10px 14px !important;
}

/* Thẻ số liệu & Giá trị đo đạc (Chuẩn chip Nghiệm 1, Nghiệm 2, Chu kỳ) */
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-values,
.mv-r5-backdrop.mv-theme-light .mv-r5-values {
  gap: 10px !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-value,
.mv-r5-backdrop.mv-theme-light .mv-r5-value {
  background: #f0f9fa !important;
  border: 1.5px solid #d1ebf2 !important;
  border-radius: 10px !important;
  box-shadow: 0 2px 6px rgba(14, 116, 144, 0.04) !important;
  color: #0f2b3c !important;
  padding: 10px 14px !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-value small,
.mv-r5-backdrop.mv-theme-light .mv-r5-value small {
  color: #52798e !important;
  font-weight: 700 !important;
  font-size: 11px !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-value strong,
.mv-r5-backdrop.mv-theme-light .mv-r5-value strong {
  color: #0e7490 !important;
  font-size: 16px !important;
  font-weight: 800 !important;
}

/* CÁC NÚT BẤM RÕ RÀNG, ĐẸP NHƯ HÌNH (▶ Phát chuyển động, ⏭ Tiếp bước, ↺ Đặt lại) */
.mv-r5-backdrop:not(.mv-theme-dark) .mv-g7-button,
.mv-r5-backdrop.mv-theme-light .mv-g7-button,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-action,
.mv-r5-backdrop.mv-theme-light .mv-r5-action,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-copy,
.mv-r5-backdrop.mv-theme-light .mv-r5-copy,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-g7-buttons button,
.mv-r5-backdrop.mv-theme-light .mv-g7-buttons button,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-g6-button,
.mv-r5-backdrop.mv-theme-light .mv-g6-button {
  background: #e0f4f7 !important;
  border: 1.5px solid #0891b2 !important;
  color: #0891b2 !important;
  border-radius: 9px !important;
  padding: 8px 16px !important;
  font-weight: 750 !important;
  font-size: 13px !important;
  box-shadow: 0 2px 6px rgba(8, 145, 178, 0.1) !important;
  cursor: pointer !important;
  transition: all 0.15s cubic-bezier(0.2, 0, 0, 1) !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 7px !important;
}

.mv-r5-backdrop:not(.mv-theme-dark) .mv-g7-button:hover,
.mv-r5-backdrop.mv-theme-light .mv-g7-button:hover,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-action:hover,
.mv-r5-backdrop.mv-theme-light .mv-r5-action:hover,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-copy:hover,
.mv-r5-backdrop.mv-theme-light .mv-r5-copy:hover,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-g7-buttons button:hover,
.mv-r5-backdrop.mv-theme-light .mv-g7-buttons button:hover,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-g6-button:hover,
.mv-r5-backdrop.mv-theme-light .mv-g6-button:hover {
  background: #cbf0f5 !important;
  border-color: #0e7490 !important;
  color: #0c4a6e !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(8, 145, 178, 0.22) !important;
}

.mv-r5-backdrop:not(.mv-theme-dark) .mv-g7-button:active,
.mv-r5-backdrop.mv-theme-light .mv-g7-button:active,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-action:active,
.mv-r5-backdrop.mv-theme-light .mv-r5-action:active {
  transform: translateY(0) !important;
}

/* Khung kéo tham số & Thanh tiến trình */
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-params,
.mv-r5-backdrop.mv-theme-light .mv-r5-params,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-g7-timeline,
.mv-r5-backdrop.mv-theme-light .mv-g7-timeline {
  background: #f6fafb !important;
  border: 1.5px solid #d5e8ef !important;
  border-radius: 12px !important;
  padding: 12px 16px !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-param,
.mv-r5-backdrop.mv-theme-light .mv-r5-param {
  color: #334155 !important;
  font-weight: 650 !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-param output,
.mv-r5-backdrop.mv-theme-light .mv-r5-param output {
  color: #0e7490 !important;
  font-weight: 800 !important;
}
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-param input,
.mv-r5-backdrop.mv-theme-light .mv-r5-param input,
.mv-r5-backdrop:not(.mv-theme-dark) .mv-g7-timeline input,
.mv-r5-backdrop.mv-theme-light .mv-g7-timeline input {
  accent-color: #0e7490 !important;
}

/* Nút Sao chép công thức LaTeX (Dạng thanh ngang rộng đầy đặn) */
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-copy,
.mv-r5-backdrop.mv-theme-light .mv-r5-copy {
  background: #e6f7fa !important;
  border: 1.5px solid #99d5e0 !important;
  color: #0e7490 !important;
  border-radius: 9px !important;
  font-weight: 750 !important;
  width: 100% !important;
  justify-content: center !important;
  padding: 10px 16px !important;
  margin-top: 10px !important;
}

/* Khung công thức LaTeX (Hộp code chữ sạch sẽ) */
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-latex,
.mv-r5-backdrop.mv-theme-light .mv-r5-latex {
  background: #f1f7f9 !important;
  border: 1.5px solid #d5e8ef !important;
  border-left: 4px solid #0e7490 !important;
  border-radius: 10px !important;
  color: #0f2b3c !important;
  padding: 12px 16px !important;
  font-size: 13.5px !important;
}

/* Footer chân trang */
.mv-r5-backdrop:not(.mv-theme-dark) .mv-r5-footer,
.mv-r5-backdrop.mv-theme-light .mv-r5-footer {
  background: #f0f7f9 !important;
  border-top: 1.5px solid #d5e4ec !important;
  color: #64748b !important;
  font-size: 12px !important;
}
"""

if "HỆ THỐNG GIAO DIỆN TRẮNG TEAL & ĐEN TEAL" not in graphics_ui_content:
    graphics_ui_content += theme_css
    with open(graphics_ui_path, 'w', encoding='utf-8') as f:
        f.write(graphics_ui_content)
    print("SUCCESS: Appended theme system to src/graphics-r74/graphics-ui.css")
else:
    print("NOTE: Theme system already present in src/graphics-r74/graphics-ui.css")

