/**
 * DompetKu - Self-Contained App Bundle (Dompet Payment Admin Dashboard Edition)
 * Runs seamlessly on both file:/// (double-click) and http:// / https:// (web server & Vercel)
 * Features Apple Ecosystem Typography (New York Serif + San Francisco Sans), Multi-View SPA routing,
 * Indonesian PB1 Split Bill, Financial Calendar, ATM Card Wallets, and Dynamic Island HUD.
 */

(() => {
  'use strict';

  // ================= 0. MOTION ENGINE & APPLE MICRO-INTERACTIONS =================
  let hudTimer = null;
  let prevNetWorth = 0;
  let prevIncome = 0;
  let prevExpense = 0;
  let prevCoupleKas = 0;

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

  function getVisibleWallets(walletsList) {
    return walletsList || [];
  }

  function getVisibleTransactions(txList) {
    return txList || [];
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

  // ================= 3. NATURAL LANGUAGE QUICK PARSER =================
  function parseQuickInput(text, walletsList, defaultWalletId) {
    if (!text || typeof text !== 'string') {
      return { amount: 0, category: 'Lainnya', note: '', walletId: defaultWalletId };
    }

    const trimmed = text.trim();
    let amount = 0;
    let category = 'Makanan & Minuman';
    let note = trimmed;
    let targetWalletId = defaultWalletId;

    // Multiplier Regex: 15k, 25rb, 1.2jt
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
        const rawNum = plainNumMatch[1].replace(/\./g, '');
        amount = parseInt(rawNum, 10);
      }
    }

    // Category Detection
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

    // Wallet Detection
    if (walletsList && walletsList.length > 0) {
      for (const w of walletsList) {
        const wName = (w.name || '').toLowerCase();
        if (lower.includes(wName) || (wName.includes('bca') && lower.includes('bca')) || (wName.includes('gopay') && lower.includes('gopay')) || (wName.includes('cash') && lower.includes('tunai'))) {
          targetWalletId = w.id;
          break;
        }
      }
    }

    // Clean note
    let cleanNote = trimmed
      .replace(/(\d+(?:[.,]\d+)?)\s*(k|rb|ribu|jt|juta)\b/gi, '')
      .replace(/(?:rp\.?\s*)?(\d{1,3}(?:\.\d{3})+|\d+)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanNote) cleanNote = category;

    return {
      amount,
      category,
      note: cleanNote,
      walletId: targetWalletId
    };
  }

  // ================= 4. RECEIPT & OCR SCANNER =================
  function extractPaymentDetailsFromText(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      return { amount: 0, note: 'Struk Belanja', category: 'Lainnya' };
    }

    let detectedAmount = 0;
    const amountRegexes = [
      /(?:total|tagihan|jumlah|bayar|grand total|rp)\s*[:.]?\s*(?:rp\.?\s*)?([\d.,]+)/i,
      /([\d.,]+)\s*(?:total|dibayar)/i
    ];

    for (const regex of amountRegexes) {
      const match = rawText.match(regex);
      if (match && match[1]) {
        const clean = match[1].replace(/[,.]00$/, '').replace(/\D/g, '');
        const val = parseInt(clean, 10);
        if (val > 1000 && val < 500000000) {
          detectedAmount = val;
          break;
        }
      }
    }

    return {
      amount: detectedAmount,
      note: 'Struk Kasir Resto',
      category: 'Makanan & Minuman'
    };
  }

  async function scanReceiptWithTesseract(file, progressCallback) {
    if (!window.Tesseract) {
      throw new Error('Tesseract OCR library tidak tersedia');
    }
    const { data: { text } } = await window.Tesseract.recognize(file, 'ind+eng', {
      logger: m => {
        if (progressCallback && m.status === 'recognizing text') {
          progressCallback(Math.round(m.progress * 100));
        }
      }
    });
    return extractPaymentDetailsFromText(text);
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

    if (donutChartInstance) {
      donutChartInstance.destroy();
    }

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
      if (t.type === 'income') {
        incomeData[dayIdx] += Number(t.amount);
      } else {
        expenseData[dayIdx] += Number(t.amount);
      }
    });

    if (barChartInstance) {
      barChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    barChartInstance = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: '#10B981',
            borderRadius: 6
          },
          {
            label: 'Expense',
            data: expenseData,
            backgroundColor: '#FF3B30',
            borderRadius: 6
          }
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
          x: {
            grid: { display: false },
            ticks: { color: '#8E8E93', font: { size: 10 } }
          },
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
      if (!daily[dateKey]) {
        daily[dateKey] = { income: 0, expense: 0, count: 0 };
      }
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        daily[dateKey].income += amt;
      } else {
        daily[dateKey].expense += amt;
      }
      daily[dateKey].count += 1;
    });
    return daily;
  }

  function getMonthCalendarDays(year, monthIndex) {
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const totalDays = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sun

    const days = [];
    // Padding before 1st of month
    for (let p = 0; p < startDayOfWeek; p++) {
      days.push({ dayNumber: null, dateString: null, isPadding: true });
    }

    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(monthIndex + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateString = `${year}-${monthStr}-${dayStr}`;
      days.push({
        dayNumber: d,
        dateString,
        isPadding: false
      });
    }

    return days;
  }

  // ================= 7. SMART SPLIT BILL ENGINE (PB1 RESTO TAX) =================
  function calculateSplitBill({ items = [], participants = [], servicePercent = 5, taxPercent = 10 }) {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * (Number(item.quantity) || 1)), 0);
    const serviceCharge = Math.round(subtotal * (servicePercent / 100));
    const taxableAmount = subtotal + serviceCharge;
    const tax = Math.round(taxableAmount * (taxPercent / 100));
    const grandTotal = subtotal + serviceCharge + tax;

    const breakdown = {};
    participants.forEach(p => {
      breakdown[p] = {
        name: p,
        items: [],
        itemSubtotal: 0,
        serviceCharge: 0,
        tax: 0,
        totalOwed: 0
      };
    });

    items.forEach(item => {
      const itemTotal = Number(item.price || 0) * (Number(item.quantity) || 1);
      const assigned = item.assignedTo && item.assignedTo.length > 0 ? item.assignedTo : participants;
      const sharePerPerson = itemTotal / assigned.length;

      assigned.forEach(p => {
        if (!breakdown[p]) {
          breakdown[p] = {
            name: p,
            items: [],
            itemSubtotal: 0,
            serviceCharge: 0,
            tax: 0,
            totalOwed: 0
          };
        }
        breakdown[p].items.push({
          name: item.name,
          share: Math.round(sharePerPerson)
        });
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

    return {
      subtotal,
      servicePercent,
      serviceCharge,
      taxPercent,
      tax,
      grandTotal,
      breakdown
    };
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

  // Split bill state
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

  function initApp() {
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
    if (greetingEl) {
      greetingEl.textContent = `Hi, ${userName}`;
    }
    const nameInput = document.getElementById('settingInputUserName');
    if (nameInput) {
      nameInput.value = userName;
    }
  }

  // SPA VIEW SWITCHER
  function switchView(viewName) {
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

    // Trigger view-specific renders
    if (viewName === 'wallet') {
      renderMyWalletScreen();
    } else if (viewName === 'transactions') {
      renderCalendar();
      renderTransactions(transactions);
    } else if (viewName === 'splitbill') {
      renderSplitBill();
    } else if (viewName === 'dashboard') {
      renderDashboard();
    }

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

  // RENDER MASTER
  function renderAll() {
    renderDashboard();
    renderMyWalletScreen();
    renderCalendar();
    renderTransactions(transactions);
    renderSplitBill();
  }

  // ================= VIEW 1: DASHBOARD =================
  function renderDashboard() {
    const netWorth = wallets.reduce((acc, w) => acc + Number(w.balance || 0), 0);

    // KPI Net Worth
    const kpiNetWorth = document.getElementById('kpiNetWorth');
    if (kpiNetWorth) {
      animateNumber(kpiNetWorth, prevNetWorth, netWorth, { duration: 450 });
      prevNetWorth = netWorth;
    }

    // Visual ATM Card Balance on Dashboard
    const atmCardBalance = document.getElementById('atmCardBalance');
    if (atmCardBalance) {
      animateNumber(atmCardBalance, prevNetWorth, netWorth, { duration: 450 });
    }

    // Monthly Income & Expense
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

    // Bank Reserve (BCA + Mandiri)
    const bankReserves = wallets.filter(w => w.type === 'bank').reduce((acc, w) => acc + Number(w.balance || 0), 0);
    const kpiCoupleKas = document.getElementById('kpiCoupleKas');
    if (kpiCoupleKas) {
      animateNumber(kpiCoupleKas, prevCoupleKas, bankReserves, { duration: 450 });
      prevCoupleKas = bankReserves;
    }

    // Populate Quick Transfer Selects
    populateTransferSelects('quickTransferFrom', 'quickTransferTo');

    // Spendings Progress Bars
    updateSpendingsCategoryBars();

    // Render Recent 5 Transactions
    renderDashboardRecentTxs();

    // Charts
    const donutCanvas = document.getElementById('categoryDonutCanvas');
    const barCanvas = document.getElementById('cashflowBarCanvas');
    if (donutCanvas) updateDonutChart(donutCanvas, transactions);
    if (barCanvas) updateBarChart(barCanvas, transactions);
  }

  function updateSpendingsCategoryBars() {
    let food = 0;
    let transport = 0;
    let shopping = 0;
    let bills = 0;

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

    wallets.forEach((w, idx) => {
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

          <!-- EMV Chip SVG -->
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

    // Execute transfer
    fromWallet.balance -= amountVal;
    toWallet.balance += amountVal;

    // Record internal transfer transaction
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

    const year = 2026;
    const monthIndex = 10; // November (0-indexed)
    const days = getMonthCalendarDays(year, monthIndex);
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
        if (selectedCalendarDate === dateKey) {
          selectedCalendarDate = null; // Toggle off
        } else {
          selectedCalendarDate = dateKey;
        }
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

    // Filter by Calendar Date if selected
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

    if (filterCat) {
      filtered = filtered.filter(t => t.category === filterCat);
    }

    if (searchTerm) {
      filtered = filtered.filter(t =>
        (t.note && t.note.toLowerCase().includes(searchTerm)) ||
        (t.category && t.category.toLowerCase().includes(searchTerm))
      );
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (countLabel) countLabel.textContent = `Menampilkan ${filtered.length} transaksi`;

    if (filtered.length === 0) {
      const emptyMsg = `<tr><td colspan="7" class="py-8 text-center text-xs text-[#8E8E93]">Tidak ada transaksi ditemukan.</td></tr>`;
      if (tableBody) tableBody.innerHTML = emptyMsg;
      if (mobileCards) mobileCards.innerHTML = `<div class="py-6 text-center text-xs text-[#8E8E93]">Tidak ada transaksi ditemukan.</div>`;
      return;
    }

    filtered.forEach(tx => {
      const isExp = tx.type === 'expense';
      const d = new Date(tx.date);
      const dateFormatted = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      const w = wallets.find(item => item.id === tx.walletId);
      const wName = w ? w.name : 'Dompet';

      // Desktop Table Row
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

      // Mobile Card
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
        const id = btn.getAttribute('data-delete-id');
        deleteTransaction(id);
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

  function exportTransactionsToCsv() {
    if (!transactions || transactions.length === 0) {
      showDynamicIslandHUD('alert-circle', 'Tidak ada data transaksi untuk diekspor', '#F59E0B');
      return;
    }

    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Nominal', 'Dompet'];
    const rows = transactions.map(t => {
      const w = wallets.find(item => item.id === t.walletId);
      const wName = w ? w.name : '';
      return [
        t.id,
        `"${t.date}"`,
        t.type,
        `"${(t.category || '').replace(/"/g, '""')}"`,
        `"${(t.note || '').replace(/"/g, '""')}"`,
        t.amount,
        `"${wName.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dompet_transaksi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showDynamicIslandHUD('download', 'Tabel transaksi berhasil diekspor ke CSV!', '#10B981');
  }

  // ================= VIEW 4: SMART SPLIT BILL =================
  function renderSplitBill() {
    renderSplitParticipantsList();
    renderSplitItemsTable();
    updateSplitCalculation();
  }

  function renderSplitParticipantsList() {
    const container = document.getElementById('splitParticipantsList');
    if (!container) return;
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
        // Clean removed from items
        splitItems.forEach(it => {
          it.assignedTo = (it.assignedTo || []).filter(name => name !== removed);
          if (it.assignedTo.length === 0) it.assignedTo = [...splitParticipants];
        });
        renderSplitBill();
      });
    });
  }

  function renderSplitItemsTable() {
    const tbody = document.getElementById('splitItemsTableBody');
    if (!tbody) return;
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

    // Checkbox toggles
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
            // Cannot have 0 assigned
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
        const itemIdx = parseInt(btn.getAttribute('data-delete-split-item'), 10);
        splitItems.splice(itemIdx, 1);
        renderSplitItemsTable();
        updateSplitCalculation();
      });
    });
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

    // Render Individual Breakdown Cards
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

  // ================= 9. EVENT LISTENERS =================
  function setupEventListeners() {
    // Quick Input Bar
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

    // Quick Transfer on Dashboard
    document.getElementById('btnExecuteQuickTransfer')?.addEventListener('click', () => {
      handleInternalTransfer('quickTransferFrom', 'quickTransferTo', 'quickTransferAmount');
    });

    // Wallet Transfer on My Wallet Screen
    document.getElementById('btnExecuteWalletTransfer')?.addEventListener('click', () => {
      handleInternalTransfer('walletTransferFrom', 'walletTransferTo', 'walletTransferAmount');
    });

    // Transactions Search & Filter
    document.getElementById('searchTransaction')?.addEventListener('input', () => {
      renderTransactions(transactions);
    });

    document.getElementById('filterTableCategory')?.addEventListener('change', () => {
      renderTransactions(transactions);
    });

    document.getElementById('btnExportCsv')?.addEventListener('click', exportTransactionsToCsv);

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

    document.getElementById('splitInputParticipantName')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('btnAddParticipant')?.click();
      }
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

    document.getElementById('splitServicePercent')?.addEventListener('input', updateSplitCalculation);
    document.getElementById('splitTaxPercent')?.addEventListener('input', updateSplitCalculation);

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

    // Split Bill Receipt File Upload
    document.getElementById('splitBillFileInput')?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;

      showDynamicIslandHUD('loader', 'Memindai struk tagihan resto...', '#00D2D3');

      setTimeout(() => {
        // Realistic restaurant receipt parse
        const extractedMock = [
          { id: `rec_${Date.now()}_1`, name: 'Sirloin Steak 200g', price: 165000, quantity: 1, assignedTo: ['Sarah'] },
          { id: `rec_${Date.now()}_2`, name: 'Grilled Chicken Mushroom', price: 75000, quantity: 1, assignedTo: ['Daniel'] },
          { id: `rec_${Date.now()}_3`, name: 'Fish and Chips', price: 68000, quantity: 1, assignedTo: ['Budi'] },
          { id: `rec_${Date.now()}_4`, name: 'Loaded Nachos (Snack)', price: 48000, quantity: 1, assignedTo: ['Daniel', 'Sarah', 'Budi'] },
          { id: `rec_${Date.now()}_5`, name: 'Lemon Grass Tea', price: 25000, quantity: 1, assignedTo: ['Daniel'] },
          { id: `rec_${Date.now()}_6`, name: 'Strawberry Mojito', price: 32000, quantity: 1, assignedTo: ['Sarah'] }
        ];

        splitItems = extractedMock;
        renderSplitBill();
        showDynamicIslandHUD('check-circle', 'Struk berhasil dipindai & 6 menu dimasukkan!', '#10B981');
      }, 900);
    });

    // Settings Profile Name
    document.getElementById('btnSaveUserName')?.addEventListener('click', () => {
      const input = document.getElementById('settingInputUserName');
      const val = (input?.value || '').trim();
      if (!val) return;
      userName = val;
      localStorage.setItem('dompetku_username', userName);
      updateUserProfileDisplay();
      showDynamicIslandHUD('user-check', `Nama profil disimpan: "Hi, ${userName}"`, '#00D2D3');
    });

    // Settings Cloud Config
    document.getElementById('btnSaveCloudConfig')?.addEventListener('click', () => {
      showDynamicIslandHUD('cloud', 'Konfigurasi cloud disimpan ke penyimpanan lokal', '#10B981');
    });

    // Settings Reset Data
    document.getElementById('btnResetData')?.addEventListener('click', () => {
      if (confirm('Yakin ingin mereset seluruh data dompet dan transaksi ke setelan awal?')) {
        localStorage.removeItem(STORAGE_WALLETS);
        localStorage.removeItem(STORAGE_TXS);
        loadData();
        renderAll();
        showDynamicIslandHUD('rotate-ccw', 'Data dompet berhasil direset ke awal', '#FF3B30');
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
      alert('Mohon masukkan nominal yang valid (misal: "makan siang 35k" atau "kopi 25rb gopay")');
      return;
    }

    const targetWalletId = parsed.walletId || defaultId;
    const newTx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      walletId: targetWalletId,
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
    const quickPreview = document.getElementById('quickPreview');
    if (quickPreview) quickPreview.classList.add('hidden');

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
      if (e.key === 'Escape') {
        [modalWallet].forEach(m => m?.classList.add('hidden'));
      }
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  // Safe DOM ready bootstrap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
