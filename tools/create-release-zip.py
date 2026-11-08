import os
import zipfile
import sys
import shutil

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.abspath('.')
OUT_DIR = r'G:\ANTIGRAVITY\MATH_3D_MUSEUM'

ZIP_NAMES = [
    'MATHVERSE_R75_HOAN_CHINH.zip',
    'MATHVERSE_R75_FULL_3D_GRAPHICS_HOAN_CHINH.zip',
    'MATHVERSE_R75_FULL_TOAN_6_12_HOAN_CHINH_2026-10-31.zip',
    'MATHVERSE_R75_NANG_CAP_DO_HOA_3D_HOAN_THIEN.zip'
]

PRIMARY_ZIP = os.path.join(OUT_DIR, ZIP_NAMES[0])

print(f'=== BẮT ĐẦU ĐÓNG GÓI BẢN PHÁT HÀNH MATHVERSE R75 HOÀN CHỈNH ===')
print(f'Thư mục nguồn: {ROOT_DIR}')
print(f'Thư mục đích:   {OUT_DIR}')

EXCLUDE_DIRS = {'.git', 'node_modules', '.idea', '.vscode'}
EXCLUDE_EXTS = {'.zip'}

file_count = 0
with zipfile.ZipFile(PRIMARY_ZIP, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
    for root, dirs, files in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in EXCLUDE_EXTS:
                continue
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, ROOT_DIR)
            zf.write(full_path, rel_path)
            file_count += 1

size_mb = os.path.getsize(PRIMARY_ZIP) / (1024 * 1024)
print(f'Đã đóng gói thành công tệp chính: {PRIMARY_ZIP} ({file_count} tệp, {size_mb:.2f} MB)')

# Copy to other release zip aliases for convenient access
for alias in ZIP_NAMES[1:]:
    alias_path = os.path.join(OUT_DIR, alias)
    shutil.copyfile(PRIMARY_ZIP, alias_path)
    print(f'Đã tạo bản sao danh xưng: {alias_path}')

# Sync to unzipped folder MATHVERSE_R75_FULL_3D_GRAPHICS_HOAN_CHINH
FOLDER_R75 = os.path.join(OUT_DIR, 'MATHVERSE_R75_FULL_3D_GRAPHICS_HOAN_CHINH')
print(f'Đang đồng bộ thư mục giải nén sẵn: {FOLDER_R75}...')
if os.path.exists(FOLDER_R75):
    shutil.rmtree(FOLDER_R75)

shutil.copytree(
    ROOT_DIR,
    FOLDER_R75,
    ignore=shutil.ignore_patterns('.git', 'node_modules', '*.zip', '.idea', '.vscode')
)
print(f'Đã tạo thư mục giải nén sẵn: {FOLDER_R75}')

print('=== HOÀN TẤT ĐÓNG GÓI TOÀN BỘ PHIÊN BẢN R75 ===')
