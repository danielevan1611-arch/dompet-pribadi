@echo off
title Deploy DompetKu Langsung ke Vercel
echo ======================================================
echo   DompetKu - Deploy Langsung ke Vercel (CLI Instan)
echo ======================================================
echo.
echo Menjalankan Vercel CLI untuk deploy langsung...
echo.
call npx.cmd --yes vercel --prod
echo.
if %ERRORLEVEL% EQU 0 (
    echo ======================================================
    echo   [BERHASIL!] DompetKu berhasil dideploy ke Vercel!
    echo ======================================================
) else (
    echo [CATATAN] Jika diminta login, ikuti petunjuk di browser.
)
echo.
pause
