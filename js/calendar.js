/**
 * DompetKu - Financial Calendar Engine
 * Computes daily income/expense aggregations and month grid
 */

export function aggregateTransactionsByDate(transactions = []) {
  const daily = {};

  transactions.forEach(t => {
    if (!t.date) return;
    const dateKey = t.date.split('T')[0];
    if (!daily[dateKey]) {
      daily[dateKey] = {
        income: 0,
        expense: 0,
        count: 0
      };
    }

    const amt = Number(t.amount) || 0;
    if (t.type === 'income') {
      daily[dateKey].income += amt;
    } else {
      daily[dateKey].expense += amt;
    }
    daily[dateKey].count += 1;
  });

  return daily;
}

export function getMonthCalendarDays(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const totalDays = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sun, 1 = Mon ...

  const days = [];

  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, monthIndex, d);
    const dateString = dateObj.toISOString().split('T')[0];
    days.push({
      dayNumber: d,
      dateString,
      dayOfWeek: dateObj.getDay()
    });
  }

  return days;
}
