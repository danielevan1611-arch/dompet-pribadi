# Mobile-First Personal Finance & Telegram Bot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform DompetKu into a unified, high-ergonomic personal finance dashboard with Apple HIG typography, iOS Bottom Tab Bar on mobile, tactile haptic HUD feedback, and a Telegram Bot for zero-browser expense recording.

**Architecture:** Client-side standalone PWA (HTML5, Tailwind CSS, GSAP, vanilla ES6 modules) synchronized with Supabase cloud database, coupled with a Node.js Telegram Bot service (`services/telegram-bot.js`) reusing the local natural language parser (`js/quickParser.js`).

**Tech Stack:** Vanilla JavaScript (ES6+), Tailwind CSS, GSAP, Node.js (`node:test`), Telegram Bot API, Supabase JS client.

**Spec:** `docs/superpowers/specs/2026-11-08-mobile-personal-finance-telegram-design.md`

## Global Constraints
- Unified typography: Inter (Sans UI) + JetBrains Mono (Numbers/Currency) with `tabular-nums` across all components.
- Zero-CORS standalone compatibility: `file:///` double-click capability preserved without runtime build tools.
- Strict touch target compliance: Minimum 44×44px interactive targets on all mobile controls.
- All existing and new unit tests must pass via `node --test tests/*.test.js`.

## Review Focus
1. Mobile viewport overflow / clipping on iPhone SE (375px) and Android (390-412px).
2. Bottom tab bar obscuring the lowest content without proper bottom safe-area padding.
3. Typography scale inconsistency: replacing mismatched `text-[10px]`, `text-[11px]`, `text-xs`, and `text-sm` with standardized design tokens.
4. Telegram parser accurately identifying currency abbreviations (`k`, `rb`, `jt`, dot-formatted) and categories.
5. Touch feedback and HUD pop behavior when recording transactions on mobile.

---

### Task 1: Unified Typography & Design System Scale
**Files:**
- Modify: `index.html:60-120`
- Test: `tests/motion.test.js`

- [ ] Import Google Fonts `Inter` (weights: 400, 500, 600, 700) and `JetBrains Mono` (weights: 400, 600).
- [ ] Define standardized typography scale classes in `<style>`:
  - `.font-display`: Inter, -apple-system, 24px/bold tracking-tight
  - `.font-section`: 18px/semibold tracking-tight
  - `.font-headline`: 14px/semibold
  - `.font-body`: 13px/normal leading-relaxed
  - `.font-caption`: 11px/medium uppercase tracking-wider
  - `.font-num`: JetBrains Mono, monospace, `font-variant-numeric: tabular-nums`
- [ ] Audit and standardize all text elements across cards, headers, tables, and modals to match the typography scale.
- [ ] Run test suite to verify no syntax breaks.
- [ ] Commit changes.

---

### Task 2: Personal Finance Streamlining (Remove Multi-User / Couple UI)
**Files:**
- Modify: `index.html` (header, sidebar, settings modal)
- Modify: `js/app.js` and `js/bundle.js`
- Test: `tests/store.test.js`

- [ ] Remove `#segmentedControlTrack` (`btnRoleA`, `btnRoleShared`, `btnRoleB`) from top header.
- [ ] Remove `#coupleBanner` and couple pairing UI components from sidebar and main layout.
- [ ] Simplify `modalSettings`: replace partner code join inputs with clean Personal Profile & Cloud/Telegram Sync controls.
- [ ] Update `js/store.js` and `tests/store.test.js` to ensure 100% test coverage for personal single-user finance flows.
- [ ] Run test suite (`node --test tests/store.test.js`).
- [ ] Commit changes.

---

### Task 3: iOS Bottom Tab Bar & Mobile Ergonomics
**Files:**
- Modify: `index.html`
- Modify: `js/bundle.js` and `js/app.js`

- [ ] Add `#mobileBottomNav` fixed at bottom on mobile (`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141416]/90 backdrop-blur-xl border-t border-white/10`).
- [ ] Create 4 primary tabs: Ringkasan, Dompet, Transaksi, Pengaturan with min 44×44px touch targets.
- [ ] Add smooth tab switching logic in `js/bundle.js` and `js/app.js` that scrolls smoothly to each section.
- [ ] Add bottom content padding (`pb-24 lg:pb-8`) so cards and tables are fully visible above the bottom bar.
- [ ] Ensure mobile transaction table converts to a clean card feed on small screens.
- [ ] Commit changes.

---

### Task 4: Dynamic Island HUD & Mobile Haptics
**Files:**
- Modify: `js/motion.js`
- Modify: `js/app.js` and `js/bundle.js`
- Test: `tests/motion.test.js`

- [ ] Add `triggerHapticFeedback()` helper using `navigator.vibrate([15, 30, 15])`.
- [ ] Integrate haptic feedback inside `showDynamicIslandHUD()`.
- [ ] Verify HUD notifications trigger upon transaction addition, deletion, wallet creation, and CSV export.
- [ ] Add unit test in `tests/motion.test.js` validating HUD controller and vibration fallback.
- [ ] Run test suite (`node --test tests/motion.test.js`).
- [ ] Commit changes.

---

### Task 5: Telegram Bot Service & Supabase Sync Engine
**Files:**
- Create: `services/telegram-bot.js`
- Create: `tests/telegramBot.test.js`
- Modify: `package.json`

- [ ] Create `services/telegram-bot.js` connecting to Telegram Bot API and Supabase JS client.
- [ ] Implement message handler using `parseQuickInput` from `js/quickParser.js`.
- [ ] Format receipt confirmation response in markdown with emojis and remaining wallet balances.
- [ ] Create `tests/telegramBot.test.js` simulating incoming Telegram chat messages and validating output payloads.
- [ ] Run full test suite: `node --test tests/*.test.js`.
- [ ] Commit changes.
