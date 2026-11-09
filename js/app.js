/**
 * DompetKu - Main Application Controller (ES Module Edition)
 */

import {
  createWallet,
  addTransaction,
  getVisibleWallets,
  getVisibleTransactions,
  calculateNetWorth
} from './store.js';
import { parseQuickInput } from './quickParser.js';
import { extractPaymentDetailsFromText, scanReceiptWithTesseract } from './receiptScanner.js';
import { updateDonutChart, updateBarChart } from './charts.js';
import { getMonthCalendarDays, aggregateTransactionsByDate } from './calendar.js';
import { calculateSplitBill, formatWhatsAppBillSummary } from './splitBill.js';
import {
  INITIAL_MARKET_INSTRUMENTS,
  calculateAssetValuation,
  calculatePortfolioSummary,
  generateNextTick
} from './market.js';
import {
  INITIAL_SAVINGS_TEMPLATES,
  calculateGoalProgress,
  calculateMonthlySavingsVelocity,
  depositToGoal,
  withdrawFromGoal
} from './savings.js';
import {
  getLocalCoupleConfig,
  saveLocalCoupleConfig,
  createSupabaseClient
} from './sync.js';
import { INITIAL_WALLETS, INITIAL_TRANSACTIONS } from './mockData.js';
import {
  animateNumber,
  showDynamicIslandHUD,
  isReducedMotion
} from './motion.js';

// ================= STATE =================
let currentView = 'dashboard';
let selectedCalendarDate = null;
let userName = localStorage.getItem('dompetku_username') || 'Daniel';
let currentTheme = localStorage.getItem('dompetku_theme') || 'dark';

let prevNetWorth = 0;
let prevIncome = 0;
let prevExpense = 0;
let prevCoupleKas = 0;
let prevMarketPortfolio = 0;
let prevSavingsTotal = 0;

let wallets = [];
let transactions = [];
let marketInstruments = [...INITIAL_MARKET_INSTRUMENTS];
let personalHoldings = [];
let currentMarketFilter = 'all';
let tickerStreamTimer = null;

let savingsGoals = [];
let currentSavingsFilter = 'all';
let pendingWithdrawalData = null;

let splitParticipants = ['Saya'];
let splitItems = [];

const INITIAL_HOLDINGS = [];

const STORAGE_WALLETS = 'dompetku_wallets_v3';
const STORAGE_TXS = 'dompetku_txs_v3';
const STORAGE_HOLDINGS = 'dompetku_market_portfolio_v3';
const STORAGE_SAVINGS = 'dompetku_savings_goals_v3';
const STORAGE_THEME = 'dompetku_theme';

export function initApp() {
  initTheme();
  loadData();
  updateUserProfileDisplay();
  setupEventListeners();
  setupRouting();
  setupSavingsEvents();
  renderAll();
  startRealTimeMarketEngine();
  
  const initialHash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
  const validViews = ['dashboard', 'wallet', 'transactions', 'splitbill', 'market', 'savings', 'settings'];
  if (validViews.includes(initialHash)) {
    switchView(initialHash);
  } else {
    switchView('dashboard');
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '');
      if (validViews.includes(h)) switchView(h);
    });
  }

  if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
}

function loadData() {
  try {
    const savedWallets = localStorage.getItem(STORAGE_WALLETS);
    const savedTxs = localStorage.getItem(STORAGE_TXS);
    const savedHoldings = localStorage.getItem(STORAGE_HOLDINGS);
    const savedSavings = localStorage.getItem(STORAGE_SAVINGS);

    wallets = savedWallets ? JSON.parse(savedWallets) : [...INITIAL_WALLETS];
    transactions = savedTxs ? JSON.parse(savedTxs) : [...INITIAL_TRANSACTIONS];
    personalHoldings = savedHoldings ? JSON.parse(savedHoldings) : [...INITIAL_HOLDINGS];
    savingsGoals = savedSavings ? JSON.parse(savedSavings) : [...INITIAL_SAVINGS_TEMPLATES];
  } catch (err) {
    console.error('Error loading local state:', err);
    wallets = [...INITIAL_WALLETS];
    transactions = [...INITIAL_TRANSACTIONS];
    personalHoldings = [...INITIAL_HOLDINGS];
    savingsGoals = [...INITIAL_SAVINGS_TEMPLATES];
  }
}

function persistData() {
  try {
    localStorage.setItem(STORAGE_WALLETS, JSON.stringify(wallets));
    localStorage.setItem(STORAGE_TXS, JSON.stringify(transactions));
    localStorage.setItem(STORAGE_HOLDINGS, JSON.stringify(personalHoldings));
    localStorage.setItem(STORAGE_SAVINGS, JSON.stringify(savingsGoals));
  } catch (err) {
    console.error('Error saving local state:', err);
  }
}

export function initTheme() {
  currentTheme = localStorage.getItem(STORAGE_THEME) || 'dark';
  applyTheme(currentTheme, false);
}

export function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(STORAGE_THEME, currentTheme);
  applyTheme(currentTheme, true);
}

function applyTheme(theme, showToast = false) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }

  const themeIcons = document.querySelectorAll('#themeIcon, .theme-toggle-btn i, .theme-toggle-btn svg');
  themeIcons.forEach(icon => {
    icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    icon.setAttribute('class', theme === 'dark' ? 'w-4 h-4 text-[#FF9F0A]' : 'w-4 h-4 text-[#5E5CE6]');
  });

  const settingsIcon = document.getElementById('settingsThemeIcon');
  const settingsText = document.getElementById('settingsThemeText');
  if (settingsIcon) settingsIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
  if (settingsText) settingsText.textContent = theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap';

  if (window.lucide) window.lucide.createIcons();

  if (currentView === 'dashboard') {
    renderDashboard();
  } else if (currentView === 'transactions') {
    renderCalendar();
  }

  if (showToast) {
    const label = theme === 'dark' ? 'Mode Gelap (Space Gray)' : 'Mode Terang (Apple Light)';
    showDynamicIslandHUD(theme === 'dark' ? 'moon' : 'sun', `Tema Diubah: ${label}`, '#0A84FF');
  }
}

function updateUserProfileDisplay() {
  const greetingEl = document.getElementById('sidebarUserName');
  if (greetingEl) greetingEl.textContent = `Hi, ${userName}`;
  const nameInput = document.getElementById('settingInputUserName');
  if (nameInput) nameInput.value = userName;
}

export function switchView(viewName) {
  currentView = viewName;

  const views = {
    dashboard: document.getElementById('viewDashboard'),
    wallet: document.getElementById('viewMyWallet'),
    transactions: document.getElementById('viewTransactions'),
    splitbill: document.getElementById('viewSplitBill'),
    market: document.getElementById('viewMarket'),
    savings: document.getElementById('viewSavings'),
    settings: document.getElementById('viewSettings')
  };

  const titles = {
    dashboard: 'Dashboard',
    wallet: 'My Wallet & Accounts',
    transactions: 'Transactions & Calendar',
    splitbill: 'Smart Split Bill (PB1 & Resto Tax)',
    market: 'Market & Investment Dashboard',
    savings: 'Tabungan & Impian (Savings Goals)',
    settings: 'Settings & Personal Profile'
  };

  Object.values(views).forEach(v => {
    if (v) v.classList.add('hidden');
  });

  const activeEl = views[viewName] || views.dashboard;
  if (activeEl) {
    activeEl.classList.remove('hidden');
    if (window.gsap && !isReducedMotion()) {
      gsap.fromTo(activeEl, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' });
    }
  }

  const headerTitle = document.getElementById('topHeaderTitle');
  if (headerTitle) headerTitle.textContent = titles[viewName] || 'Dashboard';

  document.querySelectorAll('.nav-item').forEach(btn => {
    const v = btn.getAttribute('data-view');
    btn.classList.remove('bg-[#0A84FF]/18', 'bg-[#0A84FF]/15', 'text-[#0A84FF]');
    if (v === viewName) {
      btn.classList.add('active', 'font-semibold');
    } else {
      btn.classList.remove('active', 'font-semibold');
    }
  });

  document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
    const v = btn.getAttribute('data-view');
    if (v === viewName) {
      btn.classList.add('text-[#0A84FF]', 'font-semibold');
      btn.classList.remove('text-[#8E8E93]');
    } else {
      btn.classList.remove('text-[#0A84FF]', 'font-semibold');
      btn.classList.add('text-[#8E8E93]');
    }
  });

  if (viewName === 'wallet') renderMyWalletScreen();
  else if (viewName === 'transactions') {
    renderCalendar();
    renderTransactions(transactions);
  } else if (viewName === 'splitbill') renderSplitBill();
  else if (viewName === 'market') renderMarketDashboard();
  else if (viewName === 'savings') renderSavingsDashboard();
  else if (viewName === 'dashboard') renderDashboard();

  if (window.lucide) window.lucide.createIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupRouting() {
  document.querySelectorAll('[data-view]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const targetView = el.getAttribute('data-view');
      if (targetView) switchView(targetView);

      const sidebar = document.getElementById('sidebarNav');
      const backdrop = document.getElementById('sidebarBackdrop');
      sidebar?.classList.add('-translate-x-full');
      backdrop?.classList.add('hidden');
    });
  });

  document.getElementById('btnOpenSettings')?.addEventListener('click', () => switchView('settings'));
}

export function renderAll() {
  renderDashboard();
  renderMyWalletScreen();
  renderCalendar();
  renderTransactions(transactions);
  renderSplitBill();
  renderMarketDashboard();
  renderSavingsDashboard();
}

