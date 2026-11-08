@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
title MATHVERSE R104 - NAP GLB LEN BUC
if not exist "tools\install-r104-glb.mjs" goto BAD
where node >nul 2>nul
if errorlevel 1 goto BAD
node "tools\install-r104-glb.mjs" "%~1"
echo.
echo Nhan phim bat ky de thoat.
pause >nul
exit /b
:BAD
echo Khong tim thay du an day du hoac Node.js 20+.
pause
