/**
 * DompetKu - Visual Analytics with Chart.js
 * Apple Ecosystem Edition (iOS 17 / macOS Sonoma)
 */

let donutChartInstance = null;
let barChartInstance = null;

export const CATEGORY_COLORS = {
  'Makanan & Minuman': '#FF9F0A', // Apple Orange
  'Transportasi': '#0A84FF',      // Apple Blue
  'Belanja & Kebutuhan': '#BF5AF2',// Apple Purple
  'Tagihan & Utilitas': '#FF453A', // Apple Red
  'Hiburan & Rekreasi': '#FF2D55', // Apple Pink
  'Kesehatan': '#30D158',          // Apple Green
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
  const colors = labels.map(l => CATEGORY_COLORS[l] || '#8E8E93');

  let totalExpense = data.reduce((sum, val) => sum + val, 0);

  const isLightMode = typeof document !== 'undefined' && document.documentElement.classList.contains('light');

  if (labels.length === 0) {
    labels.push('Belum Ada Pengeluaran');
    data.push(1);
    colors.push(isLightMode ? '#E5E5EA' : '#2C2C2E');
    totalExpense = 0;
  }

  // Update center total display
  const centerAmount = document.getElementById('donutCenterAmount');
  const centerLabel = document.getElementById('donutCenterLabel');
  if (centerAmount) {
    centerAmount.textContent = totalExpense === 0 ? 'Rp 0' : `Rp ${totalExpense.toLocaleString('id-ID')}`;
  }
  if (centerLabel) {
    centerLabel.textContent = totalExpense === 0 ? 'Belum Ada Belanja' : 'Total Belanja';
  }

  if (donutChartInstance) {
    donutChartInstance.destroy();
  }

  donutChartInstance = new window.Chart(canvasElement, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 0,
          borderRadius: 8,
          spacing: 4,
          hoverOffset: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '78%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(28, 28, 30, 0.92)',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          cornerRadius: 10,
          padding: 8,
          callbacks: {
            label: context => {
              const val = context.raw || 0;
              return ` ${context.label}: Rp ${val.toLocaleString('id-ID')}`;
            }
          }
        }
      }
    }
  });
}

export function updateBarChart(canvasElement, transactions = []) {
  if (!canvasElement || typeof window.Chart === 'undefined') return;

  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const incomeData = [0, 0, 0, 0, 0, 0, 0];
  const expenseData = [0, 0, 0, 0, 0, 0, 0];

  transactions.forEach(t => {
    const d = new Date(t.date);
    const dayIdx = d.getDay();
    if (t.type === 'income') incomeData[dayIdx] += Number(t.amount);
    else if (t.type === 'expense') expenseData[dayIdx] += Number(t.amount);
  });

  if (barChartInstance) {
    barChartInstance.destroy();
  }

  barChartInstance = new window.Chart(canvasElement, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [
        {
          label: 'Pemasukan',
          data: incomeData,
          backgroundColor: '#30D158', // Apple Green
          borderRadius: 12,
          barThickness: 16
        },
        {
          label: 'Pengeluaran',
          data: expenseData,
          backgroundColor: '#FF453A', // Apple Red
          borderRadius: 12,
          barThickness: 16
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
            font: { family: '-apple-system, sans-serif', size: 10 },
            callback: value => 'Rp ' + (value >= 1000000 ? (value / 1000000) + 'jt' : value >= 1000 ? (value / 1000) + 'k' : value)
          },
          grid: {
            color: 'rgba(142, 142, 147, 0.08)',
            borderDash: [3, 3]
          },
          border: { display: false }
        },
        x: {
          ticks: {
            color: '#8E8E93',
            font: { family: '-apple-system, sans-serif', size: 11, weight: 500 }
          },
          grid: { display: false },
          border: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(28, 28, 30, 0.92)',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          cornerRadius: 10,
          padding: 8,
          displayColors: false,
          callbacks: {
            label: context => ` ${context.dataset.label}: Rp ${(context.raw || 0).toLocaleString('id-ID')}`
          }
        }
      }
    }
  });
}
