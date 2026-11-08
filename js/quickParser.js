/**
 * DompetKu - Natural Language Quick Input Parser
 */

const CATEGORY_KEYWORDS = {
  'Makanan & Minuman': [
    'makan', 'sarapan', 'lunch', 'dinner', 'nasi', 'bakso', 'mie', 'soto', 'ayam',
    'kopi', 'coffee', 'cafe', 'warteg', 'mcd', 'kfc', 'gofood', 'grabfood', 'shopeefood',
    'snack', 'minum', 'jus', 'roti', 'martabak', 'boba'
  ],
  'Transportasi': [
    'bensin', 'spbu', 'pertalite', 'pertamax', 'solar', 'parkir', 'grab', 'gojek',
    'tol', 'kereta', 'krl', 'mrt', 'busway', 'servis', 'oli', 'tambal', 'cuci motor', 'cuci mobil'
  ],
  'Belanja & Kebutuhan': [
    'indomaret', 'alfamart', 'supermarket', 'belanja', 'baju', 'sabun', 'shopee',
    'tokopedia', 'lazada', 'tiktok shop', 'skincare', 'shampoo'
  ],
  'Tagihan & Utilitas': [
    'pln', 'listrik', 'pdam', 'air', 'wifi', 'indihome', 'biznet', 'pulsa', 'kuota',
    'netflix', 'spotify', 'youtube', 'iuran', 'kontrakan', 'kost'
  ],
  'Hiburan & Rekreasi': [
    'nonton', 'bioskop', 'xxi', 'cinema', 'game', 'steam', 'liburan', 'hotel',
    'staycation', 'tiket', 'karaoke', 'wisata'
  ],
  'Kesehatan': [
    'obat', 'apotek', 'dokter', 'vitamin', 'klinik', 'rs', 'masker', 'suplemen'
  ],
  'Gaji & Pemasukan': [
    'gaji', 'bonus', 'thr', 'dividen', 'cashback', 'refund', 'proyek', 'freelance'
  ]
};

const SHARED_KEYWORDS = ['bersama', 'bareng', 'kencan', 'patungan', 'berdua', 'couple'];

export function parseQuickInput(text = '', availableWallets = [], defaultWalletId = null) {
  if (!text || typeof text !== 'string') {
    return {
      amount: 0,
      category: 'Lainnya',
      walletId: defaultWalletId,
      visibility: 'private',
      note: ''
    };
  }

  let workingText = text.trim();
  let amount = 0;
  let category = 'Lainnya';
  let visibility = 'private';
  let matchedWalletId = defaultWalletId;

  // 1. Detect Shared Flag
  const lower = workingText.toLowerCase();
  for (const sharedWord of SHARED_KEYWORDS) {
    const regex = new RegExp(`\\b${sharedWord}\\b`, 'i');
    if (regex.test(workingText)) {
      visibility = 'shared';
      workingText = workingText.replace(regex, ' ');
      break;
    }
  }

  // 2. Detect Amount
  // Pattern A: Multiplier 'k', 'rb', 'ribu' (e.g. 15k, 25.5rb, 100 ribu)
  const kPattern = /\b(\d+(?:[.,]\d+)?)\s*(k|rb|ribu)\b/i;
  const jtPattern = /\b(\d+(?:[.,]\d+)?)\s*(jt|juta)\b/i;
  const standardDotPattern = /\b(\d{1,3}(?:\.\d{3})+)\b/;
  const plainNumberPattern = /\b(\d+)\b/;

  let amountMatch = workingText.match(kPattern);
  if (amountMatch) {
    const base = parseFloat(amountMatch[1].replace(',', '.'));
    amount = Math.round(base * 1000);
    workingText = workingText.replace(amountMatch[0], ' ');
  } else if ((amountMatch = workingText.match(jtPattern))) {
    const base = parseFloat(amountMatch[1].replace(',', '.'));
    amount = Math.round(base * 1000000);
    workingText = workingText.replace(amountMatch[0], ' ');
  } else if ((amountMatch = workingText.match(standardDotPattern))) {
    amount = parseInt(amountMatch[1].replace(/\./g, ''), 10);
    workingText = workingText.replace(amountMatch[0], ' ');
  } else if ((amountMatch = workingText.match(plainNumberPattern))) {
    amount = parseInt(amountMatch[1], 10);
    workingText = workingText.replace(amountMatch[0], ' ');
  }

  // 3. Detect Wallet
  if (Array.isArray(availableWallets) && availableWallets.length > 0) {
    for (const wallet of availableWallets) {
      const walletName = wallet.name.toLowerCase();
      const regex = new RegExp(`\\b${walletName}\\b`, 'i');
      if (regex.test(workingText)) {
        matchedWalletId = wallet.id;
        workingText = workingText.replace(regex, ' ');
        break;
      }
      // Check common alias if wallet is cash / tunai
      if ((walletName.includes('cash') || walletName.includes('tunai')) && /\b(cash|tunai)\b/i.test(workingText)) {
        matchedWalletId = wallet.id;
        workingText = workingText.replace(/\b(cash|tunai)\b/i, ' ');
        break;
      }
    }
  }

  // 4. Detect Category
  const cleanedLower = workingText.toLowerCase();
  categoryLoop: for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(cleanedLower)) {
        category = catName;
        break categoryLoop;
      }
    }
  }

  // 5. Clean Note
  let cleanNote = workingText.replace(/\s+/g, ' ').trim();
  if (!cleanNote) {
    cleanNote = text.trim();
  }

  return {
    amount,
    category,
    walletId: matchedWalletId,
    visibility,
    note: cleanNote
  };
}
