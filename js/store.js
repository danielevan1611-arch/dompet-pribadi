/**
 * DompetKu - Store Engine & Privacy Isolation Module
 */

export function createWallet({
  id = `w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  ownerId,
  coupleId = null,
  name,
  type = 'bank', // 'bank' | 'ewallet' | 'cash'
  balance = 0,
  visibility = 'private', // 'private' | 'shared'
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

export function getVisibleWallets(wallets = [], currentUserId) {
  if (!Array.isArray(wallets)) return [];
  return wallets.filter(w => w.visibility === 'shared' || w.ownerId === currentUserId);
}

export function getVisibleTransactions(transactions = [], currentUserId) {
  if (!Array.isArray(transactions)) return [];
  return transactions.filter(t => t.visibility === 'shared' || t.createdBy === currentUserId);
}

export function addTransaction(wallets = [], transaction) {
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

export function calculateNetWorth(wallets = [], currentUserId, mode = 'all') {
  const visible = getVisibleWallets(wallets, currentUserId);
  return visible.reduce((total, w) => {
    if (mode === 'personal' && w.visibility !== 'private') return total;
    if (mode === 'shared' && w.visibility !== 'shared') return total;
    return total + (Number(w.balance) || 0);
  }, 0);
}
