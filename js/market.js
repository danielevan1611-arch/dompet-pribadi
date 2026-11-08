/**
 * DompetKu - Real-Time Market & Investment Engine
 * Supports Indonesian Stock Exchange (IDX/IHSG), Precious Metals (Antam/Gold), and Crypto
 */

export const INITIAL_MARKET_INSTRUMENTS = [
  // --- INDONESIAN STOCKS & COMPOSITE ---
  {
    symbol: 'IHSG',
    name: 'Indeks Harga Saham Gabungan',
    category: 'stock',
    priceIDR: 7285.40,
    change24h: 0.42,
    high24h: 7310.20,
    low24h: 7260.10,
    sparkline: [7265, 7272, 7268, 7290, 7280, 7295, 7285.4],
    icon: 'activity',
    badge: 'IDX'
  },
  {
    symbol: 'BBCA',
    name: 'Bank Central Asia Tbk',
    category: 'stock',
    priceIDR: 10250,
    change24h: 1.23,
    high24h: 10300,
    low24h: 10125,
    sparkline: [10150, 10175, 10200, 10175, 10225, 10275, 10250],
    icon: 'building-2',
    badge: 'Saham'
  },
  {
    symbol: 'BBRI',
    name: 'Bank Rakyat Indonesia Tbk',
    category: 'stock',
    priceIDR: 4680,
    change24h: -0.64,
    high24h: 4740,
    low24h: 4650,
    sparkline: [4720, 4710, 4730, 4700, 4670, 4660, 4680],
    icon: 'landmark',
    badge: 'Saham'
  },
  {
    symbol: 'BMRI',
    name: 'Bank Mandiri (Persero) Tbk',
    category: 'stock',
    priceIDR: 6550,
    change24h: 0.77,
    high24h: 6600,
    low24h: 6475,
    sparkline: [6500, 6525, 6500, 6550, 6525, 6575, 6550],
    icon: 'landmark',
    badge: 'Saham'
  },
  {
    symbol: 'TLKM',
    name: 'Telkom Indonesia Tbk',
    category: 'stock',
    priceIDR: 2820,
    change24h: -1.05,
    high24h: 2870,
    low24h: 2800,
    sparkline: [2860, 2850, 2840, 2830, 2810, 2830, 2820],
    icon: 'radio',
    badge: 'Saham'
  },
  {
    symbol: 'ASII',
    name: 'Astra International Tbk',
    category: 'stock',
    priceIDR: 5050,
    change24h: 0.50,
    high24h: 5125,
    low24h: 5000,
    sparkline: [5025, 5000, 5050, 5075, 5025, 5075, 5050],
    icon: 'car',
    badge: 'Saham'
  },

  // --- PRECIOUS METALS ---
  {
    symbol: 'ANTAM',
    name: 'Emas Batangan Antam',
    category: 'gold',
    priceIDR: 1485000,
    unit: 'gram',
    change24h: 0.68,
    high24h: 1490000,
    low24h: 1478000,
    sparkline: [1475000, 1478000, 1480000, 1482000, 1486000, 1484000, 1485000],
    icon: 'coins',
    badge: 'Logam Mulia'
  },
  {
    symbol: 'XAU',
    name: 'Spot Gold Dunia',
    category: 'gold',
    priceUSD: 2684.50,
    priceIDR: 42549325, // ~1 troy ounce = 31.1035g
    unit: 'oz',
    change24h: 0.85,
    high24h: 2692.00,
    low24h: 2668.20,
    sparkline: [2670, 2675, 2672, 2680, 2688, 2682, 2684.5],
    icon: 'gem',
    badge: 'XAU/USD'
  },

  // --- CRYPTO MAJORS ---
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    category: 'crypto',
    priceUSD: 96425,
    priceIDR: 1542800000,
    change24h: 3.15,
    high24h: 97200,
    low24h: 93400,
    sparkline: [93800, 94500, 95100, 94800, 96000, 96800, 96425],
    icon: 'circle-dollar-sign',
    badge: 'Crypto'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    category: 'crypto',
    priceUSD: 3410,
    priceIDR: 54560000,
    change24h: 2.40,
    high24h: 3480,
    low24h: 3310,
    sparkline: [3320, 3360, 3390, 3370, 3430, 3450, 3410],
    icon: 'layers',
    badge: 'Crypto'
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    category: 'crypto',
    priceUSD: 220,
    priceIDR: 3520000,
    change24h: 5.80,
    high24h: 228,
    low24h: 206,
    sparkline: [208, 212, 215, 218, 225, 222, 220],
    icon: 'zap',
    badge: 'Crypto'
  },
  {
    symbol: 'BNB',
    name: 'BNB Chain',
    category: 'crypto',
    priceUSD: 645,
    priceIDR: 10320000,
    change24h: 1.10,
    high24h: 655,
    low24h: 638,
    sparkline: [640, 642, 641, 646, 648, 644, 645],
    icon: 'shield',
    badge: 'Crypto'
  },
  {
    symbol: 'XRP',
    name: 'Ripple',
    category: 'crypto',
    priceUSD: 2.30,
    priceIDR: 36800,
    change24h: 4.25,
    high24h: 2.45,
    low24h: 2.18,
    sparkline: [2.20, 2.24, 2.28, 2.25, 2.35, 2.32, 2.30],
    icon: 'repeat',
    badge: 'Crypto'
  }
];

