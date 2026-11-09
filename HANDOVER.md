# DompetKu — Dokumen Serah Terima (Handover Notes)

**Versi**: 3.0.0 (Apple Ecosystem: iOS 17 / macOS Sonoma / Apple Wallet Edition)  
**Tanggal Diperbarui**: 8 November 2026  
**Target Pengguna**: Daniel (@daniel) & AI Agent di Chat / Sesi Baru  
**Repositori / Direktori Proyek**: `C:\Users\NITRO\.gemini\antigravity\scratch\dompet-pribadi`  
**Status Pengujian**: 47/47 Unit Test Lulus (`node --test tests/*.test.js`)  
**Audit Anti-Slop Konoha**: Skor 100/100 (0 Temuan Slop, Zero AI Slop)

---

## 1. Ringkasan Eksekutif & Karakter Aplikasi
**DompetKu** adalah aplikasi web manajemen keuangan pribadi & pasangan (*Couple & Personal Finance*) berstandar estetika **Apple Ecosystem (macOS Sonoma / iOS 17 / Apple Wallet)** dengan arsitektur mandiri (*self-contained zero-CORS*).

### Keunggulan Arsitektur & Desain:
1. **Double-Click Executable**: Berjalan 100% langsung via `file:///` (klik dua kali `index.html`) tanpa memerlukan web server lokal atau build tools, didukung oleh file `js/bundle.js` yang tersinkronisasi 1:1.
2. **Modular ES Architecture**: Kode modul bersih di `js/*.js` siap untuk deployment cloud (Vercel, Node, dsb.) dan pengujian unit otomatis 47/47.
3. **Apple Ecosystem Design System**:
   - Tipografi: SF Pro Display (`letter-spacing: -0.025em`), SF Pro Text, SF Compact, dan SF Mono untuk angka finansial tabular. Font serif lama telah dihapus untuk menghasilkan tampilan antarmuka yang bersih dan modern.
   - Warna: Dark Mode (Pure Black `#000000` / `#1C1C1E` / `#2C2C2E`), Light Mode (Apple Canvas `#F2F2F7` / `#FFFFFF` / `#E5E5EA`), Apple Blue `#0A84FF`, Green `#30D158`, Red `#FF453A`, Orange `#FF9F0A`, Purple `#BF5AF2`.
   - Radius: Kartu 24px, Tombol & Input 14px, Modal 28px, Pill 9999px.
   - Glassmorphism: `backdrop-filter: blur(24px)` pada Sidebar, Top Bar, dan Bottom Tab Bar.
   - Transisi: Spring easing `250ms cubic-bezier(0.16, 1, 0.3, 1)` dan efek tekan `active:scale-[0.98]`.

---

## 2. Struktur File & Lokasi Penting

```text
dompet-pribadi/
├── index.html                   # Entry point aplikasi (7 Views, UI Header, Sidebar, Bottom Tab Bar, Modals)
├── package.json                 # Konfigurasi npm & test runner
├── HANDOVER.md                  # Dokumen serah terima ini
├── docs/
│   └── brand-guidelines.md      # Single Source of Truth Desain Sistem Apple
├── assets/
│   ├── fonts/                   # File font resmi Apple (SF Pro, SF Compact, SF Mono)
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

## 3. Matriks 7 Halaman Terpadu (Unified 7 Views)

Semua 7 halaman telah sepenuhnya mengadopsi Apple Design System dan mendukung Dark / Light mode:
1. **Dashboard**: Ringkasan Net Worth dengan animasi rolling number, kartu Apple Wallet dengan chip emas metallic dan aksen warna, donut chart & bar chart Chart.js, Spotlight quick input, dan mutasi terkini.
2. **My Wallet & Accounts**: Grid kartu Apple Wallet dengan tekstur titanium hairline, panel mutasi saldo internal antar-rekening, dan modal tambah rekening Apple Sheet (28px radius).
3. **Transactions & Financial Calendar**: Grid 31 hari kalender finansial dengan indikator dot pemasukan/pengeluaran, filter instan tanggal, kolom pencarian, export CSV, dan tabel mutasi.
4. **Smart Split Bill (PB1 & Tax)**: Dropzone struk OCR, gelembung kontak peserta (*contact bubbles*), tabel pesanan dengan checklist pembagian porsi, rincian pajak PB1 10% + Service 5%, dan ekspor format WhatsApp.
5. **Market & Investasi**: Live ticker bar, 4 KPI cards dengan sparkline SVG, iOS segmented control pills (`Semua`, `Saham IDX`, `Emas`, `Crypto`, `Portofolio`), tabel portofolio aset, dan modal catat kepemilikan aset.
6. **Tabungan & Impian**: 4 KPI cards, status proteksi Smart Lock, segmented category pills, kartu target impian dengan progress bar bersinar, tombol Setor/Cairkan, dan Anti-Khilaf Alert.
7. **Pengaturan & Cloud**: Tata letak macOS System Settings, foto avatar profil, toggle tema Apple (Dark/Light mode) yang responsif, integrasi Telegram Bot, dan sinkronisasi Supabase.
