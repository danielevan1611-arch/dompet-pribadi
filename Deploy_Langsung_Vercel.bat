@echo off
title Deploy DompetKu ke Vercel
echo ======================================================
echo   DompetKu - Deploy Langsung ke Vercel (CLI)
echo ======================================================
echo.
echo Mengunggah file DompetKu (hanya ~350 KB, super cepat)...
echo.
call npx.cmd --yes vercel --prod
echo.
if %ERRORLEVEL% EQU 0 (
    echo ======================================================
    echo   [BERHASIL!] DompetKu aktif online di Vercel!
    echo ======================================================
) else (
    echo [CATATAN] Bila ada kendala, periksa pesan di atas.
)
echo.
pause
