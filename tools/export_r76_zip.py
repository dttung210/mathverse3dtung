import os, sys, zipfile
from pathlib import Path

def create_full_zip(src_dir, dest_zip):
    src = Path(src_dir).resolve()
    dest = Path(dest_zip).resolve()
    dest.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"Creating Full Zip: {src} -> {dest} ...")
    count = 0
    with zipfile.ZipFile(dest, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(src):
            # Skip node_modules or git if present
            dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules', '__pycache__')]
            for file in files:
                if file.endswith('.zip'):
                    continue
                full_path = Path(root) / file
                rel_path = full_path.relative_to(src)
                try:
                    with open(full_path, 'rb') as f:
                        zf.writestr(str(rel_path).replace('\\', '/'), f.read())
                    count += 1
                except Exception as e:
                    print(f"Warning: could not add {rel_path}: {e}")
    print(f"Successfully zipped {count} files to {dest} ({dest.stat().st_size / 1024 / 1024:.2f} MB)")

def create_patch_zip(src_dir, dest_zip, files_to_include):
    src = Path(src_dir).resolve()
    dest = Path(dest_zip).resolve()
    dest.parent.mkdir(parents=True, exist_ok=True)

    print(f"Creating Patch Zip: {dest} ...")
    count = 0
    with zipfile.ZipFile(dest, 'w', zipfile.ZIP_DEFLATED) as zf:
        for rel_file in files_to_include:
            full_path = src / rel_file
            if full_path.is_file():
                with open(full_path, 'rb') as f:
                    zf.writestr(rel_file.replace('\\', '/'), f.read())
                count += 1
            else:
                print(f"Warning: file not found: {full_path}")
    print(f"Successfully packaged {count} patch files to {dest} ({dest.stat().st_size / 1024 / 1024:.2f} MB)")

if __name__ == '__main__':
    src = "G:/ANTIGRAVITY/MATHVERSE GAME/MATHVERSE_FINAL_DA_SUA_TRUC_TIEP_2026-11-02/MATHVERSE_GRAND_CAMPUS_FINAL_TOAN_6_12"
    
    full_zip = "G:/ANTIGRAVITY/MATHVERSE GAME/MATHVERSE_GRAND_CAMPUS_NANG_CAP_R76_CHUYEN_DONG_2026-11-04.zip"
    create_full_zip(src, full_zip)

    patch_zip = "G:/ANTIGRAVITY/MATHVERSE GAME/MATHVERSE_PATCH_R76_CHUYEN_DONG_2026-11-04.zip"
    patch_files = [
        "00_DOC_TRUOC_SUA_CHUYEN_DONG_R76.md",
        "BAO_CAO_KIEM_THU_R76.md",
        "AUDIT_310_MODELS_R76.csv",
        "THAM_KHAO_MA_TRAN_42_MODELS.csv",
        "audit-before.csv",
        "audit-r76-after.csv",
        "src/curriculum/educational-motion.mjs",
        "src/curriculum/grade11-engine.mjs",
        "src/curriculum/grade12-engine.mjs",
        "src/curriculum/Grade7Lab.js",
        "src/curriculum/Grade8Lab.js",
        "src/curriculum/Grade9Lab.js",
        "src/curriculum/Grade11Lab.js",
        "src/curriculum/Grade12Lab.js",
        "src/math6-lab/catalog-motion.mjs",
        "src/museum/learning-motion.mjs",
        "src/museum/r11-holo-stage.js",
        "src/museum/r6-spatial-manager.js",
        "src/museum/r65-grade6-display.mjs",
        "src/museum/r67-mode-exhibits.mjs",
        "src/museum.js",
        "src/geometry.js",
        "src/viewers/Solid3DViewer.js",
        "tests/r76-educational-motion.test.mjs",
        "tools/audit-r76-310.mjs",
        "test_harness_r76_motion.html",
        "tools/verify_r76_webgl.py"
    ]
    create_patch_zip(src, patch_zip, patch_files)

