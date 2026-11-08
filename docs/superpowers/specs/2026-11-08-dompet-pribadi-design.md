# Design Spec: Dashboard Dompet Uang Pribadi (Personal Finance Dashboard)

**Tanggal:** 2026-11-08  
**Status:** Menunggu Persetujuan Pengguna (Pending User Approval)  
**Tipe Aplikasi:** Single-File / Standalone Responsive Web App (HTML5, Tailwind CSS, Vanilla JS, Chart.js, Lucide Icons)  
**Target Lokasi:** `C:\Users\NITRO\.gemini\antigravity\scratch\dompet-pribadi`  

---

## 1. Intent & The Why

### Mengapa aplikasi ini dibuat?
Pengguna membutuhkan sarana pencatatan dan visualisasi keuangan pribadi yang:
1. **Multi-Dompet Terintegrasi**: Menggabungkan berbagai akun keuangan (rekening bank, e-wallet, dan uang tunai/cash) dalam satu dashboard tunggal agar total saldo riil (*net cash*) terlihat jelas.
2. **Visualisasi & Analisis Cepat**: Memberikan representasi visual berupa grafik pengeluaran per kategori (donut chart) dan tren arus kas pemasukan vs pengeluaran bulanan.
3. **Privasi Penuh & Zero Friction**: Berjalan 100% di sisi klien (*client-side*) tanpa kewajiban mendaftar akun, tanpa server pihak ketiga, data tersimpan aman di browser lokal (`IndexedDB` / `localStorage`).
4. **Responsif Fleksibel**: Nyaman dan ergonomis digunakan baik di laptop/desktop maupun di smartphone/HP.

---

## 2. Goals, Non-Goals, & Anti-Goals

### Goals (Tujuan Utama):
- **Manajemen Akun/Dompet**: Tambah, edit, dan pantau saldo masing-masing dompet (misal: BCA, Mandiri, GoPay, OVO, Cash).
- **Pencatatan Transaksi Cepat**:
  - Pemasukan (Income) -> menambah saldo dompet tujuan.
  - Pengeluaran (Expense) -> mengurangi saldo dompet asal, dialokasikan ke kategori.
  - Transfer Antar-Dompet -> memindahkan saldo dari dompet A ke dompet B tanpa tercatat sebagai pengeluaran/pemasukan bersih.
- **Kategori Kustom**: Pengguna bisa membuat dan mengelola kategori transaksi sendiri lengkap dengan pilihan ikon dan warna aksen.
- **Visual Analytics**:
  - Donut Chart: Alokasi pengeluaran per kategori bulan berjalan.
  - Bar/Line Chart: Tren pemasukan vs pengeluaran (cashflow).
  - Ringkasan Metrik: Total Kekayaan Bersih (Total Net Worth), Total Pemasukan Bulan Ini, Total Pengeluaran Bulan Ini.
- **Responsif Mobile & Desktop**: Layout kartu metrik, wallet carousels/grids, dan tombol aksi cepat (+ Transaksi) yang mudah dijangkau di layar sentuh maupun layar lebar.

### Non-Goals (Bukan Tujuan Versi 1 / MVP):
- Sinkronisasi otomatis ke API bank (Open Banking) — karena pertimbangan privasi, regulasi token, dan keamanan kredensial.
- Fitur multi-user atau login berbasis cloud.
- Fitur pinjaman/utang-piutang rumit dengan skema bunga perbankan kompleks.

### Anti-Goals:
- **Jangan sampai lambat / bloatware**: Menghindari framework raksasa atau build-step rumit jika aplikasi bisa disajikan dalam arsitektur mandiri yang instan dibuka cukup dengan double-click `index.html`.
- **Jangan ada ketergantungan server/backend**: Jika internet mati, aplikasi harus tetap 100% berfungsi offline.

---

## 3. Pendekatan yang Dipertimbangkan (Approaches)