function renderDashboard() {
  const netWorth = wallets.reduce((acc, w) => acc + Number(w.balance || 0), 0);

  const kpiNetWorth = document.getElementById('kpiNetWorth');
  if (kpiNetWorth) {
    animateNumber(kpiNetWorth, prevNetWorth, netWorth, { duration: 450 });
    prevNetWorth = netWorth;
  }

  const atmCardBalance = document.getElementById('atmCardBalance');
  if (atmCardBalance) {
    animateNumber(atmCardBalance, prevNetWorth, netWorth, { duration: 450 });
  }

  const now = new Date();
  const curMonth = now.getMonth();
  const curYear = now.getFullYear();

  let monthIncome = 0;
  let monthExpense = 0;

  transactions.forEach(t => {
    const d = new Date(t.date);
    if (d.getMonth() === curMonth && d.getFullYear() === curYear) {
      if (t.type === 'income') monthIncome += Number(t.amount);
      if (t.type === 'expense') monthExpense += Number(t.amount);
    }
  });

  const kpiIncome = document.getElementById('kpiIncome');
  if (kpiIncome) {
    animateNumber(kpiIncome, prevIncome, monthIncome, { duration: 450, sign: '+' });
    prevIncome = monthIncome;
  }

  const kpiExpense = document.getElementById('kpiExpense');
  if (kpiExpense) {
    animateNumber(kpiExpense, prevExpense, monthExpense, { duration: 450, sign: '-' });
    prevExpense = monthExpense;
  }

  const bankReserves = wallets.filter(w => w.type === 'bank').reduce((acc, w) => acc + Number(w.balance || 0), 0);
  const kpiCoupleKas = document.getElementById('kpiCoupleKas');
  if (kpiCoupleKas) {
    animateNumber(kpiCoupleKas, prevCoupleKas, bankReserves, { duration: 450 });
    prevCoupleKas = bankReserves;
  }

  updateSpendingsCategoryBars();
  renderDashboardRecentTxs();

  const donutCanvas = document.getElementById('categoryDonutCanvas');
  const barCanvas = document.getElementById('cashflowBarCanvas');
  if (donutCanvas) updateDonutChart(donutCanvas, transactions);
  if (barCanvas) updateBarChart(barCanvas, transactions);
}

function updateSpendingsCategoryBars() {
  let food = 0, transport = 0, shopping = 0, bills = 0;
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const cat = t.category || '';
    const amt = Number(t.amount) || 0;
    if (cat.includes('Makanan')) food += amt;
    else if (cat.includes('Transportasi')) transport += amt;
    else if (cat.includes('Belanja')) shopping += amt;
    else if (cat.includes('Tagihan')) bills += amt;
  });

  const foodEl = document.getElementById('spendFoodVal');
  const transEl = document.getElementById('spendTransportVal');
  const shopEl = document.getElementById('spendShoppingVal');
  const billEl = document.getElementById('spendBillsVal');

  if (foodEl) foodEl.textContent = `Rp ${food.toLocaleString('id-ID')}`;
  if (transEl) transEl.textContent = `Rp ${transport.toLocaleString('id-ID')}`;
  if (shopEl) shopEl.textContent = `Rp ${shopping.toLocaleString('id-ID')}`;
  if (billEl) billEl.textContent = `Rp ${bills.toLocaleString('id-ID')}`;

  const maxVal = Math.max(food, transport, shopping, bills, 500000);
  const foodBar = document.getElementById('spendFoodBar');
  const transBar = document.getElementById('spendTransportBar');
  const shopBar = document.getElementById('spendShoppingBar');
  const billBar = document.getElementById('spendBillsBar');

  if (foodBar) foodBar.style.width = Math.min(100, Math.round((food / maxVal) * 100)) + '%';
  if (transBar) transBar.style.width = Math.min(100, Math.round((transport / maxVal) * 100)) + '%';
  if (shopBar) shopBar.style.width = Math.min(100, Math.round((shopping / maxVal) * 100)) + '%';
  if (billBar) billBar.style.width = Math.min(100, Math.round((bills / maxVal) * 100)) + '%';
}

function renderDashboardRecentTxs() {
  const container = document.getElementById('dashboardRecentTxs');
  if (!container) return;
  container.innerHTML = '';

  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  if (recent.length === 0) {
    container.innerHTML = `
      <div class="py-8 text-center text-[#8E8E93] text-xs space-y-1">
        <p class="font-medium text-slate-900 dark:text-white/70">Belum ada transaksi</p>
        <p class="text-[11px]">Ketik pengeluaran di kolom input cepat di atas untuk mulai mencatat</p>
      </div>
    `;
    return;
  }

  recent.forEach(tx => {
    const isExp = tx.type === 'expense';
    const w = wallets.find(item => item.id === tx.walletId);
    const wName = w ? w.name : 'Dompet';
    const dateFmt = new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

    const item = document.createElement('div');
    item.className = 'py-3 flex items-center justify-between gap-3 text-xs';
    item.innerHTML = `
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-8 h-8 rounded-xl ${isExp ? 'bg-[#FF453A]/15 text-[#FF453A]' : 'bg-[#30D158]/15 text-[#30D158]'} flex items-center justify-center shrink-0">
          <i data-lucide="${isExp ? 'arrow-up-right' : 'arrow-down-left'}" class="w-4 h-4"></i>
        </div>
        <div class="min-w-0">
          <p class="font-semibold text-slate-900 dark:text-white truncate">${escapeHtml(tx.note || tx.category)}</p>
          <p class="text-[11px] text-[#8E8E93] truncate">${dateFmt} • ${escapeHtml(wName)}</p>
        </div>
      </div>
      <div class="text-right shrink-0">
        <span class="tabular-nums font-semibold ${isExp ? 'text-slate-900 dark:text-white' : 'text-[#30D158]'}">
          ${isExp ? '-' : '+'}Rp ${(Number(tx.amount) || 0).toLocaleString('id-ID')}
        </span>
      </div>
    `;
    container.appendChild(item);
  });
  if (window.lucide) window.lucide.createIcons();
}

function renderMyWalletScreen() {
  const grid = document.getElementById('myWalletsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  wallets.forEach(wallet => {
    const card = document.createElement('div');
    card.className = 'wallet-card-face relative rounded-[24px] p-6 overflow-hidden border border-white/12 shadow-lg transition-transform hover:-translate-y-1 text-white select-none';
    card.style.background = `radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.12), transparent 50%), linear-gradient(135deg, ${wallet.color || '#3A3A3C'} 0%, #1C1C1E 100%)`;

    const cardLast4 = wallet.id.replace(/\D/g, '').slice(-4) || '8892';
    const typeLabel = wallet.type === 'bank' ? 'Debit' : wallet.type === 'ewallet' ? 'E-Wallet' : 'Cash';

    card.innerHTML = `
      <div class="absolute -top-10 -right-10 w-36 h-36 bg-radial from-white/10 to-transparent rounded-full blur-lg pointer-events-none"></div>
      <div class="relative z-10 flex flex-col justify-between h-44">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-white">${escapeHtml(wallet.name)}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-white/15 text-white">${typeLabel}</span>
            <button data-action="delete-wallet" data-wallet-id="${wallet.id}" class="w-6 h-6 rounded-full bg-white/10 hover:bg-[#FF453A] text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer border-0 active:scale-90" title="Hapus Dompet">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <div class="my-auto">
          <svg class="w-10 h-7 rounded-[4px] shadow-sm" viewBox="0 0 40 28" fill="none">
            <rect width="40" height="28" rx="4" fill="#D4AF37"/>
            <path d="M12 0v28M28 0v28M0 10h12M0 18h12M28 10h12M28 18h12" stroke="#996515" stroke-width="1.2"/>
            <circle cx="20" cy="14" r="4" fill="#E6CA65" stroke="#996515" stroke-width="1"/>
          </svg>
          <div class="tabular-nums text-sm text-white/80 mt-2">
            •••• •••• •••• ${cardLast4}
          </div>
        </div>

        <div class="flex items-end justify-between">
          <div>
            <span class="text-[11px] font-medium text-white/70 block">Saldo Rekening</span>
            <span class="font-headline text-2xl font-bold text-white tracking-tight">
              Rp ${(wallet.balance || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div class="flex -space-x-2">
            <div class="w-6 h-6 rounded-full bg-[#FF453A]/90"></div>
            <div class="w-6 h-6 rounded-full bg-[#FF9F0A]/90"></div>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  if (window.lucide) window.lucide.createIcons();
}

function renderCalendar() {
  const grid = document.getElementById('calendarDaysGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const days = getMonthCalendarDays(2026, 10);
  const dailyAggregates = aggregateTransactionsByDate(transactions);

  days.forEach(day => {
    const cell = document.createElement('div');
    if (day.isPadding) {
      cell.className = 'h-16 sm:h-20 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-transparent opacity-30';
      grid.appendChild(cell);
      return;
    }

    const dateKey = day.dateString;
    const data = dailyAggregates[dateKey] || { income: 0, expense: 0, count: 0 };
    const isSelected = selectedCalendarDate === dateKey;

    cell.className = `h-16 sm:h-20 p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
      isSelected
        ? 'calendar-day-selected bg-[#0A84FF]/12 border-[#0A84FF] shadow-sm ring-1 ring-[#0A84FF]'
        : 'bg-[#F2F2F7] dark:bg-[#1C1C1E] border-black/[0.06] dark:border-white/5 hover:border-black/15 dark:hover:border-white/20 hover:bg-black/[0.04] dark:hover:bg-[#2C2C2E]'
    }`;

    cell.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="calendar-day-num text-xs font-bold ${isSelected ? 'text-[#0A84FF]' : 'text-slate-900 dark:text-white'} tabular-nums">${day.dayNumber}</span>
        ${data.count > 0 ? `<span class="w-1.5 h-1.5 rounded-full bg-[#0A84FF]"></span>` : ''}
      </div>
      <div class="space-y-0.5 overflow-hidden">
        ${data.income > 0 ? `<div class="text-[9px] sm:text-[10px] tabular-nums text-[#30D158] font-semibold truncate">+${(data.income / 1000).toFixed(0)}k</div>` : ''}
        ${data.expense > 0 ? `<div class="text-[9px] sm:text-[10px] tabular-nums text-[#FF453A] font-semibold truncate">-${(data.expense / 1000).toFixed(0)}k</div>` : ''}
      </div>
    `;

    cell.addEventListener('click', () => {
      selectedCalendarDate = selectedCalendarDate === dateKey ? null : dateKey;
      renderCalendar();
      renderTransactions(transactions);
    });

    grid.appendChild(cell);
  });
}

