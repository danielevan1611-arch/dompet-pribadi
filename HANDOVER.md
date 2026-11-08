# DompetKu — Dokumen Serah Terima (Handover Notes)

**Tanggal Dibuat**: 8 November 2026  
**Target Pengguna**: Daniel (@daniel) & AI Agent di Chat / Sesi Baru  
**Repositori / Direktori Proyek**: `C:\Users\NITRO\.gemini\antigravity\scratch\dompet-pribadi`  
**Cabang Git Aktif**: `master` (Commit Terakhir: `ee406af`)  
**Status Pengujian**: 47/47 Unit Test Lulus (`node --test tests/*.test.js`)  
**Audit Anti-Slop Konoha**: Skor 100/100 (0 Temuan Slop)

---

## 1. Ringkasan Eksekutif & Karakter Aplikasi
**DompetKu** adalah aplikasi web manajemen keuangan pribadi & pasangan (*Couple & Personal Finance*) berstandar **Apple Ecosystem** dengan arsitektur mandiri (*self-contained zero-CORS*).

### Keunggulan Arsitektur:
1. **Double-Click Executable**: Berjalan 100% langsung via `file:///` (klik dua kali `index.html`) tanpa memerlukan web server lokal atau bundling build step, didukung file `js/bundle.js`.
2. **Modular ES Architecture**: Kode modul bersih di `js/*.js` siap untuk deployment cloud (Vercel, Node, dsb.) dan pengujian unit otomatis.
3. **Standar Desain Apple**: Menggunakan 4 tipografi resmi Apple (New York, SF Pro, SF Compact, SF Mono) yang diekstrak langsung dari disk image asli Apple (`.dmg`), serta mendukung mode Gelap (*Space Gray* `#13141F`) dan mode Terang (*Apple Light* `#F2F2F7`).

---

## 2. Struktur File & Lokasi Penting

```text
dompet-pribadi/
├── index.html                   # Entry point aplikasi (7 Views, UI Header, Sidebar, Bottom Nav, Modals)
├── package.json                 # Konfigurasi npm & test runner
├── HANDOVER.md                  # Dokumen serah terima ini
├── docs/
│   └── brand-guidelines.md      # Single Source of Truth Tipografi & Palet Warna Apple
├── assets/
│   ├── fonts/                   # 147 file font resmi Apple (New York, SF Pro, SF Compact, SF Mono)
│   └── icons/                   # Aset ikon & gambar
├── js/
│   ├── app.js                   # Logic interaktif aplikasi & dynamic DOM rendering
│   ├── bundle.js                # Self-contained bundle untuk eksekusi file:/// zero-CORS
│   ├── store.js                 # LocalStorage persistence & isolasi privasi pasangan
│   ├── quickParser.js           # Natural language parser ("makan siang 35k", "kopi 25rb gopay")
│   ├── receiptScanner.js        # Scanner teks resi/struk transfer OCR (BCA, GoPay, QRIS)
│   ├── splitBill.js             # Engine bagi tagihan proporsional standar pajak resto PB1 & service
│   ├── calendar.js              # Financial calendar engine & agregasi mutasi harian
│   ├── market.js                # Real-time ticker bursa IHSG, Emas Antam, Kripto & valuasi portofolio
│   ├── savings.js               # Pos impian/tabungan, kalkulasi kecepatan menabung, Smart Lock anti-khilaf
│   ├── motion.js                # Apple fluid micro-interactions, rolling numbers & Dynamic Island HUD
│   ├── mockData.js              # Data inisial default (rekening, transaksi, target impian)
│   └── sync.js                  # Supabase cloud synchronization connector
└── tests/                       # 12 file test suite pengujian otomatis (47 test cases)
    ├── store.test.js
    ├── quickParser.test.js
    ├── receiptScanner.test.js
    ├── splitBill.test.js
    ├── calendar.test.js
    ├── market.test.js
    ├── savings.test.js
    ├── motion.test.js
    └── telegramBot.test.js
```

---

## 3. Matriks Tipografi & Warna (Aturan Wajib Konsisten)
Dokumentasi lengkap tersimpan di `docs/brand-guidelines.md`. Setiap penambahan fitur baru WAJIB mengikuti kelas utilitas berikut:

