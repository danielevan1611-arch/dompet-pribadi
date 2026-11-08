import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createWallet,
  addTransaction,
  getVisibleWallets,
  getVisibleTransactions,
  calculateNetWorth
} from '../js/store.js';

describe('Store Engine & Privacy Isolation', () => {
  const userA = 'user_a';
  const userB = 'user_b';
  const coupleId = 'couple_123';

  it('should isolate private wallets and show shared wallets to both partners', () => {
    const walletA = createWallet({ id: 'w1', ownerId: userA, coupleId, name: 'BCA A', type: 'bank', balance: 5000000, visibility: 'private' });
    const walletB = createWallet({ id: 'w2', ownerId: userB, coupleId, name: 'Mandiri B', type: 'bank', balance: 3000000, visibility: 'private' });
    const walletShared = createWallet({ id: 'w3', ownerId: userA, coupleId, name: 'Kas Kencan', type: 'cash', balance: 1000000, visibility: 'shared' });

    const allWallets = [walletA, walletB, walletShared];

    const visibleToA = getVisibleWallets(allWallets, userA);
    const visibleToB = getVisibleWallets(allWallets, userB);

    assert.equal(visibleToA.length, 2);
    assert.deepEqual(visibleToA.map(w => w.id), ['w1', 'w3']);

    assert.equal(visibleToB.length, 2);
    assert.deepEqual(visibleToB.map(w => w.id), ['w2', 'w3']);
  });

  it('should isolate private transactions and share couple transactions', () => {
    const txA = { id: 't1', createdBy: userA, coupleId, type: 'expense', amount: 50000, visibility: 'private' };
    const txB = { id: 't2', createdBy: userB, coupleId, type: 'expense', amount: 35000, visibility: 'private' };
    const txShared = { id: 't3', createdBy: userA, coupleId, type: 'expense', amount: 150000, visibility: 'shared' };

    const allTxs = [txA, txB, txShared];

    const txsForA = getVisibleTransactions(allTxs, userA);
    const txsForB = getVisibleTransactions(allTxs, userB);

    assert.equal(txsForA.length, 2);
    assert.deepEqual(txsForA.map(t => t.id), ['t1', 't3']);

    assert.equal(txsForB.length, 2);
    assert.deepEqual(txsForB.map(t => t.id), ['t2', 't3']);
  });

  it('should accurately update wallet balances on income, expense, and transfer', () => {
    const w1 = createWallet({ id: 'w1', ownerId: userA, coupleId, balance: 100000, visibility: 'private' });
    const w2 = createWallet({ id: 'w2', ownerId: userA, coupleId, balance: 50000, visibility: 'private' });
    let wallets = [w1, w2];

    // Expense
    wallets = addTransaction(wallets, { type: 'expense', walletId: 'w1', amount: 20000 });
    assert.equal(wallets.find(w => w.id === 'w1').balance, 80000);

    // Income
    wallets = addTransaction(wallets, { type: 'income', walletId: 'w1', amount: 50000 });
    assert.equal(wallets.find(w => w.id === 'w1').balance, 130000);

    // Transfer
    wallets = addTransaction(wallets, { type: 'transfer', walletId: 'w1', targetWalletId: 'w2', amount: 30000 });
    assert.equal(wallets.find(w => w.id === 'w1').balance, 100000);
    assert.equal(wallets.find(w => w.id === 'w2').balance, 80000);
  });

  it('should calculate net worth based on visibility mode', () => {
    const wA = createWallet({ id: 'w1', ownerId: userA, coupleId, balance: 5000000, visibility: 'private' });
    const wB = createWallet({ id: 'w2', ownerId: userB, coupleId, balance: 3000000, visibility: 'private' });
    const wShared = createWallet({ id: 'w3', ownerId: userA, coupleId, balance: 2000000, visibility: 'shared' });
    const allWallets = [wA, wB, wShared];

    // User A personal net worth: private + shared
    assert.equal(calculateNetWorth(allWallets, userA, 'all'), 7000000);
    // User A personal only (excluding shared)
    assert.equal(calculateNetWorth(allWallets, userA, 'personal'), 5000000);
    // Shared only
    assert.equal(calculateNetWorth(allWallets, userA, 'shared'), 2000000);

    // User B personal net worth
    assert.equal(calculateNetWorth(allWallets, userB, 'all'), 5000000);
    assert.equal(calculateNetWorth(allWallets, userB, 'personal'), 3000000);
  });
});
