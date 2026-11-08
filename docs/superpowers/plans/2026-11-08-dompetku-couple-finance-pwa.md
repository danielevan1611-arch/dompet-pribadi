# DompetKu — Couple & Personal Finance PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun aplikasi keuangan pribadi & pasangan (PWA) responsif dengan isolasi privasi ketat (rahasia untuk masing-masing), dompet bersama untuk kencan/patungan, input cepat bahasa alami ("makan 15k"), scan resi OCR, dan sinkronisasi cloud real-time via Supabase yang siap di-deploy ke Vercel.

**Architecture:** Frontend PWA mandiri tanpa build-overhead berbasis HTML5/Tailwind/ES Modules dengan caching Service Worker dan IndexedDB lokal. Layer sinkronisasi cloud menghubungkan Supabase Realtime dengan pemfilteran data berbasis kepemilikan (`visibility: 'private'` vs `'shared'`). Ekstraksi resi menggunakan Tesseract.js client-side dengan antarmuka kamera smartphone.

**Tech Stack:** Vanilla JavaScript (ESM), Tailwind CSS (CDN), Chart.js, Lucide Icons, Tesseract.js, Supabase JS Client, Node.js Native Test Runner (`node:test`, `node:assert/strict`), Vercel Deployment.

**Spec:** [`docs/superpowers/specs/2026-11-08-dompet-pribadi-design.md`](../specs/2026-11-08-dompet-pribadi-design.md)

## Global Constraints

- Zero mandatory npm build dependencies: Seluruh runtime frontend dapat langsung di-serve secara statis atau di-host di Vercel.
- Privacy boundary: Transaksi dan dompet dengan `visibility: 'private'` tidak boleh terkirim atau terlihat ke pasangan dalam kondisi apa pun.
- TDD strictness: Logika saldo, parser cepat, dan filter privasi wajib memiliki unit test yang dijalankan dengan `node --test` dan lulus sebelum antarmuka UI dihubungkan.
- Mobile PWA compatibility: Wajib menyertakan `manifest.webmanifest`, `sw.js`, dan viewport mobile-friendly yang responsif.

## Review Focus

1. **Kebocoran Data Pribadi ke Pasangan:** Pemanggilan fungsi `getVisibleTransactions(userId, coupleId)` dengan akun Pasangan (User B) tidak boleh menyertakan transaksi berlabel `private` milik User A.
2. **Kalkulasi Saldo Transfer Antar-Dompet:** Transfer dana dari Dompet A ke Dompet B harus mengurangi saldo A dan menambah saldo B tanpa mengubah metrik Total Net Worth.
3. **Parsing Teks Nominal Tidak Lazim:** Input seperti `15k`, `25rb`, `1.5jt`, `50.000`, `100000` harus terurai menjadi nilai numerik integer yang valid tanpa NaN.
4. **Offline Resilience Saat Cloud Terputus:** Saat offline, operasi pencatatan transaksi lokal tetap harus tersimpan di IndexedDB/LocalStorage dan diantrekan untuk sync.
5. **Handling Struk yang Buram / Gagal OCR:** Jika teks gambar tidak terbaca, sistem harus menampilkan notifikasi ramah pengguna dan membuka form input manual tanpa crash.

---

### Task 1: Scaffolding & Core Store Engine (TDD)

**Files:**
- Create: `package.json` (hanya untuk `"type": "module"` agar ES Modules jalan di test)
- Create: `js/store.js`
- Test: `tests/store.test.js`

**Interfaces:**
- Produces:
  - `createWallet({ id, ownerId, coupleId, name, type, balance, visibility }) -> Wallet`
  - `addTransaction({ id, walletId, targetWalletId, createdBy, coupleId, type, amount, category, note, visibility, date }) -> Transaction`
  - `getVisibleWallets(wallets, currentUserId) -> Wallet[]`
  - `getVisibleTransactions(transactions, currentUserId) -> Transaction[]`
  - `calculateNetWorth(wallets, currentUserId, mode) -> number`

