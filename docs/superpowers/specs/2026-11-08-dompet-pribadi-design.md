# Design Spec: Dashboard Dompet Uang Pribadi (Personal Finance Dashboard)

**Tanggal:** 2026-11-08  
**Status:** Menunggu Persetujuan Pengguna (Pending User Approval)  
**Tipe Aplikasi:** Single-File / Standalone Responsive Web App (HTML5, Tailwind CSS, Vanilla JS, Chart.js, Lucide Icons, Tesseract.js)  
**Target Lokasi:** `C:\Users\NITRO\.gemini\antigravity\scratch\dompet-pribadi`  

---

## 1. Intent & The Why

### Mengapa aplikasi ini dibuat?
Pengguna membutuhkan sarana pencatatan dan visualisasi keuangan pribadi yang:
1. **Multi-Dompet Terintegrasi**: Menggabungkan berbagai akun keuangan (rekening bank, e-wallet, dan uang tunai/cash) dalam satu dashboard tunggal agar total saldo riil (*net cash*) terlihat jelas.
2. **Visualisasi & Analisis Cepat**: Memberikan representasi visual berupa grafik pengeluaran per kategori (donut chart) dan tren arus kas pemasukan vs pengeluaran bulanan.
3. **Catat Cepat Serba Instan (Natural Language Quick Input)**: Pengguna tidak perlu mengisi formulir panjang satu per satu. Cukup ketik teks seperti *"makan 15k"* atau *"kopi 25rb gopay"*, dan sistem langsung mengenali nominal, kategori, serta dompet.
4. **Scan Screenshot Bukti Transfer / Resi (Receipt & Payment OCR)**: Pengguna bisa melampirkan/mengunggah screenshot bukti transfer m-banking atau foto struk kasir, lalu sistem otomatis mengekstrak nominal, tanggal, dan menebak kategorinya.
5. **Auto-Categorization Otomatis**: Semua pengeluaran langsung diklasifikasikan ke dalam kategori yang tepat berdasarkan kamus kata kunci pintar (*smart keyword rules*).
6. **Privasi Penuh & Zero Friction**: Berjalan 100% di sisi klien (*client-side*) tanpa kewajiban mendaftar akun, tanpa server pihak ketiga, data tersimpan aman di browser lokal (`IndexedDB` / `localStorage`).
7. **Responsif Fleksibel**: Nyaman dan ergonomis digunakan baik di laptop/desktop maupun di smartphone/HP.

---

## 2. Goals, Non-Goals, & Anti-Goals

### Goals (Tujuan Utama):
- **Manajemen Akun/Dompet**: Tambah, edit, dan pantau saldo masing-masing dompet (misal: BCA, Mandiri, GoPay, OVO, Cash).
- **Pencatatan Transaksi Cepat & Fleksibel**:
  - Pemasukan (Income) -> menambah saldo dompet tujuan.
  - Pengeluaran (Expense) -> mengurangi saldo dompet asal, dialokasikan ke kategori.
  - Transfer Antar-Dompet -> memindahkan saldo dari dompet A ke dompet B tanpa tercatat sebagai pengeluaran/pemasukan bersih.
- **Smart Quick Input Bar (Bot / Chat Input)**:
  - Input teks satu baris bergaya pesan chat: `makan siang 25k bca` atau `bensin 30rb tunai`.
  - Otomatis mem-parsing:
    - Nominal: format `15k`, `15rb`, `15.000`, `15000` menjadi angka integer.
    - Dompet: mencocokkan nama dompet (bca, gopay, mandiri, tunai/cash). Default ke dompet aktif/utama jika tidak disebutkan.
    - Kategori: mencocokkan kata kunci ke kategori terkait.
  - Muncul konfirmasi instan 1-klik (*Quick Preview Card*) sebelum disimpan.
- **Scan Struk & Bukti Transfer (Image OCR & Vision)**:
  - Tombol upload / drag-and-drop / paste (Ctrl+V) foto bukti transfer m-banking (BCA, Mandiri, BRI, dll.), QRIS, e-wallet (GoPay, OVO, DANA), atau struk belanja.
  - Menggunakan engine OCR client-side (`Tesseract.js` via CDN) untuk mengekstrak nominal Rp dan teks transaksi secara lokal tanpa perlu internet/server.
  - *Opsi AI Pintar Tambahan*: Slot konfigurasi opsional untuk memasukkan Google Gemini API Key jika pengguna ingin ekstraksi AI multimodal tingkat lanjut yang lebih presisi pada foto struk fisik yang kusut/buram.
- **Auto-Categorization Engine**:
  - Kamus kata kunci otomatis lokal (100+ kata kunci sehari-hari: *makan, bakso, kopi, indomaret, alfamart, bensin, spbu, parkir, grab, gojek, pln, wifi, netflix, pulsa, obat, apotek*, dll.).
  - Pengguna bisa menambah kata kunci kustom untuk tiap kategori.
