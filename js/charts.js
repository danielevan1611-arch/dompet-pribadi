/**
 * DompetKu - Visual Analytics with Chart.js
 */

let donutChartInstance = null;
let barChartInstance = null;

const CATEGORY_COLORS = {
  'Makanan & Minuman': '#f97316',
  'Transportasi': '#06b6d4',
  'Belanja & Kebutuhan': '#a855f7',
  'Tagihan & Utilitas': '#ef4444',
  'Hiburan & Rekreasi': '#ec4899',
  'Kesehatan': '#10b981',
  'Gaji & Pemasukan': '#22c55e',
  'Lainnya': '#64748b'
};

export function updateDonutChart(canvasElement, transactions = []) {
  if (!canvasElement || typeof window.Chart === 'undefined') return;

  const expenses = transactions.filter(t => t.type === 'expense');
  const catTotals = {};

  for (const t of expenses) {
    const cat = t.category || 'Lainnya';
    catTotals[cat] = (catTotals[cat] || 0) + Number(t.amount);
  }

  const labels = Object.keys(catTotals);
  const data = Object.values(catTotals);
  const colors = labels.map(l => CATEGORY_COLORS[l] || '#94a3b8');

  if (donutChartInstance) {
    donutChartInstance.destroy();
  }

  if (labels.length === 0) {
    labels.push('Belum ada transaksi');
    data.push(1);
    colors.push('#334155');
  }

  donutChartInstance = new window.Chart(canvasElement, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#0f172a'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#94a3b8',
            font: { family: 'Inter, sans-serif', size: 11 },
            boxWidth: 12,
            padding: 14
          }
        },
        tooltip: {
          callbacks: {
            label: context => {
              const val = context.raw || 0;
              return ` ${context.label}: Rp ${val.toLocaleString('id-ID')}`;
            }
          }
        }
      },
      cutout: '68%'
    }
  });
}

export function updateBarChart(canvasElement, transactions = []) {
  if (!canvasElement || typeof window.Chart === 'undefined') return;

  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of transactions) {
    if (t.type === 'income') totalIncome += Number(t.amount);
    if (t.type === 'expense') totalExpense += Number(t.amount);
  }

  if (barChartInstance) {
    barChartInstance.destroy();
  }

  barChartInstance = new window.Chart(canvasElement, {
    type: 'bar',
    data: {
      labels: ['Pemasukan', 'Pengeluaran'],
      datasets: [
        {
          label: 'Arus Kas (Rp)',
          data: [totalIncome, totalExpense],
          backgroundColor: ['#22c55e', '#ef4444'],
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          ticks: {
            color: '#64748b',
            callback: value => 'Rp ' + (value >= 1000000 ? (value / 1000000) + 'jt' : value.toLocaleString('id-ID'))
          },
          grid: { color: '#1e293b' }
        },
        x: {
          ticks: { color: '#94a3b8' },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: context => ` Rp ${(context.raw || 0).toLocaleString('id-ID')}`
          }
        }
      }
    }
  });
}
