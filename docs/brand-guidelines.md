# DompetKu — Brand & Design System Guidelines (Apple Ecosystem Edition: iOS 17 / macOS Sonoma / Apple Wallet)

**Versi**: 3.0.0  
**Status**: Disetujui (Approved)  
**Lingkup**: Desain Sistem Terpadu, Tipografi Resmi Apple SF Pro Display, Palet Warna Semantik Apple System, dan Hierarki UI.

---

## 1. Aturan Tipografi Resmi Apple Ecosystem (Clean Sans-Serif)

Sesuai arahan Apple Human Interface Guidelines dan preferensi pengguna terkini, DompetKu menggunakan keluarga font resmi **San Francisco** tanpa font serif klasik:

| Token / Kelas CSS | Font Apple | Berat (Weight) | Karakteristik & Penggunaan |
| :--- | :--- | :--- | :--- |
| **`.font-headline`**<br>`--font-editorial` | **SF Pro Display** | Bold (700), Heavy (800) | **Headline Utama & Saldo Hero**:<br>• Huruf sans-serif modern dengan *tight tracking* (`letter-spacing: -0.025em`)<br>• Sapaan pengguna (`"Hi, Daniel"`), Judul tampilan utama, Saldo Apple Wallet |
| **`.font-subhead`**<br>`.font-body`<br>`--font-sans` | **SF Pro Text / Display** | Regular (400), Medium (500), Semibold (600) | **Struktur Antarmuka & Form Kontrol**:<br>• Judul kartu (`"Quick Transfer"`, `"Aktivitas Mingguan"`)<br>• Label form, tombol aksi, dan navigasi sidebar/tab bar |
| **`.font-pill`**<br>`.font-badge`<br>`--font-compact` | **SF Compact / SF Pro** | Semibold (600), Bold (700) | **Badge Status Rapat, Segmented Pills & Micro-Labels**:<br>• Status kunci: `🔒 Terkunci s/d Des 2026`, `🔓 Fleksibel`<br>• Indikator live: `🟢 LIVE STREAM`, `⚡ PRO`, `🛡️ SMART LOCK`<br>• Filter kategori segmented control pills |
| **`.font-amount`**<br>`.font-number`<br>`--font-mono` | **SF Mono** | Medium (500), Semibold (600), Bold (700) | **Seluruh Angka Finansial & Kalkulasi Tabular**:<br>• Seluruh nominal Rupiah (`Rp 15.000.000`, `+Rp 450.000`)<br>• Persentase kenaikan/penurunan (`+3.15%`, `58.4% tercapai`)<br>• Tabel mutasi rekening, kalkulasi split bill resto (PB1 10% + Service 5%), sparklines |

---

## 2. Palet Warna Semantik Apple Ecosystem (Apple System Palette)

Mendukung penuh Mode Gelap (Dark Mode) dan Mode Terang (Light Mode):

| Token Warna | Mode Gelap (Dark) | Mode Terang (Light) | Penggunaan |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#000000` (Pure OLED Black) | `#F2F2F7` (Apple Light Canvas) | Background seluruh aplikasi |
| **Card Surface** | `#1C1C1E` (Apple Dark Card) | `#FFFFFF` (Pure White Card) | Latar belakang modul kartu 24px |
| **Card Elevated** | `#2C2C2E` (Apple Dark Elevated) | `#E5E5EA` (Apple Light Elevated) | Input form, search bar, sub-cards |
| **Hairline Border** | `rgba(255, 255, 255, 0.08)` | `rgba(0, 0, 0, 0.06)` | Border kartu dan pemisah sel tabel |
| **Apple Accent Blue** | `#0A84FF` | `#007AFF` | Navigasi aktif, CTA primer, toggle on |
| **Apple Success Green** | `#30D158` | `#34C759` | Pemasukan, saldo bertambah, status sukses |
| **Apple Danger Red** | `#FF453A` | `#FF3B30` | Pengeluaran, hapus data, status error |
| **Apple Warning Orange** | `#FF9F0A` | `#FF9500` | Smart Lock, peringatan anti-khilaf |
| **Apple Purple** | `#BF5AF2` | `#AF52DE` | Split Bill, transfer internal, badge spesial |

---

## 3. Komponen Desain & Dimensi Apple (Design Metrics)

1. **Sudut Membulat (Border Radius)**:
   - Kartu (`.dompet-card`): `rounded-[24px]` (24px)
   - Tombol Primer / Sekunder & Input: `rounded-[14px]` (14px)
   - Modal Dialog: `rounded-[28px]` (28px)
   - Pill & Badge Status: `rounded-full` (9999px)
2. **Material Glassmorphism**:
   - Sidebar & Top Bar: `backdrop-filter: blur(24px); background-color: var(--apple-nav-bg); border: 1px solid var(--apple-hairline);`
3. **Fisika Transisi & Interaksi**:
   - Transisi: Spring easing `all 250ms cubic-bezier(0.16, 1, 0.3, 1)`
   - Efek Tekan: `active:scale-[0.98]` atau `active:scale-[0.97]`
   - Bayangan: Halus natural `0 4px 20px -2px rgba(0, 0, 0, 0.08)`
4. **Responsivitas**:
   - Desktop (≥1024px): Sidebar melayang (floating translucent sidebar) di kiri
   - Mobile (<1024px): Tab bar bawah ala iOS 17 (fixed bottom glass tab bar)
