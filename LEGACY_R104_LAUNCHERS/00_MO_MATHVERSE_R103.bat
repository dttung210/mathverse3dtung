@echo off
setlocal EnableExtensions
chcp 65001 >nul
title MATHVERSE R103 - DISCOVERY 3 KHU / 3D-2D
cd /d "%~dp0"
if not exist "server\host.mjs" goto BAD_FOLDER
if not exist "dual\discovery-r103\podium-viewer.mjs" goto BAD_FOLDER
where node >nul 2>nul
if errorlevel 1 goto NO_NODE
node -e "process.exit(Number(process.versions.node.split('.')[0])>=20?0:1)"
if errorlevel 1 goto NO_NODE
:MENU
cls
echo ==========================================================
echo   MATHVERSE R103 - SKETCHFAB TRUC TIEP TREN BUC · GLB CO PHEP · 3D/2D
echo ==========================================================
echo.
echo  [1] CHAY UNG DUNG MATHVERSE R103
echo  [2] KIEM TRA DU AN / 45 TESTS
echo  [3] SAO CHEP PROMPT CHO ANTIGRAVITY
echo  [4] MO HUONG DAN SU DUNG
echo  [0] THOAT
 echo.
set /p CHOICE=Chon (0-4): 
if "%CHOICE%"=="1" goto RUN
if "%CHOICE%"=="2" goto TEST
if "%CHOICE%"=="3" goto COPY
if "%CHOICE%"=="4" goto GUIDE
if "%CHOICE%"=="0" exit /b 0
goto MENU
:RUN
cls
echo Dang khoi dong MATHVERSE (Node.js)...
set "NO_BROWSER="
set "DUAL_PORT=4190"
echo Neu trinh duyet khong tu mo: kiem tra dia chi READY in trong cua so.
echo De tat may chu nhan Ctrl+C.
node server\host.mjs
if errorlevel 1 (echo [LOI] Server khong the khoi dong. & pause)
goto MENU
:TEST
cls
node --test tests\r103-podium-3d-sketchfab.test.mjs tests\r102-discovery-geometric-gallery.test.mjs tests\r98-fidelity-curation.test.mjs tests\r97-discovery-world-map.test.mjs tests\r96-unesco-discovery.test.mjs tests\r95-discovery-integration.test.mjs
pause
goto MENU
:COPY
if not exist "R103_AGENT\PROMPT_ANTIGRAVITY_MATHVERSE_R103.md" (echo Khong tim thay prompt. & pause & goto MENU)
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Content -LiteralPath './R103_AGENT/PROMPT_ANTIGRAVITY_MATHVERSE_R103.md' -Raw -Encoding UTF8 | Set-Clipboard"
if errorlevel 1 (echo Clipboard khong kha dung. Mo file R103_AGENT\PROMPT_ANTIGRAVITY_MATHVERSE_R103.md bang Notepad.) else echo DA SAO CHEP PROMPT. Bam Ctrl+V vao Antigravity Agent.
pause
goto MENU
:GUIDE
start "" "R103_AGENT\00_HUONG_DAN_CAI_DAT_R103.md"
goto MENU
:NO_NODE
echo Can Node.js 20 tro len: https://nodejs.org/
pause
exit /b 4
:BAD_FOLDER
echo Khong tim thay du an R102 day du.
echo Hay giai nen bo ZIP vao 1 thu muc; BAT phai nam cung cap thu muc server va dual.
pause
exit /b 3