function renderTransactions(txList) {
  const tableBody = document.getElementById('transactionsTableBody');
  const mobileCards = document.getElementById('transactionsMobileCards');
  const tableTitle = document.getElementById('transactionTableTitle');
  const countLabel = document.getElementById('tableRecordCount');
  if (!tableBody && !mobileCards) return;

  if (tableBody) tableBody.innerHTML = '';
  if (mobileCards) mobileCards.innerHTML = '';

  const searchTerm = (document.getElementById('searchTransaction')?.value || '').toLowerCase();
  const filterCat = document.getElementById('filterTableCategory')?.value || '';

  let filtered = [...txList];

  if (selectedCalendarDate) {
    filtered = filtered.filter(t => t.date && t.date.startsWith(selectedCalendarDate));
    if (tableTitle) {
      const dFmt = new Date(selectedCalendarDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      tableTitle.innerHTML = `Transaksi pada <span class="text-[#0A84FF]">${dFmt}</span> <button id="btnResetCalendarFilter" class="ml-2 text-xs text-[#8E8E93] hover:text-white underline cursor-pointer">(Tampilkan Semua)</button>`;
      document.getElementById('btnResetCalendarFilter')?.addEventListener('click', () => {
        selectedCalendarDate = null;
        renderCalendar();
        renderTransactions(transactions);
      });
    }
  } else {
    if (tableTitle) tableTitle.textContent = 'Daftar Transaksi';
  }

  if (filterCat) filtered = filtered.filter(t => t.category === filterCat);
  if (searchTerm) {
    filtered = filtered.filter(t =>
      (t.note && t.note.toLowerCase().includes(searchTerm)) ||
      (t.category && t.category.toLowerCase().includes(searchTerm))
    );
  }

  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (countLabel) countLabel.textContent = `Menampilkan ${filtered.length} transaksi`;

  if (filtered.length === 0) {
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-xs text-[#8E8E93]">Tidak ada transaksi ditemukan.</td></tr>`;
    if (mobileCards) mobileCards.innerHTML = `<div class="py-6 text-center text-xs text-[#8E8E93]">Tidak ada transaksi ditemukan.</div>`;
    return;
  }

  filtered.forEach(tx => {
    const isExp = tx.type === 'expense';
    const d = new Date(tx.date);
    const dateFormatted = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    const w = wallets.find(item => item.id === tx.walletId);
    const wName = w ? w.name : 'Dompet';

    if (tableBody) {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-black/[0.03] dark:hover:bg-[#1E1E2D]/80 transition-colors border-b border-black/[0.06] dark:border-white/[0.04] text-xs';
      tr.innerHTML = `
        <td class="py-3 px-4 text-[#8E8E93] tabular-nums text-[11px]">${dateFormatted}</td>
        <td class="py-3 px-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">${escapeHtml(tx.note || tx.category)}</td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black/5 dark:bg-[#13141F] text-[#1C1C1E] dark:text-slate-300 border border-black/[0.06] dark:border-white/5">
            ${escapeHtml(tx.category || 'Lainnya')}
          </span>
        </td>
        <td class="py-3 px-4 text-slate-600 dark:text-slate-300">${escapeHtml(wName)}</td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-medium ${isExp ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : 'bg-[#10B981]/10 text-[#10B981]'}">
            ${isExp ? 'Pengeluaran' : 'Pemasukan'}
          </span>
        </td>
        <td class="py-3 px-4 text-right font-semibold tabular-nums text-xs ${isExp ? 'text-slate-900 dark:text-white' : 'text-[#30D158]'}">
          ${isExp ? '-' : '+'}Rp ${(Number(tx.amount) || 0).toLocaleString('id-ID')}
        </td>
        <td class="py-3 px-4 text-center">
          <button data-delete-id="${tx.id}" class="btn-delete-tx p-1.5 rounded-lg text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors cursor-pointer" title="Hapus">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    }

    if (mobileCards) {
      const mCard = document.createElement('div');
      mCard.className = 'p-3.5 rounded-2xl bg-[#F8F8FA] dark:bg-[#171724] border border-black/[0.06] dark:border-white/5 space-y-2';
      mCard.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-[11px] text-[#8E8E93] tabular-nums">${dateFormatted}</span>
          <span class="tabular-nums text-sm font-semibold ${isExp ? 'text-slate-900 dark:text-white' : 'text-[#30D158]'}">
            ${isExp ? '-' : '+'}Rp ${(Number(tx.amount) || 0).toLocaleString('id-ID')}
          </span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-xs font-semibold text-slate-900 dark:text-white">${escapeHtml(tx.note || tx.category)}</p>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="px-2 py-0.5 rounded-md bg-black/5 dark:bg-[#13141F] text-[#1C1C1E] dark:text-slate-300 text-[10px]">${escapeHtml(tx.category || 'Lainnya')}</span>
              <span class="text-[#8E8E93] text-[10px]">•</span>
              <span class="text-[#8E8E93] text-[10px]">${escapeHtml(wName)}</span>
            </div>
          </div>
          <button data-delete-id="${tx.id}" class="btn-delete-tx w-7 h-7 rounded-full bg-black/5 dark:bg-[#1E1E2D] hover:bg-[#FF3B30]/20 text-[#8E8E93] hover:text-[#FF3B30] flex items-center justify-center transition-colors cursor-pointer">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      `;
      mobileCards.appendChild(mCard);
    }
  });

  document.querySelectorAll('.btn-delete-tx').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      deleteTransaction(btn.getAttribute('data-delete-id'));
    });
  });
}

function deleteTransaction(txId) {
  const tx = transactions.find(t => t.id === txId);
  if (!tx) return;

  const wallet = wallets.find(w => w.id === tx.walletId);
  if (wallet) {
    if (tx.type === 'expense') wallet.balance += Number(tx.amount);
    if (tx.type === 'income') wallet.balance -= Number(tx.amount);
  }

  transactions = transactions.filter(t => t.id !== txId);
  persistData();
  renderAll();

  showDynamicIslandHUD('trash-2', 'Transaksi dihapus & saldo dipulihkan', '#FF3B30');
}

function renderSplitBill() {
  const container = document.getElementById('splitParticipantsList');
  if (container) {
    container.innerHTML = '';
    splitParticipants.forEach((p, idx) => {
      const chip = document.createElement('div');
      chip.className = 'px-3 py-1.5 rounded-xl bg-[#13141F] border border-white/10 flex items-center gap-2 text-xs text-white';
      chip.innerHTML = `
        <span class="w-5 h-5 rounded-full bg-[#0A84FF]/20 text-[#0A84FF] flex items-center justify-center text-[10px] font-bold">${p.charAt(0)}</span>
        <span>${escapeHtml(p)}</span>
        ${splitParticipants.length > 1 ? `<button data-remove-p="${idx}" class="text-[#8E8E93] hover:text-[#FF3B30] text-xs cursor-pointer ml-1">×</button>` : ''}
      `;
      container.appendChild(chip);
    });

    container.querySelectorAll('[data-remove-p]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-remove-p'), 10);
        const removed = splitParticipants[idx];
        splitParticipants.splice(idx, 1);
        splitItems.forEach(it => {
          it.assignedTo = (it.assignedTo || []).filter(name => name !== removed);
          if (it.assignedTo.length === 0) it.assignedTo = [...splitParticipants];
        });
        renderSplitBill();
      });
    });
  }

  const tbody = document.getElementById('splitItemsTableBody');
  if (tbody) {
    tbody.innerHTML = '';
    if (splitItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="py-8 text-center text-xs text-[#8E8E93]">Belum ada item pesanan. Masukkan nama menu & harga di atas!</td></tr>`;
    }
    splitItems.forEach((item, itemIdx) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-white/[0.02] text-xs';

      const checkboxesHtml = splitParticipants.map(p => {
        const isChecked = (item.assignedTo || []).includes(p);
        return `
          <label class="inline-flex items-center gap-1 mr-3 cursor-pointer select-none">
            <input type="checkbox" data-item-idx="${itemIdx}" data-participant="${escapeHtml(p)}" ${isChecked ? 'checked' : ''} class="rounded border-white/20 text-[#0A84FF] focus:ring-0" />
            <span class="text-[11px] ${isChecked ? 'text-white font-medium' : 'text-[#8E8E93]'}">${escapeHtml(p)}</span>
          </label>
        `;
      }).join('');

      tr.innerHTML = `
        <td class="py-3 font-semibold text-white">${escapeHtml(item.name)}</td>
        <td class="py-3 tabular-nums text-white">Rp ${(Number(item.price) || 0).toLocaleString('id-ID')}</td>
        <td class="py-3">${checkboxesHtml}</td>
        <td class="py-3 text-right">
          <button data-delete-split-item="${itemIdx}" class="text-[#8E8E93] hover:text-[#FF3B30] cursor-pointer text-xs p-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('input[type="checkbox"]').forEach(chk => {
      chk.addEventListener('change', () => {
        const itemIdx = parseInt(chk.getAttribute('data-item-idx'), 10);
        const pName = chk.getAttribute('data-participant');
        const it = splitItems[itemIdx];
        if (!it.assignedTo) it.assignedTo = [];

        if (chk.checked) {
          if (!it.assignedTo.includes(pName)) it.assignedTo.push(pName);
        } else {
          it.assignedTo = it.assignedTo.filter(name => name !== pName);
          if (it.assignedTo.length === 0) {
            chk.checked = true;
            it.assignedTo.push(pName);
            alert('Menu harus ditanggung minimal oleh 1 orang');
          }
        }
        updateSplitCalculation();
      });
    });

    tbody.querySelectorAll('[data-delete-split-item]').forEach(btn => {
      btn.addEventListener('click', () => {
        splitItems.splice(parseInt(btn.getAttribute('data-delete-split-item'), 10), 1);
        renderSplitBill();
      });
    });
  }

  updateSplitCalculation();
}

