@echo off
chcp 65001 >nul
cd /d "%~dp0.."
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Content -Path './PROMPT_ANTIGRAVITY_UPDATE_R100.md' -Raw -Encoding UTF8 | Set-Clipboard"
if errorlevel 1 (echo Clipboard unavailable. Open PROMPT_ANTIGRAVITY_UPDATE_R100.md manually.) else (echo R100 prompt copied to clipboard. Paste it in Antigravity Agent.)
pause