- **Kategori Kustom**: Pengguna bisa membuat dan mengelola kategori transaksi sendiri lengkap dengan pilihan ikon dan warna aksen.
- **Visual Analytics**:
  - Donut Chart: Alokasi pengeluaran per kategori bulan berjalan.
  - Bar/Line Chart: Tren pemasukan vs pengeluaran (cashflow bulanan).
  - Ringkasan Metrik: Total Kekayaan Bersih (Total Net Worth), Total Pemasukan Bulan Ini, Total Pengeluaran Bulan Ini.
- **Responsif Mobile & Desktop**: Layout kartu metrik, wallet slider, tombol aksi cepat terapung (*floating action button*), dan modal interaktif di layar sentuh.

### Non-Goals (Bukan Tujuan Versi 1 / MVP):
- Integrasi scraping API bank otomatis secara langsung (Open Banking berbayar).
- Fitur multi-user atau login berbasis cloud database.

### Anti-Goals:
- **Jangan sampai lambat / bloatware**: Menghindari framework raksasa atau build-step rumit jika aplikasi bisa disajikan dalam arsitektur mandiri yang instan dibuka cukup dengan double-click `index.html`.
- **Jangan ada ketergantungan server wajib**: Fitur parser cepat dan OCR dasar harus tetap dapat berjalan 100% di browser pengguna secara offline.

---

## 3. Pendekatan yang Dipertimbangkan (Approaches)

| Pendekatan | Kelebihan | Kekurangan | Status |
| :--- | :--- | :--- | :--- |
| **Opsi 1: Standalone Web App (HTML5 + Tailwind CSS + Vanilla JS + Chart.js + Tesseract.js)** | Instan dijalankan, 0 dependensi `node_modules`, 100% offline-ready, privasi total di IndexedDB lokal, parser teks instan dengan zero-latency. | Memerlukan CDN scripts untuk library visual & OCR. | **Dipilih oleh Pengguna** (Rekomendasi) |
| **Opsi 2: React + Vite SPA** | Ekosistem komponen React, modular. | Memerlukan instalasi Node.js, npm build, dan folder dependencies ratusan MB. | Ditolak (terlalu berat untuk kebutuhan awal) |
| **Opsi 3: Fullstack Next.js** | Fitur SSR dan rute API bawaan. | Overkill untuk aplikasi offline tanpa kebutuhan backend database terpusat. | Ditolak (melanggar prinsip YAGNI) |

---

## 4. Rincian Desain & Arsitektur

### A. Struktur File
```text
dompet-pribadi/
├── index.html              # Entry point HTML UI + Tailwind CDN + Lucide Icons + Chart.js + Tesseract.js
├── css/
│   └── styles.css          # Kustom styling (scrollbar, modal animation, theme tokens)
├── js/
│   ├── app.js              # Inisialisasi UI & Event Listeners
│   ├── store.js            # State management & Storage Engine (IndexedDB + fallback LocalStorage)
│   ├── quickParser.js      # Natural Language Parser (nominal 'k'/'rb', kategori kata kunci, dompet)
│   ├── receiptScanner.js   # Image OCR scanner (Tesseract.js lokal + opsional Gemini API)
│   ├── charts.js           # Chart.js rendering (Donut Breakdown & Bar Cashflow)
│   └── mockData.js         # Initial seed data agar dashboard langsung terlihat hidup saat pertama dibuka
├── tests/
│   ├── store.test.js       # Unit test logika saldo, transfer, & filtering
│   └── quickParser.test.js # Unit test parser natural language ("makan 15k", dll.)
├── docs/
│   └── superpowers/specs/  # Dokumen spesifikasi & plan
└── README.md               # Dokumentasi cara pakai
```

### B. Aturan Parser Bahasa Alami (`quickParser.js`)
Aturan pengenalan teks:
1. **Pola Nominal**:
   - `\b(\d+)\s*(k|rb|ribu)\b` -> dikalikan 1.000 (contoh: `15k` -> 15.000, `25rb` -> 25.000).
   - `\b(\d+)\s*(jt|juta)\b` -> dikalikan 1.000.000 (contoh: `1.5jt` -> 1.500.000).
   - Format standar angka: `15.000` atau `15000`.
2. **Pola Dompet**:
   - Pencocokan nama/alias dompet: `bca`, `gopay`, `ovo`, `dana`, `mandiri`, `cash`, `tunai`.
