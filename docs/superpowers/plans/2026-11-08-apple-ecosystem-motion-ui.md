# Apple Ecosystem Motion & Tactile UI/UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the DompetKu dashboard into a living Apple ecosystem experience with fluid sliding segmented control, Apple Cash rolling counters, Dynamic Island HUD notifications, tactile Apple Card depth, and staggered animations.

**Architecture:** A lightweight, zero-dependency motion layer in `js/motion.js` that orchestrates rolling numbers, sliding pill geometry, and Dynamic Island toasts using native `requestAnimationFrame` and CSS spring curves, enhanced by GSAP 3.12 CDN when online. Store events and render passes in `js/bundle.js` trigger these motion effects without blocking UI responsiveness or breaking zero-CORS `file:///` compatibility.

**Tech Stack:** JavaScript (ES6+ / IIFE), Tailwind CSS, GSAP 3.12 (with pure CSS Spring fallback), Chart.js, Node.js Test Runner.

**Spec:** `docs/superpowers/specs/2026-11-08-apple-ecosystem-motion-ui-design.md`

## Global Constraints

- Zero-CORS offline execution: The application MUST run flawlessly when double-clicked as `index.html` via `file:///` without module imports or server dependencies.
- Anti-Slop Discipline: Zero generic rainbow text gradients, floating purple neon blobs, or full-page diffuse shadows.
- Non-blocking motion: Animations must never freeze or delay user interactions; duration capped at 250-350ms.
- Existing Test Integrity: All 13 existing unit tests must remain passing without modification to store logic or privacy isolation.
- Accessibility: All animations must honor `prefers-reduced-motion: reduce`.

## Review Focus

1. **Reduced Motion Query**: User has OS "Reduce Motion" enabled; all number counters, sliding pills, and HUDs must instantly snap to target state without tweening.
2. **Rapid Tab Swapping**: User taps between "Kamu", "Bersama", and "Pacar" faster than the 280ms transition; the sliding pill must retarget cleanly without jitter or getting detached from the active button.
3. **Large Number Formatting**: Rolling counter receives large amounts (e.g. `Rp 1.500.000.000`); ticker must format currency cleanly with thousands separators without layout overflow.
4. **Offline / CDN Failure**: User opens app without internet; GSAP CDN fails to load; CSS Spring and `requestAnimationFrame` fallback must keep all motions functional without throwing console errors.
5. **Dynamic Island Collision**: Multiple notifications triggered in rapid succession; previous toast must seamlessly morph or replace without stacking messy DOM duplicates.

---

### Task 1: Motion Engine & Utility Module (`js/motion.js` & tests)

**Files:**
- Create: `js/motion.js`
- Create: `tests/motion.test.js`

**Interfaces:**
- Consumes: None (pure standalone utilities).
- Produces:
  - `calculatePillOffset(containerRect, targetRect) -> { left: number, width: number }`
  - `animateNumber(element, startVal, endVal, options)`
  - `showHUD(iconName, message, type)`
  - `isReducedMotion() -> boolean`

- [ ] **Step 1: Write the failing test for motion utility calculations and formatting**

```javascript
// tests/motion.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePillOffset, formatIndonesianRupiah } from '../js/motion.js';

test('Motion Engine - calculatePillOffset should compute relative left and width', () => {
  const container = { left: 100, width: 300 };
  const target = { left: 180, width: 90 };
  const offset = calculatePillOffset(container, target);
  assert.equal(offset.left, 80);
  assert.equal(offset.width, 90);
});

test('Motion Engine - formatIndonesianRupiah should format currency numbers', () => {
  assert.equal(formatIndonesianRupiah(15000), 'Rp 15.000');
  assert.equal(formatIndonesianRupiah(1250000), 'Rp 1.250.000');
  assert.equal(formatIndonesianRupiah(0), 'Rp 0');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/motion.test.js`
Expected: FAIL with module not found or export not defined.

- [ ] **Step 3: Implement `js/motion.js` with pure math, formatters, and DOM animation helpers**

Implement `calculatePillOffset`, `formatIndonesianRupiah`, `animateNumber`, `showDynamicIslandHUD`, and `isReducedMotion` with zero external dependencies.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/motion.test.js`
Expected: PASS (all tests pass).

- [ ] **Step 5: Commit**

```bash
git add js/motion.js tests/motion.test.js
git commit -m "feat(motion): add motion engine with pill calculation, number ticker, and HUD helpers"
```

---

### Task 2: Apple Segmented Control Sliding Pill & Dynamic Island HUD Markup (`index.html`)

**Files:**
- Modify: `index.html:105-135` (Segmented control container & Dynamic Island)
- Modify: `index.html:50-95` (Styles & GSAP CDN)

**Interfaces:**
- Consumes: `js/motion.js` styles and DOM IDs.
- Produces:
  - `#rolePillIndicator` (Absolute sliding pill inside segmented control)
  - `#dynamicIslandHUD` (Fixed top floating capsule)
  - `#dynamicIslandIcon`, `#dynamicIslandText`

- [ ] **Step 1: Add Dynamic Island HUD markup and sliding indicator to `index.html`**