- [ ] **Step 1: Write the failing test for store and privacy isolation**

```javascript
// tests/store.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createWallet,
  addTransaction,
  getVisibleWallets,
  getVisibleTransactions,
  calculateNetWorth
} from '../js/store.js';

describe('Store Engine & Privacy Isolation', () => {
  it('should isolate private wallets and show shared wallets to both partners', () => {
    const userA = 'user_a';
    const userB = 'user_b';
    const coupleId = 'couple_123';

    const walletA = createWallet({ id: 'w1', ownerId: userA, coupleId, name: 'BCA A', type: 'bank', balance: 5000000, visibility: 'private' });
    const walletB = createWallet({ id: 'w2', ownerId: userB, coupleId, name: 'Mandiri B', type: 'bank', balance: 3000000, visibility: 'private' });
    const walletShared = createWallet({ id: 'w3', ownerId: userA, coupleId, name: 'Kas Kencan', type: 'cash', balance: 1000000, visibility: 'shared' });

    const allWallets = [walletA, walletB, walletShared];

    const visibleToA = getVisibleWallets(allWallets, userA);
    const visibleToB = getVisibleWallets(allWallets, userB);

    assert.equal(visibleToA.length, 2); // w1 and w3
    assert.deepEqual(visibleToA.map(w => w.id), ['w1', 'w3']);

    assert.equal(visibleToB.length, 2); // w2 and w3
    assert.deepEqual(visibleToB.map(w => w.id), ['w2', 'w3']);
  });

  it('should update wallet balances accurately on income, expense, and transfer', () => {
    let wallet1 = createWallet({ id: 'w1', ownerId: 'u1', balance: 100000, visibility: 'private' });
    let wallet2 = createWallet({ id: 'w2', ownerId: 'u1', balance: 50000, visibility: 'private' });
    let wallets = [wallet1, wallet2];

    // Expense
    wallets = addTransaction(wallets, { type: 'expense', walletId: 'w1', amount: 20000 });
    assert.equal(wallets.find(w => w.id === 'w1').balance, 80000);

    // Income
    wallets = addTransaction(wallets, { type: 'income', walletId: 'w1', amount: 50000 });
    assert.equal(wallets.find(w => w.id === 'w1').balance, 130000);

    // Transfer
    wallets = addTransaction(wallets, { type: 'transfer', walletId: 'w1', targetWalletId: 'w2', amount: 30000 });
    assert.equal(wallets.find(w => w.id === 'w1').balance, 100000);
    assert.equal(wallets.find(w => w.id === 'w2').balance, 80000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/store.test.js`  
Expected: FAIL with "Cannot find module '../js/store.js'"

- [ ] **Step 3: Implement `js/store.js`**

Implement pure functions `createWallet`, `addTransaction`, `getVisibleWallets`, `getVisibleTransactions`, and `calculateNetWorth`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/store.test.js`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json js/store.js tests/store.test.js
git commit -m "feat(store): implement core wallet store and privacy isolation with tests"
```

---

### Task 2: Natural Language Quick Parser (`quickParser.js`) (TDD)

**Files:**
- Create: `js/quickParser.js`
- Test: `tests/quickParser.test.js`

**Interfaces:**
- Consumes: None (pure parsing module)
- Produces:
  - `parseQuickInput(text, availableWallets, defaultWalletId) -> ParsedResult`
  - Output format: `{ amount: number, category: string, walletId: string, visibility: 'private' | 'shared', note: string }`

- [ ] **Step 1: Write the failing test for quickParser**

