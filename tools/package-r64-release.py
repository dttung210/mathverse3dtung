#!/usr/bin/env python3
import os
import sys
import zipfile
import hashlib
from pathlib import Path

source_dir = Path(__file__).resolve().parent.parent
target_zip = Path(r"G:\ANTIGRAVITY\MATH_3D_MUSEUM\MATHVERSE_R6_4_RELEASE\MATHVERSE_R6_4_FULL_TOAN_6_12_MO_HINH_3D_KIEM_LOI.zip")
target_zip.parent.mkdir(parents=True, exist_ok=True)

print("================================================================")
print("  DONG GOI BO CAI PHAT HANH MATHVERSE R6.4")
print("================================================================")
print(f"Source: {source_dir}")
print(f"Output: {target_zip}")

root_archive_dir = "MATHVERSE_R6_4_FULL_TOAN_6_12"
exclude_dirs = {".git", "scratch", "__pycache__", ".vscode", ".idea"}
exclude_files = {".env", ".npmrc", ".DS_Store"}

file_count = 0
total_uncompressed_bytes = 0

with zipfile.ZipFile(target_zip, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
    for root, dirs, files in os.walk(source_dir):
        # Exclude directories in-place
        dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.git')]
        
        for file in files:
            if file in exclude_files or file.endswith('.tmp'):
                continue
            
            full_path = Path(root) / file
            rel_path = full_path.relative_to(source_dir)
            
            # Archive path with single top-level directory
            archive_path = f"{root_archive_dir}/{rel_path.as_posix()}"
            
            zf.write(full_path, archive_path)
            file_count += 1
            total_uncompressed_bytes += full_path.stat().st_size

print(f"Archived {file_count} files ({total_uncompressed_bytes:,} bytes uncompressed).")

print("Verifying ZIP archive integrity with testzip()...")
with zipfile.ZipFile(target_zip, 'r') as zf:
    bad_file = zf.testzip()
    if bad_file:
        print(f"[FAIL] Corrupt entry in ZIP: {bad_file}")
        sys.exit(1)
    namelist = zf.namelist()
    print(f"[PASS] All {len(namelist)} entries passed CRC verification.")
    
    # Check that all files are strictly under root_archive_dir
    non_conforming = [n for n in namelist if not n.startswith(root_archive_dir + "/")]
    if non_conforming:
        print(f"[FAIL] Entries found outside root directory: {non_conforming[:5]}")
        sys.exit(1)
    print(f"[PASS] 100% of entries are contained within '{root_archive_dir}/'.")

# Calculate SHA-256 of the created ZIP
hasher = hashlib.sha256()
with open(target_zip, 'rb') as f:
    while chunk := f.read(65536):
        hasher.update(chunk)
zip_sha256 = hasher.hexdigest()
zip_size = target_zip.stat().st_size

print(f"ZIP Size: {zip_size:,} bytes ({zip_size / (1024*1024):.2f} MB)")
print(f"ZIP SHA-256: {zip_sha256}")
print("PACKAGING COMPLETED SUCCESSFULLY!")