Add `#dynamicIslandHUD` at top of `<body>`. Wrap `#btnRoleA`, `#btnRoleShared`, `#btnRoleB` inside a relative container with an absolute `#rolePillIndicator`.

- [ ] **Step 2: Add Apple Specular Highlights and CSS Spring Animation Classes to `<style>`**

Add `.ios-card-specular`, `.ios-pill-spring`, and `@media (prefers-reduced-motion: reduce)` rules in `index.html`.

- [ ] **Step 3: Include GSAP 3.12 CDN with graceful fallback**

Add `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>` in `<head>`.

- [ ] **Step 4: Verify markup integrity and test suite**

Run: `node --test tests/*.test.js`
Expected: PASS (15 tests passing across 4 suites).

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(ui): add Dynamic Island HUD, sliding segmented pill, and Apple specular styles"
```

---

### Task 3: Bundle Integration & Motion Wiring (`js/bundle.js` & `js/app.js`)

**Files:**
- Modify: `js/bundle.js`
- Modify: `js/app.js`

**Interfaces:**
- Consumes:
  - `animateNumber` on `renderKpis()`
  - `moveSegmentedPill(targetBtn)` on role switch click
  - `showHUD(icon, text)` on quick submit, receipt scan, copy code, and wallet creation
  - `staggerReveal()` on `renderWallets()` and `renderTransactions()`
- Produces: Integrated runtime experience in both modular and single-file bundle.

- [ ] **Step 1: Wire rolling number counter to KPI updates**

Replace static `innerHTML = ...` on `kpiNetWorth`, `kpiIncome`, and `kpiExpense` with `animateNumber` tweening from the previous balance to the new balance.

- [ ] **Step 2: Wire sliding pill movement on role switch**

Implement `updateRoleButtons()` to calculate the bounding rectangle of the active button relative to the segmented control track and set `transform: translateX(...)` with spring easing.

- [ ] **Step 3: Wire Dynamic Island HUD to user actions**

Attach `showHUD`:
- Quick submit: `showHUD('check-circle', 'Transaksi berhasil dicatat!', '#34C759')`
- Receipt scan: `showHUD('camera', 'Nominal berhasil dipindai!', '#007AFF')`
- Copy code: `showHUD('copy', 'Kode pasangan tersalin!', '#AF52DE')`
- Add wallet: `showHUD('wallet', 'Dompet baru ditambahkan!', '#34C759')`

- [ ] **Step 4: Wire staggered reveal animation for wallet cards and transaction list**

Add entrance stagger animation with 0.025s interval when new elements are injected into `#walletsContainer` and `#transactionsContainer`.

- [ ] **Step 5: Run automated test suite**

Run: `node --test tests/*.test.js`
Expected: PASS (all 15 unit tests pass).

- [ ] **Step 6: Commit**

```bash
git add js/bundle.js js/app.js
git commit -m "feat(motion): wire rolling numbers, sliding segmented pill, and Dynamic Island HUD"
```

---

### Task 4: Tactile Apple Card Visual Polish & Spotlight Interactions

**Files:**
- Modify: `index.html`
- Modify: `js/bundle.js`
- Modify: `js/app.js`

**Interfaces:**
- Consumes: Tailwind classes & Apple HIG design tokens.
- Produces: Apple Card specular lighting, microchip icons, and interactive Spotlight focus.

- [ ] **Step 1: Enhance wallet card DOM with Apple Card specular gradient and microchip SVG**

In `renderWallets()`, add a subtle embossed chip icon and card sheen to each wallet squircle.

- [ ] **Step 2: Add tactile hover & active spring states to all buttons**

Ensure all buttons, cards, and input controls have `active:scale-[0.97]` and transition smoothness.

- [ ] **Step 3: Test and verify in browser**

Run: `node --test tests/*.test.js`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add index.html js/bundle.js js/app.js
git commit -m "feat(ui): add Apple Card visual specular details and Spotlight focus ring"
```

---

### Task 5: Final Verification, Zero-CORS Check & Live Launch

**Files:**
- Test all components across desktop and mobile screen sizes.

- [ ] **Step 1: Run full automated test suites**

Run: `node --test tests/*.test.js`
Expected: 15/15 tests passing.

- [ ] **Step 2: Verify zero-CORS double-click `file:///` compatibility**

Ensure `bundle.js` self-contains all motion and store logic so opening `index.html` directly works without error.

- [ ] **Step 3: Launch in browser and visually verify 60fps motion**

Run: `Start-Process "C:\Users\NITRO\.gemini\antigravity\scratch\dompet-pribadi\index.html"`
Verify:
1. Sliding segmented pill glides smoothly between Kamu, Bersama, Pacar.
2. Net worth and cash flow numbers roll up with spring animation.
3. Dynamic Island HUD drops down and disappears smoothly.
4. Wallet cards and transaction lists stagger in cleanly.

- [ ] **Step 4: Commit and finalize**

```bash
git commit --allow-empty -m "chore: complete Apple Ecosystem UI/UX & Motion implementation"
```
