# Design Spec: DompetKu — Couple & Personal Finance PWA

**Tanggal:** 2026-11-08  
**Status:** Menunggu Persetujuan Pengguna (Pending User Approval)  
**Tipe Aplikasi:** Progressive Web App (PWA) + Supabase Realtime Cloud Sync + Deploy Vercel  
**Target Lokasi:** `C:\Users\NITRO\.gemini\antigravity\scratch\dompet-pribadi`  

---

## 1. Intent & The Why

### Mengapa aplikasi ini dibuat?
Pengguna membutuhkan aplikasi keuangan pribadi dan berpasangan (*Couple Finance*) yang:
1. **Privasi Ketat Antar-Pasangan**: Data keuangan pribadi masing-masing (saldo rekening rahasia, pengeluaran pribadi) **100% terisolasi dan tidak dapat dilihat oleh pasangan**.
2. **Dompet Bersama (Shared Space)**: Memiliki ruang bersama khusus untuk pos pengeluaran kencan, patungan, atau tabungan rencana masa depan yang bisa dipantau dan diisi oleh kedua belah pihak secara transparan.
3. **Ekosistem HP (PWA Native Feel)**: Dapat di-*install* langsung ke layar utama (*Home Screen*) HP Android & iPhone tanpa melalui App Store, layar penuh tanpa address bar, mendukung akses kamera untuk scan resi.
4. **Sinkronisasi Multi-Perangkat Realtime**: Ketika salah satu mencatat pengeluaran di dompet bersama, HP pasangan langsung ter-update seketika via cloud database (Supabase Realtime).
5. **Catat Cepat Natural Language**: Mendukung input instan bergaya chat (`makan 15k` atau `nonton 90k bersama`).
6. **Scan Resi / Bukti Transfer**: Upload atau foto struk/bukti transfer dengan OCR client-side.
7. **Online & Siap Diakses**: Di-deploy ke Vercel dengan URL HTTPS resmi yang bisa langsung dibagikan dan dibuka di HP masing-masing.

---

## 2. Model Privasi & Akses Data (Strict Privacy Isolation)

Aplikasi menerapkan **Two-Tier Isolation**:

```text
+-------------------------------------------------------------------------+
|                              PASANGAN (COUPLE)                          |
|                                                                         |
|   +-----------------------------+     +-----------------------------+   |
|   |       USER A (KAMU)         |     |       USER B (PACAR)        |   |
|   |  [PIN / Akun: User A]       |     |  [PIN / Akun: User B]       |   |
|   |                             |     |                             |   |
|   |  🔒 RUANG PRIBADI USER A    |     |  🔒 RUANG PRIBADI USER B    |   |
|   |  - Dompet: BCA, Mandiri     |     |  - Dompet: BRI, OVO         |   |
|   |  - Saldo Pribadi: RAHASIA   |     |  - Saldo Pribadi: RAHASIA   |   |
|   |  - Transaksi: RAHASIA       |     |  - Transaksi: RAHASIA       |   |
|   |  (Pacar TIDAK BISA lihat)   |     |  (Kamu TIDAK BISA lihat)    |   |
|   +--------------+--------------+     +--------------+--------------+   |
|                  |                                   |                  |
|                  +-----------------+-----------------+                  |
|                                    |                                    |
|                                    v                                    |
|               +----------------------------------------+                |
|               |       🤝 RUANG BERSAMA (SHARED SPACE)  |                |
|               |  - Dompet: "Kas Kencan / Liburan"      |                |
|               |  - Saldo Bersama: Terlihat berdua      |                |
|               |  - Transaksi Bersama: Terlihat berdua  |                |
|               |  - Riwayat kontribusi & split bill     |                |
|               +----------------------------------------+                |
+-------------------------------------------------------------------------+
```

### Aturan Visibilitas:
1. **Dompet Pribadi**:
   - Kolom `visibility = 'private'` dan `owner_id = '<user_id>'`.
   - Hanya di-query dan didekripsi di perangkat pemilik. Pasangan tidak memiliki akses membaca data ini.
2. **Dompet Bersama**:
   - Kolom `visibility = 'shared'` dan `couple_id = '<couple_code>'`.
   - Kedua pasangan dapat melihat saldo dompet bersama dan mutasi pengeluaran bersama.
3. **Pencatatan Transaksi**:
   - Transaksi biasa: masuk ke dompet pribadi (otomatis rahasia).
   - Transaksi berlabel `bersama` / `patungan`: masuk ke dompet bersama (terlihat oleh kedua belah pihak dengan label pembuat, misal: *"Dicatat oleh: Kamu"*).

---

## 3. Ekosistem Mobile (PWA & Kamera HP)

