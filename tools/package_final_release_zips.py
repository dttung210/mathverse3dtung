import os
import sys
import zipfile
import hashlib
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

PROJ = Path(r"G:\ANTIGRAVITY\MATHVERSE GAME\MATHVERSE_FINAL_DA_SUA_TRUC_TIEP_2026-11-02\MATHVERSE_GRAND_CAMPUS_FINAL_TOAN_6_12").resolve()
OUT_DIR = Path(r"G:\ANTIGRAVITY\MATHVERSE GAME").resolve()

def sha256_file(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def package_full(dest_path):
    print(f"Creating Full Release ZIP: {dest_path.name}...")
    count = 0
    with zipfile.ZipFile(dest_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(PROJ):
            dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules', '__pycache__', '.mathverse_backups')]
            for file in files:
                if file.endswith('.zip'):
                    continue
                full_p = Path(root) / file
                rel_p = str(full_p.relative_to(PROJ)).replace('\\', '/')
                zf.write(full_p, rel_p)
                count += 1
    size_mb = os.path.getsize(dest_path) / (1024 * 1024)
    h = sha256_file(dest_path)
    print(f"-> Done {dest_path.name}: {count} files, {size_mb:.2f} MB, SHA256: {h}")
    return count, size_mb, h

def package_patch(dest_path):
    print(f"Creating Patch ZIP: {dest_path.name}...")
    patch_rel_files = [
        "src/museum/learning-motion.mjs",
        "src/museum/r67-mode-exhibits.mjs",
        "src/museum/r65-grade6-display.mjs",
        "src/museum/r6-spatial-manager.js",
        "src/museum/r11-holo-stage.js",
        "src/math6-lab/catalog-motion.mjs",
        "src/curriculum/Grade7Lab.js",
        "src/curriculum/Grade8Lab.js",
        "src/curriculum/Grade9Lab.js",
        "src/curriculum/Grade10Lab.js",
        "src/curriculum/Grade11Lab.js",
        "src/curriculum/Grade12Lab.js",
        "src/curriculum/grade11-engine.mjs",
        "src/curriculum/grade12-engine.mjs",
        "src/curriculum/educational-motion.mjs",
        "src/geometry.js",
        "src/viewers/Solid3DViewer.js",
        "server/server.mjs",
        "tests/r77-seven-grades-actual-motion.test.mjs",
        "tests/r76-educational-motion.test.mjs",
        "tests/geometry-v3-42-spec.test.mjs",
        "tools/audit-r77-seven-stages.mjs",
        "tools/run_r77_seven_stages_verification.py",
        "tools/export_r77_final_zip.py",
        "test_harness_r77_stages.html",
        "00_HUONG_DAN_CHO_CO_GIAO.txt",
        "BAO_CAO_NGHIEM_THU_7_GIAI_DOAN_CHUYEN_DONG_R77.md",
        "MATHVERSE_R77_AUDIT_310_7_GIAI_DOAN.csv"
    ]
    count = 0
    with zipfile.ZipFile(dest_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for rel in patch_rel_files:
            fp = PROJ / rel
            if fp.exists():
                zf.write(fp, rel)
                count += 1
            else:
                print(f"Warning: {rel} not found")
    size_mb = os.path.getsize(dest_path) / (1024 * 1024)
    h = sha256_file(dest_path)
    print(f"-> Done {dest_path.name}: {count} files, {size_mb:.2f} MB, SHA256: {h}")
    return count, size_mb, h

if __name__ == '__main__':
    # 1. Clean, direct name for Cô:
    f1 = OUT_DIR / "MATHVERSE_R77_HOAN_CHINH.zip"
    c1, s1, h1 = package_full(f1)

    # 2. Detailed named full package:
    f2 = OUT_DIR / "MATHVERSE_GRAND_CAMPUS_NANG_CAP_R77_7_GIAI_DOAN_2026-11-04.zip"
    c2, s2, h2 = package_full(f2)

    # 3. Patch package:
    f3 = OUT_DIR / "MATHVERSE_PATCH_R77_7_GIAI_DOAN_2026-11-04.zip"
    c3, s3, h3 = package_patch(f3)

    print("\nALL ZIPS CREATED SUCCESSFULLY!")

