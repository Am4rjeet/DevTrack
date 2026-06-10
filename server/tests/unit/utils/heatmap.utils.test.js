import { getHeatmapLevel, buildHeatmapGrid } from '../../../src/utils/heatmap.utils.js';

describe('Heatmap Utils', () => {
  it('should return correct intensity levels', () => {
    expect(getHeatmapLevel(0)).toBe(0);
    expect(getHeatmapLevel(15)).toBe(1);
    expect(getHeatmapLevel(45)).toBe(2);
    expect(getHeatmapLevel(90)).toBe(3);
    expect(getHeatmapLevel(180)).toBe(4);
  });

  it('should build a continuous date grid', () => {
    const grid = buildHeatmapGrid(
      [{ _id: '2026-06-01', totalMinutes: 60, count: 1 }],
      7
    );

    expect(grid).toHaveLength(7);
    expect(grid.every((d) => d.date && typeof d.level === 'number')).toBe(true);
  });
});
