import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseQuickInput } from '../js/quickParser.js';

describe('Natural Language Quick Parser', () => {
  const wallets = [
    { id: 'w_bca', name: 'BCA' },
    { id: 'w_gopay', name: 'GoPay' },
    { id: 'w_cash', name: 'Cash' },
    { id: 'w_shared', name: 'Kas Bersama' }
  ];

  it('should parse simple "makan 15k" to default wallet with category Makanan & Minuman', () => {
    const res = parseQuickInput('makan 15k', wallets, 'w_bca');
    assert.equal(res.amount, 15000);
    assert.equal(res.category, 'Makanan & Minuman');
    assert.equal(res.walletId, 'w_bca');
    assert.equal(res.visibility, 'private');
  });

  it('should parse "kopi 25rb gopay" to specific wallet', () => {
    const res = parseQuickInput('kopi 25rb gopay', wallets, 'w_bca');
    assert.equal(res.amount, 25000);
    assert.equal(res.category, 'Makanan & Minuman');
    assert.equal(res.walletId, 'w_gopay');
    assert.equal(res.visibility, 'private');
  });

  it('should detect shared keyword "nonton bioskop 90k bersama" and set visibility to shared', () => {
    const res = parseQuickInput('nonton bioskop 90k bersama', wallets, 'w_bca');
    assert.equal(res.amount, 90000);
    assert.equal(res.visibility, 'shared');
    assert.match(res.note, /nonton bioskop/i);
  });

  it('should handle million multipliers like "servis motor 1.2jt bca"', () => {
    const res = parseQuickInput('servis motor 1.2jt bca', wallets, 'w_bca');
    assert.equal(res.amount, 1200000);
    assert.equal(res.category, 'Transportasi');
    assert.equal(res.walletId, 'w_bca');
  });

  it('should handle standard dot-formatted numbers like "bensin 30.000 cash"', () => {
    const res = parseQuickInput('bensin 30.000 cash', wallets, 'w_bca');
    assert.equal(res.amount, 30000);
    assert.equal(res.category, 'Transportasi');
    assert.equal(res.walletId, 'w_cash');
  });
});
