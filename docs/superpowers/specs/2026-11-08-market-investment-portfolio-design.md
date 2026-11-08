# Design Document: Real-Time Market Watcher & Asset Investment Portfolio

**Date**: 2026-11-08  
**Status**: Pending Plan Approval (Brainstorming & Design Phase)  
**Selected Approach**: Pilihan A (Dedicated View "Market & Investasi" + Live Ticker Strip di Dashboard) + Pilihan 1B (Kalkulator Kepemilikan Aset & Portofolio Investasi)  
**Target Spec File**: `docs/superpowers/specs/2026-11-08-market-investment-portfolio-design.md`

---

## 1. Intent & Purpose (The "Why")
The user wants to monitor real-time financial market prices directly within their Dompet dashboard without leaving the application:
1. **IHSG (Indeks Harga Saham Gabungan)** & Top Indonesian Bluechips (BBCA, BBRI, BMRI, TLKM, ASII).
2. **Harga Emas Dunia (XAU/USD)** & Emas Batangan Antam (Rp/gram).
3. **Bitcoin & Top Crypto** (BTC, ETH, SOL, BNB, XRP) with USD and IDR exchange rates and 24h performance.
4. **Asset Portfolio Calculator (1B)**: Enable the user to record their personal asset holdings (e.g. 10g Emas Antam, 0.05 BTC, 25 lot BBCA) to automatically compute their total portfolio net worth and unrealized profit/loss (PnL) based on live prices.

---

## 2. Multi-View SPA Architecture & Navigation
The application routing is expanded to include the new screen:
```
[Sidebar Nav & Mobile Bottom Tabs]
   │
   ├── 'viewDashboard'    (Executive Overview + Live Running Ticker Strip)
   ├── 'viewMyWallet'     (Dedicated Screen: Funding Sources, ATM Cards, Transfers)
   ├── 'viewTransactions' (Dedicated Screen: Financial Calendar & Full Ledger)
   ├── 'viewSplitBill'    (Dedicated Screen: Receipt/PDF OCR + PB1 Tax Splitter)
   ├── 'viewMarket'       [NEW] (Dedicated Screen: Live Market Watcher & Investment Portfolio)
   └── 'viewSettings'     (Dedicated Screen: Profile Name "Daniel", Cloud/Telegram)
```

### Dashboard Enhancement: Live Running Ticker Strip
- Placed immediately beneath the Top Header on the Dashboard.
- Horizontally scrollable marquee/ticker cards showing:
  - `IHSG`: 7,285.40 (+0.42%)
  - `Emas Antam`: Rp 1.485.000/g (+0.68%)
  - `Bitcoin (BTC)`: Rp 1.542.800.000 ($96,400) (+3.15%)
  - `Ethereum (ETH)`: Rp 54.300.000 ($3,410) (+2.40%)
  - `BBCA`: Rp 10.250 (+1.23%)
- When a price ticks upwards or downwards, a subtle green/red pulse effect highlights the price change (Apple-style specular micro-interaction).

---

## 3. Screen Design: View Market & Investasi (`#viewMarket`)

The `#viewMarket` section contains three main zones:

### Zone 1: Summary Header & Portfolio Valuation Banner
- **Total Nilai Investasi (Portfolio Net Worth)**: Displayed in large Apple New York font (`Rp ...`).
- **Total Keuntungan / Kerugian (Unrealized PnL)**: Color-coded green (`+Rp ... (+12.4%)`) or red (`-Rp ... (-3.2%)`).
- **Kurs Acuan**: USD/IDR (e.g. `1 USD = Rp 15.850`) and status bursa IDX (Buka / Tutup).
- Quick Action Button: **`+ Tambah Aset Portofolio`** (opens modal to record asset holdings).

### Zone 2: Category Filter Tabs
1. **Semua Aset** (Overview of all tracked instruments).
2. **IHSG & Saham Indonesia**: IHSG Composite Index, BBCA (Bank Central Asia), BBRI (Bank Rakyat Indonesia), BMRI (Bank Mandiri), TLKM (Telkom Indonesia), ASII (Astra International).
3. **Emas & Logam Mulia**: Emas Antam Batangan (Rp/gram), Emas Spot Dunia (XAU/USD per troy ounce), Perak Dunia (XAG/USD).
4. **Crypto Majors**: Bitcoin (BTC), Ethereum (ETH), Solana (SOL), Binance Coin (BNB), Ripple (XRP).
5. **Portofolio Saya**: Dedicated breakdown of only assets owned by Daniel with purchase price, current value, and profit/loss.