3. **Pola Kategori & Auto-Categorization**:
   - Kamus mapping kata:
     - `Makanan & Minuman`: makan, sarapan, lunch, makan siang, dinner, nasi, bakso, kopi, cafe, warteg, mcd, kfc, grabfood, gofood.
     - `Transportasi`: bensin, spbu, pertalite, pertamax, parkir, grab, gojek, tol, kereta, krl, mrt, busway.
     - `Belanja & Kebutuhan`: indomaret, alfamart, supermarket, baju, sabun, shopee, tokopedia.
     - `Tagihan & Utilitas`: pln, listrik, pdam, air, wifi, indihome, pulsa, kuota, netflix, spotify.
     - `Kesehatan`: obat, apotek, dokter, vitamin, klinik.
     - `Gaji & Pendapatan`: gaji, bonus, thr, dividen, cashback, refund.
   - Sisa kata di luar nominal dan dompet akan otomatis disimpan sebagai **Catatan/Keterangan Transaksi** (*note*).

---

## 5. Sketsa Tampilan Antarmuka (UI Layout Sketch)

```text
+-----------------------------------------------------------------------------------+
|  [Logo] DompetKu                [Bulan: November 2026 v]   [+ Transaksi] [⚙ Pengaturan]
+-----------------------------------------------------------------------------------+
|  💬 CATAT CEPAT (NATURAL LANGUAGE BAR)                                           |
|  [ 💬 Ketik misal: "makan siang 15k gopay" atau "bensin 25rb"..... ]  [ 📸 Scan ] |
|  -> Quick Preview: Kategori: Makanan | Dompet: GoPay | Rp 15.000      [ Simpan ] |
+-----------------------------------------------------------------------------------+
|  [ Total Kekayaan Bersih ]    [ Pemasukan Bulan Ini ]    [ Pengeluaran Bulan Ini ]|
|  Rp 28.750.000                + Rp 12.500.000            - Rp 4.350.000           |
+-----------------------------------------------------------------------------------+
|  DOMPET & AKUN SAYA                              [+ Tambah Dompet]                |
|  +----------------+  +----------------+  +----------------+  +----------------+   |
|  | BCA Utama      |  | GoPay          |  | Dompet Tunai   |  | Mandiri        |   |
|  | Rp 18.500.000  |  | Rp 750.000     |  | Rp 500.000     |  | Rp 9.000.000   |   |
|  +----------------+  +----------------+  +----------------+  +----------------+   |
+-----------------------------------------------------------------------------------+
|  ANALISIS KEUANGAN                                                                |
|  +-------------------------------------+  +-------------------------------------+ |
|  | Pengeluaran per Kategori (Donut)    |  | Arus Kas Masuk vs Keluar (Bar Chart)| |
|  |      [ Donut Chart ]                |  |      [ Bar Comparison ]             | |
|  | - Makanan: 40%   - Transport: 20%   |  | In:  ████████████ (Nov)             | |
|  | - Belanja: 25%   - Tagihan: 15%     |  | Out: █████                          | |
|  +-------------------------------------+  +-------------------------------------+ |
+-----------------------------------------------------------------------------------+
|  RIWAYAT TRANSAKSI TERAKHIR                   [Filter Kategori v] [Search ...]    |
|  - 08 Nov | Makan Siang       | Makanan     | GoPay     | -Rp 15.000   | [Edit/Hapus] |
|  - 07 Nov | Beli Bensin       | Transport   | Cash      | -Rp 25.000   | [Edit/Hapus] |
|  - 05 Nov | Gaji Bulanan      | Gaji/Income | BCA Utama | +Rp 12.500.000 [Edit/Hapus] |
|  - 04 Nov | Topup GoPay dr BCA| Transfer    | BCA->GoPay| Rp 200.000   | [Edit/Hapus] |
+-----------------------------------------------------------------------------------+
|  [Modal Upload Bukti / Resi]:                                                     |
|  Drop/Upload foto transfer atau struk -> Ekstraksi OCR -> Nominal otomatis terisi |
+-----------------------------------------------------------------------------------+
|  (Floating Action Button di Mobile: [+] Catat Cepat di pojok kanan bawah)        |
+-----------------------------------------------------------------------------------+
```

---

## 6. Apa yang Diserahkan ke Tahap Implementasi (Builder Scope)
1. **Penerapan TDD (Test-Driven Development)**:
   - Menulis unit test untuk `quickParser.js` (memastikan input seperti `makan 15k`, `kopi 20rb bca`, `bensin 30.000 cash` terurai dengan tepat).
   - Menulis unit test untuk `store.js` (saldo dompet, transfer saldo, dan kalkulasi agregat grafik).
2. **Scanner Bukti Transfer / Resi**:
   - Integrasi drag-and-drop / file selector untuk image file.
   - Ekstraksi teks pembayaran (regex mencari pola nominal `Rp xxx.xxx` atau `Total: xxx`).
   - UI indikator loading/processing saat OCR memindai gambar.
3. **Penyimpanan Lokal & Backup**:
   - IndexedDB engine dengan fallback ke LocalStorage.
   - Fitur ekspor/impor JSON untuk cadangan data pengguna.
