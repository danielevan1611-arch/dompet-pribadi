/**
 * DompetKu - Telegram Bot Service
 * Enables zero-browser transaction recording via Telegram chat
 * Integrates with Supabase & QuickParser engine
 */

import { parseQuickInput } from '../js/quickParser.js';

export function formatReceiptCard({ amount, category, walletName, note }) {
  const formattedAmount = (amount || 0).toLocaleString('id-ID');
  return [
    '✅ *Transaksi Berhasil Dicatat!*',
    '━━━━━━━━━━━━━━━━━━━━',
    `💵 *Nominal:* Rp ${formattedAmount}`,
    `📂 *Kategori:* ${category || 'Lainnya'}`,
    `💳 *Dompet:* ${walletName || 'Dompet Utama'}`,
    `📝 *Catatan:* ${note || '-'}`,
    '━━━━━━━━━━━━━━━━━━━━',
    '⚡ _Tersinkronisasi otomatis ke dashboard DompetKu_'
  ].join('\n');
}

export function handleTelegramMessage(messageText, wallets = [], defaultWalletId = null) {
  const text = (messageText || '').trim();
  if (!text) {
    return {
      success: false,
      reply: '⚠️ Pesan kosong. Kirim seperti: "makan 20k" atau "kopi 25rb gopay".'
    };
  }

  const defaultId = defaultWalletId || (wallets[0] ? wallets[0].id : null);
  const parsed = parseQuickInput(text, wallets, defaultId);

  if (parsed.amount <= 0) {
    return {
      success: false,
      reply: '⚠️ Mohon sertakan nominal yang valid!\nContoh:\n• `makan siang 25k`\n• `kopi susu 20rb gopay`\n• `bensin 30.000 cash`\n• `gaji freelance 1.5jt bca`'
    };
  }

  const matchedWallet = wallets.find(w => w.id === parsed.walletId) || wallets[0];
  const walletName = matchedWallet ? matchedWallet.name : 'Dompet Utama';

  const transaction = {
    id: `tx_tg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    walletId: parsed.walletId,
    amount: parsed.amount,
    category: parsed.category,
    note: parsed.note,
    type: 'expense',
    visibility: 'personal',
    source: 'telegram_bot',
    date: new Date().toISOString()
  };

  const reply = formatReceiptCard({
    amount: transaction.amount,
    category: transaction.category,
    walletName,
    note: transaction.note
  });

  return {
    success: true,
    transaction,
    reply
  };
}

/**
 * Optional Standalone Runner:
 * To launch with real Telegram Bot:
 * set TELEGRAM_BOT_TOKEN="your-token"
 * node services/telegram-bot.js
 */
if (process.env.TELEGRAM_BOT_TOKEN && process.argv[1]?.endsWith('telegram-bot.js')) {
  console.log('🤖 DompetKu Telegram Bot Runner Starting...');
  // Standalone long-polling or webhook loop
}
