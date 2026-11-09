import { handleTelegramMessage } from '../services/telegram-bot.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('DompetKu Telegram Webhook Endpoint Active');
  }

  const { message } = req.body || {};
  if (!message || !message.text) {
    return res.status(200).json({ ok: true });
  }

  const chatId = message.chat.id;
  const text = message.text.trim();
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (text === '/start') {
    const welcome = [
      '👋 *Halo! Selamat datang di Bot DompetKu*',
      '━━━━━━━━━━━━━━━━━━━━',
      'Catat keuangan Anda secara instan cukup dengan mengetik pesan:',
      '• `makan siang 25k`',
      '• `kopi 20rb gopay`',
      '• `bensin 30.000 cash`',
      '• `gaji freelance 2jt bca`',
      '━━━━━━━━━━━━━━━━━━━━',
      '⚡ Transaksi langsung tersinkron ke website DompetKu 24 jam non-stop!'
    ].join('\n');

    await sendTelegramMessage(botToken, chatId, welcome);
    return res.status(200).json({ ok: true });
  }

  // Default fallback wallets
  let wallets = [
    { id: 'wallet_1', name: 'BCA Utama', balance: 0 },
    { id: 'wallet_2', name: 'GoPay', balance: 0 },
    { id: 'wallet_3', name: 'Dompet Tunai', balance: 0 }
  ];

  if (supabaseUrl && supabaseKey) {
    try {
      const wRes = await fetch(`${supabaseUrl}/rest/v1/wallets?select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      if (wRes.ok) {
        const fetched = await wRes.json();
        if (fetched && fetched.length > 0) wallets = fetched;
      }
    } catch (e) {
      console.warn('Supabase wallet fetch warning:', e.message);
    }
  }

  const result = handleTelegramMessage(text, wallets, wallets[0]?.id);

  if (!result.success) {
    await sendTelegramMessage(botToken, chatId, result.reply);
    return res.status(200).json({ ok: true });
  }

  // Insert transaction into Supabase
  if (supabaseUrl && supabaseKey) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/transactions`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          id: result.transaction.id,
          couple_id: 'default',
          wallet_id: result.transaction.walletId || wallets[0]?.id,
          created_by: message.from?.first_name || 'telegram_user',
          type: result.transaction.type,
          amount: result.transaction.amount,
          category: result.transaction.category,
          note: result.transaction.note,
          visibility: result.transaction.visibility,
          date: result.transaction.date
        })
      });

      // Update wallet balance
      const w = wallets.find(item => item.id === result.transaction.walletId) || wallets[0];
      if (w) {
        const newBalance = Number(w.balance || 0) - Number(result.transaction.amount);
        await fetch(`${supabaseUrl}/rest/v1/wallets?id=eq.${w.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ balance: newBalance })
        });
      }
    } catch (err) {
      console.error('Supabase sync error:', err.message);
    }
  }

  await sendTelegramMessage(botToken, chatId, result.reply);
  return res.status(200).json({ ok: true });
}

async function sendTelegramMessage(token, chatId, text) {
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      })
    });
  } catch (e) {
    console.error('Failed to send telegram message:', e.message);
  }
}
