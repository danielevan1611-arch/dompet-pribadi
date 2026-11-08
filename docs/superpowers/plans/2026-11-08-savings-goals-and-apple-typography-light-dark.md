# Implementation Plan: Apple Typography, Light/Dark Theme, & Dedicated Savings Dashboard

**Date**: 2026-11-08  
**Author**: Antigravity Pair Programmer (with Superpowers & Konoha)  
**Spec Reference**: `docs/superpowers/specs/2026-11-08-savings-goals-dashboard-design.md`  

---

## Task Breakdown

### Phase 1: Apple Typography 4-Font Pairing & Light/Dark Mode CSS
- [ ] Add `@font-face` rules in `index.html` referencing extracted fonts in `assets/fonts/`:
  - `SF Pro`: `assets/fonts/SF-Pro-Display-Regular.otf`, `SF-Pro-Display-Medium.otf`, `SF-Pro-Display-Bold.otf`
  - `SF Compact`: `assets/fonts/SF-Compact-Text-Regular.otf`, `SF-Compact-Text-Medium.otf`, `SF-Compact-Text-Bold.otf`
  - `SF Mono`: `assets/fonts/SF-Mono-Regular.otf`, `SF-Mono-Medium.otf`, `SF-Mono-Semibold.otf`, `SF-Mono-Bold.otf`
  - `New York`: `assets/fonts/NewYork.ttf`
- [ ] Define CSS typography utility classes:
  - `.font-sf-pro` -> primary UI font
  - `.font-sf-compact` -> badges, micro-labels, watchOS-style pills
  - `.font-sf-mono` -> numbers, currency amounts, tabular numerals (`tabular-nums`)
  - `.font-new-york` -> editorial titles, greetings, large balances
- [ ] Implement Light/Dark mode CSS theme system:
  - Define semantic CSS variables: `--bg-primary`, `--bg-card`, `--bg-card-secondary`, `--text-primary`, `--text-secondary`, `--border-color`.
  - Dark mode (`.dark`): `#13141F` background, `#1E1E2D` card background, `#FFFFFF` text.
  - Light mode (`.light`): `#F2F2F7` background, `#FFFFFF` card background, `#1C1C1E` text, `#E5E5EA` borders.
  - Add theme toggle button in Top Header (`#btnThemeToggle`) and Settings view.
  - Persist theme in `localStorage.getItem('dompetku_theme')` with smooth transition.

### Phase 2: Savings & Financial Goals Core Engine (TDD)
- [ ] Write unit tests in `tests/savings.test.js`:
  - Test `calculateGoalProgress(current, target)` (percentage, remaining, isCompleted).
  - Test `calculateMonthlySavingsVelocity(remainingNominal, targetDate)` (remaining months, monthly required rate).
  - Test `depositToGoal(goals, wallets, { goalId, walletId, amount })` (deducts wallet, adds goal balance, emits transaction).
  - Test `withdrawFromGoal(goals, wallets, { goalId, walletId, amount })` (deducts goal balance, credits wallet, emits transaction).
  - Test `validateGoalLock(goal, todayDate)` (checks if goal is locked and active).
- [ ] Implement `js/savings.js` with zero dependencies (pure ES module & CommonJS compatible).
- [ ] Run `node --test tests/savings.test.js` to ensure 100% test pass.

### Phase 3: Dedicated Savings Dashboard Markup (`index.html`)
- [ ] Add Sidebar menu item: `"Tabungan & Impian"` (`data-view="savings"`, Lucide `piggy-bank`).
- [ ] Add Mobile Bottom Bar navigation tab: `"Tabungan"` (`data-view="savings"`).
- [ ] Create standalone `<section id="viewSavings" class="view-screen hidden space-y-6">`:
  - Row 1: Header title ("Tabungan & Impian" in New York font) + "+ Buat Impian" & "+ Setor Cepat" buttons.
  - Row 2: 4 KPI Cards (Total Ditabung, Rata-rata Capaian, Goals Terdekat, Dana Darurat).
  - Row 3: Category filter pills (Semua, Darurat, Liburan, Gadget, Properti).
  - Row 4: Responsive grid of savings goal cards (`#savingsGoalsGrid`).
  - Modals:
    - `#modalAddGoal` (Create/edit goal form)
    - `#modalDepositGoal` (Deposit from wallet to goal)
    - `#modalWithdrawGoal` (Withdraw from goal to wallet)
    - `#modalAntiKhilafAlert` (Apple-style Anti-Khilaf lock warning modal)

### Phase 4: Integration & Reactive Controller (`js/bundle.js` & `js/app.js`)
- [ ] Add `savings` view routing to `switchView(viewName)`.
- [ ] Store & load savings goals in `localStorage.getItem('dompetku_savings_goals')` with 4 default seed templates.
- [ ] Wire render functions for KPIs, category filtering, and goal cards with velocity advice.
- [ ] Wire deposit and withdrawal actions to deduct/credit wallets, append transactions, and trigger Dynamic Island toasts.
- [ ] Wire Light/Dark theme toggle event listeners and sync icon (Sun/Moon).

### Phase 5: Verification & Quality Gate
- [ ] Run all unit tests: `node --test tests/*.test.js` (ensure 40+ tests pass).
- [ ] Verify Light/Dark mode styling and contrast.
- [ ] Verify zero-CORS compatibility for local `file:///` standalone usage.
- [ ] Commit with clean git message.
