import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/features/analytics/api/analyticsApi';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ChartCard } from '@/components/charts/ChartCard';
import { HoursChart } from '@/components/charts/HoursChart';
import { XPChart } from '@/components/charts/XPChart';
import { DSABreakdownChart } from '@/components/charts/DSABreakdownChart';
import { ActivityHeatmap } from '@/components/charts/ActivityHeatmap';
import { Select } from '@/components/ui/select';
import { Clock, Hash, Star, Zap } from 'lucide-react';

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics', 'overview', days],
    queryFn: async () => {
      const { data: res } = await analyticsApi.overview({ days });
      return res.data;
    },
  });

  const { data: hoursData } = useQuery({
    queryKey: ['analytics', 'hours', days],
    queryFn: async () => {
      const { data: res } = await analyticsApi.hoursChart({ days });
      return res.data.data.map((d) => ({ label: d.label?.slice(5), hours: d.totalHours }));
    },
  });

  const { data: xpData } = useQuery({
    queryKey: ['analytics', 'xp', days],
    queryFn: async () => {
      const { data: res } = await analyticsApi.xpChart({ days });
      return res.data.data.map((d) => ({ date: d.date?.slice(5), xp: d.totalXP }));
    },
  });

  const { data: dsaData } = useQuery({
    queryKey: ['analytics', 'dsa', days],
    queryFn: async () => {
      const { data: res } = await analyticsApi.dsaBreakdown({ days });
      return res.data.data;
    },
  });

  const { data: heatmapData } = useQuery({
    queryKey: ['analytics', 'heatmap'],
    queryFn: async () => {
      const { data: res } = await analyticsApi.heatmap({ days: 365 });
      return res.data;
    },
  });

  if (overviewLoading) return <LoadingSpinner className="py-20" size="lg" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Deep dive into your coding patterns and growth"
        action={
          <Select value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-36">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </Select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total hours" value={`${overview?.totalHours}h`} icon={Clock} />
        <StatCard title="Sessions" value={overview?.totalEntries} icon={Hash} />
        <StatCard title="XP earned" value={overview?.totalXPInPeriod} icon={Star} subtitle={`Last ${days} days`} />
        <StatCard title="Level" value={overview?.gamification?.level} icon={Zap} subtitle={`${overview?.gamification?.totalXP} total XP`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Hours over time" description={`Last ${days} days`}>
          <HoursChart data={hoursData} />
        </ChartCard>
        <ChartCard title="XP earned" description="Daily XP gains">
          <XPChart data={xpData} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="DSA breakdown" description="Problems by difficulty">
          <DSABreakdownChart data={dsaData} />
        </ChartCard>
        <ChartCard
          title="Activity summary"
          description={`${heatmapData?.summary?.activeDays || 0} active days · ${heatmapData?.summary?.totalHours || 0}h total`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg border p-3">
                <p className="text-2xl font-bold">{heatmapData?.summary?.activeDays || 0}</p>
                <p className="text-xs text-muted-foreground">Active days</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-2xl font-bold">{heatmapData?.summary?.averageMinutesPerActiveDay || 0}</p>
                <p className="text-xs text-muted-foreground">Avg min/day</p>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Contribution heatmap" description="Last 52 weeks — GitHub style">
        <ActivityHeatmap grid={heatmapData?.grid} weeks={52} />
      </ChartCard>
    </div>
  );
}
