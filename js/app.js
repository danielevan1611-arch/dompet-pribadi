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

let prevNetWorth = 0;
let prevIncome = 0;
let prevExpense = 0;
let prevCoupleKas = 0;

let wallets = [];
let transactions = [];

let splitParticipants = ['Daniel', 'Sarah', 'Budi'];
let splitItems = [
  { id: '1', name: 'Nasi Goreng Spesial', price: 45000, quantity: 1, assignedTo: ['Daniel'] },
  { id: '2', name: 'Wagyu Beef Ribeye', price: 185000, quantity: 1, assignedTo: ['Sarah'] },
  { id: '3', name: 'Pasta Carbonara', price: 65000, quantity: 1, assignedTo: ['Budi'] },
  { id: '4', name: 'Truffle Fries (Sharing)', price: 55000, quantity: 1, assignedTo: ['Daniel', 'Sarah', 'Budi'] },
  { id: '5', name: 'Ice Peach Tea', price: 28000, quantity: 1, assignedTo: ['Daniel'] },
  { id: '6', name: 'Matcha Latte', price: 35000, quantity: 1, assignedTo: ['Sarah'] },
  { id: '7', name: 'Mineral Water', price: 15000, quantity: 1, assignedTo: ['Budi'] }
];

const STORAGE_WALLETS = 'dompetku_wallets_v2';
const STORAGE_TXS = 'dompetku_txs_v2';

export function initApp() {
  loadData();
  updateUserProfileDisplay();
  setupEventListeners();
  setupRouting();
  renderAll();
  switchView('dashboard');
  if (window.lucide) window.lucide.createIcons();
}

function loadData() {
  try {
    const savedWallets = localStorage.getItem(STORAGE_WALLETS);
    const savedTxs = localStorage.getItem(STORAGE_TXS);
    wallets = savedWallets ? JSON.parse(savedWallets) : [...INITIAL_WALLETS];
    transactions = savedTxs ? JSON.parse(savedTxs) : [...INITIAL_TRANSACTIONS];
  } catch (err) {
    console.error('Error loading local state:', err);
    wallets = [...INITIAL_WALLETS];
    transactions = [...INITIAL_TRANSACTIONS];
  }
}

function persistData() {
  try {
    localStorage.setItem(STORAGE_WALLETS, JSON.stringify(wallets));
    localStorage.setItem(STORAGE_TXS, JSON.stringify(transactions));
  } catch (err) {
    console.error('Error saving local state:', err);
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
    settings: document.getElementById('viewSettings')
  };

  const titles = {
    dashboard: 'Dashboard',
    wallet: 'My Wallet & Accounts',
    transactions: 'Transactions & Calendar',
    splitbill: 'Smart Split Bill (PB1 & Resto Tax)',
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
    if (v === viewName) {
      btn.classList.add('bg-[#00D2D3]/15', 'text-[#00D2D3]', 'font-semibold');
      btn.classList.remove('text-[#8E8E93]');
    } else {
      btn.classList.remove('bg-[#00D2D3]/15', 'text-[#00D2D3]', 'font-semibold');
      btn.classList.add('text-[#8E8E93]');
    }
  });

  document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
    const v = btn.getAttribute('data-view');
    if (v === viewName) {
      btn.classList.add('text-[#00D2D3]', 'font-semibold');
      btn.classList.remove('text-[#8E8E93]');
    } else {
      btn.classList.remove('text-[#00D2D3]', 'font-semibold');
      btn.classList.add('text-[#8E8E93]');
    }
  });

  if (viewName === 'wallet') renderMyWalletScreen();
  else if (viewName === 'transactions') {
    renderCalendar();
    renderTransactions(transactions);
  } else if (viewName === 'splitbill') renderSplitBill();
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

  populateTransferSelects('quickTransferFrom', 'quickTransferTo');
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
}

function renderDashboardRecentTxs() {
  const container = document.getElementById('dashboardRecentTxs');
  if (!container) return;
  container.innerHTML = '';

  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  recent.forEach(tx => {
    const isExp = tx.type === 'expense';
    const w = wallets.find(item => item.id === tx.walletId);
    const wName = w ? w.name : 'Dompet';
    const dateFmt = new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

    const item = document.createElement('div');
    item.className = 'py-3 flex items-center justify-between gap-3 text-xs';
    item.innerHTML = `
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-8 h-8 rounded-xl ${isExp ? 'bg-[#FF3B30]/15 text-[#FF3B30]' : 'bg-[#10B981]/15 text-[#10B981]'} flex items-center justify-center shrink-0">
          <i data-lucide="${isExp ? 'arrow-up-right' : 'arrow-down-left'}" class="w-4 h-4"></i>
        </div>
        <div class="min-w-0">
          <p class="font-semibold text-white truncate">${escapeHtml(tx.note || tx.category)}</p>
          <p class="text-[11px] text-[#8E8E93] truncate">${dateFmt} • ${escapeHtml(wName)}</p>
        </div>
      </div>
      <div class="text-right shrink-0">
        <span class="font-mono tabular-nums font-bold ${isExp ? 'text-white' : 'text-[#10B981]'}">
          ${isExp ? '-' : '+'}Rp ${(Number(tx.amount) || 0).toLocaleString('id-ID')}
        </span>
      </div>
    `;
    container.appendChild(item);
  });
  if (window.lucide) window.lucide.createIcons();
}

