# Design Document: Mobile-First Personal Finance Dashboard & Telegram Integration

**Date**: 2026-11-08  
**Status**: In Review (Brainstorming Phase)  
**Author**: Antigravity & User  
**Target File**: `docs/superpowers/specs/2026-11-08-mobile-personal-finance-telegram-design.md`

---

## 1. Intent & Purpose (The "Why")
The dashboard previously incorporated couple pairing mechanics ("Kamu | Bersama | Pacar") which added cognitive overhead and visual clutter for single-user scenarios. The user wants to:
1. Streamline the application into an ultra-clean, high-performance **Personal Finance Dashboard** that can be independently deployed or given to their partner as a dedicated personal instance.
2. Deliver a **tier-1 mobile experience** with equal button responsiveness, Apple iOS Bottom Tab Bar navigation, tactile touch targets (>= 44px), and adaptive card layouts.
3. Integrate **Telegram Bot quick recording** so transactions can be logged in seconds via chat (`"kopi 25rb gopay"`, `"makan siang 35k"`) without having to launch a web browser.
4. Provide **unmistakable submission feedback**: Apple Dynamic Island HUD animations paired with mobile haptic feedback (`navigator.vibrate`) on the web, and formatted receipt confirmations in Telegram.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Personal Streamlining**: Remove segmented role switchers (`#segmentedControlTrack`), couple code pairing banners, and multi-user isolation logic. All wallets and transactions belong to the active personal profile.
- **iOS Bottom Tab Bar**: Implement a fixed, translucent bottom tab navigation bar on mobile (`< 768px`) with 4 essential tabs:
  1. *Ringkasan* (Overview & KPIs)
  2. *Dompet* (Wallets & Balances)
  3. *Transaksi* (CRM Data Feed & Filter)
  4. *Pengaturan* (Cloud Sync, Telegram Token, & Backup)
- **Mobile Touch Parity**: Ensure 100% button functionality (Camera OCR, Quick Input, Filter, Export, Modal actions) operates reliably with Apple Human Interface Guidelines standards on smartphones.
- **Tactile Feedback**: Trigger Dynamic Island visual toast + mobile haptic vibration (`navigator.vibrate([20, 40, 20])`) on successful transaction input or deletion.
- **Telegram Bot + Supabase Engine**: Provide a standalone Node.js bot service (`services/telegram-bot.js`) that receives user chat messages, parses them via `quickParser.js`, saves them to Supabase, and broadcasts instant receipt confirmations. Web dashboard syncs with Supabase in real-time.

### Non-Goals
- Multi-tenant permission management inside a single local storage partition (each user operates their own isolated personal instance).
- Migrating to heavy external JS frameworks; maintain vanilla ES6 zero-CORS standalone compatibility (`file:///` and HTTP).

### Anti-Goals
- Do NOT degrade the wide CRM landscape desktop experience. Desktop keeps its left sidebar and multi-column table, while mobile seamlessly adapts to bottom tab navigation and card feeds.
- Do NOT introduce dependencies that prevent offline local operation.

---

## 3. Approaches Considered & Selected

### Telegram Integration Approaches
1. **Approach A: Telegram Bot + Supabase Cloud Sync (SELECTED BY USER)**
   - *Architecture*: Telegram Bot Webhook / Long-polling service in Node.js connected to Supabase Database. Chatting `"makan 20k"` inserts into the `transactions` table. Web app polls / subscribes via Supabase Realtime.
   - *Trade-offs*: Requires free Supabase URL & Bot Token; provides effortless anywhere-anytime recording without keeping a browser tab open.
2. **Approach B: Telegram Mini App**
   - *Architecture*: Embedding the PWA directly inside Telegram WebApp iframe.
   - *Trade-offs*: Convenient within Telegram, but does not provide pure background chat-first recording without opening the web view.
3. **Approach C: Local-only Bot Script**
   - *Architecture*: Local script running only when laptop is active.
   - *Trade-offs*: Zero cloud dependencies, but fails if the computer is turned off while chatting from phone.

### Mobile Navigation Approaches
1. **Approach A: iOS Bottom Tab Bar (SELECTED BY USER)**
   - *Architecture*: Fixed bottom bar with blurred background and 4 touch-friendly tabs on mobile viewports (< 768px). Desktop sidebar remains active on >= 1024px.
   - *Trade-offs*: Best-in-class mobile thumb ergonomic navigation.
2. **Approach B: Hamburger Slide-over Drawer Only**
   - *Architecture*: Hidden sidebar accessible only via top-left hamburger icon.
   - *Trade-offs*: Requires reaching to the top of large phone screens; slower multi-section navigation.

---

## 4. Architectural & UI Design Specification

### A. Mobile UI Layout & Tab Bar
```
+--------------------------------------------------+
| [Dynamic Island HUD: "Tercatat Rp 25.000"]       |  <- Top HUD
| [Spotlight Quick Input: "makan 25k"]  [OCR] [->] |  <- Sticky Top Bar
+--------------------------------------------------+
|                                                  |
|  [KPI Metrics Carousel / Stack]                  |
|  - Net Worth, Pemasukan, Pengeluaran             |
|                                                  |
|  [Active Section: Ringkasan / Dompet / CRM Feed] |
|                                                  |
+--------------------------------------------------+
|  [Overview]    [Dompet]    [Transaksi]    [Set]  |  <- iOS Bottom Tab Bar (Mobile)
+--------------------------------------------------+
```

### B. Personalization & Cleanup
- Remove `#segmentedControlTrack` (`btnRoleA`, `btnRoleShared`, `btnRoleB`) from `index.html`.
- Remove `#coupleBanner` and couple pairing code logic from `app.js` and `bundle.js`.
- Retain Supabase Cloud Sync fields in `modalSettings` to allow cloud synchronization with the Telegram Bot.
- Add Telegram Bot Token / Chat ID status indicator in Settings.

### C. Feedback & Haptics
- Enhance `showDynamicIslandHUD(icon, text, color)`:
  ```javascript
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([15, 30, 15]);
  }
  ```

### D. Telegram Bot Service (`services/telegram-bot.js`)
- Runs with Node.js (`node services/telegram-bot.js`).
- Parses natural language via `js/quickParser.js`:
  - Input: `"kopi 25rb gopay"`
  - Parsed: `{ amount: 25000, category: 'Makanan & Minuman', wallet: 'GoPay', type: 'expense' }`
- Writes to Supabase `transactions` and updates `wallets` table.
- Replies to Telegram:
  ```
  ✅ Transaksi Berhasil Dicatat!
  ━━━━━━━━━━━━━━━━━━━━
  💵 Nominal: Rp 25.000
  📂 Kategori: Makanan & Minuman
  💳 Dompet: GoPay
  📝 Catatan: kopi
  ```

---

## 5. Verification & Testing Strategy
1. **Automated Unit Tests**:
   - Verify `quickParser.js` parses Telegram-style chat phrases accurately.
   - Verify `store.js` calculates single-user personal balances accurately.
   - Verify `motion.js` and HUD trigger without regression.
2. **Mobile Viewport Verification**:
   - Inspect 375px (iPhone SE), 390px (iPhone 14/15/16), and 412px (Android) viewports.
   - Test bottom tab bar switching between sections.
   - Test Spotlight input, camera file picker, category filter dropdown, and modal backdrop dismissal.
3. **Telegram Bot Dry Run**:
   - Test simulated Telegram incoming messages with test script and mock payload.
