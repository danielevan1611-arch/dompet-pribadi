/**
 * DompetKu - Visual Analytics with Chart.js
 */

let donutChartInstance = null;
let barChartInstance = null;

const CATEGORY_COLORS = {
  'Makanan & Minuman': '#FF9500', // Apple Orange
  'Transportasi': '#30B0C7',      // Apple Teal
  'Belanja & Kebutuhan': '#AF52DE',// Apple Purple
  'Tagihan & Utilitas': '#FF3B30', // Apple Red
  'Hiburan & Rekreasi': '#FF2D55', // Apple Pink
  'Kesehatan': '#34C759',          // Apple Green
  'Gaji & Pemasukan': '#30D158',   // Apple Bright Green
  'Lainnya': '#8E8E93'             // Apple Gray
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
    labels.push('Belum ada pengeluaran');
    data.push(1);
    colors.push('#2C2C2E');
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
          borderColor: '#1C1C1E'
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
            color: '#8E8E93',
            font: { family: '-apple-system, sans-serif', size: 11 },
            boxWidth: 10,
            padding: 10
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
      cutout: '72%'
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
          backgroundColor: ['#34C759', '#FF3B30'],
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          ticks: {
            color: '#8E8E93',
            callback: value => 'Rp ' + (value >= 1000000 ? (value / 1000000) + 'jt' : value.toLocaleString('id-ID'))
          },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        x: {
          ticks: { color: '#8E8E93' },
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
