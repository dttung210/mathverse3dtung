import os
import sys
import zipfile
from pathlib import Path

def create_full_zip(src_dir, dest_zip):
    src = Path(src_dir).resolve()
    dest = Path(dest_zip).resolve()
    dest.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"Creating Full Zip: {src} -> {dest} ...")
    count = 0
    with zipfile.ZipFile(dest, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(src):
            for file in files:
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
    
    full_zip = "G:/ANTIGRAVITY/MATHVERSE GAME/MATHVERSE_GRAND_CAMPUS_TOI_UU_GIAO_DIEN_TAP_TRUNG_HINH_VE_V18_2026-11-03.zip"
    create_full_zip(src, full_zip)

    # Also update the release zip
    release_zip = "G:/ANTIGRAVITY/MATHVERSE GAME/MATHVERSE_GRAND_CAMPUS_NANG_CAP_18_DANH_NHAN_DO_DO_V18_2026-11-03.zip"
    create_full_zip(src, release_zip)

    patch_files = [
        "src/curriculum/CurriculumExplorer.js",
        "src/r63-kho-ui.css",
        "src/graphics-r74/graphics-ui.css",
        "src/main.js",
        "dual/wonder-park-v8-bank.mjs",
        "dual/wonder-park-ui.mjs",
        "game-park/kho-cau-hoi.html",
        "server/host.mjs",
        "index.html",
        "00_VAO_THANG_PHONG_LAB.bat"
    ]
    patch_zip = "G:/ANTIGRAVITY/MATHVERSE GAME/PATCH_TOI_UU_GIAO_DIEN_TAP_TRUNG_HINH_VE_V18_2026-11-03.zip"
    create_patch_zip(src, patch_zip, patch_files)

