import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Award } from 'lucide-react';
import { leaderboardApi } from '@/features/leaderboard/api/leaderboardApi';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const RANK_ICONS = { 1: Trophy, 2: Medal, 3: Award };
const RANK_COLORS = { 1: 'text-yellow-500', 2: 'text-gray-400', 3: 'text-amber-700' };

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('weekly');

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: async () => {
      const { data: res } = await leaderboardApi.get(period);
      return res.data;
    },
  });

  const { data: myRank } = useQuery({
    queryKey: ['leaderboard', 'me', period],
    queryFn: async () => {
      const { data: res } = await leaderboardApi.myRank(period);
      return res.data;
    },
  });

  const rankings = data?.rankings || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leaderboard"
        description="Ranked by XP logged in the selected period"
        action={
          <Select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-36">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="alltime">All time</option>
          </Select>
        }
      />

      {myRank && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Your rank</p>
              <p className="text-2xl font-bold">
                {myRank.rank ? `#${myRank.rank}` : 'Unranked'}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {myRank.totalXP?.toLocaleString()} XP
                </span>
              </p>
            </div>
            <Badge>Level {myRank.level}</Badge>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : rankings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nobody on the board yet for this period.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {rankings.map((entry) => {
            const RankIcon = RANK_ICONS[entry.rank];
            const isMe = entry.username === user?.username;

            return (
              <Card key={entry.userId} className={cn(isMe && 'border-primary/50 bg-primary/5')}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={cn('flex w-10 items-center justify-center font-bold', RANK_COLORS[entry.rank])}>
                    {RankIcon ? <RankIcon className="h-5 w-5" /> : <span>#{entry.rank}</span>}
                  </div>
                  <Avatar>
                    <AvatarImage src={entry.avatar} />
                    <AvatarFallback>{entry.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {entry.displayName || entry.username}
                      {isMe && <Badge className="ml-2" variant="secondary">You</Badge>}
                    </p>
                    <p className="text-sm text-muted-foreground">@{entry.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{entry.totalXP?.toLocaleString()} XP</p>
                    <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