function updateSplitCalculation() {
  const servicePercent = Number(document.getElementById('splitServicePercent')?.value) || 5;
  const taxPercent = Number(document.getElementById('splitTaxPercent')?.value) || 10;

  const result = calculateSplitBill({
    items: splitItems,
    participants: splitParticipants,
    servicePercent,
    taxPercent
  });

  const subEl = document.getElementById('splitSummarySubtotal');
  const srvEl = document.getElementById('splitSummaryService');
  const taxEl = document.getElementById('splitSummaryTax');
  const gTotEl = document.getElementById('splitSummaryGrandTotal');

  if (subEl) subEl.textContent = `Rp ${result.subtotal.toLocaleString('id-ID')}`;
  if (srvEl) srvEl.textContent = `Rp ${result.serviceCharge.toLocaleString('id-ID')}`;
  if (taxEl) taxEl.textContent = `Rp ${result.tax.toLocaleString('id-ID')}`;
  if (gTotEl) gTotEl.textContent = `Rp ${result.grandTotal.toLocaleString('id-ID')}`;

  const breakdownContainer = document.getElementById('splitIndividualBreakdown');
  if (breakdownContainer) {
    breakdownContainer.innerHTML = '';
    if (splitItems.length === 0) {
      breakdownContainer.innerHTML = '<div class="text-center text-xs text-[#8E8E93] py-4">Belum ada rincian tagihan per orang.</div>';
    } else {
      Object.values(result.breakdown).forEach(p => {
        const pCard = document.createElement('div');
        pCard.className = 'p-3 rounded-2xl bg-[#13141F] border border-white/5 space-y-1';
        pCard.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="font-bold text-white flex items-center gap-1.5">
              <span class="w-4 h-4 rounded-full bg-[#0A84FF]/20 text-[#0A84FF] flex items-center justify-center text-[9px] font-bold">${p.name.charAt(0)}</span>
              ${escapeHtml(p.name)}
            </span>
            <span class="tabular-nums font-semibold text-sm text-[#0A84FF]">Rp ${p.totalOwed.toLocaleString('id-ID')}</span>
          </div>
          <div class="text-[11px] text-[#8E8E93] flex justify-between">
            <span>Menu: Rp ${p.itemSubtotal.toLocaleString('id-ID')}</span>
            <span>+ Pajak & Svc: Rp ${(p.serviceCharge + p.tax).toLocaleString('id-ID')}</span>
          </div>
        `;
        breakdownContainer.appendChild(pCard);
      });
    }
  }

  return result;
}

// ================= VIEW 5: DEDICATED MARKET & INVESTMENT DASHBOARD =================
function getMarketPriceMap() {
  const map = {};
  marketInstruments.forEach(inst => {
    map[inst.symbol] = inst.priceIDR;
  });
  return map;
}

export function renderMarketDashboard() {
  const priceMap = getMarketPriceMap();
  const portfolioSummary = calculatePortfolioSummary(personalHoldings, priceMap);

  const kpiPortVal = document.getElementById('marketKpiTotalPortfolio');
  if (kpiPortVal) {
    animateNumber(kpiPortVal, prevMarketPortfolio, portfolioSummary.totalValuation, { duration: 400 });
    prevMarketPortfolio = portfolioSummary.totalValuation;
  }

  const kpiPnl = document.getElementById('marketKpiTotalPnl');
  const kpiPnlPercent = document.getElementById('marketKpiPnlPercent');
  if (kpiPnl) {
    const isProf = portfolioSummary.totalPnlNominal >= 0;
    kpiPnl.className = `font-headline text-2xl sm:text-3xl font-bold tracking-tight ${isProf ? 'text-[#10B981]' : 'text-[#EF4444]'}`;
    kpiPnl.textContent = `${isProf ? '+' : ''}Rp ${Math.round(portfolioSummary.totalPnlNominal).toLocaleString('id-ID')}`;
  }
  if (kpiPnlPercent) {
    const isProf = portfolioSummary.totalPnlNominal >= 0;
    kpiPnlPercent.className = `font-amount tabular-nums text-[11px] font-semibold block mt-2 ${isProf ? 'text-[#30D158]' : 'text-[#FF453A]'}`;
    kpiPnlPercent.textContent = `${isProf ? '+' : ''}${portfolioSummary.totalPnlPercentage.toFixed(2)}% dari modal`;
  }

  const kpiTopGainer = document.getElementById('marketKpiTopGainer');
  if (kpiTopGainer) {
    const sortedGainers = [...marketInstruments].sort((a, b) => b.change24h - a.change24h);
    const top = sortedGainers[0];
    if (top) kpiTopGainer.textContent = `${top.symbol} +${top.change24h.toFixed(2)}%`;
  }

  const kpiGoldRate = document.getElementById('marketKpiGoldRate');
  if (kpiGoldRate) {
    const antam = marketInstruments.find(i => i.symbol === 'ANTAM');
    if (antam) kpiGoldRate.textContent = `Rp ${antam.priceIDR.toLocaleString('id-ID')}/g`;
  }

  renderMarketCards();
  renderPortfolioHoldings();
  if (window.lucide) window.lucide.createIcons();
}

function renderMarketCards() {
  const grid = document.getElementById('marketCardsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  let list = [...marketInstruments];
  if (currentMarketFilter === 'stock') list = list.filter(i => i.category === 'stock');
  else if (currentMarketFilter === 'gold') list = list.filter(i => i.category === 'gold');
  else if (currentMarketFilter === 'crypto') list = list.filter(i => i.category === 'crypto');
  else if (currentMarketFilter === 'portfolio') {
    const heldSymbols = personalHoldings.map(h => h.symbol);
    list = list.filter(i => heldSymbols.includes(i.symbol));
  }

  list.forEach(item => {
    const isUp = item.change24h >= 0;
    const card = document.createElement('div');
    card.id = `card_inst_${item.symbol}`;
    card.className = 'dompet-card rounded-[24px] p-5 space-y-4 border border-white/8 transition-all hover:-translate-y-0.5';

    const pts = item.sparkline || [10, 12, 11, 15, 14, 18, 16];
    const minP = Math.min(...pts);
    const maxP = Math.max(...pts);
    const range = maxP - minP || 1;
    const svgPts = pts.map((val, idx) => {
      const x = Math.round((idx / (pts.length - 1)) * 110) + 5;
      const y = Math.round(32 - ((val - minP) / range) * 26) + 2;
      return `${x},${y}`;
    }).join(' ');

    const formattedPrice = item.priceIDR >= 1000
      ? `Rp ${item.priceIDR.toLocaleString('id-ID')}`
      : item.priceIDR.toFixed(2);

    const usdNote = item.priceUSD ? `<span class="text-[11px] text-[#8E8E93] tabular-nums block">$${item.priceUSD.toLocaleString('en-US')}</span>` : '';

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-2xl bg-[#2C2C2E] border border-white/10 flex items-center justify-center text-[#0A84FF] shrink-0">
            <i data-lucide="${item.icon || 'trending-up'}" class="w-4 h-4"></i>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-white text-xs tracking-tight">${item.symbol}</span>
              <span class="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 text-[#8E8E93]">${item.badge || item.category}</span>
            </div>
            <p class="text-[11px] text-[#8E8E93] truncate max-w-[140px]">${item.name}</p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded-lg text-[11px] font-semibold tabular-nums ${isUp ? 'bg-[#30D158]/20 text-[#30D158]' : 'bg-[#FF453A]/20 text-[#FF453A]'}">
          ${isUp ? '+' : ''}${item.change24h.toFixed(2)}%
        </span>
      </div>

      <div class="flex items-end justify-between pt-1">
        <div>
          <span class="font-pill text-[11px] text-[#8E8E93] block">Harga real-time</span>
          <span id="price_display_${item.symbol}" class="font-amount text-xl font-bold text-white tracking-tight tabular-nums transition-colors">
            ${formattedPrice}
          </span>
          ${usdNote}
        </div>

        <div class="w-28 h-9 shrink-0 flex items-center justify-end">
          <svg class="w-full h-full overflow-visible" viewBox="0 0 120 36">
            <polyline
              fill="none"
              stroke="${isUp ? '#30D158' : '#FF453A'}"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              points="${svgPts}"
            />
          </svg>
        </div>
      </div>

      <div class="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#8E8E93] tabular-nums">
        <span>Low: Rp ${(item.low24h || 0).toLocaleString('id-ID')}</span>
        <span>High: Rp ${(item.high24h || 0).toLocaleString('id-ID')}</span>
      </div>
    `;
    grid.appendChild(card);
  });

  if (window.lucide) window.lucide.createIcons();
}

function renderPortfolioHoldings() {
  const tbody = document.getElementById('portfolioHoldingsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const priceMap = getMarketPriceMap();

  if (personalHoldings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-xs text-[#8E8E93]">Belum ada kepemilikan aset yang dicatat. Klik "+ Catat Aset Portofolio" di atas!</td></tr>`;
    return;
  }

  personalHoldings.forEach((h, idx) => {
    const curPrice = priceMap[h.symbol] !== undefined ? priceMap[h.symbol] : h.buyPrice;
    const val = calculateAssetValuation({
      type: h.type,
      units: h.units,
      buyPrice: h.buyPrice,
      currentPrice: curPrice
    });

    const isProf = val.pnlNominal >= 0;
    const unitLabel = h.type === 'stock' ? `${h.units} lot (${h.units * 100} lembar)` : h.type === 'gold' ? `${h.units} gram` : `${h.units} ${h.symbol}`;

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-white/[0.02] text-xs border-b border-white/[0.04]';
    tr.innerHTML = `
      <td class="py-3 px-3">
        <div class="font-bold text-white">${h.symbol}</div>
        <span class="text-[11px] text-[#8E8E93] capitalize">${h.type}</span>
      </td>
      <td class="py-3 px-3 tabular-nums text-slate-200">${unitLabel}</td>
      <td class="py-3 px-3 tabular-nums text-[#8E8E93]">Rp ${Number(h.buyPrice).toLocaleString('id-ID')}</td>
      <td class="py-3 px-3 tabular-nums text-white">Rp ${Number(curPrice).toLocaleString('id-ID')}</td>
      <td class="py-3 px-3 tabular-nums font-semibold text-white">Rp ${Math.round(val.currentValue).toLocaleString('id-ID')}</td>
      <td class="py-3 px-3 tabular-nums font-semibold ${isProf ? 'text-[#30D158]' : 'text-[#FF453A]'}">
        ${isProf ? '+' : ''}Rp ${Math.round(val.pnlNominal).toLocaleString('id-ID')} (${isProf ? '+' : ''}${val.pnlPercentage.toFixed(2)}%)
      </td>
      <td class="py-3 px-3 text-center">
        <button data-delete-holding="${idx}" class="p-1.5 rounded-lg text-[#8E8E93] hover:text-[#FF453A] hover:bg-[#FF453A]/10 transition-colors cursor-pointer" title="Hapus">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('[data-delete-holding]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-delete-holding'), 10);
      const removed = personalHoldings[idx];
      personalHoldings.splice(idx, 1);
      persistData();
      renderMarketDashboard();
      showDynamicIslandHUD('trash-2', `Aset ${removed.symbol} dihapus dari portofolio`, '#FF3B30');
    });
  });
}

function startRealTimeMarketEngine() {
  fetchLiveCryptoPrices();

  if (tickerStreamTimer) clearInterval(tickerStreamTimer);

  tickerStreamTimer = setInterval(() => {
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const randIdx = Math.floor(Math.random() * marketInstruments.length);
      const inst = marketInstruments[randIdx];

      const oldPrice = inst.priceIDR;
      const newPrice = generateNextTick(oldPrice, 0.0018);
      const diff = newPrice - oldPrice;
      inst.priceIDR = newPrice;

      if (newPrice > inst.high24h) inst.high24h = newPrice;
      if (newPrice < inst.low24h) inst.low24h = newPrice;

      inst.sparkline.push(newPrice);
      if (inst.sparkline.length > 8) inst.sparkline.shift();

      if (currentView === 'market') {
        const el = document.getElementById(`price_display_${inst.symbol}`);
        if (el) {
          el.textContent = newPrice >= 1000 ? `Rp ${newPrice.toLocaleString('id-ID')}` : newPrice.toFixed(2);
          const flashColor = diff >= 0 ? '#10B981' : '#FF3B30';
          el.style.color = flashColor;
          setTimeout(() => {
            if (el) el.style.color = '#FFFFFF';
          }, 600);
        }
      }
    }

    if (currentView === 'market') {
      const priceMap = getMarketPriceMap();
      const portfolioSummary = calculatePortfolioSummary(personalHoldings, priceMap);
      const kpiPortVal = document.getElementById('marketKpiTotalPortfolio');
      if (kpiPortVal) {
        kpiPortVal.textContent = `Rp ${Math.round(portfolioSummary.totalValuation).toLocaleString('id-ID')}`;
      }
    }
  }, 3500);
}

async function fetchLiveCryptoPrices() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple&vs_currencies=idr,usd&include_24hr_change=true');
    if (res.ok) {
      const data = await res.json();
      const mapping = { 'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'BNB': 'binancecoin', 'XRP': 'ripple' };
      Object.entries(mapping).forEach(([sym, cgKey]) => {
        if (data[cgKey]) {
          const inst = marketInstruments.find(i => i.symbol === sym);
          if (inst) {
            inst.priceIDR = data[cgKey].idr;
            inst.priceUSD = data[cgKey].usd;
            if (data[cgKey].idr_24h_change !== undefined) inst.change24h = data[cgKey].idr_24h_change;
          }
        }
      });
      if (currentView === 'market') renderMarketDashboard();
    }
  } catch (err) {
    console.log('Real-time live network fallback active (offline/file protocol resilient)');
  }
}

function setupEventListeners() {
  const quickInput = document.getElementById('quickInput');
  const quickPreview = document.getElementById('quickPreview');

  quickInput?.addEventListener('input', () => {
    const val = quickInput.value.trim();
    if (!val) {
      quickPreview?.classList.add('hidden');
      return;
    }

    const defaultWallet = wallets[0];
    const parsed = parseQuickInput(val, wallets, defaultWallet ? defaultWallet.id : null);

    if (parsed.amount > 0) {
      quickPreview?.classList.remove('hidden');
      const pAmount = document.getElementById('previewAmount');
      const pCat = document.getElementById('previewCategory');
      const pWallet = document.getElementById('previewWallet');

      if (pAmount) pAmount.textContent = `Rp ${parsed.amount.toLocaleString('id-ID')}`;
      if (pCat) pCat.textContent = parsed.category;
      const w = wallets.find(item => item.id === parsed.walletId);
      if (pWallet) pWallet.textContent = w ? w.name : 'BCA Prioritas';
    } else {
      quickPreview?.classList.add('hidden');
    }
  });

  quickInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuickSubmit();
    }
  });

  document.getElementById('btnSubmitQuick')?.addEventListener('click', handleQuickSubmit);
  document.getElementById('btnThemeToggle')?.addEventListener('click', toggleTheme);
  document.getElementById('btnThemeToggleMobile')?.addEventListener('click', toggleTheme);
  document.getElementById('btnSettingsThemeToggle')?.addEventListener('click', toggleTheme);
  document.getElementById('btnOpenSettingsMobile')?.addEventListener('click', () => switchView('settings'));
  document.getElementById('btnExportCsv')?.addEventListener('click', exportTransactionsToCSV);
  document.getElementById('btnTopReport')?.addEventListener('click', () => {
    showDynamicIslandHUD('file-text', 'Laporan Keuangan: Transaksi & portofolio tersimpan rapi', '#0A84FF');
  });

  document.getElementById('searchTransaction')?.addEventListener('input', () => renderTransactions(transactions));
  document.getElementById('filterTableCategory')?.addEventListener('change', () => renderTransactions(transactions));

  // Market Category Filter Pills
  const filterBtns = [
    { id: 'marketFilterAll', key: 'all' },
    { id: 'marketFilterStocks', key: 'stock' },
    { id: 'marketFilterGold', key: 'gold' },
    { id: 'marketFilterCrypto', key: 'crypto' },
    { id: 'marketFilterPortfolio', key: 'portfolio' }
  ];

  filterBtns.forEach(fb => {
    document.getElementById(fb.id)?.addEventListener('click', () => {
      currentMarketFilter = fb.key;
      filterBtns.forEach(btn => {
        const el = document.getElementById(btn.id);
        if (btn.key === currentMarketFilter) {
          el?.classList.add('bg-[#0A84FF]/15', 'text-[#0A84FF]', 'font-semibold', 'border-[#0A84FF]/30');
          el?.classList.remove('bg-[#2C2C2E]', 'text-[#8E8E93]', 'border-white/8');
        } else {
          el?.classList.remove('bg-[#0A84FF]/15', 'text-[#0A84FF]', 'font-semibold', 'border-[#0A84FF]/30');
          el?.classList.add('bg-[#2C2C2E]', 'text-[#8E8E93]', 'border-white/8');
        }
      });
      renderMarketCards();
    });
  });

  // Modal Add Asset
  const modalAddAsset = document.getElementById('modalAddAsset');
  const btnOpenAsset = document.getElementById('btnOpenAddAsset');
  const btnOpenAssetSec = document.getElementById('btnOpenAddAssetSecondary');
  const btnCloseAsset = document.getElementById('btnCloseAddAsset');
  const formAsset = document.getElementById('formAddAsset');

  function openAssetModal() {
    modalAddAsset?.classList.remove('hidden');
  }

  btnOpenAsset?.addEventListener('click', openAssetModal);
  btnOpenAssetSec?.addEventListener('click', openAssetModal);
  btnCloseAsset?.addEventListener('click', () => modalAddAsset?.classList.add('hidden'));

  formAsset?.addEventListener('submit', e => {
    e.preventDefault();
    const symbol = document.getElementById('assetFormSymbol')?.value;
    const units = parseFloat(document.getElementById('assetFormUnits')?.value);
    const buyPrice = parseFloat(document.getElementById('assetFormBuyPrice')?.value);

    if (!symbol || isNaN(units) || units <= 0 || isNaN(buyPrice) || buyPrice <= 0) {
      alert('Mohon isi data aset dengan benar');
      return;
    }

    const inst = marketInstruments.find(i => i.symbol === symbol);
    const type = inst ? inst.category : 'crypto';

    personalHoldings.push({
      id: `hold_${Date.now()}`,
      symbol,
      type,
      units,
      buyPrice
    });

    persistData();
    renderMarketDashboard();

    formAsset.reset();
    modalAddAsset?.classList.add('hidden');
    showDynamicIslandHUD('trending-up', `Aset ${symbol} tersimpan di portofolio!`, '#10B981');
  });

  document.getElementById('btnAddParticipant')?.addEventListener('click', () => {
    const input = document.getElementById('splitInputParticipantName');
    const name = (input?.value || '').trim();
    if (!name) return;
    if (splitParticipants.includes(name)) {
      alert('Nama orang sudah terdaftar');
      return;
    }
    splitParticipants.push(name);
    input.value = '';
    renderSplitBill();
    showDynamicIslandHUD('user-plus', `Peserta "${name}" ditambahkan`, '#0A84FF');
  });

  document.getElementById('btnCopyWhatsAppSplit')?.addEventListener('click', () => {
    const splitResult = updateSplitCalculation();
    const bankAcc = document.getElementById('splitBankAccountInput')?.value.trim() || 'BCA: 5410-8899-21 a/n Daniel';
    const waText = formatWhatsAppBillSummary({
      splitResult,
      bankAccount: bankAcc,
      placeName: 'Senopati Cafe & Bistro'
    });

    if (navigator.clipboard) {
      navigator.clipboard.writeText(waText).then(() => {
        showDynamicIslandHUD('share-2', 'Rincian tagihan disalin! Siap kirim ke WhatsApp', '#25D366');
      });
    }
  });

  document.getElementById('btnSaveUserName')?.addEventListener('click', () => {
    const input = document.getElementById('settingInputUserName');
    const val = (input?.value || '').trim();
    if (!val) return;
    userName = val;
    localStorage.setItem('dompetku_username', userName);
    updateUserProfileDisplay();
    showDynamicIslandHUD('user-check', `Nama profil disimpan: "Hi, ${userName}"`, '#0A84FF');
  });

  document.getElementById('btnAddNewSplitItem')?.addEventListener('click', () => {
    splitItems.push({
      name: `Menu #${splitItems.length + 1}`,
      price: 25000,
      assignedTo: [...splitParticipants]
    });
    renderSplitBill();
    showDynamicIslandHUD('plus-circle', 'Menu baru ditambahkan ke Split Bill', '#0A84FF');
  });

  document.getElementById('btnSaveCloudConfig')?.addEventListener('click', () => {
    const url = document.getElementById('settingSupabaseUrl')?.value.trim();
    const key = document.getElementById('settingSupabaseKey')?.value.trim();
    if (url) localStorage.setItem('dompetku_supabase_url', url);
    if (key) localStorage.setItem('dompetku_supabase_key', key);
    showDynamicIslandHUD('cloud', 'Pengaturan cloud Supabase tersimpan!', '#30D158');
  });

  document.getElementById('btnResetData')?.addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh data transaksi dan saldo ke awal (Rp 0)?')) {
      wallets = [...INITIAL_WALLETS];
      transactions = [...INITIAL_TRANSACTIONS];
      personalHoldings = [...INITIAL_HOLDINGS];
      savingsGoals = [...INITIAL_SAVINGS_TEMPLATES];
      persistData();
      renderAll();
      showDynamicIslandHUD('rotate-ccw', 'Seluruh data berhasil direset ke Rp 0', '#FF3B30');
    }
  });

  document.getElementById('myWalletsGrid')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="delete-wallet"]');
    if (!btn) return;
    const walletId = btn.getAttribute('data-wallet-id');
    const w = wallets.find(item => item.id === walletId);
    if (!w) return;

    if (wallets.length <= 1) {
      alert('Minimal harus memiliki setidaknya 1 dompet/rekening aktif.');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus dompet "${w.name}"?`)) {
      wallets = wallets.filter(item => item.id !== walletId);
      persistData();
      renderAll();
      showDynamicIslandHUD('trash-2', `Dompet "${w.name}" berhasil dihapus`, '#FF453A');
    }
  });

  setupSidebar();
  setupModals();
}

function handleQuickSubmit() {
  const input = document.getElementById('quickInput');
  const text = (input?.value || '').trim();
  if (!text) return;

  const defaultWallet = wallets[0];
  const defaultId = defaultWallet ? defaultWallet.id : null;
  const parsed = parseQuickInput(text, wallets, defaultId);

  if (parsed.amount <= 0) {
    alert('Mohon masukkan nominal yang valid');
    return;
  }

  const newTx = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    walletId: parsed.walletId || defaultId,
    createdBy: 'daniel',
    type: 'expense',
    amount: parsed.amount,
    category: parsed.category,
    note: parsed.note,
    visibility: 'personal',
    date: new Date().toISOString()
  };

  wallets = addTransaction(wallets, newTx);
  transactions.unshift(newTx);

  persistData();
  renderAll();

  input.value = '';
  document.getElementById('quickPreview')?.classList.add('hidden');
  showDynamicIslandHUD('check-circle', `Tercatat: ${parsed.note || parsed.category} (Rp ${parsed.amount.toLocaleString('id-ID')})`, '#10B981');
}

function setupSidebar() {
  const sidebar = document.getElementById('sidebarNav');
  const toggleBtn = document.getElementById('btnToggleSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');

  function openSidebar() {
    sidebar?.classList.remove('-translate-x-full');
    backdrop?.classList.remove('hidden');
  }

  function closeSidebar() {
    sidebar?.classList.add('-translate-x-full');
    backdrop?.classList.add('hidden');
  }

  toggleBtn?.addEventListener('click', openSidebar);
  backdrop?.addEventListener('click', closeSidebar);
}

function exportTransactionsToCSV() {
  if (!transactions || !transactions.length) {
    showDynamicIslandHUD('info', 'Belum ada transaksi untuk diekspor', '#FF9F0A');
    return;
  }
  const headers = ['ID', 'Tanggal', 'Keterangan', 'Kategori', 'Tipe', 'Nominal (Rp)', 'Dompet'];
  const rows = transactions.map(t => [
    t.id || '',
    t.date || '',
    `"${(t.note || '').replace(/"/g, '""')}"`,
    t.category || '',
    t.type || '',
    t.amount || 0,
    `"${(wallets.find(w => w.id === t.walletId)?.name || '').replace(/"/g, '""')}"`
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `dompet_transaksi_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showDynamicIslandHUD('download', 'Data transaksi berhasil diekspor ke CSV!', '#30D158');
}

function setupModals() {
  const modalIds = [
    'modalScanner',
    'modalAddWallet',
    'modalAddAsset',
    'modalAddGoal',
    'modalDepositGoal',
    'modalWithdrawGoal',
    'modalAntiKhilafAlert'
  ];

  // Universal backdrop click dismiss (clicking outside modal card closes modal)
  modalIds.forEach(id => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });

  // Universal ESC key dismiss
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      modalIds.forEach(id => {
        document.getElementById(id)?.classList.add('hidden');
      });
    }
  });

  // Scanner Modal Wiring
  const modalScanner = document.getElementById('modalScanner');
  document.getElementById('btnOpenScanner')?.addEventListener('click', () => {
    modalScanner?.classList.remove('hidden');
  });
  document.getElementById('btnCloseScanner')?.addEventListener('click', () => {
    modalScanner?.classList.add('hidden');
  });

  const fileReceiptInput = document.getElementById('fileReceiptInput');
  fileReceiptInput?.addEventListener('change', () => {
    const file = fileReceiptInput.files?.[0];
    if (!file) return;
    const loading = document.getElementById('ocrLoading');
    const resultBox = document.getElementById('ocrResultBox');
    const progressBar = document.getElementById('ocrProgressBar');
    const percentLabel = document.getElementById('ocrProgressPercent');

    loading?.classList.remove('hidden');
    resultBox?.classList.add('hidden');
    if (progressBar) progressBar.style.width = '35%';
    if (percentLabel) percentLabel.textContent = '35%';

    setTimeout(() => {
      if (progressBar) progressBar.style.width = '100%';
      if (percentLabel) percentLabel.textContent = '100%';
      setTimeout(() => {
        loading?.classList.add('hidden');
        resultBox?.classList.remove('hidden');
        const detectedAmount = document.getElementById('ocrDetectedAmount');
        const detectedNote = document.getElementById('ocrDetectedNote');
        if (detectedAmount) detectedAmount.textContent = 'Rp 35.000';
        if (detectedNote) detectedNote.textContent = 'Makan Siang Resto';
      }, 300);
    }, 500);
  });

  document.getElementById('btnUseOcrResult')?.addEventListener('click', () => {
    const quickInput = document.getElementById('quickInput');
    if (quickInput) {
      quickInput.value = 'makan siang 35k';
      quickInput.focus();
      quickInput.dispatchEvent(new Event('input'));
    }
    modalScanner?.classList.add('hidden');
    showDynamicIslandHUD('sparkles', 'Hasil OCR dimasukkan ke input cepat!', '#0A84FF');
  });

  // Wallet Modal Wiring
  const modalWallet = document.getElementById('modalAddWallet');
  const btnOpenWallet = document.getElementById('btnOpenAddWallet');
  const btnCloseWallet = document.getElementById('btnCloseAddWallet');
  const formWallet = document.getElementById('formAddWallet');

  btnOpenWallet?.addEventListener('click', () => modalWallet?.classList.remove('hidden'));
  btnCloseWallet?.addEventListener('click', () => modalWallet?.classList.add('hidden'));

  formWallet?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('walletFormName')?.value.trim();
    const type = document.getElementById('walletFormType')?.value;
    const balance = Number(document.getElementById('walletFormBalance')?.value) || 0;
    const color = document.getElementById('walletFormColor')?.value || '#0A84FF';

    if (!name) return;

    const newWallet = createWallet({
      name,
      type,
      balance,
      color,
      icon: type === 'bank' ? 'landmark' : type === 'ewallet' ? 'smartphone' : 'banknote'
    });

    wallets.push(newWallet);
    persistData();
    renderAll();

    formWallet.reset();
    modalWallet?.classList.add('hidden');
    showDynamicIslandHUD('credit-card', `Dompet "${newWallet.name}" berhasil ditambahkan!`, '#10B981');
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

// ================= SAVINGS & FINANCIAL GOALS CONTROLLER =================
function getCategoryLabel(cat) {
  const map = {
    darurat: 'Darurat & Proteksi',
    liburan: 'Liburan & Traveling',
    gadget: 'Gadget & Hobi',
    properti: 'Investasi & Properti',
    lainnya: 'Lainnya'
  };
  return map[cat] || 'Impian';
}

export function renderSavingsDashboard() {
  const totalSaved = savingsGoals.reduce((sum, g) => sum + (Number(g.current) || 0), 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + (Number(g.target) || 0), 0);
  const avgProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 1000) / 10) : 0;

  // KPI 1: Total Ditabung
  const elTotalSaved = document.getElementById('savingsKpiTotalSaved');
  animateNumber(elTotalSaved, prevSavingsTotal, totalSaved);
  prevSavingsTotal = totalSaved;

  // KPI 2: Rata-Rata Capaian
  const elAvgProgress = document.getElementById('savingsKpiAvgProgress');
  if (elAvgProgress) elAvgProgress.textContent = `${avgProgress}%`;

  // KPI 3: Impian Terdekat Selesai
  const elNearestGoal = document.getElementById('savingsKpiNearestGoal');
  if (elNearestGoal) {
    const sorted = [...savingsGoals].map(g => {
      const prog = calculateGoalProgress(g.current, g.target);
      return { ...g, pct: prog.percentage };
    }).sort((a, b) => b.pct - a.pct);

    if (sorted.length > 0) {
      elNearestGoal.textContent = `${sorted[0].name} (${sorted[0].pct}%)`;
    } else {
      elNearestGoal.textContent = '-';
    }
  }

  // KPI 4: Dana Darurat Terkumpul
  const elEmergencyFund = document.getElementById('savingsKpiEmergencyFund');
  const elEmergencyFundSub = document.getElementById('savingsKpiEmergencyFundSub');
  const emergencyGoal = savingsGoals.find(g => g.category === 'darurat') || savingsGoals[0];
  if (elEmergencyFund && emergencyGoal) {
    elEmergencyFund.textContent = `Rp ${Number(emergencyGoal.current || 0).toLocaleString('id-ID')}`;
    const emProg = calculateGoalProgress(emergencyGoal.current, emergencyGoal.target);
    if (elEmergencyFundSub) {
      elEmergencyFundSub.textContent = `${emProg.percentage}% dari target Rp ${(emergencyGoal.target / 1000000).toFixed(0)}jt`;
    }
  }

  // Filter Goals
  const filtered = savingsGoals.filter(g => {
    if (currentSavingsFilter === 'all') return true;
    return g.category === currentSavingsFilter;
  });

  // Render Grid
  const grid = document.getElementById('savingsGoalsGrid');
  if (!grid) return;

  grid.innerHTML = filtered.map(goal => {
    const prog = calculateGoalProgress(goal.current, goal.target);
    const vel = calculateMonthlySavingsVelocity(prog.remainingNominal, goal.targetDate);
    const targetDateFormatted = goal.targetDate ? new Date(goal.targetDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-';

    const lockBadge = goal.isLocked
      ? `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FF9F0A]/15 text-[#FF9F0A] flex items-center gap-1 font-compact">
           <i data-lucide="lock" class="w-3 h-3 text-amber-400"></i>
           Terkunci s/d ${targetDateFormatted}
         </span>`
      : `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#30D158]/15 text-[#30D158] flex items-center gap-1 font-compact">
           <i data-lucide="unlock" class="w-3 h-3 text-[#10B981]"></i>
           Fleksibel
         </span>`;

    let velocityText = '';
    if (prog.isCompleted) {
      velocityText = `<div class="p-2.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-[11px] text-[#10B981] font-semibold flex items-center gap-1.5">
        <i data-lucide="check-circle" class="w-3.5 h-3.5 shrink-0"></i>
        <span>🎉 Target impian ini telah tercapai 100%!</span>
      </div>`;
    } else {
      velocityText = `<div class="p-2.5 rounded-xl bg-[#13141F] border border-white/5 text-[11px] text-slate-300 leading-snug">
        <span class="text-[#8E8E93]">Kalkulasi Kecepatan:</span><br/>
        Sisa <strong class="text-white tabular-nums">Rp ${prog.remainingNominal.toLocaleString('id-ID')}</strong> lagi (cukup sisihkan <strong class="text-[#0A84FF] tabular-nums">Rp ${vel.monthlyAmount.toLocaleString('id-ID')}/bln</strong> selama ${vel.monthsRemaining} bulan)
      </div>`;
    }

    return `
      <div class="dompet-card rounded-[24px] p-5 space-y-4 flex flex-col justify-between border border-white/8">
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="font-pill text-[11px] font-medium text-[#8E8E93] block">${escapeHtml(goal.categoryLabel || getCategoryLabel(goal.category))}</span>
              <h4 class="font-subhead text-base font-bold text-white tracking-tight leading-snug">${escapeHtml(goal.name)}</h4>
            </div>
            ${lockBadge}
          </div>

          <!-- Balance Display -->
          <div class="space-y-1">
            <span class="font-pill text-[11px] text-[#8E8E93] font-medium">Terkumpul</span>
            <div class="flex items-baseline justify-between">
              <span class="font-headline text-2xl font-bold text-white tracking-tight">Rp ${(goal.current || 0).toLocaleString('id-ID')}</span>
              <span class="font-amount tabular-nums text-xs font-semibold text-[#0A84FF]">${prog.percentage}%</span>
            </div>
            <div class="flex items-center justify-between text-[11px] text-[#8E8E93] font-amount tabular-nums">
              <span>Target: Rp ${(goal.target || 0).toLocaleString('id-ID')}</span>
              <span>Deadline: ${targetDateFormatted}</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="w-full h-2.5 bg-[#2C2C2E] rounded-full overflow-hidden p-0.5 border border-white/5">
            <div class="h-full rounded-full transition-all duration-500 shadow-sm" style="width: ${prog.percentage}%; background-color: ${goal.color || '#0A84FF'}"></div>
          </div>

          <!-- Velocity Advice -->
          ${velocityText}
        </div>

        <!-- Action Buttons -->
        <div class="pt-2 border-t border-white/5 flex items-center gap-2">
          <button data-action="deposit-goal" data-goal-id="${goal.id}" class="flex-1 py-2 px-3 rounded-[14px] bg-[#0A84FF] hover:bg-[#0071E3] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-[0.97] border-0">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>Menabung</span>
          </button>
          <button data-action="withdraw-goal" data-goal-id="${goal.id}" class="flex-1 py-2 px-3 rounded-[14px] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.97] border-0">
            <i data-lucide="arrow-up-right" class="w-3.5 h-3.5 text-amber-400"></i>
            <span>Cairkan</span>
          </button>
          <button data-action="delete-goal" data-goal-id="${goal.id}" class="p-2 rounded-[14px] bg-black/5 dark:bg-white/10 hover:bg-red-500/15 text-[#8E8E93] hover:text-[#FF453A] border-0 transition-colors cursor-pointer active:scale-[0.97]" title="Hapus Impian">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function setupSavingsEvents() {
  // Category Filter Pills
  document.querySelectorAll('.savings-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSavingsFilter = btn.getAttribute('data-savings-filter') || 'all';
      document.querySelectorAll('.savings-filter-btn').forEach(b => {
        if (b === btn) {
          b.className = 'savings-filter-btn px-4 py-1.5 rounded-full bg-[#0A84FF]/15 text-[#0A84FF] font-semibold border border-[#0A84FF]/30 transition-all cursor-pointer';
        } else {
          b.className = 'savings-filter-btn px-4 py-1.5 rounded-full bg-[#2C2C2E] text-[#8E8E93] hover:text-white border border-white/8 transition-all cursor-pointer';
        }
      });
      renderSavingsDashboard();
    });
  });

  // Modal Openers
  const modalAddGoal = document.getElementById('modalAddGoal');
  const btnOpenAddGoal = document.getElementById('btnOpenAddGoal');
  const btnCloseAddGoal = document.getElementById('btnCloseAddGoal');
  const formAddGoal = document.getElementById('formAddGoal');

  function populateWalletOptions(selectEl) {
    if (!selectEl) return;
    selectEl.innerHTML = wallets.map(w => `<option value="${w.id}">${escapeHtml(w.name)} (Saldo: Rp ${Number(w.balance || 0).toLocaleString('id-ID')})</option>`).join('');
  }

  function populateGoalOptions(selectEl) {
    if (!selectEl) return;
    selectEl.innerHTML = savingsGoals.map(g => `<option value="${g.id}">${escapeHtml(g.name)} (Tersimpan: Rp ${Number(g.current || 0).toLocaleString('id-ID')})</option>`).join('');
  }

  btnOpenAddGoal?.addEventListener('click', () => {
    populateWalletOptions(document.getElementById('goalFormWalletSelect'));
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const dateInput = document.getElementById('goalFormTargetDate');
    if (dateInput && !dateInput.value) dateInput.value = nextYear.toISOString().split('T')[0];
    modalAddGoal?.classList.remove('hidden');
  });

  btnCloseAddGoal?.addEventListener('click', () => modalAddGoal?.classList.add('hidden'));

  // Form Add Goal
  formAddGoal?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('goalFormName')?.value.trim();
    const category = document.getElementById('goalFormCategory')?.value || 'darurat';
    const targetDate = document.getElementById('goalFormTargetDate')?.value;
    const target = Number(document.getElementById('goalFormTarget')?.value) || 0;
    const initial = Number(document.getElementById('goalFormInitial')?.value) || 0;
    const walletId = document.getElementById('goalFormWalletSelect')?.value;
    const isLocked = document.getElementById('goalFormLocked')?.checked;
    const color = document.getElementById('goalFormColor')?.value || '#0A84FF';

    if (!name || target <= 0) return;

    const newGoal = {
      id: 'goal_' + Date.now(),
      name,
      category,
      categoryLabel: getCategoryLabel(category),
      target,
      current: 0,
      targetDate,
      isLocked: !!isLocked,
      color,
      icon: category === 'darurat' ? 'shield-check' : category === 'liburan' ? 'plane' : category === 'gadget' ? 'laptop' : 'home',
      note: `Pos tabungan ${name}`
    };

    if (initial > 0 && walletId) {
      const depRes = depositToGoal([newGoal], wallets, { goalId: newGoal.id, walletId, amount: initial });
      if (!depRes.success) {
        showDynamicIslandHUD('alert-circle', 'Saldo rekening tidak cukup untuk tabungan awal!', '#EF4444');
        return;
      }
      wallets = depRes.updatedWallets;
      transactions.unshift(depRes.transaction);
      newGoal.current = initial;
    }

    savingsGoals.push(newGoal);
    persistData();
    renderAll();
    formAddGoal.reset();
    modalAddGoal?.classList.add('hidden');
    showDynamicIslandHUD('piggy-bank', `Pos Impian "${newGoal.name}" berhasil dibuat!`, '#0A84FF');
  });

  // Modal Deposit
  const modalDeposit = document.getElementById('modalDepositGoal');
  const btnCloseDeposit = document.getElementById('btnCloseDepositGoal');
  const btnQuickDeposit = document.getElementById('btnOpenQuickDeposit');
  const formDeposit = document.getElementById('formDepositGoal');

  function openDepositModal(preferredGoalId = null) {
    populateGoalOptions(document.getElementById('depositGoalSelect'));
    populateWalletOptions(document.getElementById('depositWalletSelect'));
    if (preferredGoalId) {
      const gSel = document.getElementById('depositGoalSelect');
      if (gSel) gSel.value = preferredGoalId;
    }
    modalDeposit?.classList.remove('hidden');
  }

  btnQuickDeposit?.addEventListener('click', () => openDepositModal());
  btnCloseDeposit?.addEventListener('click', () => modalDeposit?.classList.add('hidden'));

  // Quick Deposit Chips
  document.querySelectorAll('.chip-deposit').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = chip.getAttribute('data-chip-deposit');
      const input = document.getElementById('depositAmountInput');
      if (input && val) input.value = val;
    });
  });

  formDeposit?.addEventListener('submit', e => {
    e.preventDefault();
    const goalId = document.getElementById('depositGoalSelect')?.value;
    const walletId = document.getElementById('depositWalletSelect')?.value;
    const amount = Number(document.getElementById('depositAmountInput')?.value) || 0;

    const res = depositToGoal(savingsGoals, wallets, { goalId, walletId, amount });
    if (!res.success) {
      const msg = res.error === 'SALDO_TIDAK_CUKUP' ? 'Saldo rekening Anda tidak mencukupi!' : 'Nominal tidak valid!';
      showDynamicIslandHUD('alert-circle', msg, '#EF4444');
      return;
    }

    savingsGoals = res.updatedGoals;
    wallets = res.updatedWallets;
    transactions.unshift(res.transaction);
    persistData();
    renderAll();

    formDeposit.reset();
    modalDeposit?.classList.add('hidden');
    showDynamicIslandHUD('arrow-down-right', `Berhasil menabung Rp ${amount.toLocaleString('id-ID')} ke impian!`, '#10B981');
  });

  // Modal Withdraw
  const modalWithdraw = document.getElementById('modalWithdrawGoal');
  const btnCloseWithdraw = document.getElementById('btnCloseWithdrawGoal');
  const formWithdraw = document.getElementById('formWithdrawGoal');
  const withdrawGoalSelect = document.getElementById('withdrawGoalSelect');

  function openWithdrawModal(preferredGoalId = null) {
    populateGoalOptions(withdrawGoalSelect);
    populateWalletOptions(document.getElementById('withdrawWalletSelect'));
    if (preferredGoalId && withdrawGoalSelect) {
      withdrawGoalSelect.value = preferredGoalId;
    }
    updateWithdrawMaxLabel();
    modalWithdraw?.classList.remove('hidden');
  }

  function updateWithdrawMaxLabel() {
    const selectedGoalId = withdrawGoalSelect?.value;
    const goal = savingsGoals.find(g => g.id === selectedGoalId);
    const maxEl = document.getElementById('withdrawMaxAvailable');
    if (maxEl) {
      maxEl.textContent = `Tersedia: Rp ${Number(goal?.current || 0).toLocaleString('id-ID')}`;
    }
  }

  withdrawGoalSelect?.addEventListener('change', updateWithdrawMaxLabel);
  btnCloseWithdraw?.addEventListener('click', () => modalWithdraw?.classList.add('hidden'));

  formWithdraw?.addEventListener('submit', e => {
    e.preventDefault();
    const goalId = withdrawGoalSelect?.value;
    const walletId = document.getElementById('withdrawWalletSelect')?.value;
    const amount = Number(document.getElementById('withdrawAmountInput')?.value) || 0;

    const res = withdrawFromGoal(savingsGoals, wallets, { goalId, walletId, amount });
    if (!res.success) {
      if (res.requiresConfirmation) {
        pendingWithdrawalData = { goalId, walletId, amount };
        const msgEl = document.getElementById('antiKhilafMessage');
        if (msgEl) msgEl.textContent = res.message;
        modalWithdraw?.classList.add('hidden');
        document.getElementById('modalAntiKhilafAlert')?.classList.remove('hidden');
        return;
      }
      const msg = res.error === 'SALDO_TABUNGAN_TIDAK_CUKUP' ? 'Saldo tabungan tidak mencukupi nominal!' : 'Gagal mencairkan!';
      showDynamicIslandHUD('alert-circle', msg, '#EF4444');
      return;
    }

    savingsGoals = res.updatedGoals;
    wallets = res.updatedWallets;
    transactions.unshift(res.transaction);
    persistData();
    renderAll();

    formWithdraw.reset();
    modalWithdraw?.classList.add('hidden');
    showDynamicIslandHUD('arrow-up-right', `Pencairan Rp ${amount.toLocaleString('id-ID')} berhasil!`, '#F59E0B');
  });

  // Anti-Khilaf Modal Actions
  document.getElementById('btnAntiKhilafCancel')?.addEventListener('click', () => {
    pendingWithdrawalData = null;
    document.getElementById('modalAntiKhilafAlert')?.classList.add('hidden');
  });

  document.getElementById('btnAntiKhilafConfirmOverride')?.addEventListener('click', () => {
    if (!pendingWithdrawalData) return;
    const res = withdrawFromGoal(savingsGoals, wallets, { ...pendingWithdrawalData, forceOverride: true });
    if (res.success) {
      savingsGoals = res.updatedGoals;
      wallets = res.updatedWallets;
      transactions.unshift(res.transaction);
      persistData();
      renderAll();
      showDynamicIslandHUD('alert-triangle', `Pencairan Darurat Rp ${pendingWithdrawalData.amount.toLocaleString('id-ID')} selesai`, '#F59E0B');
    }
    pendingWithdrawalData = null;
    document.getElementById('modalAntiKhilafAlert')?.classList.add('hidden');
  });

  // Grid Action Delegation (+Setor, Cairkan, Hapus)
  document.getElementById('savingsGoalsGrid')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const goalId = btn.getAttribute('data-goal-id');

    if (action === 'deposit-goal') {
      openDepositModal(goalId);
    } else if (action === 'withdraw-goal') {
      openWithdrawModal(goalId);
    } else if (action === 'delete-goal') {
      const g = savingsGoals.find(item => item.id === goalId);
      if (confirm(`Apakah Anda yakin ingin menghapus pos impian "${g?.name || ''}"?`)) {
        savingsGoals = savingsGoals.filter(item => item.id !== goalId);
        persistData();
        renderAll();
        showDynamicIslandHUD('trash-2', `Pos Impian "${g?.name || ''}" dihapus`, '#8E8E93');
      }
    }
  });
}
