/**
 * DompetKu - Receipt & Transfer OCR Text Extractor
 */

export function extractPaymentDetailsFromText(rawText = '') {
  if (!rawText || typeof rawText !== 'string') {
    return {
      amount: 0,
      date: new Date().toISOString(),
      type: 'expense',
      note: 'Struk Belanja'
    };
  }

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let amount = 0;
  let note = '';
  let date = new Date().toISOString();
  let type = 'expense';

  // 1. Amount Extraction (Prioritizing Total, Jumlah, Nominal, Rp)
  const totalRegexes = [
    /(?:total bayar|grand total|total belanja|total)\s*[:=]?\s*(?:rp\.?|idr)?\s*([\d.,]+)/i,
    /(?:jumlah|nominal|transfer)\s*[:=]?\s*(?:rp\.?|idr)?\s*([\d.,]+)/i,
    /(?:rp\.?|idr)\s*([\d.,]+)/i
  ];

  for (const regex of totalRegexes) {
    const match = rawText.match(regex);
    if (match && match[1]) {
      let numStr = match[1].trim();
      // If ends with ,00 or .00 (cents), remove it
      numStr = numStr.replace(/[,.]00$/, '');
      // Remove thousand separator dots/commas
      const parsed = parseInt(numStr.replace(/[.,]/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed;
        break;
      }
    }
  }

  // 2. Note / Merchant / Berita Extraction
  const merchantMatch = rawText.match(/(?:merchant|toko|tempat)\s*[:=]?\s*([^\n\r]+)/i);
  const beritaMatch = rawText.match(/(?:berita|keterangan|catatan)\s*[:=]?\s*([^\n\r]+)/i);

  if (beritaMatch && beritaMatch[1]) {
    note = beritaMatch[1].trim();
  } else if (merchantMatch && merchantMatch[1]) {
    note = merchantMatch[1].trim();
  } else {
    // Look for recognizable merchant names in lines
    for (const line of lines) {
      if (/indomaret|alfamart|kopi|mcdonald|kfc|starbucks|pertamina|spbu/i.test(line)) {
        note = line;
        break;
      }
    }
  }

  if (!note) {
    if (/m-transfer|transfer/i.test(rawText)) {
      note = 'Bukti Transfer';
    } else {
      note = 'Struk Pembayaran';
    }
  }

  // 3. Date Extraction
  const dateMatch = rawText.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = dateMatch[2].padStart(2, '0');
    let year = dateMatch[3];
    if (year.length === 2) year = `20${year}`;
    date = `${year}-${month}-${day}T12:00:00.000Z`;
  }

  return {
    amount,
    date,
    type,
    note
  };
}

/**
 * Browser-side OCR Worker using Tesseract.js (loaded via window.Tesseract)
 */
export async function scanReceiptWithTesseract(imageSource, onProgress = () => {}) {
  if (typeof window === 'undefined' || !window.Tesseract) {
    throw new Error('Tesseract.js library not loaded in browser environment');
  }

  const worker = await window.Tesseract.createWorker('ind+eng', 1, {
    logger: m => {
      if (m.status === 'recognizing text') {
        onProgress(Math.round(m.progress * 100));
      }
    }
  });

  const { data: { text } } = await worker.recognize(imageSource);
  await worker.terminate();

  return extractPaymentDetailsFromText(text);
}
