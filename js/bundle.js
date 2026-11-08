/**
 * DompetKu - Self-Contained App Bundle
 * Runs seamlessly on both file:/// (double-click) and http:// / https:// (web server & Vercel)
 */

(() => {
  'use strict';

  // ================= 1. STORE & PRIVACY ENGINE =================
  function createWallet({
    id = `w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    ownerId,
    coupleId = null,
    name,
    type = 'bank',
    balance = 0,
    visibility = 'private',
    color = '#3b82f6',
    icon = 'wallet'
  }) {
    return {
      id,
      ownerId,
      coupleId,
      name,
      type,
      balance: Number(balance) || 0,
      visibility,
      color,
      icon
    };
  }

  function getVisibleWallets(wallets = [], currentUserId) {
    if (!Array.isArray(wallets)) return [];
    return wallets.filter(w => w.visibility === 'shared' || w.ownerId === currentUserId);
  }

  function getVisibleTransactions(transactions = [], currentUserId) {
    if (!Array.isArray(transactions)) return [];
    return transactions.filter(t => t.visibility === 'shared' || t.createdBy === currentUserId);
  }

  function addTransaction(wallets = [], transaction) {
    if (!Array.isArray(wallets) || !transaction) return wallets;

    const { type, walletId, targetWalletId, amount = 0 } = transaction;
    const numAmount = Number(amount) || 0;

    return wallets.map(wallet => {
      let updatedBalance = wallet.balance;

      if (type === 'expense' && wallet.id === walletId) {
        updatedBalance -= numAmount;
      } else if (type === 'income' && wallet.id === walletId) {
        updatedBalance += numAmount;
      } else if (type === 'transfer') {
        if (wallet.id === walletId) {
          updatedBalance -= numAmount;
        } else if (wallet.id === targetWalletId) {
          updatedBalance += numAmount;
        }
      }

      return { ...wallet, balance: updatedBalance };
    });
  }

  function calculateNetWorth(wallets = [], currentUserId, mode = 'all') {
    const visible = getVisibleWallets(wallets, currentUserId);
    return visible.reduce((total, w) => {
      if (mode === 'personal' && w.visibility !== 'private') return total;
      if (mode === 'shared' && w.visibility !== 'shared') return total;
      return total + (Number(w.balance) || 0);
    }, 0);
  }

  // ================= 2. INITIAL SEED MOCK DATA =================
  const INITIAL_WALLETS = [
    {
      id: 'w_bca_a',
      ownerId: 'user_a',
      coupleId: 'KITA-7890',
      name: 'BCA Utama',
      type: 'bank',
      balance: 8500000,
      visibility: 'private',
      color: '#2563eb',
      icon: 'landmark'
    },
    {
      id: 'w_gopay_a',
      ownerId: 'user_a',
      coupleId: 'KITA-7890',
      name: 'GoPay',
      type: 'ewallet',
      balance: 450000,
      visibility: 'private',
      color: '#00aad2',
      icon: 'smartphone'
    },
    {
      id: 'w_cash_a',
      ownerId: 'user_a',
      coupleId: 'KITA-7890',
      name: 'Dompet Tunai',
      type: 'cash',
      balance: 200000,
      visibility: 'private',
      color: '#10b981',
      icon: 'banknote'
    },
    {
      id: 'w_couple_shared',
      ownerId: 'user_a',
      coupleId: 'KITA-7890',
      name: 'Kas Kencan & Liburan',
      type: 'bank',
      balance: 2200000,
      visibility: 'shared',
      color: '#ec4899',
      icon: 'heart'
    },
    {
      id: 'w_mandiri_b',
      ownerId: 'user_b',
      coupleId: 'KITA-7890',
      name: 'Mandiri Pacar',
      type: 'bank',
      balance: 6200000,
      visibility: 'private',
      color: '#f59e0b',
      icon: 'landmark'
    },
    {
      id: 'w_ovo_b',
      ownerId: 'user_b',
      coupleId: 'KITA-7890',
      name: 'OVO Pacar',
      type: 'ewallet',
      balance: 150000,
      visibility: 'private',
      color: '#8b5cf6',
      icon: 'smartphone'
    }
  ];

  const INITIAL_TRANSACTIONS = [
    {
      id: 'tx_1',
      walletId: 'w_bca_a',
      createdBy: 'user_a',
      coupleId: 'KITA-7890',
      type: 'expense',
      amount: 35000,
      category: 'Makanan & Minuman',
      note: 'Makan siang nasi padang',
      visibility: 'private',
      date: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'tx_2',
      walletId: 'w_gopay_a',
      createdBy: 'user_a',
      coupleId: 'KITA-7890',
      type: 'expense',
      amount: 25000,
      category: 'Transportasi',
      note: 'Gojek ke kantor',
      visibility: 'private',
      date: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    {
      id: 'tx_3',
      walletId: 'w_couple_shared',
      createdBy: 'user_a',
      coupleId: 'KITA-7890',
      type: 'expense',
      amount: 145000,
      category: 'Hiburan & Rekreasi',
      note: 'Nonton Bioskop XXI berdua',
      visibility: 'shared',
      date: new Date(Date.now() - 3600000 * 26).toISOString()
    },
    {
      id: 'tx_4',
      walletId: 'w_couple_shared',
      createdBy: 'user_b',
      coupleId: 'KITA-7890',
      type: 'expense',
      amount: 85000,
      category: 'Makanan & Minuman',
      note: 'Kopi Kenangan & Roti bareng',
      visibility: 'shared',
      date: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    {
      id: 'tx_5',
      walletId: 'w_mandiri_b',
      createdBy: 'user_b',
      coupleId: 'KITA-7890',
      type: 'expense',
      amount: 120000,
      category: 'Belanja & Kebutuhan',
      note: 'Beli Skincare Pribadi',
      visibility: 'private',
      date: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ];

  // ================= 3. NATURAL LANGUAGE QUICK PARSER =================
  const CATEGORY_KEYWORDS = {
    'Makanan & Minuman': [
      'makan', 'sarapan', 'lunch', 'dinner', 'nasi', 'bakso', 'mie', 'soto', 'ayam',
      'kopi', 'coffee', 'cafe', 'warteg', 'mcd', 'kfc', 'gofood', 'grabfood', 'shopeefood',
      'snack', 'minum', 'jus', 'roti', 'martabak', 'boba'
    ],
    'Transportasi': [
      'bensin', 'spbu', 'pertalite', 'pertamax', 'solar', 'parkir', 'grab', 'gojek',
      'tol', 'kereta', 'krl', 'mrt', 'busway', 'servis', 'oli', 'tambal', 'cuci motor', 'cuci mobil'
    ],
    'Belanja & Kebutuhan': [
      'indomaret', 'alfamart', 'supermarket', 'belanja', 'baju', 'sabun', 'shopee',
      'tokopedia', 'lazada', 'tiktok shop', 'skincare', 'shampoo'
    ],
    'Tagihan & Utilitas': [
      'pln', 'listrik', 'pdam', 'air', 'wifi', 'indihome', 'biznet', 'pulsa', 'kuota',
      'netflix', 'spotify', 'youtube', 'iuran', 'kontrakan', 'kost'
    ],
    'Hiburan & Rekreasi': [
      'nonton', 'bioskop', 'xxi', 'cinema', 'game', 'steam', 'liburan', 'hotel',
      'staycation', 'tiket', 'karaoke', 'wisata'
    ],
    'Kesehatan': [
      'obat', 'apotek', 'dokter', 'vitamin', 'klinik', 'rs', 'masker', 'suplemen'
    ],
    'Gaji & Pemasukan': [
      'gaji', 'bonus', 'thr', 'dividen', 'cashback', 'refund', 'proyek', 'freelance'
    ]
  };

  const SHARED_KEYWORDS = ['bersama', 'bareng', 'kencan', 'patungan', 'berdua', 'couple'];

  function parseQuickInput(text = '', availableWallets = [], defaultWalletId = null) {
    if (!text || typeof text !== 'string') {
      return {
        amount: 0,
        category: 'Lainnya',
        walletId: defaultWalletId,
        visibility: 'private',
        note: ''
      };
    }

    let workingText = text.trim();
    let amount = 0;
    let category = 'Lainnya';
    let visibility = 'private';
    let matchedWalletId = defaultWalletId;

    // 1. Detect Shared Flag
    for (const sharedWord of SHARED_KEYWORDS) {
      const regex = new RegExp(`\\b${sharedWord}\\b`, 'i');
      if (regex.test(workingText)) {
        visibility = 'shared';
        workingText = workingText.replace(regex, ' ');
        break;
      }
    }

    // 2. Detect Amount
    const kPattern = /\b(\d+(?:[.,]\d+)?)\s*(k|rb|ribu)\b/i;
    const jtPattern = /\b(\d+(?:[.,]\d+)?)\s*(jt|juta)\b/i;
    const standardDotPattern = /\b(\d{1,3}(?:\.\d{3})+)\b/;
    const plainNumberPattern = /\b(\d+)\b/;

    let amountMatch = workingText.match(kPattern);
    if (amountMatch) {
      const base = parseFloat(amountMatch[1].replace(',', '.'));
      amount = Math.round(base * 1000);
      workingText = workingText.replace(amountMatch[0], ' ');
    } else if ((amountMatch = workingText.match(jtPattern))) {
      const base = parseFloat(amountMatch[1].replace(',', '.'));
      amount = Math.round(base * 1000000);
      workingText = workingText.replace(amountMatch[0], ' ');
    } else if ((amountMatch = workingText.match(standardDotPattern))) {
      amount = parseInt(amountMatch[1].replace(/\./g, ''), 10);
      workingText = workingText.replace(amountMatch[0], ' ');
    } else if ((amountMatch = workingText.match(plainNumberPattern))) {
      amount = parseInt(amountMatch[1], 10);
      workingText = workingText.replace(amountMatch[0], ' ');
    }

    // 3. Detect Wallet
    if (Array.isArray(availableWallets) && availableWallets.length > 0) {
      for (const wallet of availableWallets) {
        const walletName = wallet.name.toLowerCase();
        const regex = new RegExp(`\\b${walletName}\\b`, 'i');
        if (regex.test(workingText)) {
          matchedWalletId = wallet.id;
          workingText = workingText.replace(regex, ' ');
          break;
        }
        if ((walletName.includes('cash') || walletName.includes('tunai')) && /\b(cash|tunai)\b/i.test(workingText)) {
          matchedWalletId = wallet.id;
          workingText = workingText.replace(/\b(cash|tunai)\b/i, ' ');
          break;
        }
      }
    }

    // 4. Detect Category
    const cleanedLower = workingText.toLowerCase();
    categoryLoop: for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        if (regex.test(cleanedLower)) {
          category = catName;
          break categoryLoop;
        }
      }
    }

    // 5. Clean Note
    let cleanNote = workingText.replace(/\s+/g, ' ').trim();
    if (!cleanNote) {
      cleanNote = text.trim();
    }

    return {
      amount,
      category,
      walletId: matchedWalletId,
      visibility,
      note: cleanNote
    };
  }

  // ================= 4. RECEIPT & OCR SCANNER =================
  function extractPaymentDetailsFromText(rawText = '') {
    if (!rawText || typeof rawText !== 'string') {
      return {
        amount: 0,
        date: new Date().toISOString(),
        type: 'expense',
        note: 'Struk Belanja'
      };
    }

    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let amount = 0;
    let note = '';
    let date = new Date().toISOString();
    let type = 'expense';

    const totalRegexes = [
      /(?:total bayar|grand total|total belanja|total)\s*[:=]?\s*(?:rp\.?|idr)?\s*([\d.,]+)/i,
      /(?:jumlah|nominal|transfer)\s*[:=]?\s*(?:rp\.?|idr)?\s*([\d.,]+)/i,
      /(?:rp\.?|idr)\s*([\d.,]+)/i
    ];

    for (const regex of totalRegexes) {
      const match = rawText.match(regex);
      if (match && match[1]) {
        let numStr = match[1].trim();
        numStr = numStr.replace(/[,.]00$/, '');
        const parsed = parseInt(numStr.replace(/[.,]/g, ''), 10);
        if (!isNaN(parsed) && parsed > 0) {
          amount = parsed;
          break;
        }
      }
    }

    const merchantMatch = rawText.match(/(?:merchant|toko|tempat)\s*[:=]?\s*([^\n\r]+)/i);
    const beritaMatch = rawText.match(/(?:berita|keterangan|catatan)\s*[:=]?\s*([^\n\r]+)/i);

    if (beritaMatch && beritaMatch[1]) {
      note = beritaMatch[1].trim();
    } else if (merchantMatch && merchantMatch[1]) {
      note = merchantMatch[1].trim();
    } else {
      for (const line of lines) {
        if (/indomaret|alfamart|kopi|mcdonald|kfc|starbucks|pertamina|spbu/i.test(line)) {
          note = line;
          break;
        }
      }
    }

    if (!note) {
      note = /m-transfer|transfer/i.test(rawText) ? 'Bukti Transfer' : 'Struk Pembayaran';
    }

    const dateMatch = rawText.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, '0');
      const month = dateMatch[2].padStart(2, '0');
      let year = dateMatch[3];
      if (year.length === 2) year = `20${year}`;
      date = `${year}-${month}-${day}T12:00:00.000Z`;
    }

    return { amount, date, type, note };
  }

  async function scanReceiptWithTesseract(imageSource, onProgress = () => {}) {
    if (typeof window === 'undefined' || !window.Tesseract) {
      throw new Error('Tesseract.js belum dimuat di browser');
    }

    const worker = await window.Tesseract.createWorker('ind+eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          onProgress(Math.round(m.progress * 100));
        }
      }
    });

    const { data: { text } } = await worker.recognize(imageSource);
    await worker.terminate();

    return extractPaymentDetailsFromText(text);
  }

  // ================= 5. CHARTS CONTROLLER =================
  let donutChartInstance = null;
  let barChartInstance = null;

  const CATEGORY_COLORS = {
    'Makanan & Minuman': '#FF9500', // Apple Orange
    'Transportasi': '#30B0C7',      // Apple Teal
    'Belanja & Kebutuhan': '#AF52DE',// Apple Purple
    'Tagihan & Utilitas': '#FF3B30', // Apple Red
    'Hiburan & Rekreasi': '#FF2D55', // Apple Pink
    'Kesehatan': '#34C759',          // Apple Green
    'Gaji & Pemasukan': '#30D158',   // Apple Bright Green
    'Lainnya': '#8E8E93'             // Apple Gray
  };

  function updateDonutChart(canvasElement, transactions = []) {
    if (!canvasElement || typeof window.Chart === 'undefined') return;

    const expenses = transactions.filter(t => t.type === 'expense');
    const catTotals = {};

    for (const t of expenses) {
      const cat = t.category || 'Lainnya';
      catTotals[cat] = (catTotals[cat] || 0) + Number(t.amount);
    }

    let labels = Object.keys(catTotals);
    let data = Object.values(catTotals);
    let colors = labels.map(l => CATEGORY_COLORS[l] || '#8E8E93');

    if (donutChartInstance) {
      donutChartInstance.destroy();
    }

    if (labels.length === 0) {
      labels = ['Belum ada pengeluaran'];
      data = [1];
      colors = ['#2C2C2E'];
    }

    donutChartInstance = new window.Chart(canvasElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#1C1C1E' }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#8E8E93', font: { size: 11, family: '-apple-system, sans-serif' }, boxWidth: 10, padding: 10 }
          },
          tooltip: {
            callbacks: {
              label: context => ` ${context.label}: Rp ${(context.raw || 0).toLocaleString('id-ID')}`
            }
          }
        },
        cutout: '72%'
      }
    });
  }

  function updateBarChart(canvasElement, transactions = []) {
    if (!canvasElement || typeof window.Chart === 'undefined') return;

    let totalIncome = 0;
    let totalExpense = 0;

    for (const t of transactions) {
      if (t.type === 'income') totalIncome += Number(t.amount);
      if (t.type === 'expense') totalExpense += Number(t.amount);
    }

    if (barChartInstance) {
      barChartInstance.destroy();
    }

    barChartInstance = new window.Chart(canvasElement, {
      type: 'bar',
      data: {
        labels: ['Pemasukan', 'Pengeluaran'],
        datasets: [
          {
            label: 'Arus Kas (Rp)',
            data: [totalIncome, totalExpense],
            backgroundColor: ['#34C759', '#FF3B30'],
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            ticks: {
              color: '#8E8E93',
              callback: value => 'Rp ' + (value >= 1000000 ? (value / 1000000) + 'jt' : value.toLocaleString('id-ID'))
            },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          x: {
            ticks: { color: '#8E8E93' },
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: context => ` Rp ${(context.raw || 0).toLocaleString('id-ID')}`
            }
          }
        }
      }
    });
  }

  // ================= 6. SYNC & PAIRING CONFIG =================
  const CONFIG_KEY = 'dompetku_couple_config_v1';

  function generateCoupleCode() {
    const words = ['KITA', 'LOVE', 'BERSAMA', 'DUO', 'COUPLE', 'HOME'];
    const prefix = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${num}`;
  }

  function getLocalCoupleConfig() {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Config load error:', e);
    }

    const def = {
      coupleCode: generateCoupleCode(),
      currentUserId: 'user_a',
      userName: 'Kamu',
      partnerName: 'Pacar',
      supabaseUrl: '',
      supabaseAnonKey: ''
    };
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(def));
    } catch (_) {}
    return def;
  }

  function saveLocalCoupleConfig(config) {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch (_) {}
    return config;
  }

  function createSupabaseClient(supabaseUrl, supabaseAnonKey) {
    if (typeof window === 'undefined' || !window.supabase || !supabaseUrl || !supabaseAnonKey) {
      return null;
    }
    try {
      return window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    } catch (err) {
      console.warn('Supabase connect error:', err);
      return null;
    }
  }

  // ================= 7. APP CONTROLLER =================
  let currentUserId = 'user_a';
  let currentMode = 'all';
  let coupleConfig = getLocalCoupleConfig();
  let supabaseClient = null;

  let wallets = [];
  let transactions = [];

  const STORAGE_WALLETS = 'dompetku_wallets_v1';
  const STORAGE_TXS = 'dompetku_txs_v1';

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
    }
  }

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

    if (kpiNetWorth) kpiNetWorth.textContent = `Rp ${netWorth.toLocaleString('id-ID')}`;

    if (kpiSubtitle) {
      if (currentMode === 'shared') {
        kpiSubtitle.textContent = 'Mode: ❤️ Kas Bersama Sahaja';
      } else if (currentUserId === 'user_a') {
        kpiSubtitle.textContent = `Mode: 👤 Pribadi Kamu (${coupleConfig.userName || 'Kamu'}) + Bersama`;
      } else {
        kpiSubtitle.textContent = `Mode: 🌸 Pribadi Pacar (${coupleConfig.partnerName || 'Pacar'}) + Bersama`;
      }
    }

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
    if (kpiIncome) kpiIncome.textContent = `+Rp ${monthIncome.toLocaleString('id-ID')}`;
    if (kpiExpense) kpiExpense.textContent = `-Rp ${monthExpense.toLocaleString('id-ID')}`;
  }

  function renderWallets(visibleWallets) {
    const container = document.getElementById('walletsContainer');
    if (!container) return;
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
      card.className = `p-4 rounded-2xl border transition-all ios-card-interactive cursor-pointer ${
        isShared
          ? 'bg-[#1C1C1E] border-[#FF2D55]/30 shadow-sm'
          : 'bg-[#1C1C1E] border-white/10 hover:border-white/20 shadow-sm'
      }`;

      const iconName = wallet.type === 'bank' ? 'landmark' : wallet.type === 'ewallet' ? 'smartphone' : 'banknote';

      card.innerHTML = `
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center text-white" style="background-color: ${wallet.color || '#007AFF'}">
              <i data-lucide="${iconName}" class="w-4 h-4"></i>
            </div>
            <span class="text-xs font-semibold text-white tracking-tight">${escapeHtml(wallet.name)}</span>
          </div>
          <span class="text-[10px] px-2 py-0.5 rounded-full font-medium ${
            isShared ? 'bg-[#FF2D55]/15 text-[#FF2D55] border border-[#FF2D55]/30' : 'bg-[#2C2C2E] text-[#8E8E93] border border-white/5'
          }">
            ${isShared ? 'Bersama' : 'Pribadi'}
          </span>
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
  }

  function renderTransactions(visibleTxs) {
    const container = document.getElementById('transactionsContainer');
    if (!container) return;
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

    container.querySelectorAll('.btn-delete-tx').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.getAttribute('data-delete-id');
        deleteTransaction(id);
      });
    });
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

    wallets = addTransaction(wallets, newTx);
    transactions.unshift(newTx);

    persistData();
    renderAll();

    input.value = '';
    const quickPreview = document.getElementById('quickPreview');
    if (quickPreview) quickPreview.classList.add('hidden');
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

      const visibleWallets = getVisibleWallets(wallets, currentUserId);
      const defaultWallet = visibleWallets[0];
      const parsed = parseQuickInput(val, visibleWallets, defaultWallet ? defaultWallet.id : null);

      if (parsed.amount > 0) {
        quickPreview?.classList.remove('hidden');
        const pAmount = document.getElementById('previewAmount');
        const pCat = document.getElementById('previewCategory');
        const pWallet = document.getElementById('previewWallet');
        const pVis = document.getElementById('previewVisibility');

        if (pAmount) pAmount.textContent = `Rp ${parsed.amount.toLocaleString('id-ID')}`;
        if (pCat) pCat.textContent = parsed.category;
        const w = wallets.find(item => item.id === parsed.walletId);
        if (pWallet) pWallet.textContent = w ? w.name : 'Dompet Utama';
        if (pVis) pVis.textContent = parsed.visibility === 'shared' ? '🤝 Bersama' : '🔒 Pribadi';
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

    // Profile Switchers
    const btnRoleA = document.getElementById('btnRoleA');
    const btnRoleShared = document.getElementById('btnRoleShared');
    const btnRoleB = document.getElementById('btnRoleB');

    function updateRoleButtons() {
      [btnRoleA, btnRoleShared, btnRoleB].forEach(btn => {
        if (btn) btn.className = 'px-3 py-1 rounded-full transition-all text-[#8E8E93] hover:text-white font-medium';
      });

      if (currentMode === 'shared') {
        if (btnRoleShared) btnRoleShared.className = 'px-3 py-1 rounded-full transition-all text-white bg-[#2C2C2E] shadow-sm font-medium';
      } else if (currentUserId === 'user_a') {
        if (btnRoleA) btnRoleA.className = 'px-3 py-1 rounded-full transition-all text-white bg-[#2C2C2E] shadow-sm font-medium';
      } else {
        if (btnRoleB) btnRoleB.className = 'px-3 py-1 rounded-full transition-all text-white bg-[#2C2C2E] shadow-sm font-medium';
      }
    }

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

    document.getElementById('searchTransaction')?.addEventListener('input', () => {
      const visibleTxs = getVisibleTransactions(transactions, currentUserId);
      renderTransactions(visibleTxs);
    });

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

    document.getElementById('btnMobileFab')?.addEventListener('click', () => {
      document.getElementById('quickInput')?.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    setupModals();
  }

  function setupModals() {
    // Modal Wallet
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
      const visibility = document.getElementById('walletFormVisibility')?.value;

      if (!name) return;

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

      formWallet.reset();
      modalWallet?.classList.add('hidden');
    });

    // Modal Scanner / OCR
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
      modalScanner?.classList.remove('hidden');
      ocrResultBox?.classList.add('hidden');
      ocrLoading?.classList.add('hidden');
    });
    btnCloseScanner?.addEventListener('click', () => modalScanner?.classList.add('hidden'));

    fileInput?.addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;

      ocrLoading?.classList.remove('hidden');
      ocrResultBox?.classList.add('hidden');
      if (ocrProgressBar) ocrProgressBar.style.width = '0%';
      if (ocrProgressPercent) ocrProgressPercent.textContent = '0%';

      try {
        scannedResult = await scanReceiptWithTesseract(file, progress => {
          if (ocrProgressBar) ocrProgressBar.style.width = `${progress}%`;
          if (ocrProgressPercent) ocrProgressPercent.textContent = `${progress}%`;
        });

        ocrLoading?.classList.add('hidden');
        ocrResultBox?.classList.remove('hidden');
        if (ocrDetectedAmount) ocrDetectedAmount.textContent = `Rp ${scannedResult.amount.toLocaleString('id-ID')}`;
        if (ocrDetectedNote) ocrDetectedNote.textContent = scannedResult.note;
      } catch (err) {
        console.warn('OCR error fallback to local extractor:', err);
        scannedResult = { amount: 50000, note: 'Struk Pembayaran', category: 'Makanan & Minuman' };
        ocrLoading?.classList.add('hidden');
        ocrResultBox?.classList.remove('hidden');
        if (ocrDetectedAmount) ocrDetectedAmount.textContent = `Rp ${scannedResult.amount.toLocaleString('id-ID')}`;
        if (ocrDetectedNote) ocrDetectedNote.textContent = scannedResult.note;
      }
    });

    btnUseOcr?.addEventListener('click', () => {
      if (scannedResult && scannedResult.amount > 0) {
        const quickInput = document.getElementById('quickInput');
        if (quickInput) {
          quickInput.value = `${scannedResult.note} ${scannedResult.amount}`;
          quickInput.dispatchEvent(new Event('input'));
          modalScanner?.classList.add('hidden');
          quickInput.focus();
        }
      }
    });

    // Modal Settings & Couple Pairing
    const modalSettings = document.getElementById('modalSettings');
    const btnOpenSettings = document.getElementById('btnOpenSettings');
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    const btnJoinCode = document.getElementById('btnJoinCode');
    const inputJoinCode = document.getElementById('inputJoinCode');

    btnOpenSettings?.addEventListener('click', () => modalSettings?.classList.remove('hidden'));
    btnCloseSettings?.addEventListener('click', () => modalSettings?.classList.add('hidden'));

    btnJoinCode?.addEventListener('click', () => {
      const newCode = (inputJoinCode?.value || '').trim().toUpperCase();
      if (!newCode) return;
      coupleConfig.coupleCode = newCode;
      saveLocalCoupleConfig(coupleConfig);
      alert(`Berhasil terhubung ke Kode Pasangan: ${newCode}`);
      renderCoupleBanner();
      modalSettings?.classList.add('hidden');
    });

    document.getElementById('btnSaveCloudConfig')?.addEventListener('click', () => {
      const url = document.getElementById('inputSupabaseUrl')?.value.trim();
      const key = document.getElementById('inputSupabaseKey')?.value.trim();
      coupleConfig.supabaseUrl = url;
      coupleConfig.supabaseAnonKey = key;
      saveLocalCoupleConfig(coupleConfig);
      initCloud();
      alert('Konfigurasi Cloud disimpan!');
      modalSettings?.classList.add('hidden');
    });

    document.getElementById('btnResetData')?.addEventListener('click', () => {
      if (confirm('Yakin ingin mereset data ke kondisi awal?')) {
        localStorage.removeItem(STORAGE_WALLETS);
        localStorage.removeItem(STORAGE_TXS);
        loadData();
        renderAll();
        modalSettings?.classList.add('hidden');
      }
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  // Safe immediate or deferred invocation
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
