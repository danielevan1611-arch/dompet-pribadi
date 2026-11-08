# Design Document: Dedicated Savings & Goals Dashboard (Multi-View SPA)

**Date**: 2026-11-08  
**Status**: Pending Plan Approval (Brainstorming & Design Phase)  
**Selected Architectural Choices**:
- **View Isolation**: Zero clutter on main Dashboard; lives completely on dedicated full-screen dashboard `<section id="viewSavings">`.
- **Lock Mechanism**: Fleksibel dengan Sakelar Kunci Opsional (Smart Anti-Khilaf Warning).
- **Personal Scope**: Murni Tabungan Pribadi Daniel.
- **Initial State**: 4 Template Populer Bawaan (Dana Darurat, Liburan Akhir Tahun, Upgrade Gadget, DP Rumah/Mobil) ready to use and editable.
**Target Spec File**: `docs/superpowers/specs/2026-11-08-savings-goals-dashboard-design.md`

---

## 1. Intent & Purpose (The "Why")
The user requested a dedicated **Tabungan & Goals Impian** feature inspired by best-in-class digital banking apps (Bank Jago Kantong Nabung, Jenius Dream Saver, and Revolut/Apple Savings Vaults):
1. **Separation of Money with Intent**: Isolate savings from daily operational cashflow so money designated for future dreams or emergency protection isn't spent unintentionally.
2. **Dedicated Screen (`viewSavings`)**: Accessible from the Sidebar (`data-view="savings"`) and Mobile Bottom Nav. The home `viewDashboard` remains 100% clean and uncluttered.
3. **Calculated Motivation**: Automatically compute remaining amounts and required monthly/weekly savings velocity based on target completion dates.
4. **Deposit & Withdrawal Operations**: Transfer money from any physical funding source (BCA, GoPay, Cash) directly into a specific savings goal, with two-way balance adjustments.
5. **Smart Anti-Khilaf Lock**: Allow users to lock a goal until its target date. Withdrawing before the target date triggers a behavioral confirmation modal to encourage financial discipline.

---

## 2. Multi-View Architecture & Navigation Map
```
[Sidebar Nav & Mobile Bottom Tabs]
   │
   ├── 'viewDashboard'    (Executive Overview - Personal Cashflow ONLY)
   ├── 'viewMyWallet'     (Funding Sources & ATM Cards)
   ├── 'viewTransactions' (Financial Calendar & Full Ledger)
   ├── 'viewSplitBill'    (Receipt/PDF OCR + PB1 Tax Splitter)
   ├── 'viewMarket'       (Real-Time IHSG, Gold, & Crypto Dashboard)
   ├── 'viewSavings'      [NEW DEDICATED DASHBOARD] (Savings & Financial Goals)
   └── 'viewSettings'     (Profile Name "Daniel", Cloud/Telegram)
```

- **Sidebar Menu Item**:
  - Label: `"Tabungan & Impian"`
  - Icon: Lucide `piggy-bank`
  - Attribute: `data-view="savings"`
- **Mobile Bottom Tab Bar**:
  - Icon + Label: `"Tabungan"`
  - Attribute: `data-view="savings"`

---

## 3. Dedicated Savings Dashboard UI Structure (`#viewSavings`)

Designed using Dompet DexignLab dark theme palette (`#13141F`, `#1E1E2D`, `#00D2D3`) and Apple typography (New York serif for balances, SF for UI labels, SF Mono for tabular numbers):

### ROW 1: Header & Quick Actions
- Title: **"Tabungan & Impian (Savings Goals)"** in Apple New York font.
- Subtitle: "Alokasikan pos dana dingin dan target impian masa depan Anda secara teratur".
- Action Buttons:
  - **`+ Buat Impian Baru`** (`#btnOpenAddGoal`): Opens modal to define a new goal.
  - **`+ Setor Cepat`** (`#btnOpenQuickDeposit`): One-click shortcut to deposit funds into any goal.

### ROW 2: 4 Savings KPI Cards
1. **Total Uang Ditabung**:
   - Sum of balances across all active savings goals in large Apple New York font (`Rp ...`).
2. **Rata-Rata Capaian Goals**:
   - Overall percentage progress across all active goals (e.g. `68.5% tercapai`).
3. **Goals Terdekat Selesai**:
   - Highest percentage goal nearing 100% (e.g. `Upgrade Laptop - 86%`).