1. **Progressive Web App (PWA)**:
   - File manifest: `manifest.webmanifest` dengan `display: standalone`, `theme_color: #0f172a`, icon 192x192 & 512x512.
   - Di Android: Muncul prompt otomatis "Install App" / "Tambahkan ke Layar Utama".
   - Di iPhone/iOS: Buka di Safari -> Share -> "Add to Home Screen". Berjalan seperti aplikasi native tanpa header URL Safari.
   - Service Worker (`sw.js`): Menyediakan caching offline untuk aset statis agar aplikasi terbuka seketika bahkan saat koneksi lambat.
2. **Kamera & Scan Bukti Bayar**:
   - Tombol kamera langsung mengaktifkan kamera smartphone (`<input type="file" capture="environment" accept="image/*">`).
   - Hasil foto bukti transfer (QRIS, m-Banking, struk kasir) langsung diproses OCR via `Tesseract.js` lokal untuk mengisi nominal dan tanggal otomatis.

---

## 4. Arsitektur Teknis & Database Cloud Sync

### A. Stack:
- **Frontend PWA**: HTML5, Tailwind CSS, Vanilla Modern JS (ES Modules), Lucide Icons, Chart.js, Tesseract.js.
- **Backend & Cloud Sync**: **Supabase** (PostgreSQL + Realtime WebSocket subscription).
- **Deployment**: **Vercel** (Deploy otomatis via CLI / Git dengan domain HTTPS gratis `https://dompetku-<name>.vercel.app`).

### B. Skema Database Supabase:

1. **Table `couples`**:
   - `id`: UUID (Primary Key)
   - `couple_code`: string unik (misal: `KITA-2026-LOVE`)
   - `created_at`: timestamp

2. **Table `users`**:
   - `id`: UUID (Primary Key)
   - `couple_id`: UUID (Foreign Key ke `couples`)
   - `name`: string ("Kamu" / "Pacar")
   - `role`: string ("partner_a" / "partner_b")
   - `pin_hash`: string (PIN 4-digit untuk buka kunci pribadi di HP)

3. **Table `wallets`**:
   - `id`: UUID (Primary Key)
   - `owner_id`: UUID (ID user pemilik)
   - `couple_id`: UUID (ID pasangan)
   - `name`: string ("BCA Utama", "Kas Kencan", dll.)
   - `type`: string ("bank", "ewallet", "cash")
   - `balance`: numeric
   - `visibility`: string (`'private'` | `'shared'`)

4. **Table `transactions`**:
   - `id`: UUID
   - `wallet_id`: UUID
   - `created_by`: UUID (siapa yang mencatat)
   - `couple_id`: UUID
   - `type`: string (`'income'`, `'expense'`, `'transfer'`)
   - `amount`: numeric
   - `category`: string
   - `note`: string
   - `visibility`: string (`'private'` | `'shared'`)
   - `date`: timestamp

---

## 5. Alur Kerja Catat Cepat (Natural Language Command)

Input bar cerdas mengenali konteks pribadi vs bersama:
- `makan siang 15k` ➔ Pengeluaran Pribadi **Rp 15.000**, Kategori Makanan, Dompet Pribadi (Rahasia).
- `bensin 25rb bca` ➔ Pengeluaran Pribadi **Rp 25.000**, Kategori Transport, Dompet BCA Pribadi (Rahasia).
- `nonton bioskop 90k bersama` ➔ Pengeluaran Bersama **Rp 90.000**, Kategori Hiburan, Dompet Bersama (Terlihat berdua).
- `makan malam berdua 120rb kas-kencan` ➔ Pengeluaran Bersama **Rp 120.000**, Dompet Kas Kencan (Terlihat berdua).

---

## 6. Rencana Pengerjaan & Deployment End-to-End

Pengerjaan akan diselesaikan tuntas sampai tahap *live deployment*:
1. **Fase 1: Core Engine & TDD**:
   - Unit test logika kalkulasi saldo, transfer saldo, dan isolasi privasi (`visibility === 'private'` vs `'shared'`).
   - Unit test untuk `quickParser.js` (deteksi kata `bersama` / `patungan` vs transaksi pribadi).
2. **Fase 2: UI PWA Mobile-First**:
   - Pembuatan antarmuka responsif mobile modern (dark/light theme, wallet switch tab: "Pribadi Saya" vs "Dompet Bersama").
   - PWA assets: `manifest.webmanifest`, `sw.js`, icons, splash screen, camera capture OCR.
3. **Fase 3: Cloud Sync Engine (Supabase)**:
   - Integrasi konektor Supabase Client untuk sinkronisasi instan saat online, dengan caching IndexedDB saat offline.
   - Modul Pairing Pasangan (masukkan Couple Code sekali di masing-masing HP).
4. **Fase 4: Deployment ke Vercel**:
   - Menyiapkan konfigurasi `vercel.json` dan skrip build/preview.
   - Melakukan deployment hingga menghasilkan live HTTPS URL yang siap dibagikan ke pacar.
