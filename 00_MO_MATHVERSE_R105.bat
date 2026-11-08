@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
title MATHVERSE R105 - SKETCHFAB GLB TREN BUC
if not exist "server\host.mjs" goto BAD_FOLDER
if not exist "R105_AGENT\PROMPT_ANTIGRAVITY_R105.md" goto BAD_FOLDER
where node >nul 2>nul
if errorlevel 1 goto NO_NODE
node -e "process.exit(Number(process.versions.node.split('.')[0])>=20?0:1)"
if errorlevel 1 goto NO_NODE
:MENU
cls
echo =======================================================
echo    MATHVERSE R105 - SKETCHFAB GLB GIONG PARTHENON
echo =======================================================
echo    [1] CHAY UNG DUNG MATHVERSE
echo    [2] KIEM TRA 9 NGUON SKETCHFAB / GLB
echo    [3] MO + SAO CHEP PROMPT ANTIGRAVITY
echo    [4] CHAY BO KIEM THU R105
echo    [5] NAP GLB HOP LE DA CO TREN MAY (TUY CHON)
echo    [0] THOAT
echo.
set /p CHOICE=Chon (0-5):
if "%CHOICE%"=="1" goto RUN
if "%CHOICE%"=="2" goto AUDIT
if "%CHOICE%"=="3" goto PROMPT
if "%CHOICE%"=="4" goto TEST
if "%CHOICE%"=="5" goto IMPORT
if "%CHOICE%"=="0" exit /b 0
goto MENU
:RUN
cls
set "DUAL_PORT=4190"
set "NO_BROWSER="
echo MATHVERSE R105 dang khoi dong. Dong cua so nay de tat may chu.
node "server\host.mjs"
if errorlevel 1 (echo [ERROR] Khong the khoi dong & pause)
goto MENU
:AUDIT
node "tools\r105-sketchfab-pipeline.mjs" --audit
pause
goto MENU
:PROMPT
start "" notepad.exe "R105_AGENT\PROMPT_ANTIGRAVITY_R105.md"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Content -LiteralPath './R105_AGENT/PROMPT_ANTIGRAVITY_R105.md' -Raw -Encoding UTF8 | Set-Clipboard"
if errorlevel 1 (
 echo [INFO] Mo file PROMPT trong Notepad va sao chep bang Ctrl+A, Ctrl+C.
) else (
 echo [SUCCESS] Da sao chep PROMPT. Mo Antigravity IDE va nhan Ctrl+V vao Agent.
)
pause
goto MENU
:TEST
node --test "tests\r105-sketchfab-ingestion.test.mjs" "tests\r104-true-model-podium.test.mjs" "tests\r98-fidelity-curation.test.mjs" "tests\r97-discovery-world-map.test.mjs" "tests\r96-unesco-discovery.test.mjs" "tests\r95-discovery-integration.test.mjs"
pause
goto MENU
:IMPORT
node "tools\install-r104-glb.mjs"
pause
goto MENU
:NO_NODE
echo [ERROR] Can Node.js 20 tro len: https://nodejs.org/
pause
exit /b 4
:BAD_FOLDER
echo [ERROR] Chua giai nen day du R105. Hay dat BAT trong thu muc co server va dual.
pause
exit /b 3
