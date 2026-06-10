export const PERIODS = ['daily', 'weekly', 'monthly', 'alltime'];

export const getPeriodBounds = (period, referenceDate = new Date()) => {
  const ref = new Date(referenceDate);
  let periodStart;
  let periodEnd;

  switch (period) {
    case 'daily': {
      periodStart = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate()));
      periodEnd = new Date(periodStart);
      periodEnd.setUTCDate(periodEnd.getUTCDate() + 1);
      break;
    }
    case 'weekly': {
      const day = ref.getUTCDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      periodStart = new Date(
        Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate() + diffToMonday)
      );
      periodEnd = new Date(periodStart);
      periodEnd.setUTCDate(periodEnd.getUTCDate() + 7);
      break;
    }
    case 'monthly': {
      periodStart = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), 1));
      periodEnd = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() + 1, 1));
      break;
    }
    case 'alltime':
      periodStart = new Date(0);
      periodEnd = new Date();
      break;
    default:
      throw new Error(`Invalid period: ${period}`);
  }

  return { periodStart, periodEnd };
};

export const getDefaultDateRange = (days = 30) => {
  const to = new Date();
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - days);
  return { from, to };
};