```javascript
// tests/quickParser.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseQuickInput } from '../js/quickParser.js';

describe('Natural Language Quick Parser', () => {
  const wallets = [
    { id: 'w_bca', name: 'BCA' },
    { id: 'w_gopay', name: 'GoPay' },
    { id: 'w_shared', name: 'Kas Bersama' }
  ];

  it('should parse simple "makan 15k" to default wallet with category Makanan & Minuman', () => {
    const res = parseQuickInput('makan 15k', wallets, 'w_bca');
    assert.equal(res.amount, 15000);
    assert.equal(res.category, 'Makanan & Minuman');
    assert.equal(res.walletId, 'w_bca');
    assert.equal(res.visibility, 'private');
  });

  it('should parse "kopi 25rb gopay" to specific wallet', () => {
    const res = parseQuickInput('kopi 25rb gopay', wallets, 'w_bca');
    assert.equal(res.amount, 25000);
    assert.equal(res.category, 'Makanan & Minuman');
    assert.equal(res.walletId, 'w_gopay');
    assert.equal(res.visibility, 'private');
  });

  it('should detect shared keyword "nonton bioskop 90k bersama" and set visibility to shared', () => {
    const res = parseQuickInput('nonton bioskop 90k bersama', wallets, 'w_bca');
    assert.equal(res.amount, 90000);
    assert.equal(res.visibility, 'shared');
  });

  it('should handle million multipliers like "servis motor 1.2jt bca"', () => {
    const res = parseQuickInput('servis motor 1.2jt bca', wallets, 'w_bca');
    assert.equal(res.amount, 1200000);
    assert.equal(res.category, 'Transportasi');
    assert.equal(res.walletId, 'w_bca');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/quickParser.test.js`  
Expected: FAIL with "Cannot find module '../js/quickParser.js'"

- [ ] **Step 3: Implement `js/quickParser.js`**

Implement `parseQuickInput` with regex matching for:
- Nominal: multipliers `k`, `rb`, `ribu`, `jt`, `juta`, and dot/comma formatting.
- Category dictionary matching: 100+ Indonesian keywords.
- Wallet matching: case-insensitive name / aliases.
- Shared flag detection: keywords `bersama`, `kencan`, `patungan`, `bareng`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/quickParser.test.js`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/quickParser.js tests/quickParser.test.js
git commit -m "feat(parser): implement natural language quick parser with tests"
```

---

### Task 3: Receipt OCR & Payment Text Extractor (`receiptScanner.js`) (TDD)

**Files:**
- Create: `js/receiptScanner.js`
- Test: `tests/receiptScanner.test.js`

**Interfaces:**
- Produces:
  - `extractPaymentDetailsFromText(rawOcrText) -> { amount: number, date: string, type: string, note: string }`

- [ ] **Step 1: Write the failing test for receipt text extractor**

```javascript
// tests/receiptScanner.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractPaymentDetailsFromText } from '../js/receiptScanner.js';

describe('Receipt & Transfer Text Extractor', () => {
  it('should extract amount from standard BCA transfer receipt text', () => {
    const ocrSample = `
      M-TRANSFER BERHASIL
      08/11/2026 10:45:12
      JUMLAH: RP. 75.000,00
      BERITA: MAKAN SIANG
    `;
    const res = extractPaymentDetailsFromText(ocrSample);
    assert.equal(res.amount, 75000);
  });

  it('should extract amount from GoPay / QRIS receipt text', () => {
    const qrisSample = `
      PEMBAYARAN QRIS BERHASIL
      Total Bayar: Rp 45.500
      Merchant: KOPI KENANGAN
    `;
    const res = extractPaymentDetailsFromText(qrisSample);
    assert.equal(res.amount, 45500);
    assert.match(res.note, /KOPI KENANGAN/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/receiptScanner.test.js`  
Expected: FAIL with "Cannot find module '../js/receiptScanner.js'"

- [ ] **Step 3: Implement `js/receiptScanner.js`**

Implement regex parser for Indonesian receipt text formats (`Rp.`, `Total:`, `Jumlah:`, date matcher) and helper for Tesseract.js image extraction.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/receiptScanner.test.js`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/receiptScanner.js tests/receiptScanner.test.js
git commit -m "feat(ocr): implement payment text extractor with tests"
```

---

### Task 4: Cloud Sync & Couple Pairing (`sync.js`)

