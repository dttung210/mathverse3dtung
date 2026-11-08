@echo off
chcp 65001 >nul
title MATHVERSE TOAN HOC MR.TUNG 3D - DAY DU AN LEN GITHUB & GITHUB PAGES
cd /d "%~dp0"

echo ============================================================================
echo   MATHVERSE TOAN HOC MR.TUNG 3D (R107_V13) - CONG CU DAY LEN GITHUB TU DONG
echo ============================================================================
echo.

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] May tinh cua ban chua cai dat Git!
    echo Vui long tai va cai dat Git tai: https://git-scm.com/download/win
    pause
    exit /b 1
)

set /p REPO_URL="Nhap link GitHub Repository cua ban (vi du: https://github.com/ten-ban/mathverse-3d.git): "
if "%REPO_URL%"=="" (
    echo [LOI] Ban chua nhap link GitHub Repository!
    pause
    exit /b 1
)

echo.
echo [1/5] Dang khoi tao Git repository va cau hinh bo nho dem file 3D GLB...
if not exist ".git" (
    git init
)
git config http.postBuffer 524288000
git branch -M main

echo [2/5] Dang dua toan bo ma nguon, 310 mo hinh Lab, 230 Tranh, 35 Ky quan & 11 Game vao Git...
git add .

echo [3/5] Dang tao ban luu (commit) R107_v13...
git commit -m "Deploy MATHVERSE TOAN HOC MR.TUNG 3D (R107_v13 Full Upgrade)"

echo [4/5] Dang ket noi voi GitHub Repository: %REPO_URL% ...
git remote remove origin >nul 2>nul
git remote add origin "%REPO_URL%"

echo [5/5] Dang tai du an len GitHub (nhanh main)...
git push -u origin main --force

if %errorlevel% equ 0 (
    echo.
    echo ============================================================================
    echo   [THANH CONG] DA DAY TOAN BO DU AN LEN GITHUB!
    echo   Buoc tiep theo tren web GitHub:
    echo   1. Mo kho chua (Repository) cua ban tren GitHub.
    echo   2. Vao muc Settings (Cai dat) -^> Pages (cot ben trai).
    echo   3. Tai muc "Build and deployment" -^> Source: Chon "GitHub Actions".
    echo   4. Cho khoang 1-2 phut trong tab "Actions", trang web 3D se tu dong online!
    echo ============================================================================
) else (
    echo.
    echo [CANH BAO] Qua trinh day len GitHub gap loi xac thuc hoac ket noi mang.
    echo Hay kiem tra lai quyen dang nhap GitHub hoac link Repository.
)
echo.
pause

