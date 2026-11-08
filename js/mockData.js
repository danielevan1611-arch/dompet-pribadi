/**
 * DompetKu - Initial Mock Seed Data
 */

export const INITIAL_WALLETS = [
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

export const INITIAL_TRANSACTIONS = [
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