### Zone 3: Market Instrument Cards & Sparklines
Each market card features:
- Asset Icon & Badge (e.g. Bitcoin gold coin, Antam gold bar, IDX stock bull icon).
- Asset Name & Ticker Code (`BTC/IDR`, `ANTAM`, `IHSG`, `BBCA`).
- Live Price in Rupiah (`Rp ...`) and USD secondary notation where relevant.
- 24h Change Badge: `+3.45%` (Emerald `#10B981`) or `-1.20%` (Rose `#FF3B30`).
- Mini SVG Sparkline: 7-point visual trend line showing intraday movement.
- High/Low 24h range bar.

---

## 4. Asset Portfolio Calculator Engine (`js/portfolio.js`)

### Math Specifications
1. **Stock Valuation (IDX / Lot Standard)**:
   - In Indonesia, 1 lot = 100 shares.
   - `totalCost = lots * 100 * buyPricePerShare`
   - `currentValue = lots * 100 * currentPricePerShare`
   - `pnlNominal = currentValue - totalCost`
   - `pnlPercentage = (pnlNominal / totalCost) * 100`

2. **Gold Valuation (Grams Standard)**:
   - `totalCost = grams * buyPricePerGram`
   - `currentValue = grams * currentPricePerGram`
   - `pnlNominal = currentValue - totalCost`
   - `pnlPercentage = (pnlNominal / totalCost) * 100`

3. **Crypto Valuation (Coin Fraction Standard)**:
   - `totalCost = coinUnits * buyPriceIDR`
   - `currentValue = coinUnits * currentPriceIDR`
   - `pnlNominal = currentValue - totalCost`
   - `pnlPercentage = (pnlNominal / totalCost) * 100`

4. **Integration with Net Worth**:
   - Total Net Worth = `Sum(Wallet Balances) + Sum(Portfolio Asset Values)`.
   - Toggle available in Settings or Header: "Sertakan Nilai Portofolio Investasi ke Net Worth".

---

## 5. Real-Time Data Streaming & Resilient Fallback

### Zero-CORS & Offline-First Protocol
- To ensure full compatibility with standalone double-click execution (`file:///`) and deployed web servers:
  1. **Live Network Strategy**:
     - Attempts live fetch from public CORS-friendly crypto endpoints (CoinGecko Simple Price API: `api.coingecko.com/api/v3/simple/price`).
     - Attempts live currency rate fetch from open exchange rate APIs.
  2. **Intelligent Live Simulation Engine (Fallback)**:
     - If network access is blocked by local file security policies (CORS) or user is offline, the engine initializes from authentic baseline prices (BTC ~Rp 1.54B, Gold ~Rp 1.48M/g, IHSG ~7,285).
     - Every 3.5 seconds, generates authentic micro-jitter ticks (within realistic ±0.08% bounds), updating sparklines and flashing green/red indicators.
     - Preserves 100% responsiveness without throwing uncaught exceptions in browser devtools.

---

## 6. Verification Plan & Test Matrix

### Automated Test Suite (`tests/market.test.js`)
1. **Test 1**: Asset portfolio valuation for IDX stocks with 100x lot conversion.
2. **Test 2**: Asset portfolio valuation for Gold in grams and Crypto in fractional coins.
3. **Test 3**: Unrealized PnL calculation (positive profit & negative loss percentages).
4. **Test 4**: Real-time tick generator bounds and data format consistency.

### Manual Browser Verification
- Verify navigation to "Market & Investasi" via sidebar and mobile bottom nav.
- Verify live running ticker strip on Dashboard with animated price ticks.
- Verify adding a sample asset (e.g. 10g Emas Antam or 0.05 BTC) and seeing live portfolio value update.
- Verify switching category tabs (All, Saham, Emas, Crypto, Portofolio).
