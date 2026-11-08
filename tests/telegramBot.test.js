import test from 'node:test';
import assert from 'node:assert/strict';
import { handleTelegramMessage, formatReceiptCard } from '../services/telegram-bot.js';

test('Telegram Bot Service', async (t) => {
  const mockWallets = [
    { id: 'w_bca', name: 'BCA', balance: 500000, type: 'bank' },
    { id: 'w_gopay', name: 'GoPay', balance: 150000, type: 'ewallet' },
    { id: 'w_cash', name: 'Tunai', balance: 50000, type: 'cash' }
  ];

  await t.test('should parse "kopi 25rb gopay" and generate transaction payload', () => {
    const res = handleTelegramMessage('kopi 25rb gopay', mockWallets, 'w_bca');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.transaction.amount, 25000);
    assert.strictEqual(res.transaction.category, 'Makanan & Minuman');
    assert.strictEqual(res.transaction.walletId, 'w_gopay');
    assert.strictEqual(res.transaction.note, 'kopi');
  });

  await t.test('should format receipt card with emojis and rupiah formatting', () => {
    const mockTx = {
      amount: 45000,
      category: 'Makanan & Minuman',
      walletName: 'BCA',
      note: 'makan siang padang'
    };
    const card = formatReceiptCard(mockTx);
    assert.match(card, /Transaksi Berhasil Dicatat/);
    assert.match(card, /Rp 45\.000/);
    assert.match(card, /Makanan & Minuman/);
    assert.match(card, /BCA/);
  });

  await t.test('should reject invalid input without nominal with helpful guide', () => {
    const res = handleTelegramMessage('halo bot', mockWallets, 'w_bca');
    assert.strictEqual(res.success, false);
    assert.match(res.reply, /Mohon sertakan nominal/);
  });
});
