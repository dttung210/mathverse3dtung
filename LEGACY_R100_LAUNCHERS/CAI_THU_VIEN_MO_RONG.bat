@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0.."
where node >nul 2>&1
if errorlevel 1 (
  echo CHUA CO NODE.JS 20+. Hay cai Node.js va chay lai.
  pause
  exit /b 1
)
echo MATHVERSE - CAI THU VIEN TOAN HOC MO RONG
node tools\install-optional-engines.mjs
if errorlevel 1 (
  echo Khong cai duoc thu vien. V15.1 van chay binh thuong.
  pause
  exit /b 1
)
echo Cai xong. Hay khoi dong lai ung dung.
pause
