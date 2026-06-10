import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExternalLink, Github, RefreshCw, Unlink, Users, BookOpen, GitCommit } from 'lucide-react';
import { githubApi } from '@/features/github/api/githubApi';
import { getApiUrl, getErrorMessage } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

export default function GitHubPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('GitHub connected!');
      setSearchParams({}, { replace: true });
    }
    const error = searchParams.get('error');
    if (error) {
      toast.error(`GitHub connection failed: ${error}`);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { data: status } = useQuery({
    queryKey: ['github', 'status'],
    queryFn: async () => {
      const { data: res } = await githubApi.status();
      return res.data;
    },
  });

  const { data: github, isLoading } = useQuery({
    queryKey: ['github', 'stats'],
    queryFn: async () => {
      const { data: res } = await githubApi.get();
      return res.data;
    },
    enabled: status?.connected,
  });

  const connectMutation = useMutation({
    mutationFn: (data) => githubApi.connect(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github'] });
      toast.success('GitHub connected!');
      setUsername('');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const syncMutation = useMutation({
    mutationFn: () => githubApi.sync(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github'] });
      toast.success('GitHub data synced!');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const disconnectMutation = useMutation({
    mutationFn: () => githubApi.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github'] });
      toast.success('GitHub disconnected');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const stats = github?.stats;

  return (
    <div className="space-y-6">
      <PageHeader
        title="GitHub"
        description="Pull in repos, commits, and profile stats"
        action={
          status?.connected && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
                <RefreshCw className={`mr-2 h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                Sync
              </Button>
              <Button variant="outline" size="sm" onClick={() => disconnectMutation.mutate()} disabled={disconnectMutation.isPending}>
                <Unlink className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </div>
          )
        }
      />

      {!status?.connected ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Github className="h-5 w-5" />
              Connect GitHub
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Link your GitHub to display repos, commits, and followers on your profile.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                connectMutation.mutate({ githubUsername: username });
              }}
              className="flex gap-3"
            >
              <div className="flex-1 space-y-2">
                <Label>GitHub username</Label>
                <Input
                  placeholder="octocat"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={connectMutation.isPending}>
                  Connect
                </Button>
              </div>
            </form>
            {status?.oauthAvailable && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <a href={getApiUrl('/github/oauth')}>
                    <Github className="mr-2 h-4 w-4" />
                    Connect with GitHub OAuth
                  </a>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={stats?.profile?.avatar} />
                <AvatarFallback>{stats?.githubUsername?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{stats?.profile?.name || stats?.githubUsername}</h2>
                <p className="text-muted-foreground">@{stats?.githubUsername}</p>
                {stats?.profile?.bio && <p className="mt-1 text-sm">{stats.profile.bio}</p>}
              </div>
              {stats?.profile?.htmlUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={stats.profile.htmlUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View profile
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats?.followers}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats?.following}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats?.publicRepos}</p>
                  <p className="text-xs text-muted-foreground">Public repos</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {stats?.repositories?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top repositories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.repositories.map((repo) => (
                  <a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-md border p-3 hover:bg-accent"
                  >
                    <div>
                      <p className="font-medium">{repo.name}</p>
                      {repo.language && <p className="text-xs text-muted-foreground">{repo.language}</p>}
                    </div>
                    <Badge variant="secondary">★ {repo.stars}</Badge>
                  </a>
                ))}
              </CardContent>
            </Card>
          )}

          {stats?.recentCommits?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <GitCommit className="h-4 w-4" />
                  Recent commits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.recentCommits.slice(0, 8).map((commit) => (
                  <div key={commit.sha} className="rounded-md border p-3">
                    <p className="truncate text-sm font-medium">{commit.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {commit.repo} · {commit.date && formatDistanceToNow(new Date(commit.date), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {stats?.lastSyncedAt && (
            <p className="text-center text-xs text-muted-foreground">
              Last synced {formatDistanceToNow(new Date(stats.lastSyncedAt), { addSuffix: true })}
              {github?.cached && ' (cached)'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