4. **Dana Darurat Terkumpul**:
   - Balance in the Emergency Fund pos (e.g. `Rp 18.000.000 / Rp 30.000.000`).

### ROW 3: Category Filter Pills
- `Semua Impian`
- `Darurat & Proteksi`
- `Liburan & Traveling`
- `Gadget & Hobi`
- `Investasi & Aset Besar`

### ROW 4: Savings Goals Cards Grid (`#savingsGoalsGrid`)
Each goal card features:
- Emoji / Icon + Goal Name (`🛡️ Dana Darurat`, `✈️ Liburan Akhir Tahun`, `💻 Upgrade Gadget`, `🏠 DP Rumah/Mobil`).
- Category Tag & Lock Status (`🔒 Terkunci s/d Des 2026` or `🔓 Fleksibel`).
- Current Saved Balance in New York font (`Rp 18.000.000`).
- Target Amount (`Target: Rp 30.000.000`).
- Animated Glowing Linear Progress Bar with percentage indicator.
- Smart Velocity Advice:
  - e.g. *"Sisa Rp 12.000.000 lagi (cukup sisihkan Rp 2.000.000/bln selama 6 bulan)"*.
- Action Buttons on Each Card:
  - **`+ Setor`**: Opens deposit modal pre-selecting this goal.
  - **`↩ Cairkan`**: Opens withdrawal modal back to wallet. If goal is locked, triggers Anti-Khilaf prompt!
  - **Edit / Hapus** menu.

---

## 4. Modals & Workflows

### 1. Modal: Buat / Edit Impian (`#modalAddGoal`)
- Field: Nama Impian (misal: "Liburan ke Jepang")
- Field: Kategori (Darurat, Liburan, Gadget, Properti, Lainnya)
- Field: Target Nominal (Rp)
- Field: Saldo Awal (Rp)
- Field: Sumber Dana Awal (Pilih dompet, e.g. BCA Utama)
- Field: Target Tanggal Selesai (Date picker)
- Field: Sakelar "Smart Lock" (Kunci tabungan sampai tanggal target untuk disiplin menabung)
- Field: Warna Aksen Kartu (Color picker)

### 2. Modal: Setor Dana (`#modalDepositGoal`)
- Dropdown: Pilih Pos Impian Tujuan
- Dropdown: Dari Rekening Mana (BCA, Mandiri, GoPay, Tunai)
- Input: Nominal Setoran (Rp)
- Action: Deducts balance from chosen wallet, adds balance to goal, records internal mutation transaction, updates all views, and displays Dynamic Island HUD toast!

### 3. Modal: Cairkan Dana (`#modalWithdrawGoal`)
- Dropdown: Dari Pos Impian Mana
- Dropdown: Ke Rekening Mana (BCA, Mandiri, GoPay, Tunai)
- Input: Nominal Penarikan (Rp)
- Behavior:
  - If goal is **Unlocked**: processes withdrawal immediately.
  - If goal is **Locked** and today's date < target date: shows an Apple-style **Anti-Khilaf Alert Dialog**:
    > *"Pos impian ini dikunci sampai [Target Date]. Menarik dana sebelum target dapat menunda impianmu. Apakah Anda yakin ini keadaan darurat?"*
    > [Batal - Tetap Nabung]  [Ya, Tetap Cairkan]

---

## 5. Mathematical Calculations & Engine (`js/savings.js`)
- `calculateGoalProgress(current, target) -> { percentage, remainingNominal }`
- `calculateMonthlySavingsVelocity(remainingNominal, targetDate) -> { monthsRemaining, monthlyAmount }`
- `depositToGoal(goalsList, walletsList, { goalId, walletId, amount }) -> { updatedGoals, updatedWallets, transaction }`
- `withdrawFromGoal(goalsList, walletsList, { goalId, walletId, amount }) -> { updatedGoals, updatedWallets, transaction }`
- Default Seed: 4 Populer Templates (Emergency Fund, Holiday, Gadget, House/Car).

---

## 6. Verification Plan & Test Matrix
- Unit tests in `tests/savings.test.js` validating:
  - Progress percentage & remaining calculations.
  - Monthly savings velocity math.
  - Two-way deposit & withdrawal ledger accounting.
  - Lock status verification.
- Browser test validating:
  - Navigation to "Tabungan & Impian" via sidebar and mobile bottom nav.
  - Making a deposit updates wallet balance and goal progress bar with dynamic animation.
  - Attempting to withdraw from a locked goal displays the anti-khilaf dialog.
