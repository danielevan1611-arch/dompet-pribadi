# Apple Ecosystem Motion & Tactile UI/UX Design Specification

- **Date**: 2026-11-08
- **Status**: Proposed / Pending User Approval
- **Project**: DompetKu — Personal & Couple Finance Dashboard
- **Location**: `docs/superpowers/specs/2026-11-08-apple-ecosystem-motion-ui-design.md`

---

## 1. Intent & Problem Statement
The user found the previous UI/UX "terlalu polos dan tidak ada motion sama sekali" (too plain, flat, and lacking motion). While the layout followed basic dark mode rules, it lacked the sensory polish, physical weight, fluid spring physics, and micro-interactions characteristic of the Apple ecosystem (Apple Wallet, Apple Cash, iOS 18 Dynamic Island, and Apple Health).

The objective of this design is to elevate DompetKu into a world-class, premium Apple ecosystem experience using proven motion tokens and UI/UX design intelligence from `ui-ux-pro-max`, while strictly honoring the anti-slop guidelines (no generic purple neon glows or rainbow gradients) and zero-CORS offline execution.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
1. **Fluid Sliding Segmented Control**: Replace abrupt instant tab switching with an authentic iOS sliding background pill that glides smoothly across *Kamu*, *Bersama*, and *Pacar* using spring physics (`cubic-bezier(0.25, 1, 0.5, 1)`).
2. **Apple Cash Rolling Number Ticker**: Animate numeric updates (Net Worth, Income, Expense, Wallet Balances) using rolling counter easing so numbers glide into place whenever roles switch or transactions are recorded.
3. **Dynamic Island HUD Feedback**: Add an iOS-style floating pill capsule at the top center of the screen that springs open (`scale(0.8) -> scale(1)`) to provide clear visual feedback for actions (e.g. "Transaksi Tercatat", "Resi Berhasil Dipindai", "Kode Tersalin") and auto-collapses smoothly.
4. **Apple Card Depth & Specular Materials**: Give wallet cards distinctive Apple Card styling with subtle top specular borders (`linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.02))`), gentle 3D hover parallax, and tactile spring depress (`active:scale-[0.97]`).
5. **Staggered Entrance Animation**: Implement staggered card and list reveals (0.02-0.03s delay) using GSAP / CSS spring keyframes for wallet cards and transaction rows.
6. **Zero-CORS & Offline Resiliency**: Retain instant double-click `file:///` and PWA functionality with CSS native spring fallbacks if external CDNs are unreachable.
7. **Accessibility (WCAG & Apple HIG)**: Honor `prefers-reduced-motion` to immediately display static end states without motion sickness.

### Non-Goals
1. Heavy 3D WebGL / Three.js canvas renders that drain mobile battery and add multi-megabyte bundle sizes.
2. Cartoonish or excessive bouncy animations that delay user data entry.
3. Altering database schemas or touching passing unit test contracts (13/13 passing tests must stay untouched).

### Anti-Goals
1. Generic "AI-slop" aesthetics: no rainbow text gradients, floating neon blobs, or full-page diffuse shadows.
2. Motion blocking interactions: animations must never prevent immediate tapping or typing.

---

## 3. Approaches Considered

### Approach A: Full Apple Wallet Physical Skeuomorphism
- Heavy card stack carousel with continuous 3D gyro tilt.
- *Trade-off*: Takes too much vertical viewport space on mobile, pushing the quick-input bar and transaction ledger off-screen.

### Approach B: iOS 18 System Minimalist (Tabular Only)
- Ultra-dense layout without card visual depth, relying strictly on monochrome tables.
- *Trade-off*: Solves density but remains sterile and does not address the user's explicit request for tactile motion and Apple ecosystem feel.

### Approach C: Apple Ecosystem Hybrid (Selected & User-Approved ⭐)
- Combines tactile Apple Card squircle cards, a sliding pill segmented control, Apple Cash rolling counter numbers, a Dynamic Island feedback capsule, and staggered list reveals.
- Delivers maximum delight, premium Apple feel, and immediate responsiveness without compromising information hierarchy or mobile usability.

---

## 4. Detailed Component Design & Motion Architecture

### 4.1. iOS Sliding Segmented Control
- **Structure**: A container with `position: relative; display: inline-flex; background: #1C1C1E; border: 1px solid rgba(255,255,255,0.08); border-radius: 9999px; padding: 4px;`.
- **Sliding Indicator**: An absolute background pill (`background: #2C2C2E; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border-radius: 9999px; transition: transform 0.28s cubic-bezier(0.25, 1, 0.5, 1), width 0.2s ease;`).
- **Interaction**: On click of any role button (`btnRoleA`, `btnRoleShared`, `btnRoleB`), calculate the active button's `offsetLeft` and `offsetWidth`, then translate the sliding pill smoothly.

### 4.2. Apple Cash Rolling Number Ticker
- **Algorithm**: A reusable utility function `animateValue(element, startVal, endVal, duration, prefix)`:
  - Uses `requestAnimationFrame` with an ease-out expo curve (`1 - Math.pow(2, -10 * progress)`).
  - Smoothly updates `kpiNetWorth`, `kpiIncome`, and `kpiExpense`.
  - Format dynamically with Indonesian currency formatting (`Rp 1.250.000`).

### 4.3. Dynamic Island HUD (Feedback Capsule)
- **Visuals**: Centered floating capsule at `top: 16px; left: 50%; transform: translateX(-50%); z-index: 100;`.
- **Appearance**: Deep black `#000000` with subtle border `rgba(255,255,255,0.14)`, rounded-full pill shape, featuring an icon and action text.
- **Lifecycle**:
  - `showHUD(iconName, message, accentColor)`
  - Pops in with spring scale (`scale(0.85) -> scale(1.03) -> scale(1)`), holds for 2.2 seconds, then smoothly exits upwards.

### 4.4. Apple Card Tactile Squircles
- **Visual Styling**:
  - Subtle specular hairline border: `border: 1px solid rgba(255, 255, 255, 0.1)`.
  - Apple Card inner lighting: Top-subtle radial gradient mimicking titanium/matte card textures.
  - Micro-chip / contactless icon detail rendered via clean SVG.
- **Physics**:
  - Hover: subtle translateY(-3px) with soft ambient card shadow.
  - Active Press: instant scale(0.97) spring compression.

### 4.5. Spotlight Quick Bar & Staggered Reveal
- **Spotlight Bar**: Gentle glowing focus ring transition (`box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.25)`) when user starts typing.
- **Staggered Reveal**: When switching roles or on initial boot, wallet cards and transactions fade in with a 25ms stagger delay.

---

## 5. Technical Stack & File Manifest

| File | Responsibilities |
|---|---|
| `index.html` | Markup for Dynamic Island HUD, Segmented Control sliding track, GSAP CDN include, and Apple HIG layout |
| `js/motion.js` | Dedicated motion module: sliding pill logic, number rolling counter, Dynamic Island HUD manager, and staggered animations |
| `js/bundle.js` | Updated bundled script integrating motion triggers into store events and role switches |
| `js/app.js` | Modular development file updated with motion bindings |
| `tests/*.test.js` | Existing 13 unit tests ensuring business logic & privacy isolation remain 100% intact |

---

## 6. Verification & Quality Gates
- **Automated Tests**: Execute `node --test tests/*.test.js` to verify zero regression.
- **Motion Verification**: Verify smooth 60fps transitions without jank on mobile viewports (375px and 768px).
- **Reduced Motion Support**: Ensure all animations respect `prefers-reduced-motion: reduce`.
- **Zero-CORS**: Verify that launching `index.html` directly via `file:///` functions flawlessly.
