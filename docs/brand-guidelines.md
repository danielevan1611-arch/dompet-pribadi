# DompetKu — Brand & Typography Guidelines (Apple Ecosystem Edition)

**Versi**: 2.0.0  
**Status**: Disetujui (Approved by Daniel)  
**Lingkup**: Desain Sistem, Tipografi Resmi Apple, Palet Warna Fitur, dan Hierarki UI.

---

## 1. Aturan Hierarki 4-Font Resmi Apple (Typography Matrix)

DompetKu memadukan 4 font resmi Apple dari disk image asli (`NY.dmg`, `SF-Pro.dmg`, `SF-Compact.dmg`, `SF-Mono.dmg`) dengan pembagian peran yang 100% konsisten:

| Token / Kelas CSS | Font Apple | Berat (Weight) | Penggunaan Spesifik di Aplikasi |
| :--- | :--- | :--- | :--- |
| **`.font-headline`**<br>`--font-editorial` | **New York** | Regular (400), Bold (700), Black (900) | **Headline Display Utama & Saldo Hero**:<br>• Sapaan pengguna (`"Hi, Daniel"`)<br>• Judul layar utama (`"Dashboard"`, `"Tabungan & Impian"`, `"Market & Investasi"`)<br>• Saldo jumbo di Kartu ATM & Kartu Impian (`Rp 824.571`, `Rp 72.500.000`)<br>• Total Net Worth ringkasan kas |
| **`.font-subhead`**<br>`.font-body`<br>`--font-sans` | **SF Pro** | Regular (400), Medium (500), Semibold (600), Bold (700) | **Struktur Antarmuka & Kontrol Interaktif**:<br>• Judul modul card (`"Quick Transfer"`, `"Aktivitas Mingguan"`)<br>• Sub-headline & deskripsi penjelasan fitur<br>• Tombol aksi (`"+ Buat Impian"`, `"Generate Report"`, `"Cairkan Dana"`)<br>• Label form input & teks isi navigasi |
| **`.font-pill`**<br>`.font-badge`<br>`--font-compact` | **SF Compact** | Medium (500), Semibold (600), Bold (700) | **Badge Status Rapat, Pill Filter & Micro-Labels**:<br>• Status kunci: `🔒 Terkunci s/d Des 2026`, `🔓 Fleksibel`<br>• Indikator live: `🟢 LIVE STREAM`, `⚡ PRO`, `🛡️ SMART LOCK`<br>• Pill filter kategori (`Semua`, `Darurat`, `Saham IDX`, `Crypto`)<br>• Badge bank, label kategori kecil, stempel jam transaksi |
| **`.font-amount`**<br>`.font-number`<br>`--font-mono` | **SF Mono** | Medium (500), Semibold (600), Bold (700) | **Seluruh Angka Finansial & Kalkulasi Tabular**:<br>• Seluruh nominal Rupiah (`Rp 15.000.000`, `+Rp 450.000`)<br>• Persentase kenaikan/penurunan (`+3.15%`, `58.4% tercapai`)<br>• Tabel mutasi rekening & kalkulasi split bill resto (PB1 10% + Service 5%)<br>• Angka ticker bursa saham (lot/lembar), gramasi emas, kurs USD/IDR |

---

## 2. Palet Warna Semantik Tiap Fitur (Feature Color Identity)

Setiap fitur memiliki identitas visual yang tegas, dirancang untuk tampil seimbang di Mode Gelap (Apple Space Gray `#13141F`) maupun Mode Terang (Apple Light `#F2F2F7`):

### 1. Dashboard (Arus Kas & Likuiditas Daniel)
- **Warna Aksen**: **Dompet Cyan (`#00D2D3`)**
- **Karakter**: Modern, fokus, cerah. Menjadi jangkar utama pengalaman pengguna.
- **Elemen**: Tombol quick input, border kartu aktif, Dynamic Island HUD toast.

### 2. My Wallet & Accounts (Rekening Bank & Kartu ATM)
- **Warna Aksen**: **Identitas Bank Riil (Multi-Card Identity)**
  - *BCA Prioritas*: Deep Navy / Royal Blue (`#1E3A8A` / `#3B82F6`)
  - *GoPay / E-Wallet*: Neon Cyan (`#00D2D3`)
  - *Bank Mandiri / Kas Tunai*: Warm Amber Gold (`#F59E0B`)

### 3. Transactions & Financial Calendar (Mutasi & Kalender Finansial)
- **Warna Aksen**: **Emerald Green (`#10B981`) & Crimson Red (`#EF4444`)**
  - *Pemasukan (Income)*: Hijau Emerald cerah
  - *Pengeluaran (Expense)*: Merah koral lembut
  - *Tanggal Aktif Kalender*: Cyan indicator ring

### 4. Smart Split Bill (Kalkulator Pajak Resto PB1 & Social Billing)
- **Warna Aksen**: **Indigo / Purple (`#8B5CF6`)**
  - Identitas kalkulator sosial, memisahkan secara visual transaksi makan bersama dari mutasi pribadi Daniel.
  - Badge `PRO` & ringkasan tagihan WhatsApp.

### 5. Market & Investasi (IHSG, Emas Antam, Top Crypto)
- **Warna Aksen**: **Emas Logam Mulia (`#D97706` / `#F59E0B`) + Bursa Blue (`#3B82F6`)**
  - *Emas Batangan Antam*: Gradien Amber Emas Murni
  - *Saham IDX*: Biru Korporat BEI
  - *Crypto Majors*: Oranye Bitcoin / Ungu Ethereum / Teal Solana
  - *Indikator Live Ticker*: Neon Green Pulse (`#10B981`)

### 6. Tabungan & Impian (Savings Goals & Smart Lock)
- **Warna Aksen**: **Mint Cyan (`#00D2D3`) + Amber Lock (`#F59E0B`)**
  - Pos tabungan dingin dengan visual progres bar bersinar (glowing progress bar)
  - Indikator proteksi disiplin: `Smart Anti-Khilaf Alert`

### 7. Settings & Profil Pribadi
- **Warna Aksen**: **Apple Neutral Slate (`#8E8E93` / `#A1A1AA`)**
  - Tata letak tenang khas Apple Settings di macOS / iOS
  - Sakelar Tema Apple (Sun ☀️ / Moon 🌙)

---

## 3. Implementasi Utility Classes CSS

```css
/* Aturan Tipografi Apple Terpusat */
.font-headline {
  font-family: var(--font-editorial) !important;
  letter-spacing: -0.015em;
}
.font-subhead {
  font-family: var(--font-sans) !important;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.font-body {
  font-family: var(--font-sans) !important;
  letter-spacing: -0.008em;
}
.font-pill, .font-badge, .font-chip {
  font-family: var(--font-compact) !important;
  letter-spacing: -0.01em;
}
.font-amount, .font-number, .font-tabular {
  font-family: var(--font-mono) !important;
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1, 'zero' 1;
}
```

---

*Aturan ini menjadi satu-satunya sumber kebenaran (Single Source of Truth) untuk gaya visual, tipografi, dan warna di seluruh halaman DompetKu.*
