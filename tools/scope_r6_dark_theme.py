import re

path = 'src/r6-lab-layout.css'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's inspect what's inside lines 30-185
pattern = r'/\* Header Kho chuyên đề theo Museum Atlas \*/[\s\S]*?/\* 3\. MỞ RỘNG KHÔNG GIAN LABSHELL'

match = re.search(pattern, content)
if match:
    dark_block = match.group(0)
    # Prefix all top-level selectors with .mv-theme-dark or .mv-r5-backdrop.mv-theme-dark
    scoped_lines = []
    # Let's write the clean dark theme block
    clean_dark_block = """/* ==========================================================================
   GIAO DIỆN ĐEN TEAL: KÍCH HOẠT KHI NGƯỜI DÙNG BẬT NÚT ĐỔI MÀU (THEME: DARK)
   ========================================================================== */
.mv-r5-backdrop.mv-theme-dark .mv-r5-header {
  background: linear-gradient(95deg, #0b1726, #142b3d 60%, #167d80) !important;
  border-bottom: 1px solid rgba(83, 211, 197, 0.2) !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-toolbar {
  background: #112638 !important;
  border-bottom: 1px solid rgba(83, 211, 197, 0.15) !important;
  color: #eaf4f4 !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-grade {
  background: #162f45 !important;
  border: 1px solid rgba(175, 200, 209, 0.2) !important;
  color: #afc8d1 !important;
  transition: all 0.2s ease !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-grade.selected {
  background: linear-gradient(135deg, #167d80, #1b9b9e) !important;
  color: #ffffff !important;
  border-color: #53d3c5 !important;
  box-shadow: 0 0 12px rgba(83, 211, 197, 0.35) !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-search {
  background: #0c1d2e !important;
  border: 1px solid rgba(83, 211, 197, 0.25) !important;
  color: #eaf4f4 !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-search::placeholder {
  color: #6d8e9e !important;
}

/* 2. CẤU TRÚC 3 CỘT CHO MÀN HÌNH RỘNG */
@media (min-width: 1400px) {
  .mv-r5-body {
    grid-template-columns: 220px 240px 1fr !important;
  }
  
  .mv-r5-backdrop.mv-theme-dark .mv-r5-families {
    background: #0d1e2e !important;
    border-right: 1px solid rgba(83, 211, 197, 0.12) !important;
  }
  
  .mv-r5-backdrop.mv-theme-dark .mv-r5-cases {
    background: #102437 !important;
    border-right: 1px solid rgba(83, 211, 197, 0.12) !important;
  }

  .mv-r5-backdrop.mv-theme-dark .mv-r5-stage {
    padding: 24px 30px !important;
    background: #0c1c2b !important;
    color: #eaf4f4 !important;
  }

  .mv-r5-viewbox {
    height: clamp(380px, 48vh, 520px) !important;
    border: 1.5px solid #d4ebf2 !important;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08) !important;
    background: #ffffff !important;
  }

  .mv-g7-viewport {
    height: clamp(380px, 52vh, 560px) !important;
    border: 1.5px solid #d4ebf2 !important;
    background: #ffffff !important;
  }
}

@media (min-width: 1700px) {
  .mv-r5-body {
    grid-template-columns: 240px 260px 1fr !important;
  }

  .mv-r5-viewbox {
    height: clamp(420px, 52vh, 580px) !important;
  }

  .mv-g7-viewport {
    height: clamp(420px, 55vh, 600px) !important;
  }
}

/* Thẻ Family & Case trong theme tối */
.mv-r5-backdrop.mv-theme-dark .mv-r5-families {
  background: #0d1e2e !important;
}
.mv-r5-backdrop.mv-theme-dark .mv-r5-cases {
  background: #102437 !important;
}
.mv-r5-backdrop.mv-theme-dark .mv-r5-stage {
  background: #0c1c2b !important;
  color: #eaf4f4 !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-family,
.mv-r5-backdrop.mv-theme-dark .mv-r5-case {
  background: #142b3d !important;
  border: 1px solid rgba(83, 211, 197, 0.14) !important;
  color: #eaf4f4 !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-family strong,
.mv-r5-backdrop.mv-theme-dark .mv-r5-case strong {
  color: #eaf4f4 !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-family small,
.mv-r5-backdrop.mv-theme-dark .mv-r5-case small {
  color: #afc8d1 !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-family:hover,
.mv-r5-backdrop.mv-theme-dark .mv-r5-case:hover {
  background: #18374e !important;
  border-color: #53d3c5 !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-family.active,
.mv-r5-backdrop.mv-theme-dark .mv-r5-case.active {
  background: rgba(22, 125, 128, 0.35) !important;
  border-color: #53d3c5 !important;
  box-shadow: 0 0 14px rgba(83, 211, 197, 0.25) !important;
  outline: none !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-stage-header h2 {
  color: #ffffff !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-stage-header small {
  color: #53d3c5 !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-statement {
  color: #cde4ec !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-params {
  background: #102334 !important;
  border: 1px solid rgba(83, 211, 197, 0.15) !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-param {
  color: #afc8d1 !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-param output {
  color: #53d3c5 !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-latex {
  background: #091724 !important;
  border: 1px solid rgba(83, 211, 197, 0.2) !important;
  color: #f2cf90 !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-action,
.mv-r5-backdrop.mv-theme-dark .mv-r5-copy {
  background: #133348 !important;
  border: 1px solid rgba(83, 211, 197, 0.28) !important;
  color: #eaf4f4 !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-action:hover,
.mv-r5-backdrop.mv-theme-dark .mv-r5-copy:hover {
  background: #167d80 !important;
  border-color: #53d3c5 !important;
}

.mv-r5-backdrop.mv-theme-dark .mv-r5-footer {
  background: #0b1726 !important;
  border-top: 1px solid rgba(83, 211, 197, 0.15) !important;
  color: #8daab6 !important;
}

/* 3. MỞ RỘNG KHÔNG GIAN LABSHELL"""
    content = content[:match.start()] + clean_dark_block + content[match.end():]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Scoped r6-lab-layout dark rules to .mv-theme-dark")
else:
    print("WARNING: Pattern not matched in r6-lab-layout.css")

