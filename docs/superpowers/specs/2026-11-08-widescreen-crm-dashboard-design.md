# Widescreen CRM Dashboard Layout Specification

- **Date**: 2026-11-08
- **Status**: Approved by User
- **Project**: DompetKu — Personal & Couple Finance Dashboard
- **Location**: `docs/superpowers/specs/2026-11-08-widescreen-crm-dashboard-design.md`

---

## 1. Intent & Problem Statement
The user expressed that the previous centered layout (`max-w-4xl` ~896px) felt "sepi dan ga full screen landscape" (empty and narrow on desktop/laptop displays). The user provided a screenshot of an enterprise CRM/ERP dashboard (HashMicro) featuring a dedicated left sidebar, wide top navigation, horizontal resource cards, and a rich multi-column data table.

The goal is to transform DompetKu into a full-screen, widescreen landscape CRM dashboard inspired by macOS Pro Dark and enterprise dashboards, while maintaining 100% responsiveness on mobile devices, offline zero-CORS compatibility, and passing all unit tests.

---

## 2. Architecture & Layout Specification

### 2.1. Structural Shell (Desktop Landscape)
- **Container**: Full viewport width (`w-full min-h-screen bg-black flex`).
- **Left Sidebar (`#sidebarNav`)**:
  - Width: `w-64` (256px), fixed/sticky height `h-screen`, background `#161618` (macOS Graphite), subtle border `border-r border-white/10`.
  - Content:
    - App Logo & Title: DompetKu with "Couple CRM" badge.
    - Navigation Items:
      - 📊 **Ringkasan (Overview)**
      - 💳 **Dompet & Rekening (Wallets)**
      - 📋 **Tabel Transaksi (Transactions)**
      - 📈 **Analitik (Analytics)**
      - 🤝 **Kas Bersama (Couple Space)**
    - Bottom Action:
      - ⚙️ **Pengaturan & Cloud Sync**
      - User status pill (Indikator Privasi Terkunci 🔒).
  - Mobile Behavior: Hidden off-canvas by default on `<lg`, toggled via mobile hamburger button.

### 2.2. Top Navigation Bar
- Breadcrumbs / Active Section indicator.
- Center / Right:
  - Apple Spotlight Quick Input bar (`#quickInput`) with camera OCR button.
  - Segmented Control Pill Switcher (`Kamu` | `Bersama` | `Pacar`) with sliding pill indicator.
  - Cloud Sync Status Pill (Live / Connected).
  - Mobile menu trigger button.

### 2.3. Main Content (Full Width `flex-1 p-6 space-y-6`)
1. **Row 1: 4-Column KPI Metric Cards**:
   - Total Kekayaan Bersih (Net Worth).
   - Total Pemasukan Bulan Ini.
   - Total Pengeluaran Bulan Ini.
   - Saldo Kas Bersama / Kencan.
2. **Row 2: Horizontal Dompet Cards (CRM Resource Grid)**:
   - 4-column horizontal cards showing each wallet (BCA, GoPay, Tunai, Kas Bersama) with microchip icon, balance, and quick transfer action.
3. **Row 3: Dual-Pane Analytics & CRM Data Table**:
   - **Left Pane (`w-full xl:w-1/3 space-y-4`)**:
     - Alokasi Kategori (Donut Chart with Apple system colors).
     - Arus Kas Masuk vs Keluar (Bar Chart).
   - **Right Pane (`w-full xl:w-2/3 space-y-3`)**:
     - CRM Data Table Header: Search bar, Filter Kategori dropdown, Filter Dompet dropdown, and **Export CSV** button.
     - Dense Multi-column Table:
       - Header: Tanggal & Waktu, Deskripsi / Note, Kategori (Apple Pill Badge), Dompet (Badge), Visibilitas (Pribadi / Bersama), Nominal (Rp), Aksi (Hapus).
       - Empty state and pagination / scroll container.

---

## 3. Global Constraints & Quality Gates
1. **Zero-CORS & Standalone**: App must run smoothly whether opened directly via `file:///` or served on Vercel.
2. **Mobile Ergonomics**: On `<1024px`, the sidebar collapses and the layout reflows into a single column.
3. **Existing Logic Preservation**: All 16 unit tests across store, quickParser, receiptScanner, and motion must stay passing.
