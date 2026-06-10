import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Flame, Github, Star, Trophy } from 'lucide-react';
import { usersApi } from '@/features/users/api/usersApi';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function PublicProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.username === username;

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const { data: res } = await usersApi.getPublicProfile(username);
      return res.data;
    },
  });

  if (isLoading) return <LoadingSpinner className="py-20" size="lg" />;

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-medium">Profile not found or private</p>
        <Button asChild className="mt-4">
          <Link to="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 sm:flex-row sm:items-start">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar || profile.github?.profile?.avatar} />
            <AvatarFallback className="text-2xl">{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold">{profile.displayName}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
            {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
            {profile.githubUsername && (
              <a
                href={`https://github.com/${profile.githubUsername}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Github className="h-4 w-4" />
                {profile.githubUsername}
              </a>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Member since {format(new Date(profile.memberSince), 'MMMM yyyy')}
            </p>
          </div>
          <div className="text-center">
            <Badge className="text-lg px-3 py-1">Level {profile.level}</Badge>
            <p className="mt-1 text-sm text-muted-foreground">{profile.totalXP?.toLocaleString()} XP</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Flame className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-xl font-bold">{profile.currentStreak}d</p>
              <p className="text-xs text-muted-foreground">Current streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Star className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xl font-bold">{profile.longestStreak}d</p>
              <p className="text-xs text-muted-foreground">Best streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-xl font-bold">
                {profile.leaderboardRank?.rank ? `#${profile.leaderboardRank.rank}` : '—'}
              </p>
              <p className="text-xs text-muted-foreground">All-time rank</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <p className="mb-2 text-sm text-muted-foreground">Level progress</p>
        <Progress value={profile.progressPercent || 0} />
        <p className="mt-1 text-xs text-muted-foreground">{profile.xpToNextLevel} XP to next level</p>
      </div>

      {profile.achievements?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Achievements</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {profile.achievements.map((a) => (
              <div key={a.achievementId} className="flex items-center gap-2 rounded-lg border px-3 py-2" title={a.title}>
                <span className="text-xl">{a.icon}</span>
                <span className="text-sm font-medium">{a.title}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {profile.recentActivity?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {profile.recentActivity.map((entry, i) => (
              <div key={i} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">{entry.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.type} · {entry.durationMinutes}min
                  </p>
                </div>
                <Badge variant="secondary">+{entry.xpEarned} XP</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {profile.github && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Github className="h-4 w-4" />
              GitHub
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xl font-bold">{profile.github.followers}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xl font-bold">{profile.github.publicRepos}</p>
              <p className="text-xs text-muted-foreground">Repos</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xl font-bold">{profile.github.repositories?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Top repos cached</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isOwnProfile && (
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link to="/settings">Edit profile settings</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
