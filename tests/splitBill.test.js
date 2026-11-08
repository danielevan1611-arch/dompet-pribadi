import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSplitBill, formatWhatsAppBillSummary } from '../js/splitBill.js';

test('Smart Split Bill Engine - Indonesian Restaurant Taxation', async (t) => {
  const mockItems = [
    { id: '1', name: 'Nasi Goreng Spesial', price: 40000, quantity: 1, assignedTo: ['Daniel'] },
    { id: '2', name: 'Wagyu Steak', price: 120000, quantity: 1, assignedTo: ['Sarah'] },
    { id: '3', name: 'Es Teh Manis', price: 10000, quantity: 2, assignedTo: ['Daniel', 'Sarah'] }, // 1 each
    { id: '4', name: 'Pizza Sharing', price: 80000, quantity: 1, assignedTo: ['Daniel', 'Sarah', 'Budi'] } // split 3
  ];

  const participants = ['Daniel', 'Sarah', 'Budi'];

  await t.test('should calculate subtotal, 5% service charge, and 10% PB1 tax accurately', () => {
    // Total menu: 40k + 120k + 20k + 80k = 260.000
    // Service 5%: 13.000
    // Subtotal + Service = 273.000
    // PB1 10%: 27.300
    // Grand Total: 300.300
    const result = calculateSplitBill({
      items: mockItems,
      participants,
      servicePercent: 5,
      taxPercent: 10
    });

    assert.equal(result.subtotal, 260000);
    assert.equal(result.serviceCharge, 13000);
    assert.equal(result.tax, 27300);
    assert.equal(result.grandTotal, 300300);

    // Verify sum of participant totals equals grandTotal (accounting for integer rounding)
    const participantSum = Object.values(result.breakdown).reduce((acc, p) => acc + p.totalOwed, 0);
    assert.ok(Math.abs(participantSum - result.grandTotal) <= 3, 'Sum of participant shares should equal grand total');
  });

  await t.test('should generate shareable WhatsApp text summary with payment instructions', () => {
    const result = calculateSplitBill({
      items: mockItems,
      participants,
      servicePercent: 5,
      taxPercent: 10
    });

    const waText = formatWhatsAppBillSummary({
      splitResult: result,
      bankAccount: 'BCA: 1234-5678-90 a/n Daniel',
      placeName: 'Cafe & Resto Senopati'
    });

    assert.match(waText, /Rincian Split Bill/);
    assert.match(waText, /Cafe & Resto Senopati/);
    assert.match(waText, /Daniel/);
    assert.match(waText, /Sarah/);
    assert.match(waText, /BCA: 1234-5678-90/);
  });
});
