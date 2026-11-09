# 👛 DompetKu — Couple & Personal Finance PWA

Aplikasi pencatatan keuangan pribadi dan pasangan (**Couple Finance**) modern, cepat, dan responsif dengan isolasi privasi ketat, catat cepat bahasa alami (*Natural Language Parser*), scan bukti transfer/resi (OCR kamera HP), dan sinkronisasi cloud real-time via Supabase.

---

## 🌟 Fitur Unggulan

1. **🔒 Privasi Ketat Antar-Pasangan (Strict Isolation)**:
   * **Dompet Pribadi**: Saldo dan riwayat pengeluaran pribadi Anda **100% rahasia** dan tidak dapat dilihat oleh pacar, begitu pula sebaliknya.
   * **Dompet Bersama**: Khusus untuk pos kencan, makan berdua, patungan, atau tabungan liburan masa depan yang dapat dilihat dan dicatat oleh kedua belah pihak secara transparan.
2. **💬 Catat Cepat Bahasa Alami (Quick Chat Input)**:
   * Cukup ketik teks bebas, sistem otomatis mengenali nominal, kategori, dan dompet:
     * `makan 15k` ➔ Pengeluaran Rp 15.000 (Makanan, Dompet Pribadi).
     * `kopi 25rb gopay` ➔ Pengeluaran Rp 25.000 (Makanan, Dompet GoPay).
     * `nonton bioskop 90k bersama` ➔ Pengeluaran Rp 90.000 (Hiburan, **Dompet Bersama**).
3. **📸 Scan Kamera & Ekstraksi Resi (OCR Client-Side)**:
   * Foto atau upload screenshot m-banking (BCA, Livin Mandiri, BRI, QRIS) atau struk belanja fisik.
   * Mesin OCR lokal mengekstrak total nominal dan catatan secara otomatis.
4. **📱 Ekosistem Mobile PWA (Progressive Web App)**:
   * Dapat di-install langsung ke layar utama Android (Chrome) dan iPhone (Safari) seperti aplikasi native tanpa instalasi app store.
   * Tampilan layar penuh (*standalone*), ikon di homescreen, dan offline caching.
5. **☁️ Cloud Sync Real-time (Supabase)**:
   * Perubahan transaksi di dompet bersama langsung tersinkronisasi ke HP pasangan seketika.

---

## 🚀 Cara Menjalankan Secara Lokal

Aplikasi ini dibuat dengan arsitektur modern tanpa dependensi build `node_modules` yang berat:

1. Cukup buka file `index.html` langsung di browser Anda (double-click), atau jalankan server lokal sederhana:
   ```bash
   npx serve .
   ```
2. Buka `http://localhost:3000` di laptop atau browser HP yang berada di jaringan WiFi yang sama.

---

## 🌐 Cara Deploy ke Vercel (Gratis & Online untuk Pacar)

Untuk mendapatkan link `https://dompetku.vercel.app` agar bisa diakses pacar Anda dari HP-nya:

### Cara 1: Menggunakan Vercel CLI (Paling Cepat)
Di terminal folder project ini:
```bash
npx vercel
```
*Ikuti petunjuk di terminal (pilih default enter untuk semua pertanyaan), dan dalam 1 menit Anda akan mendapatkan link HTTPS aktif!*

### Cara 2: Melalui GitHub
1. Push repository lokal ini ke akun GitHub Anda:
   ```bash
   git remote add origin https://github.com/<username-kamu>/dompetku.git
   git branch -M main
   git push -u origin main
   ```
2. Buka [Vercel.com](https://vercel.com) ➔ Login ➔ Klik **"Add New Project"** ➔ Pilih repository `dompetku`.
3. Klik **"Deploy"**. Vercel akan otomatis menyediakan domain HTTPS gratis.

---

## 📲 Cara Install di Layar Utama HP (Android & iPhone)

Setelah aplikasi di-deploy dan dibuka lewat link Vercel di HP:

* **Android (Google Chrome)**:
  1. Buka URL web di Chrome.
  2. Klik ikon titik tiga `⋮` di pojok kanan atas.
  3. Pilih **"Install app"** atau **"Tambahkan ke Layar Utama"** (*Add to Home screen*).
  4. Aplikasi DompetKu akan muncul sebagai ikon aplikasi tersendiri di menu HP.

* **iPhone / iOS (Safari)**:
  1. Buka URL web di browser **Safari**.
  2. Tekan tombol **Share** (ikon kotak dengan panah ke atas di bagian bawah).
  3. Gulir ke bawah dan pilih **"Add to Home Screen"** (*Tambahkan ke Layar Utama*).
  4. Tekan **"Add"**. DompetKu akan terbuka penuh tanpa bilah navigasi Safari.

---

## 💑 Cara Pairing dengan Pacar (Sinkronisasi Bersama)

1. Buka aplikasi di HP Anda, buka menu **Pengaturan ⚙** (di kanan atas).
2. Lihat **Kode Pasangan** Anda (misal: `KITA-7890`) lalu klik **"Salin Kode"**.
3. Kirimkan kode tersebut dan link website ke pacar Anda via WhatsApp/Telegram.
4. Di HP pacar: buka link web, masuk ke Pengaturan ⚙, masukkan kode tadi di kolom *"Gabung ke Kode Pasangan Pacar"*, lalu klik **Hubungkan**.
5. Selesai! Dompet bersama dan pengeluaran patungan kini tersambung secara otomatis, sementara dompet pribadi Anda dan pacar tetap 100% terkunci dan rahasia.

---

## 🧪 Menjalankan Automated Unit Tests

Aplikasi dilengkapi dengan test suite lengkap berbasis native test runner Node.js:
```bash
node --test tests/*.test.js
```
*Menguji logika saldo dompet, isolasi privasi pasangan, parser bahasa alami, dan ekstraksi OCR.*
