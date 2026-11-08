@echo off
setlocal EnableExtensions
chcp 65001 >nul
title MATHVERSE R104 - MO HINH 3D TRUC TIEP TREN BUC
cd /d "%~dp0"
if not exist "server\host.mjs" goto BAD_FOLDER
if not exist "dual\discovery-r102\exhibition-room.mjs" goto BAD_FOLDER
where node >nul 2>nul
if errorlevel 1 goto NO_NODE
node -e "process.exit(Number(process.versions.node.split('.')[0])>=20?0:1)"
if errorlevel 1 goto NO_NODE
:MENU
cls
echo ===========================================================
echo   MATHVERSE R104 - GLB THAT TREN BUC / HINH HOC 3D
 echo ===========================================================
echo  [1] CHAY UNG DUNG
 echo  [2] NAP MO HINH GLB CO PHEP LEN BUC (LUU VĨNH VIEN)
 echo  [3] KIEM TRA HOAT DONG R104
 echo  [4] SAO CHEP PROMPT ANTIGRAVITY
 echo  [0] THOAT
set /p CHOICE=Chon (0-4):
if "%CHOICE%"=="1" goto RUN
if "%CHOICE%"=="2" goto IMPORT
if "%CHOICE%"=="3" goto TEST
if "%CHOICE%"=="4" goto COPY
if "%CHOICE%"=="0" exit /b 0
goto MENU
:RUN
set "NO_BROWSER="
set "DUAL_PORT=4190"
node server\host.mjs
pause
goto MENU
:IMPORT
call 00_NAP_GLB_VAO_BUC_R104.bat
goto MENU
:TEST
node --test tests\r104-true-model-podium.test.mjs tests\r98-fidelity-curation.test.mjs tests\r97-discovery-world-map.test.mjs tests\r96-unesco-discovery.test.mjs tests\r95-discovery-integration.test.mjs
pause
goto MENU
:COPY
if not exist "R104_AGENT\PROMPT_ANTIGRAVITY_R104.md" (echo Khong tim thay prompt. & pause & goto MENU)
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Content -LiteralPath './R104_AGENT/PROMPT_ANTIGRAVITY_R104.md' -Raw -Encoding UTF8 | Set-Clipboard"
echo Da sao chep prompt. Dan Ctrl+V vao Antigravity Agent.
pause
goto MENU
:NO_NODE
echo Can cai Node.js 20 tro len tu https://nodejs.org/
pause
exit /b 4
:BAD_FOLDER
echo Hay giai nen ZIP day du vao thu muc chua server va dual.
pause
exit /b 3
