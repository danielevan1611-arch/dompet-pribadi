import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePillOffset, formatIndonesianRupiah, calculateRollingValue } from '../js/motion.js';

test('Motion Engine - calculatePillOffset should compute relative left and width', () => {
  const container = { left: 100, width: 300 };
  const target = { left: 180, width: 90 };
  const offset = calculatePillOffset(container, target);
  assert.equal(offset.left, 80);
  assert.equal(offset.width, 90);
});

test('Motion Engine - formatIndonesianRupiah should format currency numbers', () => {
  assert.equal(formatIndonesianRupiah(15000), 'Rp 15.000');
  assert.equal(formatIndonesianRupiah(1250000), 'Rp 1.250.000');
  assert.equal(formatIndonesianRupiah(0), 'Rp 0');
});

test('Motion Engine - calculateRollingValue should interpolate with easing', () => {
  assert.equal(calculateRollingValue(0, 1000, 0), 0);
  assert.equal(calculateRollingValue(0, 1000, 1), 1000);
  const mid = calculateRollingValue(0, 1000, 0.5);
  assert.ok(mid > 500, 'Ease-out curve should progress faster than linear at 50%');
});
