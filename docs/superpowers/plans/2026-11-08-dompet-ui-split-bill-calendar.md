# Dompet Multi-View UI, Split Bill & Financial Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform DompetKu into the exact multi-view architecture and aesthetic of the Dompet Payment Admin Dashboard, featuring a personalized user profile, dedicated My Wallet screen with internal transfers, dedicated Transactions screen with a monthly financial calendar, and a smart Split Bill engine customized for Indonesian restaurant taxation (PB1 10% & Service Charge).

**Architecture:** Single Page Application (SPA) with declarative view switching (`#viewDashboard`, `#viewMyWallet`, `#viewTransactions`, `#viewSplitBill`, `#viewSettings`) powered by vanilla JS and GSAP transitions. Financial calendar computes daily aggregations on-the-fly, while the Split Bill engine proportionally allocates Indonesian PB1 and service charge per item.

**Tech Stack:** Vanilla JavaScript (ES6+), HTML5, Tailwind CSS, Chart.js, GSAP 3.12, Tesseract.js, Node.js (`node:test`).

**Spec:** `docs/superpowers/specs/2026-11-08-dompet-ui-split-bill-calendar-design.md`

## Global Constraints
- Zero-CORS standalone compatibility: Double-clicking `index.html` via `file:///` must work 100% without external node servers.
- Dompet Dark Palette: `#13141F` background, `#1E1E2D` card surfaces, `#00D2D3` cyan brand accent, and 4 colored KPI cards (Amber, Green, Purple, Blue).
- Indonesian Tax Compliance: PB1 restaurant tax (10%) and Service charge (5-10%) calculated proportionally per individual order.
- Complete separation of views: My Wallet and Transactions must have their own dedicated screens, not rendered inside the Dashboard.
- All existing and new unit tests must pass via `node --test tests/*.test.js`.

## Review Focus
1. View transitions: Ensuring switching between Dashboard, Wallet, Calendar, and Split Bill hides inactive views cleanly without broken state.
2. Indonesian Tax math: Ensuring subtotal + service (5%) + PB1 (10%) matches standard Indonesian restaurant cashier math.
3. Financial Calendar: Accurate day-of-week alignment and proper income/expense summation per day.
4. Mobile viewport ergonomics: Ensuring the sidebar collapses to mobile drawer while bottom tab bar allows 1-thumb switching between the 5 views.
5. Preserving existing quick input, OCR receipt scanner, and Telegram bot services.

---

### Task 1: Multi-View SPA Router & User Profile ("Hi, Daniel")
**Files:**
- Modify: `index.html`
- Modify: `js/bundle.js` and `js/app.js`

- [ ] Add User Profile element in left sidebar directly under brand logo: Avatar + **"Hi, Daniel"** + subtitle `daniel@finance.id`.
- [ ] Create view containers in `index.html`:
  - `<div id="viewDashboard" class="view-screen">`
  - `<div id="viewMyWallet" class="view-screen hidden">`
  - `<div id="viewTransactions" class="view-screen hidden">`
  - `<div id="viewSplitBill" class="view-screen hidden">`
- [ ] Update sidebar navigation items: Dashboard, My Wallet, Transactions, Split Bill, and Settings.
- [ ] Implement `switchView(viewName)` in `js/bundle.js` with GSAP fade transition.
- [ ] Connect sidebar links and mobile bottom tab bar to `switchView()`.
- [ ] Run test suite to verify no syntax errors.
- [ ] Commit changes.

---

### Task 2: Dompet Dashboard Screen (Executive Overview Only)
**Files:**
- Modify: `index.html` (`#viewDashboard`)
- Modify: `js/bundle.js`

