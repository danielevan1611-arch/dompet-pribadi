@echo off
title Push DompetKu ke GitHub & Vercel
echo ======================================================
echo   DompetKu - Push Update Terbaru ke GitHub & Vercel
echo ======================================================
echo.
echo Sedang melakukan push branch 'main' ke GitHub...
echo Jika muncul jendela login GitHub di browser, silakan klik 'Sign in with your browser'.
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ======================================================
    echo   [BERHASIL!] File DompetKu sudah ter-push ke GitHub!
    echo   Vercel akan otomatis men-deploy dalam 30 detik.
    echo ======================================================
) else (
    echo [PERHATIAN] Terjadi kendala saat push. Pastikan koneksi internet aktif.
)
echo.
pause