| Pendekatan | Kelebihan | Kekurangan | Status |
| :--- | :--- | :--- | :--- |
| **Opsi 1: Standalone Web App (HTML5 + Tailwind CSS + Vanilla JS + Chart.js)** | Instan dijalankan, 0 dependensi `node_modules`, 100% offline-ready, sangat ringan, privasi total di IndexedDB lokal. | Perlu disiplin modularisasi vanilla JS agar kode tetap rapi saat fitur bertambah. | **Dipilih oleh Pengguna** (Rekomendasi) |
| **Opsi 2: React + Vite SPA** | Ekosistem komponen React, modular. | Memerlukan instalasi Node.js, npm build, dan folder dependencies ratusan MB. | Ditolak (terlalu berat untuk kebutuhan awal) |
| **Opsi 3: Fullstack Next.js** | Fitur SSR dan rute API bawaan. | Overkill untuk aplikasi offline tanpa kebutuhan backend database terpusat. | Ditolak (melanggar prinsip YAGNI) |

---

## 4. Rincian Desain & Arsitektur

### A. Struktur File
```text
dompet-pribadi/
├── index.html              # Entry point HTML UI + Tailwind CDN + Lucide Icons + Chart.js
├── css/
│   └── styles.css          # Kustom styling (scrollbar, modal animation, theme tokens)
├── js/
│   ├── app.js              # Inisialisasi UI & Event Listeners
│   ├── store.js            # State management & Storage Engine (IndexedDB + fallback LocalStorage)
│   ├── charts.js           # Chart.js rendering (Donut Breakdown & Bar Cashflow)
│   └── mockData.js         # Initial seed data agar dashboard langsung terlihat hidup saat pertama dibuka
├── tests/
│   └── store.test.js       # Unit test logika saldo, transfer, & filtering
├── docs/
│   └── superpowers/specs/  # Dokumen spesifikasi & plan
└── README.md               # Dokumentasi cara pakai
```

### B. Skema Data (State Models)

1. **Wallet / Dompet**:
   ```javascript
   {
     id: "w_1",
     name: "BCA Utama",
     type: "bank", // 'bank' | 'ewallet' | 'cash' | 'investment'
     balance: 15450000,
     color: "#2563eb",
     icon: "landmark"
   }
   ```

2. **Kategori**:
   ```javascript
   {
     id: "cat_1",
     name: "Makanan & Minuman",
     type: "expense", // 'expense' | 'income'
     color: "#f97316",
     icon: "utensils"
   }
   ```

3. **Transaksi**:
   ```javascript
   {
     id: "tx_101",
     type: "expense", // 'expense' | 'income' | 'transfer'
     amount: 45000,
     walletId: "w_1",
     targetWalletId: null, // diisi jika type === 'transfer'
     categoryId: "cat_1",
     date: "2026-11-08T10:30:00.000Z",
     note: "Makan siang"
   }
   ```

---

## 5. Sketsa Tampilan Antarmuka (UI Layout Sketch)

```text
+-----------------------------------------------------------------------------------+
|  [Logo] DompetKu                [Bulan: November 2026 v]   [+ Transaksi Baru]     |
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
|  - 08 Nov | Makan Siang       | Makanan     | GoPay     | -Rp 35.000   | [Edit/Hapus] |
|  - 07 Nov | Beli Bensin       | Transport   | Cash      | -Rp 50.000   | [Edit/Hapus] |
|  - 05 Nov | Gaji Bulanan      | Gaji/Income | BCA Utama | +Rp 12.500.000 [Edit/Hapus] |
|  - 04 Nov | Topup GoPay dr BCA| Transfer    | BCA->GoPay| Rp 200.000   | [Edit/Hapus] |
+-----------------------------------------------------------------------------------+
|  (Floating Action Button di Mobile: [+] Tambah Transaksi di pojok kanan bawah)    |
+-----------------------------------------------------------------------------------+
```

---

## 6. Apa yang Diserahkan ke Tahap Implementasi (Builder Scope)
1. **Penerapan TDD (Test-Driven Development)**: Membuat unit test terlebih dahulu untuk kalkulator saldo, transfer antar-dompet, dan agregasi data chart sebelum menulis kode DOM.
2. **Desain Visual**: Dark/Light mode modern, typography bersih, micro-animations saat transaksi ditambahkan.
3. **Backup / Restore**: Kemampuan ekspor JSON dan impor kembali jika pengguna ingin pindah browser atau membackup data.
