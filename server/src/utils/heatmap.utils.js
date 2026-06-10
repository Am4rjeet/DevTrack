export const getHeatmapLevel = (totalMinutes) => {
  if (!totalMinutes || totalMinutes === 0) return 0;
  if (totalMinutes < 30) return 1;
  if (totalMinutes < 60) return 2;
  if (totalMinutes < 120) return 3;
  return 4;
};

export const buildHeatmapGrid = (dailyData, days = 365) => {
  const dataMap = new Map(dailyData.map((d) => [d._id || d.date, d]));

  const grid = [];
  const end = new Date();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - days + 1);

  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    const entry = dataMap.get(key);
    const totalMinutes = entry?.totalMinutes ?? 0;
    const count = entry?.count ?? 0;

    grid.push({
      date: key,
      totalMinutes,
      count,
      level: getHeatmapLevel(totalMinutes),
    });
  }

  return grid;
};