**Files:**
- Create: `js/sync.js`
- Create: `supabase/schema.sql` (schema SQL migration file for Supabase setup)

**Interfaces:**
- Produces:
  - `initCloudSync({ supabaseUrl, supabaseAnonKey, coupleCode, currentUserId, onRemoteUpdate })`
  - `syncTransactionToCloud(transaction)`
  - `syncWalletToCloud(wallet)`
  - `generateCoupleCode() -> string`

- [ ] **Step 1: Implement `supabase/schema.sql`**

Write standard DDL SQL for `couples`, `wallets`, `transactions` tables with Row Level Security (RLS) policies and Realtime publication enabled.

- [ ] **Step 2: Implement `js/sync.js`**

Write client wrapper for Supabase JS library (loaded via CDN) with fallback to local storage if credentials are not yet entered. Include pairing code generator and local storage persistence.

- [ ] **Step 3: Verify syntax and basic module loading**

Run: `node -e "import('./js/sync.js').then(() => console.log('Sync module OK'))"`  
Expected: "Sync module OK"

- [ ] **Step 4: Commit**

```bash
git add js/sync.js supabase/schema.sql
git commit -m "feat(sync): implement cloud sync and couple pairing engine"
```

---

### Task 5: Responsive Mobile-First PWA UI (`index.html`, `manifest.webmanifest`, `sw.js`, `app.js`, `charts.js`)

**Files:**
- Create: `index.html`
- Create: `manifest.webmanifest`
- Create: `sw.js`
- Create: `js/app.js`
- Create: `js/charts.js`
- Create: `assets/icon-192.png`, `assets/icon-512.png` (SVG or generated canvas icons)

- [ ] **Step 1: Create `manifest.webmanifest` and Service Worker `sw.js`**

Configure standalone display, dark theme color (`#0f172a`), icon references, and offline caching strategy.

- [ ] **Step 2: Build `js/charts.js`**

Create responsive Chart.js renderers for:
- Donut Chart: Alokasi pengeluaran per kategori.
- Bar Chart: Perbandingan pemasukan vs pengeluaran.

- [ ] **Step 3: Build `js/app.js` & `index.html`**

Connect all components:
- Top bar with Profile Switcher: "Kamu (User A)" vs "Pacar (User B)" vs "Dompet Bersama".
- Summary Cards (Net Worth, Income, Expense).
- Wallets slider/grid with balances.
- Natural Language Command Bar (`makan 15k`).
- Camera/Upload button with Tesseract.js OCR preview modal.
- Transaction history table with edit/delete actions.
- Settings modal for Couple Code pairing and Supabase connection.

- [ ] **Step 4: Run local test server and verify all automated tests**

Run: `node --test tests/*.test.js`  
Expected: All tests pass (0 failures).

- [ ] **Step 5: Commit**

```bash
git add index.html manifest.webmanifest sw.js js/app.js js/charts.js assets/
git commit -m "feat(ui): complete responsive mobile PWA with camera OCR and charts"
```

---

### Task 6: Vercel Deployment & Live Verification

**Files:**
- Create: `vercel.json`
- Create: `README.md` (Panduan lengkap cara pairing dengan pacar dan cara install di HP)

- [ ] **Step 1: Create `vercel.json`**

Configure clean static routing for PWA with caching headers for Service Worker and assets.

- [ ] **Step 2: Write `README.md` with step-by-step instructions**

Include:
1. Cara menjalankan secara lokal.
2. Cara install PWA di HP Android (Chrome) & iPhone (Safari).
3. Cara menghubungkan pasangan via Couple Code.
4. Cara deploy ke Vercel (1-klik atau via Git).

- [ ] **Step 3: Final verification of repository status and commits**

Run: `git status` and `node --test tests/*.test.js`  
Expected: Clean working tree, all tests green.

- [ ] **Step 4: Commit and finalize**

```bash
git add vercel.json README.md
git commit -m "chore(deploy): prepare Vercel deployment and comprehensive documentation"
```
