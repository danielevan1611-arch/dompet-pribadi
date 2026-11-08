/**
 * DompetKu - Smart Split Bill Engine
 * Customized for Indonesian Restaurant & Cafe Taxation (PB1 10% & Service Charge 5-10%)
 */

export function calculateSplitBill({
  items = [],
  participants = [],
  servicePercent = 5,
  taxPercent = 10
}) {
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * (Number(item.quantity) || 1)), 0);
  const serviceCharge = Math.round(subtotal * (servicePercent / 100));
  const taxableAmount = subtotal + serviceCharge;
  const tax = Math.round(taxableAmount * (taxPercent / 100));
  const grandTotal = subtotal + serviceCharge + tax;

  // Initialize participant breakdown
  const breakdown = {};
  participants.forEach(p => {
    breakdown[p] = {
      name: p,
      items: [],
      itemSubtotal: 0,
      serviceCharge: 0,
      tax: 0,
      totalOwed: 0
    };
  });

  // Distribute items among assigned participants
  items.forEach(item => {
    const itemTotal = Number(item.price || 0) * (Number(item.quantity) || 1);
    const assigned = item.assignedTo && item.assignedTo.length > 0 ? item.assignedTo : participants;
    const sharePerPerson = itemTotal / assigned.length;

    assigned.forEach(p => {
      if (!breakdown[p]) {
        breakdown[p] = {
          name: p,
          items: [],
          itemSubtotal: 0,
          serviceCharge: 0,
          tax: 0,
          totalOwed: 0
        };
      }
      breakdown[p].items.push({
        name: item.name,
        share: Math.round(sharePerPerson)
      });
      breakdown[p].itemSubtotal += sharePerPerson;
    });
  });

  // Calculate proportional service charge and PB1 tax per participant
  // Multiplier for Indonesian Tax: (1 + service%) * (1 + tax%)
  const combinedMultiplier = subtotal > 0 ? (grandTotal / subtotal) : 1;

  participants.forEach(p => {
    const pData = breakdown[p];
    if (pData) {
      pData.itemSubtotal = Math.round(pData.itemSubtotal);
      pData.serviceCharge = Math.round(pData.itemSubtotal * (servicePercent / 100));
      pData.tax = Math.round((pData.itemSubtotal + pData.serviceCharge) * (taxPercent / 100));
      pData.totalOwed = pData.itemSubtotal + pData.serviceCharge + pData.tax;
    }
  });

  return {
    subtotal,
    servicePercent,
    serviceCharge,
    taxPercent,
    tax,
    grandTotal,
    breakdown
  };
}

export function formatWhatsAppBillSummary({
  splitResult,
  bankAccount = '',
  placeName = 'Resto / Cafe'
}) {
  const { subtotal, servicePercent, serviceCharge, taxPercent, tax, grandTotal, breakdown } = splitResult;

  const lines = [
    `🧾 *Rincian Split Bill: ${placeName}*`,
    `📅 ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`,
    '━━━━━━━━━━━━━━━━━━━━',
    ...Object.values(breakdown).map(p => {
      const itemsList = p.items.map(it => it.name).join(', ') || 'Menu';
      return `👤 *${p.name}:* Rp ${p.totalOwed.toLocaleString('id-ID')}\n   ↳ _(${itemsList})_`;
    }),
    '━━━━━━━━━━━━━━━━━━━━',
    `Subtotal: Rp ${subtotal.toLocaleString('id-ID')}`,
    `Service (${servicePercent}%): Rp ${serviceCharge.toLocaleString('id-ID')}`,
    `PB1 / Resto Tax (${taxPercent}%): Rp ${tax.toLocaleString('id-ID')}`,
    `*Total Bill:* Rp ${grandTotal.toLocaleString('id-ID')}`
  ];

  if (bankAccount) {
    lines.push('━━━━━━━━━━━━━━━━━━━━');
    lines.push(`💳 *Transfer ke:*\n${bankAccount}`);
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('⚡ _Dihitung otomatis via DompetKu Splitter_');

  return lines.join('\n');
}
