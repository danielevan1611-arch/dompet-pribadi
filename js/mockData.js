/**
 * DompetKu - Initial Zero Seed Data
 */

export const INITIAL_WALLETS = [
  {
    id: 'w_bca_a',
    ownerId: 'user_a',
    coupleId: 'KITA-7890',
    name: 'BCA Utama',
    type: 'bank',
    balance: 0,
    visibility: 'private',
    color: '#0A84FF',
    icon: 'landmark'
  },
  {
    id: 'w_gopay_a',
    ownerId: 'user_a',
    coupleId: 'KITA-7890',
    name: 'GoPay',
    type: 'ewallet',
    balance: 0,
    visibility: 'private',
    color: '#30D158',
    icon: 'smartphone'
  },
  {
    id: 'w_cash_a',
    ownerId: 'user_a',
    coupleId: 'KITA-7890',
    name: 'Dompet Tunai',
    type: 'cash',
    balance: 0,
    visibility: 'private',
    color: '#FF9F0A',
    icon: 'banknote'
  },
  {
    id: 'w_couple_shared',
    ownerId: 'user_a',
    coupleId: 'KITA-7890',
    name: 'Kas Kencan & Liburan',
    type: 'bank',
    balance: 0,
    visibility: 'shared',
    color: '#BF5AF2',
    icon: 'heart'
  }
];

export const INITIAL_TRANSACTIONS = [];
