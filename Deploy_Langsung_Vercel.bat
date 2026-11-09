@echo off
title Deploy DompetKu ke Vercel
echo ======================================================
echo   DompetKu - Deploy Langsung ke Vercel (CLI)
echo ======================================================
echo.
echo [LANGKAH 1 DARI 2] Login ke Vercel...
echo Silakan tekan ENTER pada pilihan 'Continue with GitHub'.
echo Browser Anda akan terbuka untuk otorisasi login.
echo.
call npx.cmd --yes vercel login
echo.
echo ======================================================
echo [LANGKAH 2 DARI 2] Mengunggah Website ke Vercel...
echo ======================================================
echo.
echo Jika muncul pertanyaan:
echo - "Set up and deploy ... ?" -> Tekan ENTER (Y)
echo - "Which scope ... ?" -> Tekan ENTER
echo - "Link to existing project?" -> Ketik y lalu ENTER, pilih project dompetku
echo   (atau tekan ENTER jika ingin dibuatkan URL baru)
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
