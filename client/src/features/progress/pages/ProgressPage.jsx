import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { progressApi } from '@/features/progress/api/progressApi';
import { getErrorMessage } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ProgressForm } from '@/features/progress/components/ProgressForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';

const TYPE_COLORS = {
  coding: 'default',
  dsa: 'success',
  learning: 'secondary',
  project: 'warning',
  other: 'outline',
};

export default function ProgressPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['progress', typeFilter],
    queryFn: async () => {
      const { data: res } = await progressApi.list({ type: typeFilter || undefined, limit: 50 });
      return res;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => progressApi.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      const xp = res.data.data?.xpEarned;
      const achievements = res.data.data?.achievements;
      toast.success(`Logged! +${xp} XP${achievements?.length ? ` · ${achievements.length} achievement(s)!` : ''}`);
      setOpen(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => progressApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Entry deleted');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const entries = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Progress"
        description="Coding, DSA, projects — log it here"
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Log activity
          </Button>
        }
      />

      <div className="flex gap-3">
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-40">
          <option value="">All types</option>
          {['coding', 'dsa', 'learning', 'project', 'other'].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-muted-foreground">Nothing logged yet.</p>
            <Button onClick={() => setOpen(true)}>Log your first session</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <Card key={entry._id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Badge variant={TYPE_COLORS[entry.type] || 'outline'}>{entry.type}</Badge>
                  <div>
                    <p className="font-medium">{entry.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(entry.date), 'MMM d, yyyy')} · {entry.durationMinutes} min
                      {entry.metadata?.difficulty && ` · ${entry.metadata.difficulty}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">+{entry.xpEarned} XP</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(entry._id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="Log activity" description="Track your dev session">
        <ProgressForm onSubmit={(p) => createMutation.mutate(p)} loading={createMutation.isPending} />
      </Dialog>
    </div>
  );
}
