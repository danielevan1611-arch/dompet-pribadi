import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateTransactionsByDate, getMonthCalendarDays } from '../js/calendar.js';

test('Financial Calendar Engine', async (t) => {
  const mockTxs = [
    { id: '1', date: '2026-11-02T10:00:00Z', type: 'income', amount: 5000000, category: 'Gaji' },
    { id: '2', date: '2026-11-02T14:30:00Z', type: 'expense', amount: 50000, category: 'Makanan' },
    { id: '3', date: '2026-11-05T09:00:00Z', type: 'expense', amount: 120000, category: 'Transportasi' }
  ];

  await t.test('should aggregate daily income and expense totals by ISO date', () => {
    const daily = aggregateTransactionsByDate(mockTxs);
    assert.deepEqual(daily['2026-11-02'], {
      income: 5000000,
      expense: 50000,
      count: 2
    });
    assert.deepEqual(daily['2026-11-05'], {
      income: 0,
      expense: 120000,
      count: 1
    });
  });

  await t.test('should generate accurate calendar days grid for a month', () => {
    // November 2026 starts on Sunday (1 Nov 2026) and has 30 days
    const days = getMonthCalendarDays(2026, 10); // 10 = Nov (0-indexed)
    assert.equal(days.length >= 30, true);
    assert.equal(days[0].dayNumber, 1);
    assert.equal(days[days.length - 1].dayNumber, 30);
  });
});
