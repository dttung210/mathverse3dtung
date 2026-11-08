import os
import sys
import zipfile
from pathlib import Path

def create_zip(src_dir, dest_zip):
    src = Path(src_dir).resolve()
    dest = Path(dest_zip).resolve()
    dest.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"Zipping {src} -> {dest} ...")
    count = 0
    with zipfile.ZipFile(dest, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(src):
            # Skip git / backup temp if desired, but keep all project files
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

if __name__ == '__main__':
    src = "G:/ANTIGRAVITY/MATHVERSE GAME/MATHVERSE_FINAL_DA_SUA_TRUC_TIEP_2026-11-02/MATHVERSE_GRAND_CAMPUS_FINAL_TOAN_6_12"
    dest = "G:/ANTIGRAVITY/MATHVERSE GAME/MATHVERSE_GRAND_CAMPUS_NANG_CAP_18_DANH_NHAN_DO_DO_V18_2026-11-03.zip"
    create_zip(src, dest)

