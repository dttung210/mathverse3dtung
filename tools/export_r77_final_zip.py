import os, sys, zipfile, hashlib
from pathlib import Path

PROJ = Path(r"G:\ANTIGRAVITY\MATHVERSE GAME\MATHVERSE_FINAL_DA_SUA_TRUC_TIEP_2026-11-02\MATHVERSE_GRAND_CAMPUS_FINAL_TOAN_6_12").resolve()
OUT_DIR = Path(r"G:\ANTIGRAVITY\MATHVERSE GAME").resolve()

def sha256_file(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def create_full_zip(dest_zip):
    print(f"Creating Full Release ZIP: {dest_zip.name}...")
    count = 0
    with zipfile.ZipFile(dest_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(PROJ):
            dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules', '__pycache__', '.mathverse_backups')]
            for file in files:
                if file.endswith('.zip'):
                    continue
                full_p = Path(root) / file
                rel_p = str(full_p.relative_to(PROJ)).replace('\\', '/')
                zf.write(full_p, rel_p)
                count += 1
    size_mb = dest_zip.stat().st_size / 1024 / 1024
    h = sha256_file(dest_zip)
    print(f"-> Full ZIP created: {count} files, {size_mb:.2f} MB | SHA256: {h}")
    return count, size_mb, h

def create_patch_zip(dest_zip, patch_files):
    print(f"Creating Patch Release ZIP: {dest_zip.name}...")
    count = 0
    with zipfile.ZipFile(dest_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
        for rel in patch_files:
            full_p = PROJ / rel
            if full_p.is_file():
                zf.write(full_p, rel.replace('\\', '/'))
                count += 1
            else:
                print(f"Warning: missing {rel}")
    size_mb = dest_zip.stat().st_size / 1024 / 1024
    h = sha256_file(dest_zip)
    print(f"-> Patch ZIP created: {count} files, {size_mb:.2f} MB | SHA256: {h}")
    return count, size_mb, h

if __name__ == '__main__':
    full_zip = OUT_DIR / "MATHVERSE_GRAND_CAMPUS_NANG_CAP_R77_7_GIAI_DOAN_2026-11-04.zip"
    create_full_zip(full_zip)

    patch_zip = OUT_DIR / "MATHVERSE_PATCH_R77_7_GIAI_DOAN_2026-11-04.zip"
    patch_files = [
        "00_BAT_DAU_MATHVERSE_R77.md",
        "BAO_CAO_R77_7_GIAI_DOAN.md",
        "PROMPT_ANTIGRAVITY_R77_7_GIAI_DOAN.md",
        "MATHVERSE_R77_AUDIT_310_7_GIAI_DOAN.csv",
        "MATHVERSE_R77_AUDIT_SUMMARY.json",
        "XEM_310_MO_HINH_R77.html",
        "07_GIAI_DOAN_R77/GIAI_DOAN_01_TOAN_6.md",
        "07_GIAI_DOAN_R77/GIAI_DOAN_02_TOAN_7.md",
        "07_GIAI_DOAN_R77/GIAI_DOAN_03_TOAN_8.md",
        "07_GIAI_DOAN_R77/GIAI_DOAN_04_TOAN_9.md",
        "07_GIAI_DOAN_R77/GIAI_DOAN_05_TOAN_10.md",
        "07_GIAI_DOAN_R77/GIAI_DOAN_06_TOAN_11.md",
        "07_GIAI_DOAN_R77/GIAI_DOAN_07_TOAN_12.md",
        "src/museum/r67-mode-exhibits.mjs",
        "src/museum/learning-motion.mjs",
        "src/museum/r6-spatial-manager.js",
        "src/museum/r11-holo-stage.js",
        "src/math6-lab/catalog-motion.mjs",
        "src/curriculum/educational-motion.mjs",
        "src/curriculum/Grade6Lab.js",
        "src/curriculum/Grade7Lab.js",
        "src/curriculum/Grade8Lab.js",
        "src/curriculum/Grade9Lab.js",
        "src/curriculum/Grade10Lab.js",
        "src/curriculum/Grade11Lab.js",
        "src/curriculum/Grade12Lab.js",
        "src/curriculum/FunctionGraphLab.js",
        "tests/r77-seven-grades-actual-motion.test.mjs",
        "tools/audit-r77-seven-stages.mjs",
        "test_harness_r77_stages.html",
        "tools/run_r77_seven_stages_verification.py"
    ]
    create_patch_zip(patch_zip, patch_files)

