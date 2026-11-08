@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0.."
title MATHVERSE R100 TINH GON - 1 BAT CHAY
where node >nul 2>nul
if errorlevel 1 (
  echo [LOI] Chua tim thay Node.js. Hay cai Node.js 20+ tai https://nodejs.org/
  pause
  exit /b 1
)
node -e "process.exit(parseInt(process.versions.node,10)>=20?0:1)"
if errorlevel 1 (
  echo [LOI] Can Node.js 20 tro len.
  pause
  exit /b 1
)
echo ================================================================
echo      MATHVERSE R100 - TOI UU - BAO TOAN CHUC NANG
echo      Khong chay nhieu BAT cu; giu cua so nay mo.
echo ================================================================
echo Dang mo MATHVERSE: http://127.0.0.1:4190/
node server\host.mjs
if errorlevel 1 (
  echo [LOI] Khong the khoi dong. Xem thong bao phia tren.
  pause
  exit /b 1
)
pause