| Token / Kelas CSS | Font Apple | Penggunaan Wajib |
| :--- | :--- | :--- |
| **`.font-headline`** | **New York (Serif)** | Sapaan `"Hi, Daniel"`, judul layar utama (`Dashboard`, `Market`, `Tabungan`), saldo hero jumbo di Kartu ATM & Kartu Impian. |
| **`.font-subhead`** | **SF Pro (Semibold)** | Judul card/modul widget, tombol aksi (`+ Buat Impian`, `Setor`, `Simpan`), judul modal dialog. |
| **`.font-body`** | **SF Pro (Regular/Med)** | Teks deskripsi fitur, label formulir, teks input user. |
| **`.font-pill`** | **SF Compact (Sans Compact)** | Badges, filter category pills, status chips (`🟢 LIVE STREAM`, `🔒 Terkunci`, `⚡ PRO`), label kolom tabel kecil. |
| **`.font-amount`** | **SF Mono (Tabular Num)** | Seluruh nominal Rupiah (`Rp ...`), harga live ticker bursa/kripto/emas, persentase (`+3.15%`), rincian pajak split bill. |

### Identitas Warna Semantik Tiap Fitur:
- **Dashboard**: Dompet Cyan (`#00D2D3`)
- **My Wallet**: Bank Riil Multi-Card (BCA Navy `#1E3A8A`, GoPay Cyan `#00D2D3`, Mandiri Gold `#F59E0B`)
- **Transactions & Calendar**: Emerald Green (`#10B981`) untuk Income & Crimson Red (`#EF4444`) untuk Expense
- **Smart Split Bill**: Indigo Purple (`#8B5CF6`)
- **Market & Investasi**: Emas Murni Antam (`#D97706` / `#F59E0B`) & BEI Blue (`#3B82F6`)
- **Tabungan & Impian**: Mint Cyan (`#00D2D3`) + Amber Disiplin (`#F59E0B`)
- **Settings**: Apple Slate Neutral (`#8E8E93`)

---

## 4. Daftar Fitur Lengkap & Status Operasional

### 1. View: Dashboard Utama
- **Net Worth Hero**: Total kekayaan bersih dengan animasi *rolling numbers* khas Apple.
- **Kartu ATM Dompet Utama**: Menampilkan saldo, nomor kartu masking (`•••• •••• •••• 4028`), dan tipe dompet.
- **Apple Spotlight Quick Input**: Pencatatan cepat berbasis bahasa natural (NLP).
- **Aktivitas Mingguan**: Bar chart HTML/Canvas untuk perbandingan pemasukan & pengeluaran.
- **Recent Transactions**: 5 mutasi terkini dengan tautan cepat ke kalender finansial.

### 2. View: My Wallet & Rekening (Fitur 1)
- Grid kartu ATM multi-rekening interaktif (BCA Prioritas, GoPay, Kas Dompet Fisik).
- Panel mutasi antar rekening sendiri (Top-Up / Transfer internal tanpa merusak kalkulasi expense).
- Modal Tambah Dompet Baru dengan color picker aksen kartu.

### 3. View: Transactions & Financial Calendar (Fitur 2)
- Kalender finansial bulanan: grid 31 hari menampilkan total ringkasan pemasukan (`+k`) dan pengeluaran (`-k`) harian.
- Klik tanggal kalender untuk memfilter tabel transaksi pada tanggal tersebut secara instan.
- Tabel mutasi lengkap dengan pencarian item, filter kategori, dan tombol Export CSV.

### 4. View: Smart Split Bill Indonesia (Fitur 3)
- Dropzone unggah foto struk kasir/restoran (dengan parser simulasi OCR otomatis).
- Input daftar teman (*participants*) dengan chip tags.
- Perhitungan proporsional pesanan per orang.
- **Standar Pajak Restoran Indonesia**: Subtotal + Service Charge (default 5%) + PB1 Resto Tax (default 10%).
- Tombol satu-klik **"Salin Rincian ke WhatsApp"** yang memformat tagihan rapi beserta nomor rekening pembayaran.

