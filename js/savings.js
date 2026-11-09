/**
 * savings.js - Core Financial Goals & Savings Engine
 * Zero external dependencies. Works in browser and Node.js.
 */

export const INITIAL_SAVINGS_TEMPLATES = [
  {
    id: 'goal_darurat',
    name: 'Dana Darurat 6 Bulan',
    category: 'darurat',
    categoryLabel: 'Darurat & Proteksi',
    target: 30000000,
    current: 0,
    targetDate: '2027-12-31',
    isLocked: true,
    color: '#0A84FF',
    icon: 'shield-check',
    note: 'Pos dana darurat untuk 6 bulan pengeluaran rutin'
  },
  {
    id: 'goal_liburan',
    name: 'Liburan Akhir Tahun (Jepang)',
    category: 'liburan',
    categoryLabel: 'Liburan & Traveling',
    target: 15000000,
    current: 0,
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
    current: 0,
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
    current: 0,
    targetDate: '2028-12-31',
    isLocked: true,
    color: '#10B981',
    icon: 'home',
    note: 'Akumulasi DP rumah pertama di kawasan strategis'
  }
];

/**
 * Calculates progress percentage, remaining balance, and completion status.
 */
export function calculateGoalProgress(current, target) {
  const cur = Math.max(0, Number(current) || 0);
  const tgt = Math.max(0, Number(target) || 0);

  if (tgt <= 0) {
    return {
      percentage: 100,
      remainingNominal: 0,
      isCompleted: true
    };
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

/**
 * Calculates savings velocity required to reach the target date.
 */
export function calculateMonthlySavingsVelocity(remainingNominal, targetDateInput, fromDateInput = new Date()) {
  const rem = Math.max(0, Number(remainingNominal) || 0);
  if (rem <= 0) {
    return {
      monthsRemaining: 0,
      daysRemaining: 0,
      monthlyAmount: 0,
      dailyAmount: 0,
      isOverdue: false
    };
  }

  const fromDate = fromDateInput instanceof Date ? fromDateInput : new Date(fromDateInput);
  const targetDate = targetDateInput instanceof Date ? targetDateInput : new Date(targetDateInput);

  const diffMs = targetDate.getTime() - fromDate.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      monthsRemaining: 0,
      daysRemaining: 0,
      monthlyAmount: rem,
      dailyAmount: rem,
      isOverdue: true
    };
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

/**
 * Deposits money from a funding wallet into a target savings goal.
 */
export function depositToGoal(goals, wallets, { goalId, walletId, amount, date = new Date().toISOString() }) {
  const amt = Number(amount);
  if (!amt || amt <= 0) {
    return { success: false, error: 'NOMINAL_INVALID' };
  }

  const walletIndex = (wallets || []).findIndex(w => w.id === walletId);
  if (walletIndex === -1) {
    return { success: false, error: 'WALLET_TIDAK_DITEMUKAN' };
  }

  const goalIndex = (goals || []).findIndex(g => g.id === goalId);
  if (goalIndex === -1) {
    return { success: false, error: 'GOAL_TIDAK_DITEMUKAN' };
  }

  const wallet = wallets[walletIndex];
  if (wallet.balance < amt) {
    return { success: false, error: 'SALDO_TIDAK_CUKUP' };
  }

  const goal = goals[goalIndex];

  const updatedWallets = wallets.map((w, idx) => {
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

  return {
    success: true,
    updatedWallets,
    updatedGoals,
    transaction
  };
}

/**
 * Withdraws money from a savings goal back to a chosen wallet.
 */
export function withdrawFromGoal(goals, wallets, { goalId, walletId, amount, forceOverride = false, currentDate = new Date(), date = new Date().toISOString() }) {
  const amt = Number(amount);
  if (!amt || amt <= 0) {
    return { success: false, error: 'NOMINAL_INVALID' };
  }

  const goalIndex = (goals || []).findIndex(g => g.id === goalId);
  if (goalIndex === -1) {
    return { success: false, error: 'GOAL_TIDAK_DITEMUKAN' };
  }

  const walletIndex = (wallets || []).findIndex(w => w.id === walletId);
  if (walletIndex === -1) {
    return { success: false, error: 'WALLET_TIDAK_DITEMUKAN' };
  }

  const goal = goals[goalIndex];
  if ((goal.current || 0) < amt) {
    return { success: false, error: 'SALDO_TABUNGAN_TIDAK_CUKUP' };
  }

  // Check Smart Lock
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

  const updatedWallets = wallets.map((w, idx) => {
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
    walletId: wallets[walletIndex].id,
    walletName: wallets[walletIndex].name,
    fromGoalId: goal.id,
    fromGoalName: goal.name,
    description: `Pencairan Tabungan: ${goal.name}`,
    createdAt: new Date().toISOString()
  };

  return {
    success: true,
    updatedWallets,
    updatedGoals,
    transaction
  };
}
