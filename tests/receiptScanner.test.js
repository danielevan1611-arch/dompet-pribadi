import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractPaymentDetailsFromText } from '../js/receiptScanner.js';

describe('Receipt & Transfer Text Extractor', () => {
  it('should extract amount from standard BCA transfer receipt text', () => {
    const ocrSample = `
      M-TRANSFER BERHASIL
      08/11/2026 10:45:12
      JUMLAH: RP. 75.000,00
      BERITA: MAKAN SIANG
    `;
    const res = extractPaymentDetailsFromText(ocrSample);
    assert.equal(res.amount, 75000);
    assert.match(res.note, /MAKAN SIANG/i);
    assert.equal(res.type, 'expense');
  });

  it('should extract amount from GoPay / QRIS receipt text', () => {
    const qrisSample = `
      PEMBAYARAN QRIS BERHASIL
      Total Bayar: Rp 45.500
      Merchant: KOPI KENANGAN
    `;
    const res = extractPaymentDetailsFromText(qrisSample);
    assert.equal(res.amount, 45500);
    assert.match(res.note, /KOPI KENANGAN/i);
  });

  it('should extract amount from Indomaret / Alfamart paper receipt text', () => {
    const paperSample = `
      INDOMARET RAYA
      AIR MINERAL 1X 4.500
      ROTI TAWAR 1X 18.000
      TOTAL : Rp 22.500
      TUNAI : Rp 50.000
      KEMBALI : Rp 27.500
    `;
    const res = extractPaymentDetailsFromText(paperSample);
    assert.equal(res.amount, 22500);
  });

  it('should safely return zero amount on unreadable noise text', () => {
    const noise = `Selamat datang di toko kami. Terima kasih atas kunjungan anda.`;
    const res = extractPaymentDetailsFromText(noise);
    assert.equal(res.amount, 0);
  });
});
