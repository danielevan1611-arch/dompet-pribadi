# Widescreen CRM Dashboard Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform DompetKu from a narrow centered column into a full-screen, widescreen landscape CRM dashboard with a left sidebar, 4-column KPI cards, horizontal wallet cards, and a dual-pane layout featuring a dense data table and analytics.

**Architecture:** A macOS Pro Dark / CRM shell structure in `index.html` featuring a sticky left sidebar (`w-64`), wide top navigation with Spotlight search and role switcher, a 4-column metric grid, and a dual-pane bottom section (Analytics + Rich Data Table with CSV export and category filters). All logic is bundled into `js/bundle.js` with zero-CORS `file:///` and PWA responsiveness.

**Tech Stack:** HTML5, Tailwind CSS, JavaScript (ES6+ / IIFE), GSAP 3.12, Chart.js, Lucide Icons, Node.js Test Runner.

**Spec:** `docs/superpowers/specs/2026-11-08-widescreen-crm-dashboard-design.md`

## Global Constraints
- Fullscreen Landscape: Main workspace occupies 100% viewport width without artificial `max-w-4xl` centering restrictions.
- Zero-CORS standalone: Double-clicking `index.html` via `file:///` must work instantly without errors.
- Responsive reflow: On mobile (<1024px), sidebar collapses into an off-canvas drawer with hamburger button.
- Preserved Logic: All 16 unit tests across store, quickParser, receiptScanner, and motion must remain green.

## Review Focus
1. **Widescreen Table Overflow**: On smaller laptop screens (1280px-1440px), ensure the multi-column data table scrolls horizontally inside its container without breaking the sidebar.
2. **Mobile Drawer State**: On smartphone screens, opening and closing the sidebar must toggle smoothly with a dark backdrop without trapping scroll.
3. **CSV Export Special Characters**: Notes with commas, quotes, or Indonesian currency formatting must be escaped properly in CSV output.
4. **Active Sidebar State**: Clicking sidebar items must visually highlight the active item (`bg-[#2C2C2E] text-white`).
5. **Chart Resizing**: When the dual-pane layout reflows, Chart.js instances must resize smoothly without canvas distortion.

---

### Task 1: Widescreen Shell & Left Sidebar Navigation Markup (`index.html`)

**Files:**
- Modify: `index.html:90-150` (Structural layout, Sidebar, Top bar)

**Interfaces:**
- Consumes: Tailwind CSS, Lucide icons.
- Produces:
  - `#sidebarNav` (Desktop sticky sidebar & mobile off-canvas drawer)
  - `#btnToggleSidebar` (Mobile hamburger trigger)
  - `#sidebarBackdrop` (Mobile backdrop overlay)
  - `#mainContent` (Full width flex-1 workspace)

- [ ] **Step 1: Replace narrow centered body layout with flex shell**
- [ ] **Step 2: Add macOS Pro Dark Sidebar with navigation items**
- [ ] **Step 3: Add Top Bar with Spotlight Input, Role Switcher, and Mobile Toggle**
- [ ] **Step 4: Verify test suite continues to pass**
- [ ] **Step 5: Commit**

---

### Task 2: 4-Column KPI Metric Cards & Horizontal Resource Cards (`index.html`)

**Files:**
- Modify: `index.html:150-250` (KPI section & wallets container)

**Interfaces:**
- Consumes: `renderKpis()`, `renderWallets()`.
- Produces:
  - 4-column metric grid (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`)
  - `#kpiCoupleKas` (Dedicated card for Kas Bersama)
  - Horizontal wallet cards grid

- [ ] **Step 1: Refactor KPI section to 4 equal responsive columns**
- [ ] **Step 2: Add Kas Bersama dedicated summary card**
- [ ] **Step 3: Commit**

---

### Task 3: Dual-Pane Analytics & CRM Data Table with CSV Export (`index.html`, `js/bundle.js`, `js/app.js`)

**Files:**
- Modify: `index.html`
- Modify: `js/bundle.js`
- Modify: `js/app.js`

**Interfaces:**
- Consumes: `transactions`, `wallets`.
- Produces:
  - Multi-column table (`#transactionsTable`)
  - `#filterTableCategory`, `#filterTableWallet`
  - `#btnExportCsv` -> `exportTransactionsToCsv()`

- [ ] **Step 1: Add Dual-Pane layout in `index.html` (Left: Charts, Right: Table)**
- [ ] **Step 2: Implement multi-column table renderer in `js/bundle.js` & `js/app.js`**
- [ ] **Step 3: Implement `exportTransactionsToCsv()` and wire to button**
- [ ] **Step 4: Verify test suite passes**
- [ ] **Step 5: Commit**

---

### Task 4: Sidebar Drawer & Navigation Interaction Wiring (`js/bundle.js` & `js/app.js`)

**Files:**
- Modify: `js/bundle.js`
- Modify: `js/app.js`

**Interfaces:**
- Consumes: DOM sidebar elements.
- Produces: Mobile drawer toggle, smooth scroll to sections, active menu state.

- [ ] **Step 1: Wire `#btnToggleSidebar` and `#sidebarBackdrop` open/close**
- [ ] **Step 2: Wire sidebar navigation item clicks to scroll to target sections**
- [ ] **Step 3: Commit**

---

### Task 5: Final Verification, Zero-CORS Check & Live Launch

**Files:**
- Full system verification.

- [ ] **Step 1: Run full test suite (`node --test tests/*.test.js`)**
- [ ] **Step 2: Launch in browser and visually verify widescreen landscape layout**
- [ ] **Step 3: Commit and finalize**
