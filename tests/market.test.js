import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAssetValuation,
  calculatePortfolioSummary,
  generateNextTick,
  INITIAL_MARKET_INSTRUMENTS
} from '../js/market.js';

test('Market & Portfolio Engine - Valuation & Real-Time Calculation', async (t) => {
  await t.test('should calculate stock valuation with 100-shares per lot multiplier', () => {
    // 25 lot BBCA bought at 9.800, now 10.250
    const valuation = calculateAssetValuation({
      type: 'stock',
      units: 25,
      buyPrice: 9800,
      currentPrice: 10250
    });

    assert.equal(valuation.totalCost, 24500000);
    assert.equal(valuation.currentValue, 25625000);
    assert.equal(valuation.pnlNominal, 1125000);
    assert.equal(Number(valuation.pnlPercentage.toFixed(2)), 4.59);
  });

  await t.test('should calculate gold valuation in grams', () => {
    // 10 grams Antam bought at 1.400.000, now 1.485.000
    const valuation = calculateAssetValuation({
      type: 'gold',
      units: 10,
      buyPrice: 1400000,
      currentPrice: 1485000
    });

    assert.equal(valuation.totalCost, 14000000);
    assert.equal(valuation.currentValue, 14850000);
    assert.equal(valuation.pnlNominal, 850000);
    assert.equal(Number(valuation.pnlPercentage.toFixed(2)), 6.07);
  });

  await t.test('should calculate crypto valuation with fractional units', () => {
    // 0.05 BTC bought at 1.400.000.000, now 1.540.000.000
    const valuation = calculateAssetValuation({
      type: 'crypto',
      units: 0.05,
      buyPrice: 1400000000,
      currentPrice: 1540000000
    });

    assert.equal(valuation.totalCost, 70000000);
    assert.equal(valuation.currentValue, 77000000);
    assert.equal(valuation.pnlNominal, 7000000);
    assert.equal(Number(valuation.pnlPercentage.toFixed(2)), 10);
  });

  await t.test('should calculate aggregated portfolio summary accurately', () => {
    const holdings = [
      { id: '1', symbol: 'BBCA', type: 'stock', units: 10, buyPrice: 9000 },
      { id: '2', symbol: 'ANTAM', type: 'gold', units: 5, buyPrice: 1400000 }
    ];
    const prices = {
      'BBCA': 10000,
      'ANTAM': 1500000
    };

    const summary = calculatePortfolioSummary(holdings, prices);
    // Cost: (10*100*9000) + (5*1400000) = 9.000.000 + 7.000.000 = 16.000.000
    // Val:  (10*100*10000) + (5*1500000) = 10.000.000 + 7.500.000 = 17.500.000
    // PnL:  +1.500.000 (+9.375%)
    assert.equal(summary.totalCost, 16000000);
    assert.equal(summary.totalValuation, 17500000);
    assert.equal(summary.totalPnlNominal, 1500000);
    assert.equal(Number(summary.totalPnlPercentage.toFixed(3)), 9.375);
  });

  await t.test('should provide initial instruments covering IHSG, stocks, gold, and crypto', () => {
    assert.ok(INITIAL_MARKET_INSTRUMENTS.length >= 10);
    const symbols = INITIAL_MARKET_INSTRUMENTS.map(i => i.symbol);
    assert.ok(symbols.includes('IHSG'));
    assert.ok(symbols.includes('BBCA'));
    assert.ok(symbols.includes('ANTAM'));
    assert.ok(symbols.includes('BTC'));
    assert.ok(symbols.includes('ETH'));
  });

  await t.test('should generate realistic micro-jitter tick within bounds', () => {
    const base = 10000;
    const next = generateNextTick(base, 0.002);
    // Should be within ±0.2%
    assert.ok(next >= 9970 && next <= 10030);
  });
});
