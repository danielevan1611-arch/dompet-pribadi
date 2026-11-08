import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGoalProgress,
  calculateMonthlySavingsVelocity,
  depositToGoal,
  withdrawFromGoal,
  INITIAL_SAVINGS_TEMPLATES
} from '../js/savings.js';

describe('Savings Goals Engine', () => {
  describe('calculateGoalProgress', () => {
    it('calculates percentage and remaining nominal correctly for normal goal', () => {
      const res = calculateGoalProgress(15000000, 30000000);
      assert.equal(res.percentage, 50);
      assert.equal(res.remainingNominal, 15000000);
      assert.equal(res.isCompleted, false);
    });

    it('caps percentage at 100% and sets remaining to 0 when target is reached', () => {
      const res = calculateGoalProgress(35000000, 30000000);
      assert.equal(res.percentage, 100);
      assert.equal(res.remainingNominal, 0);
      assert.equal(res.isCompleted, true);
    });

    it('handles zero or invalid target gracefully', () => {
      const res = calculateGoalProgress(5000, 0);
      assert.equal(res.percentage, 100);
      assert.equal(res.remainingNominal, 0);
    });
  });

  describe('calculateMonthlySavingsVelocity', () => {
    it('calculates monthly required amount based on months remaining', () => {
      const fromDate = new Date('2026-01-01');
      const targetDate = new Date('2026-07-01'); // 6 months difference
      const res = calculateMonthlySavingsVelocity(12000000, targetDate, fromDate);
      
      assert.equal(res.monthsRemaining, 6);
      assert.equal(res.monthlyAmount, 2000000);
      assert.equal(res.isOverdue, false);
    });

    it('handles target dates in the past or zero months left', () => {
      const fromDate = new Date('2026-11-08');
      const targetDate = new Date('2026-10-01');
      const res = calculateMonthlySavingsVelocity(5000000, targetDate, fromDate);
      
      assert.equal(res.isOverdue, true);
      assert.equal(res.monthlyAmount, 5000000);
    });
  });

  describe('depositToGoal', () => {
    const initialWallets = [
      { id: 'wallet_bca', name: 'BCA Utama', balance: 50000000 }
    ];
    const initialGoals = [
      { id: 'goal_darurat', name: 'Dana Darurat', current: 18000000, target: 30000000, isLocked: true }
    ];

    it('successfully deposits from wallet to goal and deducts wallet balance', () => {
      const res = depositToGoal(initialGoals, initialWallets, {
        goalId: 'goal_darurat',
        walletId: 'wallet_bca',
        amount: 2000000,
        date: '2026-11-08'
      });

      assert.equal(res.success, true);
      assert.equal(res.updatedWallets[0].balance, 48000000);
      assert.equal(res.updatedGoals[0].current, 20000000);
      assert.ok(res.transaction);
      assert.equal(res.transaction.type, 'expense');
      assert.equal(res.transaction.category, 'Tabungan');
      assert.equal(res.transaction.amount, 2000000);
    });

    it('fails when wallet has insufficient funds', () => {
      const res = depositToGoal(initialGoals, initialWallets, {
        goalId: 'goal_darurat',
        walletId: 'wallet_bca',
        amount: 99000000
      });

      assert.equal(res.success, false);
      assert.equal(res.error, 'SALDO_TIDAK_CUKUP');
    });

    it('fails when amount is invalid', () => {
      const res = depositToGoal(initialGoals, initialWallets, {
        goalId: 'goal_darurat',
        walletId: 'wallet_bca',
        amount: -5000
      });

      assert.equal(res.success, false);
      assert.equal(res.error, 'NOMINAL_INVALID');
    });
  });

  describe('withdrawFromGoal', () => {
    const initialWallets = [
      { id: 'wallet_bca', name: 'BCA Utama', balance: 10000000 }
    ];
    const initialGoals = [
      {
        id: 'goal_darurat',
        name: 'Dana Darurat',
        current: 18000000,
        target: 30000000,
        targetDate: '2027-12-31',
        isLocked: true
      },
      {
        id: 'goal_liburan',
        name: 'Liburan Akhir Tahun',
        current: 7500000,
        target: 15000000,
        targetDate: '2026-12-25',
        isLocked: false
      }
    ];

    it('blocks withdrawal and prompts anti-khilaf alert if goal is locked before target date', () => {
      const res = withdrawFromGoal(initialGoals, initialWallets, {
        goalId: 'goal_darurat',
        walletId: 'wallet_bca',
        amount: 3000000,
        currentDate: new Date('2026-11-08')
      });

      assert.equal(res.success, false);
      assert.equal(res.requiresConfirmation, true);
      assert.equal(res.error, 'GOAL_LOCKED');
      assert.ok(res.message.includes('Dana Darurat'));
    });

    it('allows withdrawal when goal is unlocked', () => {
      const res = withdrawFromGoal(initialGoals, initialWallets, {
        goalId: 'goal_liburan',
        walletId: 'wallet_bca',
        amount: 2500000,
        currentDate: new Date('2026-11-08')
      });

      assert.equal(res.success, true);
      assert.equal(res.updatedGoals.find(g => g.id === 'goal_liburan').current, 5000000);
      assert.equal(res.updatedWallets.find(w => w.id === 'wallet_bca').balance, 12500000);
      assert.equal(res.transaction.type, 'income');
      assert.equal(res.transaction.category, 'Pencairan Tabungan');
    });

    it('allows withdrawal on a locked goal if forceOverride is true (user confirmed anti-khilaf dialog)', () => {
      const res = withdrawFromGoal(initialGoals, initialWallets, {
        goalId: 'goal_darurat',
        walletId: 'wallet_bca',
        amount: 3000000,
        forceOverride: true,
        currentDate: new Date('2026-11-08')
      });

      assert.equal(res.success, true);
      assert.equal(res.updatedGoals.find(g => g.id === 'goal_darurat').current, 15000000);
      assert.equal(res.updatedWallets.find(w => w.id === 'wallet_bca').balance, 13000000);
    });

    it('fails when withdrawal amount exceeds saved goal balance', () => {
      const res = withdrawFromGoal(initialGoals, initialWallets, {
        goalId: 'goal_liburan',
        walletId: 'wallet_bca',
        amount: 20000000
      });

      assert.equal(res.success, false);
      assert.equal(res.error, 'SALDO_TABUNGAN_TIDAK_CUKUP');
    });
  });

  describe('INITIAL_SAVINGS_TEMPLATES', () => {
    it('provides 4 standard financial goal templates', () => {
      assert.equal(INITIAL_SAVINGS_TEMPLATES.length, 4);
      const names = INITIAL_SAVINGS_TEMPLATES.map(t => t.name);
      assert.ok(names.includes('Dana Darurat 6 Bulan'));
      assert.ok(names.includes('Liburan Akhir Tahun (Jepang)'));
      assert.ok(names.includes('Upgrade MacBook Pro M-Series'));
      assert.ok(names.includes('DP Rumah / Properti'));
    });
  });
});
