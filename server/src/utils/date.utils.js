export const normalizeToUtcMidnight = (date) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

export const daysBetweenUtc = (dateA, dateB) => {
  const a = normalizeToUtcMidnight(dateA).getTime();
  const b = normalizeToUtcMidnight(dateB).getTime();
  return Math.round((b - a) / (24 * 60 * 60 * 1000));
};

export const isSameUtcDay = (dateA, dateB) => daysBetweenUtc(dateA, dateB) === 0;

export const isYesterdayUtc = (date, reference = new Date()) =>
  daysBetweenUtc(date, reference) === 1;
