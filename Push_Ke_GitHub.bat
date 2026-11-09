@echo off
title Push DompetKu ke GitHub
echo ======================================================
echo   DompetKu - Push Update Terbaru ke GitHub & Vercel
echo ======================================================
echo.
echo Sedang melakukan push update terbaru ke GitHub...
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ======================================================
    echo   [BERHASIL!] File konfigurasi sudah ter-push ke GitHub!
    echo   Vercel akan otomatis men-deploy dalam 30 detik.
    echo ======================================================
) else (
    echo [PERHATIAN] Terjadi kendala saat push. Pastikan koneksi internet aktif.
)
echo.
pause
