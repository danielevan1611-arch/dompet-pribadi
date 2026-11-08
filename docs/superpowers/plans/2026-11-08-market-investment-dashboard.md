# Dedicated Market & Investment Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dedicated, full-screen Market & Investment Dashboard (`viewMarket`) that tracks real-time prices for IHSG & Indonesian stocks (BBCA, BBRI, BMRI, TLKM, ASII), World Gold (XAU/USD) & Antam (Rp/g), and Crypto Majors (BTC, ETH, SOL, BNB, XRP) with a personal asset portfolio calculator (Feature 1B) and zero clutter on the main executive dashboard.

**Architecture:** Multi-View Single Page Application (SPA). A new route `'market'` renders `<section id="viewMarket">` with 4 Market KPI cards, category filter pills, real-time live price grid with SVG sparklines, personal asset holdings ledger, and a modal to record assets. Mathematical logic is isolated in `js/market.js` tested via Node.js native test runner.

**Tech Stack:** Vanilla JS (ES6+), Tailwind CSS (Dompet DexignLab `#13141F`/`#1E1E2D` dark theme), Apple New York serif font + SF typography, Lucide Icons, GSAP motion, Node test runner (`node:test`).

**Spec:** `docs/superpowers/specs/2026-11-08-market-investment-portfolio-design.md`

## Global Constraints
- Zero intrusion into the main Dashboard (`viewDashboard`): no tickers or market widgets on the home dashboard.
- Indonesian stock market rules: 1 lot = 100 shares.
- Gold measured in grams (Antam) and troy ounces (XAU).
- Zero-CORS offline-first protocol: runs standalone on `file:///` and HTTP/HTTPS without uncaught network exceptions.
- Apple typography: New York serif for large values and headings, SF Mono for tabular prices.

## Review Focus
1. Stock lot multiplier: User inputs `25 lot` for BBCA; calculation must compute `25 * 100 * price` = 2,500 shares.
2. Fractional crypto precision: User inputs `0.025 BTC`; calculation must preserve decimal precision without integer truncation.
3. Negative and positive PnL formatting: Profit must render with green badge `+Rp ... (+%)`, loss with red badge `-Rp ... (-%)`.
4. Zero-CORS fallback resilience: If network fetch to public APIs fails or runs under `file:///`, engine seamlessly falls back to authentic live ticks without crashing.
5. SPA View Navigation: Switching to `'market'` hides all other views (`viewDashboard`, `viewMyWallet`, etc.) and highlights the active menu item.

---

### Task 1: Market & Portfolio Engine (`js/market.js` & `tests/market.test.js`)

**Files:**
- Create: `js/market.js`
- Create: `tests/market.test.js`

**Interfaces:**
- Produces:
  - `calculateAssetValuation({ type, units, buyPrice, currentPrice }) -> { totalCost, currentValue, pnlNominal, pnlPercentage }`
  - `calculatePortfolioSummary(holdingsList, marketPrices) -> { totalValuation, totalCost, totalPnlNominal, totalPnlPercentage }`
  - `INITIAL_MARKET_INSTRUMENTS` (Array of IHSG, BBCA, BBRI, BMRI, TLKM, ASII, Antam, XAU, BTC, ETH, SOL, BNB, XRP)
  - `generateNextTick(currentPrice, volatility) -> newPrice`

- [ ] **Step 1: Write the failing test in `tests/market.test.js`**
- [ ] **Step 2: Run test to verify it fails (`node --test tests/market.test.js`)**
- [ ] **Step 3: Implement calculation functions in `js/market.js`**
- [ ] **Step 4: Run test to verify it passes (`node --test tests/market.test.js`)**
- [ ] **Step 5: Commit changes to Git**

---

### Task 2: Market Dashboard HTML Markup (`index.html`)

**Files:**
- Modify: `index.html` (add `<section id="viewMarket" class="view-screen hidden space-y-6">` and modal `#modalAddAsset`)
- Modify: Sidebar nav and mobile bottom tab bar (add `data-view="market"`)

**Interfaces:**
- Consumes: SPA navigation pattern (`data-view="market"`)
- Produces:
  - `#viewMarket` container
  - `#marketKpiTotalPortfolio`, `#marketKpiTotalPnl`, `#marketKpiTopGainer`, `#marketKpiGoldRate`
  - Category filter pills: `#marketFilterAll`, `#marketFilterStocks`, `#marketFilterGold`, `#marketFilterCrypto`, `#marketFilterPortfolio`
  - `#marketCardsGrid`
  - `#portfolioHoldingsTableBody`
  - `#btnOpenAddAsset`, `#modalAddAsset`, `#formAddAsset`

- [ ] **Step 1: Add "Market & Investasi" to sidebar navigation and mobile bottom nav**
- [ ] **Step 2: Construct `<section id="viewMarket">` in `index.html` with KPI cards, filter pills, grid, and holdings table**
- [ ] **Step 3: Add modal `#modalAddAsset` with form fields (asset selection, units, buy price)**
- [ ] **Step 4: Verify HTML syntax and element IDs**
- [ ] **Step 5: Commit changes to Git**

---

### Task 3: Market Controller & Real-Time Engine Integration (`js/bundle.js` & `js/app.js`)

**Files:**
- Modify: `js/bundle.js`
- Modify: `js/app.js`

**Interfaces:**
- Consumes: `js/market.js` functions, `switchView('market')`
- Produces:
  - `renderMarketDashboard()`
  - `renderMarketCards(filteredCategory)`
  - `renderPortfolioHoldings()`
  - `startRealTimeTickerEngine()`
  - CRUD operations for personal asset holdings in `localStorage`

- [ ] **Step 1: Integrate market state, initial instruments, and asset holdings into `js/bundle.js`**
- [ ] **Step 2: Connect router `switchView('market')` to show `#viewMarket` and trigger `renderMarketDashboard()`**
- [ ] **Step 3: Implement real-time live tick stream with green/red flash micro-animations**
- [ ] **Step 4: Wire `#formAddAsset` and delete handlers for personal holdings with Dynamic Island HUD toasts**
- [ ] **Step 5: Mirror changes in `js/app.js` for ES module compatibility**
- [ ] **Step 6: Commit changes to Git**

---

### Task 4: Complete Verification & Browser Validation

**Files:**
- Verify: `tests/*.test.js`
- Verify: `index.html`

- [ ] **Step 1: Run all unit test suites (`node --test tests/*.test.js`)**
- [ ] **Step 2: Verify zero regression across existing 27 tests + new market tests**
- [ ] **Step 3: Launch in browser and verify user experience**
- [ ] **Step 4: Final Git commit**
