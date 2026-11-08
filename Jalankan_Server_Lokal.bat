@echo off
title DompetKu Server Lokal
echo ==============================================
echo   DompetKu - Menjalankan Server Lokal PWA
echo ==============================================
echo.
echo Membuka browser di http://localhost:3000 ...
start http://localhost:3000
npx --yes serve . -p 3000
pause