- [ ] Structure `#viewDashboard` to match the DexignLab reference:
  - Row 1: 4 Colored KPI Cards (Amber: Total Saldo, Green: Pemasukan, Purple: Pengeluaran, Blue: Tabungan).
  - Row 2: Visual ATM Card (Mastercard gradient, dynamic balance, owner "DANIEL") + Donut Chart (Card's Overview) + Activity Chart (Weekly Cashflow bars).
  - Row 3: Quick Transfer Card (between personal accounts) + Spendings Budget Progress Bars (Makanan, Transportasi, Belanja, Tagihan).
  - Row 4: Recent Transactions List (latest 5 records with quick link to full Transactions view).
- [ ] Verify that detailed wallet management and full transaction tables are removed from the Dashboard view.
- [ ] Commit changes.

---

### Task 3: Dedicated My Wallet Screen & Internal Transfers
**Files:**
- Modify: `index.html` (`#viewMyWallet`)
- Modify: `js/store.js`
- Modify: `js/bundle.js`
- Test: `tests/store.test.js`

- [ ] Write failing unit test in `tests/store.test.js` for `transferBetweenWallets(wallets, fromId, toId, amount)`.
- [ ] Implement `transferBetweenWallets()` in `js/store.js` (deducts from source, credits destination, logs internal transfer).
- [ ] Verify `tests/store.test.js` passes.
- [ ] Build `#viewMyWallet` UI in `index.html`:
  - Grid of realistic ATM cards with card number formatting (`•••• 4821`), bank logos, balance, and action buttons.
  - "Tambah Dompet Baru" button and modal.
  - "Transfer Antar Dompet" card (e.g. BCA -> GoPay) with instant balance update.
- [ ] Commit changes.

---

### Task 4: Dedicated Transactions Screen with Monthly Financial Calendar
**Files:**
- Create: `js/calendar.js`
- Create: `tests/calendar.test.js`
- Modify: `index.html` (`#viewTransactions`)
- Modify: `js/bundle.js`

- [ ] Write unit tests in `tests/calendar.test.js` for `aggregateTransactionsByDate(transactions, year, month)`.
- [ ] Implement `js/calendar.js`: generates month days and calculates daily total income and expense.
- [ ] Verify `tests/calendar.test.js` passes.
- [ ] Build `#viewTransactions` UI in `index.html`:
  - Interactive monthly calendar widget: cells show green badge (`+Rp...`) and red badge (`-Rp...`).
  - Clicking a date filters the ledger below for transactions that occurred on that date.
  - Analytics ribbon: Average Daily Expense, Peak Spending Day.
  - Filterable transaction table with search, category selector, and CSV Export.
- [ ] Commit changes.

---

### Task 5: Dedicated Split Bill Screen with Indonesian Tax (PB1 & Service)
**Files:**
- Create: `js/splitBill.js`
- Create: `tests/splitBill.test.js`
- Modify: `index.html` (`#viewSplitBill`)
- Modify: `js/bundle.js`

- [ ] Write unit tests in `tests/splitBill.test.js` validating Indonesian PB1 10%, Service Charge 5%, and proportional participant allocation.
- [ ] Implement `calculateSplitBill({ items, participants, servicePercent, taxPercent })` in `js/splitBill.js`.
- [ ] Verify `tests/splitBill.test.js` passes.
- [ ] Build `#viewSplitBill` UI in `index.html`:
  - Receipt image / PDF dropzone with OCR scan integration.
  - Itemized bill list with name, qty, and price.
  - Tax settings toggle: PB1 (10%), Service Charge (5% or custom).
  - Participant chip list ("Daniel", "Sarah", "Budi") with assignment checkboxes per item.
  - Summary breakdown card showing each participant's item subtotal, proportional tax, and total owe.
  - One-click "Salin Rincian ke WhatsApp" generator.
- [ ] Commit changes.

---

### Task 6: Full Integration, Mobile Polish & Verification
**Files:**
- Modify: `index.html`
- Modify: `js/bundle.js`

- [ ] Synchronize mobile bottom tab bar with 5 primary icons: Dashboard, My Wallet, Transaksi, Split Bill, Pengaturan.
- [ ] Verify view switching on both mobile (<768px) and desktop (>=1024px).
- [ ] Run complete test suite: `node --test tests/*.test.js`.
- [ ] Verify zero regressions on standalone `file:///` double-click.
- [ ] Commit changes.
