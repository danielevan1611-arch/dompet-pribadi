# Design Document: Dedicated Market & Investment Dashboard (Multi-View SPA)

**Date**: 2026-11-08  
**Status**: Approved Specification  
**Architecture Rule**: Zero intrusion into the main Dashboard. Market & Investment lives completely on its own dedicated full-screen dashboard (`viewMarket`) accessible via Sidebar and Mobile Navigation.  
**Target Spec File**: `docs/superpowers/specs/2026-11-08-market-investment-portfolio-design.md`

---

## 1. Intent & Purpose (The "Why")
The user requested a **Real-Time Market & Investment Dashboard**:
1. **Strict View Isolation**: The main executive Dashboard (`viewDashboard`) remains 100% clean—no tickers or market cards.
2. **Dedicated Market Dashboard (`viewMarket`)**: When the user clicks the "Market & Investasi" nav item, the app transitions into a full standalone dashboard dedicated to financial markets and Daniel's investment holdings:
   - **IHSG (Indeks Harga Saham Gabungan)** & Top Bluechips (BBCA, BBRI, BMRI, TLKM, ASII).
   - **Harga Emas Dunia (XAU/USD)** & Emas Batangan Antam (Rp/gram).
   - **Bitcoin & Top Crypto** (BTC, ETH, SOL, BNB, XRP) in IDR & USD with live tick movements.
   - **Asset Portfolio Tracker (Fitur 1B)**: Record personal holdings (e.g. 10g Emas Antam, 0.05 BTC, 25 lot BBCA) with automatic real-time valuation and unrealized Profit/Loss (PnL).

---

## 2. Multi-View Architecture & Navigation Map
```
[Sidebar Nav & Mobile Bottom Tabs]
   │
   ├── 'viewDashboard'    (Executive Personal Finance ONLY - No market clutter)
   ├── 'viewMyWallet'     (Dedicated Screen: All Funding Sources, ATM Cards, Transfers)
   ├── 'viewTransactions' (Dedicated Screen: Financial Calendar & Full Ledger)
   ├── 'viewSplitBill'    (Dedicated Screen: Receipt/PDF OCR + PB1 Tax Splitter)
   ├── 'viewMarket'       [NEW DEDICATED DASHBOARD] (Full Market & Investment Dashboard)
   └── 'viewSettings'     (Dedicated Screen: Profile Name "Daniel", Cloud/Telegram)
```

- **Sidebar Menu Item**:
  - Label: `"Market & Investasi"`
  - Icon: Lucide `trending-up`
  - Attribute: `data-view="market"`
- **Mobile Bottom Tab Bar**:
  - Icon + Label: `"Market"`
  - Attribute: `data-view="market"`

---

## 3. Dedicated Market Dashboard UI Structure (`#viewMarket`)

The `#viewMarket` screen is designed as a complete, self-contained dashboard following the Dompet DexignLab dark aesthetic (`#13141F`, `#1E1E2D`, `#00D2D3`) and Apple typography (New York serif for balances, SF for UI labels, SF Mono for prices):

### ROW 1: Market Executive Header & Status Bar
- Title: **"Market & Investment Dashboard"** (Apple New York font).
- Subtitle: "Pantauan harga real-time IHSG, Emas Antam, dan Top Crypto serta nilai portofolio Anda".
- Status Badges:
  - `Bursa Efek Indonesia (IDX)`: Buka / Tutup badge.
  - `Crypto Market`: 24/7 Aktif badge.
  - `Kurs Referensi`: 1 USD = Rp 15.850.
- Top Action: **`+ Catat Aset Portofolio`** (Button to record new asset holdings).

### ROW 2: 4 Market KPI Cards (Apple Specular Gradients)
1. **Total Portofolio Investasi**:
   - Total current market value of all assets owned by Daniel in New York serif font (e.g. `Rp 48.650.000`).
2. **Total Keuntungan / Kerugian (Unrealized PnL)**:
   - Net profit or loss with badge (e.g. `+Rp 4.350.000 (+9.8%)` in Emerald `#10B981` or `-Rp ...` in Rose `#FF3B30`).
3. **Top Performing Asset (Hari Ini)**:
   - The highest gaining asset today (e.g. `SOL/IDR +6.4%` or `BBCA +1.8%`).
4. **Emas Batangan Antam Hari Ini**:
   - Current price per gram (e.g. `Rp 1.485.000/g (+0.6%)`).

### ROW 3: Category Filter Pills
- `Semua Aset`
- `Saham Indonesia (IHSG)`
- `Emas & Logam Mulia`
- `Crypto Terbesar`
- `Portofolio Saya (1B)` (Displays only holdings owned by Daniel with purchase cost and profit calculation).

### ROW 4: Live Market Cards Grid & Real-Time Price Stream
Each asset card includes:
- Asset Icon & Badge (Bitcoin, Ethereum, Solana, Gold Bar Antam, IDX Bull, etc.).
- Asset Name & Ticker Code.
- Live Price in Rupiah (`Rp ...`) and USD where applicable.
- 24h Change Badge: `+3.45%` (Green) or `-1.20%` (Red).
- Mini SVG Sparkline trend line.
- Real-Time Tick Micro-Interaction: Smooth flash animation when price updates.

### ROW 5: Portfolio Asset Holdings Ledger (Feature 1B)
- A clean CRM table listing all owned assets:
  - Nama Aset & Kategori
  - Jumlah Kepemilikan (misal: 10 gram, 0.05 BTC, 20 lot)
  - Modal Rata-rata Beli
  - Harga Terkini Real-Time
  - Total Nilai Pasar Terkini
  - Untung / Rugi (PnL)
  - Aksi: Edit / Hapus

---

## 4. Calculation Engine & Logic (`js/market.js`)
- Standard 1 lot = 100 shares for Indonesian stocks.
- Grams conversion for Gold.
- Fractional coin precision for Crypto.
- Live price streaming protocol with resilient zero-CORS offline fallback.
- Persisted to `localStorage` under `dompetku_market_portfolio_v1`.

---

## 5. Verification Plan
- Unit tests in `tests/market.test.js` validating valuation, PnL calculations, lot multiplier, and tick generator.
- Browser test validating:
  - Main Dashboard (`viewDashboard`) has ZERO market widgets or tickers.
  - Clicking "Market & Investasi" opens the dedicated full-screen Market Dashboard.
  - Adding an asset in Portofolio Saya computes accurate real-time PnL.
