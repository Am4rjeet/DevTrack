import { useMemo } from 'react';
import { format, parseISO, getDay } from 'date-fns';
import { cn } from '@/lib/utils';

const LEVEL_COLORS = [
  'bg-secondary',
  'bg-primary/20',
  'bg-primary/40',
  'bg-primary/65',
  'bg-primary',
];

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export function ActivityHeatmap({ grid = [], weeks = 12 }) {
  const { cells, monthLabels } = useMemo(() => {
    const recent = grid.slice(-weeks * 7);
    const cells = [];
    const monthLabels = [];
    let lastMonth = '';

    recent.forEach((day, i) => {
      const date = parseISO(day.date);
      const month = format(date, 'MMM');
      if (month !== lastMonth && i % 7 === 0) {
        monthLabels.push({ index: Math.floor(i / 7), label: month });
        lastMonth = month;
      }
      cells.push({ ...day, dayOfWeek: getDay(date) });
    });

    return { cells: recent, monthLabels };
  }, [grid, weeks]);

  if (!cells.length) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        No activity yet — log your first session!
      </div>
    );
  }

  const columns = Math.ceil(cells.length / 7);

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1">
        <div className="flex gap-1 pl-8">
          {Array.from({ length: columns }).map((_, col) => {
            const label = monthLabels.find((m) => m.index === col);
            return (
              <div key={col} className="w-[13px] text-[10px] text-muted-foreground">
                {label?.label || ''}
              </div>
            );
          })}
        </div>
        <div className="flex gap-1">
          <div className="flex flex-col gap-[3px] pr-1">
            {DAY_LABELS.map((d, i) => (
              <div key={i} className="h-[13px] text-[10px] leading-[13px] text-muted-foreground">
                {d}
              </div>
            ))}
          </div>
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: `repeat(${columns}, 13px)`, gridTemplateRows: 'repeat(7, 13px)' }}
          >
            {Array.from({ length: columns * 7 }).map((_, idx) => {
              const col = Math.floor(idx / 7);
              const row = idx % 7;
              const cellIdx = col * 7 + row;
              const cell = cells[cellIdx];
              if (!cell) return <div key={idx} />;
              return (
                <div
                  key={cell.date}
                  title={`${cell.date}: ${cell.totalMinutes}min (${cell.count} sessions)`}
                  className={cn(
                    'h-[13px] w-[13px] rounded-sm transition-colors',
                    LEVEL_COLORS[cell.level] || LEVEL_COLORS[0]
                  )}
                />
              );
            })}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
          <span>Less</span>
          {LEVEL_COLORS.map((color, i) => (
            <div key={i} className={cn('h-[11px] w-[11px] rounded-sm', color)} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
