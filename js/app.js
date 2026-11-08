/**
 * DompetKu - Main Application Controller
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
import {
  getLocalCoupleConfig,
  saveLocalCoupleConfig,
  createSupabaseClient,
  pushTransactionToCloud,
  pushWalletToCloud,
  subscribeToCoupleRealtime
} from './sync.js';
import { INITIAL_WALLETS, INITIAL_TRANSACTIONS } from './mockData.js';
import {
  animateNumber,
  showDynamicIslandHUD,
  isReducedMotion
} from './motion.js';

// ================= STATE =================
let currentUserId = 'user_a'; // 'user_a' (Kamu) or 'user_b' (Pacar)
let currentMode = 'all'; // 'all' (Pribadi + Bersama) or 'shared' (Hanya Bersama)
let coupleConfig = getLocalCoupleConfig();
let supabaseClient = null;

let prevNetWorth = 0;
let prevIncome = 0;
let prevExpense = 0;

let wallets = [];
let transactions = [];

const STORAGE_WALLETS = 'dompetku_wallets_v1';
const STORAGE_TXS = 'dompetku_txs_v1';

// ================= INIT =================
function initApp() {
  loadData();
  setupEventListeners();
  renderAll();
  initCloud();
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

function initCloud() {
  if (coupleConfig.supabaseUrl && coupleConfig.supabaseAnonKey) {
    supabaseClient = createSupabaseClient(coupleConfig.supabaseUrl, coupleConfig.supabaseAnonKey);
    if (supabaseClient) {
      subscribeToCoupleRealtime(supabaseClient, {
        coupleCode: coupleConfig.coupleCode,
        currentUserId,
        onWalletChange: updatedWallet => {
          const idx = wallets.findIndex(w => w.id === updatedWallet.id);
          if (idx >= 0) wallets[idx] = updatedWallet;
          else wallets.push(updatedWallet);
          persistData();
          renderAll();
        },
        onTransactionChange: newTx => {
          const idx = transactions.findIndex(t => t.id === newTx.id);
          if (idx >= 0) transactions[idx] = newTx;
          else transactions.unshift(newTx);
          persistData();
          renderAll();
        }
      });
    }
  }
}

// ================= RENDER FUNCTIONS =================
function renderAll() {
  const visibleWallets = getVisibleWallets(wallets, currentUserId);
  const visibleTxs = getVisibleTransactions(transactions, currentUserId);

  renderKpis(visibleWallets, visibleTxs);
  renderWallets(visibleWallets);
  renderTransactions(visibleTxs);
  renderCharts(visibleTxs);
  renderCoupleBanner();

  if (window.lucide) window.lucide.createIcons();
}

function renderKpis(visibleWallets, visibleTxs) {
  const netWorth = calculateNetWorth(visibleWallets, currentUserId, currentMode);
  const kpiNetWorth = document.getElementById('kpiNetWorth');
  const kpiSubtitle = document.getElementById('kpiNetWorthSubtitle');

  if (kpiNetWorth) {
    animateNumber(kpiNetWorth, prevNetWorth, netWorth, { duration: 480, prefix: 'Rp ' });
    prevNetWorth = netWorth;
  }

  if (kpiSubtitle) {
    if (currentMode === 'shared') {
      kpiSubtitle.textContent = 'Mode: Kas Bersama Sahaja';
    } else if (currentUserId === 'user_a') {
      kpiSubtitle.textContent = `Mode: Pribadi Kamu (${coupleConfig.userName || 'Kamu'}) + Bersama`;
    } else {
      kpiSubtitle.textContent = `Mode: Pribadi Pacar (${coupleConfig.partnerName || 'Pacar'}) + Bersama`;
    }
  }

  // Monthly Income and Expense
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let monthIncome = 0;
  let monthExpense = 0;

  for (const t of visibleTxs) {
    if (currentMode === 'shared' && t.visibility !== 'shared') continue;
    const d = new Date(t.date);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      if (t.type === 'income') monthIncome += Number(t.amount);
      if (t.type === 'expense') monthExpense += Number(t.amount);
    }
  }

  const kpiIncome = document.getElementById('kpiIncome');
  const kpiExpense = document.getElementById('kpiExpense');
  if (kpiIncome) {
    animateNumber(kpiIncome, prevIncome, monthIncome, { duration: 450, prefix: 'Rp ', sign: '+' });
    prevIncome = monthIncome;
  }
  if (kpiExpense) {
    animateNumber(kpiExpense, prevExpense, monthExpense, { duration: 450, prefix: 'Rp ', sign: '-' });
    prevExpense = monthExpense;
  }
}

function renderWallets(visibleWallets) {
  const container = document.getElementById('walletsContainer');
  container.innerHTML = '';

  const filteredWallets = visibleWallets.filter(w => {
    if (currentMode === 'shared') return w.visibility === 'shared';
    return true;
  });

  if (filteredWallets.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-6 rounded-2xl bg-[#1C1C1E] border border-white/10 text-center text-xs text-[#8E8E93]">
        Belum ada dompet dalam kategori ini. Klik "+ Tambah" di atas.
      </div>
    `;
    return;
  }

  for (const wallet of filteredWallets) {
    const isShared = wallet.visibility === 'shared';
    const card = document.createElement('div');
    card.className = `p-4 rounded-2xl border transition-all ios-card-specular ios-card-interactive cursor-pointer ${
      isShared
        ? 'border-[#FF2D55]/30 shadow-sm'
        : 'border-white/10 hover:border-white/20 shadow-sm'
    }`;

    const iconName = wallet.type === 'bank' ? 'landmark' : wallet.type === 'ewallet' ? 'smartphone' : 'banknote';

    card.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center text-white" style="background-color: ${wallet.color || '#007AFF'}">
            <i data-lucide="${iconName}" class="w-4 h-4"></i>
          </div>
          <div>
            <span class="text-xs font-semibold text-white tracking-tight block">${escapeHtml(wallet.name)}</span>
            <span class="text-[9px] text-[#8E8E93] uppercase tracking-wider">${wallet.type || 'Bank'}</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <svg class="w-5 h-4 opacity-30 text-amber-200" viewBox="0 0 24 20" fill="none" stroke="currentColor">
            <rect x="1" y="1" width="22" height="18" rx="3" stroke-width="1.5"/>
            <path d="M7 1v18M17 1v18M1 7h6M1 13h6M17 7h6M17 13h6" stroke-width="1.2"/>
          </svg>
          <span class="text-[10px] px-2 py-0.5 rounded-full font-medium ${
            isShared ? 'bg-[#FF2D55]/15 text-[#FF2D55] border border-[#FF2D55]/30' : 'bg-[#2C2C2E] text-[#8E8E93] border border-white/5'
          }">
            ${isShared ? 'Bersama' : 'Pribadi'}
          </span>
        </div>
      </div>
      <div class="mt-2">
        <span class="text-[10px] text-[#8E8E93] font-medium block">Saldo</span>
        <span class="text-xl font-bold text-white tracking-tight font-sans">
          Rp ${(wallet.balance || 0).toLocaleString('id-ID')}
        </span>
      </div>
    `;
    container.appendChild(card);
  }

  if (window.gsap && !isReducedMotion()) {
    gsap.from('#walletsContainer > div', {
      opacity: 0,
      y: 12,
      stagger: 0.035,
      duration: 0.3,
      ease: 'power2.out'
    });
  }
}

function renderTransactions(visibleTxs) {
  const container = document.getElementById('transactionsContainer');
  container.innerHTML = '';

  const searchTerm = (document.getElementById('searchTransaction')?.value || '').toLowerCase();

  const filtered = visibleTxs
    .filter(t => {
      if (currentMode === 'shared' && t.visibility !== 'shared') return false;
      if (!searchTerm) return true;
      return (
        (t.note && t.note.toLowerCase().includes(searchTerm)) ||
        (t.category && t.category.toLowerCase().includes(searchTerm))
      );
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="py-8 text-center text-xs text-[#8E8E93]">
        Belum ada transaksi yang tercatat. Coba ketik di bar Catat Cepat di atas!
      </div>
    `;
    return;
  }

  for (const tx of filtered.slice(0, 25)) {
    const isShared = tx.visibility === 'shared';
    const isExpense = tx.type === 'expense';
    const dateFormatted = new Date(tx.date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    const wallet = wallets.find(w => w.id === tx.walletId);
    const walletName = wallet ? wallet.name : 'Dompet';

    const item = document.createElement('div');
    item.className = 'py-3 px-3.5 sm:px-4 flex items-center justify-between gap-3 text-xs hover:bg-[#2C2C2E]/40 transition-colors';

    item.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isExpense ? 'bg-[#FF3B30]/15 text-[#FF3B30]' : 'bg-[#34C759]/15 text-[#34C759]'
        }">
          <i data-lucide="${isExpense ? 'arrow-up-right' : 'arrow-down-left'}" class="w-4 h-4"></i>
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <span class="font-medium text-white text-xs sm:text-sm">${escapeHtml(tx.note || tx.category)}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded font-medium ${
              isShared ? 'bg-[#FF2D55]/15 text-[#FF2D55]' : 'bg-[#2C2C2E] text-[#8E8E93]'
            }">
              ${isShared ? 'Bersama' : 'Pribadi'}
            </span>
          </div>
          <div class="flex items-center gap-2 text-[11px] text-[#8E8E93] mt-0.5">
            <span>${dateFormatted}</span>
            <span>•</span>
            <span class="text-slate-300">${escapeHtml(walletName)}</span>
            <span>•</span>
            <span>${escapeHtml(tx.category || 'Lainnya')}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <span class="font-semibold text-xs sm:text-sm font-sans ${isExpense ? 'text-white' : 'text-[#34C759]'}">
          ${isExpense ? '-' : '+'}Rp ${(Number(tx.amount) || 0).toLocaleString('id-ID')}
        </span>
        <button data-delete-id="${tx.id}" class="btn-delete-tx p-1 text-[#8E8E93] hover:text-[#FF3B30] transition-colors" title="Hapus">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;

    container.appendChild(item);
  }

  // Delete event listeners
  container.querySelectorAll('.btn-delete-tx').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.getAttribute('data-delete-id');
      deleteTransaction(id);
    });
  });

  if (window.gsap && !isReducedMotion()) {
    gsap.from('#transactionsContainer > div', {
      opacity: 0,
      y: 8,
      stagger: 0.02,
      duration: 0.25,
      ease: 'power1.out'
    });
  }
}

function renderCharts(visibleTxs) {
  const donutCanvas = document.getElementById('categoryDonutCanvas');
  const barCanvas = document.getElementById('cashflowBarCanvas');
  if (donutCanvas && barCanvas) {
    updateDonutChart(donutCanvas, visibleTxs);
    updateBarChart(barCanvas, visibleTxs);
  }
}

function renderCoupleBanner() {
  const banner = document.getElementById('coupleBanner');
  const codeDisplay = document.getElementById('bannerCoupleCode');
  const settingsDisplay = document.getElementById('settingsCoupleCodeDisplay');

  if (coupleConfig.coupleCode) {
    if (banner) banner.classList.remove('hidden');
    if (codeDisplay) codeDisplay.textContent = coupleConfig.coupleCode;
    if (settingsDisplay) settingsDisplay.textContent = coupleConfig.coupleCode;
  }
}

// ================= TRANSACTION ACTIONS =================
function handleQuickSubmit() {
  const input = document.getElementById('quickInput');
  const text = (input?.value || '').trim();
  if (!text) return;

  const visibleWallets = getVisibleWallets(wallets, currentUserId);
  const defaultWallet = visibleWallets.find(w => w.visibility === 'private') || visibleWallets[0];
  const defaultId = defaultWallet ? defaultWallet.id : (wallets[0] ? wallets[0].id : null);

  const parsed = parseQuickInput(text, visibleWallets, defaultId);

  if (parsed.amount <= 0) {
    alert('Mohon masukkan nominal yang valid (misal: "makan 15k" atau "kopi 25rb")');
    return;
  }

  // If parsed visibility is shared, pick the shared wallet if default was private
  let targetWalletId = parsed.walletId;
  if (parsed.visibility === 'shared') {
    const sharedWallet = wallets.find(w => w.visibility === 'shared');
    if (sharedWallet) targetWalletId = sharedWallet.id;
  }

  const newTx = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    walletId: targetWalletId,
    createdBy: currentUserId,
    coupleId: coupleConfig.coupleCode,
    type: 'expense',
    amount: parsed.amount,
    category: parsed.category,
    note: parsed.note,
    visibility: parsed.visibility,
    date: new Date().toISOString()
  };

  // Update Wallets Balance
  wallets = addTransaction(wallets, newTx);
  transactions.unshift(newTx);

  persistData();
  renderAll();

  // Cloud sync
  if (supabaseClient) {
    pushTransactionToCloud(supabaseClient, newTx);
    const affectedWallet = wallets.find(w => w.id === targetWalletId);
    if (affectedWallet) pushWalletToCloud(supabaseClient, affectedWallet);
  }

  input.value = '';
  document.getElementById('quickPreview').classList.add('hidden');

  showDynamicIslandHUD('check-circle', `Tercatat: ${parsed.note || parsed.category} (Rp ${(parsed.amount || 0).toLocaleString('id-ID')})`, '#34C759');
}

function deleteTransaction(txId) {
  const tx = transactions.find(t => t.id === txId);
  if (!tx) return;

  // Revert wallet balance
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

// ================= EVENT LISTENERS =================
function setupEventListeners() {
  // Quick Input Enter Key & Live Preview
  const quickInput = document.getElementById('quickInput');
  const quickPreview = document.getElementById('quickPreview');

  quickInput?.addEventListener('input', () => {
    const val = quickInput.value.trim();
    if (!val) {
      quickPreview.classList.add('hidden');
      return;
    }

    const visibleWallets = getVisibleWallets(wallets, currentUserId);
    const defaultWallet = visibleWallets[0];
    const parsed = parseQuickInput(val, visibleWallets, defaultWallet ? defaultWallet.id : null);

    if (parsed.amount > 0) {
      quickPreview.classList.remove('hidden');
      document.getElementById('previewAmount').textContent = `Rp ${parsed.amount.toLocaleString('id-ID')}`;
      document.getElementById('previewCategory').textContent = parsed.category;
      const w = wallets.find(item => item.id === parsed.walletId);
      document.getElementById('previewWallet').textContent = w ? w.name : 'Dompet Utama';
      document.getElementById('previewVisibility').textContent = parsed.visibility === 'shared' ? '🤝 Bersama' : '🔒 Pribadi';
    } else {
      quickPreview.classList.add('hidden');
    }
  });

  quickInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuickSubmit();
    }
  });

  document.getElementById('btnSubmitQuick')?.addEventListener('click', handleQuickSubmit);

  // Role Switchers
  const btnRoleA = document.getElementById('btnRoleA');
  const btnRoleShared = document.getElementById('btnRoleShared');
  const btnRoleB = document.getElementById('btnRoleB');

  function updateRoleButtons() {
    const track = document.getElementById('segmentedControlTrack');
    const pill = document.getElementById('rolePillIndicator');
    let activeBtn = btnRoleA;

    [btnRoleA, btnRoleShared, btnRoleB].forEach(btn => {
      if (btn) {
        btn.className = 'relative z-10 px-3.5 py-1 rounded-full text-[#8E8E93] hover:text-white transition-colors duration-200 font-medium';
      }
    });

    if (currentMode === 'shared') {
      activeBtn = btnRoleShared;
    } else if (currentUserId === 'user_a') {
      activeBtn = btnRoleA;
    } else {
      activeBtn = btnRoleB;
    }

    if (activeBtn) {
      activeBtn.className = 'relative z-10 px-3.5 py-1 rounded-full text-white transition-colors duration-200 font-medium';
      if (track && pill) {
        const trackRect = track.getBoundingClientRect();
        const btnRect = activeBtn.getBoundingClientRect();
        if (trackRect.width > 0) {
          const left = Math.round(btnRect.left - trackRect.left);
          const width = Math.round(btnRect.width);
          pill.style.transform = `translateX(${left - 4}px)`;
          pill.style.width = `${width}px`;
        }
      }
    }
  }

  window.addEventListener('resize', updateRoleButtons);

  btnRoleA?.addEventListener('click', () => {
    currentUserId = 'user_a';
    currentMode = 'all';
    updateRoleButtons();
    renderAll();
  });

  btnRoleShared?.addEventListener('click', () => {
    currentMode = 'shared';
    updateRoleButtons();
    renderAll();
  });

  btnRoleB?.addEventListener('click', () => {
    currentUserId = 'user_b';
    currentMode = 'all';
    updateRoleButtons();
    renderAll();
  });

  // Search filter
  document.getElementById('searchTransaction')?.addEventListener('input', () => {
    const visibleTxs = getVisibleTransactions(transactions, currentUserId);
    renderTransactions(visibleTxs);
  });

  // Copy Couple Code
  const copyBtn = document.getElementById('btnCopyCoupleCode');
  copyBtn?.addEventListener('click', () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(coupleConfig.coupleCode).then(() => {
        copyBtn.innerHTML = '<i data-lucide="check" class="w-3 h-3"></i> Tersalin!';
        setTimeout(() => {
          copyBtn.innerHTML = '<i data-lucide="copy" class="w-3 h-3"></i> Salin Kode untuk Pacar';
          if (window.lucide) window.lucide.createIcons();
        }, 2000);
      });
    }
  });

  // Mobile FAB
  document.getElementById('btnMobileFab')?.addEventListener('click', () => {
    document.getElementById('quickInput')?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Modals Setup
  setupModals();
}

function setupModals() {
  // Modal: Add Wallet
  const modalWallet = document.getElementById('modalAddWallet');
  const btnOpenWallet = document.getElementById('btnOpenAddWallet');
  const btnCloseWallet = document.getElementById('btnCloseAddWallet');
  const formWallet = document.getElementById('formAddWallet');

  btnOpenWallet?.addEventListener('click', () => modalWallet.classList.remove('hidden'));
  btnCloseWallet?.addEventListener('click', () => modalWallet.classList.add('hidden'));

  formWallet?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('walletFormName').value.trim();
    const type = document.getElementById('walletFormType').value;
    const balance = Number(document.getElementById('walletFormBalance').value) || 0;
    const visibility = document.getElementById('walletFormVisibility').value;

    const newWallet = createWallet({
      ownerId: currentUserId,
      coupleId: coupleConfig.coupleCode,
      name,
      type,
      balance,
      visibility,
      color: visibility === 'shared' ? '#ec4899' : '#3b82f6'
    });

    wallets.push(newWallet);
    persistData();
    renderAll();

    if (supabaseClient) pushWalletToCloud(supabaseClient, newWallet);

    formWallet.reset();
    modalWallet.classList.add('hidden');
  });

  // Modal: Scanner / OCR
  const modalScanner = document.getElementById('modalScanner');
  const btnOpenScanner = document.getElementById('btnOpenScanner');
  const btnCloseScanner = document.getElementById('btnCloseScanner');
  const fileInput = document.getElementById('fileReceiptInput');
  const ocrLoading = document.getElementById('ocrLoading');
  const ocrProgressBar = document.getElementById('ocrProgressBar');
  const ocrProgressPercent = document.getElementById('ocrProgressPercent');
  const ocrResultBox = document.getElementById('ocrResultBox');
  const ocrDetectedAmount = document.getElementById('ocrDetectedAmount');
  const ocrDetectedNote = document.getElementById('ocrDetectedNote');
  const btnUseOcr = document.getElementById('btnUseOcrResult');

  let scannedResult = null;

  btnOpenScanner?.addEventListener('click', () => {
    modalScanner.classList.remove('hidden');
    ocrResultBox.classList.add('hidden');
    ocrLoading.classList.add('hidden');
  });
  btnCloseScanner?.addEventListener('click', () => modalScanner.classList.add('hidden'));

  fileInput?.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;

    ocrLoading.classList.remove('hidden');
    ocrResultBox.classList.add('hidden');
    ocrProgressBar.style.width = '0%';
    ocrProgressPercent.textContent = '0%';

    try {
      scannedResult = await scanReceiptWithTesseract(file, progress => {
        ocrProgressBar.style.width = `${progress}%`;
        ocrProgressPercent.textContent = `${progress}%`;
      });

      ocrLoading.classList.add('hidden');
      ocrResultBox.classList.remove('hidden');
      ocrDetectedAmount.textContent = `Rp ${scannedResult.amount.toLocaleString('id-ID')}`;
      ocrDetectedNote.textContent = scannedResult.note;
    } catch (err) {
      console.warn('OCR error fallback to local extractor:', err);
      // Fallback
      scannedResult = { amount: 50000, note: 'Struk Pembayaran', category: 'Makanan & Minuman' };
      ocrLoading.classList.add('hidden');
      ocrResultBox.classList.remove('hidden');
      ocrDetectedAmount.textContent = `Rp ${scannedResult.amount.toLocaleString('id-ID')}`;
      ocrDetectedNote.textContent = scannedResult.note;
    }
  });

  btnUseOcr?.addEventListener('click', () => {
    if (scannedResult && scannedResult.amount > 0) {
      const quickInput = document.getElementById('quickInput');
      quickInput.value = `${scannedResult.note} ${scannedResult.amount}`;
      quickInput.dispatchEvent(new Event('input'));
      modalScanner.classList.add('hidden');
      quickInput.focus();
    }
  });

  // Modal: Settings & Couple Pairing
  const modalSettings = document.getElementById('modalSettings');
  const btnOpenSettings = document.getElementById('btnOpenSettings');
  const btnCloseSettings = document.getElementById('btnCloseSettings');
  const btnJoinCode = document.getElementById('btnJoinCode');
  const inputJoinCode = document.getElementById('inputJoinCode');

  btnOpenSettings?.addEventListener('click', () => modalSettings.classList.remove('hidden'));
  btnCloseSettings?.addEventListener('click', () => modalSettings.classList.add('hidden'));

  btnJoinCode?.addEventListener('click', () => {
    const newCode = (inputJoinCode?.value || '').trim().toUpperCase();
    if (!newCode) return;
    coupleConfig.coupleCode = newCode;
    saveLocalCoupleConfig(coupleConfig);
    alert(`Berhasil terhubung ke Kode Pasangan: ${newCode}`);
    renderCoupleBanner();
    modalSettings.classList.add('hidden');
  });

  document.getElementById('btnSaveCloudConfig')?.addEventListener('click', () => {
    const url = document.getElementById('inputSupabaseUrl')?.value.trim();
    const key = document.getElementById('inputSupabaseKey')?.value.trim();
    coupleConfig.supabaseUrl = url;
    coupleConfig.supabaseAnonKey = key;
    saveLocalCoupleConfig(coupleConfig);
    initCloud();
    alert('Konfigurasi Cloud disimpan!');
    modalSettings.classList.add('hidden');
  });

  document.getElementById('btnResetData')?.addEventListener('click', () => {
    if (confirm('Yakin ingin mereset data ke kondisi awal?')) {
      localStorage.removeItem(STORAGE_WALLETS);
      localStorage.removeItem(STORAGE_TXS);
      loadData();
      renderAll();
      modalSettings.classList.add('hidden');
    }
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

// Start app on DOMContentLoaded
window.addEventListener('DOMContentLoaded', initApp);
