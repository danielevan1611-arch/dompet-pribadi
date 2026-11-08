/**
 * DompetKu - Supabase Cloud Sync & Couple Pairing Module
 */

const CONFIG_KEY = 'dompetku_couple_config_v1';

export function generateCoupleCode() {
  const words = ['KITA', 'LOVE', 'BERSAMA', 'DUO', 'COUPLE', 'HOME'];
  const prefix = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

export function getLocalCoupleConfig() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      coupleCode: 'DEMO-COUPLE',
      currentUserId: 'user_a',
      userName: 'Kamu',
      partnerName: 'Pacar',
      supabaseUrl: '',
      supabaseAnonKey: ''
    };
  }

  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse couple config:', e);
  }

  // Default initial configuration
  const def = {
    coupleCode: generateCoupleCode(),
    currentUserId: 'user_a',
    userName: 'Kamu',
    partnerName: 'Pacar',
    supabaseUrl: '',
    supabaseAnonKey: ''
  };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(def));
  return def;
}

export function saveLocalCoupleConfig(config) {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }
  return config;
}

export function createSupabaseClient(supabaseUrl, supabaseAnonKey) {
  if (typeof window === 'undefined' || !window.supabase || !supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  try {
    return window.supabase.createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

/**
 * Syncs a single transaction to cloud, enforcing privacy rules.
 */
export async function pushTransactionToCloud(supabaseClient, transaction) {
  if (!supabaseClient || !transaction) return;
  try {
    await supabaseClient.from('transactions').upsert({
      id: transaction.id,
      couple_id: transaction.coupleId,
      wallet_id: transaction.walletId,
      created_by: transaction.createdBy,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      note: transaction.note,
      visibility: transaction.visibility,
      date: transaction.date
    });
  } catch (err) {
    console.warn('Sync transaction to cloud failed:', err);
  }
}

/**
 * Syncs a wallet state to cloud.
 */
export async function pushWalletToCloud(supabaseClient, wallet) {
  if (!supabaseClient || !wallet) return;
  try {
    await supabaseClient.from('wallets').upsert({
      id: wallet.id,
      couple_id: wallet.coupleId,
      owner_id: wallet.ownerId,
      name: wallet.name,
      type: wallet.type,
      balance: wallet.balance,
      visibility: wallet.visibility,
      color: wallet.color,
      icon: wallet.icon
    });
  } catch (err) {
    console.warn('Sync wallet to cloud failed:', err);
  }
}

/**
 * Subscribes to Realtime updates for couple events.
 * Strict Privacy: Discards any incoming change if it belongs to partner's private data!
 */
export function subscribeToCoupleRealtime(supabaseClient, { coupleCode, currentUserId, onWalletChange, onTransactionChange }) {
  if (!supabaseClient || !coupleCode) return null;

  const channel = supabaseClient
    .channel(`couple-sync-${coupleCode}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'wallets', filter: `couple_id=eq.${coupleCode}` },
      payload => {
        const item = payload.new;
        if (!item) return;
        // Strict Privacy Isolation:
        // Ignore if it is private and does NOT belong to current user!
        if (item.visibility === 'private' && item.owner_id !== currentUserId) {
          return;
        }
        if (typeof onWalletChange === 'function') {
          onWalletChange(item);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'transactions', filter: `couple_id=eq.${coupleCode}` },
      payload => {
        const item = payload.new;
        if (!item) return;
        // Strict Privacy Isolation:
        if (item.visibility === 'private' && item.created_by !== currentUserId) {
          return;
        }
        if (typeof onTransactionChange === 'function') {
          onTransactionChange(item);
        }
      }
    )
    .subscribe();

  return channel;
}
