@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
title MATHVERSE - CAI CHIBI VAO BAN DA SUA
where node >nul 2>nul
if errorlevel 1 (
 echo Chua cai Node.js 20+.
 pause
 exit /b 1
)
set "TARGET=%~1"
if "%TARGET%"=="" (
 echo DAN DUONG DAN THU MUC MATHVERSE DA SUA VAO BEN DUOI:
 echo Vi du: D:\MATHVERSE_FINAL\MATHVERSE_GRAND_CAMPUS_FINAL_TOAN_6_12
 set /p "TARGET=Thu muc MATHVERSE da sua: "
)
if "%TARGET%"=="" exit /b 2
node "%~dp0tools\install-cartoon-into-existing.mjs" "%TARGET%"
if errorlevel 1 (
 echo Nang cap that bai. Thu muc cu chua bi sua mot phan neu kiem tra truoc khong dat.
 pause
 exit /b 3
)
echo HOAN THANH. Mo BAT goc cua ban MATHVERSE da sua de chay.
pause
