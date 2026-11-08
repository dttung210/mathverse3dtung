import os, zipfile, sys

SRC_DIR = r"G:\ANTIGRAVITY\MATH_3D_MUSEUM\MATHVERSE_R75_GRAND_CAMPUS_V11_ARCHITECTURE_NPC_ZOOM_FULL\MATHVERSE_R75_GRAND_CAMPUS_V11"
ZIP_PATH = r"G:\ANTIGRAVITY\MATH_3D_MUSEUM\MATHVERSE_GRAND_CAMPUS_V17_7_PHONG_CHU_S.zip"

EXCLUDE_DIRS = {'.git', '.vscode', '.idea', '__pycache__', 'node_modules', '_mathverse_backups'}
EXCLUDE_EXTS = {'.tmp', '.log', '.crswap'}

def create_zip():
    print(f"Creating ZIP archive: {ZIP_PATH}")
    count = 0
    total_size = 0
    with zipfile.ZipFile(ZIP_PATH, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for root, dirs, files in os.walk(SRC_DIR):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in EXCLUDE_EXTS:
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, SRC_DIR)
                arcname = os.path.join("MATHVERSE_GRAND_CAMPUS_V17", rel_path)
                zf.write(full_path, arcname)
                count += 1
                total_size += os.path.getsize(full_path)
                if count % 200 == 0:
                    print(f"Archived {count} files...")
    
    zip_size_mb = os.path.getsize(ZIP_PATH) / (1024 * 1024)
    print(f"=== COMPLETED: Archived {count} files, ZIP size: {zip_size_mb:.2f} MB ===")

if __name__ == '__main__':
    create_zip()

