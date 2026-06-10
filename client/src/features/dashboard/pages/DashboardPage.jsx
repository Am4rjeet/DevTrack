import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Star, Target, Trophy, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ChartCard } from '@/components/charts/ChartCard';
import { HoursChart } from '@/components/charts/HoursChart';
import { ActivityHeatmap } from '@/components/charts/ActivityHeatmap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data: res } = await dashboardApi.get();
      return res.data;
    },
  });

  if (isLoading) return <LoadingSpinner className="py-20" size="lg" />;
  if (!data) return null;

  const weeklyChart = data.weeklyProgress?.byDay?.map((d) => ({
    label: d.date?.slice(5),
    hours: Math.round((d.totalMinutes / 60) * 10) / 10,
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader
        title={`Welcome back, ${data.user?.displayName || data.user?.username}`}
        description="Here's your developer progress overview"
        action={
          <Button asChild>
            <Link to="/progress">Log activity</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total XP" value={data.user?.totalXP?.toLocaleString()} icon={Star} subtitle={`Level ${data.user?.level}`} />
        <StatCard title="Current Streak" value={`${data.user?.currentStreak}d`} icon={Flame} subtitle={`Best: ${data.user?.longestStreak}d`} />
        <StatCard title="Weekly Hours" value={`${data.weeklyProgress?.totalHours}h`} icon={Zap} subtitle={`Goal: ${data.weeklyProgress?.goalHours}h`} />
        <StatCard
          title="Leaderboard"
          value={data.leaderboardRank?.rank ? `#${data.leaderboardRank.rank}` : '—'}
          icon={Trophy}
          subtitle={data.leaderboardRank?.inTop100 ? 'Top 100 this week' : 'Keep grinding'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Weekly activity" description="Hours logged this week" className="lg:col-span-2">
          <HoursChart data={weeklyChart} />
        </ChartCard>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <span className="text-3xl font-bold">{data.weeklyProgress?.percentComplete}%</span>
              <p className="text-sm text-muted-foreground">
                {data.weeklyProgress?.totalHours}h / {data.weeklyProgress?.goalHours}h
              </p>
            </div>
            <Progress value={data.weeklyProgress?.percentComplete} />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4 text-primary" />
              {data.activeGoalsCount} active goals
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Activity heatmap" description="Last 12 weeks">
          <ActivityHeatmap grid={data.heatmap} weeks={12} />
        </ChartCard>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/progress">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentActivity?.length ? (
              data.recentActivity.map((entry) => (
                <div key={entry._id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">{entry.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.durationMinutes}min · {entry.type}
                    </p>
                  </div>
                  <Badge variant="secondary">+{entry.xpEarned} XP</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No activity yet. Log your first session!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {data.recentAchievements?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent achievements</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {data.recentAchievements.map((a) => (
              <div key={a._id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                <span className="text-xl">{a.icon}</span>
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(a.unlockedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
