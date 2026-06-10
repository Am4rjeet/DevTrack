import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { goalsApi } from '@/features/goals/api/goalsApi';
import { getErrorMessage } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { GoalForm } from '@/features/goals/components/GoalForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Select } from '@/components/ui/select';

export default function GoalsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('active');

  const { data, isLoading } = useQuery({
    queryKey: ['goals', statusFilter],
    queryFn: async () => {
      const { data: res } = await goalsApi.list({ status: statusFilter, limit: 50 });
      return res;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => goalsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal created!');
      setOpen(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const completeMutation = useMutation({
    mutationFn: (id) => goalsApi.complete(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      const achievements = res.data.data?.achievements;
      toast.success(`Goal completed!${achievements?.length ? ' Achievement unlocked!' : ''}`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const milestoneMutation = useMutation({
    mutationFn: ({ goalId, milestoneId, completed }) =>
      goalsApi.toggleMilestone(goalId, milestoneId, completed),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => goalsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Goal deleted');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const goals = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        description="Set learning targets and track milestones"
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New goal
          </Button>
        }
      />

      <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
        {['active', 'completed', 'paused', 'abandoned'].map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>

      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : goals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">No goals found. Create one!</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => (
            <Card key={goal._id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-base">{goal.title}</CardTitle>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="outline">{goal.category}</Badge>
                    <Badge variant={goal.priority === 'high' ? 'default' : 'secondary'}>{goal.priority}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(goal._id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} />
                </div>

                {goal.targetDate && (
                  <p className="text-xs text-muted-foreground">
                    Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                  </p>
                )}

                {goal.milestones?.length > 0 && (
                  <div className="space-y-1.5">
                    {goal.milestones.map((m) => (
                      <button
                        key={m._id}
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                        onClick={() =>
                          milestoneMutation.mutate({
                            goalId: goal._id,
                            milestoneId: m._id,
                            completed: !m.completed,
                          })
                        }
                      >
                        {m.completed ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className={m.completed ? 'text-muted-foreground line-through' : ''}>{m.title}</span>
                      </button>
                    ))}
                  </div>
                )}

                {goal.status === 'active' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => completeMutation.mutate(goal._id)}
                    disabled={completeMutation.isPending}
                  >
                    Mark complete (+{goal.xpReward} XP)
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="New goal" description="Set a learning target">
        <GoalForm onSubmit={(p) => createMutation.mutate(p)} loading={createMutation.isPending} />
      </Dialog>
    </div>
  );
}
