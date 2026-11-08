/**
 * DompetKu - Self-Contained App Bundle (Dompet Payment Admin Dashboard Edition)
 * Runs seamlessly on both file:/// (double-click) and http:// / https:// (web server & Vercel)
 * Features Apple Ecosystem Typography (New York Serif + San Francisco Sans), Multi-View SPA routing,
 * Real-Time Market & Investment Dashboard (IHSG, Gold, Crypto), PB1 Split Bill, Financial Calendar, and Dynamic Island HUD.
 */

(() => {
  'use strict';

  // ================= 0. MOTION ENGINE & APPLE MICRO-INTERACTIONS =================
  let hudTimer = null;
  let prevNetWorth = 0;
  let prevIncome = 0;
  let prevExpense = 0;
  let prevCoupleKas = 0;
  let prevMarketPortfolio = 0;

  function isReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function calculateRollingValue(startVal, endVal, progress) {
    const clamped = Math.max(0, Math.min(1, progress));
    if (clamped === 0) return startVal;
    if (clamped === 1) return endVal;
    const ease = 1 - Math.pow(2, -10 * clamped);
    return Math.round(startVal + (endVal - startVal) * ease);
  }

  function animateNumber(element, startVal, endVal, options = {}) {
    if (!element) return;
    const duration = options.duration || 450;
    const prefix = options.prefix !== undefined ? options.prefix : 'Rp ';
    const sign = options.sign || '';

    if (isReducedMotion() || startVal === endVal) {
      element.textContent = `${sign}${prefix}${Math.round(endVal).toLocaleString('id-ID')}`;
      return;
    }

    const startTime = performance.now();
    function frame(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const val = calculateRollingValue(startVal, endVal, progress);
      element.textContent = `${sign}${prefix}${val.toLocaleString('id-ID')}`;
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        element.textContent = `${sign}${prefix}${Math.round(endVal).toLocaleString('id-ID')}`;
      }
    }
    requestAnimationFrame(frame);
  }

  function showDynamicIslandHUD(iconName = 'check-circle', message = 'Berhasil disimpan', accentColor = '#00D2D3') {
    const hud = document.getElementById('dynamicIslandHUD');
    const hudIcon = document.getElementById('dynamicIslandIcon');
    const hudText = document.getElementById('dynamicIslandText');
    const hudTitle = document.getElementById('dynamicIslandTitle');
    if (!hud) return;

    if (hudIcon) {
      hudIcon.style.color = accentColor;
      hudIcon.style.backgroundColor = `${accentColor}25`;
      hudIcon.innerHTML = `<i data-lucide="${iconName}" class="w-4 h-4"></i>`;
    }

    if (hudTitle) {
      hudTitle.style.color = accentColor;
      hudTitle.textContent = 'Notifikasi Dompet';
    }

    if (hudText) {
      hudText.textContent = message;
    }

    if (window.lucide) window.lucide.createIcons();

    if (hudTimer) clearTimeout(hudTimer);

    hud.classList.add('hud-visible');

    hudTimer = setTimeout(() => {
      hud.classList.remove('hud-visible');
    }, 3200);
  }

  // ================= 1. STORE & PRIVACY ENGINE =================
  function createWallet({ id, ownerId = 'daniel', name, type = 'bank', balance = 0, color = '#00D2D3', icon = 'landmark' }) {
    return {
      id: id || `w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ownerId,
      name,
      type,
      balance: Number(balance) || 0,
      visibility: 'personal',
      color,
      icon
    };
  }

  function addTransaction(walletsList, tx) {
    const targetWallet = walletsList.find(w => w.id === tx.walletId);
    if (!targetWallet) return walletsList;

    const amt = Number(tx.amount) || 0;
    if (tx.type === 'income') {
      targetWallet.balance += amt;
    } else if (tx.type === 'expense') {
      targetWallet.balance -= amt;
    }

    return [...walletsList];
  }

  // ================= 2. INITIAL SEED MOCK DATA =================
  const INITIAL_WALLETS = [
    {
      id: 'w_bca_utama',
      ownerId: 'daniel',
      name: 'BCA Prioritas',
      type: 'bank',
      balance: 18450000,
      visibility: 'personal',
      color: '#00529B',
      icon: 'landmark'
    },
    {
      id: 'w_mandiri_tabungan',
      ownerId: 'daniel',
      name: 'Mandiri Tabungan',
      type: 'bank',
      balance: 8750000,
      visibility: 'personal',
      color: '#0070BA',
      icon: 'landmark'
    },
    {
      id: 'w_gopay',
      ownerId: 'daniel',
      name: 'GoPay Saldo',
      type: 'ewallet',
      balance: 680000,
      visibility: 'personal',
      color: '#00AED6',
      icon: 'smartphone'
    },
    {
      id: 'w_cash',
      ownerId: 'daniel',
      name: 'Dompet Tunai',
      type: 'cash',
      balance: 350000,
      visibility: 'personal',
      color: '#10B981',
      icon: 'banknote'
    }
  ];

  const INITIAL_TRANSACTIONS = [
    {
      id: 'tx_nov_1',
      walletId: 'w_bca_utama',
      createdBy: 'daniel',
      type: 'income',
      amount: 15000000,
      category: 'Gaji & Pendapatan',
      note: 'Gaji Bulanan Tech Corp',
      visibility: 'personal',
      date: '2026-11-01T09:00:00.000Z'
    },
    {
      id: 'tx_nov_2',
      walletId: 'w_bca_utama',
      createdBy: 'daniel',
      type: 'expense',
      amount: 650000,
      category: 'Belanja & Kebutuhan',
      note: 'Belanja Bulanan Superindo',
      visibility: 'personal',
      date: '2026-11-02T14:30:00.000Z'
    },
    {
      id: 'tx_nov_3',
      walletId: 'w_gopay',
      createdBy: 'daniel',
      type: 'expense',
      amount: 50000,
      category: 'Transportasi',
      note: 'Bensin Pertamax Motor',
      visibility: 'personal',
      date: '2026-11-03T08:15:00.000Z'
    },
    {
      id: 'tx_nov_4',
      walletId: 'w_gopay',
      createdBy: 'daniel',
      type: 'expense',
      amount: 42000,
      category: 'Makanan & Minuman',
      note: 'Kopi Kenangan & Roti Dbl',
      visibility: 'personal',
      date: '2026-11-04T10:45:00.000Z'
    },
    {
      id: 'tx_nov_5',
      walletId: 'w_bca_utama',
      createdBy: 'daniel',
      type: 'expense',
      amount: 480000,
      category: 'Tagihan & Utilitas',
      note: 'Tagihan Listrik PLN & IndiHome',
      visibility: 'personal',
      date: '2026-11-05T19:20:00.000Z'
    },
    {
      id: 'tx_nov_6',
      walletId: 'w_bca_utama',
      createdBy: 'daniel',
      type: 'expense',
      amount: 220000,
      category: 'Makanan & Minuman',
      note: 'Makan Malam Resto Senopati',
      visibility: 'personal',
      date: '2026-11-06T20:10:00.000Z'
    },
    {
      id: 'tx_nov_7',
      walletId: 'w_mandiri_tabungan',
      createdBy: 'daniel',
      type: 'income',
      amount: 3500000,
      category: 'Gaji & Pendapatan',
      note: 'Bonus Proyek Freelance App',
      visibility: 'personal',
      date: '2026-11-07T16:00:00.000Z'
    },
    {
      id: 'tx_nov_8',
      walletId: 'w_cash',
      createdBy: 'daniel',
      type: 'expense',
      amount: 35000,
      category: 'Makanan & Minuman',
      note: 'Makan Siang Nasi Padang',
      visibility: 'personal',
      date: '2026-11-08T12:30:00.000Z'
    },
    {
      id: 'tx_nov_9',
      walletId: 'w_gopay',
      createdBy: 'daniel',
      type: 'expense',
      amount: 22000,
      category: 'Transportasi',
      note: 'Gojek ke Stasiun Sudirman',
      visibility: 'personal',
      date: '2026-11-08T13:10:00.000Z'
    }
  ];

  // ================= 3. MARKET & INVESTMENT INSTRUMENTS =================
  const INITIAL_MARKET_INSTRUMENTS = [
    {
      symbol: 'IHSG',
      name: 'Indeks Saham Gabungan',
      category: 'stock',
      priceIDR: 7285.40,
      change24h: 0.42,
      high24h: 7310.20,
      low24h: 7260.10,
      sparkline: [7265, 7272, 7268, 7290, 7280, 7295, 7285.4],
      icon: 'activity',
      badge: 'IDX'
    },
    {
      symbol: 'BBCA',
      name: 'Bank Central Asia Tbk',
      category: 'stock',
      priceIDR: 10250,
      change24h: 1.23,
      high24h: 10300,
      low24h: 10125,
      sparkline: [10150, 10175, 10200, 10175, 10225, 10275, 10250],
      icon: 'building-2',
      badge: 'Saham'
    },
    {
      symbol: 'BBRI',
      name: 'Bank Rakyat Indonesia Tbk',
      category: 'stock',
      priceIDR: 4680,
      change24h: -0.64,
      high24h: 4740,
      low24h: 4650,
      sparkline: [4720, 4710, 4730, 4700, 4670, 4660, 4680],
      icon: 'landmark',
      badge: 'Saham'
    },
    {
      symbol: 'BMRI',
      name: 'Bank Mandiri (Persero) Tbk',
      category: 'stock',
      priceIDR: 6550,
      change24h: 0.77,
      high24h: 6600,
      low24h: 6475,
      sparkline: [6500, 6525, 6500, 6550, 6525, 6575, 6550],
      icon: 'landmark',
      badge: 'Saham'
    },
    {
      symbol: 'TLKM',
      name: 'Telkom Indonesia Tbk',
      category: 'stock',
      priceIDR: 2820,
      change24h: -1.05,
      high24h: 2870,
      low24h: 2800,
      sparkline: [2860, 2850, 2840, 2830, 2810, 2830, 2820],
      icon: 'radio',
      badge: 'Saham'
    },
    {
      symbol: 'ASII',
      name: 'Astra International Tbk',
      category: 'stock',
      priceIDR: 5050,
      change24h: 0.50,
      high24h: 5125,
      low24h: 5000,
      sparkline: [5025, 5000, 5050, 5075, 5025, 5075, 5050],
      icon: 'car',
      badge: 'Saham'
    },
    {
      symbol: 'ANTAM',
      name: 'Emas Batangan Antam',
      category: 'gold',
      priceIDR: 1485000,
      unit: 'gram',
      change24h: 0.68,
      high24h: 1490000,
      low24h: 1478000,
      sparkline: [1475000, 1478000, 1480000, 1482000, 1486000, 1484000, 1485000],
      icon: 'coins',
      badge: 'Logam Mulia'
    },
    {
      symbol: 'XAU',
      name: 'Spot Gold Dunia',
      category: 'gold',
      priceUSD: 2684.50,
      priceIDR: 42549325,
      unit: 'oz',
      change24h: 0.85,
      high24h: 2692.00,
      low24h: 2668.20,
      sparkline: [2670, 2675, 2672, 2680, 2688, 2682, 2684.5],
      icon: 'gem',
      badge: 'XAU/USD'
    },
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      category: 'crypto',
      priceUSD: 96425,
      priceIDR: 1542800000,
      change24h: 3.15,
      high24h: 97200,
      low24h: 93400,
      sparkline: [93800, 94500, 95100, 94800, 96000, 96800, 96425],
      icon: 'circle-dollar-sign',
      badge: 'Crypto'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      category: 'crypto',
      priceUSD: 3410,
      priceIDR: 54560000,
      change24h: 2.40,
      high24h: 3480,
      low24h: 3310,
      sparkline: [3320, 3360, 3390, 3370, 3430, 3450, 3410],
      icon: 'layers',
      badge: 'Crypto'
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      category: 'crypto',
      priceUSD: 220,
      priceIDR: 3520000,
      change24h: 5.80,
      high24h: 228,
      low24h: 206,
      sparkline: [208, 212, 215, 218, 225, 222, 220],
      icon: 'zap',
      badge: 'Crypto'
    },
    {
      symbol: 'BNB',
      name: 'BNB Chain',
      category: 'crypto',
      priceUSD: 645,
      priceIDR: 10320000,
      change24h: 1.10,
      high24h: 655,
      low24h: 638,
      sparkline: [640, 642, 641, 646, 648, 644, 645],
      icon: 'shield',
      badge: 'Crypto'
    },
    {
      symbol: 'XRP',
      name: 'Ripple',
      category: 'crypto',
      priceUSD: 2.30,
      priceIDR: 36800,
      change24h: 4.25,
      high24h: 2.45,
      low24h: 2.18,
      sparkline: [2.20, 2.24, 2.28, 2.25, 2.35, 2.32, 2.30],
      icon: 'repeat',
      badge: 'Crypto'
    }
  ];

  // Sample personal asset portfolio holdings for Daniel (Feature 1B)
  const INITIAL_HOLDINGS = [
    { id: 'hold_1', symbol: 'ANTAM', type: 'gold', units: 15, buyPrice: 1410000 },
    { id: 'hold_2', symbol: 'BBCA', type: 'stock', units: 25, buyPrice: 9850 },
    { id: 'hold_3', symbol: 'BTC', type: 'crypto', units: 0.035, buyPrice: 1350000000 },
    { id: 'hold_4', symbol: 'ETH', type: 'crypto', units: 0.75, buyPrice: 48000000 }
  ];

  function calculateAssetValuation({ type, units, buyPrice, currentPrice }) {
    const numUnits = Number(units) || 0;
    const numBuyPrice = Number(buyPrice) || 0;
    const numCurrentPrice = Number(currentPrice) || 0;

    let multiplier = 1;
    if (type === 'stock') multiplier = 100; // 1 lot = 100 shares

    const totalCost = numUnits * multiplier * numBuyPrice;
    const currentValue = numUnits * multiplier * numCurrentPrice;
    const pnlNominal = currentValue - totalCost;
    const pnlPercentage = totalCost > 0 ? (pnlNominal / totalCost) * 100 : 0;

    return { totalCost, currentValue, pnlNominal, pnlPercentage };
  }

  function calculatePortfolioSummary(holdingsList = [], priceMap = {}) {
    let totalCost = 0;
    let totalValuation = 0;

    holdingsList.forEach(holding => {
      const curPrice = priceMap[holding.symbol] !== undefined ? priceMap[holding.symbol] : holding.buyPrice;
      const val = calculateAssetValuation({
        type: holding.type,
        units: holding.units,
        buyPrice: holding.buyPrice,
        currentPrice: curPrice
      });
      totalCost += val.totalCost;
      totalValuation += val.currentValue;
    });

    const totalPnlNominal = totalValuation - totalCost;
    const totalPnlPercentage = totalCost > 0 ? (totalPnlNominal / totalCost) * 100 : 0;

    return { totalCost, totalValuation, totalPnlNominal, totalPnlPercentage };
  }

  function generateNextTick(currentPrice, volatility = 0.0015) {
    const deltaFactor = 1 + (Math.random() * 2 - 1) * volatility;
    const newPrice = currentPrice * deltaFactor;
    if (newPrice > 1000) return Math.round(newPrice);
    if (newPrice > 10) return Math.round(newPrice * 100) / 100;
    return Math.round(newPrice * 1000) / 1000;
  }

  // ================= 3B. SAVINGS & FINANCIAL GOALS ENGINE =================
  const INITIAL_SAVINGS_TEMPLATES = [
    {
      id: 'goal_darurat',
      name: 'Dana Darurat 6 Bulan',
      category: 'darurat',
      categoryLabel: 'Darurat & Proteksi',
      target: 30000000,
      current: 18000000,
      targetDate: '2027-12-31',
      isLocked: true,
      color: '#00D2D3',
      icon: 'shield-check',
      note: 'Pos dana darurat untuk 6 bulan pengeluaran rutin'
    },
    {
      id: 'goal_liburan',
      name: 'Liburan Akhir Tahun (Jepang)',
      category: 'liburan',
      categoryLabel: 'Liburan & Traveling',
      target: 15000000,
      current: 7500000,
      targetDate: '2026-12-25',
      isLocked: false,
      color: '#FF9F43',
      icon: 'plane',
      note: 'Tiket & akomodasi liburan musim dingin ke Tokyo'
    },
    {
      id: 'goal_gadget',
      name: 'Upgrade MacBook Pro M-Series',
      category: 'gadget',
      categoryLabel: 'Gadget & Hobi',
      target: 25000000,
      current: 12000000,
      targetDate: '2027-04-30',
      isLocked: true,
      color: '#54A0FF',
      icon: 'laptop',
      note: 'Upgrade mesin tempur kerja & produktivitas Daniel'
    },
    {
      id: 'goal_properti',
      name: 'DP Rumah / Properti',
      category: 'properti',
      categoryLabel: 'Investasi & Aset Besar',
      target: 100000000,
      current: 35000000,
      targetDate: '2028-12-31',
      isLocked: true,
      color: '#10B981',
      icon: 'home',
      note: 'Akumulasi DP rumah pertama di kawasan strategis'
    }
  ];

  function calculateGoalProgress(current, target) {
    const cur = Math.max(0, Number(current) || 0);
    const tgt = Math.max(0, Number(target) || 0);

    if (tgt <= 0) {
      return { percentage: 100, remainingNominal: 0, isCompleted: true };
    }

    const rawPct = (cur / tgt) * 100;
    const percentage = Math.min(100, Math.round(rawPct * 10) / 10);
    const remainingNominal = Math.max(0, tgt - cur);

    return {
      percentage,
      remainingNominal,
      isCompleted: cur >= tgt
    };
  }

  function calculateMonthlySavingsVelocity(remainingNominal, targetDateInput, fromDateInput = new Date()) {
    const rem = Math.max(0, Number(remainingNominal) || 0);
    if (rem <= 0) {
      return { monthsRemaining: 0, daysRemaining: 0, monthlyAmount: 0, dailyAmount: 0, isOverdue: false };
    }

    const fromDate = fromDateInput instanceof Date ? fromDateInput : new Date(fromDateInput);
    const targetDate = targetDateInput instanceof Date ? targetDateInput : new Date(targetDateInput);

    const diffMs = targetDate.getTime() - fromDate.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { monthsRemaining: 0, daysRemaining: 0, monthlyAmount: rem, dailyAmount: rem, isOverdue: true };
    }

    const monthsRemaining = Math.max(1, Math.round(diffDays / 30.4375));
    const monthlyAmount = Math.ceil(rem / monthsRemaining);
    const dailyAmount = Math.ceil(rem / diffDays);

    return {
      monthsRemaining,
      daysRemaining: diffDays,
      monthlyAmount,
      dailyAmount,
      isOverdue: false
    };
  }

  function depositToGoal(goals, walletsList, { goalId, walletId, amount, date = new Date().toISOString() }) {
    const amt = Number(amount);
    if (!amt || amt <= 0) return { success: false, error: 'NOMINAL_INVALID' };

    const walletIndex = (walletsList || []).findIndex(w => w.id === walletId);
    if (walletIndex === -1) return { success: false, error: 'WALLET_TIDAK_DITEMUKAN' };

    const goalIndex = (goals || []).findIndex(g => g.id === goalId);
    if (goalIndex === -1) return { success: false, error: 'GOAL_TIDAK_DITEMUKAN' };

    const wallet = walletsList[walletIndex];
    if (wallet.balance < amt) return { success: false, error: 'SALDO_TIDAK_CUKUP' };

    const goal = goals[goalIndex];

    const updatedWallets = walletsList.map((w, idx) => {
      if (idx === walletIndex) {
        return { ...w, balance: w.balance - amt };
      }
      return w;
    });

    const updatedGoals = goals.map((g, idx) => {
      if (idx === goalIndex) {
        return { ...g, current: (g.current || 0) + amt };
      }
      return g;
    });

    const transaction = {
      id: 'tx_sav_dep_' + Date.now(),
      date: typeof date === 'string' ? date.split('T')[0] : new Date(date).toISOString().split('T')[0],
      amount: amt,
      type: 'expense',
      category: 'Tabungan',
      walletId: wallet.id,
      walletName: wallet.name,
      targetGoalId: goal.id,
      targetGoalName: goal.name,
      description: `Setoran Tabungan: ${goal.name}`,
      createdAt: new Date().toISOString()
    };

    return { success: true, updatedWallets, updatedGoals, transaction };
  }

  function withdrawFromGoal(goals, walletsList, { goalId, walletId, amount, forceOverride = false, currentDate = new Date(), date = new Date().toISOString() }) {
    const amt = Number(amount);
    if (!amt || amt <= 0) return { success: false, error: 'NOMINAL_INVALID' };

    const goalIndex = (goals || []).findIndex(g => g.id === goalId);
    if (goalIndex === -1) return { success: false, error: 'GOAL_TIDAK_DITEMUKAN' };

    const walletIndex = (walletsList || []).findIndex(w => w.id === walletId);
    if (walletIndex === -1) return { success: false, error: 'WALLET_TIDAK_DITEMUKAN' };

    const goal = goals[goalIndex];
    if ((goal.current || 0) < amt) return { success: false, error: 'SALDO_TABUNGAN_TIDAK_CUKUP' };

    if (goal.isLocked && !forceOverride) {
      const now = currentDate instanceof Date ? currentDate : new Date(currentDate);
      const target = goal.targetDate ? new Date(goal.targetDate) : null;
      if (target && now < target) {
        return {
          success: false,
          requiresConfirmation: true,
          error: 'GOAL_LOCKED',
          message: `Pos impian "${goal.name}" sedang dikunci sampai ${goal.targetDate}. Menarik dana sebelum target tercapai dapat menghambat rencana keuanganmu.`
        };
      }
    }

    const updatedGoals = goals.map((g, idx) => {
      if (idx === goalIndex) {
        return { ...g, current: (g.current || 0) - amt };
      }
      return g;
    });

    const updatedWallets = walletsList.map((w, idx) => {
      if (idx === walletIndex) {
        return { ...w, balance: w.balance + amt };
      }
      return w;
    });

    const transaction = {
      id: 'tx_sav_wd_' + Date.now(),
      date: typeof date === 'string' ? date.split('T')[0] : new Date(date).toISOString().split('T')[0],
      amount: amt,
      type: 'income',
      category: 'Pencairan Tabungan',
      walletId: walletsList[walletIndex].id,
      walletName: walletsList[walletIndex].name,
      fromGoalId: goal.id,
      fromGoalName: goal.name,
      description: `Pencairan Tabungan: ${goal.name}`,
      createdAt: new Date().toISOString()
    };

    return { success: true, updatedWallets, updatedGoals, transaction };
  }

  // ================= 4. NATURAL LANGUAGE QUICK PARSER =================
  function parseQuickInput(text, walletsList, defaultWalletId) {
    if (!text || typeof text !== 'string') {
      return { amount: 0, category: 'Lainnya', note: '', walletId: defaultWalletId };
    }

    const trimmed = text.trim();
    let amount = 0;
    let category = 'Makanan & Minuman';
    let targetWalletId = defaultWalletId;

    const multiplierMatch = trimmed.match(/(\d+(?:[.,]\d+)?)\s*(k|rb|ribu|jt|juta)\b/i);
    if (multiplierMatch) {
      const numStr = multiplierMatch[1].replace(',', '.');
      const unit = multiplierMatch[2].toLowerCase();
      const num = parseFloat(numStr);

      if (unit === 'k' || unit === 'rb' || unit === 'ribu') {
        amount = Math.round(num * 1000);
      } else if (unit === 'jt' || unit === 'juta') {
        amount = Math.round(num * 1000000);
      }
    } else {
      const plainNumMatch = trimmed.match(/(?:rp\.?\s*)?(\d{1,3}(?:\.\d{3})+|\d+)(?:\b|$)/i);
      if (plainNumMatch) {
        amount = parseInt(plainNumMatch[1].replace(/\./g, ''), 10);
      }
    }

    const lower = trimmed.toLowerCase();
    if (lower.match(/\b(makan|kopi|minum|sarapan|siang|malam|cafe|bakso|ayam|mie|snack|resto|food|burger|pizza)\b/)) {
      category = 'Makanan & Minuman';
    } else if (lower.match(/\b(gojek|grab|bensin|pertamax|parkir|toll|kereta|mrt|busway|ojol|transport)\b/)) {
      category = 'Transportasi';
    } else if (lower.match(/\b(beli|belanja|baju|sepatu|tokped|shopee|lazada|mall|supermarket|indomaret|alfamart)\b/)) {
      category = 'Belanja & Kebutuhan';
    } else if (lower.match(/\b(listrik|pln|pdam|air|wifi|indihome|pulsa|paket data|tagihan|bpjs|sewa|iuran)\b/)) {
      category = 'Tagihan & Utilitas';
    } else if (lower.match(/\b(nonton|bioskop|xxi|game|steam|liburan|hotel|wisata|karaoke)\b/)) {
      category = 'Hiburan & Rekreasi';
    } else if (lower.match(/\b(gaji|bonus|transfer|income|pendapatan|dividen|freelance)\b/)) {
      category = 'Gaji & Pendapatan';
    }

    if (walletsList && walletsList.length > 0) {
      for (const w of walletsList) {
        const wName = (w.name || '').toLowerCase();
        if (lower.includes(wName) || (wName.includes('bca') && lower.includes('bca')) || (wName.includes('gopay') && lower.includes('gopay')) || (wName.includes('cash') && lower.includes('tunai'))) {
          targetWalletId = w.id;
          break;
        }
      }
    }

    let cleanNote = trimmed
      .replace(/(\d+(?:[.,]\d+)?)\s*(k|rb|ribu|jt|juta)\b/gi, '')
      .replace(/(?:rp\.?\s*)?(\d{1,3}(?:\.\d{3})+|\d+)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanNote) cleanNote = category;

    return { amount, category, note: cleanNote, walletId: targetWalletId };
  }

  // ================= 5. CHARTS CONTROLLER =================
  let donutChartInstance = null;
  let barChartInstance = null;

  function updateDonutChart(canvas, txList) {
    if (!canvas || !window.Chart) return;

    const catSums = {};
    txList.filter(t => t.type === 'expense').forEach(t => {
      const cat = t.category || 'Lainnya';
      catSums[cat] = (catSums[cat] || 0) + Number(t.amount);
    });

    const labels = Object.keys(catSums);
    const data = Object.values(catSums);

    if (labels.length === 0) {
      labels.push('Makanan & Minuman', 'Transportasi', 'Belanja', 'Tagihan');
      data.push(420000, 180000, 650000, 480000);
    }

    const colors = ['#00D2D3', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6'];

    if (donutChartInstance) donutChartInstance.destroy();

    const ctx = canvas.getContext('2d');
    donutChartInstance = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: Rp ${Number(ctx.raw).toLocaleString('id-ID')}`
            }
          }
        }
      }
    });
  }

  function updateBarChart(canvas, txList) {
    if (!canvas || !window.Chart) return;

    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const incomeData = [0, 0, 0, 0, 0, 0, 0];
    const expenseData = [0, 0, 0, 0, 0, 0, 0];

    txList.forEach(t => {
      const d = new Date(t.date);
      const dayIdx = d.getDay();
      if (t.type === 'income') incomeData[dayIdx] += Number(t.amount);
      else expenseData[dayIdx] += Number(t.amount);
    });

    if (barChartInstance) barChartInstance.destroy();

    const ctx = canvas.getContext('2d');
    barChartInstance = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          { label: 'Income', data: incomeData, backgroundColor: '#10B981', borderRadius: 6 },
          { label: 'Expense', data: expenseData, backgroundColor: '#FF3B30', borderRadius: 6 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: Rp ${Number(ctx.raw).toLocaleString('id-ID')}`
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#8E8E93', font: { size: 10 } } },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: {
              color: '#8E8E93',
              font: { size: 9 },
              callback: val => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
            }
          }
        }
      }
    });
  }

  // ================= 6. FINANCIAL CALENDAR ENGINE =================
  function aggregateTransactionsByDate(transactionsList) {
    const daily = {};
    transactionsList.forEach(t => {
      if (!t.date) return;
      const dateKey = t.date.split('T')[0];
      if (!daily[dateKey]) daily[dateKey] = { income: 0, expense: 0, count: 0 };
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') daily[dateKey].income += amt;
      else daily[dateKey].expense += amt;
      daily[dateKey].count += 1;
    });
    return daily;
  }

  function getMonthCalendarDays(year, monthIndex) {
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const totalDays = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];
    for (let p = 0; p < startDayOfWeek; p++) {
      days.push({ dayNumber: null, dateString: null, isPadding: true });
    }

    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(monthIndex + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      days.push({
        dayNumber: d,
        dateString: `${year}-${monthStr}-${dayStr}`,
        isPadding: false
      });
    }

    return days;
  }

  // ================= 7. SMART SPLIT BILL ENGINE =================
  function calculateSplitBill({ items = [], participants = [], servicePercent = 5, taxPercent = 10 }) {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * (Number(item.quantity) || 1)), 0);
    const serviceCharge = Math.round(subtotal * (servicePercent / 100));
    const taxableAmount = subtotal + serviceCharge;
    const tax = Math.round(taxableAmount * (taxPercent / 100));
    const grandTotal = subtotal + serviceCharge + tax;

    const breakdown = {};
    participants.forEach(p => {
      breakdown[p] = { name: p, items: [], itemSubtotal: 0, serviceCharge: 0, tax: 0, totalOwed: 0 };
    });

    items.forEach(item => {
      const itemTotal = Number(item.price || 0) * (Number(item.quantity) || 1);
      const assigned = item.assignedTo && item.assignedTo.length > 0 ? item.assignedTo : participants;
      const sharePerPerson = itemTotal / assigned.length;

      assigned.forEach(p => {
        if (!breakdown[p]) {
          breakdown[p] = { name: p, items: [], itemSubtotal: 0, serviceCharge: 0, tax: 0, totalOwed: 0 };
        }
        breakdown[p].items.push({ name: item.name, share: Math.round(sharePerPerson) });
        breakdown[p].itemSubtotal += sharePerPerson;
      });
    });

    participants.forEach(p => {
      const pData = breakdown[p];
      if (pData) {
        pData.itemSubtotal = Math.round(pData.itemSubtotal);
        pData.serviceCharge = Math.round(pData.itemSubtotal * (servicePercent / 100));
        pData.tax = Math.round((pData.itemSubtotal + pData.serviceCharge) * (taxPercent / 100));
        pData.totalOwed = pData.itemSubtotal + pData.serviceCharge + pData.tax;
      }
    });

    return { subtotal, servicePercent, serviceCharge, taxPercent, tax, grandTotal, breakdown };
  }

  function formatWhatsAppBillSummary({ splitResult, bankAccount = '', placeName = 'Resto / Cafe' }) {
    const { subtotal, servicePercent, serviceCharge, taxPercent, tax, grandTotal, breakdown } = splitResult;

    const lines = [
      `🧾 *Rincian Split Bill: ${placeName}*`,
      `📅 ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`,
      '────────────────────────────',
      ...Object.values(breakdown).map(p => {
        const itemsList = p.items.map(it => it.name).join(', ') || 'Menu';
        return `👤 *${p.name}:* Rp ${p.totalOwed.toLocaleString('id-ID')}\n   ↳ _(${itemsList})_`;
      }),
      '────────────────────────────',
      `Subtotal: Rp ${subtotal.toLocaleString('id-ID')}`,
      `Service (${servicePercent}%): Rp ${serviceCharge.toLocaleString('id-ID')}`,
      `PB1 / Resto Tax (${taxPercent}%): Rp ${tax.toLocaleString('id-ID')}`,
      `*Total Tagihan:* Rp ${grandTotal.toLocaleString('id-ID')}`
    ];

    if (bankAccount) {
      lines.push('────────────────────────────');
      lines.push(`💳 *Transfer ke:*\n${bankAccount}`);
    }

    lines.push('────────────────────────────');
    lines.push('✨ _Dihitung otomatis via DompetKu Smart Splitter_');

    return lines.join('\n');
  }

  // ================= 8. APP CONTROLLER & MULTI-VIEW SPA =================
  let currentView = 'dashboard';
  let selectedCalendarDate = null;
  let userName = localStorage.getItem('dompetku_username') || 'Daniel';

  let wallets = [];
  let transactions = [];
  let marketInstruments = [...INITIAL_MARKET_INSTRUMENTS];
  let personalHoldings = [];
  let currentMarketFilter = 'all';
  let tickerStreamTimer = null;

  let savingsGoals = [];
  let currentSavingsFilter = 'all';
  let pendingWithdrawalData = null;
  let currentTheme = localStorage.getItem('dompetku_theme') || 'dark';
  let prevSavingsTotal = 0;

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
  const STORAGE_HOLDINGS = 'dompetku_market_portfolio_v2';
  const STORAGE_SAVINGS = 'dompetku_savings_goals_v2';
  const STORAGE_THEME = 'dompetku_theme';

  function initApp() {
    initTheme();
    loadData();
    updateUserProfileDisplay();
    setupEventListeners();
    setupRouting();
    setupSavingsEvents();
    renderAll();
    startRealTimeMarketEngine();
    switchView('dashboard');
    if (window.lucide) window.lucide.createIcons();
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

  function initTheme() {
    currentTheme = localStorage.getItem(STORAGE_THEME) || 'dark';
    applyTheme(currentTheme, false);
  }

  function toggleTheme() {
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

    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
      themeIcon.className = theme === 'dark' ? 'w-4 h-4 text-amber-400' : 'w-4 h-4 text-indigo-500';
    }

    const settingsIcon = document.getElementById('settingsThemeIcon');
    const settingsText = document.getElementById('settingsThemeText');
    if (settingsIcon) settingsIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    if (settingsText) settingsText.textContent = theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap';

    if (window.lucide) window.lucide.createIcons();

    if (showToast) {
      const label = theme === 'dark' ? 'Mode Gelap (Space Gray)' : 'Mode Terang (Apple Light)';
      showDynamicIslandHUD(theme === 'dark' ? 'moon' : 'sun', `Tema Diubah: ${label}`, '#00D2D3');
    }
  }

  function updateUserProfileDisplay() {
    const greetingEl = document.getElementById('sidebarUserName');
    if (greetingEl) greetingEl.textContent = `Hi, ${userName}`;
    const nameInput = document.getElementById('settingInputUserName');
    if (nameInput) nameInput.value = userName;
  }

  // SPA VIEW SWITCHER
  function switchView(viewName) {
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
    if (headerTitle) {
      headerTitle.textContent = titles[viewName] || 'Dashboard';
    }

    // Sidebar active pill styling
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

    // Mobile bottom tab active styling
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

    // View specific renders
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

        // Auto close mobile sidebar on navigation
        const sidebar = document.getElementById('sidebarNav');
        const backdrop = document.getElementById('sidebarBackdrop');
        sidebar?.classList.add('-translate-x-full');
        backdrop?.classList.add('hidden');
      });
    });

    document.getElementById('btnOpenSettings')?.addEventListener('click', () => switchView('settings'));
  }

  function renderAll() {
    renderDashboard();
    renderMyWalletScreen();
    renderCalendar();
    renderTransactions(transactions);
    renderSplitBill();
    renderMarketDashboard();
    renderSavingsDashboard();
  }

  // ================= VIEW 1: DASHBOARD =================
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

  // ================= VIEW 2: MY WALLET SCREEN =================
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
              <span class="font-pill text-[10px] uppercase tracking-wider text-white/60 block">Saldo Rekening</span>
              <span class="font-headline text-2xl font-bold text-white tracking-tight">
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

  // ================= VIEW 3: TRANSACTIONS & CALENDAR SCREEN =================
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

  // ================= VIEW 4: SMART SPLIT BILL =================
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

  // ================= VIEW 5: DEDICATED MARKET & INVESTMENT DASHBOARD =================
  function getMarketPriceMap() {
    const map = {};
    marketInstruments.forEach(inst => {
      map[inst.symbol] = inst.priceIDR;
    });
    return map;
  }

  function renderMarketDashboard() {
    const priceMap = getMarketPriceMap();
    const portfolioSummary = calculatePortfolioSummary(personalHoldings, priceMap);

    // KPI 1: Total Portfolio Value
    const kpiPortVal = document.getElementById('marketKpiTotalPortfolio');
    if (kpiPortVal) {
      animateNumber(kpiPortVal, prevMarketPortfolio, portfolioSummary.totalValuation, { duration: 400 });
      prevMarketPortfolio = portfolioSummary.totalValuation;
    }

    // KPI 2: Total Unrealized PnL
    const kpiPnl = document.getElementById('marketKpiTotalPnl');
    const kpiPnlPercent = document.getElementById('marketKpiPnlPercent');
    if (kpiPnl) {
      const isProf = portfolioSummary.totalPnlNominal >= 0;
      kpiPnl.className = `font-headline text-2xl sm:text-3xl font-bold tracking-tight ${isProf ? 'text-[#10B981]' : 'text-[#EF4444]'}`;
      kpiPnl.textContent = `${isProf ? '+' : ''}Rp ${Math.round(portfolioSummary.totalPnlNominal).toLocaleString('id-ID')}`;
    }
    if (kpiPnlPercent) {
      const isProf = portfolioSummary.totalPnlNominal >= 0;
      kpiPnlPercent.className = `font-amount font-mono text-[11px] font-semibold block mt-2 ${isProf ? 'text-[#10B981]' : 'text-[#EF4444]'}`;
      kpiPnlPercent.textContent = `${isProf ? '+' : ''}${portfolioSummary.totalPnlPercentage.toFixed(2)}% dari modal`;
    }

    // KPI 3: Top Gainer
    const kpiTopGainer = document.getElementById('marketKpiTopGainer');
    if (kpiTopGainer) {
      const sortedGainers = [...marketInstruments].sort((a, b) => b.change24h - a.change24h);
      const top = sortedGainers[0];
      if (top) {
        kpiTopGainer.textContent = `${top.symbol} +${top.change24h.toFixed(2)}%`;
      }
    }

    // KPI 4: Gold Antam
    const kpiGoldRate = document.getElementById('marketKpiGoldRate');
    if (kpiGoldRate) {
      const antam = marketInstruments.find(i => i.symbol === 'ANTAM');
      if (antam) {
        kpiGoldRate.textContent = `Rp ${antam.priceIDR.toLocaleString('id-ID')}/g`;
      }
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
      card.className = 'dompet-card rounded-3xl p-5 space-y-4 border border-white/5 hover:border-white/20 transition-all';

      // Generate SVG Sparkline polyline points (width 120, height 36)
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

      const usdNote = item.priceUSD ? `<span class="text-[11px] text-[#8E8E93] font-mono block">$${item.priceUSD.toLocaleString('en-US')}</span>` : '';

      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-2xl bg-[#13141F] border border-white/10 flex items-center justify-center text-[#00D2D3] shrink-0">
              <i data-lucide="${item.icon || 'trending-up'}" class="w-4 h-4"></i>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-bold text-white text-xs tracking-tight">${item.symbol}</span>
                <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/5 text-[#8E8E93] uppercase">${item.badge || item.category}</span>
              </div>
              <p class="text-[11px] text-[#8E8E93] truncate max-w-[140px]">${item.name}</p>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded-lg text-[11px] font-bold font-mono ${isUp ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#FF3B30]/20 text-[#FF3B30]'}">
            ${isUp ? '+' : ''}${item.change24h.toFixed(2)}%
          </span>
        </div>

        <div class="flex items-end justify-between pt-1">
          <div>
            <span class="font-pill text-[10px] text-[#8E8E93] uppercase tracking-wider block">Harga Real-Time</span>
            <span id="price_display_${item.symbol}" class="font-amount text-xl font-bold text-white tracking-tight font-mono tabular-nums transition-colors">
              ${formattedPrice}
            </span>
            ${usdNote}
          </div>

          <!-- Sparkline SVG Trend -->
          <div class="w-28 h-9 shrink-0 flex items-center justify-end">
            <svg class="w-full h-full overflow-visible" viewBox="0 0 120 36">
              <polyline
                fill="none"
                stroke="${isUp ? '#10B981' : '#FF3B30'}"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                points="${svgPts}"
              />
            </svg>
          </div>
        </div>

        <div class="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#8E8E93] font-mono">
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
          <span class="text-[10px] text-[#8E8E93] uppercase">${h.type}</span>
        </td>
        <td class="py-3 px-3 font-mono text-slate-200">${unitLabel}</td>
        <td class="py-3 px-3 font-mono text-[#8E8E93]">Rp ${Number(h.buyPrice).toLocaleString('id-ID')}</td>
        <td class="py-3 px-3 font-mono text-white">Rp ${Number(curPrice).toLocaleString('id-ID')}</td>
        <td class="py-3 px-3 font-mono font-bold text-white">Rp ${Math.round(val.currentValue).toLocaleString('id-ID')}</td>
        <td class="py-3 px-3 font-mono font-bold ${isProf ? 'text-[#10B981]' : 'text-[#FF3B30]'}">
          ${isProf ? '+' : ''}Rp ${Math.round(val.pnlNominal).toLocaleString('id-ID')} (${isProf ? '+' : ''}${val.pnlPercentage.toFixed(2)}%)
        </td>
        <td class="py-3 px-3 text-center">
          <button data-delete-holding="${idx}" class="p-1.5 rounded-lg text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors cursor-pointer" title="Hapus">
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

  // REAL-TIME STREAMING & LIVE JITTER ENGINE
  function startRealTimeMarketEngine() {
    // Attempt live fetch from public CORS-friendly endpoint
    fetchLiveCryptoPrices();

    if (tickerStreamTimer) clearInterval(tickerStreamTimer);

    // Live tick every 3.5s for real-time market action
    tickerStreamTimer = setInterval(() => {
      // Pick 2-4 random instruments to tick
      const count = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const randIdx = Math.floor(Math.random() * marketInstruments.length);
        const inst = marketInstruments[randIdx];

        const oldPrice = inst.priceIDR;
        const newPrice = generateNextTick(oldPrice, 0.0018);
        const diff = newPrice - oldPrice;
        inst.priceIDR = newPrice;

        // Update high / low
        if (newPrice > inst.high24h) inst.high24h = newPrice;
        if (newPrice < inst.low24h) inst.low24h = newPrice;

        // Push to sparkline
        inst.sparkline.push(newPrice);
        if (inst.sparkline.length > 8) inst.sparkline.shift();

        // If on Market screen, apply visible flash micro-animation
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

      // Re-render market KPI totals smoothly if on market view
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
        const mapping = {
          'BTC': 'bitcoin',
          'ETH': 'ethereum',
          'SOL': 'solana',
          'BNB': 'binancecoin',
          'XRP': 'ripple'
        };

        Object.entries(mapping).forEach(([sym, cgKey]) => {
          if (data[cgKey]) {
            const inst = marketInstruments.find(i => i.symbol === sym);
            if (inst) {
              inst.priceIDR = data[cgKey].idr;
              inst.priceUSD = data[cgKey].usd;
              if (data[cgKey].idr_24h_change !== undefined) {
                inst.change24h = data[cgKey].idr_24h_change;
              }
            }
          }
        });

        if (currentView === 'market') renderMarketDashboard();
      }
    } catch (err) {
      // Graceful offline / zero-CORS fallback
      console.log('Real-time live network fallback active (offline/file protocol resilient)');
    }
  }

  // ================= 9. EVENT LISTENERS =================
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
    document.getElementById('btnSettingsThemeToggle')?.addEventListener('click', toggleTheme);

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
            el?.classList.add('bg-[#00D2D3]/15', 'text-[#00D2D3]', 'font-semibold', 'border-[#00D2D3]/30');
            el?.classList.remove('bg-[#1E1E2D]', 'text-[#8E8E93]', 'border-white/5');
          } else {
            el?.classList.remove('bg-[#00D2D3]/15', 'text-[#00D2D3]', 'font-semibold', 'border-[#00D2D3]/30');
            el?.classList.add('bg-[#1E1E2D]', 'text-[#8E8E93]', 'border-white/5');
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

    // Split Bill Events
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

    [modalWallet, document.getElementById('modalAddAsset')].forEach(modal => {
      modal?.addEventListener('click', e => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    });

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        [modalWallet, document.getElementById('modalAddAsset')].forEach(m => m?.classList.add('hidden'));
      }
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

  function renderSavingsDashboard() {
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
        ? `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25 flex items-center gap-1 font-compact">
             <i data-lucide="lock" class="w-3 h-3 text-amber-400"></i>
             Terkunci s/d ${targetDateFormatted}
           </span>`
        : `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25 flex items-center gap-1 font-compact">
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
          Sisa <strong class="text-white font-mono">Rp ${prog.remainingNominal.toLocaleString('id-ID')}</strong> lagi (cukup sisihkan <strong class="text-[#00D2D3] font-mono">Rp ${vel.monthlyAmount.toLocaleString('id-ID')}/bln</strong> selama ${vel.monthsRemaining} bulan)
        </div>`;
      }

      return `
        <div class="dompet-card-specular rounded-3xl p-5 space-y-4 flex flex-col justify-between" style="border-top: 3px solid ${goal.color || '#00D2D3'}">
          <div class="space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="font-pill text-[10px] uppercase font-bold tracking-wider text-[#8E8E93] block">${escapeHtml(goal.categoryLabel || getCategoryLabel(goal.category))}</span>
                <h4 class="font-subhead text-base font-bold text-white tracking-tight leading-snug">${escapeHtml(goal.name)}</h4>
              </div>
              ${lockBadge}
            </div>

            <!-- Balance Display -->
            <div class="space-y-1">
              <span class="font-pill text-[10px] text-[#8E8E93] uppercase font-semibold">Terkumpul</span>
              <div class="flex items-baseline justify-between">
                <span class="font-headline text-2xl font-bold text-white tracking-tight">Rp ${(goal.current || 0).toLocaleString('id-ID')}</span>
                <span class="font-amount font-mono text-xs font-bold text-[#00D2D3]">${prog.percentage}%</span>
              </div>
              <div class="flex items-center justify-between text-[11px] text-[#8E8E93] font-amount font-mono">
                <span>Target: Rp ${(goal.target || 0).toLocaleString('id-ID')}</span>
                <span>Deadline: ${targetDateFormatted}</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full h-2.5 bg-[#13141F] rounded-full overflow-hidden p-0.5 border border-white/5">
              <div class="h-full rounded-full transition-all duration-500 shadow-sm" style="width: ${prog.percentage}%; background-color: ${goal.color || '#00D2D3'}"></div>
            </div>

            <!-- Velocity Advice -->
            ${velocityText}
          </div>

          <!-- Action Buttons -->
          <div class="pt-2 border-t border-white/5 flex items-center gap-2">
            <button data-action="deposit-goal" data-goal-id="${goal.id}" class="flex-1 py-2 px-3 rounded-xl bg-[#00D2D3] hover:bg-[#00B8B9] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Setor</span>
            </button>
            <button data-action="withdraw-goal" data-goal-id="${goal.id}" class="flex-1 py-2 px-3 rounded-xl bg-[#13141F] hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer">
              <i data-lucide="arrow-up-right" class="w-3.5 h-3.5 text-amber-400"></i>
              <span>Cairkan</span>
            </button>
            <button data-action="delete-goal" data-goal-id="${goal.id}" class="p-2 rounded-xl bg-[#13141F] hover:bg-red-500/20 text-[#8E8E93] hover:text-red-400 transition-colors cursor-pointer" title="Hapus Impian">
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
            b.className = 'savings-filter-btn px-4 py-2 rounded-xl bg-[#00D2D3]/15 text-[#00D2D3] font-semibold border border-[#00D2D3]/30 transition-all cursor-pointer';
          } else {
            b.className = 'savings-filter-btn px-4 py-2 rounded-xl bg-[#1E1E2D] text-[#8E8E93] hover:text-white border border-white/5 transition-all cursor-pointer';
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
      const color = document.getElementById('goalFormColor')?.value || '#00D2D3';

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
          showDynamicIslandHUD('alert-circle', 'Saldo rekening tidak cukup untuk setoran awal!', '#EF4444');
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
      showDynamicIslandHUD('piggy-bank', `Pos Impian "${newGoal.name}" berhasil dibuat!`, '#00D2D3');
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
      showDynamicIslandHUD('arrow-down-right', `Setor Rp ${amount.toLocaleString('id-ID')} berhasil disimpan!`, '#10B981');
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

    // Modal Backdrop Close & ESC
    const allModals = [
      modalAddGoal,
      modalDeposit,
      modalWithdraw,
      document.getElementById('modalAntiKhilafAlert')
    ];

    allModals.forEach(m => {
      m?.addEventListener('click', e => {
        if (e.target === m) m.classList.add('hidden');
      });
    });

    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        allModals.forEach(m => m?.classList.add('hidden'));
      }
    });
  }

  // Safe DOM ready bootstrap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