### 5. View: Market & Investment Dashboard (Fitur Real-Time)
- **Tampilan Terpisah**: Dibuka lewat navigasi menu samping atau bottom nav "Market & Investasi" (bukan menumpuk di dashboard utama).
- **Streaming Live Ticker**:
  - Saham BEI / IHSG: Indeks IHSG, BBCA, BBRI, BMRI, TLKM, ASII.
  - Emas & Logam Mulia: Emas Batangan Antam (Rp/gram) dan XAU Spot Gold Dunia.
  - Crypto Majors: Bitcoin (BTC), Ethereum (ETH), Solana (SOL), BNB Chain (BNB), Ripple (XRP).
  - Integrasi API publik live crypto (CoinCap) dengan fallback micro-jitter engine real-time.
- **Mini Sparkline SVG**: Grafik tren mini untuk tiap instrumen.
- **Portofolio Kepemilikan (1B)**: Tabel pencatatan aset riil Daniel dengan perhitungan otomatis nilai pasar terkini serta Untung/Rugi (PnL) nominal dan persentase.

### 6. View: Tabungan & Impian / Savings Goals (Fitur Disiplin)
- Pos tabungan dana dingin: Dana Darurat, Liburan Jepang, Mobil Baru, Gadget M-Series.
- Indikator progres visual dengan animasi glow bar.
- **Kalkulasi Kecepatan Menabung**: Menghitung sisa nominal dan rekomendasi setoran bulanan berdasarkan sisa waktu (*deadline*).
- **Smart Lock (Anti-Khilaf Protection)**: Dialog konfirmasi khusus khas macOS/iOS saat pengguna hendak mencairkan tabungan sebelum target tercapai.
- Alur setor dana cepat (*Quick Deposit*) dan cairkan dana tabungan ke dompet rekening.

### 7. View: Settings & Profile
- Pengaturan identitas nama Daniel (terhubung ke sapaan *"Hi, Daniel"*).
- Sakelar Tema Apple (Dark Space Gray / Light iOS Mode) dengan persistensi preferensi.
- Integrasi bot Telegram & panduan sintaks cepat.
- Konfigurasi Supabase Cloud URL & Anon Key.
- Tombol reset data lokal.

---

## 5. Instruksi Pengembangan untuk Sesi Chat Baru

Jika Anda adalah agen AI yang melanjutkan sesi ini:
1. **Aturan Sinkronisasi File**:
   - Setiap kali mengubah logika di `js/app.js`, pastikan bagian terkait di `js/bundle.js` diperbarui agar pengguna yang membuka via `file:///` (klik langsung dari Windows Explorer) mendapatkan pembaruan yang sama tanpa galat CORS.
2. **Aturan Tipografi & Styling**:
   - Jangan pernah mencampur kelas font (misal: jangan gunakan `font-editorial` untuk angka monospasi atau label kecil). Gunakan selalu `.font-headline` (New York), `.font-subhead` / `.font-body` (SF Pro), `.font-pill` (SF Compact), dan `.font-amount` (SF Mono).
3. **Verifikasi Wajib Sebelum Serah Terima**:
   - Jalankan `node --test tests/*.test.js` untuk memastikan ke-47 unit test selalu berstatus hijau (passing).
   - Jalankan `node -c js/app.js` dan `node -c js/bundle.js` untuk memastikan tidak ada kesalahan sintaks JavaScript.
   - Jalankan `konoha.anti_slop` untuk menjamin kualitas kode 100/100 bebas slop.

---

## 6. Backlog Rekomendasi Fitur Berikutnya (Opsional untuk Didiskusikan dengan Daniel)
- [ ] Integrasi webhook / polling aktif backend bot Telegram jika pengguna menginginkan serverless webhook.
- [ ] Dukungan instalasi PWA (Service Worker & `manifest.json`) agar bisa diinstal ke home screen smartphone / tablet seperti aplikasi native iOS.
- [ ] Export laporan keuangan bulanan berformat PDF atau Excel (.xlsx) dengan visual kartu ringkasan.
- [ ] Backup & Restore file JSON terenkripsi untuk keamanan data cadangan offline.
