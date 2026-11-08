# Design Document: Dompet-Style Multi-View Financial Platform & Split Bill

**Date**: 2026-11-08  
**Status**: Approved (Brainstorming & Specification Phase)  
**Reference UI**: `dompet.dexignlab.com` (Dompet Payment Admin Dashboard UI)  
**Target Spec File**: `docs/superpowers/specs/2026-11-08-dompet-ui-split-bill-calendar-design.md`

---

## 1. Intent & Purpose (The "Why")
The user wants to transform the application into the exact aesthetic, layout, and functionality of the **"Dompet Payment Admin Dashboard"** (`dompet.dexignlab.com`). Rather than a single long-scrolling page, the application is structured as a **Multi-View Single Page Application (SPA)** where clicking sidebar navigation switches views seamlessly:
1. **Sidebar User Identity**: Personalized greeting ("Hi, Daniel") with avatar and user badge.
2. **Dashboard**: Executive overview only (Colored KPI Cards, Virtual ATM Card, Category Donut Chart, Cashflow Activity Chart, Spendings Budget Bars, Recent Transactions).
3. **My Wallet**: Dedicated screen (independent of dashboard) to manage all funding sources, visual card mockups, and internal transfers between wallets.
4. **Transactions with Financial Calendar**: Dedicated screen featuring a full monthly calendar indicating daily income & expense sums per date, plus an interactive filtered ledger.
5. **Smart Split Bill**: Dedicated screen supporting receipt photo / PDF OCR, customized for Indonesian restaurant taxation (PB1 Pajak Restoran 10% and Service Charge 5-10%) with proportional cost allocation and one-click WhatsApp summary export.

---

## 2. Design System & Theme Specification

### Color Palette (Dompet DexignLab Dark Theme)
- **Primary Background**: `#13141F` (Deep Midnight Obsidian)
- **Sidebar & Card Surfaces**: `#1E1E2D` (Smooth Slate Dark)
- **Borders & Dividers**: `rgba(255, 255, 255, 0.06)`
- **Accent Brand (Cyan/Teal)**: `#00D2D3` / `#06B6D4` (Buttons, active states, highlights)
- **4 KPI Card Colors**:
  - Card 1 (Net Worth / Balance): Amber gradient (`#D97706` to `#B45309`)
  - Card 2 (Income): Emerald gradient (`#059669` to `#047857`)
  - Card 3 (Expense): Purple gradient (`#7C3AED` to `#6D28D9`)
  - Card 4 (Savings / Reserve): Slate Blue gradient (`#2563EB` to `#1D4ED8`)
- **Typography**: Inter (UI Sans) + JetBrains Mono (Financial Tabular Lining Figures).

---

## 3. Architecture: Multi-View SPA Navigation
The application employs state-driven view routing (`currentView`):
```
[Sidebar / Bottom Nav]
       │
       ├─► 'viewDashboard'    (Executive Overview, KPI, ATM Card, Charts)
       ├─► 'viewMyWallet'     (Dedicated Screen: All Wallets, Cards, Transfers)
       ├─► 'viewTransactions' (Dedicated Screen: Financial Calendar & Full Ledger)
       ├─► 'viewSplitBill'    (Dedicated Screen: Receipt/PDF OCR + Indonesian PB1 Splitter)
       └─► 'viewSettings'     (Dedicated Screen: Profile Name "Daniel", Cloud/Telegram)
```
Switching views hides other views and shows the selected view with a smooth GSAP fade-in (`opacity: 0, y: 8 -> opacity: 1, y: 0`).

---

## 4. Feature Specifications

### A. Sidebar User Identity ("Hi, Daniel")
- Positioned directly below the Dompet brand logo in the left sidebar:
  - User avatar with cyan ring.
  - Heading: **"Hi, Daniel"** (bold, white).
  - Subtext: `daniel@finance.id` (customizable via Settings).
- Mobile view displays this in the top bar breadcrumb.

### B. View 1: Dashboard (Overview Only)
- **4 Colored KPI Cards**:
  1. Amber: Total Saldo Aktif
  2. Green: Pemasukan Bulan Ini
  3. Purple: Pengeluaran Bulan Ini
  4. Blue: Total Tabungan & Cadangan
- **Visual ATM Card**: Realistic credit/debit card mockup (Cyan/Blue gradient, contactless symbol, chip, balance, owner "DANIEL").
- **Donut Chart**: Alokasi Pengeluaran per Kategori (Chart.js with Dompet colors).
- **Activity Chart**: Dual-bar weekly cashflow (Income vs Expense).
- **Spendings Progress Bars**: Visual budget trackers (Makanan, Transportasi, Belanja, Tagihan).
- **Recent Transactions**: Quick 5 latest records with "Lihat Semua di Transaksi" shortcut.

### C. View 2: My Wallet (Dedicated Screen)
- **All Funding Sources**: Grid of interactive ATM cards (BCA, Mandiri, GoPay, OVO, Cash).
- **Tambah Dompet**: Modal form to add bank/ewallet with custom card color.
- **Transfer Antar Dompet**: Move balance internally (e.g. BCA to GoPay) without affecting global income/expense metrics.

### D. View 3: Transactions with Financial Calendar (Dedicated Screen)
- **Monthly Calendar Grid**:
  - Displays days of the month.
  - Each cell shows small badges: green `+Rp ...` (income) and red `-Rp ...` (expense).
  - Clicking a date filters the ledger below to show transactions on that day.
- **Analytics Ribbon**: Average Daily Expense, Peak Spending Day, Total Days Tracked.
- **Transaction Table**: Multi-column filterable CRM table + CSV Export.

### E. View 4: Smart Split Bill (Indonesian Tax & OCR)
- **File Input**: Upload receipt photo (JPEG/PNG) or PDF.
- **OCR Engine**: Tesseract.js scans items and prices.
- **Indonesian Tax Calculation**:
  - Subtotal = Sum of menu items.
  - Service Charge = `Subtotal * serviceRate` (default 5% or custom).
  - PB1 / Pajak Restoran = `(Subtotal + Service Charge) * 10%`.
  - Grand Total = Subtotal + Service + PB1.
- **Participant Assignment**:
  - Add participant names (e.g., "Daniel", "Sarah", "Budi").
  - Assign menu items to individuals or mark items as "Dibagi Rata" (shared appetizer).
  - Automatically calculates each person's exact share including proportional tax & service.
- **WhatsApp Share Generator**:
  - Formats clean text with breakdown and copy button:
    ```
    🧾 *Rincian Split Bill Resto*
    ━━━━━━━━━━━━━━━━━━━━
    👤 *Daniel:* Rp 65.000 (Nasi Goreng + Es Teh + Tax)
    👤 *Sarah:* Rp 82.500 (Steak + Jus Alpukat + Tax)
    👤 *Budi:* Rp 48.000 (Burger + Tax)
    ━━━━━━━━━━━━━━━━━━━━
    💳 *Transfer Pembayaran ke:*
    BCA: 1234-5678-90 a/n Daniel
    ```

---

## 5. Verification & Testing Strategy
1. **Multi-View Navigation Test**: Verify switching views activates the right DOM container and hides others without memory leaks.
2. **Calendar Date Calculation Test**: Verify daily expense and income aggregation by date.
3. **Split Bill Math Test**: Verify Indonesian PB1 10% and Service Charge proportional distribution.
4. **Unit Test Suite**: Maintain 100% pass rate across `node --test tests/*.test.js`.
