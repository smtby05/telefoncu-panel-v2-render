@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js bulunamadi. Once Node.js 20 veya daha yeni surumu kurun.
  pause
  exit /b 1
)
start "" http://127.0.0.1:8787
node server.js
