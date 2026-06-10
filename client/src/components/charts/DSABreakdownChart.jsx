import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = {
  easy: 'hsl(142 76% 45%)',
  medium: 'hsl(45 93% 47%)',
  hard: 'hsl(0 84% 60%)',
  unknown: 'hsl(215 20% 55%)',
};

export function DSABreakdownChart({ data = [] }) {
  const chartData = data.map((d) => ({
    name: d.difficulty?.charAt(0).toUpperCase() + d.difficulty?.slice(1) || 'Unknown',
    value: d.count,
    key: d.difficulty,
  }));

  if (!chartData.length) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
        No DSA problems logged yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={COLORS[entry.key] || COLORS.unknown} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'hsl(224 50% 7%)',
            border: '1px solid hsl(215 28% 14%)',
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