/**
 * Calculates asset valuation based on instrument type and unit conventions.
 * Stocks: 1 lot = 100 shares in Indonesia (IDX)
 */
export function calculateAssetValuation({ type, units, buyPrice, currentPrice }) {
  const numUnits = Number(units) || 0;
  const numBuyPrice = Number(buyPrice) || 0;
  const numCurrentPrice = Number(currentPrice) || 0;

  let multiplier = 1;
  if (type === 'stock') {
    multiplier = 100; // 1 lot = 100 shares
  }

  const totalCost = numUnits * multiplier * numBuyPrice;
  const currentValue = numUnits * multiplier * numCurrentPrice;
  const pnlNominal = currentValue - totalCost;
  const pnlPercentage = totalCost > 0 ? (pnlNominal / totalCost) * 100 : 0;

  return {
    totalCost,
    currentValue,
    pnlNominal,
    pnlPercentage
  };
}

/**
 * Aggregates a list of personal portfolio holdings against latest prices.
 */
export function calculatePortfolioSummary(holdingsList = [], priceMap = {}) {
  let totalCost = 0;
  let totalValuation = 0;

  holdingsList.forEach(holding => {
    const curPrice = priceMap[holding.symbol] !== undefined ? priceMap[holding.symbol] : holding.buyPrice;
    const val = calculateAssetValuation({
      type: holding.type,
      units: holding.units,
      buyPrice: holding.buyPrice,
      currentPrice: curPrice
    });

    totalCost += val.totalCost;
    totalValuation += val.currentValue;
  });

  const totalPnlNominal = totalValuation - totalCost;
  const totalPnlPercentage = totalCost > 0 ? (totalPnlNominal / totalCost) * 100 : 0;

  return {
    totalCost,
    totalValuation,
    totalPnlNominal,
    totalPnlPercentage
  };
}

/**
 * Generates an authentic micro-jitter tick for real-time streaming simulations.
 * Bound by max volatility percentage (e.g. ±0.2%).
 */
export function generateNextTick(currentPrice, volatility = 0.0015) {
  const deltaFactor = 1 + (Math.random() * 2 - 1) * volatility;
  const newPrice = currentPrice * deltaFactor;
  // Round sensibly based on price scale
  if (newPrice > 1000) return Math.round(newPrice);
  if (newPrice > 10) return Math.round(newPrice * 100) / 100;
  return Math.round(newPrice * 1000) / 1000;
}