function populateTransferSelects(fromId, toId) {
  const selFrom = document.getElementById(fromId);
  const selTo = document.getElementById(toId);
  if (!selFrom || !selTo) return;

  const fromVal = selFrom.value;
  const toVal = selTo.value;

  selFrom.innerHTML = '';
  selTo.innerHTML = '';

  wallets.forEach(w => {
    const optFrom = document.createElement('option');
    optFrom.value = w.id;
    optFrom.textContent = `${w.name} (Rp ${w.balance.toLocaleString('id-ID')})`;
    selFrom.appendChild(optFrom);

    const optTo = document.createElement('option');
    optTo.value = w.id;
    optTo.textContent = `${w.name} (Rp ${w.balance.toLocaleString('id-ID')})`;
    selTo.appendChild(optTo);
  });

  if (fromVal && wallets.some(w => w.id === fromVal)) selFrom.value = fromVal;
  if (toVal && wallets.some(w => w.id === toVal)) selTo.value = toVal;
  else if (wallets.length > 1) selTo.selectedIndex = 1;
}

function renderMyWalletScreen() {
  const grid = document.getElementById('myWalletsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  wallets.forEach(wallet => {
    const card = document.createElement('div');
    card.className = 'relative rounded-3xl p-6 overflow-hidden border border-white/10 shadow-xl transition-transform hover:-translate-y-1';
    card.style.background = `linear-gradient(135deg, ${wallet.color || '#1E1E2D'} 0%, #13141F 100%)`;

    const cardLast4 = wallet.id.replace(/\D/g, '').slice(-4) || '8892';
    const typeLabel = wallet.type === 'bank' ? 'DEBIT CARD' : wallet.type === 'ewallet' ? 'E-WALLET' : 'CASH WALLET';

    card.innerHTML = `
      <div class="relative z-10 flex flex-col justify-between h-44">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold tracking-widest text-white uppercase">${escapeHtml(wallet.name)}</span>
          </div>
          <span class="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded bg-white/10 text-white/90 uppercase">${typeLabel}</span>
        </div>

        <div class="my-auto">
          <svg class="w-10 h-7 text-amber-200/80 drop-shadow" viewBox="0 0 24 20" fill="currentColor">
            <rect x="1" y="1" width="22" height="18" rx="3" fill="#D4AF37"/>
            <path d="M7 1v18M17 1v18M1 7h6M1 13h6M17 7h6M17 13h6" stroke="#996515" stroke-width="1.2"/>
          </svg>
          <div class="font-mono text-sm tracking-widest text-white/70 mt-2">
            •••• •••• •••• ${cardLast4}
          </div>
        </div>

        <div class="flex items-end justify-between">
          <div>
            <span class="text-[10px] uppercase tracking-wider text-white/60 block">Saldo Rekening</span>
            <span class="font-editorial text-2xl font-bold text-white tracking-tight">
              Rp ${(wallet.balance || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div class="flex -space-x-2">
            <div class="w-7 h-7 rounded-full bg-red-500/80"></div>
            <div class="w-7 h-7 rounded-full bg-amber-400/80"></div>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  populateTransferSelects('walletTransferFrom', 'walletTransferTo');
  if (window.lucide) window.lucide.createIcons();
}

function handleInternalTransfer(fromSelectId, toSelectId, amountInputId) {
  const fromId = document.getElementById(fromSelectId)?.value;
  const toId = document.getElementById(toSelectId)?.value;
  const amountVal = Number(document.getElementById(amountInputId)?.value) || 0;

  if (!fromId || !toId || fromId === toId) {
    alert('Mohon pilih dua rekening yang berbeda untuk melakukan transfer');
    return;
  }

  if (amountVal <= 0) {
    alert('Mohon masukkan nominal transfer yang valid');
    return;
  }

  const fromWallet = wallets.find(w => w.id === fromId);
  const toWallet = wallets.find(w => w.id === toId);

  if (!fromWallet || !toWallet) return;

  if (fromWallet.balance < amountVal) {
    alert(`Saldo ${fromWallet.name} tidak mencukupi (Rp ${fromWallet.balance.toLocaleString('id-ID')})`);
    return;
  }

  fromWallet.balance -= amountVal;
  toWallet.balance += amountVal;

  const transferTx = {
    id: `tx_${Date.now()}_transfer`,
    walletId: toWallet.id,
    createdBy: 'daniel',
    type: 'income',
    amount: amountVal,
    category: 'Mutasi Internal',
    note: `Transfer dari ${fromWallet.name} ke ${toWallet.name}`,
    visibility: 'personal',
    date: new Date().toISOString()
  };
  transactions.unshift(transferTx);

  persistData();
  renderAll();

  const amtInput = document.getElementById(amountInputId);
  if (amtInput) amtInput.value = '';

  showDynamicIslandHUD(
    'arrow-left-right',
    `Pindah saldo Rp ${amountVal.toLocaleString('id-ID')} (${fromWallet.name} ➔ ${toWallet.name})`,
    '#00D2D3'
  );
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
      cell.className = 'h-16 sm:h-20 rounded-2xl bg-white/[0.02] border border-transparent opacity-30';
      grid.appendChild(cell);
      return;
    }

    const dateKey = day.dateString;
    const data = dailyAggregates[dateKey] || { income: 0, expense: 0, count: 0 };
    const isSelected = selectedCalendarDate === dateKey;

    cell.className = `h-16 sm:h-20 p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
      isSelected
        ? 'bg-[#00D2D3]/15 border-[#00D2D3] shadow-lg shadow-[#00D2D3]/20 ring-1 ring-[#00D2D3]'
        : 'bg-[#171724] border-white/5 hover:border-white/20 hover:bg-[#1E1E2D]'
    }`;

    cell.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold ${isSelected ? 'text-[#00D2D3]' : 'text-white'} font-mono">${day.dayNumber}</span>
        ${data.count > 0 ? `<span class="w-1.5 h-1.5 rounded-full bg-[#00D2D3]"></span>` : ''}
      </div>
      <div class="space-y-0.5 overflow-hidden">
        ${data.income > 0 ? `<div class="text-[9px] sm:text-[10px] font-mono text-[#10B981] font-semibold truncate">+${(data.income / 1000).toFixed(0)}k</div>` : ''}
        ${data.expense > 0 ? `<div class="text-[9px] sm:text-[10px] font-mono text-[#A78BFA] font-semibold truncate">-${(data.expense / 1000).toFixed(0)}k</div>` : ''}
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
      tableTitle.innerHTML = `Transaksi pada <span class="text-[#00D2D3]">${dFmt}</span> <button id="btnResetCalendarFilter" class="ml-2 text-xs text-[#8E8E93] hover:text-white underline cursor-pointer">(Tampilkan Semua)</button>`;
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
      tr.className = 'hover:bg-[#1E1E2D]/80 transition-colors border-b border-white/[0.04] text-xs';
      tr.innerHTML = `
        <td class="py-3 px-4 text-[#8E8E93] font-mono text-[11px]">${dateFormatted}</td>
        <td class="py-3 px-4 font-semibold text-white max-w-xs truncate">${escapeHtml(tx.note || tx.category)}</td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#13141F] text-slate-300 border border-white/5">
            ${escapeHtml(tx.category || 'Lainnya')}
          </span>
        </td>
        <td class="py-3 px-4 text-slate-300">${escapeHtml(wName)}</td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-medium ${isExp ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : 'bg-[#10B981]/10 text-[#10B981]'}">
            ${isExp ? 'Pengeluaran' : 'Pemasukan'}
          </span>
        </td>
        <td class="py-3 px-4 text-right font-bold font-mono tabular-nums text-xs ${isExp ? 'text-white' : 'text-[#10B981]'}">
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
      mCard.className = 'p-3.5 rounded-2xl bg-[#171724] border border-white/5 space-y-2';
      mCard.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-[11px] text-[#8E8E93] font-mono">${dateFormatted}</span>
          <span class="font-mono tabular-nums text-sm font-bold ${isExp ? 'text-white' : 'text-[#10B981]'}">
            ${isExp ? '-' : '+'}Rp ${(Number(tx.amount) || 0).toLocaleString('id-ID')}
          </span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-xs font-semibold text-white">${escapeHtml(tx.note || tx.category)}</p>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="px-2 py-0.5 rounded-md bg-[#13141F] text-slate-300 text-[10px]">${escapeHtml(tx.category || 'Lainnya')}</span>
              <span class="text-[#8E8E93] text-[10px]">•</span>
              <span class="text-[#8E8E93] text-[10px]">${escapeHtml(wName)}</span>
            </div>
          </div>
          <button data-delete-id="${tx.id}" class="btn-delete-tx w-7 h-7 rounded-full bg-[#1E1E2D] hover:bg-[#FF3B30]/20 text-[#8E8E93] hover:text-[#FF3B30] flex items-center justify-center transition-colors cursor-pointer">
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
        <span class="w-5 h-5 rounded-full bg-[#00D2D3]/20 text-[#00D2D3] flex items-center justify-center text-[10px] font-bold">${p.charAt(0)}</span>
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
    splitItems.forEach((item, itemIdx) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-white/[0.02] text-xs';

      const checkboxesHtml = splitParticipants.map(p => {
        const isChecked = (item.assignedTo || []).includes(p);
        return `
          <label class="inline-flex items-center gap-1 mr-3 cursor-pointer select-none">
            <input type="checkbox" data-item-idx="${itemIdx}" data-participant="${escapeHtml(p)}" ${isChecked ? 'checked' : ''} class="rounded border-white/20 text-[#00D2D3] focus:ring-0" />
            <span class="text-[11px] ${isChecked ? 'text-white font-medium' : 'text-[#8E8E93]'}">${escapeHtml(p)}</span>
          </label>
        `;
      }).join('');

      tr.innerHTML = `
        <td class="py-3 font-semibold text-white">${escapeHtml(item.name)}</td>
        <td class="py-3 font-mono tabular-nums text-white">Rp ${(Number(item.price) || 0).toLocaleString('id-ID')}</td>
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
    Object.values(result.breakdown).forEach(p => {
      const pCard = document.createElement('div');
      pCard.className = 'p-3 rounded-2xl bg-[#13141F] border border-white/5 space-y-1';
      pCard.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-bold text-white flex items-center gap-1.5">
            <span class="w-4 h-4 rounded-full bg-[#00D2D3]/20 text-[#00D2D3] flex items-center justify-center text-[9px] font-bold">${p.name.charAt(0)}</span>
            ${escapeHtml(p.name)}
          </span>
          <span class="font-mono font-bold text-sm text-[#00D2D3]">Rp ${p.totalOwed.toLocaleString('id-ID')}</span>
        </div>
        <div class="text-[11px] text-[#8E8E93] flex justify-between">
          <span>Menu: Rp ${p.itemSubtotal.toLocaleString('id-ID')}</span>
          <span>+ Pajak & Svc: Rp ${(p.serviceCharge + p.tax).toLocaleString('id-ID')}</span>
        </div>
      `;
      breakdownContainer.appendChild(pCard);
    });
  }

  return result;
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

  document.getElementById('btnExecuteQuickTransfer')?.addEventListener('click', () => {
    handleInternalTransfer('quickTransferFrom', 'quickTransferTo', 'quickTransferAmount');
  });

  document.getElementById('btnExecuteWalletTransfer')?.addEventListener('click', () => {
    handleInternalTransfer('walletTransferFrom', 'walletTransferTo', 'walletTransferAmount');
  });

  document.getElementById('searchTransaction')?.addEventListener('input', () => {
    renderTransactions(transactions);
  });

  document.getElementById('filterTableCategory')?.addEventListener('change', () => {
    renderTransactions(transactions);
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
    showDynamicIslandHUD('user-plus', `Peserta "${name}" ditambahkan`, '#00D2D3');
  });

  document.getElementById('btnAddNewSplitItem')?.addEventListener('click', () => {
    const menuName = prompt('Nama Menu Makanan/Minuman:');
    if (!menuName) return;
    const menuPrice = parseInt(prompt('Harga (Rp):', '50000'), 10);
    if (isNaN(menuPrice) || menuPrice <= 0) return;

    splitItems.push({
      id: `split_${Date.now()}`,
      name: menuName,
      price: menuPrice,
      quantity: 1,
      assignedTo: [...splitParticipants]
    });
    renderSplitBill();
    showDynamicIslandHUD('plus-circle', `Menu "${menuName}" ditambahkan`, '#00D2D3');
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
    } else {
      alert('Teks berhasil digenerate:\n\n' + waText);
    }
  });

  document.getElementById('btnSaveUserName')?.addEventListener('click', () => {
    const input = document.getElementById('settingInputUserName');
    const val = (input?.value || '').trim();
    if (!val) return;
    userName = val;
    localStorage.setItem('dompetku_username', userName);
    updateUserProfileDisplay();
    showDynamicIslandHUD('user-check', `Nama profil disimpan: "Hi, ${userName}"`, '#00D2D3');
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
    alert('Mohon masukkan nominal yang valid (misal: "makan siang 35k" atau "kopi 25rb gopay")');
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

function setupModals() {
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
    const color = document.getElementById('walletFormColor')?.value || '#00D2D3';

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

  [modalWallet].forEach(modal => {
    modal?.addEventListener('click', e => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') modalWallet?.classList.add('hidden');
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
